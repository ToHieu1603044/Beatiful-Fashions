<?php

namespace App\Policies;

use App\Models\FlashSale;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class FlashSalePolicy
{
    public function viewAny(User $user)
    {
        return $user->hasPermissionTo('view_any_flash_sale');
    }

    public function view(User $user, FlashSale $flashSale)
    {
        return $user->hasPermissionTo('view_flash_sale');
    }

    public function create(User $user)
    {
        return $user->hasPermissionTo('create_flash_sale');
    }

    public function update(User $user, FlashSale $flashSale)
    {
        return $user->hasPermissionTo('update_flash_sale');
    }

    public function delete(User $user, FlashSale $flashSale)
    {
        return $user->hasPermissionTo('delete_flash_sale');
    }

    public function restore(User $user, FlashSale $flashSale)
    {
        return $user->hasPermissionTo('restore_flash_sale');
    }

    public function forceDelete(User $user, FlashSale $flashSale)
    {
        return $user->hasPermissionTo('force_delete_flash_sale');
    }
}
