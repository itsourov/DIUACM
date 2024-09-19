<?php
	
	use Illuminate\Database\Migrations\Migration;
	use Illuminate\Database\Schema\Blueprint;
	use Illuminate\Support\Facades\Schema;
	
	return new class extends Migration {
		public function up(): void
		{
			Schema::create('galleries', function (Blueprint $table) {
				$table->id();
				$table->string('title');
				$table->string('description')->nullable();
				$table->softDeletes();
				$table->timestamps();
			});
		}
		
		public function down(): void
		{
			Schema::dropIfExists('galleries');
		}
	};
