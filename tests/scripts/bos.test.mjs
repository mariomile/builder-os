// Tests for scripts/bos.mjs. Run: node --test tests/scripts/
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
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'bos-'));
  fs.cpSync(FIXTURE, dir, { recursive: true });
  return dir;
}
function run(root, ...args) {
  const r = spawnSync(process.execPath, [SCRIPT, ...args, '--root', root], { encoding: 'utf8' });
  return { code: r.status, out: r.stdout, err: r.stderr };
}
function gate(root, n, ...extra) {
  const r = run(root, 'gate', String(n), '--json', ...extra);
  const j = JSON.parse(r.out);
  const by = Object.fromEntries(j.results.map((x) => [x.id, x.status]));
  return { ...j, by, code: r.code };
}
const INIT = (root, slug = 'csv-export') => path.join(root, '.builderos/initiatives', slug);
const write = (root, file, body, slug) => fs.writeFileSync(path.join(INIT(root, slug), file), body);
const evidence = (root, name, slug) => fs.writeFileSync(path.join(INIT(root, slug), 'evidence', name + '.md'), `# ${name}\n\n**Class:** interview\n**Captured:** 2026-09-01\n\nRaw notes from the conversation, long enough to count as material.\n`);

test('brief names the active initiative and flags the overdue review and the stale roadmap', () => {
  const r = run(project(), 'brief');
  assert.match(r.out, /CSV export \(feature track, cycle 1\): phase 2 Define/);
  assert.match(r.out, /Also open: Onboarding rework/);
  assert.match(r.out, /Attention: outcome review for CSV export was due 2026-09-10/);
  assert.match(r.out, /ROADMAP\.md shows csv-export at phase 1/);
  assert.ok(r.out.trim().split('\n').length <= 6);
});

test('brief asks which initiative when none is active and several are open', () => {
  const root = project();
  fs.rmSync(path.join(root, '.builderos/local.json'));
  assert.match(run(root, 'brief').out, /2 open initiatives and none active/);
});

test('coverage check passes on an evidenced PRODUCT.md and fails on an assumed one', () => {
  const root = project();
  assert.equal(gate(root, 'C').code, 0);
  const p = path.join(root, 'PRODUCT.md');
  fs.writeFileSync(p, fs.readFileSync(p, 'utf8').replace('`[interview:P4,P6]`', '`[assumption:unvalidated]`'));
  const g = gate(root, 'C');
  assert.equal(g.by['C.3'], 'fail');
  assert.equal(g.by['C.4'], 'judge');
});

test('gate 0 fails on solution language and on tags with no evidence file', () => {
  const g = gate(project(), 0, '--initiative', 'onboarding-v2');
  assert.equal(g.by['E.1'], 'fail');
  assert.equal(g.by['0.1'], 'fail');
  assert.equal(g.by['0.2'], 'pass');
  assert.deepEqual(g.checked_by.model, ['0.3', '0.4']);
  assert.equal(g.code, 1);
});

test('gate 1 counts distinct primary sources, and doc-only counts go to the model', () => {
  const root = project();
  const body = (tagsLine) => `# Discovery\n\n## Evidence\n${tagsLine}\n\n## Disconfirming evidence\n**Sought:** managers who like the spreadsheet\n**Found:** two did \`[interview:P1]\`\n\n## JTBD\nWhen Monday starts, I want to see the pipeline, so I can run the meeting. \`[interview:P1]\`\n\n## Verdict\n**VALIDATED** — five of six confirmed \`[interview:P1,P4,P6,P7,P8]\`\n`;
  for (const p of ['P7', 'P8']) evidence(root, p);
  write(root, '01-discovery.md', body('Pain confirmed `[interview:P1,P4,P6,P7,P8]`.'));
  let g = gate(root, 1);
  assert.equal(g.by['1.2'], 'pass');
  assert.equal(g.by['1.3'], 'pass');
  assert.equal(g.by['1.4'], 'pass');
  write(root, '01-discovery.md', body('Pain confirmed `[interview:P1]` `[doc:t1]` `[doc:t2]` `[doc:t3]` `[doc:t4]`.').replace('[interview:P1,P4,P6,P7,P8]', '[interview:P1]'));
  for (const d of ['t1', 't2', 't3', 't4']) evidence(root, d);
  g = gate(root, 1);
  assert.equal(g.by['1.2'], 'judge');
});

test('gate 2 passes on the fixture definition in lite mode', () => {
  const g = gate(project(), 2);
  assert.equal(g.code, 0);
  assert.equal(g.failed.length, 0);
});

