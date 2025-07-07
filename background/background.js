/**
 * LocalPDF Extension - Background Service Worker (Manifest V3 Compatible)
 * Handles PDF processing, file operations, and extension lifecycle
 */

// Import PDF processor (local file)
importScripts('lib/pdf-processor.js');

// Global PDF processor instance
let pdfProcessor = null;

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
 * Initialize PDF processor
 */
async function initializePDFProcessor() {
    if (!pdfProcessor) {
        pdfProcessor = new LocalPDFProcessor();
        console.log('[LocalPDF] PDF processor ready (demo mode)');
    }
    return pdfProcessor;
}

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
        showNotification('Welcome', 'LocalPDF extension installed! Click the icon to start processing PDFs.');

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
        await initializePDFProcessor();
        console.log('[LocalPDF] Extension initialized');
    } catch (error) {
        console.error('[LocalPDF] Error initializing extension:', error);
    }
}

/**
 * Setup context menus for PDF files
 */
function setupContextMenus() {
    chrome.contextMenus.removeAll(() => {
        chrome.contextMenus.create({
            id: 'localpdf-main',
            title: 'LocalPDF Tools',
            contexts: ['link', 'page'],
            targetUrlPatterns: ['*://*/*.pdf']
        });

        chrome.contextMenus.create({
            id: 'localpdf-download-and-merge',
            parentId: 'localpdf-main',
            title: 'Download and Process',
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
                try {
                    chrome.action.openPopup();
                } catch (error) {
                    console.log('[LocalPDF] Cannot open popup programmatically');
                }
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

        // Initialize PDF processor
        const processor = await initializePDFProcessor();

        // Convert base64 files back to File objects
        const processedFiles = await Promise.all(
            files.map(async (fileData) => {
                try {
                    const response = await fetch(fileData.data);
                    const blob = await response.blob();
                    return new File([blob], fileData.name, { type: fileData.type });
                } catch (error) {
                    console.error('[LocalPDF] Error converting file:', error);
                    throw new Error(`Failed to process file: ${fileData.name}`);
                }
            })
        );

        // Validate PDF files
        for (const file of processedFiles) {
            try {
                await processor.validatePDF(file);
            } catch (error) {
                throw new Error(`Invalid PDF file: ${file.name} - ${error.message}`);
            }
        }

        let result;
        switch (tool) {
            case 'merge':
                result = await processor.mergePDFs(processedFiles);
                
                // Download the merged file
                if (result.success) {
                    await processor.downloadPDF(result.data, result.fileName);
                }
                break;

            case 'split':
                result = await processor.splitPDF(processedFiles[0]);
                
                // Download all split files
                if (result.success) {
                    await processor.downloadMultiplePDFs(result.files);
                }
                break;

            case 'compress':
                // Get compression quality from settings
                const settings = await chrome.storage.sync.get(['localPDFSettings']);
                const quality = settings.localPDFSettings?.compressionQuality || 'medium';
                
                result = { success: true, files: [] };
                
                // Compress each file individually
                for (const file of processedFiles) {
                    const compressResult = await processor.compressPDF(file, quality);
                    if (compressResult.success) {
                        result.files.push(compressResult);
                        await processor.downloadPDF(compressResult.data, compressResult.fileName);
                    }
                }
                break;

            default:
                throw new Error(`Tool ${tool} not implemented yet`);
        }

        // Show success notification with note about demo mode
        const message = result.note ? 
            `${tool} completed! (Demo mode - see console for details)` : 
            `${tool} completed successfully!`;
        
        showNotification('Success', message);
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

        showNotification('Processing', `Processing PDF with ${tool}...`);

        // Simulate processing for PDF pages
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        showNotification('Success', `${tool} completed! (Demo mode)`);
        sendResponse({ success: true, result: { message: `${tool} completed on page (demo)` } });

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
                await handleDownloadAndProcess(info.linkUrl, 'compress');
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

        // Download the PDF
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Failed to download PDF: ${response.statusText}`);
        }

        const blob = await response.blob();
        const file = new File([blob], 'downloaded.pdf', { type: 'application/pdf' });

        // Initialize PDF processor
        const processor = await initializePDFProcessor();

        // Validate the downloaded PDF
        await processor.validatePDF(file);

        let result;
        switch (tool) {
            case 'compress':
                result = await processor.compressPDF(file, 'medium');
                if (result.success) {
                    await processor.downloadPDF(result.data, result.fileName);
                }
                break;
            default:
                // Open popup for other tools
                chrome.action.openPopup();
                return;
        }

        showNotification('Success', `${tool} completed! (Demo mode)`);

    } catch (error) {
        console.error(`[LocalPDF] Error in download and process:`, error);
        showNotification('Error', `Failed to process: ${error.message}`);
    }
}

/**
 * Utility Functions
 */
function showNotification(title, message) {
    try {
        if (chrome.notifications) {
            chrome.notifications.create({
                type: 'basic',
                title: `LocalPDF - ${title}`,
                message: message
            });
        }
    } catch (error) {
        console.log('[LocalPDF] Notification error:', error);
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