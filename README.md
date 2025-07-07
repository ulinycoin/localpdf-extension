# LocalPDF Smart Launcher Extension

> 🚀 **Bridge between your browser and LocalPDF.online** - The fastest way to process PDFs with privacy-first tools.

## What it does

**LocalPDF Smart Launcher** is a lightweight browser extension that seamlessly connects your browser with [LocalPDF.online](https://localpdf.online), giving you instant access to powerful PDF tools while maintaining complete privacy.

### ✨ Key Features

- **🖱️ Right-Click Integration**: Right-click any PDF file → "Open in LocalPDF"
- **🔘 Floating Button**: Automatic button on PDF pages for quick access
- **⚡ Quick Launcher**: One-click access to all LocalPDF tools
- **🔒 Privacy-First**: Files transferred locally within your browser only
- **🎯 Tool Pre-selection**: Direct access to specific tools (compress, merge, split, etc.)

## How it works

```
Your Browser → Smart Launcher → LocalPDF.online → Process Locally
     ↑                                               ↓
   PDF File                                    Processed Result
```

1. **You**: Right-click a PDF or use the extension popup
2. **Extension**: Transfers the file securely to LocalPDF.online
3. **LocalPDF.online**: Processes your file locally in the browser
4. **You**: Download the processed result

**🔐 Privacy Promise**: Your files never leave your browser. The extension only facilitates the transfer between browser tabs - no servers, no uploads, no tracking.

## Installation

### Chrome Web Store (Recommended)
*Coming soon - under review*

### Developer Mode Installation
1. Download or clone this repository
2. Open Chrome → Settings → Extensions
3. Enable "Developer mode"
4. Click "Load unpacked" → Select the extension folder
5. The LocalPDF Smart Launcher icon will appear in your toolbar

## Usage

### Method 1: Context Menu (Right-click)
1. Right-click any PDF file (on web pages or local files)
2. Select "LocalPDF" from the context menu
3. Choose your desired tool (Compress, Merge, Split, etc.)
4. LocalPDF.online opens with your file ready to process

### Method 2: Floating Button
1. Open any PDF in your browser
2. Look for the floating LocalPDF button
3. Click to transfer the PDF to LocalPDF.online

### Method 3: Extension Popup
1. Click the LocalPDF Smart Launcher icon
2. Choose your tool
3. LocalPDF.online opens ready for file selection

## Supported Tools

All tools from [LocalPDF.online](https://localpdf.online) are accessible:

- **📦 Compress PDF** - Reduce file size while maintaining quality
- **🔗 Merge PDFs** - Combine multiple PDFs into one
- **✂️ Split PDF** - Extract pages or split into multiple files
- **🔄 Rotate PDF** - Fix orientation issues
- **📝 Add Text** - Insert text annotations and labels
- **🏷️ Watermark** - Brand your documents
- **📄 Extract Pages** - Save specific pages as new PDFs
- **📋 Extract Text** - Copy text content from PDFs
- **🖼️ PDF to Image** - Convert pages to PNG/JPG

## Technical Details

### Smart Launcher Architecture
This extension is a **Smart Launcher** - it doesn't process PDFs locally but instead provides seamless integration with LocalPDF.online:

- **Lightweight**: <50KB (vs 200KB+ for local processing extensions)
- **Reliable**: Leverages the full-featured LocalPDF.online platform
- **Updated**: Always uses the latest LocalPDF tools and features
- **Cross-platform**: Works consistently across all operating systems

### Privacy & Security
- ✅ **No external servers** - Files transferred only between browser tabs
- ✅ **No data collection** - Zero telemetry or analytics
- ✅ **Minimal permissions** - Only essential browser capabilities
- ✅ **Open source** - Full transparency in code and functionality
- ✅ **Local processing** - All PDF operations happen in your browser

### Browser Compatibility
- **Chrome**: Full support (Manifest V3)
- **Edge**: Full support (Manifest V3)
- **Firefox**: Planned (Manifest V2 adaptation needed)

## Development

### Project Structure
```
extension/
├── manifest.json           # Minimal Manifest V3 configuration
├── background/             # Context menus and file transfer coordination
│   └── background.js       
├── content/                # PDF detection and page integration
│   ├── content.js          
│   └── pdf-detector.js     
├── popup/                  # Quick launcher interface
│   ├── popup.html          
│   ├── popup.js            
│   └── popup.css           
├── lib/                    # File transfer utilities
│   ├── file-transfer.js    
│   ├── site-integration.js 
│   └── storage-bridge.js   
└── assets/                 # Icons and resources
    └── icons/              
```

### Local Development
```bash
# Clone the repository
git clone https://github.com/ulinycoin/localpdf-extension.git
cd localpdf-extension

# Load in Chrome
# 1. Open chrome://extensions/
# 2. Enable Developer mode
# 3. Click "Load unpacked"
# 4. Select the extension folder
```

## Related Projects

- **[LocalPDF.online](https://localpdf.online)** - The main PDF processing platform
- **[ClientPDF Pro](https://github.com/ulinycoin/clientpdf-pro)** - LocalPDF.online source code

## Support

- **Issues**: [GitHub Issues](https://github.com/ulinycoin/localpdf-extension/issues)
- **Features**: [Feature Requests](https://github.com/ulinycoin/localpdf-extension/discussions)
- **LocalPDF Support**: [LocalPDF.online](https://localpdf.online)

## License

MIT License - see [LICENSE](LICENSE) file for details.

---

**Made with ❤️ for privacy-conscious PDF users**  
*Part of the LocalPDF ecosystem*
