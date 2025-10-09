# Contributing to LocalPDF Extension

Thank you for considering contributing to LocalPDF Extension! 🎉

## Ways to Contribute

- 🐛 Report bugs
- 💡 Suggest new features
- 🌍 Improve translations
- 📝 Improve documentation
- 💻 Submit code improvements

## Getting Started

### Prerequisites

- Node.js 18.x or higher
- npm
- Chrome or Firefox browser
- Git

### Setup Development Environment

1. **Fork and clone the repository:**
   ```bash
   git clone https://github.com/YOUR_USERNAME/localpdf-extension.git
   cd localpdf-extension
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Build the extension:**
   ```bash
   npm run build
   ```

4. **Load in browser:**
   - **Chrome:** `chrome://extensions` → Load unpacked → select `dist/`
   - **Firefox:** `about:debugging` → Load Temporary Add-on → select `dist/manifest.json`

## Development Workflow

### Making Changes

1. **Create a feature branch:**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes:**
   - Edit files in `src/`
   - Follow existing code style
   - Keep changes focused and atomic

3. **Build and test:**
   ```bash
   npm run build
   # Reload extension in browser
   # Test your changes thoroughly
   ```

4. **Commit your changes:**
   ```bash
   git add .
   git commit -m "feat: add your feature description"
   ```

### Commit Message Convention

We follow [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, etc.)
- `refactor:` - Code refactoring
- `test:` - Adding tests
- `chore:` - Maintenance tasks

**Examples:**
```
feat: add drag and drop support for files
fix: language selector not saving preference
docs: update README with new features
style: format popup.js with consistent indentation
```

### Submitting Pull Request

1. **Push to your fork:**
   ```bash
   git push origin feature/your-feature-name
   ```

2. **Create Pull Request:**
   - Go to https://github.com/ulinycoin/localpdf-extension
   - Click "New Pull Request"
   - Select your branch
   - Fill in PR template (description, screenshots if UI change)

3. **Wait for review:**
   - Maintainers will review your PR
   - Address any feedback
   - Once approved, PR will be merged

## Code Style Guide

### JavaScript

- **Indentation:** 2 spaces
- **Quotes:** Single quotes for strings
- **Semicolons:** Use them
- **Naming:**
  - `camelCase` for variables and functions
  - `UPPER_CASE` for constants
  - `PascalCase` for classes (if any)

**Example:**
```javascript
const TOOL_ROUTES = {
  'merge-pdf': '/merge-pdf'
};

function openTool(tool) {
  const route = TOOL_ROUTES[tool];
  // ...
}
```

### HTML/CSS

- **Indentation:** 2 spaces
- **Class naming:** `kebab-case`
- **BEM methodology** for complex components (optional)

**Example:**
```html
<div class="tool-card" data-tool="merge-pdf">
  <div class="tool-icon">🔗</div>
  <div class="tool-name">Merge PDF</div>
</div>
```

```css
.tool-card {
  display: flex;
  flex-direction: column;
}

.tool-card:hover {
  transform: translateY(-2px);
}
```

## Adding New Features

### Adding a New Tool

1. **Update popup.html:**
   ```html
   <div class="tool-card" data-tool="new-tool" data-category="tier2">
     <div class="tool-icon">🆕</div>
     <div class="tool-name" data-i18n="toolNewTool">New Tool</div>
   </div>
   ```

2. **Update popup.js:**
   ```javascript
   const TOOL_ROUTES = {
     // ... existing tools
     'new-tool': '/new-tool'
   };
   ```

3. **Add translations** in all `src/_locales/*/messages.json`:
   ```json
   {
     "toolNewTool": {
       "message": "New Tool",
       "description": "New Tool description"
     }
   }
   ```

4. **Test all languages** to ensure translations display correctly

### Adding a New Language

1. **Create locale directory:**
   ```bash
   mkdir -p src/_locales/it
   ```

2. **Create messages.json:**
   ```bash
   cp src/_locales/en/messages.json src/_locales/it/messages.json
   ```

3. **Translate all strings** in `src/_locales/it/messages.json`

4. **Update popup.html** language selector:
   ```html
   <select id="languageSelector" class="language-selector">
     <!-- ... existing options -->
     <option value="it">IT</option>
   </select>
   ```

5. **Test:** Change language in popup, verify all text translates

## Testing

### Manual Testing Checklist

Before submitting PR, test:

- [ ] All tools open correct URLs
- [ ] Language switching works for all languages
- [ ] Search filters tools correctly
- [ ] Context menus appear on PDF links
- [ ] No console errors in browser DevTools
- [ ] Extension works in both Chrome and Firefox
- [ ] Icons display correctly at all sizes

### Browser Testing

Test in:
- ✅ Chrome (latest)
- ✅ Firefox (latest)
- ⚠️ Edge (optional, usually same as Chrome)

## Translation Guidelines

### For Translators

1. **Keep translations concise** - Space is limited in popup
2. **Maintain consistent terminology** - Use same terms throughout
3. **Test in UI** - Verify text fits without overflow
4. **Cultural adaptation** - Adapt idioms if needed

### Translation Keys

- `extensionName` - Keep as "LocalPDF" (brand name)
- `toolXXXPDF` - Tool names (keep "PDF" in most languages)
- `searchPlaceholder` - Keep short (15-20 characters max)

## Reporting Bugs

### Bug Report Template

**Title:** Brief description of bug

**Description:**
- What happened?
- What did you expect to happen?

**Steps to Reproduce:**
1. Step 1
2. Step 2
3. Bug occurs

**Environment:**
- Browser: Chrome 120.0
- OS: macOS 14.0
- Extension Version: 1.0.0

**Screenshots:** (if applicable)

**Console Errors:** (if any)

### Where to Report

- GitHub Issues: https://github.com/ulinycoin/localpdf-extension/issues
- Include as much detail as possible
- Search existing issues first to avoid duplicates

## Feature Requests

### Suggesting Features

**Title:** Clear feature name

**Problem:** What problem does this solve?

**Proposed Solution:** How would it work?

**Alternatives Considered:** Other approaches?

**Additional Context:** Screenshots, mockups, examples

## Documentation

### Improving Docs

- **README.md** - User-facing documentation
- **SETUP.md** - Developer setup guide
- **PRIVACY.md** - Privacy policy (legal implications, be careful)
- **This file** - Contributing guide

When improving docs:
- Use clear, simple language
- Add examples where helpful
- Keep formatting consistent
- Test all commands/steps

## Code of Conduct

### Our Pledge

We are committed to providing a welcoming and inspiring community for all.

### Expected Behavior

- Be respectful and inclusive
- Accept constructive criticism gracefully
- Focus on what's best for the community
- Show empathy towards other community members

### Unacceptable Behavior

- Harassment, trolling, or insulting comments
- Personal or political attacks
- Publishing others' private information
- Other conduct which could reasonably be considered inappropriate

### Enforcement

Violations can be reported to: support@localpdf.online

## Questions?

- **GitHub Discussions:** (coming soon)
- **Email:** support@localpdf.online
- **Main Project:** https://github.com/ulinycoin/clientpdf-pro

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to LocalPDF Extension! 🙏
