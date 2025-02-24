<?php

namespace App\Http\Controllers\Api;

use Illuminate\Http\Request;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use App\Models\User;

class RolePermissionController extends Controller
{
    public function indexRoles()
    {
        $this->authorize('viewAny', Role::class);
        
        return response()->json(Role::all(), 200);

    }

    public function indexPermissions()
    {
        return response()->json(Permission::all(), 200);
    }

    public function createRole(Request $request)
    {
        $this->authorize('create', Role::class);

        $request->validate([
            'name' => 'required|string|unique:roles,name'
        ]);

        $role = Role::create(['name' => $request->name]);


        return response()->json(['message' => 'Role created successfully', 'role' => $role], 201);
    }

    public function createPermission(Request $request)
    {
        $request->validate([
            'name' => 'required|string|unique:permissions,name'
        ]);

        $permission = Permission::create(['name' => $request->name]);

        return response()->json(['message' => 'Permission created successfully', 'permission' => $permission], 201);
    }

    public function assignPermissionToRole(Request $request)
    {

        $request->validate([
            'role_name' => 'required|string|exists:roles,name',
            'permissions' => 'required|array',
            'permissions.*' => 'string|exists:permissions,name'
        ]);

        $role = Role::where('name', $request->role_name)->first();
        $role->givePermissionTo($request->permissions);

        return response()->json(['message' => 'Permissions assigned successfully'], 200);
    }

    public function removePermissionFromRole(Request $request)
    {
        $request->validate([
            'role_name' => 'required|string|exists:roles,name',
            'permission_name' => 'required|string|exists:permissions,name'
        ]);

        $role = Role::where('name', $request->role_name)->first();
        $role->revokePermissionTo($request->permission_name);

        return response()->json(['message' => 'Permission removed successfully'], 200);
    }


    public function assignRoleToUser(Request $request)
    {
        $request->validate([
            'user_id' => 'required|exists:users,id',
            'role_name' => 'required|string|exists:roles,name'
        ]);

        $user = User::find($request->user_id);
        $user->assignRole($request->role_name);

        return response()->json(['message' => 'Role assigned successfully'], 200);
    }

    public function removeRoleFromUser(Request $request)
    {
        $request->validate([
            'user_id' => 'required|exists:users,id',
            'role_name' => 'required|string|exists:roles,name'
        ]);

        $user = User::find($request->user_id);
        $user->removeRole($request->role_name);

        return response()->json(['message' => 'Role removed successfully'], 200);
    }


    public function deleteRole($id)
    {
        $this->authorize('delete', Role::class);

        $role = Role::find($id);
        if (!$role) {
            return response()->json(['message' => 'Role not found'], 404);
        }

        $role->delete();

        return response()->json(['message' => 'Role deleted successfully'], 200);
    }

    public function deletePermission($id)
    {
        $permission = Permission::find($id);
        if (!$permission) {
            return response()->json(['message' => 'Permission not found'], 404);
        }

        $permission->delete();

        return response()->json(['message' => 'Permission deleted successfully'], 200);
    }
  
    public function assignAllPermissionsToRole(Request $request)
    {
        $request->validate([
            'role_name' => 'required|string|exists:roles,name',
        ]);

        $role = Role::where('name', $request->role_name)->firstOrFail();
        $permissions = Permission::pluck('name')->toArray(); 

        $role->syncPermissions($permissions); 
        return response()->json(['message' => 'All permissions assigned successfully'], 200);
    }
  
    public function removeAllPermissionsFromRole(Request $request)
    {
        $request->validate([
            'role_name' => 'required|string|exists:roles,name',
        ]);

        $role = Role::where('name', $request->role_name)->firstOrFail();
        $role->syncPermissions([]); // Xóa hết quyền

        return response()->json(['message' => 'All permissions removed successfully'], 200);
    }

}
