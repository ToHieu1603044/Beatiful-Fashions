<?php

namespace App\Http\Controllers\Api;

use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DashboardController
{
    public function stats(Request $request)
    {
        \Log::info($request->all());
    
        $startDate = $request->input('start_date')
            ? Carbon::parse($request->input('start_date'))->startOfDay()
            : Carbon::create(
                $request->input('year', now()->year),
                $request->input('start_month', now()->month)
            )->startOfMonth();
    
        $endDate = $request->input('end_date')
            ? Carbon::parse($request->input('end_date'))->endOfDay()
            : Carbon::create(
                $request->input('year', now()->year),
                $request->input('end_month', now()->month)
            )->endOfMonth();
    
        // Sản phẩm được tạo trong khoảng thời gian
        $totalProducts = Product::whereBetween('created_at', [$startDate, $endDate])->count();
    
        // Đơn hàng được tạo trong khoảng thời gian
        $totalOrders = Order::whereBetween('created_at', [$startDate, $endDate])->count();
    
        // Người dùng đăng ký trong khoảng thời gian
        $totalUsers = User::whereBetween('created_at', [$startDate, $endDate])->count();
    
        // Doanh thu trong khoảng thời gian
        $totalRevenue = Order::where('status', 'completed')
            ->where('is_paid', 1)
            ->where('tracking_status', 'completed')
            ->whereBetween('created_at', [$startDate, $endDate])
            ->sum('total_amount');
    
        // Tổng sản phẩm bán được
        $totalProductsSold = DB::table('order_details')
            ->join('orders', 'order_details.order_id', '=', 'orders.id')
            ->where('orders.status', 'completed')
            ->whereBetween('orders.created_at', [$startDate, $endDate])
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
            ->whereBetween('orders.created_at', [$startDate, $endDate])
            ->groupBy('products.id', 'products.name')
            ->orderByDesc('total_sold')
            ->limit(5)
            ->get();
    
        return response()->json([
            'stats' => [
                'totalProducts' => $totalProducts,
                'totalOrders' => $totalOrders,
                'totalUsers' => $totalUsers,
                'totalRevenue' => $totalRevenue,
                'totalProductsSoldInRange' => $totalProductsSold,
            ],
            'orders' => Order::whereBetween('created_at', [$startDate, $endDate])->latest()->limit(5)->get(),
            'products' => $bestSellingProducts,
            'orderStatus' => [
                ['name' => 'Pending', 'value' => Order::where('status', 'Pending')->whereBetween('created_at', [$startDate, $endDate])->count()],
                ['name' => 'Completed', 'value' => Order::where('status', 'Completed')->whereBetween('created_at', [$startDate, $endDate])->count()],
                ['name' => 'Canceled', 'value' => Order::where('status', 'Canceled')->whereBetween('created_at', [$startDate, $endDate])->count()],
            ],
        ]);
    }
    


    public function revenueStats(Request $request)
    {
        $type = $request->query('type', 'daily');

        $query = Order::where('status', 'completed')->where('is_paid', 1);

        $startDate = match ($type) {
            'daily' => Carbon::now()->subDays(6)->startOfDay(),
            'weekly' => Carbon::now()->subWeeks(4),
            'monthly' => Carbon::now()->subMonths(12),
            'yearly' => Carbon::now()->subYears(5),
            default => null,
        };

        if ($startDate === null) {
            return response()->json(['error' => 'Invalid type'], 400);
        }

        $data = match ($type) {
            'daily' => $query->selectRaw("DATE(created_at) as label, SUM(total_amount) as revenue")
                ->where('created_at', '>=', $startDate)
                ->groupBy('label')
                ->orderBy('label', 'asc')
                ->get(),

            'weekly' => $query->selectRaw("YEARWEEK(created_at) as label, SUM(total_amount) as revenue")
                ->where('created_at', '>=', $startDate)
                ->groupBy('label')
                ->orderBy('label', 'asc')
                ->get(),

            'monthly' => $query->selectRaw("DATE_FORMAT(created_at, '%Y-%m') as label, SUM(total_amount) as revenue")
                ->where('created_at', '>=', $startDate)
                ->groupBy('label')
                ->orderBy('label', 'asc')
                ->get(),

            'yearly' => $query->selectRaw("YEAR(created_at) as label, SUM(total_amount) as revenue")
                ->where('created_at', '>=', $startDate)
                ->groupBy('label')
                ->orderBy('label', 'asc')
                ->get(),
        };

        return response()->json($data);
    }

}
