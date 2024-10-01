// ==UserScript==
// @name         Copy Qobuz Invite Links
// @namespace    http://tampermonkey.net/
// @version      0.2
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

    // Function to create and style the button
    function createButton() {
        const button = document.createElement('button');
        button.innerHTML = 'Copy Qobuz Invite Links';
        button.style.position = 'absolute';
        button.style.padding = '10px 20px';
        button.style.backgroundColor = 'black';
        button.style.color = 'white';
        button.style.border = 'none';
        button.style.borderRadius = '5px';
        button.style.cursor = 'pointer';
        button.style.fontSize = '16px';

        // Add event listener to copy links when button is clicked
        button.addEventListener('click', copyLinks);

        // Find the h1 element and append the button to it
        const h1 = document.querySelector('h1.account-content__title');
        if (h1) {
            h1.style.position = 'relative';
            h1.appendChild(button);

            // Center the button inside the h1
            button.style.left = '50%';
            button.style.top = '50%';
            button.style.transform = 'translate(-50%, -50%)';
        } else {
            alert('No title element found to append the button.');
        }
    }

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

    // Wait for the DOM to load before creating the button
    window.addEventListener('load', createButton);
})();
