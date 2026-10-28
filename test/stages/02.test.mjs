import test from 'node:test';
import assert from 'node:assert/strict';
import * as api from '../../dist/index.js';
import * as h from '../helpers.mjs';
test('scope is captured and cannot be changed by selector mutation',async()=>{const scope={id:'first'},seen=[];const s=h.session({scope,protocol:{...h.protocol,select:state=>{seen.push(state.scope.id);state.scope.id='changed';return h.protocol.select(state)}}});scope.id='outside';s.resume();await h.tick();assert.deepEqual(seen,['first','first']);s.dispose()});
