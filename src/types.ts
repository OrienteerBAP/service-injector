/**
 * Dock side options for dockable windows.
 */
export type DockSide = 'left' | 'right' | 'top' | 'bottom';

/**
 * Stored body margins for restoration after undocking.
 */
export interface BodyMargins {
  top: string;
  right: string;
  bottom: string;
  left: string;
  transition: string;
}

/**
 * Public configuration options using readable property names.
 * Used when instantiating ServiceInjector programmatically.
 */
export interface ServiceInjectorConfig {
  /** Custom URL to load in the iframe (overrides default saasUrl) */
  url?: string | null;
  /** Tab position: 'left' | 'right' | 'top' | 'bottom' */
  position?: 'left' | 'right' | 'top' | 'bottom';
  /** Tab offset from edge (e.g., '80%', '100px') */
  offset?: string;
  /** Animation duration in milliseconds */
  animation?: number;
  /** Window width (e.g., '440px', '50%') */
  windowWidth?: string;
  /** Window height (e.g., '550px') */
  windowHeight?: string;
  /** Window top position */
  windowTop?: string | null;
  /** Window bottom position */
  windowBottom?: string | null;
  /** Window left position */
  windowLeft?: string | null;
  /** Window center offset (0 = centered) */
  windowCenter?: number | null;
  /** Window right position */
  windowRight?: string | null;
  /** Enable window dragging */
  draggable?: boolean;
  /** Enable window resizing */
  resizable?: boolean;
  /** Hide tab when window is open */
  hideTab?: boolean;
  /** Enable window docking to viewport edges. true = all sides, array = specific sides only */
  dockable?: boolean | DockSide[];
}

/**
 * Full options for ServiceInjector including templates and prefix.
 */
export interface ServiceInjectorOptions extends ServiceInjectorConfig {
  /** Element ID prefix (default: 'si') */
  prefix?: string;
  /** Default SaaS URL when url config is not set */
  saasUrl?: string;
  /** Custom tab HTML template (supports %prefix% and %url% placeholders) */
  tabTemplate?: string;
  /** Custom window HTML template (supports %prefix% and %url% placeholders) */
  windowTemplate?: string;
  /** Custom CSS styles (appended to defaults, supports %prefix% placeholder) */
  styles?: string;
  /** Script element ID for config detection (default: 'service-injector') */
  scriptId?: string;
}

/**
 * Internal short-key configuration format.
 * Used for backwards compatibility with query string params.
 */
export interface InternalConfig {
  url: string | null;
  p: 'left' | 'right' | 'top' | 'bottom';
  o: string;
  a: number;
  ww: string;
  wh: string;
  wt: string | null;
  wb: string | null;
  wl: string | null;
  wc: number | null;
  wr: string | null;
  d: boolean;
  r: boolean;
  ht: boolean;
  dk: boolean | DockSide[];
}

/**
 * Position data for elements.
 */
export interface Position {
  top: number;
  left: number;
  width: number;
  height: number;
}

/**
 * Drag/resize state tracking.
 */
export interface DragState {
  x: number;
  y: number;
  top: number;
  left: number;
  width: number;
  height: number;
}

/**
 * Internal state of the injector.
 */
export interface InjectorState {
  root: HTMLElement | null;
  win: HTMLElement | null;
  winPosition: Position;
  tab: HTMLElement | null;
  tabPosition: Position;
  shadow: HTMLElement | null;
  shadowPosition: Position;
  iframe: HTMLIFrameElement | null;
  inited: boolean;
  dragState: DragState;
  mobile: boolean;
  drag: boolean;
  resize: boolean;
  styleElement: HTMLStyleElement | null;
  handlers: {
    mousewheel: EventListener | null;
    DOMMouseScroll: EventListener | null;
    mousemove: EventListener | null;
    mouseup: EventListener | null;
    touchmove: EventListener | null;
    touchend: EventListener | null;
    touchcancel: EventListener | null;
    dblclick: EventListener | null;
  };
  /** Current dock state: which side the window is docked to, or null if floating */
  docked: DockSide | null;
  /** Position before docking, used to restore on undock */
  preDockPosition: Position | null;
  /** Original body margins before docking, used to restore on undock */
  originalBodyMargin: BodyMargins | null;
  /** Flag indicating we're in the process of undocking via drag */
  undocking: boolean;
}

/**
 * Animation options.
 */
export interface AnimationOptions {
  duration: number;
  delay?: number;
  delta?: (progress: number) => number;
  step: (delta: number) => void;
  onStart?: () => void;
  onFinish?: () => void;
}

/**
 * Global window config for backwards compatibility.
 */
export interface GlobalConfig {
  tabTemplate?: string;
  windowTemplate?: string;
  styles?: string;
}

/**
 * Mapping from long config names to short internal keys.
 */
export type ConfigMapping = Record<string, keyof InternalConfig>;

/**
 * Offset orientation mapping.
 */
export type OffsetOrientation = Record<string, string>;

// Extend Window interface for global functions and config
declare global {
  interface Window {
    serviceInjectorConfig?: GlobalConfig;
    ServiceInjector?: typeof import('./ServiceInjector').ServiceInjector;
  }
}
