<?php

namespace App\Console\Commands;

use App\Models\SolveCount;
use App\Models\Tracker;
use Illuminate\Console\Command;
use Illuminate\Contracts\Console\PromptsForMissingInput;

class RecalculateTrackerScores extends Command implements PromptsForMissingInput
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'bot:recalculate-scores {tracker_id}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Recalculate scores for all users in a tracker';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $trackerId = $this->argument('tracker_id');

        $this->info("Starting score recalculation process...");

        if ($trackerId === 'all') {
            $trackers = Tracker::with(['events', 'users'])->get();
            $this->info("Recalculating scores for all trackers");
        } else {
            $trackers = Tracker::with(['events', 'users'])->where('id', $trackerId)->get();
            $this->info("Recalculating scores for tracker ID: " . $trackerId);
        }

        foreach ($trackers as $tracker) {
            $this->info("Processing tracker: " . $tracker->title);

            // Load events and their weights
            $events = $tracker->events;
            $this->info("Found " . $events->count() . " events");

            // Get all solve counts for the events in this tracker
            $solveCounts = SolveCount::whereIn('event_id', $events->pluck('id'))->get();

            // Get users associated with this tracker
            $users = $tracker->users()->select(['users.id'])->get();
            $this->info("Processing scores for " . $users->count() . " users");

            $bar = $this->output->createProgressBar($users->count());
            $bar->start();

            foreach ($users as $user) {
                $score = 0;

                foreach ($events as $event) {
                    $solveCount = $solveCounts->where('event_id', $event->id)
                        ->where('user_id', $user->id)
                        ->first();

                    if ($solveCount) {
                        $eventWeight = $event->weight;
                        $score += ($solveCount->solve_count +
                                0.25 * $solveCount->upsolve_count * $tracker->count_upsolve) *
                            $eventWeight;
                    }
                }

                // Update the user's score in the tracker
                $tracker->users()->updateExistingPivot($user->id, ['score' => $score]);

                $bar->advance();
            }

            $bar->finish();
            $this->newLine();
            $this->info("Completed score recalculation for " . $tracker->title);
            $this->info("----------------------------------------");
        }

        // Clear the cache after updating scores
        cache()->flush();
        $this->info("Cache cleared");
        $this->info("Score recalculation process completed successfully!");
    }
}
