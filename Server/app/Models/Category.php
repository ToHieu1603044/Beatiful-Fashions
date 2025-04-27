<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Category extends Model
{
    use SoftDeletes;
    protected $fillable = [
        'name',
        'slug',
        'image',
        'active',
        'parent_id',
    ];

    public function products(){
        return $this->hasMany(Product::class);
    }
    public function children(){
        return $this->hasMany(Category::class, 'parent_id');
    }
    public function parent(){
        return $this->belongsTo(Category::class, 'parent_id');
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
