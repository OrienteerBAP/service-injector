import { MOBILE_REGEX, MOBILE_REGEX_SHORT } from './defaults';

/**
 * Substitute prefix and URL placeholders in a string.
 * @param str - The template string
 * @param prefix - The prefix to substitute
 * @param url - The URL to substitute
 * @returns The string with placeholders replaced
 */
export function substitutePrefix(str: string, prefix: string, url: string): string {
  return str.replace(/%prefix%/g, prefix).replace(/%url%/g, url);
}

/**
 * Parse a string value to its appropriate type.
 * Handles numbers, booleans, and URL-encoded strings.
 * @param val - The value to parse
 * @returns The parsed value
 */
export function parseValue(val: string): string | number | boolean {
  // Check for integer
  if (/^(-|\+)?([0-9]+|Infinity)$/.test(val)) {
    return Number(val);
  }
  // Check for boolean
  if (val === 'true') return true;
  if (val === 'false') return false;
  // Try to decode URI component
  try {
    return decodeURIComponent(val);
  } catch (e) {
    console.error('service-injector: Failed to decode value:', val, e);
    return val;
  }
}

/**
 * Extract point coordinates from mouse or touch event.
 * @param e - The event object
 * @returns The x and y coordinates
 */
export function extractPoint(e: MouseEvent | TouchEvent): { x: number; y: number } {
  if ('changedTouches' in e && e.changedTouches.length > 0) {
    const p = e.changedTouches[0];
    return { x: p.clientX, y: p.clientY };
  }
  // Mouse event
  const mouseEvent = e as MouseEvent;
  return { x: mouseEvent.clientX, y: mouseEvent.clientY };
}

/**
 * Detect if the current device is mobile.
 * @returns True if mobile device detected
 */
export function isMobileDevice(): boolean {
  if (typeof navigator === 'undefined') return false;
  
  const userAgent = navigator.userAgent || navigator.vendor || (window as unknown as { opera?: string }).opera || '';
  
  return MOBILE_REGEX.test(userAgent) || MOBILE_REGEX_SHORT.test(userAgent.substring(0, 4));
}

/**
 * Create a function name based on prefix.
 * @param prefix - The prefix
 * @param name - The function name (capitalized)
 * @returns The full function name (e.g., 'siToggleWindow')
 */
export function makeFunctionName(prefix: string, name: string): string {
  return `${prefix}${name}`;
}

/**
 * Safely get an element by ID.
 * @param id - The element ID
 * @returns The element or null
 */
export function getElementById(id: string): HTMLElement | null {
  if (typeof document === 'undefined') return null;
  return document.getElementById(id);
}

/**
 * Create an HTML element with attributes.
 * @param tag - The tag name
 * @param attributes - Object of attribute key-value pairs
 * @returns The created element
 */
export function createElement<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  attributes?: Record<string, string>
): HTMLElementTagNameMap[K] {
  const el = document.createElement(tag);
  if (attributes) {
    for (const [key, value] of Object.entries(attributes)) {
      el.setAttribute(key, value);
    }
  }
  return el;
}

/**
 * Deep clone and merge objects.
 * @param target - The target object
 * @param source - The source object to merge
 * @returns The merged object
 */
export function mergeConfig<T extends object>(target: T, source: Partial<T>): T {
  const result = { ...target };
  for (const key of Object.keys(source) as Array<keyof T>) {
    if (source[key] !== undefined) {
      result[key] = source[key] as T[keyof T];
    }
  }
  return result;
}
