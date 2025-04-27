<?php

namespace App\Http\Controllers\Api;

use App\Events\OrderCreated;
use App\Mail\OrderPaidMail;
use App\Models\Cart;
use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

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
    
        $userId = $order->user_id;
        $session_id = session()->getId();
    
        switch ($request->resultCode) {
            case 0: // Giao dịch thành công
                $order->update(['status' => 'pending', 'is_paid' => true]);
    
                // Xoá giỏ hàng
                $extraData = json_decode($request->extraData, true);
                $cartIds = $extraData['cart_ids'] ?? [];
    
                if (!empty($cartIds)) {
                    Cart::where(function ($query) use ($userId, $session_id) {
                        if ($userId) {
                            $query->where('user_id', $userId);
                        } else {
                            $query->where('session_id', $session_id);
                        }
                    })->whereIn('id', $cartIds)->delete();
                }
    
                OrderCreated::dispatch($order);
    
                return redirect()->to(env('FRONTEND_URL') . "/order/success");
    
            case 7002:
                $order->update(['status' => 'pending', 'is_paid' => false]);

                $extraData = json_decode($request->extraData, true);
                $cartIds = $extraData['cart_ids'] ?? [];
    
                if (!empty($cartIds)) {
                    Cart::where(function ($query) use ($userId, $session_id) {
                        if ($userId) {
                            $query->where('user_id', $userId);
                        } else {
                            $query->where('session_id', $session_id);
                        }
                    })->whereIn('id', $cartIds)->delete();
                }
                return redirect()->to(env('FRONTEND_URL') . "/order/pending");
    
            case 7003:
            case 9001:
            case 9003:
            case 9004:
            default:
             
                $order->update(['status' => 'cancelled', 'is_paid' => false]);

                $extraData = json_decode($request->extraData, true);
                $cartIds = $extraData['cart_ids'] ?? [];
    
                if (!empty($cartIds)) {
                    Cart::where(function ($query) use ($userId, $session_id) {
                        if ($userId) {
                            $query->where('user_id', $userId);
                        } else {
                            $query->where('session_id', $session_id);
                        }
                    })->whereIn('id', $cartIds)->delete();
                }
                return redirect()->to(env('FRONTEND_URL') . "/order/failed");
        }
    }
    public function refund(Request $request)
    {
        // Lấy thông tin từ request
        $transId = $request->input('transId');  // Mã giao dịch cần hoàn tiền
        $refundAmount = $request->input('refundAmount');  // Số tiền hoàn lại
        
        // Thông tin từ config
        $partnerCode = config('services.momo.partner_code');
        $accessKey = config('services.momo.access_key');
        $secretKey = config('services.momo.secret_key');

        // Tạo request data cho Momo API
        $refundData = [
            'partnerCode' => $partnerCode,
            'accessKey' => $accessKey,
            'requestId' => uniqid(),  // Tạo ID duy nhất cho yêu cầu hoàn tiền
            'requestType' => 'refund',  // Loại yêu cầu là hoàn tiền
            'transId' => $transId,
            'amount' => $refundAmount,
            'refundAmount' => $refundAmount,
            'orderId' => 'order123456',  // ID đơn hàng (tùy chọn)
        ];

        // Tạo chữ ký (signature)
        $rawSignature = "partnerCode={$partnerCode}&accessKey={$accessKey}&requestId={$refundData['requestId']}&requestType={$refundData['requestType']}&transId={$transId}&amount={$refundAmount}&refundAmount={$refundAmount}";
        $signature = hash_hmac('sha256', $rawSignature, $secretKey);

        // Thêm chữ ký vào dữ liệu hoàn tiền
        $refundData['signature'] = $signature;

        // Gửi yêu cầu hoàn tiền đến Momo API
        $url = "https://test-payment.momo.vn/v2/gateway/transaction/refund";
        $options = [
            'http' => [
                'method' => 'POST',
                'header' => "Content-Type: application/json\r\n",
                'content' => json_encode($refundData),
            ]
        ];

        $context = stream_context_create($options);
        $response = file_get_contents($url, false, $context);
        
        // Kiểm tra phản hồi từ Momo
        $responseData = json_decode($response, true);
        if ($responseData['resultCode'] == 0) {
            Log::info('Refund successful', $responseData);
            return response()->json(['message' => 'Hoàn tiền thành công!'], 200);
        } else {
            Log::error('Refund failed', $responseData);
            return response()->json(['message' => 'Lỗi hoàn tiền: ' . $responseData['message']], 400);
        }
    }
    

}
