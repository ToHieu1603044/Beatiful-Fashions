<?php

namespace App\Policies;

use App\Models\User;
use App\Models\Product;

class ProductPolicy
{
  
    public function viewAny(User $user)
    {
        return $user->hasPermissionTo('view products');
    }

    public function view(User $user, Product $product)
    {
        return $user->hasPermissionTo('view products');
    }
    public function create(User $user)
    {
        return $user->hasPermissionTo('create products');
    }


    public function update(User $user, Product $product)
    {
        return $user->hasPermissionTo('edit products');
    }

    public function delete(User $user, Product $product)
    {
        return $user->hasPermissionTo('delete products');
    }

    public function restore(User $user, Product $product)
    {
        return $user->hasPermissionTo('restore products');
    }

    public function forceDelete(User $user, Product $product)
    {
        return $user->hasPermissionTo('force delete products');
    }
    // app/Policies/ProductPolicy.php

public function viewDeleted(User $user)
{
    return $user->hasPermissionTo('view deleted products');
}


}
