<?php

namespace App\Livewire;

use App\Models\Event;
use Filament\Forms\Concerns\InteractsWithForms;
use Filament\Forms\Contracts\HasForms;
use Filament\Tables\Columns\BadgeColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Concerns\InteractsWithTable;
use Filament\Tables\Contracts\HasTable;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Model;
use Livewire\Component;
use Livewire\WithPagination;

class EventListingPage extends Component implements HasForms, HasTable
{
    use InteractsWithTable;
    use InteractsWithForms;

//		public $activeTab = 'all', $allCount = 0, $runningCount = 0,$upcomingCount=0,$search;
//		protected $queryString = [
//			'activeTab',
//			'search' => ['except' => ''],
//
//		];

//		public function mount()
//		{
//			$this->allCount = Event::count();
//			$this->runningCount = Event::where('starting_time', '<=', now())
//				->where('ending_time', '>=', now())
//				->count();
//            $this->upcomingCount = Event::where('starting_time', '>', now())
//				->count();
//		}

    public function table(Table $table): Table
    {
        return $table
            ->query(Event::query())
            ->defaultSort('starting_time', 'desc')
            ->recordUrl(
                fn(Model $record): string => route('events.show', $record),
            )
            ->columns([
                TextColumn::make('type'),
                TextColumn::make('title')
                    ->limit(40)
                    ->searchable()
                    ->sortable(),
                TextColumn::make('status')
                    ->badge()
                    ->colors([
                        'info' => fn($record) => $record->starting_time > now(),
                        'success' => fn($record) => now() >= $record->starting_time && now() <= $record->ending_time,
                        'warning' => fn($record) => $record->ending_time < now(),
                    ])
                    ->getStateUsing(function ($record) {
                        if ($record->starting_time > now()) {
                            return 'Upcoming';
                        } elseif (now() >= $record->starting_time && now() <= $record->ending_time) {
                            return 'Running';
                        } else {
                            return 'In Past';
                        }
                    }),


                TextColumn::make('starting_time')
                    ->sortable()
                    ->dateTime('h:i A, d M Y (D)'),


                TextColumn::make('organized_for'),
            ])
            ->filters([
                // ...
            ])
            ->actions([
                // ...
            ])
            ->bulkActions([
                // ...
            ]);
    }

    public function render()
    {
        return view('livewire.event-listing-page');
    }
}
