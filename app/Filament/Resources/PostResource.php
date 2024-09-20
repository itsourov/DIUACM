<?php
	
	namespace App\Filament\Resources;
	
	use App\Filament\Resources\PostResource\Pages;
	use App\Models\Post;
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
	use Illuminate\Support\Str;
	
	class PostResource extends Resource
	{
		protected static ?string $model = Post::class;
		
		protected static ?string $slug = 'posts';
		
		protected static ?string $navigationIcon = 'heroicon-o-rectangle-stack';
		
		public static function form(Form $form): Form
		{
			return $form
				->schema(Post::getForm());
		}
		
		public static function table(Table $table): Table
		{
			return $table
				->columns([
					TextColumn::make('title')
						->searchable()
						->sortable(),
					
					
					
					TextColumn::make('sub_title'),
					
					TextColumn::make('status'),
					
					TextColumn::make('user_id'),
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
				'index' => Pages\ListPosts::route('/'),
				'create' => Pages\CreatePost::route('/create'),
				'edit' => Pages\EditPost::route('/{record}/edit'),
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
