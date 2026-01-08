import type {
  ServiceInjectorOptions,
  InternalConfig,
  InjectorState,
  Position,
  GlobalConfig
} from './types';
import {
  DEFAULT_PREFIX,
  DEFAULT_SCRIPT_ID,
  DEFAULT_SAAS_URL,
  DEFAULT_CONFIG,
  CONFIG_MAPPING,
  OPTIONS_TO_CONFIG,
  OFFSET_ORIENTATION,
  DEFAULT_TAB_TEMPLATE,
  DEFAULT_WINDOW_TEMPLATE,
  DEFAULT_STYLES
} from './defaults';
import {
  substitutePrefix,
  parseValue,
  extractPoint,
  isMobileDevice,
  makeFunctionName,
  getElementById,
  createElement
} from './utils';
import { animate, reverseDelta } from './animation';

/**
 * ServiceInjector - Main class for embedding SaaS services on client websites.
 * 
 * @example
 * // Programmatic usage
 * const injector = new ServiceInjector({
 *   saasUrl: 'https://my-saas.com',
 *   position: 'right',
 *   draggable: true
 * });
 * injector.install();
 * 
 * @example
 * // Later cleanup
 * injector.destroy();
 */
export class ServiceInjector {
  private prefix: string;
  private saasUrl: string;
  private scriptId: string;
  private config: InternalConfig;
  private state: InjectorState;
  private tabTemplate: string;
  private windowTemplate: string;
  private styles: string;
  private installed = false;

  /**
   * Create a new ServiceInjector instance.
   * @param options - Configuration options
   */
  constructor(options: ServiceInjectorOptions = {}) {
    this.prefix = options.prefix ?? DEFAULT_PREFIX;
    this.saasUrl = options.saasUrl ?? DEFAULT_SAAS_URL;
    this.scriptId = options.scriptId ?? DEFAULT_SCRIPT_ID;

    // Initialize config with defaults
    this.config = { ...DEFAULT_CONFIG };

    // Apply options using readable names
    this.applyOptions(options);

    // Initialize templates (will be processed with sp() later)
    this.tabTemplate = options.tabTemplate ?? DEFAULT_TAB_TEMPLATE;
    this.windowTemplate = options.windowTemplate ?? DEFAULT_WINDOW_TEMPLATE;
    this.styles = DEFAULT_STYLES + (options.styles ?? '');

    // Initialize state
    this.state = this.createInitialState();
  }

