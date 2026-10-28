import test from 'node:test';
import assert from 'node:assert/strict';
import * as api from '../../dist/index.js';
import * as h from '../helpers.mjs';
test('retry execution respects exact budget and abort',async()=>{let calls=0;const waits=[];const controller=new AbortController();await assert.rejects(api.retry(async()=>{calls++;throw new Error()}, {maxAttempts:10,shouldRetry:()=>true,delayMs:n=>150*2**n,signal:controller.signal,delay:async ms=>{waits.push(ms)}}));assert.equal(calls,10);assert.equal(waits[0],300);assert.equal(waits.length,9)});
