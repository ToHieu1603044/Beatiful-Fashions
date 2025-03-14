<?php

namespace App\Http\Controllers\Api;

use App\Events\OrderCreated;
use App\Helpers\ApiResponse;
use App\Http\Requests\StoreOrderRequest;
use App\Http\Resources\OrderResource;
use App\Mail\OrderPaidMail;
use App\Models\Cart;
use App\Models\Discount;
use App\Models\Order;
use App\Models\OrderDetail;
use App\Models\ProductSku;
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
            $orders = Order::with('orderDetails.sku')->orderBy('created_at', 'desc')->paginate(10);

            return ApiResponse::responsePage(OrderResource::collection($orders));

        } catch (\Throwable $th) {

            return ApiResponse::errorResponse(500, $th->getMessage());
        }
    }
    public function orderUser(Request $request)
    {
        $user = Auth::user();

        try {
            $orders = Order::with('orderDetails.sku')->where('user_id', $user->id)->paginate(10);

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
                'district' => $request->district,
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

                $variantDetails = $sku->attributeOptions->pluck('value','attribute.name')->toArray();
                $subtotal = $sku->price * $cart->quantity;

                OrderDetail::create([
                    'order_id' => $order->id,
                  //  'sku' => $sku->sku,
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

            $discountAmount = 0;
            $discountCode = null;

            if ($request->has('discount')) {
                $discount = Discount::where('code', $request->discount)
                    ->where('active', 1)
                    ->where(function ($query) {
                        $query->whereNull('start_date')->orWhere('start_date', '<=', now());
                    })
                    ->where(function ($query) {
                        $query->whereNull('end_date')->orWhere('end_date', '>=', now());
                    })
                    ->where(function ($query) {
                        $query->whereColumn('used_count', '<', 'max_uses')
                            ->orWhereNull('max_uses');
                    })
                    ->first();

                if ($discount && $totalAmount >= $discount->min_order_amount) {
                    if ($discount->discount_type === 'fixed') {
                        $discountAmount = min($discount->value, $totalAmount);
                    } else {
                        $discountAmount = $totalAmount * ($discount->value / 100);
                        if (!is_null($discount->max_discount)) {
                            $discountAmount = min($discountAmount, $discount->max_discount);
                        }
                    }

                    $discountAmount = min($discountAmount, $totalAmount);
                    $discount->increment('used_count');
                    $discountCode = $discount->code;
                }
            }

            $finalTotalAmount = $totalAmount - $discountAmount;
            $order->update([
                'total_amount' => $finalTotalAmount,
                'discount_code' => $discountCode,
                'discount_amount' => $discountAmount,
            ]);

            DB::commit();

            if ($request->payment_method === 'online') {
                $payUrl = MoMoService::createPayment($order->id, $finalTotalAmount);

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
       try{
            if($order){
                return new OrderResource($order->load('orderDetails.sku'));
            }else{
                return ApiResponse::errorResponse(400, 'Không tìm thấy đơn hàng!');
            }
       }catch(\Exception $e){

            return ApiResponse::errorResponse(500, 'Lỗi khi tìm kiếm đơn hàng: ' . $e->getMessage());
       }
    }
    public function update(StoreOrderRequest $request, Order $order)
    {
        $validate = $request->validated();

        $order->update($validate);

        foreach ($order->orderDetails as $orderDetail) {
            $orderDetail->update([
                'price' => $orderDetail->sku->price,
                'subtotal' => $orderDetail->sku->price * $orderDetail->quantity,
            ]);
        }

        return ApiResponse::responseSuccess($order);
      
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

    $request->validate([
        'shipping_status' => 'required|string|in:pending,processing,shipped,delivered,cancelled'
    ]);

    $order->update(['tracking_status' => $request->shipping_status]);

    return ApiResponse::responseSuccess($order, 200, "Cập nhật trạng thái thành công.");
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
    public function cancelOrder(Request $request, Order $order){
       
        if($order->shipping_status != 'Đã gửi hàng'){
            return ApiResponse::errorResponse(400, 'Không thể huy đơn hàng!');
        }

        $order->update([
            'shipping_status' => 'Huy đơn hàng',
            'status' => 'canceled',
        ]);

        return ApiResponse::responseSuccess();
    }
    public function refundOrder(Request $request, Order $order){
        
    }
}
