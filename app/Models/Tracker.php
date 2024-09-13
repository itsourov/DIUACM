<?php
	
	namespace App\Models;
	
	use App\Enums\AccessStatuses;
	use Illuminate\Database\Eloquent\Factories\HasFactory;
	use Illuminate\Database\Eloquent\Model;
	use Illuminate\Database\Eloquent\Relations\BelongsToMany;
	use Illuminate\Database\Eloquent\SoftDeletes;
	
	class Tracker extends Model
	{
		use SoftDeletes, HasFactory;
		
		protected $fillable = [
			'title',
			'keyword',
			'description',
			'organized_for',
		];
		protected function casts()
		{
			return [
				
				'organized_for' => AccessStatuses::class,
			
			];
		}
		
		public function events(): BelongsToMany
		{
			return $this->belongsToMany(Event::class);
		}
		public function groups(): BelongsToMany
		{
			return $this->belongsToMany(Group::class);
		}
	}
