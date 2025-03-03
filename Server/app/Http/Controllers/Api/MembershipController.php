<?php

namespace App\Http\Controllers\Api;

use App\Models\Order;
use Illuminate\Http\Request;

class MembershipController extends Controller
{
    public function callback(Request $request)
    {
        \Log::info('MoMo Callback:', $request->all());

        if ($request->resultCode == 0) {
            $order = Order::where('id', $request->orderId)->first();
            if ($order) {
                $order->update(['status' => 'paid', 'is_paid' => true]);
                return response()->json(['message' => 'Thanh toán thành công!']);
            }
        }

        return response()->json(['message' => 'Thanh toán thất bại!'], 400);
    }
}
