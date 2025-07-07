# Smart Launcher File Changes Log

## Session 2: Architecture Reset (2025-07-07)

### 🚨 MAJOR ARCHITECTURE CHANGE
**From**: Local PDF Processing Extension  
**To**: Smart Launcher Bridge Extension

---

### Files to Remove/Replace:

#### ❌ Remove - Local Processing Dependencies
- [ ] `lib/pdf-processor.js` - Contains pdf-lib processing logic (NOT needed for launcher)
- [ ] All pdf-lib imports and dependencies 
- [ ] Local PDF manipulation functions
- [ ] File download mechanisms for processed PDFs

#### ❌ Remove - Outdated Documentation  
- [ ] `CSP-FIX-TESTING.md` - Related to local processing CSP issues
- [ ] `DEVELOPMENT_PLAN.md` - Old local processing development plan
- [ ] `TESTING.md` - Tests for local processing functionality
- [ ] `fix-download-method.js` - Local download mechanisms

#### ⚠️ Needs Complete Rewrite:

##### `manifest.json`
**Current**: Heavy permissions for local processing
**Target**: Minimal permissions for Smart Launcher
```json
{
  "manifest_version": 3,
  "name": "LocalPDF Smart Launcher",
  "version": "0.1.0",
  "permissions": ["contextMenus", "storage", "activeTab"],
  "host_permissions": ["https://localpdf.online/*"],
  "background": {"service_worker": "background/background.js"},
  "content_scripts": [
    {
      "matches": ["*://*/*.pdf", "file://*/*.pdf", "*://*/*"],
      "js": ["content/content.js"]
    }
  ],
  "action": {
    "default_popup": "popup/popup.html"
  }
}
```

##### `background/background.js`
**Current**: PDF processing coordination
**Target**: File transfer and context menu management
```javascript
// Smart Launcher background script
// 1. Context menu setup
// 2. File transfer coordination  
// 3. Tab management for LocalPDF.online
// 4. Storage cleanup
```

##### `popup/popup.html` & `popup/popup.js`
**Current**: Local processing controls
**Target**: Quick launcher with tool shortcuts
```html
<!-- Simple popup with direct links to LocalPDF.online tools -->
<div class="launcher-popup">
  <h3>LocalPDF Tools</h3>
  <button data-tool="compress">Compress PDF</button>
  <button data-tool="merge">Merge PDFs</button>
  <button data-tool="split">Split PDF</button>
  <!-- etc. -->
</div>
```

##### `content/content.js`
**Current**: PDF detection for local processing
**Target**: PDF page integration with LocalPDF.online launcher
```javascript
// Smart Launcher content script
// 1. Detect PDF pages
// 2. Inject floating LocalPDF button
// 3. Handle PDF link enhancement
// 4. Coordinate with background for file transfer
```

---

### Files to Create/Update:

#### ✅ Create - File Transfer Infrastructure

##### `lib/file-transfer.js`
```javascript
// Core file transfer utilities
// - serializeFiles() for chrome.storage
// - transferToLocalPDF() main coordination
// - cleanupStorage() automatic cleanup
```

##### `lib/site-integration.js`  
```javascript
// LocalPDF.online integration
// - buildIntegrationURL() with parameters
// - detectExtensionLaunch() on site
// - handleFileReceiver() messaging
```

##### `lib/storage-bridge.js`
```javascript
// Temporary storage management
// - storeFilesTemporarily() 
// - retrievePendingFiles()
// - autoCleanup() with TTL
```

#### ✅ Create - Content Integration

##### `content/pdf-detector.js`
```javascript
// PDF detection and UI injection
// - isPDFPage() detection
// - injectFloatingButton() UI
// - enhancePDFLinks() page links
```

#### ✅ Update - Assets
- Update icons to reflect "launcher" concept
- Simpler popup styling for quick access
- Remove processing-related assets

---

### README.md Complete Rewrite

**Target**: Smart Launcher focused documentation
```markdown
# LocalPDF Smart Launcher Extension

Bridge between your browser and LocalPDF.online for seamless PDF processing.

## What it does:
- Right-click any PDF → Open in LocalPDF
- Floating button on PDF pages  
- Quick access to all LocalPDF tools
- Preserves privacy (files transferred locally)

## What it doesn't do:
- No local PDF processing
- No file uploads to servers
- No duplicate functionality
```

---

### Current Status: 🔄 PLANNING PHASE

**Next Steps**:
1. ✅ Memory system updated
2. ⏳ Remove old files (in progress)
3. ⏳ Create new Smart Launcher manifest
4. ⏳ Implement file transfer utilities
5. ⏳ Build context menu system
6. ⏳ Create site integration
7. ⏳ Test end-to-end flow

**Goal**: Complete Smart Launcher MVP within this session.
