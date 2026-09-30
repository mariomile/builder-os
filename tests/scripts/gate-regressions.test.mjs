import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const script = new URL('../../scripts/bos.mjs', import.meta.url).pathname;
const fixture = new URL('../fixtures/acme', import.meta.url).pathname;
function project(t) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'bos-gate-'));
  fs.cpSync(fixture, root, { recursive: true });
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const dir = path.join(root, '.builderos/initiatives/csv-export');
  const write = (f, s) => { const p = path.join(dir, f); fs.mkdirSync(path.dirname(p), { recursive: true }); fs.writeFileSync(p, s); };
  const run = (...args) => {
    const separator = args.indexOf('--');
    const cli = separator < 0 ? [...args, '--root', root] : [...args.slice(0, separator), '--root', root, ...args.slice(separator)];
    return spawnSync(process.execPath, [script, ...cli], { encoding: 'utf8' });
  };
  const gate = (n) => Object.fromEntries(JSON.parse(run('gate', String(n), '--json').stdout).results.map(r => [r.id, r.status]));
  const state = (patch) => { const p = path.join(dir, 'state.json'); const s = JSON.parse(fs.readFileSync(p)); if (patch) fs.writeFileSync(p, JSON.stringify({ ...s, ...patch })); return s; };
  return { root, dir, write, run, gate, state };
}
const discovery = (verdict = 'VALIDATED') => `# Discovery\n## Evidence\n${[1,2,3,4,5].map(n => `[code:src/export.ts:${n}]`).join(' ')}\n## Verdict\n${verdict} [code:src/export.ts:1]\n## JTBD\nWhen Monday starts, I want to see deals, so I can prepare.\n## Disconfirming\n**Sought:** contrary behavior\n**Found:** none\n`;
const outcome = (decision, reenter) => `# Outcome\n## Measured\n| Metric | Baseline | Actual | Target | Delta | Tag |\n|---|---|---|---|---|---|\n| exports | 0 | 20 | 30 | 20 | [code:src/export.ts:1] |\n## Against kill criteria\n**Verdict:** cleared\n## Decision: ${decision}\n**Re-enters at:** ${reenter}\n## Learning\nUsers need exports for meetings.\n`;
const build = (testPath = 'test/export.test.mjs', output = '2 passed, 0 failed', runPath = '') => `# Build\n## Acceptance criteria to tests\n| # | Criterion | Test | Result |\n|---|---|---|---|\n| 1 | export | ${testPath} | pass |\n## Test output\n${runPath ? `**Run:** ${runPath}\n` : ''}\`\`\`\n${output}\n\`\`\`\n`;

