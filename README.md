# 🔒 LocalPDF Browser Extension

<div align="center">

![LocalPDF Extension](https://img.shields.io/badge/LocalPDF-Extension-blue?style=for-the-badge&logo=chrome)
![Version](https://img.shields.io/badge/version-0.1.0-green?style=for-the-badge)
![Privacy](https://img.shields.io/badge/Privacy-First-success?style=for-the-badge&logo=shield)
![Local Processing](https://img.shields.io/badge/100%25-Local%20Processing-orange?style=for-the-badge)

**Privacy-focused PDF tools that work entirely in your browser**

[🚀 Install Extension](#installation) • [📖 Features](#features) • [🛠️ Development](#development) • [🤝 Contributing](#contributing)

</div>

---

## 🌟 Overview

LocalPDF Browser Extension brings powerful PDF tools directly to your browser with **zero privacy compromise**. All processing happens locally - your files never leave your device.

**Parent Project**: [LocalPDF Web App](https://github.com/ulinycoin/clientpdf-pro) - This extension ports the web app functionality into a convenient browser extension.

### ✨ Why LocalPDF Extension?

- 🔒 **100% Privacy**: All processing happens locally in your browser
- ⚡ **Fast & Efficient**: No upload/download delays
- 🎯 **Context-Aware**: Detects PDFs on web pages automatically
- 🛡️ **Secure**: No data transmission to external servers
- 🎨 **Clean UI**: Modern, intuitive interface
- ⌨️ **Keyboard Shortcuts**: Quick access with hotkeys

---

## 📖 Features

### 🔴 Phase 1: Essential Tools (Current)
- **🔗 Merge PDFs**: Combine multiple PDF files into one
- **✂️ Split PDF**: Extract specific pages or split into separate files
- **🗜️ Compress PDF**: Reduce file size while maintaining quality

### 🟡 Phase 2: Advanced Tools (Coming Soon)
- **📝 Add Text**: Insert text annotations and labels
- **🏷️ Add Watermark**: Brand your documents with watermarks
- **🔄 Rotate Pages**: Fix page orientation issues

### 🟢 Phase 3: Utility Tools (Planned)
- **📄 Extract Pages**: Save specific pages as new PDFs
- **📋 Extract Text**: Copy text content from PDFs
- **🖼️ PDF to Images**: Convert PDF pages to PNG/JPG

### 🎯 Smart Features
- **PDF Detection**: Automatically detects PDFs on web pages
- **Context Menus**: Right-click PDF links for quick tools
- **Floating Button**: Easy access button on PDF pages
- **Drag & Drop**: Intuitive file handling
- **Keyboard Shortcuts**: `Ctrl+Shift+L` to open tools

---

## 🚀 Installation

### Chrome Web Store (Recommended)
*Coming soon - pending store approval*

### Manual Installation (Developer Mode)

1. **Download the Extension**
   ```bash
   git clone https://github.com/ulinycoin/localpdf-extension.git
   cd localpdf-extension
   ```

2. **Load in Chrome**
   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode" (top right toggle)
   - Click "Load unpacked"
   - Select the `localpdf-extension` folder

3. **Load in Firefox**
   - Open Firefox and go to `about:debugging#/runtime/this-firefox`
   - Click "Load Temporary Add-on"
   - Select the `manifest.json` file

### Browser Compatibility

| Browser | Status | Manifest Version |
|---------|--------|------------------|
| 🟢 Chrome | Full Support | V3 |
| 🟡 Firefox | In Development | V2 |
| 🟡 Edge | Planned | V3 |

---

## 🖥️ How to Use

### Quick Start

1. **Click the Extension Icon** - Opens the main tool selection popup
2. **Choose Your Tool** - Select merge, split, or compress
3. **Select Files** - Drag & drop or click to select PDF files
4. **Process** - Watch the magic happen locally in your browser
5. **Download** - Your processed file downloads automatically

### On PDF Pages

- **Floating Button**: Appears automatically on PDF pages
- **Keyboard Shortcut**: Press `Ctrl+Shift+L` for quick access
- **Context Menu**: Right-click PDF links for instant tools

### Smart PDF Detection

The extension automatically detects:
- Direct PDF URLs (`.pdf` files)
- Embedded PDFs (`<embed>` and `<object>` tags)
- PDF links on web pages
- Dynamic PDF content

---

## 🛠️ Development

### Project Structure

```
localpdf-extension/
├── manifest.json           # Extension configuration
├── popup/                  # Main popup interface
│   ├── popup.html          # UI structure
│   ├── popup.css           # Styling
│   └── popup.js            # Logic and interactions
├── background/             # Background service worker
│   └── background.js       # Core processing logic
├── content/                # Content scripts
│   └── content.js          # PDF detection and page integration
├── options/                # Settings page
│   ├── options.html        # Settings UI
│   ├── options.css         # Settings styling
│   └── options.js          # Settings logic
├── lib/                    # PDF processing libraries
├── assets/                 # Icons and images
└── tests/                  # Test files
```

### Technology Stack

- **Manifest V3** (Chrome) / **V2** (Firefox)
- **Vanilla JavaScript** - No frameworks for maximum performance
- **PDF-lib** - PDF manipulation library
- **Chrome Extension APIs** - Storage, downloads, notifications
- **Modern CSS3** - Responsive design with CSS Grid/Flexbox

### Code Reuse from Parent Project

This extension reuses significant code from the [LocalPDF Web App](https://github.com/ulinycoin/clientpdf-pro):

- **PDF Processing Logic**: Adapted from `src/services/`
- **File Utilities**: Modified from `src/utils/`
- **UI Patterns**: Inspired by React components, converted to vanilla JS
- **Brand Guidelines**: Consistent with the web app design

### Development Setup

1. **Clone the Repository**
   ```bash
   git clone https://github.com/ulinycoin/localpdf-extension.git
   cd localpdf-extension
   ```

2. **Load in Developer Mode**
   - See [Manual Installation](#manual-installation-developer-mode) above

3. **Make Changes**
   - Edit files in your preferred editor
   - Reload the extension in `chrome://extensions/`
   - Test your changes

4. **Debug**
   - **Popup**: Right-click extension icon → "Inspect popup"
   - **Background**: Go to `chrome://extensions/` → "Inspect views: background page"
   - **Content Script**: Open DevTools on any page

### Building for Production

```bash
# Create distribution package
npm run build

# Zip for Chrome Web Store
npm run package:chrome

# Package for Firefox Add-ons
npm run package:firefox
```

---

## 🔧 Configuration

### Extension Settings

Access settings by clicking the ⚙️ button in the popup or via `chrome://extensions/` → "Extension options"

#### General Settings
- **Theme**: Light, Dark, or Auto (follows system)
- **Auto-close**: Close popup after processing
- **Notifications**: System notifications for completed operations
- **Keyboard Shortcuts**: Enable/disable hotkey support

#### PDF Processing
- **Compression Quality**: Low, Medium, High
- **File Naming**: How to name split/processed files
- **Metadata**: Preserve or strip document metadata
- **File Size Limit**: Maximum file size for processing

#### Privacy & Security
- **Local Processing**: Always enabled (cannot be disabled)
- **Cache Management**: Auto-clear temporary files
- **Metadata Removal**: Strip all metadata on export

#### Advanced Options
- **Processing Threads**: Number of threads for PDF processing
- **Debug Mode**: Enable detailed logging
- **Experimental Features**: Try beta features

---

## 🔒 Privacy & Security

### Privacy Principles

1. **Local Processing Only**: All PDF operations happen in your browser
2. **No Data Transmission**: Files never leave your device
3. **No Analytics**: We don't track your usage
4. **Minimal Permissions**: Only essential browser permissions requested
5. **Open Source**: Full transparency with open source code

### Permissions Explained

| Permission | Why We Need It |
|------------|----------------|
| `storage` | Save your preferences and settings |
| `downloads` | Save processed PDF files to your computer |
| `activeTab` | Detect PDFs on the current page |
| `contextMenus` | Add right-click options for PDF links |

### Security Features

- **Content Security Policy**: Prevents code injection
- **Manifest V3**: Latest security standards
- **No External Resources**: All libraries bundled locally
- **Automatic Cleanup**: Temporary files cleared after processing

---

## 🚧 Roadmap

### Version 0.1.0 (Current)
- ✅ Basic extension structure
- ✅ Popup interface with 3 essential tools
- ✅ PDF detection on web pages
- ✅ Settings page
- 🔄 PDF-lib integration (in progress)

### Version 0.2.0 (Next)
- 📋 Complete merge/split/compress functionality
- 📋 Chrome Web Store submission
- 📋 Firefox Add-ons compatibility
- 📋 Automated testing setup

### Version 0.3.0
- 📋 Advanced tools (text, watermark, rotate)
- 📋 Improved file handling
- 📋 Performance optimizations
- 📋 User feedback system

### Version 1.0.0
- 📋 All 9 tools implemented
- 📋 Multi-browser support
- 📋 Advanced features (OCR, form filling)
- 📋 Professional documentation

---

## 🤝 Contributing

We welcome contributions! Here's how you can help:

### Ways to Contribute

1. **🐛 Report Bugs**: Found an issue? [Create an issue](https://github.com/ulinycoin/localpdf-extension/issues)
2. **💡 Suggest Features**: Have ideas? [Start a discussion](https://github.com/ulinycoin/localpdf-extension/discussions)
3. **🔧 Submit Code**: Fork, make changes, submit a pull request
4. **📖 Improve Docs**: Help make our documentation better
5. **🧪 Test**: Try the extension and provide feedback

### Development Guidelines

1. **Code Style**: Follow existing patterns and use meaningful variable names
2. **Comments**: Document complex logic and functions
3. **Testing**: Test your changes across different browsers
4. **Privacy**: Ensure all processing remains local
5. **Performance**: Optimize for speed and memory usage

### Pull Request Process

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Test thoroughly
5. Commit with clear messages (`git commit -m 'Add amazing feature'`)
6. Push to your fork (`git push origin feature/amazing-feature`)
7. Open a Pull Request

---

## 🆘 Support

### Getting Help

- **📖 Documentation**: Check this README and code comments
- **💬 Discussions**: [GitHub Discussions](https://github.com/ulinycoin/localpdf-extension/discussions)
- **🐛 Bug Reports**: [GitHub Issues](https://github.com/ulinycoin/localpdf-extension/issues)
- **📧 Contact**: Create an issue for direct support

### Common Issues

**Extension not loading?**
- Enable Developer mode in Chrome
- Check for JavaScript errors in DevTools
- Verify all files are present

**PDF processing not working?**
- Check file size limits (default 100MB)
- Ensure PDF is not password-protected
- Try with a different PDF file

**Popup not opening?**
- Right-click extension icon → Check for errors
- Reload the extension
- Try restarting the browser

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **[PDF-lib](https://pdf-lib.js.org/)**: Amazing PDF manipulation library
- **[LocalPDF Web App](https://github.com/ulinycoin/clientpdf-pro)**: Parent project providing core functionality
- **Open Source Community**: For tools, libraries, and inspiration
- **Privacy Advocates**: For keeping user rights at the forefront

---

## 📊 Project Status

| Aspect | Status | Notes |
|--------|--------|-------|
| Core Functionality | 🟡 In Development | Basic structure complete |
| PDF Processing | 🔴 Not Started | PDF-lib integration pending |
| Browser Compatibility | 🟡 Chrome Only | Firefox support planned |
| Documentation | 🟢 Complete | Comprehensive docs available |
| Testing | 🔴 Not Started | Test suite needed |
| Distribution | 🔴 Not Started | Store submissions pending |

---

<div align="center">

**Made with ❤️ for privacy-conscious users**

[⭐ Star this project](https://github.com/ulinycoin/localpdf-extension) if you find it useful!

</div>