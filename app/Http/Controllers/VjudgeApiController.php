<?php
	
	namespace App\Http\Controllers;
	
	use Filament\Notifications\Notification;
	use Illuminate\Http\Request;
	use Illuminate\Support\Facades\Cache;
	use Illuminate\Support\Facades\Cookie;
	use Illuminate\Support\Facades\Http;
	use Illuminate\Support\Facades\Response;
	
	class VjudgeApiController extends Controller
	{
		public function authenticateVjudge(Request $request)
		{
			if ($request->isMethod('post') && $request->captcha) {
				$cookie = Cookie::get('captcha_cookie');
			} else {
				$cookie = Cache::get('vjudge-cookie');
			}
			$curl = curl_init();
			
			curl_setopt_array($curl, array(
				CURLOPT_URL => 'https://vjudge.net/user/login?username=sourov_cse&password=openpass1234&captcha=' . $request->captcha,
				CURLOPT_RETURNTRANSFER => true,
				CURLOPT_ENCODING => '',
				CURLOPT_MAXREDIRS => 10,
				CURLOPT_TIMEOUT => 0,
				CURLOPT_FOLLOWLOCATION => true,
				CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
				CURLOPT_CUSTOMREQUEST => 'POST',
				CURLOPT_HTTPHEADER => array(
					'Cookie: ' . $cookie
				),
				CURLOPT_HEADER => true,
			
			));
			
			$response = curl_exec($curl);
			
			// Check for errors
			if (curl_errno($curl)) {
				echo 'cURL Error: ' . curl_error($curl);
			}
			
			// Get the header size
			$headerSize = curl_getinfo($curl, CURLINFO_HEADER_SIZE);
			
			// Separate the header and body
			$header = substr($response, 0, $headerSize);
			$body = substr($response, $headerSize);
			
			// Close cURL session
			curl_close($curl);
			
			
			if ($body == 'Captcha is wrong') {
				if ($request->isMethod('post'))
					Notification::make()
						->title("Wrong Captcha Code")
						->danger()
						->send();
				return view('vjudge_captcha');
			} else if ($body == 'success') {
				if ($request->isMethod('post') && isset($request->captcha))
					Cache::put('vjudge-cookie', Cookie::get('captcha_cookie'), now()->addMonth());
				else {
					preg_match_all('/^Set-Cookie:\s*([^;]*)/mi', $header, $matches);
					
					
					$set_cookies = implode('; ', $matches[1]);
					
					
					Cache::put('vjudge-cookie', $set_cookies, now()->addMonth());
				}
				Notification::make()
					->title("Vjudge Authentication Success")
					->success()
					->send();
				return redirect()->intended(route('home'));
			}
			return "i didnt think of this case. send the screenshot and and the url to Sourov Biswas";
			
			
		}
		
		function getCaptcha()
		{
			// Replace with your image URL
			$url = 'https://vjudge.net/util/captcha';
			
			// Fetch the image using HTTP GET request
			$image = Http::get($url);
			
			
			$cookie = cookie('captcha_cookie', $image->getHeader('Set-Cookie')[0] ?? "", 60);

//			// Return the image as a response
			return Response::make($image->body(), 200, [
				'Content-Type' => $image->header('Content-Type'),
				'Content-Disposition' => 'inline; filename="image.jpg"',
			])->cookie($cookie);
//
		}
	}
