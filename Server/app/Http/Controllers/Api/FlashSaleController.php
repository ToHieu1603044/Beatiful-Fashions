<?php

namespace App\Http\Controllers\Api;

use App\Helpers\ApiResponse;
use App\Http\Resources\ProductResource;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Cache;

class FlashSaleController extends Controller
{
    public function index(Request $request)
    {
        try {
            // Lấy tất cả các sản phẩm có Flash Sale
            $products = Product::with('flashSales') // Tải kèm các flash sales
                ->whereHas('flashSales') // Chỉ lấy sản phẩm có tham gia Flash Sale
                ->get();
    
            $products->transform(function ($product) {
                // Kiểm tra xem sản phẩm có tham gia Flash Sale hay không
                if ($product->flashSales->isNotEmpty()) {
                    // Lấy Flash Sale đầu tiên (nếu có)
                    $flashSale = $product->flashSales->first();
                    // Lấy giá giảm từ bảng trung gian flash_sale_products
                    $flashSalePrice = $flashSale->pivot->discount_price;
    
                    // Thêm giá giảm vào sản phẩm
                    $product->sale_price = $flashSalePrice;
    
                    // Cập nhật giá giảm cho các biến thể của sản phẩm
                    foreach ($product->skus as $sku) {
                        $sku->sale_price = $flashSalePrice; // Áp dụng giá giảm cho từng biến thể
                    }
                }
    
                return $product;
            });
    
            return ApiResponse::responseSuccess(ProductResource::collection($products));
        } catch (\Exception $e) {
            \Log::error('Lỗi khi lấy sản phẩm có Flash Sale', ['exception' => $e->getMessage()]);
            return response()->json(['error' => 'Đã có lỗi xảy ra'], 500);
        }
    }
    
}
