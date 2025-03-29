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
     //   $this->authorize('viewAny', Cart::class);
        try {
            $user = Auth::user();
            $session_id = session()->getId(); // Sử dụng session ID cho khách

            // Bắt đầu truy vấn cart với eager loading
            $cartQuery = Cart::with(['sku.product', 'attributeOptions.attribute']);

            // Nếu người dùng đã đăng nhập, lọc theo user_id, nếu không thì theo session_id
            if ($user) {
                $cartQuery->where('user_id', $user->id);
            } else {
                $cartQuery->where('session_id', $session_id);
            }

            // Lấy danh sách cart
            $cart = $cartQuery->get();

            // Kiểm tra xem giỏ hàng có trống không
            if ($cart->isEmpty()) {
                return response()->json([
                    'message' => 'Giỏ hàng của bạn hiện tại trống.',
                    'data' => []
                ], 200);
            }

            // Trả về các item trong giỏ dưới dạng CartResource collection
            return CartResource::collection($cart);

        } catch (\Exception $e) {
            // Xử lý lỗi nếu có
            return response()->json([
                'message' => 'Có lỗi xảy ra, vui lòng thử lại sau.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
    public function countCart(Request $request)
    {
        $user = Auth::user();
        if (!$user) {
            return response()->json([
                'message' => 'Unauthorized',
                'data' => 0,
            ], 401);
        }
    
        $count = Cart::where('user_id', $user->id)->count();
        return response()->json([
            'message' => 'Thành công',
            'data' => $count,
        ], 200);
    }
    
    public function show($id){

    }
    public function store(Request $request)
    {
        $request->validate([
            'sku_id' => 'required|exists:product_skus,id',
            'quantity' => 'required|integer|min:1'
        ]);
    
        try {
            $user = Auth::user();
            $session_id = session()->getId();
            $sku = ProductSku::with('attributeOptions.attribute')->findOrFail($request->sku_id);
    
            if ($sku->stock < $request->quantity) {
                return ApiResponse::errorResponse(422, "Số lượng không hợp lệ, tồn kho còn {$sku->stock}");
            }
    
            $variant_detail = [
                'sku_id' => $sku->id,
                'price' => $sku->price,
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
                    return ApiResponse::errorResponse(422, "Số lượng không hợp lệ, chỉ còn {$sku->stock} sản phẩm trong kho.");
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
    
            return ApiResponse::responseSuccess([], 200, 'Thêm giỏ hàng thành công');
        } catch (\Throwable $th) {
            \Log::error("Lỗi giỏ hàng:", [$th->getMessage()]);
            return ApiResponse::errorResponse(500, "Có lỗi xảy ra, vui lòng thử lại.");
        }
    }
    

    public function update(Request $request, string $id)
    {
        $request->validate([
            'quantity' => 'required|integer|min:1'
        ]);

        $cart = Cart::findOrFail($id);
        if (!$cart) {
            return response()->json([

                'message' => 'Không tìm thấy sản phẩm '
            ], 200);
        }

        try {

            if ($cart->sku->stock < $request->quantity) {
                return response()->json([
                    'message' => 'Số lượng trong kho không đủ'
                ], 200);
                $sku = $cart->sku;

                }

                $cart->update([
                    'quantity' => $request->quantity
                ]);
                return ApiResponse::responseSuccess('', 200);

                return ApiResponse::responseSuccess('', 200, 'Cập nhật giỏ hàng thành công');

            }
        catch (\Throwable $th) {
            \Log::error("Lỗi khi cập nhật giỏ hàng:", [$th->getMessage()]);

            return ApiResponse::errorResponse(500, $th->getMessage());
        }
    }

    public function destroy(string $id)
    {
        $cart = Cart::findOrFail($id);

        try {
            $cart->delete();

            return response()->json([
                'message' => 'Xóa thành công',
            ], 204);
        } catch (\Throwable $th) {
            \Log::error("Lỗi giỏ hàng:", $th->getMessage());

            return ApiResponse::errorResponse(500, $th->getMessage());
        }
    }
    public function clearCart()
    {
        try {
            // Auth::loginUsingId(2); // 2 là ID của user bạn muốn test
            $user = Auth::user();
            $session_id = session()->getId();

            if (!$user) {
                return response()->json([
                    'message' => "Bạn chưa đăng nhập"
                ], 401);
            }

            // Xóa toàn bộ giỏ hàng của user hoặc session_id
            Cart::where('user_id', $user->id)
                ->orWhere('session_id', $session_id)
                ->delete();

            return response()->json([
                'message' => 'Đã xóa toàn bộ giỏ hàng thành công'
            ], 200);
        } catch (\Throwable $th) {
            \Log::error("Lỗi khi xóa toàn bộ giỏ hàng:", [$th->getMessage()]);
            return ApiResponse::errorResponse(500, $th->getMessage());
        }
    }
}