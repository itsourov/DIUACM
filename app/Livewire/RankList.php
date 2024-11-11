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

        // Cache the events (contests) related to the tracker for two hours
        $contests = cache()->remember('contests_' . $tracker->id, 60 * 60 * 2, function () use ($tracker) {
            return $tracker->events()->select('id', 'weight')->get();
        });

        $eventIds = $contests->pluck('id');
        $eventWeights = $contests->pluck('weight', 'id');

        // Cache the ranked users
        $users = cache()->remember('ranklist_users_' . $tracker->id, 60 * 60 * 2, function () use ($tracker, $eventIds, $eventWeights) {
            return User::select(['id', 'name'])
                ->with(['solveCounts' => function ($query) use ($eventIds) {
                    $query->whereIn('event_id', $eventIds);
                }, 'media'])
                ->when($tracker->organized_for == AccessStatuses::SELECTED_PERSONS, function ($query) use ($tracker) {
                    $query->whereIn('id', function ($subQuery) use ($tracker) {
                        $subQuery->select('user_id')
                            ->from('group_user')
                            ->join('groups', 'group_user.group_id', '=', 'groups.id')
                            ->whereIn('groups.id', function ($subQuery) use ($tracker) {
                                $subQuery->select('group_id')
                                    ->from('group_tracker')
                                    ->where('tracker_id', $tracker->id);
                            });
                    });
                })
                ->when($tracker->organized_for == AccessStatuses::OPEN_FOR_ALL, function ($query) {
                    $query->whereNotIn('type', [UserType::MENTOR, UserType::Veteran]);
                })
                ->get()
                ->map(function ($user) use ($eventWeights, $tracker) {
                    // Calculate score for each user
                    $user->score = $user->solveCounts->reduce(function ($carry, $solveCount) use ($eventWeights, $tracker) {
                        $eventId = $solveCount->event_id;
                        $weight = $eventWeights[$eventId] ?? 1;
                        return $carry + ($solveCount->solve_count * $weight) + (($solveCount->upsolve_count * $weight / 2) * $tracker->count_upsolve);
                    }, 0);

                    // Set the solveCounts keyed by event_id for easier access
                    $user->solveCounts = $user->solveCounts->keyBy('event_id');

                    return $user;
                })
                ->sortByDesc('score')
                ->values();
        });

        return view('livewire.rank-list', compact('users', 'contests'));
    }

}
