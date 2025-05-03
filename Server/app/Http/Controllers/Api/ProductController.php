<?php
namespace App\Http\Controllers\Api;
use App\Helpers\ApiResponse;
use App\Helpers\TextSystemConst;
use App\Http\Requests\ProductRequest;
use App\Http\Resources\ProductResource;
use App\Models\Category;
use App\Models\FlashSaleProduct;
use App\Models\Gallery;
use App\Models\Rating;
use App\Traits\ApiDataTrait;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\Request;
use App\Models\Product;
use App\Models\ProductSku;
use App\Models\Attribute;
use App\Models\AttributeOption;
use App\Models\AttributeOptionSku;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Redis;
use Illuminate\Support\Facades\Validator;
/**
 * @OA\Info(
 *     title="Product API",
 *     version="1.0.0",
 *     description="API for managing products"
 * )
 */
class ProductController extends Controller
{
    use ApiDataTrait;
    use AuthorizesRequests;

    
    public function index(Request $request)
    {
        
        $this->authorize('viewAny', Product::class);
        try {
           
            $filters = $request->query();
            $page = $request->query('page', 1);
            $cacheKey = 'products_cache_' . md5(json_encode($filters));
            $relations = ['brand', 'category', 'skus.attributeOptions', 'galleries'];
            $filterableFields = ['name', 'category_id', 'brand_id', 'active'];
            $dates = ['created_at'];

            if (Cache::has($cacheKey)) {

                $data = Cache::get($cacheKey);

            } else {
                $query = Product::with($relations);

                if (!empty($filters['search'])) {
                    $search = trim($filters['search']);

                    $query->where(function ($q) use ($search, $filterableFields) {
                        foreach ($filterableFields as $field) {
                            $q->orWhere($field, 'like', "%$search%");
                        }
                    });
                }

                if (isset($filters['min_price']) && isset($filters['max_price'])) {
                    $query->whereHas('skus', function ($q) use ($filters) {
                        $minPrice = (int) $filters['min_price'];
                        $maxPrice = (int) $filters['max_price'];
                        $q->whereBetween('price', [$minPrice, $maxPrice]);
                    });
                }

                if (isset($filters['price_range'])) {
                    [$minPrice, $maxPrice] = explode('-', $filters['price_range']);
                    $query->whereHas('skus', function ($q) use ($minPrice, $maxPrice) {
                        $q->whereBetween('price', [(int) $minPrice, (int) $maxPrice]);
                    });
                }

                if (isset($filters['price'])) {
                    $flagPrice = strtolower($filters['price']) === 'asc' ? 'asc' : 'desc';
                    $query->addSelect([
                        'min_price' => \DB::table('product_skus')
                            ->selectRaw('MIN(price)')
                            ->whereColumn('product_skus.product_id', 'products.id')
                    ])->orderBy('min_price', $flagPrice);
                }

                if (isset($filters['active'])) {
                    $query->where('active', $filters['active']);
                }

                if (isset($filters['category_id'])) {
                    $category = Category::find($filters['category_id']);
                
                    if ($category) {
                        // Lấy tất cả category con của category hiện tại (bao gồm chính nó)
                        $descendantCategoryIds = Category::where('_lft', '>=', $category->_lft)
                            ->where('_rgt', '<=', $category->_rgt)
                            ->pluck('id')
                            ->toArray();
                
                        // Lọc tất cả sản phẩm thuộc các category này
                        $query->whereIn('category_id', $descendantCategoryIds);
                    }
                }
                

                foreach ($dates as $date) {
                    if (isset($filters['start_date']) && isset($filters['end_date'])) {
                        $query->whereBetween($date, [$filters['start_date'], $filters['end_date']]);
                    } elseif (isset($filters['from_date'])) {
                        $query->where($date, '>=', $filters['from_date']);
                    } elseif (isset($filters['to_date'])) {
                        $query->where($date, '<=', $filters['to_date']);
                    }
                }

                if (isset($filters['date'])) {
                    $orderDirection = strtolower($filters['date']) === 'asc' ? 'asc' : 'desc';
                    $query->orderBy('created_at', $orderDirection);
                }

                $perPage = $request->query('per_page', 10);
                $data = $query->orderBy('created_at', 'desc')->paginate($perPage);

                Cache::put($cacheKey, $data, 600);

                \Log::info("Dữ liệu đã được cache: $cacheKey");
            }

            if ($data->isEmpty()) {
                \Log::info('Không có dữ liệu phù hợp với tìm kiếm.');
                return response()->json([
                    'message' => 'Không có dữ liệu.',
                    'data' => []
                ], Response::HTTP_OK);
            }

            return ApiResponse::responsePage(ProductResource::collection($data));

        } catch (\Exception $e) {
            \Log::error('Lỗi trong index', ['exception' => $e->getMessage()]);
            return ApiResponse::errorResponse();
        }
    }

