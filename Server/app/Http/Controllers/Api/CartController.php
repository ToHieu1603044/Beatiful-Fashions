<?php

namespace App\Http\Controllers\Api;

use App\Helpers\ApiResponse;
use App\Http\Resources\CartResource;
use App\Models\Cart;
use App\Models\ProductSku;
use Auth;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\Request;

class CartController
{
    use AuthorizesRequests;

    public function index(Request $request)
    {
        try {
            $user = Auth::user();
            $session_id = session()->getId();
    
            $cartQuery = Cart::with([
                'sku.product' => function ($query) {
                    $query->withTrashed(); // Lấy cả sản phẩm đã xóa mềm
                },
                'attributeOptions.attribute',
                'product' => function ($query) {
                    $query->withTrashed();
                }
            ]);
    
            if ($user) {
                $cartQuery->where('user_id', $user->id);
            } else {
                $cartQuery->where('session_id', $session_id);
            }
    
            $cart = $cartQuery->get();
    
            if ($cart->isEmpty()) {
                return response()->json([
                    'message' => __('messages.cart_empty'),
                    'data' => []
                ], 200);
            }
    
            return CartResource::collection($cart);
        } catch (\Exception $e) {
            return response()->json([
               'message' => __('messages.error_occurred'),
                'error' => $e->getMessage(),
            ], 500);
        }
    }
    public function countCart(Request $request)
    {
        \Log::info($request->all());
    
        $user = auth()->user();
    
        if (!$user) {
            return response()->json([
                'message' => __('messages.unauthorized'),
                'data' => 0,
            ], 401);
        }
    
        $count = Cart::where('user_id', $user->id)->count();
    
        return response()->json([
            'message' => __('messages.success'),
            'data' => $count,
            'user_id' => $user->id
        ], 200);
    }
    

