// A test is a decision, not a ritual: an initiative can be killed at the phase it is in, an override waives
// conditions by name and never several at once by accident, and the appetite of the bet is a circuit breaker
// the briefing shows every session.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { spawnSync } from 'child_process';
import { fileURLToPath } from 'url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SCRIPT = path.resolve(HERE, '../../scripts/bos.mjs');
const FIXTURE = path.resolve(HERE, '../fixtures/acme');

function project() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'bos-decide-'));
  fs.cpSync(FIXTURE, root, { recursive: true });
  return root;
}
const run = (root, ...args) => spawnSync(process.execPath, [SCRIPT, ...args, '--root', root], { encoding: 'utf8' });
const JUDGED = ['--judged', '2.5=pass,2.6=pass'];
const DIR = (root) => path.join(root, '.builderos/initiatives/csv-export');
const state = (root) => JSON.parse(fs.readFileSync(path.join(DIR(root), 'state.json'), 'utf8'));
const setState = (root, patch) => fs.writeFileSync(path.join(DIR(root), 'state.json'), JSON.stringify({ ...state(root), ...patch }, null, 2));
const daysAgo = (n) => new Date(Date.now() - n * 86400000).toISOString();

test('record --kill closes the initiative at the phase it is in, with the reason', () => {
  const root = project();
  assert.notEqual(run(root, 'record', '2', '--kill', '').status, 0, 'a kill needs its reason');
  const r = run(root, 'record', '2', '--kill', 'Dana: "the pilot teams never opened it"');
  assert.equal(r.status, 0, r.stderr);
  const s = state(root);
  assert.equal(s.status, 'closed');
  assert.equal(s.phases['2'].status, 'killed');
  assert.deepEqual(s.history.at(-1).verdict, 'killed');
  assert.match(fs.readFileSync(path.join(root, '.builderos/ROADMAP.md'), 'utf8'), /killed at phase 2/);
  assert.notEqual(run(root, 'record', '2', '--kill', 'again').status, 0, 'a closed initiative records nothing more');
});

test('an override waives conditions by name: several failures need --waive, and only failed ones can be named', () => {
  const root = project();
  fs.writeFileSync(path.join(DIR(root), '02-definition.md'), '# Definition\n\nnothing yet\n');
  const failed = JSON.parse(run(root, 'gate', '2', '--json').stdout).failed;
  assert.ok(failed.length > 1, failed.join(', '));
  const blanket = run(root, 'record', '2', ...JUDGED, '--override', 'deadline');
  assert.equal(blanket.status, 2);
  assert.match(blanket.stderr, new RegExp(`--waive ${failed.join(',').replace(/\./g, '\\.')}`));
  assert.match(run(root, 'record', '2', ...JUDGED, '--override', 'deadline', '--waive', '9.9').stderr, /did not fail: 9\.9/);
  const partial = run(root, 'record', '2', ...JUDGED, '--override', 'deadline', '--waive', failed[0]);
  assert.equal(partial.status, 1, 'the conditions left unwaived still fail the gate');
  assert.match(partial.stdout, /waived: /);
  assert.equal(state(root).current_phase, 2);
});

test('the briefing counts the appetite of the bet, and past it asks for a decision', () => {
  const root = project();
  fs.writeFileSync(path.join(DIR(root), '03-solution-bet.md'), '# Solution Bet\n\n## Bet size\n**Appetite:** 10 days\n');
  const history = [...state(root).history, { at: daysAgo(4), event: 'gate_passed', phase: 3 }];
  setState(root, { current_phase: 5, history });
  assert.match(run(root, 'brief').stdout, /Appetite: 4 of 10 days spent since the bet/);
  setState(root, { history: [...state(root).history.slice(0, -1), { at: daysAgo(14), event: 'gate_passed', phase: 3 }] });
  const out = run(root, 'brief').stdout;
  assert.match(out, /Appetite spent: 14 days since the bet against 10 declared/);
  assert.match(out, /record --kill/);
  const ctx = spawnSync(process.execPath, [SCRIPT, 'context', '--root', root], { encoding: 'utf8', input: '{}' }).stdout;
  assert.match(JSON.parse(ctx).hookSpecificOutput.additionalContext, /Appetite spent/);
});
