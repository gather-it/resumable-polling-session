# Session design

The scheduler owns lifecycle, one operation promise, a cursor and bounded pending commands. It does not own a server, result collection or UI. The protocol decides what work exists and how an accepted response changes its cursor.

## State and completion

Sessions start idle. Resume makes an idle or paused session active. Pause preserves committed state and cancels owned work. Failure and disposal are terminal; recovery requires a new session. Protocol completion is separate from lifecycle, so a selector can accept a later user command after ordinary polling completes.

Scope is cloned at construction. The selector receives copies of scope, cursor and commands. A generation number distinguishes a resumed run from an operation that settles late after cancellation.

## Delivery order

The loop selects work, waits for any minimum interval, and executes the operation with the configured retry policy. A current response passes through `onResponse`. Only after that callback resolves does the loop advance the cursor, acknowledge the selected command revision and set the next minimum poll time.

A delivery exception fails the session without advancing the cursor. Pause or disposal during asynchronous delivery invalidates the run but cannot undo effects the callback already applied. Applications must decide whether their callback can be interrupted safely. Roadmap item 4 addresses this boundary explicitly.

## Cancellation and commands

Pause and disposal abort the current wait or operation. Generation checks remain necessary because an operation may ignore abort. A replacement run waits for that promise to settle, preserving the concurrency bound even when cancellation is ignored.

Only a cadence wait marked interruptible is woken by a command. Commands arriving during an operation stay queued. Acknowledgment compares revisions so a response selected before replacement cannot clear its newer command.

## Current evidence

Runtime tests cover isolation, lifecycle, stale responses, command revisions, cadence, retries, delivery failure and packed installation. Typed fixtures check the exported handle and reject mismatched commands and cursor types. The local demonstration exercises a transient failure followed by three delivered task states.

The virtual-clock reference model, browser matrix, elapsed-time deadline and resource accounting in the roadmap remain future work.
