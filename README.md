# LocalPDF Browser Extension

> Quick access to LocalPDF tools - privacy-first PDF processing in your browser

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Chrome Web Store](#)](#) [![Firefox Add-ons](#)](#)

## About

This browser extension provides instant access to [LocalPDF](https://localpdf.online) - a privacy-first PDF toolkit that processes all files locally in your browser.

**Key Features:**
- 🚀 One-click access to 12 PDF tools
- 🔒 Privacy-first - no files uploaded to servers
- 🌍 Multilingual support (EN, RU, DE, FR, ES)
- 🎯 Context menus for quick actions
- 💡 Clean, modern interface

## Installation

### From Chrome Web Store
1. Visit [Chrome Web Store](#) (link coming soon)
2. Click "Add to Chrome"
3. Click the extension icon to start using tools

### From Firefox Add-ons
1. Visit [Firefox Add-ons](#) (link coming soon)
2. Click "Add to Firefox"
3. Click the extension icon to start using tools

### Manual Installation (Development)

#### Chrome/Edge
1. Clone this repository:
   ```bash
   git clone https://github.com/ulinycoin/localpdf-extension.git
   cd localpdf-extension
   ```

2. Install dependencies and build:
   ```bash
   npm install
   npm run build
   ```

3. Load in Chrome:
   - Open `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select the `dist` folder

#### Firefox
1. Follow steps 1-2 above

2. Load in Firefox:
   - Open `about:debugging#/runtime/this-firefox`
   - Click "Load Temporary Add-on"
   - Select `dist/manifest.json`

## Available Tools

### Tier 1 (Most Popular)
- 🔗 **Merge PDF** - Combine multiple PDFs into one
- ✂️ **Split PDF** - Split PDF into separate pages or ranges
- 🗜️ **Compress PDF** - Reduce PDF file size
- 🔒 **Protect PDF** - Add password protection
- 🔓 **Unlock PDF** - Remove password protection
- 🔍 **OCR PDF** - Extract text from scanned documents

### Tier 2 (Standard Tools)
- 📝 **Add Text to PDF** - Insert text into PDF documents
- 💧 **Watermark PDF** - Add watermarks or logos
- 🔄 **Rotate PDF** - Rotate pages in any direction
- 🖼️ **Image to PDF** - Convert images to PDF
- 📄 **PDF to Image** - Convert PDF pages to images
- ✏️ **Edit PDF** - Edit existing PDF content

## Usage

### Quick Access
1. Click the extension icon in your browser toolbar
2. Select the tool you need
3. You'll be redirected to LocalPDF with the tool open

### Context Menu
1. Right-click on any PDF link
2. Select "Open with LocalPDF" → Choose tool
3. The file will open in the selected tool

### Language Support
- Click the language dropdown in the popup (EN/RU/DE/FR/ES)
- Your preference is saved automatically
- All tools open in your selected language

## Development

### Project Structure
```
localpdf-extension/
├── src/
│   ├── manifest.json           # Extension manifest
│   ├── popup/
│   │   ├── popup.html         # Popup UI
│   │   ├── popup.js           # Popup logic
│   │   └── popup.css          # Popup styles
│   ├── background/
│   │   └── service-worker.js  # Background tasks
│   ├── icons/                 # Extension icons
│   └── locales/               # i18n translations
│       ├── en/
│       ├── ru/
│       ├── de/
│       ├── fr/
│       └── es/
├── scripts/
│   ├── build.js               # Build script
│   └── package.js             # Package for stores
└── dist/                      # Build output
```

### Scripts

```bash
# Install dependencies
npm install

# Build for development
npm run build

# Build and create ZIP for store upload
npm run release

# Clean build artifacts
npm run clean
```

### Building for Production

```bash
# Create production build
npm run release

# Output: localpdf-extension.zip
# Ready to upload to Chrome Web Store and Firefox Add-ons
```

## Privacy & Security

- ✅ **No data collection** - We don't track or collect any user data
- ✅ **No external servers** - All PDF processing happens on LocalPDF.online in your browser
- ✅ **Minimal permissions** - Only requests necessary permissions for functionality
- ✅ **Open source** - Full transparency, audit the code yourself

### Permissions Explained
- `contextMenus` - Add right-click menu items for PDF links
- `notifications` - Show welcome notification on install
- `storage` - Save language preference locally

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Links

- 🌐 **Website:** https://localpdf.online
- 💻 **Main Project:** https://github.com/ulinycoin/clientpdf-pro
- 🐛 **Report Issues:** https://github.com/ulinycoin/localpdf-extension/issues
- 📧 **Contact:** [support@localpdf.online](mailto:support@localpdf.online)

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Roadmap

### v1.0 (Current - MVP)
- [x] Popup with 12 tools
- [x] Context menus for PDF links
- [x] Multilingual support (5 languages)
- [x] Basic usage tracking (local only)

### v1.1 (Planned)
- [ ] Drag & drop files onto extension icon
- [ ] Recent tools history
- [ ] Keyboard shortcuts (Ctrl+Shift+L)
- [ ] Download notifications with quick actions

### v2.0 (Future)
- [ ] Customizable tool grid
- [ ] Batch operations
- [ ] Cloud storage integration (Google Drive, Dropbox)
- [ ] Usage statistics dashboard

## Acknowledgments

Built with ❤️ for the LocalPDF community.

Special thanks to all contributors and users who make this project possible!

---

**Made by the LocalPDF Team** | [Website](https://localpdf.online) | [Report Issue](https://github.com/ulinycoin/localpdf-extension/issues)
