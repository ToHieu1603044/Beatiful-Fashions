<?php

namespace App\Http\Controllers\Api;

use App\Models\Banner;
use App\Models\Slide;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class SlideController extends Controller
{
    public function index()
    {
        try {
            return response()->json(Slide::all());
        } catch (\Exception $e) {
            return $this->handleException($e);
        }
    }

    public function slides()
    {
        try {
            $data = [
                'slides' => Slide::
                with('banners')
                ->where('select', 1)->get()
            ];
            return response()->json($data);
        } catch (\Exception $e) {
            return $this->handleException($e);
        }
    }

    public function banners()
    {
        try {
            return response()->json(Banner::all());
        } catch (\Exception $e) {
            return $this->handleException($e);
        }
    }

    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'title' => 'required|string|max:255',
                'description' => 'required|string',
                'images' => 'required|array',
                'images.*' => 'file|image|max:2048',
                'banners' => 'nullable|array',
                'banners.*' => 'file|image|max:2048|size:4',
            ]);

            $imagePaths = [];
            if ($request->hasFile('images')) {
                foreach ($request->file('images') as $image) {
                    $path = $image->store('slides', 'public');
                    $imagePaths[] = asset('storage/' . $path);
                }
            }

            $slide = Slide::create([
                'title' => $request->title,
                'description' => $request->description,
                'images' => $imagePaths,
            ]);

            $bannerPaths = [];
            if ($request->hasFile('banners')) {
                foreach ($request->file('banners') as $banner) {
                    $path = $banner->store('banners', 'public');
                    $bannerPaths[] = asset('storage/' . $path);
                }
            }

            $banner = Banner::create([
                'slide_id' => $slide->id,
                'banners' => $bannerPaths,
            ]);

            return response()->json([
                'slide' => $slide,
                'message' => __('messages.created'),
                'banner' => $banner,
            ], 201);
        } catch (\Exception $e) {
            return $this->handleException($e);
        }
    }

    public function show(Slide $slide)
    {
        try {
            $slide = Slide::with('banners')->findOrFail($slide->id);
            return response()->json($slide);
        } catch (\Exception $e) {
            return $this->handleException($e);
        }
    }

    public function showBanner($id)
    {
        try {
            return response()->json(Banner::findOrFail($id));
        } catch (\Exception $e) {
            return $this->handleException($e);
        }
    }

    public function update(Request $request, Slide $slide)
    {
        \Log::info($request->all());
        try {
         
            $validated = $request->validate([
                'title' => 'nullable|string|max:255',
                'description' => 'nullable|string',
                'images' => 'nullable|array',
                'images.*' => 'string', 
                'banners' => 'nullable|array',
                'banners.*' => 'string', 
            ]);

            if (isset($validated['images'])) {
                $newImages = [];
                foreach ($validated['images'] as $image) {
                    // Nếu là chuỗi base64
                    if (preg_match('/^data:image\/(\w+);base64,/', $image, $matches)) {
                        $imageData = substr($image, strpos($image, ',') + 1);
                        $imageData = base64_decode($imageData);
                        $extension = $matches[1]; 
                        $fileName = 'slide_' . uniqid() . '.' . $extension;
                        $path = 'slides/' . $fileName;
                        Storage::disk('public')->put($path, $imageData);
                        $newImages[] = asset('storage/' . $path);
                    } else {
                        $newImages[] = $image;
                    }
                }
                if ($slide->images) {
                    foreach ($slide->images as $oldImage) {
                        $oldPath = str_replace(asset('storage/'), '', $oldImage);
                        if (Storage::disk('public')->exists($oldPath) && !in_array($oldImage, $newImages)) {
                            Storage::disk('public')->delete($oldPath);
                        }
                    }
                }
                $validated['images'] = $newImages;
            }
    
            // Cập nhật slide
            $slide->update([
                'title' => $validated['title'] ?? $slide->title,
                'description' => $validated['description'] ?? $slide->description,
                'images' => $validated['images'] ?? $slide->images,
            ]);
    
            if (isset($validated['banners'])) {
                $newBanners = [];
                foreach ($validated['banners'] as $banner) {
                    // Nếu là chuỗi base64
                    if (preg_match('/^data:image\/(\w+);base64,/', $banner, $matches)) {
                        $bannerData = substr($banner, strpos($banner, ',') + 1);
                        $bannerData = base64_decode($bannerData);
                        $extension = $matches[1]; // Lấy định dạng ảnh (jpg, png,...)
                        $fileName = 'banner_' . uniqid() . '.' . $extension;
                        $path = 'banners/' . $fileName;
                        Storage::disk('public')->put($path, $bannerData);
                        $newBanners[] = asset('storage/' . $path);
                    } else {
                        // Nếu là URL cũ, giữ nguyên
                        $newBanners[] = $banner;
                    }
                }
    
                // Lấy banner hiện tại của slide (dựa trên cấu trúc dữ liệu: banners là mảng chứa 1 object)
                $bannerData = $slide->banners->first();
                if ($bannerData) {
                    // Xóa ảnh banner cũ nếu có
                    $oldBanners = $bannerData->banners ?? [];
                    foreach ($oldBanners as $oldBanner) {
                        $oldPath = str_replace(asset('storage/'), '', $oldBanner);
                        if (Storage::disk('public')->exists($oldPath) && !in_array($oldBanner, $newBanners)) {
                            Storage::disk('public')->delete($oldPath);
                        }
                    }
    
                    // Cập nhật banner
                    $bannerData->update(['banners' => $newBanners]);
                } else {
                    // Nếu slide chưa có banner, tạo mới
                    Banner::create([
                        'slide_id' => $slide->id,
                        'banners' => $newBanners,
                    ]);
                }
            }
    
            return response()->json([
                'message' => __('messages.updated'),
            ]);
        } catch (\Exception $e) {
            return $this->handleException($e);
        }
    }
    
    public function destroy(Slide $slide)
    {
        try {
            $slide->delete();
            return response()->json(['message' => __('messages.deleted')]);
        } catch (\Exception $e) {
            return $this->handleException($e);
        }
    }

    public function destroyBanner($id)
    {
        try {
            $banner = Banner::findOrFail($id);
            $banner->delete();
            return response()->json(['message' => 'Banner'.__('messages.deleted')]);
        } catch (\Exception $e) {
            return $this->handleException($e);
        }
    }

    public function select($id)
    {
        try {
            Slide::query()->update(['select' => 0]);

            $slide = Slide::findOrFail($id);
            $slide->select = 1;
            $slide->save();

            return response()->json([
                'message' => __('messages.selected'),
                'slide' => $slide
            ]);
        } catch (\Exception $e) {
            return $this->handleException($e);
        }
    }

    public function selectBanner($id)
    {
        try {
            Banner::query()->update(['select' => 0]);

            $banners = Banner::findOrFail($id);
            $banners->select = 1;
            $banners->save();

            return response()->json([
                'message' => __('messages.selected'),
                'banners' => $banners
            ]);
        } catch (\Exception $e) {
            return $this->handleException($e);
        }
    }

    // Xử lý lỗi chung
    private function handleException($e)
    {
        Log::error($e);
        return response()->json([
            'message' => $e->getMessage(),
        ], 500);
    }
}
