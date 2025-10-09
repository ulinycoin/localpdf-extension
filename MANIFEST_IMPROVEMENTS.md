# Manifest.json Improvements

## Changes Made

### 1. Added `"type": "module"` to background service worker
**Line 23:** `"type": "module"`

**Why?**
- Modern Chrome extensions support ES6 modules in service workers
- Allows use of `import`/`export` syntax (if needed in future)
- Better compatibility with modern JavaScript features
- Recommended by Chrome Extension docs for new projects

**Before:**
```json
"background": {
  "service_worker": "background/service-worker.js"
}
```

**After:**
```json
"background": {
  "service_worker": "background/service-worker.js",
  "type": "module"
}
```

---

### 2. Added `"storage"` permission
**Line 28:** `"storage"`

**Why?**
- Extension uses `chrome.storage.sync` to save language preference
- Extension uses `chrome.storage.local` for tool usage statistics
- Without this permission, storage API won't work

**Before:**
```json
"permissions": [
  "contextMenus",
  "notifications"
]
```

**After:**
```json
"permissions": [
  "contextMenus",
  "notifications",
  "storage"
]
```

---

## Final Manifest (Validated)

```json
{
  "manifest_version": 3,
  "name": "__MSG_extensionName__",
  "description": "__MSG_extensionDescription__",
  "version": "1.0.0",
  "default_locale": "en",
  "icons": {
    "16": "icons/icon-16.png",
    "48": "icons/icon-48.png",
    "128": "icons/icon-128.png"
  },
  "action": {
    "default_popup": "popup/popup.html",
    "default_icon": {
      "16": "icons/icon-16.png",
      "48": "icons/icon-48.png",
      "128": "icons/icon-128.png"
    },
    "default_title": "__MSG_extensionName__"
  },
  "background": {
    "service_worker": "background/service-worker.js",
    "type": "module"
  },
  "permissions": [
    "contextMenus",
    "notifications",
    "storage"
  ],
  "host_permissions": [
    "https://localpdf.online/*"
  ],
  "content_security_policy": {
    "extension_pages": "script-src 'self'; object-src 'self'"
  }
}
```

---

## Benefits

1. ✅ **Better compatibility** - `type: "module"` is modern standard
2. ✅ **Storage works** - Language preference saves correctly
3. ✅ **Future-proof** - Ready for ES6 imports if needed
4. ✅ **Cleaner code** - Proper permissions declared upfront

---

## Testing After Changes

### Test storage permission:
1. Load extension
2. Change language in popup (EN → RU)
3. Close popup
4. Re-open popup
5. ✅ Language should be remembered (RU)

### Test service worker:
1. Go to `chrome://extensions/`
2. Find LocalPDF
3. Service Worker should show "active"
4. Click "service worker" link → Console should show no errors

---

**Status:** ✅ Manifest optimized and validated
**Date:** October 9, 2025
