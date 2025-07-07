/**
 * LocalPDF Extension - Background Service Worker
 * Handles PDF processing, file operations, and extension lifecycle
 */

// Extension lifecycle and setup
chrome.runtime.onInstalled.addListener((details) => {
    console.log('[LocalPDF] Extension installed/updated:', details.reason);
    
    if (details.reason === 'install') {
        setupFirstTimeInstallation();
    } else if (details.reason === 'update') {
        handleExtensionUpdate(details.previousVersion);
    }
});

chrome.runtime.onStartup.addListener(() => {
    console.log('[LocalPDF] Extension startup');
    initializeExtension();
});

/**
 * First time installation setup
 */
async function setupFirstTimeInstallation() {
    try {
        // Set default settings
        await chrome.storage.sync.set({
            localPDFSettings: {
                version: '0.1.0',
                theme: 'light',
                autoClose: true,
                compressionQuality: 'medium',
                notifications: true,
                shortcuts: true
            }
        });

        // Create context menus
        setupContextMenus();

        // Show welcome notification
        if (chrome.notifications) {
            chrome.notifications.create({
                type: 'basic',
                iconUrl: chrome.runtime.getURL('assets/icons/icon48.png'),
                title: 'LocalPDF Extension Installed!',
                message: 'Click the extension icon to start using privacy-focused PDF tools.'
            });
        }

        console.log('[LocalPDF] First time setup completed');
    } catch (error) {
        console.error('[LocalPDF] Error during first time setup:', error);
    }
}

/**
 * Handle extension updates
 */
async function handleExtensionUpdate(previousVersion) {
    try {
        console.log(`[LocalPDF] Updated from ${previousVersion} to 0.1.0`);
        
        // Migration logic can go here
        const settings = await chrome.storage.sync.get(['localPDFSettings']);
        if (settings.localPDFSettings) {
            settings.localPDFSettings.version = '0.1.0';
            await chrome.storage.sync.set(settings);
        }

    } catch (error) {
        console.error('[LocalPDF] Error during update:', error);
    }
}

/**
 * Initialize extension on startup
 */
async function initializeExtension() {
    try {
        setupContextMenus();
        setupMessageHandlers();
        console.log('[LocalPDF] Extension initialized');
    } catch (error) {
        console.error('[LocalPDF] Error initializing extension:', error);
    }
}

/**
 * Setup context menus for PDF files
 */
function setupContextMenus() {
    // Remove existing menus
    chrome.contextMenus.removeAll(() => {
        // Create main LocalPDF menu
        chrome.contextMenus.create({
            id: 'localpdf-main',
            title: 'LocalPDF Tools',
            contexts: ['link', 'page'],
            targetUrlPatterns: ['*://*/*.pdf']
        });

        // Sub-menus for each tool
        chrome.contextMenus.create({
            id: 'localpdf-download-and-merge',
            parentId: 'localpdf-main',
            title: 'Download and Merge with...',
            contexts: ['link']
        });

        chrome.contextMenus.create({
            id: 'localpdf-download-and-split',
            parentId: 'localpdf-main',
            title: 'Download and Split',
            contexts: ['link']
        });

        chrome.contextMenus.create({
            id: 'localpdf-download-and-compress',
            parentId: 'localpdf-main',
            title: 'Download and Compress',
            contexts: ['link']
        });
    });
}

/**
 * Setup message handlers for popup communication
 */
function setupMessageHandlers() {
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        console.log('[LocalPDF] Received message:', request.action);

        switch (request.action) {
            case 'executeTool':
                handleToolExecution(request, sendResponse);
                return true; // Keep channel open for async response

            case 'executeToolOnPage':
                handleToolExecutionOnPage(request, sendResponse);
                return true;

            case 'getSettings':
                handleGetSettings(sendResponse);
                return true;

            case 'saveSettings':
                handleSaveSettings(request.settings, sendResponse);
                return true;

            case 'openPopup':
                // Handle popup open request from content script
                chrome.action.openPopup();
                sendResponse({ success: true });
                return true;

            default:
                console.warn('[LocalPDF] Unknown action:', request.action);
                sendResponse({ success: false, error: 'Unknown action' });
        }
    });
}

/**
 * Handle tool execution with files from popup
 */
async function handleToolExecution(request, sendResponse) {
    try {
        const { tool, files } = request;
        console.log(`[LocalPDF] Executing ${tool} with ${files.length} files`);

        // Show notification that processing is starting
        showNotification('Processing', `Starting ${tool} operation...`);

        // For now, just simulate the process (placeholder)
        let result;
        switch (tool) {
            case 'merge':
                result = await simulateMergeTool(files);
                break;
            case 'split':
                result = await simulateSplitTool(files[0]);
                break;
            case 'compress':
                result = await simulateCompressTool(files);
                break;
            default:
                throw new Error(`Tool ${tool} not implemented yet`);
        }

        showNotification('Success', `${tool} completed successfully!`);
        sendResponse({ success: true, result });

    } catch (error) {
        console.error(`[LocalPDF] Error executing ${request.tool}:`, error);
        showNotification('Error', `Failed to execute ${request.tool}: ${error.message}`);
        sendResponse({ success: false, error: error.message });
    }
}

/**
 * Handle tool execution on current page
 */
