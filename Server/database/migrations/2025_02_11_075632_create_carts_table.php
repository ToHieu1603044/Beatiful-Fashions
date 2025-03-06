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
        Schema::create('carts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete(); // nullable để hỗ trợ khách vãng lai
            $table->string('session_id')->nullable(); // Lưu session ID nếu user chưa đăng nhập
            $table->foreignId('sku_id')->constrained('product_skus')->cascadeOnDelete(); // Liên kết biến thể sản phẩm
            $table->integer('quantity')->default(1);
            $table->json('variant_detail')->nullable(); // Lưu chi tiết biến thể dưới dạng JSON
            $table->timestamps();
        });
        
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('carts');
    }
};
