<?php

namespace App\Http\Controllers;

use App\Enums\AccessStatuses;
use App\Enums\UserType;
use App\Http\Helpers\ContestDataManager\Atcoder;
use App\Http\Helpers\ContestDataManager\CF;
use App\Http\Helpers\ContestDataManager\Vjudge;
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

        $usersData = \Cache::get('usersData');
        $allUsersCached = \Cache::get('allUsers');
        $trackerCached = \Cache::get('tracker');
//        if ($trackerCached && $usersData && $allUsersCached) {
//            return view('tracker.show', [
//                'tracker'=>$trackerCached,
//                'allUsers'=>$allUsersCached,
//                'usersData'=>$usersData,
//                'SEOData'=>$SEOData,
//            ]);
//        }

        if ($tracker->organized_for == AccessStatuses::OPEN_FOR_ALL) {
            $allUsers = User::with('media')->whereNot('type', UserType::MENTOR)
                ->whereNot('type', UserType::Veteran)->get();
        } else
            $allUsers = User::whereIn('id', function ($query) use ($tracker) {
                $query->select('user_id')
                    ->from('group_user')
                    ->join('groups', 'group_user.group_id', '=', 'groups.id')
                    ->whereIn('groups.id', function ($query) use ($tracker) {
                        $query->select('group_id')
                            ->from('group_tracker')
                            ->where('tracker_id', $tracker->id);
                    });
            })->with('media')->get();


        $tracker->loadMissing('events');

        $usersData = [];
        foreach ($allUsers as $user) {
            $usersData[$user->id]['solve_score'] = 0;
            $usersData[$user->id]['upsolve_score'] = 0;

            foreach ($tracker->events as $event) {

                if ($event->ending_time > now()) continue;
                try {

                    $parsedUrl = parse_url($event->contest_link);
                    if (isset($parsedUrl['host']) && $parsedUrl['host'] == 'codeforces.com') {

                        $usersData[$user->id][$event->id] = CF::getContestDataOfAUser($event->contest_link ?? "", $user->codeforces_username);

                    } else if (isset($parsedUrl['host']) && $parsedUrl['host'] == 'atcoder.jp') {

                        $usersData[$user->id][$event->id] = Atcoder::getContestDataOfAUser($event->contest_link ?? "", $user->atcoder_username);

                    } else if (isset($parsedUrl['host']) && $parsedUrl['host'] == 'vjudge.net') {

                        if (!$user->vjudge_username) {
                            continue;
                        }
//                        #############################


                        $parsedUrl = parse_url($event->contest_link ?? "");

                        $pathSegments = explode('/', trim($parsedUrl['path'], '/'));
                        if ($pathSegments[0] !== 'contest') {
                            $usersData[$user->id][$event->id]['error'] = true;
                            $usersData[$user->id][$event->id]['message'] = 'Invalid contest URL';
                            continue;
                        }


                        $contestData = cache()->remember('vjudge_' . $pathSegments[1], 60, function () use ($pathSegments) {

                            $res = Http::get('https://vjudge.net/contest/rank/single/' . $pathSegments[1]);;
                            return $res->body() ?? "";
                        });

                        $usersData[$user->id][$event->id] = Vjudge::getContestDataOfAUser($contestData, $user->vjudge_username);





                    } else {
                        continue;
                    }


                    $usersData[$user->id]['solve_score'] += ($event->weight * ($usersData[$user->id][$event->id]['solve_count'] ?? 0));
                    if ($tracker->count_upsolve)
                        $usersData[$user->id]['upsolve_score'] += 0.25 * ($event->weight * ($usersData[$user->id][$event->id]['upsolve_count'] ?? 0));

                } catch (ConnectionException $e) {

                    Notification::make()
                        ->title("There was an error while calling API")
                        ->body($e->getMessage())
                        ->warning()
                        ->send();

                }

            }

            $usersData[$user->id]['score'] = $usersData[$user->id]['solve_score'] + $usersData[$user->id]['upsolve_score'];


        }
        uasort($usersData, function ($a, $b) {
            return $b['score'] <=> $a['score'];
        });

        \Cache::put('usersData', $usersData);
        \Cache::put('allUsers', $allUsers);
        \Cache::put('tracker', $tracker);
        return view('tracker.show', compact('tracker', 'usersData', 'allUsers', 'SEOData'));
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
