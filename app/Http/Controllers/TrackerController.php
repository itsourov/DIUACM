<?php

namespace App\Http\Controllers;

use App\Enums\AccessStatuses;
use App\Enums\UserType;
use App\Http\Resources\RanklistResource;
use App\Http\Resources\RanklistUserCollection;
use App\Jobs\ProcessTracker;
use App\Models\SolveCount;
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
            return $tracker->events;
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
                ->paginate(30);
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
        // Retrieve the events associated with the tracker and their weights
        $events = $tracker->events;

        $solveCounts = SolveCount::whereIn('event_id', $events->pluck('id'))->get();

        $users = $tracker->users()->select(['users.id'])->get();
        foreach ($users as $user) {

            $score = 0;
            foreach($events as $event) {
                $solveCount = $solveCounts->where('event_id', $event->id)->where('user_id', $user->id)->first();
                if ($solveCount) {
                    $eventWeight = $event->weight; // Default weight to 1 if not provided
                    $score += ($solveCount->solve_count + 0.5 * $solveCount->upsolve_count) * $eventWeight;
                }
            }
            $tracker->users()->updateExistingPivot($user->id, ['score' => $score]);

        }

        return "sad";

    }

    public function fetch(Tracker $tracker)
    {


        $users = User::select(['vjudge_username', 'atcoder_username', 'codeforces_username'])->get();
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
        return $users;
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
