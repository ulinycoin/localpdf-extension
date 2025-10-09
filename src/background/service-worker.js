// Service Worker for LocalPDF Extension
// Handles context menus, notifications, and background tasks

// Context menu items
const CONTEXT_MENU_ITEMS = [
  {
    id: 'localpdf-open',
    title: 'Open with LocalPDF',
    contexts: ['link'],
    targetUrlPatterns: ['*://*/*.pdf', '*://*/*.PDF']
  },
  {
    id: 'localpdf-merge',
    title: 'Merge PDFs',
    contexts: ['link'],
    targetUrlPatterns: ['*://*/*.pdf', '*://*/*.PDF']
  },
  {
    id: 'localpdf-compress',
    title: 'Compress PDF',
    contexts: ['link'],
    targetUrlPatterns: ['*://*/*.pdf', '*://*/*.PDF']
  },
  {
    id: 'localpdf-split',
    title: 'Split PDF',
    contexts: ['link'],
    targetUrlPatterns: ['*://*/*.pdf', '*://*/*.PDF']
  },
  {
    id: 'localpdf-protect',
    title: 'Protect PDF',
    contexts: ['link'],
    targetUrlPatterns: ['*://*/*.pdf', '*://*/*.PDF']
  }
];

// Initialize extension on install
chrome.runtime.onInstalled.addListener(async (details) => {
  console.log('LocalPDF Extension installed:', details.reason);

  // Create context menus
  createContextMenus();

  // Set default language
  const result = await chrome.storage.sync.get(['language']);
  if (!result.language) {
    await chrome.storage.sync.set({ language: 'en' });
  }

  // Show welcome notification on first install
  if (details.reason === 'install') {
    showWelcomeNotification();
  }
});

// Create context menus
function createContextMenus() {
  // Remove existing menus
  chrome.contextMenus.removeAll(() => {
    // Create new menus
    CONTEXT_MENU_ITEMS.forEach(item => {
      chrome.contextMenus.create({
        id: item.id,
        title: item.title,
        contexts: item.contexts,
        targetUrlPatterns: item.targetUrlPatterns
      });
    });

    console.log('Context menus created');
  });
}

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  const menuId = info.menuId;
  const linkUrl = info.linkUrl;

  console.log('Context menu clicked:', menuId, linkUrl);

  // Get current language
  const result = await chrome.storage.sync.get(['language']);
  const language = result.language || 'en';

  // Route to appropriate tool
  let toolPath = '';
  switch (menuId) {
    case 'localpdf-open':
      toolPath = '/merge-pdf'; // Default to merge for now
      break;
    case 'localpdf-merge':
      toolPath = '/merge-pdf';
      break;
    case 'localpdf-compress':
      toolPath = '/compress-pdf';
      break;
    case 'localpdf-split':
      toolPath = '/split-pdf';
      break;
    case 'localpdf-protect':
      toolPath = '/protect-pdf';
      break;
    default:
      return;
  }

  // Build URL with language
  const url = buildURL(toolPath, language);

  // Open in new tab
  chrome.tabs.create({ url });

  // Note: File handling would require downloads API and file system access
  // For MVP, we just open the tool page
});

// Build URL with language prefix
function buildURL(path, language) {
  const baseURL = 'https://localpdf.online';

  if (language !== 'en') {
    return `${baseURL}/${language}${path}`;
  }

  return `${baseURL}${path}`;
}

// Show welcome notification
function showWelcomeNotification() {
  chrome.notifications.create('welcome', {
    type: 'basic',
    iconUrl: '../icons/icon-128.png',
    title: 'Welcome to LocalPDF!',
    message: 'Click the extension icon to quickly access PDF tools.',
    priority: 1
  });
}

// Handle messages from popup or content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Message received:', request);

  switch (request.action) {
    case 'openTool':
      handleOpenTool(request.tool, request.language);
      sendResponse({ success: true });
      break;

    case 'getStats':
      getUsageStats().then(stats => {
        sendResponse({ stats });
      });
      return true; // Keep channel open for async response

    default:
      sendResponse({ error: 'Unknown action' });
  }
});

// Handle opening tool
async function handleOpenTool(tool, language) {
  const toolPath = `/${tool}`;
  const url = buildURL(toolPath, language);
  await chrome.tabs.create({ url });
}

// Get usage statistics
async function getUsageStats() {
  try {
    const result = await chrome.storage.local.get(['toolUsage']);
    return result.toolUsage || {};
  } catch (error) {
    console.error('Error getting usage stats:', error);
    return {};
  }
}

// Update context menu titles when language changes
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'sync' && changes.language) {
    console.log('Language changed:', changes.language.newValue);
    // Context menus would need to be recreated with new language
    // For MVP, we keep English titles
  }
});

// Keep service worker alive (optional, for debugging)
chrome.runtime.onStartup.addListener(() => {
  console.log('LocalPDF Extension started');
});

console.log('LocalPDF Service Worker loaded');
