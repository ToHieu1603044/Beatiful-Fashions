<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up()
    {
        Schema::table('discounts', function (Blueprint $table) {
            $table->string('code')->unique()->after('name'); // Mã giảm giá
            $table->integer('max_discount')->nullable()->after('value'); // Giảm tối đa (nếu là %)
            $table->integer('min_order_amount')->default(0)->after('max_discount'); // Đơn tối thiểu
            $table->integer('used_count')->default(0)->after('min_order_amount'); // Số lần đã sử dụng
            $table->integer('max_uses')->nullable()->after('used_count'); // Số lần tối đa được sử dụng
        });
    }

    public function down()
    {
        Schema::table('discounts', function (Blueprint $table) {
            $table->dropColumn(['code', 'max_discount', 'min_order_amount', 'used_count', 'max_uses']);
        });
    }
};
