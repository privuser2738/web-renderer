# Web Rerender Architecture

This document describes the technical architecture of the Web Rerender SDK and extension.

## Overview

Web Rerender is composed of two main parts:

1. **SDK** - A vanilla JavaScript library that performs adaptive rendering
2. **Extension** - A browser extension that injects the SDK into web pages

## SDK Architecture

### Core Modules

```
┌─────────────────────────────────────────────────────────┐
│                     WebRerender SDK                      │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌────────────────────────────────────────────────┐    │
│  │              Core Engine                        │    │
│  │  - Orchestration                                │    │
│  │  - Module coordination                          │    │
│  │  - Emergency detection                          │    │
│  └────────────────────────────────────────────────┘    │
│                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │   Device     │  │   Input      │  │   Viewport   │ │
│  │  Detector    │  │  Detector    │  │   Manager    │ │
│  │              │  │              │  │              │ │
│  │ - Type       │  │ - Mouse      │  │ - Dims       │ │
│  │ - OS         │  │ - Keyboard   │  │ - Category   │ │
│  │ - Browser    │  │ - Touch      │  │ - Breaks     │ │
│  │ - Caps       │  │ - Pen        │  │              │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
│                                                          │
│  ┌──────────────────────────┐  ┌───────────────────┐   │
│  │   Pagination Engine      │  │  Image Optimizer  │   │
│  │                          │  │                   │   │
│  │ - Auto mode              │  │ - Lazy loading    │   │
│  │ - Intelligent mode       │  │ - Quality adjust  │   │
│  │ - Manual mode            │  │ - User controls   │   │
│  │ - Navigation             │  │ - Placeholders    │   │
│  │ - Controls UI            │  │                   │   │
│  └──────────────────────────┘  └───────────────────┘   │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

### Module Descriptions

#### 1. Core Engine (`core/engine.js`)

**Purpose:** Orchestrates all modules and manages the rendering pipeline.

**Responsibilities:**
- Initialize and coordinate all modules
- Detect emergency situations
- Setup observers for DOM changes
- Handle module communication
- Emit global events

**Key Methods:**
- `start()` - Start the engine
- `stop()` - Stop and cleanup
- `_detectEmergency()` - Detect problematic pages
- `_applyEmergencyFixes()` - Apply fixes

#### 2. Device Detector (`core/device.js`)

**Purpose:** Detects device type, OS, browser, and capabilities.

**Detects:**
- Device type (desktop, mobile, tablet, TV)
- Operating system
- Browser
- Screen information
- Capabilities (touch, WebGL, observers, etc.)
- Network connection

**Key Methods:**
- `getInfo()` - Get device information
- `is(type)` - Check device type
- `has(capability)` - Check capability
- `getPerformanceTier()` - Get performance tier

#### 3. Input Detector (`input/detector.js`)

**Purpose:** Detects and tracks input methods.

**Tracks:**
- Mouse usage
- Keyboard usage
- Touch usage
- Pen/stylus usage
- Recent interactions

**Key Methods:**
- `getInfo()` - Get input information
- `getPrimary()` - Get primary input type
- `has(type)` - Check if input type is available
- `getUIPreferences()` - Get UI optimization preferences

#### 4. Viewport Manager (`viewport/manager.js`)

**Purpose:** Manages viewport dimensions and responsive breakpoints.

**Manages:**
- Viewport dimensions
- Device category (mobile/tablet/desktop/TV)
- Orientation
- Optimal content width
- Responsive spacing

**Key Methods:**
- `getViewport()` - Get viewport info
- `getDimensions()` - Get width/height
- `getCategory()` - Get device category
- `getOptimalContentWidth()` - Calculate optimal width
- `calculatePagesNeeded()` - Calculate page count

#### 5. Pagination Engine (`pagination/engine.js`)

**Purpose:** Converts scrollable content into paginated views.

**Features:**
- **Auto mode:** Viewport-based breaking
- **Intelligent mode:** Semantic HTML-aware breaking
- **Manual mode:** Developer-defined pages
- Navigation controls
- Keyboard shortcuts
- Page state management

**Key Methods:**
- `init()` - Initialize pagination
- `goToPage(n)` - Navigate to page
- `nextPage()` / `prevPage()` - Navigate
- `recalculate()` - Recalculate pages

#### 6. Image Optimizer (`images/optimizer.js`)

**Purpose:** Optimizes images and videos for performance.

**Features:**
- Lazy loading with IntersectionObserver
- Quality reduction based on device
- User controls for toggling
- Placeholder generation
- Video overlay controls
- Emergency mode optimization

**Key Methods:**
- `init()` - Initialize optimizer
- `_optimizeImage()` - Optimize single image
- `_optimizeVideo()` - Optimize video
- `setEnabled()` - Enable/disable
- `setEmergencyMode()` - Set emergency mode

### Data Flow

```
User visits page
      ↓
DOM ready event
      ↓
SDK init() called
      ↓
Device detection → Input detection → Viewport calculation
      ↓
Core Engine starts
      ↓
Modules initialized:
  - Viewport Manager
  - Pagination Engine
  - Image Optimizer
      ↓
Content analysis:
  - Find container
  - Calculate pages
  - Optimize media
      ↓
Apply transformations:
  - Hide/show elements
  - Inject controls
  - Setup observers
      ↓
