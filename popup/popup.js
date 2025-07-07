/**
 * LocalPDF Smart Launcher - Popup Script
 * Handles user interactions and tool launching
 */

class SmartLauncherPopup {
  constructor() {
    this.fileInput = null;
    this.initialize();
  }

  initialize() {
    console.log('[LocalPDF Smart Launcher] Popup initialized');
    
    // Get DOM elements
    this.fileInput = document.getElementById('file-input');
    
    // Set up event listeners
    this.setupEventListeners();
    
    // Show current status
    this.updateStatus();
  }

  /**
   * Set up all event listeners
   */
  setupEventListeners() {
    // Tool buttons
    document.querySelectorAll('.tool-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const tool = btn.dataset.tool;
        this.handleToolClick(tool);
      });
    });

    // More tools toggle
    const showMoreBtn = document.getElementById('show-more');
    const moreTools = document.getElementById('more-tools');
    
    if (showMoreBtn && moreTools) {
      showMoreBtn.addEventListener('click', () => {
        const isVisible = moreTools.style.display !== 'none';
        
        if (isVisible) {
          moreTools.style.display = 'none';
          showMoreBtn.classList.remove('expanded');
        } else {
          moreTools.style.display = 'block';
          showMoreBtn.classList.add('expanded');
        }
      });
    }

    // Primary actions
    const openLocalPDFBtn = document.getElementById('open-localpdf');
    if (openLocalPDFBtn) {
      openLocalPDFBtn.addEventListener('click', () => {
        this.openLocalPDF();
      });
    }

    const uploadFilesBtn = document.getElementById('upload-files');
    if (uploadFilesBtn) {
      uploadFilesBtn.addEventListener('click', () => {
        this.triggerFileUpload();
      });
    }

    // File input
    if (this.fileInput) {
      this.fileInput.addEventListener('change', (e) => {
        this.handleFileSelection(e.target.files);
      });
    }

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      this.handleKeyboardShortcuts(e);
    });
  }

  /**
   * Handle tool button clicks
   */
  async handleToolClick(tool) {
    try {
      console.log(`[LocalPDF Smart Launcher] Tool clicked: ${tool}`);
      
      // Add loading state
      this.setLoadingState(true);
      
      // Open LocalPDF.online with pre-selected tool
      const response = await chrome.runtime.sendMessage({
        action: 'openTool',
        tool: tool
      });
      
      if (response && response.success) {
        console.log(`[LocalPDF Smart Launcher] Opened ${tool} tool successfully`);
        // Close popup after successful launch
        window.close();
      } else {
        throw new Error('Failed to open tool');
      }
      
    } catch (error) {
      console.error('[LocalPDF Smart Launcher] Tool click failed:', error);
      this.showError('Failed to open tool. Please try again.');
    } finally {
      this.setLoadingState(false);
    }
  }

  /**
   * Open LocalPDF.online without specific tool
   */
  async openLocalPDF() {
    try {
      console.log('[LocalPDF Smart Launcher] Opening LocalPDF.online');
      
      this.setLoadingState(true);
      
      // Open LocalPDF.online main page
      const tab = await chrome.tabs.create({ 
        url: 'https://localpdf.online?from=extension' 
      });
      
      if (tab) {
        console.log('[LocalPDF Smart Launcher] LocalPDF.online opened successfully');
        window.close();
      }
      
    } catch (error) {
      console.error('[LocalPDF Smart Launcher] Failed to open LocalPDF.online:', error);
      this.showError('Failed to open LocalPDF.online. Please try again.');
    } finally {
      this.setLoadingState(false);
    }
  }

  /**
   * Trigger file upload dialog
   */
  triggerFileUpload() {
    if (this.fileInput) {
      this.fileInput.click();
    }
  }

  /**
   * Handle file selection for transfer
   */
  async handleFileSelection(files) {
    if (!files || files.length === 0) return;
    
    try {
      console.log(`[LocalPDF Smart Launcher] Files selected: ${files.length}`);
      
      this.setLoadingState(true);
      
      // Convert FileList to Array
      const fileArray = Array.from(files);
      
      // Validate files
      const validFiles = fileArray.filter(file => {
        return file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
      });
      
      if (validFiles.length === 0) {
        throw new Error('Please select PDF files only');
      }
      
      if (validFiles.length !== fileArray.length) {
        console.warn(`[LocalPDF Smart Launcher] ${fileArray.length - validFiles.length} non-PDF files filtered out`);
      }
      
      // Show tool selection for uploaded files
      this.showToolSelectionForFiles(validFiles);
      
    } catch (error) {
      console.error('[LocalPDF Smart Launcher] File selection failed:', error);
      this.showError(error.message);
    } finally {
      this.setLoadingState(false);
    }
  }

  /**
   * Show tool selection dialog for uploaded files
   */
  showToolSelectionForFiles(files) {
    // For simplicity, just transfer files to LocalPDF.online without specific tool
    // The user can select the tool on the site
    this.transferFilesToLocalPDF(files, '');
  }

  /**
   * Transfer files to LocalPDF.online
   */
  async transferFilesToLocalPDF(files, tool = '') {
    try {
      console.log(`[LocalPDF Smart Launcher] Transferring ${files.length} files`);
      
      this.setLoadingState(true);
      
      // Send files to background script for transfer
      const response = await chrome.runtime.sendMessage({
        action: 'transferFiles',
        files: files,
        tool: tool,
        options: {
          source: 'popup'
        }
      });
      
      if (response && response.success) {
        console.log('[LocalPDF Smart Launcher] Files transferred successfully');
        this.showSuccess('Files transferred to LocalPDF.online!');
        
        // Close popup after brief delay
        setTimeout(() => {
          window.close();
        }, 1500);
      } else {
        throw new Error(response?.error || 'Transfer failed');
      }
      
    } catch (error) {
      console.error('[LocalPDF Smart Launcher] File transfer failed:', error);
      this.showError('Failed to transfer files. Please try again.');
    } finally {
      this.setLoadingState(false);
    }
  }

  /**
   * Handle keyboard shortcuts
   */
  handleKeyboardShortcuts(e) {
    // Escape to close
    if (e.key === 'Escape') {
      window.close();
    }
    
    // Enter to open LocalPDF.online
    if (e.key === 'Enter' && !e.ctrlKey && !e.metaKey) {
      this.openLocalPDF();
    }
    
    // Ctrl/Cmd + O to open file dialog
    if ((e.ctrlKey || e.metaKey) && e.key === 'o') {
      e.preventDefault();
      this.triggerFileUpload();
    }
    
    // Number keys for quick tool access
    if (e.key >= '1' && e.key <= '6') {
      const toolButtons = document.querySelectorAll('.tools-grid .tool-btn');
      const index = parseInt(e.key) - 1;
      
      if (toolButtons[index]) {
        const tool = toolButtons[index].dataset.tool;
        this.handleToolClick(tool);
      }
    }
  }

  /**
   * Update status display
   */
  async updateStatus() {
    try {
      // Could check current tab for PDF or get extension status
      // For now, just ensure UI is ready
      console.log('[LocalPDF Smart Launcher] Status updated');
      
    } catch (error) {
      console.error('[LocalPDF Smart Launcher] Status update failed:', error);
    }
  }

  /**
   * Set loading state for UI
   */
  setLoadingState(loading) {
    const buttons = document.querySelectorAll('button');
    
    buttons.forEach(btn => {
      if (loading) {
        btn.classList.add('loading');
        btn.disabled = true;
      } else {
        btn.classList.remove('loading');
        btn.disabled = false;
      }
    });
  }

  /**
   * Show error message
   */
  showError(message) {
    this.showMessage(message, 'error');
  }

  /**
   * Show success message
   */
  showSuccess(message) {
    this.showMessage(message, 'success');
  }

  /**
   * Show message to user
   */
  showMessage(message, type = 'info') {
    // Create or update message element
    let messageEl = document.getElementById('popup-message');
    
    if (!messageEl) {
      messageEl = document.createElement('div');
      messageEl.id = 'popup-message';
      messageEl.style.cssText = `
        position: fixed;
        top: 8px;
        left: 8px;
        right: 8px;
        padding: 12px;
        border-radius: 6px;
        font-size: 12px;
        font-weight: 500;
        text-align: center;
        z-index: 1000;
        transition: all 0.3s ease;
      `;
      document.body.appendChild(messageEl);
    }
    
    // Set message and style based on type
    messageEl.textContent = message;
    messageEl.className = type;
    
    // Auto-hide after 3 seconds
    setTimeout(() => {
      if (messageEl.parentElement) {
        messageEl.remove();
      }
    }, 3000);
  }
}

// Initialize popup when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  new SmartLauncherPopup();
});

// Handle popup unload
window.addEventListener('beforeunload', () => {
  console.log('[LocalPDF Smart Launcher] Popup closing');
});
