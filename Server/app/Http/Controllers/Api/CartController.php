<?php

namespace App\Http\Controllers\Api;

use App\Helpers\ApiResponse;
use App\Http\Resources\CartResource;
use App\Models\Cart;
use App\Models\ProductSku;
use Auth;
use Illuminate\Http\Request;

class CartController
{

    public function index(Request $request)
    {
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
            return  CartResource::collection($cart);
            
        } catch (\Exception $e) {
            // Xử lý lỗi nếu có
            return response()->json([
                'message' => 'Có lỗi xảy ra, vui lòng thử lại sau.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
    
    public function store(Request $request)
    {
        $request->validate([
            'sku_id' => 'required|exists:product_skus,id',
            'quantity' => 'required|integer|min:1'
        ]);

        try {
            // Auth::loginUsingId(2); // 2 là ID của user bạn muốn test
            // nếu muốn test thì phải login user trước
            $user = Auth::user();
            $session_id = session()->getId();
    
            $sku = ProductSku::findOrFail($request->sku_id);
    
            if ($sku->stock < $request->quantity) {
                return response()->json([
                    'message' => "Số lượng khó hợp lệ",
                    'data' => []
                ], 200);
            }
            $cart = Cart::updateOrCreate([
                'sku_id' => $request->sku_id,
                'session_id' => $session_id ? $session_id : null,
                'user_id' => $user ? $user->id : null,
    
            ], [
                'quantity' => $request->quantity
            ]);

        return ApiResponse::responseSuccess($cart,200,'Thêm giỏ hàng thành công');
        } catch (\Throwable $th) {
            \Log::error("Lỗi giỏ hàng:", $th->getMessage());

            return ApiResponse::errorResponse(500, $th->getMessage());
        }
    }

    public function update(Request $request, string $id)
    {
        $request->validate([
            'quantity' => 'required|integer|min:1'
        ]);

        $cart = Cart::findOrFail($id);
        if(!$cart){
            return response()->json([
                'message' => 'Không tìm thấy sản phẩm '
            ],200);
        }

        try {
            if($cart->sku->stock < $request->quantity){
                return response()->json([
                    'message'=>'Số lượng trong kho không đủ'
                ],200);
            }

            $cart->update([
                'quantity' => $request->quantity
            ]);
        
            return ApiResponse::responseSuccess('',200);

        } catch (\Throwable $th) {
            \Log::error("Lỗi khi cập nhật giỏ hàng:", $th->getMessage());

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
        ],204);
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
