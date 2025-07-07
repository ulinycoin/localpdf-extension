/**
 * LocalPDF Smart Launcher - Background Service Worker
 * Handles context menus, file transfers, and coordination with LocalPDF.online
 */

// Import file transfer utilities
importScripts('lib/file-transfer.js');

class SmartLauncherBackground {
  constructor() {
    this.fileTransfer = new FileTransferManager();
    this.initialize();
  }

  async initialize() {
    console.log('[LocalPDF Smart Launcher] Background service worker initialized');
    
    // Set up context menus
    this.setupContextMenus();
    
    // Set up event listeners
    this.setupEventListeners();
    
    // Clean up old storage on startup
    this.cleanupOldSessions();
  }

  /**
   * Set up context menu system for PDF files
   */
  setupContextMenus() {
    // Remove all existing context menus first
    chrome.contextMenus.removeAll(() => {
      
      // Main LocalPDF menu
      chrome.contextMenus.create({
        id: "localpdf-main",
        title: "LocalPDF",
        contexts: ["link", "page", "selection"],
        documentUrlPatterns: [
          "*://*/*.pdf",
          "file://*/*.pdf"
        ]
      });

      // Tool-specific submenus
      const tools = [
        { id: 'compress', title: 'Compress PDF', icon: '📦' },
        { id: 'merge', title: 'Merge with other PDFs', icon: '🔗' },
        { id: 'split', title: 'Split PDF', icon: '✂️' },
        { id: 'rotate', title: 'Rotate PDF', icon: '🔄' },
        { id: 'addtext', title: 'Add Text', icon: '📝' },
        { id: 'watermark', title: 'Add Watermark', icon: '🏷️' },
        { id: 'extract-pages', title: 'Extract Pages', icon: '📄' },
        { id: 'extract-text', title: 'Extract Text', icon: '📋' },
        { id: 'pdf-to-image', title: 'Convert to Image', icon: '🖼️' }
      ];

      tools.forEach(tool => {
        chrome.contextMenus.create({
          id: `localpdf-${tool.id}`,
          parentId: "localpdf-main",
          title: `${tool.icon} ${tool.title}`,
          contexts: ["link", "page", "selection"]
        });
      });

      // Separator and general option
      chrome.contextMenus.create({
        id: "localpdf-separator",
        parentId: "localpdf-main",
        type: "separator"
      });

      chrome.contextMenus.create({
        id: "localpdf-open",
        parentId: "localpdf-main",
        title: "🚀 Open LocalPDF.online",
        contexts: ["link", "page", "selection"]
      });

      console.log('[LocalPDF Smart Launcher] Context menus created');
    });
  }

