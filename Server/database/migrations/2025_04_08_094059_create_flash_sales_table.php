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
            Schema::create('flash_sales', function (Blueprint $table) {
                $table->id();
                $table->string('name')->unique();
                $table->timestamp('start_time');
                $table->string('image')->nullable();
                $table->timestamp('end_time'); 
                $table->enum('status', ['active', 'inactive'])->default('inactive'); 
                $table->timestamps();
            });
    }
    public function down(): void
    {
        Schema::dropIfExists('flash_sales');
    }
};