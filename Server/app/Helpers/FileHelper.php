<?php

namespace App\Helpers;

use Illuminate\Support\Facades\File;

class FileHelper
{
    // Kiểm tra nếu tệp có tồn tại
    public static function fileExists($file)
    {
        return File::exists($file);
    }

    // Tạo thư mục nếu không tồn tại
    public static function createDirectory($directory)
    {
        if (!File::exists($directory)) {
            File::makeDirectory($directory, 0777, true, true);
        }
    }

    // Tải tệp lên hệ thống
    public static function uploadFile($file, $destination)
    {
        return $file->storeAs($destination, $file->getClientOriginalName());
    }

    // Đọc nội dung tệp
    public static function readFile($file)
    {
        return File::get($file);
    }
}
?>
