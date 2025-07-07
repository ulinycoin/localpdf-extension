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