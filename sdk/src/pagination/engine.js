/**
 * Pagination Engine - Converts scrollable content into paginated view
 * Eliminates scrolling by breaking content into viewport-sized pages
 */

export class PaginationEngine {
  constructor(config) {
    this.config = config;
    this.state = {
      enabled: false,
      mode: config.mode,
      currentPage: 1,
      totalPages: 1,
      pages: [],
      container: null
    };
    this.viewport = null;
    this.controls = null;
    this.emergencyMode = false;
  }

  /**
   * Initialize pagination
   */
  async init(viewport) {
    this.viewport = viewport;

    // Find or create container
    this.state.container = this._findContainer();

    if (!this.state.container) {
      console.warn('[WebRerender] No content container found');
      return;
    }

    // Calculate pages
    await this._calculatePages();

    // Inject styles
    this._injectStyles();

    // Create controls
    if (this.config.controls.enabled) {
      this._createControls();
    }

    // Setup keyboard navigation
    if (this.config.controls.keyboard) {
      this._setupKeyboardNav();
    }

    // Enable pagination
    this._enable();

    // Show first page
    this.goToPage(1);

    return this;
  }

  /**
   * Find content container
   */
  _findContainer() {
    // User-specified selector
    if (this.config.containerSelector) {
      const container = document.querySelector(this.config.containerSelector);
      if (container) return container;
    }

    // Try common containers
    const selectors = [
      'main',
      '[role="main"]',
      'article',
      '.content',
      '#content',
      '.main',
      '#main',
      'body > div'
    ];

    for (const selector of selectors) {
      const element = document.querySelector(selector);
      if (element && element.scrollHeight > this.viewport.height) {
        return element;
      }
    }

    // Fallback to body
    return document.body;
  }

  /**
   * Calculate pages based on mode
   */
  async _calculatePages() {
    const mode = this.emergencyMode ? 'auto' : this.config.mode;

    switch (mode) {
      case 'auto':
        await this._calculateAutoPages();
        break;
      case 'intelligent':
        await this._calculateIntelligentPages();
        break;
      case 'manual':
        // Manual mode: developer defines pages
        this._calculateManualPages();
        break;
      default:
        await this._calculateAutoPages();
    }

    this.state.totalPages = this.state.pages.length;
    this._emit('calculated', {
      mode,
      totalPages: this.state.totalPages
    });
  }

  /**
   * Calculate pages automatically based on viewport
   */
  async _calculateAutoPages() {
    const viewportHeight = this.viewport.height * this.config.viewportMultiplier;
    const container = this.state.container;
    const children = Array.from(container.children);

    const pages = [];
    let currentPage = [];
    let currentHeight = 0;

    for (const child of children) {
      // Skip script/style elements
      if (['SCRIPT', 'STYLE', 'NOSCRIPT'].includes(child.tagName)) {
        continue;
      }

      const childHeight = child.offsetHeight;

      // If adding this child exceeds viewport, start new page
      if (currentHeight + childHeight > viewportHeight && currentPage.length > 0) {
        pages.push([...currentPage]);
        currentPage = [child];
        currentHeight = childHeight;
      } else {
        currentPage.push(child);
        currentHeight += childHeight;
      }
    }

    // Add last page
    if (currentPage.length > 0) {
      pages.push(currentPage);
    }

    // Ensure at least one page
    if (pages.length === 0) {
      pages.push([...children]);
    }

    this.state.pages = pages;
  }

  /**
   * Calculate pages intelligently based on semantic HTML
   */
  async _calculateIntelligentPages() {
    const viewportHeight = this.viewport.height * this.config.viewportMultiplier;
    const container = this.state.container;

    // Find semantic breakpoints
    const breakpoints = this._findSemanticBreakpoints(container);

    if (breakpoints.length === 0) {
      // Fallback to auto
      return await this._calculateAutoPages();
    }

    const pages = [];
    let currentPage = [];
    let currentHeight = 0;

    for (let i = 0; i < breakpoints.length; i++) {
      const element = breakpoints[i];
      const height = element.offsetHeight;

      // If this is a major breakpoint (h1, article, section), consider starting new page
      const isMajorBreakpoint = ['H1', 'ARTICLE', 'SECTION'].includes(element.tagName);

      if (
        (currentHeight + height > viewportHeight && currentPage.length > 0) ||
        (isMajorBreakpoint && currentHeight > viewportHeight * 0.5)
      ) {
        pages.push([...currentPage]);
        currentPage = [element];
        currentHeight = height;
      } else {
        currentPage.push(element);
        currentHeight += height;
      }
    }

    // Add last page
    if (currentPage.length > 0) {
      pages.push(currentPage);
    }

    this.state.pages = pages;
  }

