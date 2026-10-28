import { abortableWait } from './scheduler.js';
export async function retry(operation, options) {
    if (!Number.isInteger(options.maxAttempts) || options.maxAttempts < 1)
        throw new RangeError('Invalid attempt budget');
    for (let attempt = 1;; attempt++) {
        if (options.signal.aborted)
            throw new Error('cancelled');
        try {
            return await operation();
        }
        catch (error) {
            if (options.signal.aborted || attempt >= options.maxAttempts || !options.shouldRetry(error))
                throw error;
            const ms = options.delayMs(attempt);
            if (!Number.isFinite(ms) || ms < 0)
                throw new RangeError('Invalid delay');
            options.onRetry?.(attempt, ms);
            await (options.delay ?? abortableWait)(ms, options.signal);
        }
    }
}
