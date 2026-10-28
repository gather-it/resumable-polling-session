import test from 'node:test';
import assert from 'node:assert/strict';
import * as api from '../../dist/index.js';
import * as h from '../helpers.mjs';
test('terminal lifecycle states ignore resume',()=>{for(const mode of ['disposed','failed'])assert.equal(api.transition(mode,'resume'),mode);assert.equal(api.transition('idle','pause'),'idle');assert.equal(api.transition('active','pause'),'paused')});
