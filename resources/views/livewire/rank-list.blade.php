<div>


    <div class="container mx-auto space-y-6 px-2 py-10">
        <!-- Card -->
        <div class="flex flex-col">
            <div class="-m-1.5 overflow-x-auto parent">
                <div class="inline-block min-w-full p-1.5 align-middle  child cursor-grab">
                    <div
                        class="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-neutral-700 dark:bg-neutral-900">
                        <!-- Header -->
                        <div
                            class="border-b border-gray-200 px-6 py-4 dark:border-neutral-700">
                            <h2
                                class="text-xl font-semibold text-gray-800 dark:text-neutral-200">
                                {{ $tracker->title }}
                            </h2>
                            <p
                                class="text-sm text-gray-600 dark:text-neutral-400">
                                {{ $tracker->description }}
                            </p>
                            <p
                                class="text-sm text-gray-600 dark:text-neutral-400">
                                Last
                                Updated:
                                <b>{{$tracker->updated_at->diffForHumans()}}</b>
                            </p>

                        </div>
                        <!-- End Header -->

                        <!-- Table -->
                        <table
                            class="min-w-full divide-y divide-gray-200 dark:divide-neutral-700">
                            <thead class="bg-gray-50 dark:bg-neutral-800">
                            <tr>
                                <th
                                    scope="col"
                                    class="whitespace-nowrap px-4 py-2 text-start">
                                        <span
                                            class="text-xs font-semibold uppercase tracking-wide text-gray-800 dark:text-neutral-200">
                                            #
                                        </span>
                                </th>

                                <th
                                    scope="col"
                                    class="min-w-64 whitespace-nowrap px-4 py-2 text-start">
                                        <span
                                            class="text-xs font-semibold uppercase tracking-wide text-gray-800 dark:text-neutral-200">
                                            Name
                                        </span>
                                </th>

                                <th
                                    scope="col"
                                    class="whitespace-nowrap px-4 py-2 text-start">
                                        <span
                                            class="text-xs font-semibold uppercase tracking-wide text-gray-800 dark:text-neutral-200">
                                            Points
                                        </span>
                                </th>
                                @foreach ($contests as $contest)

                                    @php
                                        $short_title = str_replace('Codeforces', 'CF', $contest->title);
                                       $short_title = str_replace('AtCoder Beginner Contest', 'ABC', $short_title);
                                       $short_title = str_replace('Rated for ', '', $short_title);
                                       $short_title = str_replace('Educational', 'EDU', $short_title);
                                    @endphp

                                    <th
                                        scope="col"
                                        class="whitespace-nowrap px-4 py-2 text-start">
                                        <a target="_blank" href="{{$contest->contest_link}}"
                                           class="max-w-5 overflow-ellipsis text-xs font-semibold uppercase tracking-wide text-blue-600">
                                            {!! Str::limit($short_title, 30, ' ...') !!}
                                        </a>
                                        <x-filament::badge
                                            color="info"
                                            class="w-max">
                                            Weight: {{ $contest->weight }}
                                        </x-filament::badge>
                                    </th>
                                @endforeach
                            </tr>
                            </thead>

                            <tbody
                                class="divide-y divide-gray-200 dark:divide-neutral-700">


                            @foreach ($users as $user)

                                <tr class="hover:bg-gray-100 dark:hover:bg-gray-800">
                                    <td
                                        class="size-px whitespace-nowrap px-4 py-2">
                                        <button
                                            type="button"
                                            class="flex items-center gap-x-2 text-gray-800 hover:text-gray-600 focus:text-gray-600 focus:outline-none dark:text-neutral-200 dark:hover:text-neutral-400 dark:focus:text-neutral-400">
                                            <svg
                                                class="size-4 shrink-0"
                                                xmlns="http://www.w3.org/2000/svg"
                                                width="24"
                                                height="24"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                stroke-width="2"
                                                stroke-linecap="round"
                                                stroke-linejoin="round">
                                                <polygon
                                                    points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                                            </svg>
                                            <span
                                                class="text-sm text-gray-800 dark:text-neutral-200">
                                                    {{ $loop->index+1 }}
                                                </span>
                                        </button>
                                    </td>
                                    <td
                                        class="size-px whitespace-nowrap px-4 py-2">
                                        <div
                                            class="flex items-center gap-x-3">
                                            <img
                                                class="h-8 w-8 flex-shrink-0 rounded-full bg-gray-300"
                                                src="{{ $user->getFirstMediaUrl('profile-images','preview')}}"
                                                alt="" />

                                            <span
                                                class="text-sm font-semibold text-gray-800 dark:text-white">
                                                   {!! Str::limit($user->name, 25, ' ...') !!}
                                                </span>
                                        </div>
                                    </td>
                                    <td
                                        class="size-px whitespace-nowrap px-4 py-2">
                                            <span
                                                class="text-sm text-gray-800 dark:text-white">
                                                {{ $user->score }}
                                            </span>
                                    </td>

                                    @foreach ($contests as $contest)
                                        <td
                                            class="size-px gap-2 space-x-2 whitespace-nowrap px-4 py-2">
                                            <div class="flex gap-2">
                                                @if(!isset($user->solveCounts[$contest->id]))
                                                    <x-filament::badge
                                                        color="warning"
                                                        class="w-fit">
                                                        -
                                                    </x-filament::badge>
                                                @elseif($user->solveCounts[$contest->id]['error']??false)
                                                    <x-filament::badge
                                                        color="warning"
                                                        class="w-fit">
                                                        {{$user->solveCounts[$contest->id]['error'] }}
                                                    </x-filament::badge>

                                                @else
                                                    @if($user->solveCounts[$contest->id]['absent']??false)
                                                        <x-filament::badge
                                                            color="danger"
                                                            class="w-fit">
                                                            Absent
                                                        </x-filament::badge>
                                                    @else
                                                        <x-filament::badge
                                                            color="success"
                                                            class="w-fit">
                                                            {{$user->solveCounts[$contest->id]['solve_count']??0 }}
                                                            Solve
                                                        </x-filament::badge>
                                                    @endif

                                                    <x-filament::badge
                                                        color="gray"
                                                        class="w-fit">
                                                        {{$user->solveCounts[$contest->id]['upsolve_count']??0 }}
                                                        Upsolve
                                                    </x-filament::badge>

                                                @endif


                                            </div>
                                        </td>
                                    @endforeach
                                </tr>
                            @endforeach
                            </tbody>
                        </table>
                        <!-- End Table -->
                    </div>
                </div>
            </div>
        </div>
        <!-- End Card -->
    </div>

    <script>
        let mouseDown = false;
        let startX, scrollLeft;
        const slider = document.querySelector(".parent");

        const startDragging = (e) => {
            mouseDown = true;
            startX = e.pageX - slider.offsetLeft;
            scrollLeft = slider.scrollLeft;
        };

        const stopDragging = (e) => {
            mouseDown = false;
        };

        const move = (e) => {
            e.preventDefault();
            if (!mouseDown) {
                return;
            }
            const x = e.pageX - slider.offsetLeft;
            const scroll = x - startX;
            slider.scrollLeft = scrollLeft - scroll;
        };

        // Add the event listeners
        slider.addEventListener("mousemove", move, false);
        slider.addEventListener("mousedown", startDragging, false);
        slider.addEventListener("mouseup", stopDragging, false);
        slider.addEventListener("mouseleave", stopDragging, false);
    </script>
</div>
