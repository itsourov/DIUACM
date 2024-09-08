<?php
	
	namespace Database\Factories;
	
	use App\Enums\AccessStatuses;
	use App\Enums\EventTypes;
	use App\Enums\VisibilityStatuses;
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
				'title' => $this->faker->text(50),
				'description' => $this->faker->text(),
				'starting_time' => now()->addMinutes(rand(-60, 60)),
				'ending_time' => now()->addMinutes(rand(-60, 60)),
				'password' => bcrypt($this->faker->password()),
				'open_for_attendance' => $this->faker->boolean(),
				'type' => EventTypes::toArray()[rand(0,2)],
				'visibility' => VisibilityStatuses::toArray()[rand(0,2)],
				'organized_for' => AccessStatuses::toArray()[rand(0,1)],
			];
		}
	}
