import { abortableWait } from './scheduler.js';
export declare function retry<T>(operation: () => Promise<T>, options: {
    maxAttempts: number;
    shouldRetry: (error: unknown) => boolean;
    delayMs: (attempt: number) => number;
    signal: AbortSignal;
    delay?: typeof abortableWait;
    onRetry?: (attempt: number, delay: number) => void;
}): Promise<T>;
