/**
 * LocalPDF Extension - Content Script
 * Detects PDFs on web pages and provides quick access to tools
 */

class LocalPDFContentScript {
    constructor() {
        this.isInitialized = false;
        this.pdfElements = new Map();
        this.observer = null;
        
        this.init();
    }

    /**
     * Initialize content script
     */
    init() {
        if (this.isInitialized) return;
        
        try {
            console.log('[LocalPDF Content] Initializing on:', window.location.href);
            
            // Check if we're on a PDF page
            if (this.isPDFPage()) {
                this.setupPDFPageTools();
            } else {
                // Scan for PDF links on regular pages
                this.scanForPDFLinks();
                this.setupLinkObserver();
            }
            
            // Setup message listener
            this.setupMessageListener();
            
            this.isInitialized = true;
            console.log('[LocalPDF Content] Content script initialized');
            
        } catch (error) {
            console.error('[LocalPDF Content] Error initializing:', error);
        }
    }

    /**
     * Check if current page is a PDF
     */
    isPDFPage() {
        return (
            document.contentType === 'application/pdf' ||
            window.location.pathname.toLowerCase().endsWith('.pdf') ||
            document.querySelector('embed[type="application/pdf"]') !== null ||
            document.querySelector('object[type="application/pdf"]') !== null ||
            document.title.toLowerCase().includes('.pdf')
        );
    }

    /**
     * Setup tools for PDF pages
     */
    setupPDFPageTools() {
        try {
            console.log('[LocalPDF Content] PDF page detected, adding tools');
            
            // Create floating action button for PDF pages
            this.createFloatingButton();
            
            // Add keyboard shortcuts
            this.setupPDFKeyboardShortcuts();
            
        } catch (error) {
            console.error('[LocalPDF Content] Error setting up PDF page tools:', error);
        }
    }

    /**
     * Create floating action button for PDF pages
     */
    createFloatingButton() {
        // Remove existing button if any
        const existingButton = document.getElementById('localpdf-floating-btn');
        if (existingButton) {
            existingButton.remove();
        }

        // Create floating button
        const floatingBtn = document.createElement('div');
        floatingBtn.id = 'localpdf-floating-btn';
        floatingBtn.innerHTML = `
            <div class="localpdf-fab">
                <img src="${chrome.runtime.getURL('assets/icons/icon48.png')}" alt="LocalPDF">
                <span class="localpdf-tooltip">LocalPDF Tools</span>
            </div>
        `;

        // Add styles
        const style = document.createElement('style');
        style.textContent = `
            #localpdf-floating-btn {
                position: fixed;
                bottom: 20px;
                right: 20px;
                z-index: 10000;
                cursor: pointer;
            }
            
            .localpdf-fab {
                width: 56px;
                height: 56px;
                border-radius: 50%;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.3s ease;
                position: relative;
            }
            
            .localpdf-fab:hover {
                transform: translateY(-2px);
                box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
            }
            
            .localpdf-fab img {
                width: 32px;
                height: 32px;
                filter: brightness(0) invert(1);
            }
            
            .localpdf-tooltip {
                position: absolute;
                right: 60px;
                top: 50%;
                transform: translateY(-50%);
                background: rgba(0, 0, 0, 0.8);
                color: white;
                padding: 8px 12px;
                border-radius: 4px;
                font-size: 12px;
                white-space: nowrap;
                opacity: 0;
                pointer-events: none;
                transition: opacity 0.3s ease;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            }
            
            .localpdf-fab:hover .localpdf-tooltip {
                opacity: 1;
            }
        `;

        // Add to page
        document.head.appendChild(style);
        document.body.appendChild(floatingBtn);

        // Add click handler
        floatingBtn.addEventListener('click', () => {
            this.openExtensionPopup();
        });
    }

    /**
     * Scan for PDF links on the page
     */
    scanForPDFLinks() {
        try {
            // Find all links to PDF files
            const pdfLinks = document.querySelectorAll('a[href*=".pdf"], a[href*=".PDF"]');
            
            pdfLinks.forEach(link => {
                if (!this.pdfElements.has(link)) {
                    this.enhancePDFLink(link);
                    this.pdfElements.set(link, true);
                }
            });

            console.log(`[LocalPDF Content] Found ${pdfLinks.length} PDF links`);
            
        } catch (error) {
            console.error('[LocalPDF Content] Error scanning for PDF links:', error);
        }
    }

