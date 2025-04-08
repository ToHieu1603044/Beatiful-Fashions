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
        $startMonth = $request->input('start_month', now()->month);
        $endMonth = $request->input('end_month', now()->month);
        $year = $request->input('year', now()->year);

        $startMonth = $request->input('start_month', now()->month);
        $endMonth = $request->input('end_month', now()->month);
        $year = $request->input('year', now()->year);

        $startDate = $request->input('start_date') ?? now()->startOfMonth()->toDateString();
        $endDate = $request->input('end_date') ?? now()->endOfMonth()->toDateString();

        $bestSellingProducts = DB::table('order_details')
            ->join('orders', 'order_details.order_id', '=', 'orders.id')
            ->join('products', 'order_details.product_id', '=', 'products.id')
            ->select(
                'products.id',
                'products.name',
                DB::raw('SUM(order_details.quantity) as total_sold'),
                DB::raw("SUM(CASE 
                            WHEN orders.created_at BETWEEN '$startDate' AND '$endDate' 
                            THEN order_details.quantity 
                            ELSE 0 
                         END) as sold_in_range")
            )
            ->whereBetween(DB::raw('MONTH(orders.created_at)'), [$startMonth, $endMonth])
            ->whereYear('orders.created_at', $year)
            ->where('orders.status', 'completed')
            ->groupBy('products.id', 'products.name')
            ->orderByDesc('total_sold')
            ->limit(5)
            ->get();

        $totalRevenue = Order::where('status', 'completed')
            ->where('is_paid', 1)
            ->where('tracking_status', 'completed')
            ->sum('total_amount');

        // 📦 Tổng sản phẩm đã bán trong khoảng thời gian cụ thể
        $totalProductsSold = DB::table('order_details')
            ->join('orders', 'order_details.order_id', '=', 'orders.id')
            ->where('orders.status', 'completed')
            ->when($startDate && $endDate, function ($query) use ($startDate, $endDate) {
                $query->whereBetween('orders.created_at', [$startDate, $endDate]);
            })
            ->sum('order_details.quantity');

        return response()->json([
            'stats' => [
                'totalProducts' => Product::count(),
                'totalOrders' => Order::count(),
                'totalUsers' => User::count(),
                'totalRevenue' => $totalRevenue,
                'totalProductsSoldInRange' => $totalProductsSold, // ✅ Trả về ở đây
            ],
            'orders' => Order::latest()->limit(5)->get(),
            'products' => $bestSellingProducts,
            'orderStatus' => [
                ['name' => 'Pending', 'value' => Order::where('status', 'Pending')->count()],
                ['name' => 'Completed', 'value' => Order::where('status', 'Completed')->count()],
                ['name' => 'Canceled', 'value' => Order::where('status', 'Canceled')->count()],
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
