<?php

namespace App\Http\Controllers\Api;

use App\Helpers\ApiResponse;
use App\Http\Resources\ProductResource;
use App\Models\Product;
use App\Models\ProductSku;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class ProductSkuController
{
    public function index(Request $request)
    {
        try {
           
            $filters = $request->query();
            $page = $request->query('page', 1); 
            $perPage = $request->query('per_page', 10);  
            $cacheKey = "products_cache_web";

            if (Cache::has($cacheKey)) {
              
            } else {
                $data = Product::with([
                    'brand',
                    'category',
                    'skus.attributeOptions',
                    'galleries'
                ])
                    ->where('active', 1)
                    ->paginate($perPage);

                Cache::put($cacheKey, $data, 600);
            }

            return ApiResponse::responsePage(ProductResource::collection($data));
        } catch (\Exception $e) {
            \Log::error('Error in indexWeb', ['exception' => $e->getMessage()]);
            return ApiResponse::errorResponse();
        }
    }
    public function getProductInfo($sku)
{
    $sku = ProductSku::where('sku', $sku)->first();
    
    if (!$sku) {
        return response()->json(['message' => 'SKU'.__('messages.not_found')], 404);
    }
    
    // Trả về thông tin sản phẩm với SKU
    return response()->json([
        'sku' => $sku->sku,
        'stock' => $sku->stock,
        'price' => $sku->price,
        'product_name' => $sku->product->name, 
    ]);
}
}
