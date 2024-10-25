<div class="space-y-3 mt-4">


	<x-filament::input.wrapper class="max-w-sm mx-auto"
	                           suffix-icon="heroicon-o-magnifying-glass">
		<x-filament::input
				placeholder="Search Here"
				type="text"

				wire:model.live.debounce="search"
		/>
	</x-filament::input.wrapper>
	<div class=" mx-auto w-fit">
		<x-filament::tabs>
			<x-filament::tabs.item icon="heroicon-m-users" :active="$activeTab === 'all'"
			                       wire:click="$set('activeTab', 'all')">
				All
				<x-slot name="badge">
					{{$allCount}}
				</x-slot>
			</x-filament::tabs.item>

			<x-filament::tabs.item icon="heroicon-m-clock" :active="$activeTab === 'running'"
			                       wire:click="$set('activeTab', 'running')">
				Running
				<x-slot name="badge">
					{{$runningCount}}
				</x-slot>
			</x-filament::tabs.item>
            <x-filament::tabs.item icon="heroicon-m-clock" :active="$activeTab === 'upcoming'"
			                       wire:click="$set('activeTab', 'upcoming')">
                Upcoming
				<x-slot name="badge">
					{{$upcomingCount}}
				</x-slot>
			</x-filament::tabs.item>
		</x-filament::tabs>
	</div>
	@if($search)
		<p class="text-sm">You are searching for: {{$search}} </p>
	@endif


	<div class="grid grid-cols-1 md:grid-cols-2 gap-4 ">

		@foreach ($events as $event)

			<a href="{{ route('events.show', $event) }}">
				<x-card class="p-4">


					{{svg($event->type->getIcon(),'shrink-0 size-8 mb-1 stroke-1')}}
					<h2 class="font-semibold text-xl text-gray-800 dark:text-neutral-200">
						{{ $event->title }}
					</h2>
					<p class="mb-1 text-sm text-gray-600 dark:text-neutral-400">
						{{ $event->starting_time->format('h:i A, d M Y (D)') }}
					</p>
					<div class="flex gap-2">
						@if ($event->starting_time > now())
							<x-filament::badge color="info">
								Upcoming
							</x-filament::badge>

						@elseif(now()>=$event->starting_time && now()<=$event->ending_time)
							<x-filament::badge color="warning">
								Running
							</x-filament::badge>
						@else
							<x-filament::badge color="gray">
								In Past
							</x-filament::badge>
						@endif

						@if($event->attenders->contains('id', auth()->user()?->id))
							<x-filament::badge color="success">
								Present
							</x-filament::badge>
						@endif

						<x-filament::badge icon="heroicon-m-user-group">
							{{$event->attenders->count()}}
						</x-filament::badge>


					</div>

				</x-card>
			</a>

			{{--				@php--}}
			{{--					$isPresent = $event->attenders->contains('id', auth()->user()?->id);--}}
			{{--				@endphp--}}
			{{--				<div>--}}
			{{--					<a href="{{ route('events.show', $event) }}">--}}
			{{--						<x-card>--}}


			{{--							<div class="flex-1 truncate">--}}
			{{--								<div class="flex items-center space-x-3">--}}
			{{--									<h3 class="truncate text-sm font-medium">{{ $event->title }}</h3>--}}
			{{--									@if ($isPresent)--}}
			{{--										<span--}}
			{{--												class="inline-block flex-shrink-0 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">Present</span>--}}
			{{--									@endif--}}
			{{--									@if ($event->starting_time > now())--}}
			{{--										<span--}}
			{{--												class="inline-block flex-shrink-0 rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-800">upcoming</span>--}}
			{{--									@elseif(now()>=$event->starting_time && now()<=$event->ending_time)--}}
			{{--										<span--}}
			{{--												class="inline-block flex-shrink-0 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">Running</span>--}}
			{{--									@else--}}
			{{--										<span--}}
			{{--												class="inline-block flex-shrink-0 rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-800">Done</span>--}}
			{{--									@endif--}}
			{{--								</div>--}}
			{{--								<p class="mt-1 truncate text-sm text-gray-500">--}}
			{{--									{{ $event->starting_time->format('h:i A, d M Y (D)') }}--}}
			{{--								</p>--}}
			{{--								<p class="flex items-center content-center">--}}
			{{--									<x-svg.users class="w-5 h-5 text-gray-500"/>--}}
			{{--									: {{ $event->attenders->count() }}--}}
			{{--								</p>--}}
			{{--							</div>--}}

			{{--						</x-card>--}}
			{{--					</a>--}}
			{{--					--}}{{--					@admin()--}}
			{{--					--}}{{--					<div class="flex gap-2 mt-1">--}}
			{{--					--}}{{--						<a href="{{ route('events.edit', $event) }}">--}}
			{{--					--}}{{--							<x-button.secondary>--}}
			{{--					--}}{{--								<x-svg.edit class="w-5 h-5" />--}}
			{{--					--}}{{--							</x-button.secondary>--}}
			{{--					--}}{{--						</a>--}}

			{{--					--}}{{--						<form action="{{ route('events.destroy', $event) }}" method="post">--}}
			{{--					--}}{{--							@csrf--}}
			{{--					--}}{{--							@method('DELETE')--}}
			{{--					--}}{{--							<x-button.secondary type="submit">--}}
			{{--					--}}{{--								<x-svg.trash class="w-5 h-5" />--}}
			{{--					--}}{{--							</x-button.secondary>--}}
			{{--					--}}{{--						</form>--}}

			{{--					--}}{{--					</div>--}}
			{{--					--}}{{--					@endadmin--}}
			{{--				</div>--}}

		@endforeach

	</div>
	<div class="my-5">
		<x-filament::pagination :paginator="$events"/>

	</div>
</div>
