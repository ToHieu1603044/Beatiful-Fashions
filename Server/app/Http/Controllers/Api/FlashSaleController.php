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

    // Hiển thị các sản phẩm đang Flash Sale
    public function index(Request $request)
    {
        try {
            $products = Product::with('flashSales')
                ->whereHas('flashSales', function ($query) {
                    $query->where('status', 'active');
                })
                ->get();

            $products->transform(function ($product) {
                if ($product->flashSales->isNotEmpty()) {
                    $flashSale = $product->flashSales->first();
                    $product->sale_price = $flashSale->pivot->discount_price;

                    foreach ($product->skus as $sku) {
                        $sku->sale_price = $flashSale->pivot->discount_price;
                    }
                }
                return $product;
            });

            return ApiResponse::responseSuccess(ProductResource::collection($products));
        } catch (\Exception $e) {
            \Log::error('Lỗi khi lấy sản phẩm Flash Sale', ['exception' => $e->getMessage()]);
            return response()->json(['error' => 'Đã có lỗi xảy ra'], 500);
        }
    }

    // Tạo Flash Sale mới
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|unique:flash_sales|max:255',
            'start_time' => 'required|date',
            'end_time' => 'required|date|after:start_time',
            'status' => 'required|in:active,inactive',
            'products' => 'required|array',
            'products.*.product_id' => 'required|exists:products,id',
            'products.*.discount_price' => 'required|integer|min:0',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:2048'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 400);
        }

        $imagePath = null;
        if ($request->hasFile('image')) {
            $imagePath = $request->file('image')->store('flash_sale_images', 'public');
        }

        $flashSale = FlashSale::create([
            'name' => $request->name,
            'image' => $imagePath,
            'start_time' => $request->start_time,
            'end_time' => $request->end_time,
            'status' => $request->status,
        ]);

        $flashSaleProducts = [];
        foreach ($request->products as $product) {
            $flashSaleProducts[] = [
                'flash_sale_id' => $flashSale->id,
                'product_id' => $product['product_id'],
                'discount_price' => $product['discount_price'],
                'created_at' => now(),
                'updated_at' => now(),
            ];
        }

        FlashSaleProduct::insert($flashSaleProducts);

        return response()->json([
            'message' => 'Flash Sale đã được tạo thành công!',
            'flash_sale' => $flashSale,
        ], 201);
    }

    // Cập nhật trạng thái Flash Sale
    public function updateStatus(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'status' => 'required|in:active,inactive'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 400);
        }

        $flashSale = FlashSale::find($id);
        if (!$flashSale) {
            return response()->json(['message' => 'Flash Sale không tồn tại'], 404);
        }

        $flashSale->status = $request->status;
        $flashSale->save();

        return response()->json([
            'message' => 'Cập nhật trạng thái thành công!',
            'flash_sale' => $flashSale,
        ]);
    }
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
       // Hiển thị danh sách Flash Sale kèm sản phẩm
       public function sales(Request $request)
       {
           $sales = FlashSale::with('products:id,name')->get();
   
           $result = $sales->map(function ($sale) {
               return [
                   'id' => $sale->id,
                   'name' => $sale->name,
                   'status' => $sale->status,
                   'start_time' => $sale->start_time,
                   'end_time' => $sale->end_time,
                   'products' => $sale->products->map(function ($product) {
                       return [
                           'id' => $product->id,
                           'name' => $product->name,
                       ];
                   }),
               ];
           });
   
           return response()->json($result);
       }
   
       // Cập nhật Flash Sale
       public function update(Request $request, $id)
       {
           $flashSale = FlashSale::find($id);
   
           if (!$flashSale) {
               return response()->json(['message' => 'Flash Sale không tồn tại'], 404);
           }
   
           $validator = Validator::make($request->all(), [
               'name' => 'sometimes|string|max:255',
               'start_time' => 'sometimes|date',
               'end_time' => 'sometimes|date|after:start_time',
               'status' => 'sometimes|in:active,inactive',
               'products' => 'sometimes|array',
               'products.*.product_id' => 'required_with:products|exists:products,id',
               'products.*.discount_price' => 'required_with:products|integer|min:0',
               'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:2048'
           ]);
   
           if ($validator->fails()) {
               return response()->json(['errors' => $validator->errors()], 400);
           }
   
           if ($request->hasFile('image')) {
               $imagePath = $request->file('image')->store('flash_sale_images', 'public');
               $flashSale->image = $imagePath;
           }
   
           $flashSale->fill($request->only(['name', 'start_time', 'end_time', 'status']));
           $flashSale->save();
   
           // Cập nhật sản phẩm nếu có
           if ($request->has('products')) {
               FlashSaleProduct::where('flash_sale_id', $id)->delete();
   
               $flashSaleProducts = [];
               foreach ($request->products as $product) {
                   $flashSaleProducts[] = [
                       'flash_sale_id' => $flashSale->id,
                       'product_id' => $product['product_id'],
                       'discount_price' => $product['discount_price'],
                       'created_at' => now(),
                       'updated_at' => now(),
                   ];
               }
   
               FlashSaleProduct::insert($flashSaleProducts);
           }
   
           return response()->json([
               'message' => 'Cập nhật Flash Sale thành công!',
               'flash_sale' => $flashSale,
           ]);
       }
   
       // Xoá Flash Sale
       public function destroy($id)
       {
           $flashSale = FlashSale::find($id);
   
           if (!$flashSale) {
               return response()->json(['message' => 'Flash Sale không tồn tại'], 404);
           }
   
           // Xoá quan hệ với sản phẩm
           FlashSaleProduct::where('flash_sale_id', $id)->delete();
   
           // Xoá chính Flash Sale
           $flashSale->delete();
   
           return response()->json(['message' => 'Xoá Flash Sale thành công!']);
       }
};