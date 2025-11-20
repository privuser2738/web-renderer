/**
 * Input Detector - Detects and tracks all input types (mouse, keyboard, touch, pen, pointer)
 */

export class InputDetector {
  constructor() {
    this.info = {
      types: {
        mouse: false,
        keyboard: false,
        touch: false,
        pen: false,
        pointer: false
      },
      primary: null,
      recent: [],
      lastInteraction: null
    };

    this._setupListeners();
    this._detectInitial();
  }

  /**
   * Detect initial input capabilities
   */
  _detectInitial() {
    // Touch support
    this.info.types.touch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

    // Pointer events support
    this.info.types.pointer = 'PointerEvent' in window;

    // Mouse support (fine pointer)
    this.info.types.mouse = matchMedia('(pointer: fine)').matches;

    // Keyboard (assume available)
    this.info.types.keyboard = true;

    // Set primary based on device
    if (this.info.types.touch && !this.info.types.mouse) {
      this.info.primary = 'touch';
    } else if (this.info.types.mouse) {
      this.info.primary = 'mouse';
    } else {
      this.info.primary = 'keyboard';
    }
  }

  /**
   * Setup event listeners to detect actual usage
   */
  _setupListeners() {
    // Mouse events
    document.addEventListener('mousedown', (e) => this._handleMouse(e), { passive: true, capture: true });
    document.addEventListener('mousemove', (e) => this._handleMouse(e), { passive: true, capture: true });

    // Touch events
    document.addEventListener('touchstart', (e) => this._handleTouch(e), { passive: true, capture: true });

    // Pointer events (can detect pen)
    if ('PointerEvent' in window) {
      document.addEventListener('pointerdown', (e) => this._handlePointer(e), { passive: true, capture: true });
    }

    // Keyboard events
    document.addEventListener('keydown', (e) => this._handleKeyboard(e), { passive: true, capture: true });

    // Wheel/scroll (mouse-specific)
    document.addEventListener('wheel', (e) => this._handleWheel(e), { passive: true, capture: true });
  }

  /**
   * Handle mouse events
   */
  _handleMouse(e) {
    if (e.sourceCapabilities?.firesTouchEvents) {
      // This is a touch event simulated as mouse
      return;
    }

    if (!this.info.types.mouse) {
      this.info.types.mouse = true;
      this._updatePrimary('mouse');
    }

    this._recordInteraction('mouse', e);
  }

  /**
   * Handle touch events
   */
  _handleTouch(e) {
    if (!this.info.types.touch) {
      this.info.types.touch = true;
      this._updatePrimary('touch');
    }

    this._recordInteraction('touch', e);
  }

  /**
   * Handle pointer events (includes pen)
   */
  _handlePointer(e) {
    const type = e.pointerType;

    if (type === 'pen') {
      if (!this.info.types.pen) {
        this.info.types.pen = true;
        this._updatePrimary('pen');
      }
      this._recordInteraction('pen', e);
    } else if (type === 'mouse') {
      this._handleMouse(e);
    } else if (type === 'touch') {
      this._handleTouch(e);
    }
  }

  /**
   * Handle keyboard events
   */
  _handleKeyboard(e) {
    this._recordInteraction('keyboard', e);
  }

  /**
   * Handle wheel events
   */
  _handleWheel(e) {
    this._recordInteraction('mouse', e);
  }

  /**
   * Record an interaction
   */
  _recordInteraction(type, event) {
    const interaction = {
      type,
      timestamp: Date.now(),
      target: event.target?.tagName
    };

    this.info.lastInteraction = interaction;

    // Keep last 10 interactions
    this.info.recent.unshift(interaction);
    if (this.info.recent.length > 10) {
      this.info.recent.pop();
    }

    this._emit('interaction', interaction);
  }

  /**
   * Update primary input type
   */
  _updatePrimary(type) {
    if (this.info.primary !== type) {
      const oldPrimary = this.info.primary;
      this.info.primary = type;
      this._emit('changed', {
        from: oldPrimary,
        to: type,
        info: this.getInfo()
      });
    }
  }

  /**
   * Get input information
   */
  getInfo() {
    return {
      ...this.info,
      types: { ...this.info.types },
      recent: [...this.info.recent]
    };
  }

  /**
   * Get primary input type
   */
  getPrimary() {
    return this.info.primary;
  }

  /**
   * Check if input type is available
   */
  has(type) {
    return !!this.info.types[type];
  }

  /**
   * Check if input type was recently used
   */
  wasRecentlyUsed(type, withinMs = 5000) {
    const now = Date.now();
    return this.info.recent.some(
      interaction => interaction.type === type && (now - interaction.timestamp) < withinMs
    );
  }

  /**
   * Get input preferences for UI optimization
   */
  getUIPreferences() {
    const primary = this.info.primary;

    return {
      // Should show hover states
      showHover: this.info.types.mouse || this.info.types.pen,

      // Should use large touch targets
      largeTouchTargets: primary === 'touch',

      // Should show keyboard focus indicators
      showFocus: this.wasRecentlyUsed('keyboard', 10000),

      // Should enable drag gestures
      enableDrag: this.info.types.mouse || this.info.types.pen,

      // Should enable swipe gestures
      enableSwipe: this.info.types.touch,

      // Recommended minimum click/tap target size
      minTargetSize: primary === 'touch' ? 44 : primary === 'pen' ? 36 : 24,

      // Should show scrollbars
      showScrollbars: this.info.types.mouse
    };
  }

  /**
   * Emit events
   */
  _emit(event, data) {
    const customEvent = new CustomEvent(`webrerender:input:${event}`, {
      detail: data,
      bubbles: true
    });
    document.dispatchEvent(customEvent);
  }

  /**
   * Cleanup
   */
  destroy() {
    // Event listeners with capture:true cannot be easily removed without keeping references
    // In practice, these are lightweight and can remain
  }
}
