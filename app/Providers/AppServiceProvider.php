<?php

namespace App\Providers;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\ServiceProvider;
use Filament\Forms;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
	    Model::preventLazyLoading(! app()->isProduction());
        Forms\Components\TextInput::configureUsing(function (Forms\Components\TextInput $textInput): void {
            $textInput
                ->dehydrateStateUsing(function (?string $state): ?string {
                    return is_string($state) ? trim($state) : $state;
                });
        });


    }
}
