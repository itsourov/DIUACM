<?php

namespace App\Http\Controllers;

use App\Models\Post;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class PostController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
	    $posts = Post::query()->with(['categories', 'user.media', 'media'])
		    ->published()
		    ->paginate(9);
		return view('blog.index',compact('posts'));
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(Post $post)
    {
	    $relatedPosts = $post->relatedPosts();
		$post->loadMissing(['categories', 'user.media', 'media']);
	    
	    $SEOData = new \RalphJSmit\Laravel\SEO\Support\SEOData(
		    title: $post->title,
		    description:  Str::limit(strip_tags($post->content)) ,
	    
	    );
	    $post->increment('view_count');
		
	    return view('blog.show', compact('post','relatedPosts','SEOData'));
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Post $post)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Post $post)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Post $post)
    {
        //
    }
}
