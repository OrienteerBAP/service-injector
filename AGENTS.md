---
id: AGENTS
aliases: []
tags: []
---

# AGENTS.md - AI Agent Guidelines for service-injector

This document provides guidelines for AI coding agents working on this repository.

## Project Overview

**service-injector** is a lightweight JavaScript library for SaaS providers to embed their services on client websites as a floating tab/window with iframe integration. The library is designed to work without external dependencies (no jQuery or other JS libraries required).

**Tech Stack:**
- Primary Language: JavaScript (ES5, vanilla/pure JS)

## Build/Lint/Test Commands

### No Build System
This project has no build pipeline, test framework, or linting configuration. The JavaScript file (`injector.js`) is designed to be used directly without transpilation.

### Running Tests
There is no test framework configured. When adding features, test manually by:
1. Opening `index.html` in a browser (demo page with multiple configurations)
2. Testing the floating tab/window functionality
3. Verifying mobile device behavior (opens in new window)
4. Testing drag and resize functionality

### Linting
No linting configuration exists. Follow the code style guidelines below.

## Code Style Guidelines

### JavaScript (injector.js)

#### Variable Declarations
- Use `var` (ES5 style) - do NOT use `let` or `const`
- Declare variables at function scope top
- No arrow functions - use traditional `function` syntax

```javascript
// Good
var conf = injector.conf;
var script = document.getElementById(siScriptId);

// Bad - do not use
const conf = injector.conf;
let script = document.getElementById(siScriptId);
```

#### Naming Conventions
- Variables: `camelCase` (e.g., `siScriptId`, `saasUrl`, `clientConfig`)
- Functions: `camelCase` (e.g., `parseValue`, `toggleWindow`, `adjustSizes`)
- Config keys: Short lowercase (e.g., `p`, `o`, `ww`, `wh`) with long-name mapping
- DOM element IDs: Use `%prefix%` pattern (e.g., `%prefix%-tab`, `%prefix%-window`)

```javascript
// Configuration mapping pattern
var configMapping = {
  'position' : 'p',
  'offset' : 'o',
  'window-width' : 'ww',
};
```

#### Code Structure
- Use IIFE (Immediately Invoked Function Expression) to encapsulate code
- Organize methods in an `injector` object literal pattern
- Use `sp()` helper function for string template substitution with prefix

```javascript
!function() {
  // All code inside IIFE
  var injector = {
    state: { /* ... */ },
    conf: clientConfig,
    methodName: function() { /* ... */ }
  };
  injector.install();
}();
```

#### DOM Manipulation
- Use pure DOM API (`document.createElement`, `getElementById`, `appendChild`)
- Direct style manipulation via `.style` property
- Use `innerHTML` for template injection

#### Event Handling
- Support both mouse and touch events
- Use `stopPropagation()` and `preventDefault()` for drag/resize operations
- Add event listeners with `addEventListener`

#### Error Handling
- Use defensive checks with `if` statements
- Use regex for value parsing validation
- No try/catch blocks - fail silently when appropriate

```javascript
// Defensive check pattern
if(script) {
  var src = script.getAttribute('src');
  if(src) {
    // ...
  }
}

// Regex validation
if(/^(\-|\+)?([0-9]+|Infinity)$/.test(val)) return Number(val);
```

## Important Patterns

### Configuration System
The library supports two configuration methods:
1. **Query string parameters**: Short names (e.g., `?p=right&o=100px&url=https://example.com`)
2. **Data attributes**: Long names (e.g., `data-position="left"`)

Available configuration parameters:
- `url` - Custom URL to load in the iframe (overrides default `saasUrl`)
- `p` (position) - Tab position: left, right, top, bottom
- `o` (offset) - Tab offset from edge (% or px)
- `a` (animation) - Animation duration in ms
- `ww`, `wh` - Window width/height
- `wt`, `wb`, `wl`, `wr`, `wc` - Window positioning
- `d` (draggable) - Enable/disable dragging
- `r` (resizable) - Enable/disable resizing
- `ht` (hide-tab) - Hide tab when window is open

### Mobile Detection
Mobile devices are detected via user agent regex and open SaaS in a new window instead of iframe:
```javascript
injector.state.mobile = /(android|bb\d+|meego).../.test(userAgent);
```

### Animation System
Custom animation using `setInterval` with configurable duration, delta function, and callbacks.

### Template Configuration
Templates (tab, window, styles) can be customized via global JS config or DOM elements:

**Option 1: Global JS Config (define before loading injector.js)**
```javascript
window.serviceInjectorConfig = {
  tabTemplate: "<a onclick='return siToggleWindow();'>Open</a>",
  windowTemplate: "...",
  styles: "#si-tab { background: blue; }"
};
```

**Option 2: DOM Elements (using configured prefix, default "si")**
```html
<script type="text/template" id="si-tab-template">
  <a onclick='return siToggleWindow();'>Custom Tab</a>
</script>
<style id="si-custom-styles">
  #si-tab { background: blue; }
</style>
```

Templates support `%prefix%` and `%url%` placeholders.
Custom styles are APPENDED to default styles, allowing overrides.

### Programmatic Control
The library exposes global functions for controlling the injector:

- `siToggleWindow()` - Toggle the window open/closed state
- `siDestroy()` - Completely remove the injector from the page:
  - Removes all event listeners (mousewheel, mousemove, mouseup, touch events)
  - Removes all DOM elements (root container, style element)
  - Removes global functions (`siToggleWindow`, `siDestroy`)

```javascript
// Toggle window programmatically
siToggleWindow();

// Clean removal of injector
siDestroy();
```

## Common Tasks

### Adding a New Configuration Option
1. Add short key to `clientConfig` object with default value
2. Add long-name mapping to `configMapping` object
3. Handle the option in `install()` method
4. Update README.md documentation

### Modifying Window Behavior
- Window state is in `injector.state.win` and `injector.state.winPosition`
- Drag/resize logic is in `initDragAndResize()`
- Toggle animation is in `expandWindow()` and `collapseWindow()`

### Updating Styles
- Inline styles are in `injectorStyles` variable
- Use `sp()` function to include prefix placeholders

# Master Rules to Follow

- Always commit changes after completing a task
- Do not push to remote unless explicitly requested by the user
