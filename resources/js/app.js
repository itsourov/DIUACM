import './dark-mode.js';
import 'preline'
import 'spotlight.js';


document.addEventListener('DOMContentLoaded', function () {
const isFacebookBrowser = /FBAN|FBAV/i.test(navigator.userAgent);

if (isFacebookBrowser) {
const messageDiv = document.createElement('div');
messageDiv.style.position = 'fixed';
messageDiv.style.top = '0';
messageDiv.style.left = '0';
messageDiv.style.width = '100%';
messageDiv.style.backgroundColor = '#f8d7da';
messageDiv.style.color = '#721c24';
messageDiv.style.padding = '15px';
messageDiv.style.textAlign = 'center';
messageDiv.style.zIndex = '9999';

messageDiv.innerHTML = `
        <p>Please open this link in a main browser for the best experience.
        You are using Facebook's embedded browser, which does not allow Google login.
        Click the three dots in the top right corner, then select "Open in Chrome" or
        "Open in external browser" to access this website in a secure browser.</p>
    `;

document.body.appendChild(messageDiv);
}
});


