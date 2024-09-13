<?php
	
	use App\Enums\AccessStatuses;
	use Illuminate\Database\Migrations\Migration;
	use Illuminate\Database\Schema\Blueprint;
	use Illuminate\Support\Facades\Schema;
	
	return new class extends Migration {
		public function up(): void
		{
			Schema::create('trackers', function (Blueprint $table) {
				$table->id();
				$table->string('title');
				$table->string('keyword')->nullable();
				$table->string('description')->nullable();
				$table->enum('organized_for', AccessStatuses::toArray())->default(AccessStatuses::SELECTED_PERSONS);
				$table->softDeletes();
				$table->timestamps();
			});
		}
		
		public function down(): void
		{
			Schema::dropIfExists('trackers');
		}
	};
