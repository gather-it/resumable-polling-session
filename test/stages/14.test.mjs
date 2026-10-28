import test from 'node:test';
import assert from 'node:assert/strict';
import * as api from '../../dist/index.js';
import * as h from '../helpers.mjs';
test('completed protocol accepts later commands and observer failure is isolated',async()=>{let calls=0;const s=h.session({onEvent:()=>{throw new Error()},operation:async()=>{calls++;return {complete:true}}});s.resume();await h.tick();assert.equal(s.snapshot().complete,true);s.enqueue('later','command');await h.tick();assert.equal(calls,2);assert.equal(s.snapshot().pending.length,0);s.dispose()});