async function handleToolExecutionOnPage(request, sendResponse) {
    try {
        const { tool, tabId, url } = request;
        console.log(`[LocalPDF] Executing ${tool} on page:`, url);

        // Show notification
        showNotification('Processing', `Processing PDF with ${tool}...`);

        // Simulate processing
        await simulateProcessing(2000);
        
        showNotification('Success', `${tool} completed!`);
        sendResponse({ success: true, result: { message: `${tool} completed on page` } });

    } catch (error) {
        console.error(`[LocalPDF] Error executing ${tool} on page:`, error);
        showNotification('Error', `Failed to execute ${tool}`);
        sendResponse({ success: false, error: error.message });
    }
}

/**
 * Handle context menu clicks
 */
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
    try {
        console.log('[LocalPDF] Context menu clicked:', info.menuItemId);

        switch (info.menuItemId) {
            case 'localpdf-download-and-merge':
                await handleDownloadAndProcess(info.linkUrl, 'merge');
                break;
            case 'localpdf-download-and-split':
                await handleDownloadAndProcess(info.linkUrl, 'split');
                break;
            case 'localpdf-download-and-compress':
                await handleDownloadAndProcess(info.linkUrl, 'compress');
                break;
        }

    } catch (error) {
        console.error('[LocalPDF] Error handling context menu:', error);
        showNotification('Error', `Failed to process PDF: ${error.message}`);
    }
});

/**
 * Download PDF from URL and process with specified tool
 */
async function handleDownloadAndProcess(url, tool) {
    try {
        showNotification('Processing', `Downloading and processing with ${tool}...`);

        // Simulate download and processing
        await simulateProcessing(3000);

        showNotification('Success', `${tool} completed successfully!`);

    } catch (error) {
        console.error(`[LocalPDF] Error in download and process:`, error);
        showNotification('Error', `Failed to process: ${error.message}`);
    }
}

/**
 * Placeholder PDF Processing Functions
 * These simulate the actual processing until PDF-lib is integrated
 */

async function simulateMergeTool(files) {
    console.log(`[LocalPDF] Simulating merge of ${files.length} PDFs`);
    await simulateProcessing(2000);
    
    // In real implementation, this would create and download the merged file
    console.log('[LocalPDF] Merge simulation completed');
    return { 
        message: 'PDFs merged successfully (simulated)', 
        fileCount: files.length,
        outputFile: 'merged-document.pdf'
    };
}

async function simulateSplitTool(file) {
    console.log(`[LocalPDF] Simulating split of ${file.name}`);
    await simulateProcessing(1500);
    
    console.log('[LocalPDF] Split simulation completed');
    return { 
        message: 'PDF split successfully (simulated)', 
        inputFile: file.name,
        outputFiles: ['split-page-1.pdf', 'split-page-2.pdf', 'split-page-3.pdf']
    };
}

async function simulateCompressTool(files) {
    console.log(`[LocalPDF] Simulating compression of ${files.length} PDFs`);
    await simulateProcessing(3000);
    
    console.log('[LocalPDF] Compression simulation completed');
    return { 
        message: 'PDFs compressed successfully (simulated)', 
        fileCount: files.length,
        compressionRatio: '45%'
    };
}

/**
 * Utility Functions
 */

async function simulateProcessing(duration) {
    return new Promise(resolve => setTimeout(resolve, duration));
}

function showNotification(title, message) {
    if (chrome.notifications) {
        chrome.notifications.create({
            type: 'basic',
            iconUrl: chrome.runtime.getURL('assets/icons/icon48.png') || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCA0OCA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQ4IiBoZWlnaHQ9IjQ4IiByeD0iOCIgZmlsbD0idXJsKCNncmFkMSkiLz4KPGR0ZXh0IHg9IjI0IiB5PSIzMiIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjI0IiBmb250LXdlaWdodD0iYm9sZCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0id2hpdGUiPlA8L3RleHQ+CjxkZWZzPgo8bGluZWFyR3JhZGllbnQgaWQ9ImdyYWQxIiB4MT0iMCUiIHkxPSIwJSIgeDI9IjEwMCUiIHkyPSIxMDAlIj4KPHN0b3Agb2Zmc2V0PSIwJSIgc3R5bGU9InN0b3AtY29sb3I6IzY2N2VlYTtzdG9wLW9wYWNpdHk6MSIgLz4KPHN0b3Agb2Zmc2V0PSIxMDAlIiBzdHlsZT0ic3RvcC1jb2xvcjojNzY0YmEyO3N0b3Atb3BhY2l0eToxIiAvPgo8L2xpbmVhckdyYWRpZW50Pgo8L2RlZnM+Cjwvc3ZnPg==',
            title: `LocalPDF - ${title}`,
            message: message
        });
    }
}

/**
 * Settings handlers
 */
async function handleGetSettings(sendResponse) {
    try {
        const result = await chrome.storage.sync.get(['localPDFSettings']);
        sendResponse({ success: true, settings: result.localPDFSettings || {} });
    } catch (error) {
        console.error('[LocalPDF] Error getting settings:', error);
        sendResponse({ success: false, error: error.message });
    }
}

async function handleSaveSettings(settings, sendResponse) {
    try {
        await chrome.storage.sync.set({ localPDFSettings: settings });
        sendResponse({ success: true });
    } catch (error) {
        console.error('[LocalPDF] Error saving settings:', error);
        sendResponse({ success: false, error: error.message });
    }
}

// Initialize extension when script loads
initializeExtension();