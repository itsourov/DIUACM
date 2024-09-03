<?php
	
	namespace App\Http\Controllers;
	
	use App\Models\Event;
	
	class EventController extends Controller
	{
		/**
		 * Display a listing of the resource.
		 */
		public function index()
		{
			$events = Event::with(['attendances', 'groups.users'])->orderByDesc('starts_at')->paginate(10);
			return view('events.index', [
				'events' => $events,
			]);
		}
		
		/**
		 * Display the specified resource.
		 */
		public function show(Event $event)
		{
			$event->loadMissing(['attendances.user']);
			
			return view('events.show', compact('event'));
		}
		
	}
