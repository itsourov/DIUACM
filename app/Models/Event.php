<?php
	
	namespace App\Models;
	
	use App\Enums\AccessStatuses;
	use App\Enums\EventTypes;
	use App\Enums\VisibilityStatuses;
	use Carbon\Carbon;
	use Filament\Forms\Components\DateTimePicker;
	use Filament\Forms\Components\Fieldset;
	use Filament\Forms\Components\Placeholder;
	use Filament\Forms\Components\RichEditor;
	use Filament\Forms\Components\Section;
	use Filament\Forms\Components\Select;
	use Filament\Forms\Components\TextInput;
	use Filament\Forms\Components\Toggle;
	use Filament\Forms\Components\ToggleButtons;
	use Illuminate\Database\Eloquent\Factories\HasFactory;
	use Illuminate\Database\Eloquent\Model;
	use Illuminate\Database\Eloquent\Relations\BelongsToMany;
	use Illuminate\Database\Eloquent\Relations\MorphMany;
	use Illuminate\Database\Eloquent\SoftDeletes;
	
	
	class Event extends Model
	{
		use SoftDeletes, HasFactory;
		
		
		protected $fillable = [
			'title',
			'description',
			'starting_time',
			'ending_time',
			'contest_link',
			'password',
			'open_for_attendance',
			'type',
			'visibility',
			'organized_for',
			'weight',
		];
		public function comments(): MorphMany
		{
			return $this->morphMany(Comment::class, 'commentable');
		}
		
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
		
		public function groups(): BelongsToMany
		{
			return $this->belongsToMany(Group::class);
		}
		
		public function attenders(): BelongsToMany
		{
			return $this->belongsToMany(User::class)->withPivot(['extra_info']);
		}
		
		public function trackers(): BelongsToMany
		{
			return $this->belongsToMany(Tracker::class);
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
						
						RichEditor::make('description'),
						
						Fieldset::make('Time')
							->schema([
								DateTimePicker::make('starting_time')
									->required()
									->seconds(false),
								
								DateTimePicker::make('ending_time')
									->required()
									->seconds(false)
									->after('starting_time'),
								
								Placeholder::make('duration')
									->live()
									->content(fn($get) => calculateRuntime($get('starting_time'), $get('ending_time')))
									->columnSpan('full'),
							
							]),
						
						Fieldset::make('Extra')
							->schema([
								TextInput::make('contest_link'),
								TextInput::make('password'),
								
								Toggle::make('open_for_attendance'),
							]),
						
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
								Select::make('trackers')
									->label('Rated For')
									->relationship('trackers', 'title')
									->visible(function ($get) {
										return $get('type') === EventTypes::CONTEST->value;
									})
									->multiple()
									->preload(),
								TextInput::make('weight')
									->numeric()
									->default(1.0)
									->minValue(0.0)
									->maxValue(1.0),
								
								Select::make('groups')
									->label('Selected User Groups')
									->relationship('groups', 'title')
									->visible(function ($get) {
										return $get('organized_for') === AccessStatuses::SELECTED_PERSONS->value;
									})
									->createOptionModalHeading("Add New Group")
									->createOptionForm(Group::getForm())
									->multiple()
									->preload(),
							
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
	
	function calculateRuntime($start, $end): ?string
	{
		if (!$start || !$end) {
			return 'N/A'; // Placeholder text when either time is not set
		}
		
		$start = Carbon::parse($start);
		$end = Carbon::parse($end);
		
		$diff = $start->diff($end);
		
		try {
			return $diff->forHumans();
		} catch (\Exception $e) {
			return 'Calculation error: ' . $e->getMessage();
		}
	}
	