# AGENTS.md - AI Agent Guidelines for service-injector

This document provides guidelines for AI coding agents working on this repository.

## Project Overview

**service-injector** is a lightweight JavaScript library for SaaS providers to embed their services on client websites as a floating tab/window with iframe integration. The library is designed to work without external dependencies (no jQuery or other JS libraries required).

**Tech Stack:**
- Primary Language: JavaScript (ES5, vanilla/pure JS)
- Documentation Site: Jekyll (Ruby-based static site generator)
- Styling: SCSS/SASS

## Build/Lint/Test Commands

### No Build System
This project has no build pipeline, test framework, or linting configuration. The JavaScript file (`injector.js`) is designed to be used directly without transpilation.

### Jekyll Commands (Documentation Site)
```bash
# Build the Jekyll site
jekyll build

# Serve locally with live reload
jekyll serve

# Build for production
JEKYLL_ENV=production jekyll build
```

### Running Tests
There is no test framework configured. When adding features, test manually by:
1. Opening `index.html` in a browser
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

### SCSS/SASS (css/, _sass/)

- Use `$` prefix for variables with hyphen-case: `$base-font-family`, `$grey-color-light`
- Main file: `css/main.scss` (contains variables and imports)
- Partials in `_sass/`: `_base.scss`, `_layout.scss`, `_syntax-highlighting.scss`
- Use `@import` for partials (no underscore in import statement)
- Use `/** */` comments for section headers
- Use SCSS nesting for related elements, `%placeholder` selectors, and `@include` for mixins

### HTML/Jekyll Templates

- Use `{% %}` for logic, `{{ }}` for output
- Layouts in `_layouts/`, includes in `_includes/`
- Standard HTML5 structure

## Important Patterns

### Configuration System
The library supports two configuration methods:
1. **Query string parameters**: Short names (e.g., `?p=right&o=100px`)
2. **Data attributes**: Long names (e.g., `data-position="left"`)

### Mobile Detection
Mobile devices are detected via user agent regex and open SaaS in a new window instead of iframe:
```javascript
injector.state.mobile = /(android|bb\d+|meego).../.test(userAgent);
```

### Animation System
Custom animation using `setInterval` with configurable duration, delta function, and callbacks.

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

## Git Workflow

- Always commit changes after completing a task
- Do not push to remote unless explicitly requested by the user
