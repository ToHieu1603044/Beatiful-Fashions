<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Cart extends Model
{
    protected $fillable = [
        'user_id',
        'session_id',
        'sku_id',
        'quantity',
    ];

    public function sku(){
        return $this->belongsTo(ProductSku::class,'sku_id','id');
    }
    public function attributeOptions(){
        return $this->belongsToMany(AttributeOption::class,'attribute_option_sku','sku_id','attribute_option_id');
    }
    public function attribute(){
        return $this->belongsToMany(Attribute::class,'attribute_option_sku','sku_id','attribute_id');
    }

    public function user(){
        return $this->belongsTo(User::class);
    }

}
