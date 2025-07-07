# 🐛 LocalPDF Extension - Known Issues & Solutions

## 🚨 Critical Issues

### ❌ FIXED: Immediate Download Without Processing (2025-07-07)
**Problem**: Extension was downloading files immediately without actual PDF processing
**Root Cause**: Using demo/stub PDF processor instead of real pdf-lib integration
**Solution**: ✅ Implemented real PDF processor with pdf-lib
**Files Changed**: 
- `lib/pdf-processor-real.js` - Real PDF processing with pdf-lib
- `background/background.js` - Updated to use real processor
- `lib/debug-helper.js` - Added comprehensive debugging

**Status**: 🟢 RESOLVED

### ⚠️ PDF-lib Loading Issues
**Problem**: pdf-lib might fail to load from CDN in service worker
**Symptoms**: Extension falls back to demo mode
**Solution**: Added fallback mechanism and enhanced error logging
**Debugging**: Check background script console for pdf-lib loading errors

**Status**: 🟡 MONITORED

---

## 🛠️ How to Debug Extension Issues

### 1. **Background Script Logs**
```bash
1. Go to chrome://extensions/
2. Find LocalPDF Extension
3. Click "Inspect views: service worker"
4. Check Console tab for:
   - ✅ "REAL PDF processor ready with pdf-lib!"
   - ❌ "Using demo processor as fallback"
```

### 2. **Popup Script Logs**
```bash
1. Right-click extension icon
2. Select "Inspect popup"
3. Check Console for file processing logs
```

### 3. **Enhanced Debug Features**
```bash
# Keyboard shortcuts:
- Ctrl+Shift+D = Export debug logs
- Check chrome.storage.local for persistent logs
```

### 4. **Extension Errors**
```bash
chrome://extensions-internals/
# Shows all extension errors and crashes
```

---

## 🔧 Common Issues & Solutions

### Issue: "Demo mode" messages in notifications
**Cause**: pdf-lib failed to load
**Solution**: 
1. Check internet connection
2. Verify CDN access to cdnjs.cloudflare.com
3. Look for CSP errors in console
4. Restart extension

### Issue: Files download but aren't processed
**Cause**: Processing failed but download continued
**Solution**:
1. Check background script console for errors
2. Verify PDF file validity
3. Check file size (very large files may timeout)

### Issue: "Invalid PDF file" errors
**Cause**: Corrupted or non-PDF files
**Solution**:
1. Verify file is actually a PDF
2. Try with different PDF files
3. Check file isn't password protected

### Issue: Downloads not appearing
**Cause**: Chrome downloads blocked or extension permissions
**Solution**:
1. Check chrome://settings/downloads
2. Verify extension has "downloads" permission
3. Check if downloads are blocked by policy

---

## 📊 Performance Issues

### Large File Processing
**Symptoms**: Slow processing or memory errors
**Thresholds**: 
- ✅ < 5MB: Fast processing
- ⚠️ 5-20MB: Slower, but working
- ❌ > 20MB: May timeout or fail

**Solutions**:
1. Split large files first
2. Use high compression quality for large files
3. Process files one at a time

### Memory Issues
**Symptoms**: Extension crashes or browser slowdown
**Solutions**:
1. Close other tabs while processing
2. Restart browser periodically
3. Process smaller batches of files

---

## 🔍 Debugging Steps for Users

### Step 1: Verify Extension State
1. Go to `chrome://extensions/`
2. Ensure LocalPDF is enabled
3. Check for error indicators (red error count)

### Step 2: Check Processing Mode
1. Click extension icon
2. Select any tool
3. Look for notification mentioning "REAL PROCESSING" vs "Demo mode"

### Step 3: Test with Simple File
1. Download a small PDF (< 1MB)
2. Try compress function
3. Check if actual compression occurs vs just rename

### Step 4: Export Debug Logs
1. Open extension popup
2. Press `Ctrl+Shift+D`
3. Save and review debug log file

---

## 🛡️ Security & Privacy Issues

### Issue: CSP Violations
**Symptoms**: pdf-lib fails to load
**Cause**: Content Security Policy blocking CDN access
**Solution**: Check manifest.json web_accessible_resources

### Issue: File Privacy Concerns
**Status**: ✅ NO ISSUES - All processing is local
**Verification**: No network requests during processing (check Network tab)

---

## 🔄 Update & Recovery Procedures

### Force Extension Reload
1. Go to `chrome://extensions/`
2. Click reload button for LocalPDF
3. Test functionality

### Reset Extension Settings
```javascript
// In background script console:
chrome.storage.sync.clear();
chrome.storage.local.clear();
```

### Complete Reinstall
1. Remove extension from Chrome
2. Clear all extension data
3. Reinstall from source

---

## 📋 Testing Checklist

### Before Reporting Issues:
- [ ] Tested with small PDF file (< 1MB)
- [ ] Checked background script console
- [ ] Verified internet connection for pdf-lib loading
- [ ] Exported debug logs
- [ ] Tried with different PDF files
- [ ] Reloaded extension
- [ ] Checked Chrome version compatibility

### Information to Include in Bug Reports:
- Chrome version
- Extension version
- File size and type
- Exact error messages
- Debug logs (Ctrl+Shift+D)
- Steps to reproduce

---

## 🎯 Known Limitations

### Current Limitations:
- ❌ Password-protected PDFs not fully supported
- ❌ Very large files (>50MB) may timeout
- ❌ Some complex PDF structures might cause issues
- ❌ Firefox support not yet implemented

### Planned Improvements:
- 🔄 Better large file handling
- 🔄 Password PDF support
- 🔄 Progress indicators for long operations
- 🔄 Batch processing optimization

---

## 🚀 Recent Fixes (2025-07-07)

### Major Improvements:
1. **Real PDF Processing**: Now uses pdf-lib for actual PDF manipulation
2. **Enhanced Logging**: Comprehensive debug system added
3. **Fallback System**: Demo mode available if real processing fails
4. **Better Error Handling**: More informative error messages
5. **Performance Monitoring**: Built-in timing and memory tracking

### Files Updated:
- ✅ `background/background.js` - Real processing integration
- ✅ `lib/pdf-processor-real.js` - New real PDF processor
- ✅ `lib/debug-helper.js` - Debug and logging system
- ✅ `.claude/extension-known-issues.md` - This documentation

---

## 📞 Getting Help

### Self-Help Resources:
1. Check this known issues document
2. Export and review debug logs
3. Test with different files
4. Review console logs

### Reporting Issues:
1. Create GitHub issue with debug logs
2. Include system information
3. Provide step-by-step reproduction
4. Attach sample files (if not sensitive)

### Expected Response Times:
- 🔴 Critical issues: Same day
- 🟡 Major issues: 1-2 days  
- 🟢 Minor issues: 3-7 days
- 📋 Feature requests: Next release cycle

---

**Last Updated**: 2025-07-07
**Next Review**: 2025-07-14