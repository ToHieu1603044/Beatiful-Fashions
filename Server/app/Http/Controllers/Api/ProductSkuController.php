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
            // Tạo cache key dựa trên các tham số của request
            $filters = $request->query();
            $page = $request->query('page', 1);  // Lấy số trang nếu có
            $perPage = $request->query('per_page', 10);  // Lấy số bản ghi mỗi trang nếu có
            $cacheKey = "products_cache_web";

            // Kiểm tra xem cache có tồn tại không
            if (Cache::has($cacheKey)) {
                \Log::info("Lấy dữ liệu từ cache: $cacheKey");
                $data = Cache::get($cacheKey);  // Lấy dữ liệu từ cache
            } else {
                \Log::info("Không có cache, truy vấn database: $cacheKey");
                // Nếu không có cache, thực hiện truy vấn và lưu vào cache
                $data = Product::with([
                    'brand',
                    'category',
                    'skus.attributeOptions',
                    'galleries'
                ])
                    ->where('active', 1)
                    ->paginate($perPage);

                // Lưu dữ liệu vào cache trong 10 phút (600 giây)
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
        return response()->json(['message' => 'SKU không tồn tại'], 404);
    }
    
    // Trả về thông tin sản phẩm với SKU
    return response()->json([
        'sku' => $sku->sku,
        'stock' => $sku->stock,
        'price' => $sku->price,
        'product_name' => $sku->product->name,  // Giả sử SKU có mối quan hệ với sản phẩm
    ]);
}
}
