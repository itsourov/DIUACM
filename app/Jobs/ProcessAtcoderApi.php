<?php

namespace App\Jobs;

use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Cache;

class ProcessAtcoderApi implements ShouldQueue
{
	use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;
	
	protected $contestID, $username;
	
	/**
	 * Create a new job instance.
	 */
	public function __construct($contestID, $username)
	{
		$this->contestID = $contestID;
		$this->username = $username;
	}
	
	
	/**
     * Execute the job.
     */
    public function handle(): void
    {
	    // Fetch contest details using cURL
	    $contestDataResponse = $this->fetchCurl('https://kenkoooo.com/atcoder/resources/contests.json');
	    if (!$contestDataResponse) {
		    Cache::put("atcoder_contest_data_loading_" . $this->contestID . "_" . $this->username, false);
		    Cache::put("atcoder_contest_data_" . $this->contestID . "_" . $this->username, ['error'=>true,'message'=>'Failed to fetch contest data']);
		    return;
	    }
	    
	    $contestData = json_decode($contestDataResponse, true);
	    $contestTime = null;
	    $contestDuration = null;
	    
	    foreach ($contestData as $contest) {
		    if ($contest['id'] === $this->contestID) {
			    $contestTime = $contest['start_epoch_second'];
			    $contestDuration = $contest['duration_second'];
			    break;
		    }
	    }
	    
	    if (is_null($contestTime) || is_null($contestDuration)) {
		    Cache::put("atcoder_contest_data_loading_" . $this->contestID . "_" . $this->username, false);
		    Cache::put("atcoder_contest_data_" . $this->contestID . "_" . $this->username, ['error'=>true,'message'=>'Contest Not Found']);
		    return;
	    }
	    
	    $contestEnd = $contestTime + $contestDuration;
	    
	    // Fetch user submissions using cURL
	    $submissionResponse = $this->fetchCurl("https://kenkoooo.com/atcoder/atcoder-api/v3/user/submissions?user=$this->username&from_second=$contestTime");
	    if (!$submissionResponse) {
		    Cache::put("atcoder_contest_data_loading_" . $this->contestID . "_" . $this->username, false);
		    Cache::put("atcoder_contest_data_" . $this->contestID . "_" . $this->username, ['error'=>true,'message'=>'Failed to fetch user submission']);
		    return;
	    }
	    
	    $submissions = json_decode($submissionResponse, true);
	    
	    // Initialize solve and upsolve counters
	    $solve = [];
	    $upsolve = [];
	    $absent = true;
	    
	    foreach ($submissions as $submission) {
		    if ($submission['contest_id'] === $this->contestID) {
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
	    
	    Cache::put("atcoder_contest_data_loading_" . $this->contestID . "_" . $this->username, false);
	    Cache::put("atcoder_contest_data_" . $this->contestID . "_" . $this->username, ['solve_count' => count($solve), 'upsolve_count' => count($upsolve), 'absent' => $absent]);
	    
    }
	
	private function fetchCurl(string $url)
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
}
