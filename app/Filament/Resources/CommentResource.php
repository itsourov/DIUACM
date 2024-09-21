<?php
	
	namespace App\Filament\Resources;
	
	use App\Filament\Resources\CommentResource\Pages;
	use App\Models\Comment;
	use Filament\Forms\Components\Placeholder;
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
	
	class CommentResource extends Resource
	{
		protected static ?string $model = Comment::class;
		
		protected static ?string $slug = 'comments';
		
		protected static ?string $navigationIcon = 'heroicon-o-rectangle-stack';
		
		public static function form(Form $form): Form
		{
			return $form
				->schema([
					Placeholder::make('created_at')
						->label('Created Date')
						->content(fn(?Comment $record): string => $record?->created_at?->diffForHumans() ?? '-'),
					
					Placeholder::make('updated_at')
						->label('Last Modified Date')
						->content(fn(?Comment $record): string => $record?->updated_at?->diffForHumans() ?? '-'),
					
					TextInput::make('user_id')
						->required()
						->integer(),
					
					TextInput::make('parent_id')
						->required()
						->integer(),
					
					TextInput::make('commentable')
						->required(),
					
					TextInput::make('comment')
						->required(),
					
					TextInput::make('rating')
						->required(),
				]);
		}
		
		public static function table(Table $table): Table
		{
			return $table
				->columns([
					TextColumn::make('user_id'),
					
					TextColumn::make('parent_id'),
					
					TextColumn::make('commentable'),
					
					TextColumn::make('comment'),
					
					TextColumn::make('rating'),
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
				'index' => Pages\ListComments::route('/'),
				'create' => Pages\CreateComment::route('/create'),
				'edit' => Pages\EditComment::route('/{record}/edit'),
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
			return [];
		}
	}
