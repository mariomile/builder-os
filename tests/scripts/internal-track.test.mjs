// Tests for the internal track: a tool whose users are the builder or their own team. The need check stands in
// for phases 0 to 2, phase 3 values the options in time against the best way of not building, and the gates
// that look for a market (business case, go-to-market, launch, first outside use) step aside.
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
  return { ...j, by: Object.fromEntries(j.results.map((x) => [x.id, x.status])), detail: Object.fromEntries(j.results.map((x) => [x.id, x.detail])) };
};
const INIT = (root, slug) => path.join(root, '.builderos/initiatives', slug);
const write = (root, slug, file, body) => {
  const p = path.join(INIT(root, slug), file);
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, body);
};
const state = (root, slug) => JSON.parse(fs.readFileSync(path.join(INIT(root, slug), 'state.json'), 'utf8'));
const evidence = (root, slug) => write(root, slug, 'evidence/user-2026-11-03-proposals.md', '# user-2026-11-03-proposals\n\n**Class:** doc\n**Captured:** 2026-11-03 · **By:** Mario · **Where:** the thread\n\n"Every proposal takes me 90 minutes of copying from three sheets, about four a week."\n');

const NEED = (today = 'about 90 minutes per proposal, four a week `[doc:user-2026-11-03-proposals]`') => `# Request — Proposal builder

## Request
"I want proposals to build themselves from the three sheets." (Mario)

**Evidence:** \`[doc:user-2026-11-03-proposals]\`
**Population:** Mario

## Need
**Job:** turning a client's data in three sheets into a proposal
**Users:** Mario
**Today:** ${today}
**Done when:** a proposal takes under 15 minutes, by 2026-12-15
`;

const start = (root, slug = 'proposals') => {
  assert.equal(run(root, 'new', slug, '--title', 'Proposal builder', '--track', 'internal', '--reason', 'the builder is the user').code, 0);
};

test('an internal tool starts from its need: gate N, then phases 0 to 2 covered and phase 3 next', () => {
  const root = project();
  start(root);
  assert.equal(state(root, 'proposals').mode, 'lite', 'internal defaults to lite');
  assert.match(run(root, 'brief').out, /need check/);
  assert.equal(run(root, 'cover', '--n5', 'Mario is the only user').code, 2, 'no 00-request.md yet');
  evidence(root, 'proposals');
  write(root, 'proposals', '00-request.md', NEED());
  const g = gate(root, 'N');
  assert.deepEqual(['E.1', 'N.1', 'N.2', 'N.3', 'N.4', 'N.5'].map((id) => g.by[id]), ['pass', 'pass', 'pass', 'pass', 'pass', 'judge']);
  assert.equal(run(root, 'cover').code, 2, 'N.5 must be judged first');
  assert.equal(run(root, 'cover', '--n5', 'Mario is the only user; the job is known, the how is open').code, 0);
  const s = state(root, 'proposals');
  assert.equal(s.current_phase, 3);
  assert.deepEqual([0, 1, 2, 3].map((k) => s.phases[k].status), ['covered', 'covered', 'covered', 'in_progress']);
  assert.ok(s.history.filter((h) => h.event === 'phase_covered').every((h) => h.tags.includes('doc:user-2026-11-03-proposals')));
  const brief = run(root, 'brief').out;
  assert.match(brief, /phases 0 to 2 covered by the need/);
  assert.doesNotMatch(brief, /does not follow the schema/);
});

test('a need with no measured today fails the need check and becomes a product', () => {
  const root = project();
  start(root);
  evidence(root, 'proposals');
  write(root, 'proposals', '00-request.md', NEED('slow, by hand'));
  const g = gate(root, 'N');
  assert.equal(g.by['N.3'], 'fail');
  assert.equal(run(root, 'cover', '--n5', 'x').code, 1);
  const s = state(root, 'proposals');
  assert.deepEqual([s.track, s.mode, s.current_phase], ['product', 'full', 0]);
  assert.equal(s.history.at(-1).event, 'track_upgraded');
});

