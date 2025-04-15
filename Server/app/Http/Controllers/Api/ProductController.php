<?php
namespace App\Http\Controllers\Api;
use App\Helpers\ApiResponse;
use App\Http\Requests\ProductRequest;
use App\Http\Resources\ProductResource;
use App\Models\Gallery;
use App\Traits\ApiDataTrait;
use Illuminate\Http\Request;
use App\Models\Product;
use App\Models\ProductSku;
use App\Models\Attribute;
use App\Models\AttributeOption;
use App\Models\AttributeOptionSku;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Redis;
use Illuminate\Support\Facades\Validator;

class ProductController extends Controller
{
    use ApiDataTrait;
    public function index(Request $request)
    {
        $relations = ['brand', 'category', 'skus.attributeOptions', 'galleries'];
        $filterableFields = ['name', 'category_id', 'brand_id', 'active'];

        $dates = ['create_at'];

        return $this->getAllData(new Product, 'Danh sách sản phẩm', $relations, $filterableFields, $dates, ProductResource::class);
    }
    public function indexWeb(Request $request)
    {
        try {
            // Tạo cache key dựa trên các tham số của request
            $filters = $request->query();
            $page = $request->query('page', 1);  // Lấy số trang nếu có
            $perPage = $request->query('per_page', 10);  // Lấy số bản ghi mỗi trang nếu có
            $cacheKey = "products_cache";
    
            // Kiểm tra xem cache có tồn tại không
            if (Cache::has($cacheKey)) {
                \Log::info("Lấy dữ liệu từ cache: $cacheKey");
                $data = Cache::get($cacheKey);  // Lấy dữ liệu từ cache
            } else {
                \Log::info("Không có cache, truy vấn database: $cacheKey");
                // Nếu không có cache, thực hiện truy vấn và lưu vào cache
                $data = Product::with([
                    'brand', 'category', 'skus.attributeOptions', 'galleries'
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
    
    public function store(ProductRequest $request)
    {
        $validated = $request->validated();

        DB::beginTransaction();
        try {

            if ($request->hasFile('images')) {
                $path = $request->file('images')->store('products', 'public');
                $validated['images'] = $path;
            }

            $product = Product::create([
                'name' => $validated['name'],
                'brand_id' => $validated['brand_id'],
                'category_id' => $validated['category_id'],
                'description' => $request->input('description'),
                'images' => $validated['images'] ?? null,
                'active' => $validated['active'],
                'total_rating' => 0,
                'total_sold' => 0,
            ]);

            if ($request->hasFile('image')) {
                foreach ($request->image as $file) {
                    $pathImage = $file->store('products/gallery', 'public');

                    Gallery::updateOrCreate([
                        'product_id' => $product->id,
                        'image' => $pathImage
                    ]);
                }
            }

            $attributeMap = [];
            foreach ($validated['attributes'] as $attr) {
                $attribute = Attribute::firstOrCreate(['name' => $attr['name']]);

                foreach ($attr['values'] as $value) {
                    $attributeOption = AttributeOption::firstOrCreate([
                        'attribute_id' => $attribute->id,
                        'value' => $value
                    ]);
                    $attributeMap[$attr['name']][$value] = $attributeOption->id;
                }
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
                // Kiểm tra SKU đã tồn tại chưa
                if (ProductSku::where('sku', $sku)->exists()) {
                    return response()->json(['error' => 'SKU đã tồn tại!'], 422);
                }

                $productSku = ProductSku::create([
                    'product_id' => $product->id,
                    'price' => $variant['price'],
                    'old_price' => $variant['old_price'] ?? null,
                    'stock' => $variant['stock'],
                    'sku' => $sku,
                ]);
                Redis::set("stock:sku:{$productSku->id}", $variant['stock']);
              //  Redis::set("sku:stock:{$sku->sku}", $sku->stock);
                foreach ($sku_values as $option_id) {
                    AttributeOptionSku::create([
                        'sku_id' => $productSku->id,
                        'attribute_option_id' => $option_id
                    ]);
                }
            }

            DB::commit();
            // Http::post("http://localhost:9200/products/_doc/{$product->id}", $product->toArray());
            return response()->json([
                'message' => 'Sản phẩm đã được tạo thành công!',
                'product' => $product->load('skus')
            ], 201);
        } catch (\Exception $e) {
            \Log::error($e);
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
    public function productDetail($id)
    {
        $data = Product::with([
            'brand',
            'category',
            'skus.attributeOptions'
        ])->findOrFail($id);

        $popular = Product::where('category_id', $data->category_id)
            ->where('id', '!=', $id)
            ->limit(4)
            ->get();

        $product = [
            'data' => new ProductResource($data),
            'popular' => ProductResource::collection($popular)
        ];

        return ApiResponse::responseObject($product);
    }

    public function update(ProductRequest $request, $id)
    {
        $validated = $request->validated();
   
        DB::beginTransaction();

        try {
            $product = Product::findOrFail($id);
            $product->fill($request->only(['name', 'brand_id', 'category_id', 'description', 'images']));

            $currentImage = $product->images;
            if ($request->hasFile('images')) {

                if (!empty($currentImage) && \Storage::exists('public/' . $currentImage)) {
                    \Storage::delete('public/' . $currentImage);
                }

                $path = $request->file('images')->store('products', 'public');
                $product->images = $path;
            }

            $product->save();

            if ($request->hasFile('image')) {
                foreach ($request->image as $file) {
                    $pathImage = $file->store('products/gallery', 'public');

                    Gallery::updateOrCreate([
                        'product_id' => $product->id,
                        'image' => $pathImage
                    ]);
                }
            }

            $attributeMap = [];
            if ($request->has('attributes')) {
                foreach ($validated['attributes'] as $attr) {
                    $attribute = Attribute::firstOrCreate(['name' => $attr['name']]);

                    foreach ($attr['values'] as $value) {
                        $attributeOption = AttributeOption::firstOrCreate([
                            'attribute_id' => $attribute->id,
                            'value' => $value
                        ]);

                        $attributeMap[$attr['name']][$value] = $attributeOption->id;
                    }
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
    public function destroy($id)
    {
        try {
            $product = Product::findOrFail($id);
            $product->delete();
            Cache::forget('products_cache');
            return ApiResponse::responseSuccess('Xoa thanh cong');
        } catch (\Exception $e) {
            return ApiResponse::errorResponse(500, $e->getMessage());
        }
    }

    public function restore($id)
    {
        try {
            $product = Product::withTrashed()->findOrFail($id);

            if (!$product->trashed()) {
                return response()->json([
                    'message' => 'Sản phẩm chưa bi xoa',
                ], 400);
            }
            $product->restore();
            Cache::forget('products_cache');
            return ApiResponse::responseSuccess('Sản phẩm khôi phục');
        } catch (\Exception $e) {
            \Log::error("Lỗi: " . $e->getMessage());

            return ApiResponse::errorResponse(500, $e->getMessage());
        }
    }
    public function forceDelete($id)
    {
        return $this->deleteDataById(new Product, $id, "Xoa thanh cong", true);
    }
    public function productDelete()
    {
        try {
            $product = Product::onlyTrashed()->paginate(10);

            if ($product->isEmpty()) {
                return ApiResponse::errorResponse(200, 'Không tìm thấy sản phẩm đã xóa.');
            }

            return ApiResponse::responsePage(ProductResource::collection($product));

        } catch (\Exception $e) {
            \Log::error("Lỗi: " . $e->getMessage());

            return ApiResponse::errorResponse(500, $e->getMessage());
        }
    }


    public function search(Request $request)
    {
        $query = $request->get('query');
        $products = Product::searchElasticsearch($query);
        return response()->json($products);
    }
    public function status(Request $request, $id)
    {
        $product = Product::findOrFail($id);

        $validate = Validator::make($request->all(), [
            'active' => 'required|boolean'
        ]);

        if ($validate->fails()) {
            return ApiResponse::errorResponse(422, $validate->errors());
        }

        $product->update([
            'active' => $request->active
        ]);

        Cache::forget("products_cache");

        Cache::tags(['products_cache'])->flush();

        if (config('cache.default') === 'redis') {
            $this->clearProductsCache();
        }
        Cache::flush();
        return ApiResponse::responseSuccess('Cập nhật trạng thái thành công');
    }

    private function clearProductsCache()
    {
        $redis = Cache::getRedis();
        $keys = $redis->keys('products_cache');
        foreach ($keys as $key) {
            $redis->del($key);
        }
    }

}