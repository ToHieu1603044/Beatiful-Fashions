<?php

namespace App\Http\Controllers\Api;

use App\Events\OrderReturnRequested;
use App\Models\Order;
use App\Models\OrderReturn;
use App\Models\OrderReturnItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class OrderReturnController
{
    public function index(Request $request){

        $orders = OrderReturn::with('order.orderDetails','returnItems')->orderBy('created_at', 'desc')
        
        ->paginate(10);

        return response()->json($orders);
    }
  
    public function returnItem(Request $request, $id)
    {
        if (isset($request->items['items'])) {
            $request->merge(['items' => $request->items['items']]);
        }
    
        $request->validate([
            'items' => 'required|array',
            'items.*.order_detail_id' => 'required|exists:order_details,id',
            'items.*.quantity' => 'required|integer|min:1',
          //  'items.*.refund_amount' => 'required|numeric|min:0',
            'reason' => 'nullable|string',
        ]);
    
        \Log::info($request->all());
    
        $order = Order::findOrFail($id);
    
        DB::beginTransaction();
    
        try {
            $orderReturn = OrderReturn::create([
                'order_id' => $order->id,
                'user_id' => $order->user_id,
                'reason' => $request->reason,
            ]);
    
            $returnItems = [];
    
            foreach ($request->items as $item) {
                $orderDetail = DB::table('order_details')->where('id', $item['order_detail_id'])->first();
    
                if (!$orderDetail) {
                    throw new \Exception('Không tìm thấy sản phẩm trong đơn hàng.');
                }
    
                OrderReturnItem::create([
                    'order_return_id' => $orderReturn->id,
                    'order_detail_id' => $item['order_detail_id'],
                    'quantity' => $item['quantity'],
                    'refund_amount' => $orderDetail->price * $item['quantity'],
                ]);
    
                DB::table('order_details')
                    ->where('id', $item['order_detail_id'])
                    ->update(['return_status' => 'pending']);
    
                $returnItems[] = [
                    'product_name' => $orderDetail->product_name,
                    'variant_details' => json_decode($orderDetail->variant_details, true),
                    'sku' => $orderDetail->sku,
                    'quantity' => $item['quantity'],
                    'price' => $orderDetail->price,
                    'subtotal' => $orderDetail->subtotal,
                    'return_status' => 'pending',
                ];
            }
    
            DB::commit();
    
            event(new OrderReturnRequested($order, $orderReturn, $returnItems));
    
            return response()->json([
                'success' => true,
                'message' => 'Đã gửi yêu cầu hoàn hàng cho đơn hàng',
            ], 200);
    
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 500);
        }
    }
    public function updateStatus(Request $request, $id)
{
    $request->validate([
        'status' => 'required|in:pending,approved,rejected,shipping,received,refunded',
    ]);

    $orderReturn = OrderReturn::findOrFail($id);
    $orderReturn->update(['status' => $request->status]);

    return response()->json(['message' => 'Cập nhật trạng thái thành công!', 'status' => $orderReturn->status],200);
}
    
    }
