<?php

namespace App\Http\Controllers;

use App\Enums\AccessStatuses;
use App\Enums\UserType;
use App\Jobs\ProcessTracker;
use App\Models\Tracker;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;


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


        $SEOData = new \RalphJSmit\Laravel\SEO\Support\SEOData(
            title: $tracker->title,
            description: $tracker->description,

        );

        return view('tracker.show', compact('tracker', 'SEOData'));
    }

    public function ranklistApi(Tracker $tracker)
    {
        // Retrieve event IDs related to the tracker using the pivot table
        $eventIds = DB::table('event_tracker')
            ->where('tracker_id', $tracker->id)
            ->pluck('event_id')
            ->toArray();

        // Fetch event weights for these events
        $eventWeights = DB::table('events')
            ->whereIn('id', $eventIds)
            ->pluck('weight', 'id')
            ->toArray();

        // Base query for users
        $usersQuery = DB::table('users')
            ->select(['users.id', 'users.name'])
            ->when($tracker->organized_for == AccessStatuses::SELECTED_PERSONS, function ($query) use ($tracker) {
                return $query->whereIn('users.id', function ($subQuery) use ($tracker) {
                    $subQuery->select('user_id')
                        ->from('group_user')
                        ->join('groups', 'group_user.group_id', '=', 'groups.id')
                        ->whereIn('groups.id', function ($nestedQuery) use ($tracker) {
                            $nestedQuery->select('group_id')
                                ->from('group_tracker')
                                ->where('tracker_id', $tracker->id);
                        });
                });
            })
            ->when($tracker->organized_for == AccessStatuses::OPEN_FOR_ALL, function ($query) {
                return $query->whereNotIn('type', [UserType::MENTOR, UserType::Veteran]);
            });

        // Retrieve user data
        $users = $usersQuery->get();

        // Get solve counts for each user-event pair
        $solveCounts = DB::table('solve_counts')
            ->whereIn('event_id', $eventIds)
            ->get()
            ->groupBy('user_id');

        // Fetch media associated with each user using Spatie's media library table
        $mediaItems = DB::table('media')
            ->whereIn('model_id', $users->pluck('id')->toArray())
            ->where('model_type', User::class) // Assuming User model class for Spatie Media Library
            ->get()
            ->groupBy('model_id');

        // Process each user to calculate scores and include media
        $users = $users->map(function ($user) use ($solveCounts, $eventWeights, $tracker, $mediaItems) {
            $score = 0;

            // Retrieve and map solve counts for this user by event ID
            $userSolveCounts = $solveCounts->get($user->id, collect())->keyBy('event_id');

            // Calculate score based on event weights and solve counts
            foreach ($userSolveCounts as $eventId => $solveCount) {
                $weight = $eventWeights[$eventId] ?? 1;
                $score += ($solveCount->solve_count * $weight) + (($solveCount->upsolve_count * $weight / 2) * $tracker->count_upsolve);
            }

            // Attach score and media to user
            $user->score = $score;
            $user->solveCounts = $userSolveCounts;
            $user->media = $mediaItems->get($user->id, collect());

            return $user;
        })->sortByDesc('score')->values();

        return $users;
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
