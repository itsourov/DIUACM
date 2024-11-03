<?php

namespace App\Jobs;

use App\Models\Event;
use App\Models\SolveCount;
use App\Models\User;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;

class ProcessCFApi implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected Event $event;
    protected User $user;

    /**
     * Create a new job instance.
     */
    public function __construct(User $user, Event $event)
    {
        $this->event = $event;
        $this->user = $user;
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {

        $contestID = explode('/', $this->event->contest_link)[4] ?? null;
        if (!$contestID) {
            SolveCount::updateOrCreate([
                'event_id' => $this->event->id,
                'user_id' => $this->user->id,
            ], [
                'event_id' => $this->event->id,
                'user_id' => $this->user->id,
                'solve_count' => 0,
                'upsolve_count' => 0,
                'error' => 'invalid contest info',
            ]);
            return;
        }
        $codeforces_username = $this->user->codeforces_username ?? null;
        if (!$codeforces_username) {
            SolveCount::updateOrCreate([
                'event_id' => $this->event->id,
                'user_id' => $this->user->id,
            ], [
                'event_id' => $this->event->id,
                'user_id' => $this->user->id,
                'solve_count' => 0,
                'upsolve_count' => 0,
                'error' => 'username missing',
            ]);
            return;
        }

        $contestAPI = "http://codeforces.com/api/contest.status?contestId=$contestID&handle=$codeforces_username";

        $response = Http::get($contestAPI)->json();

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
            'event_id' => $this->event->id,
            'user_id' => $this->user->id,
        ], [
            'event_id' => $this->event->id,
            'user_id' => $this->user->id,
            'solve_count' => count($solve),
            'upsolve_count' => count($upsolve),
            'absent' => !$tp,
            'error' => null,
        ]);


    }
}
