// Gates on the quality of what is built (4.12, 4.13, 5.9, 5.10, 5.12, 6.10, 6.11), evidence imported
// from outside the session, and the one-line context added to every message.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { spawnSync } from 'child_process';
import { fileURLToPath } from 'url';
import { png } from './helpers/files.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(HERE, '../..');
const SCRIPT = path.join(REPO, 'scripts/bos.mjs');
const FIXTURE = path.join(REPO, 'tests/fixtures/acme');

function project() {
  const dir = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), 'bos-quality-')));
  fs.cpSync(FIXTURE, dir, { recursive: true });
  return dir;
}
function run(root, input, ...args) {
  const r = spawnSync(process.execPath, [SCRIPT, ...args, '--root', root], { encoding: 'utf8', input });
  return { code: r.status, out: r.stdout, err: r.stderr };
}
function gate(root, n, ...extra) {
  const j = JSON.parse(run(root, '', 'gate', String(n), '--json', ...extra).out);
  return { ...j, by: Object.fromEntries(j.results.map((x) => [x.id, x.status])), detail: Object.fromEntries(j.results.map((x) => [x.id, x.detail])) };
}
const INIT = (root, slug = 'csv-export') => path.join(root, '.builderos/initiatives', slug);
const write = (root, file, body, slug) => fs.writeFileSync(path.join(INIT(root, slug), file), body);

const ACS = '## Acceptance criteria\n| # | Criterion | Flow |\n|---|---|---|\n| 1 | A manager downloads the weekly view as CSV | export |\n| 2 | Only managers of the team see the button | export |\n| 3 | The file arrives within 3 seconds for 5,000 deals | export |\n';
const QUALITY = (perm, data, perf) => `## Quality bar\n| Area | Criteria | Not applicable because |\n|---|---|---|\n| Permissions | ${perm} | |\n| Personal data | | ${data} |\n| Performance | ${perf} | |\n`;

test('gate 4.12 wants permissions, personal data and performance as criteria or a stated reason', () => {
  const root = project();
  write(root, '04-spec.md', `# Spec\n\n${ACS}`);
  assert.equal(gate(root, 4).by['4.12'], 'fail');
  write(root, '04-spec.md', `# Spec\n\n${ACS}\n${QUALITY('2', 'deal names only, no personal fields', '3')}`);
  assert.equal(gate(root, 4).by['4.12'], 'pass');
  write(root, '04-spec.md', `# Spec\n\n${ACS}\n${QUALITY('9', '', '3')}`);
  const g = gate(root, 4);
  assert.equal(g.by['4.12'], 'fail');
  assert.match(g.detail['4.12'], /permissions cites criteria that do not exist: 9/);
  assert.match(g.detail['4.12'], /personal data/);
});

test('gate 4.13 asks the product track for a real-user session and skips the others', () => {
  const root = project();
  write(root, '04-spec.md', `# Spec\n\n${ACS}`);
  assert.equal(gate(root, 4).by['4.13'], 'skip', 'feature track');
  const slug = 'onboarding-v2';
  write(root, '04-spec.md', `# Spec\n\n${ACS}\n## Real users\nWe will show the prototype to three managers next week.\n`, slug);
  assert.equal(gate(root, 4, '--initiative', slug).by['4.13'], 'fail', 'a plan is not a session');
  write(root, '04-spec.md', `# Spec\n\n${ACS}\n## Real users\nOne manager walked the clickable prototype and exported on the second try \`[interview:P9]\`.\n`, slug);
  assert.equal(gate(root, 4, '--initiative', slug).by['4.13'], 'pass');
});

const REVIEW = (rows, widths = '**Widths:** 1280 and 390\n') => `# Build\n\n## Interface review\n${widths}| State | Screenshot or route | Matches the chosen direction |\n|---|---|---|\n${rows}\n`;
const SIX = (error = '/reports?state=error | yes') => `| empty | review/empty.png | yes |\n| loading | /reports?state=loading | yes |\n| partial | /reports?state=partial | yes |\n| error | ${error} |\n| success | /reports | yes |\n| permission | not applicable, every manager sees the same report |`;

