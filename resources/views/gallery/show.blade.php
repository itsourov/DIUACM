<x-web-layout>
    <section class="container mx-auto px-2 py-10">

	    <div class="mb-4 flex items-center justify-between gap-8 sm:mb-8 md:mb-12">
		    <div class="relative mx-auto">
			    <h2 class="text-center text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">{{$gallery->title}}</h2>
			    <p class="mt-4 max-w-3xl mx-auto text-center text-xl text-gray-500">{{$gallery->description}}  </div>


	    </div>

	    <!-- Image Grid -->
	    <div class="grid grid-cols-2 gap-2 sm:grid-cols-3">
		    @foreach ($gallery->getMedia("gallery-images") as $image)
			    <a
					    class="group relative block overflow-hidden rounded-lg spotlight"
					    href="{{$image->getUrl()}}">
				    <img
						    class="aspect-1.5  w-full rounded-lg bg-gray-100 object-cover dark:bg-neutral-800"
						    src="{{$image->getUrl('medium')}}"
						    alt="Project" />
				    <div
						    class="absolute bottom-1 end-1 opacity-0 transition group-hover:opacity-100">
					    <div
							    class="flex items-center gap-x-1 rounded-lg border border-gray-200 bg-white px-2 py-1 text-gray-800 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200">
						    <svg
								    class="size-3 shrink-0"
								    xmlns="http://www.w3.org/2000/svg"
								    width="24"
								    height="24"
								    viewBox="0 0 24 24"
								    fill="none"
								    stroke="currentColor"
								    stroke-width="2"
								    stroke-linecap="round"
								    stroke-linejoin="round">
							    <circle cx="11" cy="11" r="8" />
							    <path d="m21 21-4.3-4.3" />
						    </svg>
						    <span class="text-xs">View</span>
					    </div>
				    </div>
			    </a>
		    @endforeach
        </div>
        <!-- End Image Grid -->
    </section>
</x-web-layout>
