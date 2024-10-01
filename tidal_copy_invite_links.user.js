// ==UserScript==
// @name         Tidal Copy Family Invite Links
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Fetches child invite links from Tidal family page and adds a button to copy the links to the clipboard
// @author       DJDoubleD
// @icon         https://tidal.com/favicon.svg
// @namespace    https://github.com/DJDoubleD/UserScripts
// @homepageURL  https://github.com/DJDoubleD/UserScripts
// @match        https://account.tidal.com/*
// @grant        GM_setClipboard
// @connect      account.tidal.com
// ==/UserScript==

(function () {
    'use strict';

    let lastUrl = location.href;
    let isInitialized = false;

    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    function initializeOrUpdate() {
        if (window.location.pathname.includes('/family')) {
            const mainContent = document.getElementById('main-content');
            if (mainContent && !isInitialized) {
                debouncedFetchChildren();
                isInitialized = true;
            }
        } else {
            isInitialized = false;
        }
    }

    function handleUrlChange() {
        if (lastUrl !== location.href) {
            lastUrl = location.href;
            initializeOrUpdate();
        }
    }

    function observeDOMChanges() {
        const targetNode = document.body;
        const config = { childList: true, subtree: true };
        const callback = function (mutationsList, observer) {
            for (let mutation of mutationsList) {
                if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                    if (document.getElementById('main-content')) {
                        initializeOrUpdate();
                        break;
                    }
                }
            }
        };
        const observer = new MutationObserver(callback);
        observer.observe(targetNode, config);
    }

    function fetchChildren() {
        const mainContent = document.getElementById('main-content');
        if (!mainContent) return;

        const existingButton = mainContent.querySelector('.copy-invite-links-button');
        if (existingButton) return;

        fetch('https://account.tidal.com/api-neo/family/children')
            .then(response => response.json())
            .then(data => {
                // First array (data[0] from outer data arry contains joined children,
                // so only get the second array (data[1]) which contains pending children
                if (data[1] && data[1].length > 0) {
                    createButton(data[1]);
                }
            })
            .catch(error => console.error('Error fetching data:', error));
    }

    const debouncedFetchChildren = debounce(fetchChildren, 300);

    function createButton(children) {
        const mainContent = document.getElementById('main-content');
        const header = mainContent.querySelector('h3.card-header');

        if (header) {
            // Create a container div for centering
            const buttonContainer = document.createElement('div');
            buttonContainer.className = 'text-center';

            const button = document.createElement('a');
            button.innerText = 'Copy Invite Links';
            button.href = '#';
            button.className = 'btn btn-secondary copy-invite-links-button';
            button.style.marginTop = '10px';
            button.style.marginBottom = '20px';

            // Append the button to the container
            buttonContainer.appendChild(button);
            mainContent.insertBefore(buttonContainer, header.nextSibling);

            button.addEventListener('click', (event) => {
                event.preventDefault();
                copyInviteLinks(children);
            });
        }
    }

    function copyInviteLinks(children) {
        const links = children.map(child => `https://account.tidal.com/family/accept-invite/${child.id}`);
        const linksText = links.join('\n');

        GM_setClipboard(linksText);

        showToast('Links copied to clipboard!', links);
    }

    function showToast(message, links) {
        const toast = document.createElement('div');
        toast.style.position = 'fixed';
        toast.style.top = '20px';
        toast.style.left = '50%';
        toast.style.transform = 'translateX(-50%)';
        toast.style.backgroundColor = '#90EE90';
        toast.style.color = '#333';
        toast.style.padding = '15px';
        toast.style.borderRadius = '5px';
        toast.style.zIndex = '1000';
        toast.style.boxShadow = '0 2px 5px rgba(0,0,0,0.2)';
        toast.style.maxWidth = '80%';
        toast.style.wordWrap = 'break-word';

        const messageElement = document.createElement('p');
        messageElement.style.marginBottom = '10px';
        messageElement.style.fontWeight = 'bold';
        messageElement.innerText = message;
        toast.appendChild(messageElement);

        if (links && links.length > 0) {
            const linksList = document.createElement('ul');
            linksList.style.listStyleType = 'none';
            linksList.style.padding = '0';
            linksList.style.margin = '0';
            links.forEach(link => {
                const li = document.createElement('li');
                li.style.marginBottom = '5px';
                li.innerText = link;
                linksList.appendChild(li);
            });
            toast.appendChild(linksList);
        }

        document.body.appendChild(toast);

        setTimeout(() => {
            document.body.removeChild(toast);
        }, 5000);
    }

    // Initialize
    window.addEventListener('load', () => {
        initializeOrUpdate();
        observeDOMChanges();
    });

    // Check for URL changes
    setInterval(handleUrlChange, 500);

})();
