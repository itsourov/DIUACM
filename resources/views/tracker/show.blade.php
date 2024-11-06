<x-web-layout>
    @section("seo")
        {!! seo($SEOData) !!}
    @endsection

    <livewire:rank-list :tracker="$tracker" />
    <script>

        document.addEventListener('DOMContentLoaded', function () {
            const isFacebookBrowser = /FBAN|FBAV/i.test(navigator.userAgent);
            if (isFacebookBrowser) {
                alert("Google login doesn't work in Facebook's in-app browser. Please open this link in your main browser to log in.");

                // Optionally, you can provide an 'Open in Browser' button
                const openInBrowserButton = document.createElement('button');
                openInBrowserButton.textContent = "Open in Browser";
                openInBrowserButton.onclick = function () {
                    window.location.href = "googlechrome://" + window.location.href;
                };
                document.body.appendChild(openInBrowserButton);
            }
        });


        let mouseDown = false;
        let startX, scrollLeft;
        const slider = document.querySelector(".parent");

        const startDragging = (e) => {
            mouseDown = true;
            startX = e.pageX - slider.offsetLeft;
            scrollLeft = slider.scrollLeft;
        };

        const stopDragging = (e) => {
            mouseDown = false;
        };

        const move = (e) => {
            e.preventDefault();
            if (!mouseDown) {
                return;
            }
            const x = e.pageX - slider.offsetLeft;
            const scroll = x - startX;
            slider.scrollLeft = scrollLeft - scroll;
        };

        // Add the event listeners
        slider.addEventListener("mousemove", move, false);
        slider.addEventListener("mousedown", startDragging, false);
        slider.addEventListener("mouseup", stopDragging, false);
        slider.addEventListener("mouseleave", stopDragging, false);
    </script>


</x-web-layout>
