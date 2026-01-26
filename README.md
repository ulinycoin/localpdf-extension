# LocalPDF Companion - v2.0.0

Privacy-first PDF tools directly in your browser. Files never leave your device.

## Features

- **Privacy-First**: All processing is done locally in your browser.
- **Seamless Integration**: Quickly open files from the browser in the LocalPDF web app.
- **Lightweight**: Minimal performance impact.

## Installation

### For Developers

1. Clone this repository:
   ```bash
   git clone https://github.com/ulinycoin/localpdf-extension.git
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Build the extension:
   ```bash
   npm run build
   ```
4. Load in Chrome:
   - Go to `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked" and select the `dist` folder.

## Development

- `npm run dev`: Start development server (for popup UI)
- `npm run build`: Build the extension for production

## License

MIT
