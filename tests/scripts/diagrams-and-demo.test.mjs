// Gates 4.20 (every flow drawn as a Mermaid flowchart, every lifecycle as a state diagram that agrees with its table)
// and 5.15 (the feature seen working: a recording of the end-to-end test walking the primary flow, from a passing run).
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

function project({ full = true } = {}) {
  const dir = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), 'bos-demo-')));
  fs.cpSync(FIXTURE, dir, { recursive: true });
  if (full) {
    const p = path.join(dir, '.builderos/initiatives/csv-export/state.json');
    const s = JSON.parse(fs.readFileSync(p, 'utf8'));
    fs.writeFileSync(p, JSON.stringify({ ...s, mode: 'full' }, null, 2));
  }
  return dir;
}
const bos = (root, cmd, ...args) => spawnSync(process.execPath, [SCRIPT, cmd, '--root', root, ...args], { encoding: 'utf8' });
const gate = (root, n, slug = 'csv-export') => {
  const j = JSON.parse(spawnSync(process.execPath, [SCRIPT, 'gate', String(n), '--json', '--initiative', slug, '--root', root], { encoding: 'utf8' }).stdout);
  return { ...j, by: Object.fromEntries(j.results.map((x) => [x.id, x.status])), detail: Object.fromEntries(j.results.map((x) => [x.id, x.detail])) };
};
const write = (root, file, body, slug = 'csv-export') => {
  const p = path.join(root, '.builderos/initiatives', slug, file);
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, body);
};

const media = (root, name) => {
  const p = path.join(root, '.builderos/media/csv-export', name);
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, 'media fixture');
};

const FLOW_TABLE = '| Step | User action | System response | Branches |\n|---|---|---|---|\n| 1 | opens the report | shows the week | no deals: empty state |\n| 2 | clicks Export | builds the file | over 10,000 rows: emailed instead |\n';
const FLOWCHART = '```mermaid\nflowchart TD\n  A[Report] --> B{Any deals?}\n  B -->|no| E[Empty state]\n  B -->|yes| C[Export] --> D[File downloads]\n```\n';
const STATES = '```mermaid\nstateDiagram-v2\n  [*] --> queued\n  queued --> building\n  building --> ready\n  building --> failed\n```\n';
const TRANSITIONS = '| From | To | Who | Only if | Then |\n|---|---|---|---|---|\n| queued | building | job runner | a worker is free | — |\n| building | ready | job runner | the file is written | email the link |\n| building | failed | job runner | three attempts failed | show retry |\n';
const DESIGN = ({ chart = FLOWCHART, states = STATES } = {}) => `# Design\n\n## Flows\n### Export the week\n**Entry points:** the report header\n${FLOW_TABLE}\n${chart}\n## Domain model\n### Entities\n| Entity | Means | Lifecycle |\n|---|---|---|\n| Export | a file of one week of deals | yes |\n| Team | who owns the deals | no |\n\n### Transitions: Export\n${TRANSITIONS}\n${states}\n### Invariants\n- an export belongs to one team\n\n## Visual direction\n**Chosen:** A\n`;

test('gate 4.20 wants each flow drawn as a Mermaid flowchart that shows its branches', () => {
  const root = project();
  write(root, '04-spec.md', '# Spec\n');
  write(root, 'DESIGN.md', '# Design\n');
  assert.match(gate(root, 4).detail['4.20'], /no "## Flows" in DESIGN.md/);
  write(root, 'DESIGN.md', DESIGN());
  let g = gate(root, 4);
  assert.equal(g.by['4.20'], 'pass', g.detail['4.20']);
  assert.match(g.detail['4.20'], /1 flow drawn as flowcharts, 1 lifecycle as state diagrams/);
  write(root, 'DESIGN.md', DESIGN({ chart: '' }));
  assert.match(gate(root, 4).detail['4.20'], /Export the week: no Mermaid flowchart/);
  write(root, 'DESIGN.md', DESIGN({ chart: '```mermaid\nflowchart TD\n  A[Report] --> C[Export]\n```\n' }));
  g = gate(root, 4);
  assert.match(g.detail['4.20'], /the flowchart has 1 arrow/);
  assert.match(g.detail['4.20'], /the table has branches and the flowchart draws no decision/);
  write(root, 'DESIGN.md', DESIGN({ chart: '```mermaid\nsequenceDiagram\n  A->>B: export\n```\n' }));
  assert.match(gate(root, 4).detail['4.20'], /no Mermaid flowchart/, 'a sequence diagram is not the flow');
});

