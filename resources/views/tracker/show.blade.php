<x-web-layout>
    @section("seo")
        {!! seo($SEOData) !!}
    @endsection


    @if($tracker->type=='embedded')

        <div class="container mx-auto px-2 py-10 h-screen">
            {!! $tracker->embedded_content  !!}
        </div>
        <style>
            iframe {
                width: 100%;
                height: 95%;
                background: white;
            }
        </style>
    @else
        <livewire:rank-list :tracker="$tracker" />
    @endif



</x-web-layout>
