<x-web-layout>
    @section("seo")
        {!! seo($SEOData) !!}
    @endsection

    <div class="container mx-auto space-y-5 px-2 py-2">
        <livewire:event-attendance-page :event="$event" />
        <livewire:comment-section :commentable="$event" cardClass="dark:bg-gray-900" />
    </div>


</x-web-layout>
