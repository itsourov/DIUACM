<?php
	
	namespace App\Http\Helpers\ContestDataManager;
	
	use App\Jobs\ProcessAtcoderApi;
	use App\Jobs\ProcessCFApi;
	use Illuminate\Support\Facades\Cache;
	
	class Atcoder
	{
		
	
		public static function getContestDataOfAUser(?string $contestLink, ?string $username): array
		{
			
			if (!$username) {
				return ['error' => true, 'message' => 'invalid username'];
			}
			if (!$contestLink) {
				return ['error' => true, 'message' => 'invalid ContestLink'];
			}
			// Validate and parse the contest link
			$parsedUrl = parse_url($contestLink);
			
			
			$pathSegments = explode('/', trim($parsedUrl['path'], '/'));
			if ($pathSegments[0] !== 'contests') {
				return ['error' => true, 'message' => 'invalid ContestLink'];
			}
			
			$contestID = $pathSegments[1];
			
		
			
			if (Cache::has("atcoder_contest_data_" . $contestID . "_" . $username,)) {
				
				return Cache::get("atcoder_contest_data_" . $contestID . "_" . $username,);
			} else {
				
				if (!Cache::has("atcoder_contest_data_loading_" . $contestID . "_" . $username)) {
					
					Cache::put("atcoder_contest_data_loading_" . $contestID . "_" . $username, true);
					ProcessAtcoderApi::dispatch($contestID, $username);
				}
				return ['solve_count' => 0, 'upsolve_count' => 0, 'absent' => false, 'loading' => true];
			}
			
			
			
		}
	}
