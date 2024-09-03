<?php
	
	namespace App\Livewire\Profile;
	
	use Filament\Forms;
	use App\Models\User;
	use Filament\Notifications\Notification;
	use Livewire\Component;
	use Filament\Forms\Form;
	use Illuminate\Contracts\View\View;
	use Filament\Forms\Components\Section;
	use Filament\Forms\Contracts\HasForms;
	use Filament\Forms\Concerns\InteractsWithForms;
	use Filament\Forms\Components\Actions\Action;
	
	class UpdateProfile extends Component implements HasForms
	{
		use InteractsWithForms;
		
		public ?array $data = [];
		
		public User $record;
		
		public function mount(User $user): void
		{
			$this->record = $user;
			// dd($user);
			$this->form->fill($this->record->attributesToArray());
		}
		
		public function form(Form $form): Form
		{
			
			return $form
				->schema([
					
					Section::make('Profile Information')
						
						->columns(2)
						
						->description('Update your account\'s profile information and email address.')
						->schema([
							
							\Filament\Forms\Components\SpatieMediaLibraryFileUpload::make('profile Image')
								->collection('profile-images')
								->disk('profile-images')
								->preserveFilenames()
								->avatar()
								->image()
								->imageEditor()
								->imageEditorAspectRatios([
									'1:1',
								])
								->visibility('public'),
							\Filament\Forms\Components\SpatieMediaLibraryFileUpload::make('Cover Photo')
								->collection('cover-photos')
								->disk('cover-photos')
								->preserveFilenames()
								->image()
								->imageEditor()
								->imageEditorAspectRatios([
									'1:1',
								])
								->visibility('public'),
							
							Forms\Components\TextInput::make('name')
								->required()
								->maxLength(255),
							
							Forms\Components\TextInput::make('username')
								->required()
								->helperText('Cannot contain spaces or special characters.')
								->rules(['required', 'regex:/^[a-zA-Z0-9-]+$/'])
								->unique(ignoreRecord: true)
								->prefixIcon('heroicon-o-at-symbol')
								->suffixAction(
									Action::make('PreviewThisUsername')
										->requiresConfirmation()
										->icon('heroicon-o-link')
//										->url(function ($state) {
//											return route('contributors.show', $state);
//										})
										->openUrlInNewTab()
										->requiresConfirmation()
								
								)
								->maxLength(255),
							
							Forms\Components\TextInput::make('email')
								->email()
								->required()
								->maxLength(255),
							
							Forms\Components\TextInput::make('student_id')
								->prefixIcon('heroicon-o-identification')
								->maxLength(255),
							Forms\Components\TextInput::make('phone')
								->prefixIcon('heroicon-o-phone')
								->maxLength(255),
							
							Forms\Components\Textarea::make('Bio')
								
								->maxLength(255),
						
						
						])
				
				
				])
				->statePath('data')
				->model($this->record);
		}
		
		public function save(): void
		{
			$data = $this->form->getState();
			
			$this->record->fill($data);
			
			if ($this->record->isDirty('email')) {
				$this->record->email_verified_at = null;
			}
			$this->record->save();
			Notification::make()
				->title('Profile Info Saved')
				->success()
				->send();
		}
		
		public function render(): View
		{
			return view('livewire.profile.update-profile');
		}
	}
