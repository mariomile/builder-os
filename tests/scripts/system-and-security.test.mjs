// Gates 4.18 (the architecture: components, contracts, external calls planned for failure, scale defaults, capacity),
// 4.19 (the threat model: four standing threats, each mitigated and tested), 5.13 (a fresh-context security review),
// 5.14 (the performance budget measured), and 5.10's token check and visual regression for an interface.
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
  const dir = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), 'bos-sys-')));
  fs.cpSync(FIXTURE, dir, { recursive: true });
  return dir;
}
const gate = (root, n) => {
  const r = spawnSync(process.execPath, [SCRIPT, 'gate', String(n), '--json', '--initiative', 'csv-export', '--root', root], { encoding: 'utf8' });
  const j = JSON.parse(r.stdout);
  return { ...j, by: Object.fromEntries(j.results.map((x) => [x.id, x.status])), detail: Object.fromEntries(j.results.map((x) => [x.id, x.detail])) };
};
const write = (root, file, body) => {
  const p = path.join(root, '.builderos/initiatives/csv-export', file);
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, body);
};

const ACS = '## Acceptance criteria\n| # | Criterion | Flow |\n|---|---|---|\n| 1 | A manager downloads the weekly view as CSV | export |\n| 2 | A request for another team\'s export returns not found | export |\n| 3 | A cell starting with = is exported as text | export |\n| 4 | The eleventh export in a minute is refused with a message | export |\n| 5 | The client bundle contains no storage key | export |\n';
const CALLS = '| Storage: put the file | 10 s | 3 attempts with backoff | export id | the export shows "not ready, retry" |';
const DEFAULTS = (skip = '') => [
  ['Owner key on every row', 'team_id on exports, set from the session'],
  ['Paginated lists', 'the export history is 20 per page'],
  ['Indexed queries', '(team_id, created_at) on exports'],
  ['Idempotent writes', 'export keyed by team and week'],
  ['Slow work off the request', 'the file is built in a job, the button shows progress'],
  ['Reversible migrations', 'one additive table'],
].filter(([d]) => d !== skip).map(([d, how]) => `| ${d} | ${how} | |`).join('\n');
const ARCH = ({ calls = CALLS, defaults = DEFAULTS(), capacity = '120 teams, 600 exports a week `[doc:business]` · designed for 1,200 teams', contracts = true } = {}) =>
  `## Architecture\n### Components\n| Component | Responsibility | Owns | Talks to |\n|---|---|---|---|\n| API | builds and serves exports | Export | Job runner: event |\n| Job runner | writes the CSV | — | Storage: call |\n\n${contracts ? '### Contracts\n| Contract | Shapes | Errors | Lists |\n|---|---|---|---|\n| POST /exports | week → export id | 404 not_found | not a list |\n\n' : ''}### External calls\n| Call | Timeout | Retry | Idempotency | When it fails |\n|---|---|---|---|---|\n${calls}\n\n### Scale defaults\n| Default | How | Not applicable because |\n|---|---|---|\n${defaults}\n\n**Capacity:** ${capacity}\n`;
const THREATS = (rows) => `## Threat model\n**Boundaries:** browser → API; job runner → storage\n| Boundary | Threat | Mitigation | Criterion |\n|---|---|---|---|\n${rows}\n`;
const STANDING = [
  '| browser → API | another team\'s export requested by id | team_id from the session on every query | 2 |',
  '| browser → API | untrusted input: formulas in cells | cells prefixed and quoted | 3 |',
  '| browser → API | abuse: export loops running up storage | 10 exports a minute per team | 4 |',
  '| job runner → storage | secrets: the storage key | host secret store, server only | 5 |',
];
const SPEC = (body) => `# Spec\n\n${ACS}\n${body}`;
const DOC = '\n**Doc:** [doc:business]\n';
const evidence = (root) => {
  const p = path.join(root, '.builderos/initiatives/csv-export/evidence/business.md');
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, '# Business plan\n120 teams expected this quarter.\n');
};

