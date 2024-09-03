<?php
	
	namespace App\Filament\Resources;
	
	use App\Filament\Resources\AttendanceResource\Pages;
	use App\Models\Attendance;
	use Filament\Forms\Components\Placeholder;
	use Filament\Forms\Components\Select;
	use Filament\Forms\Components\TextInput;
	use Filament\Forms\Form;
	use Filament\Resources\Resource;
	use Filament\Tables\Actions\BulkActionGroup;
	use Filament\Tables\Actions\DeleteAction;
	use Filament\Tables\Actions\DeleteBulkAction;
	use Filament\Tables\Actions\EditAction;
	use Filament\Tables\Columns\TextColumn;
	use Filament\Tables\Table;
	
	class AttendanceResource extends Resource
	{
		protected static ?string $model = Attendance::class;
		
		protected static ?string $slug = 'attendances';
		
		protected static ?string $navigationIcon = 'heroicon-o-rectangle-stack';
		
		public static function form(Form $form): Form
		{
			return $form
				->schema([
					Placeholder::make('created_at')
						->label('Created Date')
						->content(fn(?Attendance $record): string => $record?->created_at?->diffForHumans() ?? '-'),
					
					Placeholder::make('updated_at')
						->label('Last Modified Date')
						->content(fn(?Attendance $record): string => $record?->updated_at?->diffForHumans() ?? '-'),
					
					 Select::make('user_id')
					     ->relationship('user', 'name')
					     ->nullable(false)
					     ->default(auth()->id()),
					
					Select::make('event_id')
						->relationship('event', 'title')
						->nullable(false),
					
					TextInput::make('vjudge_username'),
				]);
		}
		
		public static function table(Table $table): Table
		{
			return $table
				->columns([
					TextColumn::make('user_id'),
					
					TextColumn::make('event_id'),
					
					TextColumn::make('vjudge_username'),
				])
				->filters([
					//
				])
				->actions([
					EditAction::make(),
					DeleteAction::make(),
				])
				->bulkActions([
					BulkActionGroup::make([
						DeleteBulkAction::make(),
					]),
				]);
		}
		
		public static function getPages(): array
		{
			return [
				'index' => Pages\ListAttendances::route('/'),
				'create' => Pages\CreateAttendance::route('/create'),
				'edit' => Pages\EditAttendance::route('/{record}/edit'),
			];
		}
		
		public static function getGloballySearchableAttributes(): array
		{
			return [];
		}
	}
