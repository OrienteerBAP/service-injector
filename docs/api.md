# API Reference

## Overview

service-injector provides two APIs:

1. **Global Functions** - For script tag usage (auto-exposed)
2. **ServiceInjector Class** - For programmatic usage (npm)

---

## Use Cases

### "I want to open the window from my own button"

```html
<button onclick="siToggleWindow()">Open Support</button>
```

```javascript
// Or programmatically
document.getElementById('my-button').addEventListener('click', () => {
  injector.toggle();
});
```

### "I want to clean up when navigating away (SPA)"

```javascript
// React example
useEffect(() => {
  const injector = new ServiceInjector({ saasUrl: '...' });
  injector.install();
  
  return () => {
    injector.destroy(); // Clean up on unmount
  };
}, []);
```

### "I want to check if window is open before doing something"

```javascript
if (injector.isOpen()) {
  console.log('Window is currently open');
}

if (injector.isDocked()) {
  console.log(`Window is docked to ${injector.isDocked()}`);
}
```

---

## ServiceInjector Class

### Constructor

```javascript
import { ServiceInjector } from 'service-injector';

const injector = new ServiceInjector(options);
```

**Options:** See [Configuration](./configuration.md) for all available options.

---

### Lifecycle Methods

#### `install()`

Mounts the injector to the DOM. Call this after creating the instance.

```javascript
const injector = new ServiceInjector({ saasUrl: '...' });
injector.install();
```

**Returns:** `this` (for chaining)

**Note:** Calling `install()` multiple times has no effect (logs a warning).

---

#### `destroy()`

Completely removes the injector from the page. Cleans up:
- All DOM elements
- All event listeners
- Global functions
- Body margins (if docked)

```javascript
injector.destroy();
```

**Use case:** Single-page applications when navigating away from a page.

---

### Window Control Methods

#### `toggle()`

Toggles the window between open and closed states.

```javascript
injector.toggle();
```

**Returns:** 
- `false` - Normal operation (prevents default if used in onclick)
- `true` - If opened externally (mobile devices)

---

#### `expand()`

Opens the window (if closed).

```javascript
injector.expand();
```

**Returns:** 
- `false` - Normal operation
- `true` - If opened externally (mobile devices)

**Note:** On mobile devices, this opens the URL in a new browser tab instead of showing the iframe.

---

#### `collapse()`

Closes the window (if open).

```javascript
injector.collapse();
```

**Returns:** `false`

---

### Docking Methods

#### `dock(side)`

Docks the window to a screen edge.

```javascript
injector.dock('right');  // 'left' | 'right' | 'top' | 'bottom'
```

**Parameters:**
- `side` - The edge to dock to

**Returns:** `this` (for chaining)

**Notes:**
- Window should be open first
- Does nothing if docking is disabled or not allowed for that side
- Logs a warning if conditions aren't met

---

#### `undock()`

Undocks the window, restoring it to its pre-dock position.

```javascript
injector.undock();
```

**Returns:** `this` (for chaining)

---

#### `isDocked()`

Returns the current dock state.

```javascript
const side = injector.isDocked();
// Returns: 'left' | 'right' | 'top' | 'bottom' | null
```

**Returns:** The docked side, or `null` if floating.

---

### State Query Methods

#### `isOpen()`

Checks if the window is currently visible.

```javascript
if (injector.isOpen()) {
  // Window is open
}
```

**Returns:** `boolean`

---

#### `isMobile()`

Checks if running on a mobile device.

```javascript
if (injector.isMobile()) {
  // Mobile device detected
}
```

**Returns:** `boolean`

---

#### `getConfig()`

Returns a copy of the current configuration.

```javascript
const config = injector.getConfig();
console.log(config.p); // Position: 'bottom', 'left', etc.
```

**Returns:** `Readonly<InternalConfig>`

---

#### `getPrefix()`

Returns the element ID prefix.

```javascript
const prefix = injector.getPrefix();
// Default: 'si'
```

**Returns:** `string`

---

### Wrapper Mode Methods

These methods are only useful when running in [Wrapper Mode](./wrapper-mode.md).

#### `isWrapperMode()`

Checks if running in wrapper mode.

```javascript
if (injector.isWrapperMode()) {
  console.log('Wrapper mode is active');
}
```

**Returns:** `boolean`

---

#### `getMainIframe()`

Gets a reference to the main iframe element (wrapper mode only).

```javascript
const mainIframe = injector.getMainIframe();
if (mainIframe) {
  console.log('Current URL:', mainIframe.src);
}
```

**Returns:** `HTMLIFrameElement | null`

---

#### `refreshMain()`

Refreshes the main iframe content without affecting the floating window.

```javascript
injector.refreshMain();
```

**Use case:** Reload external content while preserving your widget's state.

---

#### `navigateMain(url)`

Navigates the main iframe to a new URL.

```javascript
injector.navigateMain('https://example.com/another-page');
```

**Parameters:**
- `url` - The URL to navigate to

**Use case:** Change the wrapped content programmatically.

---

## Global Functions (Script Tag)

When using the script tag, these functions are automatically exposed on `window`:

### Default Prefix (`si`)

| Function | Description |
|----------|-------------|
| `siToggleWindow()` | Toggle window open/closed |
| `siDock(side)` | Dock to edge |
| `siUndock()` | Undock window |
| `siDestroy()` | Remove injector |
| `siRefreshMain()` | Refresh main iframe (wrapper mode) |
| `siNavigateMain(url)` | Navigate main iframe (wrapper mode) |
| `siIsWrapperMode()` | Check if in wrapper mode |

