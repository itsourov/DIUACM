<x-web-layout>
	<div class="space-y-5 container mx-auto px-4 py-4">
		<div class="grid grid-cols-1 md:grid-cols-2 gap-4 ">

			@auth
				<a href="{{ route('my-account.profile.edit') }}">
					<x-card class="flex p-6 rounded-lg  motion-safe:hover:scale-[1.01] transition-all duration-250 focus:outline">
						<div>
							<div class="h-16 w-16 bg-primary-50 dark:bg-primary-900  flex items-center justify-center rounded-full ">
								<x-svg.user-circle class="w-12 h-12 stroke-1"/>
							</div>

							<h2 class="mt-6 text-2xl font-semibold">Profile</h2>

							<p class="mt-4 text-gray-500  leading-relaxed">
								Lorem ipsum dolor sit, amet consectetur adipisicing elit. Expedita vel cum quia dolor
								cumque,
								excepturi commodi neque facilis quisquam unde soluta vitae dolorum sed velit deleniti
								corporis
								minima odit fugit?
							</p>
						</div>

						<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
						     class="self-center shrink-0 stroke-primary-500 w-6 h-6 mx-6">
							<path stroke-linecap="round" stroke-linejoin="round"
							      d="M4.5 12h15m0 0l-6.75-6.75M19.5 12l-6.75 6.75"/>
						</svg>
					</x-card>
				</a>

			@else
				<a href="{{ route('login') }}"
				   class="scale-100 p-6 bg-white  from-gray-700/50 via-transparent rounded-lg shadow-2xl shadow-gray-500/20 dark:shadow-none flex motion-safe:hover:scale-[1.01] transition-all duration-250 focus:outline focus:outline-2 focus:outline-primary-500">
					<div>
						<div class="h-16 w-16 bg-red-50  flex items-center justify-center rounded-full">
							<x-svg.user-circle class="w-12 h-12  stroke-1"/>
						</div>

						<h2 class="mt-6 text-2xl font-semibold text-gray-900 ">Log In</h2>

						<p class="mt-4 text-gray-500  leading-relaxed">
							আপনার একাউন্ট এ লগইন করুন অথবা নতুন একাউন্ট তৈরি করে নিন। একাউন্ট এ প্রবেশ করা ছাড়া আপনি
							এটেন্ডেন্স দিতে পারবেন না।
						</p>
					</div>

					<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
					     class="self-center shrink-0 stroke-primary-500 w-6 h-6 mx-6">
						<path stroke-linecap="round" stroke-linejoin="round"
						      d="M4.5 12h15m0 0l-6.75-6.75M19.5 12l-6.75 6.75"/>
					</svg>
				</a>
			@endauth

				<a href="{{ route('events.index') }}">
					<x-card class="flex p-6 rounded-lg  motion-safe:hover:scale-[1.01] transition-all duration-250 focus:outline">
						<div>
							<div class="h-16 w-16 bg-primary-50 dark:bg-primary-900  flex items-center justify-center rounded-full ">
								<x-svg.bolt class="w-12 h-12 stroke-1"/>
							</div>

							<h2 class="mt-6 text-2xl font-semibold ">Events</h2>

							<p class="mt-4 text-gray-500  leading-relaxed">
								Lorem ipsum dolor sit, amet consectetur adipisicing elit. Expedita vel cum quia dolor
								cumque,
								excepturi commodi neque facilis quisquam unde soluta vitae dolorum sed velit deleniti
								corporis
								minima odit fugit?
							</p>
						</div>

						<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
						     class="self-center shrink-0 stroke-primary-500 w-6 h-6 mx-6">
							<path stroke-linecap="round" stroke-linejoin="round"
							      d="M4.5 12h15m0 0l-6.75-6.75M19.5 12l-6.75 6.75"/>
						</svg>
					</x-card>
				</a>

		</div>
	</div>
</x-web-layout>