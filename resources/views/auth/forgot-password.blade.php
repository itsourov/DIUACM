<x-web-layout>

    <div class="container mx-auto px-2 py-7">
        <x-auth.card>
            <div class="text-center">
                <h1 class="block text-2xl font-bold text-gray-800 dark:text-white">Forgot password?</h1>
                <p class="mt-2 text-sm text-gray-600 dark:text-neutral-400">
                    Remember your password?
                    <a class="text-blue-600 decoration-2 hover:underline font-medium dark:text-blue-500"
                       href="{{route('login')}}">
                        Sign in here
                    </a>
                </p>
            </div>
            <div class="mt-5">
                <!-- Form -->
                <form method="POST" action="{{ route('password.email') }}">
                    @csrf
                    <div class="grid gap-y-4">
                        <!-- Email Address -->
                        <div>
                            <x-input.label for="email" :value="__('Email')"/>
                            <x-input.text id="email" class="block mt-1 w-full" type="email" name="email"
                                          :value="old('email')" required autofocus/>
                            <x-input.error :messages="$errors->get('email')" class="mt-2"/>
                        </div>

                        <x-button.primary class="py-3">
                            Reset password
                        </x-button.primary>

                    </div>
                </form>
                <!-- End Form -->
            </div>
        </x-auth.card>

    </div>
</x-web-layout>
