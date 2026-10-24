// Deciding what to build: the value of the bet in money with its load-bearing assumption (3.9 to 3.11),
// the test that runs only when it can change the decision (3.4, 3.12), go-to-market before the build (3.13, 4.22)
// and after the release (6.14, 7.8), and the stake declared (3.14, 3.15).
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
  const dir = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), 'bos-value-')));
  fs.cpSync(FIXTURE, dir, { recursive: true });
  return dir;
}
const run = (root, ...args) => {
  const r = spawnSync(process.execPath, [SCRIPT, ...args, '--root', root], { encoding: 'utf8' });
  return { code: r.status, out: r.stdout, err: r.stderr };
};
const gate = (root, n, ...extra) => {
  const j = JSON.parse(run(root, 'gate', String(n), '--json', ...extra).out);
  return { ...j, by: Object.fromEntries(j.results.map((x) => [x.id, x.status])), detail: Object.fromEntries(j.results.map((x) => [x.id, x.detail])) };
};
const PRODUCT_SLUG = 'onboarding-v2';
const INIT = (root, slug = 'csv-export') => path.join(root, '.builderos/initiatives', slug);
const write = (root, file, body, slug) => fs.writeFileSync(path.join(INIT(root, slug), file), body);
const evidence = (root, id, cls = 'data') => {
  fs.mkdirSync(path.join(root, '.builderos/evidence'), { recursive: true });
  fs.writeFileSync(path.join(root, '.builderos/evidence', `${id.replace(/[:/]/g, '-')}.md`), `# ${id}\n\n**Class:** ${cls}\n**Captured:** 2026-10-20 · **By:** Mario · **Where:** export\n\n| month | value |\n|---|---|\n| 2026-09 | 2,000,000 |\n`);
};

const ASSUMPTIONS = (rows) => `| Assumption | Population | Kind | Source | P14 | P50 | P86 | Load-bearing |\n|---|---|---|---|---|---|---|---|\n${rows.map((r) => `| ${r.join(' | ')} |`).join('\n')}`;
const ROWS = [
  ['Active accounts', 'all accounts', 'data', '`[data:mau]`', '400K', '400K', '400K', 'no'],
  ['Share with an overdue invoice', 'active accounts', 'analogy', '`[doc:invoicing-benchmark]`', '15%', '30%', '45%', 'no'],
  ['Months paid', 'paying accounts', 'estimate', '`[estimate:months-paid]`', '10', '16', '20', 'no'],
  ['Adoption', 'accounts with an overdue invoice', 'estimate', '`[assumption:unvalidated]`', '3%', '8%', '15%', 'yes'],
  ['Price per month', 'paying accounts', 'data', '`[data:mau]`', '€4', '€4', '€4', 'no'],
];
const SENSITIVITY = `| Assumption | Kind | Result at P14 | Result at P86 |\n|---|---|---|---|\n| Adoption | estimate | €0.3M | €2.2M |\n| Months paid | estimate | €0.6M | €1.9M |\n| Share with an overdue invoice | analogy | €0.6M | €1.7M |`;
const FIVE = `1. Where does each number come from? Two from the database, one analogy, two estimates.\n2. New revenue or moved from another line? New: a paid add-on nobody pays for today.\n3. The denominator? Accounts with an overdue invoice, not all accounts.\n4. Five times smaller, would we decide differently? Yes: at 1.6% adoption the client portal wins.\n5. What did we kill, and with which number? Bank sync at about €0.3M.`;

