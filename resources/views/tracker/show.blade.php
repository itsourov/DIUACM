<x-web-layout>
    <!-- Table Section -->
    <div class="container mx-auto space-y-6 px-2 py-10">
        <!-- Card -->
        <div class="flex flex-col">
            <div class="-m-1.5 overflow-x-auto">
                <div class="inline-block min-w-full p-1.5 align-middle">
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
                        </div>
                        <!-- End Header -->

                        <!-- Table -->
                        <table
                            class="min-w-full divide-y divide-gray-200 dark:divide-neutral-700">
                            <thead class="bg-gray-50 dark:bg-neutral-800">
                                <tr>
                                    <th
                                        scope="col"
                                        class="whitespace-nowrap px-6 py-3 text-start">
                                        <span
                                            class="text-xs font-semibold uppercase tracking-wide text-gray-800 dark:text-neutral-200">
                                            #
                                        </span>
                                    </th>

                                    <th
                                        scope="col"
                                        class="min-w-64 whitespace-nowrap px-6 py-3 text-start">
                                        <span
                                            class="text-xs font-semibold uppercase tracking-wide text-gray-800 dark:text-neutral-200">
                                            Name
                                        </span>
                                    </th>

                                    <th
                                        scope="col"
                                        class="whitespace-nowrap px-6 py-3 text-start">
                                        <span
                                            class="text-xs font-semibold uppercase tracking-wide text-gray-800 dark:text-neutral-200">
                                            Points
                                        </span>
                                    </th>
                                    @foreach ($tracker->events as $contest)
                                        <th
                                            scope="col"
                                            class="whitespace-nowrap px-6 py-3 text-start">
                                            <span
                                                class="text-xs font-semibold uppercase tracking-wide text-gray-800 dark:text-neutral-200">
                                                {{ $contest->title }}
                                            </span>
                                        </th>
                                    @endforeach
                                </tr>
                            </thead>

                            <tbody
                                class="divide-y divide-gray-200 dark:divide-neutral-700">
                                @php
                                    $rank = 1;
                                @endphp

                                @foreach ($usersData as $key => $value)
                                    @php
                                        $user = $allUsers->find($key);
                                    @endphp

                                    <tr>
                                        <td
                                            class="size-px whitespace-nowrap px-6 py-3">
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
                                                    {{ $rank++ }}
                                                </span>
                                            </button>
                                        </td>
                                        <td
                                            class="size-px whitespace-nowrap px-6 py-3">
                                            <div
                                                class="flex items-center gap-x-3">
                                                <img
                                                    class="h-8 w-8 flex-shrink-0 rounded-full bg-gray-300"
                                                    src="{{ $user->getFirstMediaUrl("profile-images", "preview") }}"
                                                    alt="" />

                                                <span
                                                    class="text-sm font-semibold text-gray-800 dark:text-white">
                                                    {{ $user->name }}
                                                </span>
                                            </div>
                                        </td>
                                        <td
                                            class="size-px whitespace-nowrap px-6 py-3">
                                            <span
                                                class="text-sm text-gray-800 dark:text-white">
                                                {{ $usersData[$user->id]["score"] }}
                                            </span>
                                        </td>

                                        @foreach ($tracker->events as $contest)
                                            <td
                                                class="size-px gap-2 space-x-2 whitespace-nowrap px-6 py-3">
                                                <div>
                                                    <p
                                                        class="text-sm text-gray-800 dark:text-white">
                                                        Solve:
                                                        {{ $usersData[$user->id][$contest->id]["solve_count"] ?? "?" }}
                                                    </p>
                                                    <p
                                                        class="text-sm text-gray-800 dark:text-white">
                                                        Upsolve:
                                                        {{ $usersData[$user->id][$contest->id]["upsolve_count"] ?? "?" }}
                                                    </p>
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
    <!-- End Table Section -->
</x-web-layout>
