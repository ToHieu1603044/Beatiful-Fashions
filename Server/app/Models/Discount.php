<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Discount extends Model
{
    use HasFactory;

    protected $table = 'discounts';

    protected $fillable = [
        'name',
        'code',
        'discount_type', // percentage, fixed
        'value', // Giá trị giảm
        'max_discount', // Giảm tối đa nếu là phần trăm
        'min_order_amount', // Đơn hàng tối thiểu
        'start_date',
        'end_date',
        'active',
        'used_count',
        'max_uses',
        'is_redeemed',
        'can_be_redeemed_with_points',
        'is_global',
        'user_id',
        'required_ranking',
    ];

    protected $casts = [
        'start_date' => 'datetime',
        'end_date' => 'datetime',
        'active' => 'boolean',
    ];

    public function user(){
        return $this->belongsTo(User::class);
    }
    public function products()
    {
        return $this->belongsToMany(Product::class, 'discount_product');
    }
    

    // /**
    //  * Kiểm tra xem mã giảm giá có hợp lệ hay không.
    //  */
    // public function isValid()
    // {
    //     return $this->active &&
    //         ($this->max_uses === null || $this->used_count < $this->max_uses) &&
    //         now()->between($this->start_date, $this->end_date);
    // }

    // /**
    //  * Áp dụng mã giảm giá cho tổng tiền đơn hàng.
    //  */
    // public function applyDiscount($totalAmount)
    // {
    //     if (!$this->isValid()) {
    //         return [
    //             'success' => false,
    //             'message' => 'Mã giảm giá không hợp lệ hoặc đã hết hạn.',
    //         ];
    //     }

    //     if ($totalAmount < $this->min_order_amount) {
    //         return [
    //             'success' => false,
    //             'message' => "Đơn hàng chưa đủ điều kiện để áp dụng mã giảm giá.",
    //         ];
    //     }

    //     if ($this->discount_type === 'fixed') {
    //         $discountAmount = min($this->value, $totalAmount);
    //     } else { // percentage
    //         $discountAmount = min($totalAmount * ($this->value / 100), $this->max_discount ?? $totalAmount);
    //     }

    //     return [
    //         'success' => true,
    //         'discount_amount' => $discountAmount,
    //         'total_after_discount' => $totalAmount - $discountAmount,
    //     ];
    // }
}
