<?php

namespace App\Http\Controllers\Api;

use App\Helpers\ApiResponse;
use App\Http\Resources\ProductResource;
use App\Models\FlashSale;
use App\Models\FlashSaleProduct;
use App\Models\Product;
use App\Models\ProductSku;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Redis;
use Illuminate\Support\Facades\Validator;
use Carbon\Carbon;
class FlashSaleController extends Controller
{

    public function index(Request $request)
    {
        try {
            $now = Carbon::now();

            $query = Product::with(['flashSales', 'skus'])
                ->whereHas('flashSales', function ($q) use ($now, $request) {
                    $q->when($request->status, function ($query) use ($request) {
                        $query->where('status', $request->status);
                    });

                    $q->when($request->expiry, function ($query) use ($now, $request) {
                        if ($request->expiry === 'valid') {
                            $query->where('start_time', '<=', $now)
                                ->where('end_time', '>=', $now); 
                        } elseif ($request->expiry === 'expired') {
                            $query->where('end_time', '<', $now); 
                        }
                    });
                });

            // Tìm kiếm theo tên sản phẩm
            if ($request->filled('search')) {
                $query->where('name', 'like', '%' . $request->search . '%');
            }

            $products = $query->paginate($request->input('per_page', 10));

            $products->getCollection()->transform(function ($product) use ($now) {
                if ($product->flashSales->isNotEmpty()) {
                    $flashSale = $product->flashSales->first();

                    if ($flashSale->status === 'active' && $flashSale->start_time <= $now && $flashSale->end_time >= $now) {
                        $product->sale_price = $flashSale->pivot->discount_price;

                        foreach ($product->skus as $sku) {
                            $sku->sale_price = $flashSale->pivot->discount_price;
                        }
                    } else {
                        $product->sale_price = $product->price;

                        foreach ($product->skus as $sku) {
                            $sku->sale_price = $sku->price;
                        }
                    }
                }

                return $product;
            });

            return ApiResponse::responseSuccess(ProductResource::collection($products), __('messages.success'), 200);
        } catch (\Exception $e) {
            \Log::error('Lỗi khi lấy sản phẩm Flash Sale', ['exception' => $e->getMessage()]);
            return response()->json(['message' => __('messages.error')], 500);
        }
    }
    public function saleWeb(Request $request)
    {
        try {
            $now = Carbon::now();
    
            $query = Product::with(['flashSales', 'skus'])
                ->whereHas('flashSales', function ($q) use ($now, $request) {
                    $q->whereRaw('flash_sale_products.quantity > 0'); // ✅ Điều kiện tồn kho Flash Sale
    
                    $q->when($request->status, function ($query) use ($request) {
                        $query->where('flash_sales.status', $request->status);
                    });
    
                    $q->when($request->expiry, function ($query) use ($now, $request) {
                        if ($request->expiry === 'valid') {
                            $query->where('flash_sales.start_time', '<=', $now)
                                  ->where('flash_sales.end_time', '>=', $now); 
                        } elseif ($request->expiry === 'expired') {
                            $query->where('flash_sales.end_time', '<', $now); 
                        }
                    });
                });
    
            // Tìm kiếm theo tên sản phẩm
            if ($request->filled('search')) {
                $query->where('name', 'like', '%' . $request->search . '%');
            }
    
            $products = $query->paginate($request->input('per_page', 10));
    
            $products->getCollection()->transform(function ($product) use ($now) {
                if ($product->flashSales->isNotEmpty()) {
                    $flashSale = $product->flashSales->first();
    
                    if ($flashSale->status === 'active' && $flashSale->start_time <= $now && $flashSale->end_time >= $now) {
                        $product->sale_price = $flashSale->pivot->discount_price;
    
                        foreach ($product->skus as $sku) {
                            $sku->sale_price = $flashSale->pivot->discount_price;
                        }
                    } else {
                        $product->sale_price = $product->price;
    
                        foreach ($product->skus as $sku) {
                            $sku->sale_price = $sku->price;
                        }
                    }
                }
    
                return $product;
            });
    
            return ApiResponse::responseSuccess(ProductResource::collection($products), __('messages.success'), 200);
        } catch (\Exception $e) {
            \Log::error('Lỗi khi lấy sản phẩm Flash Sale', ['exception' => $e->getMessage()]);
            return response()->json(['message' => __('messages.error')], 500);
        }
    }
    


