// After a release: the version stamped on every gate record, conditions added since a gate passed shown as debt,
// the install doctor, one owner per initiative, rounds recorded with their wait, and provisional work that cannot pass a gate.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { spawnSync } from 'child_process';
import { fileURLToPath } from 'url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(HERE, '../..');
const SCRIPT = path.join(REPO, 'scripts/bos.mjs');
const FIXTURE = path.join(REPO, 'tests/fixtures/acme');

function project() {
  const dir = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), 'bos-own-')));
  fs.cpSync(FIXTURE, dir, { recursive: true });
  return dir;
}
const run = (root, ...args) => {
  const r = spawnSync(process.execPath, [SCRIPT, ...args, '--root', root], { encoding: 'utf8', input: '' });
  return { code: r.status, out: r.stdout, err: r.stderr };
};
const gate = (root, n) => JSON.parse(run(root, 'gate', String(n), '--json').out);
const INIT = (root) => path.join(root, '.builderos/initiatives/csv-export');
const statePath = (root) => path.join(INIT(root), 'state.json');
const state = (root) => JSON.parse(fs.readFileSync(statePath(root), 'utf8'));
const setState = (root, patch) => fs.writeFileSync(statePath(root), JSON.stringify({ ...state(root), ...patch }, null, 2));

// Phase 2 passed in an earlier release: its record lists what was checked then.
function passedPhase2(root, checked) {
  const s = state(root);
  s.current_phase = 3;
  s.phases['2'] = { status: 'passed', artifact: '02-definition.md', gate: { passed: true, checked_at: '2026-09-30T10:00:00Z', checked_by: checked, failed_conditions: [], overridden: false } };
  s.phases['3'] = { status: 'in_progress', artifact: null, gate: null };
  s.history.push({ at: '2026-09-30T10:00:00Z', event: 'gate_passed', phase: 2 });
  fs.writeFileSync(statePath(root), JSON.stringify(s, null, 2));
}

test('the script version equals the package version, and every gate output carries it', () => {
  const pkg = JSON.parse(fs.readFileSync(path.join(REPO, 'package.json'), 'utf8'));
  const declared = fs.readFileSync(SCRIPT, 'utf8').match(/^const VERSION = '([^']+)';/m);
  assert.ok(declared, 'bos.mjs declares VERSION');
  assert.equal(declared[1], pkg.version, 'bump VERSION in scripts/bos.mjs with the manifests');
  const root = project();
  const g = gate(root, 2);
  assert.equal(g.bos_version, pkg.version);
  assert.ok(Array.isArray(g.skipped), 'skipped conditions are listed, so a later release can tell "not applicable" from "not there yet"');
});

