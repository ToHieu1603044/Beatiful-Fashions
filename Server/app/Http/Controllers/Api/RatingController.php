<?php

namespace App\Http\Controllers\Api;

use App\Models\User;
use App\Models\Product;
use App\Models\Rating;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use App\Events\RatingCreated;
use Illuminate\Support\Facades\DB;

class RatingController extends Controller
{
    use AuthorizesRequests;

    public function index(Request $request)
    {
        $query = Rating::with(['user', 'product', 'replies.user'])
            ->withCount('replies')
            ->whereNull('parent_id')
            ->orderBy('created_at', 'desc');

        if ($request->has('rating')) {
            $query->where('rating', $request->rating);
        }

        if ($request->has('q')) {
            $q = $request->q;
            $query->where('review', 'like', '%' . $q . '%');
        }

        if ($request->has('sort')) {
            $sort = $request->sort;
            if ($sort === 'oldest') {
                $query->orderBy('created_at', 'asc');
            } else {

                $query->orderBy('created_at', 'desc');
            }
        } else {
            $query->orderBy('created_at', 'desc');
        }

        $ratings = $query->get();

        return response()->json([
            'code' => 200,
            'message' => __('messages.success'),
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
            'rating' => null,
        ]);

        return response()->json([
            'code' => 200,
            'message' => __('messages.success'),
        ]);
    }

    public function store(Request $request)
    {
        \Log::info($request->all());
        $request->validate([
            'product_id' => 'required|exists:products,id',
            'rating' => 'required|integer|min:1|max:5',
            'review' => 'nullable|string',
            'order_detail_id' => 'required|exists:order_details,id',
        ]);

        $user = Auth::user();
        \Log::info($user);
        $hasPurchased = \DB::table('orders')
            ->join('order_details', 'orders.id', '=', 'order_details.order_id')
            ->where('orders.user_id', $user->id)
            ->where('order_details.product_id', $request->product_id)
            ->where('orders.tracking_status', '=', 'completed')
            ->exists();
        \Log::info($hasPurchased);
        $isRating = \DB::table('ratings')
            ->where('user_id', $user->id)
            ->where('product_id', $request->product_id)
            ->where('order_detail_id', $request->order_detail_id)
            ->exists();
        if ($isRating) {
            return response()->json(['message' => __('messages.already_rated')], 400);
        }

        if (!$hasPurchased) {
            return response()->json(['message' => __('messages.only_rate_purchased_product')], 403);
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
            'message' => __('messages.rating_success'),
            'data' => $rating
        ], 201);
    }

    public function show($id)
    {
        return Rating::with(['user', 'product'])->findOrFail($id);
    }

    public function update(Request $request, $id)
    {
        $rating = Rating::findOrFail($id);

        $user = Auth::user();

        if ($user->hasRole('admin') && $rating->user_id !== $user->id) {
            return response()->json(['message' => __('messages.unauthorized')], 403);
        }
        if (!$user->hasRole('admin') && $rating->user_id !== $user->id) {
            return response()->json(['message' => __('messages.unauthorized')], 403);
        }

        $request->validate([
            'rating' => 'integer|min:1|max:5',
            'review' => 'nullable|string|max:1000',
        ]);
        $createdAt = $rating->created_at;
        $currentDate = now();

        if ($currentDate->diffInDays($createdAt) > 1) {
            return response()->json(['message' => __('messages.comment_edit_time_expired')], 403);
        }
        $rating->update($request->only('rating', 'review'));

        return response()->json([
            'message' => __('messages.updated'),
        ], 200);
    }


    public function destroy($id)
    {
        $user = Auth::user();

        DB::beginTransaction();

        try {
            $rating = Rating::findOrFail($id);


            if ($user->role !== 'admin' && $rating->user_id !== $user->id) {
                return response()->json(['message' => __('messages.unauthorized')], 403);
            }

            Rating::where('parent_id', $rating->id)->delete();

            $rating->delete();

            DB::commit();

            return response()->json([
                'message' => __('messages.deleted')
            ], 204);

        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'message' => __('messages.error'),
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function ratingByProduct($id)
    {
        $product = Product::findOrFail($id);

        $ratings = $product->ratings()->with(['user'])->get();
        return response()->json([
            'code' => 200,
            'message' => __('messages.success'),
            'data' => $ratings
        ]);
    }

}