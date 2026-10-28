import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
import {createSession} from '../dist/index.js';

test('manifest, root license and public package contents agree', () => {
  const manifest = JSON.parse(readFileSync(new URL('../package.json', import.meta.url)));
  const license = readFileSync(new URL('../LICENSE', import.meta.url), 'utf8');
  assert.equal(manifest.license, 'MIT');
  assert.match(license, /^MIT License/m);
  assert.match(license, /Permission is hereby granted, free of charge/);
  assert.ok(manifest.files.includes('LICENSE'));
});

test('background task example runs without a network connection', () => {
  const result = spawnSync(process.execPath, ['examples/background-task.mjs'], {
    cwd: new URL('../', import.meta.url), encoding: 'utf8', timeout: 10000,
  });
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /Delivered 1: queued/);
  assert.match(result.stdout, /Delivered 3: complete/);
  assert.match(result.stdout, /Checkpoint: 3; attempts: 4/);
});

test('one session can fail without affecting another session', async () => {
  const common = {
    scope: {}, cursor: 0,
    protocol: {
      select: state => state.complete ? undefined : {request: 0},
      advance: cursor => ({cursor: cursor + 1, complete: true}),
    },
    onResponse: () => {},
  };
  const failing = createSession({...common, operation: async () => { throw new Error('synthetic failure'); }});
  const healthy = createSession({...common, operation: async () => 1});
  failing.resume(); healthy.resume();
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(failing.snapshot().mode, 'failed');
  assert.equal(healthy.snapshot().cursor, 1);
  healthy.dispose(); failing.dispose();
});
