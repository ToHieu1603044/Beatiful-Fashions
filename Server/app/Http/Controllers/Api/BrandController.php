<?php

namespace App\Http\Controllers\Api;
use App\Helpers\ApiResponse;


use App\Http\Controllers\Api\Controller;
use App\Models\Brand;

use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class BrandController extends Controller
{

    use AuthorizesRequests;
    public function index()
    {
        $this->authorize('viewAny', Brand::class);

        $brands = Brand::all();
        return response()->json(['data' => $brands], 200);
    }

    // Thêm thương hiệu mới
    public function store(Request $req)
    {
        $this->authorize('create', Brand::class);

        $validator = Validator::make($req->all(), [
            'name' => 'required|string|max:255',
            'status' => 'required|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $brand = Brand::create($validator->validated());

        return response()->json(['message' => 'Thêm thành công', 'data' => $brand], 201);
    }

    // Cập nhật thương hiệu
    public function update(Request $req, $id)
    {
       
        $brand = Brand::findOrFail($id);
        $this->authorize('update', $brand);
        $validator = Validator::make($req->all(), [
            'name' => 'sometimes|string|max:255',
            'status' => 'sometimes|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $brand->update($validator->validated());

        return response()->json(['message' => 'Cập nhật thành công', 'data' => $brand], 200);
    }

    // Xóa thương hiệu
    public function destroy($id)
    {
        $brand = Brand::findOrFail($id);

        $this->authorize('delete', $brand);
        $brand->delete();

        return response()->json(['message' => 'Xóa thành công'], 200);
    }

    // Lấy thông tin một thương hiệu
    public function show($id)
    {
        $brand = Brand::findOrFail($id);
        return response()->json(['data' => $brand], 200);
    }
}

