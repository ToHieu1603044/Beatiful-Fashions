<?php

namespace App\Http\Controllers\Api;

use App\Models\Banner;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Storage;

class BannerController extends Controller {
    public function index() {
        return response()->json(Banner::all(), Response::HTTP_OK);
    }

    public function store(Request $request) {
        $request->validate([
            'title' => 'required|string|max:255',
            'image' => 'required|image|mimes:jpeg,png,jpg|max:2048',
            'description' => 'nullable|string',
            'status' => 'boolean',
        ]);

        if ($request->hasFile('image')) {
            $imagePath = $request->file('image')->store('banners', 'public');
        }

        $banner = Banner::create([
            'title' => $request->title,
            'image' => $imagePath ?? null,
            'description' => $request->description,
            'status' => $request->status ?? true,
        ]);

        return response()->json($banner, Response::HTTP_CREATED);
    }

    public function show(Banner $banner) {
        return response()->json($banner, Response::HTTP_OK);
    }

    public function update(Request $request, Banner $banner)
    {
        $validatedData = $request->validate([
            'title' => 'sometimes|string|max:255',
            'description' => 'sometimes|string',
            'image' => 'sometimes|image|mimes:jpeg,png,jpg,gif,svg|max:2048',
            'status' => 'sometimes|boolean',
        ]);
    
        // Nếu có ảnh mới, lưu file và cập nhật
        if ($request->hasFile('image')) {
            // Xóa ảnh cũ nếu tồn tại
            if ($banner->image) {
                Storage::disk('public')->delete($banner->image);
            }
            // Lưu ảnh mới
            $path = $request->file('image')->store('banners', 'public');
            $validatedData['image'] = $path;
        }
    
        $banner->update($validatedData);
    
        return response()->json([
            'message' => 'Banner updated successfully',
            'banner' => $banner
        ], 200);
    }
    
    

    public function destroy(Banner $banner) {
        Storage::disk('public')->delete($banner->image);
        $banner->delete();

        return response()->json(['message' => 'Banner deleted successfully'], Response::HTTP_OK);
    }
}
