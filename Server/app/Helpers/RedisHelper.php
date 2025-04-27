<?php

namespace App\Helpers;

use Illuminate\Support\Facades\Redis;

class RedisHelper
{
    public static function setData($key, $value, $ttl = 60)
    {
        Redis::setex($key, $ttl * 60, $value);
    }

    public static function getData($key)
    {
        $data = Redis::get($key);

        if ($data) {
            return json_decode($data, true);
        }

        return null;
    }

    public static function deleteData($key)
    {
        Redis::del($key);
    }
}
