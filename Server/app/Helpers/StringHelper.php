<?php

namespace App\Helpers;

class StringHelper
{
    // Chuyển đổi chuỗi thành kiểu camelCase
    public static function toCamelCase($string)
    {
        $string = strtolower(str_replace(' ', '', ucwords(str_replace(['-', '_'], ' ', $string))));
        return lcfirst($string);
    }

    // Chuyển đổi chuỗi thành kiểu snake_case
    public static function toSnakeCase($string)
    {
        return strtolower(preg_replace('/[A-Z]/', '_$0', $string));
    }

    // Kiểm tra chuỗi có phải là email hợp lệ không
    public static function isValidEmail($email)
    {
        return filter_var($email, FILTER_VALIDATE_EMAIL) !== false;
    }

    // Cắt chuỗi đến độ dài tối đa
    public static function truncate($string, $length = 100, $suffix = '...')
    {
        return strlen($string) > $length ? substr($string, 0, $length) . $suffix : $string;
    }
}
?>