test('gate 5.9 wants all six states looked at, at two widths, matching the chosen direction', () => {
  const root = project();
  write(root, '05-build-plan.md', '# Build\n');
  assert.equal(gate(root, 5).by['5.9'], 'fail');
  write(root, '05-build-plan.md', REVIEW('| success | /reports | yes |'));
  assert.match(gate(root, 5).detail['5.9'], /no empty state reviewed.*no loading state reviewed.*no error state reviewed/);
  write(root, '05-build-plan.md', REVIEW(SIX('/reports?state=error | no, spacing off')));
  const g = gate(root, 5);
  assert.match(g.detail['5.9'], /review\/empty\.png not found/);
  assert.match(g.detail['5.9'], /error: does not match/);
  fs.mkdirSync(path.join(INIT(root), 'review'));
  fs.writeFileSync(path.join(INIT(root), 'review/empty.png'), '');
  write(root, '05-build-plan.md', REVIEW(SIX('/reports?state=error | yes, deviation recorded in DESIGN.md')));
  assert.match(gate(root, 5).detail['5.9'], /review\/empty\.png is empty/, 'an empty file is not a screenshot');
  fs.writeFileSync(path.join(INIT(root), 'review/empty.png'), png(800, 600));
  assert.match(gate(root, 5).detail['5.9'], /captures 800 pixels wide match none of the widths reviewed/, 'the width is read from the image');
  fs.writeFileSync(path.join(INIT(root), 'review/empty.png'), png(1280, 800));
  write(root, '05-build-plan.md', REVIEW(SIX('/reports?state=error | yes, deviation recorded in DESIGN.md').replace('| loading | /reports?state=loading |', '| loading | review/empty.png |')));
  assert.match(gate(root, 5).detail['5.9'], /the same capture stands for empty, loading/, 'one capture is one state');
  write(root, '05-build-plan.md', REVIEW(SIX('/reports?state=error | yes, deviation recorded in DESIGN.md'), ''));
  assert.match(gate(root, 5).detail['5.9'], /no "\*\*Widths:\*\*" naming two widths/);
  write(root, '05-build-plan.md', REVIEW(SIX('/reports?state=error | yes, deviation recorded in DESIGN.md')));
  assert.equal(gate(root, 5).by['5.9'], 'pass');
  write(root, '05-build-plan.md', REVIEW(SIX().replace('not applicable, every manager sees the same report', 'not applicable')));
  assert.match(gate(root, 5).detail['5.9'], /permission: "not applicable" needs its reason/);
  write(root, '05-build-plan.md', '# Build\n');
  write(root, 'DESIGN.md', '# Design\n\n**Visual direction:** not applicable, a CSV endpoint with no interface\n');
  assert.equal(gate(root, 5).by['5.9'], 'skip');
  assert.equal(gate(root, 5).by['5.12'], 'skip', 'no interface, no craft critique');
});

test('gate 5.9 on the change track looks at the hard states of the screen it touches', () => {
  const root = project();
  const state = path.join(INIT(root), 'state.json');
  const s = JSON.parse(fs.readFileSync(state, 'utf8'));
  fs.writeFileSync(state, JSON.stringify({ ...s, track: 'change' }));
  write(root, '05-build-plan.md', REVIEW('| empty | /reports?state=empty | yes |\n| error | /reports?state=error | yes |', ''));
  assert.equal(gate(root, 5).by['5.9'], 'pass');
});

const CRITIQUE = (rows, by = '**Run by:** a fresh agent given DESIGN.md, the voice and the routes, not the build conversation\n') => `\n## Craft critique\n${by}| Aspect | Finding | What happened |\n|---|---|---|\n${rows}\n`;
const ASPECTS = ['Hierarchy', 'Spacing rhythm', 'Typography', 'Copy against the voice', 'Focus states', 'Motion and reduced motion', 'Interaction states', 'Next to the references'];

test('gate 5.12 wants a fresh-context craft critique, aspect by aspect, each finding acted on', () => {
  const root = project();
  fs.mkdirSync(path.join(INIT(root), 'review'));
  fs.writeFileSync(path.join(INIT(root), 'review/empty.png'), png(1280, 800));
  write(root, '05-build-plan.md', REVIEW(SIX()));
  assert.match(gate(root, 5).detail['5.12'], /no "## Craft critique"/);
  write(root, '05-build-plan.md', REVIEW(SIX()) + CRITIQUE(ASPECTS.slice(0, 4).map((a) => `| ${a} | none found | — |`).join('\n'), ''));
  const g = gate(root, 5);
  assert.match(g.detail['5.12'], /no "\*\*Run by:\*\*"/);
  assert.match(g.detail['5.12'], /no row for focus states.*no row for motion/);
  write(root, '05-build-plan.md', REVIEW(SIX()) + CRITIQUE(ASPECTS.map((a, i) => `| ${a} | ${i ? 'none found' : 'two primary buttons compete'} | ${i ? '—' : ''} |`).join('\n')));
  assert.match(gate(root, 5).detail['5.12'], /hierarchy: a finding/);
  write(root, '05-build-plan.md', REVIEW(SIX()) + CRITIQUE(ASPECTS.map((a, i) => `| ${a} | ${i ? 'none found' : 'two primary buttons compete'} | ${i ? '—' : 'fixed: filters became secondary'} |`).join('\n')));
  assert.equal(gate(root, 5).by['5.12'], 'pass');
});

