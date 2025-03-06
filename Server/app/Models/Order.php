<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Order extends Model
{
    use SoftDeletes;
    protected $dates = ['deleted_at']; 
    protected $fillable = [
        'user_id',
        'total_amount',
        'status',
        'shipping_status',
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

    public function user()
    {
        return $this->belongsTo(User::class);
    }
    public function products(){
        return $this->belongsToMany(Product::class);
    }
    public function orderDetails(){
        return $this->hasMany(OrderDetail::class);
    }
}
