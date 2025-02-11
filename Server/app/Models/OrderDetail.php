<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class OrderDetail extends Model
{
    protected $fillable = [
        'order_id', 'sku_id', 'quantity', 'price', 'subtotal'
    ];

    public function order()
    {
        return $this->belongsTo(Order::class);
    }
    
}
