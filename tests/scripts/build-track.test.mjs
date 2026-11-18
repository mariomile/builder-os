// Tests for the build track (the internal track before 3.8.0): a clear idea, built for the person, their team, a client
// or whoever they name. The pressure test and the need check stand in for phases 0 to 2, phase 3 values the options in time against the best way of not building, and the gates
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

const NEED = (today = 'about 90 minutes per proposal, four a week `[doc:user-2026-11-03-proposals]`', extra = '') => `# Request — Proposal builder

## Request
"I want proposals to build themselves from the three sheets." (Mario)

**Evidence:** \`[doc:user-2026-11-03-proposals]\`
**Population:** Mario

## Need
**Job:** when a client sends their three sheets, I want the proposal drafted from them, so I can send it the same day
**Users:** Mario
**Today:** ${today}
**Hired today:** a Word template and copy-paste by hand \`[doc:user-2026-11-03-proposals]\`
**Done when:** a proposal takes under 15 minutes, by 2026-12-15
${extra}
### Forces
**Push:** 90 minutes each and typos in prices
**Pull:** a proposal out the same day the sheets arrive
**Anxiety:** a wrong price reaching a client
**Habit:** the template Mario knows by heart

### Steps today
1. Mario exports the client's three sheets
2. Mario copies prices and quantities into the template, breaks: 60 of the 90 minutes, and the typos
3. Mario sends the PDF
`;

const GRILL = `# Grilling: proposals

| Q | Question | Answer | By | When | Rests on | Status |
|---|---|---|---|---|---|---|
| 1 | Who uses it | Mario | Mario | 2026-11-03 | | decided |

## Context brief: proposals
**Goal:** proposals build themselves from the three sheets
**Decided:** Q1 Mario is the only user
**Out of scope:** sending the proposal for the client
**Next step:** the feature map, by the agent
`;
const grilled = (root, slug = 'proposals') => write(root, slug, 'grilling.md', GRILL);

const start = (root, slug = 'proposals') => {
  assert.equal(run(root, 'new', slug, '--title', 'Proposal builder', '--track', 'build', '--reason', 'the idea is clear').code, 0);
};

