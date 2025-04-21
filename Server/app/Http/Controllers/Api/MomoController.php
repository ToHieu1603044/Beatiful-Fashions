<?php

namespace App\Http\Controllers\Api;

use App\Events\OrderCreated;
use App\Mail\OrderPaidMail;
use App\Models\Cart;
use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Mail;

class MomoController
{
    public function callback(Request $request)
    {
        \Log::info('MoMo Callback:', $request->all());
    
        $cartIds = json_decode($request->cartIds);
        if (!is_array($cartIds) || empty($cartIds)) {
            \Log::warning("MoMo Callback: cartIds không hợp lệ", [$cartIds]);
            return response()->json(['message' => 'Dữ liệu cart không hợp lệ.'], 400);
        }
    
        $uniqueOrderId = $request->orderId;
        $parts = explode("-", $uniqueOrderId);
        $orderId = end($parts);
    
        $order = Order::find($orderId);
        if (!$order) {
            return response()->json(['message' => 'Không tìm thấy đơn hàng!'], 400);
        }
    
        $userId = $order->user_id;
        $session_id = session()->getId();
    
        switch ($request->resultCode) {
            case 0: // Giao dịch thành công
                $order->update(['status' => 'processing', 'is_paid' => true]);
    
                Cart::where(function ($query) use ($userId, $session_id) {
                    $userId ? $query->where('user_id', $userId) : $query->where('session_id', $session_id);
                })
                ->whereIn('id', $cartIds)
                ->delete();
    
                OrderCreated::dispatch($order);
    
                return redirect()->to(env('FRONTEND_URL') . "/order/success?orderId=$orderId");
    
            case 7002:
                return redirect()->to(env('FRONTEND_URL') . "/order/pending?orderId=$orderId");
    
            case 7003:
            case 9001:
            case 9003:
            case 9004:
            default:
                $order->update(['status' => 'canceled']);
                return redirect()->to(env('FRONTEND_URL') . "/order/failed?orderId=$orderId");
        }
    }
    

}
