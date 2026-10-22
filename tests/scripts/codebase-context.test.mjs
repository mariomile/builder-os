import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

// The files that point the next session at the code stay true to it: TECH.md → Map, AGENTS.md, CLAUDE.md.
const script = new URL('../../scripts/bos.mjs', import.meta.url).pathname;
const fixture = new URL('../fixtures/acme', import.meta.url).pathname;
function project(t) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'bos-ctx-'));
  fs.cpSync(fixture, root, { recursive: true });
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const write = (f, s) => fs.writeFileSync(path.join(root, f), s);
  write('.builderos/initiatives/csv-export/05-build-plan.md', '# Build\n\n## Plan\n');
  const read = (f) => fs.readFileSync(path.join(root, f), 'utf8');
  const run = (...a) => spawnSync(process.execPath, [script, ...a, '--root', root], { encoding: 'utf8' }).stdout;
  const gate5 = () => JSON.parse(run('gate', '5', '--json')).results.find((r) => r.id === '5.11');
  return { root, write, read, run, gate5 };
}

test('gate 5.11 needs a map in TECH.md and every path it, AGENTS.md and CLAUDE.md name', (t) => {
  const p = project(t);
  assert.equal(p.gate5().status, 'pass');
  p.write('AGENTS.md', '# Acme\n\nExports live in `src/export.ts`; the old builder was `src/legacy/builder.ts`.\nRun `node .builderos/bin/bos.mjs brief` first. See https://example.com/a/b.\n');
  const dead = p.gate5();
  assert.equal(dead.status, 'fail');
  assert.match(dead.detail, /AGENTS\.md names `src\/legacy\/builder\.ts`/);
  assert.doesNotMatch(dead.detail, /export\.ts|bos\.mjs brief|example\.com/);
  p.write('AGENTS.md', '# Acme\n\nExports live in `src/export.ts`.\n');
  p.write('TECH.md', p.read('TECH.md').replace(/## Map[\s\S]*?(?=## Operations)/, ''));
  assert.match(p.gate5().detail, /no "## Map" in TECH\.md/);
  p.write('TECH.md', p.read('TECH.md').replace('## Operations', '## Map\nNot applicable, no code yet.\n\n## Operations'));
  assert.equal(p.gate5().status, 'pass');
});

test('the briefing flags a dead pointer and an AGENTS.md too long to load every session', (t) => {
  const p = project(t);
  p.write('CLAUDE.md', '@AGENTS.md\n\nThe report builder is `src/report/builder.ts`.\n');
  assert.match(p.run('brief'), /Attention:.*CLAUDE\.md names `src\/report\/builder\.ts`.*no longer there/);
  p.write('CLAUDE.md', '@AGENTS.md\n');
  p.write('AGENTS.md', Array.from({ length: 160 }, (_, i) => `- rule ${i}`).join('\n'));
  assert.match(p.run('brief'), /AGENTS\.md is 160 lines/);
});
