<x-impersonate::banner />

{{--<div class="hideInApp" x-data="{ offCanvasMenu: false }">--}}

{{--	<div class="fixed inset-0 flex z-40 lg:hidden" x-cloak x-show="offCanvasMenu" role="dialog" aria-modal="true">--}}

{{--		<div x-transition:enter="transition-opacity ease-linear duration-300" x-transition:enter-start="opacity-0"--}}
{{--		     x-transition:enter-end="opacity-100" x-transition:leave="transition-opacity ease-linear duration-300"--}}
{{--		     x-transition:leave-start="opacity-100" x-transition:leave-end="opacity-0"--}}
{{--		     class="fixed inset-0 bg-black bg-opacity-25" x-cloak x-show="offCanvasMenu" aria-hidden="true"></div>--}}


{{--		<div x-cloak x-show="offCanvasMenu" x-transition:enter="transition ease-in-out duration-300 transform"--}}
{{--		     x-transition:enter-start="-translate-x-full" x-transition:enter-end="translate-x-0"--}}
{{--		     x-transition:leave="transition ease-in-out duration-300 transform" x-transition:leave-start="translate-x-0"--}}
{{--		     x-transition:leave-end="-translate-x-full"--}}
{{--		     class="relative max-w-xs w-full bg-white  dark:bg-gray-900  shadow-xl pb-12 flex flex-col overflow-y-auto">--}}
{{--			<div class="px-4 pt-5 pb-2 flex">--}}
{{--				<button type="button" x-on:click="offCanvasMenu= !offCanvasMenu"--}}
{{--				        class="-m-2 p-2 rounded-md inline-flex items-center justify-center text-gray-400 ">--}}
{{--					<span class="sr-only">Close menu</span>--}}
{{--					<!-- Heroicon name: outline/x -->--}}
{{--					<svg class="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"--}}
{{--					     stroke="currentColor" aria-hidden="true">--}}
{{--						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"--}}
{{--						      d="M6 18L18 6M6 6l12 12" />--}}
{{--					</svg>--}}
{{--				</button>--}}
{{--			</div>--}}

{{--			<!-- Links -->--}}

{{--			<div class="border-t border-gray-200 dark:border-gray-700 py-6 px-4 space-y-4">--}}
{{--				<x-nav-link :href="route('home')" :active="request()->routeIs('home')">--}}
{{--					{{ __('Home') }}--}}
{{--				</x-nav-link>--}}
{{--				<x-nav-link :href="route('events.index')" :active="request()->routeIs('events.*')">--}}
{{--					{{ __('Regular Events') }}--}}
{{--				</x-nav-link>--}}
{{--				<x-nav-link :href="route('trackers.index')" :active="request()->routeIs('trackers.*')">--}}
{{--					{{ __('Trackers') }}--}}
{{--				</x-nav-link>--}}
{{--				<x-nav-link :href="route('gallery.index')" :active="request()->routeIs('gallery.*')">--}}
{{--					{{ __('Galleries') }}--}}
{{--				</x-nav-link>--}}
{{--				<x-nav-link :href="route('blog.index')" :active="request()->routeIs('blog.*')">--}}
{{--					{{ __('Blog') }}--}}
{{--				</x-nav-link>--}}


{{--				<x-nav-link :href="route('pages.about')" :active="request()->routeIs('pages.about')">--}}
{{--					{{ __('About') }}--}}
{{--				</x-nav-link>--}}
{{--				<x-nav-link :href="route('pages.contact')" :active="request()->routeIs('pages.contact')">--}}
{{--					{{ __('Contact') }}--}}
{{--				</x-nav-link>--}}
{{--			</div>--}}

{{--			<div class="border-t border-gray-200 dark:border-gray-700 py-6 px-4 space-y-4">--}}

{{--				@auth--}}
{{--					@if(auth()->user()->hasRole('panel_user') || auth()->user()->hasRole('super_admin'))--}}
{{--						<x-nav-link :href="route('filament.admin.pages.dashboard', auth()->user()->username)">--}}
{{--							<x-svg.user-circle class="inline w-4 h-4" />{{ __('Admin Panel') }}--}}


{{--						</x-nav-link>--}}
{{--					@endif--}}
{{--					<x-nav-link :href="route('my-account.profile.edit', auth()->user()->username)">--}}
{{--						<x-svg.user-circle class="inline w-4 h-4" />{{ __('Profile') }}--}}
{{--					</x-nav-link>--}}

{{--					<!-- Authentication -->--}}
{{--					<form method="POST" action="{{ route('logout') }}">--}}
{{--						@csrf--}}

{{--						<x-nav-link :href="route('logout')"--}}
{{--						            onclick="event.preventDefault();--}}
{{--                                            this.closest('form').submit();">--}}
{{--							<x-svg.exit class="inline w-4 h-4" /> {{ __('Log Out') }}--}}
{{--						</x-nav-link>--}}
{{--					</form>--}}
{{--				@else--}}
{{--					<x-nav-link :href="route('login')" :active="request()->routeIs('login')">--}}
{{--						<x-svg.exit class="inline w-4 h-4" /> {{ __('Login') }}--}}
{{--					</x-nav-link>--}}
{{--					<x-nav-link :href="route('register')" :active="request()->routeIs('register')">--}}
{{--						<x-svg.user-plus class="inline w-4 h-4" /> {{ __('Register') }}--}}
{{--					</x-nav-link>--}}
{{--				@endauth--}}


{{--			</div>--}}

{{--			--}}{{-- <div class="border-t border-gray-200 dark:border-gray-700 py-6 px-4 space-y-4">--}}
{{--				@foreach (Config::get('languages') as $lang => $language)--}}
{{--					<x-nav-link :href="route('lang.switch', $lang)" active="{{ $lang == App::getLocale() }}">--}}
{{--						<span class="fi fi-{{ Config::get('languages')[$lang]['flag-icon'] }} mr-1"></span>--}}
{{--						{{ $language['display'] }}--}}
{{--					</x-nav-link>--}}
{{--				@endforeach--}}
{{--			</div> --}}
{{--		</div>--}}
{{--	</div>--}}

{{--	<header class="relative bg-white dark:bg-black border-b border-gray-200  dark:border-gray-800 ">--}}
{{--		--}}{{--        <p--}}
{{--		--}}{{--            class="bg-indigo-600 h-10 flex items-center justify-center text-sm font-medium text-white px-4 sm:px-6 lg:px-8">--}}
{{--		--}}{{--            {{ __('We are new, Kindly contribute by uploading questions') }}--}}
{{--		--}}{{--        </p>--}}

{{--		<nav aria-label="Top" class="container mx-auto px-2 ">--}}
{{--			<div class="">--}}
{{--				<div class="h-16 flex items-center">--}}

{{--					<button type="button" x-on:click="offCanvasMenu = !offCanvasMenu"--}}
{{--					        class=" p-2 -ml-2 rounded-md text-gray-500 lg:hidden">--}}
{{--						<span class="sr-only">Open menu</span>--}}
{{--						<!-- Heroicon name: outline/menu -->--}}
{{--						<svg class="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"--}}
{{--						     stroke="currentColor" aria-hidden="true">--}}
{{--							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"--}}
{{--							      d="M4 6h16M4 12h16M4 18h16" />--}}
{{--						</svg>--}}
{{--					</button>--}}

{{--					<!-- Logo -->--}}
{{--					<div class="ml-4 flex lg:ml-0">--}}
{{--						<a href="{{ route('home') }}">--}}
{{--							<span class="sr-only">Workflow</span>--}}
{{--							<h3 class="font-marry font-bold text-lg">{{config('app.name')}}</h3>--}}
{{--							--}}{{--                            <x-svg.logo class="w-auto h-9 dark:fill-white fill-black"/>--}}
{{--						</a>--}}
{{--					</div>--}}

{{--					<!-- Flyout menus -->--}}
{{--					<div class="hidden lg:ml-8 lg:block lg:self-stretch">--}}
{{--						<div class="h-full flex space-x-8">--}}
{{--							<x-nav-link :href="route('home')" :active="request()->routeIs('home')">--}}
{{--								{{ __('Home') }}--}}
{{--							</x-nav-link>--}}
{{--							<x-nav-link :href="route('events.index')" :active="request()->routeIs('events.*')">--}}
{{--								{{ __('Regular Events') }}--}}
{{--							</x-nav-link>--}}

{{--							<x-nav-link :href="route('trackers.index')"--}}
{{--							            :active="request()->routeIs('trackers.*')">--}}
{{--								{{ __('Trackers') }}--}}
{{--							</x-nav-link>--}}

{{--							<x-nav-link :href="route('gallery.index')"--}}
{{--							            :active="request()->routeIs('gallery.*')">--}}
{{--								{{ __('Galleries') }}--}}
{{--							</x-nav-link>--}}

{{--							<x-nav-link :href="route('blog.index')"--}}
{{--							            :active="request()->routeIs('blog.*')">--}}
{{--								{{ __('Blog') }}--}}
{{--							</x-nav-link>--}}
{{--							<x-nav-link :href="route('pages.about')" :active="request()->routeIs('pages.about')">--}}
{{--								{{ __('About') }}--}}
{{--							</x-nav-link>--}}
{{--							<x-nav-link :href="route('pages.contact')" :active="request()->routeIs('pages.contact')">--}}
{{--								{{ __('Contact') }}--}}
{{--							</x-nav-link>--}}


{{--						</div>--}}
{{--					</div>--}}

{{--					<div class="ml-auto flex items-center">--}}
{{--						<div class="hidden lg:flex lg:flex-1 lg:items-center lg:justify-end lg:space-x-3">--}}


{{--							@auth--}}

{{--								<x-dropdown align="right" width="48">--}}
{{--									<x-slot name="trigger">--}}
{{--										<x-nav-link href="#">--}}
{{--											<x-svg.user-circle class="inline w-5 h-5" /> {{ __('Profile') }}--}}
{{--										</x-nav-link>--}}
{{--									</x-slot>--}}
{{--									<x-slot name="content">--}}

{{--										<x-dropdown-link :href="route('my-account.profile.edit')">--}}
{{--											{{ __('My Profile') }}--}}
{{--										</x-dropdown-link>--}}
{{--										@if(auth()->user()->hasRole('panel_user') || auth()->user()->hasRole('super_admin'))--}}
{{--											<x-dropdown-link :href="route('filament.admin.pages.dashboard')">--}}
{{--												{{ __('Admin Panel') }}--}}
{{--											</x-dropdown-link>--}}
{{--										@endif--}}


{{--										<!-- Authentication -->--}}
{{--										<form method="POST" action="{{ route('logout') }}">--}}
{{--											@csrf--}}

{{--											<x-dropdown-link :href="route('logout')"--}}
{{--											                 onclick="event.preventDefault();--}}
{{--                                            this.closest('form').submit();">--}}
{{--												{{ __('Log Out') }}--}}
{{--											</x-dropdown-link>--}}
{{--										</form>--}}
{{--									</x-slot>--}}
{{--								</x-dropdown>--}}
{{--							@else--}}
{{--								<x-nav-link :href="route('login')" :active="request()->routeIs('login')"--}}
{{--								            class="border-none">--}}
{{--									<x-svg.exit class="inline w-4 h-4" /> {{ __('Login') }}--}}
{{--								</x-nav-link>--}}
{{--								<span class="h-6 w-px bg-gray-200" aria-hidden="true"></span>--}}
{{--								<x-nav-link :href="route('register')" :active="request()->routeIs('register')"--}}
{{--								            class="border-none">--}}
{{--									<x-svg.user-plus class="inline w-4 h-4" /> {{ __('Register') }}--}}
{{--								</x-nav-link>--}}
{{--							@endauth--}}
{{--						</div>--}}

{{--						--}}{{-- <x-dropdown align="left" width="48">--}}
{{--							<x-slot name="trigger">--}}
{{--								<div--}}
{{--									class="hidden lg:ml-4 lg:flex hover:bg-gray-100 dark:hover:bg-gray-700 p-2 rounded">--}}
{{--									<a href="#" class=" flex items-center">--}}
{{--										<span--}}
{{--											class="fi fi-{{ Config::get('languages')[App::getLocale()]['flag-icon'] }}"></span>--}}
{{--										<span class="ml-2 block text-sm font-medium">--}}
{{--											{{ Config::get('languages')[App::getLocale()]['display'] }} </span>--}}
{{--										<span class="sr-only">, change Language</span>--}}
{{--									</a>--}}
{{--								</div>--}}
{{--							</x-slot>--}}
{{--							<x-slot name="content">--}}
{{--								@foreach (Config::get('languages') as $lang => $language)--}}
{{--									@if ($lang != App::getLocale())--}}
{{--										<x-dropdown-link :href="route('lang.switch', $lang)">--}}
{{--											<span--}}
{{--												class="fi fi-{{ Config::get('languages')[$lang]['flag-icon'] }}"></span>--}}
{{--											{{ $language['display'] }}--}}
{{--										</x-dropdown-link>--}}
{{--									@endif--}}
{{--								@endforeach--}}

{{--							</x-slot>--}}
{{--						</x-dropdown> --}}


{{--					</div>--}}
{{--				</div>--}}
{{--			</div>--}}
{{--		</nav>--}}
{{--	</header>--}}


{{--</div>--}}


<!-- ========== HEADER ========== -->
<header
    class="sticky top-0 flex flex-wrap  md:justify-start md:flex-nowrap z-50 w-full bg-white border-b border-gray-200 dark:bg-black dark:border-neutral-700">
    <nav class="relative container w-full mx-auto md:flex md:items-center md:justify-between md:gap-3 p-2">
        <div class="flex justify-between items-center gap-x-1">
            <a class="flex-none font-semibold text-xl text-black focus:outline-none focus:opacity-80 dark:text-white font-marry"
               href="{{route('home')}}" aria-label="Brand">
                {{config('app.name')}}
            </a>

            <!-- Collapse Button -->
            <button type="button"
                    class="hs-collapse-toggle md:hidden relative size-9 flex justify-center items-center font-medium text-[12px] rounded-lg border border-gray-200 text-gray-800 hover:bg-gray-100 focus:outline-none focus:bg-gray-100 disabled:opacity-50 disabled:pointer-events-none dark:text-white dark:border-neutral-700 dark:hover:bg-neutral-700 dark:focus:bg-neutral-700"
                    id="hs-header-base-collapse" aria-expanded="false" aria-controls="hs-header-base"
                    aria-label="Toggle navigation" data-hs-collapse="#hs-header-base">
                <svg class="hs-collapse-open:hidden size-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24"
                     viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                     stroke-linejoin="round">
                    <line x1="3" x2="21" y1="6" y2="6" />
                    <line x1="3" x2="21" y1="12" y2="12" />
                    <line x1="3" x2="21" y1="18" y2="18" />
                </svg>
                <svg class="hs-collapse-open:block shrink-0 hidden size-4" xmlns="http://www.w3.org/2000/svg" width="24"
                     height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                     stroke-linecap="round" stroke-linejoin="round">
                    <path d="M18 6 6 18" />
                    <path d="m6 6 12 12" />
                </svg>
                <span class="sr-only">Toggle navigation</span>
            </button>
            <!-- End Collapse Button -->
        </div>

        <!-- Collapse -->
        <div id="hs-header-base"
             class="hs-collapse hidden overflow-hidden transition-all duration-300 basis-full grow md:block "
             aria-labelledby="hs-header-base-collapse">
            <div
                class="overflow-hidden overflow-y-auto max-h-[75vh] [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-gray-100 [&::-webkit-scrollbar-thumb]:bg-gray-300 dark:[&::-webkit-scrollbar-track]:bg-neutral-700 dark:[&::-webkit-scrollbar-thumb]:bg-neutral-500">
                <div class="py-2 md:py-0  flex flex-col md:flex-row md:items-center gap-0.5 md:gap-1">
                    <div class="grow">
                        <div class="flex flex-col md:flex-row md:justify-end md:items-center gap-0.5 md:gap-1">
                            <x-nav-link :href="route('home')" :active="request()->routeIs('home')">
                                {{ __('Home') }}
                            </x-nav-link>
                            <x-nav-link :href="route('events.index')" :active="request()->routeIs('events.*')">
                                {{ __('Regular Events') }}
                            </x-nav-link>

                            <x-nav-link :href="route('trackers.index')"
                                        :active="request()->routeIs('trackers.*')">
                                {{ __('Trackers') }}
                            </x-nav-link>

                            <x-nav-link :href="route('gallery.index')"
                                        :active="request()->routeIs('gallery.*')">
                                {{ __('Galleries') }}
                            </x-nav-link>

                            <x-nav-link :href="route('blog.index')"
                                        :active="request()->routeIs('blog.*')">
                                {{ __('Blog') }}
                            </x-nav-link>
                            <x-nav-link :href="route('pages.about')" :active="request()->routeIs('pages.about')">
                                {{ __('About') }}
                            </x-nav-link>
                            <x-nav-link :href="route('pages.contact')" :active="request()->routeIs('pages.contact')">
                                {{ __('Contact') }}
                            </x-nav-link>

                        </div>
                    </div>

                    <div class="my-2 md:my-0 md:mx-2">
                        <div class="w-full h-px md:w-px md:h-4 bg-gray-100 md:bg-gray-300 dark:bg-neutral-700"></div>
                    </div>

                    <!-- Button Group -->
                    <div class=" flex  items-center gap-x-1.5">

                        <a href="{{route('login')}}">
                            <x-button.primary class="">
                                Get started
                            </x-button.primary>
                        </a>



                        <button id="theme-toggle" data-tooltip-target="tooltip-toggle" type="button"
                                class=" text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none  rounded-lg text-sm p-2.5">
                            <svg id="theme-toggle-dark-icon" class=" w-5 h-5" fill="currentColor"
                                 viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"></path>
                            </svg>
                            <svg id="theme-toggle-light-icon" class="hidden w-5 h-5" fill="currentColor"
                                 viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                <path
                                    d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
                                    fill-rule="evenodd" clip-rule="evenodd"></path>
                            </svg>
                        </button>

                    </div>
                    <!-- End Button Group -->
                </div>
            </div>
        </div>
        <!-- End Collapse -->
    </nav>
</header>
<!-- ========== END HEADER ========== -->