test('gate 4.18 wants components, contracts, external calls planned for failure, the six defaults and a capacity', () => {
  const root = project();
  evidence(root);
  write(root, '04-spec.md', SPEC(''));
  assert.match(gate(root, 4).detail['4.18'], /no "## Architecture"/);
  write(root, '04-spec.md', SPEC(ARCH() + DOC));
  assert.equal(gate(root, 4).by['4.18'], 'pass');
  write(root, '04-spec.md', SPEC(ARCH({ calls: '| Storage: put the file | the default | | | |' })));
  let d = gate(root, 4).detail['4.18'];
  assert.match(d, /Storage: put the file: no timeout in seconds/);
  assert.match(d, /no retry rule, idempotency, failure behavior/);
  write(root, '04-spec.md', SPEC(ARCH({ defaults: DEFAULTS('Idempotent writes'), capacity: 'small', contracts: false })));
  d = gate(root, 4).detail['4.18'];
  assert.match(d, /no scale default row for idempotent writes/);
  assert.match(d, /no "\*\*Capacity:\*\*" with numbers/);
  assert.match(d, /no "### Contracts"/);
  write(root, '04-spec.md', SPEC(ARCH({ calls: '' }).replace('### External calls', '### External calls\nnone: nothing leaves the process')));
  assert.equal(gate(root, 4).by['4.18'], 'pass', 'no external call, said so');
  write(root, '04-spec.md', SPEC('**Architecture:** not applicable, a copy change on the settings page\n'));
  assert.equal(gate(root, 4).by['4.18'], 'pass');
});

test('gate 4.19 wants the four standing threats, each mitigated and tested by a criterion that exists', () => {
  const root = project();
  write(root, '04-spec.md', SPEC(''));
  assert.match(gate(root, 4).detail['4.19'], /no "## Threat model"/);
  write(root, '04-spec.md', SPEC(THREATS(STANDING.join('\n'))));
  assert.equal(gate(root, 4).by['4.19'], 'pass');
  write(root, '04-spec.md', SPEC(THREATS(STANDING.slice(1).join('\n'))));
  assert.match(gate(root, 4).detail['4.19'], /no row for another user's or customer's data/);
  write(root, '04-spec.md', SPEC(THREATS([STANDING[0].replace('| 2 |', '| 9 |'), STANDING[1].replace('cells prefixed and quoted', ''), STANDING[2].replace('| 4 |', '| — |'), STANDING[3]].join('\n'))));
  const d = gate(root, 4).detail['4.19'];
  assert.match(d, /cites criteria that do not exist: 9/);
  assert.match(d, /formulas in cells: no mitigation/);
  assert.match(d, /export loops running up storage: no acceptance criterion/);
  write(root, '04-spec.md', SPEC(THREATS([...STANDING.slice(0, 2), STANDING[2].replace('| 4 |', '| not applicable, an internal tool behind the company VPN |'), STANDING[3]].join('\n'))));
  assert.equal(gate(root, 4).by['4.19'], 'pass', 'not applicable with its reason');
});

const SECURITY = (rows, by = '**Run by:** a fresh agent given the diff, the threat model and TECH.md\n') => `\n## Security review\n${by}| Area | Finding | What happened |\n|---|---|---|\n${rows}\n`;
const AREAS = ['Access control', 'Input handling', 'Secrets and configuration', 'Abuse limits', 'Data exposure'];
const PERF = (rows) => `\n## Performance\n| Measure | Budget | Measured | Within budget | Evidence |\n|---|---|---|---|---|\n${rows}\n`;
const QUALITY = (perf) => `## Quality bar\n| Area | Criteria | Not applicable because |\n|---|---|---|\n| Permissions | 2 | |\n| Personal data | | deal amounts only |\n| Performance | ${perf} |\n`;

test('gate 5.13 wants a fresh-context security review of the diff, area by area, skipped without a threat model', () => {
  const root = project();
  write(root, '04-spec.md', SPEC(THREATS(STANDING.join('\n'))));
  write(root, '05-build-plan.md', '# Build\n');
  assert.match(gate(root, 5).detail['5.13'], /no "## Security review"/);
  write(root, '05-build-plan.md', '# Build\n' + SECURITY(AREAS.slice(0, 3).map((a) => `| ${a} | none found | — |`).join('\n'), ''));
  let d = gate(root, 5).detail['5.13'];
  assert.match(d, /no "\*\*Run by:\*\*"/);
  assert.match(d, /no row for abuse limits; no row for data exposure/);
  write(root, '05-build-plan.md', '# Build\n' + SECURITY(AREAS.map((a, i) => `| ${a} | ${i ? 'none found' : 'export id is guessable and unchecked'} | ${i ? '—' : ''} |`).join('\n')));
  assert.match(gate(root, 5).detail['5.13'], /access control: a finding/);
  write(root, '05-build-plan.md', '# Build\n' + SECURITY(AREAS.map((a, i) => `| ${a} | ${i ? 'none found' : 'export id is guessable and unchecked'} | ${i ? '—' : 'fixed: scoped by team, test 2'} |`).join('\n')));
  assert.equal(gate(root, 5).by['5.13'], 'pass');
  write(root, '04-spec.md', SPEC('**Threat model:** not applicable, a copy change\n'));
  assert.equal(gate(root, 5).by['5.13'], 'skip');
});

