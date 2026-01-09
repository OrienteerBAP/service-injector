# service-injector Documentation

## What is service-injector?

**service-injector** is a lightweight JavaScript library that lets you embed any web service on client websites as a floating tab/window. When users click the tab, a popup window opens with your service loaded in an iframe.

```
┌─────────────────────────────────────┐
│  Client's Website                   │
│                                     │
│─────────┐                           │
│ Your    │  ← Floating tab           │
│ Service │    (click to open)        │
│─────────┘                           │
│                                     │
└─────────────────────────────────────┘

         ↓ Click tab ↓

┌─────────────────────────────────────┐
│  Client's Website    ┌────────────┐ │
│                      │ Your SaaS  │ │
│                      │ in iframe  │ │
│                      │            │ │
│                      │ [Header]   │ │
│                      │ [Content]  │ │
│                      │ [Resize]   │ │
│                      └────────────┘ │
└─────────────────────────────────────┘
```

## Use Case

**You're a SaaS provider** with a customer support tool, feedback widget, or any web-based service. You want your customers to easily embed your service on their websites with minimal effort - just a single script tag. Users of their websites can then access your service through a floating tab that expands into a draggable, resizable window.

**Example scenarios:**
- Customer support chat widget
- Feedback collection panel
- Documentation/help browser
- Quick booking interface
- Analytics dashboard preview

## Live Demo

Try it live: **[https://orienteerbap.github.io/service-injector/](https://orienteerbap.github.io/service-injector/)**

The demo lets you configure all options interactively and see changes in real-time.

## Documentation

| Document | Description |
|----------|-------------|
| [Installation](./installation.md) | npm, CDN, and script tag setup options |
| [Configuration](./configuration.md) | All options for position, size, behavior |
| [Customization](./customization.md) | Templates, styles, and theming |
| [Docking](./docking.md) | Snap windows to screen edges (sidebar mode) |
| [API Reference](./api.md) | Programmatic control and TypeScript support |
| [Mobile Behavior](./mobile.md) | How mobile devices are handled |

## Quick Example

```html
<!-- Simplest usage - just add this script tag -->
<script id="service-injector" 
        src="https://unpkg.com/service-injector/dist/index.iife.js?url=https://your-saas.com">
</script>
```

That's it! A floating tab appears on the page. Click it to open your service.

## Links

- [GitHub Repository](https://github.com/OrienteerBAP/service-injector)
- [npm Package](https://www.npmjs.com/package/service-injector)
- [Main README](../README.md)