  /**
   * Set up event listeners
   */
  setupEventListeners() {
    // Context menu click handler
    chrome.contextMenus.onClicked.addListener((info, tab) => {
      this.handleContextMenuClick(info, tab);
    });

    // Handle messages from content scripts and popup
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      this.handleMessage(request, sender, sendResponse);
      return true; // Keep message channel open for async response
    });

    // Clean up storage when extension starts/restarts
    chrome.runtime.onStartup.addListener(() => {
      this.cleanupOldSessions();
    });
  }

  /**
   * Handle context menu clicks
   */
  async handleContextMenuClick(info, tab) {
    console.log('[LocalPDF Smart Launcher] Context menu clicked:', info.menuItemId);
    
    try {
      if (info.menuItemId === 'localpdf-open') {
        // Just open LocalPDF.online
        chrome.tabs.create({ url: 'https://localpdf.online?from=extension' });
        return;
      }

      if (info.menuItemId.startsWith('localpdf-')) {
        const tool = info.menuItemId.replace('localpdf-', '');
        
        if (info.linkUrl) {
          // Handle PDF link
          await this.handlePDFLink(info.linkUrl, tool, tab);
        } else if (info.pageUrl && info.pageUrl.endsWith('.pdf')) {
          // Handle PDF page
          await this.handlePDFPage(info.pageUrl, tool, tab);
        } else {
          // Open LocalPDF with tool pre-selected and prompt for file
          const url = `https://localpdf.online?from=extension&tool=${tool}&prompt=files`;
          chrome.tabs.create({ url });
        }
      }
    } catch (error) {
      console.error('[LocalPDF Smart Launcher] Context menu action failed:', error);
      this.showError('Failed to open LocalPDF. Please try again.');
    }
  }

  /**
   * Handle PDF link from context menu
   */
  async handlePDFLink(linkUrl, tool, tab) {
    try {
      // Fetch the PDF file
      const response = await fetch(linkUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch PDF: ${response.status}`);
      }
      
      const blob = await response.blob();
      const file = new File([blob], this.extractFilenameFromUrl(linkUrl), { type: 'application/pdf' });
      
      // Transfer to LocalPDF
      await this.fileTransfer.transferToLocalPDF([file], tool);
      
    } catch (error) {
      console.error('[LocalPDF Smart Launcher] PDF link handling failed:', error);
      // Fallback: open LocalPDF with URL parameter
      const url = `https://localpdf.online?from=extension&tool=${tool}&url=${encodeURIComponent(linkUrl)}`;
      chrome.tabs.create({ url });
    }
  }

  /**
   * Handle PDF page from context menu
   */
  async handlePDFPage(pageUrl, tool, tab) {
    try {
      // For PDF pages, we'll send a message to the content script to handle the current PDF
      const response = await chrome.tabs.sendMessage(tab.id, {
        action: 'transferCurrentPDF',
        tool: tool,
        url: pageUrl
      });
      
      if (!response || !response.success) {
        throw new Error('Failed to transfer current PDF');
      }
      
    } catch (error) {
      console.error('[LocalPDF Smart Launcher] PDF page handling failed:', error);
      // Fallback: open LocalPDF with URL parameter
      const url = `https://localpdf.online?from=extension&tool=${tool}&url=${encodeURIComponent(pageUrl)}`;
      chrome.tabs.create({ url });
    }
  }

  /**
   * Handle messages from content scripts and popup
   */
  async handleMessage(request, sender, sendResponse) {
    console.log('[LocalPDF Smart Launcher] Received message:', request.action);
    
    try {
      switch (request.action) {
        case 'transferFiles':
          const result = await this.fileTransfer.transferToLocalPDF(
            request.files, 
            request.tool, 
            request.options
          );
          sendResponse({ success: true, result });
          break;

        case 'openTool':
          const url = `https://localpdf.online?from=extension&tool=${request.tool}`;
          const tab = await chrome.tabs.create({ url });
          sendResponse({ success: true, tabId: tab.id });
          break;

        case 'getStoredFiles':
          const storedData = await chrome.storage.local.get([`transfer_${request.sessionId}`]);
          const sessionData = storedData[`transfer_${request.sessionId}`];
          
          if (sessionData && sessionData.expiry > Date.now()) {
            sendResponse({ success: true, data: sessionData });
            // Clean up after successful retrieval
            this.fileTransfer.cleanupSession(request.sessionId);
          } else {
            sendResponse({ success: false, error: 'Session expired or not found' });
          }
          break;

        default:
          sendResponse({ success: false, error: 'Unknown action' });
      }
    } catch (error) {
      console.error('[LocalPDF Smart Launcher] Message handling failed:', error);
      sendResponse({ success: false, error: error.message });
    }
  }

  /**
   * Clean up old storage sessions
   */
  async cleanupOldSessions() {
    try {
      const storage = await chrome.storage.local.get(null);
      const now = Date.now();
      const keysToRemove = [];
      
      for (const [key, value] of Object.entries(storage)) {
        if (key.startsWith('transfer_') && value.expiry && value.expiry < now) {
          keysToRemove.push(key);
        }
      }
      
      if (keysToRemove.length > 0) {
        await chrome.storage.local.remove(keysToRemove);
        console.log(`[LocalPDF Smart Launcher] Cleaned up ${keysToRemove.length} expired sessions`);
      }
      
    } catch (error) {
      console.error('[LocalPDF Smart Launcher] Cleanup failed:', error);
    }
  }

  /**
   * Extract filename from URL
   */
  extractFilenameFromUrl(url) {
    try {
      const urlObj = new URL(url);
      const pathname = urlObj.pathname;
      const filename = pathname.split('/').pop();
      return filename || 'document.pdf';
    } catch (error) {
      return 'document.pdf';
    }
  }

  /**
   * Show error notification to user
   */
  showError(message) {
    console.error(`[LocalPDF Smart Launcher] Error: ${message}`);
    
    // Try to show browser notification if available
    if (chrome.notifications) {
      chrome.notifications.create({
        type: 'basic',
        iconUrl: 'assets/icons/icon48.png',
        title: 'LocalPDF Smart Launcher',
        message: message
      });
    }
  }
}

// Initialize the background service worker
const smartLauncher = new SmartLauncherBackground();

// Handle extension installation/update
chrome.runtime.onInstalled.addListener((details) => {
  console.log('[LocalPDF Smart Launcher] Extension installed/updated:', details.reason);
  
  if (details.reason === 'install') {
    // Open welcome page on first install
    chrome.tabs.create({ 
      url: 'https://localpdf.online?from=extension&welcome=true' 
    });
  }
});
