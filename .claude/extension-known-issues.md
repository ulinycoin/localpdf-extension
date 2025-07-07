# Smart Launcher Known Issues & Considerations

## Architecture Migration Issues

### 1. **Legacy Code Cleanup Required**
**Issue**: Current codebase contains local PDF processing logic that conflicts with Smart Launcher approach  
**Impact**: Confusing codebase, unnecessary dependencies, wrong user expectations  
**Solution**: Complete removal of pdf-lib dependencies and local processing code  
**Priority**: Critical - Must be done first  

### 2. **Site Integration Dependencies**
**Issue**: LocalPDF.online needs modifications to receive files from extension  
**Impact**: Extension won't work until site integration is complete  
**Considerations**:
- Need to add extension detection on LocalPDF.online
- File receiver mechanism via PostMessage or Storage API
- Tool pre-selection via URL parameters
**Priority**: Critical - Required for basic functionality

### 3. **Cross-Browser Compatibility Challenges**
**Issue**: File transfer mechanisms may work differently across browsers  
**Specifics**:
- Chrome: Full File System Access API support
- Firefox: Limited file handling, different storage APIs
- Edge: Should work like Chrome but needs testing
**Priority**: Medium - Start with Chrome, expand later

## Technical Challenges

### 4. **File Serialization for Transfer**
**Issue**: Converting File objects for chrome.storage and PostMessage transfer  
**Technical Details**:
- File objects can't be directly serialized to JSON
- Need to convert to ArrayBuffer or base64
- Large files may hit storage limits
- Async operations require careful error handling
**Solution Approach**:
```javascript
const serializeFiles = async (files) => {
  const serialized = [];
  for (const file of files) {
    const arrayBuffer = await file.arrayBuffer();
    serialized.push({
      name: file.name,
      type: file.type,
      size: file.size,
      data: Array.from(new Uint8Array(arrayBuffer))
    });
  }
  return serialized;
};
```

### 5. **Chrome Storage Size Limits**
**Issue**: Chrome storage has size limitations that may affect large PDF transfers  
**Limits**:
- chrome.storage.local: 5MB default (can request more)
- chrome.storage.sync: 100KB only
**Mitigation**:
- Use PostMessage for large files
- Implement file chunking if needed
- Auto-cleanup to prevent storage bloat
- Request unlimited storage permission if needed

### 6. **Context Menu PDF Detection**
**Issue**: Reliably detecting PDF files for context menu display  
**Challenges**:
- File extensions aren't always reliable  
- Some PDFs served without .pdf extension
- Need to handle both local files and web URLs
- Different MIME type handling across browsers
**Solution**: Multi-method detection approach

### 7. **Privacy and Security Considerations**
**Issue**: Ensuring file transfer maintains LocalPDF's privacy-first approach  
**Requirements**:
- Files must never leave the browser environment
- No external server communication for file data
- Temporary storage must have automatic cleanup
- User must be informed about the transfer process
**Implementation**: Strict local-only file handling with clear user communication

## User Experience Challenges

### 8. **Seamless Integration Expectations**
**Issue**: Users expect instant, seamless integration between extension and site  
**Challenges**:
- Loading time between extension action and site response
- File transfer feedback and progress indication
- Error handling when site is unavailable
- Clear indication of what's happening during transfer
**Priority**: High - Critical for user adoption

### 9. **Tool Pre-selection Accuracy**
**Issue**: Correctly mapping extension actions to LocalPDF.online tools  
**Details**:
- Context menu "Compress PDF" should open compression tool
- URL parameters must match site's tool routing
- Default behavior when no specific tool selected
- Handling tools that aren't available on the site yet

### 10. **Offline Usage Limitations**
**Issue**: Smart Launcher requires LocalPDF.online to be accessible  
**Impact**: Extension unusable when offline or site is down  
**Mitigation**:
- Clear error messages when site unavailable
- Graceful degradation to simple site opening
- Consider basic fallback functionality (future consideration)

## Development & Testing Issues

### 11. **Extension Testing Complexity**
**Issue**: Testing Smart Launcher requires both extension and site integration  
**Challenges**:
- Need LocalPDF.online development environment
- End-to-end testing across browser tab boundaries
- Testing file transfer reliability
- Testing with various PDF file types and sizes
**Solution**: Develop local testing environment with site simulation

### 12. **Chrome Web Store Approval**
**Issue**: Smart Launcher approach may need different store submission strategy  
**Considerations**:
- Permissions explanation for reviewers
- Clear description of extension purpose and functionality
- Privacy policy updates for file transfer mechanism
- Demo material showing integration with LocalPDF.online

## Future Considerations

### 13. **LocalPDF.online Site Dependencies**
**Issue**: Extension tightly coupled to specific site implementation  
**Risks**:
- Site changes could break extension
- Need coordination between extension and site development
- Version compatibility concerns
**Mitigation**: Robust error handling and graceful degradation

### 14. **Advanced Features Integration**
**Issue**: Some advanced LocalPDF features may be hard to integrate  
**Examples**:
- Batch operations with multiple files
- Complex workflows across multiple tools
- User preferences and settings synchronization
**Approach**: Start simple, iterate based on user feedback

---

## Resolution Tracking

✅ **Resolved**: Memory system setup for Smart Launcher approach  
🔄 **In Progress**: Legacy code cleanup and architecture migration  
⏳ **Planned**: Site integration development  
⏳ **Planned**: File transfer mechanism implementation  
⏳ **Future**: Cross-browser compatibility testing

---

**Note**: This is a living document. Issues will be updated as development progresses and new challenges are discovered.
