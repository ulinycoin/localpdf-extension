/**
 * LocalPDF Smart Launcher - Background Service Worker
 * Pure Smart Launcher - No local PDF processing, only bridge to LocalPDF.online
 * Version: 1.0.0
 */

console.log('[LocalPDF] 🚀 Smart Launcher Background Script Loaded - v1.0.0');

class LocalPDFSmartLauncher {
  constructor() {
    this.maxFileSize = 50 * 1024 * 1024; // 50MB limit
    this.initialize();
  }

  async initialize() {
    console.log('[LocalPDF] 🎯 Initializing Smart Launcher...');
    
    // Set up context menus for PDF files
    this.setupContextMenus();
    
    // Set up event listeners
    this.setupEventListeners();
    
    // Clean up old storage on startup
    this.cleanupExpiredSessions();
    
    console.log('[LocalPDF] ✅ Smart Launcher initialized successfully!');
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
        contexts: ["link", "page"],
        documentUrlPatterns: [
          "*://*/*.pdf",
          "file://*/*.pdf"
        ]
      });

      // Tool-specific submenus
      const tools = [
        { id: 'compress', title: 'Compress PDF', icon: '📦' },
        { id: 'merge', title: 'Merge PDFs', icon: '🔗' },
        { id: 'split', title: 'Split PDF', icon: '✂️' },
        { id: 'unlock', title: 'Unlock PDF', icon: '🔓' },
        { id: 'protect', title: 'Protect PDF', icon: '🔒' },
        { id: 'rotate', title: 'Rotate PDF', icon: '🔄' },
        { id: 'convert', title: 'PDF to Image', icon: '🖼️' },
        { id: 'extract', title: 'Extract Text', icon: '📝' },
        { id: 'organize', title: 'Organize PDF', icon: '📄' }
      ];

      tools.forEach(tool => {
        chrome.contextMenus.create({
          id: `localpdf-${tool.id}`,
          parentId: "localpdf-main",
          title: `${tool.icon} ${tool.title}`,
          contexts: ["link", "page"]
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
        contexts: ["link", "page"]
      });

      console.log('[LocalPDF] 📋 Context menus created for 9 PDF tools');
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
      this.cleanupExpiredSessions();
    });

    console.log('[LocalPDF] 👂 Event listeners set up');
  }

  /**
   * Handle context menu clicks - Smart Launcher approach
   */
  async handleContextMenuClick(info, tab) {
    console.log('[LocalPDF] 🖱️ Context menu clicked:', info.menuItemId);
    
    try {
      if (info.menuItemId === 'localpdf-open') {
        // Just open LocalPDF.online
        chrome.tabs.create({ url: 'https://localpdf.online/?from=extension' });
        return;
      }

      if (info.menuItemId.startsWith('localpdf-')) {
        const tool = info.menuItemId.replace('localpdf-', '');
        
        if (info.linkUrl && info.linkUrl.endsWith('.pdf')) {
          // Handle PDF link - open LocalPDF with URL parameter
          const url = `https://localpdf.online/?from=extension&tool=${tool}&url=${encodeURIComponent(info.linkUrl)}`;
          chrome.tabs.create({ url });
          console.log('[LocalPDF] 🔗 Opened PDF link with tool:', tool);
        } else if (info.pageUrl && info.pageUrl.endsWith('.pdf')) {
          // Handle PDF page - try to transfer current PDF
          try {
            await this.transferCurrentPDF(tab.id, tool);
          } catch (error) {
            console.log('[LocalPDF] ⚠️ Fallback to URL method for PDF page');
            const url = `https://localpdf.online/?from=extension&tool=${tool}&url=${encodeURIComponent(info.pageUrl)}`;
            chrome.tabs.create({ url });
          }
        } else {
          // Open LocalPDF with tool pre-selected
          const url = `https://localpdf.online/?from=extension&tool=${tool}`;
          chrome.tabs.create({ url });
          console.log('[LocalPDF] 🎯 Opened LocalPDF with pre-selected tool:', tool);
        }
      }
    } catch (error) {
      console.error('[LocalPDF] ❌ Context menu action failed:', error);
      // Fallback: just open LocalPDF.online
      chrome.tabs.create({ url: 'https://localpdf.online/?from=extension' });
    }
  }

  /**
   * Transfer current PDF from content script
   */
  async transferCurrentPDF(tabId, tool) {
    return new Promise((resolve, reject) => {
      chrome.tabs.sendMessage(tabId, {
        action: 'getCurrentPDF',
        tool: tool
      }, (response) => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
        } else if (response && response.success) {
          resolve(response);
        } else {
          reject(new Error('Failed to get current PDF'));
        }
      });
    });
  }

  /**
   * Handle messages from content scripts and popup
   */
  async handleMessage(request, sender, sendResponse) {
    console.log('[LocalPDF] 📨 Received message:', request.action);
    
    try {
      switch (request.action) {
        case 'openTool':
          // Open LocalPDF.online with specific tool
          const url = `https://localpdf.online/?from=extension&tool=${request.tool}`;
          const tab = await chrome.tabs.create({ url });
          sendResponse({ success: true, tabId: tab.id });
          console.log('[LocalPDF] 🚀 Opened tool:', request.tool);
          break;

        case 'transferFiles':
          // Store files temporarily and open LocalPDF.online
          const sessionId = this.generateSessionId();
          await this.storeFilesTemporarily(sessionId, request.files, request.tool);
          
          const transferUrl = `https://localpdf.online/?from=extension&tool=${request.tool}&session=${sessionId}`;
          const transferTab = await chrome.tabs.create({ url: transferUrl });
          
          sendResponse({ success: true, sessionId, tabId: transferTab.id });
          console.log('[LocalPDF] 📁 Files stored for transfer, session:', sessionId);
          break;

        case 'getStoredFiles':
          // Retrieve stored files for LocalPDF.online
          const storedData = await chrome.storage.local.get([`transfer_${request.sessionId}`]);
          const sessionData = storedData[`transfer_${request.sessionId}`];
          
          if (sessionData && sessionData.expiry > Date.now()) {
            sendResponse({ success: true, data: sessionData });
            // Clean up after successful retrieval
            await chrome.storage.local.remove([`transfer_${request.sessionId}`]);
            console.log('[LocalPDF] ✅ Files retrieved and cleaned up, session:', request.sessionId);
          } else {
            sendResponse({ success: false, error: 'Session expired or not found' });
            console.log('[LocalPDF] ⚠️ Session not found or expired:', request.sessionId);
          }
          break;

        case 'siteReady':
          // LocalPDF.online site is ready for integration
          sendResponse({ 
            success: true, 
            extensionVersion: '1.0.0',
            capabilities: ['fileTransfer', 'toolSelection', 'sessionManagement'],
            status: 'Smart Launcher ready'
          });
          console.log('[LocalPDF] 🌐 Site integration ready, sender:', sender.tab?.url);
          break;

        case 'extensionInfo':
          // Provide extension information
          sendResponse({
            success: true,
            name: 'LocalPDF Smart Launcher',
            version: '1.0.0',
            type: 'Smart Launcher',
            capabilities: {
              fileTransfer: true,
              toolSelection: true,
              contextMenus: true,
              popupInterface: true,
              sessionManagement: true
            }
          });
          console.log('[LocalPDF] ℹ️ Extension info requested');
          break;

        case 'ping':
          // Health check
          sendResponse({ success: true, status: 'Smart Launcher ready', timestamp: Date.now() });
          break;

        default:
          sendResponse({ success: false, error: 'Unknown action' });
          console.log('[LocalPDF] ❓ Unknown action:', request.action);
      }
    } catch (error) {
      console.error('[LocalPDF] ❌ Message handling failed:', error);
      sendResponse({ success: false, error: error.message });
    }
  }

  /**
   * Store files temporarily for transfer to LocalPDF.online
   */
  async storeFilesTemporarily(sessionId, files, tool) {
    const fileData = [];
    
    for (const file of files) {
      fileData.push({
        name: file.name,
        type: file.type,
        size: file.size,
        data: file.data, // base64 data
        lastModified: file.lastModified
      });
    }

    const sessionData = {
      files: fileData,
      tool: tool,
      timestamp: Date.now(),
      expiry: Date.now() + (5 * 60 * 1000), // 5 minutes expiry
      sessionId: sessionId
    };

    await chrome.storage.local.set({
      [`transfer_${sessionId}`]: sessionData
    });

    // Set cleanup timer
    setTimeout(() => {
      this.cleanupSession(sessionId);
    }, 5 * 60 * 1000); // 5 minutes
  }

  /**
   * Generate unique session ID
   */
  generateSessionId() {
    return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  /**
   * Clean up expired sessions
   */
  async cleanupExpiredSessions() {
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
        console.log(`[LocalPDF] 🧹 Cleaned up ${keysToRemove.length} expired sessions`);
      }
      
    } catch (error) {
      console.error('[LocalPDF] ❌ Cleanup failed:', error);
    }
  }

  /**
   * Clean up specific session
   */
  async cleanupSession(sessionId) {
    try {
      await chrome.storage.local.remove([`transfer_${sessionId}`]);
      console.log(`[LocalPDF] 🗑️ Cleaned up session: ${sessionId}`);
    } catch (error) {
      console.error('[LocalPDF] ❌ Session cleanup failed:', error);
    }
  }
}

// Initialize the Smart Launcher
const smartLauncher = new LocalPDFSmartLauncher();

// Handle extension installation/update
chrome.runtime.onInstalled.addListener((details) => {
  console.log('[LocalPDF] 📦 Extension installed/updated:', details.reason);
  
  if (details.reason === 'install') {
    // Open welcome page on first install
    chrome.tabs.create({ 
      url: 'https://localpdf.online/?from=extension&welcome=true' 
    });
    console.log('[LocalPDF] 🎉 Welcome tab opened for new installation');
  }
});