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
import type {
  IWebRerender,
  WebRerenderConfig,
  Modules,
  DeviceInfo,
  InputInfo,
  WebRerenderEventType,
  EventCallback,
  UnsubscribeFn
} from './types.js';

class WebRerender implements IWebRerender {
  version: string;
  initialized: boolean;
  config: WebRerenderConfig | null;
  modules: Partial<Modules>;

  constructor() {
    this.version = '1.0.0';
    this.initialized = false;
    this.config = null;
    this.modules = {};
  }

  /**
   * Initialize the Web Rerender SDK
   */
  async init(config: WebRerenderConfig = {}): Promise<IWebRerender> {
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
  destroy(): void {
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
  getCurrentPage(): number {
    return this.modules.pagination?.getCurrentPage() || 1;
  }

  /**
   * Navigate to a specific page
   */
  goToPage(pageNumber: number): boolean {
    return this.modules.pagination?.goToPage(pageNumber);
  }

  /**
   * Get total number of pages
   */
  getTotalPages(): number {
    return this.modules.pagination?.getTotalPages() || 1;
  }

  /**
   * Enable/disable image optimization
   */
  setImageOptimization(enabled: boolean): void {
    return this.modules.images?.setEnabled(enabled);
  }

  /**
   * Get device information
   */
  getDeviceInfo(): DeviceInfo {
    return this.modules.device?.getInfo();
  }

  /**
   * Get input information
   */
  getInputInfo(): InputInfo {
    return this.modules.input?.getInfo();
  }

  /**
   * Merge user config with defaults
   */
  private _mergeConfig(userConfig: WebRerenderConfig): WebRerenderConfig {
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
  private _deepMerge(target: any, source: any): any {
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

  private _isObject(item: any): boolean {
    return item && typeof item === 'object' && !Array.isArray(item);
  }

  /**
   * Event emitter
   */
  private _emit(event: string, data: any): void {
    const customEvent = new CustomEvent(`webrerender:${event}`, {
      detail: data,
      bubbles: true
    });
    document.dispatchEvent(customEvent);
  }

  /**
   * Listen to events
   */
  on<T extends WebRerenderEventType>(event: T, callback: EventCallback<T>): UnsubscribeFn {
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
