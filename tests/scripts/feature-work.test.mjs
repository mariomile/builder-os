// Tests for work on a product that already exists: the change track and its mandate check, the ratchet,
// evidence of the request itself (C.3 to C.6, 2.1), the impact on what exists (4.11), a suite that was red before
// the change (5.2), a declined guardrail (5.8), promotion to project memory (6.9), cleanup (7.6) and initiatives
// that live only on another branch.
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
const run = (root, ...args) => {
  const sep = args.indexOf('--');
  const cli = sep < 0 ? [...args, '--root', root] : [...args.slice(0, sep), '--root', root, ...args.slice(sep)];
  const r = spawnSync(process.execPath, [SCRIPT, ...cli], { encoding: 'utf8' });
  return { code: r.status, out: r.stdout, err: r.stderr };
};
const gate = (root, n, ...extra) => {
  const j = JSON.parse(run(root, 'gate', String(n), '--json', ...extra).out);
  return { ...j, by: Object.fromEntries(j.results.map((x) => [x.id, x.status])), detail: Object.fromEntries(j.results.map((x) => [x.id, x.detail])) };
};
const INIT = (root, slug = 'csv-export') => path.join(root, '.builderos/initiatives', slug);
const write = (root, file, body, slug) => {
  const p = path.join(INIT(root, slug), file);
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, body);
};
const state = (root, slug) => JSON.parse(fs.readFileSync(path.join(INIT(root, slug), 'state.json'), 'utf8'));
const setState = (root, patch, slug) => fs.writeFileSync(path.join(INIT(root, slug), 'state.json'), JSON.stringify({ ...state(root, slug), ...patch }, null, 2));
const evidence = (root, slug, name, captured = '2026-10-01') => write(root, `evidence/${name}.md`, `# ${name}\n\n**Class:** doc\n**Captured:** ${captured} · **By:** Mario · **Where:** support queue\n\n#981 (Globex): "the date column sorts as text, so March comes before January".\n`, slug);

const MANDATE = (kind = 'bug', why = 'the expected behavior is already specified: dates sort as dates') => `# Request — Date sorting\n\n## Request\n"The date column sorts as text."\n\n**Evidence:** \`[doc:ticket-981]\`\n**Population:** every account that sorts the weekly view by date\n\n## Mandate\n**Kind:** ${kind}\n**Why no bet:** ${why}\n`;

test('a change starts from its mandate: gate M, then phases 0 to 3 covered and phase 4 next', () => {
  const root = project();
  assert.equal(run(root, 'new', 'date-sort', '--title', 'Date sorting', '--track', 'change', '--reason', 'bug report').code, 0);
  assert.equal(state(root, 'date-sort').mode, 'lite', 'a change defaults to lite');
  assert.equal(run(root, 'cover', '--m4', 'fixed by the bug').code, 2, 'no 00-request.md yet');
  write(root, '00-request.md', MANDATE(), 'date-sort');
  assert.equal(gate(root, 'M').by['E.1'], 'fail', 'the evidence file does not exist yet');
  assert.equal(run(root, 'cover', '--m4', 'fixed by the bug').code, 1, 'an unresolved tag fails the mandate check');
  assert.equal(state(root, 'date-sort').track, 'feature', 'and the ratchet moved it');
  setState(root, { track: 'change', history: state(root, 'date-sort').history.slice(0, 1) }, 'date-sort');
  evidence(root, 'date-sort', 'ticket-981');
  const g = gate(root, 'M');
  assert.deepEqual([g.by['M.1'], g.by['M.2'], g.by['M.3'], g.by['M.4']], ['pass', 'pass', 'pass', 'judge']);
  assert.equal(run(root, 'cover').code, 2, 'M.4 must be judged first');
  assert.equal(run(root, 'cover', '--m4', 'the spec of a date column decides it').code, 0);
  const s = state(root, 'date-sort');
  assert.equal(s.current_phase, 4);
  assert.deepEqual([0, 1, 2, 3].map((k) => s.phases[k].status), ['covered', 'covered', 'covered', 'covered']);
  const brief = run(root, 'brief').out;
  assert.match(brief, /phases 0 to 3 covered by the mandate/);
  assert.doesNotMatch(brief, /does not follow the schema/);
});

