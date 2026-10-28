import {abortableWait} from './scheduler.js';
export async function retry<T>(operation: () => Promise<T>, options: {
  maxAttempts: number; shouldRetry: (error: unknown) => boolean; delayMs: (attempt: number) => number;
  signal: AbortSignal; delay?: typeof abortableWait; onRetry?: (attempt: number, delay: number) => void;
}): Promise<T> {
  if (!Number.isInteger(options.maxAttempts) || options.maxAttempts < 1) throw new RangeError('Invalid attempt budget');
  for (let attempt = 1; ; attempt++) {
    if (options.signal.aborted) throw new Error('cancelled');
    try { return await operation(); }
    catch (error) {
      if (options.signal.aborted || attempt >= options.maxAttempts || !options.shouldRetry(error)) throw error;
      const ms = options.delayMs(attempt);
      if (!Number.isFinite(ms) || ms < 0) throw new RangeError('Invalid delay');
      options.onRetry?.(attempt, ms);
      await (options.delay ?? abortableWait)(ms, options.signal);
    }
  }
}