  /**
   * Find semantic breakpoints in content
   */
  _findSemanticBreakpoints(container) {
    const selectors = [
      'article',
      'section',
      'h1', 'h2',
      'hr',
      'div[class*="section"]',
      'div[id*="section"]',
      '> *' // Fallback to direct children
    ];

    const elements = [];
    for (const selector of selectors) {
      const found = container.querySelectorAll(selector);
      if (found.length > 0) {
        elements.push(...Array.from(found));
        break; // Use first selector that finds elements
      }
    }

    // Remove duplicates and sort by position
    const unique = [...new Set(elements)];
    return unique.sort((a, b) => {
      const posA = a.getBoundingClientRect().top;
      const posB = b.getBoundingClientRect().top;
      return posA - posB;
    });
  }

  /**
   * Calculate manual pages (developer-defined)
   */
  _calculateManualPages() {
    const pageElements = this.state.container.querySelectorAll('[data-webrerender-page]');

    if (pageElements.length === 0) {
      // No manual pages defined, fallback to auto
      return this._calculateAutoPages();
    }

    this.state.pages = Array.from(pageElements).map(element => [element]);
  }

  /**
   * Enable pagination
   */
  _enable() {
    this.state.enabled = true;
    this.state.container.classList.add('webrerender-paginated');
  }

  /**
   * Disable pagination
   */
  _disable() {
    this.state.enabled = false;
    this.state.container.classList.remove('webrerender-paginated');

    // Show all elements
    this.state.pages.flat().forEach(element => {
      element.style.display = '';
    });
  }

  /**
   * Go to specific page
   */
  goToPage(pageNumber) {
    if (pageNumber < 1 || pageNumber > this.state.totalPages) {
      return false;
    }

    const oldPage = this.state.currentPage;
    this.state.currentPage = pageNumber;

    // Hide all elements
    this.state.pages.flat().forEach(element => {
      element.style.display = 'none';
    });

    // Show current page elements
    const currentPageElements = this.state.pages[pageNumber - 1] || [];
    currentPageElements.forEach(element => {
      element.style.display = '';
    });

    // Scroll to top
    window.scrollTo(0, 0);

    // Update controls
    if (this.controls) {
      this._updateControls();
    }

    this._emit('pagechanged', {
      from: oldPage,
      to: pageNumber,
      total: this.state.totalPages
    });

    return true;
  }

  /**
   * Navigate to next page
   */
  nextPage() {
    if (this.state.currentPage < this.state.totalPages) {
      return this.goToPage(this.state.currentPage + 1);
    }
    return false;
  }

  /**
   * Navigate to previous page
   */
  prevPage() {
    if (this.state.currentPage > 1) {
      return this.goToPage(this.state.currentPage - 1);
    }
    return false;
  }

  /**
   * Create pagination controls
   */
  _createControls() {
    const controls = document.createElement('div');
    controls.className = 'webrerender-controls';
    controls.innerHTML = `
      <div class="webrerender-controls-inner">
        <button class="webrerender-btn webrerender-prev" aria-label="Previous page">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
            <path d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"/>
          </svg>
        </button>
        <div class="webrerender-page-info">
          <span class="webrerender-current">1</span>
          <span class="webrerender-separator">/</span>
          <span class="webrerender-total">1</span>
        </div>
        <button class="webrerender-btn webrerender-next" aria-label="Next page">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
            <path d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"/>
          </svg>
        </button>
      </div>
    `;

    // Position based on config
    controls.style.cssText = this._getControlsPosition();

    // Event listeners
    controls.querySelector('.webrerender-prev').addEventListener('click', () => this.prevPage());
    controls.querySelector('.webrerender-next').addEventListener('click', () => this.nextPage());

    document.body.appendChild(controls);
    this.controls = controls;
    this._updateControls();
  }

  /**
   * Get controls position CSS
   */
  _getControlsPosition() {
    const position = this.config.controls.position || 'bottom-right';
    const [vertical, horizontal] = position.split('-');

    let css = 'position: fixed; z-index: 999999;';

    if (vertical === 'top') css += 'top: 20px;';
    if (vertical === 'bottom') css += 'bottom: 20px;';

    if (horizontal === 'left') css += 'left: 20px;';
    if (horizontal === 'right') css += 'right: 20px;';
    if (horizontal === 'center') css += 'left: 50%; transform: translateX(-50%);';

    return css;
  }

