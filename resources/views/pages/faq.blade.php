<x-web-layout>
    <section class="py-10  sm:py-16 lg:py-24 font-sl">
        <div class="px-4 mx-auto sm:px-6 lg:px-8 max-w-7xl font-marry">
            <div class="max-w-2xl mx-auto text-center">
                <h2 class="text-3xl font-bold leading-tight  sm:text-4xl lg:text-5xl">Frequently Asked Questions
                </h2>
                <p class="max-w-xl mx-auto mt-4 text-base leading-relaxed text-gray-500">If you have any curiosity about
                    our website you can find it here</p>
            </div>

            <div class="max-w-3xl mx-auto mt-8 space-y-4 md:mt-16 faq-container">
                <x-faq-item>
                    @slot('q')
                        How to create an account?
                    @endslot
                    @slot('a')
                        <p>You can easily register using your Gmail or email password by visiting our <a
                                href="{{ route('register') }}" title=""
                                class="text-blue-600 transition-all duration-200 hover:underline">registration</a> page.</p>
                    @endslot
                </x-faq-item>




            </div>

            <p class="text-center text-gray-600 textbase mt-9">Want to know more? <a href="{{ route('pages.contact') }}"
                                                                                     title=""
                                                                                     class="font-medium text-blue-600 transition-all duration-200 hover:text-blue-700 focus:text-blue-700 hover:underline">Contact
                    Us</a></p>
        </div>
    </section>

</x-web-layout>
