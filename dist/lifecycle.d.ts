import type { Mode } from './types.js';
export declare function transition(mode: Mode, action: 'resume' | 'pause' | 'fail' | 'dispose'): Mode;
