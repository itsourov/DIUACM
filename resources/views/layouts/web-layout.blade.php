<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">

    <meta name="application-name" content="{{ config('app.name') }}">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <meta name="viewport" content="width=device-width, initial-scale=1">

    <script data-cfasync="false">
        if (localStorage.getItem('color-theme') === 'dark' || (!('color-theme' in localStorage) && window.matchMedia(
            '(prefers-color-scheme: dark)').matches)) {
            document.documentElement.classList.add('dark');

        } else {
            document.documentElement.classList.remove('dark')

        }
    </script>
    <script src="https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js" defer></script>
    <script>
        window.OneSignalDeferred = window.OneSignalDeferred || [];
        OneSignalDeferred.push(async function(OneSignal) {
            await OneSignal.init({
                appId: "ade55d02-a1e5-4cd0-a9d0-b64e4f448aa6",
                safari_web_id: "web.onesignal.auto.5b1b15a7-d107-41ff-b02e-c379c8847bd2",
                notifyButton: {
                    enable: true,
                },
            });
        });
    </script>

    <script type='text/javascript' src='https://platform-api.sharethis.com/js/sharethis.js#property=66ee4da2d219590019f5eaa6&product=sop' async='async'></script>


    @hasSection('seo')
        @yield('seo')
    @else
        {!! seo() !!}
    @endif

    <style>
        [x-cloak] {
            display: none !important;
        }
    </style>

    @filamentStyles
    @vite('resources/css/app.css')

    <!-- Google tag (gtag.js) -->
    <script async src="https://www.googletagmanager.com/gtag/js?id=G-CSW7LT4FFP"></script>
    <script>
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());

        gtag('config', 'G-CSW7LT4FFP');
    </script>
</head>

<body class="bg-gray-50 text-gray-900 dark:text-gray-100 dark:bg-gray-950 antialiased flex flex-col min-h-screen">

@include('inc.navbar')
{{ $slot }}
@include('inc.footer')

@livewire('notifications')

@filamentScripts
@vite('resources/js/app.js')
</body>
</html>
