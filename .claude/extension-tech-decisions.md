# Smart Launcher Technical Decisions

## Core Architecture Decisions

### 1. **File Transfer Strategy** 
**Date**: 2025-07-07  
**Decision**: Multi-strategy approach for file transfer to LocalPDF.online  
**Options Considered**:
- PostMessage API (real-time transfer)
- Chrome Storage API (temporary bridging) 
- URL-based parameters (simple cases)
- File System Access API (direct handling)

**Selected**: Hybrid approach starting with Chrome Storage + URL parameters for MVP, PostMessage for enhanced version.

**Rationale**: 
- Chrome Storage works reliably across all scenarios
- URL parameters provide simple tool pre-selection
- PostMessage adds real-time capabilities later
- Preserves privacy (no external servers)

### 2. **Manifest V3 Minimal Permissions**
**Date**: 2025-07-07  
**Decision**: Use only essential permissions for Smart Launcher  
**Required Permissions**:
```json
{
  "permissions": ["contextMenus", "storage", "activeTab"],
  "host_permissions": ["https://localpdf.online/*"]
}
```

**Rationale**: 
- contextMenus: For right-click integration
- storage: For temporary file transfer
- activeTab: For current page interaction
- host_permissions: Only for LocalPDF.online integration

### 3. **No Local PDF Processing**
**Date**: 2025-07-07  
**Decision**: Remove all pdf-lib and local processing code  
**Implications**:
- Extension size: <50KB (vs 200KB+ with pdf-lib)
- Complexity: Minimal (vs complex permission handling)
- Maintenance: Low (vs high with PDF processing)
- User Experience: Better (seamless integration with full-featured site)

### 4. **Integration Points with LocalPDF.online**
**Date**: 2025-07-07  
**Decision**: Multiple integration touchpoints  
**Implementation**:
- Context menus for PDF files
- Floating buttons on PDF pages  
- Popup quick access
- Enhanced drag & drop detection

**Site Modifications Needed**:
- Extension detection: `?from=extension` parameter
- File receiver: `window.addEventListener('message')`
- Session bridging: Check `chrome.storage` for pending files
- Tool pre-selection: `?tool=compress` parameter

### 5. **Privacy-First File Handling**
**Date**: 2025-07-07  
**Decision**: Maintain LocalPDF's privacy principles  
**Implementation**:
- Files never leave browser environment
- Temporary storage only in `chrome.storage.local`
- Automatic cleanup after transfer (60 second TTL)
- No external server communication for files

## Development Patterns

### File Transfer Pattern
```javascript
// 1. Serialize files for transfer
const transferFiles = async (files, targetTool) => {
  const fileData = await serializeFiles(files);
  
  // 2. Store temporarily in chrome.storage
  await chrome.storage.local.set({
    pendingFiles: fileData,
    targetTool: targetTool,
    sessionId: generateUniqueId(),
    expiry: Date.now() + 60000
  });
  
  // 3. Open LocalPDF with parameters
  chrome.tabs.create({
    url: `https://localpdf.online/?from=extension&tool=${targetTool}&session=${sessionId}`
  });
  
  // 4. Auto-cleanup
  setTimeout(() => {
    chrome.storage.local.remove(['pendingFiles', 'targetTool', 'sessionId']);
  }, 60000);
};
```

### Context Menu Pattern
```javascript
// 1. Create hierarchical menu
chrome.contextMenus.create({
  id: "localpdf-main",
  title: "LocalPDF",
  contexts: ["link", "page"],
  documentUrlPatterns: ["*://*/*.pdf"]
});

// 2. Add tool submenus
const tools = ['compress', 'merge', 'split', 'rotate'];
tools.forEach(tool => {
  chrome.contextMenus.create({
    id: `localpdf-${tool}`,
    parentId: "localpdf-main",
    title: `${tool.charAt(0).toUpperCase() + tool.slice(1)} PDF`
  });
});
```

## Browser Compatibility Strategy

### Chrome (Primary - Manifest V3)
- Full feature support
- File System Access API available
- Chrome Storage API optimized
- Target for initial release

### Firefox (Secondary - Manifest V2)
- Adapt manifest to V2 format
- Use different storage APIs where needed
- Test cross-browser file handling
- Planned for Phase 2

### Edge (Future - Manifest V3)
- Should work same as Chrome
- Test Edge-specific quirks
- Planned for Phase 3

## Performance Targets

- **Extension Size**: <50KB total
- **File Transfer Time**: <2 seconds for typical PDFs
- **Memory Usage**: <10MB peak
- **Load Time**: <1 second extension startup
- **Integration Success Rate**: >95% successful transfers

## Quality Assurance

### Testing Strategy
1. **Unit Tests**: Core file transfer functions
2. **Integration Tests**: End-to-end with LocalPDF.online
3. **Browser Tests**: Chrome, Firefox, Edge compatibility
4. **Performance Tests**: Large file handling
5. **User Tests**: Real-world usage scenarios

### Success Metrics
- File transfer reliability
- User experience smoothness  
- Site integration quality
- Performance benchmarks
- Privacy compliance verification
