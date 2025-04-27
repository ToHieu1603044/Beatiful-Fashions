<?php

namespace App\Helpers;

class TextSystemConst
{
    // General messages
    public const EMAIL_EXIST_SYSTEM = "Email đã tồn tại trong hệ thống";
    public const CHANGE_PASSWORD_SUCCESS = "Thay đổi mật khẩu thành công";
    public const PURCHASE_HISTORY = "Lịch Sử Mua Hàng";
    public const DELETE_SUCCESS = "Xóa thành công";
    public const DELETE_FAILED = "Xóa thất bại";
    public const SYSTEM_ERROR = "Có lỗi xảy ra vui lòng thử lại";
    public const CREATE_SUCCESS = "Thêm thành công";
    public const CREATE_FAILED = "Thêm thất bại, hãy thử lại";
    public const UPDATE_SUCCESS = "Chỉnh sửa thông tin thành công";
    public const UPDATE_FAILED = "Chỉnh sửa thất bại, hãy thử lại";
    public const RECORD_NOT_FOUND = "Không tìm thấy bản ghi";
    public const ACTION_FAILED = "Thao tác thất bại";
    public const INVALID_REQUEST = "Yêu cầu không hợp lệ";

    // Password change messages
    public const CHANGE_PASSWORD = [
        'success' => 'Thay đổi mật khẩu thành công',
        'error' => 'Thực hiện thất bại, vui lòng thử lại',
        'password_mismatch' => 'Mật khẩu cũ không đúng',
        'password_strength' => 'Mật khẩu mới cần có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường và số',
    ];

    // Order related messages
    public const ORDER_PROCESSING = "Xử lý đơn hàng thành công";
    public const ORDER_COMPLETED = "Đơn hàng đã hoàn tất";
    public const ORDER_CANCELED = "Đơn hàng đã bị hủy";
    public const ORDER_FAILED = "Có lỗi xảy ra trong quá trình xử lý đơn hàng";
    public const ORDER_SHIPPED = "Đơn hàng đã được gửi";
    public const ORDER_DELIVERED = "Đơn hàng đã được giao";
    public const ORDER_RETURNED = "Đơn hàng đã được trả lại";
    public const ORDER_REFUNDED = "Đơn hàng đã được hoàn tiền";
    public const ORDER_NOT_FOUND = "Không tìm thấy đơn hàng";

    // Cart related messages
    public const ADD_CART_ERROR_QUANTITY = "Số lượng trong kho không đủ";
    public const ADD_CART_SUCCESS = "Thêm sản phẩm vào giỏ hàng thành công";
    public const REMOVE_CART_SUCCESS = "Xóa sản phẩm khỏi giỏ hàng thành công";
    public const REMOVE_CART_FAILED = "Không thể xóa sản phẩm khỏi giỏ hàng";
    
    // User related messages
    public const USER_REGISTER_SUCCESS = "Đăng ký tài khoản thành công";
    public const USER_REGISTER_FAILED = "Đăng ký tài khoản thất bại";
    public const USER_UPDATE_SUCCESS = "Cập nhật thông tin người dùng thành công";
    public const USER_UPDATE_FAILED = "Cập nhật thông tin người dùng thất bại";
    public const USER_NOT_FOUND = "Không tìm thấy người dùng";
    public const USER_ALREADY_ACTIVE = "Tài khoản của bạn đã được kích hoạt";
    public const USER_ACCOUNT_BLOCKED = "Tài khoản của bạn đã bị khóa";

    // Discount related messages
    public const DISCOUNT_CODE_INVALID = "Mã giảm giá không hợp lệ";
    public const DISCOUNT_CODE_EXPIRED = "Mã giảm giá đã hết hạn";
    public const DISCOUNT_CODE_USED = "Mã giảm giá đã được sử dụng";
    public const DISCOUNT_CODE_SUCCESS = "Áp dụng mã giảm giá thành công";

    // Payment related messages
    public const PAYMENT_SUCCESS = "Thanh toán thành công";
    public const PAYMENT_FAILED = "Thanh toán thất bại";
    public const PAYMENT_PENDING = "Thanh toán đang chờ xử lý";
    public const PAYMENT_METHOD_NOT_SUPPORTED = "Phương thức thanh toán không được hỗ trợ";

