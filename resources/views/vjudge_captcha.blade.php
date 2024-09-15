<x-web-layout>
    <div class="container mx-auto px-2 py-7">
        <x-auth.card>
            <div class="text-center">
                <h1
                    class="block text-2xl font-bold text-gray-800 dark:text-white">
                    Vjudge Bot Verification
                </h1>
                <img
                    class="mt-2 w-full border"
                    src="{{ route("vj_get_captcha") }}"
                    alt="Vjudge Captcha Verification" />
            </div>
            <div class="mt-5">
                <!-- Form -->
                <form method="POST" action="{{ route("vj_captcha_verify") }}">
                    @csrf
                    <div class="grid gap-y-4">
                        <!-- Email Address -->
                        <div>
                            <x-input.label
                                for="captcha"
                                :value="__('Captcha Code')" />
                            <x-input.text
                                id="email"
                                class="mt-1 block w-full"
                                type="text"
                                name="captcha"
                                required
                                autofocus />
                            <x-input.error
                                :messages="$errors->get('captcha')"
                                class="mt-2" />
                        </div>

                        <x-button.primary class="py-3">
                            Verify Captcha
                        </x-button.primary>
                    </div>
                </form>
                <!-- End Form -->
            </div>
        </x-auth.card>
    </div>
</x-web-layout>
