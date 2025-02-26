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
        return $user->hasPermissionTo('view_any_role');
    }
    

    public function view(User $user, Role $role)
    {
        return $user->hasPermissionTo('view role');
    }

    public function create(User $user)
    {
        return $user->hasPermissionTo('create role');
    }

    public function update(User $user, Role $role)
    {
        return $user->hasPermissionTo('edit role');
    }

    public function delete(User $user, Role $role)
    {
        return $user->hasPermissionTo('delete role');
    }

    public function assignPermissions(User $user, Role $role)
    {
        return $user->hasPermissionTo('assign permissions');
    }
}
