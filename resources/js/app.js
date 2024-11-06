import './dark-mode.js';
import 'preline'
import 'spotlight.js';

document.addEventListener('DOMContentLoaded', function () {
    const isFacebookBrowser = /FBAN|FBAV/i.test(navigator.userAgent);
    if (isFacebookBrowser) {
        window.location.href = "googlechrome://" + window.location.href;
    }
});