test('five code line citations are one source', t => {
  const p = project(t); p.write('01-discovery.md', discovery());
  assert.equal(p.gate(1)['1.2'], 'fail');
});
test('unknown baseline never becomes zero on an existing feature', t => {
  const p = project(t); const f = path.join(p.dir, '02-definition.md');
  p.write('02-definition.md', fs.readFileSync(f, 'utf8').replace(/\*\*Baseline:\*\*[^\n]*/, '**Baseline:** 0, first measured 2026-09-20'));
  assert.equal(p.gate(2)['2.4'], 'fail');
});
test('eval count comes from a valid dataset, not prose', t => {
  const p = project(t);
  for (const dataset of ['missing.jsonl', 'invalid.jsonl', 'prose.md']) {
    if (dataset === 'invalid.jsonl') p.write(dataset, Array(20).fill('{invalid}').join('\n'));
    if (dataset === 'prose.md') p.write(dataset, 'There are 20 cases, judge rubric, threshold 85%, must-pass case 1.');
    p.write('04-spec.md', `# Spec\n**Model output:** yes\n## Eval set\n${dataset}, 20 cases, judge rubric, threshold 85%, must-pass case 1\n`);
    assert.equal(p.gate(4)['4.6'], 'fail', dataset);
  }
});
test('mapped tests must exist and failing pasted output cannot pass', t => {
  const p = project(t); p.write('04-spec.md', '# Spec\n## Acceptance criteria\n| # | Criterion |\n|---|---|\n| 1 | export |\n');
  p.write('05-build-plan.md', build('test/missing.test.mjs', '2 failed'));
  assert.equal(p.gate(5)['5.1'], 'fail'); assert.equal(p.gate(5)['5.2'], 'fail');
});
test('record derives spike stop from track and rejects contradictory discovery verdicts', t => {
  const p = project(t); p.write('01-discovery.md', discovery()); p.state({ track: 'spike', current_phase: 1 });
  assert.equal(p.run('record', '1', '--judged', '1.5=pass', '--verdict', 'validated', '--override', 'source breadth incomplete').status, 0);
  assert.equal(p.state().status, 'closed'); assert.equal(p.state().current_phase, 1); assert.equal(p.state().phases['1'].verdict, 'validated');
  const q = project(t); q.write('01-discovery.md', discovery('KILLED')); q.state({ current_phase: 1 });
  assert.equal(q.run('record', '1', '--judged', '1.5=pass', '--verdict', 'validated', '--override', 'source breadth incomplete').status, 2);
  assert.equal(q.state().current_phase, 1);
});
test('outcome decision and re-entry cannot contradict the artifact', t => {
  const p = project(t); p.state({ current_phase: 7 }); p.write('07-outcome.md', outcome('KILL', 'none'));
  assert.equal(p.run('record', '7', '--judged', '7.4=pass', '--verdict', 'keep').status, 2);
  assert.equal(p.run('record', '7', '--judged', '7.4=pass', '--verdict', 'kill', '--reenter', '2').status, 2);
  p.write('07-outcome.md', outcome('ITERATE', 'phase 3'));
  assert.equal(p.run('record', '7', '--judged', '7.4=pass', '--verdict', 'iterate').status, 2);
  assert.equal(p.run('record', '7', '--judged', '7.4=pass', '--verdict', 'iterate', '--reenter', '2').status, 2);
});
test('a planned future release is not observed exposure', t => {
  const p = project(t); p.write('06-release.md', '# Release\n## Baseline (captured 2026-01-01T09:00Z, before rollout 2030-01-01T09:00Z)\n| Metric | Value |\n|---|---|\n| exports | 0 |\n');
  assert.equal(p.gate(6)['6.6'], 'fail');
});

