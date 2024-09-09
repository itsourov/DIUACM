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
			$SEOData = new \RalphJSmit\Laravel\SEO\Support\SEOData(
				title: $event->title,
				description: $event->description,
		
			);
			
			return view('events.show',[
				'event'=>$event,
				'SEOData'=>$SEOData,
			]);
		}
		
	}
