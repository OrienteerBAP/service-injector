# Mobile Behavior

## Overview

service-injector automatically detects mobile devices and changes its behavior for better user experience.

---

## Use Cases

### "Why doesn't the iframe show on my phone?"

On mobile devices, clicking the tab opens your URL in a **new browser tab** instead of showing an iframe popup. This is intentional for better UX.

### "Can I force iframe mode on mobile?"

This is not recommended and not currently supported. See [Why This Design](#why-this-design) below.

---

## What Happens on Mobile

| Desktop | Mobile |
|---------|--------|
| Click tab → Popup window with iframe | Click tab → New browser tab |
| Draggable, resizable window | Direct access to your app |
| Docking available | No docking |

```
Desktop:                              Mobile:

┌─────────────────────────┐          ┌─────────────────────────┐
│  Website    ┌────────┐  │          │  Website                │
│             │ iframe │  │          │                         │
│             │  with  │  │   vs     │   [Tab clicked]         │
│             │ your   │  │          │         ↓               │
│             │  app   │  │          │   Opens new browser     │
│             └────────┘  │          │   tab with your app     │
└─────────────────────────┘          └─────────────────────────┘
```

---

## Why This Design?

Iframes on mobile devices have significant UX problems:

| Issue | Problem |
|-------|---------|
| **Scroll conflicts** | Scrolling inside iframe vs. scrolling page is confusing |
| **Gesture conflicts** | Pinch-zoom, swipe gestures don't work well in iframes |
| **Viewport issues** | Mobile browsers handle iframe viewports inconsistently |
| **Keyboard problems** | Virtual keyboard can cause layout issues with iframes |
| **Touch targets** | Small touch targets inside iframes are frustrating |

Most SaaS applications already have responsive mobile versions. Opening in a new tab gives users the **full mobile experience** of your app.

---

## Mobile Detection

service-injector uses **user agent detection** to identify mobile devices.

### Detected Devices

- Android phones/tablets
- iPhones, iPods
- BlackBerry
- Windows Phone
- Opera Mini/Mobile
- Firefox Mobile
- Various other mobile browsers

### Checking Mobile Status

```javascript
// Programmatic
const injector = new ServiceInjector({ saasUrl: '...' });
injector.install();

if (injector.isMobile()) {
  console.log('Running on mobile device');
}
```

---

## Docking on Mobile

Docking is automatically disabled on mobile devices because:

1. Touch-based dragging UX is different from mouse
2. Sidebars don't make sense on narrow mobile screens
3. Mobile browsers already have their own UI constraints

Docking is also disabled on screens narrower than **768px** (tablets in portrait mode).

---

## Customizing Mobile Behavior

While you can't change the core mobile behavior, you can adapt your integration:

### Hide Tab on Mobile

```javascript
const injector = new ServiceInjector({
  saasUrl: 'https://my-saas.com'
});

// Only install on non-mobile
if (!isMobileDevice()) {
  injector.install();
}

// Or use CSS to hide
// Note: Tab still works, just hidden
```

### Different URL for Mobile

```javascript
import { ServiceInjector, isMobileDevice } from 'service-injector';

const url = isMobileDevice() 
  ? 'https://m.my-saas.com'  // Mobile-optimized version
  : 'https://my-saas.com';

const injector = new ServiceInjector({
  saasUrl: url
});
injector.install();
```

### Provide Alternative Mobile UI

```html
<script>
  // Check before loading injector
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  
  if (isMobile) {
    // Show a simple link instead
    document.body.innerHTML += `
      <a href="https://my-saas.com" 
         style="position:fixed; bottom:20px; right:20px; 
                background:#4a90d9; color:white; 
                padding:12px 20px; border-radius:8px;">
        Open Support
      </a>
    `;
  } else {
    // Load full injector for desktop
    var script = document.createElement('script');
    script.id = 'service-injector';
    script.src = 'https://unpkg.com/service-injector/dist/index.iife.js';
    document.body.appendChild(script);
  }
</script>
```

---

## Technical Details

### User Agent Detection

service-injector uses comprehensive regex patterns to detect mobile devices:

```javascript
// Simplified version of detection logic
const mobileRegex = /(android|iphone|ipad|ipod|blackberry|windows phone|opera mini|mobile)/i;
const isMobile = mobileRegex.test(navigator.userAgent);
```

### When Mobile is Detected

The `expand()` method changes behavior:

```javascript
// Internally, expand() does this on mobile:
if (this.isMobile()) {
  window.open(this.config.url, '_blank');
  return true;  // Indicates external open
}
// Otherwise shows iframe popup
```

---

## Troubleshooting

### "My tablet shows iframe, but I want new tab behavior"

Tablets in landscape mode with width >= 768px are treated as desktop. This is intentional as they have enough screen space for the popup.

### "Detection isn't working for my device"

The user agent detection covers most devices but may miss some edge cases. If you find a device that should be detected as mobile but isn't, please [report it on GitHub](https://github.com/OrienteerBAP/service-injector/issues).

### "I really need iframe on mobile"

This isn't currently supported. If you have a strong use case, consider:

1. Opening the issue on GitHub to discuss
2. Forking the library and modifying the `needOpenWide()` method
3. Using a different solution for mobile-specific needs

---

## Next Steps

- [Configuration](./configuration.md) - All options
- [API Reference](./api.md) - `isMobile()` method and more
- [Installation](./installation.md) - Setup options
