import type { SessionOptions, PollingSession } from './types.js';
export declare function createSession<S, Q, R, C, V>(options: SessionOptions<S, Q, R, C, V>): PollingSession<C, V>;
