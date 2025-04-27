<?php

namespace App\Models;

use Carbon\Carbon;
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

    public function attributeOptions()
    {
        return $this->belongsToMany(AttributeOption::class, 'attribute_option_sku', 'sku_id', 'attribute_option_id');
    }
    public function attributes()
    {
        return $this->belongsToMany(Attribute::class, 'attribute_option_sku', 'sku_id', 'attribute_id')
            ->withPivot('attribute_option_id');
    }
    public function flashSales()
    {
        return $this->belongsToMany(FlashSale::class, 'flash_sale_products')
            ->withPivot('discount_price')
            ->withTimestamps();
    }
    public function product()
    {
        return $this->belongsTo(Product::class)->withTrashed(); // Lấy luôn sản phẩm đã bị xóa mềm
    }
    public function getCreatedAtAttribute($date)
    {
        return Carbon::parse($date)->format('d-m-Y-H:i:s');
    }

    // Accessor to format the updated_at date automatically
    public function getUpdatedAtAttribute($date)
    {
        return Carbon::parse($date)->format('d-m-Y-H:i:s');
    }

}
