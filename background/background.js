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
                iconUrl: 'assets/icons/icon48.png',
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

        // Convert base64 files back to proper format for processing
        const processedFiles = await Promise.all(
            files.map(async (file) => {
                const response = await fetch(file.data);
                const blob = await response.blob();
                return new File([blob], file.name, { type: file.type });
            })
        );

        // Execute the appropriate tool
        let result;
        switch (tool) {
            case 'merge':
                result = await executeMergeTool(processedFiles);
                break;
            case 'split':
                result = await executeSplitTool(processedFiles[0]); // Split works on single file
                break;
            case 'compress':
                result = await executeCompressTool(processedFiles);
                break;
            default:
                throw new Error(`Tool ${tool} not implemented yet`);
        }

        sendResponse({ success: true, result });

    } catch (error) {
        console.error(`[LocalPDF] Error executing ${request.tool}:`, error);
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

        // Inject content script if needed
        await chrome.scripting.executeScript({
            target: { tabId },
            files: ['content/pdf-processor.js']
        });

        // Send message to content script
        const result = await chrome.tabs.sendMessage(tabId, {
            action: 'processPDFOnPage',
            tool,
            url
        });

        sendResponse({ success: true, result });

    } catch (error) {
        console.error(`[LocalPDF] Error executing ${tool} on page:`, error);
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

        // Process with the specified tool
        let result;
        switch (tool) {
            case 'merge':
                // For merge, we'd need additional files - could open popup
                chrome.action.openPopup();
                return;
            case 'split':
                result = await executeSplitTool(file);
                break;
            case 'compress':
                result = await executeCompressTool([file]);
                break;
        }

        showNotification('Success', `${tool} completed successfully!`);

    } catch (error) {
        console.error(`[LocalPDF] Error in download and process:`, error);
        showNotification('Error', `Failed to process: ${error.message}`);
    }
}

/**
 * PDF Processing Functions (placeholder implementations)
 * These will be replaced with actual PDF-lib implementations
 */

async function executeMergeTool(files) {
    try {
        console.log(`[LocalPDF] Merging ${files.length} PDFs`);
        
        // TODO: Implement actual PDF merging using pdf-lib
        // For now, just simulate the process
        await simulateProcessing(2000);
        
        // Create a placeholder merged PDF
        const mergedBlob = new Blob([files[0]], { type: 'application/pdf' });
        
        // Download the result
        await downloadFile(mergedBlob, 'merged-document.pdf');
        
        return { message: 'PDFs merged successfully', fileCount: files.length };
        
    } catch (error) {
        console.error('[LocalPDF] Error in merge tool:', error);
        throw error;
    }
}

async function executeSplitTool(file) {
    try {
        console.log(`[LocalPDF] Splitting PDF: ${file.name}`);
        
        // TODO: Implement actual PDF splitting using pdf-lib
        // For now, just simulate the process
        await simulateProcessing(1500);
        
        // Create placeholder split files
        const splitFiles = [
            new Blob([file], { type: 'application/pdf' }),
            new Blob([file], { type: 'application/pdf' })
        ];
        
        // Download split files
        for (let i = 0; i < splitFiles.length; i++) {
            await downloadFile(splitFiles[i], `split-page-${i + 1}.pdf`);
        }
        
        return { message: 'PDF split successfully', pageCount: splitFiles.length };
        
    } catch (error) {
        console.error('[LocalPDF] Error in split tool:', error);
        throw error;
    }
}

async function executeCompressTool(files) {
    try {
        console.log(`[LocalPDF] Compressing ${files.length} PDFs`);
        
        // TODO: Implement actual PDF compression using pdf-lib
        // For now, just simulate the process
        await simulateProcessing(3000);
        
        // Create placeholder compressed files
        for (const file of files) {
            const compressedBlob = new Blob([file], { type: 'application/pdf' });
            const fileName = file.name.replace('.pdf', '-compressed.pdf');
            await downloadFile(compressedBlob, fileName);
        }
        
        return { message: 'PDFs compressed successfully', fileCount: files.length };
        
    } catch (error) {
        console.error('[LocalPDF] Error in compress tool:', error);
        throw error;
    }
}

/**
 * Utility Functions
 */

async function simulateProcessing(duration) {
    return new Promise(resolve => setTimeout(resolve, duration));
}

async function downloadFile(blob, filename) {
    try {
        const url = URL.createObjectURL(blob);
        
        const downloadId = await chrome.downloads.download({
            url: url,
            filename: filename,
            saveAs: false
        });
        
        console.log(`[LocalPDF] Download started: ${filename} (ID: ${downloadId})`);
        
        // Clean up the blob URL after a delay
        setTimeout(() => {
            URL.revokeObjectURL(url);
        }, 1000);
        
        return downloadId;
        
    } catch (error) {
        console.error('[LocalPDF] Error downloading file:', error);
        throw error;
    }
}

function showNotification(title, message) {
    if (chrome.notifications) {
        chrome.notifications.create({
            type: 'basic',
            iconUrl: 'assets/icons/icon48.png',
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