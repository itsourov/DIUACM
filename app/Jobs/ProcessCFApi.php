<?php
	
	namespace App\Jobs;
	
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
		
		protected $contestID, $cfUsername;
		
		/**
		 * Create a new job instance.
		 */
		public function __construct($contestID, $cfUsername)
		{
			$this->contestID = $contestID;
			$this->cfUsername = $cfUsername;
		}
		
		/**
		 * Execute the job.
		 */
		public function handle(): void
		{
			$contestAPI = "http://codeforces.com/api/contest.status?contestId=$this->contestID&handle=$this->cfUsername";
			
			$response = Http::get($contestAPI)->json();
			
			$solve = [];
			$upsolve = [];
			$tp = false;
			
			foreach ($response['result'] ?? [] as $problem) {
				$participantType = $problem['author']['participantType'];
				$verdict = $problem['verdict'];
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
			Cache::put("cf_contest_data_loading_" . $this->contestID . "_" . $this->cfUsername, false);
			Cache::put("cf_contest_data_" . $this->contestID . "_" . $this->cfUsername, ['solve_count' => count($solve), 'upsolve_count' => count($upsolve), 'absent' => !$tp]);
			
		}
	}
