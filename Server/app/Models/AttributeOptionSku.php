<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AttributeOptionSku extends Model
{
    protected $table = 'attribute_option_sku';

    protected $fillable = [
        'sku_id',
        'attribute_option_id',
    ];
    public function sku(){
        return $this->belongsTo(ProductSku::class);
    }
    public function attributeOption(){
        return $this->belongsTo(AttributeOption::class);
    }
}
