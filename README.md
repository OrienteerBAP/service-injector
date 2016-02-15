# service-injector
Small JavaScript library installing tab and floating window to show external service

## Use Case

* You are providing some SaaS in the Internet
* You want to allow your user to install some snippet on their sites to have floating tab on a side and open embedded floating window with your SaaS

### What you should do

* Get install.js from this library
* Adjust it for you needs: at least specify SaaS URL which should be used
* Host modified JS on you SaaS
* Provide your users with information how to install


## Main Requirements

* Library should use pure javascript, because services derived from it can be installed on sites without JQuery support
* Window should load service through IFRAME
* Window should be resizable and dragable
* Library should allow to remember size and position on a site
