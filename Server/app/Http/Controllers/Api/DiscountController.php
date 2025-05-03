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
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;

class DiscountController
{
    use AuthorizesRequests;
    public function index(Request $request)
    {
        $this->authorize('viewAny', Discount::class);
        try {
            $discounts = Discount::with('products')
                ->orderBy('created_at', 'desc')
                ->paginate(10);

            return response()->json($discounts);

        } catch (\Throwable $th) {

            return response()->json(['message' => $th->getMessage()], 500);
        }
    }

    public function fetchDiscount(Request $request)
    {
        $discounts = Discount::where('is_global', 1)
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
        \Log::info('Apply Discount Request:', $request->all());
    
        $data = [
            'discount_code' => $request->discountCode,
            'total_amount' => $request->totalAmount,
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
        \Log::info('Validated Data:', $data);
    
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
    
        // if ($discount->is_redeemable) {
        //     $redeemed = PointRedemption::where('user_id', $user->id)
        //         ->where('discount_id', $discount->id)
        //         ->exists();
        //     if (!$redeemed) {
        //         return response()->json(['message' => __('messages.not_redeemed')], 400);
        //     }
        // }
    
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
    
        $totalAmount = (float)$totalAmount;
        $minOrderAmount = (float)$discount->min_order_amount;
    
        if ($totalAmount < $minOrderAmount) {
            return response()->json([
                'message' => __('messages.min_order_amount', [
                    'amount' => number_format($discount->min_order_amount)
                ])
            ], 400);
        }
    
        $cartData = $request->input('selectedItems', []);
        $discountedProducts = $discount->products->pluck('id')->toArray();
        \Log::info('Mã giảm giá áp dụng cho các sản phẩm ID:', $discountedProducts);
    
        $validCartItems = collect($cartData)->filter(function ($item) use ($discountedProducts) {
            return empty($discountedProducts) || in_array($item['product']['id'], $discountedProducts);
        });
        \Log::info('Valid Cart Items:', $validCartItems->toArray());
    
        if ($discount->products->count() > 0 && $validCartItems->isEmpty()) {
            return response()->json([
                'message' => __('messages.cart_product_not_eligible')
            ], 400);
        }
    
        $totalValidAmount = $validCartItems->sum(fn($item) => ($item['price'] - ($item['sale_price'] ?? 0)) * $item['quantity']);
        \Log::info('Total Valid Amount:', ['totalValidAmount' => $totalValidAmount]);
    
        $totalDiscount = 0;
        if ($discount->discount_type === 'percentage') {
            foreach ($validCartItems as $item) {
                $productPrice = ($item['price'] - ($item['sale_price'] ?? 0)) * $item['quantity'];
                $discountAmount = ($productPrice * $discount->value) / 100;
                $totalDiscount += $discountAmount;
            }
        } else {
          
            $totalDiscount = min($discount->value, $totalValidAmount);
        }
        
    
        if ($discount->max_discount !== null) {
            $totalDiscount = min($totalDiscount, $discount->max_discount);
        }
    
        $totalDiscount = min($totalDiscount, $totalValidAmount);
    
        $newTotalAmount = max(0, $totalAmount - $totalDiscount);
    
        // Ghi mã giảm giá đã sử dụng (bỏ comment khi cần)
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
        $this->authorize('create', Discount::class);
        try {
            if (!$request->has('code')) {
                return response()->json(['message' => "Code" . __('messages.required_field')], 400);
            }

            // Validate dữ liệu
            $validated = $request->validate([
                'name' => 'required|string|max:255|unique:discounts,name',
                'code' => 'string|max:50|unique:discounts,code',
                'discount_type' => 'required|in:percentage,fixed',
                'value' => 'required|numeric|min:1',
                'max_discount' => 'nullable|numeric|min:0',
                'min_order_amount' => 'nullable|numeric|min:0',
                'max_uses' => 'nullable|integer|min:1',
                'start_date' => 'required|date', // Chấp nhận định dạng ISO 8601
                'end_date' => 'required|date|after_or_equal:start_date',
                'is_global' => 'required|boolean',
                'required_ranking' => 'nullable|in:bronze,silver,gold,platinum',
                'is_first_order' => 'nullable|boolean',
                'is_redeemable' => 'nullable|boolean',
                'can_be_redeemed_with_points' => 'nullable|integer|min:0',
                'product_ids' => 'nullable|array',
                'product_ids.*' => 'exists:products,id',
            ]);

            // Kiểm tra giá trị giảm giá
            if ($validated['discount_type'] === 'percentage' && $validated['value'] > 100) {
                throw ValidationException::withMessages([
                    'value' => __('messages.percentage_value_exceeded'),
                ]);
            }

            if ($validated['discount_type'] === 'fixed' && $validated['value'] < 0) {
                throw ValidationException::withMessages([
                    'value' => __('messages.fixed_value_invalid'),
                ]);
            }

            if (!$validated['is_global'] && empty($validated['required_ranking'])) {
                throw ValidationException::withMessages([
                    'required_ranking' => __('messages.required_ranking'),
                ]);
            }

            // Chuẩn bị dữ liệu để tạo Discount
            $discountData = [
                'name' => $validated['name'],
                'code' => $validated['code'],
                'discount_type' => $validated['discount_type'],
                'value' => $validated['value'],
                'start_date' => Carbon::parse($validated['start_date'])->format('Y-m-d H:i:s'),
                'end_date' => Carbon::parse($validated['end_date'])->format('Y-m-d H:i:s'),
                'max_uses' => $validated['max_uses'] ?? null,
                'is_global' => $validated['is_global'],
                'required_ranking' => $validated['required_ranking'] ?? null,
                'is_first_order' => $validated['is_first_order'] ?? false,
                'is_redeemable' => $validated['is_redeemable'] ?? false,
                'can_be_redeemed_with_points' => $validated['can_be_redeemed_with_points'] ?? null,
                'max_discount' => $validated['max_discount'] ?? null,
                'min_order_amount' => $validated['min_order_amount'] ?? null,
                'active' => true,
                'used_count' => 0,
            ];

            // Tạo Discount
            $discount = Discount::create($discountData);

            // Gắn sản phẩm nếu có
            if (!empty($validated['product_ids'])) {
                $discount->products()->sync($validated['product_ids']);
            }

            // Tạo thông báo
            $notification = Notification::create([
                'title' => __('messages.new_discount_title') . $discount->name,
                'message' => __('messages.new_discount_message') . $discount->name,
                'type' => 'discount',
            ]);

            // Gửi thông báo cho tất cả user
            $userIds = User::pluck('id')->toArray();
            if (!empty($userIds)) {
                $data = array_map(fn($id) => [
                    'user_id' => $id,
                    'notification_id' => $notification->id,
                    'status' => 'unread',
                    'deleted' => false,
                ], $userIds);

                \DB::table('notification_user')->insert($data);
            }

            $mess = Notification::find($notification->id);

            event(new NewNotificationEvent($mess));

            return response()->json([
                'message' => __('messages.created'),
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
           // $this->authorize('update', $discount);
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
            $discountData = [
                'name' => $validated['name'],
                'code' => $validated['code'],
                'discount_type' => $validated['discount_type'],
                'value' => $validated['value'],
                'start_date' => Carbon::parse($validated['start_date'])->format('Y-m-d H:i:s'),
                'end_date' => Carbon::parse($validated['end_date'])->format('Y-m-d H:i:s'),
                'max_uses' => $validated['max_uses'] ?? null,
                'is_global' => $validated['is_global'],
                'required_ranking' => $validated['required_ranking'] ?? null,
                'is_first_order' => $validated['is_first_order'] ?? false,
                'is_redeemable' => $validated['is_redeemable'] ?? false,
                'can_be_redeemed_with_points' => $validated['can_be_redeemed_with_points'] ?? null,
                'max_discount' => $validated['max_discount'] ?? null,
                'min_order_amount' => $validated['min_order_amount'] ?? null,
                'active' => true,
                'used_count' => 0,
            ];
            $discount->update($discountData);

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
        $this->authorize('delete', $discount);
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
    public function updateStatus(Request $request, $id)
    {

        \Log::info($request->all());
        $validator = Validator::make($request->all(), [
            'status' => 'required|boolean'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 400);
        }

        $discount = Discount::find($id);

        $this->authorize('update', $discount);

        if (!$discount) {
            return response()->json(['message' => __('messages.not_found')], 404);
        }

        $discount->active = $request->status;
        $discount->save();

        return response()->json([
            'message' => __('messages.updated'),
            'discount' => $discount,
        ]);
    }
}
