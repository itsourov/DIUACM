<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Event;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ExportData extends Controller
{
    public function users()
    {

        if (request()->header('Authorization') != config('app.key')) {
            return response()->json([], 401);
        }
        return DB::table('users')->get();

    }
    public function pp()
    {

        $users = User::with('media')->get()->keyBy('email')->map(function ($user) {
            return [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'profile_image_url' => $user->getFirstMediaUrl('profile-images'),
                'profile_image_thumbnail' => $user->getFirstMediaUrl('profile-images', 'preview')
            ];
        });
        return $users;

    }

    public function events()
    {
        return Event::with(['attenders', 'trackers'])->get();

    }
}
