#!/usr/bin/env node
// Behavioral scenarios: run a real host on a copy of a fixture project and check what it did to the files.
// Node built-ins only.
//
//   node tests/scenarios/run.mjs --host "<command>" [--only name] [--keep]
//
// The host command is a template. {prompt} is replaced by the scenario prompt (shell-quoted),
// {plugin} by this repository's path. It runs with the fixture copy as its working directory.
// Examples (flags checked against each CLI's --help on the day this was written; re-check yours):
//   --host "claude -p {prompt} --setting-sources project,local --plugin-dir {plugin} --add-dir {plugin} --permission-mode acceptEdits --allowedTools 'Bash(node:*)'"
//   --host "codex exec {prompt}"            (Codex: install the plugin first, see docs/hosts.md)

import fs from 'fs';
import os from 'os';
import path from 'path';
import { spawnSync } from 'child_process';
import { fileURLToPath } from 'url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(HERE, '../..');
const args = process.argv.slice(2);
const opt = (n) => { const i = args.indexOf(n); return i >= 0 ? args[i + 1] : undefined; };
const host = opt('--host');
if (!host) { console.error('usage: node tests/scenarios/run.mjs --host "<command with {prompt}>" [--only name] [--keep]'); process.exit(2); }
const only = opt('--only');
const timeout = Number(opt('--timeout') || 600) * 1000;

const quote = (s) => `'${s.replace(/'/g, `'\\''`)}'`;
const re = (s) => {
  const ci = s.startsWith('(?i)');
  return new RegExp(ci ? s.slice(4) : s, ci ? 'i' : '');
};
const get = (o, dotted) => dotted.split('.').reduce((x, k) => (x == null ? x : x[k]), o);

const cases = fs.readdirSync(path.join(HERE, 'cases')).filter((f) => f.endsWith('.json'))
  .map((f) => JSON.parse(fs.readFileSync(path.join(HERE, 'cases', f), 'utf8')))
  .filter((c) => !only || c.name === only);

let failed = 0;
for (const c of cases) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), `bos-${c.name}-`));
  fs.cpSync(path.join(REPO, 'tests/fixtures', c.fixture), dir, { recursive: true });
  for (const r of (c.setup && c.setup.remove) || []) fs.rmSync(path.join(dir, r), { recursive: true, force: true });
  if (c.setup && c.setup.regenerate_roadmap) spawnSync(process.execPath, [path.join(REPO, 'scripts/bos.mjs'), 'roadmap', '--root', dir]);
  if (c.setup && c.setup.local_active) fs.writeFileSync(path.join(dir, '.builderos/local.json'), JSON.stringify({ active: c.setup.local_active }));
  const before = Object.fromEntries(((c.expect.files_unchanged) || []).map((f) => [f, fs.readFileSync(path.join(dir, f), 'utf8')]));

  const cmd = host.replace('{plugin}', quote(REPO)).replace('{prompt}', quote(c.prompt));
  const t0 = Date.now();
  const r = spawnSync('sh', ['-c', cmd], { cwd: dir, encoding: 'utf8', timeout, maxBuffer: 64 * 1024 * 1024 });
  const out = (r.stdout || '') + (r.stderr || '');
  fs.writeFileSync(path.join(dir, '.scenario-output.txt'), out);

  const problems = [];
  if (r.error) problems.push(`host did not finish: ${r.error.message}`);
  for (const p of c.expect.output_matches || []) if (!re(p).test(out)) problems.push(`output does not match ${p}`);
  for (const p of c.expect.output_not_matches || []) if (re(p).test(out)) problems.push(`output matches forbidden ${p}`);
  for (const [f, s] of Object.entries(before)) if (fs.readFileSync(path.join(dir, f), 'utf8') !== s) problems.push(`${f} changed`);
  for (const f of c.expect.files_absent || []) if (fs.existsSync(path.join(dir, f))) problems.push(`${f} was written`);
  if (c.expect.state) {
    const { initiative, ...want } = c.expect.state;
    const p = path.join(dir, '.builderos/initiatives', initiative, 'state.json');
    if (!fs.existsSync(p)) problems.push(`no state for ${initiative}`);
    else {
      const s = JSON.parse(fs.readFileSync(p, 'utf8'));
      for (const ev of c.expect.history_events || []) if (!(s.history || []).some((h) => h.event === ev)) problems.push(`no ${ev} event in history`);
      for (const [k, v] of Object.entries(want)) if (get(s, k) !== v) problems.push(`state ${k} is ${JSON.stringify(get(s, k))}, expected ${JSON.stringify(v)}`);
    }
  }

  const secs = Math.round((Date.now() - t0) / 1000);
  if (problems.length) {
    failed++;
    console.log(`✗ ${c.name} (${secs}s): ${c.why}\n  ${problems.join('\n  ')}\n  output and files kept in ${dir}`);
  } else {
    console.log(`✓ ${c.name} (${secs}s)`);
    if (!args.includes('--keep')) fs.rmSync(dir, { recursive: true, force: true });
  }
}
console.log(`\n${cases.length - failed}/${cases.length} scenarios passed`);
process.exit(failed ? 1 : 0);
