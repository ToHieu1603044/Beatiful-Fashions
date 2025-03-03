<?php

use App\Http\Controllers\Api\AttributeController;
use App\Http\Controllers\Api\AttributeOptionController;
use App\Http\Controllers\Api\BrandController;
use App\Http\Controllers\Api\CartController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\DiscountController;
use App\Http\Controllers\Api\MoMoController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\ProductController;

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\RolePermissionController;
use App\Http\Controllers\Api\UserController;

use App\Models\Product;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return 'Hello World';
});

Route::get('/products/web', [ProductController::class, 'indexWeb']);
Route::get('/products/web/{id}/', [ProductController::class, 'productDetail']);
Route::get('/products/categories/{id}', [CategoryController::class, 'getProductsByCategory']);
Route::get('/categories/web', [CategoryController::class, 'indexWeb']);
Route::get('/categories/web{id}/', [CategoryController::class, 'categoryDetail']);

Route::post('/register', [AuthController::class, 'register']);

Route::post('/login', [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']);
Route::apiResource('discounts', DiscountController::class);
Route::post('discounts', [DiscountController::class, 'applyDiscount']);

Route::get('/momo/callback', [MoMoController::class, 'callback']);
Route::middleware(['auth:sanctum', 'role:admin|manager'])->group(function () {


    Route::patch('/products/{id}/restore', [ProductController::class, 'restore']);

    Route::get('/users', [UserController::class, 'index']); // Lấy danh sách users
    Route::post('/users', [UserController::class, 'store']); // Thêm user mới
    Route::get('/users/{id}', [UserController::class, 'show']); // Xem chi tiết user
    Route::put('/users/{id}', [UserController::class, 'update']); // Cập nhật user
    Route::delete('/users/{id}', [UserController::class, 'destroy']); // Xóa user

    Route::apiResource('carts', CartController::class);
    Route::delete('carts', [CartController::class, 'clearCart']);

    Route::post('/logout', [AuthController::class, 'logout']);

    Route::post('/refresh', [AuthController::class, 'refreshToken']);

    Route::get('/listUsers', [App\Http\Controllers\Api\AuthController::class, 'listUser']);

    Route::get('/users', [App\Http\Controllers\Api\AuthController::class, 'index']);
// route dành cho fontend muốn xem thông tin cá nhân của chính mình
    Route::get('/user', [AuthController::class, 'userProfile']);

    Route::get('products', [ProductController::class, 'index']);
    Route::post('/products', [ProductController::class, 'store']);
    Route::delete('/products/{id}', [ProductController::class, 'destroy']);
    Route::get('/products/{id}', [ProductController::class, 'show']);
    Route::put('/products/{id}', [ProductController::class, 'update']);

    Route::apiResource('attributes', AttributeController::class);
    Route::apiResource('attribute-options', AttributeOptionController::class);

    Route::apiResource('brands', BrandController::class);
    Route::apiResource('categories', CategoryController::class);

    Route::put('/categories/{id}', [CategoryController::class, 'update']);
    Route::apiResource('carts', CartController::class);

    Route::apiResource('orders', OrderController::class);
    Route::get('/orders/user', [OrderController::class, 'orderUser']);
    Route::get('/orders/list-deleted', [OrderController::class, 'listDeleted']);
    Route::get('/orders/restore/{id}', [OrderController::class, 'restore']);
    Route::delete('/orders/force-delete/{id}', [OrderController::class, 'forceDelete']);
    Route::put('/orders/{id}', [OrderController::class, 'updateStatus']);

    Route::get('/roles', [RolePermissionController::class, 'indexRoles']);
    Route::get('/permissions', [RolePermissionController::class, 'indexPermissions']);

    // Tạo role & permission
    Route::post('/roles', [RolePermissionController::class, 'createRole']);
    Route::post('/permissions', [RolePermissionController::class, 'createPermission']);

    Route::post('/momo/payment', [MoMoController::class, 'createPayment']);



    // Gán & xóa permission cho role
    Route::post('/roles/assign-permissions', [RolePermissionController::class, 'assignPermissionToRole']);
    Route::post('/roles/remove-permission', [RolePermissionController::class, 'removePermissionFromRole']);

    // Gán & xóa role cho user
    Route::post('/users/assign-role', [RolePermissionController::class, 'assignRoleToUser']);
    Route::post('/users/remove-role', [RolePermissionController::class, 'removeRoleFromUser']);

    // Xóa role & permission
    Route::delete('/roles/{role}', [RolePermissionController::class, 'deleteRole']);
    Route::delete('/permissions/{id}', [RolePermissionController::class, 'deletePermission']);

   // Route::post('/roles/{id}/assign-all-permissions', [RolePermissionController::class, 'assignAllPermissionsToRole']);
   
    Route::post('/roles/{id}/update-permissions', [RolePermissionController::class, 'updatePermissions']);

    Route::post('/roles/remove-all-permissions', [RolePermissionController::class, 'removeAllPermissionsFromRole']);

    Route::get('/roles/{id}/permissions', [RolePermissionController::class, 'getRolePermissions']);

    Route::apiResource('brands', BrandController::class);
    Route::apiResource('categories', CategoryController::class);
    Route::put('/categories/{id}', [CategoryController::class, 'update']);

    Route::apiResource('attributes', AttributeController::class);
    Route::apiResource('attribute-options', AttributeOptionController::class);

    Route::patch('/products/{id}/restore', [ProductController::class, 'restore']);
});

?>