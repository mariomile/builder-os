// The numbers the README and the architecture page state are read from the repository, so they cannot drift:
// skills, capabilities, behavioral scenarios, and the script commands the session-start hook lists.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const read = (f) => fs.readFileSync(path.join(REPO, f), 'utf8');

const skills = fs.readdirSync(path.join(REPO, 'skills')).filter((d) => fs.existsSync(path.join(REPO, 'skills', d, 'SKILL.md'))).length;
const map = read('references/capability-map.md');
const table = map.slice(map.indexOf('## The Capabilities'), map.indexOf('\n## ', map.indexOf('## The Capabilities') + 5));
const capabilities = table.split('\n').filter((l) => /^\|\s*`/.test(l)).length;
const scenarios = fs.readdirSync(path.join(REPO, 'tests/scenarios/cases')).filter((f) => f.endsWith('.json')).length;

test('the README states the real number of skills, capabilities and scenarios', () => {
  const readme = read('README.md');
  assert.match(readme, new RegExp(`\\*\\*${skills} skills\\.\\*\\*`), `skills/ holds ${skills}`);
  assert.match(readme, new RegExp(`The ${capabilities} capabilities`), `the capability map lists ${capabilities}`);
  assert.match(readme, new RegExp(`${scenarios} behavioral scenarios`), `tests/scenarios/cases holds ${scenarios}`);
  assert.doesNotMatch(readme, /\b\d+ Node tests\b/, 'a test count goes stale on the next test; say the tests pass');
});

test('the architecture page counts the capabilities the map lists', () => {
  assert.match(read('docs/architecture.md'), new RegExp(`${capabilities} named capabilities`));
});

test('the session-start hook names every command the script takes', () => {
  const script = read('scripts/bos.mjs');
  const commands = [...script.matchAll(/cmd === '([a-z-]+)'/g)].map((m) => m[1]).filter((c) => !['guard', 'context'].includes(c));
  const listed = (read('hooks/session-start').match(/subcommands \(([^)]+)\)/) || [])[1] || '';
  const names = listed.split(',').map((x) => x.trim());
  const missing = [...new Set(commands)].filter((c) => !names.includes(c));
  assert.deepEqual(missing, [], `hooks/session-start does not list: ${missing.join(', ')}`);
});
