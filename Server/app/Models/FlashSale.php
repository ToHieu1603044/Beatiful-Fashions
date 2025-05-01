<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;

class FlashSale extends Model
{
    protected $table = 'flash_sales';

    // Cột nào có thể được gán giá trị (Mass Assignment)
    protected $fillable = [
        'name',  // Tên chương trình Flash Sale
        'start_time', 
        'end_time',
        'image',
        'status',  // Trạng thái chương trình (active, inactive)
    ];

    public function products()
    {
        return $this->belongsToMany(Product::class, 'flash_sale_products', 'flash_sale_id', 'product_id')
                    ->withPivot('discount_price','quantity') 
                    ->withTimestamps();
    }

    public function scopeActive($query)
    {
        return $query->where('start_time', '<=', now())
                     ->where('end_time', '>=', now());
    }

    public function isActive()
    {
        return $this->start_time <= now() && $this->end_time >= now();
    }
    public function getCreatedAtAttribute($value)
    {
        return Carbon::parse($value)->format('Y-m-d H:i:s');  
    }
    
    public function getUpdatedAtAttribute($value)
    {
        return Carbon::parse($value)->format('Y-m-d H:i:s');
    }

}
