# Roadmap

The next milestone combines a reliable polling core with a small practical adapter and browser examples. These are the areas selected for continued work. The current core accepts a caller-supplied operation and protocol; this roadmap describes work that remains.

The fifteen pending items total **32 estimated engineering hours**. Estimates include implementation, review and acceptance tests; they are not hours already worked or exact promises. No users, releases or production evidence are implied by this plan.

Land each item as a complete change. Keep existing exports working and run current checks plus acceptance tests from earlier items. If development stops after any item, the APIs already shipped must still work. Add the named verification script when its tests exist; the proposed names below are not placeholders in package.json.

## 1 Deterministic clock and scheduler fixtures

**Estimate: 3 hours. Status: pending.**

- Build a virtual clock with cancellable waits and explicit microtask draining for the test harness.
- Replace timing-sensitive assertions with controlled request, delivery and wait barriers without changing the public API.

**Verification — proposed `verify:polling:virtual-clock`:** Advance to just before and exactly at a deadline. Expect no early request, one eligible request, independent clock state across sessions, and no owned timer after disposal.

## 2 Lifecycle sequence coverage

**Estimate: 3 hours. Status: pending.**

- Define a compact reference model for resume, pause, completion, failure and disposal.
- Replay reproducible control sequences with transport promises resolving both before and after cancellation.

**Verification — proposed `verify:polling:lifecycle-sequences`:** Compare snapshots with the model after every action. Expect no overlapping operation, stale delivery or restart from a terminal state. Failures must print a reproducible action sequence.

## 3 Retry deadlines and cancellation

**Estimate: 2 hours. Status: pending.**

- Specify attempt counting, elapsed-time budgets and invalid retry configuration.
- Add an optional elapsed-time deadline while retaining current attempt-only behavior when it is omitted.

**Verification — proposed `verify:polling:retry-deadline`:** Use the virtual clock to exhaust attempts, a deadline and a cancelled backoff separately. Expect exact operation counts, no call after cancellation and no cursor advancement for failure.

## 4 Delivery and reentrant control calls

**Estimate: 3 hours. Status: pending.**

- Specify pause, disposal and command replacement invoked from an asynchronous delivery callback.
- Expose a clear response-acceptance boundary without promising an exactly-once transaction.

**Verification — proposed `verify:polling:delivery-reentrancy`:** Pause or dispose during delivery and replace a command from its callback. Expect the documented checkpoint boundary, no acknowledgment of a newer revision by an older response and no scheduling after disposal.

## 5 Command selection and capacity behavior

**Estimate: 2 hours. Status: pending.**

- Add reusable keyed-command and latest-value helpers without imposing one global priority.
- Expose duplicate, replacement and capacity outcomes through typed return values rather than error-message parsing.

**Verification — proposed `verify:polling:command-selection`:** Queue overlapping commands during requests, cadence waits and retry waits. Expect bounded state, stable selection and acknowledgment only of the delivered revision.

## 6 Useful errors with controlled detail

**Estimate: 2 hours. Status: pending.**

- Distinguish operation, protocol, delivery and invalid-configuration failures through a small public category.
- Keep request data out of default errors; make any extra diagnostic detail an explicit caller policy.

**Verification — proposed `verify:polling:failure-categories`:** Trigger every category and inject sentinel values into thrown errors and response objects. Expect the correct category, one terminal notification and no sentinel in default diagnostics.

## 7 Type inference and adapter contracts

**Estimate: 2 hours. Status: pending.**

- Improve inference for command-free sessions and protocols with typed cursors.
- Add packed-declaration fixtures for valid combinations and useful errors for incompatible types.

**Verification — proposed `verify:polling:inference`:** Compile clean consumers. Expect correctly inferred snapshots and compile-time errors for wrong commands, cursor types and response fields.

## 8 Small background status protocol

**Estimate: 2 hours. Status: pending.**

- Add an optional helper for task-status responses with a cursor, completion flag and next interval.
- Keep the helper separate so custom protocols and existing consumers need no migration.

**Verification — proposed `verify:polling:status-protocol`:** Replay pending, running, unchanged and complete responses. Expect correct cursor progression, the minimum cadence and no ordinary poll after completion.

## 9 Fetch adapter

**Estimate: 2 hours. Status: pending.**

- Add an injected-fetch adapter with explicit request construction, status handling and response parsing.
- Forward cancellation and keep retries in the session policy rather than retrying at two layers.

**Verification — proposed `verify:polling:fetch-adapter`:** Use fake fetch for success, malformed JSON, 4xx, transient 5xx and abort. Expect the supplied signal, documented failure classification and one fetch per session attempt.

## 10 End to end task example

**Estimate: 1 hours. Status: pending.**

- Extend the existing demonstration to use the status helper and fetch adapter against a local synthetic endpoint.
- Show pause, resume and manual refresh with a predictable transcript.

**Verification — proposed `verify:polling:task-example`:** Start the example on an ephemeral port and drive its full lifecycle. Expect the final state, no duplicated accepted update and clean server shutdown without any external account.

## 11 Browser lifecycle example

**Estimate: 2.5 hours. Status: pending.**

- Add an example that pauses on a hidden tab, resumes on visibility and disposes when the view is removed.
- Keep document events and DOM access in the example adapter, outside the core.

**Verification — proposed `verify:polling:browser-lifecycle`:** Hide, show and remove a synthetic task view in a browser test. Expect no new request while paused and no owned timer or event listener after disposal.

## 12 Browser package compatibility

**Estimate: 2.5 hours. Status: pending.**

- Verify the ESM entry in a browser bundler and real browser using the examples.
- Document tested runtimes and fix any Node-only import or declaration assumption those consumers expose.

**Verification — proposed `verify:polling:browser-package`:** Bundle a clean consumer and exercise retries, command replacement and pause/resume. Expect no Node polyfill, import side effect or lifecycle divergence from Node tests.

## 13 Resource cleanup tests

**Estimate: 2 hours. Status: pending.**

- Instrument timers, abort listeners and operation references across repeated session lifecycles.
- Cover success, failure and cancellation without relying on a flaky heap-size threshold.

**Verification — proposed `verify:polling:resource-cleanup`:** Repeat lifecycle cycles with rejecting and unresolved operations. Expect zero owned timers and listeners after settlement and no unhandled rejection.

## 14 API guide from executable examples

**Estimate: 1 hours. Status: pending.**

- Write recipes for custom protocols, manual refresh, recovery through a new session and a caller-owned result store.
- Run the snippets as fixtures so documentation stays aligned with exports.

**Verification — proposed `verify:polling:documentation`:** Compile and execute every recipe. Expect its stated results and cleanup behavior without undocumented imports or private helpers.

## 15 Release candidate checks

**Estimate: 2 hours. Status: pending.**

- Prepare a versioned candidate, changelog and supported runtime notes after the milestone behavior exists.
- Validate custom-protocol and status-adapter consumers from the tarball; keep package publication a separate explicit action.

**Verification — proposed `verify:polling:release-candidate`:** Install the tarball in clean Node and browser consumers. Expect valid exports, license and declarations, no undeclared dependency and all prior acceptance checks passing. Confirm an earlier consumer still works after returning to the previous release.

## Beyond this milestone

Persistent restoration, cross-tab coordination and richer scheduling policies remain possible future directions. They are outside this estimate and should be justified by actual usage before work starts.
