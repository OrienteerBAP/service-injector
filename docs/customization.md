# Customization

## Overview

service-injector is fully customizable. You can change:

- **Tab appearance** - The floating button users click
- **Window appearance** - The popup container
- **Colors and styles** - Match your brand
- **Complete templates** - Full HTML control

---

## Use Cases

### "I want to match my brand colors"

```html
<style id="si-custom-styles">
  #si-tab { 
    background: #4a90d9; 
    color: white; 
    border-radius: 8px; 
  }
  #si-header { 
    background: #357abd; 
  }
</style>
<script id="service-injector" src="..."></script>
```

### "I want to change the tab text"

```html
<script>
  window.serviceInjectorConfig = {
    tabTemplate: "<a onclick='return siToggleWindow();'>Need Help?</a>"
  };
</script>
<script id="service-injector" src="..."></script>
```

### "I want a dark theme"

See [Theme Examples](#theme-examples) below.

---

## Template Placeholders

Templates support these placeholders that get replaced automatically:

| Placeholder | Replaced With | Example |
|-------------|---------------|---------|
| `%prefix%` | Element ID prefix | `si` (default) |
| `%url%` | Configured URL | `https://your-saas.com` |

Example:
```html
<a onclick='return %prefix%ToggleWindow();' href='%url%'>Open</a>
```
Becomes:
```html
<a onclick='return siToggleWindow();' href='https://your-saas.com'>Open</a>
```

---

## Customization Methods

### Method 1: Global Config Object

Best for: Script tag usage with custom templates

```html
<script>
  window.serviceInjectorConfig = {
    tabTemplate: "<a onclick='return siToggleWindow();'>Support</a>",
    windowTemplate: "...",  // Custom window HTML
    styles: "#si-tab { background: blue; color: white; }"
  };
</script>
<script id="service-injector" src="..."></script>
```

### Method 2: DOM Template Elements

Best for: Keeping HTML templates in HTML (not JavaScript strings)

```html
<!-- Custom tab template -->
<script type="text/template" id="si-tab-template">
  <a onclick='return siToggleWindow();' href='#'>
    <span>Customer Support</span>
  </a>
</script>

<!-- Custom styles -->
<style id="si-custom-styles">
  #si-tab { 
    background: linear-gradient(to bottom, #4a90d9, #357abd);
    color: white;
    padding: 12px 16px;
    border-radius: 8px;
  }
</style>

<script id="service-injector" src="..."></script>
```

### Method 3: Programmatic Options

Best for: npm package usage

```javascript
import { ServiceInjector } from 'service-injector';

const injector = new ServiceInjector({
  saasUrl: 'https://my-saas.com',
  tabTemplate: "<a onclick='return %prefix%ToggleWindow();'>Help</a>",
  styles: "#%prefix%-tab { background: #4a90d9; color: white; }"
});

injector.install();
```

---

## Element Reference

These are the DOM elements created by service-injector:

```
#si-service-injector (root container)
├── #si-shadow (animation helper)
├── #si-tab (floating tab button)
│   └── [your tab template content]
└── #si-window (popup window)
    └── #si-inner
        ├── #si-header (draggable header)
        ├── #si-body
        │   └── #si-iframe (your content)
        └── #si-footer
            └── #si-resizer (resize handle)
```

<!-- TODO: Add annotated screenshot showing element IDs -->

| Element ID | Description | Styling Tips |
|------------|-------------|--------------|
| `#si-tab` | Floating tab button | Background, padding, border-radius |
| `#si-window` | Popup container | Border, shadow, border-radius |
| `#si-header` | Draggable header bar | Background, height, cursor |
| `#si-body` | Content area | Border, padding |
| `#si-iframe` | Embedded content | Width, height (auto-managed) |
| `#si-footer` | Footer area | Usually minimal styling |
| `#si-resizer` | Resize handle | Cursor, size |
| `#si-shadow` | Animation placeholder | Background color |

**Note:** Replace `si` with your custom prefix if using one.

---

## Default Templates

For reference when creating custom templates:

### Default Tab Template

```html
<a onclick='return %prefix%ToggleWindow();' href='%url%'>Click me!</a>
```

### Default Window Template

```html
<div id='%prefix%-inner'>
  <div id='%prefix%-header'>
    <a href='#' onclick='return %prefix%ToggleWindow();' style='cursor:pointer'>X</a>
  </div>
  <div id='%prefix%-body'>
    <iframe id='%prefix%-iframe'></iframe>
  </div>
  <div id='%prefix%-footer'>
    <div id='%prefix%-resizer'></div>
  </div>
</div>
```

### Default Styles

```css
#si-tab {
  background: white;
  border: 1px solid black;
  padding: 1em;
}
#si-window {
  background: white;
  border: 1px solid black;
  min-width: 300px;
  min-height: 200px;
}
#si-inner {
  height: 100%;
  width: 100%;
  position: relative;
}
#si-header {
  height: 1.5em;
  background: #aaa;
  text-align: right;
  padding: 0 0.5em;
  cursor: move;
}
#si-body {
  border: 1px solid #aaa;
  bottom: 0;
}
#si-iframe {
  border: 0;
}
#si-footer {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
}
#si-resizer {
  width: 10px;
  height: 10px;
  float: right;
  position: relative;
  right: -2px;
  bottom: -2px;
  border-right: 3px solid black;
  border-bottom: 3px solid black;
  cursor: se-resize;
}
#si-shadow {
  background: grey;
}
```

---

## Theme Examples

### Blue Theme (Professional)

```html
<script>
  window.serviceInjectorConfig = {
    tabTemplate: "<a onclick='return siToggleWindow();' href='#'>Support</a>",
    styles: `
      #si-tab {
        background: linear-gradient(to bottom, #4a90d9, #357abd);
        color: white;
        border: none;
        border-radius: 8px;
        padding: 12px 16px;
        font-weight: 500;
      }
      #si-window {
        border: 2px solid #357abd;
        border-radius: 8px;
        overflow: hidden;
        box-shadow: 0 4px 20px rgba(0,0,0,0.15);
      }
      #si-header {
        background: #357abd;
        color: white;
      }
      #si-header a {
        color: white;
        text-decoration: none;
      }
    `
  };
</script>
```

