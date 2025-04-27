<?php

namespace App\Http\Controllers\Api;

use App\Models\Post;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Exception;

class PostController extends Controller
{
    public function index()
    {
        try {
            return response()->json(Post::all());
        } catch (Exception $e) {
            Log::error('Error fetching posts: ' . $e->getMessage());
            return response()->json(['message' => __('messages.error')], 500);
        }
    }

    public function store(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'title' => 'required|string|max:255',
                'titleHead' => 'required|string|max:255',
                'description' => 'required|string',
                'image' => 'nullable|image|max:2048',
                'publishDate' => 'nullable|date',
                'active' => 'boolean',
            ]);

            if ($validator->fails()) {
                return response()->json(['errors' => $validator->errors()], 422);
            }

            $data = $validator->validated();

            if ($request->hasFile('image')) {
                $data['image'] = $this->uploadImage($request->file('image'));
            }

            $post = Post::create($data);
            return response()->json($post, 201);
        } catch (Exception $e) {
            Log::error('Error creating post: ' . $e->getMessage());
            return response()->json(['message' => __('messages.error')], 500);
        }
    }

    public function show(Post $post)
    {
        try {
            return response()->json($post);
        } catch (Exception $e) {
            Log::error('Error fetching post: ' . $e->getMessage());
            return response()->json(['message' => __('messages.error')], 500);
        }
    }

    public function update(Request $request, Post $post)
    {
        try {
            $validator = Validator::make($request->all(), [
                'title' => 'sometimes|required|string|max:255',
                'titleHead' => 'sometimes|required|string|max:255',
                'description' => 'sometimes|required|string',
                'image' => 'nullable|image|max:2048',
                'publishDate' => 'nullable|date',
                'active' => 'boolean',
            ]);

            if ($validator->fails()) {
                return response()->json(['errors' => $validator->errors()], 422);
            }

            $data = $validator->validated();

            if ($request->hasFile('image')) {
                // Xoá ảnh cũ
                $this->deleteImage($post->image);
                // Upload ảnh mới
                $data['image'] = $this->uploadImage($request->file('image'));
            }
           

            $post->update($data);
            return response()->json($post);
        } catch (Exception $e) {
            Log::error('Error updating post: ' . $e->getMessage());
            return response()->json(['message' => __('messages.error')], 500);
        }
    }

    public function destroy(Post $post)
    {
        try {
            $this->deleteImage($post->image);
            $post->delete();
            return response()->json(['message' => __('messages.deleted')]);
        } catch (Exception $e) {
            Log::error('Error deleting post: ' . $e->getMessage());
            return response()->json(['message' => __('messages.error')], 500);
        }
    }

    private function uploadImage($file)
    {
        $path = $file->store('posts', 'public');
        return asset('storage/' . $path);
    }

    private function deleteImage($imageUrl)
    {
        if ($imageUrl) {
            $filePath = str_replace(asset('storage/') . '/', '', $imageUrl);
            Storage::disk('public')->delete($filePath);
        }
    }
}
