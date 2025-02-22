<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn('shipping_status'); // Xóa cột cũ
        });

        Schema::table('orders', function (Blueprint $table) {
            $table->enum('shipping_status', [
                'Chờ xác nhận', 'Xác nhận', 'Đang giao', 'Hoàn thành',
                'Hủy đơn', 'Hoàn trả', 'Xác nhận hoàn trả', 'Hoàn trả thành công'
            ])->default('Chờ xác nhận');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            //
        });
    }
};
