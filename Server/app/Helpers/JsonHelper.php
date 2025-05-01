<?php

namespace App\Helpers;

class JsonHelper
{
    // Chuyển đổi một đối tượng hoặc mảng thành JSON
    public static function toJson($data)
    {
        return json_encode($data, JSON_PRETTY_PRINT);
    }

    // Chuyển đổi JSON thành mảng hoặc đối tượng
    public static function fromJson($json)
    {
        return json_decode($json, true);
    }

    // Kiểm tra tính hợp lệ của JSON
    public static function isValidJson($json)
    {
        json_decode($json);
        return (json_last_error() == JSON_ERROR_NONE);
    }
}
?>
