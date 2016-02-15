# service-injector
Small JavaScript library installing tab and floating window to show external service

## Use Case

* You are providing some SaaS in the Internet
* You want to allow your user to install some snippet on their sites to have floating tab on a side and open embedded floating window with your SaaS

### What you should do

* Get injector.js from this library
* Adjust it for you needs: at least specify SaaS URL which should be used
* Host modified JS on you SaaS
* Provide your users with information how to install


## Main Requirements

* Library should use pure javascript, because services derived from it can be installed on sites without JQuery support
* Window should load service through IFRAME
* Window should be resizable and dragable
* Library should allow to remember size and position on a site
* Mobile should be supported as well: by opening iframe in new window

## Configurations

### Client side

Set of parameters which can be populated from client side

| Parameter | Long Name | Desciption |
|-----------|-----------|------------|
| p | position | Position of a tab: left, right, top, botton |
| o | offset | Offset of a tab position. Can be in % or px |
| a  | animation | Type of animation to be used |
| ww | window width | Initial width of a window. Can be % or px | 
| wh | window height | Initial height of a window. Can be % or px |
| wt | window top | Inital top position |
| wb | window bottom | Inital bottom window position |
| wl | window left | Initial left window position |
| wc | window center | Intial center position of a window |
| wr | window right | Initial right window position |
| d | draggable | Is window draggable |
| r | resizable | Is window resizable |

### Service side

Set of parameters to be configured in script themself for proper working and adjustment with your SaaS

| Parameter | Desciption |
|-----------|------------|
| url | url to open within iframe |
| tabTemplate | Tab template to be used to display a tab |
| windowTemplate | Window template to be used to display a floating window: wrapper over your iframe |
