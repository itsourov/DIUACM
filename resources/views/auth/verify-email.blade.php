<x-web-layout>

    <div class="container mx-auto px-2 py-7">
        <x-auth.card>
            <div class="text-center">
                <h1 class="block text-2xl font-bold text-gray-800 dark:text-white">Verify Email</h1>
                <p class="mt-2 text-sm text-gray-600 dark:text-neutral-400">
                    {{ __('Thanks for signing up! Before getting started, could you verify your email address by clicking on the link we just emailed to you? If you didn\'t receive the email, we will gladly send you another.') }}
                </p>
            </div>


            <div class="mt-5">
                @if (session('status') == 'verification-link-sent')
                    <div class="mb-4 font-medium text-sm text-green-600 dark:text-green-400">
                        {{ __('A new verification link has been sent to the email address you provided during registration.') }}
                    </div>
                @endif
                <!-- Form -->
                <form method="POST" action="{{ route('verification.send') }}">
                    @csrf


                    <div class="grid gap-y-4">

                        <x-button.primary class="py-3">
                            {{ __('Resend Verification Email') }}
                        </x-button.primary>

                    </div>
                </form>
                <!-- End Form -->


            </div>
        </x-auth.card>
    </div>
</x-web-layout>
