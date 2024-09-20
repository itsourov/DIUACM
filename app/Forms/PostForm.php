<?php
	
	namespace App\Forms;
	

	use App\Enums\VisibilityStatuses;
	use App\Models\Category;

	use Filament\Forms\Components\Builder;
	use Filament\Forms\Components\DateTimePicker;
	use Filament\Forms\Components\Fieldset;
	use Filament\Forms\Components\FileUpload;
	use Filament\Forms\Components\Hidden;
	use Filament\Forms\Components\Section;
	use Filament\Forms\Components\Select;
	use Filament\Forms\Components\SpatieMediaLibraryFileUpload;
	use Filament\Forms\Components\Textarea;
	use Filament\Forms\Components\TextInput;
	use Filament\Forms\Components\ToggleButtons;
	use Filament\Forms\Get;
	use Filament\Forms\Set;
	use Illuminate\Support\Str;
	
	class PostForm
	{
		
		public static function getComponents()
		{
			return [
				Section::make('Blog Details')
					->schema([
						Fieldset::make('Titles')
							->schema([
								Select::make('category_id')
									->multiple()
									->preload()
									->createOptionForm(Category::getForm())
									->searchable()
									->relationship('categories', 'title')
									->columnSpanFull(),
								
								TextInput::make('title')
									->live(true)
									->afterStateUpdated(
										fn(Set $set, ?string $state) => $set(
											'slug',
											Str::slug($state)
										)
									)
									->required()
									->unique(ignoreRecord: true)
									->maxLength(255),
								
								TextInput::make('slug')
									->maxLength(255),
								
								Textarea::make('sub_title')
									->maxLength(255)
									->columnSpanFull(),
								
//								Select::make('tag_id')
//									->multiple()
//									->preload()
//									->createOptionForm(Tag::getForm())
//									->searchable()
//									->relationship('tags', 'name')
//									->columnSpanFull(),
							]),
						
						Builder::make('content')
							->blocks([
								Builder\Block::make('heading')
									->schema([
										TextInput::make('content')
											->label('Heading')
											->required(),
										Select::make('level')
											->options([
												'h1' => 'Heading 1',
												'h2' => 'Heading 2',
												'h3' => 'Heading 3',
												'h4' => 'Heading 4',
												'h5' => 'Heading 5',
												'h6' => 'Heading 6',
											])
											->required(),
									])
									->columns(2),
								Builder\Block::make('paragraph')
									->schema([
										Textarea::make('content')
											->label('Paragraph')
											->required(),
									]),
								Builder\Block::make('image')
									->schema([
										SpatieMediaLibraryFileUpload::make('image')
											// uses the hidden image field path OR the current path
											->collection(function (FileUpload $component, Get $get) {
												return $get('image_collection_id') ?? $component->getContainer()->getStatePath();
											})
											->afterStateHydrated(null)
											->mutateDehydratedStateUsing(null)
											->responsiveImages()
											// sets the hidden image field to the state path OR the previous path
											->afterStateUpdated(function (FileUpload $component, Set $set) {
												$set('image_collection_id', $component->getContainer()->getStatePath());
											})
											->live(),
										// we can now call $yourModel->getMedia($value_in_image_collection_id)->first()
										Hidden::make('image_collection_id'),
									
									]),
							])
						,
						Fieldset::make('Feature Image')
							->schema([
								SpatieMediaLibraryFileUpload::make('Featured Image')
									->collection('post-featured-images')
									->hint('This cover image is used in your blog post as a feature image. Recommended image size 1200 X 628')
									->image()
									->responsiveImages()
									->previewable()
									->preserveFilenames()
									->imageEditor()
									->maxSize(1024 * 5)
									->rules('dimensions:max_width=1920,max_height=1004')
									->required(),
							])->columns(1),
						
						Fieldset::make('Status')
							->schema([
								
								ToggleButtons::make('status')
									->live()
									->inline()
									->options(VisibilityStatuses::class)
									->required(),
								
								DateTimePicker::make('scheduled_for')
									->visible(function ($get) {
										return $get('status') === VisibilityStatuses::SCHEDULED->value;
									})
									->required(function ($get) {
										return $get('status') === VisibilityStatuses::SCHEDULED->value;
									})
									->minDate(now()->addMinutes(5))
									->default(now())
									->native(false),
							]),
						Select::make('user_id')
							->relationship('user', 'name')
							->nullable(false)
							->default(auth()->id()),
					
					]),
			];
		}
	}
