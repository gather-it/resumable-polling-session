import type { PollEvent } from './types.js';
export declare function emit(observer: ((event: PollEvent) => void) | undefined, event: PollEvent): void;
