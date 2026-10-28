import test from 'node:test';
import assert from 'node:assert/strict';
import * as api from '../../dist/index.js';
import * as h from '../helpers.mjs';
test('failed delivery preserves checkpoint and reports safe terminal error',async()=>{const errors=[];const s=h.session({onResponse:()=>{throw new Error('private-sentinel')},onError:e=>errors.push(e.message)});s.resume();await h.tick();assert.equal(s.snapshot().cursor,0);assert.equal(s.snapshot().mode,'failed');assert.deepEqual(errors,['Polling operation failed'])});
