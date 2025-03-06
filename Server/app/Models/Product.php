<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\App;

class Product extends Model
{
    use SoftDeletes;
    protected $fillable = [
        'name',
        'brand_id',
        'category_id',
        'total_rating',
        'total_sold',
        'images',
        'active',
    ];

    protected $dates = [
        'created_at',
        'updated_at',
        'deleted_at'
    ];
    protected $casts = [
        'active' => 'boolean',
    ];
    

    public function brand(){
        return $this->belongsTo(Brand::class);
    }

    public function category(){
        return $this->belongsTo(Category::class);
    }

    public function skus(){
        return $this->hasMany(ProductSku::class);
    }

    public function ratings(){
        return $this->hasMany(Rating::class);
    }
    
    public function getDate($value){
        return Carbon::parse($value)->timezone('Asia/Ho_Chi_Minh')->format('d/m/Y H:i:s');
    }
    public function setDate($value){
        $this->attributes['created_at'] = Carbon::parse($value)->timezone('Asia/Ho_Chi_Minh')->format('Y-m-d H:i:s');
    }
    public function galleries(){
        return $this->hasMany(Gallery::class);
    }

    public function attributes()
    {
        return $this->belongsToMany(Attribute::class, 'attribute_option_sku', 'attribute_id', 'attribute_option_id');
    }
    

public function attributeOptions()
{
    return $this->hasManyThrough(
        AttributeOption::class,      // Model đích
        ProductSku::class,           // Model trung gian
        'product_id',                // Khóa ngoại ở bảng product_skus tham chiếu products
        'id',                        // Khóa chính bảng attribute_options
        'id',                        // Khóa chính bảng products
        'attribute_option_id'        // Khóa ngoại ở bảng attribute_option_sku tham chiếu attribute_options
    );
}
public static function boot()
{
    parent::boot();

    static::created(function ($product) {
        $product->indexToElasticsearch();
    });

    static::updated(function ($product) {
        $product->indexToElasticsearch();
    });

    static::deleted(function ($product) {
        $product->deleteFromElasticsearch();
    });
}

public function indexToElasticsearch()
{
    $client = App::make('Elasticsearch');
    $client->index([
        'index' => 'products',
        'id' => $this->id,
        'body' => $this->toArray()
    ]);
}

public function deleteFromElasticsearch()
{
    $client = App::make('Elasticsearch');
    $client->delete([
        'index' => 'products',
        'id' => $this->id
    ]);
}

public static function searchElasticsearch($query)
{
    $client = App::make('Elasticsearch');

    $params = [
        'index' => 'products',
        'body' => [
            'query' => [
                'multi_match' => [
                    'query' => $query,
                    'fields' => ['name']
                ]
            ]
        ]
    ];

    $results = $client->search($params);
    return collect($results['hits']['hits'])->map(function ($hit) {
        return $hit['_source'];
    });
}

}
