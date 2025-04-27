<?php

namespace App\Helpers;

class ArrayHelper
{
    // Kiểm tra nếu mảng có chứa một phần tử cụ thể
    public static function hasKey(array $array, $key)
    {
        return array_key_exists($key, $array);
    }

    // Sắp xếp mảng theo một cột chỉ định
    public static function sortByColumn(array $array, $column)
    {
        usort($array, function ($a, $b) use ($column) {
            return $a[$column] <=> $b[$column];
        });

        return $array;
    }

    // Chuyển mảng thành chuỗi có phân cách
    public static function implode(array $array, $separator = ',')
    {
        return implode($separator, $array);
    }
}
?>
