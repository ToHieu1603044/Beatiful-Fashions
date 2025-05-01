<?php

namespace App\Policies;

use App\Models\User;
use App\Models\Product;

class ProductPolicy
{
  
    public function viewAny(User $user)
    {
        return $user->hasPermissionTo('view_product');
    }

    public function view(User $user, Product $product)
    {
        return $user->hasPermissionTo('view_any_product');
    }
    public function create(User $user)
    {
        return $user->hasPermissionTo('create_product');
    }


    public function update(User $user, Product $product)
    {
        return $user->hasPermissionTo('update_product');
    }

    public function delete(User $user, Product $product)
    {
        return $user->hasPermissionTo('delete_product');
    }

    public function restore(User $user, Product $product)
    {
        return $user->hasPermissionTo('restore_product');
    }

    public function forceDelete(User $user, Product $product)
    {
        return $user->hasPermissionTo('force_delete_product');
    }
    // app/Policies/ProductPolicy.php

public function viewDeleted(User $user)
{
    return $user->hasPermissionTo('view_deleted_products');
}


}
