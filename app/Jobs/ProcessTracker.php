<?php

namespace App\Jobs;

use App\Enums\AccessStatuses;
use App\Enums\UserType;
use App\Models\Tracker;
use App\Models\User;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class ProcessTracker implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected Tracker $tracker;
    /**
     * Create a new job instance.
     */
    public function __construct(Tracker $tracker)
    {
       $this->tracker = $tracker;
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        $tracker = $this->tracker;
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

        $contests = $tracker->events;


        foreach ($contests as $contest) {
            if (str_contains($contest->contest_link, 'vjudge.net')) {
                ProcessVjudgeApi::dispatchSync($tracker, $contest);
            } elseif (str_contains($contest->contest_link, 'codeforces.com')) {
                foreach ($users as $user) {
                    ProcessCFApi::dispatchSync($user, $contest);
                }
            } elseif (str_contains($contest->contest_link, 'atcoder.jp')) {
                foreach ($users as $user) {
                    ProcessAtcoderApi::dispatchSync($user, $contest);
                }
            }
        }
    }
}
