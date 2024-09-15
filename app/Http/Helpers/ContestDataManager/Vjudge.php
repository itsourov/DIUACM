<?php
	
	namespace App\Http\Helpers\ContestDataManager;
	
	class Vjudge
	{
		private static function fetchCurl(string $url)
		{
			return cache()->remember('vjudge_fetch_' . $url, now()->addDay(), function () use ($url) {
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
					CURLOPT_HTTPHEADER => array(
						'Cookie: JSESSIONID=UTIJAJ26K8LEHR0VSOQK0GZJ6P0X491J; Jax.Q=sourov_cse|5UEAFH7JIQTM9D8493TBS7ZOCRJFLN'
					),
				));
				
				$response = curl_exec($curl);
				
				curl_close($curl);
//				dump(json_decode($response, true));
				return json_decode($response, true);
			});
			
			
		}
		
		public static function getContestDataOfAUser(string $contestLink, string $username): array
		{
			// Validate and parse the contest link
			$parsedUrl = parse_url($contestLink);
			
			
			$pathSegments = explode('/', trim($parsedUrl['path'], '/'));
			
			if ($pathSegments[0] !== 'contest') {
				return ['error' => 'Not a valid contest URL'];
			}
			$contestID = $pathSegments[1];
			
			
			// Get the contest data from VJudge
			$responseData = self::fetchCurl("https://vjudge.net/contest/rank/single/" . $contestID);
			
			if (!$responseData) {
				return ['error' => 'Failed to fetch VJudge data'];
			}
			
			$time = $responseData['length'] / 1000;
			$participants = $responseData['participants'];
			$participantsData = $participants;
			$submissions = $responseData['submissions'];
			$participantsObj = $participants;
			
			foreach ($participantsObj as $participantId => $participant) {
				$dist = [
					'participantId' => $participantId,
					'userName' => $participant[0],
					'name' => $participant[1],
					'solveCount' => 0,
					'upSolveCount' => 0,
					'isPresent' => false,
					'solves' => self::problemIndexGenerate(),
				];
				$participantsData[$participantId] = $dist;
			}
			
			foreach ($submissions as $submission) {
				if ($submission[2] == 1) {
					if ($participantsData[$submission[0]]['solves'][$submission[1]] == 0) {
						$participantsData[$submission[0]]['solves'][$submission[1]] = 1;
						if ($submission[3] > $time) {
							$participantsData[$submission[0]]['upSolveCount'] += 1;
						} else {
							$participantsData[$submission[0]]['solveCount'] += 1;
							$participantsData[$submission[0]]['isPresent'] = true;
						}
					}
				} else {
					if ($submission[3] <= $time) {
						$participantsData[$submission[0]]['isPresent'] = true;
					}
				}
			}
			
			$data = [];
			foreach ($participantsObj as $participantId => $participant) {
				$tmp = [
					'userid' => $participantId,
					'userName' => $participantsData[$participantId]['userName'],
					'contestSolve' => $participantsData[$participantId]['solveCount'],
					'upSolve' => $participantsData[$participantId]['upSolveCount'],
					'isPresent' => $participantsData[$participantId]['isPresent'],
				];
				$data[$participantsData[$participantId]['userName']] = $tmp;
			}
			
			
			// Return solve and upsolve counts
			return [
				'solve_count' => $data[$username]['contestSolve'] ?? 0,
				'upsolve_count' => $data[$username]['upSolve'] ?? 0,
				'absent' => !($data[$username]['isPresent'] ?? false),
			];
			
		}
		
		private static function problemIndexGenerate()
		{
			$totalProblem = 50;
			$dist = [];
			for ($i = 0; $i < $totalProblem; $i++) {
				$dist[$i] = 0;
			}
			return $dist;
		}
	}
