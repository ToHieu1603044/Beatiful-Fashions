<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Slide extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'description',
        'images',
        'order',
    ];
    protected $casts = [
        'images' => 'array',
    ];
    public function getCreatedAtAttribute($date)
    {
        return Carbon::parse($date)->format('d-m-Y-H:i:s');
    }

    public function getUpdatedAtAttribute($date)
    {
        return Carbon::parse($date)->format('d-m-Y-H:i:s');
    }
}