    public function show($id)
    {

    }
    public function store(Request $request)
    {
       \Log::info($request->all());
       \Log::info("Giỏ hàng", ['request' => $request->attributes]);
        $request->validate([
            'sku_id' => 'required|exists:product_skus,id',
            'quantity' => 'required|integer|min:1'
        ]);

        try {
            $user = Auth::user();
            $session_id = session()->getId();
            $sku = ProductSku::with('attributeOptions.attribute','product')->findOrFail($request->sku_id);

            if ($sku->product->active != 1) {
                return ApiResponse::errorResponse(422, __("messages.product_not_available"));
            }

            if ($sku->stock < $request->quantity) {
                return ApiResponse::errorResponse(422, __("messages.stock_not_available", ['stock' => $sku->stock]));
            }   
            $skuAttributes = $sku->attributeOptions->mapWithKeys(function ($option) {
                return [$option->attribute->name => $option->value];
            })->toArray();
            foreach ($request->attributes as $attribute => $value) {
                if (!isset($skuAttributes[$attribute]) || $skuAttributes[$attribute] !== $value) {
                    return ApiResponse::errorResponse(422, __("messages.attribute_not_selected", ['attribute' => $attribute, 'value' => $value]));
                }
            }    
            $now = now();

            $flashSale = $sku->product->flashSales()
                ->where('flash_sales.status', 'active')
                ->where('flash_sales.start_time', '<=', $now)
                ->where('flash_sales.end_time', '>=', $now)
                ->whereHas('products', function ($query) use ($sku) {
                    $query->where('flash_sale_products.product_id', $sku->product_id)

                          ->where('flash_sale_products.quantity', '>', 0);
                })
                ->first();
            
            $flashSalePrice = $flashSale
                ? $flashSale->products
                    ->where('id', $sku->product->id)
                    ->first()
                    ?->pivot
                    ?->discount_price
                : 0;
            
            $variant_detail = [
                'sku_id' => $sku->id,
                'price' => $sku->price,
                'price_sale' => $flashSalePrice ?? 0,
                'stock' => $sku->stock,
                'attributes' => $sku->attributeOptions->mapWithKeys(function ($option) {
                    return [$option->attribute->name ?? 'unknown' => $option->value ?? 'unknown'];
                })->toArray(),
                'product' => $sku->product
            ];

            $cartItem = Cart::where('sku_id', $request->sku_id)
                ->where(function ($query) use ($user, $session_id) {
                    if ($user) {
                        $query->where('user_id', $user->id);
                    } else {
                        $query->where('session_id', $session_id);
                    }
                })->first();

            if ($cartItem) {

                $newQuantity = $cartItem->quantity + $request->quantity;

                if ($newQuantity > $sku->stock) {
                    return ApiResponse::errorResponse(422,'Stock not available' );
                }

                $cartItem->update([
                    'quantity' => $newQuantity,
                    'variant_detail' => json_encode($variant_detail, JSON_UNESCAPED_UNICODE)
                ]);
            } else {

                Cart::create([
                    'sku_id' => $request->sku_id,
                    'user_id' => $user ? $user->id : null,
                    'session_id' => $user ? null : $session_id,
                    'quantity' => $request->quantity,
                    'variant_detail' => json_encode($variant_detail, JSON_UNESCAPED_UNICODE)
                ]);
            }

            return ApiResponse::responseSuccess([], __('messages.item_added_success'),200);
        } catch (\Throwable $th) {
            \Log::error("Lỗi giỏ hàng:", [$th->getMessage()]);
            return ApiResponse::errorResponse(500, __("messages.error_occurred"));
        }
    }
    public function update(Request $request, string $id)
    {
        \Log::info($request->all());
        $request->validate([
            'quantity' => 'required|integer|min:1'
        ]);

        $cart = Cart::findOrFail($id);
        if (!$cart) {
            return response()->json([
                'message' => __('messages.product_not_found')
            ], 200);
        }
        \Log::info("Giỏ hàngsss", ['cart' => $cart]);
        try {
           
            
            if ($cart->sku->stock < $request->quantity) {
                \Log::info("Giỏ hàngaaa", ['cart' => $cart->sku]); 
                return response()->json([
                    'message' => __('messages.stock_not_available')
                ], 400);
                $sku = $cart->sku;

            }
            $detail = json_decode($cart->variant_detail);

            if (!$detail || !$detail->product || $detail->product->active != 1 || $detail->product->deleted_at !== null) {
                return ApiResponse::errorResponse(422, __("messages.product_unavailable"));
            }
            
            $cart->update([
                'quantity' => $request->quantity
            ]);
            return ApiResponse::responseSuccess('', 200);

            return ApiResponse::responseSuccess('', 200, __('messages.cart_updated_success'));

        } catch (\Throwable $th) {
            \Log::error("Lỗi khi cập nhật giỏ hàng:", [$th->getMessage()]);

            return ApiResponse::errorResponse(500, __("messages.error_occurred"));
        }
    }

    public function destroy(string $id)
    {
        $cart = Cart::findOrFail($id);

        try {
            $cart->delete();

            return response()->json([
                'message' => __('messages.deleted'),
            ], 204);
        } catch (\Throwable $th) {
            \Log::error("Lỗi giỏ hàng:", $th->getMessage());

            return ApiResponse::errorResponse(500, $th->getMessage());
        }
    }
    public function clearCart()
    {
        try {

            $user = Auth::user();
            $session_id = session()->getId();

            if (!$user) {
                return response()->json([
                    'message' => __('messages.authentication')
                ], 401);
            }

            // Xóa toàn bộ giỏ hàng của user hoặc session_id
            Cart::where('user_id', $user->id)
                ->orWhere('session_id', $session_id)
                ->delete();

            return response()->json([
                'message' => __('messages.deleted')
            ], 200);
        } catch (\Throwable $th) {
            \Log::error("Lỗi khi xóa toàn bộ giỏ hàng:", [$th->getMessage()]);
            return ApiResponse::errorResponse(500, $th->getMessage());
        }
    }
}