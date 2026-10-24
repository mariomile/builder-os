// Every move the process describes, the script can make: a first run, back to a paused initiative, a new cycle
// from phase 0, a forced jump back or forward. With the guard on state.json, a missing move is a dead end.
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

const run = (root, ...args) => spawnSync(process.execPath, [SCRIPT, ...args, '--root', root], { encoding: 'utf8' });
function project() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'bos-move-'));
  fs.cpSync(FIXTURE, root, { recursive: true });
  return root;
}
const state = (root, slug = 'csv-export') => JSON.parse(fs.readFileSync(path.join(root, '.builderos/initiatives', slug, 'state.json'), 'utf8'));

test('init prepares the memory without inventing PRODUCT.md, and new works right after', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'bos-init-'));
  assert.equal(run(root, 'new', 'first', '--track', 'product').status, 2);
  const r = run(root, 'init');
  assert.equal(r.status, 0, r.stderr);
  assert.match(r.stdout, /Still to write with the person: PRODUCT\.md, TECH\.md/);
  assert.ok(!fs.existsSync(path.join(root, 'PRODUCT.md')));
  for (const d of ['decisions', 'evidence', 'initiatives']) assert.ok(fs.existsSync(path.join(root, '.builderos', d)), d);
  assert.match(fs.readFileSync(path.join(root, '.gitignore'), 'utf8'), /\.builderos\/local\.json\n\.builderos\/media\//);
  run(root, 'init');
  assert.equal((fs.readFileSync(path.join(root, '.gitignore'), 'utf8').match(/local\.json/g) || []).length, 1, 'init twice adds nothing twice');
  assert.equal(run(root, 'new', 'first', '--track', 'product', '--reason', 'new idea').status, 0);
});

test('resume makes a paused initiative active again, and the message line speaks for it', () => {
  const root = project();
  assert.equal(run(root, 'new', 'date-sort', '--track', 'change', '--reason', 'bug').status, 0);
  assert.equal(state(root).status, 'paused');
  const r = run(root, 'resume', 'csv-export');
  assert.equal(r.status, 0, r.stderr);
  assert.equal(state(root).status, 'open');
  assert.equal(state(root, 'date-sort').status, 'paused');
  assert.equal(state(root).history.at(-1).event, 'initiative_switched');
  const ctx = spawnSync(process.execPath, [SCRIPT, 'context', '--root', root], { encoding: 'utf8', input: '{}' }).stdout;
  assert.match(JSON.parse(ctx).hookSpecificOutput.additionalContext, /CSV export|csv-export/);
  assert.equal(run(root, 'resume', 'nope').status, 2);
});

test('reframe starts a new cycle at phase 0 and keeps the history', () => {
  const root = project();
  const before = state(root).history.length;
  assert.equal(run(root, 'reframe').status, 2, 'needs the reason');
  assert.equal(run(root, 'reframe', '--reason', 'discovery reshaped: managers export for the board, not for Monday').status, 0);
  const s = state(root);
  assert.equal(s.current_phase, 0);
  assert.equal(s.cycle, 2);
  assert.equal(s.phases['2'].status, 'pending');
  assert.equal(s.history.length, before + 1);
  assert.doesNotMatch(run(root, 'brief').stdout, /does not follow the schema/);
});

test('jump back reopens phases; jump forward records the jumped phases as overridden, shown in the briefing', () => {
  const root = project();
  assert.equal(run(root, 'jump', '1').status, 2, 'needs the reason');
  assert.equal(run(root, 'jump', '1', '--reason', 'Dana: "the evidence was one account"').status, 0);
  assert.equal(state(root).current_phase, 1);
  assert.equal(state(root).phases['2'].status, 'pending');
  assert.equal(run(root, 'jump', '4', '--reason', 'Dana: "the spec is already agreed with the customer"').status, 0);
  const s = state(root);
  assert.equal(s.current_phase, 4);
  assert.equal(s.phases['2'].gate.overridden, true);
  assert.equal(s.history.at(-1).event, 'phase_jump');
  const brief = run(root, 'brief').stdout;
  assert.match(brief, /Overrides in force: phase 1 \(not run\); phase 2 \(not run\); phase 3 \(not run\)/);
  assert.doesNotMatch(brief, /does not follow the schema/);
});