test('a failed mandate check moves the change to feature, still at phase 0', () => {
  const root = project();
  run(root, 'new', 'date-sort', '--track', 'change');
  evidence(root, 'date-sort', 'ticket-981');
  write(root, '00-request.md', MANDATE('nice-to-have', 'short'), 'date-sort');
  const g = gate(root, 'M');
  assert.equal(g.by['M.2'], 'fail');
  assert.equal(g.by['M.3'], 'fail');
  assert.equal(run(root, 'cover', '--m4', 'x').code, 1);
  const s = state(root, 'date-sort');
  assert.equal(s.track, 'feature');
  assert.equal(s.current_phase, 0);
  assert.equal(s.history.at(-1).event, 'track_upgraded');
  assert.match(run(root, 'brief').out, /coverage check/);
});

test('upgrade only goes towards heavier tracks and restarts at phase 0', () => {
  const root = project();
  assert.equal(run(root, 'upgrade', '--to', 'product').code, 2, 'needs a reason');
  assert.equal(run(root, 'upgrade', '--to', 'feature', '--reason', 'x').code, 2, 'feature cannot become feature');
  assert.equal(run(root, 'upgrade', '--to', 'product', '--reason', 'phase 2 found the ICP is not served').code, 0);
  const s = state(root);
  assert.equal(s.track, 'product');
  assert.equal(s.current_phase, 0);
  assert.equal(s.mode, 'full', 'a product is not lite by default');
  assert.equal(s.history.at(-1).from, 'feature');
  assert.equal(run(root, 'upgrade', '--to', 'feature', '--reason', 'x').code, 2, 'never back down');
  run(root, 'new', 'q', '--track', 'spike');
  assert.equal(run(root, 'upgrade', '--to', 'product', '--reason', 'x').code, 2, 'a spike does not upgrade');
});

test('C.3 does not take code as evidence of a problem; C.5 wants the request\'s own source; C.6 flags old evidence', () => {
  const root = project();
  const p = path.join(root, 'PRODUCT.md');
  const base = fs.readFileSync(p, 'utf8');
  assert.equal(gate(root, 'C').by['C.5'], 'pass', 'the fixture request has a ticket export');
  fs.writeFileSync(p, base.replace('`[interview:P4,P6]`', '`[code:src/export.ts:1]`'));
  assert.equal(gate(root, 'C').by['C.3'], 'fail');
  fs.writeFileSync(p, base);
  fs.rmSync(path.join(INIT(root), '00-request.md'));
  assert.equal(gate(root, 'C').by['C.5'], 'fail');
  write(root, '00-request.md', '# Request\n\n## Request\nMario wants it.\n\n**Evidence:** `[doc:user-2026-10-20-export]`\n**Population:** one account\n');
  write(root, 'evidence/user-2026-10-20-export.md', '# user-2026-10-20-export\n\n**Class:** doc\n**Captured:** 2026-10-20\n\n"I want CSV export for my own board deck, every Monday."\n');
  const g = gate(root, 'C');
  assert.equal(g.by['C.5'], 'warn', "the requester's words alone are a warning, not a failure");
  assert.equal(g.failed.length, 0);
  for (const f of ['P4', 'P6']) {
    const e = path.join(root, '.builderos/evidence', `${f}.md`);
    fs.writeFileSync(e, fs.readFileSync(e, 'utf8').replace(/\*\*Captured:\*\* \d{4}-\d{2}-\d{2}/, '**Captured:** 2024-01-10'));
  }
  assert.equal(gate(root, 'C').by['C.6'], 'warn');
});

test('gate 2.1 on the feature track accepts the initiative\'s own evidence', () => {
  const root = project();
  const f = path.join(INIT(root), '02-definition.md');
  const def = fs.readFileSync(f, 'utf8');
  const firstOpp = def.split('\n').find((l) => l.startsWith('| Late Friday updates missed | `'));
  assert.ok(firstOpp, 'fixture has a first opportunity row');
  const traced = firstOpp.replace(/`?\[[a-z]+:[^\]]+\]`?/g, '`[doc:zendesk-export-requests]`');
  fs.writeFileSync(f, def.replace(firstOpp, traced));
  assert.equal(gate(root, 2).by['2.1'], 'pass');
  fs.writeFileSync(f, def.replace(firstOpp, traced.replace('zendesk-export-requests', 'nowhere')));
  assert.equal(gate(root, 2).by['2.1'], 'fail', 'a tag with no file traces to nothing');
});

