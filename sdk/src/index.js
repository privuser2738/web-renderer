/**
 * Web Rerender SDK - Enterprise-grade adaptive rendering
 * @version 1.0.0
 * @license MIT
 */

import { CoreEngine } from './core/engine.js';
import { ViewportManager } from './viewport/manager.js';
import { PaginationEngine } from './pagination/engine.js';
import { ImageOptimizer } from './images/optimizer.js';
import { InputDetector } from './input/detector.js';
import { DeviceDetector } from './core/device.js';

class WebRerender {
  constructor() {
    this.version = '1.0.0';
    this.initialized = false;
    this.config = null;
    this.modules = {};
  }

  /**
   * Initialize the Web Rerender SDK
   * @param {Object} config - Configuration options
   * @returns {Promise<WebRerender>}
   */
  async init(config = {}) {
    if (this.initialized) {
      console.warn('[WebRerender] Already initialized');
      return this;
    }

    this.config = this._mergeConfig(config);

    // Initialize core modules
    this.modules.device = new DeviceDetector();
    this.modules.input = new InputDetector();
    this.modules.viewport = new ViewportManager(this.config.viewport);
    this.modules.pagination = new PaginationEngine(this.config.pagination);
    this.modules.images = new ImageOptimizer(this.config.images);
    this.modules.core = new CoreEngine(this.modules, this.config);

    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      await new Promise(resolve => {
        document.addEventListener('DOMContentLoaded', resolve);
      });
    }

    // Start the engine
    await this.modules.core.start();

    this.initialized = true;
    this._emit('initialized', { config: this.config });

    return this;
  }

  /**
   * Destroy the SDK instance
   */
  destroy() {
    if (!this.initialized) return;

    Object.values(this.modules).forEach(module => {
      if (module && typeof module.destroy === 'function') {
        module.destroy();
      }
    });

    this.initialized = false;
    this.modules = {};
    this._emit('destroyed');
  }

  /**
   * Get current page information
   */
  getCurrentPage() {
    return this.modules.pagination?.getCurrentPage() || 1;
  }

  /**
   * Navigate to a specific page
   */
  goToPage(pageNumber) {
    return this.modules.pagination?.goToPage(pageNumber);
  }

  /**
   * Get total number of pages
   */
  getTotalPages() {
    return this.modules.pagination?.getTotalPages() || 1;
  }

  /**
   * Enable/disable image optimization
   */
  setImageOptimization(enabled) {
    return this.modules.images?.setEnabled(enabled);
  }

  /**
   * Get device information
   */
  getDeviceInfo() {
    return this.modules.device?.getInfo();
  }

  /**
   * Get input information
   */
  getInputInfo() {
    return this.modules.input?.getInfo();
  }

  /**
   * Merge user config with defaults
   */
  _mergeConfig(userConfig) {
    const defaults = {
      viewport: {
        mode: 'adaptive',
        breakpoints: {
          mobile: 768,
          tablet: 1024,
          desktop: 1440,
          tv: 1920
        }
      },
      pagination: {
        mode: 'auto', // 'auto', 'intelligent', 'manual'
        breakpoints: 'semantic', // 'semantic', 'viewport', 'custom'
        containerSelector: null,
        viewportMultiplier: 1.0,
        controls: {
          enabled: true,
          position: 'bottom-right',
          keyboard: true
        }
      },
      images: {
        lazyLoad: true,
        quality: 'adaptive', // 'high', 'medium', 'low', 'adaptive'
        userControl: true,
        placeholder: true,
        threshold: 0.1
      },
      emergency: {
        detectConflicts: true,
        autoFix: true,
        videoOptimization: true
      },
      debug: false
    };

    return this._deepMerge(defaults, userConfig);
  }

  /**
   * Deep merge objects
   */
  _deepMerge(target, source) {
    const output = { ...target };

    if (this._isObject(target) && this._isObject(source)) {
      Object.keys(source).forEach(key => {
        if (this._isObject(source[key])) {
          if (!(key in target)) {
            output[key] = source[key];
          } else {
            output[key] = this._deepMerge(target[key], source[key]);
          }
        } else {
          output[key] = source[key];
        }
      });
    }

    return output;
  }

  _isObject(item) {
    return item && typeof item === 'object' && !Array.isArray(item);
  }

  /**
   * Event emitter
   */
  _emit(event, data) {
    const customEvent = new CustomEvent(`webrerender:${event}`, {
      detail: data,
      bubbles: true
    });
    document.dispatchEvent(customEvent);
  }

  /**
   * Listen to events
   */
  on(event, callback) {
    document.addEventListener(`webrerender:${event}`, callback);
    return () => document.removeEventListener(`webrerender:${event}`, callback);
  }
}

// Create singleton instance
const instance = new WebRerender();

// Export as global and module
if (typeof window !== 'undefined') {
  window.WebRerender = instance;
}

export default instance;
export { WebRerender };
