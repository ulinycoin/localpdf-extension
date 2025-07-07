/**
 * LocalPDF Extension - Background Service Worker (Manifest V3 Compatible)
 * Handles PDF processing, file operations, and extension lifecycle
 */

// PDF Processor class defined inline to avoid importScripts issues
class LocalPDFProcessor {
    constructor() {
        this.isInitialized = true; // No external loading needed
    }

    /**
     * Simple PDF merger using basic concatenation
     */
    async mergePDFs(files) {
        try {
            console.log(`[LocalPDF] Starting merge of ${files.length} PDFs`);
            
            if (files.length === 0) {
                throw new Error('No files provided for merging');
            }

            if (files.length === 1) {
                const arrayBuffer = await this.fileToArrayBuffer(files[0]);
                return {
                    success: true,
                    data: new Uint8Array(arrayBuffer),
                    fileName: 'merged-document.pdf',
                    fileCount: 1,
                    message: 'Single file processed (no merging needed)'
                };
            }

            // For multiple files, use the largest file as demo result
            let largestFile = files[0];
            let largestSize = 0;
            
            for (const file of files) {
                if (file.size > largestSize) {
                    largestSize = file.size;
                    largestFile = file;
                }
            }
            
            const arrayBuffer = await this.fileToArrayBuffer(largestFile);
            
            console.log('[LocalPDF] Demo merge completed (using largest file)');
            
            return {
                success: true,
                data: new Uint8Array(arrayBuffer),
                fileName: 'merged-document.pdf',
                fileCount: files.length,
                message: `Demo: Processed ${files.length} files (largest file used as result)`
            };
            
        } catch (error) {
            console.error('[LocalPDF] Error merging PDFs:', error);
            throw new Error(`Merge failed: ${error.message}`);
        }
    }

    /**
     * Simple PDF splitter - creates demo copies
     */
    async splitPDF(file, options = {}) {
        try {
            console.log(`[LocalPDF] Starting split of ${file.name}`);
            
            const arrayBuffer = await this.fileToArrayBuffer(file);
            const pdfData = new Uint8Array(arrayBuffer);
            
            // Create 3 demo "split" files
            const splitResults = [];
            const demoPageCount = 3;
            
            for (let i = 1; i <= demoPageCount; i++) {
                splitResults.push({
                    data: pdfData,
                    fileName: `${this.getBaseName(file.name)}-page-${i}.pdf`,
                    pageNumber: i
                });
            }
            
            console.log(`[LocalPDF] Demo split completed: ${splitResults.length} files created`);
            
            return {
                success: true,
                files: splitResults,
                originalFile: file.name,
                message: `Demo: Created ${splitResults.length} files (copies of original)`
            };
            
        } catch (error) {
            console.error('[LocalPDF] Error splitting PDF:', error);
            throw new Error(`Split failed: ${error.message}`);
        }
    }

    /**
     * Simple PDF compression - demo version
     */
    async compressPDF(file, quality = 'medium') {
        try {
            console.log(`[LocalPDF] Starting compression of ${file.name} (quality: ${quality})`);
            
            const arrayBuffer = await this.fileToArrayBuffer(file);
            const originalData = new Uint8Array(arrayBuffer);
            
            const originalSize = arrayBuffer.byteLength;
            const simulatedReduction = quality === 'high' ? 10 : quality === 'medium' ? 25 : 40;
            const simulatedSize = Math.floor(originalSize * (100 - simulatedReduction) / 100);
            
            console.log(`[LocalPDF] Demo compression completed: ${simulatedReduction}% reduction simulated`);
            
            return {
                success: true,
                data: originalData,
                fileName: `${this.getBaseName(file.name)}-compressed.pdf`,
                originalSize: originalSize,
                compressedSize: simulatedSize,
                compressionRatio: simulatedReduction,
                message: `Demo: Simulated ${quality} compression (${simulatedReduction}% reduction)`
            };
            
        } catch (error) {
            console.error('[LocalPDF] Error compressing PDF:', error);
            throw new Error(`Compression failed: ${error.message}`);
        }
    }

    /**
     * Utility functions
     */
    async fileToArrayBuffer(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = () => reject(new Error('Failed to read file'));
            reader.readAsArrayBuffer(file);
        });
    }
    
    getBaseName(fileName) {
        return fileName.replace(/\.[^/.]+$/, '');
    }
    
    /**
     * Validate PDF file
     */
    async validatePDF(file) {
        try {
            const arrayBuffer = await this.fileToArrayBuffer(file);
            const bytes = new Uint8Array(arrayBuffer);
            
            // Check PDF header
            const pdfHeader = '%PDF-';
            const header = String.fromCharCode(...bytes.slice(0, 5));
            
            if (header !== pdfHeader) {
                throw new Error('File is not a valid PDF');
            }
            
            return true;
        } catch (error) {
            throw new Error(`PDF validation failed: ${error.message}`);
        }
    }
    
    /**
     * Download processed PDF using Chrome downloads API
     */
    async downloadPDF(pdfBytes, fileName) {
        try {
            const blob = new Blob([pdfBytes], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);
            
            const downloadId = await chrome.downloads.download({
                url: url,
                filename: fileName,
                saveAs: false
            });
            
            // Clean up the blob URL after a delay
            setTimeout(() => {
                URL.revokeObjectURL(url);
            }, 5000);
            
            return downloadId;
            
        } catch (error) {
            console.error('[LocalPDF] Error downloading PDF:', error);
            throw error;
        }
    }
    
    /**
     * Batch download multiple files
     */
    async downloadMultiplePDFs(files) {
        const downloadPromises = files.map((file, index) => {
            return new Promise((resolve) => {
                setTimeout(async () => {
                    try {
                        await this.downloadPDF(file.data, file.fileName);
                        resolve();
                    } catch (error) {
                        console.error(`[LocalPDF] Error downloading ${file.fileName}:`, error);
                        resolve();
                    }
                }, index * 200);
            });
        });
        
        await Promise.all(downloadPromises);
    }
}

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

        setupContextMenus();
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
            id: 'localpdf-download-and-process',
            parentId: 'localpdf-main',
            title: 'Download and Process',
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
                return true;

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

        showNotification('Processing', `Starting ${tool} operation...`);

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
                if (result.success) {
                    await processor.downloadPDF(result.data, result.fileName);
                }
                break;

            case 'split':
                result = await processor.splitPDF(processedFiles[0]);
                if (result.success) {
                    await processor.downloadMultiplePDFs(result.files);
                }
                break;

            case 'compress':
                const settings = await chrome.storage.sync.get(['localPDFSettings']);
                const quality = settings.localPDFSettings?.compressionQuality || 'medium';
                
                result = { success: true, files: [] };
                
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

        showNotification('Success', `${tool} completed! (Demo mode)`);
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

        if (info.menuItemId === 'localpdf-download-and-process') {
            await handleDownloadAndProcess(info.linkUrl, 'compress');
        }

    } catch (error) {
        console.error('[LocalPDF] Error handling context menu:', error);
        showNotification('Error', `Failed to process PDF: ${error.message}`);
    }
});

/**
 * Download PDF from URL and process
 */
async function handleDownloadAndProcess(url, tool) {
    try {
        showNotification('Processing', `Downloading and processing with ${tool}...`);

        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Failed to download PDF: ${response.statusText}`);
        }

        const blob = await response.blob();
        const file = new File([blob], 'downloaded.pdf', { type: 'application/pdf' });

        const processor = await initializePDFProcessor();
        await processor.validatePDF(file);

        const result = await processor.compressPDF(file, 'medium');
        if (result.success) {
            await processor.downloadPDF(result.data, result.fileName);
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