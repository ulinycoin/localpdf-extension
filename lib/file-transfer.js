/**
 * LocalPDF Smart Launcher - File Transfer Utilities
 * Pure file transfer functionality for Smart Launcher approach
 * No local PDF processing - only transfers files to LocalPDF.online
 * Version: 1.0.0
 */

class FileTransferManager {
  constructor() {
    this.maxFileSize = 50 * 1024 * 1024; // 50MB limit
    this.supportedTypes = ['application/pdf'];
  }

  /**
   * Transfer files to LocalPDF.online via Smart Launcher approach
   */
  async transferToLocalPDF(files, tool = '', options = {}) {
    console.log('[LocalPDF FileTransfer] 🚀 Starting file transfer for tool:', tool);
    
    try {
      // Validate files
      const validatedFiles = await this.validateFiles(files);
      
      // Serialize files for transfer
      const serializedFiles = await this.serializeFiles(validatedFiles);
      
      // Generate session for transfer
      const sessionId = this.generateSessionId();
      
      // Store files temporarily
      await this.storeForTransfer(sessionId, serializedFiles, tool, options);
      
      // Open LocalPDF.online with session
      const url = this.buildTransferURL(tool, sessionId, options);
      const tab = await chrome.tabs.create({ url });
      
      console.log('[LocalPDF FileTransfer] ✅ Transfer initiated successfully');
      
      return {
        success: true,
        sessionId: sessionId,
        tabId: tab.id,
        fileCount: validatedFiles.length,
        tool: tool
      };
      
    } catch (error) {
      console.error('[LocalPDF FileTransfer] ❌ Transfer failed:', error);
      throw error;
    }
  }

  /**
   * Validate uploaded files
   */
  async validateFiles(files) {
    const validFiles = [];
    
    for (const file of files) {
      // Check file type
      if (!this.supportedTypes.includes(file.type)) {
        console.warn('[LocalPDF FileTransfer] ⚠️ Unsupported file type:', file.type);
        continue;
      }
      
      // Check file size
      if (file.size > this.maxFileSize) {
        console.warn('[LocalPDF FileTransfer] ⚠️ File too large:', file.name, file.size);
        continue;
      }
      
      // Check if file is valid PDF (basic check)
      if (await this.isValidPDF(file)) {
        validFiles.push(file);
        console.log('[LocalPDF FileTransfer] ✅ File validated:', file.name);
      } else {
        console.warn('[LocalPDF FileTransfer] ⚠️ Invalid PDF file:', file.name);
      }
    }
    
    if (validFiles.length === 0) {
      throw new Error('No valid PDF files to transfer');
    }
    
    return validFiles;
  }

  /**
   * Basic PDF validation (check PDF header)
   */
  async isValidPDF(file) {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const bytes = new Uint8Array(arrayBuffer.slice(0, 4));
      const header = Array.from(bytes).map(b => String.fromCharCode(b)).join('');
      return header === '%PDF';
    } catch (error) {
      console.error('[LocalPDF FileTransfer] ❌ PDF validation error:', error);
      return false;
    }
  }

  /**
   * Serialize files for transfer (convert to base64)
   */
  async serializeFiles(files) {
    const serialized = [];
    
    for (const file of files) {
      try {
        const base64Data = await this.fileToBase64(file);
        
        serialized.push({
          name: file.name,
          type: file.type,
          size: file.size,
          lastModified: file.lastModified,
          data: base64Data
        });
        
        console.log('[LocalPDF FileTransfer] 📦 File serialized:', file.name);
      } catch (error) {
        console.error('[LocalPDF FileTransfer] ❌ Failed to serialize file:', file.name, error);
      }
    }
    
    return serialized;
  }

  /**
   * Convert file to base64
   */
  fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  /**
   * Store files temporarily for transfer
   */
  async storeForTransfer(sessionId, files, tool, options) {
    const transferData = {
      files: files,
      tool: tool,
      options: options,
      timestamp: Date.now(),
      expiry: Date.now() + (5 * 60 * 1000), // 5 minutes
      sessionId: sessionId
    };
    
    try {
      await chrome.storage.local.set({
        [`transfer_${sessionId}`]: transferData
      });
      
      console.log('[LocalPDF FileTransfer] 💾 Files stored for transfer, session:', sessionId);
      
      // Set automatic cleanup
      setTimeout(() => {
        this.cleanupSession(sessionId);
      }, 5 * 60 * 1000);
      
    } catch (error) {
      console.error('[LocalPDF FileTransfer] ❌ Failed to store files:', error);
      throw new Error('Failed to store files for transfer');
    }
  }

  /**
   * Build transfer URL for LocalPDF.online
   */
  buildTransferURL(tool, sessionId, options = {}) {
    const baseURL = 'https://localpdf.online/';
    const params = new URLSearchParams();
    
    // Core parameters
    params.set('from', 'extension');
    
    if (tool) {
      params.set('tool', tool);
    }
    
    if (sessionId) {
      params.set('session', sessionId);
    }
    
    // Additional options
    if (options.welcome) {
      params.set('welcome', 'true');
    }
    
    if (options.mode) {
      params.set('mode', options.mode);
    }
    
    const url = baseURL + '?' + params.toString();
    console.log('[LocalPDF FileTransfer] 🔗 Transfer URL built:', url);
    
    return url;
  }

  /**
   * Generate unique session ID
   */
  generateSessionId() {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 9);
    return `session_${timestamp}_${random}`;
  }

  /**
   * Clean up session data
   */
  async cleanupSession(sessionId) {
    try {
      await chrome.storage.local.remove([`transfer_${sessionId}`]);
      console.log('[LocalPDF FileTransfer] 🗑️ Session cleaned up:', sessionId);
    } catch (error) {
      console.error('[LocalPDF FileTransfer] ❌ Cleanup failed:', error);
    }
  }

  /**
   * Get storage usage statistics
   */
  async getStorageStats() {
    try {
      const storage = await chrome.storage.local.get(null);
      const transferSessions = Object.keys(storage).filter(key => key.startsWith('transfer_'));
      
      let totalSize = 0;
      let activeCount = 0;
      const now = Date.now();
      
      for (const key of transferSessions) {
        const session = storage[key];
        if (session.expiry > now) {
          activeCount++;
          totalSize += JSON.stringify(session).length;
        }
      }
      
      return {
        activeSessions: activeCount,
        totalSessions: transferSessions.length,
        estimatedSize: totalSize,
        lastCheck: now
      };
      
    } catch (error) {
      console.error('[LocalPDF FileTransfer] ❌ Stats error:', error);
      return null;
    }
  }

  /**
   * Clean up all expired sessions
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
        console.log(`[LocalPDF FileTransfer] 🧹 Cleaned up ${keysToRemove.length} expired sessions`);
      }
      
      return keysToRemove.length;
      
    } catch (error) {
      console.error('[LocalPDF FileTransfer] ❌ Bulk cleanup failed:', error);
      return 0;
    }
  }
}

// Make available globally for background script
if (typeof window !== 'undefined') {
  window.FileTransferManager = FileTransferManager;
}