<x-web-layout>
    <div class="container mx-auto px-2 py-7">
        <x-auth.card>
            <div class="text-center">
                <h1
                    class="block text-2xl font-bold text-gray-800 dark:text-white">
                    Sign in
                </h1>
                <p class="mt-2 text-sm text-gray-600 dark:text-neutral-400">
                    Don't have an account yet?
                    <a
                        class="font-medium text-blue-600 decoration-2 hover:underline dark:text-blue-500"
                        href="{{ route("register") }}">
                        Sign up here
                    </a>
                </p>
            </div>

            <div class="mt-5">
                <x-auth.google-login-button />

                <div
                    class="flex items-center py-3 text-xs uppercase text-gray-400 before:me-6 before:flex-1 before:border-t before:border-gray-200 after:ms-6 after:flex-1 after:border-t after:border-gray-200 dark:text-neutral-500 dark:before:border-neutral-600 dark:after:border-neutral-600">
                    Or
                </div>

                <!-- Form -->
                <form method="POST" action="{{ route("login") }}">
                    @csrf
                    <div class="grid gap-y-4">
                        <div>
                            <x-input.label
                                for="email"
                                :value="__('Username or Email')" />
                            <x-input.text
                                id="login"
                                class="mt-1 block w-full"
                                type="text"
                                name="login"
                                :value="old('login')"
                                required
                                autofocus
                                autocomplete="username" />
                            <x-input.error
                                :messages="$errors->get('login')"
                                class="mt-2" />
                        </div>

                        <div>
                            <div class="flex items-center justify-between">
                                <x-input.label
                                    for="password"
                                    :value="__('Password')" />

                                <!-- End Form Group -->
                                @if (Route::has("password.request"))
                                    <a
                                        class="text-sm font-medium text-blue-600 decoration-2 hover:underline"
                                        href="{{ route("password.request") }}">
                                        Forgot password?
                                    </a>
                                @endif
                            </div>

                            <div class="relative">
                                <input
                                    id="hs-toggle-password"
                                    type="password"
                                    name="password"
                                    class="mt-1 block w-full rounded-lg border-gray-200 py-3 pe-10 ps-4 text-sm focus:border-blue-500 focus:ring-blue-500 disabled:pointer-events-none disabled:opacity-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-400 dark:placeholder-neutral-500 dark:focus:ring-neutral-600"
                                    placeholder="Enter password"
                                    required
                                    autocomplete="current-password" />
                                <button
                                    type="button"
                                    data-hs-toggle-password='{
        "target": "#hs-toggle-password"
      }'
                                    class="absolute inset-y-0 end-0 z-20 flex cursor-pointer items-center rounded-e-md px-3 text-gray-400 focus:text-blue-600 focus:outline-none dark:text-neutral-600 dark:focus:text-blue-500">
                                    <svg
                                        class="size-3.5 shrink-0"
                                        width="24"
                                        height="24"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        stroke-width="2"
                                        stroke-linecap="round"
                                        stroke-linejoin="round">
                                        <path
                                            class="hs-password-active:hidden"
                                            d="M9.88 9.88a3 3 0 1 0 4.24 4.24"></path>
                                        <path
                                            class="hs-password-active:hidden"
                                            d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"></path>
                                        <path
                                            class="hs-password-active:hidden"
                                            d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"></path>
                                        <line
                                            class="hs-password-active:hidden"
                                            x1="2"
                                            x2="22"
                                            y1="2"
                                            y2="22"></line>
                                        <path
                                            class="hidden hs-password-active:block"
                                            d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path>
                                        <circle
                                            class="hidden hs-password-active:block"
                                            cx="12"
                                            cy="12"
                                            r="3"></circle>
                                    </svg>
                                </button>
                            </div>
                            <x-input.error
                                :messages="$errors->get('password')"
                                class="mt-2" />
                        </div>

                        <!-- Checkbox -->
                        <div class="flex items-center">
                            <div class="flex">
                                <input
                                    id="remember-me"
                                    name="remember"
                                    type="checkbox"
                                    class="mt-0.5 shrink-0 rounded border-gray-200 text-blue-600 focus:ring-blue-500 dark:border-neutral-700 dark:bg-neutral-800 dark:checked:border-blue-500 dark:checked:bg-blue-500 dark:focus:ring-offset-gray-800" />
                            </div>
                            <div class="ms-3">
                                <label
                                    for="remember-me"
                                    class="text-sm dark:text-white">
                                    Remember me
                                </label>
                            </div>
                        </div>
                        <!-- End Checkbox -->
                        <x-button.primary class="py-3">
                            Sign in
                        </x-button.primary>
                    </div>
                </form>
                <!-- End Form -->
            </div>
        </x-auth.card>
    </div>
</x-web-layout>