test('a condition added after a gate passed is debt in the briefing and the doctor, never a reopened phase', () => {
  const root = project();
  passedPhase2(root, { script: ['E.1', '2.1'], model: [] });
  const brief = run(root, 'brief').out;
  assert.match(brief, /CSV export: \d+ conditions? added since its gates passed (are|is) not met yet \(/);
  assert.match(brief, /debt, not a failure/);
  assert.equal(state(root).current_phase, 3, 'the phase stays passed');
  const doc = run(root, 'doctor');
  assert.match(doc.out, /phase 2 debt \| gate passed 2026-09-30 before gates recorded their version; now owed: /);
  assert.equal(doc.code, 0, 'debt is a warning');
  const now = gate(root, 2);
  passedPhase2(root, { script: now.checked_by.script, model: now.checked_by.model });
  setState(root, { phases: { ...state(root).phases, 2: { ...state(root).phases['2'], gate: { ...state(root).phases['2'].gate, skipped: now.skipped } } } });
  assert.doesNotMatch(run(root, 'brief').out, /added since its gates passed/, 'a record that checked everything owes nothing');
});

test('doctor checks the install and the memory, and fails on a broken state', () => {
  const root = project();
  let d = run(root, 'doctor');
  assert.equal(d.code, 0);
  assert.match(d.out, /✓ \| Node\.js/);
  assert.match(d.out, /✓ \| Hooks \| SessionStart, PreToolUse, UserPromptSubmit/);
  assert.match(d.out, /! \| Project copy \| no \.builderos\/bin\/bos\.mjs/);
  assert.match(d.out, /! \| AGENTS\.md \| missing/);
  run(root, 'vendor');
  assert.match(run(root, 'doctor').out, /✓ \| Project copy \| \.builderos\/bin\/bos\.mjs matches this script/);
  setState(root, { status: 'halfway' });
  d = run(root, 'doctor');
  assert.equal(d.code, 1);
  assert.match(d.out, /✗ \| Initiative csv-export \| state\.json does not follow the schema: status halfway/);
});

test('one owner at a time: a claim, a refusal, a take-over with its reason, a release', () => {
  const root = project();
  assert.equal(run(root, 'claim').code, 2, 'who claims is required');
  assert.equal(run(root, 'claim', '--by', 'Mario').code, 0);
  assert.equal(state(root).claim.by, 'Mario');
  assert.match(run(root, 'brief').out, /phase 2 Define, .*claimed by Mario since \d{4}-\d{2}-\d{2}\./);
  const ctx = JSON.parse(spawnSync(process.execPath, [SCRIPT, 'context', '--root', root], { encoding: 'utf8', input: '{}' }).stdout);
  assert.match(ctx.hookSpecificOutput.additionalContext, /claimed by Mario .*: work on it only as that person or with their release/);
  const refused = run(root, 'claim', '--by', 'Luca');
  assert.equal(refused.code, 2);
  assert.match(refused.err, /claimed by Mario since .*--take --reason/);
  assert.equal(run(root, 'claim', '--by', 'Luca', '--take').code, 2, 'a take-over needs its reason');
  assert.equal(run(root, 'claim', '--by', 'Luca', '--take', '--reason', 'Mario is on leave until November').code, 0);
  assert.deepEqual(state(root).history.at(-1).event, 'claim_taken');
  assert.equal(state(root).history.at(-1).from, 'Mario');
  assert.equal(run(root, 'claim', '--by', 'Luca', '--release').code, 0);
  assert.equal(state(root).claim, null);
  assert.deepEqual(run(root, 'doctor').out.match(/Initiative csv-export \| [^|]+/)[0].trim(), 'Initiative csv-export | open, phase 2 Define, unclaimed');
});

test('a round is asked, then answered by a person; the briefing works ahead while it waits and pace reads the wait', () => {
  const root = project();
  assert.equal(run(root, 'round', '--asked', '5').code, 2, 'at most four questions');
  assert.equal(run(root, 'round', '--asked', '3').code, 0);
  assert.match(run(root, 'brief').out, /Next: the round asked .* waits for the person; meanwhile draft ahead on its recommended options, each block marked provisional/);
  assert.equal(run(root, 'round', '--asked', '2').code, 2, 'one open round at a time');
  assert.equal(run(root, 'round', '--answered', '1B, 2A, 3A', '--by', 'agent').code, 2, 'the agent does not answer');
  assert.equal(run(root, 'round', '--answered', '1B, 2A, 3A', '--by', 'Mario').code, 0);
  const last = state(root).history.at(-1);
  assert.equal(last.event, 'round_answered');
  assert.equal(last.answers, '1B, 2A, 3A');
  assert.equal(typeof last.waited_hours, 'number');
  assert.doesNotMatch(run(root, 'brief').out, /waits for the person/);
  assert.match(run(root, 'pace').out, /\*\*Rounds:\*\* 1 asked, 1 answered with a recorded wait; median wait/);
  assert.equal(run(root, 'doctor').code, 0, 'the new events follow the schema');
});

test('provisional work drafted ahead fails E.2 until the answer confirms or discards it', () => {
  const root = project();
  const file = path.join(INIT(root), '02-definition.md');
  const base = fs.readFileSync(file, 'utf8');
  assert.equal(gate(root, 2).results.find((r) => r.id === 'E.2').status, 'pass');
  fs.writeFileSync(file, base + '\n**Provisional:** drafted on the recommended option of round 2, question 1; not chosen yet.\nThe target is 25% of managers exporting weekly.\n');
  const g = gate(root, 2);
  assert.equal(g.results.find((r) => r.id === 'E.2').status, 'fail');
  assert.ok(g.failed.includes('E.2'));
  fs.writeFileSync(file, base + '\n```markdown\n**Provisional:** an example inside a code fence does not count\n```\n');
  assert.equal(gate(root, 2).results.find((r) => r.id === 'E.2').status, 'pass');
});