test('run-check captures successful and failed actual processes; gates do not rerun them', t => {
  const p = project(t);
  fs.mkdirSync(path.join(p.root, 'test'));
  fs.writeFileSync(path.join(p.root, 'test/export.test.mjs'), "import { test } from 'node:test'; test('export', () => {});\n");
  p.write('04-spec.md', '# Spec\n## Acceptance criteria\n| # | Criterion |\n|---|---|\n| 1 | export |\n');
  const run = p.run('run-check', '--label', 'tests', '--', process.execPath, '--test', 'test/export.test.mjs');
  assert.equal(run.status, 0, run.stderr);
  const record = run.stdout.match(/\*\*Run:\*\* (.+)/)[1];
  const metadata = JSON.parse(fs.readFileSync(path.join(p.root, record)));
  assert.deepEqual(metadata.command, [process.execPath, '--test', 'test/export.test.mjs']);
  assert.equal(metadata.exit_code, 0); assert.equal(metadata.cwd, '.');
  p.write('05-build-plan.md', build('test/export.test.mjs', '', record));
  const before = fs.readdirSync(path.join(p.dir, 'evidence/runs'));
  assert.equal(p.gate(5)['5.2'], 'judge');
  assert.equal(p.gate(5)['5.2'], 'judge');
  assert.deepEqual(fs.readdirSync(path.join(p.dir, 'evidence/runs')), before);
  fs.appendFileSync(path.join(p.root, metadata.output_file), '\nmodified');
  assert.equal(p.gate(5)['5.2'], 'fail', 'digest mismatch');
  const failed = p.run('run-check', '--label', 'failing', '--', process.execPath, '-e', 'process.exit(1)');
  assert.equal(failed.status, 1);
  p.write('05-build-plan.md', build('test/export.test.mjs', '100 passed', failed.stdout.match(/\*\*Run:\*\* (.+)/)[1]));
  assert.equal(p.gate(5)['5.2'], 'fail', 'failed process beats claimed success');
  const badSummary = p.run('run-check', '--label', 'bad-wrapper', '--', process.execPath, '-e', 'console.log("2 failed, 1 passed")');
  assert.equal(badSummary.status, 0);
  p.write('05-build-plan.md', build('test/export.test.mjs', '', badSummary.stdout.match(/\*\*Run:\*\* (.+)/)[1]));
  assert.equal(p.gate(5)['5.2'], 'fail', 'zero-exit wrapper with failures is rejected');
});
test('run-check preserves argv after separator and uses no implicit shell', t => {
  const p = project(t);
  const literal = '$(touch accidental-execution) --root ignored';
  const r = p.run('run-check', '--label', 'literal', '--', process.execPath, '-e', 'console.log(process.argv[1])', literal);
  assert.equal(r.status, 0, r.stderr);
  const record = JSON.parse(fs.readFileSync(path.join(p.root, r.stdout.match(/\*\*Run:\*\* (.+)/)[1])));
  assert.equal(record.command.at(-1), literal);
  assert.match(fs.readFileSync(path.join(p.root, record.output_file), 'utf8'), /\$\(touch accidental-execution\)/);
  assert.equal(fs.existsSync(path.join(p.root, 'accidental-execution')), false);
});
test('deferred reviews remain in LEARN without a fabricated decision', t => {
  const p = project(t); p.state({ current_phase: 7 });
  const deferred = p.run('defer-review', '--review-due', '2030-01-31', '--reason', 'Need a complete cohort window');
  assert.equal(deferred.status, 0);
  assert.match(deferred.stdout, /^REVIEW DEFERRED:/m);
  assert.equal(p.state().status, 'open'); assert.equal(p.state().current_phase, 7);
  assert.equal(p.state().review_due, '2030-01-31'); assert.equal(p.state().phases['7'].verdict, undefined);
  assert.equal(p.state().history.at(-1).event, 'review_deferred');
  assert.equal(p.run('defer-review', '--review-due', '2030-02-31', '--reason', 'x').status, 2);
});
test('enum and phase arguments cannot corrupt state, and coverage cannot reset progress', t => {
  const p = project(t); const before = p.state();
  assert.equal(p.run('new', 'bad-mode', '--mode', 'invented').status, 2);
  assert.equal(p.run('record', '2.5', '--judged', '2.5=pass,2.6=pass').status, 2);
  assert.equal(p.run('cover', '--c4', 'x').status, 2);
  assert.deepEqual(p.state(), before);
  p.state({ mode: 'invented' });
  assert.equal(p.run('record', '2', '--judged', '2.5=pass,2.6=pass').status, 2);
});
test('baseline zero for a nonexistent product needs explicit applicability and judgment', t => {
  const p = project(t); p.state({ track: 'product' });
  const f = path.join(p.dir, '02-definition.md');
  const original = fs.readFileSync(f, 'utf8').replace(/\*\*Baseline:\*\*[^\n]*/, '**Baseline:** 0');
  p.write('02-definition.md', original); assert.equal(p.gate(2)['2.4'], 'fail');
  p.write('02-definition.md', original.replace('**Baseline:** 0', '**Baseline:** 0\n**Product exists:** no\n**Zero rationale:** No customers can complete this metric before the service exists\n**First measurement:** 2030-01-01'));
  assert.equal(p.gate(2)['2.4'], 'judge');
});

