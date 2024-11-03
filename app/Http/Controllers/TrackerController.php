<?php

namespace App\Http\Controllers;

use App\Jobs\ProcessTracker;
use App\Models\Tracker;
use Illuminate\Http\Request;


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
