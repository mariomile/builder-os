// The product loop: stage, business model and metric tree in PRODUCT.md, the product review,
// and the gates that read them (2.7, 3.7, 3.8, 4.14, 4.15, 6.10 by stage, 6.12).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { spawnSync } from 'child_process';
import { fileURLToPath } from 'url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(HERE, '../..');
const SCRIPT = path.join(REPO, 'scripts/bos.mjs');
const FIXTURE = path.join(REPO, 'tests/fixtures/acme');

function project() {
  const dir = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), 'bos-business-')));
  fs.cpSync(FIXTURE, dir, { recursive: true });
  return dir;
}
function run(root, ...args) {
  const r = spawnSync(process.execPath, [SCRIPT, ...args, '--root', root], { encoding: 'utf8' });
  return { code: r.status, out: r.stdout, err: r.stderr };
}
function gate(root, n, ...extra) {
  const j = JSON.parse(run(root, 'gate', String(n), '--json', ...extra).out);
  return { ...j, by: Object.fromEntries(j.results.map((x) => [x.id, x.status])), detail: Object.fromEntries(j.results.map((x) => [x.id, x.detail])) };
}
const PRODUCT_SLUG = 'onboarding-v2';
const INIT = (root, slug = 'csv-export') => path.join(root, '.builderos/initiatives', slug);
const write = (root, file, body, slug) => fs.writeFileSync(path.join(INIT(root, slug), file), body);
const evidence = (root, id) => {
  fs.mkdirSync(path.join(root, '.builderos/evidence'), { recursive: true });
  fs.writeFileSync(path.join(root, '.builderos/evidence', `${id.replace(/[:/]/g, '-')}.md`), `# ${id}\n\n**Class:** data\n**Captured:** 2026-10-20 · **By:** Mario · **Where:** analytics export\n\n| week | value |\n|---|---|\n| 2026-W42 | 14 |\n`);
};

const BUSINESS = (revenue = 'teams pay per seat, €12 per month, billed monthly', extra = '') => `
## Business

**Stage exit:** retention flat at week 6 on 3 cohorts, 40% "very disappointed" on 30+ answers, a third of signups not brought by the founder
**North Star:** weekly reports opened by a manager
**Revenue model:** ${revenue}
**Growth engine:** self-serve, invited teammates
${extra}
### Metric tree
| Lever | Metric | Current | Source or question |
|---|---|---|---|
| Acquisition | signups per week | 14 | \`[data:signups]\` |
| Activation | first report within a day | unavailable: is the report_created event emitted on day 0? | |
| Retention | week-4 retained teams | 31% | \`[data:retention]\` |
`;
function setProduct(root, { stage = 'pre-PMF', business = BUSINESS() } = {}) {
  const p = path.join(root, 'PRODUCT.md');
  const text = fs.readFileSync(p, 'utf8').replace(/\*\*Stage:\*\*.*/, `**Stage:** ${stage}`);
  fs.writeFileSync(p, text + (business || ''));
  evidence(root, 'signups');
  evidence(root, 'retention');
}

