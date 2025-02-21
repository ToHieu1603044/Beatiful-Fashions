<?php

namespace App\Http\Controllers\Api;
use Illuminate\Support\Facades\Storage;

use App\Helpers\ApiResponse;
use App\Traits\ApiDataTrait;
use Illuminate\Http\Request;
use App\Models\Category;
use App\Models\Product;

class CategoryController extends Controller
{
    use ApiDataTrait;
    // Lấy danh mục theo dạng cây
    public function index(Request $request)
    {
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
    
    // Hàm tạo cây danh mục
    private function buildCategoryTree($categories, $parentId = null)
    {
        return $categories->where('parent_id', $parentId)->map(function ($category) use ($categories) {
            return [
                'id' => $category->id,
                'name' => $category->name,
                'slug' => $category->slug,
                'parent_id' => $category->parent_id,
                'children' => $this->buildCategoryTree($categories, $category->id),
            ];
        })->values();
    }
    

    // Thêm danh mục mới
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'parent_id' => 'nullable|exists:categories,id',
        ]);

        $category = Category::create([
            'name' => $request->name,
            'slug' => \Str::slug($request->name),
            'image' => null, // Nếu có upload ảnh thì xử lý thêm ở đây
            'parent_id' => $request->parent_id,
        ]);

        return response()->json(['message' => 'Danh mục đã được tạo!', 'category' => $category]);
    }

    public function update(Request $req, $id)
    {
    
        $req->validate([
            'name' => 'required|string|max:255',
            'parent_id' => 'nullable|exists:categories,id',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:2048', // Kiểm tra ảnh hợp lệ
        ]);

        // Tìm danh mục theo id
        $category = Category::findOrFail($id);

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

        return response()->json(['message' => 'Danh mục đã được cập nhật thành công', 'data' => $category]);
    }
    public function show($id)
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

   
    if ($category->children()->count() > 0) {
        return response()->json(['message' => 'Không thể xoá danh mục vì có danh mục con'], 400);
    }

    if ($category->image && Storage::exists('public/' . $category->image)) {
        Storage::delete('public/' . $category->image);
    }

    $category->delete();

    return response()->json(['message' => 'Danh mục đã được xoá']);
}

public function getProductsByCategory(Request $request, $id, $slug = null)
{
    // Kiểm tra danh mục có tồn tại không
    $categoryQuery = Category::where('id', $id);
    
    if ($slug) {
        $categoryQuery->where('slug', $slug);
    }

    $category = $categoryQuery->first();

    if (!$category) {
        return response()->json(['message' => 'Danh mục không tồn tại'], 404);
    }

    // Truy vấn sản phẩm theo danh mục
    $query = Product::where('category_id', $id);

    // Lọc theo khoảng giá từ bảng product_skus
    if ($request->has('price_range')) {
        $priceRange = explode('-', $request->price_range);
        if (count($priceRange) == 2) {
            $minPrice = (int)$priceRange[0];
            $maxPrice = (int)$priceRange[1];

            $query->whereHas('skus', function ($q) use ($minPrice, $maxPrice) {
                $q->whereBetween('price', [$minPrice, $maxPrice]);
            });
        }
    }

    // Lọc theo màu sắc
    if ($request->has('color')) {
        $query->whereHas('skus.attributeOptions', function ($q) use ($request) {
            $q->whereHas('attribute', function ($q2) {
                $q2->where('name', 'color');
            })->where('value', $request->color);
        });
    }

    // Lọc theo kích thước
    if ($request->has('size')) {
        $query->whereHas('skus.attributeOptions', function ($q) use ($request) {
            $q->whereHas('attribute', function ($q2) {
                $q2->where('name', 'size');
            })->where('value', $request->size);
        });
    }

    // Sắp xếp sản phẩm theo yêu cầu
    if ($request->has('sortby')) {
        switch ($request->sortby) {
            case 'price_min:asc':
                $query->with(['skus' => function ($q) {
                    $q->orderBy('price', 'asc');
                }]);
                break;
            case 'price_max:desc':
                $query->with(['skus' => function ($q) {
                    $q->orderBy('price', 'desc');
                }]);
                break;
            case 'newest':
                $query->orderBy('created_at', 'desc'); // Mới nhất
                break;
            case 'oldest':
                $query->orderBy('created_at', 'asc'); // Cũ nhất
                break;
        }
    }

    // Phân trang (10 sản phẩm mỗi trang)
    $products = $query->paginate(10);

    return response()->json([
        'category' => [
            'id' => $category->id,
            'name' => $category->name,
            'slug' => $category->slug,
        ],
        'products' => $products
    ]);
}



}
