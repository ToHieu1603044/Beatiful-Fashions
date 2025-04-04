<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;

class GHNService
{
    protected $token;

    public function __construct()
    {
        $this->token = config('services.ghn.token');
        $this->shopId = config('services.ghn.shop_id');
    }

    public function getProvinces()
    {
        return Http::withHeaders([
            'Token' => $this->token
        ])->get('https://online-gateway.ghn.vn/shiip/public-api/master-data/province')
          ->json()['data'];
    }

    public function getDistricts($provinceId)
    {
        return Http::withHeaders([
            'Token' => $this->token
        ])->post('https://online-gateway.ghn.vn/shiip/public-api/master-data/district', [
            'province_id' => $provinceId
        ])->json()['data'];
    }

    public function getWards($districtId)
    {
        return Http::withHeaders([
            'Token' => $this->token
        ])->get('https://online-gateway.ghn.vn/shiip/public-api/master-data/ward', [
            'district_id' => $districtId
        ])->json()['data'];
    }

    public function calculateFee(array $data)
{
    $response = Http::withHeaders([
        'Token' => $this->token,
        'ShopId' => $this->shopId,
        'Content-Type' => 'application/json'
    ])->post('https://online-gateway.ghn.vn/shiip/public-api/v2/shipping-order/fee', $data);

    return $response->json();
}
}
