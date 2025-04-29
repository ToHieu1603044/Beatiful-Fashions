<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Discount extends Model
{
    use HasFactory;

    protected $table = 'discounts';

    protected $casts = [
        'is_global' => 'boolean',
        'is_first_order' => 'boolean',
        'is_redeemable' => 'boolean',
        'active' => 'boolean',
    ];

    protected $fillable = [
        'name',
        'code',
        'discount_type',
        'value',
        'max_discount',
        'min_order_amount',
        'start_date',
        'end_date',
        'active',
        'used_count',
        'max_uses',
        'is_redeemable',
        'can_be_redeemed_with_points',
        'is_global',
        'user_id',
        'required_ranking',
        'is_first_order',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function products()
    {
        return $this->belongsToMany(Product::class, 'discount_product');
    }

    public function discountUsages()
    {
        return $this->hasMany(DiscountUsage::class);
    }
}