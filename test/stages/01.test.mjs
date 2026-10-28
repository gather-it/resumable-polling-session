import test from 'node:test';
import assert from 'node:assert/strict';
import * as api from '../../dist/index.js';
import * as h from '../helpers.mjs';
test('session starts only when resumed',async()=>{let calls=0;const s=h.session({operation:async()=>{calls++;return {complete:true}}});await h.tick();assert.equal(calls,0);s.resume();await h.tick();assert.equal(calls,1);s.dispose()});