const BET = (value) => `# Solution Bet

## Options
| # | Option | Primary user action | Impact | Confidence | Effort | Reversibility |
|---|---|---|---|---|---|---|
| 1 | Template filled by a script | Mario runs one command | 4 | 3 | 2 | 4 |
| 2 | Sheet formulas into a doc | Mario copies one range | 2 | 3 | 1 | 4 |
| 3 | Agent drafts from the sheets | Mario reviews a draft | 4 | 2 | 3 | 3 |

## Selected: 1
**Chosen by:** Mario, "1"
${value}`;

const VALUE = `
## Value
| Option | Hours saved per week | Days to build | Source |
|---|---|---|---|
| Template filled by a script | 5 | 3 | \`[estimate:mario-timing]\` |
| Sheet formulas into a doc | 2 | 1 | \`[estimate:mario-timing]\` |

**Not building:** a proposal tool on the market costs about €40 a month and cannot read the three sheets, so the copying stays
`;

test('phase 3 on the internal track values options in time and steps around money and go-to-market', () => {
  const root = project();
  start(root);
  fs.mkdirSync(path.join(INIT(root, 'proposals')), { recursive: true });
  write(root, 'proposals', '03-solution-bet.md', BET(''));
  let g = gate(root, 3);
  for (const id of ['3.7', '3.8', '3.10', '3.11', '3.13']) assert.equal(g.by[id], 'skip', id);
  assert.equal(g.by['3.9'], 'fail');
  assert.match(g.detail['3.9'], /Not building/);
  write(root, 'proposals', '03-solution-bet.md', BET(VALUE.replace(/\*\*Not building:\*\*.*\n/, '')));
  g = gate(root, 3);
  assert.equal(g.by['3.9'], 'fail');
  assert.match(g.detail['3.9'], /not building/i);
  write(root, 'proposals', '03-solution-bet.md', BET(VALUE));
  g = gate(root, 3);
  assert.equal(g.by['3.9'], 'pass', g.detail['3.9']);
  assert.equal(g.by['3.15'], 'judge');
  assert.match(g.detail['3.15'], /not building/);
});

test('ship and learn on the internal track skip the launch and its read, and close at ship with no review', () => {
  const root = project();
  start(root);
  write(root, 'proposals', '06-release.md', '# Release\n');
  const six = gate(root, 6);
  for (const id of ['6.2', '6.3', '6.5', '6.11', '6.12', '6.14']) assert.equal(six.by[id], 'skip', id);
  write(root, 'proposals', '06-release.md', '# Release\n\n## Outcome review\n**Owner:** Mario · **Date:** 2026-12-15\n');
  assert.equal(gate(root, 6).by['6.5'], 'pass', 'a release that sets a review measures it');
  assert.match(six.detail['6.4'], /Users/);
  write(root, 'proposals', '07-outcome.md', '# Outcome\n');
  assert.equal(gate(root, 7).by['7.8'], 'skip');
});

test('the internal ratchet: only to product; a change on an internal tool that needs a choice becomes internal', () => {
  const root = project();
  start(root);
  assert.equal(run(root, 'upgrade', '--to', 'feature', '--reason', 'colleagues want it').code, 2);
  assert.equal(run(root, 'upgrade', '--to', 'product', '--reason', 'two clients asked to use it').code, 0);
  assert.equal(state(root, 'proposals').track, 'product');

  const other = project();
  fs.appendFileSync(path.join(other, 'PRODUCT.md'), '\n## Business\n**Revenue model:** not for sale, internal tool for the ops team\n');
  run(other, 'new', 'export-fix', '--track', 'change', '--reason', 'small fix');
  write(other, 'export-fix', 'evidence/user-2026-11-03-proposals.md', '# e\n\n**Class:** doc\n**Captured:** 2026-11-03\n\n"x"\n');
  write(other, 'export-fix', '00-request.md', '# Request — Export\n\n## Request\n"Export it."\n\n**Evidence:** `[doc:user-2026-11-03-proposals]`\n**Population:** Mario\n\n## Mandate\n**Kind:** wish\n**Why no bet:** short\n');
  assert.equal(run(other, 'cover', '--m4', 'x').code, 1);
  assert.equal(state(other, 'export-fix').track, 'internal');
  assert.equal(run(other, 'upgrade', '--to', 'internal', '--reason', 'x').code, 2, 'internal already, and only a change becomes internal');
});
