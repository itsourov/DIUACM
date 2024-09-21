<?php
	
	namespace App\Models;
	
	use Filament\Forms\Components\TextInput;
	use Filament\Forms\Get;
	use Filament\Forms\Set;
	use Illuminate\Database\Eloquent\Factories\HasFactory;
	use Illuminate\Database\Eloquent\Model;
	use Illuminate\Database\Eloquent\Relations\BelongsToMany;
	use Illuminate\Database\Eloquent\SoftDeletes;
	use Illuminate\Support\Str;
	
	class Category extends Model
	{
		use SoftDeletes, HasFactory;
		
		protected $fillable = [
			'title',
			'slug',
		];
		
		public function posts(): BelongsToMany
		{
			return $this->belongsToMany(Post::class);
		}
		
		public static function getForm()
		{
			return [
				TextInput::make('title')
					->live(true)
					->afterStateUpdated(function (Get $get, Set $set, ?string $operation, ?string $old, ?string $state) {
						
						$set('slug', Str::slug($state));
					})
					->unique(ignoreRecord: true)
					->required()
					->maxLength(155),
				
				TextInput::make('slug')
					->unique(ignoreRecord: true)
					->readOnly()
					->maxLength(255),
			];
		}
		
	}
	
