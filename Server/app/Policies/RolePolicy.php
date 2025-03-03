<?php

namespace App\Policies;

use App\Models\User;
use Spatie\Permission\Models\Role;

class RolePolicy
{
 
    public function viewAny(?User $user)
    {
        if (!$user) {
            \Log::error('User is null in RolePolicy::viewAny');
            return false;
        }
    
        \Log::info("User {$user->id} checking permission: view_roles");
        return $user->hasPermissionTo('view_any_role','api');
    }
    

    public function view(User $user, Role $role)
    {
        return $user->hasPermissionTo('view_role');
    }

    public function create(User $user)
    {
        return $user->hasPermissionTo('create_role');
    }

    public function update(User $user, Role $role)
    {
        return $user->hasPermissionTo('edit_role','api');
    }

    public function delete(User $user, Role $role)
    {
        if ($role->name === 'admin') {
            return false;
        }
        return $user->hasPermissionTo('delete_role','api');
    }

    public function assignPermissions(User $user, Role $role)
    {
        return $user->hasPermissionTo('assign_permissions','api');
    }
}