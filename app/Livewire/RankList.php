<?php

namespace App\Livewire;

use App\Enums\AccessStatuses;
use App\Enums\UserType;
use App\Models\SolveCount;
use App\Models\Tracker;
use App\Models\User;
use Illuminate\Contracts\View\Factory;
use Illuminate\Contracts\View\View;
use Illuminate\Foundation\Application;
use Livewire\Component;

class RankList extends Component
{

    public Tracker $tracker;

    public function mount(Tracker $tracker): void
    {

        $this->tracker = $tracker;

    }

    public function placeholder()
    {
        return view('loading-page');
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
            ->paginate(20);

// Key solveCounts by event_id directly after retrieving users.
        $users->getCollection()->transform(function ($user) {
            $user->solveCounts = $user->solveCounts->keyBy('event_id');
            $user->score = $user->pivot->score;
            return $user;
        });

        return view('livewire.rank-list', compact('users', 'contests'));
    }
}
