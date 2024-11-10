<?php

	use App\Http\Controllers\EventController;
	use App\Http\Controllers\GalleryController;
	use App\Http\Controllers\PageController;
	use App\Http\Controllers\PostController;
	use App\Http\Controllers\ProfileController;
	use App\Http\Controllers\TrackerController;
	use App\Http\Middleware\EnsureDiuEmail;
	use Illuminate\Support\Facades\Route;

	Route::get('/', [PageController::class, 'home'])->name('home');

	Route::prefix('events')->name('events.')->group(function () {
		Route::get('/', [EventController::class, 'index'])->name('index');
		Route::get('/{event}', [EventController::class, 'show'])->middleware([])->name('show');
	});
	Route::prefix('trackers')->name('trackers.')->group(function () {
		Route::get('/', [TrackerController::class, 'index'])->name('index');
		Route::get('/{tracker}', [TrackerController::class, 'show'])->name('show');
		Route::get('/{tracker}/fetch', [TrackerController::class, 'fetch'])->name('fetch');
	});
	Route::prefix('blog')->name('blog.')->group(function () {
		Route::get('/', [PostController::class, 'index'])->name('index');
		Route::get('/{post:slug}', [PostController::class, 'show'])->name('show');
	});
	Route::prefix('gallery')->name('gallery.')->group(function () {
		Route::get('/', [GalleryController::class, 'index'])->name('index');
		Route::get('/{gallery}', [GalleryController::class, 'show'])->name('show');
	});



	Route::prefix('my-account')->name('my-account.')->middleware(['auth','verified'])->group(function () {

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
