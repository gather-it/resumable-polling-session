import test from 'node:test';
import assert from 'node:assert/strict';
import * as api from '../../dist/index.js';
import * as h from '../helpers.mjs';
test('late responses from paused generation cannot deliver',async()=>{const gate=h.deferred();let calls=0;const delivered=[];const s=h.session({operation:async()=>++calls===1?gate.promise:{complete:true},onResponse:r=>delivered.push(r)});s.resume();await h.tick();s.pause();s.resume();gate.resolve({old:true});await h.tick();assert.equal(delivered.length,1);assert.equal(delivered[0].old,undefined);s.dispose()});
