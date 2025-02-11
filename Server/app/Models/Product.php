<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    





    public function getDate($value){
        return Carbon::parse($value)->timezone('Asia/Ho_Chi_Minh')->format('d/m/Y H:i:s');
    }
    public function setDate($value){
        $this->attributes['created_at'] = Carbon::parse($value)->timezone('Asia/Ho_Chi_Minh')->format('Y-m-d H:i:s');
    }
}
