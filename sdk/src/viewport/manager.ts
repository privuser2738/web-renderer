/**
 * Viewport Manager - Manages viewport dimensions and responsive breakpoints
 */

export class ViewportManager {
  constructor(config) {
    this.config = config;
    this.viewport = {
      width: 0,
      height: 0,
      availWidth: 0,
      availHeight: 0,
      category: null,
      orientation: null
    };
    this.deviceInfo = null;

    this._resizeTimer = null;
  }

  /**
   * Initialize viewport manager
   */
  init(deviceInfo) {
    this.deviceInfo = deviceInfo;
    this._updateViewport();
    this._setupListeners();
    return this.viewport;
  }

  /**
   * Update viewport information
   */
  _updateViewport() {
    const width = window.innerWidth;
    const height = window.innerHeight;

    this.viewport = {
      width,
      height,
      availWidth: window.innerWidth,
      availHeight: window.innerHeight,
      category: this._categorizeViewport(width),
      orientation: width > height ? 'landscape' : 'portrait',
      scrollHeight: document.documentElement.scrollHeight,
      scrollWidth: document.documentElement.scrollWidth,
      pixelRatio: window.devicePixelRatio || 1
    };
  }

  /**
   * Categorize viewport based on breakpoints
   */
  _categorizeViewport(width) {
    const { breakpoints } = this.config;

    if (width < breakpoints.mobile) {
      return 'mobile';
    } else if (width < breakpoints.tablet) {
      return 'tablet';
    } else if (width < breakpoints.desktop) {
      return 'desktop';
    } else if (width < breakpoints.tv) {
      return 'desktop-large';
    } else {
      return 'tv';
    }
  }

  /**
   * Setup event listeners
   */
  _setupListeners() {
    window.addEventListener('resize', () => this._handleResize());
    window.addEventListener('orientationchange', () => this._handleResize());
  }

  /**
   * Handle resize events (debounced)
   */
  _handleResize() {
    if (this._resizeTimer) {
      clearTimeout(this._resizeTimer);
    }

    this._resizeTimer = setTimeout(() => {
      const oldViewport = { ...this.viewport };
      this._updateViewport();

      // Only emit if significant change
      if (
        oldViewport.category !== this.viewport.category ||
        oldViewport.orientation !== this.viewport.orientation ||
        Math.abs(oldViewport.width - this.viewport.width) > 50
      ) {
        this._emit('changed', {
          old: oldViewport,
          new: this.viewport
        });
      }
    }, 150);
  }

  /**
   * Get current viewport info
   */
  getViewport() {
    return { ...this.viewport };
  }

  /**
   * Get viewport dimensions
   */
  getDimensions() {
    return {
      width: this.viewport.width,
      height: this.viewport.height
    };
  }

  /**
   * Get viewport category
   */
  getCategory() {
    return this.viewport.category;
  }

  /**
   * Check if viewport is at least a certain size
   */
  isAtLeast(category) {
    const order = ['mobile', 'tablet', 'desktop', 'desktop-large', 'tv'];
    const currentIndex = order.indexOf(this.viewport.category);
    const targetIndex = order.indexOf(category);
    return currentIndex >= targetIndex;
  }

  /**
   * Get optimal content width for reading
   */
  getOptimalContentWidth() {
    const { category } = this.viewport;

    // Optimal line length for readability: 50-75 characters, ~600-800px
    switch (category) {
      case 'mobile':
        return this.viewport.width - 32; // 16px padding each side
      case 'tablet':
        return Math.min(this.viewport.width - 64, 720);
      case 'desktop':
      case 'desktop-large':
        return Math.min(this.viewport.width * 0.7, 960);
      case 'tv':
        return Math.min(this.viewport.width * 0.6, 1200);
      default:
        return this.viewport.width;
    }
  }

  /**
   * Get number of columns that fit in viewport
   */
  getOptimalColumns(minColumnWidth = 300) {
    const availableWidth = this.viewport.width - 32; // Account for padding
    const columns = Math.floor(availableWidth / minColumnWidth);
    return Math.max(1, Math.min(columns, 4)); // Between 1 and 4 columns
  }

  /**
   * Calculate usable viewport height (excluding browser chrome)
   */
  getUsableHeight() {
    // Account for potential browser UI, nav bars, etc.
    const { category } = this.viewport;

    switch (category) {
      case 'mobile':
        // Mobile browsers often have dynamic toolbars
        return this.viewport.height * 0.85;
      case 'tablet':
        return this.viewport.height * 0.9;
      default:
        return this.viewport.height * 0.95;
    }
  }

  /**
   * Check if content fits in viewport
   */
  contentFitsInViewport(element) {
    if (!element) return false;

    const rect = element.getBoundingClientRect();
    return (
      rect.height <= this.viewport.height &&
      rect.width <= this.viewport.width
    );
  }

  /**
   * Get responsive spacing
   */
  getSpacing() {
    const { category } = this.viewport;

    switch (category) {
      case 'mobile':
        return { small: 8, medium: 16, large: 24 };
      case 'tablet':
        return { small: 12, medium: 24, large: 36 };
      case 'desktop':
      case 'desktop-large':
        return { small: 16, medium: 32, large: 48 };
      case 'tv':
        return { small: 24, medium: 48, large: 72 };
      default:
        return { small: 16, medium: 32, large: 48 };
    }
  }

  /**
   * Calculate pages needed for content height
   */
  calculatePagesNeeded(contentHeight) {
    const usableHeight = this.getUsableHeight();
    return Math.ceil(contentHeight / usableHeight);
  }

  /**
   * Emit events
   */
  _emit(event, data) {
    const customEvent = new CustomEvent(`webrerender:viewport:${event}`, {
      detail: data,
      bubbles: true
    });
    document.dispatchEvent(customEvent);
  }

  /**
   * Cleanup
   */
  destroy() {
    if (this._resizeTimer) {
      clearTimeout(this._resizeTimer);
    }
  }
}