    public function store(Request $request)
    {
        \Log::info($request->all());
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|unique:flash_sales|max:255',
            'start_time' => 'required|date',
            'end_time' => 'required|date|after:start_time',
            'status' => 'required|in:active,inactive',
            'products' => 'required|array',
            'products.*.product_id' => 'required|exists:products,id',
            'products.*.discount_price' => 'required|integer|min:0',
            'products.*.quantity' => 'required|integer|min:0',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg,webp,apng,avif|max:2048'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 400);
        }

        DB::beginTransaction();

        try {
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

                $existingActiveFlashSale = FlashSaleProduct::where('product_id', $product['product_id'])
                    ->whereHas('flashSale', fn($q) => $q->where('end_time', '>', now()))
                    ->exists();

                if ($existingActiveFlashSale) {
                    DB::rollBack();
                    return response()->json([
                        'message' => __('messages.flash_sale_product_exists'),
                        'product_id' => $product['product_id'],
                    ], 400);
                }

                $sku = ProductSku::where('product_id', $product['product_id'])->first();
                if (!$sku) {
                    DB::rollBack();
                    return response()->json([
                        'message' => __('messages.product_sku_not_found'),
                        'product_id' => $product['product_id'],
                    ], 400);
                }

                if ($product['discount_price'] > $sku->price) {
                    DB::rollBack();
                    return response()->json([
                        'message' => __('messages.discount_price_greater_than_original_price'),
                        'product_id' => $product['product_id'],
                    ], 400);
                }

                $flashSaleProducts[] = [
                    'flash_sale_id' => $flashSale->id,
                    'product_id' => $product['product_id'],
                    'discount_price' => $product['discount_price'],
                    'created_at' => now(),
                    'updated_at' => now(),
                    'quantity' => $product['quantity']
                ];

                Redis::set("flash_sale:product:{$sku->sku}", $product['quantity']);
            }

            FlashSaleProduct::insert($flashSaleProducts);

            DB::commit();

            return response()->json([
                'message' => __('messages.created'),
                'flash_sale' => $flashSale,
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Có lỗi xảy ra', 'error' => $e->getMessage()], 500);
        }
    }

