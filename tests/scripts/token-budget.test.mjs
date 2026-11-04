// What every session pays before any work: the listing of skills, agents and commands, and the
// line each message carries inside a project. Kept under a budget so it cannot grow back silently.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { spawnSync } from 'child_process';
import { fileURLToPath } from 'url';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const SCRIPT = path.join(REPO, 'scripts/bos.mjs');
const FIXTURE = path.join(REPO, 'tests/fixtures/acme');

// 3.3.0 listed 34 skills, 14 agents and 16 commands: 14,425 characters of descriptions in every session.
const LISTING_BUDGET = 7700;
const AGENT_DESCRIPTION = 130;

function front(file) {
  const text = fs.readFileSync(file, 'utf8');
  const fm = (text.match(/^---\n([\s\S]*?)\n---\n/) || [])[1] || '';
  return {
    description: (fm.match(/^description:\s*"?(.*?)"?\s*$/m) || [])[1] || '',
    userInvoked: /^disable-model-invocation:\s*true/m.test(fm),
  };
}
const list = (dir, pick) => fs.readdirSync(path.join(REPO, dir)).map(pick).filter((f) => f && fs.existsSync(f)).map(front);
const skills = list('skills', (d) => path.join(REPO, 'skills', d, 'SKILL.md'));
const agents = list('agents', (f) => f.endsWith('.md') && path.join(REPO, 'agents', f));
const commands = list('commands', (f) => f.endsWith('.md') && path.join(REPO, 'commands', f));

test('the always-loaded listing stays under its budget', () => {
  const listed = [...skills, ...agents, ...commands].filter((x) => !x.userInvoked);
  const chars = listed.reduce((n, x) => n + x.description.length, 0);
  assert.ok(chars <= LISTING_BUDGET, `${chars} characters of descriptions load in every session, budget ${LISTING_BUDGET}`);
});

test('commands are typed by the person, so the model listing leaves them out', () => {
  for (const c of commands) assert.ok(c.userInvoked, `a command without disable-model-invocation: ${c.description.slice(0, 50)}`);
});

test('agent descriptions are one short line: the skill carries the triggers', () => {
  for (const a of agents) assert.ok(a.description.length <= AGENT_DESCRIPTION, `${a.description.length} chars: ${a.description.slice(0, 50)}`);
});

function project() {
  const dir = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), 'bos-budget-')));
  fs.cpSync(FIXTURE, dir, { recursive: true });
  return dir;
}
function context(cwd, session) {
  const r = spawnSync('node', [SCRIPT, 'context'], { cwd, input: JSON.stringify({ prompt: 'next', session_id: session }), encoding: 'utf8' });
  assert.equal(r.status, 0, r.stderr);
  return JSON.parse(r.stdout).hookSpecificOutput.additionalContext;
}

test('the per-message line repeats in full only when it changed', () => {
  const root = project();
  const first = context(root, 's1');
  assert.match(first, /check it against decisions\//, 'the first message gets the full line');
  const second = context(root, 's1');
  assert.match(second, /unchanged since the last message/, 'an identical line shrinks to a reminder');
  assert.ok(second.length < first.length / 2, `${second.length} vs ${first.length}`);
  assert.match(context(root, 's2'), /check it against decisions\//, 'a new session gets the full line');
  spawnSync('node', [SCRIPT, 'brief'], { cwd: root, encoding: 'utf8' });
  assert.match(context(root, 's2'), /check it against decisions\//, 'after a briefing (start, resume, compaction) the full line returns');
});

test('a payload without a session id always gets the full line', () => {
  const root = project();
  for (let i = 0; i < 2; i++) {
    const r = spawnSync('node', [SCRIPT, 'context'], { cwd: root, input: '{"prompt":"x"}', encoding: 'utf8' });
    assert.match(JSON.parse(r.stdout).hookSpecificOutput.additionalContext, /check it against decisions\//);
  }
});
