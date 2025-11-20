# Web Rerender SDK

Enterprise-grade JavaScript SDK for adaptive web rendering that eliminates scrolling and optimizes content for all devices.

## Installation

### Via CDN

```html
<script src="https://unpkg.com/@web-rerender/core@latest/dist/web-rerender.js"></script>
```

### Via NPM

```bash
npm install @web-rerender/core
```

```javascript
import WebRerender from '@web-rerender/core';
```

## Quick Start

### Basic Usage

```html
<!DOCTYPE html>
<html>
<head>
  <title>My Website</title>
  <script src="web-rerender.js"></script>
</head>
<body>
  <main>
    <!-- Your content here -->
  </main>

  <script>
    WebRerender.init();
  </script>
</body>
</html>
```

### With Configuration

```javascript
WebRerender.init({
  pagination: {
    mode: 'intelligent',        // 'auto', 'intelligent', or 'manual'
    breakpoints: 'semantic',    // Break at semantic HTML boundaries
    viewportMultiplier: 1.0,    // Page height relative to viewport
    controls: {
      enabled: true,
      position: 'bottom-right',
      keyboard: true            // Arrow keys, PageUp/Down, Space
    }
  },
  images: {
    lazyLoad: true,
    quality: 'adaptive',         // 'high', 'medium', 'low', 'adaptive'
    userControl: true,           // Show toggle button
    placeholder: true
  },
  emergency: {
    detectConflicts: true,
    autoFix: true,
    videoOptimization: true
  },
  debug: false
});
```

## Configuration Options

### Pagination

#### `mode` (string)
- `'auto'`: Automatically break content by viewport height
- `'intelligent'`: Break at semantic HTML boundaries (sections, articles, headings)
- `'manual'`: Use developer-defined breakpoints

#### `breakpoints` (string)
- `'semantic'`: Break at semantic HTML elements
- `'viewport'`: Break purely by viewport dimensions
- `'custom'`: Use `data-webrerender-page` attributes

#### `controls` (object)
- `enabled`: Show/hide pagination controls
- `position`: `'bottom-right'`, `'bottom-left'`, `'bottom-center'`, `'top-right'`, etc.
- `keyboard`: Enable keyboard navigation

### Images

#### `lazyLoad` (boolean)
Enable lazy loading for images

#### `quality` (string)
- `'high'`: Full quality images
- `'medium'`: Reduced quality
- `'low'`: Heavily optimized for performance
- `'adaptive'`: Automatically adjust based on device and connection

#### `userControl` (boolean)
Show button to toggle images on/off

### Emergency Mode

Automatically detects and fixes problematic pages:
- Excessive content height
- Too many images/videos
- Overlapping elements
- Smart TV compatibility issues

## API Reference

### Methods

#### `init(config)`
Initialize the SDK with optional configuration.

```javascript
await WebRerender.init({
  pagination: { mode: 'intelligent' }
});
```

#### `destroy()`
Clean up and remove all SDK functionality.

```javascript
WebRerender.destroy();
```

#### `goToPage(pageNumber)`
Navigate to a specific page.

```javascript
WebRerender.goToPage(2);
```

#### `nextPage()`
Navigate to next page.

```javascript
WebRerender.nextPage();
```

#### `prevPage()`
Navigate to previous page.

```javascript
WebRerender.prevPage();
```

#### `getCurrentPage()`
Get current page number.

```javascript
const current = WebRerender.getCurrentPage();
```

#### `getTotalPages()`
Get total number of pages.

```javascript
const total = WebRerender.getTotalPages();
```

#### `getDeviceInfo()`
Get detected device information.

```javascript
const device = WebRerender.getDeviceInfo();
// { type: 'desktop', os: 'windows', browser: 'chrome', ... }
```

#### `getInputInfo()`
Get detected input types.

```javascript
const input = WebRerender.getInputInfo();
// { primary: 'mouse', types: { mouse: true, keyboard: true, ... } }
```

#### `setImageOptimization(enabled)`
Enable/disable image optimization.

```javascript
WebRerender.setImageOptimization(false);
```

### Events

Listen to SDK events using the `on` method:

```javascript
WebRerender.on('initialized', (e) => {
  console.log('SDK initialized', e.detail);
});

WebRerender.on('pagination:pagechanged', (e) => {
  console.log('Page changed', e.detail);
  // { from: 1, to: 2, total: 5 }
});

WebRerender.on('device:orientationchange', (e) => {
  console.log('Orientation changed', e.detail);
});

WebRerender.on('input:changed', (e) => {
  console.log('Primary input changed', e.detail);
  // { from: 'touch', to: 'mouse' }
});
```

Available events:
- `initialized`
- `destroyed`
- `pagination:calculated`
- `pagination:pagechanged`
- `images:optimized`
- `images:toggled`
- `viewport:changed`
- `device:orientationchange`
- `input:changed`
- `engine:ready`
- `engine:emergency`

## Advanced Usage

### Manual Pagination

Define your own page breaks:

```html
<div data-webrerender-page>
  <h1>Page 1 Content</h1>
  <p>...</p>
</div>

<div data-webrerender-page>
  <h1>Page 2 Content</h1>
  <p>...</p>
</div>

<script>
  WebRerender.init({
    pagination: { mode: 'manual' }
  });
</script>
```

### Custom Container

Specify a custom content container:

```javascript
WebRerender.init({
  pagination: {
    containerSelector: '#my-content'
  }
});
```

### Adaptive Quality Presets

```javascript
// High-end desktop
WebRerender.init({
  images: { quality: 'high' },
  pagination: { viewportMultiplier: 1.2 }
});

// Mobile/Data saver
WebRerender.init({
  images: { quality: 'low', lazyLoad: true },
  pagination: { viewportMultiplier: 0.9 }
});

// Smart TV
WebRerender.init({
  images: { quality: 'medium' },
  pagination: { viewportMultiplier: 1.0 },
  emergency: { videoOptimization: true }
});
```

### React Integration

```jsx
import { useEffect } from 'react';
import WebRerender from '@web-rerender/core';

function App() {
  useEffect(() => {
    WebRerender.init({
      pagination: { mode: 'intelligent' }
    });

    return () => WebRerender.destroy();
  }, []);

  return <div>{/* Your app */}</div>;
}
```

### Vue Integration

```vue
<script setup>
import { onMounted, onUnmounted } from 'vue';
import WebRerender from '@web-rerender/core';

onMounted(async () => {
  await WebRerender.init();
});

onUnmounted(() => {
  WebRerender.destroy();
});
</script>
```

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Smart TVs with modern browsers

## Performance

The SDK is designed for minimal performance impact:
- Zero dependencies
- < 50KB gzipped
- Lazy initialization
- Efficient observers
- Hardware-accelerated animations

## License

MIT
