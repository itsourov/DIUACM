<?php

namespace App\Console\Commands;

use App\Enums\AccessStatuses;
use App\Enums\UserType;
use App\Jobs\ProcessAtcoderApi;
use App\Jobs\ProcessCFApi;
use App\Models\SolveCount;
use App\Models\Tracker;
use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Contracts\Console\PromptsForMissingInput;
use Illuminate\Support\Facades\Artisan;

class UpdateTrackers extends Command implements PromptsForMissingInput
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'bot:update-trackers {tracker_id}';

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
        $this->info("Process Started");
        if ($this->argument('tracker_id') != 'all') {
            $trackers = Tracker::with(['events', 'users'])->where('id', $this->argument('tracker_id'))->get();
        } else {
            $trackers = Tracker::with(['events', 'users'])->get();

        }
        foreach ($trackers as $tracker) {
            $tracker->update([
                'last_updated' => now(),
            ]);


            $this->info("Starting to update " . $tracker->title);


            $this->info("Got " . count($tracker->users) . " users for this tracker");
            $contests = $tracker->events;

            $this->info("Got " . count($contests) . " contests for this tracker");

            foreach ($contests as $contest) {
                if (str_contains($contest->contest_link, 'vjudge.net')) {
                    $this->info("Found A vjudge contest - " . $contest->title);
                    Artisan::call('bot:update-vjudge', [
                        'tracker_id' => $tracker->id,
                        'event_id' => $contest->id,
                    ]);

                    $this->info("$contest->title update finished");
                    $this->info("");
                } elseif (str_contains($contest->contest_link, 'codeforces.com')) {
                    $this->info("Found A codeforces contest - " . $contest->title);
                    foreach ($tracker->users as $user) {
                        $this->info("fetching $user->codeforces_username for contest $contest->title");
                        Artisan::call('bot:update-cf', [

                            'event_id' => $contest->id,
                            'user_id' => $user->id,
                        ]);
                        $this->info("finished $user->codeforces_username for contest $contest->title");
                    }
                    $this->info("$contest->title update finished");
                    $this->info("");
                } elseif (str_contains($contest->contest_link, 'atcoder.jp')) {
                    $this->info("Found A atcoder contest - " . $contest->title);
                    foreach ($tracker->users as $user) {
                        $this->info("fetching $user->atcoder_username for contest $contest->title");
                        Artisan::call('bot:update-atcoder', [
                            'event_id' => $contest->id,
                            'user_id' => $user->id,
                        ]);
                        $this->info("finished $user->atcoder_username for contest $contest->title");
                    }
                    $this->info("$contest->title update finished");
                    $this->info("");
                }
            }
            $this->info("Finished updating " . $tracker->title);
            $this->info("");


//            update score
            $tracker->loadMissing('events');
            // Retrieve the events associated with the tracker and their weights
            $events = $tracker->events;

            $solveCounts = SolveCount::whereIn('event_id', $events->pluck('id'))->get();

            $users = $tracker->users()->select(['users.id'])->get();
            foreach ($users as $user) {

                $score = 0;
                foreach ($events as $event) {
                    $solveCount = $solveCounts->where('event_id', $event->id)->where('user_id', $user->id)->first();
                    if ($solveCount) {
                        $eventWeight = $event->weight; // Default weight to 1 if not provided
                        $score += ($solveCount->solve_count + 0.25 * $solveCount->upsolve_count * $tracker->count_upsolve) * $eventWeight;
                    }
                }
                $tracker->users()->updateExistingPivot($user->id, ['score' => $score]);

            }
//            update score end


        }

        cache()->flush();
        $this->info("Cache cleared");
    }
}
