<?php

namespace App\Http\Controllers\Api;

use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;

class DashboardController
{
    public function stats()
    {
        $totalRevenue = Order::where('status', 'completed')
                            ->where('is_paid', 1)
                            ->where('tracking_status', 'completed')
                            ->sum('total_amount');
        
        return response()->json([
            'stats' => [
                'totalProducts' => Product::count(),
                'totalOrders' => Order::count(),
                'totalUsers' => User::count(),
                'totalRevenue' => $totalRevenue,
            ],

            'orders' => Order::latest()->limit(5)->get(),
            'products' => Product::orderBy('total_sold', 'desc')->limit(5)->get(),
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
                         ->where('created_at', '<=', $startDate)
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
