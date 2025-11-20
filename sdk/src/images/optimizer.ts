/**
 * Image Optimizer - Handles lazy loading, quality reduction, and user controls
 * Prevents crashes from excessive images/videos, especially on smart TVs
 */

export class ImageOptimizer {
  constructor(config) {
    this.config = config;
    this.state = {
      enabled: true,
      imagesOptimized: 0,
      videosOptimized: 0,
      quality: config.quality,
      userControl: config.userControl
    };
    this.deviceInfo = null;
    this.emergencyMode = false;
    this.observers = [];
    this.optimizedElements = new WeakMap();
  }

  /**
   * Initialize image optimizer
   */
  init(deviceInfo) {
    this.deviceInfo = deviceInfo;

    // Adjust quality based on device
    if (this.config.quality === 'adaptive') {
      this.state.quality = this._getAdaptiveQuality();
    }

    // Optimize existing images
    this._optimizeExistingMedia();

    // Setup lazy loading
    if (this.config.lazyLoad) {
      this._setupLazyLoading();
    }

    // Setup user controls
    if (this.config.userControl) {
      this._createUserControls();
    }

    // Watch for new media
    this._setupMutationObserver();

    return this;
  }

  /**
   * Get adaptive quality based on device
   */
  _getAdaptiveQuality() {
    const tier = this.deviceInfo.getPerformanceTier?.() || 'medium';
    const saveData = this.deviceInfo.connection?.saveData;

    if (saveData || this.emergencyMode) {
      return 'low';
    }

    switch (tier) {
      case 'high':
        return 'high';
      case 'medium':
        return 'medium';
      case 'low':
        return 'low';
      default:
        return 'medium';
    }
  }

  /**
   * Optimize existing media on page
   */
  _optimizeExistingMedia() {
    // Optimize images
    const images = document.querySelectorAll('img');
    images.forEach(img => this._optimizeImage(img));

    // Optimize videos
    const videos = document.querySelectorAll('video');
    videos.forEach(video => this._optimizeVideo(video));

    // Optimize iframes (YouTube, Vimeo, etc.)
    const iframes = document.querySelectorAll('iframe[src*="youtube"], iframe[src*="vimeo"], iframe[src*="video"]');
    iframes.forEach(iframe => this._optimizeIframe(iframe));

    this._emit('optimized', {
      images: this.state.imagesOptimized,
      videos: this.state.videosOptimized
    });
  }

  /**
   * Optimize single image
   */
  _optimizeImage(img) {
    if (this.optimizedElements.has(img)) {
      return; // Already optimized
    }

    const original = {
      src: img.src,
      srcset: img.srcset,
      loading: img.loading
    };

    this.optimizedElements.set(img, { original, type: 'image' });

    // Apply lazy loading
    if (this.config.lazyLoad && !img.loading) {
      img.loading = 'lazy';
    }

    // Apply quality reduction
    if (this.state.quality === 'low' || this.emergencyMode) {
      this._reduceImageQuality(img);
    }

    // Add placeholder if needed
    if (this.config.placeholder && !img.complete) {
      this._addPlaceholder(img);
    }

    this.state.imagesOptimized++;
  }

  /**
   * Reduce image quality
   */
  _reduceImageQuality(img) {
    // Add CSS filter to reduce visual quality
    const quality = this.state.quality;

    if (quality === 'low') {
      img.style.filter = 'blur(0.5px)';
      img.style.imageRendering = 'pixelated';
    } else if (quality === 'medium') {
      img.style.imageRendering = 'auto';
    }

    // Try to load smaller version if srcset available
    if (img.srcset) {
      const sources = img.srcset.split(',');
      if (sources.length > 0) {
        // Use smallest source
        const smallest = sources[0].trim().split(' ')[0];
        img.src = smallest;
        img.removeAttribute('srcset');
      }
    }
  }