### Dark Theme (Developer-focused)

```html
<script>
  window.serviceInjectorConfig = {
    tabTemplate: "<a onclick='return siToggleWindow();' href='#'>Console</a>",
    styles: `
      #si-tab {
        background: #1a1a2e;
        color: #eee;
        border: 1px solid #444;
        font-family: monospace;
      }
      #si-window {
        background: #1a1a2e;
        border: 1px solid #444;
      }
      #si-header {
        background: #16213e;
        color: #eee;
      }
      #si-header a {
        color: #eee;
      }
      #si-body {
        border-color: #444;
      }
      #si-resizer {
        border-color: #666;
      }
    `
  };
</script>
```

### Minimal Theme (Clean)

```html
<script>
  window.serviceInjectorConfig = {
    tabTemplate: "<a onclick='return siToggleWindow();' href='#'>?</a>",
    styles: `
      #si-tab {
        background: #f8f8f8;
        border: 1px solid #ddd;
        padding: 8px 12px;
        border-radius: 4px;
      }
      #si-window {
        border: 1px solid #ddd;
        box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        border-radius: 4px;
        overflow: hidden;
      }
      #si-header {
        background: #f0f0f0;
        border-bottom: 1px solid #ddd;
      }
    `
  };
</script>
```

---

## Real-World Examples

### Customer Support Widget

```html
<script>
  window.serviceInjectorConfig = {
    tabTemplate: `
      <a onclick='return siToggleWindow();' href='#' style='display: flex; align-items: center; gap: 8px;'>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/>
        </svg>
        <span>Chat with us</span>
      </a>
    `,
    styles: `
      #si-tab {
        background: #25D366;
        color: white;
        border: none;
        border-radius: 24px;
        padding: 12px 20px;
        font-weight: 500;
        box-shadow: 0 2px 10px rgba(37, 211, 102, 0.3);
      }
      #si-tab:hover {
        background: #20BD5A;
      }
    `
  };
</script>
<script id="service-injector" 
        src="https://unpkg.com/service-injector/dist/index.iife.js"
        data-url="https://support.example.com"
        data-position="right"
        data-offset="85%">
</script>
```

### Feedback Collection Panel

```html
<script>
  window.serviceInjectorConfig = {
    tabTemplate: `
      <a onclick='return siToggleWindow();' href='#'>
        Feedback
      </a>
    `,
    styles: `
      #si-tab {
        background: #FF6B35;
        color: white;
        border: none;
        padding: 10px 16px;
        font-size: 14px;
        writing-mode: vertical-rl;
        text-orientation: mixed;
        border-radius: 8px 0 0 8px;
      }
      #si-window {
        border-radius: 8px;
        overflow: hidden;
        box-shadow: 0 8px 30px rgba(0,0,0,0.12);
      }
      #si-header {
        background: #FF6B35;
        color: white;
      }
    `
  };
</script>
<script id="service-injector" 
        src="https://unpkg.com/service-injector/dist/index.iife.js"
        data-url="https://feedback.example.com"
        data-position="right"
        data-offset="50%"
        data-window-width="400px"
        data-window-height="500px">
</script>
```

---

## Custom Prefix

If you need multiple injectors or want to avoid ID conflicts:

```javascript
const injector = new ServiceInjector({
  prefix: 'support',
  saasUrl: 'https://support.example.com'
});
```

This changes all element IDs and global functions:
- Elements: `#support-tab`, `#support-window`, etc.
- Functions: `supportToggleWindow()`, `supportDestroy()`, etc.

---

## Next Steps

- [Configuration](./configuration.md) - All positioning and behavior options
- [Docking](./docking.md) - Sidebar-style docking
- [API Reference](./api.md) - Programmatic control
