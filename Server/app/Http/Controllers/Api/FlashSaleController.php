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

            // Lấy sản phẩm có Flash Sale đang hoạt động và chưa hết hạn
            $products = Product::with('flashSales')
                ->whereHas('flashSales', function ($query) use ($now) {
                    $query->where('status', 'active')
                        //  ->where('start_time', '<=', $now)
                        ->where('end_time', '>=', $now);
                })
                ->get();

            $products->transform(function ($product) use ($now) {
                if ($product->flashSales->isNotEmpty()) {
                    $flashSale = $product->flashSales->first();

                    // Kiểm tra xem flash sale còn hiệu lực không
                    if ($flashSale->end_time >= $now) {
                        $product->sale_price = $flashSale->pivot->discount_price;

                        foreach ($product->skus as $sku) {
                            $sku->sale_price = $flashSale->pivot->discount_price;
                        }
                    } else {
                        // Nếu hết hạn, trả về giá gốc
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
                // Kiểm tra sản phẩm đã có trong flash sale chưa
                $existingFlashSale = FlashSaleProduct::where('product_id', $product['product_id'])
                    ->whereHas('flashSale', function ($query) {
                        $query->where('end_time', '>', now());
                    })
                    ->exists();
    
                if ($existingFlashSale) {
                    DB::rollBack();
                    return response()->json([
                        'message' => __('messages.flash_sale_product_exists'),
                        'product_id' => $product['product_id'],
                    ], 400);
                }
    
                // Lấy giá gốc của sản phẩm từ ProductSku
                $sku = ProductSku::where('product_id', $product['product_id'])->first();
                if (!$sku) {
                    DB::rollBack();
                    return response()->json([
                        'message' => __('messages.product_sku_not_found'),
                        'product_id' => $product['product_id'],
                    ], 400);
                }
    
                // Kiểm tra xem discount_price có lớn hơn giá gốc không
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
    
                // Lưu vào Redis
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
    

    // Cập nhật trạng thái Flash Sale
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
        $sales = FlashSale::with('products:id,name')->get();

        $result = $sales->map(function ($sale) {
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
                        'quantity' => $product->pivot->quantity
                    ];
                }),
            ];
        });

        return response()->json($result);
    }

    // Cập nhật Flash Sale
    public function update(Request $request, $id)
    {
        \Log::info($request->all());
        $flashSale = FlashSale::find($id);

        if (!$flashSale) {
            return response()->json(['message' => __('messages.not_found')], 404);
        }

        // Chuyển đổi thời gian bắt đầu và kết thúc nếu có
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
    // Xoá Flash Sale
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
