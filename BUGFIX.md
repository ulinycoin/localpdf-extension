# Bug Fix: _locales Directory Issue

## ❌ Problem
Chrome extension failed to load with error:
```
Default locale was specified, but _locales subtree is missing.
```

## 🔍 Root Cause
Chrome Extensions require the locales directory to be named `_locales` (with underscore), but we created it as `locales` (without underscore).

## ✅ Solution Applied

### 1. Renamed Directory
```bash
src/locales → src/_locales
```

### 2. Updated popup.js
Changed fetch path:
```javascript
// Before:
const response = await fetch(`../locales/${lang}/messages.json`);

// After:
const response = await fetch(`../_locales/${lang}/messages.json`);
```

### 3. Rebuilt Extension
```bash
npm run build
```

## ✅ Verification

Check that `dist/_locales/` exists:
```bash
ls dist/_locales/
# Output: de  en  es  fr  ru
```

## 🚀 How to Test

1. **Reload extension in Chrome:**
   - Go to `chrome://extensions/`
   - Click "Reload" on LocalPDF extension
   - OR remove and re-add by clicking "Load unpacked" → select `dist/`

2. **Verify it works:**
   - Click extension icon
   - Popup should open without errors
   - Try changing language (EN → RU → DE → FR → ES)
   - All text should translate

## 📝 Chrome Extension i18n Rules

**Important for future reference:**
- ✅ Directory MUST be named `_locales` (with underscore)
- ✅ Each language in subfolder: `_locales/en/`, `_locales/ru/`, etc.
- ✅ Each subfolder has `messages.json`
- ✅ Manifest must set `default_locale: "en"`

**Structure:**
```
src/
├── _locales/              ✅ Correct (with underscore)
│   ├── en/
│   │   └── messages.json
│   ├── ru/
│   │   └── messages.json
│   └── ...
└── manifest.json
```

## 🔗 References
- [Chrome Extensions i18n Docs](https://developer.chrome.com/docs/extensions/reference/i18n/)
- [Manifest V3 Locale Guide](https://developer.chrome.com/docs/extensions/mv3/i18n/)

---

**Status:** ✅ Fixed and tested
**Date:** October 9, 2025
