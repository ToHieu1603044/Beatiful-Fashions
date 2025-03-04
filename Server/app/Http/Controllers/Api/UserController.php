<?php

namespace App\Http\Controllers\Api;

use App\Helpers\ApiResponse;
use App\Http\Controllers\Api\Controller;
use App\Http\Resources\UserResource;
use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class UserController extends Controller
{
    // Lấy danh sách users
    public function index()
    {
       $users = User::all();

       return ApiResponse::responsePage(UserResource::collection($users));
    }

    // Tạo user mới
    public function store(Request $request)
{
    $request->validate([
        'name' => 'required|string|max:255',
        'email' => 'required|string|email|max:255|unique:users',
        'password' => 'required|string|min:6|confirmed',
        
        'phone' => 'nullable|string|max:15',
        'address' => 'nullable|string|max:255',
        'city' => 'nullable|string|max:100',
        'ward' => 'nullable|string|max:100',
        'district' => 'nullable|string|max:100',
        'zip_code' => 'nullable|string|max:10',
        'active' => 'nullable|boolean',
        'roles' => 'nullable|array', 
        'roles.*' => 'string|exists:roles,name',
    ]);

    $user = User::create([
        'name' => $request->name,
        'email' => $request->email,
        'password' => Hash::make($request->password),
        'phone' => $request->phone,
        'address' => $request->address,
        'city' => $request->city,
        'ward' => $request->ward,
        'district' => $request->district,
        'zip_code' => $request->zip_code,
        'active' => $request->active ?? 0, 
    ]);

    if ($request->role) {
        $user->assignRole($request->role);
    }

    return ApiResponse::responseObject(new UserResource($user), 201, 'User created successfully');
}


    // Xem chi tiết user
    public function show($id)
    {
        $user = User::find($id);
        if (!$user) {
            return response()->json(['message' => 'User not found'], 404);
        }
        return ApiResponse::responseObject(new UserResource($user));
    }

    // Cập nhật user
    public function update(Request $request, $id)
    {
        $user = User::findOrFail($id);
    
        $request->validate([
            'name' => 'sometimes|string|max:255',
            'email' => 'sometimes|string|email|max:255|unique:users,email,' . $id,
            'password' => 'sometimes|string|min:6|confirmed',
            'phone' => 'nullable|string|max:15',
            'address' => 'nullable|string|max:255',
            'city' => 'nullable|string|max:100',
            'ward' => 'nullable|string|max:100',
            'district' => 'nullable|string|max:100',
            'zip_code' => 'nullable|string|max:10',
            'active' => 'nullable|boolean',
            'roles' => 'nullable|array', 
            'roles.*' => 'string|exists:roles,name',
        ]);
    
        $user->update([
            'name' => $request->name ?? $user->name,
            'email' => $request->email ?? $user->email,
            'password' => $request->password ? Hash::make($request->password) : $user->password,
            'phone' => $request->phone ?? $user->phone,
            'address' => $request->address ?? $user->address,
            'city' => $request->city ?? $user->city,
            'ward' => $request->ward ?? $user->ward,
            'district' => $request->district ?? $user->district,
            'zip_code' => $request->zip_code ?? $user->zip_code,
            'active' => $request->active ?? $user->active,
        ]);
    
        if ($request->has('role')) {
            $user->syncRoles([$request->role]); 
        }
    
        return response()->json($user, 200);
    }
    

    // Xóa user
    public function destroy($id)
    {
        $user = User::find($id);
        if (!$user) {
            return response()->json(['message' => 'User not found'], 404);
        }

        $user->delete();
        return response()->json(['message' => 'User deleted successfully'], 200);
    }
}
