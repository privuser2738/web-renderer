/**
 * Background service worker for Web Rerender extension
 */

// Default settings
const DEFAULT_SETTINGS = {
  enabled: true,
  autoEnable: true,
  pagination: {
    mode: 'intelligent',
    controls: true,
    keyboard: true
  },
  images: {
    optimize: true,
    quality: 'adaptive',
    userControl: true
  },
  emergency: {
    autoDetect: true,
    autoFix: true
  },
  whitelist: [],
  blacklist: []
};

// Install handler
chrome.runtime.onInstalled.addListener(async (details) => {
  if (details.reason === 'install') {
    // Set default settings
    await chrome.storage.sync.set({ settings: DEFAULT_SETTINGS });

    // Open welcome page
    chrome.tabs.create({
      url: 'popup/welcome.html'
    });
  } else if (details.reason === 'update') {
    // Merge settings with new defaults
    const { settings } = await chrome.storage.sync.get('settings');
    const merged = { ...DEFAULT_SETTINGS, ...settings };
    await chrome.storage.sync.set({ settings: merged });
  }
});

// Message handler
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  switch (message.type) {
    case 'GET_SETTINGS':
      getSettings().then(sendResponse);
      return true;

    case 'UPDATE_SETTINGS':
      updateSettings(message.settings).then(sendResponse);
      return true;

    case 'TOGGLE_ENABLED':
      toggleEnabled().then(sendResponse);
      return true;

    case 'GET_PAGE_INFO':
      getPageInfo(sender.tab.id).then(sendResponse);
      return true;

    default:
      sendResponse({ error: 'Unknown message type' });
  }

  return true;
});

// Action click handler
chrome.action.onClicked.addListener(async (tab) => {
  // Toggle extension on current page
  const { settings } = await chrome.storage.sync.get('settings');
  settings.enabled = !settings.enabled;
  await chrome.storage.sync.set({ settings });

  // Reload page to apply changes
  chrome.tabs.reload(tab.id);
});

/**
 * Get current settings
 */
async function getSettings() {
  const { settings } = await chrome.storage.sync.get('settings');
  return settings || DEFAULT_SETTINGS;
}

/**
 * Update settings
 */
async function updateSettings(newSettings) {
  const { settings } = await chrome.storage.sync.get('settings');
  const updated = { ...settings, ...newSettings };
  await chrome.storage.sync.set({ settings: updated });
  return updated;
}

/**
 * Toggle enabled state
 */
async function toggleEnabled() {
  const settings = await getSettings();
  settings.enabled = !settings.enabled;
  await chrome.storage.sync.set({ settings });

  // Update icon
  chrome.action.setIcon({
    path: settings.enabled ? {
      16: 'icons/icon16.png',
      48: 'icons/icon48.png',
      128: 'icons/icon128.png'
    } : {
      16: 'icons/icon16-disabled.png',
      48: 'icons/icon48-disabled.png',
      128: 'icons/icon128-disabled.png'
    }
  });

  return settings;
}

/**
 * Get page information
 */
async function getPageInfo(tabId) {
  try {
    const results = await chrome.scripting.executeScript({
      target: { tabId },
      func: () => {
        if (window.WebRerender) {
          return {
            initialized: window.WebRerender.initialized,
            currentPage: window.WebRerender.getCurrentPage(),
            totalPages: window.WebRerender.getTotalPages(),
            deviceInfo: window.WebRerender.getDeviceInfo(),
            inputInfo: window.WebRerender.getInputInfo()
          };
        }
        return null;
      }
    });

    return results[0]?.result || null;
  } catch (error) {
    return null;
  }
}

// Context menu
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'webrerender-settings',
    title: 'Web Rerender Settings',
    contexts: ['page']
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'webrerender-settings') {
    chrome.runtime.openOptionsPage();
  }
});