    public function updateStatus(Request $request, $id)
    {
        \Log::info($request->all());

        $fashSale = FlashSale::find($id);
        $validator = Validator::make($request->all(), [
            'status' => 'required|in:active,inactive'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 400);
        }

        $flashSale = FlashSale::find($id);
        if (!$flashSale) {
            return response()->json(['message' => __('messages.not_found')], 404);
        }

        $flashSale->status = $request->status;
        $flashSale->save();

        return response()->json([
            'message' => __('messages.update_status'),
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
        $products = Product::
            where('active', 1)
            ->where('deleted_at', null)
            ->pluck('name', 'id');

        return response()->json($products);
    }
    // Hiển thị danh sách Flash Sale kèm sản phẩm
    public function sales(Request $request)
    {
        try {
            $now = Carbon::now();
    
            $salesQuery = FlashSale::with(['products' => function ($q) {
                $q->select('products.id', 'products.name');
            }]);
    
            // Lọc theo trạng thái
            if ($request->filled('status')) {
                $salesQuery->where('status', $request->status);
            }
    
            // Lọc theo hạn (valid / expired)
            if ($request->filled('expiry')) {
                if ($request->expiry === 'valid') {
                    $salesQuery->where('start_time', '<=', $now)
                               ->where('end_time', '>=', $now);
                } elseif ($request->expiry === 'expired') {
                    $salesQuery->where('end_time', '<', $now);
                }
            }
    
            // Tìm kiếm theo tên
            if ($request->filled('search')) {
                $salesQuery->where('name', 'like', '%' . $request->search . '%');
            }
    
            // Phân trang (10 item mỗi trang)
            $sales = $salesQuery->paginate(10);
    
            // Map lại kết quả
            $result = $sales->getCollection()->map(function ($sale) {
                return [
                    'id' => $sale->id,
                    'name' => $sale->name,
                    'status' => $sale->status,
                    'start_time' => $sale->start_time,
                    'end_time' => $sale->end_time,
                    'image' => $sale->image,
                    'products' => $sale->products->map(function ($product) {
                        return [
                            'id' => $product->id,
                            'name' => $product->name,
                            'discount_price' => $product->pivot->discount_price,
                            'quantity' => $product->pivot->quantity,
                        ];
                    }),
                ];
            });
    
            // Trả về dữ liệu đã map + thông tin phân trang
            $paginatedResult = [
                'data' => $result,
                'current_page' => $sales->currentPage(),
                'last_page' => $sales->lastPage(),
                'per_page' => $sales->perPage(),
                'total' => $sales->total(),
            ];
    
            return response()->json($paginatedResult);
        } catch (\Exception $e) {
            \Log::error('Lỗi khi lấy danh sách Flash Sales', ['exception' => $e->getMessage()]);
            return response()->json(['message' => __('messages.error')], 500);
        }
    }
    

    public function update(Request $request, $id)
    {
        \Log::info($request->all());
        $flashSale = FlashSale::find($id);

        if (!$flashSale) {
            return response()->json(['message' => __('messages.not_found')], 404);
        }

        if ($request->has('start_time')) {
            $request->merge(['start_time' => Carbon::parse($request->start_time)->format('Y-m-d H:i:s')]);
        }

        if ($request->has('end_time')) {
            $request->merge(['end_time' => Carbon::parse($request->end_time)->format('Y-m-d H:i:s')]);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|string|max:255',
            'start_time' => 'sometimes|date',
            'end_time' => 'sometimes|date|after:start_time',
            'status' => 'sometimes|in:active,inactive',
            'products' => 'sometimes|array',
            'products.*.product_id' => 'required_with:products|exists:products,id',
            'products.*.discount_price' => 'required_with:products|integer|min:0',
            'products.*.quantity' => 'required_with:products|integer|min:0',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:2048'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 400);
        }

        if ($request->filled('start_time') && $request->filled('end_time')) {
            if (strtotime($request->start_time) >= strtotime($request->end_time)) {
                return response()->json(['message' => __('messages.end_time_must_be_after_start_time')], 400);
            }
        }

        if ($request->hasFile('image')) {
            $imagePath = $request->file('image')->store('flash_sale_images', 'public');
            $flashSale->image = $imagePath;
        }

        $flashSale->fill($request->only(['name', 'start_time', 'end_time', 'status']));
        $flashSale->save();


        if ($request->has('products')) {

            FlashSaleProduct::where('flash_sale_id', $id)->delete();

            $flashSaleProducts = [];
            foreach ($request->products as $product) {
                $existingFlashSale = FlashSaleProduct::where('product_id', $product['product_id'])
                    ->whereHas('flashSale', function ($query) {
                        $query->where('end_time', '>', now());
                    })
                    ->exists();

                if ($existingFlashSale) {
                    // Nếu có thì rollback và báo lỗi luôn
                    DB::rollBack();
                    return response()->json([
                        'message' => 'Sản phẩm đã tồn tại trong một flash sale khác!',
                        'product_id' => $product['product_id'],
                    ], 400);
                }

                $checkPrice = ProductSku::where('product_id', $product['product_id'])->first();

                if (!$checkPrice || $product['discount_price'] > $checkPrice->price) {
                    return response()->json([
                        'message' => __('messages.discount_price_greater_than_original_price'),
                        'success' => false,
                    ], 400);
                }

                $flashSaleProducts[] = [
                    'flash_sale_id' => $flashSale->id,
                    'product_id' => $product['product_id'],
                    'discount_price' => $product['discount_price'],
                    'quantity' => $product['quantity'],
                ];

                $sku = ProductSku::where('product_id', $product['product_id'])->first();
                if ($sku) {
                    Redis::set("flash_sale:product:{$sku->sku}", $product['quantity']);
                }
            }

            FlashSaleProduct::insert($flashSaleProducts);
        }

        return response()->json([
            'message' => __('messages.updated'),
            'flash_sale' => $flashSale,
        ]);
    }

    public function destroy($id)
    {
        $flashSale = FlashSale::find($id);

        if (!$flashSale) {
            return response()->json(['message' => __('messages.not_found')], 404);
        }

        FlashSaleProduct::where('flash_sale_id', $id)->delete();

        // Xoá chính Flash Sale
        $flashSale->delete();

        return response()->json(['message' => __('messages.deleted')]);
    }

}
