<?php

namespace App\Http\Controllers\Api;

use App\Models\Post;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
use Exception;

class PostController extends Controller
{
    public function index()
    {
        try {
            $posts = Post::all();
            return response()->json($posts);
        } catch (Exception $e) {
            Log::error('Error fetching posts: ' . $e->getMessage());
            return response()->json(['message' => 'Failed to fetch posts'], 500);
        }
    }

    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'title' => 'required|string|max:255',
                'titleHead' => 'required|string|max:255',
                'description' => 'required|string',
                'image' => 'nullable|file|image|max:2048',
                'publishDate' => 'nullable|date',
                'active' => 'boolean',
            ]);


            if ($request->hasFile('image')) {
                $path = $request->file('image')->store('posts', 'public');
                $validated['image'] = asset('storage/' . $path);
            }

            $post = Post::create($validated);

            return response()->json($post, 201);
        } catch (Exception $e) {
            Log::error('Error creating post: ' . $e->getMessage());
            return response()->json(['message' => 'Failed to create post'], 500);
        }
    }

    public function show(Post $post)
    {
        try {
            return response()->json($post);
        } catch (Exception $e) {
            Log::error('Error fetching single post: ' . $e->getMessage());
            return response()->json(['message' => 'Failed to fetch post'], 500);
        }
    }

    public function update(Request $request, Post $post)
    {
        try {
            $validated = $request->validate([
                'title' => 'sometimes|required|string|max:255',
                'titleHead' => 'sometimes|required|string|max:255',
                'description' => 'sometimes|required|string',
                'image' => 'nullable|file|image|max:2048',
                'publishDate' => 'nullable|date',
                'active' => 'boolean',
            ]);



            if ($request->hasFile('image')) {
                // Xoá ảnh cũ nếu có
                if ($post->image) {
                    $oldPath = str_replace(asset('storage/') . '/', '', $post->image);
                    Storage::disk('public')->delete($oldPath);
                }

                $path = $request->file('image')->store('posts', 'public');
                $validated['image'] = asset('storage/' . $path);
            }

            $post->update($validated);

            return response()->json($post);
        } catch (Exception $e) {
            Log::error('Error updating post: ' . $e->getMessage());
            return response()->json(['message' => 'Failed to update post'], 500);
        }
    }

    public function destroy(Post $post)
    {
        try {
            if ($post->image) {
                $oldPath = str_replace(asset('storage/') . '/', '', $post->image);
                Storage::disk('public')->delete($oldPath);
            }

            $post->delete();
            return response()->json(['message' => 'Post deleted successfully']);
        } catch (Exception $e) {
            Log::error('Error deleting post: ' . $e->getMessage());
            return response()->json(['message' => 'Failed to delete post'], 500);
        }
    }
}
