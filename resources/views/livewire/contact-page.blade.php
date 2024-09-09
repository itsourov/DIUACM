
<div >
    <div class="container mx-auto px-2 py-10 lg:py-14">
        <div class="text-center">
            <h1 class="text-3xl font-bold text-gray-800 sm:text-4xl dark:text-white">
                Contact us
            </h1>
            <p class="mt-1 text-gray-600 dark:text-neutral-400">
                We'd love to talk about how we can help you.
            </p>
        </div>

        <div class="mt-12 grid items-center lg:grid-cols-2 gap-6 lg:gap-16">
            <!-- Card -->
            <x-card class="flex flex-col border rounded-xl p-4 sm:p-6 lg:p-8">
                <h2 class="mb-8 text-xl font-semibold text-gray-800 dark:text-neutral-200">
                    Fill in the form
                </h2>

                <div>
                    <div class="grid gap-4">
                        <div>
                            <x-input.label :value="__('Your name')" required="true" class="sr-only" />
                            <x-input.text wire:model.lazy="name" type="text" class="mt-1 block w-full"
                                          autocomplete="name"  placeholder="Name" />
                            <x-input.error :messages="$errors->get('name')" />
                        </div>

                        <div>
                            <x-input.label :value="__('Email address')" required="true" class="sr-only"/>
                            <x-input.text wire:model.lazy="email" type="email" class="mt-1 block w-full"
                                          autocomplete="email" placeholder="Email"/>
                            <x-input.error :messages="$errors->get('email')" />
                        </div>
                        <div>
                            <x-input.label :value="__('Phone') . ' (' . __('optional') . ')'" class="sr-only" />
                            <x-input.text wire:model.lazy="phone" type="text" class="mt-1 block w-full"
                                          autocomplete="phone" placeholder="{{__('Phone Number') . ' (' . __('optional') . ')'}}" />
                            <x-input.error :messages="$errors->get('phone')" />
                        </div>
                        <div>
                            <x-input.label :value="__('Message')" required="true" class="sr-only" />
                            <x-input.textarea wire:model.lazy="message" type="text" class="mt-1 block w-full"
                                              rows="4" placeholder="Message"></x-input.textarea>
                            <x-input.error :messages="$errors->get('message')" />
                        </div>

                    </div>
                    <!-- End Grid -->

                    <x-button.primary wire:click="submit" class="w-full mt-4 py-3">
                        <span wire:loading target="submit">
                            <x-svg.spinner class="w-4 h-4 mr-1 animate-spin" />
                        </span>
                        <span>
                            {{ __('Send') }}
                        </span>
                    </x-button.primary>

                    <div class="mt-3 text-center">
                        <p class="text-sm text-gray-500 dark:text-neutral-500">
                            We'll get back to you ASAP.
                        </p>
                    </div>
                </div>
            </x-card>
            <!-- End Card -->

            <div class="divide-y divide-gray-200 dark:divide-neutral-800">
                <!-- Icon Block -->
                <div class="flex gap-x-7 py-6">
                    <svg class="flex-shrink-0 size-6 mt-1.5 text-gray-800 dark:text-neutral-200" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/></svg>
                    <div class="grow">
                        <h3 class="font-semibold text-gray-800 dark:text-neutral-200">Knowledgebase</h3>
                        <p class="mt-1 text-sm text-gray-500 dark:text-neutral-500">We're here to help with any questions or code.</p>
                        <a class="mt-2 inline-flex items-center gap-x-2 text-sm font-medium text-gray-600 hover:text-gray-800 dark:text-neutral-400 dark:hover:text-neutral-200" href="#">
                            Contact support
                            <svg class="flex-shrink-0 size-2.5 transition ease-in-out group-hover:translate-x-1" width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path fill-rule="evenodd" clip-rule="evenodd" d="M0.975821 6.92249C0.43689 6.92249 -3.50468e-07 7.34222 -3.27835e-07 7.85999C-3.05203e-07 8.37775 0.43689 8.79749 0.975821 8.79749L12.7694 8.79748L7.60447 13.7596C7.22339 14.1257 7.22339 14.7193 7.60447 15.0854C7.98555 15.4515 8.60341 15.4515 8.98449 15.0854L15.6427 8.68862C16.1191 8.23098 16.1191 7.48899 15.6427 7.03134L8.98449 0.634573C8.60341 0.268455 7.98555 0.268456 7.60447 0.634573C7.22339 1.00069 7.22339 1.59428 7.60447 1.9604L12.7694 6.92248L0.975821 6.92249Z" fill="currentColor"/>
                            </svg>
                        </a>
                    </div>
                </div>
                <!-- End Icon Block -->

                <!-- Icon Block -->
                <div class="flex gap-x-7 py-6">
                    <svg class="flex-shrink-0 size-6 mt-1.5 text-gray-800 dark:text-neutral-200" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 9a2 2 0 0 1-2 2H6l-4 4V4c0-1.1.9-2 2-2h8a2 2 0 0 1 2 2v5Z"/><path d="M18 9h2a2 2 0 0 1 2 2v11l-4-4h-6a2 2 0 0 1-2-2v-1"/></svg>
                    <div class="grow">
                        <h3 class="font-semibold text-gray-800 dark:text-neutral-200">FAQ</h3>
                        <p class="mt-1 text-sm text-gray-500 dark:text-neutral-500">Search our FAQ for answers to anything you might ask.</p>
                        <a class="mt-2 inline-flex items-center gap-x-2 text-sm font-medium text-gray-600 hover:text-gray-800 dark:text-neutral-400 dark:hover:text-neutral-200" href="#">
                            Visit FAQ
                            <svg class="flex-shrink-0 size-2.5 transition ease-in-out group-hover:translate-x-1" width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path fill-rule="evenodd" clip-rule="evenodd" d="M0.975821 6.92249C0.43689 6.92249 -3.50468e-07 7.34222 -3.27835e-07 7.85999C-3.05203e-07 8.37775 0.43689 8.79749 0.975821 8.79749L12.7694 8.79748L7.60447 13.7596C7.22339 14.1257 7.22339 14.7193 7.60447 15.0854C7.98555 15.4515 8.60341 15.4515 8.98449 15.0854L15.6427 8.68862C16.1191 8.23098 16.1191 7.48899 15.6427 7.03134L8.98449 0.634573C8.60341 0.268455 7.98555 0.268456 7.60447 0.634573C7.22339 1.00069 7.22339 1.59428 7.60447 1.9604L12.7694 6.92248L0.975821 6.92249Z" fill="currentColor"/>
                            </svg>
                        </a>
                    </div>
                </div>
                <!-- End Icon Block -->

                <!-- Icon Block -->
                <div class=" flex gap-x-7 py-6">
                    <svg class="flex-shrink-0 size-6 mt-1.5 text-gray-800 dark:text-neutral-200" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m7 11 2-2-2-2"/><path d="M11 13h4"/><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/></svg>
                    <div class="grow">
                        <h3 class="font-semibold text-gray-800 dark:text-neutral-200">Developer APIs</h3>
                        <p class="mt-1 text-sm text-gray-500 dark:text-neutral-500">Check out our development quickstart guide.</p>
                        <a class="mt-2 inline-flex items-center gap-x-2 text-sm font-medium text-gray-600 hover:text-gray-800 dark:text-neutral-400 dark:hover:text-neutral-200" href="#">
                            Contact sales
                            <svg class="flex-shrink-0 size-2.5 transition ease-in-out group-hover:translate-x-1" width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path fill-rule="evenodd" clip-rule="evenodd" d="M0.975821 6.92249C0.43689 6.92249 -3.50468e-07 7.34222 -3.27835e-07 7.85999C-3.05203e-07 8.37775 0.43689 8.79749 0.975821 8.79749L12.7694 8.79748L7.60447 13.7596C7.22339 14.1257 7.22339 14.7193 7.60447 15.0854C7.98555 15.4515 8.60341 15.4515 8.98449 15.0854L15.6427 8.68862C16.1191 8.23098 16.1191 7.48899 15.6427 7.03134L8.98449 0.634573C8.60341 0.268455 7.98555 0.268456 7.60447 0.634573C7.22339 1.00069 7.22339 1.59428 7.60447 1.9604L12.7694 6.92248L0.975821 6.92249Z" fill="currentColor"/>
                            </svg>
                        </a>
                    </div>
                </div>
                <!-- End Icon Block -->

                <!-- Icon Block -->
                <div class=" flex gap-x-7 py-6">
                    <svg class="flex-shrink-0 size-6 mt-1.5 text-gray-800 dark:text-neutral-200" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.2 8.4c.5.38.8.97.8 1.6v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V10a2 2 0 0 1 .8-1.6l8-6a2 2 0 0 1 2.4 0l8 6Z"/><path d="m22 10-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 10"/></svg>
                    <div class="grow">
                        <h3 class="font-semibold text-gray-800 dark:text-neutral-200">Contact us by email</h3>
                        <p class="mt-1 text-sm text-gray-500 dark:text-neutral-500">If you wish to write us an email instead please use</p>
                        <a class="mt-2 inline-flex items-center gap-x-2 text-sm font-medium text-gray-600 hover:text-gray-800 dark:text-neutral-400 dark:hover:text-neutral-200" href="mailto:{{config('mail.from.address')}}">
                            {{config('mail.from.address')}}
                        </a>
                    </div>
                </div>
                <!-- End Icon Block -->
            </div>
        </div>
    </div>
</div>
<!-- End Contact Us -->
