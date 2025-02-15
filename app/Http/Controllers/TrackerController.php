<?php

namespace App\Http\Controllers;

use App\Enums\AccessStatuses;
use App\Enums\UserType;
use App\Http\Resources\RanklistResource;
use App\Http\Resources\RanklistUserCollection;
use App\Jobs\ProcessTracker;
use App\Models\Tracker;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use RalphJSmit\Laravel\SEO\Support\SEOData;


class TrackerController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $trackers = Tracker::paginate(10);
        return view('tracker.index', compact('trackers'));
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        //
    }


    /**
     * Display the specified resource.
     */
    public function show(Tracker $tracker)
    {
        $page = request()->get('page', 1); // Get the current page, default to 1 if not present

        // Cache contests for this tracker with a shorter key
        $contests = cache()->remember('cts_' . $tracker->id, 60 * 60 * 2, function () use ($tracker) {
            return $tracker->events()->where('ending_time','<=', now())->get();
        });

        $eventIds = $contests->pluck('id');

        // Cache users with pagination, using a shorter key and including the page number
        $users = cache()->remember('u_sc_' . $tracker->id . '_p' . $page, 60 * 60 * 2, function () use ($tracker, $eventIds) {
            return $tracker->users()
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
        });

        // Key solveCounts by event_id directly after retrieving users
        $users->getCollection()->transform(function ($user) {
            $user->solveCounts = $user->solveCounts->keyBy('event_id');
            $user->score = $user->pivot->score;
            return $user;
        });

        $userAdded = (bool)$tracker->users()->select('user_id')->where('user_id', auth()->user()?->id)->first();
        $SEOData = new SEOData(
            title: $tracker->title,
            description: $tracker->description,
        );

        return view('tracker.show', compact('tracker', 'SEOData', 'users', 'contests', 'userAdded'));
    }


    public function ranklistApi(Tracker $tracker)
    {

        $tracker->loadMissing('events');
        $contests = $tracker->events;

        $eventIds = $contests->pluck('id')->toArray();

        // Convert the events collection to an array with event ID as key and weight as value for easy lookup
        $eventWeights = $contests->pluck('weight', 'id')->toArray();


        $users = User::select(['id', 'name'])
            ->with(['solveCounts' => function ($query) use ($eventIds) {
                $query->whereIn('event_id', $eventIds);
            }, 'media'])
            ->when($tracker->organized_for == AccessStatuses::SELECTED_PERSONS, function ($query) use ($tracker) {
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
            ->when($tracker->organized_for == AccessStatuses::OPEN_FOR_ALL, function ($query) use ($tracker) {
                return $query->whereNot('type', UserType::MENTOR)
                    ->whereNot('type', UserType::Veteran);
            })
            ->get()
            ->map(function ($user) use ($eventWeights, $tracker) {
                $score = 0;

                // Key solveCounts by event_id for easier access
                $solveCounts = $user->solveCounts->keyBy('event_id');

                foreach ($solveCounts as $eventId => $solveCount) {
                    $weight = $eventWeights[$eventId] ?? 1; // Default to weight 1 if not specified

                    // Calculate weighted score
                    $score += ($solveCount->solve_count * $weight) + (($solveCount->upsolve_count * $weight / 2) * $tracker->count_upsolve);
                }

                // Assign the calculated score to the user model's `score` attribute
                $user->score = $score;
                $user->solveCounts = $solveCounts; // Reassign the keyed solveCounts for direct access by event_id

                return $user;
            })
            ->sortByDesc('score') // Sort by score after mapping
            ->values();

        foreach ($users as $user) {
            $tracker->users()->updateExistingPivot($user->id, [
                'score' => $user->score,
            ]);
        }
        return new RanklistUserCollection($users);


    }

    public function fetch(Tracker $tracker)
    {


        $users = User::get();
        foreach ($users as $user) {
            $newUsername = Str::trim($user->vjudge_username);
            $newUsername = str_replace('https://vjudge.net/user/', '', $newUsername);
            $user->update(['vjudge_username' => $newUsername]);

            $newUsername = Str::trim($user->atcoder_username);
            $newUsername = str_replace('https://atcoder.jp/users/', '', $newUsername);
            $user->update(['atcoder_username' => $newUsername]);

            $newUsername = Str::trim($user->codeforces_username);
            $newUsername = str_replace('https://codeforces.com/profile/', '', $newUsername);
            $user->update(['codeforces_username' => $newUsername]);

        }
        dump($users);
        return "ok";
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Tracker $tracker)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Tracker $tracker)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Tracker $tracker)
    {
        //
    }
}
