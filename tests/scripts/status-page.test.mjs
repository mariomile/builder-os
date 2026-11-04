import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

// The project's status in four parts, generated from the files: open decisions with what they block, in progress,
// next, done. The same model renders .builderos/index.html and .builderos/STATUS.md, so the two never disagree.
const script = new URL('../../scripts/bos.mjs', import.meta.url).pathname;
const fixture = new URL('../fixtures/acme', import.meta.url).pathname;
function project(t) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'bos-status-'));
  fs.cpSync(fixture, root, { recursive: true });
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const file = (rel) => path.join(root, rel);
  const write = (rel, s) => { fs.mkdirSync(path.dirname(file(rel)), { recursive: true }); fs.writeFileSync(file(rel), s); };
  const edit = (rel, fn) => fs.writeFileSync(file(rel), fn(fs.readFileSync(file(rel), 'utf8')));
  const run = (...a) => spawnSync(process.execPath, [script, ...a, '--root', root], { encoding: 'utf8' });
  const read = (rel) => fs.readFileSync(file(rel), 'utf8');
  return { write, edit, run, read };
}
const LOG = `# Question log: Pilot or ship

| Q | Question | Answer | By, date | Rests on | Status |
|---|---|---|---|---|---|
| Q1 | Who uses it weekly? | Four people | Dana, 2026-10-29 | — | decided |
| Q2 | Which reports move first? | — | — | Q1 | open, from Q1 |
`;
const ADR = (revisit) => `# ADR-001 Postgres for reports\n\n**Date:** 2026-09-01\n\n## Decision\nPostgres.\n\n## Revisit when\n${revisit}\n`;

function seed(p) {
  p.write('.builderos/initiatives/csv-export/grilling.md', LOG);
  p.write('.builderos/decisions/ADR-001-postgres.md', ADR('Rows pass ten million, or by 2026-10-01.'));
  p.write('.builderos/decisions/ADR-002-hosting.md', ADR('Monthly cost passes 400 euros.').replace('ADR-001 Postgres for reports', 'ADR-002 Hosting').replace('2026-09-01', '2026-09-05'));
  p.edit('.builderos/ROADMAP.md', (md) => md.replace('|------------|----------|-------------------------|', '|------------|----------|-------------------------|\n| Team digests | managers asked for it in four calls | CSV export ships |').replace('## Later\n', '## Later\n- Slack delivery of the report\n'));
  p.edit('.builderos/initiatives/onboarding-v2/state.json', (s) => { const j = JSON.parse(s); j.status = 'closed'; j.phases['0'] = { status: 'killed', artifact: '00-frame.md', gate: null }; return JSON.stringify(j, null, 2); });
}

test('the status page has open decisions with what they block, in progress, next and done, in that order', (t) => {
  const p = project(t);
  seed(p);
  const r = p.run('page');
  assert.equal(r.status, 0, r.stderr);
  assert.match(r.stdout, /index\.html and \.builderos\/STATUS\.md: 2 open decisions, 1 in progress, 1 done/);
  const html = p.read('.builderos/index.html');
  const order = ['Open decisions', 'In progress', 'Next', 'Done', 'Project memory'].map((h) => html.indexOf(`<h2>${h}</h2>`));
  assert.ok(order.every((x, k) => x > 0 && (k === 0 || x > order[k - 1])), `sections out of order: ${order}`);
  assert.match(html, /Q2 Which reports move first\?<\/a><\/td><td>CSV export: phase 2 Define<\/td>/, 'an open question from the log, with the phase it blocks');
  assert.match(html, /href="initiatives\/csv-export\/grilling\.md"/);
  assert.match(html, /revisit ADR-001-postgres<\/a><\/td><td>ADR-001-postgres stands until someone revisits it<\/td><td>2026-10-01/, 'a decision past its revisit date');
  assert.doesNotMatch(html, /revisit ADR-002/, 'a decision with no date due stays out');
  assert.match(html, /<strong>CSV export<\/strong>: start phase 2 Define|<strong>CSV export<\/strong>: finish phase 2 Define/, 'the next step of each open initiative');
  assert.match(html, /<strong>Team digests<\/strong> \(roadmap\): managers asked for it in four calls\. First: CSV export ships/);
  assert.match(html, /Later: Slack delivery of the report/);
  assert.match(html, /<strong>Onboarding rework<\/strong>: killed at phase 0/, 'a closed initiative and how it ended');
  assert.ok(html.indexOf('ADR-002-hosting') < html.indexOf('ADR-001-postgres</a> <span'), 'decisions taken, newest first');
});

test('STATUS.md says the same as the page, readable where HTML shows as source', (t) => {
  const p = project(t);
  seed(p);
  p.run('page');
  const md = p.read('.builderos/STATUS.md');
  assert.match(md, /^# Acme Reports: status$/m);
  assert.match(md, /Do not edit it/);
  assert.match(md, /^\| \[Q2 Which reports move first\?\]\(initiatives\/csv-export\/grilling\.md\) \| CSV export: phase 2 Define \|  \|$/m);
  assert.match(md, /^\| \[revisit ADR-001-postgres\]\(decisions\/ADR-001-postgres\.md\) \| .+ \| 2026-10-01 \|$/m);
  assert.match(md, /^- \*\*CSV export\*\* \(feature, phase 2 Define\)/m);
  assert.match(md, /^- \*\*Team digests\*\* \(roadmap\)/m);
  assert.match(md, /^- \*\*Onboarding rework\*\*: killed at phase 0/m);
  const sections = [...md.matchAll(/^## (.+)$/gm)].map((m) => m[1]);
  assert.deepEqual(sections, ['Open decisions', 'In progress', 'Next', 'Done']);
});

test('an empty project says so in every section instead of leaving it blank', (t) => {
  const p = project(t);
  p.edit('.builderos/initiatives/csv-export/state.json', (s) => s.replace('"status": "open"', '"status": "closed"'));
  p.edit('.builderos/initiatives/onboarding-v2/state.json', (s) => s.replace(/"status": "(open|paused)"/, '"status": "closed"'));
  p.run('page');
  const md = p.read('.builderos/STATUS.md');
  assert.match(md, /Nothing waits on a person\./);
  assert.match(md, /## In progress\n\nNothing open\./);
  assert.match(md, /Nothing planned: the roadmap has no Next\./);
});

test('every state change regenerates STATUS.md with the page', (t) => {
  const p = project(t);
  p.run('roadmap');
  assert.doesNotMatch(p.read('.builderos/STATUS.md'), /question/);
  p.run('round', '--asked', '3');
  const md = p.read('.builderos/STATUS.md');
  assert.match(md, /\| 3 questions in the round asked \| CSV export: phase 2 Define \| \d{4}-\d{2}-\d{2} \|/);
  assert.match(md, /- \*\*CSV export\*\*: your answers to the round asked/);
});
