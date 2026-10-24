// A field that says the person decided must carry the person's words. The UserPromptSubmit hook appends each
// message to .builderos/person-log.jsonl, the guard keeps hands off it, and Chosen by, Accepted, Tried by,
// Rules decided by, Authorized by and --accepted-by must quote it. No log on the host: pass, marked unverified.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { spawnSync } from 'child_process';
import { fileURLToPath } from 'url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(HERE, '../..');
const SCRIPT = path.join(REPO, 'scripts/bos.mjs');
const FIXTURE = path.join(REPO, 'tests/fixtures/acme');

function project() {
  const dir = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), 'bos-words-')));
  fs.cpSync(FIXTURE, dir, { recursive: true });
  return dir;
}
const run = (root, input, ...args) => spawnSync(process.execPath, [SCRIPT, ...args, '--root', root], { encoding: 'utf8', input });
const gate = (root, n) => Object.fromEntries(JSON.parse(run(root, '', 'gate', String(n), '--json').stdout).results.map((x) => [x.id, x]));
const LOG = (root) => path.join(root, '.builderos/person-log.jsonl');
const DEFINITION = (root) => path.join(root, '.builderos/initiatives/csv-export/02-definition.md');
const say = (root, prompt) => run(root, JSON.stringify({ hook_event_name: 'UserPromptSubmit', prompt }), 'context');

test('the message hook appends what the person wrote, and nothing when there is no prompt', () => {
  const root = project();
  say(root, 'the Monday view, and 40% by December');
  run(root, '{}', 'context');
  const lines = fs.readFileSync(LOG(root), 'utf8').trim().split('\n').map((l) => JSON.parse(l));
  assert.equal(lines.length, 1);
  assert.equal(lines[0].text, 'the Monday view, and 40% by December');
  assert.ok(!Number.isNaN(Date.parse(lines[0].at)));
});

test('the guard denies a hand edit of the person log', () => {
  const root = project();
  const r = spawnSync('bash', [path.join(REPO, 'hooks/run-hook.cmd'), 'pre-tool-use'], { cwd: root, input: JSON.stringify({ tool_name: 'Write', tool_input: { file_path: '.builderos/person-log.jsonl' }, cwd: root }), encoding: 'utf8' });
  const out = JSON.parse(r.stdout);
  assert.equal(out.hookSpecificOutput.permissionDecision, 'deny');
  assert.match(out.hookSpecificOutput.permissionDecisionReason, /appended by the BuilderOS hook/);
});

test('Chosen by passes unverified without a log, and with one must quote the person', () => {
  const root = project();
  assert.equal(gate(root, 2)['2.8'].status, 'pass');
  assert.match(gate(root, 2)['2.8'].detail, /not verified: no person log/);
  say(root, 'ok, the Monday view, and 40% by December');
  assert.equal(gate(root, 2)['2.8'].status, 'pass');
  assert.match(gate(root, 2)['2.8'].detail, /in their words/);
  const body = fs.readFileSync(DEFINITION(root), 'utf8');
  fs.writeFileSync(DEFINITION(root), body.replace(/\*\*Chosen by:\*\*.*/, '**Chosen by:** Dana, "the weekly view, by Christmas"'));
  assert.equal(gate(root, 2)['2.8'].status, 'fail');
  assert.match(gate(root, 2)['2.8'].detail, /never wrote/);
  fs.writeFileSync(DEFINITION(root), body.replace(/\*\*Chosen by:\*\*.*/, '**Chosen by:** Dana'));
  assert.match(gate(root, 2)['2.8'].detail, /quotes no message of the person/);
});

test('record --accepted-by refuses a name without the words that accepted', () => {
  const root = project();
  say(root, 'va bene, approvato');
  const bare = run(root, '', 'record', '0', '--accepted-by', 'Dana');
  assert.notEqual(bare.status, 0);
  assert.match(bare.stderr, /quotes no message of the person/);
  const quoted = run(root, '', 'record', '0', '--accepted-by', 'Dana, "approvato"');
  assert.doesNotMatch(quoted.stderr, /accepted-by/);
});
