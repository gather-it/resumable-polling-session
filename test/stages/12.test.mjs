import test from 'node:test';
import assert from 'node:assert/strict';
import * as api from '../../dist/index.js';
import * as h from '../helpers.mjs';
test('minimum cadence is measured after delivery',async()=>{let now=0,calls=0;const waits=[];const s=h.session({now:()=>now,operation:async()=>({complete:++calls===2,delay:25}),onResponse:()=>{now+=5},delay:async ms=>{waits.push(ms);now+=ms}});s.resume();await h.tick();assert.deepEqual(waits,[25]);assert.equal(calls,2);s.dispose()});

test('only interruptible cadence can be woken by a command',async()=>{
 for(const interruptible of [true,false]) {
  let now=0,calls=0,aborted=false;let release;
  const s=h.session({now:()=>now,protocol:{...h.protocol,select:state=>{const work=h.protocol.select(state);if(work?.request==='poll')work.interruptible=interruptible;return work}},
   operation:async()=>({complete:++calls>=2,delay:100}),
   delay:(ms,signal)=>new Promise((resolve,reject)=>{release=()=>{now+=ms;resolve()};signal.addEventListener('abort',()=>{aborted=true;reject(new Error())},{once:true})})});
  s.resume();await h.tick();s.enqueue('a','action');await h.tick();
  assert.equal(aborted,interruptible);
  if(!interruptible){release();await h.tick()}
  assert.ok(calls>=2);s.dispose();
 }
});
