import test from 'node:test';
import assert from 'node:assert/strict';
import * as api from '../../dist/index.js';
import * as h from '../helpers.mjs';
test('scheduler never overlaps transport operations',async()=>{const gate=h.deferred();let active=0,peak=0,calls=0;const s=h.session({operation:async()=>{active++;peak=Math.max(peak,active);calls++;if(calls===1)await gate.promise;active--;return {complete:true}}});s.resume();s.resume();await h.tick();s.enqueue('a','a');s.enqueue('b','b');gate.resolve();await h.tick();assert.equal(peak,1);assert.equal(calls,3);s.dispose()});
