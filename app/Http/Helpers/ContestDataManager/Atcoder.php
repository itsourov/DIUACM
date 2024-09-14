<?php
	
	namespace App\Http\Helpers\ContestDataManager;
	
	use Illuminate\Support\Facades\Http;
	
	class Atcoder
	{
		
		public static function getContestDataOfAUser(string $contestLink, string $username): array
		{
			// Validate and parse the contest link
			$parsedUrl = parse_url($contestLink);
			
			
			$pathSegments = explode('/', trim($parsedUrl['path'], '/'));
			if ($pathSegments[0] !== 'contests') {
				return ['error' => 'Not a valid contest URL'];
			}
			
			$contestID = $pathSegments[1];
			
			// Fetch contest details from the API
			$contestDataResponse = Http::withHeaders([
				'User-Agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
			])->get('https://kenkoooo.com/atcoder/resources/contests.json');
			if ($contestDataResponse->failed()) {
				dump($contestDataResponse->body());
				return ['error' => 'Failed to fetch contest data'];
			}
			
			$contestData = $contestDataResponse->json();
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
			
			// Fetch user submissions from the API
			$submissionResponse = Http::get("https://kenkoooo.com/atcoder/atcoder-api/v3/user/submissions", [
				'user' => $username,
				'from_second' => $contestTime,
			]);
			
			if ($submissionResponse->failed()) {
				return ['error' => 'Failed to fetch user submissions'];
			}
			
			$submissions = $submissionResponse->json();
			
			// Initialize solve and upsolve counters
			$solve = [];
			$upsolve = [];
			
			foreach ($submissions as $submission) {
				if ($submission['contest_id'] === $contestID) {
					$submissionTime = $submission['epoch_second'];
					$problemID = $submission['problem_id'];
					$result = $submission['result'];
					
					if ($submissionTime >= $contestTime && $submissionTime <= $contestEnd) {
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
			];
		}
	}
