import test from 'node:test';
import assert from 'node:assert/strict';
import * as api from '../../dist/index.js';
import * as h from '../helpers.mjs';
test('command deduplication and acknowledgment retain newer keys',()=>{const q=api.createCommands();q.add('a',1);q.add('a',2);const old=q.snapshot()[0];q.add('b',3);q.acknowledge(old);assert.deepEqual(q.snapshot().map(c=>c.key),['b'])});
