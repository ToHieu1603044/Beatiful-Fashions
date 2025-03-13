<?php

namespace App\Policies;

use App\Models\User;
use App\Models\Brand;

class BrandPolicy
{
    public function viewAny(User $user)
    {
        return $user->hasPermissionTo('view_any_brand');
    }

    public function view(User $user, Brand $brand)
    {
        return $user->hasPermissionTo('view_brand');
    }

    public function create(User $user)
    {
        return $user->hasPermissionTo('create_brand');
    }

    public function update(User $user, Brand $brand)
    {
        return $user->hasPermissionTo('update_brand');
    }

    public function delete(User $user, Brand $brand)
    {
        return $user->hasPermissionTo('delete_brand');
    }

    public function restore(User $user, Brand $brand)
    {
        return $user->hasPermissionTo('restore_brand');
    }

    public function forceDelete(User $user, Brand $brand)
    {
        return $user->hasPermissionTo('force_delete_brand');
    }
}
