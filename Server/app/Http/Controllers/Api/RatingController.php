<?php

namespace App\Http\Controllers\Api;

use App\Models\Product;
use App\Models\Rating;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use App\Events\RatingCreated;

class RatingController extends Controller
{
    use AuthorizesRequests;

    public function index()
    {
        return Rating::with(['user', 'product'])->get();
    }

    public function store(Request $request)
{
    dd($request->all()); // Kiểm tra dữ liệu gửi lên
    $request->validate([
        'product_id' => 'required|exists:products,id',
        'rating' => 'required|integer|min:1|max:5',
        'review' => 'nullable|string',
    ]);

    // Thêm đánh giá mới
    $rating = Rating::create([
        'user_id' => Auth::id(),
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
        $this->authorize('delete', $rating);

        $rating->delete();

        return response()->json(null, 204);
    }
}
