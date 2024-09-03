<x-web-layout>
    <div class="container mx-auto px-2 py-10">
        <livewire:profile.update-profile :user="$user" />
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-5">

            {{-- <livewire:profile.update-profile :user="$user" /> --}}
{{--            @include('profile.partial.password-change')--}}
{{--            @include('profile.partial.delete-user')--}}

        </div>
    </div>


</x-web-layout>
