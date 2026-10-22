// The rules that must hold every time, enforced by host hooks; and the script copy that travels with a project.
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
  const dir = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), 'bos-guard-')));
  fs.cpSync(FIXTURE, dir, { recursive: true });
  return dir;
}
function hook(cwd, input) {
  const r = spawnSync('bash', [path.join(REPO, 'hooks/run-hook.cmd'), 'pre-tool-use'], { cwd, input: typeof input === 'string' ? input : JSON.stringify(input), encoding: 'utf8' });
  assert.equal(r.status, 0, r.stderr);
  return r.stdout.trim() ? JSON.parse(r.stdout) : null;
}

test('the PreToolUse hook is registered for every file-writing tool', () => {
  const config = JSON.parse(fs.readFileSync(path.join(REPO, 'hooks/hooks.json'), 'utf8'));
  const entry = config.hooks.PreToolUse[0];
  const matcher = new RegExp(`^(?:${entry.matcher})$`);
  for (const tool of ['Write', 'Edit', 'MultiEdit', 'NotebookEdit']) assert.ok(matcher.test(tool), tool);
  assert.ok(!matcher.test('Bash'), 'the script writes state through Bash and must stay allowed');
  assert.match(entry.hooks[0].command, /run-hook\.cmd" pre-tool-use$/);
});

test('a hand-written state.json is denied, with the command to use instead', () => {
  const root = project();
  for (const file of ['.builderos/initiatives/csv-export/state.json', path.join(root, '.builderos/initiatives/onboarding/state.json'), '.builderos/state.json']) {
    const out = hook(root, { hook_event_name: 'PreToolUse', tool_name: 'Write', tool_input: { file_path: file }, cwd: root });
    assert.equal(out.hookSpecificOutput.permissionDecision, 'deny', file);
    assert.match(out.hookSpecificOutput.permissionDecisionReason, /bos\.mjs new, cover, upgrade, record/);
  }
});

test('every other edit passes untouched, and a malformed payload never blocks', () => {
  const root = project();
  for (const file of ['src/export.js', '.builderos/initiatives/csv-export/04-spec.md', 'PRODUCT.md', 'docs/state.json.md', 'state.json']) {
    assert.equal(hook(root, { tool_name: 'Edit', tool_input: { file_path: file }, cwd: root }), null, file);
  }
  assert.equal(hook(root, 'not json'), null);
  assert.equal(hook(root, { tool_name: 'Write', tool_input: {} }), null);
});

test('vendor copies the script into the project, and the briefing flags a stale copy', () => {
  const root = project();
  const r = spawnSync(process.execPath, [SCRIPT, 'vendor', '--root', root], { encoding: 'utf8' });
  assert.equal(r.status, 0, r.stderr);
  const copy = path.join(root, '.builderos/bin/bos.mjs');
  assert.equal(fs.readFileSync(copy, 'utf8'), fs.readFileSync(SCRIPT, 'utf8'));
  const fromCopy = spawnSync(process.execPath, [copy, 'brief'], { cwd: root, encoding: 'utf8' });
  assert.equal(fromCopy.status, 0, fromCopy.stderr);
  assert.match(fromCopy.stdout, /CSV export/);
  assert.doesNotMatch(fromCopy.stdout, /differs from the installed script/);
  fs.appendFileSync(copy, '\n// older\n');
  const stale = spawnSync(process.execPath, [SCRIPT, 'brief', '--root', root], { encoding: 'utf8' });
  assert.match(stale.stdout, /\.builderos\/bin\/bos\.mjs differs from the installed script/);
});

test('vendor refuses an uninitialized directory', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'bos-empty-'));
  const r = spawnSync(process.execPath, [SCRIPT, 'vendor', '--root', dir], { encoding: 'utf8' });
  assert.equal(r.status, 2);
  assert.ok(!fs.existsSync(path.join(dir, '.builderos')));
});
