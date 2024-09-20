<?php
	
	namespace App\Forms;
	

	use AmidEsfahani\FilamentTinyEditor\TinyEditor;
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
						
						TinyEditor::make('content')
							->fileAttachmentsDisk('blog-images')
							->fileAttachmentsVisibility('public')
							->profile('default')
							->columnSpan('full')
							->required(),
						
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
