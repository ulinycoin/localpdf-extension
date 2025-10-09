# 🚀 Quick Start Guide

Get LocalPDF Extension running in 5 minutes.

## Step 1: Push to GitHub (2 min)

```bash
cd /Users/aleksejs/Desktop/localpdf-extension

# Initialize git
git init
git add .
git commit -m "Initial commit: LocalPDF Extension v1.0"

# Create repo on GitHub: https://github.com/new
# Name: localpdf-extension

# Push code
git remote add origin https://github.com/ulinycoin/localpdf-extension.git
git branch -M main
git push -u origin main
```

✅ **Result:** Code is now on GitHub

---

## Step 2: Build Extension (1 min)

```bash
# Install dependencies
npm install

# Build extension
npm run build
```

✅ **Result:** `dist/` folder created with extension files

---

## Step 3: Test in Chrome (2 min)

1. Open Chrome
2. Go to `chrome://extensions/`
3. Enable "Developer mode" (toggle in top-right)
4. Click "Load unpacked"
5. Select folder: `/Users/aleksejs/Desktop/localpdf-extension/dist`
6. ✅ Extension loaded!

**Test it:**
- Click extension icon → popup opens
- Click "Merge PDF" → opens localpdf.online/merge-pdf
- Change language to RU → interface switches to Russian

---

## Step 4: Test in Firefox (optional, 2 min)

1. Open Firefox
2. Go to `about:debugging#/runtime/this-firefox`
3. Click "Load Temporary Add-on"
4. Select file: `/Users/aleksejs/Desktop/localpdf-extension/dist/manifest.json`
5. ✅ Extension loaded!

---

## Common Commands

```bash
# Development
npm run build        # Build extension
npm run clean        # Remove build files

# Production
npm run release      # Build + Create ZIP for stores

# Git
git status          # Check changes
git add .           # Stage all changes
git commit -m "msg" # Commit changes
git push            # Push to GitHub
```

---

## Troubleshooting

### "npm: command not found"
Install Node.js: https://nodejs.org/

### Build fails
```bash
npm run clean
rm -rf node_modules
npm install
npm run build
```

### Extension not loading
- Check `dist/` folder exists
- Look for errors in chrome://extensions (Developer mode ON)
- Check browser console (F12) for errors

### Icons not showing
Icons are already copied from main project. If missing:
```bash
cp /Users/aleksejs/Desktop/clientpdf-pro/public/favicon-16x16.png src/icons/icon-16.png
cp /Users/aleksejs/Desktop/clientpdf-pro/public/favicon-32x32.png src/icons/icon-48.png
cp /Users/aleksejs/Desktop/clientpdf-pro/public/icon-192x192.png src/icons/icon-128.png
```

---

## Next Steps

1. ✅ Pushed to GitHub
2. ✅ Tested in Chrome
3. 🔲 Test all 12 tools work
4. 🔲 Test all 5 languages
5. 🔲 Fix any bugs found
6. 🔲 Create screenshots for store
7. 🔲 Submit to Chrome Web Store
8. 🔲 Submit to Firefox Add-ons

---

## Full Documentation

- **README.md** - Full project documentation
- **SETUP.md** - Detailed setup guide
- **PROJECT_SUMMARY.md** - Technical overview
- **CONTRIBUTING.md** - Contributing guidelines

---

**Need help?** Open an issue: https://github.com/ulinycoin/localpdf-extension/issues

Good luck! 🎉
