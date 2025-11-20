/**
 * Popup script for Web Rerender extension
 */

document.addEventListener('DOMContentLoaded', async () => {
  // Get elements
  const status = document.getElementById('status');
  const statusText = status.querySelector('.status-text');
  const statusDot = status.querySelector('.status-dot');
  const currentPage = document.getElementById('currentPage');
  const totalPages = document.getElementById('totalPages');
  const device = document.getElementById('device');

  const enabledToggle = document.getElementById('enabledToggle');
  const paginationToggle = document.getElementById('paginationToggle');
  const imageOptToggle = document.getElementById('imageOptToggle');
  const emergencyToggle = document.getElementById('emergencyToggle');

  const reloadBtn = document.getElementById('reloadBtn');
  const settingsBtn = document.getElementById('settingsBtn');

  // Load settings
  const { settings } = await chrome.storage.sync.get('settings');

  if (settings) {
    enabledToggle.checked = settings.enabled !== false;
    paginationToggle.checked = settings.pagination?.controls !== false;
    imageOptToggle.checked = settings.images?.optimize !== false;
    emergencyToggle.checked = settings.emergency?.autoFix !== false;
  }

  // Update status
  updateStatus(settings?.enabled !== false);

  // Get current tab
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  // Get page info
  try {
    const pageInfo = await chrome.runtime.sendMessage({ type: 'GET_PAGE_INFO' });

    if (pageInfo && pageInfo.initialized) {
      currentPage.textContent = pageInfo.currentPage || '-';
      totalPages.textContent = pageInfo.totalPages || '-';
      device.textContent = pageInfo.deviceInfo?.type || '-';
    }
  } catch (error) {
    console.error('Failed to get page info:', error);
  }

  // Event listeners
  enabledToggle.addEventListener('change', async () => {
    const enabled = enabledToggle.checked;
    await chrome.runtime.sendMessage({
      type: 'UPDATE_SETTINGS',
      settings: { enabled }
    });
    updateStatus(enabled);
  });

  paginationToggle.addEventListener('change', async () => {
    await chrome.runtime.sendMessage({
      type: 'UPDATE_SETTINGS',
      settings: {
        pagination: {
          ...settings.pagination,
          controls: paginationToggle.checked
        }
      }
    });
  });

  imageOptToggle.addEventListener('change', async () => {
    await chrome.runtime.sendMessage({
      type: 'UPDATE_SETTINGS',
      settings: {
        images: {
          ...settings.images,
          optimize: imageOptToggle.checked
        }
      }
    });
  });

  emergencyToggle.addEventListener('change', async () => {
    await chrome.runtime.sendMessage({
      type: 'UPDATE_SETTINGS',
      settings: {
        emergency: {
          ...settings.emergency,
          autoFix: emergencyToggle.checked
        }
      }
    });
  });

  reloadBtn.addEventListener('click', () => {
    chrome.tabs.reload(tab.id);
    window.close();
  });

  settingsBtn.addEventListener('click', () => {
    chrome.runtime.openOptionsPage();
  });

  /**
   * Update status display
   */
  function updateStatus(enabled) {
    if (enabled) {
      statusText.textContent = 'Active';
      statusDot.style.background = '#4ade80';
    } else {
      statusText.textContent = 'Inactive';
      statusDot.style.background = '#f87171';
    }
  }
});