    // Message related to actions performed on orders
    public const MESS_ORDER_HISTORY = [
        'cancel' => "Bạn đã hủy đơn hàng thành công",
        'confirm' => "Bạn đã nhận hàng thành công",
        'delete' => "Bạn đã xóa đơn hàng thành công",
        'reorder' => "Bạn đã đặt lại đơn hàng thành công",
        'payment_received' => "Thanh toán cho đơn hàng đã được nhận",
        'item_not_available' => "Một số mặt hàng trong đơn hàng của bạn hiện không có sẵn",
    ];

    // Admin/Staff related messages
    public const STAFF_CREATE_SUCCESS = "Nhân viên được tạo thành công";
    public const STAFF_CREATE_FAILED = "Không thể tạo nhân viên, hãy thử lại";
    public const STAFF_UPDATE_SUCCESS = "Cập nhật thông tin nhân viên thành công";
    public const STAFF_UPDATE_FAILED = "Cập nhật thông tin nhân viên thất bại";
    public const STAFF_NOT_FOUND = "Không tìm thấy nhân viên";

    // Account verification messages
    public const EMAIL_VERIFICATION_SENT = "Email xác thực đã được gửi";
    public const EMAIL_VERIFICATION_FAILED = "Xác thực email thất bại";
    public const EMAIL_VERIFIED = "Email đã được xác thực thành công";
    public const EMAIL_VERIFICATION_EXPIRED = "Mã xác thực email đã hết hạn";
    
    // Notification messages
    public const NOTIFICATION_NEW_MESSAGE = "Bạn có một tin nhắn mới";
    public const NOTIFICATION_ORDER_STATUS_UPDATE = "Trạng thái đơn hàng của bạn đã được cập nhật";

    // System maintenance messages
    public const SYSTEM_MAINTENANCE = "Hệ thống đang bảo trì, vui lòng thử lại sau";
    public const SYSTEM_BACK_ONLINE = "Hệ thống đã hoạt động trở lại";

    // Others
    public const GENERAL_ERROR = "Đã có lỗi xảy ra, vui lòng thử lại sau";
    public const MAINTENANCE_MODE = "Chế độ bảo trì đang hoạt động";
    public const MAINTENANCE_MODE_DISABLED = "Chế độ bảo trì đã được tắt";
    public const SESSION_EXPIRED = "Phiên làm việc của bạn đã hết hạn";


     // User Authentication Messages
     public const LOGIN_SUCCESS = "Đăng nhập thành công";
     public const LOGIN_FAILED = "Đăng nhập thất bại, vui lòng kiểm tra lại thông tin";
     public const LOGOUT_SUCCESS = "Đăng xuất thành công";
     public const AUTH_REQUIRED = "Cần phải đăng nhập để tiếp tục";
 
     // Registration related messages
     public const REGISTRATION_SUCCESS = "Đăng ký thành công, vui lòng kiểm tra email để xác thực";
     public const REGISTRATION_FAILED = "Đăng ký thất bại, vui lòng thử lại";
     public const EMAIL_ALREADY_EXISTS = "Email đã tồn tại trong hệ thống, vui lòng chọn email khác";
     public const USERNAME_ALREADY_EXISTS = "Tên đăng nhập đã tồn tại";
 
     // Product related messages
     public const PRODUCT_CREATED = "Sản phẩm được tạo thành công";
     public const PRODUCT_UPDATED = "Sản phẩm được cập nhật thành công";
     public const PRODUCT_DELETED = "Sản phẩm đã được xóa thành công";
     public const PRODUCT_OUT_OF_STOCK = "Sản phẩm này hiện không còn trong kho";
     public const PRODUCT_NOT_FOUND = "Không tìm thấy sản phẩm";
 
     // Order-related messages
     public const ORDER_CREATED = "Đơn hàng đã được tạo thành công";
     public const ORDER_UPDATED = "Thông tin đơn hàng đã được cập nhật";
     public const ORDER_CANCELLED = "Đơn hàng đã bị hủy";
     public const ORDER_ALREADY_SHIPPED = "Đơn hàng đã được vận chuyển";
     public const ORDER_REFUND_REQUESTED = "Đơn hàng yêu cầu hoàn tiền";
     public const ORDER_CONFIRMATION_PENDING = "Đơn hàng đang chờ xác nhận";
 
