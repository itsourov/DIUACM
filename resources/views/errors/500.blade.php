<x-web-layout>
    @section('seo')
        <title>500 Internal Server Error</title>
    @endsection
    <div class=" px-4 py-16 sm:px-6 sm:py-40 md:grid md:place-items-center lg:px-8">
        <div class="max-w-max mx-auto">
            <main class="sm:flex">
                <p class="text-4xl font-extrabold text-indigo-600 sm:text-5xl font-marry">500</p>
                <div class="sm:ml-6">
                    <div class="sm:border-l sm:border-gray-200 sm:pl-6">
                        <h1 class="text-4xl font-extrabold tracking-tight sm:text-5xl font-marry">Its not you, Its
                            us</h1>
                        <p class="mt-1 text-base text-gray-500 font-figtree">We ran into some corner case that we did
                            not handle</p>
                    </div>

                    <div class="mt-10 flex space-x-3 sm:border-l sm:border-transparent sm:pl-6">
                        <a href="{{ route('home') }}"
                           class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                            Go back home </a>
                        <a href="{{ route('pages.contact') }}"
                           class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                            Contact support </a>
                    </div>
                </div>
            </main>

        </div>
        <div class="max-w-2xl mt-5 space-y-4">
            <label for="comment" class="block font-medium text-wrap mt-2 text-xl">{{ $exception->getMessage() }}</label>

            <label for="comment" class="block text-sm font-medium text-wrap">We have only 1 developer so its not
                unexpected that we have some bug on the website, and we are new. so kindly notify us from contact page
                saying what were you trying to do and what went wrong.</label>


        </div>
    </div>
</x-web-layout>
