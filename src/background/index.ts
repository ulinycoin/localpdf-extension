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
        const url = request.url;
        console.log('LocalPDF: Proxy fetching URL:', url);

        // Security validation
        const isHttp = url.startsWith('http://') || url.startsWith('https://');
        const isFile = url.startsWith('file://');

        if (!isHttp && !isFile) {
            console.error('LocalPDF: Invalid protocol for fetch:', url);
            sendResponse({ success: false, error: 'Invalid protocol' });
            return;
        }

        const proceedWithFetch = () => {
            fetch(url)
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
        };

        const hasPdfSuffix = url.toLowerCase().split('?')[0].endsWith('.pdf');

        if (hasPdfSuffix || isFile) {
            proceedWithFetch();
        } else {
            // Fallback: Check Content-Type via HEAD request
            fetch(url, { method: 'HEAD' })
                .then(response => {
                    const contentType = response.headers.get('content-type');
                    if (contentType && contentType.includes('application/pdf')) {
                        proceedWithFetch();
                    } else {
                        console.error('LocalPDF: URL does not appear to be a PDF:', url, 'Content-Type:', contentType);
                        sendResponse({ success: false, error: 'Not a PDF document' });
                    }
                })
                .catch(error => {
                    console.error('LocalPDF: HEAD request failed:', error);
                    sendResponse({ success: false, error: 'Could not verify PDF content' });
                });
        }

        return true; // Keep channel open for async response
    }
});
