<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;

class Post extends Model
{
    protected $fillable = ['title','titleHead', 'description', 'image', 'active', 'publishDate',];

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
