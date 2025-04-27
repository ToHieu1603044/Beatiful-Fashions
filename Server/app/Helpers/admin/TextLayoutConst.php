<?php 
if (!function_exists('TextLayoutSidebar')) {
    function TextLayoutSidebar($key)
    {
        $const = [
            "overview"              => "Tổng Quan",
            "dashboard"             => "Bảng Điều Khiển",
            "statistical"           => "Bảng Thống Kê",
            "website_management"    => "Quản Lý Website",
            "order"                 => "Đơn Hàng",
            "category"              => "Danh Mục",
            "product"               => "Sản Phẩm",    
            "producer"              => "Nhà Sản Xuất",
            "payment"               => "Thanh Toán",
            "customer"              => "Khách Hàng",
            "staff"                 => "Nhân Viên",
            "discount_code"         => "Mã Giảm Giá",
            "configuration"         => "Cấu Hình Website",
            "setting"               => "Cài Đặt",
            "banner"                => "Banner",
            "reset"                 => "Reset",
            "logout"                => "Đăng Xuất",
            "infomations"           => "Quản Lý Cá Nhân",
            "profile"               => "Hồ Sơ",
            "change_password"       => "Mật Khẩu",
            "administrators"        => "Nhân Sự",
            "category"              => "Danh Mục",
            "color"                 => "Màu Sắc",
            "brand"                 => "Thương Hiệu",
            "payment_method"        => "Cổng Thanh Toán",
            "order"                 => "Đơn Hàng",
            "size"                  => "Kích Thước",
            "setting"               => "Cấu hình",
        ];
        return $const[$key];
    }
}

if (!function_exists('TextLayoutTitle')) {
    function TextLayoutTitle($index)
    {
        $const = [
            "dashboard"             => "Bảng Điều Khiển",
            "statistical"           => "Bảng Thống Kê",
            "order"                 => "Quản Lý Đơn Hàng",
            "category"              => "Danh Mục Sản Phẩm",
            "product"               => "Quản Lý Sản Phẩm",    
            "producer"              => "Quản Lý Nhà Sản Xuất",
            "payment"               => "Quản Lý Thanh Toán",
            "customer"              => "Quản Lý Khách Hàng",
            "staff"                 => "Quản Lý Nhân Viên",
            "discount_code"         => "Quản Lý Mã Giảm Giá",
            "setting"               => "Cài Đặt Website",
            "banner"                => "Cài Đặt Banner",
            "reset"                 => "Làm Mới Website",
            "create_user"           => "Thêm Mới Khách Hàng",
            "create_edit"           => "Chỉnh Sửa Khách Hàng",
            "profile"               => "Hồ Sơ Cá Nhân",
            "change_password"       => "Đổi Mật Khẩu",
            "administrators"        => "Quản Lý Nhân Sự",
            "create_staff"          => "Thêm Mới Nhân Sự",
            "create_product"        => "Thêm Mới Sản Phẩm",
            "create_category"       => "Thêm Mới Danh Mục",
            "edit_category"         => "Chỉnh Sửa Danh Mục",
            "color"                 => "Quản Lý Màu Sắc",
            "edit_color"            => "Chỉnh Sửa Màu Sắc",
            "create_color"          => "Thêm Mới Màu Sắc",
            "create_brand"          => "Thêm Mới Thương Hiệu",
            "edit_brand"            => "Chỉnh Sửa Thương Hiệu",
            "brand"                 => "Quản Lý Thương Hiệu",
            "payment_method"        => "Phương Thức Thanh Toán",
            "order"                 => "Quản Lý Đơn Hàng",
            "order_detail"          => "Thông Tin Đơn Hàng",
            "size"                  => "Quản Lý Kích Thước",
            "create_size"           => "Thêm Mới Kích Thước",
            "edit_size"             => "Chỉnh Sửa Kích Thước",
            "edit_staff"            => "Chỉnh Sửa Nhân Sự",
            "edit_product"          => "Chỉnh Sửa Sản Phẩm",
            "edit_payment"          => "Chỉnh Sửa Phương Thức Thanh Toán"
        ];
        return $const[$index];
    }
}
?>