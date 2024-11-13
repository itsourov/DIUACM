<?php

	use App\Enums\AccessStatuses;
use App\Enums\TrackerType;
use Illuminate\Database\Migrations\Migration;
	use Illuminate\Database\Schema\Blueprint;
	use Illuminate\Support\Facades\Schema;

	return new class extends Migration {
		public function up(): void
		{
			Schema::create('trackers', function (Blueprint $table) {
				$table->id();
				$table->string('title');
                $table->datetime('last_update');
				$table->string('slug')->unique();
				$table->string('description')->nullable();
				$table->boolean('count_upsolve')->default(true);
                $table->boolean('can_add_self')->default(false);
                $table->boolean('can_remove_self')->default(false);
                $table->boolean('auto_add')->default(false);
                $table->enum('type', TrackerType::toArray())->default(TrackerType::DYNAMIC);
                $table->longText('embedded_content')->nullable();
                $table->string('original_link')->nullable();
				$table->softDeletes();
				$table->timestamps();
			});
		}

		public function down(): void
		{
			Schema::dropIfExists('trackers');
		}
	};
