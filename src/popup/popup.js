// i18n translations
const translations = {
  en: null, // Will be loaded from locales
  ru: null,
  de: null,
  fr: null,
  es: null
};

// Tool routes mapping
const TOOL_ROUTES = {
  'merge-pdf': '/merge-pdf',
  'split-pdf': '/split-pdf',
  'compress-pdf': '/compress-pdf',
  'protect-pdf': '/protect-pdf',
  'unlock-pdf': '/unlock-pdf',
  'ocr-pdf': '/ocr-pdf',
  'add-text-pdf': '/add-text-pdf',
  'watermark-pdf': '/watermark-pdf',
  'rotate-pdf': '/rotate-pdf',
  'image-to-pdf': '/image-to-pdf',
  'pdf-to-image': '/pdf-to-image',
  'edit-pdf': '/edit-pdf'
};

// Current language
let currentLanguage = 'en';

// Initialize popup
document.addEventListener('DOMContentLoaded', async () => {
  await loadLanguage();
  setupEventListeners();
  updateUI();
});

// Load language from storage
async function loadLanguage() {
  try {
    const result = await chrome.storage.sync.get(['language']);
    currentLanguage = result.language || 'en';

    // Set language selector
    const selector = document.getElementById('languageSelector');
    if (selector) {
      selector.value = currentLanguage;
    }

    // Load translations
    await loadTranslations(currentLanguage);
  } catch (error) {
    console.error('Error loading language:', error);
  }
}

// Load translations from messages.json
async function loadTranslations(lang) {
  try {
    const response = await fetch(`../locales/${lang}/messages.json`);
    translations[lang] = await response.json();
    applyTranslations();
  } catch (error) {
    console.error('Error loading translations:', error);
  }
}

// Apply translations to UI
function applyTranslations() {
  const elements = document.querySelectorAll('[data-i18n]');
  elements.forEach(element => {
    const key = element.getAttribute('data-i18n');
    const translation = getTranslation(key);
    if (translation) {
      element.textContent = translation;
    }
  });

  // Update placeholders
  const placeholderElements = document.querySelectorAll('[data-i18n-placeholder]');
  placeholderElements.forEach(element => {
    const key = element.getAttribute('data-i18n-placeholder');
    const translation = getTranslation(key);
    if (translation) {
      element.placeholder = translation;
    }
  });
}

// Get translation by key
function getTranslation(key) {
  const messages = translations[currentLanguage];
  if (messages && messages[key]) {
    return messages[key].message;
  }
  return null;
}

// Setup event listeners
function setupEventListeners() {
  // Language selector
  const languageSelector = document.getElementById('languageSelector');
  if (languageSelector) {
    languageSelector.addEventListener('change', async (e) => {
      currentLanguage = e.target.value;
      await chrome.storage.sync.set({ language: currentLanguage });
      await loadTranslations(currentLanguage);
      updateUI();
    });
  }

  // Search input
  const searchInput = document.getElementById('searchInput');
  if (searchInput) {
    searchInput.addEventListener('input', handleSearch);
  }

  // Tool cards
  const toolCards = document.querySelectorAll('.tool-card');
  toolCards.forEach(card => {
    card.addEventListener('click', () => {
      const tool = card.getAttribute('data-tool');
      openTool(tool);
    });
  });

  // Footer link
  const footerLink = document.querySelector('.footer-link');
  if (footerLink) {
    footerLink.addEventListener('click', (e) => {
      e.preventDefault();
      openWebsite();
    });
  }
}

// Handle search
function handleSearch(e) {
  const query = e.target.value.toLowerCase().trim();
  const toolCards = document.querySelectorAll('.tool-card');

  toolCards.forEach(card => {
    const toolName = card.querySelector('.tool-name').textContent.toLowerCase();
    const tool = card.getAttribute('data-tool');

    if (query === '' || toolName.includes(query) || tool.includes(query)) {
      card.classList.remove('hidden');
    } else {
      card.classList.add('hidden');
    }
  });
}

// Open tool on website
function openTool(tool) {
  const route = TOOL_ROUTES[tool];
  if (route) {
    const url = buildURL(route);
    chrome.tabs.create({ url });

    // Track usage
    trackToolUsage(tool);
  }
}

// Build URL with language prefix
function buildURL(path) {
  const baseURL = 'https://localpdf.online';

  // Add language prefix for non-English languages
  if (currentLanguage !== 'en') {
    return `${baseURL}/${currentLanguage}${path}`;
  }

  return `${baseURL}${path}`;
}

// Open main website
function openWebsite() {
  const url = currentLanguage === 'en'
    ? 'https://localpdf.online'
    : `https://localpdf.online/${currentLanguage}`;

  chrome.tabs.create({ url });
}

// Track tool usage for analytics
async function trackToolUsage(tool) {
  try {
    const result = await chrome.storage.local.get(['toolUsage']);
    const toolUsage = result.toolUsage || {};

    toolUsage[tool] = (toolUsage[tool] || 0) + 1;

    await chrome.storage.local.set({ toolUsage });
  } catch (error) {
    console.error('Error tracking tool usage:', error);
  }
}

// Update UI
function updateUI() {
  applyTranslations();
}
