<?php

namespace App\Http\Controllers\Auth;


use App\Events\NewUserRegistered;
use App\Http\Controllers\Controller;
use App\Models\User;
use Filament\Notifications\Notification;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Laravel\Socialite\Facades\Socialite;

class GoogleLoginController extends Controller
{
    public function googleCallback()
    {


        try {
            $googleUser = Socialite::driver('google')->user();

            $user = User::where('email', $googleUser->getEmail())->withTrashed()->first();
            if (!$user) {

                $i = 0;
                $username = Str::slug($googleUser->getName());
                while (User::where('username', '=', $username)->exists()) {
                    $i++;
                    $username = $username . $i;
                }
				$password = Str::random(10);
                $new_user = User::create([
                    'name' => $googleUser->getName(),
                    'username' => $username,
                    'email' => $googleUser->getEmail(),
	                'password' => bcrypt($password),
                ]);

                Auth::login($new_user);
                Notification::make()
                    ->title("You are now logged in!")
                    ->success()
                    ->send();
                if ($googleUser['verified_email']) {
                    $new_user->markEmailAsVerified();
                }
                event(new NewUserRegistered($new_user,$password));
                $new_user->addMediaFromUrl(str_replace('=s96-c', '', $googleUser->avatar))
                    ->usingFileName($googleUser->name . '.png')
                    ->toMediaCollection('profile-images', 'profile-images');

                return redirect()->intended(route('home'));
            } else {
                if ($user->deleted_at) {
                    $user->restore();
                }
                Auth::login($user);
//                $user->update(['token' => $googleUser->token]);
                if ($googleUser['verified_email']) {
                    $user->markEmailAsVerified();
                }
                Notification::make()
                    ->title("You are now logged in!")
                    ->success()
                    ->send();
                return redirect()->intended(route('home'));
            }
        } catch (\Throwable $th) {
            Notification::make()
                ->title("There was an error while logging in.")
                ->body($th->getMessage())
                ->danger()
                ->send();
            return redirect()->intended(route('home')) ;

        }
    }
}
