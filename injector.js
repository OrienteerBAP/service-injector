!function() {
  /*Server side config*/
  var prefix = "si"; //Usefull to support several injections per page
  var siScriptId = "service-injector"; //Id of SCRIPT element which has in src this script
  var tabTemplate = sp("<a onclick='%prefix%ToggleWindow(); return false;' href='#'>Click me!</a>");
  var windowTemplate = sp("<div id='%prefix%-inner'>"+
                          "<div id='%prefix%-header'><a href='#' onclick='%prefix%ToggleWindow(); return false;' style='cursor:pointer'>X</a></div>"+
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
                          "#%prefix%-resizer {width: 10px; height: 10px; float:right; position: relative; right: -2px; bottom: -2px; border-right: 3px solid black; border-bottom: 3px solid black; cursor: se-resize}");
  var saasUrl = "http://orienteer.org";

  var clientConfig = {
    p : "bottom",
    o : "80%",
    a : "expand",
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

  /*Substitute prefix*/
  function sp(str) {
    return str.replace(/%prefix%/g, prefix);
  }

  var injector = {
    state : {
      win: null,
      inited: false,
      top: 0,
      left: 0,
      width: 0,
      height: 0,
      x: 0,
      y: 0,
      drag: false,
      resize: false
    },
    conf : clientConfig,
    install : function() {

      var conf = injector.conf;

      var styleElm = document.createElement("style");
      styleElm.innerHTML = injectorStyles;
      document.getElementsByTagName('head')[0].appendChild(styleElm);

      var tabElm = document.createElement('div');
      tabElm.setAttribute("id", sp("%prefix%-tab"));
      tabElm.innerHTML = tabTemplate;
      tabElm.style.position = 'fixed';
      tabElm.style[conf.p] = '0px';
      tabElm.style[offsetOrientation[conf.p]] = '80%';
      document.body.appendChild(tabElm);

      var winElm = document.createElement('div');
      winElm.setAttribute("id", sp("%prefix%-window"));
      winElm.innerHTML = windowTemplate;
      winElm.style.position = 'fixed';

      winElm.style.top = "100px";
      if( typeof conf.wc == 'undefined') winElm.style.display = 'none';
      if(conf.ww) winElm.style.width = conf.ww;
      if(conf.wh) winElm.style.height = conf.wh;
      if(conf.wt) winElm.style.top = conf.wt;
      if(conf.wb) winElm.style.bottom = conf.wb;
      if(conf.wl) winElm.style.left = conf.wl;
      if(conf.wr) winElm.style.right = conf.wr;
      document.body.appendChild(winElm);
      injector.state.win = winElm;

      if( typeof conf.wc != 'undefined') {
        winElm.style.left = ((screen.width - winElm.offsetWidth+conf.wc) / 2)+"px";
        winElm.style.display = 'none';
      }
      if(conf.d || conf.r) injector.initDragAndResize();
      injector.exp();
    },
    initDragAndResize : function () {
      var conf = injector.conf;
      var drag = injector.state;
      if(conf.d) {
        var header = document.getElementById(sp("%prefix%-header"));
        if(header) {
          header.addEventListener("mousedown", function(e){
            drag.drag = true;
            drag.x = document.all ? window.event.clientX : e.pageX;
            drag.y = document.all ? window.event.clientY : e.pageY;
            drag.left = drag.x - drag.win.offsetLeft;
            drag.top = drag.y - drag.win.offsetTop;
            e.stopPropagation();
          });
        }
      }
      if(conf.r) {
        var resizer = document.getElementById(sp("%prefix%-resizer"));
        if(resizer) {
          resizer.addEventListener("mousedown", function(e){
            drag.resize = true;
            drag.x = document.all ? window.event.clientX : e.pageX;
            drag.y = document.all ? window.event.clientY : e.pageY;
            drag.left = drag.x - drag.win.offsetLeft;
            drag.top = drag.y - drag.win.offsetTop;
            drag.width = drag.x - drag.win.offsetWidth;
            drag.height = drag.y - drag.win.offsetHeight;
            e.stopPropagation();
          });
        }
      }
      document.addEventListener("mousemove", function(e){
        if(drag.drag) {
          drag.x = document.all ? window.event.clientX : e.pageX;
          drag.y = document.all ? window.event.clientY : e.pageY;
          drag.win.style.left = (drag.x - drag.left)+"px";
          drag.win.style.top = (drag.y - drag.top)+"px";
        }
        if(drag.resize) {
          drag.x = document.all ? window.event.clientX : e.pageX;
          drag.y = document.all ? window.event.clientY : e.pageY;
          drag.win.style.width = (drag.x - drag.width)+"px";
          drag.win.style.height = (drag.y - drag.height)+"px";
          injector.adjustSizes();
        }
      });
      document.addEventListener("mouseup", function(e) {
        drag.drag = false;
        drag.resize = false;
      });
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
    initIframe : function () {
      var iframe = document.getElementById(sp("%prefix%-iframe"));
      iframe.src = saasUrl;
      injector.state.inited = true;
    },
    toggleWindow : function () {
      var winElm = injector.state.win;
      if(winElm.style.display == 'none') {
        winElm.style.display = 'block';
        if(clientConfig.ht) document.getElementById(sp('%prefix%-tab')).style.display = 'none';
        injector.adjustSizes();
        if(!injector.state.inited) {
          injector.initIframe();
        }
      } else {
        winElm.style.display = 'none';
        document.getElementById(sp('%prefix%-tab')).style.display = 'block';
      }
      return false;
    }
  };

  injector.install();
}();
