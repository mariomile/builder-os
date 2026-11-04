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
  const order = ['Open decisions', 'In progress', 'Next', 'Done', 'Project memory'].map((h) => html.search(new RegExp(`<h2 id="[a-z]+">${h}</h2>`)));
  assert.ok(order.every((x, k) => x > 0 && (k === 0 || x > order[k - 1])), `sections out of order: ${order}`);
  assert.match(html, /<a href=\"#i-csv-export-grilling\">Q2 Which reports move first\?<\/a><\/td><td>CSV export: phase 2 Define<\/td>/, 'an open question from the log, with the phase it blocks');
  assert.match(html, /href="initiatives\/csv-export\/grilling\.md"/);
  assert.match(html, /<a href=\"#adr-ADR-001-postgres\">revisit ADR-001-postgres<\/a><\/td><td>ADR-001-postgres stands until someone revisits it<\/td><td>2026-10-01/, 'a decision past its revisit date');
  assert.doesNotMatch(html, /revisit ADR-002/, 'a decision with no date due stays out');
  assert.match(html, /<strong>CSV export<\/strong><\/a>: (start|finish) phase 2 Define/, 'the next step of each open initiative');
  assert.match(html, /<strong>Team digests<\/strong> \(roadmap\): managers asked for it in four calls\. First: CSV export ships/);
  assert.match(html, /Later: Slack delivery of the report/);
  assert.match(html, /<h3>Onboarding rework<\/h3><span class=\"pill\">product<\/span><span class=\"pill\">killed at phase 0<\/span>/, 'a closed initiative and how it ended');
  assert.ok(html.indexOf('id="adr-ADR-002-hosting"') < html.indexOf('id="adr-ADR-001-postgres"'), 'decisions taken, newest first');
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

test('the session briefing rewrites the page after a hand edit, and leaves it alone when only the date would change', (t) => {
  const p = project(t);
  p.run('page');
  p.write('.builderos/initiatives/csv-export/grilling.md', LOG);
  assert.equal(p.run('brief').status, 0);
  assert.match(p.read('.builderos/STATUS.md'), /Q2 Which reports move first\?/, 'a question log edited by hand shows up at the next session start');
  for (const f of ['.builderos/STATUS.md', '.builderos/index.html']) p.edit(f, (s) => s.replace(/(Generated by BuilderOS \S+ on )\d{4}-\d{2}-\d{2}/, '$12000-01-01'));
  p.run('brief');
  for (const f of ['.builderos/STATUS.md', '.builderos/index.html']) assert.match(p.read(f), /on 2000-01-01/, `${f} rewritten for its date alone`);
});

test('every item opens down to its documents: phases with their gate and full text, history, question log, decisions', (t) => {
  const p = project(t);
  seed(p);
  p.edit('.builderos/initiatives/csv-export/state.json', (s) => { const j = JSON.parse(s); j.phases['1'] = { status: 'passed', artifact: '01-discovery.md', gate: { passed: true, checked_at: '2026-09-02T12:00:00Z', failed_conditions: [], accepted_by: 'Dana' } }; return JSON.stringify(j, null, 2); });
  p.write('.builderos/initiatives/csv-export/01-discovery.md', '# Discovery\n\n## Verdict\n**VALIDATED**: four managers rebuild the view by hand, see [the notes](evidence/P1.md).\n\n| Who | Hours |\n|---|---|\n| P1 | 3 |\n');
  p.write('.builderos/initiatives/csv-export/cycle-1/03-solution-bet.md', '# Earlier bet\n\n- export to Sheets\n');
  p.run('page');
  const html = p.read('.builderos/index.html');
  assert.match(html, /<nav><a href="#decisions">Open decisions <b>2<\/b><\/a>/, 'the overview counts, linked to their sections');
  assert.match(html, /<article id="i-csv-export">[\s\S]*<details class="more"><summary>Everything on this initiative<\/summary>/, 'the detail sits one click under the card');
  assert.match(html, /<details class="doc" id="i-csv-export-p1"><summary>1 Discover <span class="pill passed">passed<\/span> · gate passed 2026-09-02, accepted by Dana/);
  assert.match(html, /<h5>Verdict<\/h5>\n<p><strong>VALIDATED<\/strong>: four managers rebuild the view by hand, see <a href="initiatives\/csv-export\/evidence\/P1\.md">the notes<\/a>\.<\/p>/, 'the document in full, its links resolved from the page');
  assert.match(html, /<th>Who<\/th><th>Hours<\/th><\/tr><\/thead><tbody><tr><td>P1<\/td><td>3<\/td>/);
  assert.match(html, /<details class="doc" id="i-csv-export-grilling"><summary>Question log \(grilling\.md\)/, 'the open question in the table lands on its log');
  assert.match(html, /Earlier cycle: cycle-1[\s\S]*export to Sheets/);
  assert.match(html, /<summary>History <span class="sub">\d+ events?, newest first<\/span>/);
  assert.match(html, /<details class="doc" id="adr-ADR-001-postgres"><summary>ADR-001-postgres \(2026-09-01\)[\s\S]*<h5>Revisit when<\/h5>/, 'a decision in full, where its revisit row points');
  assert.match(html, /<details class="doc"><summary>PRODUCT\.md <span class="sub"><a href="\.\.\/PRODUCT\.md">open file<\/a>/, 'project memory in full too');
  assert.match(html, /function reveal\(\)/, 'a link into a closed section opens it');
});

