<?php

namespace App\Policies;

use App\Models\User;
use App\Models\Order;

class OrderPolicy
{
    public function viewAny(User $user)
    {
        return $user->hasPermissionTo('view_any_order');
    }

    public function view(User $user, Order $order)
    {
        return $user->id === $order->user_id || $user->hasPermissionTo('view_order');
    }

    public function create(User $user)
    {
        return $user->hasPermissionTo('create_order');
    }

    public function update(User $user, Order $order)
    {
        return $user->hasPermissionTo('update_order');
    }

    public function delete(User $user, Order $order)
    {
        return $user->hasPermissionTo('delete_order');
    }

    public function restore(User $user, Order $order)
    {
        return $user->hasPermissionTo('restore_order');
    }

    public function forceDelete(User $user, Order $order)
    {
        return $user->hasPermissionTo('force_delete_order');
    }
}
