import type {Mode} from './types.js';
export function transition(mode: Mode, action: 'resume' | 'pause' | 'fail' | 'dispose'): Mode {
  if (action === 'dispose') return 'disposed';
  if (mode === 'failed' || mode === 'disposed') return mode;
  if (action === 'fail') return 'failed';
  if (action === 'resume') return 'active';
  return mode === 'active' ? 'paused' : mode;
}
