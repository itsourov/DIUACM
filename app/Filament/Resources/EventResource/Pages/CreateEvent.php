<?php
	
	namespace App\Filament\Resources\EventResource\Pages;
	
	use App\Enums\AccessStatuses;
	use App\Enums\EventTypes;
	use App\Enums\VisibilityStatuses;
	use App\Filament\Resources\EventResource;
	use Carbon\Carbon;
	use Filament\Actions\Action;
	use Filament\Forms\Components\TextInput;
	use Filament\Notifications\Notification;
	use Filament\Resources\Pages\CreateRecord;
	use Illuminate\Support\Facades\Http;
	
	class CreateEvent extends CreateRecord
	{
		protected static string $resource = EventResource::class;
		
		protected function getHeaderActions(): array
		{
			return [
				
				Action::make('Quick Contest')
					->form([
						TextInput::make('contest_link'),
					])
					->action(function (array $data): void {
						$this->updateInfo($data);
					})
			];
		}
		
		public function updateInfo($data)
		{
			$contest_link = $data['contest_link'];
			$parsedUrl = parse_url($contest_link);
			if (isset($parsedUrl['host']) && $parsedUrl['host'] == 'codeforces.com') {
				
				$contest_id = explode('/', $contest_link)[4] ?? null;
				$res = Http::get('https://codeforces.com/api/contest.list')->json();
				if ($res['status'] == 'OK') {
					foreach ($res['result'] as $contest) {
						if ($contest['id'] == $contest_id) {

//
							$this->form->fill([
								'title' => $contest['name'],
								'starting_time' => Carbon::createFromTimestamp($contest['startTimeSeconds'], 'Asia/Dhaka')->toDateTimeString(),
								'ending_time' => Carbon::createFromTimestamp($contest['startTimeSeconds'] + $contest['durationSeconds'], 'Asia/Dhaka')->toDateTimeString(),
								'contest_link' => $data['contest_link'],
								'type' => EventTypes::CONTEST,
								'weight' => 0.5,
								'visibility' => VisibilityStatuses::PUBLISHED,
								'organized_for' => AccessStatuses::OPEN_FOR_ALL,
							]);
							return;
						}
					}
					Notification::make()
						->title('No Contest Was Found')
						->warning()
						->send();
				}
				
			}
			else if (isset($parsedUrl['host']) && $parsedUrl['host'] == 'vjudge.net') {
				
				$html = Http::get($contest_link)->body();
			
				
				preg_match('/<textarea[^>]*name="dataJson"[^>]*>(.*?)<\/textarea>/s', $html, $matches);
				
				if (isset($matches[1])) {
					$jsonText = $matches[1]; // Extracted JSON string
					
					$contest = json_decode($jsonText, true);
					
					$this->form->fill([
						'title' => $contest['title'],
						'starting_time' => Carbon::createFromTimestamp($contest['begin']/1000, 'Asia/Dhaka')->toDateTimeString(),
						'ending_time' => Carbon::createFromTimestamp($contest['end']/1000, 'Asia/Dhaka')->toDateTimeString(),
						'contest_link' => $data['contest_link'],
						'type' => EventTypes::CONTEST,
						'weight' => 1,
						'visibility' => VisibilityStatuses::PUBLISHED,
						'organized_for' => AccessStatuses::OPEN_FOR_ALL,
					]);

					
				} else {
					Notification::make()
						->title('Contest info not found')
						->warning()
						->send();
				}
			} else 	if (isset($parsedUrl['host']) && $parsedUrl['host'] == 'atcoder.jp') {
				
				$curl = curl_init();
				
				curl_setopt_array($curl, array(
					CURLOPT_URL => "https://kenkoooo.com/atcoder/resources/contests.json",
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
				$contests = json_decode($response,true);
				$contest_id = explode('/', $contest_link)[4] ?? null;
			
				foreach ($contests as $contest) {
					if ($contest['id'] == $contest_id) {

//
						$this->form->fill([
							'title' => $contest['title'],
							'starting_time' => Carbon::createFromTimestamp($contest['start_epoch_second'], 'Asia/Dhaka')->toDateTimeString(),
							'ending_time' => Carbon::createFromTimestamp($contest['start_epoch_second'] + $contest['duration_second'], 'Asia/Dhaka')->toDateTimeString(),
							'contest_link' => $data['contest_link'],
							'type' => EventTypes::CONTEST,
							'weight' => 0.5,
							'visibility' => VisibilityStatuses::PUBLISHED,
							'organized_for' => AccessStatuses::OPEN_FOR_ALL,
						]);
						return;
					}
				}
				Notification::make()
					->title('No Contest Was Found')
					->warning()
					->send();
			
			}
			else {
				Notification::make()
					->title('Invalid Url')
					->warning()
					->send();
			}
			
		}
	}
