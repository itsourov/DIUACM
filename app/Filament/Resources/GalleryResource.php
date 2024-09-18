<?php
	
	namespace App\Filament\Resources;
	
	use App\Filament\Resources\GalleryResource\Pages;
	use App\Models\Gallery;
	use Filament\Forms\Components\Placeholder;
	use Filament\Forms\Components\SpatieMediaLibraryFileUpload;
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
	
	class GalleryResource extends Resource
	{
		protected static ?string $model = Gallery::class;
		
		protected static ?string $slug = 'galleries';
		
		protected static ?string $navigationIcon = 'heroicon-o-rectangle-stack';
		
		public static function form(Form $form): Form
		{
			return $form
				->schema([
					Placeholder::make('created_at')
						->label('Created Date')
						->content(fn(?Gallery $record): string => $record?->created_at?->diffForHumans() ?? '-'),
					
					Placeholder::make('updated_at')
						->label('Last Modified Date')
						->content(fn(?Gallery $record): string => $record?->updated_at?->diffForHumans() ?? '-'),
					
					TextInput::make('title')
						->required(),
					
					TextInput::make('description'),
					
					SpatieMediaLibraryFileUpload::make('Gallery Images')
						->hint("upload images")
						->columnSpan(2)
						->collection('gallery-images')
						->preserveFilenames()
						->maxSize(1024*3)
						->image()
						->imageEditor()
						->multiple()
						->visibility('public')
						->required(),
				]);
		}
		
		public static function table(Table $table): Table
		{
			return $table
				->columns([
					TextColumn::make('title')
						->searchable()
						->sortable(),
					
					TextColumn::make('description'),
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
				'index' => Pages\ListGalleries::route('/'),
				'create' => Pages\CreateGallery::route('/create'),
				'edit' => Pages\EditGallery::route('/{record}/edit'),
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
