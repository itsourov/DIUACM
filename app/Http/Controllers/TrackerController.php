<?php

namespace App\Http\Controllers;

use App\Enums\AccessStatuses;
use App\Enums\UserType;
use App\Http\Helpers\ContestDataManager\Atcoder;
use App\Http\Helpers\ContestDataManager\CF;
use App\Http\Helpers\ContestDataManager\Vjudge;
use App\Jobs\ProcessAtcoderApi;
use App\Jobs\ProcessCFApi;
use App\Jobs\ProcessVjudgeApi;
use App\Models\SolveCount;
use App\Models\Tracker;
use App\Models\User;
use Filament\Notifications\Notification;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;


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

    public function fetch(Tracker $tracker)
    {

        $users = User::get();
        $contests = $tracker->events;


        foreach ($contests as $contest) {
            if (str_contains($contest->contest_link, 'vjudge.net')) {
                ProcessVjudgeApi::dispatchSync($tracker, $contest);
            } elseif (str_contains($contest->contest_link, 'codeforces.com')) {
//                foreach ($users as $user) {
//                    ProcessCFApi::dispatch($user, $contest);
//                }
            } elseif (str_contains($contest->contest_link, 'atcoder.jp')) {
//                foreach ($users as $user) {
//                    ProcessAtcoderApi::dispatch($user, $contest);
//                }
            }
        }

        $solveCounts = SolveCount::whereIn('user_id', $users->pluck('id'))->whereIn('event_id', $contests->pluck('id'))->get();
        return [
            'solveCounts' => $solveCounts,
            'users' => $users,
            'contests' => $contests,

        ];
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
