/// <reference types="chrome" />
chrome.runtime.onInstalled.addListener(() => {
    console.log('LocalPDF Extension installed');

    chrome.contextMenus.create({
        id: 'open-in-localpdf',
        title: 'Open in LocalPDF',
        contexts: ['link'],
        targetUrlPatterns: ['*://*/*.pdf*']
    });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === 'open-in-localpdf' && info.linkUrl) {
        const url = `https://localpdf.online/app#edit?url=${encodeURIComponent(info.linkUrl)}&from=extension`;
        chrome.tabs.create({ url });
    }
});

// Listener for messages from content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'openApp') {
        const url = `https://localpdf.online/app#${request.tool}?from=extension`;
        chrome.tabs.create({ url });
        sendResponse({ success: true });
    }

    if (request.action === 'fetchUrl' && request.url) {
        console.log('LocalPDF: Proxy fetching URL:', request.url);
        fetch(request.url)
            .then(response => response.blob())
            .then(blob => {
                const reader = new FileReader();
                reader.onloadend = () => {
                    sendResponse({ success: true, data: reader.result });
                };
                reader.readAsDataURL(blob);
            })
            .catch(error => {
                console.error('LocalPDF: Fetch failed:', error);
                sendResponse({ success: false, error: error.message });
            });
        return true; // Keep channel open for async response
    }
});
