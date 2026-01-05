# service-injector
Lightweight JavaScript library for SaaS providers to allow its services installation on clients' sites.

## Use Case

* You provide SaaS in the Internet.
* You want to allow your users to install a snippet on their sites as floating tab on the side with the ability to display and use your SaaS.

### What you should do

* Get [injector.js](https://raw.githubusercontent.com/OrienteerDW/service-injector/gh-pages/injector.js) from [our GitHub repository](https://github.com/OrienteerDW/service-injector)
* Adjust it for your needs:
  * URL of your SaaS
  * Window style and design
  * Window behavior
* Host modified JS file on you SaaS
* Provide your users with enough information of how to install your service on their sites.


## Main Requirements

* Library should use pure JavaScript, because services derived from it can be installed on sites without JQuery (and other cool JS libraries)
* Window should load service through IFRAME
* Window should be resizable and dragable
* Library should allow to remember size and position on a site
* Mobile devices should be supported as well by opening SaaS in the new window

## Configurations

### Client side

Set of parameters which can be populated from client side

| Parameter | Long Name | Desciption |
|-----------|-----------|------------|
| p | position | Position of a tab: left, right, top, botton |
| o | offset | Offset of a tab position. Can be in % or px |
| a | animation | Type of animation to be used |
| ww | window-width | Initial width of a window. Can be % or px |
| wh | window-height | Initial height of a window. Can be % or px |
| wt | window-top | Inital top position |
| wb | window-bottom | Inital bottom window position |
| wl | window-left | Initial left window position |
| wc | window-center | Intial center position of a window |
| wr | window-right | Initial right window position |
| d | draggable | Is window draggable |
| r | resizable | Is window resizable |
| ht | hide-tab | Hide tab when window is shown |

Parameters can be populated by the following ways:

1. Query string parameters:
```
<script id='service-injector' src='http://yoursite.com/injector.js?p=right&o=100px'>
</script>
```

2. Data attributes:
```
<script id='service-injector' src='http://yoursite.com/injector.js' data-position='left' data-offset='100px'>
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
