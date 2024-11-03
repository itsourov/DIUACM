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

        $sourovID = 823685;

        $tracker = $this->tracker;
        $event = $this->event;


        if ($tracker->organized_for == AccessStatuses::OPEN_FOR_ALL) {
            $users = User::whereNot('type', UserType::MENTOR)
                ->whereNot('type', UserType::Veteran)->select(['id', 'vjudge_username'])->get();
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
            })->select(['id', 'vjudge_username'])->get();


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


        $responseData = cache()->remember('atcoder_main', 60 * 60 * 2, function () use ($contestID) {
            return Http::withHeaders([
                'User-Agent' => 'PostmanRuntime/7.26.10',
            ])->get('https://vjudge.net/contest/rank/single/' . $contestID)->json();
        });


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
        $submissions = $responseData['submissions'] ?? [];

        $data = [];

        foreach ($participants as $participantId => $participant) {
            $temp = [
                'solveCount' => 0,
                'upSolveCount' => 0,
                'absent' => true,
                'solved' => self::problemIndexGenerate(),
            ];
            $data[$participant[0]] = $temp;
        }


        foreach ($submissions as $submission) {
            $accepted = $submission[2] == 1;
            $inTime = ($submission[3] <= $time);
            $problemIndex = $submission[1];
            $userName = $participants[$submission[0]][0] ?? '';

            if ($inTime && $accepted) {
                if ($data[$userName]['solved'][$problemIndex] == 0) {
                    $data[$userName]['solveCount'] += 1;
                }
                $data[$userName]['solved'][$problemIndex] = 1;

            }
            $data[$userName]['absent'] = false;
        }
        foreach ($submissions as $submission) {
            $accepted = $submission[2] == 1;
            $inTime = ($submission[3] <= $time);
            $problemIndex = $submission[1];
            $userName = $participants[$submission[0]][0] ?? '';
            if (!$inTime && $accepted) {
                if ($data[$userName]['solved'][$problemIndex] == 0) {
                    $data[$userName]['upSolveCount']++;
                }
                $data[$userName]['solved'][$problemIndex] = 1;

            }
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
                    'solve_count' => $data[$vjudge_username]['solveCount'] ?? 0,
                    'upsolve_count' => $data[$vjudge_username]['upSolveCount'] ?? 0,
                    'absent' => ($data[$vjudge_username]['absent'] ?? true),
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
