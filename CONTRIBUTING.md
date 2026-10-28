# Contributing

Use Node 24 or later. Install dependencies with `npm ci --ignore-scripts`, then run `npm run check`. `npm run demo` exercises the current protocol without an external service.

For a scheduler bug, include the control-call sequence, when each operation settles, expected responses and actual cursor. Use deferred promises or a controlled clock instead of increasing real-time sleeps. Keep regression tests with the feature they exercise.

Source lives in `src`; generated `dist` output is ignored by Git. Tests build it first. Public type fixtures live in `test/types`, and examples are checked by `npm run typecheck:examples`. The final existing stage packs the artifact and exercises it in a fresh offline consumer.

Follow [ROADMAP.md](ROADMAP.md). Keep changes small enough that the package works after each merge. Update the changelog when behavior or public types change. Preserve current defaults unless a migration is documented with the change.

Use synthetic fixtures. Do not commit credentials, tokens, private endpoints or real personal data. Environment files, private keys and build output are ignored. Revoke any accidentally committed secret and remove it from history before publishing that history.

Preserve real Git history. Do not backdate commits or describe test groups as historical releases. Commit with an email linked to your GitHub account; a linked GitHub noreply address is sufficient.
