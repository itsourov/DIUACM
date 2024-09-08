<?php
	
	namespace App\Livewire;
	
	use App\Models\Event;
	use Filament\Forms\Concerns\InteractsWithForms;
	use Livewire\Component;
	use Livewire\WithPagination;
	
	class EventListingPage extends Component
	{
		
		use WithPagination;
		public $activeTab = 'all', $allCount = 0, $runningCount = 0,$search;
		protected $queryString = [
			'activeTab',
			'search' => ['except' => ''],
		
		];
		
		public function mount()
		{
			$this->allCount = Event::count();
			$this->runningCount = Event::where('starting_time', '<=', now())
				->where('ending_time', '>=', now())
				->count();
		}
		
		public function render()
		{
			if ($this->activeTab == 'running') {
				$events = Event::with(['attenders'])
					->where('starting_time', '<=', now())
					->where('ending_time', '>=', now())
					->orderByDesc('starting_time');
			} else {
				$events = Event::with(['attenders'])->orderByDesc('starting_time');
			}
			$events->where('title', 'like', "%$this->search%");
			
			return view('livewire.event-listing-page', [
				'events' => $events->paginate(10),
			]);
		}
	}
