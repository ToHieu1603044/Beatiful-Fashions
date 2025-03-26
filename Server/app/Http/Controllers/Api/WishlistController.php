<?php

namespace App\Http\Controllers\Api;

use Illuminate\Http\Request;
use App\Models\Wishlist;
use Illuminate\Support\Facades\Auth;

class WishlistController extends Controller
{
    // Hiển thị danh sách sản phẩm yêu thích của user
    public function index()
    {
        $wishlists = Wishlist::where('user_id', Auth::id())->with('product')->get();

        return response()->json([
            'status' => 'success',
            'wishlists' => $wishlists
        ]);
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
