@props(['active'])

@php
    if ($active ?? false) {
        $classes = 'p-2 flex  items-center text-sm font-semibold bg-gray-100 text-gray-800 hover:bg-gray-100 rounded-lg focus:outline-none focus:bg-gray-100 dark:bg-gray-900 dark:text-neutral-200 dark:hover:bg-gray-900 dark:focus:bg-gray-900';
    } else {
        $classes = 'p-2 flex  items-center text-sm font-semibold text-gray-800 hover:bg-gray-100 rounded-lg focus:outline-none focus:bg-gray-100  dark:text-neutral-200 dark:hover:bg-gray-800 dark:focus:bg-gray-800';
    }

@endphp

<a {{ $attributes->merge(['class' => $classes]) }}>
    {{ $slot }}
</a>