const DEFINITION = (moves) => fs.readFileSync(path.join(FIXTURE, '.builderos/initiatives/csv-export/02-definition.md'), 'utf8')
  .replace(/(## Success metric[^\n]*\n)/, `$1${moves ? `**Moves:** ${moves}\n` : ''}`);

test('gate 2.7 warns without a metric tree, then wants the lever the initiative moves', () => {
  const root = project();
  write(root, '02-definition.md', DEFINITION(null));
  assert.equal(gate(root, 2).by['2.7'], 'warn');
  setProduct(root);
  assert.equal(gate(root, 2).by['2.7'], 'fail');
  write(root, '02-definition.md', DEFINITION('revenue per account'));
  assert.match(gate(root, 2).detail['2.7'], /not a lever of the metric tree \(Acquisition, Activation, Retention\)/);
  write(root, '02-definition.md', DEFINITION('Retention, through managers who come back on Monday'));
  assert.equal(gate(root, 2).by['2.7'], 'pass');
  assert.match(gate(root, 2).detail['2.5'], /stage pre-PMF.*scale work is rejected/);
});

const BET = (businessCase = '') => `# Bet\n\n## Selected: B\n**Chosen by:** Mario, "B"\n${businessCase}`;
const CASE = (fields) => `\n## Business case\n${fields.map(([k, v]) => `**${k}:** ${v}`).join('\n')}\n`;

test('gate 3.7 asks the product track how users arrive and who pays, and accepts not for sale', () => {
  const root = project();
  write(root, '03-solution-bet.md', BET(), PRODUCT_SLUG);
  write(root, '03-solution-bet.md', BET());
  assert.equal(gate(root, 3).by['3.7'], 'skip', 'feature track');
  assert.match(gate(root, 3, '--initiative', PRODUCT_SLUG).detail['3.7'], /no "\*\*Revenue model:\*\*"/);
  setProduct(root);
  assert.match(gate(root, 3, '--initiative', PRODUCT_SLUG).detail['3.7'], /no "## Business case"/);
  write(root, '03-solution-bet.md', BET(CASE([['First 100 users', 'ops leads from the founder network, then a template gallery'], ['Cost per user', '€0.30 per month']])), PRODUCT_SLUG);
  const g = gate(root, 3, '--initiative', PRODUCT_SLUG);
  assert.equal(g.by['3.7'], 'fail');
  assert.match(g.detail['3.7'], /Price.*Willingness to pay test/);
  write(root, '03-solution-bet.md', BET(CASE([['First 100 users', 'founder network'], ['Cost per user', '€0.30'], ['Price', '€12 per seat per month'], ['Willingness to pay test', 'price asked in the real-user session, pre-order link to 10 teams']])), PRODUCT_SLUG);
  assert.equal(gate(root, 3, '--initiative', PRODUCT_SLUG).by['3.7'], 'pass');
  const internal = project();
  setProduct(internal, { business: BUSINESS('not for sale, the internal tool of our own team') });
  write(internal, '03-solution-bet.md', BET(CASE([['First 100 users', 'the 12 people of the team, then the sister team'], ['Cost per user', '€0.10']])), PRODUCT_SLUG);
  assert.equal(gate(internal, 3, '--initiative', PRODUCT_SLUG).by['3.7'], 'pass');
});

test('gates 3.8 and 4.15 ask about scale work only before PMF', () => {
  const root = project();
  write(root, '03-solution-bet.md', BET());
  write(root, '04-spec.md', '# Spec\n');
  assert.equal(gate(root, 3).by['3.8'], 'skip', 'acme is emerging-PMF');
  assert.equal(gate(root, 4).by['4.15'], 'skip');
  setProduct(root, { stage: 'idea' });
  assert.equal(gate(root, 3).by['3.8'], 'judge');
  assert.equal(gate(root, 4).by['4.15'], 'judge');
});

const SPEC = (wtp, stackRows) => `# Spec\n\n## Real users\nOne ops lead walked the prototype \`[interview:P9]\`.\n${wtp ? `**Willingness to pay:** ${wtp}\n` : ''}\n## Stack\n| Layer | Choice | Status | Decided with | ADR |\n|---|---|---|---|---|\n| backend | Node | inherited | | |\n${stackRows}\n`;

test('gate 4.14 wants a paid signal and a payments layer before a product for sale is built', () => {
  const root = project();
  setProduct(root);
  write(root, '04-spec.md', SPEC(null, ''), PRODUCT_SLUG);
  const g = gate(root, 4, '--initiative', PRODUCT_SLUG);
  assert.equal(g.by['4.14'], 'fail');
  assert.match(g.detail['4.14'], /no "\*\*Willingness to pay:\*\*".*no payments row/);
  write(root, '04-spec.md', SPEC('they liked the price', '| payments | merchant of record | open | | |'), PRODUCT_SLUG);
  const g2 = gate(root, 4, '--initiative', PRODUCT_SLUG);
  assert.match(g2.detail['4.14'], /an opinion about the price is not a test of it.*payments layer is "open"/);
  fs.mkdirSync(path.join(INIT(root, PRODUCT_SLUG), 'evidence'), { recursive: true });
  fs.writeFileSync(path.join(INIT(root, PRODUCT_SLUG), 'evidence/preorders.md'), '# preorders\n\n**Class:** data\n**Captured:** 2026-10-20 · **By:** Mario · **Where:** checkout\n\n3 of 10 teams pre-ordered\n');
  write(root, '04-spec.md', SPEC('3 of 10 teams pre-ordered at €12 a seat `[data:preorders]`', '| payments | merchant of record, handles VAT and invoices | decided | Mario | |'), PRODUCT_SLUG);
  assert.equal(gate(root, 4, '--initiative', PRODUCT_SLUG).by['4.14'], 'pass');
  write(root, '04-spec.md', SPEC(null, ''));
  assert.equal(gate(root, 4).by['4.14'], 'skip', 'feature track');
  const internal = project();
  setProduct(internal, { business: BUSINESS('not for sale, our own team only') });
  write(internal, '04-spec.md', SPEC(null, ''), PRODUCT_SLUG);
  assert.equal(gate(internal, 4, '--initiative', PRODUCT_SLUG).by['4.14'], 'skip');
});

const RELEASE = (extra = '') => `# Release\n\n## Production readiness\n**Errors seen by:** error tracker alert to Mario\n**Backup restored:** 2026-10-01, staging restore\n${extra}`;
const TECH = (root, ops) => {
  const p = path.join(root, 'TECH.md');
  fs.writeFileSync(p, fs.readFileSync(p, 'utf8').replace(/## Operations[\s\S]*?(?=\n## )/, ops));
};

test('gate 6.10 asks more of operations after PMF than before, and AI disclosure when a model speaks', () => {
  const root = project();
  write(root, '06-release.md', RELEASE());
  assert.equal(gate(root, 6).by['6.10'], 'pass', 'the fixture covers emerging-PMF');
  TECH(root, '## Operations\n**Privacy:** policy at /privacy, sub-processors listed, deletion in 30 days\n');
  assert.match(gate(root, 6).detail['6.10'], /"\*\*SLO:\*\*", "\*\*Incident response:\*\*", "\*\*Cost per active user:\*\*" \(stage emerging-PMF\)/);
  setProduct(root, { stage: 'pre-PMF', business: '' });
  assert.equal(gate(root, 6).by['6.10'], 'pass', 'before PMF privacy is enough');
  write(root, '04-spec.md', '# Spec\n\n**Model output:** yes\n');
  assert.match(gate(root, 6).detail['6.10'], /"\*\*AI disclosure:\*\*"/);
  TECH(root, '## Operations\n**Privacy:** none stored\n**AI disclosure:** the assistant panel says it is an AI, on first open and in its header\n');
  assert.match(gate(root, 6).detail['6.10'], /"\*\*Agent traces:\*\*"/, 'a model in production keeps its traces');
  write(root, '06-release.md', RELEASE('**Agent traces:** every turn with its tool calls in the trace store, Mario reads 20 a week\n'));
  assert.equal(gate(root, 6).by['6.10'], 'pass');
  setProduct(root, { stage: 'emerging-PMF', business: '' });
  TECH(root, '## Operations\n**Privacy:** none stored\n**AI disclosure:** in the header\n**SLO:** 99.5%\n**Incident response:** Mario, paged\n**Cost per active user:** €0.40\n');
  assert.match(gate(root, 6).detail['6.10'], /"\*\*Model degradation:\*\*"/, 'after PMF the model is watched for drift');
  TECH(root, '## Operations\n**Privacy:** none stored\n**AI disclosure:** in the header\n**SLO:** 99.5%\n**Incident response:** Mario, paged\n**Cost per active user:** €0.40\n**Model degradation:** the must-pass evals run weekly on sampled production turns, alert below 95%\n');
  assert.equal(gate(root, 6).by['6.10'], 'pass');
  setProduct(root, { stage: 'pre-PMF', business: '' });
  TECH(root, '## Operations\n');
  assert.match(gate(root, 6).detail['6.10'], /no "\*\*Privacy:\*\*"/);
});

test('gate 6.12 waits for a first payment on a product for sale', () => {
  const root = project();
  setProduct(root);
  write(root, '06-release.md', RELEASE(), PRODUCT_SLUG);
  assert.equal(gate(root, 6, '--initiative', PRODUCT_SLUG).by['6.12'], 'fail');
  evidence(root, 'first-invoice');
  write(root, '06-release.md', RELEASE('\n## First payment\nA team outside our network paid €36 for three seats on 2026-10-19 `[data:first-invoice]`.\n'), PRODUCT_SLUG);
  assert.equal(gate(root, 6, '--initiative', PRODUCT_SLUG).by['6.12'], 'pass');
  write(root, '06-release.md', RELEASE());
  assert.equal(gate(root, 6).by['6.12'], 'skip', 'feature track');
});

const REVIEW = ({ levers, proposals, by = 'Mario, "1A 2B"' }) => `# Product review 2026-10-20\n\n**Stage:** pre-PMF, stays\n\n## Levers\n| Lever | Last | Now | Source |\n|---|---|---|---|\n${levers}\n\n## Proposed initiatives\n| Initiative | Lever it moves | Why now |\n|---|---|---|\n${proposals}\n\n## Decision\n**Decided by:** ${by}\n`;
const reviewFile = (root, name, body) => {
  fs.mkdirSync(path.join(root, '.builderos/reviews'), { recursive: true });
  fs.writeFileSync(path.join(root, '.builderos/reviews', name), body);
};

test('the product review reads every lever, proposes one to three initiatives on the tree, and a person decides', () => {
  const root = project();
  assert.equal(run(root, 'review').code, 2, 'no review written yet');
  reviewFile(root, '2026-10-20.md', REVIEW({ levers: '| Acquisition | 12 | 14 | `[data:signups]` |', proposals: '| invite flow | Pricing | — |', by: 'agent' }));
  let r = JSON.parse(run(root, 'review', '--json').out);
  let by = Object.fromEntries(r.results.map((x) => [x.id, x.status]));
  assert.deepEqual([by['R.1'], by['R.2'], by['R.3'], by['R.4'], by['R.5']], ['fail', 'fail', 'fail', 'fail', 'judge']);
  setProduct(root);
  const levers = '| Acquisition | 12 | 14 | `[data:signups]` |\n| Activation | unavailable | unavailable: is report_created emitted on day 0? | |\n| Retention | 29% | 31% | `[data:retention]` |';
  reviewFile(root, '2026-10-20.md', REVIEW({ levers, proposals: '| invite flow | Acquisition | invited teammates convert 3x |\n| day-0 report | Activation | half of signups never see a report |' }));
  const ok = run(root, 'review');
  assert.equal(ok.code, 0, ok.out);
  reviewFile(root, '2026-10-21.md', REVIEW({ levers, proposals: '| a | Acquisition | x |\n| b | Activation | x |\n| c | Retention | x |\n| d | Retention | x |' }));
  r = JSON.parse(run(root, 'review', '--json').out);
  assert.match(r.results.find((x) => x.id === 'R.3').detail, /4 proposed initiatives/);
});

test('the briefing says when the product review is due, weekly before PMF and monthly after', () => {
  const root = project();
  assert.match(run(root, 'brief').out, /no product review yet: run one to set the stage/);
  setProduct(root);
  const day = (n) => new Date(Date.now() - n * 86400000).toISOString().slice(0, 10);
  reviewFile(root, `${day(3)}.md`, '# review\n');
  assert.doesNotMatch(run(root, 'brief').out, /product review/);
  fs.renameSync(path.join(root, '.builderos/reviews', `${day(3)}.md`), path.join(root, '.builderos/reviews', `${day(10)}.md`));
  assert.match(run(root, 'brief').out, new RegExp(`product review is due: last on ${day(10)}, every 7 days at stage pre-PMF`));
  const p = path.join(root, 'PRODUCT.md');
  fs.writeFileSync(p, fs.readFileSync(p, 'utf8').replace('**Stage:** pre-PMF', '**Stage:** scaling'));
  assert.doesNotMatch(run(root, 'brief').out, /product review/, 'monthly at scale');
});
