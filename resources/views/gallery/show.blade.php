<x-web-layout>
    <section class="container mx-auto px-2 py-10">

	    <div class="mb-4 flex items-center justify-between gap-8 sm:mb-8 md:mb-12">
		    <div class="relative mx-auto">
			    <h2 class="text-center text-3xl leading-8 font-extrabold tracking-tight sm:text-4xl">{{$gallery->title}}</h2>
			    <p class="mt-4 max-w-3xl mx-auto text-center text-xl text-gray-500">{{$gallery->description}} </div>


	    </div>

	    <!-- Image Grid -->
	    <div class="grid grid-cols-1 gap-2 sm:grid-cols-3">
		    @foreach ($gallery->getMedia("gallery-images") as $image)
			    <div class="group rounded-lg overflow-clip">
				    {{$image->img()->attributes(['class'=>" spotlight aspect-2 object-cover  group-hover:scale-110 transition duration-200"])}}
			    </div>

		    @endforeach
        </div>
        <!-- End Image Grid -->
    </section>
</x-web-layout>
