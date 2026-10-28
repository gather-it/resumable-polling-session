import test from 'node:test';
import assert from 'node:assert/strict';
import * as api from '../../dist/index.js';
import * as h from '../helpers.mjs';
test('checkpoint advancement follows accepted response',async()=>{const gate=h.deferred();const s=h.session({onResponse:()=>gate.promise});s.resume();await h.tick();assert.equal(s.snapshot().cursor,0);gate.resolve();await h.tick();assert.equal(s.snapshot().cursor,1);s.dispose()});
