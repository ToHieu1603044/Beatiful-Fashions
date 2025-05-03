<?php

namespace App\Policies;

use App\Models\Setting;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class SettingPolicy
{
    public function update(User $user)
    {
        return $user->hasPermissionTo('settings');
    }
}
