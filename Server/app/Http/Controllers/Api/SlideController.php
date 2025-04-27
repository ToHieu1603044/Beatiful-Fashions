<?php

namespace App\Http\Controllers\Api;

use App\Models\Banner;
use App\Models\Slide;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

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
                'slides' => Slide::all(),
                'banners' => Banner::all(),
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
                'images' => 'required|array|size:5',
                'images.*' => 'file|image|max:2048',
                'banners' => 'nullable|array',
                'banners.*' => 'file|image|max:2048',
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
            // Validate dữ liệu yêu cầu
            $validated = $request->validate([
                'title' => 'nullable|string|max:255',
                'description' => 'nullable|string',
                'images' => 'nullable|array',
                'banners' => 'nullable|array',
                'banners.*' => 'string',
                'images.*' => 'string',
            ]);
    
            // Xử lý ảnh nếu có
            if ($request->hasFile('images')) {
                $validated['images'] = [];  
                foreach ($request->file('images') as $image) {
                    $path = $image->store('slides', 'public');
                    $validated['images'][] = asset('storage/' . $path);
                }
            }

            $slide->update($validated);
    
            // Xử lý banner nếu có
            if ($request->hasFile('banners')) {
                $validated['banners'] = []; 
                foreach ($request->file('banners') as $banner) {
                    $path = $banner->store('banners', 'public');
                    $validated['banners'][] = asset('storage/' . $path);
                }
    
                $banner = Banner::findOrFail($slide->banner_id);
                $banner->update(['images' => $validated['banners']]);
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
