# service-injector

Lightweight JavaScript library for SaaS providers to allow its services installation on clients' sites.

## Use Case

* You provide SaaS in the Internet.
* You want to allow your users to install a snippet on their sites as floating tab on the side with the ability to display and use your SaaS.

## Features

- **Zero Dependencies** — Pure vanilla JavaScript with no jQuery, React, or other libraries required. Works on any website regardless of tech stack.

- **Multiple Installation Options** — Use as npm package with ES modules, CommonJS, or as a simple script tag for vanilla JS websites.

- **Drop-in Configuration** — Configure behavior via query string parameters, data attributes, or programmatic API. No coding required for basic usage.

- **Mobile-Aware** — Automatically detects mobile devices and opens SaaS in a new browser window instead of an iframe for optimal UX.

- **Interactive Window** — Draggable header and resizable corner with full touch event support. Both features can be toggled via configuration.

- **Dockable Window** — When enabled, drag the window to any screen edge to dock it. The page content is pushed aside to make room. Undock by double-clicking the header or dragging away. Disabled on mobile and small screens (<768px).

- **Fully Customizable** — Override tab template, window template, and styles without modifying source code.

- **TypeScript Support** — Full TypeScript definitions included for excellent IDE support.

## Installation

### npm (Recommended for modern projects)

```bash
npm install service-injector
```

### CDN (For vanilla JS websites)

```html
<!-- unpkg -->
<script src="https://unpkg.com/service-injector/dist/index.iife.js"></script>

<!-- jsDelivr -->
<script src="https://cdn.jsdelivr.net/npm/service-injector/dist/index.iife.js"></script>
```

## Usage

### Vanilla JavaScript (Script Tag) — Zero Config

The simplest way to use service-injector. Just add the script tag and it auto-installs:

```html
<!-- Basic usage - auto-installs with defaults -->
<script id="service-injector" src="https://unpkg.com/service-injector/dist/index.iife.js"></script>
```

**With query string configuration:**

```html
<script id="service-injector" 
        src="https://unpkg.com/service-injector/dist/index.iife.js?p=right&o=100px&url=https://my-saas.com">
</script>
```

**With data attributes:**

```html
<script id="service-injector" 
        src="https://unpkg.com/service-injector/dist/index.iife.js"
        data-position="left"
        data-offset="50%"
        data-url="https://my-saas.com">
</script>
```

### ES Modules (Modern JavaScript)

```javascript
import { ServiceInjector } from 'service-injector';

const injector = new ServiceInjector({
  saasUrl: 'https://my-saas.com',
  position: 'right',
  offset: '100px',
  windowWidth: '500px',
  windowHeight: '600px',
  draggable: true,
  resizable: true,
  prefix: 'my-widget'  // Custom prefix for element IDs
});

injector.install();

// Later, to control programmatically:
injector.toggle();    // Toggle window open/closed
injector.expand();    // Open window
injector.collapse();  // Close window
injector.destroy();   // Clean up completely
```

### CommonJS (Node.js)

```javascript
const { ServiceInjector } = require('service-injector');

const injector = new ServiceInjector({
  saasUrl: 'https://my-saas.com',
  position: 'bottom'
});

injector.install();
```

### With Global Config (Backwards Compatible)

```html
<script>
  window.serviceInjectorConfig = {
    tabTemplate: "<a onclick='return siToggleWindow();'>Support</a>",
    styles: "#si-tab { background: #4a90d9; color: white; }"
  };
</script>
<script id="service-injector" src="https://unpkg.com/service-injector/dist/index.iife.js"></script>
```

## Configuration Options

### Programmatic API Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `url` | `string` | `null` | Custom URL to load in the iframe |
| `position` | `string` | `'bottom'` | Tab position: `'left'`, `'right'`, `'top'`, `'bottom'` |
| `offset` | `string` | `'80%'` | Tab offset from edge (e.g., `'80%'`, `'100px'`) |
| `animation` | `number` | `300` | Animation duration in milliseconds |
| `windowWidth` | `string` | `'440px'` | Window width |
| `windowHeight` | `string` | `'550px'` | Window height |
| `windowTop` | `string` | `'100px'` | Window top position |
| `windowBottom` | `string` | `null` | Window bottom position |
| `windowLeft` | `string` | `null` | Window left position |
| `windowCenter` | `number` | `0` | Window center offset (0 = centered) |
| `windowRight` | `string` | `null` | Window right position |
| `draggable` | `boolean` | `true` | Enable window dragging |
| `resizable` | `boolean` | `true` | Enable window resizing |
| `hideTab` | `boolean` | `false` | Hide tab when window is open |
| `dockable` | `boolean \| string[]` | `false` | Enable window docking to viewport edges. `true` = all sides, or array like `['left', 'right']` |
| `prefix` | `string` | `'si'` | Element ID prefix |
| `saasUrl` | `string` | `'https://orienteer.org'` | Default SaaS URL |
| `tabTemplate` | `string` | (default) | Custom tab HTML template |
| `windowTemplate` | `string` | (default) | Custom window HTML template |
| `styles` | `string` | `''` | Additional CSS styles |