```javascript
// Toggle from anywhere
siToggleWindow();

// Dock to right
siDock('right');

// Undock
siUndock();

// Clean up
siDestroy();

// Wrapper mode functions
if (siIsWrapperMode()) {
  siRefreshMain();
  siNavigateMain('https://example.com');
}
```

### Custom Prefix

With `prefix: 'help'`:

| Function | Description |
|----------|-------------|
| `helpToggleWindow()` | Toggle window |
| `helpDock(side)` | Dock to edge |
| `helpUndock()` | Undock window |
| `helpDestroy()` | Remove injector |
| `helpRefreshMain()` | Refresh main iframe (wrapper mode) |
| `helpNavigateMain(url)` | Navigate main iframe (wrapper mode) |
| `helpIsWrapperMode()` | Check if in wrapper mode |

---

## TypeScript Support

### Exported Types

```typescript
import { 
  ServiceInjector,
  ServiceInjectorOptions,
  ServiceInjectorConfig,
  InternalConfig,
  Position,
  AnimationOptions,
  GlobalConfig
} from 'service-injector';
```

### Type Definitions

```typescript
// Main options interface
interface ServiceInjectorOptions {
  url?: string | null;
  position?: 'left' | 'right' | 'top' | 'bottom';
  offset?: string;
  animation?: number;
  windowWidth?: string;
  windowHeight?: string;
  windowTop?: string | null;
  windowBottom?: string | null;
  windowLeft?: string | null;
  windowCenter?: number | null;
  windowRight?: string | null;
  draggable?: boolean;
  resizable?: boolean;
  hideTab?: boolean;
  dockable?: boolean | ('left' | 'right' | 'top' | 'bottom')[];
  prefix?: string;
  saasUrl?: string;
  tabTemplate?: string;
  windowTemplate?: string;
  styles?: string;
  scriptId?: string;
}
```

### Usage Example

```typescript
import { ServiceInjector, ServiceInjectorOptions } from 'service-injector';

const options: ServiceInjectorOptions = {
  saasUrl: 'https://my-saas.com',
  position: 'right',
  dockable: ['left', 'right']
};

const injector = new ServiceInjector(options);
injector.install();

// Type-safe method calls
const isOpen: boolean = injector.isOpen();
const dockSide: 'left' | 'right' | 'top' | 'bottom' | null = injector.isDocked();
```

---

## Advanced Exports

For library extenders and advanced use cases:

### Utilities

```javascript
import { 
  substitutePrefix,  // Replace %prefix% and %url% in strings
  parseValue,        // Parse string to appropriate type
  extractPoint,      // Extract x/y from mouse/touch event
  isMobileDevice     // Detect mobile device
} from 'service-injector';
```

### Animation

```javascript
import { 
  animate,       // Animation helper function
  linearDelta,   // Linear easing (0 to 1)
  reverseDelta   // Reverse easing (1 to 0)
} from 'service-injector';
```

### Defaults

```javascript
import {
  DEFAULT_PREFIX,         // 'si'
  DEFAULT_SCRIPT_ID,      // 'service-injector'
  DEFAULT_SAAS_URL,       // 'https://orienteer.org'
  DEFAULT_CONFIG,         // Full default config object
  CONFIG_MAPPING,         // Long name to short key mapping
  OFFSET_ORIENTATION,     // Position to offset direction mapping
  DEFAULT_TAB_TEMPLATE,   // Default tab HTML
  DEFAULT_WINDOW_TEMPLATE,// Default window HTML
  DEFAULT_STYLES          // Default CSS styles
} from 'service-injector';
```

---

## Examples

### React Integration

```tsx
import { useEffect, useRef } from 'react';
import { ServiceInjector } from 'service-injector';

function SupportWidget() {
  const injectorRef = useRef<ServiceInjector | null>(null);

  useEffect(() => {
    injectorRef.current = new ServiceInjector({
      saasUrl: 'https://support.example.com',
      position: 'right',
      dockable: true
    });
    injectorRef.current.install();

    return () => {
      injectorRef.current?.destroy();
    };
  }, []);

  const handleOpen = () => {
    injectorRef.current?.expand();
  };

  return (
    <button onClick={handleOpen}>
      Open Support
    </button>
  );
}
```

### Vue Integration

```vue
<template>
  <button @click="openSupport">Open Support</button>
</template>

<script setup>
import { onMounted, onUnmounted, ref } from 'vue';
import { ServiceInjector } from 'service-injector';

const injector = ref(null);

onMounted(() => {
  injector.value = new ServiceInjector({
    saasUrl: 'https://support.example.com',
    position: 'right'
  });
  injector.value.install();
});

onUnmounted(() => {
  injector.value?.destroy();
});

const openSupport = () => {
  injector.value?.expand();
};
</script>
```

### Conditional Loading

```javascript
// Only load on certain pages
if (window.location.pathname.includes('/app')) {
  const injector = new ServiceInjector({
    saasUrl: 'https://help.example.com'
  });
  injector.install();
}
```

---

## Next Steps

- [Configuration](./configuration.md) - All options
- [Customization](./customization.md) - Templates and styling
- [Docking](./docking.md) - Docking feature
- [Wrapper Mode](./wrapper-mode.md) - Host external content
