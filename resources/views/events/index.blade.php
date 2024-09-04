<x-web-layout>
	<div class="space-y-5 container mx-auto px-2 py-2">
		<h3 class="font-bold px-1">{{ __('Events') }}</h3>


		<div class="grid grid-cols-1 md:grid-cols-2 gap-4 ">

			@foreach ($events as $event)
				@php
					$isPresent = $event->attenders->contains('user_id', auth()->user()?->id);
				@endphp
				<div>
					<a href="{{ route('events.show', $event) }}">
						<x-card>


							<div class="flex-1 truncate">
								<div class="flex items-center space-x-3">
									<h3 class="truncate text-sm font-medium">{{ $event->title }}</h3>
									@if ($isPresent)
										<span
												class="inline-block flex-shrink-0 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">Present</span>
									@endif
									@if ($event->is_running)
										<span
												class="inline-block flex-shrink-0 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">Running</span>
									@else
										@if ($event->is_upcoming)
											<span
													class="inline-block flex-shrink-0 rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-800">upcoming</span>
										@else
											<span
													class="inline-block flex-shrink-0 rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-800">Done</span>
										@endif
									@endif
								</div>
								<p class="mt-1 truncate text-sm text-gray-500">
									{{ $event->starting_time->format('h:i A, d M Y (D)') }}
								</p>
								<p class="flex items-center content-center">
									<x-svg.users class="w-5 h-5 text-gray-500" />
									: {{ $event->attenders->count() }}
								</p>
							</div>

						</x-card>
					</a>
{{--					@admin()--}}
{{--					<div class="flex gap-2 mt-1">--}}
{{--						<a href="{{ route('events.edit', $event) }}">--}}
{{--							<x-button.secondary>--}}
{{--								<x-svg.edit class="w-5 h-5" />--}}
{{--							</x-button.secondary>--}}
{{--						</a>--}}

{{--						<form action="{{ route('events.destroy', $event) }}" method="post">--}}
{{--							@csrf--}}
{{--							@method('DELETE')--}}
{{--							<x-button.secondary type="submit">--}}
{{--								<x-svg.trash class="w-5 h-5" />--}}
{{--							</x-button.secondary>--}}
{{--						</form>--}}

{{--					</div>--}}
{{--					@endadmin--}}
				</div>
			@endforeach

		</div>
		<div class="my-5">
			{{ $events->appends(Request::all())->onEachSide(1)->links('pagination.tailwind') }}
		</div>

	</div>
</x-web-layout>