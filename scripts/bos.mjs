#!/usr/bin/env node
// BuilderOS project script. Node built-ins only.
// Run from the project root (the directory holding PRODUCT.md and .builderos/).
//
//   node bos.mjs brief                     session briefing, with the attention line
//   node bos.mjs gate <0-7|C> [--json]     script-decided gate conditions; the rest listed as judge
//   node bos.mjs roadmap                   regenerate the Now and Done tables of ROADMAP.md
//   node bos.mjs migrate                   move a schema 1 .builderos/state.json to schema 2
//
// Options: --initiative <slug> acts on another initiative, --root <dir> sets the project root.

import fs from 'fs';
import path from 'path';
import { execFileSync } from 'child_process';

const args = process.argv.slice(2);
const opt = (name) => {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : undefined;
};
const flag = (name) => args.includes(name);
const ROOT = path.resolve(opt('--root') || process.cwd());
const BOS = path.join(ROOT, '.builderos');
const INIT_DIR = path.join(BOS, 'initiatives');

const PHASES = ['Frame', 'Discover', 'Define', 'Ideate', 'Shape', 'Build', 'Ship', 'Learn'];
const COMMANDS = ['/bos-frame', '/bos-discover', '/bos-define', '/bos-ideate', '/bos-shape', '/bos-build', '/bos-ship', '/bos-learn'];
const ARTIFACTS = ['00-frame.md', '01-discovery.md', '02-definition.md', '03-solution-bet.md', '04-spec.md', '05-build-plan.md', '06-release.md', '07-outcome.md'];
const PRIMARY = new Set(['data', 'interview', 'code']);
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
    if (/[*{}]/.test(t.id)) { missing.push(`${t.raw} (placeholder)`); continue; }
    if (t.cls === 'code') {
      const p = t.id.replace(/:\d+(-\d+)?$/, '');
      if (!fs.existsSync(path.join(ROOT, p))) missing.push(`${t.raw} (no file ${p})`);
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

const SOLUTION_WORDS = /\b(build|builds|add|adds|app|apps|platform|platforms|dashboard|dashboards|tool|tools|feature|features|automate|automates|automation)\b|\bAI\b/;

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
    const hit = statement.match(SOLUTION_WORDS);
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
    const hit = firstParagraph(prob).match(SOLUTION_WORDS);
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
    const sourcesOf = (ts) => new Set(ts.flatMap((t) => (t.cls === 'interview' ? t.id.split(',').map((s) => `interview:${s.trim()}`) : [`${t.cls}:${t.id}`])));
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
    const zero = base && /^0\b/.test(base) && DATE_RE.test(base);
    pass('2.3', nonEmpty(field(sm, 'Metric')) && base && (hasTag(base) || zero) && target && /\d/.test(target) && DATE_RE.test(target), 'metric, tagged baseline, target with a value and a date');
    pass('2.4', base && (hasTag(base, ['data', 'code', 'doc']) || zero), base ? (zero ? 'explicit zero with a first-measurement date' : `baseline tag: ${tags(base).map((t) => t.cls).join(', ') || 'none'}`) : 'no baseline');
    judge('2.5', 'is the opportunity coherent with the PMF stage?');
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
      pass('4.6', ev.cases >= need && ev.threshold !== null && ev.judge && ev.mustPass, `${ev.cases} cases (${need} needed), threshold ${ev.threshold ?? 'missing'}, judge ${ev.judge ? 'named' : 'missing'}, must-pass ${ev.mustPass ? 'named' : 'missing'}`);
    }
    return R;
  }

  if (n === 5) {
    const specAC = tableRows(section(ctx.spec, 'Acceptance criteria')).map((r) => r[0]).filter((x) => /^\d+$/.test(x));
    const map = tableRows(section(a, 'Acceptance criteria to tests'));
    const mapped = new Set(map.filter((r) => nonEmpty(r[2])).map((r) => r[0]));
    const unmapped = specAC.filter((x) => !mapped.has(x));
    pass('5.1', specAC.length > 0 && unmapped.length === 0, specAC.length === 0 ? 'no numbered criteria in 04-spec.md' : unmapped.length ? `unmapped: ${unmapped.join(', ')}` : `${specAC.length} criteria mapped`);
    const outSec = section(a, 'Test output');
    const failing = map.filter((r) => !/^pass/i.test(r[3] || ''));
    pass('5.2', outSec && /```|\d+\s+(passed|passing|tests?)/i.test(outSec) && failing.length === 0, !outSec ? 'no test output pasted' : failing.length ? `not passing: ${failing.map((r) => r[0]).join(', ')}` : 'runner output pasted, all mapped tests pass');
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
      const res = section(a, 'Eval results') || '';
      const rate = (res.match(/(\d+(\.\d+)?)\s*%/) || [])[1];
      const thr = evalInfo(ctx).threshold;
      pass('5.5', rate !== undefined && thr !== null && Number(rate) >= thr && !/must-pass[^\n]*fail/i.test(res), rate === undefined ? 'no pass rate in Eval results' : `pass rate ${rate}% vs threshold ${thr ?? 'missing'}`);
    }
    return R;
  }

  if (n === 6) {
    const rb = section(a, 'Rollback') || '';
    judge('6.1', ['Mechanism', 'Owner', 'Tested'].every((k) => nonEmpty(field(rb, k))) && DATE_RE.test(field(rb, 'Tested') || '') ? 'mechanism, owner and a dated test present; was it really tested?' : 'mechanism, owner or dated test missing');
    const bh = heading(a, 'Baseline')[0] || '';
    const ts = bh.match(/\d{4}-\d{2}-\d{2}(T[\d:]+Z?)?/g) || [];
    const brows = tableRows(section(a, 'Baseline')).filter((r) => nonEmpty(r[1]));
    pass('6.2', ts.length >= 2 && Date.parse(ts[0]) < Date.parse(ts[1]) && brows.length > 0, ts.length < 2 ? 'baseline heading lacks capture and rollout timestamps' : `captured ${ts[0]}, rollout ${ts[1]}`);
    pass('6.3', nonEmpty(field(section(a, 'Measurement'), 'Success metric measured by')), 'named query or dashboard');
    (lite ? warn : judge)('6.4', 'are the release notes written for users, not a commit list?');
    const orv = section(a, 'Outcome review') || '';
    pass('6.5', /\*\*Owner:\*\*\s*[^·{]+\S/.test(orv) && DATE_RE.test(orv), 'owner and date');
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
    pass('7.3', d.length === 1 && nonEmpty(field(section(a, 'Decision'), 'Re-enters at')), d.length === 1 ? d[0] : `${d.length} decisions in the heading`);
    judge('7.4', nonEmpty(firstParagraph(section(a, 'Learning'))) ? 'does the learning outlive the feature, and is it in decisions/?' : 'no learning');
    return R;
  }
  die(`unknown gate ${n}`);
}

function evalInfo(ctx) {
  const sec = section(ctx.artifact && /Eval set/.test(ctx.artifact) ? ctx.artifact : ctx.spec, 'Eval set') || '';
  const m = sec.match(/[\w./-]+\.(md|jsonl|json|ya?ml|csv)/);
  let file = '';
  if (m) {
    for (const base of [ctx.dir, ROOT]) {
      const p = path.join(base, m[0]);
      if (fs.existsSync(p)) { file = read(p); break; }
    }
  }
  const text = sec + '\n' + file;
  let cases = tableRows(file).length;
  if (/\.jsonl$/.test(m ? m[0] : '')) cases = file.split('\n').filter((l) => l.trim()).length;
  const cm = sec.match(/(\d+)\s+cases/i);
  if (!cases && cm) cases = Number(cm[1]);
  const thr = text.match(/threshold[^\d\n]*(\d+(\.\d+)?)\s*%?/i);
  return {
    cases,
    threshold: thr ? Number(thr[1]) : null,
    judge: /judge|rubric|grader|deterministic/i.test(text),
    mustPass: /must[- ]pass/i.test(text),
  };
}

function runGate(which) {
  const all = loadInitiatives();
  const n = which === 'C' || which === 'c' ? 'C' : Number(which);
  if (n !== 'C' && !(n >= 0 && n <= 7)) die('gate takes a phase number 0-7 or C');
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
    lines.push(`Next: ${status === 'answered' ? 'the spike is answered; reclassify to continue' : `${status === 'in_progress' ? 'finish' : 'start'} phase ${p} ${PHASES[p]} (${COMMANDS[p]})`}.`);
    const others = all.filter((i) => i !== active && (i.state.status || 'open') !== 'closed');
    if (others.length) lines.push(`Also open: ${others.map((i) => `${i.state.title || i.slug} (phase ${i.state.current_phase ?? 0}, ${i.state.status || 'open'})`).join('; ')}.`);
  }
  const attention = [];
  const today = Date.now();
  for (const i of all) {
    const s = i.state;
    if (s.review_due && Date.parse(s.review_due) < today && !((s.phases || {})[7] && ['passed'].includes(s.phases[7].status))) attention.push(`outcome review for ${s.title || i.slug} was due ${s.review_due}`);
    if ((s.status || 'open') === 'open' && s.updated_at && (today - Date.parse(s.updated_at)) / DAY > 30) attention.push(`${s.title || i.slug} unchanged since ${s.updated_at.slice(0, 10)}`);
  }
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
  const open = all.filter((i) => (i.state.status || 'open') !== 'closed');
  const closed = all.filter((i) => i.state.status === 'closed');
  const now = ['| Initiative | Track | Phase | Bet in one line | Folder |', '|------------|-------|-------|-----------------|--------|',
    ...open.map((i) => { const ph = i.state.current_phase ?? 0; return `| ${i.state.title || i.slug}${i.state.status === 'paused' ? ' (paused)' : ''} | ${i.state.track || 'product'} | ${ph} — ${PHASES[ph]} | ${bets.get(i.slug) || '—'} | \`initiatives/${i.slug}/\` |`; })];
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
else if (cmd === 'roadmap') roadmap();
else if (cmd === 'migrate') migrate();
else {
  console.log('usage: node bos.mjs brief | gate <0-7|C> [--json] | roadmap | migrate   [--initiative slug] [--root dir]');
  process.exit(cmd ? 2 : 0);
}
