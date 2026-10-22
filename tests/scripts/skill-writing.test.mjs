// The writing standard for skills, checked: descriptions that trigger, steps that end, positive phrasing, no sediment.
// Run: pnpm test
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const SKILLS = path.join(REPO, 'skills');

// Skills that are consulted, not run: flat reference, no ordered steps of their own.
const REFERENCE = new Set(['evidence-ledger', 'pressure-testing']);

// Lines copied across skills before the rewrite; operating-modes.md now holds each meaning once.
const BOILERPLATE = [
  'Lifecycle artifact paths, gates and state writes below apply only',
  'Follow [operating modes and resource paths]',
  'Delegate when available and authorized',
  'Delegate where the host allows',
  'delegate where the host allows',
  'Run in order. Delegate',
  'Ask what remains per the `pressure-testing` rounds: every question lists',
];

const NEGATION = /\b(never|do not|don't|must not|avoid|cannot)\b/gi;
const NEGATION_CEILING = 40;
const MAX_LINES = 300;
const MAX_WORDS = 1700;
const MAX_DESCRIPTION = 250;

const skills = fs.readdirSync(SKILLS).filter(d => fs.existsSync(path.join(SKILLS, d, 'SKILL.md'))).map(name => {
  const file = path.join(SKILLS, name, 'SKILL.md');
  const text = fs.readFileSync(file, 'utf8');
  const fm = text.match(/^---\n([\s\S]*?)\n---\n/);
  const front = fm ? fm[1] : '';
  const get = (k) => (front.match(new RegExp(`^${k}:\\s*"?(.*?)"?\\s*$`, 'm')) || [])[1] || '';
  return { name, file, text, body: fm ? text.slice(fm[0].length) : text, front: { name: get('name'), description: get('description'), userInvoked: /^disable-model-invocation:\s*true/m.test(front) } };
});

const section = (body, heading) => {
  const start = body.search(new RegExp(`^## ${heading}\\b.*$`, 'm'));
  if (start < 0) return null;
  const rest = body.slice(start).split('\n').slice(1).join('\n');
  const next = rest.search(/^## /m);
  return next < 0 ? rest : rest.slice(0, next);
};

test('every skill names itself after its folder and carries a description', () => {
  for (const s of skills) {
    assert.equal(s.front.name, s.name, `${s.name}: frontmatter name`);
    assert.ok(s.front.description.length > 0, `${s.name}: description`);
  }
});

test('descriptions are short pointers: what it does, then when to use it', () => {
  for (const s of skills) {
    const d = s.front.description;
    assert.ok(d.length <= MAX_DESCRIPTION, `${s.name}: description is ${d.length} chars, ceiling ${MAX_DESCRIPTION}`);
    if (s.front.userInvoked) assert.ok(!/Use when/.test(d), `${s.name}: a user-invoked skill has a human-facing one-liner, no trigger list`);
    else assert.match(d, /Use when /, `${s.name}: a model-invoked description says when to use it`);
  }
});

test('skills stay legible: under the line and word ceilings, reference disclosed behind pointers', () => {
  for (const s of skills) {
    const lines = s.text.split('\n').length;
    const words = s.body.split(/\s+/).filter(Boolean).length;
    assert.ok(lines <= MAX_LINES, `${s.name}: ${lines} lines`);
    assert.ok(words <= MAX_WORDS, `${s.name}: ${words} words, ceiling ${MAX_WORDS}; disclose reference into references/`);
  }
});

test('shared rules live once, in operating-modes.md, not copied into each skill', () => {
  for (const s of skills) {
    for (const phrase of BOILERPLATE) assert.ok(!s.text.includes(phrase), `${s.name}: copied boilerplate "${phrase}"`);
    const pointers = (s.text.match(/operating-modes\.md/g) || []).length;
    assert.ok(pointers <= 1, `${s.name}: points at operating-modes.md ${pointers} times`);
  }
});

test('every skill that drives work has a Procedure whose steps each end on a completion criterion', () => {
  for (const s of skills) {
    if (REFERENCE.has(s.name)) continue;
    const proc = section(s.body, 'Procedure');
    assert.ok(proc !== null, `${s.name}: no ## Procedure`);
    const steps = proc.split(/^(?=\d+[a-z]?\. )/m).filter(chunk => /^\d+[a-z]?\. /.test(chunk));
    assert.ok(steps.length > 0, `${s.name}: Procedure has no numbered steps`);
    for (const step of steps) {
      const label = step.split('\n')[0].slice(0, 60);
      assert.match(step, /Done when /, `${s.name}: step "${label}" has no "Done when"`);
    }
  }
});

test('every skill that drives work ends on an output contract with a completion marker', () => {
  for (const s of skills) {
    if (REFERENCE.has(s.name)) continue;
    const out = section(s.body, 'Output Contract');
    assert.ok(out !== null, `${s.name}: no ## Output Contract`);
    assert.match(out, /`## [A-Z][A-Z0-9 {}.'-]+`/, `${s.name}: no completion marker in the output contract`);
  }
});

test('guidance is phrased as the behavior wanted, not as a list of mistakes', () => {
  let total = 0;
  for (const s of skills) {
    assert.ok(!/\|\s*Mistake\s*\|/i.test(s.text) && !/^## Common Mistakes/m.test(s.text), `${s.name}: a mistakes table; write "Watch for" with the behavior wanted first`);
    total += (s.text.match(NEGATION) || []).length;
  }
  assert.ok(total <= NEGATION_CEILING, `${total} prohibitions across skills, ceiling ${NEGATION_CEILING}; state the target behavior instead`);
});

test('every relative link in a skill resolves', () => {
  for (const s of skills) {
    const prose = s.text.replace(/```[\s\S]*?```/g, '');
    for (const [, target] of prose.matchAll(/\]\(([^)#\s]+)(?:#[^)]*)?\)/g)) {
      if (/^[a-z]+:/i.test(target) || target.includes('{')) continue;
      const resolved = path.resolve(path.dirname(s.file), target);
      assert.ok(fs.existsSync(resolved), `${s.name}: link ${target} does not resolve`);
    }
  }
});
