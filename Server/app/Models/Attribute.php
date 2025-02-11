<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Attribute extends Model
{
    protected $fillable = [
        'name'
    ];

    public function products(){
        return $this->belongsToMany(Product::class);
    }
    public function values(){
        return $this->hasMany(AttributeOption::class);
    }

}
