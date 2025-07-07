# LocalPDF Smart Launcher Extension v1.0.0

> 🚀 **The fastest way to access LocalPDF.online** - Seamlessly transfer PDF files to privacy-focused tools with just a right-click.

<div align="center">

![Extension Demo](https://img.shields.io/badge/Status-Chrome%20Store%20Ready-brightgreen) ![Privacy First](https://img.shields.io/badge/Privacy-First-blue) ![No Data Collection](https://img.shields.io/badge/Data%20Collection-None-green) ![Manifest V3](https://img.shields.io/badge/Manifest-V3-orange)

**[🎯 Chrome Web Store (Coming Soon)](#installation) | [📚 Documentation](#documentation) | [🔒 Privacy Policy](PRIVACY.md) | [🛠️ Development](DEVELOPMENT_PLAN.md)**

</div>

## ✨ What LocalPDF Smart Launcher Does

LocalPDF Smart Launcher is a **lightweight bridge extension** that seamlessly connects your browser with [LocalPDF.online](https://localpdf.online), giving you instant access to powerful PDF tools while maintaining complete privacy.

### 🎯 **Core Features**

- **🖱️ Right-Click Integration**: Right-click any PDF file → "Open in LocalPDF"
- **🔘 Floating Button**: Automatic button appears on PDF pages for quick access
- **⚡ Quick Launcher**: One-click access to all LocalPDF tools via popup
- **🔒 Privacy-First**: Files transferred locally within your browser only
- **🎯 Tool Pre-selection**: Direct access to specific tools (compress, merge, split, etc.)
- **🚀 Smart Launcher**: Lightweight bridge to full-featured LocalPDF.online

### 🛠️ **Available Tools**

All tools from [LocalPDF.online](https://localpdf.online) are instantly accessible:

| Tool | Description | Use Case |
|------|-------------|----------|
| **📦 Compress PDF** | Reduce file size while maintaining quality | Share via email, reduce storage |
| **🔗 Merge PDFs** | Combine multiple PDFs into one | Combine reports, create portfolios |
| **✂️ Split PDF** | Extract pages or split into multiple files | Separate chapters, extract sections |
| **🔄 Rotate PDF** | Fix orientation issues | Correct scanned documents |
| **🔓 Unlock PDF** | Remove password protection | Access protected documents |
| **🔒 Protect PDF** | Add password protection | Secure sensitive documents |
| **📝 Extract Text** | Copy text content from PDFs | Data extraction, content reuse |
| **🖼️ PDF to Image** | Convert pages to PNG/JPG | Create thumbnails, web graphics |
| **📄 Organize PDF** | Reorder and organize pages | Restructure documents |

## 🔐 Privacy & Security Promise

### **Your Files Never Leave Your Browser**
```
Your PDF File → Extension → LocalPDF.online Tab → Processed Locally → Download Result
     ↑                                                                        ↓
   Your Device ←←←←←←←←←←←←← Files Never Leave Browser ←←←←←←←←←←←←← Your Device
```

### **What We DON'T Collect**
- ❌ No personal information
- ❌ No file content or metadata
- ❌ No usage analytics or tracking
- ❌ No browsing history
- ❌ No device information
- ❌ No location data

### **How Privacy is Maintained**
- ✅ **Local Processing**: All PDF operations happen in your browser
- ✅ **No Server Uploads**: Files are never sent to external servers
- ✅ **Secure Transfer**: Files transferred between browser tabs using secure APIs
- ✅ **Automatic Cleanup**: Temporary data automatically removed after 5 minutes
- ✅ **Minimal Permissions**: Only essential browser capabilities requested

## 🚀 How It Works

### **Method 1: Context Menu (Right-click)**
1. Right-click any PDF file on web pages
2. Select "LocalPDF" from the context menu
3. Choose your desired tool (Compress, Merge, Split, etc.)
4. LocalPDF.online opens with your file ready to process

### **Method 2: Floating Button**
1. Open any PDF in your browser
2. Look for the floating LocalPDF button
3. Click to transfer the PDF to LocalPDF.online
4. Choose your tool and process

### **Method 3: Extension Popup**
1. Click the LocalPDF Smart Launcher icon in your toolbar
2. Choose your tool from the popup
3. LocalPDF.online opens ready for file selection

## 📥 Installation

### **Chrome Web Store (Recommended)**
*Coming Soon - Under Review*

### **Developer Mode Installation**
1. Download or clone this repository
2. Open Chrome → Settings → Extensions
3. Enable "Developer mode"
4. Click "Load unpacked" → Select the extension folder
5. The LocalPDF Smart Launcher icon will appear in your toolbar

### **Requirements**
- Chrome 88+ (Manifest V3 support)
- Edge 88+ (Chromium-based)
- Firefox support planned for future release

## 🎯 Smart Launcher Architecture

### **Why Smart Launcher?**
Instead of processing PDFs locally in the extension, LocalPDF Smart Launcher acts as a bridge to the full-featured LocalPDF.online platform:

```
Traditional Extension                    Smart Launcher Extension
┌─────────────────────┐                 ┌─────────────────────┐
│ Extension (200KB+)  │                 │ Extension (50KB)    │
│ ├─ PDF processing   │                 │ ├─ File transfer    │
│ ├─ Heavy libraries  │        VS       │ ├─ UI integration   │
│ ├─ Limited features │                 │ └─ Smart redirection│
│ └─ Update issues    │                 └─────────────────────┘
└─────────────────────┘                           ↓
                                       ┌─────────────────────┐
                                       │ LocalPDF.online     │
                                       │ ├─ All 9 tools      │
                                       │ ├─ Latest features  │
                                       │ ├─ Local processing │
                                       │ └─ Always updated   │
                                       └─────────────────────┘
```

### **Benefits of Smart Launcher Approach**
- **🪶 Lightweight**: <50KB vs 200KB+ for local processing extensions
- **🔄 Always Updated**: Access latest tools without extension updates
- **🛠️ Full Featured**: All LocalPDF.online capabilities available
- **⚡ Reliable**: Leverages proven LocalPDF.online platform
- **🌍 Cross-platform**: Consistent experience across all operating systems

## 🏗️ Technical Details

### **Architecture**
- **Manifest V3**: Latest Chrome extension standard
- **Service Worker**: Efficient background processing
- **Content Scripts**: PDF detection and page integration
- **PostMessage API**: Secure file transfer between tabs
- **Chrome Storage API**: Temporary file bridging for large files

### **File Transfer Strategies**
1. **PostMessage API** (Primary): Real-time transfer for immediate processing
2. **Chrome Storage API** (Fallback): For large files or PostMessage failures
3. **URL Parameters**: Tool pre-selection and session management

### **Browser Compatibility**
- **Chrome**: ✅ Full support (Manifest V3)
- **Edge**: ✅ Full support (Chromium-based)
- **Firefox**: 🔄 Planned (requires Manifest V2 adaptation)

## 📚 Documentation

### **User Guides**
- **[Installation Guide](INSTALLATION.md)** - Step-by-step setup instructions
- **[Privacy Policy](PRIVACY.md)** - Complete privacy and data handling information
- **[Chrome Store Guide](CHROME_STORE_GUIDE.md)** - Chrome Web Store submission details

### **Technical Documentation**
- **[Development Plan](DEVELOPMENT_PLAN.md)** - Technical architecture and development approach
- **[Testing Guide](TESTING.md)** - Testing procedures and quality assurance

### **Integration Documentation**
- **Site Integration** - Ready for deployment to LocalPDF.online
- **API Documentation** - Extension integration points and communication protocols

## 🤝 Contributing

### **Development Setup**
```bash
# Clone the repository
git clone https://github.com/ulinycoin/localpdf-extension.git
cd localpdf-extension

# Load in Chrome for development
# 1. Open chrome://extensions/
# 2. Enable Developer mode
# 3. Click "Load unpacked"
# 4. Select the extension folder
```

### **Project Structure**
```
extension/
├── manifest.json           # Manifest V3 configuration
├── background/             # Service worker and background logic
├── content/               # PDF detection and site integration
├── popup/                 # Quick launcher interface
├── lib/                   # File transfer and integration utilities
├── assets/                # Icons and resources
└── .claude/               # Development memory and documentation
```

## 🔗 Related Projects

- **[LocalPDF.online](https://localpdf.online)** - The main PDF processing platform
- **[ClientPDF Pro](https://github.com/ulinycoin/clientpdf-pro)** - LocalPDF.online source code

## 📈 Roadmap

### **Version 1.0.0** (Current)
- ✅ Smart Launcher architecture
- ✅ Chrome Web Store ready
- ✅ Complete LocalPDF.online integration
- ✅ Privacy-first design

### **Version 1.1.0** (Planned)
- 🔄 Firefox support (Manifest V2)
- 🔄 Enhanced UI/UX improvements
- 🔄 Additional integration features
- 🔄 Performance optimizations

### **Version 1.2.0** (Future)
- ⏳ Batch processing support
- ⏳ Advanced tool presets
- ⏳ Enhanced drag & drop
- ⏳ Keyboard shortcuts

## 🆘 Support

- **Issues**: [GitHub Issues](https://github.com/ulinycoin/localpdf-extension/issues)
- **Feature Requests**: [GitHub Discussions](https://github.com/ulinycoin/localpdf-extension/discussions)
- **LocalPDF Support**: [LocalPDF.online](https://localpdf.online)

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🏆 Acknowledgments

- **LocalPDF.online** - For providing the powerful PDF processing platform
- **Chrome Extension Community** - For Manifest V3 best practices and guidance
- **Privacy-First Movement** - For inspiring our commitment to user privacy

---

<div align="center">

**Made with ❤️ for privacy-conscious PDF users**

*Part of the LocalPDF ecosystem - Processing PDFs locally since 2024*

**[🚀 Ready to launch on Chrome Web Store!](CHROME_STORE_GUIDE.md)**

</div>