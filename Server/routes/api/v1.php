<?php

use App\Http\Controllers\Api\AttributeController;
use App\Http\Controllers\Api\AttributeOptionController;
use App\Http\Controllers\Api\BrandController;
use App\Http\Controllers\Api\CartController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\DiscountController;
use App\Http\Controllers\Api\FlashSaleController;
use App\Http\Controllers\Api\LocationController;
use App\Http\Controllers\Api\MoMoController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\OrderReturnController;
use App\Http\Controllers\Api\PdfController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\RatingController;
use App\Http\Controllers\Api\RolePermissionController;
use App\Http\Controllers\Api\UserController;

use App\Models\Order;
// use Barryvdh\DomPDF\Facade\Pdf;

use App\Http\Controllers\Api\BannerController;
use App\Http\Controllers\Api\SlideController;

use App\Http\Controllers\Api\WishlistController;

use Illuminate\Support\Facades\Http;
use Illuminate\Http\Request;
use App\Models\Product;
use Illuminate\Support\Facades\Route;
use SebastianBergmann\CodeCoverage\Report\Html\Dashboard;
Route::get('/', function () {
    return 'Hello World';
});
//Web
Route::get('/momo/callback', [MoMoController::class, 'callback']);
Route::get('/search', [ProductController::class, 'search']);
Route::get('/products/web', [ProductController::class, 'indexWeb']);
Route::get('/products/web/{id}/', [ProductController::class, 'productDetail']);
Route::get('/products/categories/{id}', [CategoryController::class, 'getProductsByCategory']);
Route::get('/categories/web', [CategoryController::class, 'indexWeb']);
Route::get('/categories/web{id}/', [CategoryController::class, 'categoryDetail']);
//Dis
Route::get('/provinces', function () {
    $response = Http::get("https://provinces.open-api.vn/api/p/");
    return response()->json($response->json());
});
Route::post('/ghn/calculate-fee', [LocationController::class, 'calculateShippingFee']);

Route::get('/provinces/{province}', function (Request $request, $province) {
    $depth = $request->query('depth', 1);
    $response = Http::get("https://provinces.open-api.vn/api/p/{$province}", [
        'depth' => $depth
    ]);
    return response()->json($response->json());
});

Route::get('/districts/{district}', function (Request $request, $district) {
    $depth = $request->query('depth', 1);
    $response = Http::get("https://provinces.open-api.vn/api/d/{$district}", [
        'depth' => $depth
    ]);
    return response()->json($response->json());
});
Route::get('/ghn/provinces', [LocationController::class, 'provinces']);
Route::post('/ghn/districts', [LocationController::class, 'districts']);
Route::post('/ghn/wards', [LocationController::class, 'wards']);

