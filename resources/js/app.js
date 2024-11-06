import './dark-mode.js';
import 'preline'
import 'spotlight.js';

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
