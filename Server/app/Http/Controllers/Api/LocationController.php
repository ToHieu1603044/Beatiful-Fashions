<?php

namespace App\Http\Controllers\Api;

use App\Services\GHNService;
use Illuminate\Http\Request;

class LocationController extends Controller
{
    protected $ghn;

    public function __construct(GHNService $ghn)
    {
        $this->ghn = $ghn;
    }

    public function provinces()
    {
        return response()->json($this->ghn->getProvinces());
    }

    public function districts(Request $request)
    {
        $provinceId = $request->input('province_id');
        return response()->json($this->ghn->getDistricts($provinceId));
    }

    public function wards(Request $request)
    {
        $districtId = $request->input('district_id');
        return response()->json($this->ghn->getWards($districtId));
    }

public function calculateShippingFee(Request $request)
{
    $data = $request->validate([
        'from_district_id' => 'required|integer',
        'service_id' => 'required|integer',
        'to_district_id' => 'required|integer',
        'to_ward_code' => 'required|string',
        'height' => 'required|integer',
        'length' => 'required|integer',
        'weight' => 'required|integer',
        'width' => 'required|integer',
        'insurance_value' => 'required|integer',
    ]);

    $fee = $this->ghn->calculateFee($data);

    return response()->json($fee);
}

}
