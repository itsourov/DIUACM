<?php
	
	use App\Http\Controllers\EventController;
	use App\Http\Controllers\PageController;
	use App\Http\Controllers\ProfileController;
	use Illuminate\Support\Facades\Route;
	
	Route::get('/', function () {
		return view('welcome');
	})->name('home');
	
	
	Route::prefix('events')->name('events.')->group(function () {
		Route::get('/', [EventController::class, 'index'])->name('index');
		Route::get('/{event}', [EventController::class, 'show'])->name('show');
	});
	
	
	
	Route::prefix('my-account')->name('my-account.')->middleware(['auth'])->group(function () {
		
		Route::prefix('profile')->name('profile.')->group(function () {
			Route::get('/', [ProfileController::class, 'edit'])->name('edit');
		});
		
	});
	
	Route::prefix('pages')->middleware([])->group(function () {
		Route::get('faq', [PageController::class, 'faq'])->name('pages.faq');
		Route::get('about', [PageController::class, 'about'])->name('pages.about');
		Route::get('contact', [PageController::class, 'contact'])->name('pages.contact');
		Route::get('privacy-policy', [PageController::class, 'privacyPolicy'])->name('pages.privacy-policy');
		Route::get('terms-and-conditions', [PageController::class, 'termsAndConditions'])->name('pages.terms-and-conditions');
		
	});
	require __DIR__ . '/auth.php';