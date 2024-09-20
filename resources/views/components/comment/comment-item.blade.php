@props(['isReply' => false, 'comment', 'parentComment','cardClass'])
<x-card class="space-y-3 {{$cardClass}} px-4 py-4 {{ $isReply ? ' ml-4 md:ml-8' : '' }}"
        id="{{ $isReply ? 'reply' : 'comment' }}-{{ $comment->id }}">
	<div class="flex justify-between">
		<div class="flex flex-wrap items-center gap-2">
			<a href="{{ route('my-account.profile.edit', $comment->user) }}" class="flex flex-wrap items-center gap-2">
				<img class="h-6 w-6 rounded-full border dark:border-gray-700"
				     src="{{ $comment->user->getFirstMediaUrl('profile-images', 'preview') }}" alt="">
				<p class="text-sm font-medium">{{ $comment->user->name }}</p>
			</a>

			<p class="text-sm text-gray-500">{{ $comment->created_at->diffForHumans() }}</p>
		</div>
		@if ($comment->user->id == auth()->user()?->id)
			{{ ($this->deleteAction)(['comment' => $comment->id]) }}
		@endif

	</div>
	<div>
		<p>{{ $comment->comment }}</p>
	</div>
	@if ($isReply)
		{{ ($this->replyAction)(['parent_id' => $parentComment->id]) }}
	@else
		{{ ($this->replyAction)(['parent_id' => $comment->id]) }}
	@endif

</x-card>
