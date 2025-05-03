<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;

class OrderDetail extends Model
{
    protected $fillable = [
        'order_id', 'sku_id', 'quantity', 'price', 'subtotal','product_name', 'variant_details','sku','product_id', 'price_origin',
    ];

    public function order()
    {
        return $this->belongsTo(Order::class);
    }
    public function sku()
    {
        return $this->belongsTo(ProductSku::class);
    }
    public function returnRequest()
    {
        return $this->hasOne(OrderReturnItem::class, 'order_detail_id');
    }
    
    public function returnDetails()
    {
        return $this->hasMany(OrderReturnItem::class, 'order_detail_id', 'id');
    }
    public function orderReturn()
    {
        return $this->hasOne(OrderReturn::class, 'order_id');
    }
    protected $appends = ['is_rating'];

    public function getIsRatingAttribute()
    {
        return \App\Models\Rating::where('user_id', auth()->id())
            ->where('product_id', $this->product_id)
            ->where('order_detail_id', $this->id) 
            
            ->exists();
    }
    
}