test('gate 5.14 measures the spec\'s performance budget, with a page-load row when there is an interface', () => {
  const root = project();
  const measure = (label, ...argv) => spawnSync(process.execPath, [SCRIPT, 'run-check', '--label', label, '--initiative', 'csv-export', '--root', root, '--', ...argv], { encoding: 'utf8' }).stdout.match(/\*\*Run:\*\*\s*(\S+)/)[1];
  const perf = measure('perf', process.execPath, '-e', "console.log('export of 500 deals: p95 0.8 s over 200 requests')");
  const echo = measure('perf', 'echo', 'p95', '0.8s');
  write(root, '04-spec.md', SPEC(QUALITY(' | a weekly CSV of a few hundred rows')));
  write(root, '05-build-plan.md', '# Build\n');
  assert.equal(gate(root, 5).by['5.14'], 'skip', 'performance not applicable in the spec');
  write(root, '04-spec.md', SPEC(QUALITY('1 | ')));
  assert.match(gate(root, 5).detail['5.14'], /no "## Performance"/);
  write(root, '05-build-plan.md', '# Build\n' + PERF('| export p95 | 2 s | fast | no | |'));
  const d = gate(root, 5).detail['5.14'];
  assert.match(d, /export p95: a budget and a measured value, both with numbers/);
  assert.match(d, /not within budget/);
  assert.match(d, /no evidence/);
  write(root, '05-build-plan.md', '# Build\n' + PERF(`| export p95 | 2 s | 0.8 s | yes | ${echo} |`));
  assert.match(gate(root, 5).detail['5.14'], /checks nothing/, 'a run of echo is not a measurement');
  write(root, '05-build-plan.md', '# Build\n' + PERF(`| export p95 | 2 s | 0.6 s | yes | ${perf} |`));
  assert.match(gate(root, 5).detail['5.14'], /the measured 0\.6 s does not appear in the run's output/);
  write(root, '05-build-plan.md', '# Build\n' + PERF(`| export p95 | 2 s | 0.8 s | yes | ${perf} |`));
  assert.equal(gate(root, 5).by['5.14'], 'pass');
  write(root, 'DESIGN.md', '# Design\n\n## Visual direction\n**Chosen:** A\n');
  assert.match(gate(root, 5).detail['5.14'], /no page-load row/);
  const lcp = measure('lcp', process.execPath, '-e', "console.log('largest contentful paint at 390 px: 1.7 s')");
  write(root, '05-build-plan.md', '# Build\n' + PERF(`| export p95 | 2 s | 0.8 s | yes | ${perf} |\n| Largest contentful paint, 390 px | 2.5 s | 1.7 s | yes | \`[code:src/export.ts:1]\` |`));
  assert.match(gate(root, 5).detail['5.14'], /Largest contentful paint, 390 px: no evidence/, 'a line of code is not a measurement');
  write(root, '05-build-plan.md', '# Build\n' + PERF(`| export p95 | 2 s | 0.8 s | yes | ${perf} |\n| Largest contentful paint, 390 px | 2.5 s | 1.7 s | yes | ${lcp} |`));
  assert.equal(gate(root, 5).by['5.14'], 'pass');
});

test('gate 5.10 adds static analysis, a token check with an interface, and visual regression once a look has shipped', () => {
  const root = project();
  write(root, '05-build-plan.md', '# Build\n');
  const tech = path.join(root, 'TECH.md');
  const base = fs.readFileSync(tech, 'utf8').replace(/\*\*Quality checks:\*\*.*\n/, '');
  fs.writeFileSync(tech, base + '**Quality checks:** axe on every route, Playwright on the primary flow, dependency audit, secret scan\n');
  assert.match(gate(root, 5).detail['5.10'], /does not cover: static analysis$/);
  write(root, 'DESIGN.md', '# Design\n\n## Visual direction\n**Chosen:** A\n');
  fs.writeFileSync(tech, base + '**Quality checks:** axe on every route, Playwright on the primary flow, dependency audit, secret scan, CodeQL static analysis\n');
  assert.match(gate(root, 5).detail['5.10'], /does not cover: token check$/);
  fs.writeFileSync(tech, base + '**Quality checks:** axe on every route, Playwright on the primary flow, dependency audit, secret scan, CodeQL static analysis, token check (stylelint: no colour or spacing outside tokens.css)\n');
  assert.equal(gate(root, 5).by['5.10'], 'pass');
  fs.appendFileSync(tech, '\n## Design system\n**Kit:** Acme UI\n**Tokens:** src/styles/tokens.css\n');
  assert.match(gate(root, 5).detail['5.10'], /does not cover: visual regression$/);
});
