<?php
	
	namespace Database\Factories;
	
	use App\Models\Tracker;
	use Illuminate\Database\Eloquent\Factories\Factory;
	use Illuminate\Support\Carbon;
	
	class TrackerFactory extends Factory
	{
		protected $model = Tracker::class;
		
		public function definition(): array
		{
			return [
				'created_at' => Carbon::now(),
				'updated_at' => Carbon::now(),
				'title' => $this->faker->word(),
				'keyword' => $this->faker->word(),
				'description' => $this->faker->text(),
			];
		}
	}
