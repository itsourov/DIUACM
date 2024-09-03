@props(['active'])

@php
    if ($active ?? false) {
        $classes = 'flex items-center text-sm font-medium text-primary-800 dark:text-primary-500 lg:border-b-2 border-primary-700 transition-all gap-1';
    } else {
        $classes = 'flex items-center text-sm font-medium hover:text-primary-800 dark:hover:text-primary-500 transition-all gap-1';
    }

@endphp

<a {{ $attributes->merge(['class' => $classes]) }}>
    {{ $slot }}
</a>
