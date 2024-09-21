<div>
	<form wire:submit="create">
		{{ $this->form }}

		<x-button.primary class="mt-2">
			Submit
		</x-button.primary>
	</form>

	<x-filament-actions::modals />

	<div class="grid gap-4 mt-8">
		@foreach ($comments as $comment)

			@if (!$comment->deleted_at)
				<x-comment.comment-item :cardClass="$cardClass" :comment="$comment" />
			@else
				<x-card class="text-sm">
					This comment was deleted
				</x-card>
			@endif

			@foreach ($comment->replies as $reply)
				@if (!$reply->deleted_at)
					<x-comment.comment-item :cardClass="$cardClass" :comment="$reply" :isReply="true" :parentComment="$comment" />
				@else
					<x-card class="text-sm ml-4 md:ml-8">
						This reply was deleted
					</x-card>
				@endif
			@endforeach
		@endforeach
	</div>
	<div class="my-4">
		{{ $comments->links('pagination.tailwind-livewire') }}
	</div>
	<div wire:loading wire:target="create, replyAction ,deleteAction,gotoPage">
		<div
				class="fixed z-40 flex tems-center justify-center inset-0 bg-gray-700 dark:bg-gray-900 dark:bg-opacity-50 bg-opacity-50 transition-opacity">
			<div class="flex items-center justify-center ">
				<div class="w-40 h-40 border-t-4 border-b-4 border-green-900 rounded-full animate-spin">
				</div>
			</div>
		</div>
	</div>
</div>
