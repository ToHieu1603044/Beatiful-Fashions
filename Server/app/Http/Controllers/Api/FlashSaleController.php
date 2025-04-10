<?php

namespace App\Http\Controllers\Api;

use App\Helpers\ApiResponse;
use App\Http\Resources\ProductResource;
use App\Models\FlashSale;
use App\Models\FlashSaleProduct;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Validator;

class FlashSaleController extends Controller
{

    public function countDown()
    {

        $countDown = Cache::remember('flash_sale_data', now()->addMinutes(5), function () {
            return FlashSale::get();
        });

        return response()->json($countDown);
    }
    public function getNameProduct(Request $request)
    {
        $products = Product::pluck('name', 'id');

        return response()->json($products);
    }
    public function sales(Request $request)
    {
      
        $sales = FlashSale::with(['products' => function($query) {
            $query->select('products.id', 'products.name');
        }])->get();
    
        return response()->json($sales);
    }

}
