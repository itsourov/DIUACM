<?php
	
	namespace App\Http\Helpers\ContestDataManager;
	
	use Illuminate\Http\Client\ConnectionException;
	use Illuminate\Support\Facades\Cache;
	use Illuminate\Support\Facades\Http;
	
	class CF
	{
		public static function getContestID(string $contestUrl)
		{
			
			return explode('/', $contestUrl)[4] ?? null;
		}
		
		/**
		 * @throws ConnectionException
		 */
		public static function getContestDataOfAUser(string $contestUrl, string $cfUsername)
		{
			$contestID = self::getContestID($contestUrl);
			if ($contestID == null) return ['solve_count' => 0, 'upsolve_count' => 0];
			
			$cacheData = Cache::get("cf_contest_data_" . $contestID . "_" . $cfUsername);
			if ($cacheData) {
				return $cacheData;
			}
			$contestAPI = "http://codeforces.com/api/contest.status?contestId=$contestID&handle=$cfUsername";
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
			
			Cache::put("cf_contest_data_" . $contestID . "_" . $cfUsername, ['solve_count' => count($solve), 'upsolve_count' => count($upsolve)]);
			
			return ['solve_count' => count($solve), 'upsolve_count' => count($upsolve)];
			
			
		}
	}
