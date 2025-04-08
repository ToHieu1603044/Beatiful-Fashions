<?php

namespace App\Http\Controllers\Api;

use App\Helpers\ApiResponse;
use App\Http\Resources\ProductResource;
use App\Models\Product;
use App\Http\Controllers\Api\Controller;
use App\Helpers\ApiResponse;
use App\Http\Resources\ProductResource;
use App\Traits\ApiDataTrait;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;

use App\Models\Wishlist;
use App\Models\Product;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Auth;




class WishlistController extends Controller
{

    // Hiển thị danh sách sản phẩm yêu thích của user
    public function index(Request $request)
    {
        try {
            $userId = auth()->id();

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
                ->withCount([
                    'wishlists as is_favorite' => function ($q) use ($userId) {
                        $q->where('user_id', $userId);
                    }
                ]);

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

    // Thêm sản phẩm vào danh sách yêu thích
    public function store(Request $request)
    {
        $request->validate([
            'product_id' => 'required|exists:products,id'
        ]);

        $wishlist = Wishlist::firstOrCreate([
            'user_id' => Auth::id(),
            'product_id' => $request->product_id
        ]);

        return response()->json([
            'status' => 'success',
            'wishlist' => $wishlist,
            'message' => 'Sản phẩm đã được thêm vào danh sách yêu thích'
        ], 201);

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
    public function getFavorites()
    {
        if (!Auth::check()) {
            return response()->json([
                'status' => 'success',
                'product_id' => [],
            ]);
        }
    
        $user_id = Auth::id();
        $favoriteIds = Wishlist::where('user_id', $user_id)->pluck('product_id');
    
        return response()->json([
            'status' => 'success',
            'product_id' => $favoriteIds,
        ]);
    }
    
    public function toggleFavorite(Request $request)
    {
        $request->validate([
            'product_id' => 'required|exists:products,id',
        ]);

        $user_id = Auth::id();
        $product_id = $request->product_id;

        $wishlist = Wishlist::where('user_id', $user_id)->where('product_id', $product_id)->first();

        if ($wishlist) {
            $wishlist->delete();
            $isFavorite = false;
        } else {
            Wishlist::create([
                'user_id' => $user_id,
                'product_id' => $product_id,
            ]);
            $isFavorite = true;
        }

        return response()->json([
            'status' => 'success',
            'is_favorite' => $isFavorite,
        ]);
    }


}
