<?php

namespace App\Livewire;

use App\Models\Comment;
use Filament\Actions\Action;
use Filament\Actions\Concerns\InteractsWithActions;
use Filament\Actions\Contracts\HasActions;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Concerns\InteractsWithForms;
use Filament\Forms\Contracts\HasForms;
use Filament\Forms\Form;
use Filament\Notifications\Notification;
use Illuminate\Database\Eloquent\Model;
use Livewire\Component;
use Livewire\WithPagination;

class CommentSection extends Component implements HasForms, HasActions
{
	
	use InteractsWithForms;
	use InteractsWithActions;
	use WithPagination;
	public $cardClass;
	
	public Model $commentable;

	public ?array $data = [];
	
	public function mount(Model $commentable): void
	{
		$this->commentable = $commentable;
		

	}
	public function form(Form $form): Form
	{
		return $form
			->schema([
				
				Textarea::make('comment')
					->label("Make a Comment")
					->rows(4)
					->required()
				
				// ...
			])
			->statePath('data');
	}
	
	public function create()
	{
		if (!auth()->user()) {
			
			Notification::make()
				->title("You Must Be logged in to make a comment")
				->warning()
				->send();
			return redirect(route('login'));
		}
		$this->validate();
		$this->commentable->comments()->create(array_merge($this->form->getState(), [
			'user_id' => auth()->user()->id,
		]));
		$this->reset('data');
	}
	
	public function deleteAction(): Action
	{
		return Action::make('delete')
			->requiresConfirmation()
			->icon('heroicon-o-trash')
			->iconButton()
			->action(function (array $arguments) {
				$comment = Comment::findOrFail($arguments['comment']);
				$comment->delete();
				Notification::make()
					->title("comment deleted")
					->success()
					->send();
			});
	}
	
	public function replyAction(): Action
	{
		return Action::make('reply')
			->form([
				Textarea::make('comment')
					->label('make a reply')
					->rows(3)
					->required()
			])
			// ->requiresConfirmation()
			->icon('heroicon-o-chat-bubble-left-ellipsis')
			->iconButton()
			
			->action(function (array $arguments, array $data) {
				if (!auth()->user()) {
					
					Notification::make()
						->title("You Must Be logged in to make a comment")
						->warning()
						->send();
					return redirect(route('login'));
				}
				$newReply = $this->commentable->comments()->create(array_merge($data, [
					'user_id' => auth()->user()->id,
					'parent_id' => $arguments['parent_id'] ?? null,
				]));
				Notification::make()
					->title("Reply Submitted")
					->success()
					->send();
				
			});
	}
	public function render()
    {
	
	    $comments = $this->commentable->comments()->whereNull('parent_id')->with(['user.media','replies.user.media'])->withTrashed()->latest()->paginate(40);
        return view('livewire.comment-section',compact('comments'));
    }
}
