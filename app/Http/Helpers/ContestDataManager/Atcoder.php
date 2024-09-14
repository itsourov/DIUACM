<?php
	
	namespace App\Http\Helpers\ContestDataManager;
	
	use Illuminate\Support\Facades\Cache;
	
	class Atcoder
	{
		
		private static function fetchCurl(string $url)
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
		
		public static function getContestDataOfAUser(string $contestLink, string $username): array
		{
			// Validate and parse the contest link
			$parsedUrl = parse_url($contestLink);
			if (!isset($parsedUrl['host']) || $parsedUrl['host'] !== 'atcoder.jp') {
				return ['error' => 'Invalid contest URL'];
			}
			
			$pathSegments = explode('/', trim($parsedUrl['path'], '/'));
			if ($pathSegments[0] !== 'contests') {
				return ['error' => 'Not a valid contest URL'];
			}
			
			$contestID = $pathSegments[1];
			
			// Fetch contest details using cURL
			$contestDataResponse = self::fetchCurl('https://kenkoooo.com/atcoder/resources/contests.json');
			if (!$contestDataResponse) {
				return ['error' => 'Failed to fetch contest data'];
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
				return ['error' => 'Contest not found'];
			}
			
			$contestEnd = $contestTime + $contestDuration;
			
			// Fetch user submissions using cURL
			$submissionResponse = self::fetchCurl("https://kenkoooo.com/atcoder/atcoder-api/v3/user/submissions?user=$username&from_second=$contestTime");
			if (!$submissionResponse) {
				return ['error' => 'Failed to fetch user submissions'];
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
			
			// Return solve and upsolve counts
			return [
				'solve_count' => count($solve),
				'upsolve_count' => count($upsolve),
				'absent' => $absent,
			];
		}
	}
