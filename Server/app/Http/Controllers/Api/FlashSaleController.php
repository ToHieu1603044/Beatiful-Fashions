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