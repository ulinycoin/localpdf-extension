# Setup Guide for LocalPDF Extension

Quick guide to get the extension running and published.

## 🚀 Quick Start (5 minutes)

### 1. Initialize Git Repository

```bash
cd /Users/aleksejs/Desktop/localpdf-extension

# Initialize git
git init

# Add all files
git add .

# First commit
git commit -m "Initial commit: LocalPDF Extension v1.0 MVP"
```

### 2. Create GitHub Repository

1. Go to https://github.com/new
2. Fill in:
   - **Repository name:** `localpdf-extension`
   - **Description:** `Browser extension for quick access to LocalPDF tools - privacy-first PDF processing`
   - **Public** ✅
   - **DON'T** initialize with README (we already have one)
3. Click **Create repository**

### 3. Push to GitHub

```bash
# Add remote (replace with your actual URL)
git remote add origin https://github.com/ulinycoin/localpdf-extension.git

# Push code
git branch -M main
git push -u origin main
```

---

## 🛠️ Development Setup

### Install Dependencies

```bash
npm install
```

### Build Extension

```bash
# Development build
npm run build

# Creates dist/ folder with extension files
```

### Test Locally

#### Chrome/Edge
1. Open `chrome://extensions/`
2. Enable "Developer mode" (top right)
3. Click "Load unpacked"
4. Select `/Users/aleksejs/Desktop/localpdf-extension/dist` folder
5. ✅ Extension loaded! Click icon to test

#### Firefox
1. Open `about:debugging#/runtime/this-firefox`
2. Click "Load Temporary Add-on"
3. Select `dist/manifest.json`
4. ✅ Extension loaded! Click icon to test

---

## 📦 Creating Release Package

### Build for Production

```bash
# Clean + Build + Package
npm run release

# Output: localpdf-extension.zip (ready for stores)
```

---

## 🏪 Publishing to Chrome Web Store

### Prerequisites
1. Create developer account: https://chrome.google.com/webstore/devconsole
2. One-time fee: $5 USD

### Steps
1. Login to Chrome Web Store Developer Dashboard
2. Click "New Item"
3. Upload `localpdf-extension.zip`
4. Fill in store listing:
   - **Name:** LocalPDF - Quick PDF Tools Access
   - **Description:** (Use description from README.md)
   - **Category:** Productivity
   - **Language:** English (+ add RU, DE, FR, ES later)
5. Upload screenshots (need 1280x800px images)
6. Set privacy policy URL: https://github.com/ulinycoin/localpdf-extension/blob/main/PRIVACY.md
7. Submit for review (takes 1-3 days)

### Screenshots to Prepare
- Popup with tools grid (1280x800)
- Context menu in action (1280x800)
- Tool page opened from extension (1280x800)

---

## 🦊 Publishing to Firefox Add-ons

### Prerequisites
1. Create account: https://addons.mozilla.org/developers/
2. Free!

### Steps
1. Login to Firefox Add-on Developer Hub
2. Click "Submit a New Add-on"
3. Upload `localpdf-extension.zip`
4. Fill in listing information
5. Review is usually faster than Chrome (1-2 days)

---

## 🔄 Updating the Extension

### Version Update Process

1. **Update version in manifest.json:**
   ```json
   {
     "version": "1.1.0"
   }
   ```

2. **Update package.json:**
   ```json
   {
     "version": "1.1.0"
   }
   ```

3. **Commit changes:**
   ```bash
   git add .
   git commit -m "v1.1.0: Add new features"
   git push
   ```

4. **Create GitHub release:**
   ```bash
   git tag v1.1.0
   git push origin v1.1.0
   ```

5. **GitHub Actions will automatically:**
   - Build the extension
   - Create ZIP package
   - Attach to release

6. **Upload to stores manually** (or automate later)

---

## 🧪 Testing Checklist

Before publishing:

- [ ] Test all 12 tools open correctly
- [ ] Test language switching (all 5 languages)
- [ ] Test context menus on PDF links
- [ ] Test search functionality in popup
- [ ] Test on Chrome (latest version)
- [ ] Test on Firefox (latest version)
- [ ] Test on Edge (optional)
- [ ] Verify icons display correctly at all sizes
- [ ] Check no console errors
- [ ] Verify privacy policy is up to date

---

## 📊 Post-Launch Monitoring

### Week 1
- Check reviews daily
- Fix any critical bugs immediately
- Monitor install count

### Month 1
- Gather user feedback
- Plan v1.1 features based on requests
- Add requested translations

### Ongoing
- Keep manifest up to date with Chrome/Firefox changes
- Update when LocalPDF website adds new tools
- Maintain 4+ star rating

---

## 🎯 Next Steps After MVP

### v1.1 Features to Add
1. **Drag & Drop** - Drop files on extension icon
2. **Recent Tools** - Show last 3 used tools
3. **Keyboard Shortcuts** - Ctrl+Shift+L to open popup
4. **Download Notifications** - "Process this PDF?" on download

### v2.0 Ideas
1. **Batch Operations** - Process multiple files
2. **Cloud Integration** - Google Drive, Dropbox
3. **Usage Dashboard** - Show stats and favorites
4. **Custom Tool Grid** - Let users choose which tools to show

---

## 🆘 Troubleshooting

### Build fails
```bash
# Clean and retry
npm run clean
npm install
npm run build
```

### Icons not showing
- Verify icons exist in `src/icons/`
- Check sizes: 16x16, 48x48, 128x128
- Icons must be PNG format

### Translations not working
- Verify `messages.json` exists in each locale folder
- Check JSON is valid (no trailing commas)
- Ensure `default_locale` is set in manifest.json

### Extension not loading
- Check manifest.json is valid JSON
- Verify all file paths in manifest exist
- Look for errors in chrome://extensions (enable Developer mode)

---

## 📞 Support

- **Issues:** https://github.com/ulinycoin/localpdf-extension/issues
- **Email:** support@localpdf.online
- **Main Project:** https://github.com/ulinycoin/clientpdf-pro

---

Good luck with the launch! 🚀
