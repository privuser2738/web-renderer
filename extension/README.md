# Web Rerender Browser Extension

Transform any website with adaptive rendering that eliminates scrolling and optimizes for your device.

## Features

- 🎯 **Automatic Pagination** - Converts scrollable pages into navigable pages
- 📱 **Multi-Device Optimization** - Works on desktop, mobile, tablet, and smart TVs
- 🖼️ **Image Optimization** - Reduces data usage and prevents crashes
- 🚨 **Emergency Fixes** - Automatically repairs poorly-rendered pages
- ⚡ **Zero Configuration** - Works out of the box on any website

## Installation

### Chrome/Edge

1. Download or clone this repository
2. Open `chrome://extensions`
3. Enable "Developer mode"
4. Click "Load unpacked"
5. Select the `extension` folder

### Firefox

1. Open `about:debugging#/runtime/this-firefox`
2. Click "Load Temporary Add-on"
3. Select the `manifest.json` file in the `extension` folder

## Usage

### Basic Usage

1. Install the extension
2. Navigate to any website
3. The extension automatically activates
4. Use the pagination controls or keyboard shortcuts to navigate

### Keyboard Shortcuts

- **Arrow Right / Space / Page Down** - Next page
- **Arrow Left / Page Up** - Previous page
- **Home** - First page
- **End** - Last page

### Extension Popup

Click the extension icon to:
- View current page information
- Toggle features on/off
- Adjust settings
- Reload the page

### Settings

Access settings by clicking the extension icon and selecting "Settings":

#### Pagination
- **Mode**: Choose between automatic, intelligent, or manual pagination
- **Controls**: Show/hide pagination controls
- **Keyboard Navigation**: Enable/disable keyboard shortcuts

#### Image Optimization
- **Optimize Images**: Enable/disable image optimization
- **Quality**: Choose image quality (high, medium, low, adaptive)
- **User Controls**: Show/hide image toggle button

#### Emergency Mode
- **Auto-detect Issues**: Automatically detect problematic pages
- **Auto-fix**: Automatically apply fixes

#### Site Management
- **Whitelist**: Only enable on specific sites
- **Blacklist**: Disable on specific sites

## How It Works

The extension works by:

1. **Detecting** the device type, screen size, and input methods
2. **Analyzing** the page content and structure
3. **Transforming** the layout into optimized, paginated views
4. **Optimizing** images and videos to prevent performance issues
5. **Fixing** rendering conflicts and display issues

## Compatibility

### Supported Browsers
- Chrome 90+
- Edge 90+
- Firefox 88+ (experimental)

### Works Best On
- News websites with long articles
- Documentation sites
- Blogs and content-heavy sites
- Smart TV browsers
- Mobile devices with limited data

### May Not Work On
- Single-page applications with custom scrolling
- Infinite scroll implementations
- Canvas/WebGL-heavy sites
- Sites with aggressive anti-automation measures

## Privacy

The Web Rerender extension:
- ✅ Runs entirely locally in your browser
- ✅ Does not collect any data
- ✅ Does not send data to external servers
- ✅ Does not track your browsing
- ✅ Open source and auditable

Settings are stored locally using `chrome.storage.sync` which syncs across your devices via your browser account.

## Troubleshooting

### Extension Not Activating

1. Check that the extension is enabled in your browser
2. Refresh the page
3. Check the browser console for errors
4. Try disabling other extensions that might conflict

### Pagination Not Working

1. The site may have custom scrolling that conflicts
2. Try changing pagination mode in settings
3. Add the site to the whitelist
4. Check if the page has a main content container

### Images Not Loading

1. Check that image optimization is enabled
2. Try adjusting the quality setting
3. Disable the extension temporarily to test
4. Check for ad blockers that might interfere

### Performance Issues

1. Enable emergency mode auto-fix
2. Set image quality to "low"
3. Disable features you don't need
4. Close other tabs/applications

## Development

### Building from Source

```bash
# Install dependencies
npm install

# Build the SDK
npm run build:sdk

# Build the extension
npm run build:extension

# Build both
npm run build
```

### Project Structure

```
extension/
├── manifest.json       # Extension manifest
├── background.js       # Background service worker
├── content.js          # Content script (injector)
├── popup/              # Extension popup UI
│   ├── popup.html
│   ├── popup.css
│   └── popup.js
├── icons/              # Extension icons
└── sdk/                # Built SDK files
```

### Testing

1. Load the extension in developer mode
2. Open the browser console
3. Navigate to a test page
4. Check for initialization messages
5. Test pagination controls
6. Test keyboard navigation
7. Test settings changes

## Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

- 📖 [SDK Documentation](../sdk/README.md)
- 🐛 [Report Issues](https://github.com/your-repo/issues)
- 💬 [Discussions](https://github.com/your-repo/discussions)

## Changelog

### v1.0.0 (2024)
- Initial release
- Automatic pagination
- Multi-device support
- Image optimization
- Emergency mode
- Browser extension
