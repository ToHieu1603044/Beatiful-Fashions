<?php

namespace App\Http\Controllers\Api;

use App\Events\NewNotificationEvent;
use App\Helpers\ApiResponse;
use App\Models\Discount;
use App\Models\DiscountUsage;
use App\Models\Notification;
use App\Models\Order;
use App\Models\PointRedemption;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;

class DiscountController
{
    public function index(Request $request)
    {
        try {
            $discounts = Discount::with('products')
                ->where('is_redeemable', false)
                ->orderBy('created_at', 'desc')
                ->paginate(10);

            return response()->json($discounts);

        } catch (\Throwable $th) {

            return response()->json(['message' => $th->getMessage()], 500);
        }
    }

    public function fetchDiscount(Request $request)
    {
        $discounts = Discount::select('id', 'name', 'code', 'discount_type', 'value', 'max_discount', 'min_order_amount', 'max_uses', 'start_date', 'end_date', 'is_global', 'is_redeemable', 'can_be_redeemed_with_points')
            ->where('is_global', 1)
            ->where('active', 1)
            ->where('start_date', '<=', Carbon::now())
            ->where('end_date', '>=', Carbon::now())
            ->with(['products:id,name'])
            ->get();

        return response()->json($discounts);
    }
    public function redeemPoints(Request $request)
    {
        try {
            $discounts = Discount::with('products')
                ->where('is_redeemable', true)
                ->get();

            return response()->json(['data' => $discounts], 200);

        } catch (\Throwable $th) {

            return response()->json(['message' => $th->getMessage()], 500);
        }
    }
    public function listDiscountForUser(Request $request)
    {
        try {
            $user = Auth::user();

            $discounts = Discount::with('products')
                ->where('user_id', $user->id)
                ->get();

            return response()->json(['data' => $discounts], 200);

        } catch (\Throwable $th) {

            return response()->json(['message' => $th->getMessage()], 500);
        }
    }

    public function applyDiscount(Request $request)
    {
        \Log::info($request->all());

        $data = [
            'discount_code' => $request->input('discountCode'),
            'total_amount' => $request->input('totalAmount'),
        ];

        $validator = Validator::make($data, [

            'discount_code' => 'required|string|exists:discounts,code',
            'total_amount' => 'required|numeric|min:0',
        ]);

        if ($validator->fails()) {
            return response()->json(['message' => $validator->errors()->first()], 400);
        }

        $discountCode = $data['discount_code'];
        $totalAmount = $data['total_amount'];

        $user = Auth::user();

        $discount = Discount::where('code', $discountCode)
            ->where('active', true)
            ->where(function ($query) use ($user) {
                $query->whereNull('user_id')
                    ->orWhere('user_id', $user->id);
            })
            ->first();


        if (!$discount) {
            return response()->json(['message' => __('discount.not_found_or_disabled')], 404);

        }
        if ($discount->is_first_order) {
            $hasOrder = Order::where('user_id', auth()->id())->exists();
            if ($hasOrder) {
                return response()->json(['message' => __('discount.only_for_new_customers')], 403);
            }
        }

        $currentDate = now();
        if ($currentDate < $discount->start_date || $currentDate > $discount->end_date) {
            return response()->json(['message' => __('discount.expired')], 400);

        }
        $rankingLevels = [
            'bronze' => 1,
            'silver' => 2,
            'gold' => 3,
            'platinum' => 4,
        ];


        if (
            $discount->required_ranking &&
            isset($rankingLevels[$discount->required_ranking]) &&
            $user->ranking < $rankingLevels[$discount->required_ranking]
        ) {
            return response()->json(['message' => __('messages.insufficient_ranking')], 400);

        }


        if ($discount->is_redeemable) {
            $redeemed = PointRedemption::where('user_id', $user->id)
                ->where('discount_id', $discount->id)
                ->exists();

            if (!$redeemed) {
                return response()->json(['message' => __('messages.not_redeemed')], 400);
            }
        }

        $used = DiscountUsage::where('user_id', $user->id)
            ->where('discount_id', $discount->id)
            ->exists();

        if ($used) {
            return response()->json(['message' => __('messages.already_used')], 422);
        }

        if ($discount->max_uses !== null && $discount->max_uses === 0) {
            return response()->json(['message' => __('messages.no_longer_available')], 400);
        }

        if ($discount->max_uses !== null && $discount->used_count >= $discount->max_uses) {
            return response()->json(['message' => __('messages.usage_limit_reached')], 400);
        }

        if ($totalAmount < $discount->min_order_amount) {
            return response()->json([
                'message' => __('messages.min_order_amount', [
                    'amount' => number_format($discount->min_order_amount)
                ])
            ], 400);
        }

        $cartData = $request->input('selectedItems');
        $discountedProducts = $discount->products->pluck('id')->toArray();
        \Log::info('Mã giảm giá áp dụng cho các sản phẩm ID:', $discountedProducts);

        $validCartItems = collect($cartData)->filter(function ($item) use ($discountedProducts) {
            return empty($discountedProducts) || in_array($item['product']['id'], $discountedProducts);
        });
        \Log::info(['validCartItems' => $validCartItems]);

        if ($discount->products->count() > 0 && $validCartItems->isEmpty()) {
            return response()->json([
                'message' => __('messages.cart_product_not_eligible')
            ], 400);
        }

        $totalValidAmount = $validCartItems->sum(fn($item) => $item['price'] * $item['quantity']);

        return response()->json([
            'message' => __('messages.min_order_amount', [
                'amount' => number_format($discount->min_order_amount)
            ])
        ], 400);

        $totalDiscount = 0;
        foreach ($validCartItems as $item) {
            $productPrice = $item['price'] * $item['quantity'];

            if ($discount->discount_type === 'percentage') {
                $discountAmount = ($productPrice * $discount->value) / 100;
            } else {
                $discountAmount = min($discount->value, $productPrice);
            }

            $totalDiscount += $discountAmount;
        }

        if ($discount->max_discount !== null) {
            $totalDiscount = min($totalDiscount, $discount->max_discount);
        }

        $totalDiscount = min($totalDiscount, $totalValidAmount);

        // Tính toán tổng tiền mới
        $newTotalAmount = max(0, $totalAmount - $totalDiscount);

        //  Ghi  mã giảm giá đã sử dụng
        // DiscountUsage::create([
        //     'user_id' => $user->id,
        //     'discount_id' => $discount->id,
        // ]);

        // $discount->increment('used_count');

        return response()->json([
            'success' => true,
            'newTotalAmount' => $newTotalAmount,
            'discountAmount' => $totalDiscount,
            'message' => __('messages.applied_successfully'),
        ]);
    }


