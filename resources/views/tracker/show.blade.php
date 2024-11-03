<x-web-layout>
    @section("seo")
        {!! seo($SEOData) !!}
    @endsection

    <livewire:rank-list  :tracker="$tracker"/>
</x-web-layout>
