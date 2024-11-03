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

class ProcessAtcoderApi implements ShouldQueue
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
        // Fetch contest details using cURL

        $contestDataResponse = cache()->remember('atcoder_main', 60 * 60 * 2, function () {
            return $this->fetchCurl('https://kenkoooo.com/atcoder/resources/contests.json');
        });

        if (!$contestDataResponse) {
            return;
        }
        $parsedUrl = parse_url($this->event->contest_link);
        $pathSegments = explode('/', trim($parsedUrl['path'], '/'));
        $contestID = $pathSegments[1] ?? null;
        if (($pathSegments[0] ?? '') !== 'contests' || !$contestID) {
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

        $atcoder_username = $this->user->atcoder_username ?? null;
        if (!$atcoder_username) {
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

        // Fetch user submissions using cURL
        $submissionResponse = $this->fetchCurl("https://kenkoooo.com/atcoder/atcoder-api/v3/user/submissions?user=$atcoder_username&from_second=$contestTime");
        if (!$submissionResponse) {
            SolveCount::updateOrCreate([
                'event_id' => $this->event->id,
                'user_id' => $this->user->id,
            ], [
                'event_id' => $this->event->id,
                'user_id' => $this->user->id,
                'solve_count' => 0,
                'upsolve_count' => 0,
                'error' => 'no info found',
            ]);
            return;

        }

        $submissions = json_decode($submissionResponse, true);

        // Initialize solve and upsolve counters
        $solve = [];
        $upsolve = [];
        $absent = true;

        foreach ($submissions as $submission) {
            if ($submission['contest_id'] === $contestID) {
                $submissionTime = $submission['epoch_second'];
                $problemID = $submission['problem_id'];
                $result = $submission['result'];

                if ($submissionTime >= $contestTime && $submissionTime <= $contestEnd) {
                    $absent = false;
                    // Solve during contest time
                    if ($result === 'AC' && !in_array($problemID, $solve)) {
                        $solve[] = $problemID;
                    }
                } else {
                    // Upsolve after contest ends
                    if ($result === 'AC' && !in_array($problemID, $upsolve)) {
                        $upsolve[] = $problemID;
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
            'absent' =>  $absent,
            'error' => null,
        ]);


    }

    private function fetchCurl(string $url)
    {
        $cacheData = Cache::get("atcoder_fetch_" . $url);
        if ($cacheData) {
            return $cacheData;
        }
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
        Cache::put("atcoder_fetch_" . $url, $response);
        return $response;
    }
}
