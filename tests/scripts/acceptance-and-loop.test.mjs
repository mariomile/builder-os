// Tests for the plan-first build, human acceptance, constraint conflicts, the post-KEEP watch and pace.
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
  const r = spawnSync(process.execPath, [SCRIPT, ...args, '--root', root], { encoding: 'utf8' });
  return { code: r.status, out: r.stdout, err: r.stderr };
};
const gate = (root, n) => {
  const j = JSON.parse(run(root, 'gate', String(n), '--json').out);
  return { ...j, by: Object.fromEntries(j.results.map((x) => [x.id, x.status])) };
};
const INIT = (root) => path.join(root, '.builderos/initiatives/csv-export');
const write = (root, file, body) => fs.writeFileSync(path.join(INIT(root), file), body);
const statePath = (root) => path.join(INIT(root), 'state.json');
const state = (root) => JSON.parse(fs.readFileSync(statePath(root), 'utf8'));
const setState = (root, patch) => fs.writeFileSync(statePath(root), JSON.stringify({ ...state(root), ...patch }, null, 2));

const SPEC = (conflicts) => `# Spec\n\n## Out of scope\n| Item | Kind | Reason |\n|---|---|---|\n| XLSX | not now | CSV first |\n\n## Acceptance criteria\n| # | Criterion | Flow |\n|---|---|---|\n| 1 | A manager downloads the weekly view as CSV | export |\n\n## States\n| Flow / step | Empty | Loading | Partial | Error | Success | Permission |\n|---|---|---|---|---|---|---|\n| export | no deals message | spinner | partial note | retry | file saved | hidden |\n\n**Model output:** no\n\n## Tracking plan\n| Event | Trigger | Properties | Measures | New or existing |\n|---|---|---|---|---|\n| export_completed | download | rows | exports | new |\n\n**Computes the phase 2 metric:** managers with one export_completed per week\n${conflicts}`;
const DESIGN = '# Design\n\n## Accessibility floor\nKeyboard path through the export button, contrast 4.5:1, focus returns to the button.\n';
const CONFLICTS_HEAD = '\n## Conflicts\n| Constraint A | Constraint B | Why both cannot hold | Decides | Blocks |\n|---|---|---|---|---|\n';

test('gate 4.7 needs a Conflicts section, and every conflict names who decides', () => {
  const root = project();
  write(root, 'DESIGN.md', DESIGN);
  write(root, '04-spec.md', SPEC(''));
  assert.equal(gate(root, 4).by['4.7'], 'fail', 'no section');
  write(root, '04-spec.md', SPEC(CONFLICTS_HEAD + '| audit every export | no new tables without an ADR | the audit log needs a table |  | 1 |\n'));
  assert.equal(gate(root, 4).by['4.7'], 'fail', 'nobody decides');
  write(root, '04-spec.md', SPEC(CONFLICTS_HEAD + '| audit every export | no new tables without an ADR | the audit log needs a table | {person} | 1 |\n'));
  assert.equal(gate(root, 4).by['4.7'], 'fail', 'a template placeholder is not a decider');
  write(root, '04-spec.md', SPEC(CONFLICTS_HEAD + '| audit every export | no new tables without an ADR | the audit log needs a table | Mario | 1 |\n'));
  assert.equal(gate(root, 4).by['4.7'], 'pass');
  write(root, '04-spec.md', SPEC('\n## Conflicts\nNone found between PRODUCT.md and TECH.md constraints.\n'));
  assert.equal(gate(root, 4).by['4.7'], 'pass', 'stating none is a valid answer');
});

