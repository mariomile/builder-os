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
  const separator = args.indexOf('--');
  const cli = separator < 0 ? [...args, '--root', root] : [...args.slice(0, separator), '--root', root, ...args.slice(separator)];
  const r = spawnSync(process.execPath, [SCRIPT, ...cli], { encoding: 'utf8' });
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
function evidence(root, name, slug) {
  const dir = path.join(INIT(root, slug), 'evidence');
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, name + '.md'), `# ${name}\n\n**Class:** interview\n**Captured:** 2026-09-01\n\nRaw notes from the conversation, long enough to count as material.\n`);
}

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

test('a term PRODUCT.md defines under Language is not solution language, and "ai" in Italian is not AI', () => {
  const root = project();
  const p = path.join(root, 'PRODUCT.md');
  const base = fs.readFileSync(p, 'utf8');
  fs.writeFileSync(p, base.replace('rebuilding the same pipeline view', 'rebuilding the pipeline view that AI answer engines ignore'));
  assert.equal(gate(root, 'C').by['C.1'], 'fail');
  fs.writeFileSync(p, fs.readFileSync(p, 'utf8') + '\n## Language\n\n| Term | Means | Not to be confused with |\n|---|---|---|\n| AI answer engine | A system that answers buyer questions | A search engine |\n');
  assert.equal(gate(root, 'C').by['C.1'], 'pass');
  fs.writeFileSync(p, base.replace('rebuilding the same pipeline view', 'dando ai manager la stessa vista'));
  assert.equal(gate(root, 'C').by['C.1'], 'pass');
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

test('gate 5 maps existing tests and checks recorded executions and eval case results', () => {
  const root = project();
  write(root, '04-spec.md', SPEC(true));
  fs.mkdirSync(path.join(INIT(root), 'evals'));
  const evalRows = Array.from({ length: 12 }, (_, i) => `| ${i + 1} | input ${i + 1} | expected ${i + 1} | rubric | ${i === 2 || i === 6 ? 'yes' : 'no'} |`).join('\n');
  fs.writeFileSync(path.join(INIT(root), 'evals/summary.md'), `# Eval\n| # | Input | Expected | Judge | Must pass |\n|---|---|---|---|---|\n${evalRows}\n`);
  fs.mkdirSync(path.join(root, 'test'), { recursive: true });
  fs.writeFileSync(path.join(root, 'test/export.test.ts'), '// criterion mapping fixture');
  fs.writeFileSync(path.join(root, 'test/runner.mjs'), "import { test } from 'node:test'; test('export', () => {}); test('rows', () => {});\n");
  fs.writeFileSync(path.join(root, 'test/eval-runner.mjs'), "import fs from 'node:fs'; fs.writeFileSync(process.argv[2], JSON.stringify(Array.from({length:12}, (_, i) => ({id:String(i+1), pass: i < Number(process.argv[3])}))));\n");
  const testRun = run(root, 'run-check', '--label', 'tests', '--', process.execPath, '--test', 'test/runner.mjs').out.trim();
  const evalRun = (passing) => run(root, 'run-check', '--label', 'evals', '--results', '.builderos/initiatives/csv-export/evals/results.json', '--dataset', 'evals/summary.md', '--', process.execPath, 'test/eval-runner.mjs', '.builderos/initiatives/csv-export/evals/results.json', String(passing)).out.trim();
  let recordedEval = evalRun(12);
  const build = (rate, row2) => `# Build\n\n## Plan\n**Accepted:** Mario · 2026-01-01T09:00Z\n\n## Slices\n| # | Slice | Files | Acceptance criteria | Blocks on | Status |\n|---|---|---|---|---|---|\n| 1 | export end to end | src/export.ts | 1, 2 | none | done |\n\n## Risks\n| Risk | Mitigation |\n|---|---|\n| large accounts time out | stream rows |\n\n## Acceptance criteria to tests\n| # | Criterion | Test | Result |\n|---|---|---|---|\n| 1 | download | test/export.test.ts | pass |\n${row2}\n\n## Test output\n${testRun}\n\`\`\`\n2 passed, 0 failed\n\`\`\`\n\n## Instrumentation\n| Event | Triggered by | Arrived | Properties verified | Evidence |\n|---|---|---|---|---|\n| export_completed | download | yes | rows | \`[code:src/export.ts:1]\` |\n\n## Eval results\n${recordedEval}\n**Results:** evals/results.json\n\`\`\`\n12 cases, pass rate ${rate}%, must-pass 3 and 7 passed\n\`\`\`\n\n## Scope check\n| Out-of-scope item (phase 4) | Built? | Note |\n|---|---|---|\n| XLSX | no | |\n`;
  write(root, '05-build-plan.md', build(90, '| 2 | rows | test/export.test.ts | pass |'));
  let g = gate(root, 5);
  assert.deepEqual(g.failed, []);
  assert.equal(g.by['5.2'], 'judge', 'coverage/provenance still needs judgment');
  assert.equal(g.by['5.5'], 'judge', 'eval correspondence still needs judgment');
  recordedEval = evalRun(8);
  write(root, '05-build-plan.md', build(70, ''));
  g = gate(root, 5);
  assert.equal(g.by['5.1'], 'fail');
  assert.equal(g.by['5.5'], 'fail');
  recordedEval = evalRun(12);
  write(root, '05-build-plan.md', build(90, '| 2 | rows | **No test in this repo.** Reasoned exception | pass |'));
  assert.equal(gate(root, 5).by['5.1'], 'fail', 'an excuse is not a test');
  write(root, '05-build-plan.md', build(90, '| 2 | rows | test/export.test.ts | pass `[code:test/export.test.ts:1,4]` |') + '\nWhere no analytics resolved, the weaker `[code:...]` class applies.\n');
  assert.equal(gate(root, 5).by['E.1'], 'pass', 'line lists resolve, and naming a class is not citing');
});

test('gate 6 requires baseline before actual verified exposure', () => {
  const root = project();
  evidence(root, 'release-observation');
  const rel = (cap, roll) => `# Release\n\n## Rollback\n**Mechanism:** flag off\n**Owner:** Mario\n**Tested:** 2026-10-01, flag toggled on staging\n\n## Baseline (captured ${cap}, before rollout ${roll})\n| Metric | Value | Window | Method | Tag |\n|---|---|---|---|---|\n| exports | 0 | 7d | count | \`[code:src/export.ts:1]\` |\n\n## Measurement\n**Success metric measured by:** saved query weekly-exports\n\n## Outcome review\n**Owner:** Mario · **Date:** 2026-12-01\n\n## Exposure verification\n**Status:** verified\n**Exposed at:** ${roll}\n**Environment:** production\n**Version:** fixture-v1\n**Verification:** users completed a CSV export [doc:release-observation]\n`;
  write(root, '06-release.md', rel('2026-01-02T09:00Z', '2026-01-03T09:00Z'));
  assert.equal(gate(root, 6).by['6.2'], 'pass');
  write(root, '06-release.md', rel('2026-01-04T09:00Z', '2026-01-03T09:00Z'));
  assert.equal(gate(root, 6).by['6.2'], 'fail');
  const r64 = gate(root, 6).results.find((r) => r.id === '6.4');
  assert.equal(r64.status, 'judge');
  assert.match(r64.detail, /lite: a fail is a warning/);
});

test('gate 7 needs one decision and the kill-criteria verdict', () => {
  const root = project();
  write(root, '07-outcome.md', `# Outcome\n\n## Measured 2026-12-01, 60 days after rollout\n| Metric | Baseline | Actual | Target | Delta | Tag |\n|---|---|---|---|---|---|\n| exports | 0 | 22% | 30% | +22 | \`[code:src/export.ts:1]\` |\n\n## Against kill criteria\n**Criterion:** below 15%\n**Verdict:** cleared, 22 > 15\n\n## Decision: ITERATE\n**Why:** below target, above kill line\n**Re-enters at:** phase 3\n\n## Learning\nManagers export when the file matches the meeting agenda.\n`);
  const g = gate(root, 7);
  assert.deepEqual(g.failed, []);
  assert.equal(g.by['7.4'], 'judge');
  const sp = path.join(INIT(root), 'state.json');
  const st = JSON.parse(fs.readFileSync(sp, 'utf8'));
  fs.writeFileSync(sp, JSON.stringify({ ...st, current_phase: 7, review_due: '2026-12-01' }));
  const judged = g.checked_by.model.map((id) => `${id}=pass`).join(',');
  assert.equal(run(root, 'record', '7', '--judged', judged).code, 2, 'phase 7 needs the decision');
  assert.equal(run(root, 'record', '7', '--judged', judged, '--verdict', 'iterate', '--reenter', '3').code, 0);
  const s = JSON.parse(fs.readFileSync(sp, 'utf8'));
  assert.equal(s.cycle, 2);
  assert.equal(s.current_phase, 3);
  assert.equal(s.review_due, null);
  assert.equal(s.status, 'open');
  assert.equal(s.history.at(-1).event, 'cycle_started');
});

test('roadmap regenerates Now from the initiative states and keeps the bet', () => {
  const root = project();
  run(root, 'roadmap');
  const rm = fs.readFileSync(path.join(root, '.builderos/ROADMAP.md'), 'utf8');
  assert.match(rm, /\| CSV export \| feature \| 2 — Define \| managers export the weekly view/);
  assert.match(rm, /Onboarding rework \(paused\)/);
  write(root, '03-solution-bet.md', '# Bet\n\n## Selected: 2 — Guided first report\n**Why:** fastest to value\n', 'onboarding-v2');
  run(root, 'roadmap');
  assert.match(fs.readFileSync(path.join(root, '.builderos/ROADMAP.md'), 'utf8'), /\| Onboarding rework \(paused\) \| [^|]+ \| [^|]+ \| Guided first report \|/);
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

test('record writes the gate from the script and the judged conditions, and refuses without them', () => {
  const root = project();
  const state = () => JSON.parse(fs.readFileSync(path.join(INIT(root), 'state.json'), 'utf8'));
  assert.equal(run(root, 'record', '2').code, 2, 'judge conditions need a verdict');
  assert.equal(run(root, 'record', '3', '--judged', 'x=pass').code, 2, 'only the current phase');
  assert.equal(run(root, 'record', '2', '--judged', '2.5=pass,2.6=fail').code, 1);
  let s = state();
  assert.equal(s.current_phase, 2);
  assert.equal(s.phases['2'].gate.passed, false);
  assert.deepEqual(s.phases['2'].gate.failed_conditions, ['2.6']);
  assert.equal(s.history.at(-1).event, 'gate_failed');
  assert.equal(run(root, 'record', '2', '--judged', '2.5=pass,2.6=pass').code, 0);
  s = state();
  assert.equal(s.current_phase, 3);
  assert.equal(s.phases['2'].status, 'passed');
  assert.equal(s.phases['3'].status, 'in_progress');
  assert.ok(s.phases['2'].gate.checked_by.model.includes('2.6'));
  assert.ok(s.phases['2'].gate.checked_by.script.includes('E.1'));
  assert.equal(s.history.at(-1).event, 'gate_passed');
  assert.match(fs.readFileSync(path.join(root, '.builderos/ROADMAP.md'), 'utf8'), /\| CSV export \| feature \| 3 — Ideate/);
  assert.doesNotMatch(run(root, 'brief').out, /does not follow the schema/);
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

test('brief flags a decision past its revisit date, one with no reopening condition, and unvalidated PRODUCT.md assumptions', () => {
  const root = project();
  const dir = path.join(root, '.builderos/decisions');
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'ADR-001-cursor-pagination.md'), '# ADR-001: Cursor pagination\n\n**Date:** 2026-08-01\n\n## Decision\nCursors.\n\n## Revisit when\nBy 2026-09-01, or when a page exceeds 2s.\n');
  fs.writeFileSync(path.join(dir, '2026-08-15-realtime.md'), '# Realtime reconciliation\n\nDate: 2026-08-15.\n\n## Problem and decision\nCounters per cache scope.\n');
  fs.writeFileSync(path.join(dir, 'ADR-003-future.md'), '# ADR-003: Future\n\n**Date:** 2026-07-01\n\n## Revisit when\nBy 2999-01-01.\n');
  const out = run(root, 'brief').out;
  assert.match(out, /Latest decision: 2026-08-15-realtime\./);
  assert.match(out, /decision ADR-001-cursor-pagination asked to be revisited by 2026-09-01/);
  assert.match(out, /decision 2026-08-15-realtime has no Revisit when condition/);
  assert.doesNotMatch(out, /ADR-003-future/);
  assert.match(out, /PRODUCT\.md still rests on 1 unvalidated assumption past phase 1/);
  assert.ok(out.trim().split('\n').length <= 6);
});

test('brief flags history events the schema does not define', () => {
  const root = project();
  const f = path.join(INIT(root), 'state.json');
  const s = JSON.parse(fs.readFileSync(f, 'utf8'));
  s.history.push({ at: '2026-09-20T10:00:00Z', event: 'build_shipped', slice: 24 });
  fs.writeFileSync(f, JSON.stringify(s, null, 2));
  assert.match(run(root, 'brief').out, /csv-export\/state\.json does not follow the schema \(unknown history event build_shipped/);
});
