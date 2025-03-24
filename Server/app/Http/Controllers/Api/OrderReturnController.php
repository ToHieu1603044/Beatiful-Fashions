<?php

namespace App\Http\Controllers\Api;

use App\Events\OrderReturnCompleted;
use App\Events\OrderReturnRequested;
use App\Mail\OrderReturnCompletedMail;
use App\Models\Order;
use App\Models\OrderReturn;
use App\Models\OrderReturnItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;

class OrderReturnController
{
    public function index(Request $request)
    {

        $orders = OrderReturn::with('order.orderDetails', 'returnItems')->orderBy('created_at', 'desc')

            ->paginate(10);

        return response()->json($orders);
    }

    public function returnItemUser(Request $request)
    {

        $user = Auth::user();

        $orders = OrderReturn::with('order.orderDetails', 'returnItems')->where('user_id', $user->id)->orderBy('created_at', 'desc')

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

        if ($order->status === 'completed' && now()->diffInDays($order->updated_at) > 7) {
            return response()->json([
                'message' => 'Đơn hàng đã hoàn tất hơn 7 ngày, không thể hoàn trả!',
                'status' => $order->status
            ], 400);
        }

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
            'status' => 'required|in:pending,approved,rejected,received,refunded,completed',
        ]);
    
        $orderReturn = OrderReturn::findOrFail($id);
    
        if ($orderReturn->status === 'completed') {
            return response()->json([
                'message' => 'Không thể cập nhật đơn hoàn trả đã hoàn tất!',
                'status' => $orderReturn->status
            ], 400);
        }
    
        DB::transaction(function () use ($orderReturn, $request) {
            // Cập nhật trạng thái đơn hoàn trả
            $orderReturn->update(['status' => $request->status]);
    
            // Chỉ cập nhật tồn kho khi trạng thái là "refunded"
            if ($request->status === 'refunded') {
                $returnDetails = $orderReturn->returnItems;
    
                foreach ($returnDetails as $returnDetail) {
                    // Lấy thông tin từ order_details để lấy SKU
                    $orderDetail = DB::table('order_details')
                        ->where('id', $returnDetail->order_detail_id)
                        ->first();
    
                    if ($orderDetail && $orderDetail->sku) {
                        // Cập nhật stock trong bảng product_skus
                        DB::table('product_skus')
                            ->where('sku', $orderDetail->sku)
                            ->increment('stock', $returnDetail->quantity);
    
                        // Giảm subtotal trong order_details
                        DB::table('order_details')
                            ->where('id', $returnDetail->order_detail_id)
                            ->decrement('subtotal', $returnDetail->refund_amount);
    
                        // Cập nhật trạng thái hoàn trả trong order_details
                        DB::table('order_details')
                            ->where('id', $returnDetail->order_detail_id)
                            ->update(['return_status' => $returnDetail->refund_amount]);
                    }
                }
            }
        });
    
        // Gọi sự kiện sau khi transaction hoàn tất
        if ($request->status === 'completed') {
            event(new OrderReturnCompleted($orderReturn));
        }
    
        return response()->json([
            'message' => 'Cập nhật trạng thái thành công!',
            'status' => $orderReturn->status
        ], 200);
    }
    


    public function updateStatusUser(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|in:shipping,completed',
        ]);

        $orderReturn = OrderReturn::findOrFail($id);
        $orderReturn->update(['status' => $request->status]);

        foreach ($orderReturn->returnItems as $returnItem) {
            $orderDetail = $returnItem->orderDetail;
            if ($orderDetail) {
                $orderDetail->update(['return_status' => $request->status]);
            }
        }
        if ($orderReturn->status === 'completed') {
            event(new OrderReturnCompleted($orderReturn));
        }
      

        return response()->json(['message' => 'Cập nhật trạng thái thành công!', 'status' => $orderReturn->status], 200);
    }
    public function cancelOrderReturn(Request $request, $id)
    {
        try {
            $orderReturn = OrderReturn::findOrFail($id);

            if ($orderReturn->status != 'pending') {
                return response()->json(['message' => 'Không thể huy bo don hang'], 400);
            }

            $orderReturn->delete();

            return response()->json(['message' => 'Huy bo don hang'], 200);
        } catch (\Throwable $th) {

            return response()->json(['message' => $th->getMessage()], 500);
        }
    }


}
