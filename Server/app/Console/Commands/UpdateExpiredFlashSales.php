<?php

namespace App\Console\Commands;

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Carbon\Carbon;
use DB;

class UpdateExpiredFlashSales extends Command
{
    protected $signature = 'flashsales:update-expired';
    protected $description = 'Cập nhật discount_price = 0 khi flash sale hết hạn';

    public function handle()
    {
        $now = Carbon::now();

        // Lấy tất cả flash sales đã hết hạn
        $expiredFlashSales = DB::table('flash_sales')
            ->where('end_time', '<', $now)
            ->pluck('id');
        $expiredFlashSales->update([
            'status' => 'inactive'
        ]);
        if ($expiredFlashSales->isNotEmpty()) {
            DB::table('flash_sale_products')
                ->whereIn('flash_sale_id', $expiredFlashSales)
                ->update(['discount_price' => 0]);

            $this->info('Cập nhật xong flash sales hết hạn.');
        } else {
            $this->info('Không có flash sale nào hết hạn.');
        }
    }
}

