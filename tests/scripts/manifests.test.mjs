// Host-adapter checks that need no host: manifests agree, commands survive Codex's import.
// Run: pnpm test
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const json = (f) => JSON.parse(fs.readFileSync(path.join(REPO, f), 'utf8'));

test('every manifest carries the package version', () => {
  const v = json('package.json').version;
  assert.equal(json('.claude-plugin/plugin.json').version, v);
  assert.equal(json('.codex-plugin/plugin.json').version, v);
  assert.equal(json('.claude-plugin/marketplace.json').plugins[0].version, v);
});

test('the Codex manifest does not switch off the session-start hook', () => {
  // Codex 0.157.1 discovers hooks/hooks.json on its own; an empty `hooks` object replaces it with nothing.
  const m = json('.codex-plugin/plugin.json');
  assert.ok(!('hooks' in m) || (typeof m.hooks === 'string' && m.hooks.length > 0), 'drop `hooks` or point it at hooks/hooks.json');
  assert.equal(m.skills, './skills/');
});

test('every command is small enough for Codex to import it as a skill', () => {
  // Codex 0.157.1 turns commands/*.md into skills and silently drops a file over 3875 bytes.
  // 3800 leaves room; procedure belongs in the skill anyway.
  for (const f of fs.readdirSync(path.join(REPO, 'commands'))) {
    const bytes = fs.statSync(path.join(REPO, 'commands', f)).size;
    assert.ok(bytes <= 3800, `commands/${f} is ${bytes} bytes`);
  }
});


test('Claude command targets are namespaced and mapped to installed profiles', () => {
  const profiles = new Set(fs.readdirSync(path.join(REPO, 'agents')).map(f => f.replace(/\.md$/, '')));
  for (const f of fs.readdirSync(path.join(REPO, 'commands'))) {
    const content = fs.readFileSync(path.join(REPO, 'commands', f), 'utf8');
    assert.ok(!/\/bos(?:-|[\s`])/.test(content), `${f}: unqualified plugin command`);
    assert.ok(!/subagent_type:\s*"(?!builder-os:)/.test(content), `${f}: unqualified plugin agent`);
    for (const match of content.matchAll(/`builder-os:([^`]+)`/g)) {
      if (!match[1].startsWith('bos')) assert.ok(profiles.has(match[1]), `${f}: unknown profile ${match[1]}`);
    }
    assert.ok(!content.includes('scripts/builder-os:'), `${f}: namespace must not modify script paths`);
    if (/Dispatch/i.test(content)) {
      assert.ok(content.includes('run_in_background: false'), `${f}: no foreground contract`);
      assert.ok(content.includes('await completion'), `${f}: no await contract`);
      assert.ok(content.includes('subagent.dispatch') && content.includes('inline'), `${f}: no runtime fallback`);
    }
  }
});
