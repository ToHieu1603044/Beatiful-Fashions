<?php

namespace App\Http\Controllers\Api;
use App\Http\Resources\ProductResource;
use App\Models\Product;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Storage;
use App\Helpers\ApiResponse;
use App\Traits\ApiDataTrait;
use Illuminate\Http\Request;
use App\Models\Category;

class CategoryController extends Controller
{
    use ApiDataTrait;
    use AuthorizesRequests;
    public function index(Request $request)
    {
        $this->authorize('viewAny', Category::class);
        $query = Category::query();

        // Lọc theo tên
        if ($request->has('search') && $request->search) {
            $query->where('name', 'like', '%' . $request->search . '%');
        }

        // Lọc theo danh mục cha (nếu parent_id là số, lọc theo danh mục cha, nếu 'all' thì lấy tất cả)
        if ($request->has('parent_id') && $request->parent_id !== 'all') {
            $query->where('parent_id', $request->parent_id);
        }

        $categories = $query->get();

        // Xây dựng cây danh mục
        $tree = $this->buildCategoryTree($categories);

        return response()->json($tree);
    }
    public function indexWeb(Request $request)
    {

        $query = Category::query()->where('active', 1);

        // Lọc theo tên
        if ($request->has('search') && $request->search) {
            $query->where('name', 'like', '%' . $request->search . '%');
        }

        // Lọc theo danh mục cha (nếu parent_id là số, lọc theo danh mục cha, nếu 'all' thì lấy tất cả)
        if ($request->has('parent_id') && $request->parent_id !== 'all') {
            $query->where('parent_id', $request->parent_id);
        }

        $categories = $query->get();

        // Xây dựng cây danh mục
        $tree = $this->buildCategoryTree($categories);

        return response()->json($tree);
    }
    // public function indexWeb(Request $request)
    // {
    //     $cacheKey = 'categories_' . md5(json_encode($request->all()));

    //     $categories = Cache::remember($cacheKey, 600, function () use ($request) {
    //         $query = Category::query();

    //         if ($request->has('search') && $request->search) {
    //             $query->where('name', 'like', '%' . $request->search . '%');
    //         }

    //         if ($request->has('parent_id') && $request->parent_id !== 'all') {
    //             $query->where('parent_id', $request->parent_id);
    //         }

    //         return $query->get();
    //     });

    //     $tree = $this->buildCategoryTree($categories);

    //     return response()->json($tree);
    // }

    private function buildCategoryTree($categories, $parentId = null)
    {
        return $categories->where('parent_id', $parentId)->map(function ($category) use ($categories) {
            return [
                'id' => $category->id,
                'name' => $category->name,
                'slug' => $category->slug,
                'parent_id' => $category->parent_id,
                'active' => $category->active,
                'image' => $category->image,
                'children' => $this->buildCategoryTree($categories, $category->id),
            ];
        })->values();
    }


    // Thêm danh mục mới
    public function store(Request $request)
    {
        $this->authorize('create', Category::class);

        $request->validate([
            'name' => 'required|string|max:255',
            'parent_id' => 'nullable|exists:categories,id',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:2048',
        ]);

        $imagePath = null;
        if ($request->hasFile('image')) {
            $imagePath = $request->file('image')->store('categories', 'public');
        }

        $category = Category::create([
            'name' => $request->name,
            'slug' => \Str::slug($request->name),
            'image' => $imagePath,
            'parent_id' => $request->parent_id,
        ]);

        return response()->json(['message' => __('messages.category_created')], 201);
    }

    public function update(Request $req, $id)
    {

        $req->validate([
            'name' => 'required|string|max:255',
            'parent_id' => 'nullable|exists:categories,id',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:2048',
        ]);

        // Tìm danh mục theo id
        $category = Category::findOrFail($id);
        
        $this->authorize('update', $category);
        // Xử lý hình ảnh nếu có
        $image_url = null;
        if ($req->hasFile('image')) {
            // Xóa ảnh cũ nếu có
            if ($category->image && Storage::exists('public/' . $category->image)) {
                Storage::delete('public/' . $category->image);
            }

            // Lưu ảnh mới vào thư mục 'images'
            $image_url = $this->bubbleImage($req->file('image'));
        }

        // Cập nhật dữ liệu vào cơ sở dữ liệu
        $category->update([
            'name' => $req->name,
            'slug' => \Str::slug($req->name),
            'parent_id' => $req->parent_id,
            'image' => $image_url,
        ]);

        return response()->json(['message' => __('messages.category_updated'), 'data' => $category]);
    }
    public function CategoryDelete(Request $request)
    {

        $this->authorize('viewAny', Category::class);

        $query = Category::onlyTrashed();

        if ($request->has('search') && $request->search) {
            $query->where('name', 'like', '%' . $request->search . '%');
        }

        // Lọc theo danh mục cha (nếu parent_id là số, lọc theo danh mục cha, nếu 'all' thì lấy tất cả)
        if ($request->has('parent_id') && $request->parent_id !== 'all') {
            $query->where('parent_id', $request->parent_id);
        }

        $tree = $this->buildCategoryTree($query->get());

        return response()->json($tree);
    }
    public function show($id)
    {
     

        $category = Category::with('children')->find($id);

      //  $this->authorize('view', $category);

        if (!$category) {
            return response()->json(['message' => __('messages.category_not_found')], 404);
        }

        return response()->json([
            'id' => $category->id,
            'name' => $category->name,
            'slug' => $category->slug,
            'parent_id' => $category->parent_id,
            'children' => $category->children->map(function ($child) {
                return [
                    'id' => $child->id,
                    'name' => $child->name,
                    'parent_id' => $child->parent_id,
                ];
            }),
        ]);
    }

