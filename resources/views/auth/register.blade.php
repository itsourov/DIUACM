<x-web-layout>

    <div class="container mx-auto px-2 py-7">
        <x-auth.card>
            <div class="text-center">
                <h1 class="block text-2xl font-bold text-gray-800 dark:text-white">Sign up</h1>
                <p class="mt-2 text-sm text-gray-600 dark:text-neutral-400">
                    Already have an account?
                    <a class="text-blue-600 decoration-2 hover:underline font-medium dark:text-blue-500"
                       href="{{route('login')}}">
                        Sign in here
                    </a>
                </p>
            </div>

            <div class="mt-5">
                <x-auth.google-login-button/>

                <div
                    class="py-3 flex items-center text-xs text-gray-400 uppercase before:flex-1 before:border-t before:border-gray-200 before:me-6 after:flex-1 after:border-t after:border-gray-200 after:ms-6 dark:text-neutral-500 dark:before:border-neutral-600 dark:after:border-neutral-600">
                    Or
                </div>

                <!-- Form -->
                <form method="POST" action="{{ route('register') }}">
                    @csrf
                    <div class="grid gap-y-4">

                        <!-- Name -->
                        <div>
                            <x-input.label for="name" :value="__('Name')"/>
                            <x-input.text id="name" class="block mt-1 w-full" type="text" name="name"
                                          :value="old('name')" required autofocus autocomplete="name"/>
                            <x-input.error :messages="$errors->get('name')" class="mt-2"/>
                        </div>

                        <!-- Email Address -->
                        <div>
                            <x-input.label for="email" :value="__('Email')"/>
                            <x-input.text id="email" class="block mt-1 w-full" type="email" name="email"
                                          :value="old('email')" required autocomplete="username"/>
                            <x-input.error :messages="$errors->get('email')" class="mt-2"/>
                        </div>


                        <!-- Password -->
                        <div>
                            <x-input.label for="password" :value="__('Password')"/>

                            <x-input.text id="password" class="block mt-1 w-full"
                                          type="password"
                                          name="password"
                                          required autocomplete="new-password"/>

                            <x-input.error :messages="$errors->get('password')" class="mt-2"/>
                        </div>

                        <!-- Confirm Password -->
                        <div>
                            <x-input.label for="password_confirmation" :value="__('Confirm Password')"/>

                            <x-input.text id="password_confirmation" class="block mt-1 w-full"
                                          type="password"
                                          name="password_confirmation" required autocomplete="new-password"/>

                            <x-input.error :messages="$errors->get('password_confirmation')" class="mt-2"/>
                        </div>


                        <!-- Checkbox -->
                        <div class="flex items-center">
                            <div class="flex">
                                <input id="remember-me" name="remember-me" type="checkbox"
                                       class="shrink-0 mt-0.5 border-gray-200 rounded text-blue-600 focus:ring-blue-500 dark:bg-neutral-800 dark:border-neutral-700 dark:checked:bg-blue-500 dark:checked:border-blue-500 dark:focus:ring-offset-gray-800">
                            </div>
                            <div class="ms-3">
                                <label for="remember-me" class="text-sm dark:text-white">I accept the <a
                                        class="text-blue-600 decoration-2 hover:underline font-medium dark:text-blue-500"
                                        href="#">Terms and Conditions</a></label>
                            </div>
                        </div>
                        <!-- End Checkbox -->
                        <x-button.primary class="py-3">
                            Sign up
                        </x-button.primary>
                    </div>
                </form>
                <!-- End Form -->
            </div>
        </x-auth.card>

    </div>

</x-web-layout>
