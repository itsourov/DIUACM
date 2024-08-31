<?php
	
	namespace App\Filament\Resources;
	
	use App\Enums\VisibilityStatuses;
	use App\Filament\Resources\EventResource\Pages;
	use App\Models\Event;
	use Filament\Forms\Components\Checkbox;
	use Filament\Forms\Components\DatePicker;
	use Filament\Forms\Components\DateTimePicker;
	use Filament\Forms\Components\Placeholder;
	use Filament\Forms\Components\TextInput;
	use Filament\Forms\Components\Toggle;
	use Filament\Forms\Components\ToggleButtons;
	use Filament\Forms\Form;
	use Filament\Infolists\Components\TextEntry;
	use Filament\Resources\Resource;
	use Filament\Tables\Actions\BulkActionGroup;
	use Filament\Tables\Actions\DeleteAction;
	use Filament\Tables\Actions\DeleteBulkAction;
	use Filament\Tables\Actions\EditAction;
	use Filament\Tables\Actions\ForceDeleteAction;
	use Filament\Tables\Actions\ForceDeleteBulkAction;
	use Filament\Tables\Actions\RestoreAction;
	use Filament\Tables\Actions\RestoreBulkAction;
	use Filament\Tables\Columns\TextColumn;
	use Filament\Tables\Filters\TrashedFilter;
	use Filament\Tables\Table;
	use Illuminate\Database\Eloquent\Builder;
	use Illuminate\Database\Eloquent\SoftDeletingScope;
	
	class EventResource extends Resource
	{
		protected static ?string $model = Event::class;
		
		protected static ?string $slug = 'events';
		
		protected static ?string $navigationIcon = 'heroicon-o-rectangle-stack';
		
		public static function form(Form $form): Form
		{
			return $form
				->schema(Event::getForm());
		
		}
		
		public static function table(Table $table): Table
		{
			return $table
				->columns([
					TextColumn::make('title')
						->searchable()
						->sortable(),
					
					TextColumn::make('description'),
					
					TextColumn::make('starting_time')
						->date(),
					
					TextColumn::make('ending_time')
						->date(),
					
					TextColumn::make('open_for_attendance'),
					
					TextColumn::make('type'),
					
					TextColumn::make('visibility')
						->badge()
						->color(function ($state) {
							return $state->getColor();
						}),
					
					TextColumn::make('organized_for'),
				])
				->filters([
					TrashedFilter::make(),
				])
				->actions([
					EditAction::make(),
					DeleteAction::make(),
					RestoreAction::make(),
					ForceDeleteAction::make(),
				])
				->bulkActions([
					BulkActionGroup::make([
						DeleteBulkAction::make(),
						RestoreBulkAction::make(),
						ForceDeleteBulkAction::make(),
					]),
				]);
		}
		
		public static function getPages(): array
		{
			return [
				'index' => Pages\ListEvents::route('/'),
				'create' => Pages\CreateEvent::route('/create'),
				'edit' => Pages\EditEvent::route('/{record}/edit'),
			];
		}
		
		public static function getEloquentQuery(): Builder
		{
			return parent::getEloquentQuery()
				->withoutGlobalScopes([
					SoftDeletingScope::class,
				]);
		}
		
		public static function getGloballySearchableAttributes(): array
		{
			return ['title'];
		}
	}