### Query String / Data Attribute Parameters

For script tag usage, use short parameter names:

| Parameter | Long Name | Default | Description |
|-----------|-----------|---------|-------------|
| `url` | `url` | `null` | Custom URL to load in the iframe |
| `p` | `position` | `'bottom'` | Tab position: left, right, top, bottom |
| `o` | `offset` | `'80%'` | Tab offset from edge (% or px) |
| `a` | `animation` | `300` | Animation duration in milliseconds |
| `ww` | `window-width` | `'440px'` | Window width |
| `wh` | `window-height` | `'550px'` | Window height |
| `wt` | `window-top` | `'100px'` | Window top position |
| `wb` | `window-bottom` | `null` | Window bottom position |
| `wl` | `window-left` | `null` | Window left position |
| `wc` | `window-center` | `0` | Window center offset |
| `wr` | `window-right` | `null` | Window right position |
| `d` | `draggable` | `true` | Enable window dragging |
| `r` | `resizable` | `true` | Enable window resizing |
| `ht` | `hide-tab` | `false` | Hide tab when window is open |
| `dk` | `dockable` | `false` | Enable window docking to viewport edges |

## Customizing Templates

### Using Global Configuration

```html
<script>
  window.serviceInjectorConfig = {
    tabTemplate: "<a onclick='return siToggleWindow();' href='#'>Open Panel</a>",
    windowTemplate: "...", // Custom window HTML
    styles: "#si-tab { background: #4a90d9; color: white; border-radius: 8px; }"
  };
</script>
<script id="service-injector" src="https://unpkg.com/service-injector/dist/index.iife.js"></script>
```

### Using DOM Elements

```html
<!-- Custom tab template -->
<script type="text/template" id="si-tab-template">
  <a onclick='return siToggleWindow();' href='#'>Open Panel</a>
</script>

<!-- Custom styles (appended to defaults) -->
<style id="si-custom-styles">
  #si-tab { background: #4a90d9; color: white; border-radius: 8px; }
  #si-header { background: #357abd; color: white; }
</style>

<script id="service-injector" src="https://unpkg.com/service-injector/dist/index.iife.js"></script>
```

### Template Placeholders

Templates support these placeholders:
- `%prefix%` - Element ID prefix (default: "si")
- `%url%` - The configured URL

### Customizable Elements

| Element ID | Description |
|------------|-------------|
| `#si-tab` | The floating tab button |
| `#si-window` | The popup window container |
| `#si-header` | Window header (draggable area) |
| `#si-body` | Window body (contains iframe) |
| `#si-iframe` | The iframe element |
| `#si-footer` | Window footer |
| `#si-resizer` | Resize handle |

## Programmatic Control

### Global Functions (Script Tag Usage)

When using the script tag, global functions are automatically exposed:

```javascript
// Toggle window open/closed
siToggleWindow();

// Dock window to a specific side
siDock('right');  // 'left', 'right', 'top', 'bottom'

// Undock window
siUndock();

// Completely remove the injector
siDestroy();
```

With a custom prefix (e.g., `prefix: 'my'`):
```javascript
myToggleWindow();
myDock('left');
myUndock();
myDestroy();
```

### ServiceInjector Instance Methods

```javascript
const injector = new ServiceInjector(options);

injector.install();     // Mount to DOM
injector.toggle();      // Toggle window
injector.expand();      // Open window
injector.collapse();    // Close window
injector.dock('right'); // Dock to edge ('left', 'right', 'top', 'bottom')
injector.undock();      // Undock from edge
injector.isDocked();    // Get dock side or null if floating
injector.destroy();     // Full cleanup
injector.isOpen();      // Check if window is open
injector.isMobile();    // Check if mobile device
injector.getConfig();   // Get current configuration
injector.getPrefix();   // Get the prefix
```

## TypeScript Support

Full TypeScript definitions are included:

```typescript
import { ServiceInjector, ServiceInjectorOptions, ServiceInjectorConfig } from 'service-injector';

const options: ServiceInjectorOptions = {
  saasUrl: 'https://my-saas.com',
  position: 'right',
  draggable: true
};

const injector = new ServiceInjector(options);
injector.install();
```

## Browser Support

- Chrome, Firefox, Safari, Edge (modern versions)
- IE11 (with appropriate polyfills)
- Mobile browsers (iOS Safari, Android Chrome)

## License

Apache-2.0

## Future Ideas

Some potential features for future versions:

- **Dock Preview** — Show a visual preview/highlight of the dock zone while dragging near an edge, before the user releases
- **Dock Snap Animation** — Animated transition when snapping to dock zone
- **Persist State** — Remember dock state, window position, and size across page loads (localStorage)
- **Multiple Instances** — Better support for running multiple independent injectors on the same page

## Links

- [GitHub Repository](https://github.com/OrienteerBAP/service-injector)
- [npm Package](https://www.npmjs.com/package/service-injector)
- [Demo](https://orienteerbap.github.io/service-injector/demo/)
