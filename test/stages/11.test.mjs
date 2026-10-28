import test from 'node:test';
import assert from 'node:assert/strict';
import * as api from '../../dist/index.js';
import * as h from '../helpers.mjs';
test('acknowledging an old command cannot delete its replacement',()=>{const q=api.createCommands();q.add('range',1);const old=q.snapshot()[0];q.add('range',2,true);q.acknowledge(old);assert.equal(q.snapshot()[0].value,2);assert.notEqual(q.snapshot()[0].revision,old.revision)});
