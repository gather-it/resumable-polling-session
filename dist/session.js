import { transition } from './lifecycle.js';
import { createCommands } from './commands.js';
import { abortableWait } from './scheduler.js';
import { emit } from './events.js';
import { retry } from './retry.js';
export function createSession(options) {
    const scope = structuredClone(options.scope);
    let cursor = structuredClone(options.cursor);
    let mode = 'idle';
    let generation = 0;
    let running = false;
    let scheduled = false;
    let initial = true;
    let complete = false;
    let nextPollAt = 0;
    let requestId = 0;
    let controller;
    let ordinaryWait = false;
    const commands = createCommands(options.maxPendingCommands);
    const now = options.now ?? Date.now;
    const current = (version) => mode === 'active' && generation === version;
    const schedule = () => {
        if (scheduled || running || mode !== 'active')
            return;
        scheduled = true;
        queueMicrotask(() => { scheduled = false; void run(); });
    };
    async function run() {
        if (running || mode !== 'active')
            return;
        running = true;
        const version = generation;
        try {
            while (current(version)) {
                const work = options.protocol.select({ scope: structuredClone(scope), cursor: structuredClone(cursor), initial, complete, commands: commands.snapshot() });
                if (!work)
                    break;
                controller = new AbortController();
                const remaining = nextPollAt - now();
                if (work.waitsForCadence && remaining > 0) {
                    ordinaryWait = work.interruptible === true;
                    try {
                        await (options.delay ?? abortableWait)(remaining, controller.signal);
                    }
                    catch (error) {
                        if (!controller.signal.aborted)
                            throw error;
                    }
                    finally {
                        ordinaryWait = false;
                    }
                    if (!current(version))
                        break;
                    continue;
                }
                const id = ++requestId;
                emit(options.onEvent, { type: 'started', requestId: id });
                const activeController = controller;
                const response = await retry(() => options.operation(work.request, activeController.signal), {
                    ...(options.retry ?? { maxAttempts: 1, shouldRetry: () => false, delayMs: () => 0 }),
                    signal: activeController.signal, delay: options.delay,
                    onRetry: (attempt, delayMs) => emit(options.onEvent, { type: 'retry', requestId: id, attempt, delayMs }),
                });
                if (!current(version) || activeController.signal.aborted)
                    break;
                await options.onResponse(response);
                if (!current(version))
                    break;
                const next = options.protocol.advance(structuredClone(cursor), response);
                const interval = next.pollAfterMs ?? 0;
                if (!Number.isFinite(interval) || interval < 0)
                    throw new Error('Invalid cadence');
                cursor = structuredClone(next.cursor);
                complete = next.complete;
                initial = false;
                if (work.command)
                    commands.acknowledge(work.command);
                nextPollAt = now() + interval;
                emit(options.onEvent, { type: 'delivered', requestId: id });
            }
        }
        catch {
            if (current(version)) {
                mode = transition(mode, 'fail');
                try {
                    options.onError?.(new Error('Polling operation failed'));
                }
                catch { /* terminal */ }
            }
        }
        finally {
            running = false;
            controller = undefined;
            if (mode === 'active' && generation !== version)
                schedule();
        }
    }
    return {
        resume() {
            const next = transition(mode, 'resume');
            if (next === 'active' && mode !== 'active') {
                generation++;
                mode = next;
                schedule();
            }
        },
        pause() {
            if (mode === 'active') {
                mode = transition(mode, 'pause');
                generation++;
                controller?.abort();
            }
        },
        dispose() { mode = transition(mode, 'dispose'); generation++; controller?.abort(); commands.clear(); },
        enqueue(key, value, replace = false) {
            if (mode === 'failed' || mode === 'disposed')
                return;
            commands.add(key, value, replace);
            if (ordinaryWait) {
                nextPollAt = 0;
                controller?.abort();
            }
            schedule();
        },
        snapshot: () => ({ mode, cursor: structuredClone(cursor), complete, pending: commands.snapshot() }),
    };
}
