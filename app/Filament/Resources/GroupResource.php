<?php
	
	namespace App\Filament\Resources;
	
	use App\Filament\Resources\GroupResource\Pages;
	use App\Models\Group;
	use Filament\Forms\Components\Placeholder;
	use Filament\Forms\Components\Select;
	use Filament\Forms\Components\TextInput;
	use Filament\Forms\Form;
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
	
	class GroupResource extends Resource
	{
		protected static ?string $model = Group::class;
		
		protected static ?string $slug = 'groups';
		
		protected static ?string $navigationIcon = 'heroicon-o-rectangle-stack';
		
		public static function form(Form $form): Form
		{
			return $form
				->schema(Group::getForm());
	
		}
		
		public static function table(Table $table): Table
		{
			return $table
				->columns([
					TextColumn::make('title')
						->searchable()
						->sortable(),
					
					TextColumn::make('description')->html()->limit(30),
					TextColumn::make('users_count')
						->counts('users')
						->badge()
						->sortable(),
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
				'index' => Pages\ListGroups::route('/'),
				'create' => Pages\CreateGroup::route('/create'),
				'edit' => Pages\EditGroup::route('/{record}/edit'),
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
