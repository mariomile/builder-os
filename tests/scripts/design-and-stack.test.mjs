// Tests for wide ideation chosen by a person (gates 3.5, 3.6), the stack decided with the user (4.8),
// the visual direction chosen from rendered versions (4.9), the domain modeled with a person (4.10), and the briefing line on an undecided stack.
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
const INIT = (root) => path.join(root, '.builderos/initiatives/csv-export');
const write = (root, file, body) => {
  fs.mkdirSync(path.dirname(path.join(INIT(root), file)), { recursive: true });
  fs.writeFileSync(path.join(INIT(root), file), body);
};
const statePath = (root) => path.join(INIT(root), 'state.json');
const state = (root) => JSON.parse(fs.readFileSync(statePath(root), 'utf8'));
const setState = (root, patch) => fs.writeFileSync(statePath(root), JSON.stringify({ ...state(root), ...patch }, null, 2));

const BET = (ideas, chosenBy) => `# Solution Bet\n\n## Divergence\n| # | Raw idea | Prompt | From |\n|---|---|---|---|\n${Array.from({ length: ideas }, (_, i) => `| ${i + 1} | idea ${i + 1} | who acts | agent |`).join('\n')}\n\n## Options\n| # | Option | Primary user action | Impact | Confidence | Effort | Reversibility |\n|---|---|---|---|---|---|---|\n| 1 | CSV | the user downloads | h | \`[interview:P1]\` | s | high |\n| 2 | Email | the user subscribes | m | \`[interview:P4]\` | m | high |\n\n## Selected: 1\n${chosenBy === null ? '' : `**Chosen by:** ${chosenBy}\n`}**Why:** reversible\n\n## Kill criteria\nOn 2026-12-01, if weekly exports are below 15% of managers, we stop.\n**Measured by:** export_completed\n\n## Cheapest test\n**Test cost:** 1 days · **Build cost:** 10 days · **Ratio:** 10%\n**Order:** test first\n`;

test('gate 3.5 counts raw ideas before convergence, five in lite mode and eight in full', () => {
  const root = project();
  write(root, '03-solution-bet.md', BET(4, 'Mario, "1A"'));
  assert.equal(gate(root, 3).by['3.5'], 'fail', 'four raw ideas');
  write(root, '03-solution-bet.md', BET(5, 'Mario, "1A"'));
  assert.equal(gate(root, 3).by['3.5'], 'pass', 'lite needs five');
  setState(root, { mode: 'full' });
  assert.equal(gate(root, 3).by['3.5'], 'fail', 'full needs eight');
  write(root, '03-solution-bet.md', BET(8, 'Mario, "1A"'));
  assert.equal(gate(root, 3).by['3.5'], 'pass');
});

test('gate 3.6 needs a person to have chosen the bet', () => {
  const root = project();
  write(root, '03-solution-bet.md', BET(5, null));
  assert.equal(gate(root, 3).by['3.6'], 'fail', 'nobody named');
  write(root, '03-solution-bet.md', BET(5, '{person}'));
  assert.equal(gate(root, 3).by['3.6'], 'fail', 'a placeholder is not a person');
  write(root, '03-solution-bet.md', BET(5, 'agent, highest score'));
  assert.equal(gate(root, 3).by['3.6'], 'fail', 'the agent does not choose');
  write(root, '03-solution-bet.md', BET(5, 'Mario, "vai con le raccomandate" 2026-10-20'));
  assert.equal(gate(root, 3).by['3.6'], 'pass');
});

