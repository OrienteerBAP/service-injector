import type { InternalConfig, ConfigMapping, OffsetOrientation } from './types';

/**
 * Default prefix for element IDs.
 */
export const DEFAULT_PREFIX = 'si';

/**
 * Default script element ID for auto-detection.
 */
export const DEFAULT_SCRIPT_ID = 'service-injector';

/**
 * Default SaaS URL.
 */
export const DEFAULT_SAAS_URL = 'https://orienteer.org';

/**
 * Dock threshold in pixels - how close to edge to trigger docking.
 */
export const DOCK_THRESHOLD = 20;

/**
 * Minimum screen width for docking to be enabled.
 */
export const DOCK_MIN_SCREEN_WIDTH = 768;

/**
 * Minimum drag distance in pixels required to undock a docked window.
 * Prevents accidental undocking on simple clicks.
 */
export const UNDOCK_DRAG_THRESHOLD = 5;

/**
 * Default internal configuration values.
 */
export const DEFAULT_CONFIG: InternalConfig = {
  url: null,
  p: 'bottom',
  o: '80%',
  a: 300,
  ww: '440px',
  wh: '550px',
  wt: '100px',
  wb: null,
  wl: null,
  wc: 0,
  wr: null,
  d: true,
  r: true,
  ht: false,
  dk: false
};

/**
 * Mapping from long config names (data attributes) to short internal keys.
 */
export const CONFIG_MAPPING: ConfigMapping = {
  'url': 'url',
  'position': 'p',
  'offset': 'o',
  'animation': 'a',
  'window-width': 'ww',
  'window-height': 'wh',
  'window-top': 'wt',
  'window-bottom': 'wb',
  'window-left': 'wl',
  'window-center': 'wc',
  'window-right': 'wr',
  'draggable': 'd',
  'resizable': 'r',
  'hide-tab': 'ht',
  'dockable': 'dk'
};

/**
 * Mapping from readable option names to internal config keys.
 */
export const OPTIONS_TO_CONFIG: Record<string, keyof InternalConfig> = {
  url: 'url',
  position: 'p',
  offset: 'o',
  animation: 'a',
  windowWidth: 'ww',
  windowHeight: 'wh',
  windowTop: 'wt',
  windowBottom: 'wb',
  windowLeft: 'wl',
  windowCenter: 'wc',
  windowRight: 'wr',
  draggable: 'd',
  resizable: 'r',
  hideTab: 'ht',
  dockable: 'dk'
};

/**
 * Maps tab position to the CSS property for offset placement.
 */
export const OFFSET_ORIENTATION: OffsetOrientation = {
  top: 'left',
  bottom: 'left',
  left: 'top',
  right: 'top'
};

/**
 * Default tab template. Placeholders: %prefix%, %url%
 */
export const DEFAULT_TAB_TEMPLATE = "<a onclick='return %prefix%ToggleWindow();' href='%url%'>Click me!</a>";

/**
 * Default window template. Placeholders: %prefix%, %url%
 * Includes resize zones for all edges and corners.
 */
export const DEFAULT_WINDOW_TEMPLATE = 
  "<div id='%prefix%-inner'>" +
    "<div id='%prefix%-header'><a href='#' onclick='return %prefix%ToggleWindow();' style='cursor:pointer'>X</a></div>" +
    "<div id='%prefix%-body'><iframe id='%prefix%-iframe'></iframe></div>" +
  "</div>" +
  // Edge resize zones
  "<div id='%prefix%-resize-n' class='%prefix%-resize-edge' data-resize='n'></div>" +
  "<div id='%prefix%-resize-s' class='%prefix%-resize-edge' data-resize='s'></div>" +
  "<div id='%prefix%-resize-e' class='%prefix%-resize-edge' data-resize='e'></div>" +
  "<div id='%prefix%-resize-w' class='%prefix%-resize-edge' data-resize='w'></div>" +
  // Corner resize zones
  "<div id='%prefix%-resize-ne' class='%prefix%-resize-corner' data-resize='ne'></div>" +
  "<div id='%prefix%-resize-nw' class='%prefix%-resize-corner' data-resize='nw'></div>" +
  "<div id='%prefix%-resize-se' class='%prefix%-resize-corner' data-resize='se'></div>" +
  "<div id='%prefix%-resize-sw' class='%prefix%-resize-corner' data-resize='sw'></div>";

/**
 * Resize zone thickness in pixels.
 */
export const RESIZE_ZONE_SIZE = 6;

/**
 * Default styles. Placeholder: %prefix%
 */
export const DEFAULT_STYLES = 
  "#%prefix%-tab {background: white; border: 1px solid black; padding: 1em}" +
  "#%prefix%-window {background: white; border: 1px solid black; min-width: 300px; min-height: 200px; position: relative}" +
  "#%prefix%-inner {height: 100%; width: 100%; position: relative; display: flex; flex-direction: column}" +
  "#%prefix%-header {height:1.5em; background: #aaa; text-align: right; padding: 0 .5em;cursor:move; flex-shrink: 0}" +
  "#%prefix%-body {border: 1px solid #aaa; flex: 1; overflow: hidden}" +
  "#%prefix%-iframe {border: 0; width: 100%; height: 100%}" +
  "#%prefix%-shadow {background: grey; z-index: 99999}" +
  // Dock preview overlay - shows where window will dock
  "#%prefix%-dock-preview {background: rgba(0, 120, 215, 0.2); border: 2px dashed rgba(0, 120, 215, 0.6); box-sizing: border-box}" +
  // Edge resize zones - positioned along each edge
  ".%prefix%-resize-edge, .%prefix%-resize-corner {position: absolute; z-index: 100000}" +
  "#%prefix%-resize-n {top: -3px; left: 6px; right: 6px; height: 6px; cursor: n-resize}" +
  "#%prefix%-resize-s {bottom: -3px; left: 6px; right: 6px; height: 6px; cursor: s-resize}" +
  "#%prefix%-resize-e {right: -3px; top: 6px; bottom: 6px; width: 6px; cursor: e-resize}" +
  "#%prefix%-resize-w {left: -3px; top: 6px; bottom: 6px; width: 6px; cursor: w-resize}" +
  // Corner resize zones - positioned at each corner
  "#%prefix%-resize-ne {top: -3px; right: -3px; width: 12px; height: 12px; cursor: ne-resize}" +
  "#%prefix%-resize-nw {top: -3px; left: -3px; width: 12px; height: 12px; cursor: nw-resize}" +
  "#%prefix%-resize-se {bottom: -3px; right: -3px; width: 12px; height: 12px; cursor: se-resize}" +
  "#%prefix%-resize-sw {bottom: -3px; left: -3px; width: 12px; height: 12px; cursor: sw-resize}";

/**
 * Mobile user agent detection regex.
 */
export const MOBILE_REGEX = /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i;

export const MOBILE_REGEX_SHORT = /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i;
