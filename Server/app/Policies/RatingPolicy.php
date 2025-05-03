<?php

namespace App\Policies;

use App\Models\Rating;
use App\Models\User;

class RatingPolicy
{
    public function viewAny(User $user)
    {
        return $user->hasPermissionTo('view_any_rating');
    }

    public function view(User $user, Rating $rating)
    {
        return $user->hasPermissionTo('view_rating');
    }

    public function create(User $user)
    {
        return $user->hasPermissionTo('create_rating');
    }

    public function update(User $user, Rating $rating)
    {
        return $user->hasPermissionTo('update_rating');
    }

    public function delete(User $user, Rating $rating)
    {
        return $user->hasPermissionTo('delete_rating');
    }

    public function restore(User $user, Rating $rating)
    {
        return $user->hasPermissionTo('restore_rating');
    }

    public function forceDelete(User $user, Rating $rating)
    {
        return $user->hasPermissionTo('force_delete_rating');
    }
}