const VALUE = ({ result = 'P14 about €0.3M · P50 about €0.8M · P86 about €1.9M', loadBearing = 'Adoption, an estimate', rows = ROWS, five = FIVE, quick = 4 } = {}) => `
## Value

### Quick estimates
| Option | Formula | Assumption it rests on | Two-year value (P50) |
|---|---|---|---|
${['Overdue reminders', 'Client portal', 'Bank sync', 'Expense scanner'].slice(0, quick).map((o, i) => `| ${o} | accounts × overdue share × adoption × €4 × months | adoption | about €${[1, 0.4, 0.3, 0.2][i]}M |`).join('\n')}

### Assumptions
${ASSUMPTIONS(rows)}

**Two-year value:** ${result}
**Costs:** about €300K build and upkeep, over 10% of revenue, modeled

### Sensitivity
${SENSITIVITY}

**Load-bearing:** ${loadBearing}

### Five questions
${five}
`;
const TEST = ({ order = 'test first', card = true, assumption = 'Adoption', build = 20 } = {}) => `
## Cheapest test
**Assumption:** ${assumption}
**Shape:** a reminders offer with its price for half the accounts with an overdue invoice
**Test cost:** 3 days · **Build cost:** ${build} days · **Ratio:** 15%
**Order:** ${order}
${order.startsWith('test') ? '**Changes the decision:** the build threshold (+4%) falls between the pessimistic and the optimistic adoption\n' : '**Skip because:** cheap and reversible, behind a flag for a week\n'}${card ? '**Question:** do at least 4% of accounts with an overdue invoice turn reminders on?\n**Event:** reminders turned on, accounts with an overdue invoice, four weeks\n**Stop below:** +2%\n**Build above:** +4%\n**Second idea:** client portal, about €0.4M\n**Sample:** 15,000 per group\n' : ''}`;
const GTM_FEATURE = '\n## Go-to-market\n**Audience:** accounts with an invoice overdue more than 30 days\n**Message:** "Get paid without chasing"\n**Where:** a card on the invoice list, and the monthly summary email\n';
const GTM_PRODUCT = '\n## Go-to-market\n**Trigger:** an ops lead just missed a Monday report for the board\n**Positioning:** the weekly report your board reads, without a BI team\n**Motion:** self-serve, because €12 per seat per month is under €1k a year\n**Channel:** a template gallery where ops leads already look\n**Channel test:** a listing for two weeks; stop below 20 visits, build above 60 signups\n';
const SIZE = (door = 'two-way, behind a flag and removed in a day', appetite = 25) => `\n## Bet size\n**Door:** ${door}\n**Confidence:** 40%, two of five numbers are estimates\n**Appetite:** ${appetite} days\n**If wrong:** 20 days of two people and the slot of the second idea; the flag goes off\n`;
const BET = (parts) => `# Solution Bet\n\n## Options\n| # | Option | Primary user action | Impact | Confidence | Effort | Reversibility |\n|---|---|---|---|---|---|---|\n| 1 | Overdue reminders | the user turns reminders on | 4 | 2 | 3 | 4 |\n| 2 | Client portal | the client pays online | 3 | 2 | 2 | 4 |\n| 3 | Bank sync | the user links the bank | 2 | 1 | 4 | 3 |\n\n## Selected: 1\n**Chosen by:** Mario, "1"\n\n## Kill criteria\nOn 2026-12-01, below 2% of overdue accounts paying for reminders we stop; between +2% and +4% we iterate; above +4% we keep.\n**Measured by:** reminders_enabled\n${parts.join('')}`;

test('gate 3.9 wants every number with a kind, a source and three scenarios, and the value in money without false precision', () => {
  const root = project();
  evidence(root, 'mau'); evidence(root, 'invoicing-benchmark', 'doc');
  write(root, '03-solution-bet.md', BET([TEST(), GTM_FEATURE, SIZE()]));
  let g = gate(root, 3);
  assert.equal(g.by['3.9'], 'fail');
  assert.match(g.detail['3.9'], /no "## Value"/);
  write(root, '03-solution-bet.md', BET([VALUE(), TEST(), GTM_FEATURE, SIZE()]));
  g = gate(root, 3);
  assert.equal(g.by['3.9'], 'pass', g.detail['3.9']);
  assert.match(g.detail['3.9'], /2 data, 1 analogy, 2 estimate, 0 decision/);
  write(root, '03-solution-bet.md', BET([VALUE({ result: 'P14 €312,400 · P50 €1,123,200 · P86 €2,246,400' }), TEST(), GTM_FEATURE, SIZE()]));
  assert.match(gate(root, 3).detail['3.9'], /false precision/);
  write(root, '03-solution-bet.md', BET([VALUE({ rows: [...ROWS.slice(0, 4), ['Price per month', '', 'guess', '', '€4', '€4', '']] }), TEST(), GTM_FEATURE, SIZE()]));
  const d = gate(root, 3).detail['3.9'];
  assert.match(d, /kind is not one of/);
  assert.match(d, /no P14, P50 and P86 for: Price per month/);
  write(root, '03-solution-bet.md', BET([VALUE({ rows: [ROWS[0], ['Share with an overdue invoice', 'active accounts', 'analogy', 'a similar app', '15%', '30%', '45%', 'no'], ROWS[3]] }), TEST(), GTM_FEATURE, SIZE()]));
  assert.match(gate(root, 3).detail['3.9'], /analogy without a data, doc, code or interview tag: Share with an overdue invoice/);
});

