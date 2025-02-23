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
        return $this->belongsToMany(AttributeOption::class,'attribute_option_sku','sku_id','attribute_option_id');
    }
    public function attributes()
{
    return $this->belongsToMany(Attribute::class, 'attribute_option_sku', 'sku_id', 'attribute_id')
                ->withPivot('attribute_option_id');
}


}