test('eval JSON cases require unique ids, named grading and a valid threshold', t => {
  const p = project(t);
  const rows = Array.from({length: 20}, (_, i) => ({id: String(i + 1), input: `input ${i}`, expected: `expected ${i}`, must_pass: i === 0}));
  p.write('evals/cases.json', JSON.stringify(rows));
  const spec = threshold => `# Spec\n**Model output:** yes\n## Eval set\nevals/cases.json · judge: deterministic assertions · threshold: ${threshold}%\n`;
  p.write('04-spec.md', spec(85)); assert.equal(p.gate(4)['4.6'], 'pass');
  p.write('04-spec.md', spec(-1)); assert.equal(p.gate(4)['4.6'], 'fail');
  p.write('04-spec.md', spec(101)); assert.equal(p.gate(4)['4.6'], 'fail');
  p.write('04-spec.md', spec(85));
  p.write('evals/cases.json', JSON.stringify(rows.map(r => ({...r,id:'same'}))));
  assert.equal(p.gate(4)['4.6'], 'fail');
  p.write('evals/cases.json', JSON.stringify(rows.map(r => ({...r,must_pass:false}))));
  assert.equal(p.gate(4)['4.6'], 'fail');
});
test('malformed execution metadata is a failed check, not a parser crash', t => {
  const p = project(t); p.write('04-spec.md', '# Spec\n**Model output:** no\n');
  for (const value of [null, [], {output_file: {}}]) {
    p.write('evidence/runs/malformed.json', JSON.stringify(value));
    p.write('05-build-plan.md', build('missing.test.mjs', '', 'evidence/runs/malformed.json'));
    assert.equal(p.gate(5)['5.2'], 'fail');
  }
});
test('source identity deduplicates query variants, including data/doc aliases', t => {
  const p = project(t);
  const tags = [1,2,3,4,5].map(n => `[${n === 5 ? 'doc' : 'data'}:query-${n}]`).join(' ');
  for (const n of [1,2,3,4,5]) p.write(`evidence/query-${n}.md`, '# Query\n**Source identity:** same-account-export\n\nRaw rows from the same underlying observed export, repeated with another filter.\n');
  p.write('01-discovery.md', discovery().replace(/\[code:src\/export.ts:[1-5]\]/g, '').replace('## Evidence\n', `## Evidence\n${tags}\n`).replace('VALIDATED ', 'VALIDATED [data:query-1] '));
  assert.equal(p.gate(1)['1.2'], 'fail');
});

test('eval arithmetic binds real captured results and rejects must-pass failures and later edits', t => {
  const p = project(t);
  const cases = Array.from({length: 12}, (_, i) => ({id:String(i+1), input:`input ${i}`, expected:`expected ${i}`, must_pass: i === 0}));
  p.write('evals/cases.json', JSON.stringify(cases));
  p.write('04-spec.md', '# Spec\n**Model output:** yes\n## Eval set\nevals/cases.json · judge: fixture assertions · threshold: 85%\n');
  const capture = failFirst => {
    const code = 'require("fs").writeFileSync(process.argv[1], JSON.stringify(Array.from({length:12}, (_, i) => ({id:String(i+1),pass: i !== 0 || process.argv[2] !== "yes"}))));';
    const r = p.run('run-check', '--label', 'evals', '--dataset', 'evals/cases.json', '--results', 'evals/results.json', '--', process.execPath, '-e', code, path.join(p.dir, 'evals/results.json'), failFirst ? 'yes' : 'no');
    assert.equal(r.status, 0, r.stderr);
    p.write('05-build-plan.md', `# Build\n## Eval results\n${r.stdout}\n**Results:** evals/results.json\n`);
  };
  capture(false); assert.equal(p.gate(5)['5.5'], 'judge');
  fs.writeFileSync(path.join(p.dir, 'evals/results.json'), JSON.stringify(cases.map(r => ({id:r.id,pass:false}))));
  assert.equal(p.gate(5)['5.5'], 'fail', 'modified results no longer match the captured digest');
  capture(true); assert.equal(p.gate(5)['5.5'], 'fail', '91.67% clears threshold but must-pass case failed');
  capture(false); p.write('evals/cases.json', JSON.stringify(cases.map(r => ({...r,expected:'changed after execution'}))));
  assert.equal(p.gate(5)['5.5'], 'fail', 'changed input dataset cannot reuse an old run');
});

