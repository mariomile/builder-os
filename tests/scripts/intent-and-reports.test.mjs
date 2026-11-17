// The flow shows the person what it is doing: the intent asked once and kept on top of the brief (E.5), the bet seen as
// screens before a spec (3.16), a report with something to open after every slice (5.18), and a person log that holds
// only what the person wrote.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const script = new URL('../../scripts/bos.mjs', import.meta.url).pathname;
const fixtures = new URL('../fixtures/', import.meta.url).pathname;
function project(t, name) {
  const root = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), 'bos-intent-')));
  fs.cpSync(path.join(fixtures, name), root, { recursive: true });
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const file = (rel) => path.join(root, rel);
  const run = (...a) => spawnSync(process.execPath, [script, ...a, '--root', root], { encoding: 'utf8' });
  return {
    root, run,
    write: (rel, s) => { fs.mkdirSync(path.dirname(file(rel)), { recursive: true }); fs.writeFileSync(file(rel), s); },
    edit: (rel, fn) => fs.writeFileSync(file(rel), fn(fs.readFileSync(file(rel), 'utf8'))),
    read: (rel) => fs.readFileSync(file(rel), 'utf8'),
    say: (prompt) => spawnSync(process.execPath, [script, 'context', '--root', root], { encoding: 'utf8', input: JSON.stringify({ hook_event_name: 'UserPromptSubmit', prompt }) }),
    gate: (n, slug) => Object.fromEntries(JSON.parse(run('gate', String(n), '--json', '--initiative', slug).stdout).results.map((x) => [x.id, x])),
  };
}
const THREAD = '**Building:** a weekly digest of closed deals\n**Why:** managers rebuild it by hand every Monday `[assumption:unvalidated]`\n';
const INTENT = '**For:** sales managers of a ten-person team\n**Done when:** I open one page on Monday and the week is there\n**Not:** a reporting suite\n';
const DIR = '.builderos/initiatives/no-show/';

test('E.5: an initiative cannot start without the intent, and one under way is reminded', (t) => {
  const p = project(t, 'acme');
  assert.match(p.run('new', 'digests', '--track', 'change', '--reason', 'test').stdout, /\*\*For:\*\*, \*\*Done when:\*\*, \*\*Not:\*\*/, 'a new initiative is told to open on the intent');
  const change = '.builderos/initiatives/digests/CHANGE.md';
  p.write(change, `# Change: Digests\n\n${THREAD}\n# Request: Digests\n\n## Request\nA digest.\n`);
  const m = p.gate('M', 'digests')['E.5'];
  assert.equal(m.status, 'fail');
  assert.match(m.detail, /\*\*For:\*\*, \*\*Done when:\*\*, \*\*Not:\*\*/);
  p.write(change, `# Change: Digests\n\n${THREAD}${INTENT}\n# Request: Digests\n\n## Request\nA digest.\n`);
  assert.equal(p.gate('M', 'digests')['E.5'].status, 'pass');

  const h = project(t, 'hollow');
  h.run('migrate', '--layout', '--initiative', 'no-show');
  assert.equal(h.gate(2, 'no-show')['E.5'].status, 'warn', 'past its first gate: a reminder, the build is not stopped');
});

test('the person log keeps what the person wrote and drops what the host injected', (t) => {
  const p = project(t, 'acme');
  p.say('<task-notification><task-id>a1</task-id>the person said ship it on Friday</task-notification>');
  p.say('Delegated task node:1 (Rename) [completed]: done');
  p.say('<agent-message from="a6">someone else is editing my worktree</agent-message>');
  p.say('the Monday view first');
  const lines = p.read('.builderos/person-log.jsonl').trim().split('\n').map((l) => JSON.parse(l).text);
  assert.deepEqual(lines, ['the Monday view first']);
});

test('gate 3.16: the person saw the bet as screens before the spec', (t) => {
  const p = project(t, 'hollow');
  p.run('migrate', '--layout', '--initiative', 'no-show');
  assert.equal(p.gate(3, 'no-show')['3.16'].status, 'fail');
  const bet = (s) => p.edit(DIR + 'BRIEF.md', (md) => md.replace(/\n## First screen[\s\S]*$/, '') + `\n## First screen\n${s}\n`);
  bet('**Link:** `design/first-screen.html`\n**Seen by:** Claude · 2026-11-17');
  assert.match(p.gate(3, 'no-show')['3.16'].detail, /first-screen\.html is not there.*is the agent/);
  p.write(DIR + 'design/first-screen.html', '<!doctype html><title>First screen</title>');
  p.say('ok ma troppe pagine, mettile in una');
  bet('**Link:** `design/first-screen.html`\n**Seen by:** Mario · 2026-11-17 · "troppe pagine, mettile in una"');
  assert.equal(p.gate(3, 'no-show')['3.16'].status, 'pass');
  bet('**None:** a nightly job with no screen');
  assert.equal(p.gate(3, 'no-show')['3.16'].status, 'pass');
});

test('gate 5.18: every finished slice told the person what it did and what to open', (t) => {
  const p = project(t, 'hollow');
  p.run('migrate', '--layout', '--initiative', 'no-show');
  assert.match(p.gate(5, 'no-show')['5.18'].detail, /no "## Reports" in LOG\.md: 1 slice is done/);
  const log = (s) => p.edit(DIR + 'LOG.md', (md) => md.replace(/\n## Reports[\s\S]*$/, '') + `\n## Reports\n${s}\n`);
  log('### 1 confirm\n**Did:** patients can confirm from the reminder.\n**Try:** soon');
  assert.match(p.gate(5, 'no-show')['5.18'].detail, /names nothing to open/);
  log('### 1 confirm\n**Did:** patients can confirm from the reminder.\n**How:** one link in the message.\n**Try:** http://localhost:3000/confirm\n**Next:** the flagged list.\n**Need from you:** nothing');
  assert.equal(p.gate(5, 'no-show')['5.18'].status, 'pass');
  p.edit(DIR + 'BRIEF.md', (md) => md.replace(/\*\*Building:\*\* \{[^\n]*\n\*\*Why:\*\* \{[^\n]*\n\*\*For:\*\* \{[^\n]*\n\*\*Done when:\*\* \{[^\n]*\n\*\*Not:\*\* \{[^\n]*\n/, THREAD + INTENT));
  p.run('page');
  const html = p.read('.builderos/index.html');
  assert.match(html, /<dt>Done when<\/dt><dd>I open one page on Monday and the week is there<\/dd>/);
  assert.match(html, /<dt>Not<\/dt><dd>a reporting suite<\/dd>/);
  assert.match(html, /<dt>Last<\/dt><dd>1 confirm: patients can confirm from the reminder\. Try: http:\/\/localhost:3000\/confirm<\/dd>/);
  assert.match(p.read('.builderos/STATUS.md'), /  - Last: 1 confirm: patients can confirm/);
});
