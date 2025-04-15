<?php

namespace App\Http\Controllers\Api;

use App\Models\Banner;
use App\Models\Slide;
use Illuminate\Http\Request;

class SlideController extends Controller
{
    public function index()
    {
        return response()->json(Slide::all());
    }
    public function slides(){
        $slides = Slide::all();
        $banners = Banner::all();

        $data = [
            'slides' => $slides,
            'banners' => $banners,
        ];

        return response()->json($data);
    }
    public function banners (){
        return response()->json(Banner::get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'images' => 'required|array|size:5',
            'images.*' => 'file|image|max:2048',
            'banners' => 'nullable|array',
            'banners.*' => 'file|image|max:2048',
        ]);
    
        // Lưu ảnh slide
        $imagePaths = [];
        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $image) {
                $path = $image->store('slides', 'public');
                $imagePaths[] = asset('storage/' . $path);
            }
        }
    
        $slide = Slide::create([
            'title' => $request->title ?? null,
            'description' => $request->description ?? null,
            'images' => $imagePaths,
        ]);
    
        // Lưu ảnh banner
        $bannerPaths = [];
        if ($request->hasFile('banners')) {
            foreach ($request->file('banners') as $banner) {
                $path = $banner->store('banners', 'public');
                $bannerPaths[] = asset('storage/' . $path);
            }
        }
    
        $banner = Banner::create([
            'banners' => $bannerPaths,
        ]);
    
        return response()->json([
            'slide' => $slide,
            'banner' => $banner,
        ], 201);
    }
    public function show(Slide $slide)
    {
        return response()->json($slide);
    }
    public function showBanner($id){
        return response()->json(Banner::find($id));
    }
    public function update(Request $request, Slide $slide)
    {
        $validated = $request->validate([
            'title' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'images' => 'required|array',
            'banners' => 'required|array',
            'banners.*' => 'string',
            'images.*' => 'string',
        ]);

        $slide->update($validated);

        return response()->json($slide);
    }

    public function destroy(Slide $slide)
    {
        $slide->delete();
        return response()->json(['message' => 'Slide deleted successfully']);
    }
    public function destroyBanner($id){
        $banner = Banner::find($id);
        $banner->delete();
        return response()->json(['message' => 'Banner deleted successfully']);
    }
    public function select($id)
    {
        // Đặt tất cả slides về chưa chọn
        Slide::query()->update(['select' => 0]);
    
        // Gán select = 1 cho slide mới được chọn
        $slide = Slide::findOrFail($id);
        $slide->select = 1;
        $slide->save();
    
        return response()->json([
            'message' => 'Slide selected successfully',
            'slide' => $slide
        ]);
    }
    public function selectBanner($id)
    {
        // Đặt tất cả slides về chưa chọn
        Banner::query()->update(['select' => 0]);
    
        // Gán select = 1 cho slide mới được chọn
        $banners = Banner::findOrFail($id);
        $banners->select = 1;
        $banners->save();
    
        return response()->json([
            'message' => 'banners selected successfully',
            'banners' => $banners
        ]);
    }
    
    
}
