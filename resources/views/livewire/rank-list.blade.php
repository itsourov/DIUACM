<div class="container mx-auto p-2">
    <div class="p-4 font-sans flex flex-col h-screen">
        <div class="shadow overflow-scroll border-b border-gray-200 sm:rounded">
            <table class="w-full">
                <thead class="z-10 divide-y divide-gray-200">
                <tr class="bg-gray-100 divide-x divide-gray-600" x-data>
                    <th scope="col"
                        class="w-64 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-200">
                        Columns
                    </th>
                    @foreach($contests as $contest)
                        @php
                            $short_title = str_replace('Codeforces', 'CF', $contest->title);
                           $short_title = str_replace('AtCoder Beginner Contest', 'ABC', $short_title);
                        @endphp
                        <th scope="col"
                            class="p-2 text-xs font-medium text-gray-500 min-w-52">
                            <p class="truncate text-start	">{{$short_title}}</p>
                            <x-filament::badge
                                color="info"
                                class="w-fit">
                                Weight: {{ $contest['weight'] }}
                            </x-filament::badge>
                        </th>
                    @endforeach

                </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200" x-data>
                @foreach($users as $user)
                    <tr class="divide-x divide-gray-200" x-data>
                        <th class="px-6 py-4 whitespace-nowrap bg-gray-100 border-r border-gray-200">
                            <div class="flex items-center">
                                <div class="text-left">
                                    <div class="text-sm font-medium text-gray-900">
                                        {!! Str::limit($user->name, 20, ' ...') !!}

                                    </div>
                                </div>
                            </div>
                        </th>
                        @foreach($contests as $contest)
                            <td class="px-6 py-4 whitespace-nowrap text-center">
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
                                    @elseif($user->solveCounts[$contest->id]['absent']??false)
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
        </div>
    </div>
    <style>
        table {
            font-family: "Inter", sans-serif;

            thead {
                top: 0;
                position: sticky;

                th {
                    &:first-child {
                        position: sticky;
                        left: 0;
                    }
                }
            }

            tbody tr,
            thead tr {
                position: relative;
            }

            tbody th {
                position: sticky;
                left: 0;
            }
        }

    </style>
</div>
