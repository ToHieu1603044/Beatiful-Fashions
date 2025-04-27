<?php

namespace App\Helpers;

use Carbon\Carbon;

class DateHelper
{
    // Lấy ngày giờ hiện tại theo múi giờ
    public static function now($timezone = 'Asia/Ho_Chi_Minh')
    {
        return Carbon::now($timezone);
    }

    // Chuyển đổi định dạng ngày
    public static function formatDate($date, $format = 'd/m/Y')
    {
        return Carbon::parse($date)->format($format);
    }

    // Kiểm tra nếu một ngày đã qua
    public static function isPast($date)
    {
        return Carbon::parse($date)->isPast();
    }

    // Lấy khoảng thời gian giữa hai ngày
    public static function diffInDays($date1, $date2)
    {
        return Carbon::parse($date1)->diffInDays($date2);
    }
}
?>