const SPEC = (stack, summary = true) => `# Spec\n\n## Out of scope\n| Item | Kind | Reason |\n|---|---|---|\n| XLSX | not now | CSV first |\n\n## Conflicts\nNone found.\n\n## Stack\n**Drivers:** one maintainer\n| Layer | Choice | Status | Decided by | ADR |\n|---|---|---|---|---|\n${stack}\n${summary ? '\n## What we chose\n| Choice | What | Why | Set aside | Cost | We\'d change it if |\n|---|---|---|---|---|---|\n| queue | database job table | one maintainer | managed queue | none | jobs pass 1000 a day |\n' : ''}\n## Acceptance criteria\n| # | Criterion | Flow |\n|---|---|---|\n| 1 | A manager downloads the weekly view as CSV | export |\n\n## States\n| Flow / step | Empty | Loading | Partial | Error | Success | Permission |\n|---|---|---|---|---|---|---|\n| export | no deals message | spinner | partial note | retry | file saved | hidden |\n\n**Model output:** no\n\n## Tracking plan\n| Event | Trigger | Properties | Measures | New or existing |\n|---|---|---|---|---|\n| export_completed | download | rows | exports | new |\n\n**Computes the phase 2 metric:** managers with one export_completed per week\n`;
const A11Y = '# Design\n\n## Accessibility floor\nKeyboard path through the export button, contrast 4.5:1, focus returns to the button.\n';
const VISUAL = (versions, { by = 'Mario', kit = 'inherited: Acme UI', tokens = true } = {}) => `${A11Y}\n## Visual direction\n| Version | Axis and direction | File | Verdict |\n|---|---|---|---|\n${versions.map((f, i) => `| ${'ABC'[i]} | density | ${f} | ${i ? 'rejected: too sparse' : 'chosen'} |`).join('\n')}\n\n**Chosen:** A\n**Chosen by:** ${by}\n**Why:** calm for all-day operators\n**Design kit:** ${kit}\n${tokens ? '**Tokens:**\n| Token group | Values |\n|---|---|\n| Colour roles | primary #1f4fd1 (6.1:1) |\n' : ''}`;

