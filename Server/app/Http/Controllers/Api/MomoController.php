<?php

namespace App\Http\Controllers\Api;

use App\Models\Cart;
use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class MomoController
{
    public function callback(Request $request)
    {
        \Log::info('MoMo Callback:', $request->all());


        $uniqueOrderId = $request->orderId;
        $parts = explode("-", $uniqueOrderId);
        $orderId = end($parts);

        

        $order = Order::find($orderId);
        if (!$order) {
            return response()->json(['message' => 'Không tìm thấy đơn hàng!'], 400);
        }
        $user_id = $order->user_id; 
        $session_id = session()->getId();

        switch ($request->resultCode) {
            case 0: // Giao dịch thành công

                $order->update(['status' => 'paid', 'is_paid' => true]);
                Cart::where(function ($query) use ($user_id, $session_id) {
                    if ($user_id) {
                        $query->where('user_id', $user_id);
                    } else {
                        $query->where('session_id', $session_id);
                    }
                })->delete();
                return redirect()->to(env('FRONTEND_URL') . "/order/success?orderId=$orderId");

            case 7002: // ⏳ Giao dịch đang xử lý
                Cart::where(function ($query) use ($user_id, $session_id) {
                    if ($user_id) {
                        $query->where('user_id', $user_id);
                    } else {
                        $query->where('session_id', $session_id);
                    }
                })->delete();
                return redirect()->to(env('FRONTEND_URL') . "/order/pending?orderId=$orderId");


            case 7003: // Người dùng hủy thanh toán
            case 9001: // Hết thời gian thanh toán
            case 9003: // Tài khoản không đủ tiền
            case 9004: // Lỗi từ ngân hàng
                $order->update(['status' => 'canceled']);

                return redirect()->to(env('FRONTEND_URL') . "/order/failed?orderId=$orderId");

            default: // Các lỗi khác
                $order->update(['status' => 'error']);

                return response()->json([
                    'message' => 'Có lỗi xảy ra trong quá trình thanh toán!',
                    'redirect_url' => 'http://localhost:5174/order/error',
                ], 400);
        }
    }

}
