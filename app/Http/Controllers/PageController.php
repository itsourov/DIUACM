<?php

namespace App\Http\Controllers;

class PageController extends Controller
{
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
