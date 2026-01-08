# Installation

## Choose Your Method

| Your Situation | Recommended Method |
|----------------|-------------------|
| Simple HTML website | [Script Tag (CDN)](#script-tag-cdn) |
| React, Vue, Angular, etc. | [npm + ES Modules](#npm-package) |
| Node.js / SSR | [npm + CommonJS](#commonjs) |
| Want full control | [Self-Hosting](#self-hosting) |

---

## Script Tag (CDN)

**Use case:** *"I have a simple HTML website and want the easiest setup possible."*

The simplest way to use service-injector. Just add a script tag and it auto-installs:

### Using unpkg

```html
<script id="service-injector" 
        src="https://unpkg.com/service-injector/dist/index.iife.js">
</script>
```

### Using jsDelivr

```html
<script id="service-injector" 
        src="https://cdn.jsdelivr.net/npm/service-injector/dist/index.iife.js">
</script>
```

### With Configuration (Query String)

```html
<script id="service-injector" 
        src="https://unpkg.com/service-injector/dist/index.iife.js?url=https://my-saas.com&p=right&o=100px">
</script>
```

### With Configuration (Data Attributes)

```html
<script id="service-injector" 
        src="https://unpkg.com/service-injector/dist/index.iife.js"
        data-url="https://my-saas.com"
        data-position="right"
        data-offset="100px">
</script>
```

### Important Notes

- The script **must** have `id="service-injector"` for auto-installation
- The script auto-installs when loaded - no additional JavaScript needed
- See [Configuration](./configuration.md) for all available options

---

## npm Package

**Use case:** *"I'm building a modern web app with a bundler (Webpack, Vite, etc.)."*

### Install

```bash
npm install service-injector
```

### ES Modules (Recommended)

```javascript
import { ServiceInjector } from 'service-injector';

const injector = new ServiceInjector({
  saasUrl: 'https://my-saas.com',
  position: 'right',
  draggable: true,
  resizable: true
});

injector.install();
```

### CommonJS

**Use case:** *"I'm using Node.js or an older bundler setup."*

```javascript
const { ServiceInjector } = require('service-injector');

const injector = new ServiceInjector({
  saasUrl: 'https://my-saas.com',
  position: 'bottom'
});

injector.install();
```

### TypeScript

Full TypeScript definitions are included:

```typescript
import { ServiceInjector, ServiceInjectorOptions } from 'service-injector';

const options: ServiceInjectorOptions = {
  saasUrl: 'https://my-saas.com',
  position: 'right',
  draggable: true
};

const injector = new ServiceInjector(options);
injector.install();
```

---

## Self-Hosting

**Use case:** *"I want to host the script on my own servers."*

### Option 1: Download from npm

```bash
npm pack service-injector
tar -xzf service-injector-*.tgz
# Find the file at: package/dist/index.iife.js
```

### Option 2: Build from Source

```bash
git clone https://github.com/OrienteerBAP/service-injector.git
cd service-injector
npm install
npm run build
# Find the file at: dist/index.iife.js
```

### Host the File

Upload `index.iife.js` to your server, then use it:

```html
<script id="service-injector" 
        src="https://your-server.com/path/to/index.iife.js">
</script>
```

---

## Verification

After installation, verify it's working:

1. **Visual check:** Look for the floating tab on your page (default: bottom edge, 80% from left)

2. **Console check:** Open browser DevTools and run:
   ```javascript
   // Script tag installation
   typeof siToggleWindow === 'function'  // Should be true
   
   // npm installation
   injector.isOpen()  // Should be false initially
   ```

3. **Click the tab:** The window should expand with an animation

---

## Troubleshooting

### Tab doesn't appear

- Ensure the script tag has `id="service-injector"`
- Check browser console for errors
- Verify the script URL is accessible

### Window shows blank iframe

- Check that your SaaS URL allows embedding (no `X-Frame-Options: DENY`)
- Verify the URL is correct and accessible

### Styling conflicts

- service-injector uses high z-index values (99997-99999)
- Element IDs are prefixed with `si-` by default
- See [Customization](./customization.md) for styling options

---

## Next Steps

- [Configure options](./configuration.md) - Position, size, behavior
- [Customize appearance](./customization.md) - Templates, styles, themes
- [API Reference](./api.md) - Programmatic control
