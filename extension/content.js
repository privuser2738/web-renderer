/**
 * Content script - Injects Web Rerender SDK into web pages
 */

(async function() {
  'use strict';

  // Get extension settings
  const { settings } = await chrome.storage.sync.get('settings');

  // Check if extension is enabled
  if (!settings || !settings.enabled) {
    return;
  }

  // Check whitelist/blacklist
  const currentUrl = window.location.hostname;

  if (settings.blacklist && settings.blacklist.includes(currentUrl)) {
    return; // Site is blacklisted
  }

  if (settings.whitelist && settings.whitelist.length > 0) {
    if (!settings.whitelist.includes(currentUrl)) {
      return; // Site not in whitelist
    }
  }

  // Don't run on certain pages
  if (
    currentUrl.includes('chrome://') ||
    currentUrl.includes('chrome-extension://') ||
    currentUrl.includes('about:')
  ) {
    return;
  }

  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    await new Promise(resolve => {
      document.addEventListener('DOMContentLoaded', resolve);
    });
  }

  // Inject SDK
  injectSDK();

  /**
   * Inject the SDK script into the page
   */
  function injectSDK() {
    // Check if already injected
    if (document.getElementById('webrerender-sdk')) {
      return;
    }

    // Create script element
    const script = document.createElement('script');
    script.id = 'webrerender-sdk';
    script.src = chrome.runtime.getURL('sdk/web-rerender.js');
    script.type = 'module';

    // Initialize after SDK loads
    script.onload = () => {
      initializeSDK();
    };

    // Inject into page
    (document.head || document.documentElement).appendChild(script);
  }

  /**
   * Initialize the SDK with extension settings
   */
  function initializeSDK() {
    // Create initialization script
    const initScript = document.createElement('script');
    initScript.textContent = `
      (async function() {
        if (!window.WebRerender) {
          console.error('[WebRerender Extension] SDK not loaded');
          return;
        }

        const config = ${JSON.stringify({
          viewport: {
            mode: 'adaptive'
          },
          pagination: {
            mode: settings.pagination?.mode || 'intelligent',
            breakpoints: 'semantic',
            viewportMultiplier: 1.0,
            controls: {
              enabled: settings.pagination?.controls !== false,
              position: 'bottom-right',
              keyboard: settings.pagination?.keyboard !== false
            }
          },
          images: {
            lazyLoad: true,
            quality: settings.images?.quality || 'adaptive',
            userControl: settings.images?.userControl !== false,
            placeholder: true,
            threshold: 0.1
          },
          emergency: {
            detectConflicts: settings.emergency?.autoDetect !== false,
            autoFix: settings.emergency?.autoFix !== false,
            videoOptimization: true
          },
          debug: false
        })};

        try {
          await window.WebRerender.init(config);
          console.log('[WebRerender Extension] Initialized successfully');

          // Notify extension
          window.postMessage({
            type: 'WEBRERENDER_INITIALIZED',
            data: {
              currentPage: window.WebRerender.getCurrentPage(),
              totalPages: window.WebRerender.getTotalPages()
            }
          }, '*');
        } catch (error) {
          console.error('[WebRerender Extension] Initialization failed:', error);
        }
      })();
    `;

    (document.head || document.documentElement).appendChild(initScript);

    // Listen for events from the page
    window.addEventListener('message', (event) => {
      if (event.data.type === 'WEBRERENDER_INITIALIZED') {
        // Update extension badge
        chrome.runtime.sendMessage({
          type: 'PAGE_INITIALIZED',
          data: event.data.data
        });
      }
    });
  }

  /**
   * Listen for settings changes
   */
  chrome.storage.onChanged.addListener((changes, namespace) => {
    if (namespace === 'sync' && changes.settings) {
      // Reload page if settings changed
      if (changes.settings.oldValue?.enabled !== changes.settings.newValue?.enabled) {
        window.location.reload();
      }
    }
  });

  // Add extension indicator
  addIndicator();

  function addIndicator() {
    const indicator = document.createElement('div');
    indicator.id = 'webrerender-indicator';
    indicator.textContent = 'WR';
    indicator.title = 'Web Rerender Active';
    indicator.style.cssText = `
      position: fixed;
      bottom: 20px;
      left: 20px;
      width: 32px;
      height: 32px;
      background: rgba(0, 120, 255, 0.9);
      color: white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: sans-serif;
      font-size: 10px;
      font-weight: bold;
      z-index: 999997;
      cursor: pointer;
      transition: all 0.2s;
    `;

    indicator.addEventListener('mouseenter', () => {
      indicator.style.transform = 'scale(1.1)';
    });

    indicator.addEventListener('mouseleave', () => {
      indicator.style.transform = 'scale(1)';
    });

    indicator.addEventListener('click', () => {
      // Open popup (would need to implement)
      alert('Web Rerender Extension is active!\n\nClick the extension icon for settings.');
    });

    document.body.appendChild(indicator);

    // Auto-hide after 3 seconds
    setTimeout(() => {
      indicator.style.opacity = '0.3';
    }, 3000);
  }

})();