test('gate 3.9 accepts a declared judgment where the value resists a number, and then skips the sensitivity', () => {
  const root = project();
  write(root, '03-solution-bet.md', BET(['\n## Value\n**Judgment:** the value is trust with enterprise buyers, which no conversion number captures; we bet on it because three lost deals named it\n', TEST(), GTM_FEATURE, SIZE()]));
  const g = gate(root, 3);
  assert.equal(g.by['3.9'], 'judge');
  assert.equal(g.by['3.10'], 'skip');
  assert.equal(g.by['3.11'], 'skip');
});

test('gate 3.10 finds the load-bearing assumption from the sensitivity, and the test must aim at it', () => {
  const root = project();
  evidence(root, 'mau'); evidence(root, 'invoicing-benchmark', 'doc');
  write(root, '03-solution-bet.md', BET([VALUE(), TEST(), GTM_FEATURE, SIZE()]));
  assert.equal(gate(root, 3).by['3.10'], 'pass');
  write(root, '03-solution-bet.md', BET([VALUE({ loadBearing: 'Months paid' }), TEST(), GTM_FEATURE, SIZE()]));
  assert.match(gate(root, 3).detail['3.10'], /"Adoption" swings the result most/);
  write(root, '03-solution-bet.md', BET([VALUE(), TEST({ assumption: 'Share with an overdue invoice' }), GTM_FEATURE, SIZE()]));
  assert.match(gate(root, 3).detail['3.10'], /"\*\*Assumption:\*\*" should name it/);
});

test('gate 3.11 wants the five questions answered', () => {
  const root = project();
  evidence(root, 'mau'); evidence(root, 'invoicing-benchmark', 'doc');
  write(root, '03-solution-bet.md', BET([VALUE({ five: FIVE.split('\n').slice(0, 3).join('\n') }), TEST(), GTM_FEATURE, SIZE()]));
  assert.equal(gate(root, 3).by['3.11'], 'fail');
  write(root, '03-solution-bet.md', BET([VALUE(), TEST(), GTM_FEATURE, SIZE()]));
  assert.equal(gate(root, 3).by['3.11'], 'pass');
});

test('gate 3.4 runs a test only when it can change the decision, and 3.12 writes the decision before the data', () => {
  const root = project();
  write(root, '03-solution-bet.md', BET([TEST({ order: 'test first' }).replace(/\*\*Changes the decision:\*\*.*\n/, ''), GTM_FEATURE, SIZE()]));
  let g = gate(root, 3);
  assert.equal(g.by['3.4'], 'fail');
  assert.match(g.detail['3.4'], /no "\*\*Changes the decision:\*\*"/);
  write(root, '03-solution-bet.md', BET([TEST(), GTM_FEATURE, SIZE()]));
  g = gate(root, 3);
  assert.equal(g.by['3.4'], 'pass');
  assert.equal(g.by['3.12'], 'pass', g.detail['3.12']);
  write(root, '03-solution-bet.md', BET([TEST({ card: false }), GTM_FEATURE, SIZE()]));
  assert.match(gate(root, 3).detail['3.12'], /Stop below.*Build above.*Second idea/s);
  write(root, '03-solution-bet.md', BET([TEST({ order: 'build first' }), GTM_FEATURE, SIZE()]));
  g = gate(root, 3);
  assert.equal(g.by['3.4'], 'pass', 'skipped as cheap and reversible');
  assert.equal(g.by['3.12'], 'skip');
  write(root, '03-solution-bet.md', BET([TEST({ order: 'build first' }).replace(/\*\*Skip because:\*\*.*\n/, ''), GTM_FEATURE, SIZE()]));
  assert.equal(gate(root, 3).by['3.4'], 'fail');
});

