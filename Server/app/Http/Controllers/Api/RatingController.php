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
        $query = Rating::with(['user', 'product']);
    
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

    public function store(Request $request)
    {
        if (!Auth::check()) {
            return response()->json([
                'message' => 'Bạn phải đăng nhập để đánh giá sản phẩm.'
            ], 401);
        }
    
        $request->validate([
            'product_id' => 'required|exists:products,id',
            'rating' => 'required|integer|min:1|max:5',
            'review' => 'nullable|string',
        ]);
    
        // Kiểm tra xem người dùng đã mua sản phẩm hay chưa
        $user = Auth::user();
        $hasPurchased = $user->orders()
        ->whereHas('orderDetails', function ($query) use ($request) {
            $query->where('sku_id', $request->sku_id); 
        })
        ->exists();
    
        if (!$hasPurchased) {
            return response()->json([
                'message' => 'Bạn chỉ có thể đánh giá sản phẩm mà bạn đã mua.'
            ], 403);
        }
    
        // Thêm đánh giá mới
        $rating = Rating::create([
            'user_id' => $user->id,
            'product_id' => $request->product_id,
            'rating' => $request->rating,
            'review' => $request->review,
        ]);
    
        // Gửi Event để cập nhật total_rating
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

    public function destroy(Rating $rating)
    {
        if (Auth::id() !== $rating->user_id) {
            return response()->json([
                'message' => 'Bạn chỉ có thể xóa đánh giá của chính mình.'
            ], 403);
        }
    
        $rating->delete();
    
        return response()->json([
            'message' => 'Xóa đánh giá thành công!'
        ], 204);
    }
    
}