test('gate 4.8 needs every layer with a status, a person on every decided one, existing ADRs and the summary', () => {
  const root = project();
  write(root, 'DESIGN.md', VISUAL([]).replace(/## Visual direction[\s\S]*/, '## Visual direction\n**Visual direction:** not applicable, no new screen.\n'));
  write(root, '04-spec.md', SPEC('| backend | Node | inherited | — | — |\n| queue | job table | decided | — | — |'));
  assert.equal(gate(root, 4).by['4.8'], 'fail', 'decided with nobody named');
  write(root, '04-spec.md', SPEC('| backend | Node | inherited | — | — |\n| queue | job table | open | Mario | — |'));
  assert.equal(gate(root, 4).by['4.8'], 'fail', 'open is not a status the spec can carry');
  write(root, '04-spec.md', SPEC('| backend | Node | inherited | — | — |\n| queue | job table | decided | Mario | decisions/ADR-007-queue.md |'));
  assert.match(gate(root, 4).detail['4.8'], /ADR-007-queue\.md not found/);
  fs.mkdirSync(path.join(root, '.builderos/decisions'), { recursive: true });
  fs.writeFileSync(path.join(root, '.builderos/decisions/ADR-007-queue.md'), '# ADR-007: Queue\n');
  assert.equal(gate(root, 4).by['4.8'], 'pass');
  write(root, '04-spec.md', SPEC('| backend | Node | inherited | — | — |\n| queue | job table | decided | Mario | decisions/ADR-007-queue.md |', false));
  assert.match(gate(root, 4).detail['4.8'], /What we chose/);
  write(root, '04-spec.md', SPEC('', true).replace(/## Stack[\s\S]*?## What we chose/, '## What we chose'));
  assert.match(gate(root, 4).detail['4.8'], /no "## Stack" section/);
});

test('gate 4.9 needs rendered versions, a person who chose, the kit and the tokens, or a reasoned not applicable', () => {
  const root = project();
  write(root, '04-spec.md', SPEC('| backend | Node | inherited | — | — |'));
  write(root, 'DESIGN.md', A11Y);
  assert.equal(gate(root, 4).by['4.9'], 'fail', 'no section');
  write(root, 'DESIGN.md', VISUAL(['design/a-v1.html', 'design/b-v1.html']));
  assert.match(gate(root, 4).detail['4.9'], /version files not found/);
  write(root, 'design/a-v1.html', '<!doctype html><title>A</title>');
  write(root, 'design/b-v1.html', '<!doctype html><title>B</title>');
  assert.equal(gate(root, 4).by['4.9'], 'pass', 'feature track in lite mode needs two');
  write(root, 'DESIGN.md', VISUAL(['/reports?variant=a on prototype/csv-export', '/reports?variant=b on prototype/csv-export']));
  assert.equal(gate(root, 4).by['4.9'], 'pass', 'versions mounted in the running app are routes, not files');
  write(root, 'DESIGN.md', VISUAL(['design/a-v1.html', 'design/b-v1.html']));
  setState(root, { mode: 'full', track: 'product' });
  assert.match(gate(root, 4).detail['4.9'], /2 versions shown \(3 needed\)/, 'a new product needs three directions');
  setState(root, { mode: 'lite', track: 'feature' });
  write(root, 'DESIGN.md', VISUAL(['design/a-v1.html', 'design/b-v1.html'], { by: 'agent' }));
  assert.equal(gate(root, 4).by['4.9'], 'fail', 'the agent does not choose the look');
  write(root, 'DESIGN.md', VISUAL(['design/a-v1.html', 'design/b-v1.html'], { tokens: false }));
  assert.match(gate(root, 4).detail['4.9'], /no tokens/);
  write(root, 'DESIGN.md', A11Y + '\n## Visual direction\n**Visual direction:** not applicable\n');
  assert.equal(gate(root, 4).by['4.9'], 'fail', 'not applicable needs its reason');
  write(root, 'DESIGN.md', A11Y + '\n## Visual direction\n**Visual direction:** not applicable, the change is an API endpoint with no screen.\n');
  assert.equal(gate(root, 4).by['4.9'], 'pass');
});

const DOMAIN = ({ who = 'reviewer', by = 'Mario', proto = 'design/domain-prototype.html', invariants = true } = {}) => `${A11Y}\n## Domain model\n### Entities\n| Entity | Means | Lifecycle |\n|---|---|---|\n| Export | a CSV a manager asked for | yes |\n| Deal | an open opportunity | no |\n\n### Transitions: Export\n| From | To | Who | Only if | Then |\n|---|---|---|---|---|\n| requested | ready | ${who} | the file is built | the manager is notified |\n\n${invariants ? '### Invariants\n- An export never changes after it is ready.\n\n' : ''}### Data\n| Entity | Key fields | Relations | Deleted with |\n|---|---|---|---|\n| Export | owner, state | many deals | its owner |\n\n**Rules decided by:** ${by}\n**Prototype:** ${proto}\n`;

test('gate 4.10 needs entities, transitions with who, invariants, data and a person who decided the rules', () => {
  const root = project();
  write(root, '04-spec.md', SPEC('| backend | Node | inherited | — | — |'));
  write(root, 'DESIGN.md', A11Y);
  assert.match(gate(root, 4).detail['4.10'], /no "## Domain model"/);
  write(root, 'DESIGN.md', DOMAIN());
  assert.match(gate(root, 4).detail['4.10'], /prototype design\/domain-prototype\.html not found/);
  write(root, 'design/domain-prototype.html', '<!doctype html><title>rules</title>');
  assert.equal(gate(root, 4).by['4.10'], 'pass');
  write(root, 'DESIGN.md', DOMAIN({ who: '' }));
  assert.match(gate(root, 4).detail['4.10'], /nobody allowed/);
  write(root, 'DESIGN.md', DOMAIN({ by: 'agent' }));
  assert.equal(gate(root, 4).by['4.10'], 'fail', 'the agent does not decide business rules');
  write(root, 'DESIGN.md', DOMAIN({ invariants: false }));
  assert.match(gate(root, 4).detail['4.10'], /no invariants/);
  write(root, 'DESIGN.md', DOMAIN().replace(/### Transitions[\s\S]*?### Invariants/, '### Invariants'));
  assert.match(gate(root, 4).detail['4.10'], /Export has a lifecycle and no transitions table/);
  write(root, 'DESIGN.md', A11Y + '\n## Domain model\n**Domain model:** not applicable, a copy change on the export button.\n');
  assert.equal(gate(root, 4).by['4.10'], 'pass');
});

test('brief flags an initiative past phase 4 while TECH.md still has an undecided stack layer', () => {
  const root = project();
  const tech = path.join(root, 'TECH.md');
  fs.appendFileSync(tech, '| queue | open | — | decide in phase 4 |\n');
  assert.doesNotMatch(run(root, 'brief').out, /TECH\.md stack/, 'phase 2 is not past phase 4');
  setState(root, { current_phase: 5 });
  assert.match(run(root, 'brief').out, /CSV export past phase 4 while TECH\.md stack has open layers \(queue\)/);
  fs.writeFileSync(tech, fs.readFileSync(tech, 'utf8').replace('| queue | open | — | decide in phase 4 |', '| queue | job table | one maintainer | ADR-007 |'));
  assert.doesNotMatch(run(root, 'brief').out, /TECH\.md stack/);
});
