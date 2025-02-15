<?php

	use App\Enums\AccessStatuses;
	use App\Enums\EventTypes;
	use App\Enums\VisibilityStatuses;
	use Illuminate\Database\Migrations\Migration;
	use Illuminate\Database\Schema\Blueprint;
	use Illuminate\Support\Facades\Schema;

	return new class extends Migration {
		public function up(): void
		{
			Schema::create('events', function (Blueprint $table) {
				$table->id();
				$table->string('title');
				$table->string('description')->nullable();
				$table->dateTime('starting_time');
				$table->dateTime('ending_time');
				$table->string('contest_link')->nullable();
				$table->string('password')->nullable();
				$table->boolean('open_for_attendance');
				$table->enum('type', EventTypes::toArray())->default(EventTypes::CONTEST);
				$table->enum('visibility', VisibilityStatuses::toArray())->default(VisibilityStatuses::PENDING);
				$table->enum('organized_for', AccessStatuses::toArray())->default(AccessStatuses::SELECTED_PERSONS);
				$table->float('weight')->default(1);
				$table->json('result')->nullable();
				$table->softDeletes();
				$table->timestamps();
			});
		}

		public function down(): void
		{
			Schema::dropIfExists('events');
		}
	};
