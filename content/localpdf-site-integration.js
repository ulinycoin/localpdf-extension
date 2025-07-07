/**
 * LocalPDF Extension Content Script - Site Integration Helper
 * This script runs on LocalPDF.online to bridge extension and site communication
 * 
 * File: content/localpdf-site-integration.js
 * Matches: https://localpdf.online/*
 */

class LocalPDFSiteIntegration {
  constructor() {
    this.isLocalPDFSite = window.location.hostname === 'localpdf.online' || 
                          window.location.hostname === 'localhost' ||
                          window.location.hostname.includes('localpdf');
    this.storageCleanupTimer = null;
    
    if (this.isLocalPDFSite) {
      this.init();
    }
  }

  init() {
    console.log('🔗 LocalPDF Extension site integration active');
    
    // Set up storage bridge
    this.setupStorageBridge();
    
    // Set up extension communication
    this.setupExtensionCommunication();
    
    // Monitor for storage cleanup requests
    this.setupStorageCleanup();
    
    // Handle direct file transfer from extension
    this.setupDirectFileTransfer();
    
    // Monitor integration status
    this.monitorIntegrationStatus();
  }

  /**
   * Bridge between site and extension storage
   */
  setupStorageBridge() {
    // Listen for storage data requests from site
    window.addEventListener('localpdf-request-storage', async (event) => {
      const { sessionId } = event.detail;
      
      try {
        // Get data from extension storage
        const result = await chrome.storage.local.get([
          'pendingFiles',
          'targetTool', 
          'sessionId',
          'timestamp'
        ]);
        
        if (result.sessionId === sessionId && result.pendingFiles) {
          // Check if data hasn't expired (5 minutes max)
          const age = Date.now() - (result.timestamp || 0);
          if (age < 5 * 60 * 1000) {
            // Send data to site
            window.dispatchEvent(new CustomEvent('localpdf-storage-response', {
              detail: {
                files: result.pendingFiles,
                tool: result.targetTool
              }
            }));
            
            console.log('📦 Storage data transferred to site');
            
            // Schedule cleanup
            this.scheduleStorageCleanup();
          } else {
            console.log('⏰ Storage data expired, cleaning up');
            this.cleanupStorage();
          }
        }
      } catch (error) {
        console.error('❌ Error retrieving storage data:', error);
      }
    });
  }

  /**
   * Set up direct communication with extension background script
   */
  setupExtensionCommunication() {
    // Listen for messages from extension background script
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (message.action === 'transferFiles') {
        this.handleDirectFileTransfer(message.files, message.tool);
        sendResponse({ success: true });
      }
      
      if (message.action === 'checkSiteReady') {
        sendResponse({ 
          ready: true, 
          hasIntegration: typeof window.localPDFExtension !== 'undefined'
        });
      }
      
      return true; // Keep message channel open for async response
    });
  }

  /**
   * Handle direct file transfer from extension
   */
  handleDirectFileTransfer(files, tool) {
    // Wait for site integration to be ready
    const waitForIntegration = () => {
      if (window.localPDFExtension) {
        window.localPDFExtension.processExtensionFiles(files, tool);
      } else {
        // Wait a bit longer for integration to load
        setTimeout(waitForIntegration, 100);
      }
    };
    
    waitForIntegration();
  }

  /**
   * Set up file transfer via PostMessage
   */
  setupDirectFileTransfer() {
    // Notify extension that site is ready for file transfer
    if (window.location.search.includes('from=extension')) {
      try {
        chrome.runtime.sendMessage({
          action: 'siteReady',
          url: window.location.href
        }).catch(() => {
          // Extension might not be available, that's ok
          console.log('ℹ️ Extension not responding (expected if not installed)');
        });
      } catch (error) {
        console.log('ℹ️ Extension API not available (expected in some contexts)');
      }
    }
  }

  /**
   * Set up storage cleanup mechanism
   */
  setupStorageCleanup() {
    // Listen for cleanup requests from site
    window.addEventListener('localpdf-cleanup-storage', (event) => {
      const { sessionId } = event.detail;
      this.cleanupStorage(sessionId);
    });
    
    // Auto-cleanup on page unload
    window.addEventListener('beforeunload', () => {
      this.cleanupStorage();
    });
  }

  /**
   * Schedule storage cleanup
   */
  scheduleStorageCleanup() {
    // Clear existing timer
    if (this.storageCleanupTimer) {
      clearTimeout(this.storageCleanupTimer);
    }
    
    // Schedule cleanup in 2 minutes
    this.storageCleanupTimer = setTimeout(() => {
      this.cleanupStorage();
    }, 2 * 60 * 1000);
  }

  /**
   * Clean up extension storage
   */
  async cleanupStorage(sessionId = null) {
    try {
      if (sessionId) {
        // Clean up specific session
        const result = await chrome.storage.local.get(['sessionId']);
        if (result.sessionId === sessionId) {
          await chrome.storage.local.remove([
            'pendingFiles',
            'targetTool',
            'sessionId', 
            'timestamp'
          ]);
          console.log('🧹 Extension storage cleaned up for session:', sessionId);
        }
      } else {
        // Clean up all extension data
        await chrome.storage.local.remove([
          'pendingFiles',
          'targetTool',
          'sessionId',
          'timestamp'
        ]);
        console.log('🧹 Extension storage cleaned up');
      }
    } catch (error) {
      console.error('❌ Error cleaning up storage:', error);
    }
  }

  /**
   * Monitor site integration status
   */
  monitorIntegrationStatus() {
    let checkCount = 0;
    const maxChecks = 50; // 5 seconds max
    
    const checkIntegration = () => {
      if (window.localPDFExtension) {
        console.log('✅ Site integration detected and working');
        return;
      }
      
      checkCount++;
      if (checkCount < maxChecks) {
        setTimeout(checkIntegration, 100);
      } else {
        console.warn('⚠️ Site integration not detected after 5 seconds');
        // Fallback: inject basic integration
        this.injectBasicIntegration();
      }
    };
    
    checkIntegration();
  }

  /**
   * Inject basic integration if main integration fails
   */
  injectBasicIntegration() {
    console.log('🔧 Injecting fallback integration');
    
    // Create a minimal integration object
    window.localPDFExtension = {
      processExtensionFiles: (files, tool) => {
        console.log('📁 Fallback: Processing files from extension', files.length);
        
        // Try to find file input and populate it
        const fileInput = document.querySelector('input[type="file"]');
        if (fileInput) {
          const dataTransfer = new DataTransfer();
          files.forEach(file => dataTransfer.items.add(file));
          fileInput.files = dataTransfer.files;
          fileInput.dispatchEvent(new Event('change', { bubbles: true }));
        }
      },
      
      getSessionInfo: () => ({
        isExtensionSession: window.location.search.includes('from=extension'),
        fallbackMode: true
      })
    };
  }

  /**
   * Debug information for development
   */
  getDebugInfo() {
    return {
      isLocalPDFSite: this.isLocalPDFSite,
      hasIntegration: typeof window.localPDFExtension !== 'undefined',
      extensionAvailable: typeof chrome !== 'undefined' && chrome.runtime,
      url: window.location.href,
      urlParams: Object.fromEntries(new URLSearchParams(window.location.search))
    };
  }
}

// Initialize only on LocalPDF.online
const siteIntegration = new LocalPDFSiteIntegration();

// Make available globally for debugging
window.localPDFSiteIntegration = siteIntegration;

console.log('✅ Extension site integration ready');
