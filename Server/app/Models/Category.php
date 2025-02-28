<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Category extends Model
{
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
}
