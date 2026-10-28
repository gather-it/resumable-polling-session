import type {PollEvent} from './types.js';
export function emit(observer: ((event: PollEvent) => void) | undefined, event: PollEvent) {
  try { observer?.(Object.freeze({...event})); } catch { /* Observer isolation. */ }
}
