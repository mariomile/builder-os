import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

// A round has one dry shape everywhere it is written: the thesis first, each question with options and a one-clause recommendation, the count of what is left last.
const REPO = new URL('../..', import.meta.url).pathname;
const read = (f) => fs.readFileSync(path.join(REPO, f), 'utf8');
const skill = read('skills/pressure-testing/SKILL.md');
const fences = (s) => [...s.matchAll(/```markdown\n([\s\S]*?)```/g)].map((m) => m[1]);
const questions = (block) => block.split(/^---$/m).filter((q) => q.includes('❓'));

function walk(dir) {
  return fs.readdirSync(path.join(REPO, dir), { withFileTypes: true }).flatMap((e) => {
    const rel = path.join(dir, e.name);
    return e.isDirectory() ? walk(rel) : rel.endsWith('.md') ? [rel] : [];
  });
}

test('the round template opens with the thesis, asks at most four questions and closes with what is left', () => {
  const round = fences(skill).find((b) => b.includes('❓'));
  assert.ok(round, 'pressure-testing: no round template');
  const lines = round.trim().split('\n');
  assert.match(lines[0], /^🎯 \*\*Thesis:\*\* .+; it rests on .+\. Correct me if I misread it\.$/);
  assert.match(lines.at(-2), /^📍 .*decided · .*open · .*deferred · next: /);
  assert.match(lines.at(-1), /^✍️ .*go with the recommendations/);
  assert.match(round, /❓ \*\*Q\{n\} · /, 'the template numbers from where the last round stopped, not from Q1');
  assert.match(skill, /Numbers run on across rounds and sessions/, 'pressure-testing: numbering across rounds and sessions');
  const qs = questions(round);
  assert.ok(qs.length >= 1 && qs.length <= 4, `${qs.length} questions in the template`);
});

test('a decision question lists two to four options, each with its consequence, and one recommendation in one clause', () => {
  const blocks = [skill, read('skills/pressure-testing/references/round-formats.md'), read('skills/domain-model/references/domain-method.md')].flatMap(fences);
  let decisions = 0;
  for (const q of blocks.flatMap(questions)) {
    const options = q.split('\n').filter((l) => /^- \*\*[A-D]\*\* /.test(l));
    if (!options.length) {
      assert.ok(!q.includes('➡️'), `a recommendation without options:\n${q}`);
      continue;
    }
    decisions++;
    assert.ok(options.length >= 2 && options.length <= 4, `${options.length} options:\n${q}`);
    for (const o of options) assert.match(o, / → \S/, `option without its consequence: ${o}`);
    const rec = q.split('\n').filter((l) => l.startsWith('➡️'));
    assert.equal(rec.length, 1, `one recommendation per question:\n${q}`);
    assert.match(rec[0], /^➡️ \*\*\{?[A-D]\}?\*\*: [^.]+\.$/, `recommendation is one clause: ${rec[0]}`);
  }
  assert.ok(decisions >= 2, 'the templates show decision questions');
});

test('a fact only the person holds is one plain line, with no options to guess from', () => {
  const plain = fences(read('skills/pressure-testing/references/round-formats.md')).flatMap(questions).filter((q) => !q.includes('- **A**'));
  assert.ok(plain.length >= 1, 'round-formats shows a plain fact question');
  for (const q of plain) assert.equal(q.trim().split('\n').length, 2, `a title and one line:\n${q}`);
});

test('no round in the skills, references or README keeps the old recommendation line', () => {
  const files = [...walk('skills'), ...walk('references'), 'README.md'];
  for (const f of files) assert.ok(!/→ Recommended:/.test(read(f)), `${f}: old "→ Recommended:" line; use ➡️ **X**: {reason}`);
});

test('pressure-testing stays lean: the trim does not grow back', () => {
  const words = skill.replace(/^---\n[\s\S]*?\n---\n/, '').split(/\s+/).filter(Boolean).length;
  assert.ok(words <= 1200, `pressure-testing is ${words} words, ceiling 1200; disclose detail into references/`);
});

test('sessions share a question log, and a contradiction with an earlier answer is asked first, both quoted', () => {
  const formats = read('skills/pressure-testing/references/round-formats.md');
  assert.match(skill, /\*\*question log\*\*/, 'pressure-testing: the question log');
  assert.match(skill, /\*\*contradicts\*\*[^.]*next round's first question/, 'pressure-testing: contradictions open the next round');
  const log = fences(formats).find((b) => b.startsWith('# Question log'));
  assert.ok(log, 'round-formats: a question log template');
  assert.match(log, /^\| Q \| Question \| Answer \| By, date \| Rests on \| Status \|$/m);
  assert.match(log, /superseded by Q\d+/, 'a replaced answer stays, marked superseded');
  assert.match(log, /open, from Q\d+/, 'a branch an answer opened names where it came from');
  const contradiction = fences(formats).flatMap(questions).find((q) => q.includes('⚠️ Contradicts Q'));
  assert.ok(contradiction, 'round-formats: a contradiction question');
  assert.match(contradiction, /Q\d+ \(\d{4}-\d{2}-\d{2}\): .+\. Today: /, 'both answers quoted, the earlier with its date');
  assert.match(read('references/builderos-state-schema.md'), /grilling\.md/, 'the state schema lists the question log');
});
