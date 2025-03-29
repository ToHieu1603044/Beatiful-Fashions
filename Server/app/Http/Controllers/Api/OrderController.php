<?php

namespace App\Http\Controllers\Api;

use App\Events\OrderCreated;
use App\Helpers\ApiResponse;
use App\Http\Requests\StoreOrderRequest;
use App\Http\Resources\OrderResource;
use App\Mail\OrderPaidMail;
use App\Models\Cart;
use App\Models\Discount;
use App\Models\DiscountUsage;
use App\Models\Order;
use App\Models\OrderDetail;
use App\Models\OrderReturn;
use App\Models\OrderReturnItem;
use App\Models\ProductSku;
use App\Models\User;
use App\Services\MoMoService;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Illuminate\Validation\ValidationException;

class OrderController
{
    public function index(Request $request)
    {
        try {
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

            $orders = $query->paginate(20);

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
        $request->validate([
            'payment_method' => 'required|in:cod,online',
            'name' => 'required|string|max:255',
            'email' => 'nullable|email|max:255',
            'phone' => 'required|string|max:15',
            'city' => 'required|string|max:255',
            'district' => 'required|string|max:255',
            'ward' => 'required|string|max:255',
            'note' => 'nullable|string|max:500',
            'discount_code' => 'nullable|string|max:50',
        ]);

        try {
            $user = Auth::user();
            $session_id = session()->getId();

            // Lấy giỏ hàng
            $carts = Cart::where(function ($query) use ($user, $session_id) {
                if ($user) {
                    $query->where('user_id', $user->id);
                } else {
                    $query->where('session_id', $session_id);
                }
            })->get();

            if ($carts->isEmpty()) {
                return ApiResponse::errorResponse(400, 'Giỏ hàng trống!');
            }

            DB::beginTransaction();

            // Tạo đơn hàng ban đầu
            $order = Order::create([
                'user_id' => $user ? $user->id : null,
                'total_amount' => 0,
                'status' => 'pending',
                'payment_method' => $request->payment_method,
                'is_paid' => false,
                'name' => $request->name,
                'email' => $request->email,
                'phone' => $request->phone,
                'city' => $request->city,
                'address' => $request->address,
                'district' => $request->district_name,
                'ward' => $request->ward,
                'note' => $request->note,
            ]);

            $totalAmount = 0;
            foreach ($carts as $cart) {
                $sku = ProductSku::where('id', $cart->sku_id)->lockForUpdate()->first();

                if (!$sku || $sku->stock < $cart->quantity) {
                    DB::rollBack();
                    return ApiResponse::errorResponse(400, "Sản phẩm '{$cart->sku_id}' không đủ hàng.");
                }

                $variantDetails = $sku->attributeOptions->pluck('value', 'attribute.name')->toArray();
                $subtotal = $sku->price * $cart->quantity;

                OrderDetail::create([
                    'order_id' => $order->id,
                    'sku' => $sku->sku,
                    'product_id' => $sku->product_id,
                    'product_name' => $sku->product->name,
                    'variant_details' => json_encode($variantDetails),
                    'quantity' => $cart->quantity,
                    'price' => $sku->price,
                    'subtotal' => $subtotal,
                ]);

                if ($sku->product) {
                    $sku->product->increment('total_sold', $cart->quantity);
                } else {
                    \Log::error("Không tìm thấy sản phẩm cho SKU ID: " . $sku->id);
                }

                $sku->decrement('stock', $cart->quantity);

                $totalAmount += $subtotal;
            }


            if ($request->has('discount')) {
                $discount = Discount::where('code', $request->discount)
                    ->where('active', true)
                    ->first();

                if ($discount) {
                    DiscountUsage::create([
                        'user_id' => $user->id,
                        'discount_id' => $discount->id,
                    ]);

                    $discount->increment('used_count');
                }
            }

            $order->update([
                'total_amount' => $request->total_amount,
                'discount_code' => $request->discount,
                'discount_amount' => $request->priceDiscount,
            ]);

            DB::commit();

            if ($request->payment_method === 'online') {
                $payUrl = MoMoService::createPayment($order->id, $request->total_amount);

                if ($payUrl) {
                    return response()->json([
                        'order_id' => $order->id,
                        'payUrl' => $payUrl
                    ]);
                }

                return ApiResponse::errorResponse(500, 'Không thể tạo thanh toán MoMo.');
            }

            Cart::where(function ($query) use ($user, $session_id) {
                if ($user) {
                    $query->where('user_id', $user->id);
                } else {
                    $query->where('session_id', $session_id);
                }
            })->delete();

            if (!$order) {
                return response()->json(['message' => 'Không tìm thấy đơn hàng!'], 400);
            }

            \Log::info('Gửi mail với order:', ['order' => $order->toArray()]);

            // Mail::to("tthieu160304@gmail.com")->send(new OrderPaidMail($order));

            OrderCreated::dispatch($order);

            return ApiResponse::responseSuccess($order, 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return ApiResponse::errorResponse(500, 'Lỗi khi đặt hàng: ' . $e->getMessage());
        }
    }

    public function show(Order $order)
    {
        try {
            if ($order) {
                return new OrderResource($order->load('orderDetails.sku'));
            } else {
                return ApiResponse::errorResponse(400, 'Không tìm thấy đơn hàng!');
            }
        } catch (\Exception $e) {

            return ApiResponse::errorResponse(500, 'Lỗi khi tìm kiếm đơn hàng: ' . $e->getMessage());
        }
    }
    public function update(Request $request, Order $order)
    {
        $validated = $request->all();
        \Log::info($validated);
        DB::beginTransaction();
        try {
            // Chỉ cập nhật các trường có trong request
            $order->update(array_filter([
                'status' => $validated['status'] ?? null,
                'is_paid' => $validated['is_paid'] ?? null,
                'payment_method' => $validated['payment_method'] ?? null,
                'name' => $validated['name'] ?? null,
                'phone' => $validated['phone'] ?? null,
                'email' => $validated['email'] ?? null,
                'ward' => $validated['ward'] ?? null,
                'district' => $validated['district'] ?? null,
                'city' => $validated['city'] ?? null,
                'note' => $validated['note'] ?? null,
                'address' => $validated['address'] ?? null
            ], fn($value) => !is_null($value))); // Loại bỏ các giá trị null

            if (!empty($validated['order_details'])) {

                foreach ($validated['order_details'] as $detail) {
                    // Tìm SKU mới trong danh sách sản phẩm
                    $sku = ProductSku::where('sku', $detail['sku'])->first();
                    \Log::info("Thông tin SKU:", ['sku' => $sku]);

                    if ($sku) {
                        // Tìm sản phẩm trong order_details theo ID (không tìm theo SKU)
                        $orderDetail = $order->orderDetails()->where('id', $detail['id'])->first();

                        if ($orderDetail) {
                            // Nếu sản phẩm đã có trong đơn hàng, cập nhật thông tin
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
                            // Nếu sản phẩm chưa có, thêm mới
                            $order->orderDetails()->create([
                                'product_id' => $sku->product_id, // Thêm product_id
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

            return ApiResponse::responseSuccess(new OrderResource($order));
        } catch (\Exception $e) {
            DB::rollBack();
            return ApiResponse::errorResponse(500, 'Cập nhật đơn hàng thất bại', $e->getMessage());
        }
    }


    public function completeOrder($id)
    {
        $order = Order::findOrFail($id);

        if ($order->tracking_status === 'completed' && $order->is_paid == 0) {
            $order->update([
                'is_paid' => 1,
                'status' => 'completed',
            ]);

            return response()->json(['message' => 'Đơn hàng đã được hoàn thành!']);
        }

        return response()->json(['message' => 'Không thể hoàn thành đơn hàng!'], 400);
    }

    public function destroy($id)
    {
        $order = Order::findOrFail($id);

        if ($order->shipping_status !== 'pending') {
            return ApiResponse::errorResponse(400, 'Không thể hủy đơn hàng khi đã được xử lý');
        }

        $order->delete();

        return ApiResponse::responseSuccess('Đơn hàng đã được hủy', 204);
    }
    public function destroys($id)
    {
        $order = Order::findOrFail($id);

        if ($order->shipping_status !== 'pending') {
            return ApiResponse::errorResponse(400, 'Không thể hủy đơn hàng khi đã được xử lý');
        }

        $order->update(['status' => 'canceled']);

        return ApiResponse::responseSuccess('Đơn hàng đã được hủy', 204);
    }
    public function updateStatus(Request $request, $id)
    {
        $order = Order::findOrFail($id);
        $user = User::find($order->user_id);

        if (in_array($order->tracking_status, ['completed', 'cancelled'])) {
            return ApiResponse::errorResponse(400, "Không thể cập nhật đơn hàng đã hoàn thành hoặc đã bị hủy.");
        }

        $request->validate([
            'tracking_status' => 'nullable|string|in:pending,processing,shipped,delivered,cancelled,completed',
            'status' => 'nullable|string|in:pending,completed,cancelled',
            'is_paid' => 'nullable|boolean'
        ]);

        DB::beginTransaction();
        try {
            $oldTrackingStatus = $order->tracking_status;

            if ($request->tracking_status === 'cancelled') {
                if ($order->tracking_status !== 'pending') {
                    return ApiResponse::errorResponse(400, "Chỉ có thể hủy đơn hàng khi đang ở trạng thái 'pending'.");
                }
                $order->status = 'cancelled';
            }

            if ($request->has('tracking_status')) {
                $order->tracking_status = $request->tracking_status;
            }
            if ($request->has('is_paid')) {
                $order->is_paid = $request->is_paid;
            }
            $order->save();

            // Ghi lại lịch sử thay đổi trạng thái
            if ($oldTrackingStatus !== $order->tracking_status) {
                $order->statusHistories()->create([
                    'old_status' => $oldTrackingStatus,
                    'new_status' => $order->tracking_status,
                    'changed_by' => auth()->id()
                ]);
            }

            // Tính điểm và cập nhật ranking nếu đơn hàng hoàn thành
            if ($user && $order->tracking_status === 'completed' && $oldTrackingStatus !== 'completed') {
                $points = floor($order->total_amount / 100000) * 10;
                $user->increment('points', $points);
                $user->updateRanking();
            }

            DB::commit();
            return ApiResponse::responseSuccess($order, 200, "Cập nhật trạng thái thành công.");
        } catch (\Exception $e) {
            DB::rollBack();
            \Log::error('Lỗi cập nhật đơn hàng: ' . $e->getMessage());

            return ApiResponse::responseError(500, "Có lỗi xảy ra khi cập nhật đơn hàng.");
        }
    }

    public function confirmOrder(Request $request, $id)
    {
        $order = Order::findOrFail($id);
        $user = User::find($order->user_id);

        DB::beginTransaction();

        try {
            if (!$order->tracking_status === 'completed' && !$order->is_paid == 0) {
                return ApiResponse::errorResponse(400, 'Không thể hoàn thanh đơn hàng!');
            }
            $order->update([
                'status' => 'completed',
                'is_paid' => 1
            ]);

            $order->save();

            DB::commit();
            return ApiResponse::responseSuccess($order, 200, "Cập nhật trạng thái thành công.");
        } catch (\Exception $e) {
            DB::rollBack();
            \Log::error('Lỗi cập nhật đơn hàng: ' . $e->getMessage());

            return ApiResponse::responseError(500, "Có lỗi xảy ra khi cập nhật đơn hàng.");
        }
    }
    public function restore($id)
    {
        $order = Order::onlyTrashed()->findOrFail($id);

        $order->restore();

        return response()->json(['message' => 'Đơn hàng đã được khôi phục!']);
    }
    public function forceDelete($id)
    {
        $order = Order::onlyTrashed()->findOrFail($id);
        $order->forceDelete();
        return response()->json(['message' => 'Đơn hàng đã bị xóa vĩnh viễn!']);
    }
    public function listDeleted()
    {

        $orders = Order::onlyTrashed()->with('orderDetails.sku')->orderBy('created_at', 'desc')->paginate(10);
        return ApiResponse::responsePage(OrderResource::collection($orders));
    }
    public function cancelOrder(Request $request, Order $order)
    {

        if ($order->shipping_status != 'Đã gửi hàng') {
            return ApiResponse::errorResponse(400, 'Không thể huy đơn hàng!');
        }

        $order->update([
            'shipping_status' => 'canceled',
            'status' => 'canceled',
        ]);

        return ApiResponse::responseSuccess();
    }
    public function refundOrder(Request $request, Order $order)
    {

    }
    public function fetchReturnDetails($orderDetailId)
    {
        $orderDetail = OrderDetail::where('id', $orderDetailId)
            ->with([
                'returnDetails' => function ($query) {
                    $query->with('orderReturn'); // Sửa lỗi gọi sai quan hệ
                },
                'order' => function ($query) {
                    $query->select('id', 'name', 'phone', 'email', 'address', 'district', 'city')
                        ->with('returnDetails');
                }
            ])
            ->first();

        if (!$orderDetail) {
            return response()->json([
                'message' => 'Không tìm thấy dữ liệu trả hàng',
                'data' => null
            ], 404);
        }

        return response()->json([
            'message' => 'Lấy dữ liệu trả hàng thành công',
            'data' => $orderDetail
        ], 200);
    }
}
