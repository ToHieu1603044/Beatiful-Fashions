<?php

namespace App\Policies;

use App\Models\Product;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class ProductPolicy
{
   
    public function viewAny(User $user): bool
    {
        return $user->hasPermissionTo('manage products');
    }
    
   
    public function view(User $user, Product $product): bool
    {
        return $user->hasPermissionTo('manage products');
    }

  
    public function create(User $user): bool
    {
        return $user->hasPermissionTo('manage products');
    }

    public function update(User $user, Product $product): bool
    {
        return $user->hasPermissionTo('manage products');
    }

    public function delete(User $user, Product $product): bool
    {
        return $user->hasPermissionTo('manage products');
    }
}