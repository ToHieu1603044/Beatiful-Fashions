<?php

namespace App\Http\Controllers\Api;

use App\Helpers\ApiResponse;
use App\Http\Resources\ProductResource;
use App\Models\Product;
use Illuminate\Http\Request;
use App\Models\Wishlist;
use Illuminate\Support\Facades\Auth;

class WishlistController extends Controller
{
    // Hiển thị danh sách sản phẩm yêu thích của user
    public function index(Request $request)
    {
        try {
            $userId = auth()->id(); // Lấy ID user đăng nhập
    
            if (!$userId) {
                return response()->json([
                    'message' => 'Bạn cần đăng nhập để xem danh sách yêu thích',
                    'data' => []
                ], Response::HTTP_UNAUTHORIZED);
            }
    
            // Chỉ lấy các sản phẩm mà user đã yêu thích
            $query = Product::whereHas('wishlists', function ($q) use ($userId) {
                $q->where('user_id', $userId);
            })->with(['brand', 'category', 'skus.attributeOptions', 'galleries', 'wishlists'])
              ->withCount(['wishlists as is_favorite' => function ($q) use ($userId) {
                  $q->where('user_id', $userId);
              }]);
    
            $perPage = request()->query('per_page', 10);
            $data = $query->orderBy('created_at', 'desc')->paginate($perPage);
    
            if ($data->isEmpty()) {
                return response()->json([
                    'message' => 'Không có sản phẩm yêu thích nào',
                    'data' => []
                ], Response::HTTP_OK);
            }
    
            return ApiResponse::responsePage(ProductResource::collection($data));
    
        } catch (\Exception $e) {
            \Log::error('Lỗi lấy danh sách sản phẩm yêu thích', ['exception' => $e->getMessage()]);
            return ApiResponse::errorResponse();
        }
    }
    // Xóa sản phẩm khỏi danh sách yêu thích
    public function destroy($id)
    {
        $wishlist = Wishlist::where('user_id', Auth::id())->where('product_id', $id)->first();

        if ($wishlist) {
            $wishlist->delete();
            return response()->json(['status' => 'success', 'message' => 'Đã xóa sản phẩm khỏi danh sách yêu thích']);
        }

        return response()->json(['status' => 'error', 'message' => 'Sản phẩm không tồn tại trong danh sách yêu thích'], 404);
    }
}
