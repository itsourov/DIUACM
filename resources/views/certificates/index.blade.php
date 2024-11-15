<x-web-layout>
    <div class="container mx-auto px-2 py-16 space-y-2">
        <div class="grid grid-cols-2 gap-2">
            <div class="col-span-2 md:col-span-1">
                <x-input.label>Name:</x-input.label>
                <x-input.text id="nameInput" />
            </div>


            <div class="col-span-2 md:col-span-1">
                <x-input.label>ID:</x-input.label>
                <x-input.text id="idInput" />
            </div>

        </div>

        <x-button.primary id="previewButton" class="mx-auto">Get Certificate</x-button.primary>
        <x-button.primary id="downloadButton" class="mx-auto">Download</x-button.primary>
        <div id="previewImageLoading"
             class="hidden animate-pulse w-full bg-gray-300 h-48 rounded-lg mb-5 flex justify-center items-center">
            <svg class="w-8 h-8 stroke-gray-400" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                    d="M20.5499 15.15L19.8781 14.7863C17.4132 13.4517 16.1808 12.7844 14.9244 13.0211C13.6681 13.2578 12.763 14.3279 10.9528 16.4679L7.49988 20.55M3.89988 17.85L5.53708 16.2384C6.57495 15.2167 7.09388 14.7059 7.73433 14.5134C7.98012 14.4396 8.2352 14.4011 8.49185 14.3993C9.16057 14.3944 9.80701 14.7296 11.0999 15.4M11.9999 21C12.3154 21 12.6509 21 12.9999 21C16.7711 21 18.6567 21 19.8283 19.8284C20.9999 18.6569 20.9999 16.7728 20.9999 13.0046C20.9999 12.6828 20.9999 12.3482 20.9999 12C20.9999 11.6845 20.9999 11.3491 20.9999 11.0002C20.9999 7.22883 20.9999 5.34316 19.8283 4.17158C18.6568 3 16.7711 3 12.9998 3H10.9999C7.22865 3 5.34303 3 4.17145 4.17157C2.99988 5.34315 2.99988 7.22877 2.99988 11C2.99988 11.349 2.99988 11.6845 2.99988 12C2.99988 12.3155 2.99988 12.651 2.99988 13C2.99988 16.7712 2.99988 18.6569 4.17145 19.8284C5.34303 21 7.22921 21 11.0016 21C11.3654 21 11.7021 21 11.9999 21ZM7.01353 8.85C7.01353 9.84411 7.81942 10.65 8.81354 10.65C9.80765 10.65 10.6135 9.84411 10.6135 8.85C10.6135 7.85589 9.80765 7.05 8.81354 7.05C7.81942 7.05 7.01353 7.85589 7.01353 8.85Z"
                    stroke="stroke-current" stroke-width="1.6" stroke-linecap="round"></path>
            </svg>
        </div>
        <img id="previewImage" class=" hidden w-full rounded shadow" alt="Preview will appear here" src="" />
        <canvas id="canvas" style="display: none;"></canvas>

    </div>

    <script>
        const previewBtn = document.getElementById("previewButton");
        const downloadBtn = document.getElementById("downloadButton");
        const previewImage = document.getElementById("previewImage");
        const nameInput = document.getElementById("nameInput");
        const idInput = document.getElementById("idInput");
        const previewImageLoading = document.getElementById("previewImageLoading");
        var pngDataUrl = null;
        previewBtn.addEventListener("click", async () => {
            pngDataUrl = await fetchSvgAndConvertToPng(nameInput.value, idInput.value, 3);
            previewImage.src = pngDataUrl;
        });

        downloadBtn.addEventListener("click", async () => {

            if (!pngDataUrl) {
                pngDataUrl = await fetchSvgAndConvertToPng(nameInput.value, idInput.value, 3);
                previewImage.src = pngDataUrl;
            }

            if (pngDataUrl) {
                // Create a link to download the PNG
                const downloadLink = document.createElement("a");
                downloadLink.href = pngDataUrl;
                downloadLink.download = `certificate.png`;
                downloadLink.click();
            }
        });


        async function fetchSvgAndConvertToPng(name,id, scale) {
            previewImageLoading.classList.remove("hidden");
            previewImage.classList.add("hidden");
            const workerUrl = `https://cert-gen.sourov1004.workers.dev/take-off-fall-24/participation?name=${encodeURIComponent(name)}&student_id=${encodeURIComponent(id)}`;

            try {
                // Fetch the SVG from the worker
                const response = await fetch(workerUrl);
                if (!response.ok) {
                    const errorText = await response.text(); // Read the response body as text
                    throw Error(errorText);
                }
                const svgText = await response.text();

                // Convert SVG to data URL
                const svgBlob = new Blob([svgText], { type: "image/svg+xml" });
                const svgUrl = URL.createObjectURL(svgBlob);

                // Load SVG as an image
                const img = new Image();
                img.src = svgUrl;

                // Wait for the image to load
                await new Promise((resolve) => (img.onload = resolve));

                // Draw the image on a scaled canvas
                const canvas = document.getElementById("canvas");
                canvas.width = img.width * scale;
                canvas.height = img.height * scale;
                const ctx = canvas.getContext("2d");
                ctx.scale(scale, scale);
                ctx.drawImage(img, 0, 0);

                // Clean up the object URL
                URL.revokeObjectURL(svgUrl);
                previewImageLoading.classList.add("hidden");
                previewImage.classList.remove("hidden");
                // Convert canvas to PNG data URL
                return canvas.toDataURL("image/png");
            } catch (error) {
                console.log(error);
                previewImageLoading.classList.add("hidden");
                new FilamentNotification()
                    .title("Error!!")
                    .warning()
                    .body(error.toString())
                    .send();
            }

        }

    </script>
</x-web-layout>
