<?php
	
	use Illuminate\Database\Migrations\Migration;
	use Illuminate\Database\Schema\Blueprint;
	use Illuminate\Support\Facades\Schema;
	
	return new class extends Migration {
		public function up(): void
		{
			Schema::create('comments', function (Blueprint $table) {
				$table->id();
				$table->foreignId('user_id')->constrained()->onDelete('cascade');;
				$table->foreignId('parent_id')->nullable()->constrained('comments')->onDelete('cascade');;
				$table->morphs('commentable');
				$table->text('comment');
//				$table->enum('rating', [1, 2, 3, 4, 5])->default(5);
				$table->softDeletes();
				$table->timestamps();
			});
		}
		
		public function down(): void
		{
			Schema::dropIfExists('comments');
		}
	};
