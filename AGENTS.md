---
id: AGENTS
aliases: []
tags: []
---

# AGENTS.md - AI Agent Guidelines for service-injector

This document provides guidelines for AI coding agents working on this repository.

## Project Overview

**service-injector** is a lightweight JavaScript/TypeScript library for SaaS providers to embed their services on client websites as a floating tab/window with iframe integration. The library is designed to work without external dependencies.

**Tech Stack:**
- Primary Language: TypeScript
- Build Tool: tsup (based on esbuild)
- Output Formats: ESM, CommonJS, IIFE (browser)
- No runtime dependencies

## Project Structure

```
service-injector/
├── src/                      # TypeScript source files
│   ├── index.ts              # Entry point, exports
│   ├── types.ts              # TypeScript interfaces
│   ├── defaults.ts           # Default config, templates, styles
│   ├── utils.ts              # Helper functions
│   ├── animation.ts          # Animation system
│   ├── ServiceInjector.ts    # Main class
│   └── auto-install.ts       # Script-tag auto-installation
├── dist/                     # Build output (generated, gitignored)
│   ├── index.js              # ESM bundle
│   ├── index.cjs             # CommonJS bundle
│   ├── index.iife.js         # Browser bundle (auto-installs)
│   ├── index.d.ts            # TypeScript declarations
│   └── *.map                 # Source maps
├── demo/
│   └── index.html            # Demo page
├── package.json
├── tsconfig.json
├── tsup.config.ts
├── .gitignore
├── .npmignore
├── README.md
├── LICENSE
└── AGENTS.md
```

## Build Commands

```bash
# Install dependencies
npm install

# Build all formats (ESM, CJS, IIFE)
npm run build

# Build in watch mode for development
npm run dev
```

## Code Style Guidelines

### TypeScript

- Use modern TypeScript features (ES2015+ target)
- Prefer `const` and `let` over `var`
- Use explicit type annotations for function parameters and return types
- Use interfaces for object shapes, types for unions/primitives
- Document public APIs with JSDoc comments

```typescript
// Good
export function parseValue(val: string): string | number | boolean {
  // ...
}

// Good - interface for object shape
export interface ServiceInjectorConfig {
  url?: string | null;
  position?: 'left' | 'right' | 'top' | 'bottom';
}
```

### Naming Conventions

- Variables/functions: `camelCase`
- Classes: `PascalCase`
- Constants: `UPPER_SNAKE_CASE`
- Interfaces/Types: `PascalCase`
- Private class members: `camelCase` (no underscore prefix)

### Code Organization

- One class per file for main classes
- Group related utilities in single files
- Keep files focused and reasonably sized
- Export types from `types.ts`
- Export defaults from `defaults.ts`

## Important Patterns

### ServiceInjector Class

The main class that handles all functionality:

```typescript
const injector = new ServiceInjector({
  saasUrl: 'https://example.com',
  position: 'right',
  draggable: true
});

injector.install();   // Mount to DOM
injector.toggle();    // Toggle window
injector.destroy();   // Cleanup
```

### Auto-Install (IIFE Bundle)

The IIFE bundle auto-installs when loaded via script tag:

```html
<script id="service-injector" src="dist/index.iife.js?p=right&o=100px"></script>
```

This is handled by `auto-install.ts` which:
1. Detects script tag with `id="service-injector"`
2. Creates ServiceInjector instance
3. Calls `install()` automatically

### Configuration System

Two configuration methods:
1. **Programmatic**: Pass options to `new ServiceInjector(options)`
2. **Script tag**: Query params (`?p=right`) or data attributes (`data-position="right"`)

Short keys (for query params) are mapped to long names in `defaults.ts`:

```typescript
const CONFIG_MAPPING = {
  'position': 'p',
  'offset': 'o',
  // ...
};
```

### Global Functions

The injector exposes global functions based on the prefix:

```typescript
// With default prefix "si":
window.siToggleWindow = () => injector.toggle();
window.siDestroy = () => injector.destroy();

// With custom prefix "my":
window.myToggleWindow = () => injector.toggle();
window.myDestroy = () => injector.destroy();
```

### Template System

Templates support placeholders:
- `%prefix%` - Element ID prefix
- `%url%` - The configured URL

```typescript
const tabTemplate = "<a onclick='return %prefix%ToggleWindow();'>Open</a>";
```

## Common Tasks

### Adding a New Configuration Option

1. Add to `InternalConfig` interface in `types.ts`
2. Add to `ServiceInjectorConfig` interface in `types.ts` (readable name)
3. Add default value in `DEFAULT_CONFIG` in `defaults.ts`
4. Add mapping in `CONFIG_MAPPING` (for script tag support)
5. Add mapping in `OPTIONS_TO_CONFIG` (for programmatic API)
6. Handle the option in `ServiceInjector.install()`
7. Update README.md documentation

### Modifying Window Behavior

- Window state is in `this.state.win` and `this.state.winPosition`
- Drag/resize logic is in `initDragAndResize()`
- Toggle animation is in `expand()` and `collapse()`

### Updating Styles

- Default styles are in `DEFAULT_STYLES` in `defaults.ts`
- Use `%prefix%` placeholder for element IDs

## Testing

Currently no automated test framework. Test manually by:

1. Run `npm run build`
2. Open `demo/index.html` in a browser
3. Test floating tab/window functionality
4. Test mobile behavior (opens in new window)
5. Test drag and resize functionality
6. Test different configurations

## Publishing

```bash
# Build first
npm run build

# Publish to npm
npm publish
```

The `prepublishOnly` script automatically runs the build.

## Master Rules to Follow

- Always commit changes after completing a task
- Do not push to remote unless explicitly requested by the user
- Run `npm run build` after making source changes to verify compilation
- Keep backwards compatibility with script tag usage
