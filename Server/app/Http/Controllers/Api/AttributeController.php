<?php

namespace App\Http\Controllers\Api;

use App\Helpers\ApiResponse;
use App\Models\Attribute;
use App\Models\AttributeOption;
use App\Models\ProductSku;
use Illuminate\Http\Request;

class AttributeController extends Controller
{
    public function index()
    {
        return response()->json(Attribute::with('values')->get());
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|unique:attributes,name',
            'options' => 'nullable|array'
        ]);
    
        $attribute = Attribute::create($request->only('name'));
    
        // Kiểm tra nếu $request->options không rỗng và là mảng
        if (!empty($request->options) && is_array($request->options)) {
            foreach ($request->options as $option) {
                AttributeOption::firstOrCreate([
                    'attribute_id' => $attribute->id,
                    'value' => $option
                ]);
            }
        }
    
        return response()->json($attribute, 201);
    }
    
    public function show(Attribute $attribute)
    {
        return response()->json($attribute->load('options'));
    }

    public function update(Request $request, Attribute $attribute)
    {
        $request->validate([
            'name' => 'required|string|unique:attributes,name,' . $attribute->id
        ]);

        $attribute->update($request->only('name'));

        return response()->json($attribute);
    }

    public function destroy(Attribute $attribute)
    {
        $attribute->delete();
        return response()->json(null, 204);
    }
    public function sku(Request $request, $id)
    {
        $request->validate([
            'sku' => 'required|string|exists:product_skus,sku',
        ]);
    
        $product = ProductSku::where('product_id', $id)->first();
        
        $sku = ProductSku::where('sku', $request->sku)
            ->with(['product', 'attributeOptions.attribute'])
            ->first();
    
        if (!$sku) {
            return ApiResponse::errorResponse(404, 'Không tìm thấy SKU');
        }
    
        return ApiResponse::responseSuccess([
            'sku' => $sku->sku,
            'product_name' => $sku->product->name,
            'price' => $sku->price,
            'stock' => $sku->stock,
            'attributes' => $sku->attributeOptions->map(function ($option) {
                return [
                    'attribute' => $option->attribute->name,
                    'value' => $option->value,
                ];
            }),
        ]);
    }
    public function productSku($id) {
        $productSkus = ProductSku::where('product_id', $id)
            ->with(['attributeOptions.attribute']) // Load quan hệ để tối ưu query
            ->get();
    
        if ($productSkus->isEmpty()) {
            return ApiResponse::errorResponse(404, 'Không có SKU nào cho sản phẩm này.');
        }
    
        // Format dữ liệu trả về
        $formattedData = $productSkus->map(function ($sku) {
            return [
                'id' => $sku->id,
                'product_id' => $sku->product_id,
                'sku' => $sku->sku,
                'price' => $sku->price,
                'old_price' => $sku->old_price,
                'stock' => $sku->stock,
                'created_at' => $sku->created_at,
                'updated_at' => $sku->updated_at,
                'attributes' => $sku->attributeOptions->map(function ($option) {
                    return [
                        'id' => $option->attribute->id,
                        'name' => $option->attribute->name,
                        'value' => $option->value
                    ];
                })
            ];
        });
    
        return ApiResponse::responseSuccess($formattedData);
    }
    
    
}