test('gate 3 checks kill criteria and the cheap-test rule', () => {
  const root = project();
  const bet = (order) => `# Solution Bet\n\n## Options\n| # | Option | Primary user action | Impact | Confidence | Effort | Reversibility |\n|---|---|---|---|---|---|---|\n| 1 | CSV | the user downloads | h | \`[interview:P1]\` | s | high |\n| 2 | Email | the user subscribes | m | \`[interview:P4]\` | m | high |\n\n## Kill criteria\nOn 2026-12-01, if weekly exports are below 15% of managers, we stop.\n**Measured by:** export_completed\n\n## Cheapest test\n**Test cost:** 1 days · **Build cost:** 10 days · **Ratio:** 10%\n**Order:** ${order}\n`;
  write(root, '03-solution-bet.md', bet('build first'));
  let g = gate(root, 3);
  assert.equal(g.by['3.2'], 'pass');
  assert.equal(g.by['3.4'], 'fail');
  write(root, '03-solution-bet.md', bet('test first, a fake door for one week'));
  g = gate(root, 3);
  assert.equal(g.by['3.4'], 'pass');
});

const SPEC = (model) => `# Spec\n\n## Out of scope\n| Item | Kind | Reason |\n|---|---|---|\n| XLSX | not now | CSV first |\n\n## Acceptance criteria\n| # | Criterion | Flow |\n|---|---|---|\n| 1 | A manager downloads the weekly view as CSV | export |\n| 2 | The file has one row per open deal | export |\n\n## States\n| Flow / step | Empty | Loading | Partial | Error | Success | Permission |\n|---|---|---|---|---|---|---|\n| export | no deals message | spinner | partial note | retry | file saved | hidden |\n\n**Model output:** ${model ? 'yes' : 'no'}\n\n## Eval set\n${model ? 'evals/summary.md · judge: rubric applied by a grader model · threshold: 85% · must-pass: cases 3 and 7' : ''}\n\n## Tracking plan\n| Event | Trigger | Properties | Measures | New or existing |\n|---|---|---|---|---|\n| export_completed | download | rows | exports | new |\n\n**Computes the phase 2 metric:** managers with one export_completed per week\n`;
const DESIGN = '# Design\n\n## Accessibility floor\nKeyboard path through the export button, contrast 4.5:1, focus returns to the button.\n';

test('gate 4 skips the eval conditions without model output and enforces them with it', () => {
  const root = project();
  write(root, '04-spec.md', SPEC(false));
  write(root, 'DESIGN.md', DESIGN);
  let g = gate(root, 4);
  assert.equal(g.by['4.2'], 'pass');
  assert.equal(g.by['4.3'], 'pass');
  assert.equal(g.by['4.5'], 'pass');
  assert.equal(g.by['4.6'], 'skip');
  write(root, '04-spec.md', SPEC(true));
  g = gate(root, 4);
  assert.equal(g.by['4.6'], 'fail');
  fs.mkdirSync(path.join(INIT(root), 'evals'));
  const rows = Array.from({ length: 12 }, (_, i) => `| ${i + 1} | input ${i + 1} | must mention the deal count | rubric | ${i === 2 || i === 6 ? 'yes' : 'no'} |`).join('\n');
  fs.writeFileSync(path.join(INIT(root), 'evals/summary.md'), `# Eval\n\n| # | Input | Expected | Judge | Must pass |\n|---|---|---|---|---|\n${rows}\n`);
  g = gate(root, 4);
  assert.equal(g.by['4.6'], 'pass', 'lite mode needs 10 cases');
});

test('gate 5 maps every criterion, reads pasted output and the eval pass rate', () => {
  const root = project();
  write(root, '04-spec.md', SPEC(true));
  fs.mkdirSync(path.join(INIT(root), 'evals'));
  fs.writeFileSync(path.join(INIT(root), 'evals/summary.md'), '# Eval\nthreshold: 85%\n');
  fs.mkdirSync(path.join(root, 'test'), { recursive: true });
  fs.writeFileSync(path.join(root, 'test/export.test.ts'), '// test');
  const build = (rate, row2) => `# Build\n\n## Acceptance criteria to tests\n| # | Criterion | Test | Result |\n|---|---|---|---|\n| 1 | download | test/export.test.ts | pass |\n${row2}\n\n## Test output\n\`\`\`\n2 passed, 0 failed\n\`\`\`\n\n## Instrumentation\n| Event | Triggered by | Arrived | Properties verified | Evidence |\n|---|---|---|---|---|\n| export_completed | download | yes | rows | \`[code:src/export.ts:1]\` |\n\n## Eval results\n\`\`\`\n12 cases, pass rate ${rate}%, must-pass 3 and 7 passed\n\`\`\`\n\n## Scope check\n| Out-of-scope item (phase 4) | Built? | Note |\n|---|---|---|\n| XLSX | no | |\n`;
  write(root, '05-build-plan.md', build(90, '| 2 | rows | test/export.test.ts | pass |'));
  let g = gate(root, 5);
  assert.deepEqual(g.failed, []);
  write(root, '05-build-plan.md', build(70, ''));
  g = gate(root, 5);
  assert.equal(g.by['5.1'], 'fail');
  assert.equal(g.by['5.5'], 'fail');
});

