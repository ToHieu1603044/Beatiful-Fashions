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
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->bigInteger('total_amount');
            $table->string('status')->default('pending'); // pending, completed, canceled
            $table->string('name');
            $table->string('email')->nullable();
            $table->string('phone');
            $table->string('ward');
            $table->string('district');
            $table->string('city');
            $table->string('payment_method');
            $table->boolean('is_paid')->default(false); // false = chưa thanh toán, true = đã thanh toán
            $table->text('note')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};
