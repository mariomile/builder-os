import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

// Sessions on one decision share a question log: numbers run on, and an answer resting on a replaced one is asked again.
const script = new URL('../../scripts/bos.mjs', import.meta.url).pathname;
const fixture = new URL('../fixtures/acme', import.meta.url).pathname;
function project(t) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'bos-grill-'));
  fs.cpSync(fixture, root, { recursive: true });
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const write = (rel, s) => { fs.mkdirSync(path.dirname(path.join(root, rel)), { recursive: true }); fs.writeFileSync(path.join(root, rel), s); };
  const run = (...a) => spawnSync(process.execPath, [script, ...a, '--root', root], { encoding: 'utf8' }).stdout;
  return { write, run };
}
const LOG = (rows) => `# Question log: Pilot or ship\n\n| Q | Question | Answer | By, date | Rests on | Status |\n|---|---|---|---|---|---|\n${rows.join('\n')}\n`;
const GOOD = [
  '| Q1 | Who uses it weekly? | Four people | Dana, 2026-10-29 | — | decided |',
  '| Q2 | Pilot first? | B, a pilot week | Dana, 2026-10-29 | Q1 | superseded by Q6 |',
  '| Q3 | Who runs the pilot? | A, the lead | Dana, 2026-10-29 | Q2 | decided |',
  '| Q4 | Who reviews the pilot? | B, the PM | Dana, 2026-10-29 | Q3 | decided |',
  '| Q5 | Which reports move first? | — | — | Q1 | open, from Q1 |',
  '| Q6 | Pilot first? | A, ship without one | Dana, 2026-11-03 | Q1 | decided, replaces Q2 |',
];

test('grill gives the next number, the open questions, and every answer resting on a replaced one, transitively', (t) => {
  const p = project(t);
  p.write('.builderos/initiatives/csv-export/grilling.md', LOG(GOOD));
  const out = p.run('grill', 'csv-export');
  assert.match(out, /^Next number: Q7$/m);
  assert.match(out, /^Open: Q5 Which reports move first\?$/m);
  assert.match(out, /^Ask again: Q3 Who runs the pilot\? \(rests on Q2\); Q4 Who reviews the pilot\? \(rests on Q3\)$/m);
  assert.match(out, /^Decided: 2 · Superseded: 1$/m);
  assert.doesNotMatch(out, /Problems:/);
  assert.match(p.run('brief'), /Question log Pilot or ship: next number Q7; 1 open \(Q5\), 2 to ask again because what they rest on was replaced: Q3 \(rests on Q2\), Q4 \(rests on Q3\)\./);
});

test('a broken log is flagged: a number reused or restarted, a missing replacement, a decision without who and when, a dangling Rests on', (t) => {
  const p = project(t);
  p.write('.builderos/grilling/pricing.md', LOG([
    '| Q1 | Who pays? | The agency | Dana, 2026-10-29 | — | decided |',
    '| Q2 | Annual plan? | Yes | — | Q9 | decided |',
    '| Q1 | Who pays? | The client | Dana, 2026-10-30 | — | superseded by Q8 |',
  ]));
  const out = p.run('grill', 'pricing');
  assert.match(out, /Q1 appears twice/);
  assert.match(out, /Q1 is superseded by Q8, which is not in the log/);
  assert.match(out, /Q2 is decided without an answer, who gave it and when/);
  assert.match(out, /Q2 rests on Q9, which is not in the log/);
  assert.match(p.run('brief'), /Attention:.*question log pricing: Q1 appears twice/);
});

test('a log without a Rests on column is flagged, and a project without logs says so', (t) => {
  const p = project(t);
  assert.match(p.run('grill'), /No question log in this project\./);
  p.write('.builderos/grilling/old.md', '# Question log: Old\n\n| Q | Question | Answer | By, date | Status |\n|---|---|---|---|---|\n| Q1 | Who? | Dana | Dana, 2026-10-29 | decided |\n');
  assert.match(p.run('grill', 'old'), /no Rests on column/);
});