  /**
   * Apply options from ServiceInjectorOptions to internal config.
   */
  private applyOptions(options: ServiceInjectorOptions): void {
    for (const [optKey, configKey] of Object.entries(OPTIONS_TO_CONFIG)) {
      const value = options[optKey as keyof ServiceInjectorOptions];
      if (value !== undefined) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (this.config as any)[configKey] = value;
      }
    }
  }

  /**
   * Create initial state object.
   */
  private createInitialState(): InjectorState {
    return {
      root: null,
      win: null,
      winPosition: { top: 0, left: 0, width: 0, height: 0 },
      tab: null,
      tabPosition: { top: 0, left: 0, width: 0, height: 0 },
      shadow: null,
      shadowPosition: { top: 0, left: 0, width: 0, height: 0 },
      iframe: null,
      inited: false,
      dragState: { x: 0, y: 0, top: 0, left: 0, width: 0, height: 0 },
      mobile: false,
      drag: false,
      resize: false,
      styleElement: null,
      handlers: {
        mousewheel: null,
        DOMMouseScroll: null,
        mousemove: null,
        mouseup: null,
        touchmove: null,
        touchend: null,
        touchcancel: null
      }
    };
  }

  /**
   * Substitute prefix and URL in template strings.
   */
  private sp(str: string): string {
    return substitutePrefix(str, this.prefix, this.config.url ?? this.saasUrl);
  }

  /**
   * Load custom templates from global config or DOM elements.
   */
  private loadCustomTemplates(): void {
    if (typeof window === 'undefined') return;

    const globalConfig: GlobalConfig = window.serviceInjectorConfig || {};

    // Tab template: check global config, then DOM element
    if (globalConfig.tabTemplate) {
      this.tabTemplate = globalConfig.tabTemplate;
    } else {
      const tabTemplateElm = getElementById(this.prefix + '-tab-template');
      if (tabTemplateElm) {
        this.tabTemplate = tabTemplateElm.innerHTML;
      }
    }

    // Window template: check global config, then DOM element
    if (globalConfig.windowTemplate) {
      this.windowTemplate = globalConfig.windowTemplate;
    } else {
      const windowTemplateElm = getElementById(this.prefix + '-window-template');
      if (windowTemplateElm) {
        this.windowTemplate = windowTemplateElm.innerHTML;
      }
    }

    // Custom styles: append from global config and/or DOM element
    if (globalConfig.styles) {
      this.styles += globalConfig.styles;
    }
    const customStylesElm = getElementById(this.prefix + '-custom-styles');
    if (customStylesElm) {
      this.styles += customStylesElm.innerHTML;
    }
  }

  /**
   * Load configuration from script element attributes.
   */
  private loadScriptConfig(): void {
    const script = getElementById(this.scriptId) as HTMLScriptElement | null;
    if (!script) return;

    const src = script.getAttribute('src');
    if (src) {
      const indx = src.indexOf('?');
      if (indx > 0) {
        const args = src.substring(indx + 1).split('&');
        for (const arg of args) {
          const kvp = arg.split('=');
          const key = kvp[0] as keyof InternalConfig;
          const value = kvp[1];
          if (key in this.config) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (this.config as any)[key] = parseValue(value);
          }
        }
      }
    }

    // Read data attributes
    if (script.dataset) {
      for (const [id, value] of Object.entries(script.dataset)) {
        const configKey = CONFIG_MAPPING[id];
        if (configKey && configKey in this.config && value !== undefined) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (this.config as any)[configKey] = parseValue(value);
        }
      }
    }
  }

  /**
   * Install the injector into the DOM.
   * @returns this instance for chaining
   */
  install(): this {
    if (this.installed) {
      console.warn('service-injector: Already installed');
      return this;
    }

    if (typeof document === 'undefined') {
      console.error('service-injector: DOM not available');
      return this;
    }

    // Load custom templates and script config
    this.loadCustomTemplates();
    this.loadScriptConfig();

    const conf = this.config;

    // Create and inject styles
    const styleElm = createElement('style');
    styleElm.innerHTML = this.sp(this.styles);
    document.getElementsByTagName('head')[0].appendChild(styleElm);
    this.state.styleElement = styleElm;

    // Create root element
    const rootElm = createElement('div', { id: this.sp('%prefix%-service-injector') });
    document.body.appendChild(rootElm);
    this.state.root = rootElm;

    // Create shadow element (for animation)
    const shadowElm = createElement('div', { id: this.sp('%prefix%-shadow') });
    shadowElm.style.position = 'fixed';
    shadowElm.style.display = 'none';
    shadowElm.style.zIndex = '99997';
    rootElm.appendChild(shadowElm);
    this.state.shadow = shadowElm;

    // Create tab element
    const tabElm = createElement('div', { id: this.sp('%prefix%-tab') });
    tabElm.innerHTML = this.sp(this.tabTemplate);
    tabElm.style.position = 'fixed';
    tabElm.style[conf.p as 'top' | 'bottom' | 'left' | 'right'] = '0px';
    tabElm.style[OFFSET_ORIENTATION[conf.p] as 'top' | 'left'] = conf.o;
    tabElm.style.zIndex = '99998';
    rootElm.appendChild(tabElm);
    this.state.tab = tabElm;

    // Create window element
    const winElm = createElement('div', { id: this.sp('%prefix%-window') });
    winElm.innerHTML = this.sp(this.windowTemplate);
    winElm.style.position = 'fixed';
    winElm.style.top = '100px';
    if (conf.ww) winElm.style.width = conf.ww;
    if (conf.wh) winElm.style.height = conf.wh;
    if (conf.wt) winElm.style.top = conf.wt;
    if (conf.wb) winElm.style.bottom = conf.wb;
    if (conf.wl) winElm.style.left = conf.wl;
    if (conf.wr) winElm.style.right = conf.wr;
    winElm.style.zIndex = '99999';
    rootElm.appendChild(winElm);
    this.state.win = winElm;

    // Center window if configured
    if (typeof conf.wc !== 'undefined' && conf.wc !== null) {
      winElm.style.left = ((window.innerWidth - winElm.offsetWidth + conf.wc) / 2) + 'px';
    }

    this.savePositions();
    winElm.style.display = 'none';

    // Initialize drag and resize if enabled
    if (conf.d || conf.r) {
      this.initDragAndResize();
    }

    // Expose global functions
    this.exposeGlobals();

    // Get iframe reference
    this.state.iframe = getElementById(this.sp('%prefix%-iframe')) as HTMLIFrameElement | null;

    // Setup scroll prevention
    this.setupScrollPrevention();

    // Detect mobile
    this.state.mobile = isMobileDevice();

    this.installed = true;
    return this;
  }

  /**
   * Setup scroll prevention when hovering over iframe.
   */
  private setupScrollPrevention(): void {
    const preventParentScrolling = (e: Event): void => {
      if (e.target === this.state.iframe) {
        e.preventDefault();
      }
    };

    this.state.handlers.mousewheel = preventParentScrolling as EventListener;
    this.state.handlers.DOMMouseScroll = preventParentScrolling as EventListener;

    document.addEventListener('mousewheel', preventParentScrolling, { passive: false });
    document.addEventListener('DOMMouseScroll', preventParentScrolling, { passive: false });
  }

  /**
   * Initialize drag and resize functionality.
   */
  private initDragAndResize(): void {
    const conf = this.config;
    const drag = this.state.dragState;

    if (conf.d) {
      const header = getElementById(this.sp('%prefix%-header'));
      if (header) {
        const dragStartHandler = (e: MouseEvent | TouchEvent): void => {
          this.state.drag = true;
          const p = extractPoint(e);
          drag.x = p.x;
          drag.y = p.y;
          drag.left = drag.x - (this.state.win?.offsetLeft ?? 0);
          drag.top = drag.y - (this.state.win?.offsetTop ?? 0);
          if (this.state.iframe) {
            this.state.iframe.style.pointerEvents = 'none';
          }
          e.stopPropagation();
          e.preventDefault();
        };
        header.addEventListener('mousedown', dragStartHandler as EventListener);
        header.addEventListener('touchstart', dragStartHandler as EventListener);
      }
    }

    if (conf.r) {
      const resizer = getElementById(this.sp('%prefix%-resizer'));
      if (resizer) {
        const resizeStartHandler = (e: MouseEvent | TouchEvent): void => {
          this.state.resize = true;
          const p = extractPoint(e);
          drag.x = p.x;
          drag.y = p.y;
          drag.left = drag.x - (this.state.win?.offsetLeft ?? 0);
          drag.top = drag.y - (this.state.win?.offsetTop ?? 0);
          drag.width = drag.x - (this.state.win?.offsetWidth ?? 0);
          drag.height = drag.y - (this.state.win?.offsetHeight ?? 0);
          if (this.state.iframe) {
            this.state.iframe.style.pointerEvents = 'none';
          }
          e.stopPropagation();
          e.preventDefault();
        };
        resizer.addEventListener('mousedown', resizeStartHandler as EventListener);
        resizer.addEventListener('touchstart', resizeStartHandler as EventListener);
      }
    }

    // Move handler
    const moveHandler = (e: MouseEvent | TouchEvent): void => {
      if (this.state.drag || this.state.resize) {
        const p = extractPoint(e);
        drag.x = p.x;
        drag.y = p.y;

        if (this.state.drag) {
          this.state.winPosition.left = drag.x - drag.left;
          this.state.winPosition.top = drag.y - drag.top;
          this.restorePosition(this.state.win!, this.state.winPosition);
        }

        if (this.state.resize) {
          this.state.winPosition.width = drag.x - drag.width;
          this.state.winPosition.height = drag.y - drag.height;
          this.restorePosition(this.state.win!, this.state.winPosition);
          this.adjustSizes();
        }

        e.stopPropagation();
        e.preventDefault();
      }
    };

    this.state.handlers.mousemove = moveHandler as EventListener;
    this.state.handlers.touchmove = moveHandler as EventListener;
    window.addEventListener('mousemove', moveHandler as EventListener);
    window.addEventListener('touchmove', moveHandler as EventListener);

    // Stop handler
    const stopHandler = (e: Event): void => {
      if (this.state.drag || this.state.resize) {
        this.state.drag = false;
        this.state.resize = false;
        if (this.state.iframe) {
          this.state.iframe.style.pointerEvents = '';
        }
        this.savePositions();
        e.stopPropagation();
        e.preventDefault();
      }
    };

    this.state.handlers.mouseup = stopHandler as EventListener;
    this.state.handlers.touchend = stopHandler as EventListener;
    this.state.handlers.touchcancel = stopHandler as EventListener;
    window.addEventListener('mouseup', stopHandler);
    window.addEventListener('touchend', stopHandler);
    window.addEventListener('touchcancel', stopHandler);
  }

  /**
   * Expose global functions for backwards compatibility.
   */
  private exposeGlobals(): void {
    if (typeof window === 'undefined') return;

    const toggleName = makeFunctionName(this.prefix, 'ToggleWindow');
    const destroyName = makeFunctionName(this.prefix, 'Destroy');

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any)[toggleName] = () => this.toggle();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any)[destroyName] = () => this.destroy();
  }

  /**
   * Remove global functions.
   */
  private removeGlobals(): void {
    if (typeof window === 'undefined') return;

    const toggleName = makeFunctionName(this.prefix, 'ToggleWindow');
    const destroyName = makeFunctionName(this.prefix, 'Destroy');

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (window as any)[toggleName];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (window as any)[destroyName];
    } catch {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any)[toggleName] = undefined;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any)[destroyName] = undefined;
    }
  }

  /**
   * Adjust iframe and body sizes after resize.
   */
  private adjustSizes(): void {
    const win = this.state.win;
    const header = getElementById(this.sp('%prefix%-header'));
    const body = getElementById(this.sp('%prefix%-body'));
    const iframe = getElementById(this.sp('%prefix%-iframe'));

    if (!win || !header || !body || !iframe) return;

    body.style.height = (win.offsetHeight - header.offsetHeight - 4) + 'px';
    (iframe as HTMLElement).style.height = (win.offsetHeight - header.offsetHeight - 15) + 'px';
    (iframe as HTMLElement).style.width = (win.offsetWidth - 3) + 'px';
  }

  /**
   * Animation step for shadow element.
   */
  private shadowStep(delta: number): void {
    const state = this.state;
    const wp = state.winPosition;
    const tp = state.tabPosition;
    const sp = state.shadowPosition;

    sp.left = (wp.left - tp.left) * delta + tp.left;
    sp.top = (wp.top - tp.top) * delta + tp.top;
    sp.width = (wp.width - tp.width) * delta + tp.width;
    sp.height = (wp.height - tp.height) * delta + tp.height;

    const s = state.shadow!;
    s.style.left = sp.left + 'px';
    s.style.top = sp.top + 'px';
    s.style.width = sp.width + 'px';
    s.style.height = sp.height + 'px';
    if (s.style.display !== 'block') s.style.display = 'block';
  }

  /**
   * Initialize iframe with URL.
   */
  private initIframe(): void {
    if (this.state.iframe) {
      this.state.iframe.src = this.config.url ?? this.saasUrl;
    }
    this.state.inited = true;
  }

  /**
   * Restore element position within viewport bounds.
   */
  private restorePosition(elm: HTMLElement, pos: Position): void {
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    if (pos.left < 0) pos.left = 0;
    if (pos.top < 0) pos.top = 0;
    if (pos.left + pos.width > viewportWidth) {
      pos.left = viewportWidth - pos.width;
    }
    if (pos.top + pos.height > viewportHeight) {
      pos.top = viewportHeight - pos.height;
    }

    elm.style.left = pos.left + 'px';
    elm.style.top = pos.top + 'px';
    elm.style.width = pos.width + 'px';
    elm.style.height = pos.height + 'px';
  }

  /**
   * Save element position to state.
   */
  private savePosition(elm: HTMLElement, pos: Position): void {
    pos.left = elm.offsetLeft;
    pos.top = elm.offsetTop;
    pos.width = elm.offsetWidth;
    pos.height = elm.offsetHeight;
  }

  /**
   * Save positions of window and tab.
   */
  private savePositions(): void {
    if (this.state.win && this.state.win.style.display !== 'none') {
      this.savePosition(this.state.win, this.state.winPosition);
    }
    if (this.state.tab && this.state.tab.style.display !== 'none') {
      this.savePosition(this.state.tab, this.state.tabPosition);
    }
  }

  /**
   * Check if should open in new window (mobile).
   */
  private needOpenWide(): boolean {
    return this.state.mobile;
  }

  /**
   * Expand (open) the window.
   * @returns false to prevent default link behavior, true if opened externally
   */
  expand(): boolean {
    if (this.needOpenWide()) {
      // Mobile: open in new window
      window.open(this.config.url ?? this.saasUrl, '_blank');
      return true;
    }

    animate({
      duration: this.config.a,
      step: (delta) => this.shadowStep(delta),
      onStart: () => {
        this.savePositions();
        if (this.config.ht && this.state.tab) {
          this.state.tab.style.display = 'none';
        }
      },
      onFinish: () => {
        if (!this.state.inited) {
          this.initIframe();
        }
        if (this.state.shadow) {
          this.state.shadow.style.display = 'none';
        }
        if (this.state.win) {
          this.state.win.style.display = 'block';
        }
        this.adjustSizes();
        this.savePositions();
      }
    });

    return false;
  }

  /**
   * Collapse (close) the window.
   * @returns false to prevent default link behavior
   */
  collapse(): boolean {
    animate({
      duration: this.config.a,
      step: (delta) => this.shadowStep(delta),
      delta: reverseDelta,
      onStart: () => {
        this.savePositions();
        if (this.state.win) {
          this.state.win.style.display = 'none';
        }
      },
      onFinish: () => {
        if (this.state.shadow) {
          this.state.shadow.style.display = 'none';
        }
        if (this.state.tab) {
          this.state.tab.style.display = 'block';
        }
        this.savePositions();
      }
    });

    return false;
  }

  /**
   * Toggle the window open/closed state.
   * @returns false to prevent default link behavior, true if opened externally
   */
  toggle(): boolean {
    if (this.state.win?.style.display === 'none') {
      return this.expand();
    } else {
      return this.collapse();
    }
  }

  /**
   * Check if the window is currently open.
   * @returns true if window is visible
   */
  isOpen(): boolean {
    return this.state.win?.style.display !== 'none';
  }

  /**
   * Check if running on a mobile device.
   * @returns true if mobile device detected
   */
  isMobile(): boolean {
    return this.state.mobile;
  }

  /**
   * Get current configuration (readonly).
   * @returns The internal configuration object
   */
  getConfig(): Readonly<InternalConfig> {
    return { ...this.config };
  }

  /**
   * Get the prefix used by this instance.
   * @returns The prefix string
   */
  getPrefix(): string {
    return this.prefix;
  }

  /**
   * Completely remove the injector from the page.
   * Cleans up all event listeners, DOM elements, and global functions.
   */
  destroy(): void {
    if (!this.installed) return;

    // Remove document event listeners
    if (this.state.handlers.mousewheel) {
      document.removeEventListener('mousewheel', this.state.handlers.mousewheel);
    }
    if (this.state.handlers.DOMMouseScroll) {
      document.removeEventListener('DOMMouseScroll', this.state.handlers.DOMMouseScroll);
    }

    // Remove window event listeners
    if (this.state.handlers.mousemove) {
      window.removeEventListener('mousemove', this.state.handlers.mousemove);
    }
    if (this.state.handlers.touchmove) {
      window.removeEventListener('touchmove', this.state.handlers.touchmove);
    }
    if (this.state.handlers.mouseup) {
      window.removeEventListener('mouseup', this.state.handlers.mouseup);
    }
    if (this.state.handlers.touchend) {
      window.removeEventListener('touchend', this.state.handlers.touchend);
    }
    if (this.state.handlers.touchcancel) {
      window.removeEventListener('touchcancel', this.state.handlers.touchcancel);
    }

    // Remove DOM elements
    if (this.state.root?.parentNode) {
      this.state.root.parentNode.removeChild(this.state.root);
    }
    if (this.state.styleElement?.parentNode) {
      this.state.styleElement.parentNode.removeChild(this.state.styleElement);
    }

    // Remove global functions
    this.removeGlobals();

    // Reset state
    this.state = this.createInitialState();
    this.installed = false;
  }
}
