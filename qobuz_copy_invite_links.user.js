// ==UserScript==
// @name         Qobuz Copy Invite Links
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Copy the Invite links from the Household page
// @author       tmxkwpn
// @icon         https://www.google.com/s2/favicons?sz=64&domain=qobuz.com
// @namespace    https://github.com/DJDoubleD/UserScripts
// @homepageURL  https://github.com/DJDoubleD/UserScripts
// @match        https://www.qobuz.com/profile/household/
// @grant        GM_setClipboard
// ==/UserScript==

(function() {
    'use strict';

    // Create a button
    const button = document.createElement('button');
    button.innerHTML = 'Copy Qobuz Links';
    button.style.position = 'fixed';
    button.style.top = '10px';
    button.style.left = '10px';
    button.style.zIndex = 1000;
    button.style.padding = '10px 20px';
    button.style.backgroundColor = 'red';
    button.style.color = 'white';
    button.style.border = 'none';
    button.style.borderRadius = '5px';
    button.style.cursor = 'pointer';
    button.style.fontSize = '16px';

    // Append the button to the body
    document.body.appendChild(button);

    // Function to find and copy links
    function copyLinks() {
        const baseUrlOld = 'https://www.qobuz.com/profile/household/resend/';
        const baseUrlNew = 'https://www.qobuz.com/subscription/address/household/validation/';
        const pattern = new RegExp(`${baseUrlOld}[a-zA-Z0-9]+`, 'g');

        // Find all links
        const links = Array.from(document.querySelectorAll('a'))
                            .map(link => link.href)
                            .filter(href => pattern.test(href))
                            .map(href => href.replace(baseUrlOld, baseUrlNew));

        if (links.length > 0) {
            GM_setClipboard(links.join('\n'), 'text');
            alert(`${links.length} link(s) copied to clipboard with replacements!`);
        } else {
            alert('No Qobuz resend links found.');
        }
    }

    // Add event listener to the button
    button.addEventListener('click', copyLinks);
})();
