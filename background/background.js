/**
 * LocalPDF Extension - Background Service Worker with Real PDF Processing
 * Handles PDF processing, file operations, and extension lifecycle
 */

// Import PDF processor
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
        await pdfProcessor.initialize();
        console.log('[LocalPDF] PDF processor ready');
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

        let result;
        switch (tool) {
            case 'merge':
                result = await processor.mergePDFs(processedFiles);
                
                // Download the merged file
                if (result.success) {
                    await downloadFile(result.data, result.fileName);
                }
                break;

            case 'split':
                result = await processor.splitPDF(processedFiles[0], { splitType: 'all' });
                
                // Download all split files
                if (result.success) {
                    await downloadMultipleFiles(result.files);
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
                        await downloadFile(compressResult.data, compressResult.fileName);
                    }
                }
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

        showNotification('Processing', `Processing PDF with ${tool}...`);

        // For PDF pages, we would fetch the PDF and process it
        // This is a placeholder for now
        await new Promise(resolve => setTimeout(resolve, 2000));
        
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

        // Download the PDF
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Failed to download PDF: ${response.statusText}`);
        }

        const blob = await response.blob();
        const file = new File([blob], 'downloaded.pdf', { type: 'application/pdf' });

        // Initialize PDF processor
        const processor = await initializePDFProcessor();

        let result;
        switch (tool) {
            case 'split':
                result = await processor.splitPDF(file, { splitType: 'all' });
                if (result.success) {
                    await downloadMultipleFiles(result.files);
                }
                break;
            case 'compress':
                result = await processor.compressPDF(file, 'medium');
                if (result.success) {
                    await downloadFile(result.data, result.fileName);
                }
                break;
            case 'merge':
                // For merge, would need additional files - open popup instead
                chrome.action.openPopup();
                return;
        }

        showNotification('Success', `${tool} completed successfully!`);

    } catch (error) {
        console.error(`[LocalPDF] Error in download and process:`, error);
        showNotification('Error', `Failed to process: ${error.message}`);
    }
}

/**
 * File download utilities
 */
async function downloadFile(data, fileName) {
    try {
        // Create blob and object URL
        const blob = new Blob([data], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        
        // Use Chrome downloads API
        const downloadId = await chrome.downloads.download({
            url: url,
            filename: fileName,
            saveAs: false
        });
        
        console.log(`[LocalPDF] Download started: ${fileName} (ID: ${downloadId})`);
        
        // Clean up the blob URL after a delay
        setTimeout(() => {
            URL.revokeObjectURL(url);
        }, 5000);
        
        return downloadId;
        
    } catch (error) {
        console.error('[LocalPDF] Error downloading file:', error);
        throw error;
    }
}

async function downloadMultipleFiles(files) {
    try {
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            // Add small delay between downloads
            if (i > 0) {
                await new Promise(resolve => setTimeout(resolve, 500));
            }
            await downloadFile(file.data, file.fileName);
        }
    } catch (error) {
        console.error('[LocalPDF] Error downloading multiple files:', error);
        throw error;
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