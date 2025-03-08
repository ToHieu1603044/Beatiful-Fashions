<?php

namespace App\Policies;

use App\Models\User;
use App\Models\Cart;

class CartPolicy
{
    public function viewAny(User $user)
    {
        return $user->hasPermissionTo('view_any_cart');
    }

    public function view(User $user, Cart $cart)
    {
        return $user->id === $cart->user_id || $user->hasPermissionTo('view_cart');
    }

    public function update(User $user, Cart $cart)
    {
        return $user->id === $cart->user_id || $user->hasPermissionTo('update_cart');
    }

    public function delete(User $user, Cart $cart)
    {
        return $user->id === $cart->user_id || $user->hasPermissionTo('delete_cart');
    }
}