test('spec template global bold Judge applies when per-case judges are omitted', t => {
  const p = project(t);
  const cases = Array.from({length: 20}, (_, i) => ({id: String(i + 1), input: `input ${i}`, expected: `expected ${i}`, must_pass: i === 0}));
  p.write('evals/cases.jsonl', cases.map(c => JSON.stringify(c)).join('\n'));
  const spec = judge => `# Spec\n**Model output:** yes\n## Eval set\n**Dataset:** evals/cases.jsonl\n**Threshold:** 85%\n**Judge:** ${judge}\n`;
  p.write('04-spec.md', spec('Deterministic assertions against the expected fields'));
  assert.equal(p.gate(4)['4.6'], 'pass');
  p.write('04-spec.md', spec('Dataset rubric').replace('**Judge:**', '**Judge**:'));
  assert.equal(p.gate(4)['4.6'], 'pass', 'colon outside bold is also a supported field spelling');
  p.write('04-spec.md', spec('{unavailable}'));
  assert.equal(p.gate(4)['4.6'], 'fail', 'a placeholder is not a named global judge');
});

test('test mapping preserves literal paths for every language and framework route syntax', t => {
  const p = project(t);
  p.write('04-spec.md', '# Spec\n## Acceptance criteria\n| # | Criterion |\n|---|---|\n| 1 | export |\n');
  const paths = [
    ['test/export_test.dart', 'test/export_test.dart'],
    ['Tests/ExportTests.cs', '`Tests/ExportTests.cs`:12'],
    ['app/[id]/route.test.ts', '`app/[id]/route.test.ts`'],
    ['app/(dashboard)/page.test.tsx', 'app/(dashboard)/page.test.tsx'],
    ['test/with spaces/export check.test.mjs', '`test/with spaces/export check.test.mjs:4-8`'],
    ['test/with spaces/export check.test.mjs', 'test/with spaces/export check.test.mjs#exports'],
  ];
  for (const [name, mapping] of paths) {
    const file = path.join(p.root, name);
    fs.mkdirSync(path.dirname(file), {recursive: true});
    fs.writeFileSync(file, '// Synthetic mapping fixture; semantic test coverage is separately judged.\n');
    p.write('05-build-plan.md', build(mapping));
    assert.equal(p.gate(5)['5.1'], 'pass', mapping);
  }
  p.write('05-build-plan.md', build('`app/[missing]/route.test.dart`'));
  assert.equal(p.gate(5)['5.1'], 'fail', 'nonexistent literal paths still fail');
  p.write('05-build-plan.md', build('app/(dashboard)'));
  assert.equal(p.gate(5)['5.1'], 'fail', 'directories are not test files');
});

test('malformed cwd in an otherwise complete captured record fails without crashing', t => {
  const p = project(t);
  p.write('04-spec.md', '# Spec\n**Model output:** no\n');
  const r = p.run('run-check', '--label', 'cwd', '--', process.execPath, '-e', 'console.log("synthetic check")');
  assert.equal(r.status, 0, r.stderr);
  const record = JSON.parse(fs.readFileSync(path.join(p.root, r.stdout.match(/\*\*Run:\*\* (.+)/)[1])));
  for (const cwd of [{}, 1, null, [], true]) {
    p.write('evidence/runs/bad-cwd.json', JSON.stringify({...record,cwd}));
    p.write('05-build-plan.md', build('missing.test.mjs', '', 'evidence/runs/bad-cwd.json'));
    assert.equal(p.gate(5)['5.2'], 'fail', `cwd ${JSON.stringify(cwd)}`);
  }
});
