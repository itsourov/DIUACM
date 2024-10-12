<x-web-layout>
    @section("seo")
        {!! seo($SEOData) !!}
    @endsection
    <script type='text/javascript'
            src='https://platform-api.sharethis.com/js/sharethis.js#property=66ee4da2d219590019f5eaa6&product=sop'
            async='async'></script>


    <!-- Blog Article -->
    <div class="container mx-auto px-2 py-14">
        <div class="space-y-5 lg:space-y-8">
            @foreach ($post->categories as $category)
                <a
                    class="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-800 hover:bg-gray-200 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-800 sm:px-4 sm:py-2 sm:text-sm"
                    href="#">
                    {{ $category->title }}
                </a>
            @endforeach

            <h2
                class="text-3xl font-bold dark:text-white lg:text-4xl">
                {{ $post->title }}
            </h2>

            <div class="flex items-center gap-x-5">


                <p
                    class="text-xs text-gray-800 dark:text-neutral-200 sm:text-sm">
                    {{ $post->formattedPublishedDate() }}
                </p>
                <x-filament::badge color="info">
                    {{$post->view_count??0}} Views
                </x-filament::badge>
            </div>

            <article
                class="prose prose-lg mx-auto mt-5 max-w-none prose-img:rounded prose-img:w-full dark:prose-invert prose-a:text-primary-600">
                {!! $post->content !!}
            </article>
                <div>
                    <p class="text-sm ml-1">Author:</p>
                    <x-card class="max-w-md flex  items-center gap-1">
                        <a class="block flex-shrink-0 spotlight" href="{{$post->user->getFirstMediaUrl("profile-images")}}">
                            <img
                                class="size-10 rounded-full"
                                src="{{ $post->user->getFirstMediaUrl("profile-images", "preview") }}"
                                alt="Image Description" />
                        </a>

                        <span class="group block grow">
                    <h5
                        class="text-sm font-semibold text-gray-800 group-hover:text-gray-600 dark:text-neutral-200 dark:group-hover:text-neutral-400">
                        {{ $post->user->name }}
                    </h5>
                    <p
                        class="text-sm text-gray-500 dark:text-neutral-500">
                        {{ $post->user->bio }}
                    </p>
                </span>
                    </x-card>
                </div>


            <div
                class="grid gap-y-5 lg:flex lg:items-center lg:justify-between lg:gap-y-0">
                <!-- Badges/Tags -->
                {{-- <div> --}}
                {{-- @foreach ($post->tags as $tag) --}}
                {{-- <a --}}
                {{-- class="m-0.5 inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-2 text-sm text-gray-800 hover:bg-gray-200 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-700" --}}
                {{-- href="#"> --}}
                {{-- {{ $tag->name }} --}}
                {{-- </a> --}}
                {{-- @endforeach --}}
                {{-- </div> --}}
                <!-- End Badges/Tags -->
            </div>
            <!-- ShareThis BEGIN -->
            <div class="sharethis-inline-reaction-buttons"></div>
            <!-- ShareThis END -->


            <livewire:comment-section
                cardClass="dark:bg-gray-900"
                :commentable="$post" />
        </div>
    </div>
    <!-- End Blog Article -->
</x-web-layout>
