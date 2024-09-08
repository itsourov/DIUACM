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

			
			return view('events.index');
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
