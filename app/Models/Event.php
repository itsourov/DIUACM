<?php
	
	namespace App\Models;
	
	use App\Enums\AccessStatuses;
	use App\Enums\EventTypes;
	use App\Enums\VisibilityStatuses;
	use Filament\Forms\Components\DateTimePicker;
	use Filament\Forms\Components\Fieldset;
	use Filament\Forms\Components\Placeholder;
	use Filament\Forms\Components\Section;
	use Filament\Forms\Components\TextInput;
	use Filament\Forms\Components\Toggle;
	use Filament\Forms\Components\ToggleButtons;
	use Illuminate\Database\Eloquent\Factories\HasFactory;
	use Illuminate\Database\Eloquent\Model;
	use Illuminate\Database\Eloquent\SoftDeletes;
	
	class Event extends Model
	{
		use SoftDeletes, HasFactory;
		
		protected $fillable = [
			'title',
			'description',
			'starting_time',
			'ending_time',
			'password',
			'open_for_attendance',
			'type',
			'visibility',
			'organized_for',
		];
		
		
		protected function casts()
		{
			return [
				'starting_time' => 'datetime',
				'ending_time' => 'datetime',
				'visibility' => VisibilityStatuses::class,
				'organized_for' => AccessStatuses::class,
				'type' => EventTypes::class,
			];
		}
		
		public static function getForm(): array
		{
			return [
				Placeholder::make('created_at')
					->label('Created Date')
					->content(fn(?Event $record): string => $record?->created_at?->diffForHumans() ?? '-'),
				
				Placeholder::make('updated_at')
					->label('Last Modified Date')
					->content(fn(?Event $record): string => $record?->updated_at?->diffForHumans() ?? '-'),
				
				Section::make('Event Details')
					->schema([
						
						
						TextInput::make('title')
							->required(),
						
						TextInput::make('description')
							->required(),
						
						DateTimePicker::make('starting_time')
							->seconds(false),
						
						DateTimePicker::make('ending_time')
							->seconds(false),
						
						TextInput::make('password'),
						
						Toggle::make('open_for_attendance'),
						Fieldset::make('Event Types')
							->schema([
								ToggleButtons::make('type')
									->live()
									->inline()
									->options(EventTypes::class)
									->required(),
								ToggleButtons::make('organized_for')
									->live()
									->inline()
									->options(AccessStatuses::class)
									->required(),
							
							]),
						
						
						Fieldset::make('Event')
							->schema([
								
								ToggleButtons::make('visibility')
									->live()
									->inline()
									->options(VisibilityStatuses::class)
									->required(),
								
								DateTimePicker::make('scheduled_for')
									->visible(function ($get) {
										return $get('visibility') === VisibilityStatuses::SCHEDULED->value;
									})
									->required(function ($get) {
										return $get('visibility') === VisibilityStatuses::SCHEDULED->value;
									})
									->hint("This feature may not be implemented yet.")
									->minDate(now()->addMinutes(5))
									->native(true),
							]),
					]),
			];
		}
	}
