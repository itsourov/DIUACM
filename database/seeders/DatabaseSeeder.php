<?php

namespace Database\Seeders;

use App\Models\Comment;
use App\Models\Event;
use App\Models\Post;
use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
	    User::factory()->create([
		    'name' => 'Sourov Biswas',
		    'email' => 'sourov2305101004@diu.edu.bd',
	    ]);
	    
         User::factory(30)->create();
	    dump("User Done");
      
	    Event::factory(10)->create();
	    dump("Event Done");
	    Post::factory(10)->create();
	    dump("Post Done");
		foreach (Event::all() as $event) {
			
			for( $i = 1; $i <= 100; $i++ ) {
				$newComent =$event->comments()->create([
					'comment' => "asdasd asdsad",
					'parent_id' => null,
					'user_id' => User::all()->random()->id, // Assuming comments are made by authenticated users
				]);
				for($j = 1; $j <= 30; $j++) {
					$event->comments()->create([
						'comment' => "Reply text",
						'parent_id' => $newComent->id,
						'user_id' => User::all()->random()->id, // Assuming comments are made by authenticated users
					]);
				}
			}
			
		}
	    
	    
	    dump("Comment Done");
		foreach (User::all() as $user) {
			
			$user->addMediaFromUrl('https://picsum.photos/300/300')
				->toMediaCollection('profile-images', 'profile-images');;
		}
	
    }
}