test('gate 4.20 wants each lifecycle as a state diagram holding every state its table names', () => {
  const root = project();
  write(root, '04-spec.md', '# Spec\n');
  write(root, 'DESIGN.md', DESIGN({ states: '' }));
  assert.match(gate(root, 4).detail['4.20'], /Export: no Mermaid stateDiagram for its transitions/);
  write(root, 'DESIGN.md', DESIGN({ states: STATES.replace('  building --> failed\n', '') }));
  assert.match(gate(root, 4).detail['4.20'], /Export: states in the table and not in the diagram: failed/);
  write(root, 'DESIGN.md', DESIGN().replace(/## Domain model[\s\S]*?## Visual/, '## Domain model\n**Domain model:** not applicable, a read-only report\n\n## Visual'));
  assert.equal(gate(root, 4).by['4.20'], 'pass', 'no lifecycle, only the flows are drawn');
});

test('gate 4.20 is a warning in lite mode', () => {
  const root = project({ full: false });
  write(root, '04-spec.md', '# Spec\n');
  write(root, 'DESIGN.md', DESIGN({ chart: '' }));
  assert.equal(gate(root, 4).by['4.20'], 'warn');
});

const PLAN = (demo) => `# Build\n\n## Plan\n**In plain words:** the export.\n\n${demo}\n`;
const demo = ({ test = 'test/e2e/export.spec.ts', run = '', by = '', rows = '| Export the week | .builderos/media/csv-export/export-the-week.webm | opens the report, exports, the file downloads |' } = {}) =>
  `## Demo\n**Test:** ${test}\n${run}${by ? `**Recorded by:** ${by}\n` : ''}| Flow | Recording | Shows |\n|---|---|---|\n${rows}\n`;

test('gate 5.15 wants a recording of the end-to-end test from a passing run, or one a person made', () => {
  const root = project();
  write(root, 'DESIGN.md', DESIGN());
  fs.mkdirSync(path.join(root, 'test/e2e'), { recursive: true });
  fs.writeFileSync(path.join(root, 'test/e2e/export.spec.ts'), '// walks the export flow');
  fs.writeFileSync(path.join(root, 'test/e2e/pass.mjs'), "import { test } from 'node:test'; test('export flow', () => {});\n");
  media(root, 'export-the-week.webm');
  write(root, '05-build-plan.md', PLAN(''));
  assert.match(gate(root, 5).detail['5.15'], /no "## Demo"/);
  write(root, '05-build-plan.md', PLAN(demo()));
  assert.match(gate(root, 5).detail['5.15'], /not from a passing run/);
  const run = bos(root, 'run-check', '--label', 'e2e-demo', '--', process.execPath, '--test', 'test/e2e/pass.mjs').stdout.trim();
  write(root, '05-build-plan.md', PLAN(demo({ run: `${run}\n` })));
  let g = gate(root, 5);
  assert.equal(g.by['5.15'], 'pass', g.detail['5.15']);
  assert.match(g.detail['5.15'], /1 flow recorded from a passing run/);
  write(root, '05-build-plan.md', PLAN(demo({ by: 'Mario, screen recording on his laptop' })));
  assert.equal(gate(root, 5).by['5.15'], 'pass', 'the floor: the person recorded the screen');
  write(root, '05-build-plan.md', PLAN(demo({ by: 'agent' })));
  assert.equal(gate(root, 5).by['5.15'], 'fail', 'the agent is not a person');
  write(root, '05-build-plan.md', PLAN(demo({ run: `${run}\n`, test: 'test/e2e/missing.spec.ts' })));
  assert.match(gate(root, 5).detail['5.15'], /is not a file in the project/);
});

test('gate 5.15 checks every recording exists, accepts step screenshots as the floor, and wants what it shows', () => {
  const root = project();
  write(root, 'DESIGN.md', DESIGN());
  fs.mkdirSync(path.join(root, 'test/e2e'), { recursive: true });
  fs.writeFileSync(path.join(root, 'test/e2e/export.spec.ts'), '// walks the export flow');
  const by = 'Mario, screen recording';
  write(root, '05-build-plan.md', PLAN(demo({ by })));
  assert.match(gate(root, 5).detail['5.15'], /\.builderos\/media\/csv-export\/export-the-week.webm not found/);
  media(root, '1-report.png');
  media(root, '2-downloaded.png');
  write(root, '05-build-plan.md', PLAN(demo({ by, rows: '| Export the week | .builderos/media/csv-export/1-report.png, .builderos/media/csv-export/2-downloaded.png | the report, then the file |' })));
  let g = gate(root, 5);
  assert.equal(g.by['5.15'], 'pass', g.detail['5.15']);
  assert.match(g.detail['5.15'], /1 as step screenshots \(no video\)/);
  write(root, '05-build-plan.md', PLAN(demo({ by, rows: '| Export the week | https://github.com/acme/app/pull/12#demo | |' })));
  assert.match(gate(root, 5).detail['5.15'], /Export the week: no "Shows"/);
  write(root, '05-build-plan.md', PLAN(demo({ by, rows: '| Export the week | the build looked fine | it works |' })));
  assert.match(gate(root, 5).detail['5.15'], /no video file or link, nor a sequence of step screenshots/);
});

test('gate 5.15 asks the product track for the first day, and skips work without an interface', () => {
  const root = project();
  write(root, 'DESIGN.md', DESIGN(), 'onboarding-v2');
  write(root, '05-build-plan.md', PLAN(demo({ by: 'Mario' })), 'onboarding-v2');
  assert.match(gate(root, 5, 'onboarding-v2').detail['5.15'], /no recording of the first day/);
  write(root, 'DESIGN.md', '# Design\n\n## Visual direction\n**Visual direction:** not applicable, an API only\n');
  write(root, '05-build-plan.md', PLAN(''));
  assert.equal(gate(root, 5).by['5.15'], 'skip');
  write(root, 'DESIGN.md', DESIGN());
  write(root, '05-build-plan.md', PLAN('## Demo\n**Demo:** not applicable, a background job with no screen\n'));
  assert.equal(gate(root, 5).by['5.15'], 'pass');
});

test('gate 5.15 keeps the recording out of the codebase', () => {
  const root = project();
  write(root, 'DESIGN.md', DESIGN());
  fs.mkdirSync(path.join(root, 'test/e2e'), { recursive: true });
  fs.writeFileSync(path.join(root, 'test/e2e/export.spec.ts'), '// walks the export flow');
  media(root, 'export-the-week.webm');
  spawnSync('git', ['init', '-q'], { cwd: root });
  write(root, '05-build-plan.md', PLAN(demo({ by: 'Mario' })));
  assert.match(gate(root, 5).detail['5.15'], /would go into the codebase/);
  fs.writeFileSync(path.join(root, '.gitignore'), '.builderos/media/\n');
  assert.equal(gate(root, 5).by['5.15'], 'pass', 'ignored by git');
  write(root, '05-build-plan.md', PLAN(demo({ by: 'Mario', rows: '| Export the week | https://github.com/acme/app/pull/12 | the report, Export, the file |' })));
  assert.equal(gate(root, 5).by['5.15'], 'pass', 'a link to where the person opens it');
});

test('flows writes an editable page of every diagram, and --apply writes the edits back', () => {
  const root = project();
  write(root, 'DESIGN.md', DESIGN());
  let r = bos(root, 'flows', '--initiative', 'csv-export');
  assert.equal(r.status, 0, r.stderr);
  assert.match(r.stdout, /design\/flows.html: 2 diagrams to edit/);
  const html = fs.readFileSync(path.join(root, '.builderos/initiatives/csv-export/design/flows.html'), 'utf8');
  assert.match(html, /Flows › Export the week/);
  assert.match(html, /Domain model › Transitions: Export/);
  assert.match(html, /pele@\d+\.\d+\.\d+/, 'the renderer is pinned');
  assert.match(html, /@excalidraw\/excalidraw@\d+\.\d+\.\d+/, 'the canvas is pinned');
  // The page turns the person's drawing back into a flowchart: boxes, diamonds, labeled and dashed arrows; loose arrows counted.
  const fn = html.match(/const canvasToMermaid = (function canvasToMermaid[\s\S]*?\n\})/)[1];
  const canvasToMermaid = new Function(`return (${fn})`)();
  const box = (id, type, y, text) => [{ id, type, x: 0, y }, { id: `${id}-t`, type: 'text', containerId: id, text }];
  const out = canvasToMermaid([
    ...box('a', 'rectangle', 0, 'Report'), ...box('b', 'diamond', 100, 'Any deals?'), ...box('c', 'rectangle', 200, 'Export "CSV"'),
    { id: 'x', type: 'arrow', startBinding: { elementId: 'a' }, endBinding: { elementId: 'b' } },
    { id: 'y', type: 'arrow', startBinding: { elementId: 'b' }, endBinding: { elementId: 'c' }, strokeStyle: 'dashed' }, { id: 'y-t', type: 'text', containerId: 'y', text: 'yes' },
    { id: 'z', type: 'arrow', startBinding: { elementId: 'c' } },
    ...box('gone', 'rectangle', 300, 'Deleted').map((e) => ({ ...e, isDeleted: true })),
  ], 'LR');
  assert.equal(out.text, 'flowchart LR\n  n1["Report"]\n  n2{"Any deals?"}\n  n3["Export #quot;CSV#quot;"]\n  n1 --> n2\n  n2 -.->|"yes"| n3');
  assert.equal(out.loose, 1);
  fs.writeFileSync(path.join(root, 'flows-edited.md'), '# Flows edited\n\n## Domain model › Transitions: Export\n\n```mermaid\nstateDiagram-v2\n  [*] --> queued\n  queued --> building\n  building --> ready\n  building --> failed\n  failed --> queued : person retries\n```\n');
  r = bos(root, 'flows', '--initiative', 'csv-export', '--apply', 'flows-edited.md');
  assert.equal(r.status, 0, r.stderr);
  const design = fs.readFileSync(path.join(root, '.builderos/initiatives/csv-export/DESIGN.md'), 'utf8');
  assert.match(design, /failed --> queued : person retries/);
  assert.match(design, /B -->\|no\| E\[Empty state\]/, 'the other diagram is untouched');
  assert.equal(design.match(/```mermaid/g).length, 2);
  fs.writeFileSync(path.join(root, 'bad.md'), '## Flows › Nowhere\n\n```mermaid\nflowchart TD\n a --> b\n```\n');
  assert.match(bos(root, 'flows', '--initiative', 'csv-export', '--apply', 'bad.md').stderr, /no diagram in DESIGN.md for: Flows › Nowhere/);
});
