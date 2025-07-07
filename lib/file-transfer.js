/**
 * LocalPDF Smart Launcher - File Transfer Utilities
 * Handles secure file transfer from browser extension to LocalPDF.online
 * Maintains privacy-first approach with local-only file handling
 */

class FileTransferManager {
  constructor() {
    this.STORAGE_TTL = 60000; // 60 seconds for file cleanup
    this.MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB limit for chrome.storage
  }

  /**
   * Transfer files to LocalPDF.online with specified tool
   * @param {FileList|File[]} files - Files to transfer
   * @param {string} targetTool - Tool to pre-select (compress, merge, split, etc.)
   * @param {Object} options - Additional options
   */
  async transferToLocalPDF(files, targetTool = '', options = {}) {
    try {
      console.log(`[LocalPDF Launcher] Transferring ${files.length} files to LocalPDF.online`);
      
      // Convert FileList to Array if needed
      const fileArray = Array.from(files);
      
      // Validate files
      const validation = await this.validateFiles(fileArray);
      if (!validation.valid) {
        throw new Error(validation.error);
      }

      // Choose transfer strategy based on file size
      const totalSize = fileArray.reduce((sum, file) => sum + file.size, 0);
      
      if (totalSize > this.MAX_FILE_SIZE) {
        return await this.transferViaPostMessage(fileArray, targetTool, options);
      } else {
        return await this.transferViaStorage(fileArray, targetTool, options);
      }
      
    } catch (error) {
      console.error('[LocalPDF Launcher] File transfer failed:', error);
      this.showTransferError(error.message);
      throw error;
    }
  }

  /**
   * Transfer strategy 1: Chrome Storage (for smaller files)
   */
  async transferViaStorage(files, targetTool, options) {
    const sessionId = this.generateSessionId();
    
    try {
      // Serialize files for storage
      const serializedFiles = await this.serializeFiles(files);
      
      // Store in chrome.storage.local with TTL
      const storageData = {
        pendingFiles: serializedFiles,
        targetTool: targetTool,
        sessionId: sessionId,
        timestamp: Date.now(),
        expiry: Date.now() + this.STORAGE_TTL,
        metadata: {
          fileCount: files.length,
          totalSize: files.reduce((sum, f) => sum + f.size, 0),
          transferMethod: 'storage'
        }
      };

      await chrome.storage.local.set({ [`transfer_${sessionId}`]: storageData });
      
      // Schedule automatic cleanup
      this.scheduleCleanup(sessionId);
      
      // Open LocalPDF.online with session parameters
      const targetUrl = this.buildIntegrationUrl(targetTool, sessionId, 'storage');
      const tab = await chrome.tabs.create({ url: targetUrl });
      
      console.log(`[LocalPDF Launcher] Files stored in session ${sessionId}, opened tab ${tab.id}`);
      
      return {
        success: true,
        sessionId: sessionId,
        transferMethod: 'storage',
        tabId: tab.id,
        url: targetUrl
      };
      
    } catch (error) {
      // Cleanup on error
      this.cleanupSession(sessionId);
      throw error;
    }
  }

  /**
   * Transfer strategy 2: PostMessage API (for larger files or real-time transfer)
   */
  async transferViaPostMessage(files, targetTool, options) {
    const sessionId = this.generateSessionId();
    
    try {
      // Open LocalPDF.online first
      const targetUrl = this.buildIntegrationUrl(targetTool, sessionId, 'postmessage');
      const tab = await chrome.tabs.create({ url: targetUrl });
      
      // Wait for tab to load, then send files via PostMessage
      return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Transfer timeout - LocalPDF.online did not respond'));
        }, 30000);

        const onTabUpdate = async (tabId, changeInfo) => {
          if (tabId === tab.id && changeInfo.status === 'complete') {
            chrome.tabs.onUpdated.removeListener(onTabUpdate);
            clearTimeout(timeout);
            
            try {
              // Serialize files for PostMessage
              const serializedFiles = await this.serializeFiles(files);
              
              // Send files to the opened tab
              await chrome.tabs.sendMessage(tab.id, {
                action: 'receiveFiles',
                source: 'localpdf-extension',
                files: serializedFiles,
                targetTool: targetTool,
                sessionId: sessionId,
                transferMethod: 'postmessage'
              });
              
              console.log(`[LocalPDF Launcher] Files sent via PostMessage to tab ${tab.id}`);
              
              resolve({
                success: true,
                sessionId: sessionId,
                transferMethod: 'postmessage',
                tabId: tab.id,
                url: targetUrl
              });
              
            } catch (error) {
              reject(error);
            }
          }
        };

