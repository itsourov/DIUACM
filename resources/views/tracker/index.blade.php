<x-web-layout>

	<div class="container mx-auto px-2 py-10 space-y-6">
		<div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
			@foreach($trackers as $tracker)
				<a href="{{ route('trackers.show', $tracker) }}">
					<x-card>
						<h3 class="text-lg font-semibold">
							{{$tracker->title}}
						</h3>
						<p class="line-clamp-1">
							{{$tracker->description}}
						</p>
					</x-card>
				</a>
			@endforeach
		</div>

	</div>
</x-web-layout>