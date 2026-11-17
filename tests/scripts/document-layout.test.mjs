import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

// Four documents per initiative (BRIEF, SPEC, PLAN, RESULT) and LOG.md, one CHANGE.md for a change, each phase a
// "# Part" of its file. Gates read the same conditions on either layout; the thread sits on top of BRIEF.md or
// CHANGE.md; a word cap keeps each part readable.
const script = new URL('../../scripts/bos.mjs', import.meta.url).pathname;
const fixtures = new URL('../fixtures/', import.meta.url).pathname;
function project(t, name) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'bos-layout-'));
  fs.cpSync(path.join(fixtures, name), root, { recursive: true });
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const file = (rel) => path.join(root, rel);
  const write = (rel, s) => { fs.mkdirSync(path.dirname(file(rel)), { recursive: true }); fs.writeFileSync(file(rel), s); };
  const edit = (rel, fn) => fs.writeFileSync(file(rel), fn(fs.readFileSync(file(rel), 'utf8')));
  const run = (...a) => spawnSync(process.execPath, [script, ...a, '--root', root], { encoding: 'utf8' });
  const read = (rel) => fs.readFileSync(file(rel), 'utf8');
  const exists = (rel) => fs.existsSync(file(rel));
  const gate = (n, slug) => JSON.parse(run('gate', String(n), '--json', '--initiative', slug).stdout);
  return { root, write, edit, run, read, exists, gate };
}
const verdicts = (g) => g.results.filter((r) => !['E.4', 'E.5'].includes(r.id)).map((r) => `${r.id}:${r.status}`).join(' ');
const THREAD = '**Building:** a reminder that cuts no-shows\n**Why:** clinics lose a slot a day to patients who forget `[assumption:unvalidated]`\n';
const INTENT = '**For:** the front desk of a small clinic\n**Done when:** I see tomorrow\'s patients confirmed or flagged on one screen\n**Not:** a booking system\n';

test('migrating to the four documents changes no gate verdict, and leaves the thread to write', (t) => {
  const p = project(t, 'hollow');
  const before = [0, 1, 2, 3, 4, 5, 6].map((n) => verdicts(p.gate(n, 'no-show')));
  const r = p.run('migrate', '--layout', '--initiative', 'no-show');
  assert.equal(r.status, 0, r.stderr);
  const dir = '.builderos/initiatives/no-show/';
  for (const f of ['BRIEF.md', 'SPEC.md', 'PLAN.md', 'RESULT.md']) assert.ok(p.exists(dir + f), `${f} written`);
  for (const f of ['00-frame.md', '01-discovery.md', '04-spec.md', '05-build-plan.md', 'DESIGN.md']) assert.ok(!p.exists(dir + f), `${f} merged away`);
  assert.match(p.read(dir + 'BRIEF.md'), /^# Frame[\s\S]*^# Discovery[\s\S]*^# Definition[\s\S]*^# (Bet|Solution Bet)/m, 'one part per phase, in order');
  const after = [0, 1, 2, 3, 4, 5, 6].map((n) => verdicts(p.gate(n, 'no-show')));
  assert.deepEqual(after, before, 'the same conditions decide the same way');
  const e4 = p.gate(2, 'no-show').results.find((x) => x.id === 'E.4');
  assert.equal(e4.status, 'fail', 'the thread is not written for the person by the script');
  p.edit(dir + 'BRIEF.md', (md) => md.replace(/\*\*Building:\*\* \{[^\n]*\n\*\*Why:\*\* \{[^\n]*\n/, THREAD));
  assert.equal(p.gate(2, 'no-show').results.find((x) => x.id === 'E.4').status, 'pass');
  assert.match(p.gate(4, 'no-show').artifact, /SPEC\.md → Spec$/, 'the gate names the part it read');
});

test('a build plan keeps the plan, and what the build recorded goes to LOG.md', (t) => {
  const p = project(t, 'hollow');
  p.run('migrate', '--layout', '--initiative', 'no-show');
  const plan = p.read('.builderos/initiatives/no-show/PLAN.md');
  const log = p.read('.builderos/initiatives/no-show/LOG.md');
  assert.match(plan, /^## Slices/m);
  assert.doesNotMatch(plan, /^## (Test output|Demo|Tried)/m);
  assert.match(log, /^## Test output/m);
});

test('a document past its word cap fails E.3, and a change has the lower cap', (t) => {
  const p = project(t, 'acme');
  p.run('new', 'digests', '--track', 'change', '--reason', 'test');
  p.write('.builderos/initiatives/digests/CHANGE.md', `# Change: Digests\n\n${THREAD}\n# Request: Digests\n\n## Request\n${'word '.repeat(450)}\n`);
  const m = p.gate('M', 'digests').results.find((x) => x.id === 'E.3');
  assert.equal(m.status, 'fail', '450 words: within the 600 of a feature, past the 400 of a change');
  assert.match(m.detail, /CHANGE\.md → Request is 4\d\d words, cap 400/);
  p.write('.builderos/initiatives/onboarding-v2/BRIEF.md', `# Brief: Onboarding\n\n${THREAD}\n# Frame\n\n## Problem\n${'word '.repeat(900)}\n`);
  fs.rmSync(path.join(p.root, '.builderos/initiatives/onboarding-v2/00-frame.md'));
  const e3 = p.gate(0, 'onboarding-v2').results.find((x) => x.id === 'E.3');
  assert.equal(e3.status, 'fail');
  assert.match(e3.detail, /BRIEF\.md → Frame is 9\d\d words, cap 800/);
});

test('the status page carries the thread of each initiative: building, why, now', (t) => {
  const p = project(t, 'hollow');
  p.run('migrate', '--layout', '--initiative', 'no-show');
  p.edit('.builderos/initiatives/no-show/BRIEF.md', (md) => md.replace(/\*\*Building:\*\* \{[^\n]*\n\*\*Why:\*\* \{[^\n]*\n/, THREAD));
  p.run('page');
  const html = p.read('.builderos/index.html');
  assert.match(html, /<dt>Building<\/dt><dd>a reminder that cuts no-shows<\/dd>/);
  assert.match(html, /<dt>Why<\/dt><dd>clinics lose a slot a day to patients who forget<\/dd>/);
  assert.match(html, /<dt>Now<\/dt><dd>phase 6 Ship<\/dd>/);
  assert.match(p.read('.builderos/STATUS.md'), /  - Building: a reminder that cuts no-shows/);
});

test('the briefing flags a plan kept outside .builderos and more open initiatives than anyone holds', (t) => {
  const p = project(t, 'acme');
  p.write('docs/PLAN.md', `# Plan\n\n${'where we are and what comes next '.repeat(60)}\n`);
  for (const slug of ['digests', 'alerts']) p.run('new', slug, '--track', 'change', '--reason', 'test');
  const brief = p.run('brief').stdout;
  assert.match(brief, /docs\/PLAN\.md tracks the work outside \.builderos\//);
  assert.match(brief, /\d initiatives are not closed, \d of them paused: finish, close or kill some/);
});
