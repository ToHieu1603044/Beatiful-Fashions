<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Order;
use App\Models\Product;
use App\Models\FlashSaleProduct;
use DB;
use Log;

class UpdateOrderPriceAfterFlashSale extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'order:update-price-after-flash-sale';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Cập nhật lại giá cũ cho các đơn hàng đã hủy có giá Flash Sale';

    /**
     * Execute the console command.
     *
     * @return void
     */
    public function handle()
    {
        $this->info("Đang cập nhật lại giá cũ cho các đơn hàng đã hủy...");

        DB::beginTransaction();

        try {
            // Lấy tất cả đơn hàng đã hủy và có giá sản phẩm là giá Flash Sale
            $orders = Order::where('status', 'cancelled')
                ->whereHas('orderDetails', function ($query) {
                    $query->whereHas('product', function ($query) {
                        $query->where('flash_sale_price', '>', 0);
                    });
                })
                ->get();

            foreach ($orders as $order) {
                foreach ($order->orderDetails as $detail) {
                    // Lấy sản phẩm từ order detail
                    $product = Product::find($detail->product_id);
                    if ($product) {
                        // Kiểm tra nếu sản phẩm có tham gia Flash Sale và có giá giảm
                        $flashSaleProduct = FlashSaleProduct::where('product_id', $product->id)
                            ->where('flash_sale_id', $product->flashSale->id) // Điều kiện lấy Flash Sale theo id sự kiện
                            ->first();

                        if ($flashSaleProduct) {
                            // Nếu giá trong Flash Sale khác với giá gốc, cập nhật lại giá gốc cho order
                            if ($flashSaleProduct->discount_price > 0 && $detail->price == $flashSaleProduct->discount_price) {
                                // Cập nhật giá lại là giá gốc của sản phẩm
                                $detail->price = $product->regular_price;
                                $detail->subtotal = $detail->price * $detail->quantity;
                                $detail->save();
                            }
                        }
                    }
                }
            }

            DB::commit();
            $this->info("Đã cập nhật lại giá cũ cho các đơn hàng bị hủy.");
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Lỗi cập nhật giá đơn hàng: ' . $e->getMessage());
            $this->error("Có lỗi xảy ra khi cập nhật giá đơn hàng.");
        }
    }
}
