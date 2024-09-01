<?php
	
	namespace Database\Factories;
	
	use App\Models\Group;
	use Illuminate\Database\Eloquent\Factories\Factory;
	use Illuminate\Support\Carbon;
	
	class GroupFactory extends Factory
	{
		protected $model = Group::class;
		
		public function definition(): array
		{
			return [
				'created_at' => Carbon::now(),
				'updated_at' => Carbon::now(),
				'title' => $this->faker->word(),
				'description' => $this->faker->text(),
			];
		}
	}
