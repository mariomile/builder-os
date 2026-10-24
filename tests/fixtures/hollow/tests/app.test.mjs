import test from 'node:test';
import assert from 'node:assert';
import { confirm } from '../src/app.mjs';
test('confirm marks the slot confirmed', () => { assert.equal(confirm({}).status, 'confirmed'); });
