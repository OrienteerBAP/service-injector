# service-injector
Lightweight JavaScript library for SaaS providers to allow its services installation on clients' sites.

## Use Case

* You provide SaaS in the Internet.
* You want to allow your users to install a snippet on their sites as floating tab on the side with the ability to display and use your SaaS.

## Features

- **Zero Dependencies** — Pure vanilla JavaScript (ES5) with no jQuery, React, or other libraries required. Works on any website regardless of tech stack.
  ```html
  <script id="service-injector" src="https://yoursite.com/injector.js"></script>
  ```

- **Drop-in Configuration** — Configure behavior via query string parameters or data attributes. No coding required for your clients.
  ```html
  <!-- Query parameters -->
  <script id="service-injector" src="injector.js?p=right&o=100px&ww=500px"></script>
  
  <!-- Or data attributes -->
  <script id="service-injector" src="injector.js" data-position="right" data-offset="100px"></script>
  ```

- **Mobile-Aware** — Automatically detects mobile devices and opens SaaS in a new browser window instead of an iframe for optimal UX.

- **Interactive Window** — Draggable header and resizable corner with full touch event support. Both features can be toggled via configuration.
  ```html
  <script id="service-injector" src="injector.js?d=true&r=true"></script>
  ```

- **Fully Customizable** — Override tab template, window template, and styles without modifying source code. Use global JS config or DOM elements.
  ```html
  <script>
    window.serviceInjectorConfig = {
      tabTemplate: "<a onclick='return siToggleWindow();'>Support</a>",
      styles: "#si-tab { background: #4a90d9; color: white; }"
    };
  </script>
  <script id="service-injector" src="injector.js"></script>
  ```

## Getting Started

1. Get [injector.js](https://raw.githubusercontent.com/OrienteerDW/service-injector/gh-pages/injector.js) from [our GitHub repository](https://github.com/OrienteerDW/service-injector)
2. Adjust it for your needs:
   * URL of your SaaS
   * Window style and design
   * Window behavior
3. Host the modified JS file on your SaaS
4. Provide your users with instructions on how to install your service on their sites.

## Configurations

### Client side

Set of parameters which can be populated from client side

| Parameter | Long Name | Default | Description |
|-----------|-----------|---------|-------------|
| url | url | null | Custom URL to load in the iframe |
| p | position | bottom | Position of a tab: left, right, top, bottom |
| o | offset | 80% | Offset of a tab position. Can be in % or px |
| a | animation | 300 | Animation duration in milliseconds |
| ww | window-width | 440px | Initial width of a window. Can be % or px |
| wh | window-height | 550px | Initial height of a window. Can be % or px |
| wt | window-top | 100px | Initial top position |
| wb | window-bottom | null | Initial bottom window position |
| wl | window-left | null | Initial left window position |
| wc | window-center | 0 | Initial center position of a window |
| wr | window-right | null | Initial right window position |
| d | draggable | true | Is window draggable |
| r | resizable | true | Is window resizable |
| ht | hide-tab | false | Hide tab when window is shown |

Parameters can be populated by the following ways:

1. Query string parameters:
```html
<script id='service-injector' src='https://yoursite.com/injector.js?p=right&o=100px'>
</script>
```

2. Data attributes:
```html
<script id='service-injector' src='https://yoursite.com/injector.js' data-position='left' data-offset='100px'>
</script>
```

### Service side

Set of parameters to be configured in script itself for proper working and adjustment with your SaaS

| Parameter | Desciption |
|-----------|------------|
| url | url to open within iframe |
| tabTemplate | Tab template to be used to display a tab |
| windowTemplate | Window template to be used to display a floating window: wrapper over your iframe |

## Customizing Templates

You can customize the tab appearance, window structure, and styles without modifying the library source code.

### Using Global Configuration

Define `window.serviceInjectorConfig` before loading the library:

```html
<script>
  window.serviceInjectorConfig = {
    tabTemplate: "<a onclick='return siToggleWindow();' href='#'>🚀 Open Panel</a>",
    styles: "#si-tab { background: #4a90d9; color: white; border-radius: 8px; }"
  };
</script>
<script id="service-injector" src="injector.js"></script>
```

### Using DOM Elements

Alternatively, define templates using script/style elements with specific IDs:

```html
<!-- Custom tab template -->
<script type="text/template" id="si-tab-template">
  <a onclick='return siToggleWindow();' href='#'>🚀 Open Panel</a>
</script>

<!-- Custom styles (appended to defaults) -->
<style id="si-custom-styles">
  #si-tab { background: #4a90d9; color: white; border-radius: 8px; }
  #si-header { background: #357abd; color: white; }
</style>

<script id="service-injector" src="injector.js"></script>
```

### Available Placeholders

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

The library exposes global functions for controlling the injector programmatically:

| Function | Description |
|----------|-------------|
| `siToggleWindow()` | Toggle the window open/closed state |
| `siDestroy()` | Completely remove the injector from the page |

### Usage Examples

```javascript
// Toggle window open/closed
siToggleWindow();

// Completely remove the injector (cleanup)
siDestroy();
```

### siDestroy() Details

The `siDestroy()` function performs a complete cleanup:
- Removes all event listeners (mousewheel, mousemove, mouseup, touch events)
- Removes all DOM elements (root container, style element)
- Removes global functions (`siToggleWindow`, `siDestroy`)

This is useful when you need to dynamically remove the injector or reinitialize it with different configuration.