//Auth
Route::post('/login', [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']);
Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
Route::post('/reset-password', [AuthController::class, 'resetPasswords'])->name('password.reset');

Route::middleware(['auth:sanctum'])->group(function () {

    Route::get('/orders/invoice', [PdfController::class, 'index']);
    Route::get('carts/count', [CartController::class, 'countCart']);
    Route::apiResource('carts', CartController::class);
    Route::delete('carts', [CartController::class, 'clearCart']);

    Route::post('discounts/apply', [DiscountController::class, 'applyDiscount']);
    Route::get('/orders/{id}/return-details', [OrderController::class, 'fetchReturnDetails']);
    Route::post('redeem-points', [DiscountController::class, 'redeemPointsForVoucher']);
    Route::post('resetPassword', [AuthController::class, 'resetPassword']);
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::post('/refresh', [AuthController::class, 'refreshToken']);
    Route::get('/profile', [AuthController::class, 'profile']);
    Route::get('/orders/users', [OrderController::class, 'orderUser']);
    Route::get('products/trash', [ProductController::class, 'productDelete'])->middleware('role:admin');
    Route::post('/momo/payment', [MoMoController::class, 'createPayment']);

    Route::get('list-discount-for-user', [DiscountController::class, 'listDiscountForUser']);
    Route::post('redeem-points-for-voucher', [DiscountController::class, 'redeemPointsForVoucher']);
    Route::get('redeem-points', [DiscountController::class, 'redeemPoints']);
    //order
    Route::patch('/order-returns/{id}/status/user', [OrderReturnController::class, 'updateStatusUser']);
    Route::get('/orders/returns/user', [OrderReturnController::class, 'returnItemUser']);
    Route::delete('/orders/{id}/cancel', [OrderReturnController::class, 'cancelOrderReturn']);
    Route::get('/orders/list', [OrderController::class, 'orderUser']);

    //Notification
    Route::post('/notifications/{id}/read', [NotificationController::class, 'markAsRead']);
    Route::delete('/notifications/{id}', [NotificationController::class, 'deleteNotification']);
    Route::get('/notifications', [NotificationController::class, 'getNotification']);
    Route::post('/notifications', [NotificationController::class, 'store']);
});

Route::middleware(['auth:sanctum', 'role:admin|manager'])->group(function () {

    Route::get('discounts', [DiscountController::class, 'index']);
    Route::post('discounts', [DiscountController::class, 'store']);
    Route::get('orders/returns', [OrderReturnController::class, 'index']);
    Route::patch('/order-returns/{id}/status', [OrderReturnController::class, 'updateStatus']);

    Route::get('dashboard/stats', [DashboardController::class, 'stats']);
    Route::get('/dashboard/revenue', [DashboardController::class, 'revenueStats']);

    Route::apiResource('slides', SlideController::class); //Slide
    // User
    Route::get('/users', [UserController::class, 'index']);

    Route::post('/users', [UserController::class, 'store']); // Thêm user mới
    Route::get('/users/{id}', [UserController::class, 'show']); // Xem chi tiết user
    Route::put('/users/{id}', [UserController::class, 'update']); // Cập nhật user
    Route::delete('/users/{id}', [UserController::class, 'destroy']); // Xóa user
    Route::get('/listUsers', [App\Http\Controllers\Api\AuthController::class, 'listUser']);

    // Route::get('/users', [App\Http\Controllers\Api\AuthController::class, 'index']);

    //Products
    Route::get('products', [ProductController::class, 'index']);
    Route::post('/products', [ProductController::class, 'store']);
    Route::delete('/products/{id}', [ProductController::class, 'destroy']);
    Route::get('/products/{id}', [ProductController::class, 'show']);
    Route::put('/products/{id}', [ProductController::class, 'update']);
    Route::patch('/products/{id}/restore', [ProductController::class, 'restore']);
    Route::patch('/products/{id}/restore', [ProductController::class, 'restore']);
    Route::put('/products/{id}/update-status', [ProductController::class, 'status']);
    //Categories
    Route::apiResource('categories', CategoryController::class);
    Route::put('/categories/{id}', [CategoryController::class, 'update']);
    Route::put('/categories/{id}', [CategoryController::class, 'update']);
    Route::apiResource('brands', BrandController::class);

    //Attribute
    Route::apiResource('attributes', AttributeController::class);
    Route::apiResource('attribute-options', AttributeOptionController::class);
    Route::apiResource('attributes', AttributeController::class);
    Route::apiResource('attribute-options', AttributeOptionController::class);

    //Cart
    Route::apiResource('carts', CartController::class);

    //Order
    Route::apiResource('orders', OrderController::class);
    Route::get('/orders/list-deleted', [OrderController::class, 'listDeleted']);
    Route::get('/orders/restore/{id}', [OrderController::class, 'restore']);
    Route::delete('/orders/force-delete/{id}', [OrderController::class, 'forceDelete']);
    Route::put('/orders/{id}/update-status', [OrderController::class, 'updateStatus']);
    Route::put('/orders/{id}/canceled', [OrderController::class, 'destroys']);
    Route::put('/orders/{id}/confirm-order', [OrderController::class, 'confirmOrder']);
    Route::post('/orders/{orderId}/return', [OrderReturnController::class, 'returnItem']);
    Route::get('/product-sku/{id}', [AttributeController::class, 'productSku']);
    Route::get('/sku', [AttributeController::class, 'sku']);

    Route::get('/roles', [RolePermissionController::class, 'indexRoles']);
    Route::get('/permissions', [RolePermissionController::class, 'indexPermissions']);

    // Tạo role & permission
    Route::post('/roles', [RolePermissionController::class, 'createRole'])->middleware('role:admin');
    Route::post('/permissions', [RolePermissionController::class, 'createPermission'])->middleware('role:admin');

    // Gán & xóa permission cho role
    Route::post('/roles/assign-permissions', [RolePermissionController::class, 'assignPermissionToRole'])->middleware('role:admin');
    Route::post('/roles/remove-permission', [RolePermissionController::class, 'removePermissionFromRole'])->middleware('role:admin');

    // Gán & xóa role cho user
    Route::post('/users/assign-role', [RolePermissionController::class, 'assignRoleToUser'])->middleware('role:admin');
    Route::post('/users/remove-role', [RolePermissionController::class, 'removeRoleFromUser'])->middleware('role:admin');

    // Xóa role & permission
    Route::delete('/roles/{role}', [RolePermissionController::class, 'deleteRole'])->middleware('role:admin');
    Route::delete('/permissions/{id}', [RolePermissionController::class, 'deletePermission'])->middleware('role:admin');

    // Route::post('/roles/{id}/assign-all-permissions', [RolePermissionController::class, 'assignAllPermissionsToRole']);

    Route::post('/roles/{id}/update-permissions', [RolePermissionController::class, 'updatePermissions'])->middleware('role:admin');

    Route::post('/roles/remove-all-permissions', [RolePermissionController::class, 'removeAllPermissionsFromRole'])->middleware('role:admin');

    Route::get('/roles/{id}/permissions', [RolePermissionController::class, 'getRolePermissions'])->middleware('role:admin');

    Route::patch('/products/{id}/restore', [ProductController::class, 'restore']);

    Route::get('/flash-sales', [FlashSaleController::class, 'index']);
});

// Cho phép tất cả mọi người xem danh sách và chi tiết đánh giá
Route::get('/ratings', [RatingController::class, 'index']);
Route::get('/ratings/{rating}', [RatingController::class, 'show']);
Route::get('/ratings/product/{id}', [RatingController::class, 'ratingByProduct']);
Route::get('/ratings/user/{user_id}', [RatingController::class, 'getByUser']);

// Yêu cầu đăng nhập mới được tạo, cập nhật, xóa đánh giá
Route::middleware(['auth:sanctum'])->group(function () {
    Route::post('/ratings', [RatingController::class, 'store']);
    Route::put('/ratings/{rating}', [RatingController::class, 'update']);
    Route::delete('/ratings/{rating}', [RatingController::class, 'destroy']);
});

Route::apiResource('banners', BannerController::class);
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/wishlist', [WishlistController::class, 'index']); // Hiển thị sản phẩm yêu thích
    Route::post('/wishlist/{product_id}', [WishlistController::class, 'store']); // Thêm sản phẩm vào danh sách yêu thích
    Route::delete('/wishlist/{id}', [WishlistController::class, 'destroy']); // Xóa sản phẩm yêu thích
});

?>