Ready - user can interact
      ↓
Events:
  - Page changes → Update UI
  - Viewport changes → Recalculate
  - Input changes → Adapt UI
  - DOM mutations → Recalculate if needed
```

### Event System

The SDK uses CustomEvents for communication:

**Engine Events:**
- `webrerender:engine:ready` - Engine initialized
- `webrerender:engine:emergency` - Emergency mode activated

**Pagination Events:**
- `webrerender:pagination:calculated` - Pages calculated
- `webrerender:pagination:pagechanged` - Page changed

**Image Events:**
- `webrerender:images:optimized` - Images optimized
- `webrerender:images:toggled` - Images toggled

**Device Events:**
- `webrerender:device:orientationchange` - Orientation changed
- `webrerender:device:resize` - Screen resized

**Viewport Events:**
- `webrerender:viewport:changed` - Viewport changed

**Input Events:**
- `webrerender:input:changed` - Primary input changed
- `webrerender:input:interaction` - User interaction

### Performance Considerations

1. **Debounced Events:** Resize and mutation events are debounced
2. **Lazy Initialization:** Modules initialize on-demand
3. **Efficient Observers:** Use IntersectionObserver, ResizeObserver, MutationObserver
4. **Minimal DOM Manipulation:** Batch updates, use display:none vs remove
5. **WeakMap Storage:** Use WeakMap for element tracking (automatic GC)

## Extension Architecture

```
┌─────────────────────────────────────────────────────┐
│              Browser Extension                       │
├─────────────────────────────────────────────────────┤
│                                                      │
│  ┌────────────────────────────────────────────┐    │
│  │         Background Service Worker           │    │
│  │  - Settings management                      │    │
│  │  - Message handling                         │    │
│  │  - Icon updates                             │    │
│  └────────────────────────────────────────────┘    │
│                       ↕                             │
│  ┌────────────────────────────────────────────┐    │
│  │           Content Script                    │    │
│  │  - SDK injection                            │    │
│  │  - Settings communication                   │    │
│  │  - Page monitoring                          │    │
│  └────────────────────────────────────────────┘    │
│                       ↕                             │
│  ┌────────────────────────────────────────────┐    │
│  │              Popup UI                       │    │
│  │  - Status display                           │    │
│  │  - Settings controls                        │    │
│  │  - Page information                         │    │
│  └────────────────────────────────────────────┘    │
│                                                      │
└─────────────────────────────────────────────────────┘
```

### Extension Components

#### 1. Background Worker (`background.js`)

**Purpose:** Manages extension state and settings.

**Responsibilities:**
- Store/retrieve settings
- Handle messages from content scripts
- Update extension icon
- Manage context menus

#### 2. Content Script (`content.js`)

**Purpose:** Inject SDK into web pages.

**Responsibilities:**
- Check if extension is enabled
- Check whitelist/blacklist
- Inject SDK script
- Initialize SDK with settings
- Monitor page changes

#### 3. Popup UI (`popup/`)

**Purpose:** User interface for quick controls.

**Features:**
- View current page info
- Toggle features
- Access settings
- Reload page

### Extension Data Flow

```
Extension installed
      ↓
Background worker initialized
      ↓
Default settings stored
      ↓
User visits page
      ↓
Content script runs
      ↓
Check enabled/whitelist/blacklist
      ↓
Inject SDK script → Initialize SDK
      ↓
SDK runs (see SDK data flow)
      ↓
User clicks extension icon
      ↓
Popup shows status
      ↓
User changes settings
      ↓
Settings saved → Page reloads
      ↓
Content script uses new settings
```

## Security Considerations

1. **No External Dependencies:** Reduces attack surface
2. **Content Security Policy:** Respects CSP
3. **Sandbox Isolation:** Extension runs in isolated world
4. **No eval():** No dynamic code execution
5. **Permission Minimization:** Only requests needed permissions

## Browser Compatibility

### Required APIs
- ES6+ JavaScript
- CustomEvents
- IntersectionObserver (optional, degrades gracefully)
- ResizeObserver (optional, degrades gracefully)
- MutationObserver (optional, degrades gracefully)

### Extension APIs
- Manifest V3
- chrome.storage.sync
- chrome.scripting
- chrome.tabs
- chrome.runtime

## Build Process

```
Source Code (sdk/src/)
      ↓
Rollup bundler
      ↓
Transpilation (if needed)
      ↓
Minification (optional)
      ↓
Output formats:
  - UMD (browser)
  - ES Module
  - Extension bundle
      ↓
Distribution files (sdk/dist/, extension/sdk/)
```

## Testing Strategy

1. **Unit Tests:** Test individual modules
2. **Integration Tests:** Test module coordination
3. **Browser Tests:** Test in real browsers
4. **Device Tests:** Test on various devices
5. **Performance Tests:** Measure init time, memory usage
6. **Compatibility Tests:** Test browser/device support

## Future Enhancements

- [ ] TypeScript definitions
- [ ] React/Vue/Angular wrappers
- [ ] Analytics integration
- [ ] A/B testing support
- [ ] Advanced caching
- [ ] Service Worker support
- [ ] PWA integration
- [ ] More pagination modes
- [ ] Accessibility improvements
- [ ] Theme customization
