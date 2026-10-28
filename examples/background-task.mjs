import {setTimeout as sleep} from 'node:timers/promises';
import {createSession} from '../dist/index.js';

// A local fake job. No server, credentials or customer data are required.
const updates = ['queued', 'running', 'complete'];
let attempts = 0;
let delivered = 0;
let finish;
const finished = new Promise(resolve => { finish = resolve; });
const session = createSession({
  scope: {taskId: 'sample-task'},
  cursor: 0,
  protocol: {
    select: state => state.complete ? undefined : {
      request: {taskId: state.scope.taskId, cursor: state.cursor},
      waitsForCadence: !state.initial,
      interruptible: true,
    },
    advance: (cursor, response) => ({
      cursor: cursor + 1,
      complete: response.status === 'complete',
      pollAfterMs: 10,
    }),
  },
  retry: {
    maxAttempts: 2,
    shouldRetry: error => error instanceof Error && error.message === 'temporary',
    delayMs: () => 5,
  },
  operation: async (request, signal) => {
    attempts++;
    await sleep(2, undefined, {signal});
    if (attempts === 1) throw new Error('temporary');
    return {status: updates[request.cursor]};
  },
  onResponse: response => {
    delivered++;
    console.log(`Delivered ${delivered}: ${response.status}`);
    if (response.status === 'complete') finish();
  },
  onError: error => { console.error(error.message); process.exitCode = 1; finish(); },
});

session.resume();
await finished;
// Let the delivery callback return before reading the committed cursor.
await new Promise(resolve => setImmediate(resolve));
console.log(`Checkpoint: ${session.snapshot().cursor}; attempts: ${attempts}`);
session.dispose();
