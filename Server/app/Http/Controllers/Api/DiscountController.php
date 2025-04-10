<?php

namespace App\Http\Controllers\Api;

use App\Events\NewNotificationEvent;
use App\Helpers\ApiResponse;
use App\Models\Discount;
use App\Models\DiscountUsage;
use App\Models\Notification;
use App\Models\PointRedemption;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;

class DiscountController
{


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
    public function listDiscountForUser(Request $request){
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
            return response()->json(['message' => 'Mã giảm giá không tồn tại hoặc đã bị vô hiệu hóa.'], 404);
        }

        $currentDate = now();
        if ($currentDate < $discount->start_date || $currentDate > $discount->end_date) {
            return response()->json(['message' => 'Mã giảm giá không còn hiệu lực.'], 400);
        }

        if ($discount->required_ranking && $user->ranking !== null) {
            $rankOrder = ['bronze' => 1, 'silver' => 2, 'gold' => 3, 'platinum' => 4];
            if ($rankOrder[$user->ranking] < $discount->required_ranking) {
                return response()->json(['message' => 'Bạn không đủ hạng để sử dụng mã giảm giá này.'], 403);
            }
        }

        if ($discount->is_redeemable) {
            $redeemed = PointRedemption::where('user_id', $user->id)
                ->where('discount_id', $discount->id)
                ->exists();

            if (!$redeemed) {
                return response()->json(['message' => 'Bạn chưa đổi điểm để sử dụng mã giảm giá này.'], 400);
            }
        }

        $used = DiscountUsage::where('user_id', $user->id)
            ->where('discount_id', $discount->id)
            ->exists();

        if ($used) {
            return response()->json(['message' => 'Bạn đã sử dụng mã giảm giá này trước đó.'], 422);
        }

        if ($discount->max_uses !== null && $discount->max_uses === 0) {
            return response()->json(['message' => 'Mã giảm giá này không còn khả dụng.'], 400);
        }

        if ($discount->max_uses !== null && $discount->used_count >= $discount->max_uses) {
            return response()->json(['message' => 'Mã giảm giá này đã hết lượt sử dụng.'], 400);
        }

        if ($totalAmount < $discount->min_order_amount) {
            return response()->json(['message' => 'Đơn hàng của bạn phải tối thiểu ' . number_format($discount->min_order_amount) . ' VNĐ để áp dụng mã giảm giá.'], 400);
        }

        $cartData = $request->input('cartData', []);
        $discountedProducts = $discount->products->pluck('id')->toArray();

        $validCartItems = collect($cartData)->filter(function ($item) use ($discountedProducts) {
            return in_array($item['product']['id'], $discountedProducts);
        });

        if ($discount->products->count() > 0 && $validCartItems->isEmpty()) {
            return response()->json([
                'message' => 'Mã giảm giá không áp dụng cho sản phẩm trong giỏ hàng của bạn.'
            ], 400);
        }

        $totalValidAmount = $validCartItems->sum(fn($item) => $item['price'] * $item['quantity']);

        if ($totalValidAmount < $discount->min_order_amount) {
            return response()->json([
                'message' => 'Đơn hàng của bạn phải tối thiểu ' . number_format($discount->min_order_amount) . ' VNĐ để áp dụng mã giảm giá.'
            ], 400);
        }

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
            'message' => 'Mã giảm giá đã được áp dụng thành công.',
        ]);
    }

    public function store(Request $request)
    {
        \Log::info($request->all());
        try {
            if (!$request->has('code')) {
                return response()->json(['message' => 'The discount code field is required.'], 400);
            }
            $validated = $request->validate([
                'name' => 'required|string|max:255',
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
                'is_redeemable' => 'required|boolean',
                'can_be_redeemed_with_points' => 'nullable|integer',
            ]);
            $startDate = Carbon::parse($request->start_date);
            $endDate = Carbon::parse($request->end_date);

            if ($request->discount_type == 'percentage' && $request->value > 100) {
                throw ValidationException::withMessages([
                    'value' => 'Giá trị phần trăm không thể lớn hơn 100%.',
                ]);
            }

            if ($request->discount_type == 'fixed' && $request->value < 0) {
                throw ValidationException::withMessages([
                    'value' => 'Giá trị tiền khóa phải lớn hơn 0.',
                ]);
            }

            if (!$validated['is_global'] && empty($validated['required_ranking'])) {
                throw ValidationException::withMessages([
                    'required_ranking' => 'Vui lòng nhập mức ranking tối thiểu để sử dụng mã này.',
                ]);
            }


            $discount = Discount::create($validated);

            if (!empty($request->product_ids)) {
                $discount->products()->sync($request->product_ids);
            }
            // Tạo thông báo
            $notification = Notification::create([
                'title' => 'Mã giảm giá mới: ' . $discount->name,
                'message' => 'Mã giảm giá ' . $discount->code . ' vừa được thêm. Hãy kiểm tra ngay!',
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
                'message' => 'Tạo mã giảm giá thành công!',
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

    public function update(Request $request, string $id)
    {
        //
    }

    public function destroy(string $id)
    {
        $discount = Discount::firstOrFail($id);

        $discount->delete();

        return response()->json([
            'message' => 'Delete success'
        ]);
    }
    public function redeemPointsForVoucher(Request $request)
    {
        $request->validate([
            'discount_id' => 'required|exists:discounts,id', // Mã giảm giá cần đổi
        ]);

        $user = Auth::user();
        $discount = Discount::findOrFail($request->discount_id);

        // Kiểm tra xem mã giảm giá này có thể đổi bằng điểm không
        if ($discount->is_redeemable == false) {
            return response()->json(['message' => 'Mã giảm giá này không thể đổi bằng điểm.'], 400);
        }

        // Tính số điểm cần thiết để đổi mã giảm giá
        $requiredPoints = $discount->value * 5; // Ví dụ, 1% giảm giá = 5 điểm

        // Kiểm tra nếu người dùng đủ điểm
        if ($user->points < $requiredPoints) {
            return response()->json(['message' => 'Bạn không đủ điểm để đổi mã giảm giá này.'], 400);
        }

        // Trừ điểm của người dùng
        $user->decrement('points', $discount->can_be_redeemed_with_points);

        // Tạo mã giảm giá mới và lưu vào bảng discount
        $discountCode = strtoupper(\Str::random(8)); // Tạo mã giảm giá ngẫu nhiên

        // Lưu thông tin mã giảm giá vào bảng discount, sử dụng các giá trị từ mã đã chọn
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
            'message' => 'Bạn đã đổi thành công ' . $requiredPoints . ' điểm lấy mã giảm giá.',
            'remaining_points' => $user->points,
            'discount_code' => $discountCode
        ]);
    }
}
