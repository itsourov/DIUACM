<?php

namespace App\Console\Commands;

use App\Models\Event;
use App\Models\SolveCount;
use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Contracts\Console\PromptsForMissingInput;
use Illuminate\Support\Facades\Http;

class UpdateCFData extends Command implements PromptsForMissingInput
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'bot:update-cf {event_id} {user_id}';

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

        $contest = Event::find($this->argument('event_id'));
        if (!$contest) {

            $this->error('Contest not found');
            return;
        }
        $user = User::find($this->argument('user_id'));
        if (!$user) {
            $this->error('User not found');
            return;
        }

        if (!(str_contains($contest->contest_link, 'codeforces.com'))) {
            $this->error("This is not a codeforces contest");
            return;
        }

        $contestID = explode('/', $contest->contest_link)[4] ?? null;
        if (!$contestID) {
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
            return;
        }
        $codeforces_username = $user->codeforces_username ?? null;
        if (!$codeforces_username) {
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
            return;
        }


        $contestAPI = "http://codeforces.com/api/contest.status?contestId=$contestID&handle=$codeforces_username";

        $response = cache()->remember('cf_fetch_' . $contestAPI, 60 * 60 * 2, function () use ($contestAPI) {
            return Http::get($contestAPI)->json();
        });


        $solve = [];
        $upsolve = [];
        $tp = false;

        foreach ($response['result'] ?? [] as $problem) {
            $participantType = $problem['author']['participantType'];

            $verdict = $problem['verdict'] ?? '';
            $problemID = $problem['problem']['index'];

            if ($participantType === "CONTESTANT") $tp = true;

            if ($verdict === "OK") {
                if ($participantType === "CONTESTANT" || $participantType === "OUT_OF_COMPETITION") {
                    if (!isset($solve[$problemID])) {
                        $solve[$problemID] = true;
                        $tp = true;
                        unset($upsolve[$problemID]);
                    }
                } elseif ($participantType === "PRACTICE" || $participantType === "VIRTUAL") {
                    if (!isset($solve[$problemID]) && !isset($upsolve[$problemID])) {
                        $upsolve[$problemID] = true;
                    }
                }
            }
        }

        SolveCount::updateOrCreate([
            'event_id' => $contest->id,
            'user_id' => $user->id,
        ], [
            'event_id' => $contest->id,
            'user_id' => $user->id,
            'solve_count' => count($solve),
            'upsolve_count' => count($upsolve),
            'absent' => !$tp,
            'error' => null,
        ]);

    }
}
