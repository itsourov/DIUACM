<?php

namespace App\Console\Commands;

use App\Models\Event;
use App\Models\SolveCount;
use App\Models\User;
use Illuminate\Console\Command;

class UpdateAtcoderData extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'bot:update-atcoder {event_id} {user_id}';

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
        $event = Event::find($this->argument('event_id'));
        if(!$event) {

            $this->error('Contest not found');
            return;
        }
        $user = User::find($this->argument('user_id'));
        if(!$user) {
            $this->error('User not found');
            return;
        }

        if (!(str_contains($event->contest_link, 'atcoder.jp'))) {
            $this->error("This is not a atcoder contest");
            return;
        }

        $contestDataResponse = cache()->remember('atcoder_main', 60 * 60 * 2, function () {
            return $this->fetchCurl('https://kenkoooo.com/atcoder/resources/contests.json');
        });

        if (!$contestDataResponse) {
            return;
        }

        $parsedUrl = parse_url($event->contest_link);
        $pathSegments = explode('/', trim($parsedUrl['path'], '/'));
        $contestID = $pathSegments[1] ?? null;
        if (($pathSegments[0] ?? '') !== 'contests' || !$contestID) {
            SolveCount::updateOrCreate([
                'event_id' => $event->id,
                'user_id' => $user->id,
            ], [
                'solve_count' => 0,
                'upsolve_count' => 0,
                'error' => 'invalid contest info',
            ]);
            return;
        }

        $atcoder_username = $user->atcoder_username ?? null;
        if (!$atcoder_username) {
            SolveCount::updateOrCreate([
                'event_id' => $event->id,
                'user_id' => $user->id,
            ], [
                'solve_count' => 0,
                'upsolve_count' => 0,
                'error' => 'username missing',
            ]);
            return;
        }

        $contestData = json_decode($contestDataResponse, true);
        $contestTime = null;
        $contestDuration = null;

        foreach ($contestData as $contest) {
            if ($contest['id'] === $contestID) {
                $contestTime = $contest['start_epoch_second'];
                $contestDuration = $contest['duration_second'];
                break;
            }
        }

        if (is_null($contestTime) || is_null($contestDuration)) {
            return;
        }

        $contestEnd = $contestTime + $contestDuration;

        $submissionResponse = $this->fetchCurl("https://kenkoooo.com/atcoder/atcoder-api/v3/user/submissions?user=$atcoder_username&from_second=$contestTime");
        if (!$submissionResponse) {
            SolveCount::updateOrCreate([
                'event_id' => $event->id,
                'user_id' => $user->id,
            ], [
                'solve_count' => 0,
                'upsolve_count' => 0,
                'error' => 'no info found',
            ]);
            return;
        }

        $submissions = json_decode($submissionResponse, true);

        // Step 1: Track unique problems solved during contest time
        $solvedProblems = [];
        $upsolvedProblems = [];
        $absent = true;

        foreach ($submissions as $submission) {
            if ($submission['contest_id'] === $contestID) {
                $submissionTime = $submission['epoch_second'];
                $problemID = $submission['problem_id'];
                $result = $submission['result'];

                if ($submissionTime >= $contestTime && $submissionTime <= $contestEnd) {
                    $absent = false;
                    if ($result === 'AC' && !isset($solvedProblems[$problemID])) {
                        $solvedProblems[$problemID] = true; // Mark as solved during contest
                    }
                }
            }
        }

        // Step 2: Count upsolves only for problems not solved during contest time
        foreach ($submissions as $submission) {
            if ($submission['contest_id'] === $contestID) {
                $submissionTime = $submission['epoch_second'];
                $problemID = $submission['problem_id'];
                $result = $submission['result'];

                if ($submissionTime > $contestEnd) {
                    if ($result === 'AC' && !isset($solvedProblems[$problemID]) && !isset($upsolvedProblems[$problemID])) {
                        $upsolvedProblems[$problemID] = true; // Mark as upsolved after contest
                    }
                }
            }
        }

        SolveCount::updateOrCreate([
            'event_id' => $event->id,
            'user_id' => $user->id,
        ], [
            'solve_count' => count($solvedProblems),
            'upsolve_count' => count($upsolvedProblems),
            'absent' => $absent,
            'error' => null,
        ]);
    }

    private function fetchCurl(string $url): false|string
    {

        $curl = curl_init();

        curl_setopt_array($curl, array(
            CURLOPT_URL => $url,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_ENCODING => '',
            CURLOPT_MAXREDIRS => 10,
            CURLOPT_TIMEOUT => 0,
            CURLOPT_FOLLOWLOCATION => true,
            CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
            CURLOPT_CUSTOMREQUEST => 'GET',
        ));

        $response = curl_exec($curl);
        curl_close($curl);

        return $response;
    }

}
