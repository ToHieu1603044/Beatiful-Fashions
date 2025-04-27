<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Brand extends Model
{
    use SoftDeletes;
    protected $fillable = [
        'name',
        'status',
    ];

    protected $casts = [
        'status' => 'boolean',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function products(){
        return $this->hasMany(Product::class);
    }
    public function getCreatedAtAttribute($date)
    {
        return Carbon::parse($date)->format('d-m-Y');
    }

    // Accessor to format the updated_at date automatically
    public function getUpdatedAtAttribute($date)
    {
        return Carbon::parse($date)->format('d-m-Y');
    }



}