    public function store(Request $request)
    {
        \Log::info($request->all());
        try {
            if (!$request->has('code')) {
                return response()->json(['message' => "Code".__('messages.required_field')], 400);
            }
            $validated = $request->validate([
                'name' => 'required|string|max:255|unique:discounts,name',
                'code' => 'string|max:50|unique:discounts,code',
                'discount_type' => 'required|in:percentage,fixed',
                'value' => 'required|numeric|min:1',
                'max_discount' => 'nullable|numeric|min:0',
                'min_order_amount' => 'nullable|numeric|min:0',
                'max_uses' => 'nullable|integer|min:1',
                'start_date' => 'required|date',
                'end_date' => 'required|date|after_or_equal:start_date',
                'is_global' => 'required|boolean',
                'required_ranking' => 'nullable|integer|min:1',
                'is_first_order' => 'nullable|boolean',
                'products.*.id' => 'exists:products,id',
                'required_ranking' => 'nullable|in:bronze,silver,gold,platinum',
                'is_redeemable' => 'nullable|boolean',
                'can_be_redeemed_with_points' => 'nullable|integer',
            ]);

            $startDate = Carbon::parse($request->start_date);
            $endDate = Carbon::parse($request->end_date);

            if ($request->discount_type == 'percentage' && $request->value > 100) {
                throw ValidationException::withMessages([
                    'value' => __('messages.percentage_value_exceeded'),
                ]);
            }

            if ($request->discount_type == 'fixed' && $request->value < 0) {
                throw ValidationException::withMessages([
                    'value' => __('messages.fixed_value_invalid'),
                ]);
            }

            if (!$validated['is_global'] && empty($validated['required_ranking'])) {
                throw ValidationException::withMessages([
                    'required_ranking' =>__('messages.required_ranking'),
                ]);
            }


            $discount = Discount::create($validated);

            if (!empty($request->product_ids)) {
                $discount->products()->sync($request->product_ids);
            }
            // Tạo thông báo
            $notification = Notification::create([
                'title' => __('messages.new_discount_title'). $discount->name,
                'message' => __('messages.new_discount_message'). $discount->name,
                'type' => 'discount',
                // 'status' => 'unread',
            ]);

            $userIds = User::pluck('id')->toArray();
            if (!empty($userIds)) {
                $data = array_map(fn($id) => [
                    'user_id' => $id,
                    'notification_id' => $notification->id,
                    'status' => 'unread',
                    'deleted' => false
                ], $userIds);

                \DB::table('notification_user')->insert($data);
            }

            $mess = Notification::find($notification->id)->first();

            // Phát sự kiện realtime
            event(new NewNotificationEvent($mess));

            return response()->json([
                'message' => __('messages.created'),
                'discount' => $discount,
            ], 201);
        } catch (\Throwable $th) {
            return ApiResponse::errorResponse(500, $th->getMessage());
        }
    }

    public function show(string $id)
    {
        //
    }

