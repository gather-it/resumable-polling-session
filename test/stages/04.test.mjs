import test from 'node:test';
import assert from 'node:assert/strict';
import * as api from '../../dist/index.js';
import * as h from '../helpers.mjs';
test('pause cancels active wait and disposal clears commands',async()=>{let now=0;const gate=h.deferred();const s=h.session({now:()=>now,operation:async()=>({complete:false,delay:100}),delay:(_ms,signal)=>new Promise((resolve,reject)=>{signal.addEventListener('abort',()=>{gate.resolve();reject(new Error())},{once:true})})});s.resume();await h.tick();s.pause();await gate.promise;assert.equal(s.snapshot().mode,'paused');s.enqueue('one',1);s.dispose();assert.equal(s.snapshot().pending.length,0)});
