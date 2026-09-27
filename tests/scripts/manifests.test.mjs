// Host-adapter checks that need no host: manifests agree, commands survive Codex's import.
// Run: npm test
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