    public function categoruDetail($id)
    {
        $category = Category::with('children')->find($id);

        if (!$category) {
            return response()->json(['message' => 'Danh mục không tồn tại'], 404);
        }

        return response()->json([
            'id' => $category->id,
            'name' => $category->name,
            'slug' => $category->slug,
            'parent_id' => $category->parent_id,
            'children' => $category->children->map(function ($child) {
                return [
                    'id' => $child->id,
                    'name' => $child->name,
                    'parent_id' => $child->parent_id,
                ];
            }),
        ]);
    }


    private function bubbleImage($file)
    {
        // Tạo tên file ảnh duy nhất để tránh trùng lặp
        $imageName = time() . '.' . $file->getClientOriginalExtension();

        // Lưu ảnh vào thư mục 'images' với tên file duy nhất
        $file->storeAs('images', $imageName, 'public');

        return 'images/' . $imageName;
    }

    public function destroy($id)
    {
        $category = Category::findOrFail($id);
    
        // Kiểm tra xem danh mục có con hay không
        if ($category->children()->count() > 0) {
            return response()->json([
                'message' => __('messages.category_has_children'),
                'success' => false
            ], 400);
        }
    
        $category->delete();
    
        return response()->json([
            'message' => __('messages.category_deleted')
        ], 200);
    }
   
    public function restore($id)
    {

        $category = Category::onlyTrashed()->findOrFail($id);

        $this->authorize('restore', $category);

        $category->restore();

        return response()->json(['message' => __('messages.category_restored')]);
    }
    public function forceDelete($id)
    {
    
        $category = Category::onlyTrashed()->findOrFail($id);
        if(!$category){
            return response()->json(['message' => 'Danh mục khong ton tai'], 404);
        }
        if($category->children()->count() > 0 || $category->products()->count() > 0){
            return response()->json(['message' => __('messages.deleted_failed')], 400);
        }
        $this->authorize('forceDelete', $category);
        if ($category->image && \Storage::exists('public/' . $category->image)) {
            \Storage::delete('public/' . $category->image);
        }
        
        $category->forceDelete();

        return response()->json(['message' => __('messages.force_deleted')]);
    }
    public function getProductsByCategory(Request $request, $id, $slug = null)
    {
        $query = Product::with([
            'brand',
            'category',
            'skus.attributeOptions.attribute',
            'galleries'
        ])->where('category_id', $id)
            ->where('active', 1)
            ->when($request->price_range, function ($q, $range) {
                [$min, $max] = array_map('intval', explode('-', $range));
                $q->whereHas('skus', fn($q) => $q->whereBetween('price', [$min, $max]));
            })
            ->when($request->color, fn($q, $color) => $q->whereHas(
                'skus.attributeOptions',
                fn($q) =>
                $q->whereHas('attribute', fn($q) => $q->where('name', 'color'))->where('value', $color)
            ))
            ->when($request->size, fn($q, $size) => $q->whereHas(
                'skus.attributeOptions',
                fn($q) =>
                $q->whereHas('attribute', fn($q) => $q->where('name', 'size'))->where('value', $size)
            ))
            ->when($request->sortby, function ($q, $sortby) {
                $sorts = [

                    'newest' => ['created_at', 'desc'],
                    'oldest' => ['created_at', 'asc']
                ];
                if (isset($sorts[$sortby]))
                    $q->orderBy(...$sorts[$sortby]);
            })->when($request->price, function ($query, $price) {
                $flag = strtolower($price === 'asc' ? 'asc' : 'desc');

                $query->select('products.*')->addSelect([
                    'min_price' => \DB::table('product_skus')
                        ->select(\DB::raw('MIN(price)'))
                        ->whereColumn('product_skus.product_id', 'products.id')
                ])->groupBy('products.id')
                    ->orderBy('min_price', $flag);
            });

        $products = $query->paginate(10);

        if ($products->isEmpty()) {
            return response()->json(['message' => __('messages.not_found')], 404);
        }

        return ApiResponse::responsePage(ProductResource::collection($products));
    }
    public function updateStatus(Request $request, $id)
    {
        try {
            $category = Category::findOrFail($id);


            $category->active = $request->status;

            $category->save();
            return response()->json(['message' => __('messages.category_status_updated')], 200);
        } catch (\Throwable $th) {
            return response()->json([
                'message' => $th->getMessage()

            ], 500);
        }
    }
}

