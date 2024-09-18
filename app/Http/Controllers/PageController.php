<?php
	
	namespace App\Http\Controllers;
	
	use App\Models\Gallery;
	
	class PageController extends Controller
	{
		public function home()
		{
		
			$medias = cache()->rememberForever('homepage-gallery', function () {
				return Gallery::find(1)?->getMedia('gallery-images')
					->map(function ($media) {
						return [
							'medium' => $media->getUrl('medium'),
							'original' => $media->getUrl(),
							'name' => $media->name,
						];
					})
					->toArray();
			});
			if (!$medias) {
				$medias[0] = [
					'medium' => asset('images/diuacm.jpeg'),
					'original' => asset('images/diuacm.jpeg'),
				];
			}
	
			
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