    public function indexWeb(Request $request)
    {
        try {
            $search = $request->query('search', '');
            $filters = $request->query();
            $page = $request->query('page', 1);
            $perPage = $request->query('per_page', 10);

            $cacheKey = "products_cache_web_" . md5($search);

            if (Cache::has($cacheKey)) {
                \Log::info("Lấy dữ liệu từ cache: $cacheKey");
                $data = Cache::get($cacheKey);
            } else {

                $query = Product::with([
                    'brand',
                    'category',
                    'skus.attributeOptions',
                    'galleries'
                ])
                    ->where('active', 1);

                if (!empty($search)) {
                    $query->where('name', 'like', '%' . $search . '%');
                }

                $data = $query->paginate($perPage);

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
        $this->authorize('create', Product::class);

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
                    return response()->json(['error' => 'SKU' . __('messages.already_exists')], 422);
                }

                $productSku = ProductSku::create([
                    'product_id' => $product->id,
                    'price' => $variant['price'],
                    'old_price' => $variant['old_price'] ?? null,
                    'stock' => $variant['stock'],
                    'sku' => $sku,
                ]);
                 Redis::set("stock:sku:{$productSku->id}", $variant['stock']);
                //Redis::set("sku:stock:{$productSku->sku}", $productSku->stock);
                foreach ($sku_values as $option_id) {
                    AttributeOptionSku::create([
                        'sku_id' => $productSku->id,
                        'attribute_option_id' => $option_id
                    ]);
                }
            }

            DB::commit();
            Cache::flush();
            // Http::post("http://localhost:9200/products/_doc/{$product->id}", $product->toArray());
            return response()->json([
                'message' => TextSystemConst::CREATE_SUCCESS,
                'product' => $product->load('skus')
            ], 201);
        } catch (\Exception $e) {
            \Log::error($e);
            DB::rollBack();
            return response()->json([
                'error' => TextSystemConst::CREATE_FAILED,
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

        $this->authorize('view', $data);

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

            $this->authorize('update', $product);

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
                $requestedSkus = [];

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
                    $requestedSkus[] = $sku;
                }

                // Xoá SKU không còn trong variant_values
                $skusToDelete = $existingSkus->keys()->diff($requestedSkus);
                if ($skusToDelete->isNotEmpty()) {
                    $skusToDeleteIds = $existingSkus->only($skusToDelete)->values();
                    AttributeOptionSku::whereIn('sku_id', $skusToDeleteIds)->delete();
                    ProductSku::whereIn('id', $skusToDeleteIds)->delete();
                }

                // Tạo hoặc cập nhật SKU
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
                        Redis::set("sku:stock:{$sku}", $variant['stock']);
                    } else {
                        $productSku = ProductSku::create([
                            'product_id' => $product->id,
                            'price' => $variant['price'],
                            'old_price' => $variant['old_price'] ?? null,
                            'stock' => $variant['stock'],
                            'sku' => $sku,
                        ]);
                        Redis::set("sku:stock:{$sku}", $variant['stock']);
                        foreach ($sku_values as $option_id) {
                            AttributeOptionSku::create([
                                'sku_id' => $productSku->id,
                                'attribute_option_id' => $option_id
                            ]);
                        }
                    }
                    $flashSaleProduct = FlashSaleProduct::where('product_id', $product->id)->first();
                    if ($flashSaleProduct) {
                        Redis::set("flash_sale:product:{$sku}", $flashSaleProduct->quantity);
                    }
                }
            }

            DB::commit();
            Cache::flush();
            return response()->json([
                'message' => __('messages.updated'),
                'product' => $product->load('skus')
            ], 200);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'error' => __('messages.error'),
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function destroy($id)
    {
        try {
            $product = Product::findOrFail($id);

            $this->authorize('delete', $product);

            // foreach ($product->skus as $sku) {
            //     Redis::del("sku:stock:{$sku->sku}");
            //     Redis::del("flash_sale:product:{$sku->sku}");
            // }
    
            // // Xoá cache khác nếu cần
            // Redis::del("product:{$product->id}");
            // Redis::del("product:list");

            $product->delete();


            Cache::flush();

            return ApiResponse::responseSuccess(__('messages.deleted'));
        } catch (\Exception $e) {
            return ApiResponse::errorResponse(500, $e->getMessage());
        }
    }

    public function restore($id)
    {
        try {
            $product = Product::withTrashed()->findOrFail($id);

            $this->authorize('restore', $product);

            if (!$product->trashed()) {
                return response()->json([
                    'message' => __('messages.product_not_deleted'),
                ], 400);
            }
            $product->restore();
            Cache::flush();
            return ApiResponse::responseSuccess(__('messages.restored'));
        } catch (\Exception $e) {
            \Log::error("Lỗi: " . $e->getMessage());

            return ApiResponse::errorResponse(500, $e->getMessage());
        }
    }
    public function forceDelete($id)
    {
        return $this->deleteDataById(new Product, $id, __('messages.deleted'), true);
    }
    public function productDelete()
    {
        $this->authorize('viewAny', Product::class);
        try {
            $product = Product::onlyTrashed()->paginate(10);

            if ($product->isEmpty()) {
                return ApiResponse::errorResponse(200, __('messages.product_not_deleted'));
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
        Cache::forget("products_cache_web");

        Cache::flush();

        if (config('cache.default') === 'redis') {
            $this->clearProductsCache();
        }
        Cache::flush();
        return ApiResponse::responseSuccess($product, __('messages.updated'));
    }

    private function clearProductsCache()
    {
        $redis = Cache::getRedis();
        $keys = $redis->keys('products_cache');
        foreach ($keys as $key) {
            $redis->del($key);
        }
    }
    public function getAverageRating($id)
    {
        $average = Rating::where('product_id', $id)->avg('rating');

        return response()->json([
            'product_id' => $id,
            'average_rating' => round($average, 1),
        ]);
    }


}