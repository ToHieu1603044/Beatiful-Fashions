<?php

namespace App\Helpers;

use Illuminate\Support\Facades\Hash;

class HashHelper
{
    // Tạo hash từ mật khẩu
    public static function make($password)
    {
        return Hash::make($password);
    }

    // Kiểm tra mật khẩu có khớp với hash không
    public static function check($password, $hashedPassword)
    {
        return Hash::check($password, $hashedPassword);
    }

    // Kiểm tra một chuỗi có phải là hash hợp lệ không
    public static function needsRehash($hashedPassword)
    {
        return Hash::needsRehash($hashedPassword);
    }
}
?>
