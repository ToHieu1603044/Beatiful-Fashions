<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FlashSaleProduct extends Model
{
    protected $table = 'flash_sale_products';

    protected $fillable = [
        'product_id', 
        'flash_sale_id', 
        'sale_price',
        'quantity'
    ];
    public function flashSale()
{
    return $this->belongsTo(FlashSale::class);
}
}
