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
			$events = Event::with(['attenders'])->orderByDesc('starting_time')->paginate(10);
			
			return view('events.index', [
				'events' => $events,
			]);
		}
		
		/**
		 * Display the specified resource.
		 */
		public function show(Event $event)
		{
			return view('events.show',[
				'event'=>$event,
			]);
		}
		
	}
