<x-card>
	<div class="flex items-center gap-x-4">
		<img class="rounded-full size-12"
		     src="{{ $user->getFirstMediaUrl('profile-images', 'preview') }}"
		     alt="Avatar">
		<div class="grow">
			<h3 class="font-medium text-gray-800 dark:text-neutral-200">
				{{$user->name}}
			</h3>
			<p class="text-xs uppercase text-gray-500 dark:text-neutral-500">
				Posh ACM Programmer
			</p>
		</div>
	</div>

	<p class="mt-3 text-gray-500 dark:text-neutral-500">
		{{$user->bio??"..."}}
	</p>

{{--	<!-- Social Brands -->--}}
{{--	<div class="mt-3 flex gap-2">--}}


{{--		<a href="https://codeforces.com/profile/{{$user->codeforces_username}}" target="_blank">--}}
{{--			<x-filament::badge color="info">--}}
{{--				Codeforces--}}
{{--			</x-filament::badge>--}}
{{--		</a>--}}

{{--		<a href="https://vjudge.net/user/{{$user->vjudge_username}}" target="_blank">--}}
{{--			<x-filament::badge color="info">--}}
{{--				Vjudge--}}
{{--			</x-filament::badge>--}}
{{--		</a>--}}
{{--		<a href="https://atcoder.jp/users/{{$user->atcoder_username}}" target="_blank">--}}
{{--			<x-filament::badge color="info">--}}
{{--				Atcoder--}}
{{--			</x-filament::badge>--}}
{{--		</a>--}}
{{--	</div>--}}
{{--	<!-- End Social Brands -->--}}
</x-card>