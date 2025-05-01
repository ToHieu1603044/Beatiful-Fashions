<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Rating extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'product_id',
        'rating',
        'order_detail_id',
        'review',  
        'parent_id',
    ];
    

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function product()
    {
        return $this->belongsTo(Product::class);
    }
    public function orderDetail()
    {
        return $this->belongsTo(OrderDetail::class);
    }
    public function replies(){
        return $this->hasMany(Rating::class, 'parent_id');
    }
    public function parent(){
        return $this->belongsTo(Rating::class, 'parent_id');
    }

    
}
