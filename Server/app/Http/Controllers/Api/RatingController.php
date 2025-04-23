<?php

namespace App\Http\Controllers\Api;

use App\Models\User;
use App\Models\Product;
use App\Models\Rating;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use App\Events\RatingCreated;

class RatingController extends Controller
{
    use AuthorizesRequests;

    public function index(Request $request)
    {
        // Khởi tạo truy vấn với quan hệ user và product (nếu cần)
        $query = Rating::with(['user', 'product', 'replies.user'])
            ->withCount('replies')
            ->whereNull('parent_id')
            ->orderBy('created_at', 'desc');

        // Lọc theo rating (nếu có truyền, ví dụ ?rating=4)
        if ($request->has('rating')) {
            $query->where('rating', $request->rating);
        }

        // Tìm kiếm trong trường review nếu có tham số q (ví dụ: ?q=good)
        if ($request->has('q')) {
            $q = $request->q;
            $query->where('review', 'like', '%' . $q . '%');
        }

        // Sắp xếp theo thời gian
        // Nếu có truyền tham số sort = newest hoặc oldest, nếu không mặc định là newest
        if ($request->has('sort')) {
            $sort = $request->sort;
            if ($sort === 'oldest') {
                $query->orderBy('created_at', 'asc');
            } else {
                // newest hoặc giá trị khác mặc định là newest
                $query->orderBy('created_at', 'desc');
            }
        } else {
            $query->orderBy('created_at', 'desc');
        }

        // Nếu cần phân trang:
        // $ratings = $query->paginate(10);
        // return response()->json($ratings);

        $ratings = $query->get();

        return response()->json([
            'code' => 200,
            'message' => 'success',
            'data' => $ratings
        ]);
    }
    public function reply(Request $request, $id)
    {
        $request->validate([
            'content' => 'required|string',
        ]);

        $rating = Rating::findOrFail($id);

        $reply = Rating::create([
            'user_id' => auth()->id(), // admin hoặc seller
            'product_id' => $rating->product_id,
            'review' => $request->content,
            'parent_id' => $rating->id,
            'rating' => null, // vì là reply, không cần điểm số
        ]);

        return response()->json($reply);
    }

    public function store(Request $request)
    {
        $request->validate([
            'product_id' => 'required|exists:products,id',
            'rating' => 'required|integer|min:1|max:5',
            'review' => 'nullable|string',
            'order_detail_id' => 'required|exists:order_details,id',
        ]);

        $user = Auth::user();

        $hasPurchased = \DB::table('orders')
            ->join('order_details', 'orders.id', '=', 'order_details.order_id')
            ->where('orders.user_id', $user->id)
            ->where('order_details.product_id', $request->product_id)
            ->where('orders.status', 'completed')
            ->exists();
        $isRating = \DB::table('ratings')
            ->where('user_id', $user->id)
            ->where('product_id', $request->product_id)
            ->where('order_detail_id', $request->order_detail_id)
            ->exists();
        if ($isRating) {
            return response()->json(['message' => 'Bạn đã đánh giá sản phẩm này rồi'], 400);
        }

        if (!$hasPurchased) {
            return response()->json(['message' => 'Bạn chỉ có thể đánh giá sản phẩm đã mua.'], 403);
        }

        // Thêm đánh giá mới
        $rating = Rating::create([
            'user_id' => $user->id,
            'product_id' => $request->product_id,
            'rating' => $request->rating,
            'order_detail_id' => $request->order_detail_id,
            'review' => $request->comment,
        ]);

        event(new RatingCreated($rating));

        return response()->json([
            'message' => 'Đánh giá thành công!',
            'data' => $rating
        ], 201);
    }

    public function show($id)
    {
        return Rating::with(['user', 'product'])->findOrFail($id);
    }

    public function update(Request $request, Rating $rating)
    {
        $this->authorize('update', $rating);

        $request->validate([
            'rating' => 'integer|min:1|max:5',
            'review' => 'nullable|string',
        ]);

        $rating->update($request->only('rating', 'review'));

        return response()->json($rating);
    }

    public function destroy($id)
    {

        $user = Auth::user();

        $rating = Rating::findOrFail($id);

        if ($rating->user_id !== $user->id) {
            return response()->json(['message' => 'Bạn không có quyền xóa đánh giá này.'], 403);
        }


        $rating->delete();

        return response()->json([
            'message' => 'Xóa đánh giá thành công!'
        ], 204);
    }

    public function ratingByProduct($id)
    {
        $product = Product::findOrFail($id);

        $ratings = $product->ratings()->with(['user'])->get();
        return response()->json([
            'code' => 200,
            'message' => 'success',
            'data' => $ratings
        ]);
    }

}