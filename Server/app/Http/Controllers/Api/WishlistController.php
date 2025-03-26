<?php

namespace App\Http\Controllers\Api;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Models\Wishlist;
use App\Models\Product;
use Illuminate\Support\Facades\Auth;


namespace App\Http\Controllers\Api;


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
}
