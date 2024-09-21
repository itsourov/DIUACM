<?php
	
	namespace App\Http\Helpers\ContestDataManager;
	
	use App\Jobs\ProcessCFApi;
	use Illuminate\Http\Client\ConnectionException;
	use Illuminate\Support\Facades\Cache;
	
	class CF
	{
		public static function getContestID(string $contestUrl)
		{
			
			return explode('/', $contestUrl)[4] ?? null;
		}
		
		/**
		 * @throws ConnectionException
		 */
		public static function getContestDataOfAUser(string $contestUrl, ?string $cfUsername)
		{
			if (!$cfUsername) {
				return ['error' => true, 'message' => 'invalid username'];
			}
			if (!$contestUrl) {
				return ['error' => true, 'message' => 'invalid ContestLink'];
			}
			$contestID = self::getContestID($contestUrl);
			if ($contestID == null) return ['solve_count' => 0, 'upsolve_count' => 0];
			
			
			
			if (Cache::has("cf_contest_data_" . $contestID . "_" . $cfUsername,)) {
				
				return Cache::get("cf_contest_data_" . $contestID . "_" . $cfUsername,);
			} else {
				
				if (!Cache::has("cf_contest_data_loading_" . $contestID . "_" . $cfUsername)) {
					
					Cache::put("cf_contest_data_loading_" . $contestID . "_" . $cfUsername, true);
					ProcessCFApi::dispatch($contestID, $cfUsername);
				}
				return ['solve_count' => 0, 'upsolve_count' => 0, 'absent' => false, 'loading' => true];
			}
			
			
		}
	}
