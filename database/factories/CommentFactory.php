<?php
	
	namespace Database\Factories;
	
	use App\Models\Comment;
	use App\Models\Event;
	use App\Models\User;
	use Illuminate\Database\Eloquent\Factories\Factory;
	use Illuminate\Support\Carbon;
	
	class CommentFactory extends Factory
	{
		protected $model = Comment::class;
		
		public function definition(): array
		{
			return [
				'created_at' => Carbon::now(),
				'updated_at' => Carbon::now(),
				'user_id' => User::all()->random()->id,
				'parent_id' => null,
				'commentable' => Event::class,
				'comment' => $this->faker->word(),
				'rating' => 5,
			];
		}
	}