     // Cart related messages
     public const CART_ITEM_ADDED = "Sản phẩm đã được thêm vào giỏ hàng";
     public const CART_ITEM_REMOVED = "Sản phẩm đã được xóa khỏi giỏ hàng";
     public const CART_UPDATED = "Giỏ hàng của bạn đã được cập nhật";
     public const CART_EMPTY = "Giỏ hàng của bạn hiện tại trống";
 
     // Discount codes
     public const DISCOUNT_APPLIED = "Mã giảm giá đã được áp dụng";
     public const DISCOUNT_EXPIRED = "Mã giảm giá đã hết hạn";
     public const DISCOUNT_NOT_APPLICABLE = "Mã giảm giá không áp dụng cho đơn hàng này";

 
     // Shipping & Delivery
     public const SHIPPING_METHOD_UPDATED = "Phương thức vận chuyển đã được cập nhật";
     public const SHIPPING_ADDRESS_UPDATED = "Địa chỉ giao hàng đã được cập nhật";
     public const DELIVERY_SCHEDULED = "Lịch giao hàng đã được lên lịch";
     public const DELIVERY_COMPLETED = "Đơn hàng đã được giao thành công";
     public const DELIVERY_FAILED = "Giao hàng thất bại, vui lòng thử lại";
 
     // Notification Messages
     public const NEW_NOTIFICATION = "Bạn có thông báo mới";
     public const MARKED_AS_READ = "Thông báo đã được đánh dấu là đã đọc";
     public const NOTIFICATION_ARCHIVED = "Thông báo đã được lưu trữ";
 
     // Account Settings Messages
     public const ACCOUNT_UPDATED = "Thông tin tài khoản đã được cập nhật";
     public const PASSWORD_UPDATED = "Mật khẩu đã được thay đổi";
     public const PROFILE_PICTURE_UPDATED = "Ảnh đại diện đã được thay đổi";
     public const EMAIL_CHANGED = "Email của bạn đã được cập nhật thành công";
 
     // Payment Messages
     public const PAYMENT_SUCCESSFUL = "Thanh toán thành công";
     public const PAYMENT_METHOD_UPDATED = "Phương thức thanh toán đã được cập nhật";
     public const PAYMENT_REFUND_SUCCESS = "Hoàn tiền thành công";
     public const PAYMENT_REFUND_FAILED = "Hoàn tiền thất bại";
 
     // Review and Rating Messages
     public const REVIEW_SUBMITTED = "Đánh giá của bạn đã được gửi";
     public const REVIEW_UPDATED = "Đánh giá đã được cập nhật";
     public const REVIEW_DELETED = "Đánh giá đã bị xóa";
     public const REVIEW_FLAGGED = "Đánh giá đã được báo cáo";
     public const REVIEW_PENDING_APPROVAL = "Đánh giá của bạn đang chờ phê duyệt";
 
     // Security and Two-Factor Authentication
     public const TWO_FACTOR_ENABLED = "Xác thực hai yếu tố đã được bật";
     public const TWO_FACTOR_DISABLED = "Xác thực hai yếu tố đã được tắt";
     public const TWO_FACTOR_ERROR = "Lỗi xác thực hai yếu tố, vui lòng thử lại";
     public const LOGIN_ATTEMPTS_EXCEEDED = "Quá nhiều lần đăng nhập sai, vui lòng thử lại sau";
 
     // Session and Authentication Messages
     public const SESSION_INVALID = "Phiên làm việc không hợp lệ, vui lòng thử lại";
     public const UNAUTHORIZED_ACCESS = "Bạn không có quyền truy cập vào trang này";
     public const ACCESS_DENIED = "Truy cập bị từ chối, vui lòng liên hệ quản trị viên";
 
     // File Upload Messages
     public const FILE_UPLOAD_SUCCESS = "Tải lên tệp thành công";
     public const FILE_UPLOAD_FAILED = "Tải lên tệp thất bại";
     public const INVALID_FILE_TYPE = "Loại tệp không hợp lệ";
     public const FILE_TOO_LARGE = "Tệp quá lớn";
 
     // Other System Messages     public const FEATURE_NOT_AVAILABLE = "Tính năng này hiện không khả dụng";
     public const SERVICE_UNAVAILABLE = "Dịch vụ không có sẵn, vui lòng thử lại sau";
     public const OPERATION_SUCCESSFUL = "Thao tác thành công";
     public const OPERATION_FAILED = "Thao tác thất bại";
}

?>
