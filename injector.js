!function() {
  /*Server side config*/
  var prefix = "si"; //Usefull to support several injections per page
  var siScriptId = "service-injector"; //Id of SCRIPT element which has in src this script
  var saasUrl = "http://orienteer.org";
  var tabTemplate = sp("<a onclick='return %prefix%ToggleWindow();' href='%url%'>Click me!</a>");
  var windowTemplate = sp("<div id='%prefix%-inner'>"+
                          "<div id='%prefix%-header'><a href='#' onclick='return %prefix%ToggleWindow();' style='cursor:pointer'>X</a></div>"+
                          "<div id='%prefix%-body'><iframe id='%prefix%-iframe'></iframe></div>"+
                          "<div id='%prefix%-footer'><div id='%prefix%-resizer'></div></div>"+
                          "</div>");
  var injectorStyles = sp("#%prefix%-tab {background: white; border: 1px solid black; padding: 1em}"+
                          "#%prefix%-window {background: white; border: 1px solid black; min-width: 300px; min-height: 200px}"+
                          "#%prefix%-inner {height: 100%; width: 100%; position: relative}"+
                          "#%prefix%-header {height:1.5em; background: #aaa; text-align: right; padding: 0 .5em;cursor:move}"+
                          "#%prefix%-body {border: 1px solid #aaa; bottom: 0}"+
                          "#%prefix%-iframe {border: 0}"+
                          "#%prefix%-footer {position: absolute; bottom: 0; left:0; right:0}"+
                          "#%prefix%-resizer {width: 10px; height: 10px; float:right; position: relative; right: -2px; bottom: -2px; border-right: 3px solid black; border-bottom: 3px solid black; cursor: se-resize}"+
                          "#%prefix%-shadow {background: grey; z-index: 99999}");


  var clientConfig = {
    p : "bottom",
    o : "80%",
    a : 300,
    ww : "440px",
    wh : "550px",
    wt : "100px",
    wb : null,
    wl : null,
    wc : 0,
    wr : null,
    d : true,
    r : true,
    ht : false
  };

/*Dictionary object to identify orientation for offset*/
  var offsetOrientation = {
    top: "left",
    bottom: "left",
    left: "top",
    right: "top"
  }
/*Dictionary of mapping extended name to configuration*/
  var configMapping = {
    'position' : 'p',
		'offset' : 'o',
		'animation' : 'a',
		'window-width' : 'ww',
		'window-height' : 'wh',
		'window-top' : 'wt',
		'window-bottom' : 'wb',
		'window-left' : 'wl',
		'window-center' : 'wc',
		'window-right' : 'wr',
		'draggable' : 'd',
		'resizable' : 'r',
		'hide-tab' : 'ht',
  }

  /*Substitute prefix*/
  function sp(str) {
    return str.replace(/%prefix%/g, prefix).replace(/%url%/g, saasUrl);
  }

  var injector = {
    state : {
      win: null,
      winPosition: {
        top: 0,
        left: 0,
        width: 0,
        height: 0
      },
      tab: null,
      tabPosition : {
        top: 0,
        left: 0,
        width: 0,
        height: 0
      },
      shadow: null,
      shadowPosition : {
        top: 0,
        left: 0,
        width: 0,
        height: 0
      },
      iframe: null,
      inited: false,
      dragState: {
        x: 0,
        y: 0,
        top: 0,
        left: 0
      },
      mobile: null,
      drag: false,
      resize: false
    },
    conf : clientConfig,
    parseValue : function (val) {
      if(/^(\-|\+)?([0-9]+|Infinity)$/.test(val)) return Number(val);
      else if(val === 'true') return true;
      else if(val === 'false') return false;
      else return val;
    },
    install : function() {

      var conf = injector.conf;
      //Load configuration from script
      var script = document.getElementById(siScriptId);
      if(script) {
        var src = script.getAttribute('src');
        if(src) {
          var indx = src.indexOf('?');
          if(indx>0) {
            var args = src.substring(indx+1).split('&');
            for(var i=0; i<args.length; i++) {
              var kvp = args[i].split('=');
              var key = kvp[0];
              var value = kvp[1];
              if(conf[key]) conf[key] = injector.parseValue(value);
            }
          }
        }
        if(script.dataset) {
          for(id in script.dataset) {
            if(configMapping[id]) {
              var key = configMapping[id];
              var value = script.dataset[id];
              if(conf[key]) conf[key] = injector.parseValue(value);
            }
          }
        }
      }

      var styleElm = document.createElement("style");
      styleElm.innerHTML = injectorStyles;
      document.getElementsByTagName('head')[0].appendChild(styleElm);

      var shadowElm = document.createElement('div');
      shadowElm.setAttribute("id", sp("%prefix%-shadow"));
      shadowElm.style.position = 'fixed';
      shadowElm.style.display = 'none';
      shadowElm.style['z-index'] = 99997;
      document.body.appendChild(shadowElm);
      injector.state.shadow = shadowElm;

      var tabElm = document.createElement('div');
      tabElm.setAttribute("id", sp("%prefix%-tab"));
      tabElm.innerHTML = tabTemplate;
      tabElm.style.position = 'fixed';
      tabElm.style[conf.p] = '0px';
      tabElm.style[offsetOrientation[conf.p]] = conf.o;
      tabElm.style['z-index'] = 99998;
      document.body.appendChild(tabElm);
      injector.state.tab = tabElm;

      var winElm = document.createElement('div');
      winElm.setAttribute("id", sp("%prefix%-window"));
      winElm.innerHTML = windowTemplate;
      winElm.style.position = 'fixed';

      winElm.style.top = "100px";
      // if( typeof conf.wc == 'undefined') winElm.style.display = 'none';
      if(conf.ww) winElm.style.width = conf.ww;
      if(conf.wh) winElm.style.height = conf.wh;
      if(conf.wt) winElm.style.top = conf.wt;
      if(conf.wb) winElm.style.bottom = conf.wb;
      if(conf.wl) winElm.style.left = conf.wl;
      if(conf.wr) winElm.style.right = conf.wr;
      winElm.style['z-index'] = 99999;
      document.body.appendChild(winElm);
      injector.state.win = winElm;
      if( typeof conf.wc != 'undefined') {
        winElm.style.left = ((screen.width - winElm.offsetWidth+conf.wc) / 2)+"px";
      }
      injector.savePositions();
      winElm.style.display = 'none';
      if(conf.d || conf.r) injector.initDragAndResize();
      injector.exp();

      injector.state.iframe = document.getElementById(sp("%prefix%-iframe"));

      var preventParentScrolling = function(e) {
        if(e.target === injector.state.iframe) {
          e.preventDefault();
        }
      }
      // IE9, Chrome, Safari, Opera
      document.addEventListener("mousewheel", preventParentScrolling, false);
    	// Firefox
    	document.addEventListener("DOMMouseScroll", preventParentScrolling, false);

      var userAgent = navigator.userAgent||navigator.vendor||window.opera;
      injector.state.mobile = /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(userAgent)
      ||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(userAgent.substr(0,4));
    },
    extractPoint : function(e) {
      if(e.changedTouches) {
        var p = e.changedTouches[0];
        return {x:p.clientX, y:p.clientY};
      } else {
        return document.all ? {x:window.event.clientX, y:window.event.clientY}
                            : {x:e.pageX, y:e.pageY};
      }
    },
    initDragAndResize : function () {
      var conf = injector.conf;
      var drag = injector.state.dragState;
      if(conf.d) {
        var header = document.getElementById(sp("%prefix%-header"));
        if(header) {
          var dragStartHandler = function(e){
                            injector.state.drag = true;
                            var p = injector.extractPoint(e);
                            drag.x = p.x;
                            drag.y = p.y;
                            drag.left = drag.x - injector.state.win.offsetLeft;
                            drag.top = drag.y - injector.state.win.offsetTop;
                            e.stopPropagation();
                            e.preventDefault();
                          };
          header.addEventListener("mousedown", dragStartHandler);
          header.addEventListener("touchstart", dragStartHandler);
        }
      }
      if(conf.r) {
        var resizer = document.getElementById(sp("%prefix%-resizer"));
        if(resizer) {
          var resizeStartHandler = function(e){
                            injector.state.resize = true;
                            var p = injector.extractPoint(e);
                            drag.x = p.x;
                            drag.y = p.y;
                            drag.left = drag.x - injector.state.win.offsetLeft;
                            drag.top = drag.y - injector.state.win.offsetTop;
                            drag.width = drag.x - injector.state.win.offsetWidth;
                            drag.height = drag.y - injector.state.win.offsetHeight;
                            e.stopPropagation();
                            e.preventDefault();
                          };
          resizer.addEventListener("mousedown", resizeStartHandler);
          resizer.addEventListener("touchstart", resizeStartHandler);
        }
      }
      var moveHandler = function(e){
            if(injector.state.drag || injector.state.resize) {
              var p = injector.extractPoint(e);
              drag.x = p.x;
              drag.y = p.y;
              if(injector.state.drag) {
                injector.state.winPosition.left = drag.x - drag.left;
                injector.state.winPosition.top = drag.y - drag.top;
                injector.restorePosition(injector.state.win, injector.state.winPosition);
              }
              if(injector.state.resize) {
                injector.state.winPosition.width = drag.x - drag.width;
                injector.state.winPosition.height = drag.y - drag.height;
                injector.restorePosition(injector.state.win, injector.state.winPosition);
                injector.adjustSizes();
              }
              e.stopPropagation();
              e.preventDefault();
            }
          };
      window.addEventListener("mousemove", moveHandler);
      window.addEventListener("touchmove", moveHandler);
      var stopHandler = function(e) {
        if(injector.state.drag || injector.state.resize) {
          injector.state.drag = false;
          injector.state.resize = false;
          injector.savePositions();
          e.stopPropagation();
          e.preventDefault();
        }
      };
      window.addEventListener("mouseup", stopHandler);
      window.addEventListener("touchend", stopHandler);
      window.addEventListener("touchcancel", stopHandler);
    },
    exp : function () {
      window[sp("%prefix%ToggleWindow")] = injector.toggleWindow;
    },
    adjustSizes : function (){
      var win = injector.state.win;
      var header = document.getElementById(sp("%prefix%-header"));
      var body = document.getElementById(sp("%prefix%-body"));
      var iframe = document.getElementById(sp("%prefix%-iframe"));
      body.style.height = (win.offsetHeight - header.offsetHeight-4)+"px";
      iframe.style.height = (win.offsetHeight - header.offsetHeight-15)+"px";
      iframe.style.width = (win.offsetWidth-3)+"px";
    },
    animate : function(opts) {
      if(opts.duration > 0) {
        if(opts.onStart) opts.onStart();
        var start = new Date();
        var id = setInterval(function() {
          var timePassed = new Date - start;
          var progress = timePassed / (opts.duration || 1000);
          if (progress > 1) progress = 1;
          var delta = (opts.delta || function(p) {return p;})(progress);
          opts.step(delta);
          if (progress == 1) {
            clearInterval(id);
            if(opts.onFinish) opts.onFinish();
          }
        }, opts.delay || 10);
      } else {
        if(opts.onStart) opts.onStart();
        if(opts.onFinish) opts.onFinish();
      }
    },
    shadowStep : function(delta) {
      var state = injector.state;
      var wp = state.winPosition;
      var tp = state.tabPosition;
      var sp = state.shadowPosition;
      sp.left = (wp.left-tp.left)*delta + tp.left;
      sp.top = (wp.top-tp.top)*delta + tp.top;
      sp.width = (wp.width-tp.width)*delta + tp.width;
      sp.height = (wp.height-tp.height)*delta + tp.height;
      var s = state.shadow;
      s.style.left = sp.left+"px";
      s.style.top = sp.top+"px";
      s.style.width = sp.width+"px";
      s.style.height = sp.height+"px";
      if(s.style.display!='block') s.style.display = 'block';
    },
    initIframe : function () {
      injector.state.iframe.src = saasUrl;
      injector.state.inited = true;
    },
    restorePosition : function (elm, pos) {
      if(pos.left < 0 ) pos.left = 0;
      if(pos.top < 0 ) pos.top = 0;
      if(pos.left + pos.width > screen.availWidth) {
        pos.left = screen.availWidth - pos.width;
      }
      if(pos.top + pos.height > screen.availHeight) {
        pos.top = screen.availHeight - pos.height;
      }
      elm.style.left = pos.left + "px";
      elm.style.top = pos.top + "px";
      elm.style.width = pos.width + "px";
      elm.style.height = pos.height + "px";
    },
    savePosition : function (elm, pos) {
      pos.left = elm.offsetLeft;
      pos.top = elm.offsetTop;
      pos.width = elm.offsetWidth;
      pos.height = elm.offsetHeight;
    },
    savePositions : function () {
      if(injector.state.win.style.display!='none')injector.savePosition(injector.state.win, injector.state.winPosition);
      if(injector.state.tab.style.display!='none')injector.savePosition(injector.state.tab, injector.state.tabPosition);
    },
    needOpenWide : function () {
      return injector.state.mobile;
    },
    expandWindow : function () {
      if(injector.needOpenWide()) return true;
      injector.animate({
        duration: injector.conf.a,
        step: injector.shadowStep,
        onStart: function() {
          injector.savePositions();
          if(injector.conf.ht) injector.state.tab.style.display = 'none';
        },
        onFinish : function() {
          if(!injector.state.inited) {
            injector.initIframe();
          }
          injector.state.shadow.style.display='none';
          injector.state.win.style.display = 'block';
          injector.adjustSizes();
          injector.savePositions();
        }
      });
      return false;
    },
    collapseWindow : function () {
      injector.animate({
        duration: injector.conf.a,
        step: injector.shadowStep,
        delta: function(p) {return 1-p},
        onStart: function() {
          injector.savePositions();
          injector.state.win.style.display = 'none';
        },
        onFinish : function() {
          injector.state.shadow.style.display='none';
          injector.state.tab.style.display = 'block';
          injector.savePositions();
        }
      });
      return false;
    },
    toggleWindow : function () {
      if(injector.state.win.style.display == 'none') {
        return injector.expandWindow();
      } else {
        return injector.collapseWindow();
      }
    }
  };

  injector.install();
}();
