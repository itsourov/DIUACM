<?php
	
	namespace App\Livewire;
	
	use App\Enums\AccessStatuses;
	use App\Enums\EventTypes;
	use App\Models\Event;
	use Filament\Actions\Action;
	use Filament\Actions\Concerns\InteractsWithActions;
	use Filament\Actions\Contracts\HasActions;
	use Filament\Forms\Components\TextInput;
	use Filament\Forms\Concerns\InteractsWithForms;
	use Filament\Forms\Contracts\HasForms;
	use Filament\Notifications\Notification;
	use Livewire\Component;
	use Livewire\WithPagination;
	
	class EventAttendancePage extends Component implements HasForms, HasActions
	{
		
		use InteractsWithForms;
		use InteractsWithActions;
		use WithPagination;
		
		public Event $event;
		public $isPresent = false;
		
		
		public function mount(Event $event): void
		{
			$this->event = $event;
			
		}
		
		public function attendanceAction(): Action
		{
			
			return Action::make('attendance')
				->label("I am present here")
				->form($this->getFormComponent())
				->hidden($this->isPresent )
				->fillForm(['vjudge_username' => auth()->user()?->vjudge_username])
				->action(function (array $data) {
					$this->markAsPresent($data);
					
				});
			
		}
		
		private function markAsPresent(?array $data): void
		{
			if (!auth()->user()) {
				Notification::make()
					->title("You need to logged in.")
					->warning()
					->send();
				redirect(route('login'));
				return;
			}
			if (!$this->checkPermission()) {
				$this->showPermissionError();
				return;
			}
			$user = auth()->user();
			if (!($user->phone && $user->student_id && $user->codeforces_username && $user->vjudge_username && $user->atcoder_username)) {
				
				Notification::make()
					->title("Profile Incomplete!!")
					->body("You need to complete your profile with all the required info.")
					->warning()
					->send();
				redirect(route('my-account.profile.edit'));
				return;
			}
			if ($this->event->password != $data['password']) {
				Notification::make()
					->title("Password Invalid")
					->warning()
					->send();
				return;
			}
			$this->event->attenders()->syncWithoutDetaching([
				'user_id' => auth()->user()->id
			]);
			Notification::make()
				->title("Attendance done.")
				->success()
				->send();
			
		}
		
		
		private function checkPermission(): bool
		{
			if (!$this->event->open_for_attendance) return false;
			if ($this->event->organized_for == AccessStatuses::OPEN_FOR_ALL)
				return true;
			
			$eventGroupUserIds = $this->event->groups()
				->with('users')
				->get()
				->pluck('users.*.id')
				->flatten()
				->unique()
				->toArray();
			if (in_array(auth()->user()?->id, $eventGroupUserIds)) return true;
			
			return false;
			
		}
		
		private function showPermissionError(): void
		{
			Notification::make()
				->title("Permission Denied!!!")
				->body("You dont have permission to attend this event.")
				->danger()
				->send();
		}
		
		public function render()
		{
			$this->event->loadMissing(['attenders.media']);
			$this->event->loadMissing(['attenders.media']);
			$this->isPresent = $this->event->attenders->contains('id', auth()->user()?->id);
			
			return
				view('livewire.event-attendance-page');
		}
		
		private function getFormComponent()
		{
			return [
				TextInput::make('password')
					->label("Contest Password")
					->required(),
				TextInput::make('vjudge_username')
					->visible($this->event->type == EventTypes::CONTEST)
					->required(),
			
			];
		}
		
		
	}