test('gate 5.10 wants the four automatic checks in TECH.md, and a named decline is a warning', () => {
  const root = project();
  write(root, '05-build-plan.md', '# Build\n');
  assert.equal(gate(root, 5).by['5.10'], 'pass', 'the fixture names all four');
  const tech = path.join(root, 'TECH.md');
  const base = fs.readFileSync(tech, 'utf8').replace(/\*\*Quality checks:\*\*.*\n/, '');
  fs.writeFileSync(tech, base + '**Quality checks:** Playwright on the primary flow, secret scan\n');
  const g = gate(root, 5);
  assert.equal(g.by['5.10'], 'fail');
  assert.match(g.detail['5.10'], /accessibility, dependency audit/);
  fs.writeFileSync(tech, base + '**Quality checks:** declined by Luca, the platform team owns CI\n');
  assert.equal(gate(root, 5).by['5.10'], 'warn');
});

const RELEASE = (extra) => `# Release\n\n## Rollback\n**Mechanism:** revert\n**Owner:** Mario\n**Tested:** 2026-10-01\n\n## Exposure verification\n**Status:** verified\n**Exposed at:** 2026-10-02T10:00:00Z\n**Environment:** production\n**Version:** v1.0.0\n**Verification:** a manager exported \`[doc:release-check]\`\n**Authorized by:** Mario\n${extra}`;

test('gate 6.10 wants errors seen before users report them and a tested restore; 6.11 a first real use on the product track', () => {
  const root = project();
  write(root, '06-release.md', RELEASE(''));
  let g = gate(root, 6);
  assert.equal(g.by['6.10'], 'fail');
  assert.equal(g.by['6.11'], 'skip', 'feature track');
  write(root, '06-release.md', RELEASE('\n## Production readiness\n**Errors seen by:** error tracker, alert to Mario\n**Backup restored:** 2026-10-01, staging restore from last night\n'));
  assert.equal(gate(root, 6).by['6.10'], 'pass');
  const slug = 'onboarding-v2';
  write(root, '06-release.md', RELEASE('\n## Production readiness\n**Errors seen by:** error tracker\n**Backup restored:** not applicable, no stored data\n'), slug);
  assert.equal(gate(root, 6, '--initiative', slug).by['6.11'], 'fail', 'online is not in use');
  write(root, '06-release.md', RELEASE('\n## Production readiness\n**Errors seen by:** error tracker\n**Backup restored:** not applicable, no stored data\n\n## First real use\nA manager outside the team finished onboarding on day two `[data:onboarding_completed]`.\n'), slug);
  assert.equal(gate(root, 6, '--initiative', slug).by['6.11'], 'pass');
});

test('evidence add saves outside material as a file the tags resolve to, and never overwrites', () => {
  const root = project();
  const notes = 'P3, ops lead: "I rebuild the weekly sheet by hand every Monday, two hours."';
  const r = run(root, notes, 'evidence', 'add', '--class', 'interview', '--id', 'P3', '--where', 'call on 2026-10-15', '--captured', '2026-10-15');
  assert.equal(r.code, 0, r.err);
  assert.match(r.out, /Cite it as \[interview:P3\]/);
  const file = path.join(INIT(root), 'evidence/P3.md');
  const body = fs.readFileSync(file, 'utf8');
  assert.match(body, /\*\*Class:\*\* interview/);
  assert.match(body, /\*\*Captured:\*\* 2026-10-15/);
  assert.ok(body.includes(notes));
  assert.notEqual(run(root, 'other notes, long enough to count here', 'evidence', 'add', '--class', 'interview', '--id', 'P3', '--where', 'call').code, 0, 'no overwrite');
  assert.equal(fs.readFileSync(file, 'utf8'), body);
  assert.match(run(root, 'https://x.y', 'evidence', 'add', '--class', 'doc', '--id', 'link', '--where', 'a URL').err, /too short/);
  assert.match(run(root, notes, 'evidence', 'add', '--class', 'interview', '--id', 'P1,P4', '--where', 'calls').err, /one participant per file/);
  assert.match(run(root, notes, 'evidence', 'add', '--class', 'estimate', '--id', 'e1', '--where', 'x').err, /interview, doc or data/);
  const shared = run(root, 'Support export, August: 41 tickets ask for a CSV of the weekly view.', 'evidence', 'add', '--class', 'data', '--id', 'tickets-aug', '--where', 'helpdesk export', '--shared');
  assert.equal(shared.code, 0, shared.err);
  assert.ok(fs.existsSync(path.join(root, '.builderos/evidence/tickets-aug.md')));
});

test('the per-message context names the phase and what to check, and stays silent outside a project', () => {
  const root = project();
  const out = JSON.parse(run(root, '{}', 'context').out);
  assert.equal(out.hookSpecificOutput.hookEventName, 'UserPromptSubmit');
  const line = out.hookSpecificOutput.additionalContext;
  assert.match(line, /phase 2 Define \(feature track\)/);
  assert.match(line, /check it against decisions\//);
  assert.ok(line.length < 600, `${line.length} characters`);
  const empty = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), 'bos-quality-')));
  assert.equal(run(empty, '{}', 'context').out, '');
  const config = JSON.parse(fs.readFileSync(path.join(REPO, 'hooks/hooks.json'), 'utf8'));
  assert.match(config.hooks.UserPromptSubmit[0].hooks[0].command, /run-hook\.cmd" user-prompt-submit$/);
});
