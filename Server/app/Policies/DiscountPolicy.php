<?php

namespace App\Policies;

use App\Models\Discount;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class DiscountPolicy
{
    public function viewAny(User $user)
    {
        return $user->hasPermissionTo('view_any_discount');
    }

    public function view(User $user, Discount $discount)
    {
        return $user->hasPermissionTo('view_discount');
    }

    public function create(User $user)
    {
        return $user->hasPermissionTo('create_discount');
    }

    public function update(User $user, Discount $discount)
    {
        return $user->hasPermissionTo('update_discount');
    }

    public function delete(User $user, Discount $discount)
    {
        return $user->hasPermissionTo('delete_discount');
    }

    public function restore(User $user, Discount $discount)
    {
        return $user->hasPermissionTo('restore_discount');
    }

    public function forceDelete(User $user, Discount $discount)
    {
        return $user->hasPermissionTo('force_delete_discount');
    }
}
