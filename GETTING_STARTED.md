# Getting Started with Web Rerender

This guide will help you get up and running with the Web Rerender SDK and browser extension.

## What is Web Rerender?

Web Rerender is an enterprise-grade solution that transforms web pages to:
- **Eliminate scrolling** by converting content into paginated views
- **Support all devices** (desktop, mobile, tablet, smart TV)
- **Optimize for all input types** (mouse, keyboard, touch, pen)
- **Reduce data usage** with intelligent image optimization
- **Fix rendering issues** automatically

## Quick Start

### Option 1: Using the Browser Extension (End Users)

**Best for:** Regular users who want to improve their browsing experience

1. **Build the extension:**
   ```bash
   npm install
   npm run build
   ```

2. **Load in Chrome/Edge:**
   - Open `chrome://extensions`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select the `extension` folder

3. **Start browsing:**
   - Visit any website
   - The extension automatically activates
   - Use arrow keys or on-screen controls to navigate pages

### Option 2: Using the SDK (Developers)

**Best for:** Developers building websites or web applications

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Build the SDK:**
   ```bash
   npm run build:sdk
   ```

3. **Include in your HTML:**
   ```html
   <script src="sdk/dist/web-rerender.js"></script>
   <script>
     WebRerender.init();
   </script>
   ```

4. **View the example:**
   - Open `examples/basic.html` in your browser
   - See the SDK in action

## Project Structure

```
web-rerender/
├── sdk/                    # JavaScript SDK
│   ├── src/               # Source code
│   │   ├── core/          # Core engine & device detection
│   │   ├── pagination/    # Pagination engine
│   │   ├── images/        # Image optimization
│   │   ├── viewport/      # Viewport management
│   │   └── input/         # Input detection
│   ├── dist/              # Built files (generated)
│   └── README.md          # SDK documentation
│
├── extension/             # Browser extension
│   ├── manifest.json      # Extension manifest
│   ├── background.js      # Background worker
│   ├── content.js         # Content script
│   ├── popup/             # Extension popup UI
│   └── README.md          # Extension documentation
│
├── examples/              # Example implementations
│   ├── basic.html         # Basic usage example
│   └── advanced.html      # Advanced features demo
│
└── README.md              # This file
```

## Development Workflow

### 1. Make Changes

Edit files in `sdk/src/` or `extension/`

### 2. Build

```bash
# Build SDK only
npm run build:sdk

# Build extension only
npm run build:extension

# Build both
npm run build
```

### 3. Test

**Test the SDK:**
- Open `examples/basic.html` or `examples/advanced.html` in a browser
- Check the browser console for debug output
- Test pagination controls and keyboard navigation

**Test the extension:**
- Reload the extension in `chrome://extensions`
- Visit a test website
- Check that the SDK is injected and working

### 4. Debug

Enable debug mode:
```javascript
WebRerender.init({
  debug: true  // Enables console logging
});
```

## Common Tasks

### Adding a New Feature

1. Create new module in `sdk/src/`
2. Import in `sdk/src/index.js`
3. Initialize in core engine
4. Add documentation
5. Add tests
6. Build and test

### Customizing Pagination

```javascript
WebRerender.init({
  pagination: {
    mode: 'intelligent',        // or 'auto' or 'manual'
    breakpoints: 'semantic',    // or 'viewport' or 'custom'
    viewportMultiplier: 1.0,    // Adjust page size
    controls: {
      enabled: true,
      position: 'bottom-right', // or other positions
      keyboard: true
    }
  }
});
```

### Customizing Images

```javascript
WebRerender.init({
  images: {
    lazyLoad: true,
    quality: 'adaptive',  // 'high', 'medium', 'low', or 'adaptive'
    userControl: true,    // Show toggle button
    placeholder: true     // Show placeholders while loading
  }
});
```

## Testing Checklist

Before deploying:

- [ ] Test on desktop (Chrome, Firefox, Edge, Safari)
- [ ] Test on mobile (iOS Safari, Chrome Android)
- [ ] Test on tablet
- [ ] Test keyboard navigation (arrows, PageUp/Down, Home/End)
- [ ] Test touch gestures
- [ ] Test with long content pages
- [ ] Test with many images
- [ ] Test with videos/iframes
- [ ] Test emergency mode
- [ ] Test with various viewport sizes
- [ ] Check performance (< 100ms init time)
- [ ] Check bundle size (< 50KB gzipped)

## Troubleshooting

### SDK not initializing

- Check browser console for errors
- Ensure script is loaded after DOM
- Try wrapping in DOMContentLoaded event

### Pagination not working

- Check that content container is detected
- Try specifying `containerSelector` in config
- Enable debug mode to see calculations

### Images not optimizing

- Check that images have proper src attributes
- Verify quality setting
- Check browser console for errors

### Extension not loading

- Check extension is enabled
- Reload the page
- Check content script is injecting
- Verify manifest permissions

## Next Steps

1. **Read the documentation:**
   - [SDK Documentation](sdk/README.md)
   - [Extension Documentation](extension/README.md)

2. **Explore the examples:**
   - `examples/basic.html` - Basic usage
   - `examples/advanced.html` - Advanced features

3. **Customize for your needs:**
   - Adjust configuration options
   - Create custom themes
   - Add your own features

4. **Deploy:**
   - Host SDK on CDN
   - Publish extension to store
   - Integrate into your website

## Need Help?

- 📖 Check the [SDK README](sdk/README.md)
- 🐛 Report issues on GitHub
- 💬 Join discussions
- 📧 Contact support

## Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT - see LICENSE file for details