test('gate 6 requires the baseline before the rollout', () => {
  const root = project();
  const rel = (cap, roll) => `# Release\n\n## Rollback\n**Mechanism:** flag off\n**Owner:** Mario\n**Tested:** 2026-10-01, flag toggled on staging\n\n## Baseline (captured ${cap}, before rollout ${roll})\n| Metric | Value | Window | Method | Tag |\n|---|---|---|---|---|\n| exports | 0 | 7d | count | \`[code:src/export.ts:1]\` |\n\n## Measurement\n**Success metric measured by:** saved query weekly-exports\n\n## Outcome review\n**Owner:** Mario · **Date:** 2026-12-01\n`;
  write(root, '06-release.md', rel('2026-10-02T09:00Z', '2026-10-03T09:00Z'));
  assert.equal(gate(root, 6).by['6.2'], 'pass');
  write(root, '06-release.md', rel('2026-10-04T09:00Z', '2026-10-03T09:00Z'));
  assert.equal(gate(root, 6).by['6.2'], 'fail');
});

test('gate 7 needs one decision and the kill-criteria verdict', () => {
  const root = project();
  write(root, '07-outcome.md', `# Outcome\n\n## Measured 2026-12-01, 60 days after rollout\n| Metric | Baseline | Actual | Target | Delta | Tag |\n|---|---|---|---|---|---|\n| exports | 0 | 22% | 30% | +22 | \`[code:src/export.ts:1]\` |\n\n## Against kill criteria\n**Criterion:** below 15%\n**Verdict:** cleared, 22 > 15\n\n## Decision: ITERATE\n**Why:** below target, above kill line\n**Re-enters at:** phase 3\n\n## Learning\nManagers export when the file matches the meeting agenda.\n`);
  const g = gate(root, 7);
  assert.deepEqual(g.failed, []);
  assert.equal(g.by['7.4'], 'judge');
});

test('roadmap regenerates Now from the initiative states and keeps the bet', () => {
  const root = project();
  run(root, 'roadmap');
  const rm = fs.readFileSync(path.join(root, '.builderos/ROADMAP.md'), 'utf8');
  assert.match(rm, /\| CSV export \| feature \| 2 — Define \| managers export the weekly view/);
  assert.match(rm, /Onboarding rework \(paused\)/);
  assert.doesNotMatch(run(root, 'brief').out, /ROADMAP\.md shows/);
});

test('new and cover create a feature initiative that starts at phase 2 with its events', () => {
  const root = project();
  run(root, 'new', 'team-filter', '--title', 'Team filter', '--track', 'feature', '--reason', 'live product');
  assert.equal(run(root, 'cover').code, 2, 'C.4 must be judged first');
  assert.equal(run(root, 'cover', '--c4', 'serves the Monday rebuild').code, 0);
  const s = JSON.parse(fs.readFileSync(path.join(INIT(root, 'team-filter'), 'state.json'), 'utf8'));
  assert.equal(s.current_phase, 2);
  assert.deepEqual(s.history.map((h) => h.event), ['track_set', 'phase_covered', 'phase_covered']);
  const other = JSON.parse(fs.readFileSync(path.join(INIT(root), 'state.json'), 'utf8'));
  assert.equal(other.status, 'paused');
  assert.doesNotMatch(run(root, 'brief').out, /does not follow the schema/);
});

test('a failed coverage check upgrades the track to product', () => {
  const root = project();
  const p = path.join(root, 'PRODUCT.md');
  fs.writeFileSync(p, fs.readFileSync(p, 'utf8').replace('Sales managers at 20-to-200-seat teams spend', 'Sales managers need a dashboard, they spend'));
  run(root, 'new', 'team-filter', '--track', 'feature');
  assert.equal(run(root, 'cover', '--c4', 'x').code, 1);
  const s = JSON.parse(fs.readFileSync(path.join(INIT(root, 'team-filter'), 'state.json'), 'utf8'));
  assert.equal(s.track, 'product');
  assert.equal(s.history.at(-1).event, 'track_upgraded');
});

test('brief flags a state file written off-schema', () => {
  const root = project();
  const p = path.join(INIT(root), 'state.json');
  const s = JSON.parse(fs.readFileSync(p, 'utf8'));
  s.history = [];
  s.phases['2'].status = 'started';
  fs.writeFileSync(p, JSON.stringify(s));
  assert.match(run(root, 'brief').out, /csv-export\/state\.json does not follow the schema \(phase 0 covered with no phase_covered event/);
});

test('migrate moves a schema 1 pipeline into an initiative folder', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'bos-'));
  fs.mkdirSync(path.join(root, '.builderos'));
  fs.writeFileSync(path.join(root, '.builderos/state.json'), JSON.stringify({ schema: 1, product: 'Old', mode: 'full', current_phase: 1, cycle: 1, phases: {}, history: [] }));
  fs.writeFileSync(path.join(root, '.builderos/00-frame.md'), '# Frame');
  run(root, 'migrate');
  assert.ok(!fs.existsSync(path.join(root, '.builderos/state.json')));
  const s = JSON.parse(fs.readFileSync(path.join(root, '.builderos/initiatives/old/state.json'), 'utf8'));
  assert.equal(s.schema, 2);
  assert.equal(s.history.at(-1).event, 'migrated');
  assert.ok(fs.existsSync(path.join(root, '.builderos/initiatives/old/00-frame.md')));
});
