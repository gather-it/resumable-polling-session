# resumable-polling-session

A TypeScript scheduler for polling a background task, pausing when the caller leaves, and continuing from the last response it successfully applied.

This is for application developers who need one request at a time, response-defined delays, bounded user commands and protection against responses from an old run. The caller owns the endpoint, response format and application state. There are no runtime dependencies.

**Status:** early prototype. Current evidence consists of automated tests and a local demonstration with synthetic task states. No production adoption or published release is claimed. The [roadmap](ROADMAP.md) contains 32 estimated hours of future reliability and usability work; those features are not already implemented.

## Run locally

Use Node 24 or later with npm. From the repository root:

```sh
npm ci --ignore-scripts
npm run check
npm run demo
```

The demonstration needs no server, credentials or network connection. It retries a synthetic temporary failure, delivers three task states and prints:

```text
Delivered 1: queued
Delivered 2: running
Delivered 3: complete
Checkpoint: 3; attempts: 4
```

Development dependencies are TypeScript and the Node type declarations. Tests use Node's built-in test runner. `npm run check` checks the library and typed examples, builds the package, and runs runtime tests, including an offline installation of a local package archive.

## Define a protocol

After `npm run build`, save this as `example.mjs` in the repository root and run `node example.mjs`:

```js
import {createSession} from './dist/index.js';

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
      complete: response.done,
      pollAfterMs: 250,
    }),
  },
  operation: async (_request, signal) => {
    signal.throwIfAborted();
    return {done: true};
  },
  onResponse: response => console.log(response),
  onError: error => console.error(error.message),
});

session.resume();
```

The operation is deliberately fake. A real adapter should use the supplied abort signal and return its own response type. See [the typed example](examples/typed-session.ts) for request, response, cursor and command types checked together by the compiler.

## Session API

| Operation | Behavior |
| --- | --- |
| `resume()` | Starts idle work or continues a paused session. Repeated calls do not create another loop. |
| `pause()` | Cancels active work while retaining the committed cursor and pending commands. |
| `dispose()` | Permanently stops the session and clears pending commands. |
| `enqueue(key, value)` | Adds one command per key. A duplicate retains the existing value. |
| `enqueue(key, value, true)` | Replaces a pending command. An older response cannot acknowledge its replacement. |
| `snapshot()` | Returns copies of lifecycle state, cursor, completion status and pending commands. |

The protocol selector owns priority. To acknowledge a command automatically, return that command in `work.command`, as shown in the typed example. The queue holds at most 100 keys by default; use `maxPendingCommands` to change the bound.

## Guarantees and limits

- One operation promise is outstanding at a time. An operation that ignores cancellation must settle before a resumed run can start another one.
- A generation check rejects late responses from a paused or disposed run.
- Delivery finishes before cursor advancement or command acknowledgment. A delivery failure leaves the old cursor and fails the session.
- Minimum cadence starts after delivery. Only work marked `interruptible` can have its wait woken by a command.
- Retry policy is explicit and defaults to one attempt. Event observer exceptions do not interrupt scheduling.
- Terminal errors use a fixed public message instead of exposing arbitrary operation errors.

Scope, cursor and command values must be structured-cloneable. Snapshots are in-memory inspection values and cannot yet restore a new session. Failure and disposal are terminal. Pause cannot undo effects a response callback already performed; delivery is not an exactly-once transaction. A zero-delay protocol can run continuously, so select a sensible cadence. Browser compatibility, persistent restoration and production integrations have not been verified.

## Development and plans

```sh
npm run typecheck
npm run typecheck:examples
npm test
npm run verify:through
```

The fifteen existing verification groups exercise the current prototype. They are test groups, not fifteen historical refactoring releases. Individual commands such as `npm run verify:polling:stale-response` are listed in `package.json`. The complete check also validates licensing metadata, the typed API and the executable demonstration.

The CI workflow runs `npm run check` on Node 24. It will report results once the repository is hosted on GitHub. Read the [design notes](docs/design.md), [contribution instructions](CONTRIBUTING.md) and [roadmap](ROADMAP.md). Completed work belongs in [CHANGELOG.md](CHANGELOG.md).

## License

[MIT](LICENSE). The npm package remains marked private to prevent accidental publication during development. The source can still be hosted publicly under MIT.
