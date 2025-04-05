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
                $table->string('name'); // Tên chương trình Flash Sale
                $table->timestamp('start_time'); // Thời gian bắt đầu
                $table->timestamp('end_time'); // Thời gian kết thúc
                $table->enum('status', ['active', 'inactive'])->default('inactive'); // Trạng thái
                $table->timestamps();
            });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('flash_sales');
    }
};
