# Dockable Windows

## What is Docking?

Docking lets users snap the popup window to any edge of the screen, creating a sidebar-like experience. When docked, the page content is pushed aside to make room for the window.

```
Before docking:                    After docking to right:

┌─────────────────────────┐       ┌───────────────────┬─────┐
│                         │       │                   │     │
│     Page Content        │       │   Page Content    │ Your│
│                         │  -->  │   (pushed left)   │ App │
│          ┌──────┐       │       │                   │     │
│          │ Your │       │       │                   │     │
│          │ App  │       │       │                   │     │
│          └──────┘       │       │                   │     │
└─────────────────────────┘       └───────────────────┴─────┘
```

This is similar to how browser DevTools work when docked to the side.

---

## Use Cases

### "I want a sidebar experience like browser DevTools"

```javascript
new ServiceInjector({
  saasUrl: 'https://my-saas.com',
  dockable: true
});
```

### "I only want left/right docking, not top/bottom"

```javascript
new ServiceInjector({
  saasUrl: 'https://my-saas.com',
  dockable: ['left', 'right']
});
```

### "I want to programmatically dock on page load"

```javascript
const injector = new ServiceInjector({
  saasUrl: 'https://my-saas.com',
  dockable: true
});

injector.install();
injector.expand();      // Open the window first
injector.dock('right'); // Then dock it
```

---

## Enabling Docking

### Script Tag

```html
<!-- Enable all sides -->
<script id="service-injector" src="...?dk=true"></script>

<!-- Using data attribute -->
<script id="service-injector" src="..." data-dockable="true"></script>
```

### Programmatic

```javascript
// Enable all sides
new ServiceInjector({ dockable: true });

// Enable specific sides only
new ServiceInjector({ dockable: ['left', 'right'] });
new ServiceInjector({ dockable: ['top', 'bottom'] });
new ServiceInjector({ dockable: ['right'] }); // Right side only
```

---

## How It Works

### Docking a Window

1. **Drag the window** by its header toward any screen edge
2. **When the window's edge** gets close to the viewport edge (within 20 pixels), a **dock preview** appears showing where the window will dock
3. **Release** - the window snaps to that edge

When docked:
- Window expands to fill the full height (left/right) or width (top/bottom)
- Page content (`document.body`) receives a margin to make room
- The transition is animated (uses your `animation` duration setting)

### Collapsing a Docked Window

When you close (collapse) a docked window:
- The window hides and the tab reappears
- Body margins are temporarily restored (page content returns to normal)
- **The docked state is preserved** - when you expand the window again, it returns to its docked position with body margins re-applied

### Undocking a Window

Two ways to undock:

1. **Double-click the header** - Window returns to its pre-dock position
2. **Drag the header away** (more than 5 pixels) - Window becomes floating again, follows your cursor

**Note:** Simple clicks on the header won't undock - you must actually drag to prevent accidental undocking.

### Resizing When Docked

When docked, the window can only be resized in one direction:

| Docked To | Resize Direction | Cursor |
|-----------|------------------|--------|
| Left | Right edge only | `e-resize` |
| Right | Left edge only | `w-resize` |
| Top | Bottom edge only | `s-resize` |
| Bottom | Top edge only | `n-resize` |

Resizing also updates the page content margin in real-time.

---

## Constraints

Docking is automatically disabled in these situations:

| Condition | Reason |
|-----------|--------|
| Mobile devices | Touch UX is better with floating windows |
| Screen width < 768px | Not enough room for docked sidebar |
| `draggable: false` | Docking requires dragging |

---

## Programmatic Control

### Methods

```javascript
const injector = new ServiceInjector({ dockable: true });
injector.install();

// Dock to a specific side
injector.dock('left');   // Dock to left edge
injector.dock('right');  // Dock to right edge
injector.dock('top');    // Dock to top edge
injector.dock('bottom'); // Dock to bottom edge

// Undock (restore to floating)
injector.undock();

// Check dock state
const side = injector.isDocked();
// Returns: 'left' | 'right' | 'top' | 'bottom' | null
```

### Global Functions (Script Tag)

```javascript
// Dock to right side
siDock('right');

// Undock
siUndock();

// With custom prefix
myDock('left');
myUndock();
```

---

## Technical Details

### Dock Threshold

The dock zone is **20 pixels** from each screen edge. Docking triggers when the **window's edge** (not the cursor) enters this zone during drag. A visual preview (semi-transparent overlay with dashed border) shows where the window will dock.

### Undock Threshold

To prevent accidental undocking, you must drag at least **5 pixels** before a docked window will undock. Simple clicks on the header won't trigger undocking.

### Body Margin

When docked, service-injector adds a margin to `document.body`:

```javascript
// Docked to right with 440px width
document.body.style.marginRight = '440px';
document.body.style.transition = 'margin 300ms ease-in-out';
```

Original margins are saved and restored when undocking.

### Z-Index

Docked windows maintain their high z-index (99999) to stay above page content.

### Minimum Screen Width

Docking is disabled when `window.innerWidth < 768`. This prevents docking from taking up too much space on smaller screens (tablets in portrait mode, etc.).

---

## Examples

### Dockable Help Panel

```html
<script>
  window.serviceInjectorConfig = {
    tabTemplate: "<a onclick='return siToggleWindow();'>Help</a>",
    styles: `
      #si-tab {
        background: #0066cc;
        color: white;
        border: none;
        padding: 12px 16px;
        border-radius: 8px;
      }
      #si-window {
        border-left: 3px solid #0066cc;
      }
    `
  };
</script>
<script id="service-injector" 
        src="https://unpkg.com/service-injector/dist/index.iife.js"
        data-url="https://help.example.com"
        data-position="right"
        data-dockable="true"
        data-window-width="400px">
</script>
```

### Auto-dock on Open

```javascript
import { ServiceInjector } from 'service-injector';

const injector = new ServiceInjector({
  saasUrl: 'https://app.example.com',
  position: 'right',
  dockable: ['right'],
  windowWidth: '450px'
});

injector.install();

// Override toggle to auto-dock
const originalToggle = injector.toggle.bind(injector);
injector.toggle = function() {
  const result = originalToggle();
  if (injector.isOpen() && !injector.isDocked()) {
    setTimeout(() => injector.dock('right'), 350); // After animation
  }
  return result;
};
```

### Dock State Indicator

```javascript
const injector = new ServiceInjector({
  saasUrl: 'https://app.example.com',
  dockable: true
});

injector.install();

// Check dock state periodically or on user action
function updateUI() {
  const docked = injector.isDocked();
  if (docked) {
    console.log(`Window is docked to ${docked}`);
  } else {
    console.log('Window is floating');
  }
}
```

---

## Troubleshooting

### Window doesn't dock

- Ensure `dockable` is enabled
- Ensure `draggable` is `true` (default)
- Check screen width is >= 768px
- Ensure you're not on a mobile device

### Page content doesn't shift

- Check that your page layout respects body margins
- Some CSS frameworks reset body margins - this may conflict

### Dock zone feels too small/large

The 20px threshold is currently not configurable. This may be added in a future version.

---

## Next Steps

- [Configuration](./configuration.md) - All options
- [Customization](./customization.md) - Styling the docked window
- [API Reference](./api.md) - All methods
