# Configuration

## Configuration Methods

service-injector can be configured in four ways:

| Method | Best For |
|--------|----------|
| Query string parameters | Script tag, quick setup |
| Data attributes | Script tag, readable HTML |
| Constructor options | Programmatic usage (npm) |
| Global config object | Hybrid (templates + script tag) |

---

## Common Use Cases

### "I want the tab on the right side of the screen"

```html
<!-- Query string -->
<script id="service-injector" src="...?p=right"></script>

<!-- Data attribute -->
<script id="service-injector" src="..." data-position="right"></script>
```

```javascript
// Programmatic
new ServiceInjector({ position: 'right' });
```

### "I want a larger popup window"

```html
<script id="service-injector" src="...?ww=600px&wh=700px"></script>
```

```javascript
new ServiceInjector({ 
  windowWidth: '600px', 
  windowHeight: '700px' 
});
```

### "I want instant animations (no animation)"

```html
<script id="service-injector" src="...?a=0"></script>
```

```javascript
new ServiceInjector({ animation: 0 });
```

### "I don't want users to resize the window"

```html
<script id="service-injector" src="...?r=false"></script>
```

```javascript
new ServiceInjector({ resizable: false });
```

### "I want the window to be dockable to screen edges"

```html
<script id="service-injector" src="...?dk=true"></script>
```

```javascript
new ServiceInjector({ dockable: true });
// Or limit to specific sides:
new ServiceInjector({ dockable: ['left', 'right'] });
```

---

## Full Options Reference

### Programmatic API Options

Use these option names when creating a `ServiceInjector` instance:

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `url` | `string` | `null` | URL to load in the iframe |
| `position` | `string` | `'bottom'` | Tab position: `'left'`, `'right'`, `'top'`, `'bottom'` |
| `offset` | `string` | `'80%'` | Tab offset from edge (e.g., `'80%'`, `'100px'`) |
| `animation` | `number` | `300` | Animation duration in milliseconds |
| `windowWidth` | `string` | `'440px'` | Window width |
| `windowHeight` | `string` | `'550px'` | Window height |
| `windowTop` | `string` | `'100px'` | Window top position |
| `windowBottom` | `string` | `null` | Window bottom position |
| `windowLeft` | `string` | `null` | Window left position |
| `windowCenter` | `number` | `0` | Window center offset (0 = centered horizontally) |
| `windowRight` | `string` | `null` | Window right position |
| `draggable` | `boolean` | `true` | Enable window dragging |
| `resizable` | `boolean` | `true` | Enable window resizing |
| `hideTab` | `boolean` | `false` | Hide tab when window is open |
| `dockable` | `boolean \| string[]` | `false` | Enable docking to screen edges |
| `prefix` | `string` | `'si'` | Element ID prefix |
| `saasUrl` | `string` | `'https://orienteer.org'` | Default URL when `url` not set |
| `tabTemplate` | `string` | (default) | Custom tab HTML |
| `windowTemplate` | `string` | (default) | Custom window HTML |
| `styles` | `string` | `''` | Additional CSS styles |
| `scriptId` | `string` | `'service-injector'` | Script element ID for config detection |

### Script Tag Parameters

Use these short parameter names in query strings:

| Short | Long (data-attr) | Default | Description |
|-------|------------------|---------|-------------|
| `url` | `url` | `null` | URL to load in iframe |
| `p` | `position` | `'bottom'` | Tab position |
| `o` | `offset` | `'80%'` | Tab offset from edge |
| `a` | `animation` | `300` | Animation duration (ms) |
| `ww` | `window-width` | `'440px'` | Window width |
| `wh` | `window-height` | `'550px'` | Window height |
| `wt` | `window-top` | `'100px'` | Window top position |
| `wb` | `window-bottom` | `null` | Window bottom position |
| `wl` | `window-left` | `null` | Window left position |
| `wc` | `window-center` | `0` | Window center offset |
| `wr` | `window-right` | `null` | Window right position |
| `d` | `draggable` | `true` | Enable dragging |
| `r` | `resizable` | `true` | Enable resizing |
| `ht` | `hide-tab` | `false` | Hide tab when open |
| `dk` | `dockable` | `false` | Enable docking |

---

## Tab Position

The `position` option controls which edge of the screen the tab appears on:

```
         ┌─────────────────────────────┐
         │           top               │
         ├──────┬──────────────┬───────┤
         │      │              │       │
         │ left │   viewport   │ right │
         │      │              │       │
         ├──────┴──────────────┴───────┤
         │          bottom             │
         └─────────────────────────────┘
```

<!-- TODO: Add screenshot showing tab positions -->

The `offset` option controls where along that edge the tab appears:
- `'80%'` - 80% from the start (left for top/bottom, top for left/right)
- `'100px'` - 100 pixels from the start

---

## Window Position

By default, the window appears centered horizontally with `windowTop: '100px'`.

You can position it explicitly:

```javascript
// Top-right corner
new ServiceInjector({
  windowTop: '50px',
  windowRight: '50px'
});

// Bottom-left corner
new ServiceInjector({
  windowBottom: '50px',
  windowLeft: '50px'
});

// Centered with offset
new ServiceInjector({
  windowCenter: 100  // 100px to the right of center
});
```

---

## Configuration Priority

When multiple configuration sources are used, they merge in this order (later wins):

1. **Default values** (built into library)
2. **Query string parameters** (from script src)
3. **Data attributes** (on script element)
4. **Constructor options** (programmatic)

Example:

```html
<script id="service-injector" 
        src="...?p=left"
        data-position="right">
</script>
```

Result: `position` will be `'right'` (data attribute wins over query string)

---

## Complete Examples

### Minimal Setup

```html
<script id="service-injector" 
        src="https://unpkg.com/service-injector/dist/index.iife.js">
</script>
```

### Right-side Support Widget

```html
<script id="service-injector" 
        src="https://unpkg.com/service-injector/dist/index.iife.js"
        data-url="https://support.example.com"
        data-position="right"
        data-offset="50%"
        data-window-width="400px"
        data-window-height="600px">
</script>
```

### Full-screen Dockable Panel

```javascript
import { ServiceInjector } from 'service-injector';

const injector = new ServiceInjector({
  saasUrl: 'https://app.example.com',
  position: 'right',
  windowWidth: '500px',
  windowHeight: '100%',
  dockable: ['left', 'right'],
  hideTab: true
});

injector.install();
```

### Small Feedback Button

```html
<script id="service-injector" 
        src="https://unpkg.com/service-injector/dist/index.iife.js?url=https://feedback.example.com&p=bottom&o=95%&ww=350px&wh=400px&r=false">
</script>
```

---

## Next Steps

- [Customize appearance](./customization.md) - Templates, styles, themes
- [Enable docking](./docking.md) - Sidebar-like behavior
- [API Reference](./api.md) - Programmatic control
