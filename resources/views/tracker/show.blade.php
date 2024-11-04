<x-web-layout>
    @section("seo")
        {!! seo($SEOData) !!}
    @endsection

    <livewire:rank-list lazy :tracker="$tracker"/>
</x-web-layout>
