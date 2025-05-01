<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;

class Post extends Model
{
    protected $fillable = ['title','titleHead', 'description', 'image', 'active', 'publishDate',];

   

}
