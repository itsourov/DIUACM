<section
		class="hideInApp py-6 bg-white dark:bg-black border-t border-gray-200  dark:border-gray-800   mt-auto sm:pt-10">
	<div class="px-2 mx-auto container">
		<div class="grid grid-cols-2 md:col-span-3 lg:grid-cols-6 gap-y-16 gap-x-12">
			<div class="col-span-2 md:col-span-3 lg:col-span-2 lg:pr-8">
				<a href="{{ route('home') }}">
					{{--                    <x-svg.logo class="w-auto h-9 dark:fill-white fill-black" />--}}
					<h3 class="font-marry font-bold text-lg">{{config('app.name')}}</h3>
				</a>


				<p class="text-base leading-relaxed text-gray-700 dark:text-gray-400 mt-7">
					Where programmers become Gladiators. We organize workshop, classes, contests and many more.

				</p>

				<ul class="flex items-center space-x-3 mt-9">
					<li>
						<a href="https://t.me/+X94KLytY-Kk5NzU9" title="" target="_blank"
						   class="flex items-center justify-center text-white transition-all duration-200 bg-gray-800 rounded-full w-7 h-7 hover:bg-blue-600 focus:bg-blue-600">
							<x-fab-telegram-plane class="w-4 h-4" fill="currentColor"/>

						</a>
					</li>

					<li>
						<a href="https://www.facebook.com/groups/cppsdiu/" title="" target="_blank"
						   class="flex items-center justify-center text-white transition-all duration-200 bg-gray-800 rounded-full w-7 h-7 hover:bg-blue-600 focus:bg-blue-600">

							<x-fab-facebook-f class="w-4 h-4" fill="currentColor"/>
						</a>
					</li>
					{{--
					<li>
						<a href="https://www.instagram.com/sourovb03/" title=""
							class="flex items-center justify-center text-white transition-all duration-200 bg-gray-800 rounded-full w-7 h-7 hover:bg-blue-600 focus:bg-blue-600">
							<svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
								fill="currentColor">
								<path
									d="M11.999 7.377a4.623 4.623 0 1 0 0 9.248 4.623 4.623 0 0 0 0-9.248zm0 7.627a3.004 3.004 0 1 1 0-6.008 3.004 3.004 0 0 1 0 6.008z">
								</path>
								<circle cx="16.806" cy="7.207" r="1.078"></circle>
								<path
									d="M20.533 6.111A4.605 4.605 0 0 0 17.9 3.479a6.606 6.606 0 0 0-2.186-.42c-.963-.042-1.268-.054-3.71-.054s-2.755 0-3.71.054a6.554 6.554 0 0 0-2.184.42 4.6 4.6 0 0 0-2.633 2.632 6.585 6.585 0 0 0-.419 2.186c-.043.962-.056 1.267-.056 3.71 0 2.442 0 2.753.056 3.71.015.748.156 1.486.419 2.187a4.61 4.61 0 0 0 2.634 2.632 6.584 6.584 0 0 0 2.185.45c.963.042 1.268.055 3.71.055s2.755 0 3.71-.055a6.615 6.615 0 0 0 2.186-.419 4.613 4.613 0 0 0 2.633-2.633c.263-.7.404-1.438.419-2.186.043-.962.056-1.267.056-3.71s0-2.753-.056-3.71a6.581 6.581 0 0 0-.421-2.217zm-1.218 9.532a5.043 5.043 0 0 1-.311 1.688 2.987 2.987 0 0 1-1.712 1.711 4.985 4.985 0 0 1-1.67.311c-.95.044-1.218.055-3.654.055-2.438 0-2.687 0-3.655-.055a4.96 4.96 0 0 1-1.669-.311 2.985 2.985 0 0 1-1.719-1.711 5.08 5.08 0 0 1-.311-1.669c-.043-.95-.053-1.218-.053-3.654 0-2.437 0-2.686.053-3.655a5.038 5.038 0 0 1 .311-1.687c.305-.789.93-1.41 1.719-1.712a5.01 5.01 0 0 1 1.669-.311c.951-.043 1.218-.055 3.655-.055s2.687 0 3.654.055a4.96 4.96 0 0 1 1.67.311 2.991 2.991 0 0 1 1.712 1.712 5.08 5.08 0 0 1 .311 1.669c.043.951.054 1.218.054 3.655 0 2.436 0 2.698-.043 3.654h-.011z">
								</path>
							</svg>
						</a>
					</li> --}}

					{{-- <li>
						<a href="https://github.com/{{ config('app.name') }}" title=""
							class="flex items-center justify-center text-white transition-all duration-200 bg-gray-800 rounded-full w-7 h-7 hover:bg-blue-600 focus:bg-blue-600">
							<svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
								fill="currentColor">
								<path fill-rule="evenodd" clip-rule="evenodd"
									d="M12.026 2c-5.509 0-9.974 4.465-9.974 9.974 0 4.406 2.857 8.145 6.821 9.465.499.09.679-.217.679-.481 0-.237-.008-.865-.011-1.696-2.775.602-3.361-1.338-3.361-1.338-.452-1.152-1.107-1.459-1.107-1.459-.905-.619.069-.605.069-.605 1.002.07 1.527 1.028 1.527 1.028.89 1.524 2.336 1.084 2.902.829.091-.645.351-1.085.635-1.334-2.214-.251-4.542-1.107-4.542-4.93 0-1.087.389-1.979 1.024-2.675-.101-.253-.446-1.268.099-2.64 0 0 .837-.269 2.742 1.021a9.582 9.582 0 0 1 2.496-.336 9.554 9.554 0 0 1 2.496.336c1.906-1.291 2.742-1.021 2.742-1.021.545 1.372.203 2.387.099 2.64.64.696 1.024 1.587 1.024 2.675 0 3.833-2.33 4.675-4.552 4.922.355.308.675.916.675 1.846 0 1.334-.012 2.41-.012 2.737 0 .267.178.577.687.479C19.146 20.115 22 16.379 22 11.974 22 6.465 17.535 2 12.026 2z">
								</path>
							</svg>
						</a>
					</li> --}}
				</ul>
			</div>

			<div>
				<p class="text-sm font-semibold tracking-widest text-gray-400 uppercase">{{ __('Legal') }}</p>

				<ul class="mt-6 space-y-4">

					<li>
						<x-footer.nav-link :href="route('pages.faq')">{{ __('FAQ') }}</x-footer.nav-link>
					</li>
					<li>
						<x-footer.nav-link
								:href="route('pages.privacy-policy')">{{ __('Privacy Policy') }}</x-footer.nav-link>
					</li>
					<li>
						<x-footer.nav-link
								:href="route('pages.terms-and-conditions')">{{ __('Terms and Conditions') }}</x-footer.nav-link>
					</li>


				</ul>
			</div>

			<div>
				<p class="text-sm font-semibold tracking-widest text-gray-400 uppercase">{{ __('Quick Links') }}</p>

				<ul class="mt-6 space-y-4">
					<li>
						<x-footer.nav-link :href="route('home')">{{ __('Home') }}</x-footer.nav-link>
					</li>
					<li>
						<x-footer.nav-link :href="route('pages.about')">{{ __('About') }}</x-footer.nav-link>
					</li>
					<li>
						<x-footer.nav-link :href="route('pages.contact')">{{ __('Contact') }}</x-footer.nav-link>
					</li>

				</ul>
			</div>

			<div class="col-span-2 md:col-span-1 lg:col-span-2 lg:pl-8 space-y-4">
				<p class="text-sm font-semibold tracking-widest text-gray-400 uppercase">
					{{ __('Request') }}</p>

				<p>Join Our Telegram Chanel</p>

				<a href="https://t.me/+X94KLytY-Kk5NzU9" class="block">
					<x-button.primary type="button" class=" px-4">Join</x-button.primary>
				</a>
			</div>
		</div>

		<hr class="mt-6 mb-6 border-gray-200 dark:border-gray-700"/>

		<p class="text-sm text-center text-gray-600">{!! __('&copy; 2024 . All rights reserved.') !!} {{ config('app.name') }}</p>
	</div>
</section>