  /**
   * Add placeholder to image
   */
  _addPlaceholder(img) {
    const placeholder = document.createElement('div');
    placeholder.className = 'webrerender-img-placeholder';
    placeholder.style.cssText = `
      width: ${img.width || 300}px;
      height: ${img.height || 200}px;
      background: linear-gradient(90deg, #f0f0f0 0%, #e0e0e0 50%, #f0f0f0 100%);
      background-size: 200% 100%;
      animation: webrerender-shimmer 1.5s infinite;
    `;

    if (img.parentNode) {
      img.parentNode.insertBefore(placeholder, img);
      img.style.display = 'none';

      img.addEventListener('load', () => {
        img.style.display = '';
        placeholder.remove();
      }, { once: true });
    }
  }

  /**
   * Optimize video element
   */
  _optimizeVideo(video) {
    if (this.optimizedElements.has(video)) {
      return;
    }

    const original = {
      autoplay: video.autoplay,
      preload: video.preload,
      controls: video.controls
    };

    this.optimizedElements.set(video, { original, type: 'video' });

    // Prevent autoplay in emergency mode or low quality
    if (this.emergencyMode || this.state.quality === 'low') {
      video.autoplay = false;
      video.preload = 'none';

      // Add play button overlay
      this._addVideoOverlay(video);
    } else {
      // At minimum, set preload to metadata
      if (!video.preload || video.preload === 'auto') {
        video.preload = 'metadata';
      }
    }

    // Ensure controls are visible
    if (!video.controls) {
      video.controls = true;
    }

    this.state.videosOptimized++;
  }

