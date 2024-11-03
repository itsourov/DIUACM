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
        return "<div class='container mx-auto p-2'>loading</div>";
    }


    public function render(): Factory|View|Application|\Illuminate\View\View
    {
        $tracker = $this->tracker;
        $contests = $tracker->events;
        $eventIds = $contests->pluck('id')->toArray();

        // Convert the events collection to an array with event ID as key and weight as value for easy lookup
        $eventWeights = $contests->pluck('weight', 'id')->toArray();

        $users = User::select(['id', 'name'])
            ->with(['solveCounts' => function ($query) use ($eventIds) {
                $query->whereIn('event_id', $eventIds);
            }, 'media'])
            ->when($this->tracker->organized_for==AccessStatuses::SELECTED_PERSONS, function ($query) use ($tracker) {
                return $query->whereIn('id', function ($query) use ($tracker) {
                    $query->select('user_id')
                        ->from('group_user')
                        ->join('groups', 'group_user.group_id', '=', 'groups.id')
                        ->whereIn('groups.id', function ($query) use ($tracker) {
                            $query->select('group_id')
                                ->from('group_tracker')
                                ->where('tracker_id', $tracker->id);
                        });
                });
            })
            ->when($this->tracker->organized_for==AccessStatuses::OPEN_FOR_ALL, function ($query) use ($tracker) {
                return $query->whereNot('type', UserType::MENTOR)
                    ->whereNot('type', UserType::Veteran);
            })
            ->get()
            ->map(function ($user) use ($eventWeights) {
                $score = 0;

                // Key solveCounts by event_id for easier access
                $solveCounts = $user->solveCounts->keyBy('event_id');

                foreach ($solveCounts as $eventId => $solveCount) {
                    $weight = $eventWeights[$eventId] ?? 1; // Default to weight 1 if not specified

                    // Calculate weighted score
                    $score += ($solveCount->solve_count * $weight) + (($solveCount->upsolve_count * $weight / 2) * $this->tracker->count_upsolve);
                }

                // Assign the calculated score to the user model's `score` attribute
                $user->score = $score;
                $user->solveCounts = $solveCounts; // Reassign the keyed solveCounts for direct access by event_id

                return $user;
            })
            ->sortByDesc('score') // Sort by score after mapping
            ->values();

        return view('livewire.rank-list', compact('users', 'contests'));
    }
}
