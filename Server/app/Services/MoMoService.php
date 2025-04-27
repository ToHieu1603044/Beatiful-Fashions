<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class MoMoService
{

    public static function createPayment($orderId, $amount, $orderInfo = 'Thanh toán đơn hàng', $extraData = '')
    {
        \Log::info('MoMo Create Payment:', [
            'orderId' => $orderId,
            'amount' => $amount,
            'orderInfo' => $orderInfo,
            'extraData' => $extraData
        ]);

        $endpoint = env('MOMO_ENDPOINT', 'https://test-payment.momo.vn/v2/gateway/api/create');
        $partnerCode = env('MOMO_PARTNER_CODE', 'MOMOBKUN20180529');
        $accessKey = env('MOMO_ACCESS_KEY', 'klm05TvNBzhg7h7j');
        $secretKey = env('MOMO_SECRET_KEY', 'at67qH6mk8w5Y1nAyMoYKMWACiEi2bsa');
        $returnUrl = env('MOMO_RETURN_URL', 'http://127.0.0.1:8000/api/momo/callback');
        $notifyUrl = env('MOMO_NOTIFY_URL', 'https://your-website.com/momo/notify');

        // Ép kiểu đúng yêu cầu MoMo
        $orderId = (string) $orderId;
        $amount = (int) $amount;
        $requestId = time() . "";

        $extraData = is_array($extraData) ? json_encode($extraData) : $extraData;
        $requestType = "payWithATM";

        // 🔥 Đảm bảo orderId là duy nhất và không trùng lặp
        $uniqueOrderId = time() . "-" . $orderId;

        // 🛠 Tạo chuỗi chữ ký chính xác
        $rawHash = "accessKey=$accessKey&amount=$amount&extraData=$extraData&ipnUrl=$notifyUrl&orderId=$uniqueOrderId&orderInfo=$orderInfo&partnerCode=$partnerCode&redirectUrl=$returnUrl&requestId=$requestId&requestType=$requestType";

        $signature = hash_hmac("sha256", $rawHash, $secretKey);

        $data = [
            "partnerCode" => $partnerCode,
            "partnerName" => "MoMo",
            "storeId" => "MomoStore",
            "requestId" => $requestId,
            "amount" => $amount,
            "orderId" => $uniqueOrderId,
            "orderInfo" => $orderInfo,
            "redirectUrl" => $returnUrl,
            "ipnUrl" => $notifyUrl,
            "lang" => "vi",
            "extraData" => $extraData,
            "requestType" => $requestType,
            "signature" => $signature
        ];

        Log::info('MoMo Request Data: ', $data);

        $response = Http::withHeaders([
            'Content-Type' => 'application/json'
        ])->post($endpoint, $data)->json();

        if (isset($response['payUrl'])) {
            return $response['payUrl'];
        }

        Log::info('MoMo API Response: ', $response);

        if (isset($response['resultCode']) && $response['resultCode'] == 0) {
            return $response['payUrl'] ?? null;
        }

        return null;
    }
    public static function refundPayment($orderId, $amount, $refundInfo = 'Hoàn tiền đơn hàng', $extraData = '', $transId=4406559464)
    {
        \Log::info('MoMo Refund Payment:', [
            'orderId' => $orderId,
            'amount' => $amount,
            'refundInfo' => $refundInfo,
            'extraData' => $extraData,
            'transId' => $transId
        ]);
    
        $endpoint = env('MOMO_REFUND_ENDPOINT', 'https://test-payment.momo.vn/v2/gateway/api/refund');
        $partnerCode = env('MOMO_PARTNER_CODE', 'MOMOBKUN20180529');
        $accessKey = env('MOMO_ACCESS_KEY', 'klm05TvNBzhg7h7j');
        $secretKey = env('MOMO_SECRET_KEY', 'at67qH6mk8w5Y1nAyMoYKMWACiEi2bsa');
        $returnUrl = env('MOMO_RETURN_URL', 'http://127.0.0.1:8000/api/momo/callback');
        $notifyUrl = env('MOMO_NOTIFY_URL', 'https://your-website.com/momo/notify');
    
        // Ép kiểu đúng yêu cầu MoMo
        $orderId = (string) $orderId;
        $amount = (int) $amount;
        $requestId = time() . "";
    
        $extraData = is_array($extraData) ? json_encode($extraData) : $extraData;
        $requestType = "refund";
    
        // Tạo chuỗi chữ ký chính xác theo yêu cầu của MoMo
        // Đảm bảo rằng tất cả các tham số đều có mặt
        $rawHash = "accessKey=$accessKey&amount=$amount&description=$refundInfo&orderId=$orderId&partnerCode=$partnerCode&requestId=$requestId&transId=$transId&lang=vi";
    
        // Tạo chữ ký HMAC_SHA256
        $signature = hash_hmac("sha256", $rawHash, $secretKey);
    
        // Dữ liệu gửi đi
        $data = [
            "partnerCode" => $partnerCode,
            "partnerName" => "MoMo",
            "storeId" => "MomoStore",
            "requestId" => $requestId,
            "amount" => $amount,
            "orderId" => $orderId,
            "orderInfo" => $refundInfo,
            "ipnUrl" => $notifyUrl,
            "lang" => "vi",
            "extraData" => $extraData,
            "requestType" => $requestType,
            "signature" => $signature,
            "transId" => $transId // Cung cấp mã giao dịch MoMo
        ];
    
        \Log::info('MoMo Refund Request Data: ', $data);
    
        // Gửi yêu cầu
        $response = Http::withHeaders([
            'Content-Type' => 'application/json'
        ])->post($endpoint, $data)->json();
    
        \Log::info('MoMo Refund API Response: ', $response);
    
        if (isset($response['resultCode']) && $response['resultCode'] == 0) {
            return $response['refundUrl'] ?? null;
        }
    
        return null;
    }
    


}
