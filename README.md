# service-injector

Lightweight JavaScript library for SaaS providers to embed services on client websites as a floating tab/window.

## Features

- **Zero Dependencies** — Pure vanilla JavaScript, works on any website
- **Multiple Installation Options** — npm package, CDN script tag, or self-hosted
- **Drop-in Configuration** — Query strings, data attributes, or programmatic API
- **Mobile-Aware** — Auto-detects mobile and opens in new tab for better UX
- **Interactive Window** — Draggable, resizable with touch support
- **Dockable** — Snap to screen edges like browser DevTools
- **Fully Customizable** — Templates, styles, and themes
- **TypeScript Support** — Full type definitions included

## Installation

### npm

```bash
npm install service-injector
```

```javascript
import { ServiceInjector } from 'service-injector';

const injector = new ServiceInjector({
  saasUrl: 'https://my-saas.com',
  position: 'right',
  draggable: true
});

injector.install();
```

### CDN

```html
<script id="service-injector" 
        src="https://unpkg.com/service-injector/dist/index.iife.js?url=https://my-saas.com">
</script>
```

Or use jsDelivr:

```html
<script id="service-injector" 
        src="https://cdn.jsdelivr.net/npm/service-injector/dist/index.iife.js">
</script>
```

## Quick Start

The simplest setup - just add the script tag:

```html
<script id="service-injector" 
        src="https://unpkg.com/service-injector/dist/index.iife.js"
        data-url="https://my-saas.com"
        data-position="right">
</script>
```

A floating tab appears. Click it to open your service in a popup window.

## Documentation

For detailed documentation, see the **[docs/](./docs/)** folder:

| Document | Description |
|----------|-------------|
| [Overview](./docs/README.md) | Introduction and navigation |
| [Installation](./docs/installation.md) | npm, CDN, script tag, self-hosting |
| [Configuration](./docs/configuration.md) | All options for position, size, behavior |
| [Customization](./docs/customization.md) | Templates, styles, themes |
| [Docking](./docs/docking.md) | Snap windows to screen edges |
| [API Reference](./docs/api.md) | Methods, global functions, TypeScript |
| [Mobile Behavior](./docs/mobile.md) | How mobile devices are handled |

## Demo

Try it live: **[https://orienteerbap.github.io/service-injector/](https://orienteerbap.github.io/service-injector/)**

## License

Apache-2.0

## Links

- [GitHub Repository](https://github.com/OrienteerBAP/service-injector)
- [npm Package](https://www.npmjs.com/package/service-injector)
- [Demo](https://orienteerbap.github.io/service-injector/)
