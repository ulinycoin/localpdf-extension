/**
 * LocalPDF Smart Launcher - Content Script
 * Handles PDF page detection, floating buttons, and integration with LocalPDF.online
 */

class SmartLauncherContent {
  constructor() {
    this.isInitialized = false;
    this.floatingButton = null;
    this.initialize();
  }

  initialize() {
    if (this.isInitialized) return;
    
    console.log('[LocalPDF Smart Launcher] Content script initialized');
    
    // Set up message listener
    this.setupMessageListener();
    
    // Check if this is a PDF page
    if (this.isPDFPage()) {
      this.setupPDFPageIntegration();
    }
    
    // Check if this is LocalPDF.online page
    if (this.isLocalPDFPage()) {
      this.setupLocalPDFIntegration();
    }
    
    // Enhance PDF links on the page
    this.enhancePDFLinks();
    
    this.isInitialized = true;
  }

  /**
   * Check if current page is a PDF
   */
  isPDFPage() {
    return (
      window.location.href.endsWith('.pdf') ||
      document.contentType === 'application/pdf' ||
      document.querySelector('embed[type="application/pdf"]') ||
      document.querySelector('object[type="application/pdf"]')
    );
  }

  /**
   * Check if current page is LocalPDF.online
   */
  isLocalPDFPage() {
    return window.location.hostname === 'localpdf.online';
  }

