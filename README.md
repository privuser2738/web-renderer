# Web Rerender SDK & Extension

Enterprise-grade solution for adaptive web rendering that eliminates scrolling, supports all devices and input types, and optimizes content delivery.

## Features

- **Scroll-Free Navigation**: Automatic pagination replaces infinite scrolling
- **Multi-Device Support**: Desktop, mobile, tablet, smart TV optimized rendering
- **Multi-Input Support**: Mouse, keyboard, touch, pen, pointer detection and optimization
- **Intelligent Content Breaking**: Semantic HTML-aware pagination
- **Image Optimization**: Lazy loading, quality reduction, user controls
- **Emergency Rendering**: Fixes poorly rendered pages and display conflicts
- **Zero Dependencies**: Pure vanilla JavaScript, works everywhere

## Quick Start

### For Developers (SDK)

```html
<script src="web-rerender.js"></script>
<script>
  WebRerender.init({
    pagination: {
      mode: 'auto', // 'auto', 'intelligent', or 'manual'
      breakpoints: 'semantic' // Break at semantic HTML boundaries
    },
    images: {
      lazyLoad: true,
      quality: 'adaptive', // Adjusts based on device
      userControl: true
    }
  });
</script>
```

### For End Users (Browser Extension)

1. Install the Web Rerender extension from your browser's store
2. Visit any website
3. Click the extension icon to enable adaptive rendering
4. Use pagination controls or keyboard shortcuts to navigate

## SDK Documentation

See `/sdk/README.md` for detailed API documentation.

## Extension Documentation

See `/extension/README.md` for extension usage and features.

## Architecture

```
web-rerender/
├── sdk/              # Core JavaScript SDK
│   ├── src/
│   │   ├── core/     # Core engine
│   │   ├── pagination/
│   │   ├── images/
│   │   ├── viewport/
│   │   └── input/
│   └── dist/         # Built SDK files
├── extension/        # Browser extension
│   ├── manifest.json
│   ├── background.js
│   ├── content.js
│   └── popup/
└── examples/         # Example implementations
```

## License

MIT
