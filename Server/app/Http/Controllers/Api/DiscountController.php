<?php

namespace App\Http\Controllers\Api;

use App\Models\Discount;
use Illuminate\Http\Request;

class DiscountController
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $discounts = Discount::all();
        return response()->json(['data' => $discounts], 200);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function applyDiscount(Request $request)
    {
        
        $request->validate([
            'discountCode' => 'required|string',
            'totalAmount' => 'required|numeric|min:0',
        ]);

        $discountCode = $request->input('discountCode');
        $totalAmount = $request->input('totalAmount');

        $discount = Discount::where('code', $discountCode)
            ->where('active', true)
            ->first();

        if (!$discount) {
            return response()->json(['message' => 'Mã giảm giá không tồn tại hoặc đã bị vô hiệu hóa.'], 404);
        }

        $currentDate = now();
        
        if ($currentDate < $discount->start_date || $currentDate > $discount->end_date) {
            return response()->json(['message' => 'Mã giảm giá không còn hiệu lực.'], 400);
        }

        if ($totalAmount < $discount->min_order_amount) {
            return response()->json(['message' => 'Đơn hàng của bạn phải tối thiểu ' . $discount->min_order_amount . ' VNĐ để áp dụng mã giảm giá.'], 400);
        }

        $discountAmount = ($totalAmount * $discount->value) / 100;

        if ($discountAmount > $discount->max_discount) {
            $discountAmount = $discount->max_discount;
        }

        $newTotalAmount = $totalAmount - $discountAmount;

        return response()->json([
            'success' => true,
            'newTotalAmount' => $newTotalAmount,
            'discountAmount' => $discountAmount,
            'message' => 'Mã giảm giá đã được áp dụng thành công.'
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }
}
