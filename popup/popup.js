/**
 * LocalPDF Extension - Popup Controller
 * Handles user interactions and tool navigation
 */

class LocalPDFPopup {
    constructor() {
        this.currentTool = null;
        this.files = [];
        this.isProcessing = false;
        
        this.initializeUI();
        this.bindEvents();
        this.loadSettings();
    }

    /**
     * Initialize the popup UI and check extension state
     */
    async initializeUI() {
        try {
            // Check if we're on a PDF page
            const [tab] = await chrome.tabs.query({active: true, currentWindow: true});
            if (tab && tab.url && tab.url.toLowerCase().includes('.pdf')) {
                this.showPDFDetected(tab.url);
            }

            // Load extension settings
            const settings = await this.getSettings();
            this.applySettings(settings);

            // Animate UI entrance
            document.querySelector('.container').classList.add('fade-in');
        } catch (error) {
            console.error('[LocalPDF] Error initializing popup:', error);
        }
    }

    /**
     * Bind event listeners to UI elements
     */
    bindEvents() {
        // Tool buttons
        document.querySelectorAll('.tool-button:not([disabled])').forEach(button => {
            button.addEventListener('click', (e) => {
                const tool = button.dataset.tool;
                this.handleToolSelect(tool, button);
            });
        });

        // Settings button
        document.getElementById('settingsBtn').addEventListener('click', () => {
            this.openSettings();
        });

        // File input handling
        const fileInput = document.getElementById('fileInput');
        fileInput.addEventListener('change', (e) => {
            this.handleFileSelect(e.target.files);
        });

        // Drop zone events
        const dropZone = document.getElementById('dropZone');
        dropZone.addEventListener('click', () => {
            fileInput.click();
        });

        // Drag and drop functionality
        this.setupDragDrop();

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            this.handleKeyboardShortcuts(e);
        });
    }

    /**
     * Handle tool selection
     */
    async handleToolSelect(tool, buttonElement) {
        if (this.isProcessing) return;

        try {
            this.currentTool = tool;
            
            // Visual feedback
            this.highlightSelectedTool(buttonElement);
            
            // Show file selection for tools that need files
            if (this.toolNeedsFiles(tool)) {
                this.showFileSelection();
            } else {
                // For tools that work with current page
                await this.executeToolOnCurrentPage(tool);
            }

        } catch (error) {
            console.error(`[LocalPDF] Error selecting tool ${tool}:`, error);
            this.showError(`Failed to select ${tool} tool`);
        }
    }

    /**
     * Show file selection interface
     */
    showFileSelection() {
        const dropZone = document.getElementById('dropZone');
        dropZone.style.display = 'flex';
        dropZone.classList.add('fade-in');
    }

    /**
     * Hide file selection interface
     */
    hideFileSelection() {
        const dropZone = document.getElementById('dropZone');
        dropZone.style.display = 'none';
        dropZone.classList.remove('fade-in');
    }

    /**
     * Handle file selection
     */
    async handleFileSelect(files) {
        if (!files || files.length === 0) return;

        try {
            const pdfFiles = Array.from(files).filter(file => 
                file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')
            );

            if (pdfFiles.length === 0) {
                this.showError('Please select PDF files only');
                return;
            }

            this.files = pdfFiles;
            this.hideFileSelection();
            
            // Execute the selected tool
            await this.executeTool(this.currentTool, this.files);

        } catch (error) {
            console.error('[LocalPDF] Error handling file selection:', error);
            this.showError('Failed to process selected files');
        }
    }

    /**
     * Execute tool with selected files
     */
    async executeTool(tool, files) {
        if (this.isProcessing) return;

        try {
            this.setProcessingState(true, `Processing with ${tool} tool...`);

            // Send message to background script to handle the tool
            const response = await chrome.runtime.sendMessage({
                action: 'executeTool',
                tool: tool,
                files: await this.filesToBase64(files)
            });

            if (response.success) {
                this.showSuccess(`${tool} completed successfully!`);
                
                // Auto-close popup after success (optional)
                setTimeout(() => {
                    window.close();
                }, 2000);
            } else {
                throw new Error(response.error || 'Tool execution failed');
            }

        } catch (error) {
            console.error(`[LocalPDF] Error executing ${tool}:`, error);
            this.showError(`Failed to execute ${tool}: ${error.message}`);
        } finally {
            this.setProcessingState(false);
        }
    }

    /**
     * Execute tool on current page (for PDF pages)
     */
    async executeToolOnCurrentPage(tool) {
        try {
            const [tab] = await chrome.tabs.query({active: true, currentWindow: true});
            
            const response = await chrome.runtime.sendMessage({
                action: 'executeToolOnPage',
                tool: tool,
                tabId: tab.id,
                url: tab.url
            });

            if (response.success) {
                this.showSuccess(`${tool} completed!`);
            } else {
                throw new Error(response.error || 'Tool execution failed');
            }

        } catch (error) {
            console.error(`[LocalPDF] Error executing ${tool} on page:`, error);
            this.showError(`Failed to execute ${tool}`);
        }
    }

    /**
     * Setup drag and drop functionality
     */
    setupDragDrop() {
        const container = document.querySelector('.container');
        const dropZone = document.getElementById('dropZone');

        // Prevent default drag behaviors
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            container.addEventListener(eventName, this.preventDefaults, false);
            document.body.addEventListener(eventName, this.preventDefaults, false);
        });

        // Highlight drop zone when dragging over
        ['dragenter', 'dragover'].forEach(eventName => {
            container.addEventListener(eventName, () => {
                if (this.currentTool && this.toolNeedsFiles(this.currentTool)) {
                    dropZone.style.display = 'flex';
                }
            }, false);
        });

        ['dragleave', 'drop'].forEach(eventName => {
            container.addEventListener(eventName, () => {
                // Only hide if not hovering over drop zone
                setTimeout(() => {
                    if (!dropZone.matches(':hover')) {
                        dropZone.style.display = 'none';
                    }
                }, 100);
            }, false);
        });

        // Handle dropped files
        container.addEventListener('drop', (e) => {
            const files = e.dataTransfer.files;
            if (files.length > 0 && this.currentTool) {
                this.handleFileSelect(files);
            }
        }, false);
    }

    /**
     * Prevent default drag behaviors
     */
    preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    /**
     * Handle keyboard shortcuts
     */
    handleKeyboardShortcuts(e) {
        // Ctrl/Cmd + Number keys for quick tool access
        if ((e.ctrlKey || e.metaKey) && e.key >= '1' && e.key <= '9') {
            e.preventDefault();
            const toolIndex = parseInt(e.key) - 1;
            const toolButtons = document.querySelectorAll('.tool-button:not([disabled])');
            if (toolButtons[toolIndex]) {
                toolButtons[toolIndex].click();
            }
        }

        // Escape to close dialogs
        if (e.key === 'Escape') {
            this.hideFileSelection();
            this.clearSelection();
        }
    }

    /**
     * Utility methods
     */
    toolNeedsFiles(tool) {
        return ['merge', 'split', 'compress', 'addText', 'watermark', 'rotate', 
                'extractPages', 'extractText', 'pdfToImage'].includes(tool);
    }

    highlightSelectedTool(buttonElement) {
        // Remove previous selections
        document.querySelectorAll('.tool-button').forEach(btn => {
            btn.classList.remove('selected');
        });
        
        // Add selection to current button
        buttonElement.classList.add('selected');
    }

    clearSelection() {
        document.querySelectorAll('.tool-button').forEach(btn => {
            btn.classList.remove('selected');
        });
        this.currentTool = null;
    }

    setProcessingState(isProcessing, message = 'Processing...') {
        this.isProcessing = isProcessing;
        const overlay = document.getElementById('processingOverlay');
        
        if (isProcessing) {
            document.querySelector('.processing-text').textContent = message;
            overlay.style.display = 'flex';
        } else {
            overlay.style.display = 'none';
        }
    }

    showError(message) {
        // You could implement a toast notification here
        console.error('[LocalPDF]', message);
        alert(`LocalPDF: ${message}`);
    }

    showSuccess(message) {
        // You could implement a toast notification here
        console.log('[LocalPDF]', message);
        // Could show a subtle success indicator
    }

    showPDFDetected(url) {
        // Could show a special indicator that we detected a PDF
        console.log('[LocalPDF] PDF detected:', url);
    }

    async filesToBase64(files) {
        const results = [];
        
        for (const file of files) {
            const base64 = await new Promise((resolve) => {
                const reader = new FileReader();
                reader.onload = () => resolve(reader.result);
                reader.readAsDataURL(file);
            });
            
            results.push({
                name: file.name,
                size: file.size,
                type: file.type,
                data: base64
            });
        }
        
        return results;
    }

    async getSettings() {
        try {
            const result = await chrome.storage.sync.get(['localPDFSettings']);
            return result.localPDFSettings || {};
        } catch (error) {
            console.error('[LocalPDF] Error loading settings:', error);
            return {};
        }
    }

    applySettings(settings) {
        // Apply any UI settings (theme, etc.)
        if (settings.theme) {
            document.body.classList.add(`theme-${settings.theme}`);
        }
    }

    loadSettings() {
        // Load and apply saved settings
        this.getSettings().then(settings => {
            this.applySettings(settings);
        });
    }

    openSettings() {
        chrome.runtime.openOptionsPage();
    }
}

// Initialize popup when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new LocalPDFPopup();
});

// Add some CSS for selected state
const style = document.createElement('style');
style.textContent = `
    .tool-button.selected {
        border-color: #667eea !important;
        background: #f0f4ff !important;
        box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1) !important;
    }
`;
document.head.appendChild(style);