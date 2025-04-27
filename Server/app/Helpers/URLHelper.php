<?php

namespace App\Helpers;

class URLHelper
{
    // Tạo URL đầy đủ từ một đường dẫn
    public static function fullUrl($path)
    {
        return url($path);
    }

    // Tạo URL đầy đủ từ đường dẫn đã mã hóa
    public static function fullSecureUrl($path)
    {
        return secure_url($path);
    }

    // Tạo URL tĩnh cho tài sản (như hình ảnh, css, js)
    public static function assetUrl($path)
    {
        return asset($path);
    }
}
?>
