<?php

namespace App\Policies;

use App\Models\User;
use App\Models\Category;

class CategoryPolicy
{
    public function viewAny(User $user)
    {
        return $user->hasPermissionTo('view_any_category');
    }

    public function view(User $user, Category $category)
    {
        return $user->hasPermissionTo('view_category');
    }

    public function create(User $user)
    {
        return $user->hasPermissionTo('create_category');
    }

    public function update(User $user, Category $category)
    {
        return $user->hasPermissionTo('update_category');
    }

    public function delete(User $user, Category $category)
    {
        return $user->hasPermissionTo('delete_category');
    }

    public function restore(User $user, Category $category)
    {
        return $user->hasPermissionTo('restore_category');
    }

    public function forceDelete(User $user, Category $category)
    {
        return $user->hasPermissionTo('force_delete_category');
    }
}

