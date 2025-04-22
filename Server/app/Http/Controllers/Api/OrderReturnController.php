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
use Illuminate\Support\Facades\Redis;

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

        // Nếu đã completed thì không cho cập nhật nữa
        if ($orderReturn->status === 'completed') {
            return response()->json([
                'message' => 'Không thể cập nhật đơn hoàn trả đã hoàn tất!',
                'status' => $orderReturn->status
            ], 400);
        }

        // Không cho cập nhật ngược trạng thái
        $statusOrder = [
            'pending' => 0,
            'approved' => 1,
            'rejected' => 1,
            'received' => 2,
            'refunded' => 3,
            'completed' => 4,
        ];

        $current = $statusOrder[$orderReturn->status] ?? -1;
        $next = $statusOrder[$request->status] ?? -1;

        if ($next < $current) {
            return response()->json([
                'message' => 'Không thể cập nhật ngược trạng thái!',
                'status' => $orderReturn->status
            ], 400);
        }

        DB::transaction(function () use ($orderReturn, $request) {
            $orderReturn->update(['status' => $request->status]);

            // Xử lý tồn kho và bán hàng khi trạng thái là "approved"
            if ($request->status === 'approved') {
                $returnDetails = $orderReturn->returnItems;

                foreach ($returnDetails as $returnDetail) {
                    $orderDetail = DB::table('order_details')
                        ->where('id', $returnDetail->order_detail_id)
                        ->first();

                    if ($orderDetail) {
                        if ($orderDetail->sku) {
                            DB::table('product_skus')
                                ->where('sku', $orderDetail->sku)
                                ->increment('stock', $returnDetail->quantity);

                            $redisKey = 'sku:stock:' . $orderDetail->sku;
                            if (Redis::exists($redisKey)) {
                                Redis::incrby($redisKey, $returnDetail->quantity);
                            }
                        }

                        if ($orderDetail->product_id) {
                            DB::table('products')
                                ->where('id', $orderDetail->product_id)
                                ->decrement('total_sold', $returnDetail->quantity);
                        }
                    }
                }
            }
        });

        if ($request->status === 'completed') {
            event(new OrderReturnCompleted($orderReturn));

            $order = $orderReturn->order;

            if ($order && $order->user) {
                $user = $order->user;

                $totalRefundAmount = $orderReturn->returnItems->sum('refund_amount');

                $points = floor($totalRefundAmount / 1000) * 10;

                $user->increment('points', $points);
            }
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
    
        $orderReturn = OrderReturn::with('returnItems.orderDetail')->findOrFail($id);
    
        // Không cho cập nhật nếu đã là completed
        if ($orderReturn->status === 'completed') {
            return response()->json(['message' => 'Đơn hoàn đã hoàn tất, không thể cập nhật trạng thái!'], 400);
        }
    
        // Xử lý trạng thái ngược
        $statusOrder = [
            'pending' => 0,
            'approved' => 1,
            'shipping' => 2,
            'completed' => 3,
        ];
    
        $currentStatus = $statusOrder[$orderReturn->status] ?? -1;
        $newStatus = $statusOrder[$request->status] ?? -1;
    
        // Kiểm tra nếu trạng thái mới nhỏ hơn trạng thái hiện tại (ngược lại)
        if ($newStatus < $currentStatus) {
            return response()->json(['message' => 'Không thể cập nhật ngược trạng thái!'], 400);
        }
    
        // Cập nhật trạng thái
        $orderReturn->update(['status' => $request->status]);
    
        // Cập nhật trạng thái từng order_detail liên quan
        foreach ($orderReturn->returnItems as $returnItem) {
            $orderDetail = $returnItem->orderDetail;
            if ($orderDetail) {
                $orderDetail->update(['return_status' => $request->status]);
            }
        }
    
        // Nếu trạng thái là completed => phát sự kiện
        if ($request->status === 'completed') {
            event(new OrderReturnCompleted($orderReturn));
        }
    
        return response()->json([
            'message' => 'Cập nhật trạng thái thành công!',
            'status' => $orderReturn->status
        ], 200);
    }
    
    public function cancelOrderReturn(Request $request, $id)
    {
        try {
            $orderReturn = OrderReturn::findOrFail($id);

            if ($orderReturn->status != 'pending') {
                return response()->json(['message' => 'Không thể huy bo don hang'], 400);
            }

            $orderReturn->update([
                'status' => 'cancelled',
                'shipping_status' => 'cancelled'
            ]);

            return response()->json(['message' => 'Huy bo don hang'], 200);
        } catch (\Throwable $th) {

            return response()->json(['message' => $th->getMessage()], 500);
        }
    }


}
