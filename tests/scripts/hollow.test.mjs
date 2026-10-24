// The hollow project: every artifact a gate asks for exists, and none of the things they describe do.
// Empty images and prototypes, a CI file nobody wrote, runs of `echo` and `true`, reviews that found "none",
// a plan to talk to users, an opinion about the price, a channel test below its stop line, a test result nobody
// read. Each condition below passed on this project in 3.0.0; each must fail now, and say why.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { spawnSync } from 'child_process';
import { fileURLToPath } from 'url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SCRIPT = path.resolve(HERE, '../../scripts/bos.mjs');
const FIXTURE = path.resolve(HERE, '../fixtures/hollow');

// --root goes before `--`: run-check passes everything after it to the program it runs.
const run = (root, ...args) => {
  const cut = args.includes('--') ? args.indexOf('--') : args.length;
  return spawnSync(process.execPath, [SCRIPT, ...args.slice(0, cut), '--root', root, ...args.slice(cut)], { encoding: 'utf8' });
};
const RUNS = {
  'production-check': ['echo', 'https://promemoria.example.com'],
  'e2e-demo': ['true'],
  perf: ['echo', 'p95', '1.2s'],
  baseline: [process.execPath, '--test', 'tests/app.test.mjs'],
  'unit-tests': [process.execPath, '--test', 'tests/app.test.mjs'],
};

function hollow() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'bos-hollow-'));
  fs.cpSync(FIXTURE, root, { recursive: true });
  // Kept out of the fixture itself: inside this repository a nested .gitignore would hide the fixture's media.
  fs.writeFileSync(path.join(root, '.gitignore'), '.builderos/local.json\n.builderos/media/\n');
  const paths = {};
  for (const [label, argv] of Object.entries(RUNS)) {
    const r = run(root, 'run-check', '--label', label, '--', ...argv);
    paths[label] = (r.stdout.match(/\*\*Run:\*\*\s*(\S+)/) || [])[1];
    assert.ok(paths[label], `run-check ${label} wrote no record: ${r.stderr}`);
  }
  for (const f of ['TECH.md', '.builderos/initiatives/no-show/05-build-plan.md']) {
    const p = path.join(root, f);
    fs.writeFileSync(p, fs.readFileSync(p, 'utf8').replace(/\{\{RUN:([\w-]+)\}\}/g, (_, k) => paths[k]));
  }
  return root;
}
const gate = (root, n) => {
  const j = JSON.parse(run(root, 'gate', String(n), '--json').stdout);
  return Object.fromEntries(j.results.map((x) => [x.id, x]));
};

const root = hollow();
const g4 = gate(root, 4);
const g5 = gate(root, 5);

const HOLLOW = [
  [g4, '4.9', /empty|not an image|no visible text/, 'design versions and reference screens are 0-byte files'],
  [g4, '4.10', /empty|no visible text/, 'the domain prototype is a 0-byte file'],
  [g4, '4.13', /plan|session/, 'a plan to show it next week is not a session with a user'],
  [g4, '4.14', /opinion|did/, '"said they would pay" is an opinion, not an act'],
  [g4, '4.21', /empty/, 'the message preview is a 0-byte file'],
  [g4, '4.22', /stop|below|result/, 'the channel test came back under its stop line, and the cheapest test has no result'],
  [g5, '5.3', /real environment|data/, 'instrumentation "verified" with a code tag'],
  [g5, '5.8', /not found|does not exist/, 'the guardrail names a CI file that does not exist'],
  [g5, '5.9', /empty|not an image|same/, 'one 0-byte screenshot stands for five states'],
  [g5, '5.10', /guardrail/, 'the quality checks are a sentence, not steps of a guardrail that exists'],
  [g5, '5.12', /none/, 'eight rows of "none found" are no critique'],
  [g5, '5.13', /none/, 'five rows of "none found" are no review'],
  [g5, '5.14', /echo|measures nothing/, 'a run of `echo p95 1.2s` is not a measurement'],
  [g5, '5.15', /test|empty|true|recording/, 'two empty PNGs, a run of `true` and an empty test file are not a demo'],
  [g5, '5.16', /echo|did not call|request/, 'a run of `echo https://host` never called production'],
  [g5, '5.17', /words|quote|message/, '"Tried by: Mario" typed by the agent, with nothing Mario said'],
];

for (const [g, id, why, what] of HOLLOW) {
  test(`hollow ${id} fails: ${what}`, () => {
    assert.ok(g[id], `${id} was not evaluated`);
    assert.equal(g[id].status, 'fail', `${id} ${g[id].status}: ${g[id].detail}`);
    assert.match(g[id].detail, why);
  });
}