        chrome.tabs.onUpdated.addListener(onTabUpdate);
      });
      
    } catch (error) {
      throw error;
    }
  }

  /**
   * Serialize files for transfer (convert to transferable format)
   */
  async serializeFiles(files) {
    const serialized = [];
    
    for (const file of files) {
      try {
        const arrayBuffer = await file.arrayBuffer();
        
        serialized.push({
          name: file.name,
          type: file.type,
          size: file.size,
          lastModified: file.lastModified,
          data: Array.from(new Uint8Array(arrayBuffer))
        });
        
      } catch (error) {
        console.warn(`[LocalPDF Launcher] Failed to serialize file ${file.name}:`, error);
        throw new Error(`Could not process file: ${file.name}`);
      }
    }
    
    return serialized;
  }

  /**
   * Validate files before transfer
   */
  async validateFiles(files) {
    if (!files || files.length === 0) {
      return { valid: false, error: 'No files selected for transfer' };
    }

    // Check file types (should be PDF or allow all for flexibility)
    const invalidFiles = files.filter(file => {
      // For now, allow all file types since LocalPDF.online can handle various formats
      // In the future, might want to restrict to PDFs only
      return file.size === 0;
    });

    if (invalidFiles.length > 0) {
      return { 
        valid: false, 
        error: `Invalid files detected: ${invalidFiles.map(f => f.name).join(', ')}` 
      };
    }

    // Check total size
    const totalSize = files.reduce((sum, file) => sum + file.size, 0);
    const maxTotalSize = 200 * 1024 * 1024; // 200MB total limit
    
    if (totalSize > maxTotalSize) {
      return {
        valid: false,
        error: `Total file size (${Math.round(totalSize / 1024 / 1024)}MB) exceeds limit (200MB)`
      };
    }

    return { valid: true };
  }

  /**
   * Build integration URL for LocalPDF.online
   */
  buildIntegrationUrl(targetTool, sessionId, transferMethod) {
    const baseUrl = 'https://localpdf.online';
    const params = new URLSearchParams();
    
    params.append('from', 'extension');
    params.append('session', sessionId);
    params.append('method', transferMethod);
    
    if (targetTool) {
      params.append('tool', targetTool);
    }
    
    return `${baseUrl}?${params.toString()}`;
  }

  /**
   * Generate unique session ID
   */
  generateSessionId() {
    return `ext_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Schedule automatic cleanup of stored files
   */
  scheduleCleanup(sessionId) {
    setTimeout(() => {
      this.cleanupSession(sessionId);
    }, this.STORAGE_TTL);
  }

  /**
   * Clean up session data from storage
   */
  async cleanupSession(sessionId) {
    try {
      await chrome.storage.local.remove([`transfer_${sessionId}`]);
      console.log(`[LocalPDF Launcher] Cleaned up session ${sessionId}`);
    } catch (error) {
      console.warn(`[LocalPDF Launcher] Failed to cleanup session ${sessionId}:`, error);
    }
  }

  /**
   * Show user-friendly transfer error
   */
  showTransferError(message) {
    // In a real implementation, this would show a user-friendly notification
    // For now, we'll use console.error and could add chrome.notifications later
    console.error(`[LocalPDF Launcher] Transfer Error: ${message}`);
    
    // Optional: Show browser notification if permission available
    if (chrome.notifications) {
      chrome.notifications.create({
        type: 'basic',
        iconUrl: 'assets/icons/icon48.png',
        title: 'LocalPDF Transfer Error',
        message: message
      });
    }
  }
}

// Export for use in background and content scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = FileTransferManager;
} else {
  window.FileTransferManager = FileTransferManager;
}
