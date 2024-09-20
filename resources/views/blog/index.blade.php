<x-web-layout>
  <section class="dark:bg-gray-900">
      <div class="container mx-auto mt-5 space-y-5 px-2">
          <!-- Card Blog -->
          <div class="container mx-auto px-2 py-10">


              <!-- Grid -->
              <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  @foreach ($posts as $post)
		              <!-- Card -->
		              <a class="" href="{{ route("blog.show", $post) }}">
			              <x-card class="group flex flex-col h-full ">
				              <div class="aspect-w-16 aspect-h-11">
					              {{ $post->getFirstMedia("post-featured-images")?->img()->attributes(["class" => "w-full object-cover rounded-xl"]) }}
				              </div>
				              <div class="my-6">
					              <h3
							              class="text-xl font-semibold text-gray-800 dark:text-neutral-300 dark:group-hover:text-white line-clamp-2">
						              {{ $post->title }}
					              </h3>
					              <p
							              class="mt-5 text-gray-600 dark:text-neutral-400">
						              {!! Str::limit(strip_tags($post->content)) !!}
					              </p>
				              </div>
				              <div class="mt-auto flex items-center gap-x-3">
					              <img
							              class="size-8 rounded-full"
							              src=" {{ $post->user->getFirstMediaUrl("profile-images") }}"
							              alt="Image Description" />
					              <div>
						              <h5
								              class="text-sm text-gray-800 dark:text-neutral-200">
							              By {{ $post->user->name }}
						              </h5>
					              </div>
				              </div>
			              </x-card>
		              </a>
		              <!-- End Card -->
	              @endforeach
              </div>
	          <!-- End Grid -->

	          {{$posts->links()}}
          </div>
          <!-- End Card Blog -->
      </div>
  </section>
</x-web-layout>
