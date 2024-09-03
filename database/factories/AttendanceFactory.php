<?php
	
	namespace Database\Factories;
	
	use App\Models\Attendance;
	use Illuminate\Database\Eloquent\Factories\Factory;
	use Illuminate\Support\Carbon;
	
	class AttendanceFactory extends Factory
	{
		protected $model = Attendance::class;
		
		public function definition(): array
		{
			return [
				'created_at' => Carbon::now(),
				'updated_at' => Carbon::now(),
				'user_id' => $this->faker->randomNumber(),
				'event_id' => $this->faker->randomNumber(),
				'vjudge_username' => $this->faker->userName(),
			];
		}
	}
