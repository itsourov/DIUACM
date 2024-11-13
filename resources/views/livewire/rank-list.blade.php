<div>


    <div class="container mx-auto space-y-6 px-2 py-10">
        <!-- Card -->
        <div class="flex flex-col">
            <div class="-m-1.5">
                <div class="inline-block min-w-full p-1.5 align-middle ">
                    <div
                            class="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-neutral-700 dark:bg-neutral-900">
                        <!-- Header -->
                        <div
                                class="border-b border-gray-200 px-6 py-4 dark:border-neutral-700">
                            <div class=" flex gap-2 items-center">
                                <h2
                                        class="text-xl font-semibold text-gray-800 dark:text-neutral-200">
                                    {{ $tracker->title }}
                                </h2>
                                @if ($this->addMeAction->isVisible())
                                    {{ $this->addMeAction }}
                                @endif
                                @if ($this->removeMeAction->isVisible())
                                    {{ $this->removeMeAction }}
                                @endif
                                <x-filament-actions::modals />

                            </div>

                            <p
                                    class="text-sm text-gray-600 dark:text-neutral-400">
                                {{ $tracker->description }}
                            </p>
                            <p
                                    class="text-sm text-gray-600 dark:text-neutral-400">
                                Last
                                Updated:
                                <b>{{$tracker->last_updated->diffForHumans()}}</b>
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
                            @php
                                $currentPage = $users->currentPage();
                                $perPage = $users->perPage();
                            @endphp

                            @foreach ($users as $user)

                                <tr class=" {{(auth()->user()?->id==$user->id)?"bg-yellow-100 dark:bg-yellow-800":'hover:bg-gray-100 dark:hover:bg-gray-800'}}">
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
                                                    {{($currentPage - 1) * $perPage + $loop->index + 1}}
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
                                            <div class="flex gap-2 w-max">
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
        <div>
            {{$users->links()}}
        </div>
    </div>


</div>
