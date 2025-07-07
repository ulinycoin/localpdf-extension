# 🔒 LocalPDF Browser Extension

<div align="center">

![LocalPDF Extension](https://img.shields.io/badge/LocalPDF-Extension-blue?style=for-the-badge&logo=chrome)
![Version](https://img.shields.io/badge/version-0.1.0-green?style=for-the-badge)
![Status](https://img.shields.io/badge/Status-WORKING-success?style=for-the-badge)
![Privacy](https://img.shields.io/badge/Privacy-First-success?style=for-the-badge&logo=shield)
![Local Processing](https://img.shields.io/badge/100%25-Local%20Processing-orange?style=for-the-badge)

**✅ FULLY FUNCTIONAL privacy-focused PDF tools that work entirely in your browser**

[🚀 Install Extension](#installation) • [📖 Features](#features) • [🧪 Test Now](#testing) • [🛠️ Development](#development)

</div>

---

## 🌟 Overview

LocalPDF Browser Extension brings powerful PDF tools directly to your browser with **zero privacy compromise**. All processing happens locally - your files never leave your device.

**🎉 NEW: Real PDF processing is now working!** We've integrated pdf-lib for actual PDF manipulation.

**Parent Project**: [LocalPDF Web App](https://github.com/ulinycoin/clientpdf-pro) - This extension ports the web app functionality into a convenient browser extension.

### ✨ Why LocalPDF Extension?

- 🔒 **100% Privacy**: All processing happens locally in your browser
- ⚡ **Fast & Efficient**: No upload/download delays
- 🎯 **Context-Aware**: Detects PDFs on web pages automatically
- 🛡️ **Secure**: No data transmission to external servers
- 🎨 **Clean UI**: Modern, intuitive interface
- ⌨️ **Keyboard Shortcuts**: Quick access with hotkeys
- ✅ **Actually Works**: Real PDF processing with pdf-lib

---

## 📖 Features

### ✅ **Working Now - Essential Tools:**
- **🔗 Merge PDFs**: Combine multiple PDF files into one *(WORKING)*
- **✂️ Split PDF**: Extract individual pages or ranges *(WORKING)*
- **🗜️ Compress PDF**: Reduce file size while maintaining quality *(WORKING)*

### 🟡 **Coming Soon - Advanced Tools:**
- **📝 Add Text**: Insert text annotations and labels
- **🏷️ Add Watermark**: Brand your documents with watermarks
- **🔄 Rotate Pages**: Fix page orientation issues

### 🟢 **Planned - Utility Tools:**
- **📄 Extract Pages**: Save specific pages as new PDFs
- **📋 Extract Text**: Copy text content from PDFs
- **🖼️ PDF to Images**: Convert PDF pages to PNG/JPG

### 🎯 Smart Features *(All Working)*:
- **PDF Detection**: Automatically detects PDFs on web pages
- **Context Menus**: Right-click PDF links for quick tools
- **Floating Button**: Easy access button on PDF pages
- **Drag & Drop**: Intuitive file handling
- **Keyboard Shortcuts**: `Ctrl+Shift+L` to open tools
- **Progress Notifications**: Real-time processing feedback

---

## 🚀 Installation

### Quick Install (Recommended)
1. **Download**: `git clone https://github.com/ulinycoin/localpdf-extension.git`
2. **Load in Chrome**: Go to `chrome://extensions/` → Enable "Developer mode" → "Load unpacked" → Select folder
3. **Test**: Click extension icon and try merging 2 PDF files!

*Detailed instructions: [INSTALLATION.md](INSTALLATION.md)*

### Browser Compatibility

| Browser | Status | Manifest Version | PDF Processing |
|---------|--------|------------------|----------------|
| 🟢 Chrome | **Fully Working** | V3 | ✅ All tools work |
| 🟡 Firefox | In Development | V2 | 🔄 Coming soon |
| 🟡 Edge | Planned | V3 | 📋 Roadmap |

---

## 🧪 Testing

**The extension now has REAL PDF processing! 🎉**

### Quick Test:
1. **Click extension icon** in Chrome toolbar
2. **Click "Merge PDFs"** → Select 2-3 PDF files
3. **Watch magic happen** → Merged file downloads automatically!

### Full Testing Guide:
See [TESTING.md](TESTING.md) for complete testing instructions, expected results, and troubleshooting.

### What Works Right Now:
- ✅ **Merge**: Multiple PDFs → Single combined file
- ✅ **Split**: Multi-page PDF → Individual page files  
- ✅ **Compress**: Large PDF → Smaller compressed file
- ✅ **Context Menus**: Right-click PDF links → Process directly
- ✅ **Notifications**: Progress updates and completion alerts
- ✅ **Error Handling**: Invalid files show helpful error messages

---

## 🖥️ How to Use

### Basic Workflow:
1. **Click Extension Icon** → Opens LocalPDF popup
2. **Choose Tool** → Merge, Split, or Compress
3. **Select Files** → Drag & drop or click to browse
4. **Watch Processing** → Progress notifications show status
5. **Get Results** → Processed files download automatically

### Advanced Features:
- **PDF Page Detection**: Floating button appears on PDF pages
- **Context Menu Integration**: Right-click any PDF link
- **Settings Customization**: Click ⚙️ for compression quality, file naming, etc.
- **Keyboard Shortcuts**: `Ctrl+Shift+L` for quick access on PDF pages

---

## 🛠️ Development

### Technology Stack
- **PDF Processing**: pdf-lib (loaded from CDN)
- **Extension**: Manifest V3, vanilla JavaScript
- **UI**: Modern CSS3 with LocalPDF branding
- **Storage**: Chrome Storage API for settings
- **Downloads**: Chrome Downloads API for file saving

### Recent Updates
- ✅ **Integrated pdf-lib** for real PDF manipulation
- ✅ **Working merge/split/compress** functionality
- ✅ **Chrome Downloads API** integration
- ✅ **Error handling** and user feedback
- ✅ **Progress notifications** during processing

### Project Structure
```
localpdf-extension/
├── manifest.json           # Extension config with PDF-lib permissions
├── popup/                  # Main UI (HTML/CSS/JS)
├── background/             # Service worker with PDF processing
├── content/                # PDF detection and page integration
├── options/                # Settings page
├── lib/                    # PDF processor with pdf-lib
└── assets/                 # Icons and resources
```

### Development Setup
1. Clone repository
2. Load in Chrome Developer mode
3. Make changes and reload extension
4. Test with real PDF files

---

## 🔒 Privacy & Security

### Privacy Principles
1. **Local Processing Only**: All PDF operations happen in your browser
2. **No Data Transmission**: Files never leave your device
3. **No Analytics**: We don't track your usage
4. **Minimal Permissions**: Only essential browser permissions
5. **Open Source**: Full transparency with public code

### Permissions Explained
| Permission | Why We Need It |
|------------|----------------|
| `storage` | Save your preferences and settings |
| `downloads` | Save processed PDF files to your computer |
| `activeTab` | Detect PDFs on the current page |
| `contextMenus` | Add right-click options for PDF links |
| `https://cdnjs.cloudflare.com/*` | Load pdf-lib library for processing |

---

## 📊 Performance

### Processing Speed
- **Small PDFs (< 1MB)**: Near-instant processing
- **Medium PDFs (1-10MB)**: 1-5 seconds
- **Large PDFs (10-50MB)**: 5-30 seconds
- **Memory Usage**: 20-100MB during processing

### File Compatibility
- ✅ **Standard PDFs**: Full support
- ✅ **Password-protected**: Basic support (if password known)
- ✅ **Large files**: Up to 100MB recommended
- ⚠️ **Corrupted files**: Graceful error handling

---

## 🎯 Roadmap

### ✅ Version 0.1.0 (Current - WORKING!)
- Complete extension architecture
- Real PDF processing (merge, split, compress)
- Modern UI with LocalPDF branding
- Chrome Downloads integration
- Progress notifications

### 🔄 Version 0.2.0 (Next - 1-2 weeks)
- Chrome Web Store submission
- Firefox compatibility
- Advanced PDF tools (text, watermark, rotate)
- Performance optimizations

### 📋 Version 1.0.0 (Goal - 1 month)
- All 9 PDF tools implemented
- Multi-browser support
- Professional documentation
- 10,000+ active users

---

## 🤝 Contributing

We welcome contributions! Here's how:

1. **🐛 Report Bugs**: Found an issue? [Create an issue](https://github.com/ulinycoin/localpdf-extension/issues)
2. **💡 Suggest Features**: Have ideas? [Start a discussion](https://github.com/ulinycoin/localpdf-extension/discussions)
3. **🔧 Submit Code**: Fork, make changes, submit a pull request
4. **🧪 Test**: Try the extension and provide feedback

### Development Guidelines
- **Privacy First**: All processing must remain local
- **Performance**: Optimize for speed and memory usage
- **User Experience**: Keep interface simple and intuitive
- **Testing**: Test with various PDF files and sizes

---

## 🆘 Support

### Getting Help
- **📖 Documentation**: Check README, INSTALLATION.md, TESTING.md
- **💬 Discussions**: [GitHub Discussions](https://github.com/ulinycoin/localpdf-extension/discussions)
- **🐛 Bug Reports**: [GitHub Issues](https://github.com/ulinycoin/localpdf-extension/issues)

### Common Issues
**PDF processing fails?**
- Ensure PDFs are valid and not corrupted
- Check file size (< 50MB recommended)
- Look for error notifications

**Downloads not working?**
- Check Chrome download settings
- Ensure downloads aren't blocked
- Try with smaller files first

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **[PDF-lib](https://pdf-lib.js.org/)**: Incredible PDF manipulation library
- **[LocalPDF Web App](https://github.com/ulinycoin/clientpdf-pro)**: Parent project providing core concepts
- **Chrome Extension Community**: For tools, examples, and best practices
- **Privacy Advocates**: For keeping user rights at the forefront

---

<div align="center">

## 🎉 **Ready to Process PDFs Privately?**

**The extension is now fully functional! Download, install, and start processing PDFs locally in your browser.**

[⭐ Star this project](https://github.com/ulinycoin/localpdf-extension) • [🧪 Test the extension](TESTING.md) • [🚀 Install now](INSTALLATION.md)

**Made with ❤️ for privacy-conscious users**

</div>