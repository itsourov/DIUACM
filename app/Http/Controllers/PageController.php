<?php
	
	namespace App\Http\Controllers;
	
	use App\Models\Gallery;
	
	class PageController extends Controller
	{
		public function home()
		{
			$medias = cache()->rememberForever('homepage-galleries', function () {
				return Gallery::find(7)?->getMedia('gallery-images') ?? [];
			});
			
			
			return view('welcome', compact('medias'));
		}
		
		public function faq()
		{
			return view('pages.faq');
		}
		
		public function about()
		{
			return view('pages.about');
		}
		
		public function contact()
		{
			return view('pages.contact');
		}
		
		public function privacyPolicy()
		{
			return view('pages.privacy-policy');
		}
		
		public function termsAndConditions()
		{
			return view('pages.terms-and-conditions');
		}
	}