    public function update(Request $request, $id)
    {
        \Log::info($request->all());

        try {
            $discount = Discount::findOrFail($id);

            $validated = $request->validate([
                'name' => 'required|string|max:255|unique:discounts,name,' . $id,
                'code' => 'required|string|max:50|unique:discounts,code,' . $id,
                'discount_type' => 'required|in:percentage,fixed',
                'value' => 'required|numeric|min:1',
                'max_discount' => 'nullable|numeric|min:0',
                'min_order_amount' => 'nullable|numeric|min:0',
                'max_uses' => 'nullable|integer|min:1',
                'start_date' => 'required|date',
                'end_date' => 'required|date|after_or_equal:start_date',
                'is_global' => 'required|boolean',
                'required_ranking' => 'nullable|in:bronze,silver,gold,platinum',
                'is_first_order' => 'nullable|boolean',
                'products.*.id' => 'exists:products,id',
                'is_redeemable' => 'nullable|boolean',
                'can_be_redeemed_with_points' => 'nullable|integer',
            ]);

            if ($request->discount_type === 'percentage' && $request->value > 100) {
                throw ValidationException::withMessages([
                    'value' => __('messages.percentage_value_exceeded'),
                ]);
            }

            if ($request->discount_type === 'fixed' && $request->value < 0) {
                throw ValidationException::withMessages([
                    'value' => __('messages.fixed_value_invalid'),
                ]);
            }

            if (!$validated['is_global'] && empty($validated['required_ranking'])) {
                throw ValidationException::withMessages([
                    'required_ranking' => __('messages.required_ranking'),
                ]);
            }

            $discount->update($validated);

            // Nếu có product_ids thì sync lại bảng pivot
            if (!empty($request->product_ids)) {
                $discount->products()->sync($request->product_ids);
            }

            // Tạo thông báo cập nhật
            $notification = Notification::create([
                'title' => 'Cập nhật mã giảm giá: ' . $discount->name,
                'message' => __('messages.updated'),
                'type' => 'discount',
            ]);

            $userIds = User::pluck('id')->toArray();
            if (!empty($userIds)) {
                $data = array_map(fn($id) => [
                    'user_id' => $id,
                    'notification_id' => $notification->id,
                    'status' => 'unread',
                    'deleted' => false
                ], $userIds);

                \DB::table('notification_user')->insert($data);
            }

            // Phát sự kiện realtime
            event(new NewNotificationEvent($notification));

            return response()->json([
                'message' => __('messages.updated'),
                'discount' => $discount,
            ], 200);

        } catch (\Throwable $th) {
            return ApiResponse::errorResponse(500, $th->getMessage());
        }
    }

    public function destroy($id)
    {
        $discount = Discount::findOrFail($id);

        $discount->delete();

        return response()->json([
            'message' => __('messages.deleted')
        ]);
    }
    public function redeemPointsForVoucher(Request $request)
    {
        $request->validate([
            'discount_id' => 'required|exists:discounts,id',
        ]);

        $user = Auth::user();
        $discount = Discount::findOrFail($request->discount_id);

        if ($discount->is_redeemable == false) {
            return response()->json([
                'message' => __('messages.not_redeemable')
            ], 400);
        }

        $requiredPoints = $discount->can_be_redeemed_with_points;

        if ($user->points < $requiredPoints) {
            return response()->json([
                'message' => __('messages.insufficient_points')
            ], 400);
        }

        $user->decrement('points', $discount->can_be_redeemed_with_points);

        $discountCode = strtoupper(\Str::random(8)); 

       
        $newDiscount = Discount::create([
            'name' => "Voucher từ điểm",
            'code' => $discountCode,
            'discount_type' => $discount->discount_type,
            'value' => $discount->value, // Giảm giá là phần trăm theo mã gốc
            'max_discount' => $discount->max_discount, // Lấy max_discount từ mã đã chọn
            'min_order_amount' => $discount->min_order_amount, // Lấy min_order_amount từ mã đã chọn
            'used_count' => 0,
            'max_uses' => 1,
            'start_date' => now(),
            'end_date' => now()->addDays(30),
            'active' => true,
            'is_global' => false,
            'required_ranking' => $discount->required_ranking, // Lấy required_ranking từ mã gốc
            'can_be_redeemed_with_points' => false, // Mã giảm giá này có thể đổi bằng điểm
            'user_id' => $user->id
        ]);

        PointRedemption::create([
            'user_id' => $user->id,
            'discount_id' => $newDiscount->id,
            'points_used' => $requiredPoints,
        ]);

        return response()->json([
            'message' => __('messages.redeem_success', ['points' => $requiredPoints]),
            'remaining_points' => $user->points,
            'discount_code' => $discountCode
        ]);
    }
    public function updateStatus(Request $request, $id){

        \Log::info($request->all());
        $validator = Validator::make($request->all(), [
            'status' => 'required|boolean'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 400);
        }

        $discount = Discount::find($id);
        if (!$discount) {
            return response()->json(['message' =>__('messages.not_found')], 404);
        }

        $discount->active = $request->status;
        $discount->save();

        return response()->json([
            'message' => __('messages.updated'),
            'discount' => $discount,
        ]);
    }
}