  /**
   * Set up PDF page integration (floating button)
   */
  setupPDFPageIntegration() {
    console.log('[LocalPDF Smart Launcher] Setting up PDF page integration');
    
    // Wait for page to load
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        this.createFloatingButton();
      });
    } else {
      this.createFloatingButton();
    }
  }

  /**
   * Create floating button on PDF pages
   */
  createFloatingButton() {
    // Don't create button if already exists
    if (this.floatingButton) return;
    
    const button = document.createElement('div');
    button.id = 'localpdf-floating-button';
    button.innerHTML = `
      <div class="localpdf-btn-content">
        <img src="${chrome.runtime.getURL('assets/icons/icon16.png')}" alt="LocalPDF" />
        <span>Process in LocalPDF</span>
      </div>
      <div class="localpdf-btn-menu" id="localpdf-btn-menu">
        <div class="localpdf-menu-item" data-tool="compress">📦 Compress</div>
        <div class="localpdf-menu-item" data-tool="merge">🔗 Merge</div>
        <div class="localpdf-menu-item" data-tool="split">✂️ Split</div>
        <div class="localpdf-menu-item" data-tool="rotate">🔄 Rotate</div>
        <div class="localpdf-menu-item" data-tool="addtext">📝 Add Text</div>
        <div class="localpdf-menu-item" data-tool="">🚀 Open LocalPDF</div>
      </div>
    `;
    
    // Add styles
    this.addFloatingButtonStyles();
    
    // Add event listeners
    button.addEventListener('click', (e) => {
      e.stopPropagation();
      this.toggleFloatingMenu();
    });
    
    // Handle menu item clicks
    button.addEventListener('click', (e) => {
      if (e.target.classList.contains('localpdf-menu-item')) {
        e.stopPropagation();
        const tool = e.target.dataset.tool;
        this.handleFloatingButtonAction(tool);
      }
    });
    
    // Close menu when clicking outside
    document.addEventListener('click', () => {
      this.closeFloatingMenu();
    });
    
    document.body.appendChild(button);
    this.floatingButton = button;
    
    console.log('[LocalPDF Smart Launcher] Floating button created');
  }

  /**
   * Add CSS styles for floating button
   */
  addFloatingButtonStyles() {
    if (document.getElementById('localpdf-floating-styles')) return;
    
    const styles = document.createElement('style');
    styles.id = 'localpdf-floating-styles';
    styles.textContent = `
      #localpdf-floating-button {
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 10000;
        background: #2563eb;
        color: white;
        border-radius: 12px;
        padding: 12px 16px;
        cursor: pointer;
        box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
        transition: all 0.3s ease;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
        font-size: 14px;
        user-select: none;
      }
      
      #localpdf-floating-button:hover {
        background: #1d4ed8;
        transform: translateY(-2px);
        box-shadow: 0 6px 16px rgba(37, 99, 235, 0.4);
      }
      
      .localpdf-btn-content {
        display: flex;
        align-items: center;
        gap: 8px;
      }
      
      .localpdf-btn-content img {
        width: 16px;
        height: 16px;
      }
      
      .localpdf-btn-menu {
        position: absolute;
        top: 100%;
        right: 0;
        background: white;
        border-radius: 8px;
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
        min-width: 180px;
        margin-top: 8px;
        opacity: 0;
        visibility: hidden;
        transform: translateY(-10px);
        transition: all 0.2s ease;
        border: 1px solid #e5e7eb;
      }
      
      .localpdf-btn-menu.show {
        opacity: 1;
        visibility: visible;
        transform: translateY(0);
      }
      
      .localpdf-menu-item {
        padding: 12px 16px;
        color: #374151;
        cursor: pointer;
        transition: background-color 0.2s ease;
        border-bottom: 1px solid #f3f4f6;
      }
      
      .localpdf-menu-item:last-child {
        border-bottom: none;
      }
      
      .localpdf-menu-item:hover {
        background: #f9fafb;
      }
      
      .localpdf-menu-item:first-child {
        border-radius: 8px 8px 0 0;
      }
      
      .localpdf-menu-item:last-child {
        border-radius: 0 0 8px 8px;
      }
    `;
    
    document.head.appendChild(styles);
  }

  /**
   * Toggle floating menu visibility
   */
  toggleFloatingMenu() {
    const menu = document.getElementById('localpdf-btn-menu');
    if (menu) {
      menu.classList.toggle('show');
    }
  }

  /**
   * Close floating menu
   */
  closeFloatingMenu() {
    const menu = document.getElementById('localpdf-btn-menu');
    if (menu) {
      menu.classList.remove('show');
    }
  }

  /**
   * Handle floating button action
   */
  async handleFloatingButtonAction(tool) {
    this.closeFloatingMenu();
    
    try {
      if (!tool) {
        // Just open LocalPDF.online
        window.open('https://localpdf.online?from=extension', '_blank');
        return;
      }
      
      // Transfer current PDF to LocalPDF.online with specific tool
      const currentUrl = window.location.href;
      
      // For Smart Launcher, we redirect to LocalPDF.online with URL parameter
      const url = `https://localpdf.online?from=extension&tool=${tool}&url=${encodeURIComponent(currentUrl)}`;
      window.open(url, '_blank');
      
    } catch (error) {
      console.error('[LocalPDF Smart Launcher] Floating button action failed:', error);
      // Fallback: open LocalPDF with URL
      const url = `https://localpdf.online?from=extension&tool=${tool || ''}&url=${encodeURIComponent(window.location.href)}`;
      window.open(url, '_blank');
    }
  }

  /**
   * Set up LocalPDF.online page integration
   */
  setupLocalPDFIntegration() {
    console.log('[LocalPDF Smart Launcher] Setting up LocalPDF.online integration');
    
    // Check URL parameters for extension launch
    const urlParams = new URLSearchParams(window.location.search);
    const fromExtension = urlParams.get('from') === 'extension';
    const sessionId = urlParams.get('session');
    const transferMethod = urlParams.get('method');
    
    if (fromExtension) {
      console.log('[LocalPDF Smart Launcher] LocalPDF.online launched from extension');
      
      if (sessionId && transferMethod === 'storage') {
        // Retrieve files from storage
        this.retrieveFilesFromStorage(sessionId);
      }
      
      // Show extension integration indicator
      this.showExtensionIntegrationBanner();
    }
    
    // Set up message listener for PostMessage transfer
    window.addEventListener('message', (event) => {
      if (event.data && event.data.source === 'localpdf-extension') {
        this.handleFilesFromExtension(event.data);
      }
    });
  }

  /**
   * Retrieve files from Chrome storage
   */
  async retrieveFilesFromStorage(sessionId) {
    try {
      const response = await chrome.runtime.sendMessage({
        action: 'getStoredFiles',
        sessionId: sessionId
      });
      
      if (response && response.success) {
        console.log('[LocalPDF Smart Launcher] Files retrieved from storage');
        this.processReceivedFiles(response.data);
      } else {
        console.warn('[LocalPDF Smart Launcher] Failed to retrieve stored files:', response?.error);
      }
      
    } catch (error) {
      console.error('[LocalPDF Smart Launcher] Error retrieving stored files:', error);
    }
  }

  /**
   * Handle files received from extension (PostMessage)
   */
  handleFilesFromExtension(data) {
    console.log('[LocalPDF Smart Launcher] Files received via PostMessage');
    this.processReceivedFiles(data);
  }

  /**
   * Process received files and integrate with LocalPDF.online
   */
  processReceivedFiles(data) {
    // This would integrate with LocalPDF.online's file handling system
    // For now, we'll dispatch a custom event that the site can listen to
    
    const event = new CustomEvent('localpdf-extension-files', {
      detail: {
        files: data.pendingFiles || data.files,
        targetTool: data.targetTool,
        sessionId: data.sessionId,
        transferMethod: data.transferMethod || data.metadata?.transferMethod
      }
    });
    
    document.dispatchEvent(event);
    console.log('[LocalPDF Smart Launcher] Files dispatched to LocalPDF.online');
  }

  /**
   * Show extension integration banner
   */
  showExtensionIntegrationBanner() {
    const banner = document.createElement('div');
    banner.id = 'localpdf-extension-banner';
    banner.innerHTML = `
      <div style="
        background: linear-gradient(90deg, #2563eb, #3b82f6);
        color: white;
        padding: 12px 24px;
        text-align: center;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
        font-size: 14px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        position: relative;
        z-index: 1000;
      ">
        🚀 <strong>Launched from LocalPDF Smart Launcher</strong> - Files are ready for processing!
        <button onclick="this.parentElement.parentElement.remove()" style="
          background: rgba(255,255,255,0.2);
          border: none;
          color: white;
          padding: 4px 8px;
          border-radius: 4px;
          margin-left: 12px;
          cursor: pointer;
        ">×</button>
      </div>
    `;
    
    document.body.insertBefore(banner, document.body.firstChild);
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
      if (banner.parentElement) {
        banner.remove();
      }
    }, 5000);
  }

  /**
   * Enhance PDF links on the page
   */
  enhancePDFLinks() {
    const pdfLinks = document.querySelectorAll('a[href$=".pdf"]');
    
    pdfLinks.forEach(link => {
      // Add visual indicator for PDF links
      if (!link.querySelector('.localpdf-indicator')) {
        const indicator = document.createElement('span');
        indicator.className = 'localpdf-indicator';
        indicator.innerHTML = ' 📄';
        indicator.title = 'PDF file - Right-click for LocalPDF options';
        indicator.style.cssText = 'font-size: 12px; opacity: 0.7; margin-left: 4px;';
        link.appendChild(indicator);
      }
    });
  }

  /**
   * Set up message listener for background script communication
   */
  setupMessageListener() {
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      console.log('[LocalPDF Smart Launcher] Content script received message:', request.action);
      
      switch (request.action) {
        case 'transferCurrentPDF':
          this.handleTransferCurrentPDF(request, sendResponse);
          return true;
          
        case 'receiveFiles':
          this.handleFilesFromExtension(request);
          sendResponse({ success: true });
          return true;
          
        default:
          sendResponse({ success: false, error: 'Unknown action' });
      }
    });
  }

  /**
   * Handle transfer current PDF request from background script
   */
  async handleTransferCurrentPDF(request, sendResponse) {
    try {
      if (!this.isPDFPage()) {
        throw new Error('Current page is not a PDF');
      }
      
      // For PDF pages, we'll redirect to LocalPDF.online with URL parameter
      const url = `https://localpdf.online?from=extension&tool=${request.tool}&url=${encodeURIComponent(request.url)}`;
      window.open(url, '_blank');
      
      sendResponse({ success: true });
      
    } catch (error) {
      console.error('[LocalPDF Smart Launcher] Transfer current PDF failed:', error);
      sendResponse({ success: false, error: error.message });
    }
  }
}

// Initialize content script
const smartLauncherContent = new SmartLauncherContent();

// Reinitialize on navigation (for SPAs)
let lastUrl = location.href;
new MutationObserver(() => {
  const url = location.href;
  if (url !== lastUrl) {
    lastUrl = url;
    // Reinitialize after a short delay
    setTimeout(() => {
      smartLauncherContent.initialize();
    }, 1000);
  }
}).observe(document, { subtree: true, childList: true });
