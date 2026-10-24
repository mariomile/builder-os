// Tests for what people open, click and receive: messages (4.21, 5.9), production from the first slice (5.16),
// a person trying the build (5.17) and the project page (`bos.mjs page`).
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
  return { by: Object.fromEntries(j.results.map((x) => [x.id, x.status])), detail: Object.fromEntries(j.results.map((x) => [x.id, x.detail])) };
};
const INIT = (root) => path.join(root, '.builderos/initiatives/csv-export');
const write = (root, file, body) => { fs.mkdirSync(path.dirname(path.join(INIT(root), file)), { recursive: true }); fs.writeFileSync(path.join(INIT(root), file), body); };
const statePath = (root) => path.join(INIT(root), 'state.json');
const setState = (root, patch) => fs.writeFileSync(statePath(root), JSON.stringify({ ...JSON.parse(fs.readFileSync(statePath(root), 'utf8')), ...patch }, null, 2));
const tech = (root, edit) => { const p = path.join(root, 'TECH.md'); fs.writeFileSync(p, edit(fs.readFileSync(p, 'utf8'))); };

const SPEC = '# Spec\n\n## Acceptance criteria\n| # | Criterion | Flow |\n|---|---|---|\n| 1 | A manager downloads the weekly view as CSV | export |\n';
const MESSAGES = (rows) => `# Design\n\n## Messages\n| Message | Trigger | Recipient | Channel | Text | Opt-out | Preview |\n|---|---|---|---|---|---|---|\n${rows}\n`;
const EXPORT_READY = '| Export ready | a large export finishes | the manager who asked | email | Your weekly deals export is ready to download | transactional: none needed | design/messages/export-ready.html |';

test('gate 4.21: every message the product sends has its trigger, recipient, channel, real text, opt-out and preview', () => {
  const root = project();
  write(root, '04-spec.md', SPEC);
  write(root, 'DESIGN.md', '# Design\n');
  assert.equal(gate(root, 4).by['4.21'], 'fail', 'no messages section');
  write(root, 'DESIGN.md', '# Design\n\n**Messages:** none\n');
  assert.equal(gate(root, 4).by['4.21'], 'fail', 'none needs its reason');
  write(root, 'DESIGN.md', '# Design\n\n**Messages:** none, the export is a download and sends nothing\n');
  assert.equal(gate(root, 4).by['4.21'], 'pass');
  write(root, 'DESIGN.md', MESSAGES(EXPORT_READY));
  assert.equal(gate(root, 4).by['4.21'], 'fail', 'the preview file does not exist yet');
  write(root, 'design/messages/export-ready.html', '<p>Your weekly deals export is ready</p>');
  assert.equal(gate(root, 4).by['4.21'], 'pass');
  write(root, 'DESIGN.md', MESSAGES(EXPORT_READY.replace('Your weekly deals export is ready to download', 'lorem ipsum dolor')));
  assert.match(gate(root, 4).detail['4.21'], /placeholder/);
  write(root, 'DESIGN.md', MESSAGES(EXPORT_READY.replace('transactional: none needed', '')));
  assert.match(gate(root, 4).detail['4.21'], /no opt-out/);
});

const TRIED = (by) => `\n## Tried\n**Link:** https://pr-12.reports.acme.example\n**Tried by:** ${by}\n| What they tried | What they found | What happened |\n|---|---|---|\n| exported last week | the file name has no date | fixed |\n`;
const BUILD = (extra) => `# Build\n\n## Interface review\n**Widths:** 1280 and 390\n| State | Screenshot or route | Matches the chosen direction |\n|---|---|---|\n| empty | /reports?state=empty | yes |\n${extra}`;

test('gate 5.17: a person, not the agent, tried the build from a link, with the date and what happened to each finding', () => {
  const root = project();
  write(root, '04-spec.md', SPEC);
  write(root, '05-build-plan.md', BUILD(''));
  assert.equal(gate(root, 5).by['5.17'], 'fail', 'no ## Tried');
  write(root, '05-build-plan.md', BUILD(TRIED('Claude, 2026-01-02')));
  assert.match(gate(root, 5).detail['5.17'], /is the agent/);
  write(root, '05-build-plan.md', BUILD(TRIED('Mario')));
  assert.match(gate(root, 5).detail['5.17'], /needs the date/);
  write(root, '05-build-plan.md', BUILD(TRIED('Mario, 2026-01-02')));
  assert.equal(gate(root, 5).by['5.17'], 'pass');
  tech(root, (t) => t.replace(/\| Run \|.*\n/, ''));
  assert.match(gate(root, 5).detail['5.17'], /no "Run" row/);
  write(root, 'DESIGN.md', '# Design\n\n## Visual direction\n**Visual direction:** not applicable, an API with no screens\n');
  assert.equal(gate(root, 5).by['5.17'], 'skip', 'no interface, nothing to click');
});

