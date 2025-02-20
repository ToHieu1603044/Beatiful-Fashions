<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    protected $fillable = [
        'name',
        'brand_id',
        'category_id',
        'total_rating',
        'total_sold',
        'images'
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
}
