<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;


use App\Models\Product;
use App\Models\ProductSku;
use App\Models\Attribute;
use App\Models\AttributeOption;
use App\Models\AttributeOptionSku;
use Illuminate\Support\Facades\DB;
class ProductController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'brand_id' => 'required|exists:brands,id',
            'category_id' => 'required|exists:categories,id',
            'description' => 'nullable|string',
            'images' => 'nullable|json',
            'attributes' => 'required|array',
            'attributes.*.name' => 'required|string',
            'attributes.*.value' => 'required|string',
            'variant_values' => 'required|array',
            'variant_values.*.variant_combination' => 'required|array',
            'variant_values.*.price' => 'required|integer',
            'variant_values.*.old_price' => 'nullable|integer',
            'variant_values.*.stock' => 'required|integer',
        ]);

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
}
