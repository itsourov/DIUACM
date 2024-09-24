<?php
	
	use App\Enums\VisibilityStatuses;
	use Illuminate\Database\Migrations\Migration;
	use Illuminate\Database\Schema\Blueprint;
	use Illuminate\Support\Facades\Schema;
	
	return new class extends Migration {
		public function up(): void
		{
			Schema::create('posts', function (Blueprint $table) {
				$table->id();
				$table->string('title');
				$table->string('slug')->unique();
				$table->string('sub_title')->nullable();
				$table->text('content');
				$table->enum('status', VisibilityStatuses::toArray())->default(VisibilityStatuses::PENDING);
				$table->foreignId('user_id')->constrained()->onDelete('cascade');
				$table->unsignedBigInteger('view_count')->default(0);
				$table->softDeletes();
				$table->timestamps();
			});
		}
		
		public function down(): void
		{
			Schema::dropIfExists('posts');
		}
	};
