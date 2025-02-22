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
   public function store(StoreOrderRequest $request){

        $validate = $request->validated();

        $user = Auth::user();
        \DB::beginTransaction();
        try {
            foreach ($validate['cart'] as $item) {
                $sku = ProductSku::find($item['sku_id']);
                if($sku->stock < $item['quantity']){
                    throw ValidationException::withMessages(["sku_{$sku->id}" => "Sản phẩm {$sku->sku} không đủ hàng tồn"]);
                }
            }

            $order = Order::create([
                'user_id' => $user->id,
                'total_amount' => $validate['total_amount'],
                'status' => $validate['status'],
                'name'=> $validate['name'],
                'email' => $validate['email'],
                'phone' => $validate['phone'],
                'address' => $validate['address'],
                'ward' => $validate['ward'],
                'district' => $validate['district'],
                'city' => $validate['city'],
                'zip_code' => $validate['zip_code'],
                'payment_method' => $validate['payment_method'],
                'note' => $validate['note'],

            ]);

            foreach ($validate['cart'] as $item) {
                $sku = ProductSku::findOrFail($item['sku_id']);

                OrderDetail::create([
                    'order_id' => $order->id,
                    'sku_id' => $sku->id,
                    'quantity' => $item['quantity'],
                    'price' => $sku->price,
                    'subtotal' => $sku->price * $item['quantity']
                ]);

                $sku->decrement('stock', $item['quantity']);
            }
            if($user){
                Cart::where('user_id', $user->id)->delete();
            }
            \DB::commit();

            return response()->json([
                'message' => 'Đặt hàng thành công',
                'data' => new OrderResource($order->load('orderDetails.sku'))
            ]);

        }catch(Exception $e){
            \DB::rollBack();
            \Log::error($e->getMessage());
            return ApiResponse::errorResponse($e->errors());
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
