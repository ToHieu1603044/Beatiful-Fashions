<?php

namespace App\Helpers;

class UtilityHelper
{
    // Tạo mã ngẫu nhiên (token)
    public static function generateRandomString($length = 32)
    {
        return bin2hex(random_bytes($length));
    }

    // Kiểm tra số điện thoại có hợp lệ không
    public static function isValidPhoneNumber($phone)
    {
        return preg_match('/^[0-9]{10,15}$/', $phone);
    }

    // Chuyển đổi tiền tệ từ giá trị số
    public static function formatCurrency($amount, $currency = 'VND')
    {
        return number_format($amount, 0, ',', '.') . ' ' . $currency;
    }

    // Thực hiện điều kiện mà không cần kiểm tra trực tiếp
    public static function conditional($condition, $trueValue, $falseValue = null)
    {
        return $condition ? $trueValue : $falseValue;
    }
}
?>
