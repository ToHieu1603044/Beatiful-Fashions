<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Product extends Model
{
    use SoftDeletes;
    protected $fillable = [
        'name',
        'brand_id',
        'category_id',
        'total_rating',
        'total_sold',
        'images',
        'active',
    ];

    protected $dates = [
        'created_at',
        'updated_at',
        'deleted_at'
    ];
    protected $casts = [
        'active' => 'boolean',
    ];
    

    public function brand(){
        return $this->belongsTo(Brand::class);
    }

    public function category(){
        return $this->belongsTo(Category::class);
    }

    public function skus(){
        return $this->hasMany(ProductSku::class);
    }

    public function ratings(){
        return $this->hasMany(Rating::class);
    }
    
    public function getDate($value){
        return Carbon::parse($value)->timezone('Asia/Ho_Chi_Minh')->format('d/m/Y H:i:s');
    }
    public function setDate($value){
        $this->attributes['created_at'] = Carbon::parse($value)->timezone('Asia/Ho_Chi_Minh')->format('Y-m-d H:i:s');
    }
    public function galleries(){
        return $this->hasMany(Gallery::class);
    }

    public function attributes()
    {
        return $this->belongsToMany(Attribute::class, 'attribute_option_sku', 'attribute_id', 'attribute_option_id');
    }
    

public function attributeOptions()
{
    return $this->hasManyThrough(
        AttributeOption::class,      // Model đích
        ProductSku::class,           // Model trung gian
        'product_id',                // Khóa ngoại ở bảng product_skus tham chiếu products
        'id',                        // Khóa chính bảng attribute_options
        'id',                        // Khóa chính bảng products
        'attribute_option_id'        // Khóa ngoại ở bảng attribute_option_sku tham chiếu attribute_options
    );
}

}