    /**
     * Enhance PDF links with LocalPDF tools
     */
    enhancePDFLink(link) {
        try {
            // Add LocalPDF indicator
            const indicator = document.createElement('span');
            indicator.className = 'localpdf-link-indicator';
            indicator.innerHTML = '📄';
            indicator.title = 'PDF - Right-click for LocalPDF tools';
            
            // Style the indicator
            const style = `
                margin-left: 4px;
                font-size: 12px;
                opacity: 0.7;
                cursor: pointer;
            `;
            indicator.setAttribute('style', style);
            
            // Add to link
            link.appendChild(indicator);
            
            // Add right-click context menu enhancement
            link.addEventListener('contextmenu', (e) => {
                // The context menu is handled by background script
                console.log('[LocalPDF Content] Context menu on PDF link:', link.href);
            });
            
            // Add click handler for quick access
            indicator.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.showPDFLinkMenu(link, e);
            });
            
        } catch (error) {
            console.error('[LocalPDF Content] Error enhancing PDF link:', error);
        }
    }

    /**
     * Show quick menu for PDF links
     */
    showPDFLinkMenu(link, event) {
        try {
            // Remove existing menu
            const existingMenu = document.getElementById('localpdf-quick-menu');
            if (existingMenu) {
                existingMenu.remove();
            }

            // Create quick menu
            const menu = document.createElement('div');
            menu.id = 'localpdf-quick-menu';
            menu.innerHTML = `
                <div class="localpdf-menu-item" data-action="download-and-split">
                    ✂️ Download & Split
                </div>
                <div class="localpdf-menu-item" data-action="download-and-compress">
                    🗜️ Download & Compress
                </div>
                <div class="localpdf-menu-item" data-action="download-and-merge">
                    🔗 Download & Merge
                </div>
            `;

            // Position menu
            const rect = event.target.getBoundingClientRect();
            menu.style.cssText = `
                position: fixed;
                top: ${rect.bottom + 5}px;
                left: ${rect.left}px;
                background: white;
                border: 1px solid #ccc;
                border-radius: 4px;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                z-index: 10000;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            `;

            // Style menu items
            const itemStyle = `
                padding: 8px 12px;
                cursor: pointer;
                font-size: 12px;
                border-bottom: 1px solid #eee;
                transition: background 0.2s ease;
            `;

            menu.querySelectorAll('.localpdf-menu-item').forEach(item => {
                item.setAttribute('style', itemStyle);
                
                item.addEventListener('mouseenter', () => {
                    item.style.background = '#f5f5f5';
                });
                
                item.addEventListener('mouseleave', () => {
                    item.style.background = 'white';
                });
                
                item.addEventListener('click', () => {
                    const action = item.dataset.action;
                    this.executePDFAction(action, link.href);
                    menu.remove();
                });
            });

            document.body.appendChild(menu);

            // Remove menu when clicking outside
            setTimeout(() => {
                document.addEventListener('click', function removeMenu() {
                    menu.remove();
                    document.removeEventListener('click', removeMenu);
                });
            }, 10);
            
        } catch (error) {
            console.error('[LocalPDF Content] Error showing PDF link menu:', error);
        }
    }

    /**
     * Setup observer for dynamically added content
     */
    setupLinkObserver() {
        try {
            this.observer = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                    mutation.addedNodes.forEach((node) => {
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            // Check for PDF links in added content
                            const pdfLinks = node.querySelectorAll ? 
                                node.querySelectorAll('a[href*=".pdf"], a[href*=".PDF"]') : [];
                            
                            pdfLinks.forEach(link => {
                                if (!this.pdfElements.has(link)) {
                                    this.enhancePDFLink(link);
                                    this.pdfElements.set(link, true);
                                }
                            });
                        }
                    });
                });
            });

            this.observer.observe(document.body, {
                childList: true,
                subtree: true
            });
            
        } catch (error) {
            console.error('[LocalPDF Content] Error setting up observer:', error);
        }
    }

    /**
     * Setup keyboard shortcuts for PDF pages
     */
    setupPDFKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + Shift + L for LocalPDF tools
            if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'L') {
                e.preventDefault();
                this.openExtensionPopup();
            }
        });
    }

    /**
     * Setup message listener for background communication
     */
    setupMessageListener() {
        chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
            try {
                switch (request.action) {
                    case 'processPDFOnPage':
                        this.processPDFOnPage(request, sendResponse);
                        return true;
                    
                    case 'getPDFInfo':
                        this.getPDFInfo(sendResponse);
                        return true;
                    
                    default:
                        console.warn('[LocalPDF Content] Unknown action:', request.action);
                }
            } catch (error) {
                console.error('[LocalPDF Content] Error handling message:', error);
                sendResponse({ success: false, error: error.message });
            }
        });
    }

    /**
     * Process PDF on current page
     */
    async processPDFOnPage(request, sendResponse) {
        try {
            const { tool, url } = request;
            console.log(`[LocalPDF Content] Processing PDF with ${tool}:`, url);

            if (!this.isPDFPage()) {
                throw new Error('Not a PDF page');
            }

            // For PDF pages, we can try to get the PDF data
            const pdfData = await this.getPDFData();
            
            // Send back to background for processing
            sendResponse({ 
                success: true, 
                data: pdfData,
                url: url
            });
            
        } catch (error) {
            console.error('[LocalPDF Content] Error processing PDF on page:', error);
            sendResponse({ success: false, error: error.message });
        }
    }

    /**
     * Get PDF data from current page
     */
    async getPDFData() {
        try {
            // Try to get PDF from embed/object elements
            const embed = document.querySelector('embed[type="application/pdf"]');
            const object = document.querySelector('object[type="application/pdf"]');
            
            if (embed && embed.src) {
                return await this.fetchPDFData(embed.src);
            } else if (object && object.data) {
                return await this.fetchPDFData(object.data);
            } else {
                // Try to fetch from current URL
                return await this.fetchPDFData(window.location.href);
            }
            
        } catch (error) {
            console.error('[LocalPDF Content] Error getting PDF data:', error);
            throw error;
        }
    }

    /**
     * Fetch PDF data from URL
     */
    async fetchPDFData(url) {
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`Failed to fetch PDF: ${response.statusText}`);
            }
            
            const arrayBuffer = await response.arrayBuffer();
            return new Uint8Array(arrayBuffer);
            
        } catch (error) {
            console.error('[LocalPDF Content] Error fetching PDF data:', error);
            throw error;
        }
    }

    /**
     * Get PDF info for background
     */
    getPDFInfo(sendResponse) {
        try {
            const info = {
                isPDFPage: this.isPDFPage(),
                url: window.location.href,
                title: document.title,
                pdfLinks: this.pdfElements.size
            };
            
            sendResponse({ success: true, info });
            
        } catch (error) {
            console.error('[LocalPDF Content] Error getting PDF info:', error);
            sendResponse({ success: false, error: error.message });
        }
    }

    /**
     * Execute PDF action from quick menu
     */
    executePDFAction(action, url) {
        try {
            console.log(`[LocalPDF Content] Executing ${action} on:`, url);
            
            // Send message to background to handle the action
            chrome.runtime.sendMessage({
                action: 'executeFromContent',
                tool: action,
                url: url
            });
            
        } catch (error) {
            console.error('[LocalPDF Content] Error executing PDF action:', error);
        }
    }

    /**
     * Open extension popup (if possible)
     */
    openExtensionPopup() {
        try {
            // Send message to background to open popup
            chrome.runtime.sendMessage({
                action: 'openPopup'
            });
            
        } catch (error) {
            console.error('[LocalPDF Content] Error opening popup:', error);
        }
    }

    /**
     * Cleanup when script is destroyed
     */
    destroy() {
        try {
            if (this.observer) {
                this.observer.disconnect();
            }
            
            // Remove floating button
            const floatingBtn = document.getElementById('localpdf-floating-btn');
            if (floatingBtn) {
                floatingBtn.remove();
            }
            
            // Remove quick menu
            const quickMenu = document.getElementById('localpdf-quick-menu');
            if (quickMenu) {
                quickMenu.remove();
            }
            
            console.log('[LocalPDF Content] Content script cleaned up');
            
        } catch (error) {
            console.error('[LocalPDF Content] Error during cleanup:', error);
        }
    }
}

// Initialize content script
let localPDFContent = null;

// Wait for DOM to be ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        localPDFContent = new LocalPDFContentScript();
    });
} else {
    localPDFContent = new LocalPDFContentScript();
}

// Cleanup on unload
window.addEventListener('beforeunload', () => {
    if (localPDFContent) {
        localPDFContent.destroy();
    }
});