import test from 'node:test';
import assert from 'node:assert/strict';
import * as api from '../../dist/index.js';
import * as h from '../helpers.mjs';
test('bounded commands and terminal disposal preserve session independence',async()=>{const one=h.session({maxPendingCommands:1}),two=h.session();one.enqueue('a',1);assert.throws(()=>one.enqueue('b',2),/capacity/);one.dispose();one.resume();two.resume();await h.tick();assert.equal(one.snapshot().mode,'disposed');assert.equal(two.snapshot().cursor,1);two.dispose()});

test('packed artifact installs offline and runs in a clean consumer', t => h.verifyPacked(t, "import assert from 'node:assert/strict';import {createSession} from 'resumable-polling-session';let delivered=0;const s=createSession({scope:{},cursor:0,protocol:{select:x=>x.complete?undefined:{request:0},advance:c=>({cursor:c+1,complete:true})},operation:async()=>1,onResponse:()=>{delivered++}});s.resume();await new Promise(r=>setImmediate(r));assert.equal(delivered,1);assert.equal(s.snapshot().cursor,1);s.dispose();"));