const IMPACT = (rows) => `\n## Impact on what exists\n| Area | Today | What changes | Handling |\n|---|---|---|---|\n${rows}\n`;
const ALL_AREAS = ['| Existing data | deals | nothing | nothing to do: read only |', '| Contracts | none | nothing | nothing to do |', '| Tracking events | report_viewed | none renamed | new event only |', '| Permissions | team scope | same | export respects it |', '| Current users | weekly view | new button | release note |'];

test('gate 4.11 needs the five areas of what exists, each handled, or "not applicable" with a reason', () => {
  const root = project();
  write(root, '04-spec.md', '# Spec\n');
  assert.match(gate(root, 4).detail['4.11'], /no "## Impact on what exists"/);
  write(root, '04-spec.md', '# Spec\n' + IMPACT(ALL_AREAS.slice(0, 4).join('\n')));
  assert.match(gate(root, 4).detail['4.11'], /no row for current users/);
  write(root, '04-spec.md', '# Spec\n' + IMPACT(ALL_AREAS.join('\n').replace('| release note |', '|  |')));
  assert.match(gate(root, 4).detail['4.11'], /current users: no handling/);
  write(root, '04-spec.md', '# Spec\n' + IMPACT(ALL_AREAS.join('\n')));
  assert.equal(gate(root, 4).by['4.11'], 'pass');
  write(root, '04-spec.md', '# Spec\n\n## Impact on what exists\n**Impact on what exists:** not applicable\n');
  assert.equal(gate(root, 4).by['4.11'], 'fail', 'needs its reason');
  write(root, '04-spec.md', '# Spec\n\n## Impact on what exists\n**Impact on what exists:** not applicable, nothing is built yet\n');
  assert.equal(gate(root, 4).by['4.11'], 'pass');
});

test('on the change track 4.4 is skipped and the look can be inherited with a reason', () => {
  const root = project();
  setState(root, { track: 'change' });
  write(root, 'DESIGN.md', '# Design\n\n## Visual direction\n**Visual direction:** inherited, the column header already exists\n');
  write(root, '04-spec.md', '# Spec\n');
  const g = gate(root, 4);
  assert.equal(g.by['4.4'], 'skip');
  assert.equal(g.by['4.9'], 'pass');
  setState(root, { track: 'feature' });
  assert.equal(gate(root, 4).by['4.9'], 'fail', 'a feature shows versions');
});

const BUILD = (extra = '') => `# Build\n## Test baseline\n**Run:** {base}\n\n## Pre-existing failures\n| Test | Since |\n|---|---|\n| legacy invoice rounding | before this initiative |\n\n## Acceptance criteria to tests\n| # | Criterion | Test | Result |\n|---|---|---|---|\n| 1 | export | test/export.test.mjs | pass |\n## Test output\n**Run:** {final}\n${extra}`;
const rec = (root, label, code) => run(root, 'run-check', '--label', label, '--', process.execPath, '-e', code).out.match(/\*\*Run:\*\* (.+)/)[1];

test('gate 5.2 accepts a suite that was already red only against its baseline, with the mapped tests green', () => {
  const root = project();
  fs.mkdirSync(path.join(root, 'test'), { recursive: true });
  fs.writeFileSync(path.join(root, 'test/export.test.mjs'), '// export\n');
  write(root, '04-spec.md', '# Spec\n## Acceptance criteria\n| # | Criterion |\n|---|---|\n| 1 | export |\n');
  const red = 'console.log("not ok 7 - legacy invoice rounding\\n# fail 1"); process.exit(1)';
  const base = rec(root, 'baseline', red);
  const final = rec(root, 'final', red);
  const mapped = rec(root, 'mapped', 'console.log("ok 1 - export")');
  const plan = (b, f, extra) => BUILD(extra).replace('{base}', b).replace('{final}', f);
  write(root, '05-build-plan.md', plan(base, final, ''));
  assert.match(gate(root, 5).detail['5.2'], /Mapped run/);
  write(root, '05-build-plan.md', plan(base, final, `**Mapped run:** ${mapped}\n`));
  assert.equal(gate(root, 5).by['5.2'], 'judge');
  const worse = rec(root, 'worse', 'console.log("not ok 7 - legacy invoice rounding\\nnot ok 8 - export\\n# fail 2"); process.exit(1)');
  write(root, '05-build-plan.md', plan(base, worse, `**Mapped run:** ${mapped}\n`));
  assert.match(gate(root, 5).detail['5.2'], /more failures than the baseline/);
  const green = rec(root, 'green-base', 'console.log("ok")');
  write(root, '05-build-plan.md', plan(green, rec(root, 'final2', red), `**Mapped run:** ${mapped}\n`));
  assert.match(gate(root, 5).detail['5.2'], /baseline was green/);
  write(root, '05-build-plan.md', plan(base, final, `**Mapped run:** ${mapped}\n`).replace('legacy invoice rounding |', 'something else |'));
  assert.match(gate(root, 5).detail['5.2'], /not in the baseline log/);
});

