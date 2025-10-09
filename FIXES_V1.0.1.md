# Bug Fixes v1.0.1

## ❌ Issues Fixed

### Issue #1: Unlock PDF tool doesn't exist
**Problem:** Extension had "Unlock PDF" tool which doesn't exist on localpdf.online website.

**Error:** Users would get 404 when clicking this tool.

**Solution:** ✅ Replaced with "Extract Text PDF" which exists on the website.

**Changes:**
- `src/popup/popup.html` - Changed tool card
- `src/popup/popup.js` - Updated TOOL_ROUTES mapping
- All locale files - Updated translations

**New translations:**
- EN: "Extract Text"
- RU: "Извлечь текст"
- DE: "Text extrahieren"
- FR: "Extraire le texte"
- ES: "Extraer texto"

---

### Issue #2: Service Worker registration failed (Status code 15)
**Problem:** Chrome failed to load service worker with error code 15 (syntax error).

**Root Cause:** `targetUrlPatterns` is not supported in Chrome Manifest V3 contextMenus API.

**Solution:** ✅ Removed `targetUrlPatterns` from context menu items.

**Changes:**
- `src/background/service-worker.js`
  - Removed `targetUrlPatterns` from CONTEXT_MENU_ITEMS array
  - Removed `targetUrlPatterns` from chrome.contextMenus.create() calls

**Note:** Context menus will now appear on ALL links, not just PDF links. This is a Chrome MV3 limitation. In v1.1, we can add filtering in the click handler.

---

## ✅ Verification

### Test #1: Unlock → Extract Text
1. Open extension popup
2. Verify 6th tool shows "Extract Text" (EN) or "Извлечь текст" (RU)
3. Click it → should open: `https://localpdf.online/extract-text-pdf`

### Test #2: Service Worker loads
1. Go to `chrome://extensions/`
2. Find LocalPDF extension
3. Check "Service Worker" status - should be "active"
4. Click "service worker" link → DevTools opens
5. Console should show: "LocalPDF Service Worker loaded"

### Test #3: Context menus work
1. Right-click any link on a webpage
2. Context menu should include "Open with LocalPDF" options
3. Click one → opens correct LocalPDF tool

---

## 📋 Tools List (Updated)

### Tier 1 (Top 6)
1. 🔗 Merge PDF ✅
2. ✂️ Split PDF ✅
3. 🗜️ Compress PDF ✅
4. 🔒 Protect PDF ✅
5. 📝 Extract Text PDF ✅ **(Changed from Unlock PDF)**
6. 🔍 OCR PDF ✅

### Tier 2 (Standard)
7. 📝 Add Text to PDF ✅
8. 💧 Watermark PDF ✅
9. 🔄 Rotate PDF ✅
10. 🖼️ Image to PDF ✅
11. 📄 PDF to Image ✅
12. ✏️ Edit PDF ✅

**All 12 tools verified to exist on localpdf.online**

---

## 🔄 How to Apply Fixes

### If you already loaded the extension:
```bash
cd /Users/aleksejs/Desktop/localpdf-extension

# Rebuild
npm run build

# In Chrome: chrome://extensions/
# Click "Reload" button on LocalPDF extension
```

### If loading for first time:
```bash
cd /Users/aleksejs/Desktop/localpdf-extension
npm run build

# Chrome: chrome://extensions/ → Load unpacked → select dist/
```

---

## 🚀 Status

- ✅ Both issues fixed
- ✅ Extension builds successfully
- ✅ All translations updated
- ✅ Ready for testing

---

## 📝 Future Improvements (v1.1)

### Context Menu Filtering
Currently context menus appear on ALL links. To show only on PDF links:

```javascript
// In service-worker.js, onClicked handler:
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  const linkUrl = info.linkUrl;

  // Filter PDF links
  if (!linkUrl.toLowerCase().endsWith('.pdf')) {
    console.log('Not a PDF link, ignoring');
    return;
  }

  // Continue with tool opening...
});
```

This will be added in v1.1 after MV3 research.

---

**Date:** October 9, 2025
**Version:** 1.0.1
**Status:** ✅ Ready for use
