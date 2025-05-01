<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;

class AttributeOption extends Model
{
    protected $fillable = [
        'attribute_id',
        'value'
    ];

    public function attribute(){
        return $this->belongsTo(Attribute::class, 'attribute_id');
    }
    public function productSku(){
        return $this->hasMany(ProductSku::class);
    }
    public function skuRelations(){
        return $this->hasMany(AttributeOptionSku::class);
    }
    public function getCreatedAtAttribute($value)
    {
        return Carbon::parse($value)->format('Y-m-d H:i:s');  
    }
    
    public function getUpdatedAtAttribute($value)
    {
        return Carbon::parse($value)->format('Y-m-d H:i:s');
    }
}