test('gate 5.8: a guardrail declined by its owner is a visible warning, not a pass and not a block', () => {
  const root = project();
  const t = path.join(root, 'TECH.md');
  const tech = fs.readFileSync(t, 'utf8').replace(/\*\*Guardrail:\*\*[^\n]*\n?/, '');
  write(root, '05-build-plan.md', '# Build\n');
  fs.writeFileSync(t, tech + '\n**Guardrail:** declined by Luca (platform team owns CI), 2026-10-20\n');
  const g = gate(root, 5);
  assert.equal(g.by['5.8'], 'warn');
  assert.ok(!g.failed.includes('5.8'));
  fs.writeFileSync(t, tech + '\n**Guardrail:** none\n');
  assert.equal(gate(root, 5).by['5.8'], 'fail');
});

const RELEASE = (outcome = true) => `# Release\n\n## Rollout\n**Strategy:** full, 40 users and a tested rollback\n**Chosen by:** Mario\n\n## Rollback\n**Mechanism:** revert\n**Owner:** Mario\n**Tested:** 2026-10-01\n\n## Exposure verification\n**Status:** verified\n**Exposed at:** 2026-10-02T10:00:00Z\n**Environment:** production\n**Version:** v1.4.2\n**Verification:** the date column sorts as dates in production \`[doc:ticket-981]\`\n**Authorized by:** Mario, "vai" in the thread\n\n## Production readiness\n**Errors seen by:** error tracker alert to Mario\n**Backup restored:** not applicable, no data changes\n${outcome ? '\n## Outcome review\n**Owner:** Mario · **Date:** 2026-11-01\n' : ''}`;

test('a change with no outcome to measure closes at phase 6; one with a review goes on to phase 7', () => {
  const root = project();
  run(root, 'new', 'date-sort', '--track', 'change');
  evidence(root, 'date-sort', 'ticket-981');
  setState(root, { current_phase: 6, phases: { ...state(root, 'date-sort').phases, 6: { status: 'in_progress', artifact: null, gate: null } } }, 'date-sort');
  write(root, '06-release.md', RELEASE(false), 'date-sort');
  const g = gate(root, 6);
  assert.deepEqual([g.by['6.2'], g.by['6.3'], g.by['6.5']], ['skip', 'skip', 'skip']);
  const judged = g.checked_by.model.map((id) => `${id}=pass`).join(',');
  assert.equal(run(root, 'record', '6', '--judged', judged, '--accepted-by', 'Mario').code, 0);
  assert.equal(state(root, 'date-sort').status, 'closed');
  assert.equal(state(root, 'date-sort').history.at(-1).event, 'closed');
});

test('gate 6.9 wants the modeled entities in DOMAIN.md and a chosen look in TECH.md', () => {
  const root = project();
  write(root, 'DESIGN.md', '# Design\n\n## Domain model\n### Entities\n| Entity | Means | Lifecycle |\n|---|---|---|\n| Export | a file a manager downloads | no |\n\n## Visual direction\n| Version | Axis | File | Verdict |\n|---|---|---|---|\n| A | density | /reports?variant=a | chosen |\n\n**Chosen:** A\n');
  write(root, '06-release.md', RELEASE());
  const d = gate(root, 6).detail['6.9'];
  assert.match(d, /Export/);
  assert.match(d, /Design system/);
  fs.writeFileSync(path.join(root, 'DOMAIN.md'), '# DOMAIN.md — Acme Reports\n\n## Entities\n| Entity | Means |\n|---|---|\n| Export | a file a manager downloads |\n');
  fs.appendFileSync(path.join(root, 'TECH.md'), '\n## Design system\n**Kit:** Acme UI\n**Tokens:** src/styles/tokens.css\n');
  assert.equal(gate(root, 6).by['6.9'], 'pass');
  write(root, 'DESIGN.md', '# Design\n\n**Domain model:** not applicable, nothing changes state\n\n**Visual direction:** not applicable, no interface\n');
  fs.rmSync(path.join(root, 'DOMAIN.md'));
  assert.equal(gate(root, 6).by['6.9'], 'pass', 'nothing to promote');
});

