<x-web-layout>
    @section("seo")
        {!! seo($SEOData) !!}
    @endsection
    <!-- Blog Article -->
    <div class="container mx-auto px-2">
        <div class="grid gap-y-8 lg:grid-cols-3 lg:gap-x-6 lg:gap-y-0">
            <!-- Content -->
            <div class="lg:col-span-2">
                <div class="py-8 lg:pe-8">
                    <div class="space-y-5 lg:space-y-8">
                        <a
                            href="{{ route('blog.index') }}"
                            class="inline-flex items-center gap-x-1.5 text-sm text-gray-600 decoration-2 hover:underline dark:text-blue-500">
                            <svg
                                class="size-4 flex-shrink-0"
                                xmlns="http://www.w3.org/2000/svg"
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                stroke-width="2"
                                stroke-linecap="round"
                                stroke-linejoin="round">
                                <path d="m15 18-6-6 6-6" />
                            </svg>
                            Back to Blog
                        </a>

                        <h2
                            class="text-3xl font-bold dark:text-white lg:text-5xl">
                            {{ $post->title }}
                        </h2>

                        <div class="flex items-center gap-x-5">
                            @foreach ($post->categories as $category)
                                <a
                                    class="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-800 hover:bg-gray-200 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-800 sm:px-4 sm:py-2 sm:text-sm"
                                    href="#">
                                    {{ $category->title }}
                                </a>
                            @endforeach

                            <p
                                class="text-xs text-gray-800 dark:text-neutral-200 sm:text-sm">
                                {{ $post->formattedPublishedDate() }}
                            </p>
                        </div>

                        <article
                            class="prose prose-base mx-auto mt-5 max-w-none dark:prose-invert prose-a:text-primary-600">
                            {!! $post->content !!}


                        </article>
                        <div
                            class="grid gap-y-5 lg:flex lg:items-center lg:justify-between lg:gap-y-0">
                            <!-- Badges/Tags -->
{{--                            <div>--}}
{{--                                @foreach ($post->tags as $tag)--}}
{{--                                    <a--}}
{{--                                        class="m-0.5 inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-2 text-sm text-gray-800 hover:bg-gray-200 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-700"--}}
{{--                                        href="#">--}}
{{--                                        {{ $tag->name }}--}}
{{--                                    </a>--}}
{{--                                @endforeach--}}
{{--                            </div>--}}
                            <!-- End Badges/Tags -->


                        </div>
                        <livewire:comment-section cardClass="dark:bg-gray-900" :commentable="$post"/>
                    </div>
                </div>
            </div>
            <!-- End Content -->

            <!-- Sidebar -->
            <div
                class="dark:from-neutral-800 lg:col-span-1 lg:h-full lg:w-full lg:bg-gradient-to-r lg:from-gray-50 lg:via-transparent lg:to-transparent">
                <div class="sticky start-0 top-0 py-8 lg:ps-8">
                    <!-- Avatar Media -->
                    <div
                        class="group mb-8 flex items-center gap-x-3 border-b border-gray-200 pb-8 dark:border-neutral-700">
                        <a class="block flex-shrink-0" href="#">
                            <img
                                class="size-10 rounded-full"
                                src="{{$post->user->getFirstMediaUrl('profile-images','preview')}}"
                                alt="Image Description" />
                        </a>

                        <a class="group block grow" href="">
                            <h5
                                class="text-sm font-semibold text-gray-800 group-hover:text-gray-600 dark:text-neutral-200 dark:group-hover:text-neutral-400">
                                {{$post->user->name}}
                            </h5>
                            <p
                                class="text-sm text-gray-500 dark:text-neutral-500">
                                will put something dynamic here"
                            </p>
                        </a>

                    </div>
                    <!-- End Avatar Media -->

                    <div class="space-y-6">
                        @foreach ($relatedPosts as $relatedPost)
                            <!-- Media -->
                            <a
                                class="group flex items-center gap-x-6"
                                href="{{ route("blog.show", $relatedPost) }}">
                                <div class="grow">
                                    <span
                                        class="text-sm font-bold text-gray-800 group-hover:text-blue-600 dark:text-neutral-200 dark:group-hover:text-blue-500">
                                        {{ $relatedPost->title }}
                                    </span>
                                </div>

{{--                                <div--}}
{{--                                    class="relative size-20 flex-shrink-0 overflow-hidden rounded-lg">--}}
{{--                                    {{ $relatedPost->getFirstMedia("post-featured-images")->img()->attributes(["class" => "size-full absolute top-0 start-0 object-cover rounded-lg"]) }}--}}
{{--                                </div>--}}
                            </a>
                            <!-- End Media -->
                        @endforeach
                    </div>
                </div>
            </div>
            <!-- End Sidebar -->
        </div>
    </div>
    <!-- End Blog Article -->
</x-web-layout>
