<?php

namespace App\Livewire;

use App\Enums\AccessStatuses;
use App\Enums\UserType;
use App\Models\SolveCount;
use App\Models\Tracker;
use App\Models\User;
use Filament\Actions\Action;
use Filament\Actions\Concerns\InteractsWithActions;
use Filament\Actions\Contracts\HasActions;
use Filament\Forms\Concerns\InteractsWithForms;
use Filament\Forms\Contracts\HasForms;
use Filament\Notifications\Notification;
use Illuminate\Contracts\View\Factory;
use Illuminate\Contracts\View\View;
use Illuminate\Foundation\Application;
use Livewire\Component;
use Livewire\WithPagination;

class RankList extends Component implements HasForms, HasActions
{

    use InteractsWithForms;
    use InteractsWithActions;
    use WithPagination;

    public Tracker $tracker;
    public bool $userAdded = false;

    public function mount(Tracker $tracker): void
    {

        $this->tracker = $tracker;

    }

    public function placeholder()
    {
        return view('loading-page');
    }

    public function addMeAction(): Action
    {

        return Action::make('addMe')
            ->visible($this->tracker->can_add_self && !$this->userAdded)
            ->requiresConfirmation()
            ->action(function () {
                if (!auth()->user()) {
                    Notification::make()
                        ->title("You need to logged in.")
                        ->warning()
                        ->send();
                    redirect(route('login'));
                    return;
                }
                $user = auth()->user();
                $this->tracker->users()->syncWithoutDetaching([$user->id]);
                Notification::make()
                    ->title("You are now added in this Tracker")
                    ->body("Please Wait a few hours for our bot to calculate your score again")
                    ->success()
                    ->send();

            });

    }

    public function removeMeAction(): Action
    {

        return Action::make('removeMe')
            ->visible($this->tracker->can_remove_self && $this->userAdded)
            ->requiresConfirmation()
            ->action(function () {
                if (!auth()->user()) {
                    Notification::make()
                        ->title("You need to logged in.")
                        ->warning()
                        ->send();
                    redirect(route('login'));
                    return;
                }
                $user = auth()->user();
                $this->tracker->users()->detach([$user->id]);
                Notification::make()
                    ->title("You are removed from this Tracker")
                    ->warning()
                    ->send();

            });

    }


    public function render(): Factory|View|Application|\Illuminate\View\View
    {
        $tracker = $this->tracker;
        $contests = cache()->remember('contests_' . $tracker->id, 60 * 60 * 2, function () use ($tracker) {
            return $tracker->events;
        });

        $eventIds = $contests->pluck('id');


        $users = $tracker->users()
            ->orderByDesc('pivot_score') // Sort users by score
            ->with([
                'media' => function ($query) {
                    $query->where('collection_name', 'profile-images');
                },
                'solveCounts' => function ($query) use ($eventIds) {
                    $query->whereIn('event_id', $eventIds);
                }
            ])
            ->paginate(50);

// Key solveCounts by event_id directly after retrieving users.
        $users->getCollection()->transform(function ($user) {
            $user->solveCounts = $user->solveCounts->keyBy('event_id');
            $user->score = $user->pivot->score;
            return $user;
        });
        $this->tracker->users()->select('user_id')->where('user_id', auth()->user()?->id)->first() ? $this->userAdded = true : $this->userAdded = false;


        return view('livewire.rank-list', compact('users', 'contests'));
    }
}