test('phase 4 advances only with the person who accepted the spec, and records it', () => {
  const root = project();
  setState(root, { current_phase: 4, phases: { ...state(root).phases, 4: { status: 'in_progress', artifact: null, gate: null } } });
  write(root, 'DESIGN.md', DESIGN);
  write(root, '04-spec.md', SPEC('\n## Conflicts\nNone found.\n'));
  const judged = gate(root, 4).checked_by.model.map((id) => `${id}=pass`).join(',');
  const refused = run(root, 'record', '4', '--judged', judged);
  assert.equal(refused.code, 2);
  assert.match(refused.err, /a person accepts 04-spec\.md/);
  assert.equal(state(root).current_phase, 4, 'nothing advanced');
  assert.equal(run(root, 'record', '4', '--judged', judged, '--accepted-by', '').code, 2, 'an empty name is not an acceptance');
  assert.equal(run(root, 'record', '4', '--judged', judged, '--accepted-by', 'Mario').code, 0);
  const s = state(root);
  assert.equal(s.current_phase, 5);
  assert.equal(s.phases['4'].gate.accepted_by, 'Mario');
  assert.ok(s.phases['4'].gate.accepted_at);
  assert.equal(s.history.at(-1).accepted_by, 'Mario');
});

test('a failed gate needs no acceptance and records none', () => {
  const root = project();
  setState(root, { current_phase: 4, phases: { ...state(root).phases, 4: { status: 'in_progress', artifact: null, gate: null } } });
  write(root, 'DESIGN.md', DESIGN);
  write(root, '04-spec.md', SPEC(''));
  const judged = gate(root, 4).checked_by.model.map((id) => `${id}=pass`).join(',');
  assert.equal(run(root, 'record', '4', '--judged', judged).code, 1);
  assert.equal(state(root).phases['4'].gate.accepted_by, undefined);
});

const BUILD = ({ accepted = '**Accepted:** Mario · 2026-01-01T09:00Z', files = true, risks = true } = {}) => `# Build\n\n## Plan\n${accepted}\n\n## Slices\n| # | Slice |${files ? ' Files |' : ''} Acceptance criteria | Blocks on | Status |\n|---|---|${files ? '---|' : ''}---|---|---|\n| 1 | export end to end |${files ? ' src/export.ts |' : ''} 1 | none | done |\n\n## Risks\n| Risk | Mitigation |\n|---|---|\n${risks ? '| large accounts time out | stream rows |\n' : ''}`;

test('gate 5.6 needs an accepted plan whose slices name files and whose risks are written; 5.7 is judged', () => {
  const root = project();
  write(root, '04-spec.md', SPEC(''));
  write(root, '05-build-plan.md', BUILD());
  const g = gate(root, 5);
  assert.equal(g.by['5.6'], 'pass');
  assert.equal(g.by['5.7'], 'judge');
  for (const variant of [{ accepted: '**Accepted:** Mario' }, { accepted: '**Accepted:** 2026-01-01T09:00Z' }, { accepted: '**Accepted:** Mario · 2999-01-01T09:00Z' }, { files: false }, { risks: false }]) {
    write(root, '05-build-plan.md', BUILD(variant));
    assert.equal(gate(root, 5).by['5.6'], 'fail', JSON.stringify(variant));
  }
});

const RELEASE = (authorized) => `# Release\n\n## Exposure verification\n**Status:** planned\n${authorized ? '**Authorized by:** Mario, "go to production" in chat 2026-01-03\n' : ''}`;

test('gate 6.8 needs the person who authorized exposure', () => {
  const root = project();
  write(root, '06-release.md', RELEASE(false));
  assert.equal(gate(root, 6).by['6.8'], 'fail');
  write(root, '06-release.md', RELEASE(true));
  assert.equal(gate(root, 6).by['6.8'], 'pass');
});

const OUTCOME = (decision, reentry, watch) => `# Outcome\n\n## Measured 2026-12-01, 60 days after rollout\n| Metric | Baseline | Actual | Target | Delta | Tag |\n|---|---|---|---|---|---|\n| exports | 0 | 32% | 30% | +32 | \`[code:src/export.ts:1]\` |\n\n## Against kill criteria\n**Criterion:** below 15%\n**Verdict:** cleared, 32 > 15\n\n## Decision: ${decision}\n**Why:** above target\n**Re-enters at:** ${reentry}\n\n## Learning\nManagers export when the file matches the meeting agenda.\n${watch}`;
const WATCH = (recheck) => `\n## Watch\n**Metric:** share of managers with a weekly export\n**Bands:** 1σ note, 2σ diagnose read-only, 3σ new initiative\n**Owner:** Mario\n**Recheck:** ${recheck}\n`;

