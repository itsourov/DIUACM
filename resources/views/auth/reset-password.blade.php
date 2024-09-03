<x-web-layout>

    <div class="container mx-auto px-2 py-7">
       <x-auth.card>
           <div class="text-center">
               <h1 class="block text-2xl font-bold text-gray-800 dark:text-white">Reset Password</h1>
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
               <form method="POST" action="{{ route('password.store') }}">
                   @csrf

                   <!-- Password Reset Token -->
                   <input type="hidden" name="token" value="{{ $request->route('token') }}">
                   <div class="grid gap-y-4">
                       <!-- Email Address -->
                       <div>
                           <x-input.label for="email" :value="__('Email')"/>
                           <x-input.text id="email" class="block mt-1 w-full" type="email" name="email"
                                         :value="old('email', $request->email)" required autofocus
                                         autocomplete="username"/>
                           <x-input.error :messages="$errors->get('email')" class="mt-2"/>
                       </div>

                       <!-- Password -->
                       <div class="mt-4">
                           <x-input.label for="password" :value="__('Password')"/>
                           <x-input.text id="password" class="block mt-1 w-full" type="password" name="password"
                                         required autocomplete="new-password"/>
                           <x-input.error :messages="$errors->get('password')" class="mt-2"/>
                       </div>

                       <!-- Confirm Password -->
                       <div class="mt-4">
                           <x-input.label for="password_confirmation" :value="__('Confirm Password')"/>

                           <x-input.text id="password_confirmation" class="block mt-1 w-full"
                                         type="password"
                                         name="password_confirmation" required autocomplete="new-password"/>

                           <x-input.error :messages="$errors->get('password_confirmation')" class="mt-2"/>
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
