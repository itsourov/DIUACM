<?php
	
	namespace Database\Factories;
	
	use App\Enums\VisibilityStatuses;
	use App\Models\Post;
	use App\Models\User;
	use Illuminate\Database\Eloquent\Factories\Factory;
	use Illuminate\Support\Carbon;
	
	class PostFactory extends Factory
	{
		protected $model = Post::class;
		
		public function definition(): array
		{
			return [
				'created_at' => Carbon::now(),
				'updated_at' => Carbon::now(),
				'title' => $this->faker->words(10,asText: true),
				'sub_title' => $this->faker->word(),
				'content' => $this->faker->paragraph(),
				'status' => VisibilityStatuses::PUBLISHED,
				'user_id' => User::all()->random()->id,
			];
		}
	}
