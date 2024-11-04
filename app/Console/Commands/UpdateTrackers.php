<?php

namespace App\Console\Commands;

use App\Enums\AccessStatuses;
use App\Enums\UserType;
use App\Jobs\ProcessAtcoderApi;
use App\Jobs\ProcessCFApi;
use App\Jobs\ProcessVjudgeApi;
use App\Models\Tracker;
use App\Models\User;
use Illuminate\Console\Command;

class UpdateTrackers extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'update-trackers';

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
        $trackers = Tracker::with('events')->get();
        foreach ($trackers as $tracker) {

            $this->info("Starting to update " . $tracker->title);
            if ($tracker->organized_for == AccessStatuses::OPEN_FOR_ALL) {
                $users = User::whereNot('type', UserType::MENTOR)
                    ->whereNot('type', UserType::Veteran)->get();
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
                })->get();

            $this->info("Got " . count($users) . " users for this tracker");
            $contests = $tracker->events;

            $this->info("Got " . count($contests) . " contests for this tracker");

            foreach ($contests as $contest) {
                if (str_contains($contest->contest_link, 'vjudge.net')) {
                    $this->info("Found A vjudge contest - " . $contest->title);
                    ProcessVjudgeApi::dispatchSync($tracker, $contest);
                    $this->info("Vjudge contest update finished");
                    $this->info("");
                } elseif (str_contains($contest->contest_link, 'codeforces.com')) {
                    $this->info("Found A codeforces contest - " . $contest->title);
                    foreach ($users as $user) {
                        $this->info("fetching $user->codeforces_username for contest $contest->title");
                        ProcessCFApi::dispatchSync($user, $contest);
                        $this->info("finished $user->codeforces_username for contest $contest->title");
                    }
                    $this->info("codeforces contest update finished");
                    $this->info("");
                } elseif (str_contains($contest->contest_link, 'atcoder.jp')) {
                    $this->info("Found A atcoder contest - " . $contest->title);
                    foreach ($users as $user) {
                        $this->info("fetching $user->atcoder_username for contest $contest->title");
                        ProcessAtcoderApi::dispatchSync($user, $contest);
                        $this->info("finished $user->atcoder_username for contest $contest->title");
                    }
                    $this->info("atcoder contest update finished");
                    $this->info("");
                }
            }
            $this->info("Finished updating " . $tracker->title);
            $this->info("");

        }
    }
}
