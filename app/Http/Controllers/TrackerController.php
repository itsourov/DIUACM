<?php

namespace App\Http\Controllers;

use App\Enums\AccessStatuses;
use App\Enums\UserType;
use App\Http\Helpers\ContestDataManager\Atcoder;
use App\Http\Helpers\ContestDataManager\CF;
use App\Http\Helpers\ContestDataManager\Vjudge;
use App\Jobs\ProcessAtcoderApi;
use App\Jobs\ProcessCFApi;
use App\Jobs\ProcessTracker;
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

        ProcessTracker::dispatch($tracker);
        return "asd";
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
