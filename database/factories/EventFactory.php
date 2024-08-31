<?php
	
	namespace Database\Factories;
	
	use App\Models\Event;
	use Illuminate\Database\Eloquent\Factories\Factory;
	use Illuminate\Support\Carbon;
	
	class EventFactory extends Factory
	{
		protected $model = Event::class;
		
		public function definition(): array
		{
			return [
				'created_at' => Carbon::now(),
				'updated_at' => Carbon::now(),
				'title' => $this->faker->word(),
				'description' => $this->faker->text(),
				'starting_time' => Carbon::now(),
				'ending_time' => Carbon::now(),
				'password' => bcrypt($this->faker->password()),
				'open_for_attendance' => $this->faker->boolean(),
				'type' => $this->faker->word(),
				'visibility' => $this->faker->word(),
				'organized_for' => $this->faker->word(),
			];
		}
	}
