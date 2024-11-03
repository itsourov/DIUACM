<?php

namespace App\Jobs;


use App\Enums\AccessStatuses;
use App\Enums\UserType;
use App\Models\Event;
use App\Models\SolveCount;
use App\Models\Tracker;
use App\Models\User;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;

class ProcessVjudgeApi implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected Tracker $tracker;
    protected Event $event;

    /**
     * Create a new job instance.
     */
    public function __construct(Tracker $tracker, Event $event)
    {
        $this->tracker = $tracker;
        $this->event = $event;

    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {

        $tracker = $this->tracker;
        $event = $this->event;


        if ($tracker->organized_for == AccessStatuses::OPEN_FOR_ALL) {
            $users = User::whereNot('type', UserType::MENTOR)
                ->whereNot('type', UserType::Veteran)->select(['id','vjudge_username'])->get();
        } else
            $users = User::whereIn('id', function ($query) use ($tracker) {
                $query->select('user_id')
                    ->from('group_user')
                    ->join('groups', 'group_user.group_id', '=', 'groups.id')
                    ->whereIn('groups.id', function ($query) use ($tracker) {
                        $query->select('group_id')
                            ->from('group_tracker')
                            ->where('tracker_id', $tracker->id);
                    });
            })->select(['id','vjudge_username'])->get();


        $parsedUrl = parse_url($event->contest_link ?? "");
        $pathSegments = explode('/', trim($parsedUrl['path'], '/'));
        $contestID = $pathSegments[1] ?? null;
        if ($pathSegments[0] !== 'contest' || !$contestID) {
            foreach ($users as $user) {
                SolveCount::updateOrCreate([
                    'event_id' => $this->event->id,
                    'user_id' => $user->id,
                ], [
                    'event_id' => $this->event->id,
                    'user_id' => $user->id,
                    'solve_count' => 0,
                    'upsolve_count' => 0,
                    'error' => 'invalid contest info',
                ]);
            }
            return;

        }

        $responseData = Http::withHeaders([
            'User-Agent' => 'PostmanRuntime/7.26.10',
        ])->get('https://vjudge.net/contest/rank/single/' . $contestID)->json();

        if (!$responseData) {
            foreach ($users as $user) {
                SolveCount::updateOrCreate([
                    'event_id' => $this->event->id,
                    'user_id' => $user->id,
                ], [
                    'event_id' => $this->event->id,
                    'user_id' => $user->id,
                    'solve_count' => 0,
                    'upsolve_count' => 0,
                    'error' => 'no data',
                ]);
            }
            return;
        }

        $time = ($responseData['length'] ?? 0) / 1000;
        $participants = $responseData['participants'] ?? [];
        $participantsData = $participants;
        $submissions = $responseData['submissions'] ?? [];
        $participantsObj = $participants;

        foreach ($participantsObj as $participantId => $participant) {
            $dist = [
                'participantId' => $participantId,
                'userName' => $participant[0],
                'name' => $participant[1],
                'solveCount' => 0,
                'upSolveCount' => 0,
                'isPresent' => false,
                'solves' => self::problemIndexGenerate(),
            ];
            $participantsData[$participantId] = $dist;
        }

        foreach ($submissions as $submission) {
            if ($submission[2] == 1) {
                if ($participantsData[$submission[0]]['solves'][$submission[1]] == 0) {
                    $participantsData[$submission[0]]['solves'][$submission[1]] = 1;
                    if ($submission[3] > $time) {
                        $participantsData[$submission[0]]['upSolveCount'] += 1;
                    } else {
                        $participantsData[$submission[0]]['solveCount'] += 1;
                        $participantsData[$submission[0]]['isPresent'] = true;
                    }
                }
            } else {
                if ($submission[3] <= $time) {
                    $participantsData[$submission[0]]['isPresent'] = true;
                }
            }
        }

        $data = [];
        foreach ($participantsObj as $participantId => $participant) {
            $tmp = [
                'userid' => $participantId,
                'userName' => $participantsData[$participantId]['userName'],
                'contestSolve' => $participantsData[$participantId]['solveCount'],
                'upSolve' => $participantsData[$participantId]['upSolveCount'],
                'isPresent' => $participantsData[$participantId]['isPresent'],
            ];
            $data[$participantsData[$participantId]['userName']] = $tmp;
        }


        foreach ($users as $user) {
            $vjudge_username = $user->vjudge_username ?? null;

            if (!$vjudge_username) {

                SolveCount::updateOrCreate([
                    'event_id' => $this->event->id,
                    'user_id' => $user->id,
                ], [
                    'event_id' => $this->event->id,
                    'user_id' => $user->id,
                    'solve_count' => 0,
                    'upsolve_count' => 0,
                    'error' => 'username missing',
                ]);

            } else {

                SolveCount::updateOrCreate([
                    'event_id' => $this->event->id,
                    'user_id' => $user->id,
                ], [
                    'event_id' => $this->event->id,
                    'user_id' => $user->id,
                    'solve_count' => $data[$vjudge_username]['contestSolve'] ?? 0,
                    'upsolve_count' => $data[$vjudge_username]['upSolve'] ?? 0,
                    'present' => !($data[$vjudge_username]['isPresent'] ?? false),
                    'error' => null,
                ]);

            }


        }


    }


    private static function problemIndexGenerate(): array
    {
        $totalProblem = 50;
        $dist = [];
        for ($i = 0; $i < $totalProblem; $i++) {
            $dist[$i] = 0;
        }
        return $dist;
    }

}
