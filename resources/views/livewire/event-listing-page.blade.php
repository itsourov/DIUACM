<div class="space-y-3 mt-4">


{{--    <x-filament::input.wrapper class="max-w-sm mx-auto"--}}
{{--                               suffix-icon="heroicon-o-magnifying-glass">--}}
{{--        <x-filament::input--}}
{{--            placeholder="Search Here"--}}
{{--            type="text"--}}

{{--            wire:model.live.debounce="search"--}}
{{--        />--}}
{{--    </x-filament::input.wrapper>--}}
{{--    <div class=" mx-auto w-fit">--}}
{{--        <x-filament::tabs>--}}
{{--            <x-filament::tabs.item icon="heroicon-m-users" :active="$activeTab === 'all'"--}}
{{--                                   wire:click="$set('activeTab', 'all')">--}}
{{--                All--}}
{{--                <x-slot name="badge">--}}
{{--                    {{$allCount}}--}}
{{--                </x-slot>--}}
{{--            </x-filament::tabs.item>--}}

{{--            <x-filament::tabs.item icon="heroicon-m-clock" :active="$activeTab === 'running'"--}}
{{--                                   wire:click="$set('activeTab', 'running')">--}}
{{--                Running--}}
{{--                <x-slot name="badge">--}}
{{--                    {{$runningCount}}--}}
{{--                </x-slot>--}}
{{--            </x-filament::tabs.item>--}}
{{--            <x-filament::tabs.item icon="heroicon-m-clock" :active="$activeTab === 'upcoming'"--}}
{{--                                   wire:click="$set('activeTab', 'upcoming')">--}}
{{--                Upcoming--}}
{{--                <x-slot name="badge">--}}
{{--                    {{$upcomingCount}}--}}
{{--                </x-slot>--}}
{{--            </x-filament::tabs.item>--}}
{{--        </x-filament::tabs>--}}
{{--    </div>--}}
{{--    @if($search)--}}
{{--        <p class="text-sm">You are searching for: {{$search}} </p>--}}
{{--    @endif--}}


    {{ $this->table }}

</div>
