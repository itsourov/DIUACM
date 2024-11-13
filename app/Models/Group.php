<?php

	namespace App\Models;

	use Filament\Forms\Components\Placeholder;
	use Filament\Forms\Components\RichEditor;
	use Filament\Forms\Components\Section;
	use Filament\Forms\Components\Select;
	use Filament\Forms\Components\TextInput;
	use Illuminate\Database\Eloquent\Factories\HasFactory;
	use Illuminate\Database\Eloquent\Model;
	use Illuminate\Database\Eloquent\Relations\BelongsToMany;
	use Illuminate\Database\Eloquent\SoftDeletes;

	class Group extends Model
	{
		use SoftDeletes, HasFactory;

		protected $fillable = [
			'title',
			'description',
		];

		public static function getForm(): array
		{
			return [
				Placeholder::make('created_at')
					->label('Created Date')
					->content(fn(?Group $record): string => $record?->created_at?->diffForHumans() ?? '-'),

				Placeholder::make('updated_at')
					->label('Last Modified Date')
					->content(fn(?Group $record): string => $record?->updated_at?->diffForHumans() ?? '-'),

				Section::make('Group Info')
					->schema([
						TextInput::make('title')
							->required(),

						RichEditor::make('description'),
						Select::make('users')
							->label('Selected Users')
							->relationship('users', 'name')
							->multiple()
							->preload(),
					]),
			];
		}

		public function users(): BelongsToMany
		{
			return $this->belongsToMany(User::class);
		}
		public function events(): BelongsToMany
		{
			return $this->belongsToMany(Event::class);
		}

	}