test('gate 7.6 needs the cleanup after the decision, or "none" with a reason', () => {
  const root = project();
  const OUT = (cleanup) => `# Outcome\n## Measured\n| Metric | Baseline | Actual | Target | Delta | Tag |\n|---|---|---|---|---|---|\n| exports | 0 | 20 | 30 | 20 | [code:src/export.ts:1] |\n## Against kill criteria\n**Verdict:** triggered\n## Decision: KILL\n**Chosen by:** Mario\n**Re-enters at:** none\n${cleanup}\n## Learning\nUsers need exports for meetings.\n`;
  write(root, '07-outcome.md', OUT(''));
  assert.equal(gate(root, 7).by['7.6'], 'fail');
  write(root, '07-outcome.md', OUT('**Cleanup:** none'));
  assert.equal(gate(root, 7).by['7.6'], 'fail');
  write(root, '07-outcome.md', OUT('**Cleanup:** remove the export button and endpoint by 2026-12-15, owner Mario, as a change initiative'));
  assert.equal(gate(root, 7).by['7.6'], 'pass');
});

test('the briefing names initiatives that exist only on another branch', () => {
  const root = project();
  const git = (...a) => spawnSync('git', a, { cwd: root, encoding: 'utf8' });
  if (git('--version').status !== 0) return;
  git('init', '-q', '-b', 'main');
  git('-c', 'user.email=t@t', '-c', 'user.name=t', 'add', '-A');
  git('-c', 'user.email=t@t', '-c', 'user.name=t', 'commit', '-qm', 'base');
  git('checkout', '-qb', 'feat/date-sort');
  run(root, 'new', 'date-sort', '--track', 'change');
  git('-c', 'user.email=t@t', '-c', 'user.name=t', 'add', '-A');
  git('-c', 'user.email=t@t', '-c', 'user.name=t', 'commit', '-qm', 'start date-sort');
  git('checkout', '-q', 'main');
  assert.match(run(root, 'brief').out, /date-sort exists only on feat\/date-sort/);
});

test('"Not applicable" written as the section\'s own prose counts, with its reason', () => {
  const root = project();
  write(root, 'DESIGN.md', '# Design\n\n## Visual direction\n\nNot applicable.\n\nReason: only the sort order changes; nothing visual moves.\n\n## Domain model\n\nNot applicable.\n');
  write(root, '04-spec.md', '# Spec\n\n## Impact on what exists\nNot applicable, nothing is built yet.\n');
  const g = gate(root, 4);
  assert.equal(g.by['4.9'], 'pass');
  assert.equal(g.by['4.10'], 'fail', 'no reason given for the domain');
  assert.equal(g.by['4.11'], 'pass');
});

test('gate 5.3 on a change whose spec tracks nothing is skipped, whatever the instrumentation table says', () => {
  const root = project();
  setState(root, { track: 'change' });
  write(root, '04-spec.md', '# Spec\n## Acceptance criteria\n| # | Criterion |\n|---|---|\n| 1 | sorts |\n\n## Tracking plan\n| Event | Trigger | Properties | Measures | New or existing |\n|---|---|---|---|---|\n| None | — | — | — | — |\n');
  write(root, '05-build-plan.md', '# Build\n## Instrumentation\n| Event | Triggered by | Arrived | Properties verified | Evidence |\n|---|---|---|---|---|\n| none | — | no events in this change | — | — |\n');
  assert.equal(gate(root, 5).by['5.3'], 'skip');
  setState(root, { track: 'feature' });
  assert.equal(gate(root, 5).by['5.3'], 'fail');
});
