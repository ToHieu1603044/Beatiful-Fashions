<?php

namespace App\Http\Controllers\Api;

use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
class DashboardController
{


    public function stats(Request $request)
{
    \Log::info($request->all());
    if (Gate::denies('view_dashboard')) {
        return response()->json([
            'stats' => [
                'totalProducts' => 0,
                'totalOrders' => 0,
                'totalUsers' => 0,
                'totalRevenue' => 0,
                'totalProductsSoldInRange' => 0,
            ],
            'orders' => [],
            'products' => [],
            'orderStatus' => [
                ['name' => 'Pending', 'value' => 0],
                ['name' => 'Completed', 'value' => 0],
                ['name' => 'Canceled', 'value' => 0],
            ],
        ], 403);
    }

    // Kiểm tra xem có yêu cầu lấy toàn bộ dữ liệu không
    $isAllTime = $request->input('time_range') === 'all';

    // Xác định startDate và endDate
    $startDate = null;
    $endDate = null;

    if (!$isAllTime && $request->has('start_date') && $request->has('end_date')) {
        $startDateInput = $request->input('start_date');
        $endDateInput = $request->input('end_date');

        // Validate that inputs are non-empty and valid dates
        if ($startDateInput && $endDateInput) {
            try {
                $startDate = Carbon::parse($startDateInput)->startOfDay();
                $endDate = Carbon::parse($endDateInput)->endOfDay();
            } catch (\Exception $e) {
                // Invalid date format; return error or fallback to all data
                return response()->json(['error' => 'Invalid date format'], 400);
            }
        }
    }

    // Hàm trợ giúp để áp dụng whereBetween nếu cần
    $applyDateFilter = fn($query) => $startDate && $endDate
        ? $query->whereBetween('created_at', [$startDate, $endDate])
        : $query;

    // Tổng sản phẩm
    $totalProducts = $applyDateFilter(Product::query())->count();

    // Tổng đơn hàng
    $totalOrders = $applyDateFilter(Order::query())->count();

    // Tổng người dùng
    $totalUsers = $applyDateFilter(User::query())->count();

    // Tổng doanh thu
    $totalRevenue = $applyDateFilter(
        Order::where('status', 'completed')
            ->where('is_paid', 1)
            ->where('tracking_status', 'completed')
    )->sum('total_amount');

    // Tổng sản phẩm bán được
    $totalProductsSold = DB::table('order_details')
        ->join('orders', 'order_details.order_id', '=', 'orders.id')
        ->where('orders.status', 'completed')
        ->when($startDate && $endDate, fn($query) => $query->whereBetween('orders.created_at', [$startDate, $endDate]))
        ->sum('order_details.quantity');

    // Top sản phẩm bán chạy
    $bestSellingProducts = DB::table('order_details')
        ->join('orders', 'order_details.order_id', '=', 'orders.id')
        ->join('products', 'order_details.product_id', '=', 'products.id')
        ->select(
            'products.id',
            'products.name',
            DB::raw('SUM(order_details.quantity) as total_sold')
        )
        ->where('orders.status', 'completed')
        ->when($startDate && $endDate, fn($query) => $query->whereBetween('orders.created_at', [$startDate, $endDate]))
        ->groupBy('products.id', 'products.name')
        ->orderByDesc('total_sold')
        ->limit(5)
        ->get();

    // Trạng thái đơn hàng
    $orderStatus = [
        ['name' => 'Pending', 'value' => $applyDateFilter(Order::where('status', 'Pending'))->count()],
        ['name' => 'Completed', 'value' => $applyDateFilter(Order::where('status', 'Completed'))->count()],
        ['name' => 'Canceled', 'value' => $applyDateFilter(Order::where('status', 'Canceled'))->count()],
    ];

    return response()->json([
        'stats' => [
            'totalProducts' => $totalProducts,
            'totalOrders' => $totalOrders,
            'totalUsers' => $totalUsers,
            'totalRevenue' => $totalRevenue,
            'totalProductsSoldInRange' => $totalProductsSold,
        ],
        'orders' => $applyDateFilter(Order::query())->latest()->limit(5)->get(),
        'products' => $bestSellingProducts,
        'orderStatus' => $orderStatus,
    ]);
}
    
    
    public function revenueStats(Request $request)
    {
        $type = $request->query('type', 'daily');
    
        // Kiểm tra quyền truy cập
        if (Gate::denies('view_dashboard')) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }
    
        // Khởi tạo query cơ bản
        $query = Order::where('status', 'completed')->where('is_paid', 1);
    
        // Định nghĩa khoảng thời gian dựa trên type
        $timeRanges = [
            'daily' => Carbon::now()->subDays(6)->startOfDay(),
            'weekly' => Carbon::now()->subWeeks(4),
            'monthly' => Carbon::now()->subMonths(12),
            'yearly' => Carbon::now()->subYears(5),
            'all' => null,
        ];
    
        // Kiểm tra type hợp lệ
        if (!array_key_exists($type, $timeRanges)) {
            return response()->json(['error' => 'Invalid type'], 400);
        }
    
        // Lấy startDate từ timeRanges
        $startDate = $timeRanges[$type];
    
        // Định nghĩa các câu query SQL theo type
        $queryConfigs = [
            'daily' => [
                'select' => "DATE(created_at) as label, SUM(total_amount) as revenue",
                'groupBy' => 'label',
            ],
            'weekly' => [
                'select' => "YEARWEEK(created_at) as label, SUM(total_amount) as revenue",
                'groupBy' => 'label',
            ],
            'monthly' => [
                'select' => "DATE_FORMAT(created_at, '%Y-%m') as label, SUM(total_amount) as revenue",
                'groupBy' => 'label',
            ],
            'yearly' => [
                'select' => "YEAR(created_at) as label, SUM(total_amount) as revenue",
                'groupBy' => 'label',
            ],
            'all' => [
                'select' => "SUM(total_amount) as revenue",
                'groupBy' => null,
            ],
        ];
    
        $queryConfig = $queryConfigs[$type];
        $query->selectRaw($queryConfig['select']);
    
        if ($startDate !== null) {
            $query->where('created_at', '>=', $startDate);
        }
    
        if ($queryConfig['groupBy']) {
            $query->groupBy($queryConfig['groupBy'])->orderBy($queryConfig['groupBy'], 'asc');
        }
    
        // Thực thi query và trả về kết quả
        return response()->json($query->get());
    }
}
