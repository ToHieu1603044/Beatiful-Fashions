<?php

namespace App\Http\Controllers\Api;

use App\Helpers\ApiResponse;
use App\Http\Requests\ProductRequest;
use App\Http\Resources\ProductResource;
use Illuminate\Http\Request;


use App\Models\Product;
use App\Models\ProductSku;
use App\Models\Attribute;
use App\Models\AttributeOption;
use App\Models\AttributeOptionSku;
use Illuminate\Support\Facades\DB;
class ProductController extends Controller
{
    public function index()
    {
        $products = Product::with([
            'brand',
            'category',
            'skus.attributeOptions'
        ]);
        $page = $products->paginate(10, ['*']);

        return ApiResponse::responsePage(ProductResource::collection($page));
    }

    public function store(ProductRequest $request)
    {
        $validated = $request->validated();

        DB::beginTransaction();
        try {

            $product = Product::create([
                'name' => $validated['name'],
                'brand_id' => $validated['brand_id'],
                'category_id' => $validated['category_id'],
                'description' => $request->input('description'),
                'images' => $request->input('images'),
                'total_rating' => 0,
                'total_sold' => 0,
            ]);

            $attributeMap = [];
            foreach ($validated['attributes'] as $attr) {

                $attribute = Attribute::firstOrCreate(['name' => $attr['name']]);

                $attributeOption = AttributeOption::firstOrCreate([
                    'attribute_id' => $attribute->id,
                    'value' => $attr['value']
                ]);

                $attributeMap[$attr['name']][$attr['value']] = $attributeOption->id; // -> [ "Color" => [ "Xanh" => 1, "Den" => 2 ]  ]
            }

            foreach ($validated['variant_values'] as $variant) {
                $sku_values = [];
                foreach ($variant['variant_combination'] as $option_value) {
                    foreach ($attributeMap as $name => $values) {
                        if (isset($values[$option_value])) {
                            $sku_values[] = $values[$option_value];
                        }
                    }
                }

                sort($sku_values);
                $sku = $product->id . '-' . implode('-', $sku_values);

                $productSku = ProductSku::create([
                    'product_id' => $product->id,
                    'price' => $variant['price'],
                    'old_price' => $variant['old_price'] ?? null,
                    'stock' => $variant['stock'],
                    'sku' => $sku,
                ]);
                //  dd($productSku);
                foreach ($sku_values as $option_id) {
                    AttributeOptionSku::create([
                        'sku_id' => $productSku->id,
                        'attribute_option_id' => $option_id
                    ]);
                }
            }

            DB::commit();

            return response()->json([
                'message' => 'Sản phẩm đã được tạo thành công!',
                'product' => $product->load('skus')
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'error' => 'Lỗi khi tạo sản phẩm',
                'message' => $e->getMessage()
            ], 500);
        }
    }
    public function show($id)
    {
        $data = Product::with([
            'brand',
            'category',
            'skus.attributeOptions'
        ])->findOrFail($id);

        return ApiResponse::responseObject(new ProductResource($data));

    }
    public function update(ProductRequest $request, $id)
    {
        $validated = $request->validated();

        DB::beginTransaction();
        try {

            $product = Product::findOrFail($id);

            $product->fill($request->only(['name', 'brand_id', 'category_id', 'description', 'images']));
            $product->save();

            $attributeMap = [];
            if ($request->has('attributes')) {
                foreach ($validated['attributes'] as $attr) {
                    $attribute = Attribute::firstOrCreate(['name' => $attr['name']]);
                    $attributeOption = AttributeOption::firstOrCreate([
                        'attribute_id' => $attribute->id,
                        'value' => $attr['value']
                    ]);
                    $attributeMap[$attr['name']][$attr['value']] = $attributeOption->id;
                }
            }


            if ($request->has('variant_values')) {
                $existingSkus = $product->skus->pluck('id', 'sku');

                foreach ($validated['variant_values'] as $variant) {
                    $sku_values = [];

                    foreach ($variant['variant_combination'] as $option_value) {
                        foreach ($attributeMap as $name => $values) {
                            if (isset($values[$option_value])) {
                                $sku_values[] = $values[$option_value];
                            }
                        }
                    }

                    sort($sku_values);
                    $sku = $product->id . '-' . implode('-', $sku_values);

                    if ($existingSkus->has($sku)) {
                        $productSku = ProductSku::findOrFail($existingSkus[$sku]);
                        $productSku->update([
                            'price' => $variant['price'],
                            'old_price' => $variant['old_price'] ?? null,
                            'stock' => $variant['stock'],
                        ]);
                    } else {
                        
                        $productSku = ProductSku::create([
                            'product_id' => $product->id,
                            'price' => $variant['price'],
                            'old_price' => $variant['old_price'] ?? null,
                            'stock' => $variant['stock'],
                            'sku' => $sku,
                        ]);

                        foreach ($sku_values as $option_id) {
                            AttributeOptionSku::create([
                                'sku_id' => $productSku->id,
                                'attribute_option_id' => $option_id
                            ]);
                        }
                    }
                }
            }

            DB::commit();

            return response()->json([
                'message' => 'Sản phẩm đã được cập nhật thành công!',
                'product' => $product->load('skus')
            ], 200);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'error' => 'Lỗi khi cập nhật sản phẩm',
                'message' => $e->getMessage()
            ], 500);
        }
    }
    
}
