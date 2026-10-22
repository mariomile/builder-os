// Gates 4.16 (how a model-driven product behaves: autonomy, hand-off, injection, degradation, latency)
// and 4.17 (the first day on the product track: designed, with activation as a criterion and an event).
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
  const dir = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), 'bos-agent-')));
  fs.cpSync(FIXTURE, dir, { recursive: true });
  return dir;
}
const gate = (root, n, slug = 'csv-export') => {
  const r = spawnSync(process.execPath, [SCRIPT, 'gate', String(n), '--json', '--initiative', slug, '--root', root], { encoding: 'utf8' });
  const j = JSON.parse(r.stdout);
  return { ...j, by: Object.fromEntries(j.results.map((x) => [x.id, x.status])), detail: Object.fromEntries(j.results.map((x) => [x.id, x.detail])) };
};
const write = (root, file, body, slug = 'csv-export') => {
  const p = path.join(root, '.builderos/initiatives', slug, file);
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, body);
};

const ACS = '## Acceptance criteria\n| # | Criterion | Flow |\n|---|---|---|\n| 1 | The assistant drafts a reply to the ticket within 4 seconds | reply |\n| 2 | Before a refund is sent, the agent shows the amount and waits for the operator to confirm | refund |\n| 3 | A new workspace sees its first drafted reply within 10 minutes of signing up | first day |\n';
const EVALS = (mustPass) => `# Eval\n| # | Input | Expected | Judge | Must pass |\n|---|---|---|---|---|\n${Array.from({ length: 12 }, (_, i) => `| c${i + 1} | ticket ${i + 1} | reply ${i + 1} | rubric | ${mustPass.includes(`c${i + 1}`) ? 'yes' : 'no'} |`).join('\n')}\n`;
const AGENT = ({ refund = 'asks | money leaves the account | 2', handoff = 'after two failed drafts, to the operator on shift, with the thread and the drafts', latency = '4 s per turn at p95', surfaces = '| Ticket body | instructions to refund or reveal other tickets | ticket text is data in a delimited block, tools are scoped to this ticket | c3 |' } = {}) =>
  `## Agent behavior\n| Action | Autonomy | Why | Criterion |\n|---|---|---|---|\n| Draft a reply | does | reversible, the operator sends it | 1 |\n| Issue a refund | ${refund} |\n| Delete a ticket | never | not reversible | — |\n\n**Hand-off:** ${handoff}\n**Degradation:** model down or over budget: the ticket opens without a draft and a banner says drafting is paused\n**Latency budget:** ${latency}\n\n### Injection surfaces\n| Surface | What could arrive | Mitigation | Eval case |\n|---|---|---|---|\n${surfaces}\n`;
const SPEC = (agent, extra = '') => `# Spec\n\n${ACS}\n**Model output:** yes\n\n## Eval set\n**Dataset:** .builderos/initiatives/csv-export/evals/cases.md\n**Threshold:** 90%\n**Judge:** rubric\n\n${agent}\n${extra}`;

test('gate 4.16 is skipped without model output and wants the agent behavior section with it', () => {
  const root = project();
  write(root, '04-spec.md', `# Spec\n\n${ACS}\n**Model output:** no\n`);
  assert.equal(gate(root, 4).by['4.16'], 'skip');
  write(root, 'evals/cases.md', EVALS(['c3', 'c7']));
  write(root, '04-spec.md', SPEC(''));
  assert.match(gate(root, 4).detail['4.16'], /no "## Agent behavior"/);
  write(root, '04-spec.md', SPEC(AGENT()));
  assert.equal(gate(root, 4).by['4.16'], 'pass');
});

