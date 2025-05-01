<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;

class PointRedemption extends Model
{
    protected $fillable = [
        'user_id',
        'discount_id',
        'points_used'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
    public function discount()
    {
        return $this->belongsTo(Discount::class);
    }
   
}
