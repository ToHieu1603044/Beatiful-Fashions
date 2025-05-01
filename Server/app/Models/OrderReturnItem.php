<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;


class OrderReturnItem extends Model
{
    use HasFactory;

    protected $fillable = ['order_return_id', 'order_detail_id', 'quantity', 'refund_amount', 'reason'];

   
    public function orderReturn()
    {
        return $this->belongsTo(OrderReturn::class);
    }

    public function orderDetail()
    {
        return $this->belongsTo(OrderDetail::class);
    }

}