<?php

namespace App\Http\Controllers\Api;

use App\Events\OrderCreated;
use App\Helpers\ApiResponse;
use App\Http\Requests\StoreOrderRequest;
use App\Http\Resources\OrderResource;
use App\Jobs\CancelUnpaidOrder;
use App\Mail\OrderPaidMail;
use App\Models\Cart;
use App\Models\Discount;
use App\Models\DiscountUsage;
use App\Models\Order;
use App\Models\OrderDetail;
use App\Models\OrderReturn;
use App\Models\OrderReturnItem;
use App\Models\Product;
use App\Models\ProductSku;
use App\Models\User;
use App\Services\InventoryService;
use App\Services\MoMoService;
use Carbon\Carbon;
use Exception;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Redis;
use Illuminate\Validation\ValidationException;

class OrderController
{
    use AuthorizesRequests;
    public function index(Request $request)
    {
        try {
            $this->authorize('viewAny', Order::class);
            $query = Order::with('orderDetails.sku')->orderBy('created_at', 'desc');

            if ($request->has('is_paid')) {
                $query->where('is_paid', fillter_var($request->is_paid, FILTER_VALIDATE_BOOLEAN));
            }
            if ($request->has('tracking_status')) {
                $validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'completed', 'refunded'];

                if (in_array($request->tracking_status, $validStatuses)) {
                    $query->where('tracking_status', $request->tracking_status);
                }
            }
            if ($request->has('status')) {
                $query->where('status', $request->status);
            }

            $orders = $query->paginate(10);

            return ApiResponse::responsePage(OrderResource::collection($orders));

        } catch (\Throwable $th) {

            return ApiResponse::errorResponse(500, $th->getMessage());
        }
    }
    public function orderUser(Request $request)
    {
        $user = Auth::user();

        try {
            $query = Order::with('orderDetails.sku')->where('user_id', $user->id)->orderBy('created_at', 'desc');
            if ($request->has('tracking_status')) {
                $validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'completed', 'refunded'];

                if (in_array($request->tracking_status, $validStatuses)) {
                    $query->where('tracking_status', $request->tracking_status);
                }
            }

            $orders = $query->paginate(10);

            return ApiResponse::responsePage(OrderResource::collection($orders));

        } catch (\Throwable $th) {
            return ApiResponse::errorResponse(500, $th->getMessage());
        }
    }


    public function store(Request $request)
    {
        \Log::info('Yêu cầu tạo đơn hàng:', ['request' => $request->all()]);

        $request->validate([
            'payment_method' => 'required|in:cod,online',
            'name' => 'required|string|max:255',
            'email' => 'nullable|email|max:255',
            'phone' => 'required|string|max:15',
            'city' => 'required|string|max:255',
            'district_name' => 'required|string|max:255',
            'ward_name' => 'required|string|max:255',
            'note' => 'nullable|string|max:500',
            'discount_code' => 'nullable|string|max:50',
            'address' => 'required|string|max:50',
        ]);

        try {
            $user = Auth::user();
            $session_id = session()->getId();

            $cartIds = collect($request->selectedItems)->pluck('id')->toArray();
            $carts = Cart::whereIn('id', $cartIds)->get();

            if ($carts->isEmpty()) {
                return ApiResponse::errorResponse(400, __('messages.cart_empty'));
            }

            DB::beginTransaction();

            $order = Order::create([
                'user_id' => $user?->id,
                'total_amount' => 0,
                'status' => 'pending',
                'payment_method' => $request->payment_method,
                'is_paid' => false,
                'name' => $request->name,
                'email' => $request->email,
                'phone' => $request->phone,
                'city' => $request->city,
                'price_shipped' => $request->priceShipping,
                'address' => $request->address,
                'district' => $request->district_name,
                'ward' => $request->ward_name,
                'note' => $request->note,
            ]);
            session(['cart_ids' => $cartIds]);
            $totalAmount = 0;
            $flashSaleData = [];

            foreach ($carts as $cart) {
                $sku = ProductSku::with(['product.flashSales', 'attributeOptions.attribute'])->find($cart->sku_id);

                if (!$sku || !$sku->product || $sku->product->active == 0 || $sku->product->deleted_at) {
                    DB::rollBack();
                    return ApiResponse::errorResponse(404, __('messages.product_not_found'));
                }

                $stockResult = InventoryService::reduceStock($sku->sku, $cart->quantity);
                if ($stockResult === -1) {
                    DB::rollBack();
                    return ApiResponse::errorResponse(400, __('messages.out_of_stock'));
                } elseif ($stockResult === -2) {
                    DB::rollBack();
                    return ApiResponse::errorResponse(400, __('messages.no_sync'));
                }

                $quantity = $cart->quantity;
                $discountAppliedQty = 0;
                $nonDiscountQty = $quantity;
                $flashSale = $sku->product->flashSales
                ->firstWhere(fn($fs) => 
                    $fs->status === 'active' && 
                    $fs->start_time <= now() &&
                    $fs->end_time >= now() &&
                    $fs->pivot->quantity > 0
                );
            

                if ($flashSale) {
                    $flashSaleStockKey = "flash_sale_stock:{$sku->product_id}";
                    $availableStock = (int) Redis::get($flashSaleStockKey);

                    if ($availableStock > 0) {
                        $discountAppliedQty = min($availableStock, $quantity);
                        $nonDiscountQty = $quantity - $discountAppliedQty;

                        $flashSaleData[] = [
                            'product_id' => $sku->product_id,
                            'flash_sale_id' => $flashSale->id,
                            'discount_applied_qty' => $discountAppliedQty,
                            'discount_price' => $flashSale->pivot->discount_price,
                        ];
                    }
                }

                $variantDetails = $sku->attributeOptions->pluck('value', 'attribute.name')->toArray();

                if ($discountAppliedQty > 0) {
                    $priceAfterDiscount = $sku->price - $flashSale->pivot->discount_price;
                    $subtotal = $priceAfterDiscount * $discountAppliedQty;
                    $totalAmount += $subtotal;

                    OrderDetail::create([
                        'order_id' => $order->id,
                        'sku' => $sku->sku,
                        'product_id' => $sku->product_id,
                        'product_name' => $sku->product->name,
                        'variant_details' => json_encode($variantDetails),
                        'quantity' => $discountAppliedQty,
                        'price' => $priceAfterDiscount,
                        'price_origin' => $sku->price,
                        'subtotal' => $subtotal,
                        'flash_sale_data' => json_encode([
                            'flash_sale_id' => $flashSale->id,
                            'discount_applied_qty' => $discountAppliedQty,
                            'discount_price' => $flashSale->pivot->discount_price,
                        ]),
                    ]);
                }

                if ($nonDiscountQty > 0) {
                    $subtotal = $sku->price * $nonDiscountQty;
                    $totalAmount += $subtotal;

                    OrderDetail::create([
                        'order_id' => $order->id,
                        'sku' => $sku->sku,
                        'product_id' => $sku->product_id,
                        'product_name' => $sku->product->name,
                        'variant_details' => json_encode($variantDetails),
                        'quantity' => $nonDiscountQty,
                        'price' => $sku->price,
                        'subtotal' => $subtotal,
                    ]);
                }

                $sku->product->increment('total_sold', $quantity);
                $sku->decrement('stock', $quantity);
            }

            // Apply discount
            $discountAmount = $request->priceDiscount ?? 0;
            $totalAmount += $request->priceShipping;
            $totalAmount -= $discountAmount;

            if ($request->filled('discount')) {
                $discount = Discount::where('code', $request->discount)->where('active', true)->first();
                if ($discount) {
                    DiscountUsage::create([
                        'user_id' => $user->id,
                        'discount_id' => $discount->id,
                    ]);
                    $discount->increment('used_count');
                }
            }

            if ($request->points) {
                $user->decrement('points', $request->points);
            }

            $order->update([
                'total_amount' => $totalAmount,
                'discount_code' => $request->discount,
                'discount_amount' => $discountAmount,
                'used_points' => $request->points,
            ]);

            DB::commit();

            if ($request->payment_method === 'cod') {
                foreach ($flashSaleData as $item) {
                    $result = InventoryService::reduceFlashSaleStock($item['product_id'], $item['discount_applied_qty']);
                    if ($result === -2) {
                        return ApiResponse::errorResponse(400, __('messages.no_sync'));
                    } elseif ($result === -1) {
                        \Log::info("Flash sale hết hàng cho sản phẩm {$item['product_id']}");
                    } else {
                        Redis::incrby("flash_sale_purchased:{$item['product_id']}", $item['discount_applied_qty']);

                        DB::table('flash_sale_products')
                            ->where('flash_sale_id', $item['flash_sale_id'])
                            ->where('product_id', $item['product_id'])
                            ->decrement('quantity', $item['discount_applied_qty']);
                    }
                }
            }


            OrderCreated::dispatch($order);
            CancelUnpaidOrder::dispatch($order->id)->delay(now()->addMinutes(1));
            Cache::forget('products_cache');

            // Nếu online thì trả về URL thanh toán
            if ($request->payment_method === 'online') {

                $ssidcarts = session()->get('cart_ids', []);  
                \Log::info('Cart IDs:', $ssidcarts);
        
                if (!empty($ssidcarts)) {
                    Cart::where(function ($query) use ($user, $session_id) {
                        if ($user) {
                            $query->where('user_id', $user->id);
                        } else {
                            $query->where('session_id', $session_id);
                        }
                    })->whereIn('id', $ssidcarts)
                      ->delete();
                }
                $payUrl = MoMoService::createPayment($order->id, $totalAmount, 'Thanh toán đơn hàng', [
                    'cart_ids' => $cartIds,
                    'user_id' => $user?->id,
                    'flash_sale_data' => $flashSaleData,
                ]);
                return response()->json([
                    'order_id' => $order->id,
                    'payUrl' => $payUrl,
                ]);
            }

            Cart::where(function ($query) use ($user, $session_id) {
                $user ? $query->where('user_id', $user->id) : $query->where('session_id', $session_id);
            })->whereIn('id', $cartIds)->delete();
            session()->forget('cart_ids');
            return ApiResponse::responseSuccess($order, 201);
        } catch (\Exception $e) {
            DB::rollBack();
            \Log::error('Lỗi khi tạo đơn hàng: ' . $e->getMessage(), ['trace' => $e->getTraceAsString()]);
            return ApiResponse::errorResponse(500, 'Lỗi hệ thống: ' . $e->getMessage());
        }
    }

    public function show(Request $request, $id)
    {
        try {

            $order = Order::find($id);

            if ($order) {
                return new OrderResource($order->load('orderDetails.sku'));
            } else {
                return ApiResponse::errorResponse(404, __('messages.not_found'));
            }
        } catch (\Exception $e) {

            return ApiResponse::errorResponse(500, __('messages.error') . $e->getMessage());
        }
    }
    public function update(Request $request, $id)
    {

        $validated = $request->all();
        \Log::info($validated);
        DB::beginTransaction();
        try {
            $order = Order::findOrFail($id);
            $this->authorize('update', $order);

            if ($order->tracking_status === 'completed' && $order->is_paid == 1 && $order->status === 'completed') {
                return ApiResponse::errorResponse(400, __('messages.updated_failed'));
            }
            $order->update(array_filter([
                'status' => $validated['status'] ?? null,
                'is_paid' => $validated['is_paid'] ?? null,
                'payment_method' => $validated['payment_method'] ?? null,
                'tracking_status' => $validated['tracking_status'] ?? null,
                'name' => $validated['name'] ?? null,
                'phone' => $validated['phone'] ?? null,
                'email' => $validated['email'] ?? null,
                'ward' => $validated['ward'] ?? null,
                'district' => $validated['district'] ?? null,
                'city' => $validated['city'] ?? null,
                'note' => $validated['note'] ?? null,
                'address' => $validated['address'] ?? null
            ], fn($value) => !is_null($value)));

            if (!empty($validated['order_details'])) {

                foreach ($validated['order_details'] as $detail) {
                    // Tìm SKU mới trong danh sách sản phẩm
                    $sku = ProductSku::where('sku', $detail['sku'])->first();
                    \Log::info("Thông tin SKU:", ['sku' => $sku]);

                    if ($sku) {
                        // Tìm sản phẩm trong order_details theo ID (không tìm theo SKU)
                        $orderDetail = $order->orderDetails()->where('id', $detail['id'])->first();

                        if ($orderDetail) {
                            // SKU cũ
                            $oldSku = ProductSku::where('sku', $orderDetail->sku)->first();
                            if ($oldSku && $oldSku->id !== $sku->id) {
                                // Nếu đổi SKU khác → cập nhật tồn kho Redis và DB
                                Redis::incrby("sku:stock:{$oldSku->sku}", $orderDetail->quantity);
                                Redis::decrby("sku:stock:{$sku->sku}", $detail['quantity']);

                                // Cập nhật tồn kho trong DB
                                $oldSku->increment('stock', $orderDetail->quantity);
                                $sku->decrement('stock', $detail['quantity']);
                            } elseif ($oldSku && $oldSku->id === $sku->id && $orderDetail->quantity !== $detail['quantity']) {
                                // Nếu cùng SKU nhưng số lượng thay đổi
                                $diff = $detail['quantity'] - $orderDetail->quantity;
                                if ($diff > 0) {
                                    Redis::decrby("sku:stock:{$sku->sku}", $diff);
                                    $sku->decrement('stock', $diff);
                                } elseif ($diff < 0) {
                                    Redis::incrby("sku:stock:{$sku->sku}", abs($diff));
                                    $sku->increment('stock', abs($diff));
                                }
                            }

                            // Cập nhật thông tin chi tiết đơn hàng
                            $orderDetail->update([
                                'sku' => $sku->sku,
                                'product_id' => $sku->product_id,
                                'product_name' => $sku->product->name,
                                'variant_details' => json_encode($detail['variant_details']),
                                'quantity' => $detail['quantity'],
                                'price' => $sku->price,
                                'subtotal' => $sku->price * $detail['quantity'],
                            ]);
                        } else {

                            $order->orderDetails()->create([
                                'product_id' => $sku->product_id,
                                'sku' => $sku->sku,
                                'product_name' => $sku->product->name,
                                'variant_details' => json_encode($detail['variant_details']),
                                'quantity' => $detail['quantity'],
                                'price' => $sku->price,
                                'subtotal' => $sku->price * $detail['quantity'],
                            ]);
                        }
                    }
                }
            }

            $order->update([
                'total_amount' => $order->orderDetails()->sum('subtotal'),
            ]);

            DB::commit();

            return ApiResponse::responseSuccess($order, __('messages.updated'), 200);
        } catch (\Exception $e) {
            DB::rollBack();
            return ApiResponse::errorResponse(500, __('messages.error'), $e->getMessage());
        }
    }
    public function updateStatusUser(Request $request, $id)
    {
        $order = Order::findOrFail($id);
        $user = User::find($order->user_id);

        if ($order->tracking_status === 'completed') {
            return ApiResponse::errorResponse(400, __('messages.order_completed'));
        }

      

        $request->validate([
            'tracking_status' => 'nullable|string|in:pending,processing,shipped,delivered,cancelled,completed,reback',
            'status' => 'nullable|string|in:pending,completed,cancelled',
            'is_paid' => 'nullable|boolean'
        ]);

        DB::beginTransaction();
        try {
            $oldTrackingStatus = $order->tracking_status;

            $validTransitions = [
                'pending' => ['processing', 'cancelled'],
                'processing' => ['shipped', 'cancelled'],
                'shipped' => ['delivered'],
                'delivered' => ['completed'],
                'completed' => [],
                'cancelled' => ['pending'],
            ];

            if ($request->tracking_status && $request->tracking_status !== 'reback') {
                $newStatus = $request->tracking_status;
                if ($newStatus !== $oldTrackingStatus) {
                    if (!isset($validTransitions[$oldTrackingStatus]) || !in_array($newStatus, $validTransitions[$oldTrackingStatus])) {
                        return ApiResponse::errorResponse(400, __('messages.invalid_status_transition'));
                    }
                }
            }

            if ($request->tracking_status === 'cancelled') {
                if (!in_array($order->tracking_status, ['pending'])) {
                    return ApiResponse::errorResponse(400, __('messages.only_cancel_when_status'));
                }
                if ($order->is_paid == 1 && $order->payment_method === 'online') {
                    return ApiResponse::errorResponse(400, __('messages.order_paid'));
                }
            
                // Hoàn điểm nếu đã thanh toán online
                if ($order->is_paid && $order->payment_method === 'online' && $user) {
                    $refundedPoints = floor($order->total_amount / 10);
                    $user->increment('points', $refundedPoints);
                }
                if($order->used_points > 0){
                    $user->increment('points', $order->used_points);
                }
            
                $order->status = 'cancelled';
                
                foreach ($order->orderDetails as $detail) {
                    $product = Product::find($detail->product_id);
                    if ($product) {
                        $product->decrement('total_sold', $detail->quantity);
                    }
            
                    if (!empty($detail->sku)) {
                        $sku = ProductSku::where('sku', $detail->sku)->with('product.flashSales')->first();
                        if ($sku) {
                            // Cộng lại tồn kho SKU (DB)
                            $sku->increment('stock', $detail->quantity);
            
                            // Cộng lại tồn kho SKU (Redis)
                            $redisKey = 'sku:stock:' . $detail->sku;
                            Redis::exists($redisKey)
                                ? Redis::incrby($redisKey, $detail->quantity)
                                : Redis::set($redisKey, $sku->stock);
            
                            // Nếu sản phẩm đang trong Flash Sale → cộng lại tồn kho flash sale
                            $now = now();
                            $flashSale = $sku->product->flashSales->firstWhere(fn($fs) => $fs->end_time >= $now);
                            if ($flashSale && (int)$detail->price_origin !== 0) {
                                $flashSaleQuantity = $detail->flash_sale_quantity ?? $detail->quantity;
                                InventoryService::restoreFlashSaleStock($sku->product_id, $detail->quantity, $flashSaleQuantity);
                            }
                            
                        }
                    }
                }
            }

            // Mua lại đơn hàng đã hủy
            if ($request->tracking_status === 'reback') {
                $order->tracking_status = 'pending';
                $order->status = 'pending';

                foreach ($order->orderDetails as $detail) {
                    $product = Product::find($detail->product_id);
                    $sku = ProductSku::where('sku', $detail->sku)->with('product.flashSales')->first();

                    if ($product) {
                        $product->increment('total_sold', $detail->quantity);
                    }

                    if ($sku) {
                        $now = Carbon::now();
                        $flashSale = $sku->product->flashSales->firstWhere(fn($fs) => $fs->end_time >= $now);

                        if (!$flashSale) {
                            return ApiResponse::errorResponse(400, __('messages.no_flash_sale'));
                        }

                        // Tránh tăng lại số lượng flash sale khi đã hết hàng
                        if ($sku->stock < $detail->quantity) {
                            return ApiResponse::errorResponse(400, __('messages.flash_sale_out_of_stock'));
                        }

                        // Giảm số lượng tồn kho SKU trong DB và Redis
                        $sku->decrement('stock', $detail->quantity);

                        $redisKey = 'sku:stock:' . $detail->sku;
                        Redis::exists($redisKey)
                            ? Redis::decrby($redisKey, $detail->quantity)
                            : Redis::set($redisKey, $sku->stock);

                        $flashSaleResult = InventoryService::reduceFlashSaleStock($sku->product_id, $detail->quantity);
                        if ($flashSaleResult !== 0) {
                            return ApiResponse::errorResponse(400, __('messages.out_of_stock'));
                        }
                    }
                }
            }

            // Cập nhật tracking_status nếu hợp lệ (không phải reback)
            if (
                $request->has('tracking_status') &&
                $request->tracking_status !== 'reback' &&
                !in_array($order->tracking_status, ['completed', 'cancelled'])
            ) {
                $order->tracking_status = $request->tracking_status;
            }

            if ($request->has('is_paid')) {
                $order->is_paid = $request->is_paid;
            }

            $order->save();

            if ($oldTrackingStatus !== $order->tracking_status) {
                $order->statusHistories()->create([
                    'old_status' => $oldTrackingStatus,
                    'new_status' => $order->tracking_status,
                    'changed_by' => auth()->id()
                ]);
            }

            // Tính điểm khi hoàn thành đơn hàng
            if ($user && $order->tracking_status === 'completed' && $oldTrackingStatus !== 'completed' && $order->is_paid === 1) {
                $points = floor($order->total_amount / 100000) * 10;
                $user->increment('points', $points);
                $user->updateRanking();
            }

            DB::commit();
            return response()->json([
                'message' => __('messages.updated'),
                'order' => $order,
            ], 200);
        } catch (\Exception $e) {
            DB::rollBack();
            \Log::error('Lỗi cập nhật đơn hàng: ' . $e->getMessage());
            return ApiResponse::errorResponse(500, __('messages.error'));
        }
    }


    public function completeOrder($id)
    {
        $order = Order::findOrFail($id);
        $this->authorize('update', $order);
        if ($order->tracking_status === 'completed' && $order->is_paid == 0) {
            $order->update([
                'is_paid' => 1,
                'status' => 'completed',
            ]);

            return response()->json(['message' => __('messages.updated')]);
        }

        return response()->json(['message' => __('messages.update_failed')], 400);
    }

    public function destroy($id)
    {

        $order = Order::findOrFail($id);
        $this->authorize('delete', $order);
        if ($order->shipping_status !== 'pending') {
            return ApiResponse::errorResponse(400, __('messages.cannot_delete_order'));
        }

        $order->delete();

        return ApiResponse::responseSuccess(__('messages.canceled'), 204);
    }

    public function updateStatus(Request $request, $id)
    {
        $order = Order::findOrFail($id);

        $this->authorize('update', $order);

        $user = User::find($order->user_id);

        if ($order->tracking_status === 'completed' && $order->status === 'completed') {
            return ApiResponse::errorResponse(400, __('messages.order_completed'));
        }

        $request->validate([
            'tracking_status' => 'nullable|string|in:pending,processing,shipped,delivered,cancelled,completed,reback',
            'status' => 'nullable|string|in:pending,completed,cancelled',
            'is_paid' => 'nullable|boolean'
        ]);

        DB::beginTransaction();
        try {
            $oldTrackingStatus = $order->tracking_status;

            $validTransitions = [
                'pending' => ['processing', 'cancelled'],
                'processing' => ['shipped', 'cancelled'],
                'shipped' => ['delivered'],
                'delivered' => ['completed'],
                'completed' => [],
                'cancelled' => ['pending'],
            ];

            if ($request->tracking_status && $request->tracking_status !== 'reback') {
                $newStatus = $request->tracking_status;
                if ($newStatus !== $oldTrackingStatus) {
                    if (!isset($validTransitions[$oldTrackingStatus]) || !in_array($newStatus, $validTransitions[$oldTrackingStatus])) {
                        return ApiResponse::errorResponse(400, __('messages.invalid_status_transition'));
                    }
                }
            }

            if ($request->tracking_status === 'cancelled') {
                if (!in_array($order->tracking_status, ['pending', 'processing'])) {
                    return ApiResponse::errorResponse(400, __('messages.only_cancel_pending'));
                }
                // if ($order->is_paid && $order->payment_method === 'online') {
                //     return ApiResponse::errorResponse(400, __('messages.cannot_cancel_paid_order'));
                // }
                if ($order->is_paid && $order->payment_method === 'online' && $user) {
                    $refundedPoints = floor($order->total_amount / 10);
                    $user->increment('points', $refundedPoints);
                }
                if($order->used_points > 0){
                    $user->increment('points', $order->used_points);
                }
                $order->status = 'cancelled';

                foreach ($order->orderDetails as $detail) {
                    $product = Product::find($detail->product_id);
                    if ($product) {
                        $product->decrement('total_sold', $detail->quantity);
                    }

                    if (!empty($detail->sku)) {
                        $sku = ProductSku::where('sku', $detail->sku)->first();
                        if ($sku) {
                            $sku->increment('stock', $detail->quantity);

                            $redisKey = 'sku:stock:' . $detail->sku;
                            if (!Redis::exists($redisKey)) {
                                Redis::set($redisKey, $sku->stock);
                            } else {
                                Redis::incrby($redisKey, $detail->quantity);
                            }
                        }
                    }
                }
            }

            // Mua lại đơn hàng đã hủy
            if ($request->tracking_status === 'reback') {
                $order->tracking_status = 'pending';
                $order->status = 'pending';

                foreach ($order->orderDetails as $detail) {
                    $product = Product::find($detail->product_id);
                    $sku = ProductSku::where('sku', $detail->sku)->with('product.flashSales')->first();

                    if ($product) {
                        $product->increment('total_sold', $detail->quantity);
                    }

                    if ($sku) {
                        $now = Carbon::now();
                        $flashSale = $sku->product->flashSales->firstWhere(function ($flashSale) use ($now) {
                            return $flashSale->end_time >= $now;
                        });

                        if (!$flashSale) {
                            return ApiResponse::errorResponse(400, "Flash Sale" . __("messages.not_found"));
                        }

                        $sku->decrement('stock', $detail->quantity);

                        $redisKey = 'sku:stock:' . $detail->sku;
                        if (!Redis::exists($redisKey)) {
                            Redis::set($redisKey, $sku->stock);
                        } else {
                            Redis::decrby($redisKey, $detail->quantity);
                        }

                        $flashSaleResult = InventoryService::reduceFlashSaleStock($sku->product_id, $detail->quantity);
                        if ($flashSaleResult !== 0) {
                            return ApiResponse::errorResponse(400, __("messages.out_of_stock"));
                        }
                    }
                }
            }

            // Cập nhật tracking_status nếu hợp lệ (không phải reback)
            if (
                $request->has('tracking_status') &&
                $request->tracking_status !== 'reback' &&
                !in_array($order->tracking_status, ['completed', 'cancelled'])
            ) {
                $order->tracking_status = $request->tracking_status;
            }

            if ($request->has('is_paid')) {
                $order->is_paid = $request->is_paid;
            }

            $order->save();

            // Ghi log thay đổi trạng thái
            if ($oldTrackingStatus !== $order->tracking_status) {
                $order->statusHistories()->create([
                    'old_status' => $oldTrackingStatus,
                    'new_status' => $order->tracking_status,
                    'changed_by' => auth()->id()
                ]);
            }

            // Tính điểm khi hoàn thành
            if ($user && $order->tracking_status === 'completed' && $oldTrackingStatus !== 'completed' && $order->is_paid === 1) {
                $points = floor($order->total_amount / 100000) * 10;
                $user->increment('points', $points);
                $user->updateRanking();
            }

            DB::commit();
            return response()->json([
                'message' => __('messages.updated'),
                'order' => $order,
            ], 200);
        } catch (\Exception $e) {
            DB::rollBack();
            \Log::error('Lỗi cập nhật đơn hàng: ' . $e->getMessage());

            return ApiResponse::responseError(500, __("messages.error"));
        }
    }

    public function confirmOrder(Request $request, $id)
    {
        $order = Order::findOrFail($id);
        $user = User::find($order->user_id);

        DB::beginTransaction();

        try {
            if (!$order->tracking_status === 'completed' && $order->is_paid === 0) {
                return ApiResponse::errorResponse(400, __("messages.cannot_cancel_order"));
            }
            $order->update([
                'status' => 'completed',
                'is_paid' => 1
            ]);

            $order->save();

            DB::commit();
            return ApiResponse::responseSuccess($order, __("messages.updated"), 200);
        } catch (\Exception $e) {
            DB::rollBack();
            \Log::error('Lỗi cập nhật đơn hàng: ' . $e->getMessage());

            return ApiResponse::errorResponse(500, __("messages.error"));
        }
    }
    public function restore($id)
    {
        $order = Order::onlyTrashed()->findOrFail($id);

        $this->authorize('restore', $order);
        $order->restore();

        return response()->json(['message' => __('messages.restored')]);
    }
    public function forceDelete($id)
    {
        $order = Order::onlyTrashed()->findOrFail($id);

        $this->authorize('forceDelete', $order);

        $order->forceDelete();
        return response()->json(['message' => __('messages.deleted')]);
    }
    public function listDeleted()
    {

        $orders = Order::onlyTrashed()->with('orderDetails.sku')->orderBy('created_at', 'desc')->paginate(10);

        $this->authorize('viewAny', Order::class);

        return ApiResponse::responsePage(OrderResource::collection($orders));
    }
    public function cancelOrder(Request $request, $id)
    {
        $order = Order::with(['orderDetails', 'orderDetails.sku.product'])->find($id);

        if (!$order) {
            return ApiResponse::errorResponse(404, __("messages.not_found"));
        }

        if ($order->is_paid == 1) {
            return ApiResponse::errorResponse(400, __("messages.cannot_cancel_order"));
        }

        if ($order->shipping_status != 'pending') {
            return ApiResponse::errorResponse(400, __("messages.cannot_cancel_order"));
        }

        DB::beginTransaction();
        try {
            foreach ($order->orderDetails as $detail) {
                $sku = $detail->sku;
                $product = $sku->product;

                // ✅ Cộng lại tồn kho SKU
                $sku->increment('stock', $detail->quantity);

                $redisKeySku = "sku:stock:{$sku->sku}";
                if (!Redis::exists($redisKeySku)) {
                    Redis::set($redisKeySku, $sku->stock);
                } else {
                    Redis::incrby($redisKeySku, $detail->quantity);
                }

                // ✅ Cộng lại Flash Sale (nếu có)
                if ($product) {
                    $flashSale = $product->flashSales()
                        ->where('start_time', '<=', now())
                        ->where('end_time', '>=', now())
                        ->first();

                    if ($flashSale) {
                        $productId = $product->id;
                        $flashSaleId = $flashSale->id;
                        $quantity = $detail->quantity;

                        $redisKeyFlashSale = "flash_sale_stock:{$productId}";
                        if (!Redis::exists($redisKeyFlashSale)) {
                            $fsQuantity = DB::table('flash_sale_products')
                                ->where('flash_sale_id', $flashSaleId)
                                ->where('product_id', $productId)
                                ->value('quantity');
                            Redis::set($redisKeyFlashSale, $fsQuantity);
                        }

                        Redis::incrby($redisKeyFlashSale, $quantity);

                        DB::table('flash_sale_products')
                            ->where('flash_sale_id', $flashSaleId)
                            ->where('product_id', $productId)
                            ->increment('quantity', $quantity);

                        \Log::info("Hoàn lại flash sale: flash_sale_id={$flashSaleId}, product_id={$productId}, quantity={$quantity}");
                    }
                }
            }

            // Cập nhật trạng thái đơn hàng
            $order->update([
                'shipping_status' => 'canceled',
                'status' => 'canceled',
            ]);

            DB::commit();
            return ApiResponse::responseSuccess();
        } catch (\Exception $e) {
            DB::rollBack();
            \Log::error("Lỗi khi hủy đơn hàng: " . $e->getMessage());
            return ApiResponse::errorResponse(500, __("messages.error"));
        }
    }


    public function refundOrder(Request $request, Order $order)
    {

    }
    public function fetchReturnDetails($orderDetailId)
    {
        $orderDetail = OrderDetail::where('id', $orderDetailId)
            ->with([
                'returnDetails' => function ($query) {
                    $query->with('orderReturn');
                },
                'order' => function ($query) {
                    $query->select('id', 'name', 'phone', 'email', 'address', 'district', 'city')
                        ->with('returnDetails');
                }
            ])
            ->first();

        if (!$orderDetail) {
            return response()->json([
                'message' => __('messages.not_found'),
                'data' => null
            ], 404);
        }

        return response()->json([
            'message' => __('messages.success'),
            'data' => $orderDetail
        ], 200);
    }
    public function handleRebuy(Request $request, $id)
    {
        $order = Order::with(['orderDetails', 'user'])->find($id);
        $user = Auth::user();
    
        if (!$order) {
            return ApiResponse::errorResponse(404, __("messages.not_found"));
        }
    
        if ($order->status !== 'cancelled' && $order->tracking_status !== 'cancelled') {
            return ApiResponse::errorResponse(400, __("messages.cannot_rebuy_order"));
        }
    
        DB::beginTransaction();
        try {
            $totalAmount = 0;
            $shippingFee = $order->price_shipped;
    
            // Trừ điểm nếu đơn hàng trước đó đã thanh toán
            // if ($order->is_paid == 1) {
            //     $pointsToDeduct = floor(($order->total_amount - $shippingFee) / 10);
            //     if ($user->points >= $pointsToDeduct) {
            //         $user->decrement('points', $pointsToDeduct);
            //     } else {
            //         return ApiResponse::errorResponse(400, __("messages.not_enough_points"));
            //     }
            // }
    
            foreach ($order->orderDetails as $detail) {
                $sku = ProductSku::where('sku', $detail->sku)->first();
                $product = Product::find($detail->product_id);
    
                if (!$sku) {
                    return ApiResponse::errorResponse(400, __("messages.sku_not_found"));
                }
    
                if ($sku->stock < $detail->quantity) {
                    return ApiResponse::errorResponse(400, __("messages.not_enough_stock_for"));
                }
    
                // Dùng giá đã lưu trong đơn hàng cũ
                $price = $detail->price;
    
                // Tính tổng tiền
                $totalAmount += $price * $detail->quantity;
    
                // Trừ kho SKU
                $sku->decrement('stock', $detail->quantity);
    
                $redisSkuKey = 'sku:stock:' . $detail->sku;
                if (!Redis::exists($redisSkuKey)) {
                    Redis::set($redisSkuKey, $sku->stock);
                } else {
                    Redis::decrby($redisSkuKey, $detail->quantity);
                }
    
                // Cộng số lượng bán
                if ($product) {
                    $product->increment('total_sold', $detail->quantity);
                }
            }
    
            // Trừ điểm nếu dùng voucher đổi điểm
            if ($order->used_points > 0) {
                if ($user->points >= $order->used_points) {
                    $user->decrement('points', $order->used_points);
                } else {
                    return ApiResponse::errorResponse(400, __("messages.not_enough_points"));
                }
            }
    
            // Tính lại tổng tiền = giá sản phẩm + ship - giảm giá
            $finalAmount = $totalAmount + $shippingFee - $order->discount_amount;
    
            // Cập nhật trạng thái đơn hàng
            $order->update([
                'status' => 'pending',
                'tracking_status' => 'pending',
                'total_amount' => $finalAmount,
                'payment_method' => ($order->payment_method === 'online' && $order->is_paid == 0) ? 'cod' : $order->payment_method,
                'is_paid' => 0,
            ]);
    
            // Gửi event
            OrderCreated::dispatch($order);
    
            DB::commit();
            return ApiResponse::responseSuccess($order, __("messages.rebuy_success"), 200);
        } catch (\Exception $e) {
            DB::rollBack();
            \Log::error('Lỗi khi mua lại đơn hàng: ' . $e->getMessage());
            return ApiResponse::errorResponse(500, __("messages.error"));
        }
    }
    
    public function markAsDelivered($id)
    {
        try {
            $user = auth()->user();


            if ($user->role !== 'shipper') {
                return response()->json([
                    'message' => 'Chỉ shipper mới có quyền cập nhật trạng thái đơn hàng.',
                    'status' => false
                ], 403);
            }

            // 2. Tìm đơn hàng
            $order = Order::findOrFail($id);

            // 3. Chỉ cập nhật nếu trạng thái là 'shipping'
            if ($order->status !== 'shipping') {
                return response()->json([
                    'message' => 'Chỉ có thể cập nhật đơn hàng đang giao.',
                    'status' => false
                ], 400);
            }

            // 4. Cập nhật trạng thái
            $order->status = 'complete';
            $order->save();

            return response()->json([
                'message' => 'Đơn hàng đã được cập nhật thành công.',
                'status' => true
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Lỗi xử lý: ' . $e->getMessage(),
                'status' => false
            ], 500);
        }
    }
    public function applyPoints(Request $request)
    {
        \Log::info($request->all());
        try {
            $user = auth()->user();
            $points = (int) $request->used_points;
            $totalAmount = (int) $request->total_amount;

            if ($user->points < $points) {
                return response()->json([
                    'message' => __('messages.not_enough_points'),
                    'status' => false
                ], 400);
            }
            if ($request->used_points <= 0) {
                return response()->json([
                    'message' => __('messages.invalid_points'),
                    'status' => false
                ], 400);
            }


            $pointToVnd = 10;
            $pointsDiscount = $points * $pointToVnd;
            $finalAmount = max(0, $totalAmount - $pointsDiscount);

            if ($pointsDiscount > $totalAmount) {
                return response()->json([
                    'message' => __('messages.points_discount_greater_than_total_amount'),
                    'status' => false
                ], 400);
            }

            return response()->json([
                'message' => __('messages.success'),
                'status' => true,
                'used_points' => $points,
                'points_discount' => $pointsDiscount,
                'final_amount' => $finalAmount
            ]);
        } catch (\Throwable $th) {
            return response()->json([
                'message' => __('messages.error'),
                'error' => $th->getMessage(),
                'status' => false
            ], 500);
        }
    }
    public function retryPayment(Request $request, $id)
    {
        \Log::info($request->all());
        $order = Order::with(['orderDetails', 'orderDetails.sku.product.flashSales', 'user'])->find($id);

        if (!$order) {
            return ApiResponse::errorResponse(404, __("messages.not_found"));
        }

        if ($order->status !== 'cancelled' && $order->tracking_status !== 'pending') {
            return ApiResponse::errorResponse(400, __("messages.cannot_rebuy_order"));
        }

        DB::beginTransaction();
        try {
            $totalAmount = 0;
            $shippingFee = $order->price_shipping;

            if ($order->is_paid == 1) {
                $pointsToDeduct = floor(($order->total_amount - $shippingFee) / 10);
                $user = $order->user;

                if ($user->points >= $pointsToDeduct) {
                    $user->points -= $pointsToDeduct;
                    $user->save();
                } else {
                    return ApiResponse::errorResponse(400, __("messages.not_enough_points"));
                }
            }

            foreach ($order->orderDetails as $detail) {
                $sku = ProductSku::where('sku', $detail->sku)
                    ->with([
                        'product.flashSales' => function ($q) {
                            $q->where('start_time', '<=', now())
                                ->where('end_time', '>=', now());
                        }
                    ])->first();

                if (!$sku) {
                    return ApiResponse::errorResponse(400, "SKU " . __("messages.not_found"));
                }

                $product = $sku->product;
                $flashSale = $product->flashSales->first();
                $price = $sku->price;

                if ($flashSale) {
                    $redisKey = 'flash_sale_stock:' . $product->id;
                    $flashSaleStock = (int) Redis::get($redisKey);

                    \Log::info("FlashSale Redis tồn kho: " . $flashSaleStock);
                    if ($flashSaleStock < $detail->quantity) {
                        return ApiResponse::errorResponse(400, "Sản phẩm {$sku->sku} trong flash sale không còn đủ số lượng.");
                    }

                    // Gán giá khuyến mãi
                    if (isset($flashSale->pivot->discount_price)) {
                        $price = $flashSale->pivot->discount_price;
                    }

                    // Giảm tồn kho Redis Flash Sale
                    Redis::decrby($redisKey, $detail->quantity);
                } else {
                    // Không Flash Sale → kiểm tra tồn kho từ DB
                    if ($sku->stock < $detail->quantity) {
                        return ApiResponse::errorResponse(400, "Sản phẩm {$sku->sku} không còn đủ số lượng.");
                    }

                    // Giảm tồn kho SKU DB
                    $sku->decrement('stock', $detail->quantity);

                    // Cập nhật Redis tồn kho SKU
                    $redisKey = 'sku:stock:' . $detail->sku;
                    if (!Redis::exists($redisKey)) {
                        Redis::set($redisKey, $sku->stock);
                    } else {
                        Redis::decrby($redisKey, $detail->quantity);
                    }
                }

                // Cập nhật lại giá nếu khác
                if ($detail->price != $price) {
                    $detail->price = $price;
                    $detail->save();
                }

                $product->increment('total_sold', $detail->quantity);
                $totalAmount = $order->total_amount;
            }


            // Tổng cộng + phí ship
            $totalAmount += $shippingFee;

            $payUrl = MoMoService::createPayment($order->id, $totalAmount, 'Thanh toán đơn hàng', [
                'user_id' => $order->user_id,

            ]);

            return response()->json([
                'message' => 'Thanh toán đơn hàng thành công.',
                'status' => true,
                'payUrl' => $payUrl
            ]);
            DB::commit();

        } catch (\Exception $e) {
            DB::rollBack();
            \Log::error('Lỗi khi mua lại đơn hàng: ' . $e->getMessage());
            return ApiResponse::errorResponse(500, __("messages.error"));
        }
    }


}