test('gate 5.9: messages are seen as received from the built product', () => {
  const root = project();
  write(root, '04-spec.md', SPEC);
  write(root, 'DESIGN.md', MESSAGES(EXPORT_READY));
  write(root, '05-build-plan.md', BUILD(''));
  assert.match(gate(root, 5).detail['5.9'], /Messages received/);
  write(root, '05-build-plan.md', BUILD('**Messages received:** sent to the test inbox, captures/export-ready.png\n'));
  assert.doesNotMatch(gate(root, 5).detail['5.9'] || '', /Messages received/);
});

test('gate 5.16: production exists before the release; the product track needs every line, a live product warns', () => {
  const root = project();
  write(root, '04-spec.md', SPEC);
  write(root, '05-build-plan.md', BUILD(TRIED('Mario, 2026-01-02')));
  assert.equal(gate(root, 5).by['5.16'], 'pass', 'the fixture records production, checked by a person');
  setState(root, { track: 'product' });
  assert.equal(gate(root, 5).by['5.16'], 'pass', 'every line is there');
  tech(root, (t) => t.replace(/\*\*Email sender:\*\*.*\n/, ''));
  assert.match(gate(root, 5).detail['5.16'], /Email sender/);
  tech(root, (t) => t.replace(/## Environments[\s\S]*?(?=## Operations)/, ''));
  assert.equal(gate(root, 5).by['5.16'], 'fail', 'a new product with no production');
  setState(root, { track: 'feature' });
  assert.equal(gate(root, 5).by['5.16'], 'warn', 'a live product without the record warns');
});

test('gate 5.16 reads a captured request to the production host', () => {
  const root = project();
  write(root, '04-spec.md', SPEC);
  write(root, '05-build-plan.md', BUILD(''));
  setState(root, { track: 'product' });
  const capture = (url) => spawnSync(process.execPath, [SCRIPT, 'run-check', '--root', root, '--label', 'production-check', '--', process.execPath, '-e', '0', url], { encoding: 'utf8' }).stdout.trim().replace(/^\*\*Run:\*\*\s*/, '');
  const elsewhere = capture('https://staging.example.org/login');
  tech(root, (t) => t.replace(/\*\*Production check:\*\*.*\n/, `**Production check:** ${elsewhere}\n`));
  assert.match(gate(root, 5).detail['5.16'], /did not call reports\.acme\.example/);
  const prod = capture('https://reports.acme.example/login');
  tech(root, (t) => t.replace(/\*\*Production check:\*\*.*\n/, `**Production check:** ${prod}\n`));
  assert.equal(gate(root, 5).by['5.16'], 'pass');
  tech(root, (t) => t.replace(/\*\*Production check:\*\*.*\n/, `**Production check:** **Run:** ${prod}\n`));
  assert.equal(gate(root, 5).by['5.16'], 'pass', 'the shape production-setup documents');
  tech(root, (t) => t.replace('https://reports.acme.example |', 'http://reports.acme.example |'));
  assert.match(gate(root, 5).detail['5.16'], /not an https/);
});

test('bos.mjs page writes one page with the initiatives, what waits on a person and links to every file; the roadmap regenerates it', () => {
  const root = project();
  write(root, 'design/a-v1.html', '<p>version A</p>');
  write(root, '05-build-plan.md', BUILD(TRIED('Mario, 2026-01-02')));
  const r = run(root, 'page');
  assert.equal(r.code, 0, r.err);
  const html = fs.readFileSync(path.join(root, '.builderos/index.html'), 'utf8');
  assert.match(html, /<title>[^<]+: BuilderOS<\/title>/);
  assert.match(html, /CSV export/);
  assert.match(html, /href="initiatives\/csv-export\/design\/a-v1\.html"/);
  assert.match(html, /href="https:\/\/pr-12\.reports\.acme\.example"/, 'the preview a person tries');
  assert.match(html, /href="https:\/\/reports\.acme\.example"/, 'production');
  assert.match(html, /href="\.\.\/PRODUCT\.md"/);
  assert.match(html, /prefers-color-scheme:dark/);
  fs.rmSync(path.join(root, '.builderos/index.html'));
  run(root, 'round', '--asked', '2');
  run(root, 'roadmap');
  assert.match(fs.readFileSync(path.join(root, '.builderos/index.html'), 'utf8'), /2 questions waiting since/, 'regenerated with the roadmap, with the open round');
});
