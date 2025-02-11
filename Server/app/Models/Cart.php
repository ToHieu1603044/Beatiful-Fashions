<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Cart extends Model
{
    protected $fillable = [
        'user_id',
        'session_id',
        'sku_id',
        'quantity',
    ];

    public function productSku(){
        return $this->belongsTo(ProductSku::class);
    }
    public function user(){
        return $this->belongsTo(User::class);
    }

}
