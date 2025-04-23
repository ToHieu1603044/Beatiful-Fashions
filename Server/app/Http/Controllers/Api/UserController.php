<?php

namespace App\Http\Controllers\Api;

use App\Helpers\ApiResponse;
use App\Http\Controllers\Api\Controller;
use App\Http\Resources\UserResource;
use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Auth;


class UserController extends Controller
{
    // Lấy danh sách users
    public function index()
    {
        // Check thử xem cache có không
        if (Cache::has('users')) {
            logger('✅ Cache tồn tại: users');
        } else {
            logger('❌ Không có cache users');
        }

        $users = User::withoutTrashed()->get();

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


        if ($request->has('roles')) {
            $roles = \Spatie\Permission\Models\Role::whereIn('name', $request->roles)->get();
            $user->syncRoles($roles);




            return response()->json($user, 201);
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


        if ($request->has('roles')) {
            $roles = \Spatie\Permission\Models\Role::whereIn('name', $request->roles)->get();
            $user->syncRoles($roles);
        }
    }


    // Xóa user
    public function destroy($id)
    {
        $user = User::find($id);
        
        if (!$user) {
            return response()->json(['message' => 'User not found'], 404);
        }
        if($user->hasRole('admin')) {
            return response()->json(['message' => 'Cannot delete admin user'], 400);
        }

        $user->delete();
        return response()->json(['message' => 'User deleted successfully'], 200);
    }


    public function profile(Request $request)
    {

        $user = $request->user();

        // Trả về thông tin người dùng
        return ApiResponse::responseObject(new UserResource($user));
    }

    public function updateProfile(Request $request)
    {
        $request->validate([
            'phone' => 'nullable|string|max:15',
            'address' => 'nullable|string|max:255',
            'city' => 'nullable|string|max:100',
            'district' => 'nullable|string|max:100',
            'ward' => 'nullable|string|max:100',
        ]);

        $user = Auth::user();
        $user->update($request->only(['phone', 'address', 'city', 'district', 'ward']));

        return response()->json(['message' => 'Cập nhật thành công!', 'user' => $user]);
    }

    //Đổi mật khẩu
    public function changePassword(Request $request)
    {
        $request->validate([
            'oldPassword' => 'required',
            'newPassword' => 'required|min:6|confirmed',
        ]);

        $user = Auth::user();

        if (!Hash::check($request->oldPassword, $user->password)) {
            return response()->json(['message' => 'Mật khẩu cũ không đúng!'], 400);
        }

        $user->password = Hash::make($request->newPassword);
        $user->save();

        return response()->json(['message' => 'Đổi mật khẩu thành công!']);
    }


}