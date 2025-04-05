<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FlashSale extends Model
{
    protected $table = 'flash_sales';

    // Cột nào có thể được gán giá trị (Mass Assignment)
    protected $fillable = [
        'name',  // Tên chương trình Flash Sale
        'start_time', 
        'end_time',
        'status',  // Trạng thái chương trình (active, inactive)
    ];

    // Tạo quan hệ với Product (Nhiều Flash Sale có thể có nhiều sản phẩm)
    public function products()
    {
        return $this->belongsToMany(Product::class, 'flash_sale_products', 'flash_sale_id', 'product_id')
                    ->withPivot('discount_price','quantity') 
                    ->withTimestamps();
    }

    // Lọc những sản phẩm Flash Sale còn hiệu lực
    public function scopeActive($query)
    {
        return $query->where('start_time', '<=', now())
                     ->where('end_time', '>=', now());
    }

    // Hàm kiểm tra xem Flash Sale có còn hiệu lực không
    public function isActive()
    {
        return $this->start_time <= now() && $this->end_time >= now();
    }
}
