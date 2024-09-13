<?php
	
	namespace App\Http\Controllers;
	
	use App\Enums\AccessStatuses;
	use App\Http\Helpers\ContestDataManager\CF;
	use App\Models\Tracker;
	use App\Models\User;
	use Filament\Notifications\Notification;
	use Illuminate\Http\Client\ConnectionException;
	use Illuminate\Http\Request;
	
	class TrackerController extends Controller
	{
		/**
		 * Display a listing of the resource.
		 */
		public function index()
		{
			$trackers = Tracker::paginate(10);
			return view('tracker.index', compact('trackers'));
		}
		
		/**
		 * Show the form for creating a new resource.
		 */
		public function create()
		{
			//
		}
		
		/**
		 * Store a newly created resource in storage.
		 */
		public function store(Request $request)
		{
			//
		}
		
		
		/**
		 * Display the specified resource.
		 */
		public function show(Tracker $tracker)
		{
			
			if ($tracker->organized_for == AccessStatuses::OPEN_FOR_ALL) {
				$allUsers = User::with('media')->get();
			} else
				$allUsers = User::whereIn('id', function ($query) use ($tracker) {
					$query->select('user_id')
						->from('group_user')
						->join('groups', 'group_user.group_id', '=', 'groups.id')
						->whereIn('groups.id', function ($query) use ($tracker) {
							$query->select('group_id')
								->from('group_tracker')
								->where('tracker_id', $tracker->id);
						});
				})->with('media')->get();
			
			
			$usersData = [];
			
			$tracker->loadMissing('events');
			
			
			foreach ($allUsers as $user) {
				$usersData[$user->id]['solve_score'] = 0;
				$usersData[$user->id]['upsolve_score'] = 0;
				
				foreach ($tracker->events as $event) {
					
					if (!$user->codeforces_username) {
						continue;
					}
					
					try {
						$usersData[$user->id][$event->id] = CF::getContestDataOfAUser($event->contest_link ?? "", $user->codeforces_username ?? "");
						
						$usersData[$user->id]['solve_score'] += ($event->weight * $usersData[$user->id][$event->id]['solve_count']);
						$usersData[$user->id]['upsolve_score'] += 0.25 * ($event->weight * $usersData[$user->id][$event->id]['upsolve_count']);
						
					} catch (ConnectionException $e) {
						
						Notification::make()
							->title("There was an error while calling CF API")
							->body($e->getMessage())
							->warning()
							->send();
						
					}
					
				}
				
				$usersData[$user->id]['score'] = $usersData[$user->id]['solve_score'] + $usersData[$user->id]['upsolve_score'];
				
				
			}
			uasort($usersData, function ($a, $b) {
				return $b['score'] <=> $a['score'];
			});
			
			
			return view('tracker.show', compact('tracker', 'usersData', 'allUsers'));
		}
		
		/**
		 * Show the form for editing the specified resource.
		 */
		public function edit(Tracker $tracker)
		{
			//
		}
		
		/**
		 * Update the specified resource in storage.
		 */
		public function update(Request $request, Tracker $tracker)
		{
			//
		}
		
		/**
		 * Remove the specified resource from storage.
		 */
		public function destroy(Tracker $tracker)
		{
			//
		}
	}
