/**
 * service-injector
 * Lightweight library for SaaS providers to embed services on client websites
 * as a floating tab/window with iframe integration.
 * 
 * @packageDocumentation
 */

// Main class export
export { ServiceInjector } from './ServiceInjector';

// Type exports
export type {
  ServiceInjectorConfig,
  ServiceInjectorOptions,
  InternalConfig,
  Position,
  AnimationOptions,
  GlobalConfig
} from './types';

// Utility exports (for advanced usage)
export {
  substitutePrefix,
  parseValue,
  extractPoint,
  isMobileDevice
} from './utils';

// Animation exports (for advanced usage)
export { animate, linearDelta, reverseDelta } from './animation';

// Default values exports (for reference/customization)
export {
  DEFAULT_PREFIX,
  DEFAULT_SCRIPT_ID,
  DEFAULT_SAAS_URL,
  DEFAULT_CONFIG,
  CONFIG_MAPPING,
  OFFSET_ORIENTATION,
  DEFAULT_TAB_TEMPLATE,
  DEFAULT_WINDOW_TEMPLATE,
  DEFAULT_STYLES
} from './defaults';

// Auto-install for IIFE bundle (script tag usage)
import { initAutoInstall } from './auto-install';
import { ServiceInjector } from './ServiceInjector';

// Run auto-install for backwards compatibility when loaded as script
initAutoInstall();

// Also expose ServiceInjector on window for script tag usage
if (typeof window !== 'undefined') {
  window.ServiceInjector = ServiceInjector;
}
