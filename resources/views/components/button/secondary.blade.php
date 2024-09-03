<button
    {{ $attributes->merge(['type' => 'button', 'class' => 'inline-flex items-center justify-center  px-4 py-2 text-sm font-semibold bg-transparent rounded-md  border dark:border-gray-800 hover:shadow dark:hover:shadow-lg hover:dark:shadow-gray-900 ']) }}>
    {{ $slot }}
</button>
