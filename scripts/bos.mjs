#!/usr/bin/env node
// BuilderOS project script. Node built-ins only.
// Run from the project root (the directory holding PRODUCT.md and .builderos/).
//
//   node bos.mjs brief                     session briefing, with the attention line
//   node bos.mjs gate <0-7|C> [--json]     script-decided gate conditions; the rest listed as judge
//   node bos.mjs new <slug> --title "..." --track spike|feature|product [--mode full|lite] [--reason "..."]
//                                          create an initiative with a valid state.json and make it active
//   node bos.mjs cover --c4 "reason"       feature track: run the coverage check on PRODUCT.md and, if it passes,
//                                          record phases 0 and 1 as covered and start at phase 2 (C.4 is the model's call)
//   node bos.mjs record <0-7> --judged "id=pass|fail,..." [--accepted-by "who"] [--verdict v] [--override reason] [--review-due date] [--reenter N]
//                                          write a gate result to state.json: the script's verdict plus the model's
//                                          on the judge conditions; advances, closes, or keeps the phase open.
//                                          Phases 0, 4 and 6 also need the person who accepted the artifact
//   node bos.mjs watch --note "..." (--recheck YYYY-MM-DD | --clear --breach <slug>)
//                                          roll a KEEP watch after a check without breach, or clear it when a breach
//                                          started a new initiative
//   node bos.mjs pace                      process metrics from state history and git: time per phase, failed
//                                          gates, spec rework after the plan, and phase 1 kills across initiatives
//   node bos.mjs run-check --label slug [--cwd dir] [--dataset file --results file] -- executable args...
//                                          explicitly execute an authorized check and record its command, exit and output
//   node bos.mjs defer-review --review-due YYYY-MM-DD --reason "..."
//                                          defer phase 7 without inventing an outcome verdict
//   node bos.mjs roadmap                   regenerate the Now and Done tables of ROADMAP.md
//   node bos.mjs migrate                   move a schema 1 .builderos/state.json to schema 2
//
// Options: --initiative <slug> acts on another initiative, --root <dir> sets the project root.

import fs from 'fs';
import path from 'path';
import { execFileSync, spawnSync } from 'child_process';
import { createHash } from 'crypto';
import { fileURLToPath } from 'url';

const rawArgs = process.argv.slice(2);
const separator = rawArgs.indexOf('--');
const args = separator < 0 ? rawArgs : rawArgs.slice(0, separator);
const commandArgs = separator < 0 ? [] : rawArgs.slice(separator + 1);
const opt = (name) => {
  const i = args.indexOf(name);
  return i >= 0 && args[i + 1] && !args[i + 1].startsWith('--') ? args[i + 1] : undefined;
};
const flag = (name) => args.includes(name);
const ROOT = path.resolve(opt('--root') || process.cwd());
const BOS = path.join(ROOT, '.builderos');
const INIT_DIR = path.join(BOS, 'initiatives');

const PHASES = ['Frame', 'Discover', 'Define', 'Ideate', 'Shape', 'Build', 'Ship', 'Learn'];
const PHASE_SKILLS = ['problem-framing', 'research-methods', 'opportunity-mapping', 'ideation-methods', 'spec-writing', 'delivery-discipline', 'release-ops', 'outcome-review'];
const ARTIFACTS = ['00-frame.md', '01-discovery.md', '02-definition.md', '03-solution-bet.md', '04-spec.md', '05-build-plan.md', '06-release.md', '07-outcome.md'];
const PRIMARY = new Set(['data', 'interview', 'code']);
// Transitions where a person, not the gate, decides the work goes on: the frame, the spec, the release.
// The phase 5 plan is accepted inside its artifact (gate 5.6), before the build loop starts.
const ACCEPTANCE_PHASES = [0, 4, 6];
const DAY = 86400000;

// ---------- files ----------

const read = (p) => (fs.existsSync(p) ? fs.readFileSync(p, 'utf8') : null);
const readJSON = (p) => {
  const s = read(p);
  if (s === null) return null;
  try { return JSON.parse(s); } catch { die(`${rel(p)} is not valid JSON`); }
};
const writeJSON = (p, o) => fs.writeFileSync(p, JSON.stringify(o, null, 2) + '\n');
const rel = (p) => path.relative(ROOT, p) || '.';
function die(msg) { console.error(`bos: ${msg}`); process.exit(2); }

function loadInitiatives() {
  if (!fs.existsSync(INIT_DIR)) return [];
  return fs.readdirSync(INIT_DIR, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => ({ dir: path.join(INIT_DIR, d.name), state: readJSON(path.join(INIT_DIR, d.name, 'state.json')) }))
    .filter((i) => i.state)
    .map((i) => ({ ...i, slug: i.state.slug || path.basename(i.dir) }));
}

function resolveActive(all) {
  const named = opt('--initiative');
  if (named) return all.find((i) => i.slug === named) || die(`no initiative "${named}"`);
  const local = readJSON(path.join(BOS, 'local.json'));
  const open = all.filter((i) => (i.state.status || 'open') !== 'closed');
  if (local && local.active) {
    const hit = open.find((i) => i.slug === local.active);
    if (hit) return hit;
  }
  if (open.length === 1) return open[0];
  return null;
}

// ---------- markdown ----------

function stripFences(md) {
  return md.replace(/```[\s\S]*?```/g, '');
}

