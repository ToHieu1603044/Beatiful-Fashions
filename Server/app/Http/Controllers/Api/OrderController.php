<?php

namespace App\Http\Controllers\Api;

use App\Helpers\ApiResponse;
use App\Http\Requests\StoreOrderRequest;
use App\Http\Resources\OrderResource;
use App\Models\Cart;
use App\Models\Order;
use App\Models\OrderDetail;
use App\Models\ProductSku;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class OrderController
{
   public function index(Request $request){
        try {
            $orders = Order::with('orderDetails.sku')->paginate(10);

            return ApiResponse::responsePage(OrderResource::collection($orders));
        } catch (\Throwable $th) {
            return ApiResponse::responseError($th->getMessage());
        }
   }
   public function orderUser(Request $request){
        $user = 1;
        
        try {
            $orders = Order::with('orderDetails.sku')->where('user_id', $user->id)->paginate(10);

            return ApiResponse::responsePage(OrderResource::collection($orders));

        } catch (\Throwable $th) {
            return ApiResponse::responseError($th->getMessage());
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
       ]);
   
       try {
           $user = Auth::user();
           $session_id = session()->getId();
   
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
   
           DB::beginTransaction(); // Bat dau giao dichdich
         
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
               'district' => $request->district,
               'ward' => $request->ward,
               'note' => $request->note,
           ]);
   
           $totalAmount = 0;
   
           foreach ($carts as $cart) {
        
               $sku = ProductSku::where('id', $cart->sku_id)
                   ->lockForUpdate() 
                   ->first();
   
               if (!$sku || $sku->stock < $cart->quantity) {
                   DB::rollBack();
                   return ApiResponse::errorResponse(400, "Sản phẩm '{$cart->sku_id}' không đủ hàng.");
               }
   
               $variantDetails = $sku->attributeOptions->pluck('value', 'attribute.name')->toArray();
   
               $subtotal = $sku->price * $cart->quantity;
   
               OrderDetail::create([
                   'order_id' => $order->id,
                   'product_name' => $sku->product->name,
                   'variant_details' => json_encode($variantDetails),
                   'quantity' => $cart->quantity,
                   'price' => $sku->price,
                   'subtotal' => $subtotal,
               ]);
   
               $affected = ProductSku::where('id', $sku->id)
                   ->where('stock', '>=', $cart->quantity) // Kiểm tra tồn kho lần nữa
                   ->decrement('stock', $cart->quantity);
   
               if ($affected === 0) {
                   DB::rollBack();
                   return ApiResponse::errorResponse(400, "Sản phẩm '{$sku->sku}' đã hết hàng.");
               }
   
               $totalAmount += $subtotal;
           }

           $order->update(['total_amount' => $totalAmount]);
   
           Cart::where(function ($query) use ($user, $session_id) {
               if ($user) {
                   $query->where('user_id', $user->id);
               } else {
                   $query->where('session_id', $session_id);
               }
           })->delete();
   
           DB::commit(); 
   
           return ApiResponse::responseSuccess($order, 201, 'Đặt hàng thành công');
       } catch (\Exception $e) {
           \Log::error($e->getMessage());

           DB::rollBack();
           return ApiResponse::errorResponse(500, 'Lỗi khi đặt hàng: ' . $e->getMessage());
       }
   }
   
   public function show(Order $order)
   {
       return new OrderResource($order->load('orderDetails.productSku'));
   }
   public function update(StoreOrderRequest $request, Order $order){
        $order->update($request->validated());

        return ApiResponse::responseSuccess(OrderResource::load('orderDetails.sku'));
   }
   public function destroy(Order $order){

        if($order->shipping_status != 'Chờ xác nhận'){
            $order->delete();
        }
       
        return ApiResponse::responseSuccess();
   }
   public function updateStatus(Request $request, Order $order){
        $validate = $request->validate([
            'shipping_status' => 'required|string'
        ]);

        $order->update($validate);

        return ApiResponse::responseSuccess();
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
       $orders = Order::onlyTrashed()->get(); 
       return response()->json($orders);
   }

}
