<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Kalnoy\Nestedset\NodeTrait;

class Category extends Model
{
    use SoftDeletes;
    use NodeTrait;
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
    public static function getAllChildrenIds($id)
    {
        $ids = [$id];
        $children = self::where('parent_id', $id)->pluck('id');
        foreach ($children as $childId) {
            $ids = array_merge($ids, self::getAllChildrenIds($childId));
        }
        return $ids;
    }
}
