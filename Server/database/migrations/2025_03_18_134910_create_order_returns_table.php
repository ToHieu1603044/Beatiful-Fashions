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
        Schema::create('order_returns', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained()->onDelete('cascade');
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->enum('status', ['pending', 'approved', 'rejected', 'shipping', 'received','refunded','cancelled','completed'])->default('pending');
            $table->text('reason')->nullable();
            $table->timestamps();
        });
    }

   
    public function down(): void
    {
        Schema::dropIfExists('order_returns');
    }
};
