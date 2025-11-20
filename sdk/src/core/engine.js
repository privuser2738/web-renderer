/**
 * Core Engine - Orchestrates all modules and manages the rendering pipeline
 */

export class CoreEngine {
  constructor(modules, config) {
    this.modules = modules;
    this.config = config;
    this.state = {
      running: false,
      ready: false,
      emergency: false
    };
    this.observers = [];
  }

  /**
   * Start the engine
   */
  async start() {
    if (this.state.running) {
      return;
    }

    this.log('Starting Web Rerender Engine...');

    // Detect emergency situations
    if (this.config.emergency.detectConflicts) {
      this._detectEmergency();
    }

    // Initialize modules in order
    await this._initializeModules();

    // Setup coordination between modules
    this._setupModuleCoordination();

    // Setup observers
    this._setupObservers();

    this.state.running = true;
    this.state.ready = true;

    this.log('Engine started successfully');
    this._emit('ready');

    return this;
  }

  /**
   * Initialize all modules
   */
  async _initializeModules() {
    const { device, input, viewport, pagination, images } = this.modules;

    // Get device and input info
    const deviceInfo = device.getInfo();
    const inputInfo = input.getInfo();

    this.log('Device:', deviceInfo.type, deviceInfo.os);
    this.log('Input types:', Object.keys(inputInfo.types).filter(k => inputInfo.types[k]));

    // Initialize viewport with device info
    viewport.init(deviceInfo);

    // Initialize pagination with viewport info
    await pagination.init(viewport.getViewport());

    // Initialize image optimizer
    images.init(deviceInfo);
  }

  /**
   * Setup coordination between modules
   */
  _setupModuleCoordination() {
    const { viewport, pagination, images, input } = this.modules;

    // When viewport changes, update pagination
    document.addEventListener('webrerender:viewport:changed', (e) => {
      pagination.handleViewportChange(e.detail);
    });

    // When page changes, update images
    document.addEventListener('webrerender:pagination:pagechanged', (e) => {
      images.handlePageChange(e.detail);
    });

    // When input type changes, update navigation
    document.addEventListener('webrerender:input:changed', (e) => {
      pagination.handleInputChange(e.detail);
    });

    // Emergency rendering events
    if (this.state.emergency) {
      this.log('Emergency mode active - applying fixes');
      this._applyEmergencyFixes();
    }
  }

  /**
   * Setup DOM observers
   */
  _setupObservers() {
    // Watch for DOM mutations that might affect pagination
    if ('MutationObserver' in window) {
      const observer = new MutationObserver((mutations) => {
        this._handleMutations(mutations);
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: false
      });

      this.observers.push(observer);
    }
  }

  /**
   * Handle DOM mutations
   */
  _handleMutations(mutations) {
    let needsRecalculation = false;

    for (const mutation of mutations) {
      if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
        // Check if added nodes are significant (images, videos, large content blocks)
        for (const node of mutation.addedNodes) {
          if (node.nodeType === 1) { // Element node
            const tagName = node.tagName?.toLowerCase();
            if (['img', 'video', 'iframe', 'article', 'section'].includes(tagName)) {
              needsRecalculation = true;
              break;
            }
          }
        }
      }
    }

    if (needsRecalculation) {
      this._scheduleRecalculation();
    }
  }

  /**
   * Schedule recalculation (debounced)
   */
  _scheduleRecalculation() {
    if (this._recalcTimer) {
      clearTimeout(this._recalcTimer);
    }

    this._recalcTimer = setTimeout(() => {
      this.log('Recalculating pagination due to DOM changes');
      this.modules.pagination.recalculate();
    }, 500);
  }

  /**
   * Detect emergency rendering situations
   */
  _detectEmergency() {
    const issues = [];

    // Check for excessive height
    const bodyHeight = document.body.scrollHeight;
    const viewportHeight = window.innerHeight;
    if (bodyHeight > viewportHeight * 10) {
      issues.push('excessive-height');
    }

    // Check for many large images
    const images = document.querySelectorAll('img');
    if (images.length > 50) {
      issues.push('excessive-images');
    }

    // Check for videos
    const videos = document.querySelectorAll('video, iframe[src*="youtube"], iframe[src*="vimeo"]');
    if (videos.length > 10) {
      issues.push('excessive-videos');
    }

    // Check for overlapping elements (z-index conflicts)
    const highZIndex = document.querySelectorAll('[style*="z-index"]');
    if (highZIndex.length > 20) {
      issues.push('z-index-conflicts');
    }

    if (issues.length > 0) {
      this.state.emergency = true;
      this.log('Emergency mode activated:', issues.join(', '));
      this._emit('emergency', { issues });
    }
  }

  /**
   * Apply emergency fixes
   */
  _applyEmergencyFixes() {
    // Force aggressive image optimization
    this.modules.images.setEmergencyMode(true);

    // Force viewport-based pagination
    this.modules.pagination.setEmergencyMode(true);

    // Add emergency styles
    this._injectEmergencyStyles();
  }

  /**
   * Inject emergency CSS
   */
  _injectEmergencyStyles() {
    const style = document.createElement('style');
    style.id = 'webrerender-emergency';
    style.textContent = `
      /* Web Rerender Emergency Styles */
      video, iframe[src*="youtube"], iframe[src*="vimeo"] {
        max-width: 100% !important;
        height: auto !important;
      }

      /* Prevent layout breaks */
      * {
        max-width: 100vw !important;
      }

      /* Fix z-index conflicts */
      body > * {
        z-index: auto !important;
      }
    `;
    document.head.appendChild(style);
  }

  /**
   * Stop the engine
   */
  stop() {
    if (!this.state.running) {
      return;
    }

    // Cleanup observers
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];

    // Stop modules
    Object.values(this.modules).forEach(module => {
      if (module && typeof module.destroy === 'function') {
        module.destroy();
      }
    });

    this.state.running = false;
    this.state.ready = false;

    this.log('Engine stopped');
    this._emit('stopped');
  }

  /**
   * Get engine state
   */
  getState() {
    return { ...this.state };
  }

  /**
   * Log messages (respects debug config)
   */
  log(...args) {
    if (this.config.debug) {
      console.log('[WebRerender]', ...args);
    }
  }

  /**
   * Emit events
   */
  _emit(event, data) {
    const customEvent = new CustomEvent(`webrerender:engine:${event}`, {
      detail: data,
      bubbles: true
    });
    document.dispatchEvent(customEvent);
  }

  /**
   * Cleanup
   */
  destroy() {
    this.stop();
  }
}
