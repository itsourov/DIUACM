<button
    {{ $attributes->merge(['type' => 'submit', 'class' => 'inline-flex items-center justify-center  px-4 py-2 text-sm font-semibold text-white transition-all duration-200 bg-blue-600 border border-transparent rounded-md focus:outline-none hover:bg-blue-700 focus:bg-blue-700']) }}>
    {{ $slot }}
</button>
