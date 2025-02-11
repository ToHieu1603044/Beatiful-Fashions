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
        Schema::create('attribute_option_sku', function (Blueprint $table) {
            $table->id();
            $table->foreignId('sku_id')->constrained('product_skus')->onDelete('cascade');
            $table->foreignId('attribute_option_id')->constrained('attribute_options')->onDelete('cascade');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('attribute_option_sku');
    }
};
