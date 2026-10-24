// The change track owes six things: scope, criteria with their tests, the impact on what it touches, tests green
// against the baseline, the scope check, and a release with its rollback. The rest of gates 4 and 5 applies when
// 04-spec.md → **Touches:** names what calls for it, and a slice that edits a screen or a schema it did not declare
// fails the scope check. A label rename passes gates 4 and 5 on one page each.
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

const run = (root, ...args) => {
  const sep = args.indexOf('--');
  const cli = sep < 0 ? [...args, '--root', root] : [...args.slice(0, sep), '--root', root, ...args.slice(sep)];
  return spawnSync(process.execPath, [SCRIPT, ...cli], { encoding: 'utf8' });
};
const gate = (root, n) => {
  const j = JSON.parse(run(root, 'gate', String(n), '--json').stdout);
  return { ...j, by: Object.fromEntries(j.results.map((x) => [x.id, x.status])), detail: Object.fromEntries(j.results.map((x) => [x.id, x.detail])) };
};
const DIR = (root) => path.join(root, '.builderos/initiatives/export-label');
const write = (root, file, body) => { const p = path.join(DIR(root), file); fs.mkdirSync(path.dirname(p), { recursive: true }); fs.writeFileSync(p, body); };

function change() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'bos-change-'));
  fs.cpSync(FIXTURE, root, { recursive: true });
  assert.equal(run(root, 'new', 'export-label', '--title', 'Export label', '--track', 'change', '--reason', 'support ticket').status, 0);
  write(root, 'evidence/ticket-1204.md', '# ticket-1204\n\n**Class:** doc\n**Captured:** 2026-10-20 · **By:** Dana · **Where:** support queue\n\n#1204: "I could not find the export, the button says Download data".\n');
  write(root, '00-request.md', '# Request — Export label\n\n## Request\n"Rename the button Download data to Export CSV."\n\n**Evidence:** `[doc:ticket-1204]`\n**Population:** every manager who exports the weekly view\n\n## Mandate\n**Kind:** request\n**Why no bet:** the requester named the exact label\n');
  assert.equal(run(root, 'cover', '--m4', 'the label is named in the request').status, 0);
  return root;
}
const SPEC = (touches = '**Touches:** copy (the export button label)\n') => `# Spec — Export label\n\n${touches}\n## Acceptance criteria\n| # | Criterion | Flow |\n|---|---|---|\n| 1 | The export button reads "Export CSV" | export |\n\n## Out of scope\n| Item | Kind | Reason |\n|---|---|---|\n| The export format | not now | only the label changes |\n\n## Impact on what exists\n| Area | Today | After | Handling |\n|---|---|---|---|\n| current users | button reads Download data | reads Export CSV | release note line |\n`;

test('a label rename passes gate 4 on scope, criteria and the impact on its users', () => {
  const root = change();
  write(root, '04-spec.md', SPEC());
  const g = gate(root, 4);
  assert.deepEqual(g.failed, [], JSON.stringify(g.detail));
  assert.deepEqual([g.by['4.1'], g.by['4.2'], g.by['4.11']], ['judge', 'pass', 'pass']);
  for (const id of ['4.3', '4.5', '4.7', '4.8', '4.10', '4.12', '4.18', '4.19', '4.20', '4.21']) assert.equal(g.by[id], 'skip', id);
  assert.match(g.detail['4.19'], /applies when it touches personal data or permissions or money/);
});

test('without Touches a change runs every condition, and the scope condition asks for it', () => {
  const root = change();
  write(root, '04-spec.md', SPEC(''));
  const g = gate(root, 4);
  assert.equal(g.by['4.2'], 'fail');
  assert.match(g.detail['4.2'], /no "\*\*Touches:\*\*"/);
  assert.notEqual(g.by['4.19'], 'skip');
});

test('what the change touches calls in what it needs: personal data brings the threat model and the quality bar', () => {
  const root = change();
  write(root, '04-spec.md', SPEC('**Touches:** personal data (the export now includes emails)\n'));
  const g = gate(root, 4);
  for (const id of ['4.12', '4.19']) assert.notEqual(g.by[id], 'skip', id);
  assert.equal(g.by['4.10'], 'skip', 'personal data alone is not a data model change');
  assert.match(g.detail['4.11'], /no row for existing data/);
});

test('gate 5 on a rename: tests, baseline, scope check and the person who saw it; a slice editing a schema it did not declare fails', () => {
  const root = change();
  write(root, '04-spec.md', SPEC());
  fs.mkdirSync(path.join(root, 'test'), { recursive: true });
  fs.writeFileSync(path.join(root, 'test/label.test.mjs'), "import test from 'node:test';\ntest('export button reads Export CSV', () => {});\n");
  const rec = (label) => run(root, 'run-check', '--label', label, '--', process.execPath, '--test', 'test/label.test.mjs').stdout.match(/\*\*Run:\*\* (.+)/)[1];
  const base = rec('baseline');
  const final = rec('final');
  const plan = (files) => `# Build — Export label\n\n## Plan\n**In plain words:** change the button text and its test.\n**Accepted:** Dana · 2026-10-21T09:00:00Z\n\n## Slices\n| # | Slice | Files |\n|---|---|---|\n| 1 | rename the label | ${files} |\n\n## Seams\n| Module | Interface | Tests at | In plain words |\n|---|---|---|---|\n| export | the button label | test/label.test.mjs | what the button says |\n\n## Risks\n| Risk | Mitigation |\n|---|---|\n| a test asserts the old text | update it in the same slice |\n\n## Test baseline\n**Run:** ${base}\n\n## Acceptance criteria to tests\n| # | Criterion | Test | Result |\n|---|---|---|---|\n| 1 | the button reads Export CSV | test/label.test.mjs | pass |\n\n## Test output\n**Run:** ${final}\n\n## Scope check\n| Out-of-scope item | Built? |\n|---|---|\n| The export format | no |\n\n## Tried\n**Link:** \`npm run dev\`\n**Tried by:** Dana, 2026-10-21\n| What they tried | What they found | What happened |\n|---|---|---|\n| opened the weekly view | the button reads Export CSV | nothing to fix |\n`;
  write(root, '05-build-plan.md', plan('src/export.ts'));
  const g = gate(root, 5);
  assert.deepEqual(g.failed, [], JSON.stringify(g.detail));
  for (const id of ['5.8', '5.9', '5.10', '5.11', '5.12', '5.13', '5.14', '5.15', '5.16']) assert.equal(g.by[id], 'skip', id);
  assert.equal(g.by['5.17'], 'pass', 'copy: a person saw the new words');
  write(root, '05-build-plan.md', plan('src/export.ts, db/migrations/0042_label.sql'));
  const h = gate(root, 5);
  assert.equal(h.by['5.4'], 'fail');
  assert.match(h.detail['5.4'], /touch data \(db\/migrations\/0042_label\.sql\)/);
});
