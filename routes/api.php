<?php

use App\Http\Controllers\Api\ExportData;
use App\Http\Controllers\TrackerController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');
Route::prefix('trackers')->name('trackers.')->group(function () {
    Route::get('/{tracker}', [TrackerController::class, 'ranklistApi'])->name('ranklist-api');
});

Route::get('/users', [ExportData::class, 'users']);
Route::get('/events', [ExportData::class, 'events']);