  /**
   * Update controls state
   */
  _updateControls() {
    if (!this.controls) return;

    const currentSpan = this.controls.querySelector('.webrerender-current');
    const totalSpan = this.controls.querySelector('.webrerender-total');
    const prevBtn = this.controls.querySelector('.webrerender-prev');
    const nextBtn = this.controls.querySelector('.webrerender-next');

    currentSpan.textContent = this.state.currentPage;
    totalSpan.textContent = this.state.totalPages;

    prevBtn.disabled = this.state.currentPage === 1;
    nextBtn.disabled = this.state.currentPage === this.state.totalPages;
  }

  /**
   * Setup keyboard navigation
   */
  _setupKeyboardNav() {
    document.addEventListener('keydown', (e) => {
      // Arrow keys, page up/down, space
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
        return; // Don't intercept when typing
      }

      switch (e.key) {
        case 'ArrowRight':
        case 'PageDown':
        case ' ': // Space
          e.preventDefault();
          this.nextPage();
          break;
        case 'ArrowLeft':
        case 'PageUp':
          e.preventDefault();
          this.prevPage();
          break;
        case 'Home':
          e.preventDefault();
          this.goToPage(1);
          break;
        case 'End':
          e.preventDefault();
          this.goToPage(this.state.totalPages);
          break;
      }
    });
  }

  /**
   * Inject required styles
   */
  _injectStyles() {
    if (document.getElementById('webrerender-pagination-styles')) {
      return;
    }

    const style = document.createElement('style');
    style.id = 'webrerender-pagination-styles';
    style.textContent = `
      .webrerender-paginated {
        overflow: hidden !important;
      }

      .webrerender-controls {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        user-select: none;
      }

      .webrerender-controls-inner {
        background: rgba(0, 0, 0, 0.85);
        backdrop-filter: blur(10px);
        border-radius: 12px;
        padding: 12px 16px;
        display: flex;
        align-items: center;
        gap: 12px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
      }

      .webrerender-btn {
        background: rgba(255, 255, 255, 0.1);
        border: 1px solid rgba(255, 255, 255, 0.2);
        border-radius: 8px;
        color: white;
        cursor: pointer;
        padding: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s;
      }

      .webrerender-btn:hover:not(:disabled) {
        background: rgba(255, 255, 255, 0.2);
        transform: scale(1.05);
      }

      .webrerender-btn:disabled {
        opacity: 0.3;
        cursor: not-allowed;
      }

      .webrerender-page-info {
        color: white;
        font-size: 14px;
        font-weight: 500;
        display: flex;
        align-items: center;
        gap: 6px;
        min-width: 60px;
        justify-content: center;
      }

      .webrerender-separator {
        opacity: 0.5;
      }
    `;
    document.head.appendChild(style);
  }

  /**
   * Handle viewport change
   */
  handleViewportChange(viewport) {
    this.viewport = viewport.new;
    this.recalculate();
  }

  /**
   * Handle input change
   */
  handleInputChange(input) {
    // Could adjust controls based on input type
  }

  /**
   * Recalculate pagination
   */
  async recalculate() {
    const currentPage = this.state.currentPage;
    await this._calculatePages();
    this.goToPage(Math.min(currentPage, this.state.totalPages));
  }

  /**
   * Set emergency mode
   */
  setEmergencyMode(enabled) {
    this.emergencyMode = enabled;
    if (enabled) {
      this.recalculate();
    }
  }

  /**
   * Get current page
   */
  getCurrentPage() {
    return this.state.currentPage;
  }

  /**
   * Get total pages
   */
  getTotalPages() {
    return this.state.totalPages;
  }

  /**
   * Emit events
   */
  _emit(event, data) {
    const customEvent = new CustomEvent(`webrerender:pagination:${event}`, {
      detail: data,
      bubbles: true
    });
    document.dispatchEvent(customEvent);
  }

  /**
   * Cleanup
   */
  destroy() {
    this._disable();

    if (this.controls) {
      this.controls.remove();
      this.controls = null;
    }

    const style = document.getElementById('webrerender-pagination-styles');
    if (style) {
      style.remove();
    }
  }
}
