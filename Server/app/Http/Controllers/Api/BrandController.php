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
    public function index(Request $request)
    {
        $this->authorize('viewAny', Brand::class);

        $data = Brand::query();

        if($request->has('name')) {
            $data->where('name', 'like', '%' . $request->name . '%');
        }

        if($request->has('status')) {
            $data->where('status', $request->status);
        }

        $brands = $data->get();
        
        return response()->json(['data' => $brands], 200);
    }

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

        return response()->json(['message' =>__('messages.created'), 'data' => $brand], 201);
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

        return response()->json(['message' => __('messages.updated'), 'data' => $brand], 200);
    }

    // Xóa thương hiệu
    public function destroy($id)
    {
        $brand = Brand::findOrFail($id);

        $this->authorize('delete', $brand);
        $brand->delete();

        return response()->json(['message' =>__('messages.deleted')], 200);
    }

    public function show($id)
    {
        $brand = Brand::findOrFail($id);
        return response()->json(['data' => $brand], 200);
    }
    public function BrandDelete(Request $request){
        $this->authorize('viewAny', Brand::class);

        $brands = Brand::onlyTrashed()->get();

        return response()->json($brands);
    }
    public function restore($id){

        $this->authorize('restore', Brand::class);
        $brand = Brand::onlyTrashed()->findOrFail($id);

        $brand->restore();

        return response()->json(['message' => __('messages.restored')]);
    }
    public function forceDelete($id){
        $this->authorize('forceDelete', Brand::class);

        $brand = Brand::onlyTrashed()->findOrFail($id);

        $brand->forceDelete();

        return response()->json(['message' => __('messages.force_deleted')],200);
    }
}

