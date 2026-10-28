import test from 'node:test';
import assert from 'node:assert/strict';
import * as api from '../../dist/index.js';
import * as h from '../helpers.mjs';
test('selection does not consume commands',()=>{const q=api.createCommands();q.add('a','a');const before=q.snapshot();const state={scope:{},cursor:0,initial:false,complete:true,commands:q.snapshot()};assert.equal(h.protocol.select(state).request,'a');assert.deepEqual(q.snapshot(),before)});
