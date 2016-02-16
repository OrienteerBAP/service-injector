!function() {
  /*Server side config*/
  var prefix = "si"; //Usefull to support several injections per page
  var tabTemplate = sp("<a onclick='%prefix%ToggleWindow()'>Click me!</a>");
  var windowTemplate = sp("<div id='%prefix%-header'>Header</div>"+
                          "<div id='%prefix%-body'>Body</div>"+
                          "<div id='%prefix%-footer'>Footer</div>");
  var injectorStyles = sp("#%prefix%-tab {background: white; border: 1px solid black; padding: 1em}"+
                          "#%prefix%-window {background: white; border: 1px solid black; padding: 1em}");

  var clientConfig = {
    p : "bottom",
    o : "80%",
    a : "expand",
    ww : "400px",
    wh : "300px",
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
    install : function() {

      var conf = clientConfig;

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

      if( typeof conf.wc != 'undefined') {
        winElm.style.left = ((screen.width - winElm.offsetWidth+conf.wc) / 2)+"px";
        winElm.style.display = 'none';
      }
      injector.exp();
    },
    exp : function () {
      window[sp("%prefix%ToggleWindow")] = injector.toggleWindow;
    },
    toggleWindow : function () {
      var winElm = document.getElementById(sp('%prefix%-window'));
      if(winElm.style.display == 'none') {
        winElm.style.display = 'block';
        if(clientConfig.ht) document.getElementById(sp('%prefix%-tab')).style.display = 'none';
      } else {
        winElm.style.display = 'none';
        document.getElementById(sp('%prefix%-tab')).style.display = 'block';
      }

    }
  };

  injector.install();
}();
