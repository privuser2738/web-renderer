/**
 * Device Detector - Identifies device type, capabilities, and characteristics
 */

export class DeviceDetector {
  constructor() {
    this.info = this._detect();
    this._setupListeners();
  }

  /**
   * Detect device information
   */
  _detect() {
    const ua = navigator.userAgent;
    const info = {
      type: this._detectType(ua),
      os: this._detectOS(ua),
      browser: this._detectBrowser(ua),
      screen: this._getScreenInfo(),
      capabilities: this._detectCapabilities(),
      pixelRatio: window.devicePixelRatio || 1,
      connection: this._getConnectionInfo(),
      timestamp: Date.now()
    };

    return info;
  }

  /**
   * Detect device type
   */
  _detectType(ua) {
    // Smart TV detection
    if (/TV|SmartTV|SMART-TV|Tizen|WebOS|NetCast|NETTV|HbbTV/i.test(ua)) {
      return 'tv';
    }

    // Tablet detection
    if (/iPad|Android(?!.*Mobile)|Tablet|PlayBook|Silk/i.test(ua)) {
      return 'tablet';
    }

    // Mobile detection
    if (/Mobile|iPhone|iPod|Android.*Mobile|BlackBerry|IEMobile|Opera Mini/i.test(ua)) {
      return 'mobile';
    }

    // Desktop by default
    return 'desktop';
  }

  /**
   * Detect operating system
   */
  _detectOS(ua) {
    if (/Windows/i.test(ua)) return 'windows';
    if (/Macintosh|Mac OS X/i.test(ua)) return 'macos';
    if (/Linux/i.test(ua)) return 'linux';
    if (/Android/i.test(ua)) return 'android';
    if (/iOS|iPhone|iPad|iPod/i.test(ua)) return 'ios';
    if (/Tizen/i.test(ua)) return 'tizen';
    if (/WebOS/i.test(ua)) return 'webos';
    return 'unknown';
  }

  /**
   * Detect browser
   */
  _detectBrowser(ua) {
    if (/Edg/i.test(ua)) return 'edge';
    if (/Chrome/i.test(ua)) return 'chrome';
    if (/Safari/i.test(ua) && !/Chrome/i.test(ua)) return 'safari';
    if (/Firefox/i.test(ua)) return 'firefox';
    if (/MSIE|Trident/i.test(ua)) return 'ie';
    if (/Opera|OPR/i.test(ua)) return 'opera';
    return 'unknown';
  }

  /**
   * Get screen information
   */
  _getScreenInfo() {
    return {
      width: window.screen.width,
      height: window.screen.height,
      availWidth: window.screen.availWidth,
      availHeight: window.screen.availHeight,
      orientation: this._getOrientation(),
      colorDepth: window.screen.colorDepth
    };
  }

  /**
   * Get orientation
   */
  _getOrientation() {
    if (window.screen.orientation) {
      return window.screen.orientation.type;
    }
    return window.innerWidth > window.innerHeight ? 'landscape' : 'portrait';
  }

  /**
   * Detect device capabilities
   */
  _detectCapabilities() {
    return {
      touch: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
      pointer: 'PointerEvent' in window,
      mouse: matchMedia('(pointer: fine)').matches,
      pen: 'PointerEvent' in window && matchMedia('(pointer: fine)').matches,
      keyboard: true, // Assume keyboard is available
      hover: matchMedia('(hover: hover)').matches,
      webgl: this._detectWebGL(),
      canvas: !!document.createElement('canvas').getContext,
      serviceWorker: 'serviceWorker' in navigator,
      intersectionObserver: 'IntersectionObserver' in window,
      resizeObserver: 'ResizeObserver' in window,
      mutationObserver: 'MutationObserver' in window
    };
  }

  /**
   * Detect WebGL support
   */
  _detectWebGL() {
    try {
      const canvas = document.createElement('canvas');
      return !!(
        window.WebGLRenderingContext &&
        (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
      );
    } catch (e) {
      return false;
    }
  }

  /**
   * Get connection information
   */
  _getConnectionInfo() {
    const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    if (!conn) return null;

    return {
      effectiveType: conn.effectiveType,
      downlink: conn.downlink,
      rtt: conn.rtt,
      saveData: conn.saveData
    };
  }

  /**
   * Setup event listeners for changes
   */
  _setupListeners() {
    // Orientation change
    window.addEventListener('orientationchange', () => {
      this.info.screen.orientation = this._getOrientation();
      this._emit('orientationchange', this.info);
    });

    // Resize (update screen info)
    let resizeTimeout;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        this.info.screen = this._getScreenInfo();
        this._emit('resize', this.info);
      }, 250);
    });

    // Connection change
    const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    if (conn) {
      conn.addEventListener('change', () => {
        this.info.connection = this._getConnectionInfo();
        this._emit('connectionchange', this.info);
      });
    }
  }

  /**
   * Get device information
   */
  getInfo() {
    return { ...this.info };
  }

  /**
   * Check if device is a specific type
   */
  is(type) {
    return this.info.type === type;
  }

  /**
   * Check if device has a capability
   */
  has(capability) {
    return !!this.info.capabilities[capability];
  }

  /**
   * Get performance tier (for adaptive quality)
   */
  getPerformanceTier() {
    const { type, connection, screen } = this.info;

    // Smart TV: usually high-end but may have slower connections
    if (type === 'tv') {
      return connection?.effectiveType === '4g' ? 'high' : 'medium';
    }

    // Mobile: varies widely
    if (type === 'mobile') {
      if (screen.width >= 1080 && connection?.effectiveType === '4g') {
        return 'high';
      }
      return connection?.saveData ? 'low' : 'medium';
    }

    // Tablet: usually medium to high
    if (type === 'tablet') {
      return screen.width >= 1024 ? 'high' : 'medium';
    }

    // Desktop: usually high performance
    return 'high';
  }

  /**
   * Emit events
   */
  _emit(event, data) {
    const customEvent = new CustomEvent(`webrerender:device:${event}`, {
      detail: data,
      bubbles: true
    });
    document.dispatchEvent(customEvent);
  }

  /**
   * Cleanup
   */
  destroy() {
    // Event listeners are on window/navigator, will be cleaned up automatically
  }
}
