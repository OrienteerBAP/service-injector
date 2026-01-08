import { ServiceInjector } from './ServiceInjector';
import { DEFAULT_SCRIPT_ID } from './defaults';

/**
 * Check if we're running in a browser environment.
 */
function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof document !== 'undefined';
}

/**
 * Check if the script was loaded via a script tag with the expected ID.
 * This enables backwards-compatible auto-installation.
 */
function shouldAutoInstall(): boolean {
  if (!isBrowser()) return false;
  
  // Check for script tag with default ID
  const script = document.getElementById(DEFAULT_SCRIPT_ID);
  if (script && script.tagName.toLowerCase() === 'script') {
    return true;
  }
  
  // Also check current script if available
  if (document.currentScript) {
    const currentScript = document.currentScript as HTMLScriptElement;
    // Auto-install if loaded as IIFE bundle (has .iife.js in src)
    const src = currentScript.getAttribute('src') || '';
    if (src.includes('.iife.js') || src.includes('service-injector')) {
      return true;
    }
  }
  
  return false;
}

/**
 * Auto-install the ServiceInjector when loaded via script tag.
 * This provides backwards compatibility with the original injector.js behavior.
 */
export function autoInstall(): ServiceInjector | null {
  if (!shouldAutoInstall()) {
    return null;
  }
  
  // Create and install the injector
  const injector = new ServiceInjector();
  injector.install();
  
  return injector;
}

/**
 * Run auto-install when DOM is ready.
 */
export function initAutoInstall(): void {
  if (!isBrowser()) return;
  
  // If DOM is already ready, install immediately
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      autoInstall();
    });
  } else {
    // DOM is already ready
    autoInstall();
  }
}
