import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

// The decisions a phase turns on belong to a person: each gate reads a `**Chosen by:**` that names someone other than the agent.
const script = new URL('../../scripts/bos.mjs', import.meta.url).pathname;
const fixture = new URL('../fixtures/acme', import.meta.url).pathname;
function project(t) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'bos-decide-'));
  fs.cpSync(fixture, root, { recursive: true });
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const dir = path.join(root, '.builderos/initiatives/csv-export');
  const write = (f, s) => fs.writeFileSync(path.join(dir, f), s);
  const gate = (n) => Object.fromEntries(JSON.parse(spawnSync(process.execPath, [script, 'gate', String(n), '--json', '--root', root], { encoding: 'utf8' }).stdout).results.map((r) => [r.id, r.status]));
  return { write, gate };
}

const by = (line) => (line === null ? '' : `**Chosen by:** ${line}\n`);
const CASES = [
  ['0.5', 0, '00-frame.md', (b) => `# Frame\n\n## Problem\nManagers rebuild the Monday view by hand.\n\n## Riskiest assumption\nManagers open the view weekly.\n**Would be falsified by:** fewer than 2 of 5 open it\n${b}`],
  ['1.6', 1, '01-discovery.md', (b) => `# Discovery\n\n## Verdict\nVALIDATED \`[interview:P1]\`\n${b}`],
  ['2.8', 2, '02-definition.md', (b) => `# Definition\n\n## Selected: Monday view\n**Why:** strongest evidence\n${b}\n## Rejected\n`],
  ['6.13', 6, '06-release.md', (b) => `# Release\n\n## Rollout\n**Strategy:** full\n${b}\n## Rollback\n`],
  ['7.7', 7, '07-outcome.md', (b) => `# Outcome\n\n## Decision: KEEP\n**Why:** above target\n${b}**Re-enters at:** none\n`],
];

for (const [id, n, file, body] of CASES) {
  test(`gate ${id} passes only when a person made the decision`, (t) => {
    const p = project(t);
    p.write(file, body(by(null)));
    assert.equal(p.gate(n)[id], 'fail', 'no Chosen by');
    p.write(file, body(by('agent, from the scores')));
    assert.equal(p.gate(n)[id], 'fail', 'the agent cannot choose');
    p.write(file, body(by('Dana, "go with the recommendations" (2026-10-21)')));
    assert.equal(p.gate(n)[id], 'pass');
  });
}
