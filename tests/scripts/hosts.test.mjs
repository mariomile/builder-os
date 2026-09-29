// Reproduce host packaging and quoting failures without invoking a model or installing globally.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const temporaryBundle = (t) => {
  const tmp = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), 'bos-host-')));
  t.after(() => fs.rmSync(tmp, { recursive: true, force: true }));
  // Apostrophes and shell syntax test quoting as well as the common spaces case.
  const install = path.join(tmp, "Builder's OS $(touch injected)");
  const project = path.join(tmp, 'user project');
  fs.mkdirSync(install);
  fs.mkdirSync(project);
  for (const entry of ['skills', 'references', 'scripts', 'hooks', '.opencode', 'package.json']) {
    fs.cpSync(path.join(REPO, entry), path.join(install, entry), { recursive: true });
  }
  return { tmp, install, project };
};
const runHook = (install, project, overrides = {}, source = 'startup') => {
  const env = { ...process.env };
  for (const name of ['CLAUDE_PLUGIN_ROOT', 'CURSOR_PLUGIN_ROOT', 'COPILOT_CLI']) delete env[name];
  Object.assign(env, overrides);
  const result = spawnSync('bash', [path.join(install, 'hooks/run-hook.cmd'), 'session-start'], { cwd: project, env, input: JSON.stringify({ hook_event_name: 'SessionStart', source, cwd: project }), encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr);
  return JSON.parse(result.stdout);
};

test('session hook refreshes context for resume and fork, not just startup', () => {
  const config = JSON.parse(fs.readFileSync(path.join(REPO, 'hooks/hooks.json'), 'utf8'));
  const matcher = new RegExp(`^(?:${config.hooks.SessionStart[0].matcher})$`);
  for (const source of ['startup', 'resume', 'fork', 'clear', 'compact']) assert.ok(matcher.test(source), source);
  assert.equal(config.hooks.SessionStart[0].hooks[0].async, false);
});

test('a copied complete bundle survives symlink discovery outside the project', (t) => {
  const { tmp, install, project } = temporaryBundle(t);
  const discovery = path.join(tmp, 'discovery');
  fs.mkdirSync(discovery);
  const skillLink = path.join(discovery, 'builder-os');
  fs.symlinkSync(path.join(install, 'skills/builder-os'), skillLink, 'dir');
  const source = fs.realpathSync(path.join(skillLink, 'SKILL.md'));
  const root = path.resolve(path.dirname(source), '../..');
  assert.equal(root, install);
  assert.ok(fs.existsSync(path.join(root, 'references/capability-map.md')));
  assert.ok(fs.existsSync(path.join(root, 'scripts/bos.mjs')));
  assert.ok(!fs.existsSync(path.join(project, 'references')));
  const result = spawnSync(process.execPath, [path.join(root, 'scripts/bos.mjs'), 'brief'], { cwd: project, encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr);
  assert.ok(!fs.existsSync(path.join(project, '.builderos')), 'brief must not initialize a project');
});

test('hook JSON is valid for each adapter and advertises an executable quoted path', (t) => {
  const { install, project } = temporaryBundle(t);
  const cases = [
    { env: {}, context: output => output.additionalContext },
    { env: { CLAUDE_PLUGIN_ROOT: install }, context: output => {
      assert.equal(output.hookSpecificOutput.hookEventName, 'SessionStart');
      return output.hookSpecificOutput.additionalContext;
    } },
    { env: { CURSOR_PLUGIN_ROOT: install }, context: output => output.additional_context },
    { env: { CLAUDE_PLUGIN_ROOT: install, COPILOT_CLI: '1' }, context: output => output.additionalContext }
  ];
  for (const host of cases) {
    const context = host.context(runHook(install, project, host.env));
    assert.ok(context.includes(`**BuilderOS installation root:** ${install}`));
    const command = context.match(/\*\*BuilderOS script:\*\* `([^`]+)`/)[1];
    const run = spawnSync('bash', ['-c', `${command} brief`], { cwd: project, encoding: 'utf8' });
    assert.equal(run.status, 0, run.stderr);
    assert.ok(!fs.existsSync(path.join(project, 'injected')), 'installation path must not execute shell syntax');
    assert.ok(!fs.existsSync(path.join(project, '.builderos')));
  }
});

test('hook emits valid JSON even when content includes control characters', (t) => {
  const { install, project } = temporaryBundle(t);
  const bootstrap = path.join(install, 'skills/using-builder-os/SKILL.md');
  const controls = String.fromCharCode(...Array.from({ length: 31 }, (_, i) => i + 1));
  fs.appendFileSync(bootstrap, `\n${controls}\n`);
  assert.ok(runHook(install, project).additionalContext.includes(controls));
});

test('OpenCode adapter uses sibling resources and does not duplicate discovery paths', async (t) => {
  const { install, project } = temporaryBundle(t);
  const { BuilderOSPlugin } = await import(pathToFileURL(path.join(install, '.opencode/plugins/builder-os.js')).href);
  const plugin = await BuilderOSPlugin({ directory: project });
  const config = {};
  await plugin.config(config);
  await plugin.config(config);
  assert.deepEqual(config.skills.paths, [path.join(install, 'skills')]);
  const output = { messages: [{ info: { role: 'user' }, parts: [{ type: 'text', text: 'help' }] }] };
  await plugin['experimental.chat.messages.transform']({}, output);
  await plugin['experimental.chat.messages.transform']({}, output);
  assert.equal(output.messages[0].parts.length, 2);
  const context = output.messages[0].parts[0].text;
  assert.ok(context.includes(`**BuilderOS installation root:** ${install}`));
  const command = context.match(/Run the script from the user's project root: ([^\n]+)\./)[1];
  const result = spawnSync('bash', ['-c', `${command} brief`], { cwd: project, encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr);
  assert.ok(!fs.existsSync(path.join(project, 'injected')));
});


test('resume and fork brief the current project from the copied bundle', (t) => {
  const { install, project } = temporaryBundle(t);
  fs.cpSync(path.join(REPO, 'tests/fixtures/acme'), project, { recursive: true });
  for (const source of ['resume', 'fork']) {
    const output = runHook(install, project, { CLAUDE_PLUGIN_ROOT: install }, source);
    const context = output.hookSpecificOutput.additionalContext;
    assert.ok(context.includes('**Project memory briefing:**'));
    assert.ok(context.includes('Onboarding rework'));
    assert.ok(context.includes('CSV export'));
  }
});