test('gate 3.13 asks a feature how its users will hear of it, and a product how it finds its market; 4.22 wants the channel result', () => {
  const root = project();
  write(root, '03-solution-bet.md', BET([TEST()]));
  assert.match(gate(root, 3).detail['3.13'], /Audience, Message, Where/);
  write(root, '03-solution-bet.md', BET([TEST(), GTM_FEATURE]));
  assert.equal(gate(root, 3).by['3.13'], 'pass');
  write(root, '03-solution-bet.md', BET([TEST(), GTM_FEATURE]), PRODUCT_SLUG);
  assert.match(gate(root, 3, '--initiative', PRODUCT_SLUG).detail['3.13'], /"\*\*Trigger:\*\*", "\*\*Positioning:\*\*", "\*\*Motion:\*\*", "\*\*Channel:\*\*", "\*\*Channel test:\*\*"/);
  write(root, '03-solution-bet.md', BET([TEST(), GTM_PRODUCT]), PRODUCT_SLUG);
  assert.equal(gate(root, 3, '--initiative', PRODUCT_SLUG).by['3.13'], 'pass');
  const spec = (r) => `# Spec\n\n**Willingness to pay:** 4 of 10 teams pre-ordered \`[data:mau]\`\n${r}`;
  write(root, '04-spec.md', spec(''), PRODUCT_SLUG);
  assert.equal(gate(root, 4, '--initiative', PRODUCT_SLUG).by['4.22'], 'fail');
  write(root, '04-spec.md', spec('**Channel result:** the listing brought 70 signups in two weeks, above the build threshold of 60\n'), PRODUCT_SLUG);
  assert.match(gate(root, 4, '--initiative', PRODUCT_SLUG).detail['4.22'], /cites no interview, doc or data tag/);
  evidence(root, 'gallery');
  write(root, '04-spec.md', spec('**Channel result:** the listing brought 70 signups in two weeks, above 60 `[data:gallery]`\n'), PRODUCT_SLUG);
  assert.equal(gate(root, 4, '--initiative', PRODUCT_SLUG).by['4.22'], 'pass');
  write(root, '04-spec.md', spec(''));
  assert.equal(gate(root, 4).by['4.22'], 'skip', 'feature track');
});

test('gate 3.14 declares the stake and keeps the build inside it; 3.15 is judged', () => {
  const root = project();
  write(root, '03-solution-bet.md', BET([TEST(), GTM_FEATURE]));
  assert.match(gate(root, 3).detail['3.14'], /no "## Bet size"/);
  write(root, '03-solution-bet.md', BET([TEST({ build: 40 }), GTM_FEATURE, SIZE()]));
  assert.match(gate(root, 3).detail['3.14'], /build \(40 days\) is over the appetite \(25 days\)/);
  write(root, '03-solution-bet.md', BET([TEST({ order: 'build first' }), GTM_FEATURE, SIZE('one-way, a price promised to customers')]));
  assert.match(gate(root, 3).detail['3.14'], /one-way door skips its test as "cheap and reversible"/);
  write(root, '03-solution-bet.md', BET([TEST(), GTM_FEATURE, SIZE()]));
  const g = gate(root, 3);
  assert.equal(g.by['3.14'], 'pass', g.detail['3.14']);
  assert.equal(g.by['3.15'], 'judge');
  assert.match(g.detail['3.15'], /two-way door/);
});

test('gate 6.14 wants a launch plan on features and products, and 7.8 reads each channel', () => {
  const root = project();
  write(root, '06-release.md', '# Release\n');
  assert.match(gate(root, 6).detail['6.14'], /no "## Launch"/);
  write(root, '06-release.md', '# Release\n\n## Launch\n**Who hears first:** the 40 teams in the beta\n**Message:** the Monday report now exports to CSV\n**Channels:** in-app banner, the weekly email\n**When:** 2026-11-03, the day the flag goes to 100%\n**Measured by:** export_completed by source\n');
  assert.equal(gate(root, 6).by['6.14'], 'pass');
  write(root, '07-outcome.md', '# Outcome\n\n## Go-to-market read\n| Channel | Reached | Converted | Source | Next |\n|---|---|---|---|---|\n| in-app banner | 1,200 | 140 | | keep |\n');
  assert.match(gate(root, 7).detail['7.8'], /neither a tagged result/);
  evidence(root, 'banner');
  write(root, '07-outcome.md', '# Outcome\n\n## Go-to-market read\n| Channel | Reached | Converted | Source | Next |\n|---|---|---|---|---|\n| in-app banner | 1,200 | 140 | `[data:banner]` | keep |\n');
  assert.equal(gate(root, 7).by['7.8'], 'pass');
  write(root, '07-outcome.md', '# Outcome\n\n## Go-to-market read\n| Channel | Reached | Converted | Source | Next |\n|---|---|---|---|---|\n| gallery | 900 | 70 | `[data:banner]` | double down |\n', PRODUCT_SLUG);
  assert.match(gate(root, 7, '--initiative', PRODUCT_SLUG).detail['7.8'], /GTM stage/);
});
