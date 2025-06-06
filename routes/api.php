<?php

use App\Http\Controllers\ExtensionController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::get('/events/vjudge', [ExtensionController::class,'getVjudgeEvents'])
->middleware('auth:sanctum')
->name('vjudge.events');
Route::post('/events/{event}/vjudge', [ExtensionController::class,'postVjudgeEvents'])
->middleware('auth:sanctum')
->name('vjudge.events.post');