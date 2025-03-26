<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use App\Models\User;


class Order extends Model
{
    use SoftDeletes;
    protected $dates = ['deleted_at'];
    protected $fillable = [
        'user_id',
        'total_amount',
        'status',
        'tracking_status',
        'name',
        'email',
        'phone',
        'address',
        'ward',
        'district',
        'city',
        'is_paid',
        'payment_method',
        'note',
        'discount_amount',
        'discount_code'
    ];
    protected $casts = [
        'variant_details' => 'array',
        'return_details' => 'array',
    ];

    public function user()
{
    return $this->belongsTo(User::class);
}

    public function products()
    {
        return $this->belongsToMany(Product::class);
    }
    public function orderDetails()
    {
        return $this->hasMany(OrderDetail::class);
    }
    public function discount()
    {
        return $this->belongsTo(Discount::class);
    }
    public function returnDetails()
    {
        return $this->hasOne(OrderReturn::class, 'order_id');
    }
    public function orderReturn()
    {
        return $this->hasMany(OrderReturn::class, 'order_id');
    }


}