// Content under the first "## {prefix}" heading, up to the next "## ".
function section(md, prefix) {
  if (!md) return null;
  const lines = md.split('\n');
  const start = lines.findIndex((l) => /^##\s/.test(l) && l.replace(/^##\s+/, '').toLowerCase().startsWith(prefix.toLowerCase()));
  if (start < 0) return null;
  const out = [];
  for (let i = start + 1; i < lines.length; i++) {
    if (/^##\s/.test(lines[i])) break;
    out.push(lines[i]);
  }
  return out.join('\n');
}
const heading = (md, prefix) => {
  const m = stripFences(md || '').split('\n').filter((l) => /^##\s/.test(l) && l.replace(/^##\s+/, '').toLowerCase().startsWith(prefix.toLowerCase()));
  return m;
};

function tableRows(text) {
  if (!text) return [];
  const rows = text.split('\n').filter((l) => /^\s*\|/.test(l));
  return rows
    .map((l) => l.trim().replace(/^\|/, '').replace(/\|$/, '').split('|').map((c) => c.trim()))
    .filter((cells, i) => i > 0 && !cells.every((c) => /^:?-{2,}:?$/.test(c) || c === ''))
    .filter((cells) => !cells.some((c) => /^\{.*\}$/.test(c)));
}

function field(text, label) {
  if (!text) return null;
  const re = new RegExp(`\\*\\*${label}:?\\*\\*:?\\s*(.*)`, 'i');
  const m = text.match(re);
  if (!m) return null;
  const v = m[1].trim();
  return v && !/^\{.*\}$/.test(v) ? v : null;
}

const TAG_RE = /\[(data|interview|doc|code|estimate|assumption):([^\]\s][^\]]*)\]/g;
function tags(text) {
  const out = [];
  if (!text) return out;
  for (const m of text.matchAll(TAG_RE)) out.push({ cls: m[1], id: m[2].trim(), raw: m[0] });
  return out;
}
const hasTag = (t, classes) => tags(t).some((x) => !classes || classes.includes(x.cls));
const DATE_RE = /\b\d{4}-\d{2}(-\d{2})?\b|\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?\s+\d{1,2}\b|\b\d{1,2}\s+(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)/i;
const nonEmpty = (v) => v !== null && v !== undefined && String(v).trim() !== '' && !/^\{.*\}$/.test(String(v).trim());

// ---------- evidence ----------

function evidenceFile(dirs, name) {
  for (const d of dirs) {
    const p = path.join(d, name);
    if (fs.existsSync(p)) return p;
  }
  return null;
}

function checkEvidence(text, dirs) {
  const missing = [];
  for (const t of tags(text)) {
    if (t.cls === 'estimate' || t.cls === 'assumption') continue;
    if (/^\.\.\.$|^…$/.test(t.id)) continue; // naming the class in prose, not citing a source
    if (/[*{}]/.test(t.id)) { missing.push(`${t.raw} (placeholder)`); continue; }
    if (t.cls === 'code') {
      const p = t.id.replace(/:\d+([-,]\d+)*$/, '');
      if (!fs.existsSync(path.join(ROOT, p)) || !fs.statSync(path.join(ROOT, p)).isFile()) missing.push(`${t.raw} (no file ${p})`);
      continue;
    }
    const ids = t.cls === 'interview' ? t.id.split(',').map((s) => s.trim()).filter(Boolean) : [t.id];
    for (const id of ids) {
      const name = id.replace(/[:/]/g, '-') + '.md';
      const f = evidenceFile(dirs, name);
      if (!f) missing.push(`${t.raw} (no evidence/${name})`);
      else if (read(f).replace(/^#.*$/m, '').replace(/\*\*[^*]+\*\*.*$/gm, '').trim().length < 20) missing.push(`${t.raw} (evidence/${name} holds no raw material)`);
    }
  }
  return [...new Set(missing)];
}

function audit(text) {
  const lines = stripFences(text || '').split('\n');
  const untagged = lines.filter((l) => {
    if (/^\s*(#|\|?\s*-{3,}|\*\*(date|captured|owner|phase|status)\b)/i.test(l)) return false;
    if (/^\s*\|/.test(l)) return false;
    const numeric = /\d+(\.\d+)?\s*%|\b\d{2,}\b|\b(most|many|majority|rapidly|significant(ly)?)\b/i.test(l.replace(DATE_RE, ''));
    return numeric && !hasTag(l);
  });
  const all = tags(text);
  const units = new Map();
  for (const t of all) units.set(`${t.cls}:${t.id}`, t);
  const primary = [...units.values()].filter((t) => PRIMARY.has(t.cls));
  const assumptions = [...units.values()].filter((t) => t.cls === 'assumption' || t.cls === 'estimate');
  return {
    tagged_units: units.size,
    primary_units: primary.length,
    assumption_ratio: units.size ? Math.round((assumptions.length / units.size) * 100) : 0,
    untagged: untagged.map((l) => l.trim()).slice(0, 10),
    untagged_count: untagged.length,
  };
}

// ---------- gates ----------

// The list in gate-checks, condition 0.1. Terms PRODUCT.md defines under ## Language are the product's own
// nouns ("AI answer engine" for a product that monitors them), so they are removed before the check.
const SOLUTION_WORDS = /\b(build|builds|add|adds|create|creates|app|apps|platform|platforms|dashboard|dashboards|tool|tools|feature|features|integration|integrations|automate|automates|automation|redesign|migrate|rewrite)\b/i;
const SOLUTION_AI = /\bAI\b/; // case-sensitive: "ai" is an Italian preposition

function languageTerms(product) {
  const terms = [];
  for (const r of tableRows(section(product || '', 'Language'))) {
    const t = (r[0] || '').replace(/[`*]/g, '').trim();
    if (!t) continue;
    const abbr = t.match(/\(([^)]+)\)/);
    terms.push(t.replace(/\s*\([^)]*\)/, '').trim());
    if (abbr) terms.push(abbr[1].trim());
  }
  return terms.filter(Boolean).sort((a, b) => b.length - a.length);
}

function solutionWord(statement, product) {
  let s = statement || '';
  for (const t of languageTerms(product)) s = s.replace(new RegExp(`\\b${t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}s?\\b`, 'gi'), ' ');
  return s.match(SOLUTION_WORDS) || s.match(SOLUTION_AI);
}

function firstParagraph(text) {
  return (text || '').split(/\n\s*\n/).map((p) => p.trim()).find((p) => p && !p.startsWith('**')) || '';
}

function gate(n, ctx) {
  const R = [];
  const pass = (id, ok, detail) => R.push({ id, status: ok ? 'pass' : 'fail', detail });
  const judge = (id, detail) => R.push({ id, status: 'judge', detail });
  const warn = (id, ok, detail) => R.push({ id, status: ok ? 'pass' : 'warn', detail });
  const skip = (id, detail) => R.push({ id, status: 'skip', detail });
  const a = ctx.artifact;
  const lite = ctx.mode === 'lite';

  if (n === 'C') {
    const prob = section(a, 'The Problem');
    const statement = firstParagraph(prob);
    const hit = solutionWord(statement, a);
    pass('C.1', prob && !hit, hit ? `solution word "${hit[0]}" in The Problem` : prob ? 'no solution language' : 'no "## The Problem" section');
    const icp = section(a, 'ICP');
    const rows = tableRows(icp);
    const seg = rows.find((r) => /segment/i.test(r[0]));
    const size = rows.find((r) => /size/i.test(r[0]));
    pass('C.2', seg && nonEmpty(seg[1]) && size && hasTag(size[1]), seg ? (size && hasTag(size[1]) ? `primary segment: ${seg[1]}` : 'primary size carries no tag') : 'no primary segment in the ICP table');
    const parts = { 'The Problem': statement, 'Who has it': field(prob, 'Who has it'), 'What that costs them': field(prob, 'What that costs them') };
    const bad = Object.entries(parts).filter(([, t]) => !t || !hasTag(t, ['data', 'interview', 'code', 'doc']) || hasTag(t, ['assumption']));
    pass('C.3', bad.length === 0, bad.length ? `no primary-source tag on: ${bad.map(([k]) => k).join(', ')}` : 'all three evidenced');
    judge('C.4', 'does the request address the evidenced problem, for this ICP?');
    return R;
  }

  if (n === 0) {
    const prob = section(a, 'Problem');
    const hit = solutionWord(firstParagraph(prob), ctx.product);
    pass('0.1', prob && !hit, hit ? `solution word "${hit[0]}" in the problem` : prob ? 'no solution language' : 'no "## Problem" section');
    const who = section(a, 'Who') || '';
    const icps = who.split('\n').filter((l) => /primary icp/i.test(l));
    pass('0.2', icps.length === 1 && hasTag(icps[0]), icps.length !== 1 ? `${icps.length} primary ICP lines` : hasTag(icps[0]) ? 'one primary ICP, tagged' : 'primary ICP size carries no tag');
    judge('0.3', nonEmpty(field(section(a, 'Riskiest assumption'), 'Would be falsified by')) ? 'falsifier present; is it an observation?' : 'no "Would be falsified by" line');
    const why = section(a, 'Why now');
    judge('0.4', why && hasTag(why) && DATE_RE.test(why) ? 'dated and tagged; is it a change in the world?' : 'why now lacks a date or a tag');
    return R;
  }

  if (n === 1) {
    const units = new Map();
    for (const t of tags(a)) units.set(`${t.cls}:${t.id}`, t);
    const list = [...units.values()];
    const strict = list.filter((t) => PRIMARY.has(t.cls));
    const withDoc = list.filter((t) => PRIMARY.has(t.cls) || t.cls === 'doc');
    const sourcesOf = (ts) => new Set(ts.flatMap((t) => {
      if (t.cls === 'code') { const name = path.resolve(ROOT, t.id.replace(/:\d+([-,]\d+)*$/, '')); return [`code:${fs.existsSync(name) ? fs.realpathSync(name) : name}`]; }
      if (t.cls === 'interview') return t.id.split(',').map((id) => `interview:${id.trim()}`);
      const file = evidenceFile([path.join(ctx.dir, 'evidence'), path.join(BOS, 'evidence')], t.id.replace(/[:/]/g, '-') + '.md');
      const identity = field(file ? read(file) : '', 'Source identity');
      return [identity ? `source:${identity}` : `${t.cls}:${t.id}`];
    }));
    if (strict.length >= 5) pass('1.1', true, `${strict.length} primary units`);
    else if (withDoc.length >= 5) judge('1.1', `${strict.length} primary units, ${withDoc.length} counting doc; confirm those doc sources are records of primary contact`);
    else pass('1.1', false, `${withDoc.length} primary units, 5 needed`);
    const s1 = sourcesOf(strict).size, s2 = sourcesOf(withDoc).size;
    if (s1 >= 5) pass('1.2', true, `${s1} distinct sources`);
    else if (s2 >= 5) judge('1.2', `${s1} distinct primary sources, ${s2} counting doc`);
    else pass('1.2', false, `${s2} distinct sources, 5 needed`);
    const v = section(a, 'Verdict') || '';
    const verdicts = ['VALIDATED', 'KILLED', 'RESHAPED'].filter((w) => new RegExp(`\\b${w}\\b`).test(v));
    pass('1.3', verdicts.length === 1 && hasTag(v), verdicts.length !== 1 ? `${verdicts.length} verdicts found` : hasTag(v) ? verdicts[0] : 'verdict reasoning cites no tag');
    pass('1.4', /when\s.+?,\s*i want to\s.+?,\s*so (that )?i can\s.+/i.test(section(a, 'JTBD') || ''), 'JTBD in the form When / I want to / so I can');
    const dis = section(a, 'Disconfirming');
    judge('1.5', nonEmpty(field(dis, 'Sought')) && nonEmpty(field(dis, 'Found')) ? 'sought and found present; was it really looked for?' : 'Sought or Found missing');
    return R;
  }

  if (n === 2) {
    const opps = tableRows(section(a, 'Opportunity tree'));
    const need = lite ? 2 : 3;
    const prior = (ctx.discovery || '') + '\n' + (ctx.track === 'feature' ? ctx.product || '' : '');
    const priorTags = new Set(tags(prior).map((t) => t.raw));
    const untraced = opps.filter((r) => !tags(r[1] || '').some((t) => priorTags.has(t.raw)));
    pass('2.1', opps.length >= need && untraced.length === 0, opps.length < need ? `${opps.length} opportunities, ${need} needed` : untraced.length ? `not traceable to phase 1 evidence: ${untraced.map((r) => r[0]).join(', ')}` : `${opps.length} opportunities, all traced`);
    const sel = heading(a, 'Selected');
    const rej = tableRows(section(a, 'Rejected')).filter((r) => nonEmpty(r[1]));
    pass('2.2', sel.length === 1 && rej.length >= opps.length - 1, sel.length !== 1 ? `${sel.length} selected` : `${rej.length} rejections with a reason for ${opps.length - 1} others`);
    const sm = section(a, 'Success metric') || '';
    const base = field(sm, 'Baseline'), target = field(sm, 'Target');
    const zero = base && /^0\b/.test(base) && ctx.track === 'product' && /^no$/i.test(field(sm, 'Product exists') || '') && nonEmpty(field(sm, 'Zero rationale')) && validDate(field(sm, 'First measurement'));
    pass('2.3', nonEmpty(field(sm, 'Metric')) && base && (hasTag(base) || zero) && target && /\d/.test(target) && DATE_RE.test(target), 'metric, tagged baseline, target with a value and a date');
    if (zero && !hasTag(base, ['data', 'code', 'doc'])) judge('2.4', 'declared non-existent product and zero rationale; confirm this metric is necessarily zero before existence');
    else pass('2.4', base && hasTag(base, ['data', 'code', 'doc']), base ? `baseline tag: ${tags(base).map((t) => t.cls).join(', ') || 'none; unavailable is not zero'}` : 'no baseline');
    judge('2.5', 'is the opportunity coherent with the PMF stage?');
    judge('2.6', 'could shipping the change alone hit the target? then the metric is output, not outcome');
    return R;
  }

  if (n === 3) {
    const opts = tableRows(section(a, 'Options'));
    const actions = new Set(opts.map((r) => (r[2] || '').toLowerCase()).filter(Boolean));
    judge('3.1', `${opts.length} options, ${actions.size} distinct primary actions stated (${lite ? 2 : 3} needed); are they mechanically distinct?`);
    const kc = section(a, 'Kill criteria') || '';
    pass('3.2', DATE_RE.test(kc) && /\d/.test(kc.replace(DATE_RE, '')) && nonEmpty(field(kc, 'Measured by')), 'metric, threshold, date and measurement');
    const ct = section(a, 'Cheapest test') || '';
    const tc = (ct.match(/\*\*Test cost:\*\*\s*([\d.]+)/i) || [])[1];
    const bc = (ct.match(/\*\*Build cost:\*\*\s*([\d.]+)/i) || [])[1];
    pass('3.3', tc !== undefined, tc !== undefined ? `test costs ${tc} days` : 'no test cost in days');
    if (tc !== undefined && bc !== undefined && Number(bc) > 0) {
      const ratio = Number(tc) / Number(bc);
      const order = field(ct, 'Order') || '';
      pass('3.4', ratio >= 0.2 || /test first|override/i.test(order), `ratio ${Math.round(ratio * 100)}%, order: ${order || 'missing'}`);
    } else pass('3.4', false, 'test cost or build cost missing');
    return R;
  }

  if (n === 4) {
    const acs = tableRows(section(a, 'Acceptance criteria'));
    judge('4.1', `${acs.length} criteria; is each a testable assertion (adjective test)?`);
    const oos = tableRows(section(a, 'Out of scope')).filter((r) => nonEmpty(r[0]));
    pass('4.2', oos.length > 0, `${oos.length} out-of-scope items`);
    const states = tableRows(section(a, 'States'));
    const holes = states.filter((r) => !nonEmpty(r[1]) || !nonEmpty(r[4]));
    pass('4.3', states.length > 0 && holes.length === 0, states.length === 0 ? 'no states table' : holes.length ? `empty or error state missing for: ${holes.map((r) => r[0]).join(', ')}` : `${states.length} flows, empty and error states enumerated`);
    const tp = section(a, 'Tracking plan');
    judge('4.4', tableRows(tp).length && nonEmpty(field(tp, 'Computes the phase 2 metric')) ? 'events listed; do they compute the phase 2 metric?' : 'tracking plan or its computation line missing');
    const both = (a || '') + '\n' + (ctx.design || '');
    const a11y = ['keyboard', 'contrast', 'focus'].filter((w) => !new RegExp(w, 'i').test(both));
    (lite ? warn : pass)('4.5', a11y.length === 0, a11y.length ? `missing: ${a11y.join(', ')}` : 'keyboard, contrast, focus stated');
    const modelOut = /\*\*Model output:\*\*\s*yes/i.test(a || '');
    if (!modelOut) skip('4.6', 'no model output declared');
    else {
      const ev = evalInfo(ctx);
      const need = lite ? 10 : 20;
      pass('4.6', ev.valid && ev.cases >= need && ev.threshold !== null && ev.judge && ev.mustPass, `${ev.cases} valid cases (${need} needed), threshold ${ev.threshold ?? 'missing'}, judge ${ev.judge ? 'named' : 'missing'}, must-pass ${ev.mustPass ? 'named' : 'missing'}${ev.error ? '; ' + ev.error : ''}`);
    }
    const conflicts = section(a, 'Conflicts');
    // Raw rows: tableRows drops rows holding a {placeholder}, which would hide an unfilled Decides cell.
    const conflictRows = (conflicts || '').split('\n').filter((l) => /^\s*\|/.test(l)).slice(1)
      .map((l) => l.trim().replace(/^\|/, '').replace(/\|$/, '').split('|').map((c) => c.trim()))
      .filter((r) => !r.every((c) => /^:?-{2,}:?$/.test(c) || c === '') && nonEmpty(r[0]));
    const unowned = conflictRows.filter((r) => !nonEmpty(r[3]));
    pass('4.7', conflicts !== null && unowned.length === 0, conflicts === null ? 'no "## Conflicts" section: state the constraint conflicts found, or that none were' : unowned.length ? `conflicts with nobody deciding: ${unowned.map((r) => r[0]).join(', ')}` : `${conflictRows.length} conflicts, each with who decides`);
    return R;
  }

  if (n === 5) {
    const plan = section(a, 'Plan') || '';
    const accepted = field(plan, 'Accepted') || '';
    const acceptedAt = (accepted.match(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2}(?:\.\d{3})?)?(?:Z|[+-]\d{2}:\d{2})/) || [])[0];
    const sliceHeader = ((section(a, 'Slices') || '').split('\n').find((l) => /^\s*\|/.test(l)) || '');
    const risks = tableRows(section(a, 'Risks')).filter((r) => nonEmpty(r[0]));
    const planGaps = [
      !(validTimestamp(acceptedAt) && Date.parse(acceptedAt) <= Date.now() && accepted.replace(acceptedAt, '').replace(/[·\s]/g, '').length > 1) && 'Accepted needs who and an actual ISO timestamp',
      !/\|\s*files?\b/i.test(sliceHeader) && 'the Slices table has no Files column',
      !risks.length && 'no Risks rows',
    ].filter(Boolean);
    pass('5.6', planGaps.length === 0, planGaps.length ? planGaps.join('; ') : `plan accepted ${acceptedAt}, slices name their files, ${risks.length} risks`);
    judge('5.7', 'was the plan accepted before implementation started, and does the final diff match it (or was the plan updated with the deviation)?');
    const specAC = tableRows(section(ctx.spec, 'Acceptance criteria')).map((r) => r[0]).filter((x) => /^\d+$/.test(x));
    const map = tableRows(section(a, 'Acceptance criteria to tests'));
    const NO_TEST = /^\W*(no test|none|n\/?a|not tested|untested|[-—–]+)\b|^\W*\*\*no test/i;
    const validMappings = map.filter((r) => nonEmpty(r[2]) && !NO_TEST.test(r[2]) && mappedTestFile(r[2]));
    const mapped = new Set(validMappings.map((r) => r[0]));
    const unmapped = specAC.filter((x) => !mapped.has(x));
    pass('5.1', specAC.length > 0 && unmapped.length === 0, specAC.length === 0 ? 'no numbered criteria in 04-spec.md' : unmapped.length ? `missing or nonexistent mapped tests: ${unmapped.join(', ')}` : `${specAC.length} criteria mapped to existing test files`);
    const outSec = section(a, 'Test output');
    const failing = map.filter((r) => !/^pass\b/i.test(r[3] || ''));
    const run = runEvidence(outSec, ctx);
    if (!run.valid || failing.length) pass('5.2', false, failing.length ? `not passing: ${failing.map((r) => r[0]).join(', ')}` : run.detail);
    else judge('5.2', `${run.detail}; confirm the recorded command/output covers every mapped test and the current implementation`);
    const inst = tableRows(section(a, 'Instrumentation'));
    const unverified = inst.filter((r) => !/^yes/i.test(r[2] || '') || !hasTag(r[4] || '', ['data', 'code']));
    pass('5.3', inst.length > 0 && unverified.length === 0, inst.length === 0 ? 'no instrumentation rows' : unverified.length ? `unverified: ${unverified.map((r) => r[0]).join(', ')}` : `${inst.length} events verified`);
    const scope = tableRows(section(a, 'Scope check'));
    const oos = tableRows(section(ctx.spec, 'Out of scope')).filter((r) => nonEmpty(r[0]));
    const built = scope.filter((r) => !/^no\b/i.test(r[1] || ''));
    pass('5.4', scope.length >= oos.length && built.length === 0, built.length ? `built: ${built.map((r) => r[0]).join(', ')}` : `${scope.length} of ${oos.length} out-of-scope items checked`);
    const modelOut = /\*\*Model output:\*\*\s*yes/i.test(ctx.spec || '');
    if (!modelOut) skip('5.5', 'no model output declared');
    else {
      const ev = evalInfo(ctx);
      const results = evalResults(section(a, 'Eval results'), ctx, ev);
      if (!results.valid) pass('5.5', false, results.detail);
      else judge('5.5', `${results.detail}; confirm the recorded eval command used this dataset, rubric and current implementation`);
    }
    return R;
  }

  if (n === 6) {
    const rb = section(a, 'Rollback') || '';
    judge('6.1', ['Mechanism', 'Owner', 'Tested'].every((k) => nonEmpty(field(rb, k))) && DATE_RE.test(field(rb, 'Tested') || '') ? 'mechanism, owner and a dated test present; was it really tested?' : 'mechanism, owner or dated test missing');
    const bh = heading(a, 'Baseline')[0] || '';
    const ts = bh.match(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2}(?:\.\d{3})?)?(?:Z|[+-]\d{2}:\d{2})/g) || [];
    const brows = tableRows(section(a, 'Baseline')).filter((r) => nonEmpty(r[1]));
    const exposure = section(a, 'Exposure verification');
    const exposed = field(exposure, 'Exposed at');
    pass('6.2', ts.length >= 1 && validTimestamp(ts[0]) && validTimestamp(exposed) && Date.parse(ts[0]) < Date.parse(exposed) && brows.length > 0, `baseline captured ${ts[0] || 'missing'}, actual exposure ${exposed || 'missing'}`);
    const observed = field(exposure, 'Verification');
    pass('6.6', /^verified$/i.test(field(exposure, 'Status') || '') && validTimestamp(exposed) && Date.parse(exposed) <= Date.now() && nonEmpty(field(exposure, 'Environment')) && nonEmpty(field(exposure, 'Version')) && observed && hasTag(observed, ['data', 'doc']) && observed.replace(TAG_RE, '').trim().length > 10, 'verified exposure requires actual non-future timestamp, environment, version and observed result with data/doc evidence');
    judge('6.7', 'does the exposure evidence demonstrate the intended behavior available to users in the stated environment/version?');
    pass('6.3', nonEmpty(field(section(a, 'Measurement'), 'Success metric measured by')), 'named query or dashboard');
    judge('6.4', `are the release notes written for users, not a commit list?${lite ? ' (lite: a fail is a warning)' : ''}`);
    const orv = section(a, 'Outcome review') || '';
    const reviewDate = (field(orv, 'Date') || '').match(/^\d{4}-\d{2}-\d{2}/)?.[0];
    pass('6.5', /\*\*Owner:\*\*\s*[^·{]+\S/.test(orv) && validDate(reviewDate), 'owner and valid review Date');
    pass('6.8', nonEmpty(field(exposure, 'Authorized by')), 'Exposure verification names who authorized exposure');
    return R;
  }

  if (n === 7) {
    const rows = tableRows(section(a, 'Measured'));
    const r0 = rows[0] || [];
    pass('7.1', rows.length > 0 && nonEmpty(r0[1]) && nonEmpty(r0[2]) && nonEmpty(r0[3]) && hasTag(r0[5] || ''), 'baseline, actual, target and tag on the success metric');
    const kc = section(a, 'Against kill criteria') || '';
    pass('7.2', /\b(cleared|triggered)\b/i.test(field(kc, 'Verdict') || ''), 'kill criteria verdict');
    const dh = heading(a, 'Decision')[0] || '';
    const d = ['KEEP', 'ITERATE', 'KILL'].filter((w) => new RegExp(`\\b${w}\\b`).test(dh));
    const reentry = field(section(a, 'Decision'), 'Re-enters at') || '';
    const validReentry = d[0] === 'KILL' ? /^none$/i.test(reentry) : d[0] === 'ITERATE' ? /^phase [0-6]$/i.test(reentry) : /^(none|phase [0-6])$/i.test(reentry);
    pass('7.3', d.length === 1 && validReentry, d.length === 1 ? `${d[0]}, re-entry ${reentry || 'missing'}` : `${d.length} decisions in the heading`);
    if (d[0] === 'KEEP' && /^none$/i.test(reentry)) {
      const w = section(a, 'Watch') || '';
      const gaps = ['Metric', 'Bands', 'Owner'].filter((k) => !nonEmpty(field(w, k)));
      if (!validDate((field(w, 'Recheck') || '').match(/^\d{4}-\d{2}-\d{2}/)?.[0])) gaps.push('Recheck date');
      pass('7.5', gaps.length === 0, gaps.length ? `a closing KEEP needs a watch; missing: ${gaps.join(', ')}` : 'watch with metric, bands, owner and recheck date');
    } else skip('7.5', 'only a closing KEEP sets a watch');
    judge('7.4', nonEmpty(firstParagraph(section(a, 'Learning'))) ? 'does the learning outlive the feature, and is it in decisions/?' : 'no learning');
    return R;
  }
  die(`unknown gate ${n}`);
}

// Dataset paths are project- or initiative-relative and must resolve to a regular file.
function resourceFile(name, ctx) {
  if (typeof name !== 'string' || !name.trim() || path.isAbsolute(name)) return null;
  for (const base of [ctx.dir, ROOT]) {
    const p = path.resolve(base, name.replace(/`/g, '').trim());
    if (p !== ROOT && !p.startsWith(ROOT + path.sep)) continue;
    if (fs.existsSync(p) && fs.statSync(p).isFile()) { const real = fs.realpathSync(p); const root = fs.realpathSync(ROOT); if (real.startsWith(root + path.sep)) return p; }
  }
  return null;
}
const validTimestamp = (v) => typeof v === 'string' && validDate(v.slice(0, 10)) && Number(v.slice(11, 13)) < 24 && Number(v.slice(14, 16)) < 60 && (v[16] !== ':' || Number(v.slice(17, 19)) < 60) && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2}(?:\.\d{3})?)?(?:Z|[+-]\d{2}:\d{2})$/.test(v) && Number.isFinite(Date.parse(v));
const digest = (s) => createHash('sha256').update(s).digest('hex');
function mappedTestFile(cell) {
  // A mapping is a literal path, or contains a backticked path plus a test name.
  // Route punctuation and spaces belong to the filename; language does not determine validity.
  const candidates = [...cell.matchAll(/`([^`]+)`/g)].map(m => m[1]);
  candidates.push(cell.trim());
  for (const candidate of candidates) {
    const literal = resourceFile(candidate, { dir: ROOT });
    if (literal) return literal;
    const name = candidate.replace(/:\d+(?:[-,]\d+)*$|#.*$/, '');
    const file = resourceFile(name, { dir: ROOT });
    if (file) return file;
  }
  return null;
}
function runEvidence(sec, ctx) {
  const fail = (detail) => ({ valid: false, detail });
  const p = resourceFile(field(sec, 'Run'), ctx);
  if (!p) return fail('no existing **Run:** JSON record; pasted runner text is not execution evidence');
  let r;
  try { r = JSON.parse(read(p)); } catch { return fail('invalid run record JSON'); }
  if (!r || typeof r !== 'object' || Array.isArray(r)) return fail('run record is not an object');
  const log = resourceFile(r.output_file, ctx);
  if (r.schema !== 1 || r.provenance !== 'bos-run-check' || !Array.isArray(r.command) || !r.command.length || !r.command.every(x => typeof x === 'string') || typeof r.cwd !== 'string' || !nonEmpty(r.cwd) || !validTimestamp(r.started_at) || !validTimestamp(r.finished_at) || Date.parse(r.finished_at) > Date.now() || Date.parse(r.started_at) > Date.parse(r.finished_at) || !log || !Number.isInteger(r.exit_code)) return fail('incomplete execution record');
  if (!fs.existsSync(path.resolve(ROOT, r.cwd)) || !fs.statSync(path.resolve(ROOT, r.cwd)).isDirectory()) return fail('recorded cwd is unavailable');
  const output = read(log);
  if (digest(output) !== r.output_sha256) return fail('run output digest mismatch');
  if (r.exit_code !== 0) return fail(`recorded command exited ${r.exit_code}`);
  // Catch common failed runner summaries even when wrappers incorrectly return zero. Never infer pass from prose.
  if (/\b[1-9]\d*\s+(?:failed|failing)\b|^# fail [1-9]\d*|^not ok\b|^FAIL\b/im.test(output)) return fail('recorded runner output contains failures');
  return { valid: true, detail: `recorded exit 0 at ${r.finished_at} (${r.command.join(' ')})`, record: r };
}
function evalInfo(ctx) {
  const sec = section(ctx.artifact && /Eval set/.test(ctx.artifact) ? ctx.artifact : ctx.spec, 'Eval set') || '';
  const m = sec.match(/[\w./-]+\.(md|jsonl|json|ya?ml|csv)/);
  const p = resourceFile(m && m[0], ctx);
  const fail = (error) => ({ valid: false, cases: 0, threshold: null, judge: false, mustPass: false, error });
  if (!p) return fail('dataset missing');
  let rows;
  try {
    if (p.endsWith('.jsonl')) rows = read(p).split('\n').filter(l => l.trim()).map(l => JSON.parse(l));
    else if (p.endsWith('.json')) { const json = JSON.parse(read(p)); rows = Array.isArray(json) ? json : json.cases; }
    else if (p.endsWith('.md')) rows = tableRows(read(p)).map(r => ({ id: r[0], input: r[1], expected: r[2], judge: r[3], must_pass: /^yes$/i.test(r[4] || '') }));
    else return fail('unsupported dataset format; use JSON, JSONL or a Markdown case table');
  } catch { return fail('dataset does not parse'); }
  if (!Array.isArray(rows) || !rows.length || rows.some(r => !r || !nonEmpty(r.id) || !nonEmpty(r.input) || !nonEmpty(r.expected) || (r.must_pass !== undefined && typeof r.must_pass !== 'boolean'))) return fail('every case needs id, input and expected');
  if (new Set(rows.map(r => String(r.id))).size !== rows.length) return fail('duplicate case ids');
  const text = sec + '\n' + (p.endsWith('.md') ? read(p) : '');
  const thr = text.match(/threshold[^\d\n-]*(-?\d+(\.\d+)?)\s*%?/i);
  const threshold = thr ? Number(thr[1]) : null;
  const mustPassIds = rows.filter(r => r.must_pass === true).map(r => String(r.id));
  const namedJudge = field(text, 'Judge') || text.match(/(?:judge|rubric|grader|deterministic)\s*[:=]\s*([^\n·]+)/i)?.[1].replace(/\*/g, '').trim();
  return { valid: true, cases: rows.length, rows, file: p, threshold: threshold !== null && threshold >= 0 && threshold <= 100 ? threshold : null,
    judge: nonEmpty(namedJudge) || rows.every(r => nonEmpty(r.judge)), mustPass: mustPassIds.length > 0, mustPassIds };
}
function evalResults(sec, ctx, ev) {
  const fail = (detail) => ({ valid: false, detail });
  if (!ev.valid || ev.threshold === null || !ev.mustPass) return fail('eval dataset/configuration is invalid');
  const run = runEvidence(sec, ctx);
  if (!run.valid) return run;
  const p = resourceFile(field(sec, 'Results'), ctx);
  if (!p) return fail('no existing **Results:** JSON file');
  const datasetPath = resourceFile(run.record.dataset_file, ctx);
  if (!datasetPath || datasetPath !== ev.file || digest(read(datasetPath)) !== run.record.dataset_sha256 || resourceFile(run.record.results_file, ctx) !== p || digest(read(p)) !== run.record.results_sha256) return fail('eval dataset/results are not bound to the captured run, or their digests changed');
  let rows;
  try { rows = JSON.parse(read(p)); } catch { return fail('invalid eval results JSON'); }
  if (!Array.isArray(rows) || rows.length !== ev.cases || rows.some(r => !r || !nonEmpty(r.id) || typeof r.pass !== 'boolean') || new Set(rows.map(r => String(r.id))).size !== rows.length) return fail('results need one unique id and boolean pass for every dataset case');
  const byId = new Map(rows.map(r => [String(r.id), r.pass]));
  if (ev.rows.some(r => !byId.has(String(r.id)))) return fail('eval results do not cover the dataset');
  const rate = rows.filter(r => r.pass).length / rows.length * 100;
  if (rate < ev.threshold || ev.mustPassIds.some(id => !byId.get(id))) return fail(`eval pass rate ${rate}% vs ${ev.threshold}%; all must-pass cases must pass`);
  return { valid: true, detail: `${rate}% >= ${ev.threshold}%, every dataset case accounted for and must-pass passed; ${run.detail}` };
}

// Executes only an explicitly requested argv; gate/record never execute project commands.
function runCheck() {
  const init = resolveActive(loadInitiatives());
  if (!init) die('no active initiative');
  const label = opt('--label');
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(label || '') || !commandArgs.length) die('run-check needs --label <slug> -- <executable> [args...]');
  const cwd = path.resolve(ROOT, opt('--cwd') || '.');
  if (!fs.existsSync(cwd) || !fs.statSync(cwd).isDirectory()) die('run-check cwd is not a directory');
  const dataset = opt('--dataset') ? resourceFile(opt('--dataset'), { dir: init.dir }) : null;
  if (opt('--dataset') && !dataset) die('run-check dataset is missing');
  const dataset_sha256 = dataset ? digest(read(dataset)) : null;
  const started_at = new Date().toISOString();
  const result = spawnSync(commandArgs[0], commandArgs.slice(1), { cwd, encoding: 'utf8', maxBuffer: 16 * 1024 * 1024, shell: false });
  const finished_at = new Date().toISOString();
  const stamp = started_at.replace(/[:.]/g, '-');
  const dir = path.join(init.dir, 'evidence', 'runs');
  fs.mkdirSync(dir, { recursive: true });
  const outputFile = path.join(dir, `${label}-${stamp}.log`);
  const recordFile = path.join(dir, `${label}-${stamp}.json`);
  const output = (result.stdout || '') + (result.stderr || '') + (result.error ? '\n' + result.error.message : '');
  fs.writeFileSync(outputFile, output);
  const resultsFile = opt('--results') ? resourceFile(opt('--results'), { dir: init.dir }) : null;
  writeJSON(recordFile, { ...(dataset ? { dataset_file: rel(dataset), dataset_sha256 } : {}), ...(resultsFile ? { results_file: rel(resultsFile), results_sha256: digest(read(resultsFile)) } : {}), schema: 1, provenance: 'bos-run-check', command: commandArgs, cwd: path.relative(ROOT, cwd) || '.', started_at, finished_at, exit_code: result.status, signal: result.signal, output_file: rel(outputFile), output_sha256: digest(output) });
  console.log(`**Run:** ${rel(recordFile)}`);
  process.exit(result.status === 0 ? 0 : 1);
}

function runGate(which) {
  const all = loadInitiatives();
  const n = which === 'C' || which === 'c' ? 'C' : Number(which);
  if (n !== 'C' && !(Number.isInteger(n) && n >= 0 && n <= 7)) die('gate takes a phase number 0-7 or C');
  const init = resolveActive(all);
  if (!init && n !== 'C') die('no active initiative: pass --initiative <slug>');
  const dir = init ? init.dir : BOS;
  const file = n === 'C' ? path.join(ROOT, 'PRODUCT.md') : path.join(dir, ARTIFACTS[n]);
  const artifact = read(file);
  if (!artifact) die(`${rel(file)} does not exist: the phase has not produced its artifact`);
  const ctx = {
    artifact, dir,
    mode: init ? init.state.mode : 'full',
    track: init ? init.state.track : undefined,
    product: read(path.join(ROOT, 'PRODUCT.md')),
    discovery: read(path.join(dir, ARTIFACTS[1])),
    spec: read(path.join(dir, ARTIFACTS[4])),
    design: read(path.join(dir, 'DESIGN.md')),
  };
  const results = [];
  const evDirs = [path.join(dir, 'evidence'), path.join(BOS, 'evidence')];
  const missing = checkEvidence(artifact + (n === 4 ? '\n' + (ctx.design || '') : ''), evDirs);
  results.push({ id: 'E.1', status: missing.length ? 'fail' : 'pass', detail: missing.length ? `unresolved: ${missing.slice(0, 5).join('; ')}${missing.length > 5 ? ` (+${missing.length - 5})` : ''}` : 'every tag resolves' });
  results.push(...gate(n, ctx));
  const au = audit(artifact);
  const checked_by = { script: results.filter((r) => ['pass', 'fail', 'warn'].includes(r.status)).map((r) => r.id), model: results.filter((r) => r.status === 'judge').map((r) => r.id) };
  const failed = results.filter((r) => r.status === 'fail').map((r) => r.id);
  const out = { gate: n, initiative: init ? init.slug : null, artifact: rel(file), mode: ctx.mode, results, failed, checked_by, audit: au };
  if (flag('--json')) console.log(JSON.stringify(out, null, 2));
  else {
    const mark = { pass: '✓', fail: '✗', judge: '?', warn: '!', skip: '–' };
    console.log(`## GATE ${n} (script) · ${out.initiative || 'project'} · ${out.artifact}${ctx.mode === 'lite' ? ' · lite' : ''}\n`);
    console.log('| # | Result | Detail |\n|---|--------|--------|');
    for (const r of results) console.log(`| ${r.id} | ${mark[r.status]} ${r.status} | ${String(r.detail).replace(/\|/g, '/')} |`);
    console.log(`\n**Evidence:** ${au.primary_units} primary units · ${au.tagged_units} tagged units · ${au.untagged_count} lines with a number and no tag · ${au.assumption_ratio}% assumption or estimate`);
    for (const l of au.untagged) console.log(`- untagged: ${l.slice(0, 140)}`);
    console.log(`\n**Script decided:** ${checked_by.script.join(', ') || 'none'} · **Model judges:** ${checked_by.model.join(', ') || 'none'}`);
    console.log(failed.length ? `**Failed:** ${failed.join(', ')}` : '**No script-decided condition failed.** Judge the ? lines, then the gate passes or fails.');
  }
  process.exit(failed.length ? 1 : 0);
}

// ---------- brief ----------

function git(...a) {
  try { return execFileSync('git', a, { cwd: ROOT, stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim(); } catch { return null; }
}

const MANIFESTS = ['package.json', 'package-lock.json', 'pnpm-lock.yaml', 'yarn.lock', 'bun.lockb', 'requirements.txt', 'pyproject.toml', 'poetry.lock', 'uv.lock', 'go.mod', 'go.sum', 'Cargo.toml', 'Cargo.lock', 'Gemfile', 'Gemfile.lock', 'composer.json', 'composer.lock'];

function verified(md) {
  const m = (md || '').match(/\*\*Verified:\*\*\s*(\d{4}-\d{2}-\d{2})(?:\s*@\s*([0-9a-f]{6,40}))?/i);
  return m ? { date: m[1], sha: m[2] || null } : null;
}

function techStale() {
  const tech = read(path.join(ROOT, 'TECH.md'));
  if (!tech) return null;
  const v = verified(tech);
  if (!v) return 'TECH.md has no Verified line';
  if (v.sha && git('rev-parse', '--is-inside-work-tree') === 'true') {
    const dep = git('log', '-1', '--format=%H', '--', ...MANIFESTS);
    if (dep && git('merge-base', '--is-ancestor', dep, v.sha) === null) {
      return `TECH.md last verified ${v.date}, dependencies changed since (${dep.slice(0, 7)})`;
    }
    return null;
  }
  const age = (Date.now() - Date.parse(v.date)) / DAY;
  return age > 60 ? `TECH.md last verified ${v.date}, ${Math.round(age)} days ago` : null;
}

function lastGate(state) {
  const ph = state.phases || {};
  const done = Object.keys(ph).map(Number).filter((k) => ph[k] && ph[k].gate).sort((x, y) => y - x);
  if (!done.length) return 'no gate run yet';
  const g = ph[done[0]].gate;
  if (ph[done[0]].status === 'covered') return 'phases 0 and 1 covered by PRODUCT.md';
  return `gate ${done[0]} ${g.overridden ? 'overridden' : g.passed ? 'passed' : 'failed'}${g.failed_conditions && g.failed_conditions.length ? ` (${g.failed_conditions.join(', ')})` : ''}`;
}

function overrides(state) {
  const ph = state.phases || {};
  return Object.keys(ph).filter((k) => ph[k] && ph[k].gate && ph[k].gate.overridden).map((k) => `${k} (${(ph[k].gate.failed_conditions || []).join(', ')})`);
}

function roadmapPhases() {
  const rm = read(path.join(BOS, 'ROADMAP.md'));
  const m = new Map();
  for (const r of tableRows(section(rm, 'Now'))) {
    const slug = ((r[4] || '').match(/initiatives\/([^/`]+)/) || [])[1];
    const ph = ((r[2] || '').match(/^(\d)/) || [])[1];
    if (slug && ph !== undefined) m.set(slug, Number(ph));
  }
  return m;
}

function brief() {
  if (!fs.existsSync(BOS)) { console.log('No BuilderOS memory in this directory.'); return; }
  if (read(path.join(BOS, 'state.json'))) { console.log('Schema 1 state found at .builderos/state.json: run `bos.mjs migrate` before anything else.'); return; }
  const all = loadInitiatives();
  const product = ((read(path.join(ROOT, 'PRODUCT.md')) || '').match(/^#\s*PRODUCT\.md\s*[—-]\s*(.+)$/m) || [])[1] || path.basename(ROOT);
  const active = resolveActive(all);
  const lines = [];
  if (!active) {
    const open = all.filter((i) => (i.state.status || 'open') !== 'closed');
    lines.push(`${product}: ${open.length ? `${open.length} open initiatives and none active on this checkout; ask which one` : 'no open initiative; start one with initialization'}.`);
  } else {
    const s = active.state;
    const p = s.current_phase ?? 0;
    lines.push(`${product} · ${s.title || active.slug} (${s.track || 'product'} track, cycle ${s.cycle || 1}): phase ${p} ${PHASES[p]}, ${lastGate(s)}.`);
    const ov = overrides(s);
    lines.push(ov.length ? `Overrides in force: phase ${ov.join('; phase ')}.` : 'No overrides.');
    const dec = fs.existsSync(path.join(BOS, 'decisions')) ? fs.readdirSync(path.join(BOS, 'decisions')).filter((f) => /^ADR-\d+/.test(f)).sort() : [];
    if (dec.length) lines.push(`Latest decision: ${dec[dec.length - 1].replace(/\.md$/, '')}.`);
    const status = (s.phases || {})[p] ? s.phases[p].status : 'pending';
    lines.push(`Next: ${status === 'answered' ? 'the spike is answered; reclassify to continue' : `${status === 'in_progress' ? 'finish' : 'start'} phase ${p} ${PHASES[p]} (skill: ${PHASE_SKILLS[p]})`}.`);
    const others = all.filter((i) => i !== active && (i.state.status || 'open') !== 'closed');
    if (others.length) lines.push(`Also open: ${others.map((i) => `${i.state.title || i.slug} (phase ${i.state.current_phase ?? 0}, ${i.state.status || 'open'})`).join('; ')}.`);
  }
  const attention = [];
  const today = Date.now();
  for (const i of all) {
    const s = i.state;
    if (s.review_due && Date.parse(s.review_due) < today && !((s.phases || {})[7] && ['passed'].includes(s.phases[7].status))) attention.push(`outcome review for ${s.title || i.slug} was due ${s.review_due}`);
    if ((s.status || 'open') === 'open' && s.updated_at && (today - Date.parse(s.updated_at)) / DAY > 30) attention.push(`${s.title || i.slug} unchanged since ${s.updated_at.slice(0, 10)}`);
    if (s.watch && validDate(s.watch.recheck) && Date.parse(s.watch.recheck) <= today) attention.push(`watch on ${s.title || i.slug} is due (${s.watch.metric}, recheck ${s.watch.recheck}): compare against its bands, and a breach starts a new initiative`);
  }
  for (const i of all) { const pr = schemaProblems(i); if (pr.length) attention.push(`${i.slug}/state.json does not follow the schema (${pr.slice(0, 3).join(', ')})`); }
  const ts = techStale();
  if (ts) attention.push(ts);
  const rp = roadmapPhases();
  for (const i of all) if (rp.has(i.slug) && rp.get(i.slug) !== (i.state.current_phase ?? 0)) attention.push(`ROADMAP.md shows ${i.slug} at phase ${rp.get(i.slug)}, its state says ${i.state.current_phase}; regenerate with \`bos.mjs roadmap\``);
  console.log(lines.slice(0, 5).join('\n'));
  if (attention.length) console.log(`Attention: ${attention.join('; ')}.`);
}

// ---------- roadmap ----------

function roadmap() {
  const p = path.join(BOS, 'ROADMAP.md');
  const rm = read(p);
  if (!rm) die('no .builderos/ROADMAP.md');
  const all = loadInitiatives();
  const keep = (sec, slugCol, col) => {
    const m = new Map();
    for (const r of tableRows(section(rm, sec))) {
      const slug = ((r[slugCol] || '').match(/initiatives\/([^/`]+)/) || [])[1] || (r[0] || '').toLowerCase();
      m.set(slug, r[col]);
    }
    return m;
  };
  const bets = keep('Now', 4, 3);
  const learnings = keep('Done', 0, 2);
  // The bet is written by hand; until it is, phase 3's selected option stands in for it.
  const bet = (i) => {
    const kept = bets.get(i.slug);
    if (kept && kept !== '—') return kept;
    const m = (read(path.join(i.dir, ARTIFACTS[3])) || '').match(/^##\s*Selected:\s*(.+)$/m);
    return m ? m[1].replace(/^\S+\s+[—-]\s+/, '').replace(/\|/g, '/').trim() : '—';
  };
  const open = all.filter((i) => (i.state.status || 'open') !== 'closed');
  const closed = all.filter((i) => i.state.status === 'closed');
  const now = ['| Initiative | Track | Phase | Bet in one line | Folder |', '|------------|-------|-------|-----------------|--------|',
    ...open.map((i) => { const ph = i.state.current_phase ?? 0; return `| ${i.state.title || i.slug}${i.state.status === 'paused' ? ' (paused)' : ''} | ${i.state.track || 'product'} | ${ph} — ${PHASES[ph]} | ${bet(i)} | \`initiatives/${i.slug}/\` |`; })];
  const outcome = (s) => {
    const ph = s.phases || {};
    if (ph[1] && ph[1].status === 'killed') return 'killed at phase 1';
    if (ph[1] && ph[1].status === 'answered') return `answered: ${ph[1].verdict || 'see 01-discovery.md'}`;
    return (ph[7] && ph[7].verdict) || 'closed';
  };
  const done = ['| Initiative | Outcome | Learning | Date |', '|------------|---------|----------|------|',
    ...closed.map((i) => `| ${i.state.title || i.slug} | ${outcome(i.state)} | ${learnings.get(i.slug) || learnings.get((i.state.title || '').toLowerCase()) || 'see 07-outcome.md'} | ${(i.state.updated_at || '').slice(0, 10)} |`)];
  const replaceTable = (md, sec, table) => {
    const lines = md.split('\n');
    const h = lines.findIndex((l) => /^##\s/.test(l) && l.replace(/^##\s+/, '').startsWith(sec));
    if (h < 0) return md + `\n## ${sec}\n${table.join('\n')}\n`;
    let e = h + 1;
    while (e < lines.length && !/^##\s/.test(lines[e])) e++;
    const body = lines.slice(h + 1, e);
    const t0 = body.findIndex((l) => /^\s*\|/.test(l));
    let t1 = t0;
    while (t1 >= 0 && t1 < body.length && /^\s*\|/.test(body[t1])) t1++;
    const nb = t0 < 0 ? [...table, ...body] : [...body.slice(0, t0), ...table, ...body.slice(t1)];
    return [...lines.slice(0, h + 1), ...nb, ...lines.slice(e)].join('\n');
  };
  let out = replaceTable(rm, 'Now', now);
  out = replaceTable(out, 'Done and dropped', done);
  fs.writeFileSync(p, out);
  console.log(`ROADMAP.md: ${open.length} in Now, ${closed.length} in Done and dropped.`);
}

// ---------- new ----------

function newInitiative(slug) {
  if (!slug || !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug)) die('new needs a lowercase hyphenated slug');
  if (!fs.existsSync(path.join(BOS, 'ROADMAP.md'))) die('no .builderos/ROADMAP.md: initialize the project first');
  const track = opt('--track') || 'product';
  if (!['spike', 'feature', 'product'].includes(track)) die('track is spike, feature or product');
  if (opt('--mode') && !['full', 'lite'].includes(opt('--mode'))) die('mode is full or lite');
  const dir = path.join(INIT_DIR, slug);
  if (fs.existsSync(path.join(dir, 'state.json'))) die(`initiative ${slug} already exists`);
  fs.mkdirSync(path.join(dir, 'evidence'), { recursive: true });
  const now = new Date().toISOString();
  for (const i of loadInitiatives()) {
    if ((i.state.status || 'open') === 'open') {
      i.state.status = 'paused';
      i.state.history = [...(i.state.history || []), { at: now, event: 'paused', reason: `${slug} became active` }];
      writeJSON(path.join(i.dir, 'state.json'), i.state);
    }
  }
  const phases = {};
  for (let k = 0; k < 8; k++) phases[k] = { status: k === 0 ? 'in_progress' : 'pending', artifact: null, gate: null };
  const state = {
    schema: 2, slug, title: opt('--title') || slug, mode: opt('--mode') || (track === 'feature' ? 'lite' : 'full'), track,
    status: 'open', current_phase: 0, cycle: 1, created_at: now, updated_at: now, review_due: null, phases,
    history: [{ at: now, event: 'track_set', track, reason: opt('--reason') || 'not stated' }],
  };
  writeJSON(path.join(dir, 'state.json'), state);
  writeJSON(path.join(BOS, 'local.json'), { active: slug });
  roadmap();
  console.log(`Created initiatives/${slug}/ (${track}, ${state.mode}), active on this checkout. Other open initiatives are now paused.`);
}

function cover() {
  const init = resolveActive(loadInitiatives());
  if (!init) die('no active initiative');
  if (init.state.status === 'closed' || init.state.current_phase !== 0) die('coverage can only be recorded at phase 0 of an open feature initiative');
  if (init.state.track !== 'feature') die(`${init.slug} is on the ${init.state.track} track; only feature runs the coverage check`);
  const c4 = opt('--c4');
  if (!c4) die('C.4 is judged by the model: pass --c4 "how the request serves the evidenced problem"');
  const r = spawnSyncSelf(['gate', 'C', '--json', '--initiative', init.slug]);
  const j = JSON.parse(r);
  const now = new Date().toISOString();
  const s = init.state;
  if (j.failed.length) {
    s.track = 'product';
    s.history.push({ at: now, event: 'track_upgraded', from: 'feature', to: 'product', reason: `coverage check failed: ${j.failed.join(', ')}` });
    s.updated_at = now;
    writeJSON(path.join(init.dir, 'state.json'), s);
    roadmap();
    console.log(`Coverage check failed (${j.failed.join(', ')}): ${init.slug} is now a product, starting at phase 0.`);
    process.exit(1);
  }
  const product = read(path.join(ROOT, 'PRODUCT.md'));
  const used = [...new Set(tags(section(product, 'The Problem') + '\n' + section(product, 'ICP')).filter((t) => t.cls !== 'assumption' && t.cls !== 'estimate').map((t) => `${t.cls}:${t.id}`))];
  for (const k of ['0', '1']) {
    s.phases[k] = { status: 'covered', artifact: null, gate: { passed: true, checked_at: now, checked_by: { script: j.checked_by.script, model: ['C.4'] }, failed_conditions: [], overridden: false } };
    s.history.push({ at: now, event: 'phase_covered', phase: Number(k), tags: used, c4 });
  }
  s.phases['2'] = { status: 'in_progress', artifact: null, gate: null };
  s.current_phase = 2;
  s.updated_at = now;
  writeJSON(path.join(init.dir, 'state.json'), s);
  roadmap();
  console.log(`Coverage check passed: phases 0 and 1 covered by ${used.join(', ')}. ${init.slug} starts at phase 2.`);
}

// Record a gate result in state.json from the script's own verdict plus the model's verdict on the judge
// conditions, so the author never writes its own pass. Refuses when a judge condition has no verdict.
function record(which) {
  const init = resolveActive(loadInitiatives());
  if (!init) die('no active initiative');
  const n = Number(which);
  const s = init.state;
  if (!Number.isInteger(n) || !(n >= 0 && n <= 7)) die('record takes a phase number 0-7');
  if (s.status === 'closed') die('a closed initiative cannot record another gate');
  const problems = schemaProblems(init);
  if (problems.length) die(`invalid state: ${problems.join(', ')}`);
  if (n !== s.current_phase) die(`${init.slug} is at phase ${s.current_phase}; record ${s.current_phase}, or pass --initiative`);
  const j = JSON.parse(spawnSyncSelf(['gate', String(n), '--json', '--initiative', init.slug]) || '{}');
  if (!j.results) die(`gate ${n} could not run: does ${ARTIFACTS[n]} exist?`);
  const judged = Object.fromEntries((opt('--judged') || '').split(',').map((x) => x.trim()).filter(Boolean).map((x) => x.split('=').map((y) => y.trim())));
  const unexpected = Object.keys(judged).filter(id => !j.checked_by.model.includes(id));
  if (unexpected.length) die(`unknown or script-decided judge ids: ${unexpected.join(', ')}`);
  const missing = j.checked_by.model.filter((id) => !['pass', 'fail'].includes(judged[id]));
  if (missing.length) die(`judge ${missing.join(', ')} first, then pass --judged "${missing.map((id) => `${id}=pass|fail`).join(',')}"`);
  const soft = s.mode === 'lite' ? ['4.5', '6.4'] : []; // lite mode: warnings, see gate-checks
  const failed = [...j.failed, ...j.checked_by.model.filter((id) => judged[id] === 'fail' && !soft.includes(id))];
  const override = opt('--override');
  if (flag('--override') && !nonEmpty(override)) die('--override needs a non-empty reason');
  const acceptedBy = opt('--accepted-by');
  if (flag('--accepted-by') && !nonEmpty(acceptedBy)) die('--accepted-by needs the name of the person who accepted');
  if (flag('--accepted-by') && !ACCEPTANCE_PHASES.includes(n)) die(`--accepted-by applies to phases ${ACCEPTANCE_PHASES.join(', ')}; the phase 5 plan is accepted in 05-build-plan.md`);
  const passing = failed.length === 0 || Boolean(override);
  if (passing && ACCEPTANCE_PHASES.includes(n) && !nonEmpty(acceptedBy)) die(`phase ${n} advances only when a person accepts ${ARTIFACTS[n]}: ask, then pass --accepted-by "who" (never on their behalf)`);
  let verdict = opt('--verdict');
  const rawReentry = opt('--reenter');
  const reenter = rawReentry === undefined ? null : Number(rawReentry);
  const artifact = read(path.join(init.dir, ARTIFACTS[n]));
  if (n === 1) {
    const choices = ['validated', 'killed', 'reshaped'].filter(v => new RegExp(`\\b${v.toUpperCase()}\\b`).test(section(artifact, 'Verdict') || ''));
    if (choices.length !== 1) die('phase 1 artifact must have exactly one discovery verdict');
    if (verdict && !choices.includes(verdict)) die('phase 1 --verdict must match artifact: validated|killed|reshaped');
    verdict = choices[0];
  } else if (n === 7) {
    if (!['keep', 'iterate', 'kill'].includes(verdict)) die('phase 7 records the decision: --verdict keep|iterate|kill');
    const choices = ['keep', 'iterate', 'kill'].filter(v => new RegExp(`\\b${v}\\b`, 'i').test(heading(artifact, 'Decision')[0] || ''));
    if (choices.length !== 1 || choices[0] !== verdict) die('phase 7 --verdict must match the artifact decision');
    const declared = field(section(artifact, 'Decision'), 'Re-enters at') || '';
    if (reenter !== null && (!/^[0-6]$/.test(rawReentry) || !Number.isInteger(reenter))) die('--reenter takes an integer phase 0-6');
    if (verdict === 'kill' && reenter !== null) die('KILL closes the initiative; no re-entry');
    if (verdict === 'iterate' && reenter === null) die('ITERATE requires --reenter 0-6');
    if (reenter === null ? !/^none$/i.test(declared) : declared.toLowerCase() !== `phase ${reenter}`) die('--reenter must match the artifact Re-enters at field');
  } else if (verdict) die('--verdict is only valid for phase 1 or 7');
  if (n !== 7 && rawReentry !== undefined) die('--reenter is only valid for phase 7');
  const due = opt('--review-due');
  if (n === 6 && (!validDate(due) || (field(section(artifact, 'Outcome review'), 'Date') || '').match(/^\d{4}-\d{2}-\d{2}/)?.[0] !== due)) die('phase 6 --review-due must match the valid outcome review date');
  if (n !== 6 && due !== undefined) die('--review-due is only valid for phase 6; use defer-review at phase 7');
  const now = new Date().toISOString();
  const gateEntry = { passed: failed.length === 0 || Boolean(override), checked_at: now, checked_by: j.checked_by, failed_conditions: failed, overridden: Boolean(override && failed.length) };
  if (gateEntry.overridden) gateEntry.override_reason = override;
  if (gateEntry.passed && nonEmpty(acceptedBy)) { gateEntry.accepted_by = acceptedBy; gateEntry.accepted_at = now; }
  const ph = (s.phases[String(n)] = { ...(s.phases[String(n)] || {}), artifact: ARTIFACTS[n], gate: gateEntry });
  s.history = s.history || [];
  s.updated_at = now;
  if (!gateEntry.passed) {
    ph.status = 'in_progress';
    s.history.push({ at: now, event: 'gate_failed', phase: n, failed_conditions: failed });
    writeJSON(path.join(init.dir, 'state.json'), s);
    console.log(`Gate ${n} failed on ${failed.join(', ')}: ${init.slug} stays at phase ${n}.`);
    process.exit(1);
  }
  if (verdict) ph.verdict = verdict;
  if (n === 7) s.review_due = null;
  const spikeStop = n === 1 && s.track === 'spike';
  const stops = (n === 1 && (verdict === 'killed' || spikeStop)) || (n === 7 && reenter === null);
  ph.status = spikeStop ? 'answered' : n === 1 && verdict === 'killed' ? 'killed' : 'passed';
  if (n === 6) s.review_due = due;
  s.history.push({ at: now, event: gateEntry.overridden ? 'gate_overridden' : 'gate_passed', phase: n, ...(verdict ? { verdict } : {}), ...(gateEntry.overridden ? { failed_conditions: failed, reason: override } : {}), ...(gateEntry.accepted_by ? { accepted_by: gateEntry.accepted_by } : {}) });
  if (n === 7 && verdict === 'keep' && reenter === null) {
    const w = section(artifact, 'Watch') || '';
    s.watch = { metric: field(w, 'Metric'), bands: field(w, 'Bands'), owner: field(w, 'Owner'), recheck: (field(w, 'Recheck') || '').slice(0, 10) };
  }
  if (n === 7 && reenter !== null) {
    s.cycle = (s.cycle || 1) + 1;
    s.current_phase = reenter;
    s.status = 'open';
    for (let k = reenter; k <= 7; k++) s.phases[String(k)] = { status: k === reenter ? 'in_progress' : 'pending', artifact: null, gate: null };
    s.history.push({ at: now, event: 'cycle_started', cycle: s.cycle, phase: reenter });
  } else if (stops) {
    s.status = 'closed';
    s.history.push({ at: now, event: 'closed', phase: n, ...(verdict ? { verdict } : {}) });
  } else {
    s.current_phase = n + 1;
    s.phases[String(n + 1)] = { ...(s.phases[String(n + 1)] || { artifact: null, gate: null }), status: 'in_progress' };
  }
  writeJSON(path.join(init.dir, 'state.json'), s);
  roadmap();
  console.log(n === 7 && reenter !== null ? `Gate 7 recorded (${verdict}): cycle ${s.cycle} of ${init.slug} starts at phase ${reenter} ${PHASES[reenter]}. Move the earlier artifacts to cycle-${s.cycle - 1}/.` : stops ? `Gate ${n} recorded (${ph.status}${verdict ? `, ${verdict}` : ''}): ${init.slug} is closed.` : `Gate ${n} recorded${gateEntry.overridden ? ` as overridden (${failed.join(', ')})` : ''}: ${init.slug} moves to phase ${n + 1} ${PHASES[n + 1]}.`);
}

function spawnSyncSelf(a) {
  try { return execFileSync(process.execPath, [fileURLToPath(import.meta.url), ...a, '--root', ROOT], { stdio: ['ignore', 'pipe', 'ignore'] }).toString(); }
  catch (e) { return e.stdout.toString(); }
}

const validDate = (v) => typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v) && Number.isFinite(Date.parse(v)) && new Date(v).toISOString().slice(0, 10) === v;
function deferReview() {
  const init = resolveActive(loadInitiatives());
  if (!init || init.state.status === 'closed' || init.state.current_phase !== 7) die('defer-review requires an open initiative at phase 7');
  const problems = schemaProblems(init);
  if (problems.length) die(`invalid state: ${problems.join(', ')}`);
  if (flag('--verdict')) die('deferred reviews do not carry a verdict');
  const due = opt('--review-due'), reason = opt('--reason');
  if (!validDate(due) || due <= new Date().toISOString().slice(0, 10) || !nonEmpty(reason)) die('defer-review requires a future --review-due YYYY-MM-DD and --reason');
  const now = new Date().toISOString();
  init.state.review_due = due;
  init.state.updated_at = now;
  init.state.phases['7'] = { ...(init.state.phases['7'] || {}), status: 'in_progress' };
  init.state.history.push({ at: now, event: 'review_deferred', review_due: due, reason });
  writeJSON(path.join(init.dir, 'state.json'), init.state);
  roadmap();
  console.log(`REVIEW DEFERRED: ${init.slug} remains at phase 7; review ${due}. ${reason}`);
}

function schemaProblems(i) {
  const s = i.state, p = [];
  for (const k of ['schema', 'slug', 'title', 'status', 'current_phase', 'cycle', 'phases', 'history']) if (s[k] === undefined) p.push(`no ${k}`);
  if (s.schema !== undefined && s.schema !== 2) p.push(`schema ${s.schema}`);
  if (!['full', 'lite'].includes(s.mode)) p.push(`mode ${s.mode}`);
  if (s.track !== undefined && !['spike', 'feature', 'product'].includes(s.track)) p.push(`track ${s.track}`);
  if (!['open', 'paused', 'closed'].includes(s.status)) p.push(`status ${s.status}`);
  if (!Number.isInteger(s.current_phase) || s.current_phase < 0 || s.current_phase > 7) p.push(`phase ${s.current_phase}`);
  if (!Number.isInteger(s.cycle) || s.cycle < 1) p.push(`cycle ${s.cycle}`);
  if (!Array.isArray(s.history)) p.push('history is not an array');
  if (!s.phases || typeof s.phases !== 'object' || Array.isArray(s.phases)) p.push('phases is not an object');
  if (s.review_due !== null && s.review_due !== undefined && !validDate(s.review_due)) p.push('review_due is not a date');
  if (s.watch !== undefined && s.watch !== null && (typeof s.watch !== 'object' || !validDate(s.watch.recheck))) p.push('watch has no valid recheck date');
  for (const [k, v] of Object.entries(s.phases || {})) {
    if (!['pending', 'in_progress', 'passed', 'killed', 'covered', 'answered'].includes(v && v.status)) p.push(`phase ${k} status ${JSON.stringify(v && v.status)}`);
    if (!/^[0-7]$/.test(k)) p.push(`invalid phase key ${k}`);
    if (v && v.verdict && !(k === '1' ? ['validated', 'killed', 'reshaped'] : k === '7' ? ['keep', 'iterate', 'kill'] : []).includes(v.verdict)) p.push(`phase ${k} verdict ${v.verdict}`);
    if (v && v.status === 'covered' && !(Array.isArray(s.history) ? s.history : []).some((h) => h.event === 'phase_covered' && String(h.phase) === k)) p.push(`phase ${k} covered with no phase_covered event`);
  }
  if (s.track && !(Array.isArray(s.history) ? s.history : []).some((h) => h.event === 'track_set')) p.push('no track_set event');
  return p;
}

// ---------- pace ----------

// Process metrics read from what already exists: state history and, where there is one, git.
function pace() {
  const all = loadInitiatives();
  const init = resolveActive(all);
  const out = [];
  const days = (a, b) => { const d = (Date.parse(b) - Date.parse(a)) / DAY; return Number.isFinite(d) ? Math.round(d * 10) / 10 : '?'; };
  if (init) {
    const h = init.state.history || [];
    const rows = [];
    let since = init.state.created_at || (h[0] && h[0].at);
    for (const e of h) {
      if (e.event === 'cycle_started') { since = e.at; continue; }
      if (!['gate_passed', 'gate_overridden', 'phase_covered'].includes(e.event)) continue;
      const fails = h.filter((x) => x.event === 'gate_failed' && x.phase === e.phase && x.at <= e.at && (!since || x.at >= since)).length;
      rows.push(`| ${e.phase} ${PHASES[e.phase]} | ${e.event === 'phase_covered' ? 'covered' : since ? days(since, e.at) : '?'} | ${fails} | ${e.event === 'gate_overridden' ? 'yes' : 'no'} | ${e.accepted_by || 'not recorded'} |`);
      since = e.at;
    }
    out.push(`## Pace · ${init.state.title || init.slug}`, '', '| Phase | Days | Failed gates before pass | Overridden | Accepted by |', '|-------|------|--------------------------|------------|-------------|', ...(rows.length ? rows : ['| none passed yet | | | | |']));
    if (git('rev-parse', '--is-inside-work-tree') === 'true') {
      const relDir = path.relative(ROOT, init.dir);
      const firstPlan = git('log', '--reverse', '--format=%H', '--', path.join(relDir, ARTIFACTS[5]));
      const first = firstPlan ? firstPlan.split('\n')[0] : null;
      if (first) {
        const after = git('log', '--format=%H', `${first}..HEAD`, '--', path.join(relDir, ARTIFACTS[4]));
        out.push('', `**Spec rework after the plan:** ${after ? after.split('\n').filter(Boolean).length : 0} commits touched ${ARTIFACTS[4]} after ${ARTIFACTS[5]} first appeared (all cycles)`);
      } else out.push('', `**Spec rework after the plan:** not measurable yet, ${ARTIFACTS[5]} has no commit`);
    } else out.push('', '**Spec rework after the plan:** unavailable without git');
  }
  const decided = all.filter((i) => ['passed', 'killed', 'answered'].includes(((i.state.phases || {})[1] || {}).status));
  const killed = decided.filter((i) => i.state.phases[1].status === 'killed' || i.state.phases[1].verdict === 'killed');
  out.push(`**Phase 1 kills:** ${killed.length} of ${decided.length} initiatives that reached a discovery verdict`);
  console.log(out.join('\n'));
}

// ---------- watch ----------

// A watch set by a closing KEEP: roll its recheck date after a check found no breach, or clear it when a
// breach became a new initiative. Closed initiatives are addressed with --initiative.
function watch() {
  const all = loadInitiatives();
  const named = opt('--initiative');
  const watched = all.filter((i) => i.state.watch);
  const init = named ? all.find((i) => i.slug === named) : watched.length === 1 ? watched[0] : null;
  if (!init) die(named ? `no initiative "${named}"` : `${watched.length} initiatives have a watch: pass --initiative <slug>`);
  if (!init.state.watch) die(`${init.slug} has no watch`);
  const note = opt('--note');
  if (!nonEmpty(note)) die('watch needs --note "what the check observed"');
  const now = new Date().toISOString();
  const s = init.state;
  if (flag('--clear')) {
    if (!nonEmpty(opt('--breach'))) die('--clear needs --breach <slug of the initiative the breach started>');
    s.history.push({ at: now, event: 'watch_breached', metric: s.watch.metric, initiative: opt('--breach'), note });
    s.watch = null;
  } else {
    const next = opt('--recheck');
    if (!validDate(next) || next <= now.slice(0, 10)) die('watch needs a future --recheck YYYY-MM-DD, or --clear --breach <slug>');
    s.history.push({ at: now, event: 'watch_checked', metric: s.watch.metric, previous: s.watch.recheck, recheck: next, note });
    s.watch.recheck = next;
  }
  s.updated_at = now;
  writeJSON(path.join(init.dir, 'state.json'), s);
  console.log(s.watch ? `Watch on ${init.slug}: next recheck ${s.watch.recheck}.` : `Watch on ${init.slug} cleared; the breach continues as ${opt('--breach')}.`);
}

// ---------- migrate ----------

function migrate() {
  const old = readJSON(path.join(BOS, 'state.json'));
  if (!old) die('no .builderos/state.json to migrate');
  if (old.schema !== 1 && old.schema !== undefined) die(`.builderos/state.json has schema ${old.schema}; only schema 1 migrates`);
  const productName = ((read(path.join(ROOT, 'PRODUCT.md')) || '').match(/^#\s*PRODUCT\.md\s*[—-]\s*(.+)$/m) || [])[1] || old.product || 'main';
  const slug = opt('--slug') || productName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'main';
  const dir = path.join(INIT_DIR, slug);
  fs.mkdirSync(path.join(dir, 'evidence'), { recursive: true });
  const moved = [];
  for (const f of [...ARTIFACTS, 'DESIGN.md', 'questionnaires']) {
    const src = path.join(BOS, f);
    if (fs.existsSync(src)) { fs.renameSync(src, path.join(dir, f)); moved.push(f); }
  }
  for (const f of fs.readdirSync(BOS)) if (/^cycle-\d+$/.test(f)) { fs.renameSync(path.join(BOS, f), path.join(dir, f)); moved.push(f); }
  const { schema, product, ...rest } = old;
  const now = new Date().toISOString();
  const state = { schema: 2, slug, title: product || productName, status: 'open', review_due: null, ...rest, updated_at: now };
  state.history = [...(old.history || []), { at: now, event: 'migrated', from_schema: 1, moved }];
  writeJSON(path.join(dir, 'state.json'), state);
  writeJSON(path.join(BOS, 'local.json'), { active: slug });
  if (!fs.existsSync(path.join(BOS, 'ROADMAP.md'))) {
    fs.writeFileSync(path.join(BOS, 'ROADMAP.md'), `# Roadmap — ${productName}\n\n**Verified:** ${now.slice(0, 10)} @ no git\n\n## Direction\n{Two or three sentences, written by hand.}\n\n## Now\n\n## Next\n| Initiative | Why next | What must be true first |\n|------------|----------|-------------------------|\n\n## Later\n\n## Done and dropped\n`);
  }
  fs.unlinkSync(path.join(BOS, 'state.json'));
  roadmap();
  console.log(`Migrated schema 1 to initiatives/${slug}/state.json. Moved: ${moved.join(', ') || 'nothing'}. Add .builderos/local.json to .gitignore.`);
}

// ---------- main ----------

const cmd = args[0];
if (cmd === 'brief') brief();
else if (cmd === 'gate') runGate(args[1]);
else if (cmd === 'run-check') runCheck();
else if (cmd === 'roadmap') roadmap();
else if (cmd === 'new') newInitiative(args[1]);
else if (cmd === 'cover') cover();
else if (cmd === 'record') record(args[1]);
else if (cmd === 'defer-review') deferReview();
else if (cmd === 'migrate') migrate();
else if (cmd === 'pace') pace();
else if (cmd === 'watch') watch();
else {
  console.log('usage: node bos.mjs brief | gate <0-7|C> [--json] | new <slug> --title t --track k | cover --c4 reason | record <0-7> --judged ids | run-check --label slug -- executable args... | defer-review --review-due date --reason text | roadmap | migrate | pace | watch --note text (--recheck date | --clear --breach slug)   [--initiative slug] [--root dir]');
  process.exit(cmd ? 2 : 0);
}