test('a closing KEEP needs a watch (7.5), record stores it, and brief raises it when due', () => {
  const root = project();
  write(root, '07-outcome.md', OUTCOME('KEEP', 'none', ''));
  assert.equal(gate(root, 7).by['7.5'], 'fail');
  write(root, '07-outcome.md', OUTCOME('ITERATE', 'phase 3', ''));
  assert.equal(gate(root, 7).by['7.5'], 'skip');
  write(root, '07-outcome.md', OUTCOME('KEEP', 'none', WATCH('2026-01-15')));
  const g = gate(root, 7);
  assert.equal(g.by['7.5'], 'pass');
  setState(root, { current_phase: 7, review_due: '2026-12-01' });
  const judged = g.checked_by.model.map((id) => `${id}=pass`).join(',');
  assert.equal(run(root, 'record', '7', '--judged', judged, '--verdict', 'keep').code, 0);
  const s = state(root);
  assert.equal(s.status, 'closed');
  assert.equal(s.watch.recheck, '2026-01-15');
  assert.match(s.watch.metric, /weekly export/);
  const brief = run(root, 'brief').out;
  assert.match(brief, /watch on CSV export is due \(share of managers with a weekly export, recheck 2026-01-15\)/);
  assert.doesNotMatch(brief, /does not follow the schema/);
});

test('pace reports time per phase, failed gates, who accepted, and phase 1 kills', () => {
  const root = project();
  const out = run(root, 'pace').out;
  assert.match(out, /## Pace · CSV export/);
  assert.match(out, /\| 0 Frame \| covered \|/);
  assert.match(out, /Spec rework after the plan:\*\* unavailable without git/);
  assert.match(out, /Phase 1 kills:\*\* \d+ of \d+/);
});

test('--accepted-by belongs to phases 0, 4 and 6 only', () => {
  const root = project();
  assert.equal(run(root, 'record', '2', '--judged', '2.5=pass,2.6=pass', '--accepted-by', 'Mario').code, 2);
  assert.equal(state(root).current_phase, 2);
});

test('watch rolls the recheck after a clean check and clears on a breach, with history events', () => {
  const root = project();
  write(root, '07-outcome.md', OUTCOME('KEEP', 'none', WATCH('2026-01-15')));
  setState(root, { current_phase: 7, review_due: '2026-12-01' });
  const judged = gate(root, 7).checked_by.model.map((id) => `${id}=pass`).join(',');
  assert.equal(run(root, 'record', '7', '--judged', judged, '--verdict', 'keep').code, 0);
  assert.equal(run(root, 'watch', '--initiative', 'csv-export', '--recheck', '2026-01-01', '--note', 'x').code, 2, 'the next recheck is in the future');
  assert.equal(run(root, 'watch', '--initiative', 'csv-export', '--recheck', '2099-01-01').code, 2, 'a check records what it saw');
  assert.equal(run(root, 'watch', '--initiative', 'csv-export', '--recheck', '2099-01-01', '--note', 'within 1σ').code, 0);
  assert.equal(state(root).watch.recheck, '2099-01-01');
  assert.equal(state(root).history.at(-1).event, 'watch_checked');
  assert.doesNotMatch(run(root, 'brief').out, /watch on CSV export is due/);
  assert.equal(run(root, 'watch', '--initiative', 'csv-export', '--clear', '--note', '3σ drop').code, 2, 'a breach names its initiative');
  assert.equal(run(root, 'watch', '--initiative', 'csv-export', '--clear', '--breach', 'csv-export-drop', '--note', '3σ drop').code, 0);
  assert.equal(state(root).watch, null);
  assert.equal(state(root).history.at(-1).event, 'watch_breached');
  assert.doesNotMatch(run(root, 'brief').out, /does not follow the schema/);
});
