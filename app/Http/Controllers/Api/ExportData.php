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

    public function events()
    {
        return Event::with(['attenders', 'trackers'])->get();

    }
}
