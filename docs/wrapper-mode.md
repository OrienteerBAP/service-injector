# Wrapper Mode

Wrapper Mode is an alternative operating mode that reverses the typical embedding relationship. Instead of being injected into a foreign page, your page becomes the host, embedding external content in a fullscreen iframe while your floating window overlays on top.

## Overview

### Standard Mode (Default)
In standard mode, the library is loaded on a foreign website:

```
Foreign Website (host)
  |
  +-- service-injector library
        |
        +-- Floating tab/window
              |
              +-- Your SaaS content (iframe)
```

### Wrapper Mode
In wrapper mode, your page hosts the library and wraps foreign content:

```
Your Page (host)
  |
  +-- service-injector library
        |
        +-- Main fullscreen iframe (foreign content)
        |
        +-- Floating tab/window (your content, overlay)
```

## Visual Comparison

**Standard Mode:**
```
+--------------------------------------+
| Foreign Page (parent)                |
|                                      |
|   +---------------------+            |
|   | Floating Window     | <- YOUR    |
|   | (iframe with YOUR   |    content |
|   |  SaaS content)      |            |
|   +---------------------+            |
|                         [Tab]        |
+--------------------------------------+
```

**Wrapper Mode:**
```
+--------------------------------------+
| YOUR Page (parent)                   |
| +----------------------------------+ |
| | Main iframe (fullscreen)         | |
| | <- Foreign content               | |
| |                                  | |
| |   +---------------------+        | |
| |   | Floating Window     | <- YOUR| |
| |   | (YOUR content)      |  content |
| |   +---------------------+        | |
| |                        [Tab]     | |
| +----------------------------------+ |
+--------------------------------------+
```

## When to Use Wrapper Mode

Wrapper Mode is ideal when you need:

1. **Refresh Control**: Refresh the main content without losing your floating window state (chat history, form data, etc.)

2. **Navigation Control**: Navigate the main content programmatically while maintaining your overlay

3. **Persistent State**: Keep your widget state intact regardless of what happens to the main content

4. **Branding Wrapper**: Wrap third-party content in your own branded experience

5. **Cross-Origin Control**: More control over the browsing experience when embedding external sites

## Configuration

### Programmatic Usage

```javascript
const injector = new ServiceInjector({
  wrapperMode: true,
  wrapperUrl: 'https://example.com/external-page',
  url: '/your-widget-content',
  position: 'right',
  windowWidth: '400px',
  windowHeight: '350px'
});
injector.install();
```

### Script Tag with Data Attributes

```html
<script 
  id="service-injector" 
  src="path/to/service-injector.iife.js"
  data-wrapper-mode="true"
  data-wrapper-url="https://example.com/external-page"
  data-url="/your-widget-content"
  data-position="right"
  data-window-width="400px"
  data-window-height="350px"
></script>
```

### Script Tag with Query Parameters

```html
<script 
  id="service-injector" 
  src="path/to/service-injector.iife.js?wm=true&wu=https://example.com&url=/widget"
></script>
```

## Configuration Options

| Option | Data Attribute | Query Param | Type | Description |
|--------|----------------|-------------|------|-------------|
| `wrapperMode` | `data-wrapper-mode` | `wm` | `boolean` | Enable wrapper mode |
| `wrapperUrl` | `data-wrapper-url` | `wu` | `string` | URL for the main fullscreen iframe |

All other configuration options (position, size, draggable, etc.) work the same as in standard mode.

## API Methods

Wrapper mode adds these methods to control the main iframe:

### `isWrapperMode()`

Check if the injector is running in wrapper mode.

```javascript
if (injector.isWrapperMode()) {
  console.log('Running in wrapper mode');
}
```

### `getMainIframe()`

Get a reference to the main iframe element.

```javascript
const mainIframe = injector.getMainIframe();
if (mainIframe) {
  console.log('Current URL:', mainIframe.src);
}
```

### `refreshMain()`

Refresh the main iframe content without affecting the floating window.

```javascript
injector.refreshMain();
```

### `navigateMain(url)`

Navigate the main iframe to a new URL.

```javascript
injector.navigateMain('https://example.com/another-page');
```

## Global Functions

When using the IIFE bundle, these global functions are exposed (with default `si` prefix):

```javascript
siIsWrapperMode()           // Check if in wrapper mode
siRefreshMain()             // Refresh main iframe
siNavigateMain(url)         // Navigate main iframe
siToggleWindow()            // Toggle floating window (standard)
```

## Example: Wikipedia with Map Overlay

This example shows Wikipedia as the main content with an OpenStreetMap widget overlay:

```html
<!DOCTYPE html>
<html>
<head>
  <title>My Wrapper App</title>
</head>
<body>
  <!-- Control buttons -->
  <div style="position: fixed; top: 10px; left: 10px; z-index: 100000;">
    <button onclick="siToggleWindow()">Toggle Map</button>
    <button onclick="siRefreshMain()">Refresh Wikipedia</button>
    <button onclick="siNavigateMain('https://en.wikipedia.org/wiki/Map')">
      Go to Map Article
    </button>
  </div>

  <!-- Service Injector -->
  <script 
    id="service-injector" 
    src="service-injector.iife.js"
    data-wrapper-mode="true"
    data-wrapper-url="https://en.wikipedia.org/wiki/OpenStreetMap"
    data-url="https://www.openstreetmap.org/export/embed.html"
    data-position="right"
    data-window-width="400px"
    data-window-height="350px"
  ></script>
</body>
</html>
```

## DOM Structure

In wrapper mode, the DOM structure includes an additional main container:

```html
<body>
  <div id="si-service-injector">
    <!-- Main content iframe (wrapper mode only) -->
    <div id="si-main-container">
      <iframe id="si-main-iframe" src="..."></iframe>
    </div>
    
    <!-- Standard floating elements -->
    <div id="si-shadow">...</div>
    <div id="si-dock-preview">...</div>
    <div id="si-tab">...</div>
    <div id="si-window">...</div>
  </div>
</body>
```

## Styling

The main container uses these default styles:

```css
#si-main-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
}

#si-main-iframe {
  width: 100%;
  height: 100%;
  border: none;
}
```

You can customize these styles using the standard customization methods (see [Customization](./customization.md)).

## Limitations

1. **Cross-Origin Restrictions**: The main iframe is subject to standard browser cross-origin policies. You cannot directly access the iframe's DOM if it's from a different origin.

2. **X-Frame-Options**: Some websites block being embedded in iframes. The main content URL must allow iframe embedding.

3. **Body Content**: In wrapper mode, the library assumes your page body is mostly empty or that you control the existing content. It does not automatically hide existing body content.

4. **Mobile Behavior**: On mobile devices, the floating window opens in a new browser tab (same as standard mode), but the main iframe wrapper still functions.

## Best Practices

1. **Keep your page minimal**: Since wrapper mode creates a fullscreen iframe, your host page should have minimal content outside of the control elements.

2. **Use fixed positioning for controls**: Any control buttons or UI should use `position: fixed` with a high `z-index` to stay above the main iframe.

3. **Handle loading states**: Consider showing a loading indicator while the main iframe loads.

4. **Test cross-origin scenarios**: Make sure the external content you want to embed allows iframe embedding.