test('a clear idea starts from the pressure test and its need: gate N, then phases 0 to 2 covered and phase 3 next', () => {
  const root = project();
  start(root);
  assert.equal(state(root, 'proposals').mode, 'lite', 'internal defaults to lite');
  assert.match(run(root, 'brief').out, /need check/);
  assert.equal(run(root, 'cover', '--n5', 'Mario is the only user').code, 2, 'no 00-request.md yet');
  evidence(root, 'proposals');
  write(root, 'proposals', '00-request.md', NEED());
  let g = gate(root, 'N');
  assert.equal(g.by['N.7'], 'fail', 'no pressure test yet');
  assert.match(g.detail['N.7'], /grilling\.md/);
  write(root, 'proposals', 'grilling.md', GRILL.split('## Context brief')[0]);
  assert.match(gate(root, 'N').detail['N.7'], /no "## Context brief"/);
  grilled(root);
  g = gate(root, 'N');
  assert.deepEqual(['E.1', 'N.1', 'N.2', 'N.3', 'N.4', 'N.6', 'N.7', 'N.8', 'N.9', 'N.10', 'N.5'].map((id) => g.by[id]), ['pass', 'pass', 'pass', 'pass', 'pass', 'pass', 'pass', 'pass', 'pass', 'pass', 'judge']);
  assert.match(g.detail['N.10'], /not replacing a paid tool/);
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

test('the build ratchet: only to product; a change on a product not for sale that needs a choice becomes build', () => {
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
  assert.equal(state(other, 'export-fix').track, 'build');
  assert.equal(run(other, 'upgrade', '--to', 'build', '--reason', 'x').code, 2, 'build already, and only a change becomes build');
});

test('an estimated today starts the tool with a warning, so nobody is asked to measure before anything exists', () => {
  const root = project();
  start(root);
  evidence(root, 'proposals');
  grilled(root);
  write(root, 'proposals', '00-request.md', NEED('about 90 minutes per proposal, four a week `[estimate:mario-guess]`'));
  const g = gate(root, 'N');
  assert.equal(g.by['N.3'], 'warn');
  assert.match(g.detail['N.3'], /estimate/);
  assert.equal(run(root, 'cover', '--n5', 'the client\'s sales team, named; the job is known, the how is open').code, 0);
  assert.equal(state(root, 'proposals').current_phase, 3);
});

const MAP = (rows) => `
## Feature map
| Feature | Build | Buy or integrate | Chosen | Source |
|---|---|---|---|---|
${rows}
`;

test('phase 3 on the internal track explores each feature as build, buy or integrate instead of eight abstract ideas', () => {
  const root = project();
  start(root);
  write(root, 'proposals', '03-solution-bet.md', BET(VALUE));
  let g = gate(root, 3);
  assert.equal(g.by['3.5'], 'fail');
  assert.match(g.detail['3.5'], /Feature map/);
  write(root, 'proposals', '03-solution-bet.md', BET(VALUE + MAP('| Read the three sheets | a script over the export | the sheets API | maybe | |')));
  g = gate(root, 3);
  assert.equal(g.by['3.5'], 'fail');
  assert.match(g.detail['3.5'], /Chosen/);
  assert.match(g.detail['3.5'], /source tag/);
  write(root, 'proposals', '03-solution-bet.md', BET(VALUE + MAP([
    '| Read the three sheets | a script over the export | the sheets API, free; a sync service, €20 a month `[doc:sheets-api-pricing]` | integrate | `[doc:sheets-api-pricing]` |',
    '| Fill the proposal | a template engine `[estimate:mario-timing]` | none found: searched proposal tools that read sheets | build | `[estimate:mario-timing]` |',
  ].join('\n'))));
  g = gate(root, 3);
  assert.equal(g.by['3.5'], 'pass');
  assert.match(g.detail['3.5'], /2 features mapped: 1 build, 0 buy, 1 integrate/);
});

test('the need goes deep on how the job runs today, and a feature map compares more than the first tool found', () => {
  const root = project();
  start(root);
  evidence(root, 'proposals');
  write(root, 'proposals', '00-request.md', NEED().replace(/### Steps today[\s\S]*$/, '### Steps today\n1. Mario exports the sheets\n2. Mario sends the PDF\n'));
  let g = gate(root, 'N');
  assert.equal(g.by['N.6'], 'fail');
  assert.match(g.detail['N.6'], /3 needed/);
  write(root, 'proposals', '00-request.md', NEED().replace(', breaks: 60 of the 90 minutes, and the typos', ''));
  g = gate(root, 'N');
  assert.equal(g.by['N.6'], 'fail');
  assert.match(g.detail['N.6'], /breaks/);
  write(root, 'proposals', '03-solution-bet.md', BET(VALUE + MAP('| Read the three sheets | a script over the export | the sheets API `[doc:sheets-api-pricing]` | integrate | `[doc:sheets-api-pricing]` |')));
  g = gate(root, 3);
  assert.equal(g.by['3.5'], 'fail');
  assert.match(g.detail['3.5'], /one candidate/);
});

test('a project from before 3.8.0 keeps working: the internal track reads as build, and --track internal makes build', () => {
  const root = project();
  assert.equal(run(root, 'new', 'old', '--title', 'Old tool', '--track', 'internal', '--reason', 'legacy name').code, 0);
  assert.equal(state(root, 'old').track, 'build');
  const p = path.join(INIT(root, 'old'), 'state.json');
  fs.writeFileSync(p, fs.readFileSync(p, 'utf8').replace('"track": "build"', '"track": "internal"'));
  assert.match(run(root, 'brief').out, /need check/);
  assert.doesNotMatch(run(root, 'brief').out, /does not follow the schema/);
  evidence(root, 'old');
  write(root, 'old', '00-request.md', NEED());
  assert.equal(gate(root, 'N').by['N.5'], 'judge', 'the need check runs on the legacy track');
});

test('the market questions run on the build track only when the product is for sale', () => {
  const root = project();
  start(root);
  write(root, 'proposals', '03-solution-bet.md', BET(VALUE));
  assert.equal(gate(root, 3).by['3.13'], 'skip');
  fs.appendFileSync(path.join(root, 'PRODUCT.md'), '\n## Business\n**Revenue model:** subscription, €19 a month per agency `[assumption:unvalidated]`\n');
  const g = gate(root, 3);
  assert.equal(g.by['3.13'], 'fail');
  assert.match(g.detail['3.13'], /Go-to-market/);
});

test('the spec says how the code will last, and the build is reviewed against it (4.23, 5.19)', () => {
  const root = project();
  start(root);
  const spec = (body) => write(root, 'proposals', 'SPEC.md', `# Spec\n\n## The bet\nTemplate filled by a script\n${body}`);
  spec('');
  let g = gate(root, 4);
  assert.equal(g.by['4.23'], 'fail');
  assert.match(g.detail['4.23'], /Maintainability/);
  spec('\n## Maintainability\n**Structure:** a script\n**Simple to change:** the template\n');
  g = gate(root, 4);
  assert.match(g.detail['4.23'], /no path in backticks/);
  assert.match(g.detail['4.23'], /Dependencies/);
  spec('\n## Maintainability\n**Structure:** `scripts/proposal.mjs` reads the sheets, `templates/proposal.md` holds the text\n**Simple to change:** the price rules live in `scripts/prices.mjs` only\n**Dependencies:** none new\n');
  assert.equal(gate(root, 4).by['4.23'], 'pass');
});

test('the startup path is the product track by the name people use for it', () => {
  const root = project();
  assert.equal(run(root, 'new', 'venture', '--title', 'New venture', '--track', 'startup', '--reason', 'founding from zero').code, 0);
  const s = state(root, 'venture');
  assert.deepEqual([s.track, s.mode], ['product', 'full']);
});

const REPLACING = `
### Replacing
**Tool:** PandaDoc
**Cost:** 1,140 EUR a year, 3 seats \`[doc:user-2026-11-03-proposals]\`
**Renewal:** 2027-02-01
**Data out:** templates and 2 years of signed proposals, as PDF export
**Integrations:** HubSpot deal sync

| Feature | Use | Must keep |
|---|---|---|
| Proposal templates | daily | yes |
| E-signature | weekly | yes |
| Content library | never | no |
| Analytics on opens | rarely | no |
`;

test('the need is a job: the situation, the motivation and the result, what is hired today and the four forces', () => {
  const root = project();
  start(root);
  evidence(root, 'proposals');
  grilled(root);
  write(root, 'proposals', '00-request.md', NEED().replace(/\*\*Job:\*\*.*\n/, '**Job:** proposals from sheets\n').replace(/\*\*Anxiety:\*\*.*\n/, ''));
  const g = gate(root, 'N');
  assert.equal(g.by['N.8'], 'fail');
  assert.match(g.detail['N.8'], /When \{situation\}/);
  assert.equal(g.by['N.9'], 'fail');
  assert.match(g.detail['N.9'], /Anxiety/);
  write(root, 'proposals', '00-request.md', NEED().replace(/\*\*Job:\*\*.*\n/, '**Job:** quando arriva un listino, voglio la proposta pronta, così la mando in giornata\n'));
  assert.equal(gate(root, 'N').by['N.8'], 'pass', 'the person\'s own language is kept');
});

test('replacing a paid tool: the cost, renewal, data and features in use are written, and only those enter the feature map', () => {
  const root = project();
  start(root);
  evidence(root, 'proposals');
  grilled(root);
  const paid = NEED().replace(/\*\*Hired today:\*\*.*\n/, '**Hired today:** PandaDoc, 95 EUR a month for 3 seats `[doc:user-2026-11-03-proposals]`\n');
  write(root, 'proposals', '00-request.md', paid);
  let g = gate(root, 'N');
  assert.equal(g.by['N.10'], 'fail');
  assert.match(g.detail['N.10'], /### Replacing/);
  write(root, 'proposals', '00-request.md', paid.replace('### Forces', REPLACING.replace('| E-signature | weekly |', '| E-signature | often |') + '\n### Forces'));
  g = gate(root, 'N');
  assert.match(g.detail['N.10'], /"Use" is not .* E-signature/);
  write(root, 'proposals', '00-request.md', paid.replace('### Forces', REPLACING + '\n### Forces'));
  g = gate(root, 'N');
  assert.equal(g.by['N.10'], 'pass');
  assert.match(g.detail['N.10'], /3 of 4 features used/);
  assert.equal(run(root, 'cover', '--n5', 'Mario, the job is known, the how is open').code, 0);
  write(root, 'proposals', '03-solution-bet.md', BET(VALUE + MAP('| Proposal templates | a template engine, 3 days | PandaDoc; Docupilot `[doc:user-2026-11-03-proposals]` | build | |\n')));
  g = gate(root, 3);
  assert.equal(g.by['3.17'], 'fail');
  assert.match(g.detail['3.17'], /E-signature, Analytics on opens/);
  assert.match(g.detail['3.17'], /Licence saved/);
  assert.doesNotMatch(g.detail['3.17'], /Content library/, 'a feature nobody uses is not rebuilt');
});
