import type { AnimationOptions } from './types';

/**
 * Run an animation with configurable duration, step function, and callbacks.
 * Uses setInterval for frame updates.
 * @param opts - Animation options
 */
export function animate(opts: AnimationOptions): void {
  const duration = opts.duration;
  const delay = opts.delay ?? 10;
  const delta = opts.delta ?? ((p: number) => p);
  
  if (duration > 0) {
    if (opts.onStart) opts.onStart();
    
    const start = Date.now();
    const id = setInterval(() => {
      const timePassed = Date.now() - start;
      let progress = timePassed / duration;
      
      if (progress > 1) progress = 1;
      
      const deltaValue = delta(progress);
      opts.step(deltaValue);
      
      if (progress === 1) {
        clearInterval(id);
        if (opts.onFinish) opts.onFinish();
      }
    }, delay);
  } else {
    // No animation - execute immediately
    if (opts.onStart) opts.onStart();
    if (opts.onFinish) opts.onFinish();
  }
}

/**
 * Linear delta function (default).
 * @param progress - Progress value 0-1
 * @returns The delta value
 */
export function linearDelta(progress: number): number {
  return progress;
}

/**
 * Reverse delta function (for collapse animation).
 * @param progress - Progress value 0-1
 * @returns The reversed delta value
 */
export function reverseDelta(progress: number): number {
  return 1 - progress;
}
