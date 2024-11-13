<?php

namespace App\Console\Commands;

use App\Enums\AccessStatuses;
use App\Enums\UserType;
use App\Models\Event;
use App\Models\SolveCount;
use App\Models\Tracker;
use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Contracts\Console\PromptsForMissingInput;
use Illuminate\Support\Facades\Http;

class UpdateVjudgeData extends Command implements PromptsForMissingInput
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'bot:update-vjudge {tracker_id} {event_id}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Command description';



    /**
     * Execute the console command.
     */
    public function handle()
    {
        $tracker = Tracker::find($this->argument('tracker_id'))->with(['users'])->first();
        if(!$tracker) {
            $this->error('Tracker not found');
            return;
        }
        $contest = Event::find($this->argument('event_id'));
        if(!$contest) {
            $this->error('Contest not found');
            return;
        }
        if (!str_contains($contest->contest_link, 'vjudge.net')) {
            $this->error("This is not a vjudge contest");
            return;
        }



        $parsedUrl = parse_url($contest->contest_link ?? "");
        $pathSegments = explode('/', trim($parsedUrl['path'], '/'));
        $contestID = $pathSegments[1] ?? null;
        if ($pathSegments[0] !== 'contest' || !$contestID) {
            foreach ($tracker->users as $user) {
                SolveCount::updateOrCreate([
                    'event_id' => $contest->id,
                    'user_id' => $user->id,
                ], [
                    'event_id' => $contest->id,
                    'user_id' => $user->id,
                    'solve_count' => 0,
                    'upsolve_count' => 0,
                    'error' => 'invalid contest info',
                ]);
            }
            return;

        }


        $responseData = cache()->remember('vjudge+'.$contestID."+".$contestID, 60 * 60 * 2, function () use ($contestID) {
            return Http::withHeaders([
                'User-Agent' => 'PostmanRuntime/7.26.10',
            ])->get('https://vjudge.net/contest/rank/single/' . $contestID)->json();
        });


        if (!$responseData) {
            foreach ($tracker->users as $user) {
                SolveCount::updateOrCreate([
                    'event_id' => $contest->id,
                    'user_id' => $user->id,
                ], [
                    'event_id' => $contest->id,
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

        foreach ($tracker->users as $user) {
            $vjudge_username = $user->vjudge_username ?? null;

            if (!$vjudge_username) {

                SolveCount::updateOrCreate([
                    'event_id' => $contest->id,
                    'user_id' => $user->id,
                ], [
                    'event_id' => $contest->id,
                    'user_id' => $user->id,
                    'solve_count' => 0,
                    'upsolve_count' => 0,
                    'error' => 'username missing',
                ]);

            } else {

                SolveCount::updateOrCreate([
                    'event_id' => $contest->id,
                    'user_id' => $user->id,
                ], [
                    'event_id' => $contest->id,
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
