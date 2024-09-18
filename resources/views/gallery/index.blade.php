<x-web-layout>
    <section class="container mx-auto px-2 py-10">
        <div class="grid grid-cols-2 gap-4 sm:grid-cols-3 md:gap-6 xl:gap-8">
            @foreach ($galleries as $gallery)
                @if (($loop->iteration/2) % 2 == 1)
                    <a
                        href="{{ route("gallery.show", $gallery) }}"
                        class="group relative flex h-48 items-end overflow-hidden rounded-lg bg-gray-100 shadow-lg md:h-80">
                        <img
                            src="{{ $gallery->getFirstMediaUrl("gallery-images", "medium") }}"
                            loading="lazy"
                            alt="Photo by Minh Pham"
                            class="absolute inset-0 h-full w-full object-cover object-center transition duration-200 group-hover:scale-110" />

                        <div
                            class="pointer-events-none absolute inset-0 bg-gradient-to-t from-gray-800 via-transparent to-transparent opacity-50"></div>

                        <span
                            class="relative mb-3 ml-4 inline-block text-sm text-white md:ml-5 md:text-lg">
                            {{ $gallery->title }}
                            ({{ $gallery->getMedia("gallery-images")->count() }})
                        </span>
                    </a>
                @else
                    <a
                        href="{{ route("gallery.show", $gallery) }}"
                        class="group relative flex h-48 items-end overflow-hidden rounded-lg bg-gray-100 shadow-lg md:col-span-2 md:h-80">
                        <img
                            src="{{ $gallery->getFirstMediaUrl("gallery-images", "medium") }}"
                            loading="lazy"
                            alt="Photo by Magicle"
                            class="absolute inset-0 h-full w-full object-cover object-center transition duration-200 group-hover:scale-110" />

                        <div
                            class="pointer-events-none absolute inset-0 bg-gradient-to-t from-gray-800 via-transparent to-transparent opacity-50"></div>

                        <span
                            class="relative mb-3 ml-4 inline-block text-sm text-white md:ml-5 md:text-lg">
                            {{ $gallery->title }}
                            ({{ $gallery->getMedia("gallery-images")->count() }})
                        </span>
                    </a>
                @endif
            @endforeach
        </div>
    </section>
</x-web-layout>
