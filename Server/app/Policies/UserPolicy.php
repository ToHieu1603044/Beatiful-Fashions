<?php

namespace App\Policies;

use App\Models\User;

class UserPolicy
{
    public function view(User $user)
    {
        return $user->hasPermissionTo('view_user');
    }

    public function viewAny(User $user)
    {
        return $user->hasPermissionTo('view_any_user');
    }

    public function create(User $user)
    {
        return $user->hasPermissionTo('create_user');
    }

    public function update(User $user)
    {
        return $user->hasPermissionTo('update_user');
    }

    public function delete(User $user)
    {
        return $user->hasPermissionTo('delete_user');
    }

    public function deleteAny(User $user)
    {
        return $user->hasPermissionTo('delete_any_user');
    }

    public function restore(User $user)
    {
        return $user->hasPermissionTo('restore_user');
    }

    public function restoreAny(User $user)
    {
        return $user->hasPermissionTo('restore_any_user');
    }

    public function forceDelete(User $user)
    {
        return $user->hasPermissionTo('force_delete_user');
    }

    public function forceDeleteAny(User $user)
    {
        return $user->hasPermissionTo('force_delete_any_user');
    }
}