  /**
   * Add play button overlay to video
   */
  _addVideoOverlay(video) {
    const overlay = document.createElement('div');
    overlay.className = 'webrerender-video-overlay';
    overlay.innerHTML = `
      <button class="webrerender-play-btn" aria-label="Play video">
        <svg width="64" height="64" viewBox="0 0 64 64" fill="white">
          <circle cx="32" cy="32" r="32" fill="rgba(0,0,0,0.6)"/>
          <path d="M26 20 L26 44 L44 32 Z" fill="white"/>
        </svg>
      </button>
    `;
    overlay.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(0,0,0,0.3);
      cursor: pointer;
      z-index: 10;
    `;

    // Position video container relatively
    if (video.parentElement) {
      const parent = video.parentElement;
      if (getComputedStyle(parent).position === 'static') {
        parent.style.position = 'relative';
      }
      parent.appendChild(overlay);
    }

    overlay.addEventListener('click', () => {
      video.play();
      overlay.remove();
    });
  }

  /**
   * Optimize iframe (embedded videos)
   */
  _optimizeIframe(iframe) {
    if (this.optimizedElements.has(iframe)) {
      return;
    }

    const original = {
      src: iframe.src
    };

    this.optimizedElements.set(iframe, { original, type: 'iframe' });

    // In emergency mode, replace with placeholder
    if (this.emergencyMode || this.state.quality === 'low') {
      const placeholder = this._createIframePlaceholder(iframe);
      if (iframe.parentNode) {
        iframe.parentNode.insertBefore(placeholder, iframe);
        iframe.style.display = 'none';

        placeholder.addEventListener('click', () => {
          iframe.style.display = '';
          placeholder.remove();
        });
      }
    }

    this.state.videosOptimized++;
  }

  /**
   * Create placeholder for iframe
   */
  _createIframePlaceholder(iframe) {
    const placeholder = document.createElement('div');
    placeholder.className = 'webrerender-iframe-placeholder';
    placeholder.style.cssText = `
      width: ${iframe.width || '100%'};
      height: ${iframe.height || '400px'};
      background: #000;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-family: sans-serif;
      cursor: pointer;
    `;
    placeholder.innerHTML = `
      <div style="text-align: center;">
        <svg width="64" height="64" viewBox="0 0 64 64" fill="white" style="margin-bottom: 16px;">
          <circle cx="32" cy="32" r="32" fill="rgba(255,255,255,0.2)"/>
          <path d="M26 20 L26 44 L44 32 Z" fill="white"/>
        </svg>
        <div>Click to load video</div>
      </div>
    `;
    return placeholder;
  }

  /**
   * Setup lazy loading with Intersection Observer
   */
  _setupLazyLoading() {
    if (!('IntersectionObserver' in window)) {
      return; // Fallback to native lazy loading
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const element = entry.target;
            this._loadElement(element);
            observer.unobserve(element);
          }
        });
      },
      {
        rootMargin: '50px',
        threshold: this.config.threshold
      }
    );

    // Observe images without src
    document.querySelectorAll('img[data-src]').forEach(img => {
      observer.observe(img);
    });

    this.observers.push(observer);
  }

  /**
   * Load lazy element
   */
  _loadElement(element) {
    if (element.tagName === 'IMG' && element.dataset.src) {
      element.src = element.dataset.src;
      delete element.dataset.src;
    }
  }

  /**
   * Setup mutation observer for new media
   */
  _setupMutationObserver() {
    if (!('MutationObserver' in window)) {
      return;
    }

    const observer = new MutationObserver((mutations) => {
      mutations.forEach(mutation => {
        mutation.addedNodes.forEach(node => {
          if (node.nodeType === 1) {
            // Check if node is media or contains media
            if (node.tagName === 'IMG') {
              this._optimizeImage(node);
            } else if (node.tagName === 'VIDEO') {
              this._optimizeVideo(node);
            } else if (node.tagName === 'IFRAME') {
              if (node.src?.match(/youtube|vimeo|video/i)) {
                this._optimizeIframe(node);
              }
            } else {
              // Check children
              node.querySelectorAll?.('img').forEach(img => this._optimizeImage(img));
              node.querySelectorAll?.('video').forEach(video => this._optimizeVideo(video));
              node.querySelectorAll?.('iframe').forEach(iframe => {
                if (iframe.src?.match(/youtube|vimeo|video/i)) {
                  this._optimizeIframe(iframe);
                }
              });
            }
          }
        });
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    this.observers.push(observer);
  }

  /**
   * Create user controls
   */
  _createUserControls() {
    const controls = document.createElement('div');
    controls.className = 'webrerender-image-controls';
    controls.innerHTML = `
      <button class="webrerender-toggle-images" title="Toggle images">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
          <path d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"/>
        </svg>
      </button>
    `;

    controls.style.cssText = `
      position: fixed;
      bottom: 80px;
      right: 20px;
      z-index: 999998;
    `;

    const button = controls.querySelector('.webrerender-toggle-images');
    button.addEventListener('click', () => {
      this.state.enabled = !this.state.enabled;
      this._toggleAllMedia(this.state.enabled);
      button.style.opacity = this.state.enabled ? '1' : '0.5';
    });

    document.body.appendChild(controls);
  }

  /**
   * Toggle all media visibility
   */
  _toggleAllMedia(enabled) {
    document.querySelectorAll('img, video, iframe').forEach(element => {
      if (this.optimizedElements.has(element)) {
        element.style.display = enabled ? '' : 'none';
      }
    });

    this._emit('toggled', { enabled });
  }

  /**
   * Handle page change (from pagination)
   */
  handlePageChange(pageInfo) {
    // Could pre-load images for next page
  }

  /**
   * Set enabled state
   */
  setEnabled(enabled) {
    this.state.enabled = enabled;
    this._toggleAllMedia(enabled);
  }

  /**
   * Set emergency mode
   */
  setEmergencyMode(enabled) {
    this.emergencyMode = enabled;
    if (enabled) {
      this.state.quality = 'low';
      this._optimizeExistingMedia();
    }
  }

  /**
   * Emit events
   */
  _emit(event, data) {
    const customEvent = new CustomEvent(`webrerender:images:${event}`, {
      detail: data,
      bubbles: true
    });
    document.dispatchEvent(customEvent);
  }

  /**
   * Cleanup
   */
  destroy() {
    // Disconnect observers
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];

    // Remove controls
    const controls = document.querySelector('.webrerender-image-controls');
    if (controls) {
      controls.remove();
    }

    // Restore original media settings
    this.optimizedElements = new WeakMap();
  }
}
