<?php

namespace App\Helpers;

use Illuminate\Support\Facades\Cache;

class CacheHelper
{
    public static function getData($key, $callback, $ttl = 60)
    {
        $data = Cache::get($key);

        if (!$data) {
            $data = $callback();
            Cache::put($key, $data, $ttl);
        }

        return $data;
    }

    public static function clearCache($key)
    {
        Cache::forget($key);
    }
}
