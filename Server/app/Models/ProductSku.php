<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProductSku extends Model
{
    protected $table = 'product_skus';

    protected $fillable = [
        'product_id',
        'price',
        'old_price',
        'stock',
        'sku',
    ];

    public function product(){
        return $this->belongsTo(Product::class);
    }
    public function attributeOptions(){
        return $this->belongsToMany(AttributeOption::class);
    }
    public function attributes(){
        return $this->hasMany(AttributeOptionSku::class);
    }

}