test('gate 4.16: every action has a level, every "asks" is a tested criterion, every surface a must-pass case', () => {
  const root = project();
  write(root, 'evals/cases.md', EVALS(['c3', 'c7']));
  write(root, '04-spec.md', SPEC(AGENT({ refund: 'sometimes | money | 2' })));
  assert.match(gate(root, 4).detail['4.16'], /Issue a refund: autonomy "sometimes" is not does, proposes, asks, never/);
  write(root, '04-spec.md', SPEC(AGENT({ refund: 'asks | money leaves the account | —' })));
  assert.match(gate(root, 4).detail['4.16'], /Issue a refund: an action that asks the person needs an acceptance criterion/);
  write(root, '04-spec.md', SPEC(AGENT({ refund: 'asks | money leaves the account | 9' })));
  assert.match(gate(root, 4).detail['4.16'], /acceptance criterion that tests the asking/, 'a criterion that does not exist');
  write(root, '04-spec.md', SPEC(AGENT({ surfaces: '| Ticket body | instructions | delimited block | c4 |' })));
  assert.match(gate(root, 4).detail['4.16'], /Ticket body: eval case c4 is not a must-pass case/);
  write(root, '04-spec.md', SPEC(AGENT({ surfaces: '| Attachment text | hidden instructions | | c7 |' })));
  assert.match(gate(root, 4).detail['4.16'], /Attachment text: no mitigation/);
  write(root, '04-spec.md', SPEC(AGENT({ handoff: '', latency: 'fast' })));
  const g = gate(root, 4);
  assert.match(g.detail['4.16'], /no "\*\*Hand-off:\*\*"/);
  assert.match(g.detail['4.16'], /no "\*\*Latency budget:\*\*" with a number/);
  write(root, '04-spec.md', SPEC(AGENT().replace(/### Injection surfaces[\s\S]*/, '')));
  assert.match(gate(root, 4).detail['4.16'], /no "### Injection surfaces"/);
});

const PRODUCT = 'onboarding-v2';
const DESIGN = (firstDay) => `# Design\n\n## Flows\n### Reply\n**Entry points:** ticket list\n${firstDay ? '\n### First day\n**Entry points:** the sign-up confirmation email\n| Step | User action | System response | Branches |\n|---|---|---|---|\n| 1 | connects the helpdesk | imports the last 50 tickets | no tickets: sample ticket |\n| 2 | opens a ticket | shows a drafted reply | — |\n' : ''}\n## Accessibility floor\nKeyboard, contrast 4.5:1, focus on the draft.\n`;
const TRACKING = '## Tracking plan\n| Event | Trigger | Properties | Measures | New or existing |\n|---|---|---|---|---|\n| first_draft_seen | a draft renders in the first session | minutes_since_signup | activation | new |\n';

test('gate 4.17 asks the product track for the first day, with activation as a criterion and an event', () => {
  const root = project();
  write(root, '04-spec.md', `# Spec\n\n${ACS}`);
  assert.equal(gate(root, 4).by['4.17'], 'skip', 'feature track: the first day already exists');
  write(root, 'DESIGN.md', DESIGN(false), PRODUCT);
  write(root, '04-spec.md', `# Spec\n\n${ACS}\n${TRACKING}`, PRODUCT);
  let g = gate(root, 4, PRODUCT);
  assert.match(g.detail['4.17'], /no "### First day" flow/);
  assert.match(g.detail['4.17'], /no "\*\*Activation:\*\*"/);
  write(root, 'DESIGN.md', DESIGN(true), PRODUCT);
  write(root, '04-spec.md', `# Spec\n\n${ACS}\n**Activation:** criterion 7, measured by first_draft_seen\n${TRACKING}`, PRODUCT);
  assert.match(gate(root, 4, PRODUCT).detail['4.17'], /cites no acceptance criterion that exists/);
  write(root, '04-spec.md', `# Spec\n\n${ACS}\n**Activation:** criterion 3, measured by draft_opened\n${TRACKING}`, PRODUCT);
  assert.match(gate(root, 4, PRODUCT).detail['4.17'], /names no event from the tracking plan/);
  write(root, '04-spec.md', `# Spec\n\n${ACS}\n**Activation:** criterion 3, measured by first_draft_seen within 10 minutes of sign-up\n${TRACKING}`, PRODUCT);
  g = gate(root, 4, PRODUCT);
  assert.equal(g.by['4.17'], 'pass');
});
