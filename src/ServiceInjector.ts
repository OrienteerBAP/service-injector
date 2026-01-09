import type {
  ServiceInjectorOptions,
  InternalConfig,
  InjectorState,
  Position,
  GlobalConfig,
  DockSide,
  ResizeDirection
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
  DEFAULT_STYLES,
  DOCK_THRESHOLD,
  DOCK_MIN_SCREEN_WIDTH
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
      dragState: { x: 0, y: 0, startX: 0, startY: 0, top: 0, left: 0, width: 0, height: 0 },
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
        touchcancel: null,
        dblclick: null
      },
      // Dock-related state
      docked: null,
      preDockPosition: null,
      originalBodyMargin: null,
      undocking: false,
      resizeDirection: null,
      dockPreview: null,
      dockPreviewSide: null
    };
  }

  /**
   * Substitute prefix and URL in template strings.
   */
  private sp(str: string): string {
    return substitutePrefix(str, this.prefix, this.config.url ?? this.saasUrl);
  }

  /**
   * Get the list of allowed dock sides based on configuration.
   * @returns Array of allowed dock sides, or empty array if docking is disabled
   */
  private getAllowedDockSides(): DockSide[] {
    const dk = this.config.dk;
    if (dk === false) {
      return [];
    }
    if (dk === true) {
      return ['left', 'right', 'top', 'bottom'];
    }
    return dk;
  }

  /**
   * Check if docking is currently possible.
   * Docking is disabled on mobile devices and screens smaller than DOCK_MIN_SCREEN_WIDTH.
   * @returns true if docking is enabled and conditions are met
   */
  private canDock(): boolean {
    if (this.state.mobile) {
      return false;
    }
    if (window.innerWidth < DOCK_MIN_SCREEN_WIDTH) {
      return false;
    }
    return this.getAllowedDockSides().length > 0;
  }

  /**
   * Detect which dock zone (if any) the window edge is within.
   * Uses the window's edge position (not cursor position) to determine docking.
   * @returns The dock side if window edge is within threshold, or null if not in any dock zone
   */
  private detectDockZone(): DockSide | null {
    if (!this.canDock()) {
      return null;
    }

    const win = this.state.win;
    if (!win) return null;

    const allowed = this.getAllowedDockSides();
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    // Get window edges
    const winLeft = win.offsetLeft;
    const winTop = win.offsetTop;
    const winRight = winLeft + win.offsetWidth;
    const winBottom = winTop + win.offsetHeight;

    // Check each edge - priority: left, right, top, bottom
    // Dock triggers when the window's corresponding edge is near the viewport edge
    if (allowed.includes('left') && winLeft <= DOCK_THRESHOLD) {
      return 'left';
    }
    if (allowed.includes('right') && winRight >= vw - DOCK_THRESHOLD) {
      return 'right';
    }
    if (allowed.includes('top') && winTop <= DOCK_THRESHOLD) {
      return 'top';
    }
    if (allowed.includes('bottom') && winBottom >= vh - DOCK_THRESHOLD) {
      return 'bottom';
    }

    return null;
  }

  /**
   * Save the current body margins to state for later restoration.
   */
  private saveBodyMargins(): void {
    const bodyStyle = document.body.style;
    this.state.originalBodyMargin = {
      top: bodyStyle.marginTop || '',
      right: bodyStyle.marginRight || '',
      bottom: bodyStyle.marginBottom || '',
      left: bodyStyle.marginLeft || '',
      transition: bodyStyle.transition || ''
    };
  }

  /**
   * Apply a margin to the body element on a specific side.
   * @param side - Which side to apply margin to
   * @param size - The margin size (e.g., '440px')
   */
  private applyBodyMargin(side: DockSide, size: string): void {
    const body = document.body;
    const duration = this.config.a;

    // Add transition for smooth animation
    body.style.transition = `margin ${duration}ms ease-in-out`;

    switch (side) {
      case 'left':
        body.style.marginLeft = size;
        break;
      case 'right':
        body.style.marginRight = size;
        break;
      case 'top':
        body.style.marginTop = size;
        break;
      case 'bottom':
        body.style.marginBottom = size;
        break;
    }
  }

  /**
   * Restore body margins to their original values.
   */
  private restoreBodyMargins(): void {
    if (!this.state.originalBodyMargin) return;

    const body = document.body;
    const orig = this.state.originalBodyMargin;
    const duration = this.config.a;

    // Add transition for smooth animation
    body.style.transition = `margin ${duration}ms ease-in-out`;

    body.style.marginTop = orig.top;
    body.style.marginRight = orig.right;
    body.style.marginBottom = orig.bottom;
    body.style.marginLeft = orig.left;

    // Restore original transition after animation completes
    setTimeout(() => {
      body.style.transition = orig.transition;
    }, duration);

    this.state.originalBodyMargin = null;
  }

  /**
   * Show dock preview overlay for a specific side.
   * @param side - The side to show the preview for
   */
  private showDockPreview(side: DockSide): void {
    const preview = this.state.dockPreview;
    if (!preview) return;

    // Don't show if already showing this side
    if (this.state.dockPreviewSide === side) return;

    const win = this.state.win;
    if (!win) return;

    // Position preview based on dock side
    // The preview shows where the window will dock (full height/width on that edge)
    const winWidth = win.offsetWidth;
    const winHeight = win.offsetHeight;

    preview.style.top = '';
    preview.style.bottom = '';
    preview.style.left = '';
    preview.style.right = '';
    preview.style.width = '';
    preview.style.height = '';

    switch (side) {
      case 'left':
        preview.style.top = '0';
        preview.style.left = '0';
        preview.style.width = winWidth + 'px';
        preview.style.height = '100vh';
        break;
      case 'right':
        preview.style.top = '0';
        preview.style.right = '0';
        preview.style.width = winWidth + 'px';
        preview.style.height = '100vh';
        break;
      case 'top':
        preview.style.top = '0';
        preview.style.left = '0';
        preview.style.width = '100vw';
        preview.style.height = winHeight + 'px';
        break;
      case 'bottom':
        preview.style.bottom = '0';
        preview.style.left = '0';
        preview.style.width = '100vw';
        preview.style.height = winHeight + 'px';
        break;
    }

    preview.style.display = 'block';
    this.state.dockPreviewSide = side;
  }

  /**
   * Hide the dock preview overlay.
   */
  private hideDockPreview(): void {
    const preview = this.state.dockPreview;
    if (preview) {
      preview.style.display = 'none';
    }
    this.state.dockPreviewSide = null;
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

    // Create dock preview element (shown when dragging near edges)
    const dockPreviewElm = createElement('div', { id: this.sp('%prefix%-dock-preview') });
    dockPreviewElm.style.position = 'fixed';
    dockPreviewElm.style.display = 'none';
    dockPreviewElm.style.zIndex = '99996';
    rootElm.appendChild(dockPreviewElm);
    this.state.dockPreview = dockPreviewElm;

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
          const p = extractPoint(e);

          // If docked, start undocking process
          if (this.state.docked) {
            this.state.undocking = true;
            // Restore pre-dock size but keep current position under cursor
            const preDock = this.state.preDockPosition;
            if (preDock && this.state.win) {
              // Restore body margins immediately (no transition)
              this.restoreBodyMargins();

              // Reset window size to pre-dock dimensions
              this.state.win.style.width = preDock.width + 'px';
              this.state.win.style.height = preDock.height + 'px';

              // Position window so cursor is in header center
              const newLeft = p.x - preDock.width / 2;
              const newTop = p.y - 15; // Roughly middle of header
              this.state.win.style.left = newLeft + 'px';
              this.state.win.style.top = newTop + 'px';
              this.state.win.style.right = '';
              this.state.win.style.bottom = '';

              // Update winPosition to reflect new position
              this.state.winPosition = {
                left: newLeft,
                top: newTop,
                width: preDock.width,
                height: preDock.height
              };

              this.state.docked = null;
              this.state.preDockPosition = null;
              this.updateDockedResizerCursor();
              this.adjustSizes();
            }
          }

          this.state.drag = true;
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

        // Double-click on header to undock
        const dblclickHandler = (): void => {
          if (this.state.docked) {
            this.undock();
          }
        };
        header.addEventListener('dblclick', dblclickHandler);
        this.state.handlers.dblclick = dblclickHandler as EventListener;
      }
    }

    if (conf.r) {
      // Setup resize handlers for all edges and corners
      const resizeDirections: ResizeDirection[] = ['n', 's', 'e', 'w', 'ne', 'nw', 'se', 'sw'];
      
      for (const direction of resizeDirections) {
        const resizeEl = getElementById(this.sp(`%prefix%-resize-${direction}`));
        if (resizeEl) {
          const resizeStartHandler = (e: MouseEvent | TouchEvent): void => {
            this.state.resize = true;
            this.state.resizeDirection = direction;
            const p = extractPoint(e);
            const win = this.state.win;
            
            // Store initial mouse position for delta calculations
            drag.startX = p.x;
            drag.startY = p.y;
            // Also set x/y for consistency
            drag.x = p.x;
            drag.y = p.y;
            // Store initial window state
            drag.left = win?.offsetLeft ?? 0;
            drag.top = win?.offsetTop ?? 0;
            drag.width = win?.offsetWidth ?? 0;
            drag.height = win?.offsetHeight ?? 0;
            
            if (this.state.iframe) {
              this.state.iframe.style.pointerEvents = 'none';
            }
            e.stopPropagation();
            e.preventDefault();
          };
          resizeEl.addEventListener('mousedown', resizeStartHandler as EventListener);
          resizeEl.addEventListener('touchstart', resizeStartHandler as EventListener);
        }
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

          // Show/hide dock preview based on window edge position
          if (!this.state.docked) {
            const dockSide = this.detectDockZone();
            if (dockSide) {
              this.showDockPreview(dockSide);
            } else {
              this.hideDockPreview();
            }
          }
        }

        if (this.state.resize && this.state.resizeDirection) {
          this.handleDirectionalResize(drag.x, drag.y);
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
        const wasDragging = this.state.drag;
        this.state.drag = false;
        this.state.resize = false;
        this.state.resizeDirection = null;
        this.state.undocking = false;

        if (this.state.iframe) {
          this.state.iframe.style.pointerEvents = '';
        }

        // Check for dock zone on drag end (not when resizing)
        if (wasDragging && !this.state.docked) {
          const dockSide = this.detectDockZone();
          if (dockSide) {
            this.dock(dockSide);
          }
        }

        // Hide dock preview
        this.hideDockPreview();

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
   * Handle resize based on the current resize direction.
   * Supports all 4 edges (n, s, e, w) and 4 corners (ne, nw, se, sw).
   * @param x - Current pointer X position
   * @param y - Current pointer Y position
   */
  private handleDirectionalResize(x: number, y: number): void {
    const win = this.state.win;
    if (!win) return;

    const direction = this.state.resizeDirection;
    if (!direction) return;

    const drag = this.state.dragState;
    const winPos = this.state.winPosition;
    const docked = this.state.docked;
    
    // Calculate deltas from initial mouse position (use startX/startY, not x/y)
    const deltaX = x - drag.startX;
    const deltaY = y - drag.startY;
    
    // Check which edges are being resized
    const resizeN = direction.includes('n');
    const resizeS = direction.includes('s');
    const resizeE = direction.includes('e');
    const resizeW = direction.includes('w');
    
    // Handle horizontal resize
    if (resizeE) {
      // East: expand to the right, width increases
      winPos.width = Math.max(300, drag.width + deltaX);
    } else if (resizeW) {
      // West: expand to the left, left position decreases, width increases
      const newWidth = Math.max(300, drag.width - deltaX);
      const widthDiff = newWidth - drag.width;
      winPos.left = drag.left - widthDiff;
      winPos.width = newWidth;
    }
    
    // Handle vertical resize
    if (resizeS) {
      // South: expand downward, height increases
      winPos.height = Math.max(200, drag.height + deltaY);
    } else if (resizeN) {
      // North: expand upward, top position decreases, height increases
      const newHeight = Math.max(200, drag.height - deltaY);
      const heightDiff = newHeight - drag.height;
      winPos.top = drag.top - heightDiff;
      winPos.height = newHeight;
    }
    
    // Apply position and size
    win.style.left = winPos.left + 'px';
    win.style.top = winPos.top + 'px';
    win.style.width = winPos.width + 'px';
    win.style.height = winPos.height + 'px';
    
    // Clear right/bottom styles to avoid conflicts
    win.style.right = '';
    win.style.bottom = '';

    // Update body margin if docked
    if (docked === 'left' || docked === 'right') {
      this.applyBodyMargin(docked, winPos.width + 'px');
    } else if (docked === 'top' || docked === 'bottom') {
      this.applyBodyMargin(docked, winPos.height + 'px');
    }

    this.adjustSizes();
  }

  /**
   * Expose global functions for backwards compatibility.
   */
  private exposeGlobals(): void {
    if (typeof window === 'undefined') return;

    const toggleName = makeFunctionName(this.prefix, 'ToggleWindow');
    const destroyName = makeFunctionName(this.prefix, 'Destroy');
    const dockName = makeFunctionName(this.prefix, 'Dock');
    const undockName = makeFunctionName(this.prefix, 'Undock');

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any)[toggleName] = () => this.toggle();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any)[destroyName] = () => this.destroy();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any)[dockName] = (side: DockSide) => this.dock(side);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any)[undockName] = () => this.undock();
  }

  /**
   * Remove global functions.
   */
  private removeGlobals(): void {
    if (typeof window === 'undefined') return;

    const toggleName = makeFunctionName(this.prefix, 'ToggleWindow');
    const destroyName = makeFunctionName(this.prefix, 'Destroy');
    const dockName = makeFunctionName(this.prefix, 'Dock');
    const undockName = makeFunctionName(this.prefix, 'Undock');

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (window as any)[toggleName];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (window as any)[destroyName];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (window as any)[dockName];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (window as any)[undockName];
    } catch {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any)[toggleName] = undefined;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any)[destroyName] = undefined;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any)[dockName] = undefined;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any)[undockName] = undefined;
    }
  }

  /**
   * Adjust iframe and body sizes after resize.
   * With flexbox layout, this is mostly handled by CSS, but we may need
   * to trigger reflow for certain browsers.
   */
  private adjustSizes(): void {
    // Force reflow to ensure layout updates
    const win = this.state.win;
    if (win) {
      // Trigger reflow
      void win.offsetHeight;
    }
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
   * Check if the window is currently docked.
   * @returns The dock side if docked, or null if floating
   */
  isDocked(): DockSide | null {
    return this.state.docked;
  }

  /**
   * Dock the window to a specific edge of the viewport.
   * When docked, the page content is pushed aside by adding a margin to the body.
   * 
   * @param side - The edge to dock to ('left', 'right', 'top', 'bottom')
   * @returns this instance for chaining
   */
  dock(side: DockSide): this {
    if (!this.canDock()) {
      console.warn('service-injector: Docking not available (mobile or screen too small)');
      return this;
    }

    const allowed = this.getAllowedDockSides();
    if (!allowed.includes(side)) {
      console.warn(`service-injector: Docking to '${side}' not allowed by configuration`);
      return this;
    }

    if (this.state.docked === side) {
      // Already docked to this side
      return this;
    }

    const win = this.state.win;
    if (!win) return this;

    // If already docked elsewhere, undock first (instant)
    if (this.state.docked) {
      this.restoreBodyMargins();
      this.state.docked = null;
    }

    // Save current position for restoration on undock
    this.savePositions();
    this.state.preDockPosition = { ...this.state.winPosition };

    // Save body margins for restoration
    this.saveBodyMargins();

    // Determine the size of margin to apply (window width for left/right, height for top/bottom)
    const winWidth = win.offsetWidth;
    const winHeight = win.offsetHeight;
    const marginSize = (side === 'left' || side === 'right') ? winWidth + 'px' : winHeight + 'px';

    // Apply body margin (with transition)
    this.applyBodyMargin(side, marginSize);

    // Position window at the edge (fixed position)
    const duration = this.config.a;
    win.style.transition = `all ${duration}ms ease-in-out`;

    switch (side) {
      case 'left':
        win.style.left = '0px';
        win.style.top = '0px';
        win.style.right = '';
        win.style.bottom = '';
        win.style.height = '100vh';
        break;
      case 'right':
        win.style.right = '0px';
        win.style.top = '0px';
        win.style.left = '';
        win.style.bottom = '';
        win.style.height = '100vh';
        break;
      case 'top':
        win.style.top = '0px';
        win.style.left = '0px';
        win.style.right = '';
        win.style.bottom = '';
        win.style.width = '100vw';
        break;
      case 'bottom':
        win.style.bottom = '0px';
        win.style.left = '0px';
        win.style.right = '';
        win.style.top = '';
        win.style.width = '100vw';
        break;
    }

    // Clear transition after animation
    setTimeout(() => {
      win.style.transition = '';
      this.adjustSizes();
      this.savePositions();
    }, duration);

    // Hide tab when docked
    if (this.state.tab) {
      this.state.tab.style.display = 'none';
    }

    this.state.docked = side;
    this.updateDockedResizerCursor();

    return this;
  }

  /**
   * Undock the window and restore it to its pre-dock position.
   * Also restores the original body margins.
   * 
   * @returns this instance for chaining
   */
  undock(): this {
    if (!this.state.docked) {
      return this;
    }

    const win = this.state.win;
    if (!win) return this;

    const duration = this.config.a;
    const preDock = this.state.preDockPosition;

    // Restore body margins
    this.restoreBodyMargins();

    // Animate window back to pre-dock position
    win.style.transition = `all ${duration}ms ease-in-out`;

    // Reset full-screen dimensions
    win.style.width = preDock ? preDock.width + 'px' : this.config.ww;
    win.style.height = preDock ? preDock.height + 'px' : this.config.wh;

    if (preDock) {
      win.style.left = preDock.left + 'px';
      win.style.top = preDock.top + 'px';
      win.style.right = '';
      win.style.bottom = '';
    }

    // Clear transition after animation
    setTimeout(() => {
      win.style.transition = '';
      this.adjustSizes();
      this.savePositions();
    }, duration);

    this.state.docked = null;
    this.state.preDockPosition = null;
    this.state.undocking = false;
    this.updateDockedResizerCursor();

    return this;
  }

  /**
   * Update resize handle visibility based on dock state.
   * When docked, only show resize handles for the available direction.
   */
  private updateDockedResizerCursor(): void {
    const docked = this.state.docked;
    const directions: ResizeDirection[] = ['n', 's', 'e', 'w', 'ne', 'nw', 'se', 'sw'];
    
    // Determine which directions are allowed based on dock state
    let allowedDirections: ResizeDirection[];
    
    if (!docked) {
      // Not docked: all directions allowed
      allowedDirections = directions;
    } else {
      // When docked, only allow resizing away from the docked edge
      switch (docked) {
        case 'left':
          allowedDirections = ['e'];
          break;
        case 'right':
          allowedDirections = ['w'];
          break;
        case 'top':
          allowedDirections = ['s'];
          break;
        case 'bottom':
          allowedDirections = ['n'];
          break;
        default:
          allowedDirections = directions;
      }
    }
    
    // Show/hide resize handles
    for (const dir of directions) {
      const el = getElementById(this.sp(`%prefix%-resize-${dir}`));
      if (el) {
        el.style.display = allowedDirections.includes(dir) ? '' : 'none';
      }
    }
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

    // Restore body margins if currently docked
    if (this.state.docked) {
      this.restoreBodyMargins();
    }

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

    // Remove dblclick handler from header if it exists
    if (this.state.handlers.dblclick) {
      const header = getElementById(this.sp('%prefix%-header'));
      if (header) {
        header.removeEventListener('dblclick', this.state.handlers.dblclick);
      }
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
