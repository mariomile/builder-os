#!/usr/bin/env node
// BuilderOS project script. Node built-ins only.
// Run from the project root (the directory holding PRODUCT.md and .builderos/).
//
//   node bos.mjs brief                     session briefing, with the attention line
//   node bos.mjs gate <0-7|C|M> [--json]   script-decided gate conditions; the rest listed as judge
//   node bos.mjs new <slug> --title "..." --track spike|feature|change|product [--mode full|lite] [--reason "..."]
//                                          create an initiative with a valid state.json and make it active
//   node bos.mjs cover --c4 "reason"       feature track: run the coverage check on PRODUCT.md and 00-request.md and, if it
//                                          passes, record phases 0 and 1 as covered and start at phase 2 (C.4 is the model's call)
//   node bos.mjs cover --m4 "reason"       change track: run the mandate check on 00-request.md and, if it passes, record
//                                          phases 0 to 3 as covered and start at phase 4; a failure moves the work to feature
//   node bos.mjs upgrade --to feature|product --reason "..."
//                                          the ratchet: move the active initiative to a heavier track and restart at phase 0
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
// Lightest to heaviest; the ratchet only moves right. spike stays outside it: an answered spike ends.
const TRACKS = ['spike', 'change', 'feature', 'product'];
const REQUEST = '00-request.md';
const MANDATE_KINDS = ['bug', 'debt', 'compliance', 'contract', 'request', 'removal'];

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

// ---------- stack and visual direction (gates 4.8, 4.9) ----------

// "Not applicable" as a bold field (`**Visual direction:** not applicable, {reason}`) or as the section's own prose
// ("Not applicable." followed by the reason): either way, the reason is whatever follows the words.
function notApplicable(sec, whole, label, word = 'not applicable') {
  const f = field(sec || whole || '', label);
  const prose = (sec || '').replace(/^\s+/, '');
  const text = f && f.toLowerCase().startsWith(word) ? f : prose.toLowerCase().startsWith(word) ? prose : null;
  if (!text) return null;
  return { text: text.trim(), reason: text.slice(word.length).replace(/^[\s,.:;—-]*(reason:?\s*)?/i, '').trim() };
}

const NOBODY = /^(—|-|–|n\/?a|none|agent|model|claude|codex|ai|auto)?$/i;
const rawRows = (text) => (text || '').split('\n').filter((l) => /^\s*\|/.test(l)).slice(1)
  .map((l) => l.trim().replace(/^\|/, '').replace(/\|$/, '').split('|').map((c) => c.trim()))
  .filter((r) => !r.every((c) => /^:?-{2,}:?$/.test(c) || c === '') && nonEmpty(r[0]));

function stackInfo(spec) {
  const problems = [];
  const sec = section(spec, 'Stack');
  if (sec === null) return { rows: 0, decided: 0, problems: ['no "## Stack" section: list every layer the work touches as inherited, decided or not needed'] };
  const rows = rawRows(sec);
  if (!rows.length) problems.push('the Stack table has no layers');
  let decided = 0;
  for (const r of rows) {
    const status = (r[2] || '').toLowerCase();
    if (!/^(inherited|decided|not needed)\b/.test(status)) { problems.push(`${r[0]}: status "${r[2] || ''}" is not inherited, decided or not needed`); continue; }
    if (/^decided/.test(status)) {
      decided++;
      if (!nonEmpty(r[3]) || NOBODY.test(r[3])) problems.push(`${r[0]}: decided with nobody named`);
    }
    if (!nonEmpty(r[1]) && !/^not needed/.test(status)) problems.push(`${r[0]}: no choice`);
    const adr = (r[4] || '').replace(/[`\[\]]/g, '').replace(/\(.*\)/, '').trim();
    if (nonEmpty(adr) && !NOBODY.test(adr)) {
      const name = path.basename(adr);
      if (!fs.existsSync(path.join(BOS, 'decisions', name)) && !fs.existsSync(path.join(ROOT, adr))) problems.push(`${r[0]}: ADR ${adr} not found in .builderos/decisions/`);
    }
  }
  if (section(spec, 'What we chose') === null) problems.push('no "## What we chose" summary for the person accepting the spec');
  return { rows: rows.length, decided, problems };
}

function visualInfo(ctx, need, inheritable = false) {
  const problems = [];
  const sec = section(ctx.design, 'Visual direction');
  const na = notApplicable(sec, ctx.design, 'Visual direction');
  if (na) return na.reason.length > 3 ? { problems, detail: `not applicable: ${na.reason}` } : { problems: ['"not applicable" needs its reason'] };
  // A change that adds no screen composition keeps the existing one; it says so and why.
  const inh = inheritable && notApplicable(sec, ctx.design, 'Visual direction', 'inherited');
  if (inh) return inh.reason.length > 3 ? { problems, detail: `inherited: ${inh.reason}` } : { problems: ['"inherited" needs its reason'] };
  if (sec === null) return { problems: ['no "## Visual direction" in DESIGN.md: show versions and record the choice, or write "**Visual direction:** not applicable, {reason}"'] };
  const versions = rawRows(sec.split(/\*\*Tokens/)[0]);
  if (versions.length < need) problems.push(`${versions.length} versions shown (${need} needed)`);
  const missing = versions.map((r) => (r[2] || '').replace(/[`\[\]]/g, '').replace(/\(.*\)/, '').trim())
    .filter((f) => /\.(html?|png|jpe?g|svg|pdf)$/i.test(f) && !fs.existsSync(path.join(ctx.dir, f)) && !fs.existsSync(path.join(ROOT, f)));
  // A route inside the running app ("/reports?variant=b on prototype/x") is not a file to check.
  const unlocated = versions.filter((r) => !nonEmpty(r[2]));
  if (unlocated.length) problems.push(`versions with no file or route: ${unlocated.map((r) => r[0]).join(', ')}`);
  if (missing.length) problems.push(`version files not found: ${missing.join(', ')}`);
  for (const label of ['Chosen', 'Chosen by', 'Design kit']) if (!nonEmpty(field(sec, label))) problems.push(`no "**${label}:**"`);
  const by = field(sec, 'Chosen by');
  if (by && NOBODY.test(by)) problems.push('the look was not chosen by a person');
  if (!/\*\*Tokens:?\*\*/i.test(sec) || !rawRows(sec.split(/\*\*Tokens:?\*\*/i)[1] || '').some((r) => nonEmpty(r[1]))) problems.push('no tokens extracted from the chosen version');
  return { problems, detail: `${versions.length} versions, chosen by ${by}, kit: ${field(sec, 'Design kit')}` };
}

// Gate 4.11: what the change does to what already exists. Five areas, each with how it is handled.
const IMPACT_AREAS = [['existing data', /data|record|row/i], ['contracts', /contract|api|webhook|export|integration/i], ['tracking events', /event|tracking|analytics/i], ['permissions', /permission|role|access|plan/i], ['current users', /user|customer|account/i]];
function impactInfo(spec) {
  const sec = section(spec, 'Impact on what exists');
  const na = notApplicable(sec, '', 'Impact on what exists');
  if (na) return na.reason.length > 3 ? { problems: [], detail: `not applicable: ${na.reason}` } : { problems: ['"not applicable" needs its reason (nothing exists yet)'] };
  if (sec === null) return { problems: ['no "## Impact on what exists": existing data, contracts, tracking events, permissions and current users, each with how it is handled'] };
  const rows = rawRows(sec);
  const problems = [];
  for (const [name, re] of IMPACT_AREAS) {
    const row = rows.find((r) => re.test(r[0]));
    if (!row) problems.push(`no row for ${name}`);
    else if (!nonEmpty(row[3])) problems.push(`${name}: no handling (write "nothing to do" with the reason when nothing changes)`);
  }
  return { problems, detail: `${rows.length} areas, each with its handling` };
}

// ---------- quality of what is built (gates 4.12, 4.13, 5.9, 5.10, 6.10, 6.11) ----------

// Gate 4.12: what a machine cannot decide is written as numbered criteria, so gate 5.1 maps tests to it.
const QUALITY_AREAS = [['permissions', /permission|role|access/i], ['personal data', /personal|privacy|pii|gdpr/i], ['performance', /perform|latency|speed|budget/i]];
function qualityInfo(spec) {
  const sec = section(spec, 'Quality bar');
  if (sec === null) return { problems: ['no "## Quality bar": permissions, personal data and performance, each as numbered criteria or "not applicable" with the reason'] };
  const acs = new Set(tableRows(section(spec, 'Acceptance criteria')).map((r) => r[0]).filter((x) => /^\d+$/.test(x)));
  const rows = rawRows(sec);
  const problems = [];
  for (const [name, re] of QUALITY_AREAS) {
    const row = rows.find((r) => re.test(r[0]));
    if (!row) { problems.push(`no row for ${name}`); continue; }
    const cited = (row[1] || '').match(/\d+/g) || [];
    const why = (row[2] || '').replace(/^not applicable[\s,.:;—-]*/i, '');
    if (cited.length) { const missing = cited.filter((c) => !acs.has(c)); if (missing.length) problems.push(`${name} cites criteria that do not exist: ${missing.join(', ')}`); }
    else if (!nonEmpty(why) || why.length <= 3) problems.push(`${name}: cite the acceptance criteria that cover it, or say why it does not apply`);
  }
  return { problems, detail: `${QUALITY_AREAS.length} areas covered by criteria or a stated reason` };
}

// Gate 4.13 (product track): someone from the ICP saw the problem, the concept or the prototype before the build.
function realUsersInfo(spec) {
  const sec = section(spec, 'Real users');
  if (sec === null) return { problems: ['no "## Real users": at least one session with a person from the ICP before the build, tagged to its evidence file (or an override with the reason)'] };
  const t = tags(sec).filter((x) => ['interview', 'doc', 'data'].includes(x.cls));
  return t.length ? { problems: [], detail: `${t.length} real-user source${t.length > 1 ? 's' : ''}: ${t.map((x) => x.raw).join(', ')}` } : { problems: ['"## Real users" cites no interview, doc or data tag: a plan to talk to users is not a session'] };
}

// ---------- the product loop: stage, business, review (gates 2.7, 3.7, 3.8, 4.14, 4.15, 6.10, 6.12; review R.*) ----------

const STAGES = ['idea', 'pre-PMF', 'emerging-PMF', 'scaling'];
function productStage(product) {
  const v = (field(product || '', 'Stage') || '').toLowerCase();
  return STAGES.find((s) => v.startsWith(s.toLowerCase())) || null;
}
// Before PMF the work is learning whether there is a product; scale work waits.
const preScale = (stage) => stage === 'idea' || stage === 'pre-PMF';
function business(product) {
  const sec = section(product, 'Business');
  const revenue = field(sec || '', 'Revenue model');
  const tree = subsection(sec || '', 'Metric tree');
  const levers = rawRows(tree).map((r) => ({ name: r[0], metric: r[1] || '', current: r[2] || '', source: r[3] || '' }));
  return { sec, revenue, notForSale: /^not for sale\b/i.test(revenue || ''), levers };
}
const UNAVAILABLE = /^unavailable\b.{6,}/i;
function businessGaps(product) {
  const b = business(product);
  if (b.sec === null) return ['PRODUCT.md has no "## Business": stage exit, North Star, revenue model, growth engine and the metric tree'];
  const gaps = [];
  const stage = productStage(product);
  if (!stage) gaps.push(`**Stage:** is not one of ${STAGES.join(', ')}`);
  if (preScale(stage) && !nonEmpty(field(b.sec, 'Stage exit'))) gaps.push('no "**Stage exit:**": the thresholds that would say this product has left pre-PMF');
  for (const k of ['North Star', 'Revenue model', 'Growth engine']) if (!nonEmpty(field(b.sec, k))) gaps.push(`no "**${k}:**"`);
  if (b.levers.length < 3) gaps.push(`${b.levers.length} levers in "### Metric tree" (3 needed: how users arrive, activate, stay, pay)`);
  const blind = b.levers.filter((l) => !hasTag(l.current + ' ' + l.source) && !UNAVAILABLE.test(l.current) && !UNAVAILABLE.test(l.source));
  if (blind.length) gaps.push(`levers with neither a tagged value nor "unavailable" and the question that would fill it: ${blind.map((l) => l.name).join(', ')}`);
  return gaps;
}
const leverOf = (text, levers) => levers.find((l) => { const t = (text || '').toLowerCase(); return t.includes(l.name.toLowerCase()) || (nonEmpty(l.metric) && t.includes(l.metric.toLowerCase())); });

// Gate 3.7 (product track): how the first users arrive, what one costs, and who pays how much.
function businessCase(bet, product) {
  const b = business(product);
  if (!nonEmpty(b.revenue)) return { problems: ['PRODUCT.md → ## Business has no "**Revenue model:**" (who pays, how much, how often; or "not for sale" with why)'] };
  const sec = section(bet, 'Business case');
  if (sec === null) return { problems: ['no "## Business case": first 100 users, cost per user' + (b.notForSale ? '' : ', price and the willingness-to-pay test')] };
  const need = ['First 100 users', 'Cost per user', ...(b.notForSale ? [] : ['Price', 'Willingness to pay test'])];
  const problems = need.filter((k) => !nonEmpty(field(sec, k))).map((k) => `no "**${k}:**"`);
  return { problems, detail: b.notForSale ? 'not for sale: first users and cost per user stated' : `price ${field(sec, 'Price')}, test: ${field(sec, 'Willingness to pay test')}` };
}

// Gate 4.14 (product track, for sale): someone showed they would pay, and the stack can take the money.
const PAYMENT_LAYER = /pay|billing|checkout|subscription|invoice|fattur/i;
function moneyBeforeBuild(spec) {
  const problems = [];
  const wtp = field(spec, 'Willingness to pay');
  if (!wtp) problems.push('no "**Willingness to pay:**": what a person from the ICP did when shown the price (pre-order, letter of intent, a click on a price, a price accepted in the session), tagged');
  else if (!hasTag(wtp, ['interview', 'doc', 'data'])) problems.push('"**Willingness to pay:**" cites no interview, doc or data tag: an opinion about the price is not a test of it');
  const pay = rawRows(section(spec, 'Stack')).find((r) => PAYMENT_LAYER.test(r[0]));
  if (!pay) problems.push('no payments row in "## Stack": how the product takes money and who handles tax and invoices');
  else if (!/^(inherited|decided)\b/i.test(pay[2] || '')) problems.push(`payments layer is "${pay[2] || ''}", not inherited or decided`);
  return { problems, detail: `willingness to pay ${wtp ? 'evidenced' : 'missing'}, payments: ${pay ? pay[1] : 'missing'}` };
}

// Gate 6.10: what a release needs, plus what the product needs at its stage, from TECH.md → Operations.
function productionGaps(release, ctx) {
  const pr = section(release, 'Production readiness') || '';
  const gaps = ['Errors seen by', 'Backup restored'].filter((k) => !nonEmpty(field(pr, k))).map((k) => `"## Production readiness" has no "**${k}:**"`);
  const ops = section(read(path.join(ROOT, 'TECH.md')) || '', 'Operations');
  const stage = productStage(ctx.product);
  const need = ['Privacy'];
  if (/\*\*Model output:\*\*\s*yes/i.test(ctx.spec || '')) need.push('AI disclosure');
  if (stage && !preScale(stage)) need.push('SLO', 'Incident response', 'Cost per active user');
  const missing = need.filter((k) => !nonEmpty(field(ops || '', k)));
  if (missing.length) gaps.push(`TECH.md → "## Operations" has no ${missing.map((k) => `"**${k}:**"`).join(', ')}${stage && !preScale(stage) ? ` (stage ${stage})` : ''}`);
  return { gaps, detail: `release ready for its first incident; TECH.md → Operations covers ${need.join(', ')}` };
}

// The product review: a dated file in .builderos/reviews/, checked by `bos.mjs review`.
const REVIEWS = path.join(BOS, 'reviews');
function latestReview() {
  if (!fs.existsSync(REVIEWS)) return null;
  const f = fs.readdirSync(REVIEWS).filter((n) => /^\d{4}-\d{2}-\d{2}.*\.md$/.test(n) && validDate(n.slice(0, 10))).sort().at(-1);
  return f ? { file: path.join(REVIEWS, f), date: f.slice(0, 10) } : null;
}
const reviewEvery = (stage) => (preScale(stage) || !stage ? 7 : 31);
function reviewDue(product) {
  const last = latestReview();
  const stage = productStage(product);
  if (!last) return section(product, 'Business') === null ? 'no product review yet: run one to set the stage, the North Star and the metric tree in PRODUCT.md → ## Business' : 'no product review yet';
  const days = Math.floor((Date.now() - Date.parse(last.date)) / DAY);
  return days > reviewEvery(stage) ? `product review is due: last on ${last.date}, every ${reviewEvery(stage)} days at stage ${stage || 'unknown'}` : null;
}
function reviewConditions(text, product) {
  const R = [];
  const pass = (id, ok, detail) => R.push({ id, status: ok ? 'pass' : 'fail', detail });
  const judge = (id, detail) => R.push({ id, status: 'judge', detail });
  const bg = businessGaps(product);
  pass('R.1', bg.length === 0, bg.length ? bg.join('; ') : 'PRODUCT.md → ## Business complete');
  const levers = business(product).levers;
  const read_ = rawRows(section(text, 'Levers'));
  const unread = levers.filter((l) => !read_.some((r) => r[0].toLowerCase() === l.name.toLowerCase() && (hasTag(r.slice(1).join(' ')) || r.slice(1).some((c) => UNAVAILABLE.test(c)))));
  pass('R.2', levers.length > 0 && unread.length === 0, unread.length ? `levers not read this time (a tagged value, or "unavailable" with the question): ${unread.map((l) => l.name).join(', ')}` : `${levers.length} levers read`);
  const props = rawRows(section(text, 'Proposed initiatives'));
  const loose = props.filter((r) => !leverOf(r[1], levers));
  pass('R.3', props.length >= 1 && props.length <= 3 && loose.length === 0, props.length < 1 || props.length > 3 ? `${props.length} proposed initiatives (1 to 3)` : loose.length ? `proposals naming no lever of the tree: ${loose.map((r) => r[0]).join(', ')}` : `${props.length} proposals, each on a lever`);
  const by = field(text, 'Decided by');
  pass('R.4', nonEmpty(by) && !NOBODY.test(by), by ? `decided by ${by}` : 'no "**Decided by:**": the person picks what goes into the roadmap');
  judge('R.5', `stage ${productStage(product) || 'unknown'}: does the stage verdict follow the stage exit thresholds and the numbers read, rather than the mood?`);
  return R;
}
function review() {
  const product = read(path.join(ROOT, 'PRODUCT.md'));
  if (!product) die('no PRODUCT.md: initialize the project first');
  const f = opt('--file') ? path.resolve(ROOT, opt('--file')) : (latestReview() || {}).file;
  if (!f || !read(f)) die('no review in .builderos/reviews/: write .builderos/reviews/YYYY-MM-DD.md first');
  const results = reviewConditions(read(f), product);
  const missing = checkEvidence(read(f), [path.join(BOS, 'evidence')]);
  results.unshift({ id: 'E.1', status: missing.length ? 'fail' : 'pass', detail: missing.length ? `unresolved: ${missing.slice(0, 5).join('; ')}` : 'every tag resolves' });
  const failed = results.filter((r) => r.status === 'fail').map((r) => r.id);
  if (flag('--json')) console.log(JSON.stringify({ review: rel(f), results, failed }, null, 2));
  else {
    const mark = { pass: '✓', fail: '✗', judge: '?' };
    console.log(`## PRODUCT REVIEW (script) · ${rel(f)}\n\n| # | Result | Detail |\n|---|--------|--------|`);
    for (const r of results) console.log(`| ${r.id} | ${mark[r.status]} ${r.status} | ${String(r.detail).replace(/\|/g, '/')} |`);
    console.log(failed.length ? `\n**Failed:** ${failed.join(', ')}` : '\n**No script-decided condition failed.** Judge R.5, then regenerate the roadmap.');
  }
  process.exit(failed.length ? 1 : 0);
}

// Gate 5.9: the built interface was looked at, state by state, against the direction the person chose.
function interfaceReview(plan, ctx) {
  const vd = section(ctx.design || '', 'Visual direction');
  if (notApplicable(vd, ctx.design, 'Visual direction')) return { skip: 'no interface (visual direction not applicable)' };
  const na = notApplicable(section(plan, 'Interface review'), '', 'Interface review');
  if (na) return na.reason.length > 3 ? { problems: [], detail: `not applicable: ${na.reason}` } : { problems: ['"not applicable" needs its reason'] };
  const sec = section(plan, 'Interface review');
  if (sec === null) return { problems: ['no "## Interface review": each state of the primary flow rendered from the built product, compared with the chosen version and tokens'] };
  const rows = rawRows(sec);
  const problems = [];
  for (const st of ['empty', 'error']) if (!rows.some((r) => new RegExp(st, 'i').test(r[0]))) problems.push(`no ${st} state reviewed`);
  for (const r of rows) {
    if (!nonEmpty(r[1])) problems.push(`${r[0]}: no screenshot or route`);
    else for (const f of (r[1].match(/[\w./-]+\.(png|jpe?g|webp|gif)/gi) || [])) if (!fs.existsSync(path.join(ctx.dir, f)) && !fs.existsSync(path.join(ROOT, f))) problems.push(`${r[0]}: ${f} not found`);
    if (!/^yes\b/i.test(r[2] || '')) problems.push(`${r[0]}: does not match the chosen direction (fix it, or record the deviation in DESIGN.md and say yes)`);
  }
  return { problems, detail: `${rows.length} states reviewed against the chosen direction` };
}

// Gate 5.10: quality a machine can check runs every time, in the guardrail, not in someone's memory.
const QUALITY_CHECKS = [['accessibility', /accessib|a11y|axe/i], ['end-to-end', /end-to-end|e2e|playwright|cypress/i], ['dependency audit', /dependenc|audit/i], ['secret scan', /secret/i]];
function qualityChecks() {
  const v = field(read(path.join(ROOT, 'TECH.md')) || '', 'Quality checks');
  if (!nonEmpty(v)) return { problems: ['TECH.md names no "**Quality checks:**": accessibility, end-to-end, dependency audit and secret scan in the guardrail, each named or "n/a" with why'] };
  if (/^declined by\s+\S+.{6,}/i.test(v)) return { declined: v };
  const missing = QUALITY_CHECKS.filter(([, re]) => !re.test(v)).map(([n]) => n);
  return missing.length ? { problems: [`Quality checks does not cover: ${missing.join(', ')}`] } : { problems: [], detail: `quality checks: ${v}` };
}

// A tracking-plan row that names an event, not a "none" placeholder (in any wording: none, nessuno, n/a, a dash,
// or a row whose trigger and properties are both empty).
const DASH = /^(|[-—–]+|n\/?a)$/i;
const realEvent = (r) => {
  const name = (r[0] || '').replace(/[`*]/g, '').trim();
  if (DASH.test(name) || /^(none|no events?|nessun[oa]?|nessun evento|keine|aucun)\b/i.test(name)) return false;
  return !(DASH.test((r[1] || '').trim()) && DASH.test((r[2] || '').trim()));
};

// Gate 6.9: what this initiative settled about the product outlives its folder. Every entity it modeled is in
// the project's DOMAIN.md; a look it chose is in TECH.md's Design system.
function promotionGaps(ctx) {
  const gaps = [];
  const dm = section(ctx.design, 'Domain model');
  const dmNa = Boolean(notApplicable(dm, ctx.design, 'Domain model'));
  if (dm !== null && !dmNa) {
    const domain = (read(path.join(ROOT, 'DOMAIN.md')) || '').toLowerCase();
    const absent = rawRows(subsection(dm, 'Entities')).map((r) => r[0].replace(/[`*]/g, '').trim()).filter((e) => e && !domain.includes(e.toLowerCase()));
    if (absent.length) gaps.push(`entities not in the project's DOMAIN.md: ${absent.join(', ')}`);
  }
  const vd = section(ctx.design, 'Visual direction');
  const vdState = field(vd || ctx.design || '', 'Visual direction') || '';
  if (vd !== null && !/^(not applicable|inherited)/i.test(vdState) && nonEmpty(field(vd, 'Chosen'))) {
    const ds = section(read(path.join(ROOT, 'TECH.md')), 'Design system');
    if (ds === null || !nonEmpty(field(ds, 'Kit')) || !nonEmpty(field(ds, 'Tokens'))) gaps.push('the chosen look is not in TECH.md → "## Design system" (**Kit:** and **Tokens:** where they live in the code)');
  }
  return gaps;
}

// Gate 5.6: the modules and test seams, each explained in one plain line.
function seamGaps(plan) {
  const sec = section(plan, 'Seams');
  if (sec === null) return ['no "## Seams" section: the modules, their interfaces and where tests sit'];
  const head = ((sec.split('\n').find((l) => /^\s*\|/.test(l)) || '').split('|').map((c) => c.trim().toLowerCase()));
  const col = (name) => head.findIndex((c) => c.startsWith(name)) - 1;
  const rows = rawRows(sec);
  if (!rows.length) return ['the Seams table has no modules'];
  const gaps = [];
  for (const [label, name] of [['interface', 'interface'], ['tests at', 'tests at'], ['plain-words line', 'in plain words']]) {
    const i = col(name);
    if (i < 0) gaps.push(`the Seams table has no ${label} column`);
    else { const bad = rows.filter((r) => !nonEmpty(r[i])); if (bad.length) gaps.push(`seams with no ${label}: ${bad.map((r) => r[0]).join(', ')}`); }
  }
  return gaps;
}

// Subsections ("### Name") inside a "## " section.
function subsection(text, prefix) {
  const lines = (text || '').split('\n');
  const start = lines.findIndex((l) => /^###\s/.test(l) && l.replace(/^###\s+/, '').toLowerCase().startsWith(prefix.toLowerCase()));
  if (start < 0) return null;
  const out = [];
  for (let i = start + 1; i < lines.length && !/^###?\s/.test(lines[i]); i++) out.push(lines[i]);
  return out.join('\n');
}

function domainInfo(ctx) {
  const sec = section(ctx.design, 'Domain model');
  const na = notApplicable(sec, ctx.design, 'Domain model');
  if (na) return na.reason.length > 3 ? { problems: [], detail: `not applicable: ${na.reason}` } : { problems: ['"not applicable" needs its reason'] };
  if (sec === null) return { problems: ['no "## Domain model" in DESIGN.md: entities, transitions, invariants and data, or "not applicable" with the reason'] };
  const problems = [];
  const entities = rawRows(subsection(sec, 'Entities'));
  if (!entities.length) problems.push('no entities');
  for (const e of entities.filter((r) => /^yes/i.test(r[2] || ''))) {
    const tr = rawRows(subsection(sec, `Transitions: ${e[0]}`));
    if (!tr.length) problems.push(`${e[0]} has a lifecycle and no transitions table`);
    else if (tr.some((r) => !nonEmpty(r[2]))) problems.push(`${e[0]}: a transition with nobody allowed to trigger it`);
  }
  if (subsection(sec, 'Invariants') === null) problems.push('no invariants');
  if (!rawRows(subsection(sec, 'Data')).length) problems.push('no data sketch');
  const by = field(sec, 'Rules decided by');
  if (!nonEmpty(by) || NOBODY.test(by)) problems.push('no person under "**Rules decided by:**"');
  const proto = (field(sec, 'Prototype') || '').replace(/[`\[\]]/g, '').trim();
  if (/\.html?$/i.test(proto) && !fs.existsSync(path.join(ctx.dir, proto)) && !fs.existsSync(path.join(ROOT, proto))) problems.push(`prototype ${proto} not found`);
  return { problems, detail: `${entities.length} entities, rules decided by ${by}` };
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

// C.5 and M.1: the request carries its own source, beyond the product's evidence.
function requestEvidence(ctx, id, pass, warn) {
  const req = section(ctx.request, 'Request');
  if (!ctx.request || req === null) return pass(id, false, `no ${REQUEST} with a "## Request" section in the initiative: the request verbatim and **Evidence:** behind it`);
  const ev = field(req, 'Evidence') || '';
  const own = tags(ev).filter((t) => ['data', 'interview', 'doc'].includes(t.cls));
  if (!own.length) return pass(id, false, 'the request has no data, interview or doc tag under "**Evidence:**"');
  if (!nonEmpty(field(req, 'Population'))) return pass(id, false, 'no "**Population:**": who asked or is affected (one account, a segment, everyone)');
  const onlyRequester = own.every((t) => /^user-/.test(t.id));
  warn(id, !onlyRequester, onlyRequester ? `the only evidence is the requester's own words (${own.map((t) => t.raw).join(', ')}); a ticket, a data point or a customer's words would carry it` : `request evidenced by ${own.map((t) => t.raw).join(', ')}`);
}

// Evidence files whose Captured date is more than a year old.
function staleEvidence(text, ctx) {
  const out = [];
  for (const t of tags(text)) {
    if (!['data', 'interview', 'doc'].includes(t.cls)) continue;
    for (const id of t.cls === 'interview' ? t.id.split(',').map((x) => x.trim()) : [t.id]) {
      const f = evidenceFile([path.join(ctx.dir, 'evidence'), path.join(BOS, 'evidence')], id.replace(/[:/]/g, '-') + '.md');
      const d = ((read(f) || '').match(/\*\*Captured:\*\*\s*(\d{4}-\d{2}-\d{2})/) || [])[1];
      if (d && (Date.now() - Date.parse(d)) / DAY > 365) out.push(`${t.raw} (${d})`);
    }
  }
  return [...new Set(out)];
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
    // Code proves that something exists, never that someone has a problem: it does not count here.
    const bad = Object.entries(parts).filter(([, t]) => !t || !hasTag(t, ['data', 'interview', 'doc']) || hasTag(t, ['assumption']));
    pass('C.3', bad.length === 0, bad.length ? `no data, interview or doc tag on: ${bad.map(([k]) => k).join(', ')}` : 'all three evidenced');
    judge('C.4', 'does the request address the evidenced problem, for this ICP, and for how much of it (one account or the segment)?');
    requestEvidence(ctx, 'C.5', pass, warn);
    const old = staleEvidence(Object.values(parts).join('\n'), ctx);
    warn('C.6', old.length === 0, old.length ? `problem evidence older than a year: ${old.join(', ')}; is it still true of the product as it is now?` : 'problem evidence captured within a year');
    return R;
  }

  if (n === 'M') {
    requestEvidence(ctx, 'M.1', pass, warn);
    const md = section(a, 'Mandate') || '';
    const kind = (field(md, 'Kind') || '').toLowerCase().split(/[\s,;—-]/)[0];
    pass('M.2', MANDATE_KINDS.includes(kind), kind ? (MANDATE_KINDS.includes(kind) ? `kind: ${kind}` : `kind "${kind}" is not ${MANDATE_KINDS.join(', ')}`) : `no "**Kind:**" under ## Mandate (${MANDATE_KINDS.join(', ')})`);
    const why = field(md, 'Why no bet') || '';
    pass('M.3', why.replace(TAG_RE, '').trim().length > 10, why ? 'why no bet is stated' : 'no "**Why no bet:**": say what already fixed the solution');
    judge('M.4', 'is the solution really fixed by the mandate, with no choice between ways of solving it and no change users would notice as new behavior? Otherwise it is a feature');
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
    const feature = ctx.track === 'feature';
    const prior = (ctx.discovery || '') + '\n' + (feature ? (ctx.product || '') + '\n' + (ctx.request || '') : '');
    const priorTags = new Set(tags(prior).map((t) => t.raw));
    // On the feature track the initiative's own sources count too: the tickets and data behind this request.
    const own = (t) => feature && ['data', 'interview', 'doc'].includes(t.cls) && checkEvidence(t.raw, [path.join(ctx.dir, 'evidence')]).length === 0;
    const untraced = opps.filter((r) => !tags(r[1] || '').some((t) => priorTags.has(t.raw) || own(t)));
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
    const stage = productStage(ctx.product);
    judge('2.5', `stage ${stage || 'unknown'}: is the opportunity coherent with it?${preScale(stage) ? ' Before PMF, scale work is rejected' : ''}`);
    judge('2.6', 'could shipping the change alone hit the target? then the metric is output, not outcome');
    const levers = business(ctx.product).levers;
    const moves = field(sm, 'Moves');
    if (!levers.length) warn('2.7', false, 'PRODUCT.md has no metric tree: run a product review so each initiative names the lever it moves');
    else pass('2.7', !!leverOf(moves, levers), moves ? (leverOf(moves, levers) ? `moves ${leverOf(moves, levers).name}` : `"${moves}" is not a lever of the metric tree (${levers.map((l) => l.name).join(', ')})`) : 'no "**Moves:**" under Success metric: which lever of the metric tree this initiative moves');
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
    const raw = tableRows(section(a, 'Divergence')).filter((r) => nonEmpty(r[1]));
    const rawNeed = lite ? 5 : 8;
    pass('3.5', raw.length >= rawNeed, `${raw.length} raw ideas before convergence (${rawNeed} needed)`);
    const chosenBy = field(section(a, 'Selected') || '', 'Chosen by');
    pass('3.6', nonEmpty(chosenBy) && !/^(agent|model|claude|codex|ai|auto)/i.test(chosenBy), chosenBy ? `chosen by ${chosenBy}` : 'no "**Chosen by:**" under Selected: the person chooses the bet');
    if (ctx.track !== 'product') skip('3.7', `${ctx.track} track: the product already reaches its users and is priced`);
    else { const bc = businessCase(a, ctx.product); pass('3.7', bc.problems.length === 0, bc.problems.length ? bc.problems.join('; ') : bc.detail); }
    const stage = productStage(ctx.product);
    if (preScale(stage)) judge('3.8', `stage ${stage}: does the bet test whether there is a product, rather than scale, optimize or harden one nobody uses yet?`);
    else skip('3.8', `stage ${stage || 'unknown'}: scale work is allowed`);
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
    if (ctx.track === 'change') skip('4.4', 'change track: no phase 2 metric to compute');
    else judge('4.4', tableRows(tp).length && nonEmpty(field(tp, 'Computes the phase 2 metric')) ? 'events listed; do they compute the phase 2 metric?' : 'tracking plan or its computation line missing');
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
    const stack = stackInfo(a);
    pass('4.8', stack.problems.length === 0, stack.problems.length ? stack.problems.join('; ') : `${stack.rows} layers (${stack.decided} decided with a person), what we chose summarized`);
    const vd = visualInfo(ctx, ctx.track === 'change' ? 1 : lite ? 2 : (ctx.track === 'feature' ? 2 : 3), ctx.track === 'change');
    pass('4.9', vd.problems.length === 0, vd.problems.length ? vd.problems.join('; ') : vd.detail);
    const dm = domainInfo(ctx);
    pass('4.10', dm.problems.length === 0, dm.problems.length ? dm.problems.join('; ') : dm.detail);
    const im = impactInfo(a);
    pass('4.11', im.problems.length === 0, im.problems.length ? im.problems.join('; ') : im.detail);
    const qb = qualityInfo(a);
    pass('4.12', qb.problems.length === 0, qb.problems.length ? qb.problems.join('; ') : qb.detail);
    if (ctx.track !== 'product') skip('4.13', `${ctx.track} track: the product's users are already reachable through its evidence`);
    else { const ru = realUsersInfo(a); pass('4.13', ru.problems.length === 0, ru.problems.length ? ru.problems.join('; ') : ru.detail); }
    const biz = business(ctx.product);
    if (ctx.track !== 'product') skip('4.14', `${ctx.track} track: the product already takes money, or does not`);
    else if (biz.notForSale) skip('4.14', `not for sale: ${biz.revenue}`);
    else { const mb = moneyBeforeBuild(a); pass('4.14', mb.problems.length === 0, mb.problems.length ? mb.problems.join('; ') : mb.detail); }
    const stage = productStage(ctx.product);
    if (preScale(stage)) judge('4.15', `stage ${stage}: is anything in this spec scale work (optimization, enterprise controls, infrastructure for load nobody has) that should wait for PMF?`);
    else skip('4.15', `stage ${stage || 'unknown'}: scale work is allowed`);
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
      !nonEmpty(field(plan, 'In plain words')) && 'no "**In plain words:**" summary for the owner',
      ...seamGaps(a),
    ].filter(Boolean);
    pass('5.6', planGaps.length === 0, planGaps.length ? planGaps.join('; ') : `plan accepted ${acceptedAt}, slices name their files, ${risks.length} risks`);
    judge('5.7', 'was the plan accepted before implementation started, and does the final diff match it (or was the plan updated with the deviation)?');
    const guard = field(read(path.join(ROOT, 'TECH.md')) || '', 'Guardrail');
    // On a repository whose CI belongs to someone else, adding it is their call: a named refusal is visible, not a pass.
    if (guard && /^declined by\s+\S+.{6,}/i.test(guard)) warn('5.8', false, `no guardrail, ${guard}`);
    else pass('5.8', nonEmpty(guard) && !/^(none|no|n\/?a|—|-)\b/i.test(guard), guard ? `guardrail: ${guard}` : 'TECH.md names no "**Guardrail:**" running Verify on every change');
    const ir = interfaceReview(a, ctx);
    if (ir.skip) skip('5.9', ir.skip);
    else pass('5.9', ir.problems.length === 0, ir.problems.length ? ir.problems.join('; ') : ir.detail);
    const qc = qualityChecks();
    if (qc.declined) warn('5.10', false, `no automated quality checks, ${qc.declined}`);
    else pass('5.10', qc.problems.length === 0, qc.problems.length ? qc.problems.join('; ') : qc.detail);
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
    const vsBase = !failing.length && run.red ? redAgainstBaseline(a, ctx, run) : null;
    if (failing.length) pass('5.2', false, `not passing: ${failing.map((r) => r[0]).join(', ')}`);
    else if (vsBase) (vsBase.ok ? judge : (id, d) => pass(id, false, d))('5.2', vsBase.detail);
    else if (!run.valid) pass('5.2', false, run.detail);
    else judge('5.2', `${run.detail}; confirm the recorded command/output covers every mapped test and the current implementation`);
    const inst = tableRows(section(a, 'Instrumentation'));
    const unverified = inst.filter((r) => !/^yes/i.test(r[2] || '') || !hasTag(r[4] || '', ['data', 'code']));
    if (ctx.track === 'change' && !tableRows(section(ctx.spec, 'Tracking plan')).filter(realEvent).length) skip('5.3', 'change track with no tracking plan in the spec: nothing to instrument');
    else pass('5.3', inst.length > 0 && unverified.length === 0, inst.length === 0 ? 'no instrumentation rows' : unverified.length ? `unverified: ${unverified.map((r) => r[0]).join(', ')}` : `${inst.length} events verified`);
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
    // A change with no outcome to measure carries no baseline, measurement or review; it closes at phase 6.
    const unmeasured = ctx.track === 'change' && !bh && section(a, 'Measurement') === null && section(a, 'Outcome review') === null;
    if (unmeasured) skip('6.2', 'change track with no outcome to measure');
    else pass('6.2', ts.length >= 1 && validTimestamp(ts[0]) && validTimestamp(exposed) && Date.parse(ts[0]) < Date.parse(exposed) && brows.length > 0, `baseline captured ${ts[0] || 'missing'}, actual exposure ${exposed || 'missing'}`);
    const observed = field(exposure, 'Verification');
    pass('6.6', /^verified$/i.test(field(exposure, 'Status') || '') && validTimestamp(exposed) && Date.parse(exposed) <= Date.now() && nonEmpty(field(exposure, 'Environment')) && nonEmpty(field(exposure, 'Version')) && observed && hasTag(observed, ['data', 'doc']) && observed.replace(TAG_RE, '').trim().length > 10, 'verified exposure requires actual non-future timestamp, environment, version and observed result with data/doc evidence');
    judge('6.7', 'does the exposure evidence demonstrate the intended behavior available to users in the stated environment/version?');
    if (unmeasured) skip('6.3', 'change track with no outcome to measure');
    else pass('6.3', nonEmpty(field(section(a, 'Measurement'), 'Success metric measured by')), 'named query or dashboard');
    judge('6.4', `are the release notes written for users, not a commit list?${lite ? ' (lite: a fail is a warning)' : ''}`);
    const orv = section(a, 'Outcome review') || '';
    const reviewDate = (field(orv, 'Date') || '').match(/^\d{4}-\d{2}-\d{2}/)?.[0];
    if (unmeasured) skip('6.5', 'change track with no outcome review: the initiative closes here');
    else pass('6.5', /\*\*Owner:\*\*\s*[^·{]+\S/.test(orv) && validDate(reviewDate), 'owner and valid review Date');
    pass('6.8', nonEmpty(field(exposure, 'Authorized by')), 'Exposure verification names who authorized exposure');
    const promo = promotionGaps(ctx);
    pass('6.9', promo.length === 0, promo.length ? promo.join('; ') : 'domain and design system promoted to project memory, or nothing to promote');
    const prod = productionGaps(a, ctx);
    pass('6.10', prod.gaps.length === 0, prod.gaps.length ? prod.gaps.join('; ') : prod.detail);
    if (ctx.track !== 'product') skip('6.11', `${ctx.track} track: exposure to existing users is the use`);
    else {
      const fu = section(a, 'First real use');
      const ok = fu !== null && hasTag(fu, ['data', 'doc']);
      pass('6.11', ok, ok ? 'a person outside the team did the primary action, with its source' : 'no "## First real use" with a data or doc tag: online is not in use; phase 7 starts when someone outside the team has done the primary action');
    }
    const biz = business(ctx.product);
    if (ctx.track !== 'product') skip('6.12', `${ctx.track} track`);
    else if (biz.notForSale) skip('6.12', `not for sale: ${biz.revenue}`);
    else {
      const fp = section(a, 'First payment');
      const ok = fp !== null && hasTag(fp, ['data', 'doc']);
      pass('6.12', ok, ok ? 'a customer outside the team paid, with its source' : 'no "## First payment" with a data or doc tag: a product for sale enters phase 7 when someone has paid for it');
    }
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
    const cleanup = field(section(a, 'Decision') || '', 'Cleanup') || '';
    const bareNone = /^none\b/i.test(cleanup) && cleanup.replace(/^none[\s,.:;—-]*/i, '').length <= 3;
    pass('7.6', nonEmpty(cleanup) && !bareNone, !cleanup ? 'no "**Cleanup:**" under the decision: the flag and old path after KEEP, the shipped code after KILL, with an owner and a date, or "none" with the reason' : bareNone ? '"none" needs its reason' : `cleanup: ${cleanup}`);
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
function runEvidence(sec, ctx, label = 'Run') {
  const fail = (detail, extra = {}) => ({ valid: false, detail, ...extra });
  const p = resourceFile(field(sec, label), ctx);
  if (!p) return fail(`no existing **${label}:** JSON record; pasted runner text is not execution evidence`);
  let r;
  try { r = JSON.parse(read(p)); } catch { return fail('invalid run record JSON'); }
  if (!r || typeof r !== 'object' || Array.isArray(r)) return fail('run record is not an object');
  const log = resourceFile(r.output_file, ctx);
  if (r.schema !== 1 || r.provenance !== 'bos-run-check' || !Array.isArray(r.command) || !r.command.length || !r.command.every(x => typeof x === 'string') || typeof r.cwd !== 'string' || !nonEmpty(r.cwd) || !validTimestamp(r.started_at) || !validTimestamp(r.finished_at) || Date.parse(r.finished_at) > Date.now() || Date.parse(r.started_at) > Date.parse(r.finished_at) || !log || !Number.isInteger(r.exit_code)) return fail('incomplete execution record');
  if (!fs.existsSync(path.resolve(ROOT, r.cwd)) || !fs.statSync(path.resolve(ROOT, r.cwd)).isDirectory()) return fail('recorded cwd is unavailable');
  const output = read(log);
  if (digest(output) !== r.output_sha256) return fail('run output digest mismatch');
  // A red run is still a valid record of what happened: the baseline comparison in gate 5.2 reads it.
  const red = { red: true, record: r, output };
  if (r.exit_code !== 0) return fail(`recorded command exited ${r.exit_code}`, red);
  // Catch common failed runner summaries even when wrappers incorrectly return zero. Never infer pass from prose.
  if (/\b[1-9]\d*\s+(?:failed|failing)\b|^# fail [1-9]\d*|^not ok\b|^FAIL\b/im.test(output)) return fail('recorded runner output contains failures', red);
  return { valid: true, detail: `recorded exit 0 at ${r.finished_at} (${r.command.join(' ')})`, record: r, output };
}

// Gate 5.2 on a suite that was already red: the final run may fail only on what failed before the change,
// listed one by one, never more of them, and a separate run of the mapped tests passes.
const failCount = (out) => Math.max(0, ...[...(out || '').matchAll(/\b(\d+)\s+(?:failed|failing)\b|^# fail (\d+)/gim)].map((m) => Number(m[1] || m[2])));
function redAgainstBaseline(a, ctx, final) {
  const base = runEvidence(section(a, 'Test baseline'), ctx);
  if (!base.red) return { ok: false, detail: `${final.detail}; the baseline ${base.valid ? 'was green, so every failure is new' : 'is not a recorded red run'}` };
  if (Date.parse(base.record.started_at) >= Date.parse(final.record.started_at)) return { ok: false, detail: 'the baseline run is not earlier than the final run' };
  const pre = rawRows(section(a, 'Pre-existing failures'));
  if (!pre.length) return { ok: false, detail: `${final.detail}; list each failure the baseline already had under "## Pre-existing failures"` };
  const absent = pre.filter((r) => !base.output.includes(r[0]));
  if (absent.length) return { ok: false, detail: `listed as pre-existing but not in the baseline log: ${absent.map((r) => r[0]).join(', ')}` };
  if (failCount(final.output) > failCount(base.output)) return { ok: false, detail: `more failures than the baseline (${failCount(final.output)} vs ${failCount(base.output)})` };
  const mapped = runEvidence(section(a, 'Test output'), ctx, 'Mapped run');
  if (!mapped.valid) return { ok: false, detail: `the full suite is red as before; the mapped tests need their own green run: ${mapped.detail}` };
  return { ok: true, detail: `full suite red only on ${pre.length} pre-existing failure${pre.length > 1 ? 's' : ''}, mapped tests green (${mapped.detail}); confirm no new failure hides among them` };
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
  const n = /^[cm]$/i.test(which || '') ? which.toUpperCase() : Number(which);
  if (n !== 'C' && n !== 'M' && !(Number.isInteger(n) && n >= 0 && n <= 7)) die('gate takes a phase number 0-7, C (coverage) or M (mandate)');
  const init = resolveActive(all);
  if (!init && n !== 'C') die('no active initiative: pass --initiative <slug>');
  const dir = init ? init.dir : BOS;
  const file = n === 'C' ? path.join(ROOT, 'PRODUCT.md') : n === 'M' ? path.join(dir, REQUEST) : path.join(dir, ARTIFACTS[n]);
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
    request: init ? read(path.join(dir, REQUEST)) : null,
  };
  const results = [];
  const evDirs = [path.join(dir, 'evidence'), path.join(BOS, 'evidence')];
  const missing = checkEvidence(artifact + (n === 4 ? '\n' + (ctx.design || '') : '') + (n === 'C' ? '\n' + (ctx.request || '') : ''), evDirs);
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

function techStackGap() {
  const tech = read(path.join(ROOT, 'TECH.md'));
  if (!tech) return null;
  const rows = rawRows(section(tech, 'Stack'));
  if (!rows.length) return 'has no layers';
  const open = rows.filter((r) => !nonEmpty(r[1]) || /^(open|tbd|\?|no code yet)\b/i.test(r[1]));
  return open.length ? `has open layers (${open.map((r) => r[0]).join(', ')})` : null;
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

// Initiatives whose folder exists on another branch and not on this checkout: their state travels with a branch
// nobody here is looking at (references/builderos-state-schema.md, Where the work lives).
function branchOnlyInitiatives(all) {
  if (git('rev-parse', '--is-inside-work-tree') !== 'true') return [];
  const here = new Set(all.map((i) => i.slug));
  const current = git('rev-parse', '--abbrev-ref', 'HEAD');
  const refs = (git('for-each-ref', '--format=%(refname:short)', 'refs/heads', 'refs/remotes') || '').split('\n')
    .filter((r) => r && r !== current && !/\/HEAD$|^origin$/.test(r) && r !== `origin/${current}`).slice(0, 30);
  const found = new Map();
  for (const ref of refs) {
    for (const line of (git('ls-tree', '--name-only', ref, '.builderos/initiatives/') || '').split('\n')) {
      const slug = path.basename(line.trim());
      if (slug && !here.has(slug)) found.set(slug, [...(found.get(slug) || []), ref]);
    }
  }
  return [...found].map(([slug, rs]) => `${slug} exists only on ${rs.slice(0, 2).join(', ')}${rs.length > 2 ? ` (+${rs.length - 2})` : ''}`);
}

function lastGate(state) {
  const ph = state.phases || {};
  const done = Object.keys(ph).map(Number).filter((k) => ph[k] && ph[k].gate).sort((x, y) => y - x);
  if (!done.length) return 'no gate run yet';
  const g = ph[done[0]].gate;
  if (ph[done[0]].status === 'covered') return state.track === 'change' ? 'phases 0 to 3 covered by the mandate' : 'phases 0 and 1 covered by PRODUCT.md';
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

// Every decision file, oldest first by its Date (file name as tie-break), with its reopening condition.
function decisions() {
  const dir = path.join(BOS, 'decisions');
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir).filter((f) => f.endsWith('.md')).map((f) => {
    const md = read(path.join(dir, f)) || '';
    const date = (md.match(/^\**Date:?\**:?\s*(\d{4}-\d{2}-\d{2})/m) || f.match(/^(\d{4}-\d{2}-\d{2})/) || [])[1] || '';
    const rv = section(md, 'Revisit when');
    const revisit = rv === null || rv === undefined ? null : rv.trim();
    const revisitBy = revisit ? ((revisit.match(/\b(\d{4}-\d{2}-\d{2})\b/) || [])[1] || null) : null;
    return { name: f.replace(/\.md$/, ''), date, revisit: revisit || null, revisitBy };
  }).sort((a, b) => (a.date + a.name).localeCompare(b.date + b.name));
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
    const dec = decisions();
    if (dec.length) lines.push(`Latest decision: ${dec[dec.length - 1].name}.`);
    const status = (s.phases || {})[p] ? s.phases[p].status : 'pending';
    const coverage = p === 0 && ['feature', 'change'].includes(s.track) ? (s.track === 'change' ? `write ${REQUEST} with its mandate, then the mandate check (\`gate M\`, \`cover --m4\`)` : `write ${REQUEST} with its evidence, then the coverage check (\`gate C\`, \`cover --c4\`)`) : null;
    lines.push(`Next: ${status === 'answered' ? 'the spike is answered; reclassify to continue' : coverage || `${status === 'in_progress' ? 'finish' : 'start'} phase ${p} ${PHASES[p]} (skill: ${PHASE_SKILLS[p]})`}.`);
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
  const vs = vendoredStale();
  if (vs) attention.push(vs);
  const elsewhere = branchOnlyInitiatives(all);
  if (elsewhere.length) attention.push(`initiatives not on this checkout: ${elsewhere.join('; ')}`);
  const todayIso = new Date().toISOString().slice(0, 10);
  for (const d of decisions()) {
    if (d.revisit === null) attention.push(`decision ${d.name} has no Revisit when condition`);
    else if (d.revisitBy && d.revisitBy <= todayIso) attention.push(`decision ${d.name} asked to be revisited by ${d.revisitBy}`);
  }
  const unvalidated = ((read(path.join(ROOT, 'PRODUCT.md')) || '').match(/\[assumption:unvalidated\]/g) || []).length;
  if (unvalidated && all.some((i) => (i.state.status || 'open') !== 'closed' && (i.state.current_phase ?? 0) >= 2)) attention.push(`PRODUCT.md still rests on ${unvalidated} unvalidated assumption${unvalidated > 1 ? 's' : ''} past phase 1`);
  const stackGap = techStackGap();
  const pastShape = all.filter((i) => (i.state.status || 'open') === 'open' && (i.state.current_phase ?? 0) >= 5);
  if (stackGap && pastShape.length) attention.push(`${pastShape.map((i) => i.state.title || i.slug).join(', ')} past phase 4 while TECH.md stack ${stackGap}: decide it with the user (stack-decisions)`);
  const productText = read(path.join(ROOT, 'PRODUCT.md'));
  if (productText) { const due = reviewDue(productText); if (due) attention.push(due); }
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
  const track = opt('--track');
  if (!TRACKS.includes(track)) die('new needs --track spike|feature|change|product: classify the work and say why before creating it (references/lifecycle-setup.md, Tracks); on an existing product a change with a mandate (bug, debt, compliance, contract) is change, a new behavior to bet on is feature');
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
    schema: 2, slug, title: opt('--title') || slug, mode: opt('--mode') || (['feature', 'change'].includes(track) ? 'lite' : 'full'), track,
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
  if (init.state.status === 'closed' || init.state.current_phase !== 0) die('coverage can only be recorded at phase 0 of an open feature or change initiative');
  if (init.state.track === 'change') return coverMandate(init);
  if (init.state.track !== 'feature') die(`${init.slug} is on the ${init.state.track} track; only feature and change run a coverage check`);
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

// Change track: the mandate stands in for phases 0 to 3. A failed mandate check is the ratchet, not a dead end:
// the work moves to feature and runs the feature coverage check next.
function coverMandate(init) {
  const m4 = opt('--m4');
  if (!m4) die('M.4 is judged by the model: pass --m4 "why the mandate fixes the solution"');
  const j = JSON.parse(spawnSyncSelf(['gate', 'M', '--json', '--initiative', init.slug]) || '{}');
  if (!j.results) die(`${REQUEST} is missing: write the request, its evidence and the mandate first`);
  const now = new Date().toISOString();
  const s = init.state;
  if (j.failed.length) {
    const why = `mandate check failed: ${j.failed.join(', ')}`;
    s.track = 'feature';
    s.history.push({ at: now, event: 'track_upgraded', from: 'change', to: 'feature', reason: why });
    s.updated_at = now;
    writeJSON(path.join(init.dir, 'state.json'), s);
    roadmap();
    console.log(`${why}: ${init.slug} is now a feature, still at phase 0. Run \`gate C\`, then \`cover --c4\`.`);
    process.exit(1);
  }
  const used = [...new Set(tags(section(read(path.join(init.dir, REQUEST)), 'Request')).filter((t) => t.cls !== 'assumption' && t.cls !== 'estimate').map((t) => `${t.cls}:${t.id}`))];
  for (const k of ['0', '1', '2', '3']) {
    s.phases[k] = { status: 'covered', artifact: null, gate: { passed: true, checked_at: now, checked_by: { script: j.checked_by.script, model: ['M.4'] }, failed_conditions: [], overridden: false } };
    s.history.push({ at: now, event: 'phase_covered', phase: Number(k), tags: used, m4 });
  }
  s.phases['4'] = { status: 'in_progress', artifact: null, gate: null };
  s.current_phase = 4;
  s.updated_at = now;
  writeJSON(path.join(init.dir, 'state.json'), s);
  roadmap();
  console.log(`Mandate check passed: phases 0 to 3 covered by ${used.join(', ')}. ${init.slug} starts at phase 4.`);
}

// The ratchet, by hand: the work turned out heavier than its track. Artifacts stay on disk; the pipeline restarts
// at phase 0, where a feature runs its coverage check and a product frames the problem.
function upgrade() {
  const init = resolveActive(loadInitiatives());
  if (!init) die('no active initiative');
  const s = init.state;
  const to = opt('--to'), reason = opt('--reason');
  if (s.status === 'closed') die('a closed initiative does not change track');
  if (!['feature', 'product'].includes(to)) die('upgrade --to feature|product');
  if (!nonEmpty(reason)) die('upgrade needs --reason: the observation that showed the track was too light');
  if (s.track === 'spike') die('an answered or running spike does not upgrade; start a new initiative that reuses its evidence');
  if (TRACKS.indexOf(to) <= TRACKS.indexOf(s.track)) die(`the ratchet only goes one way: ${s.track} cannot become ${to}`);
  const now = new Date().toISOString();
  s.history.push({ at: now, event: 'track_upgraded', from: s.track, to, reason });
  s.track = to;
  s.current_phase = 0;
  for (let k = 0; k < 8; k++) s.phases[String(k)] = { status: k === 0 ? 'in_progress' : 'pending', artifact: null, gate: null };
  if (to === 'product' && s.mode === 'lite') s.mode = 'full';
  s.updated_at = now;
  writeJSON(path.join(init.dir, 'state.json'), s);
  roadmap();
  console.log(`${init.slug} is now ${to}, back at phase 0; the artifacts written so far stay where they are.${to === 'feature' ? ' Run `gate C`, then `cover --c4`.' : ''}`);
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
  // A change with no outcome review closes at phase 6; one that set a review goes to phase 7 like any other.
  const closesAtShip = n === 6 && s.track === 'change' && due === undefined && section(artifact, 'Outcome review') === null;
  if (n === 6 && !closesAtShip && (!validDate(due) || (field(section(artifact, 'Outcome review'), 'Date') || '').match(/^\d{4}-\d{2}-\d{2}/)?.[0] !== due)) die('phase 6 --review-due must match the valid outcome review date');
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
  const stops = (n === 1 && (verdict === 'killed' || spikeStop)) || (n === 7 && reenter === null) || closesAtShip;
  ph.status = spikeStop ? 'answered' : n === 1 && verdict === 'killed' ? 'killed' : 'passed';
  if (n === 6) s.review_due = due ?? null;
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

const HISTORY_EVENTS = ['track_set', 'phase_covered', 'track_upgraded', 'phase_jump', 'initiative_switched', 'paused', 'migrated', 'gate_passed', 'gate_failed', 'gate_overridden', 'review_deferred', 'cycle_started', 'closed', 'watch_checked', 'watch_breached'];

function schemaProblems(i) {
  const s = i.state, p = [];
  for (const k of ['schema', 'slug', 'title', 'status', 'current_phase', 'cycle', 'phases', 'history']) if (s[k] === undefined) p.push(`no ${k}`);
  if (s.schema !== undefined && s.schema !== 2) p.push(`schema ${s.schema}`);
  if (!['full', 'lite'].includes(s.mode)) p.push(`mode ${s.mode}`);
  if (s.track !== undefined && !TRACKS.includes(s.track)) p.push(`track ${s.track}`);
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
  const unknown = [...new Set((Array.isArray(s.history) ? s.history : []).map((h) => h && h.event).filter((e) => !HISTORY_EVENTS.includes(e)))];
  if (unknown.length) p.push(`unknown history event ${unknown.slice(0, 3).join(', ')}`);
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

// ---------- evidence import ----------

// Evidence that lives outside the session (pasted notes, an interview file, an export, a link with
// its excerpt) becomes a file the gates can resolve. The raw material is required: a link alone is
// a pointer, and a pointer to nothing is an invented source.
function evidenceAdd() {
  if (args[1] !== 'add') die('usage: evidence add --class interview|doc|data --id ID --where "call, URL, query and parameters" [--by who] [--captured YYYY-MM-DD] [--shared] [--from file]   (raw material from --from or stdin)');
  const cls = opt('--class');
  const id = opt('--id');
  const where = opt('--where');
  if (!['interview', 'doc', 'data'].includes(cls)) die('evidence add needs --class interview, doc or data (estimate and assumption need no file)');
  if (!id || /[\s\]]/.test(id)) die('evidence add needs --id without spaces, the identifier the tag will carry (P3, support-tickets-aug, posthog:funnel_q3)');
  if (cls === 'interview' && id.includes(',')) die('one participant per file: add P1 and P4 separately, then cite [interview:P1,P4]');
  if (!nonEmpty(where)) die('evidence add needs --where: the call, the ticket URL, the query tool and parameters, or the file path it came from');
  const captured = opt('--captured') || new Date().toISOString().slice(0, 10);
  if (!validDate(captured) || Date.parse(captured) > Date.now()) die('--captured must be a real date, not in the future');
  const from = opt('--from');
  let raw = '';
  if (from) { raw = read(path.resolve(from)); if (raw === null) die(`--from ${from} does not exist`); }
  else { try { raw = fs.readFileSync(0, 'utf8'); } catch { raw = ''; } }
  if (raw.trim().length < 20) die('the raw material is missing or too short: paste the notes, the quotes, the query output or the excerpt itself, not a summary or a bare link');
  let dir;
  if (flag('--shared')) dir = path.join(BOS, 'evidence');
  else {
    const active = resolveActive(loadInitiatives());
    if (!active) die('no active initiative: pass --shared for evidence behind PRODUCT.md, DOMAIN.md or TECH.md, or select an initiative');
    dir = path.join(INIT_DIR, active.slug, 'evidence');
  }
  if (!fs.existsSync(BOS)) die('no .builderos/ here: initialize the project first');
  fs.mkdirSync(dir, { recursive: true });
  const file = path.join(dir, id.replace(/[:/]/g, '-') + '.md');
  if (fs.existsSync(file)) die(`${rel(file)} already exists: evidence files are never overwritten; use a new id`);
  const by = opt('--by') || 'the user';
  fs.writeFileSync(file, `# ${id}\n\n**Class:** ${cls}\n**Captured:** ${captured} · **By:** ${by} · **Where:** ${where}\n\n${raw.trim()}\n`);
  console.log(`Saved ${rel(file)}. Cite it as [${cls}:${id}].`);
}

// ---------- project copy and host guard ----------

const SELF = fileURLToPath(import.meta.url);
const VENDORED = path.join(BOS, 'bin', 'bos.mjs');

// A cloud session or a teammate's checkout may have no plugin: the script travels with the project.
function vendor() {
  if (!fs.existsSync(BOS)) die('no .builderos/ here: initialize the project first');
  if (path.resolve(SELF) === path.resolve(VENDORED)) { console.log('Already running the project copy; run vendor from the installed plugin to refresh it.'); return; }
  fs.mkdirSync(path.dirname(VENDORED), { recursive: true });
  fs.copyFileSync(SELF, VENDORED);
  console.log(`Copied the BuilderOS script to ${rel(VENDORED)}: run \`node ${rel(VENDORED)} brief\` where the plugin is not installed.`);
}

function vendoredStale() {
  if (!fs.existsSync(VENDORED) || path.resolve(SELF) === path.resolve(VENDORED)) return null;
  const digest = (f) => createHash('sha256').update(fs.readFileSync(f)).digest('hex');
  return digest(VENDORED) === digest(SELF) ? null : `${rel(VENDORED)} differs from the installed script; refresh it with \`bos.mjs vendor\``;
}

const STATE_PATH = /(^|[\\/])\.builderos[\\/](initiatives[\\/][^\\/]+[\\/])?state\.json$/;

// PreToolUse hook: state is written by this script every time, enforced by the host rather than
// remembered by the model. Any doubt or error lets the edit through: the skill stays the floor.
function guard() {
  let input = {};
  try { input = JSON.parse(fs.readFileSync(0, 'utf8') || '{}'); } catch { return; }
  const file = (input.tool_input || {}).file_path || (input.tool_input || {}).notebook_path;
  if (!file || typeof file !== 'string') return;
  const abs = path.resolve(input.cwd || ROOT, file);
  const decide = (decision, reason) => console.log(JSON.stringify({ hookSpecificOutput: { hookEventName: 'PreToolUse', permissionDecision: decision, permissionDecisionReason: reason } }));
  if (STATE_PATH.test(abs)) {
    decide('deny', 'BuilderOS state is written by its script, never by hand: use bos.mjs new, cover, upgrade, record, defer-review or watch from the project root (the BuilderOS script line at session start, or node .builderos/bin/bos.mjs). The script writes the history events and gate results the schema requires.');
    return;
  }
}

// UserPromptSubmit hook: one line per message, so the check against standing conditions happens
// at every request and not only when the session starts. Silent outside an active initiative.
function context() {
  try { fs.readFileSync(0, 'utf8'); } catch { /* the prompt itself is not needed */ }
  if (!fs.existsSync(INIT_DIR)) return;
  let active;
  try { active = resolveActive(loadInitiatives()); } catch { return; }
  if (!active || (active.state.status || 'open') !== 'open') return;
  const s = active.state;
  const p = s.current_phase ?? 0;
  const dir = path.join(INIT_DIR, active.slug);
  const listItems = (text) => (text || '').split('\n').filter((l) => /^\s*([-*]|\d+\.)\s+\S/.test(l) || (/^\s*\|/.test(l) && !/^\s*\|\s*:?-{2,}/.test(l))).length;
  const nonGoals = listItems(section(read(path.join(ROOT, 'PRODUCT.md')) || '', 'Non-Goals'));
  const oos = tableRows(section(read(path.join(dir, '04-spec.md')) || '', 'Out of scope')).filter((r) => nonEmpty(r[0])).length;
  const bits = [`BuilderOS · ${s.title || active.slug}: phase ${p} ${PHASES[p]} (${s.track || 'product'} track), ${lastGate(s)}`];
  const accepted = p === 5 && /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(field(section(read(path.join(dir, '05-build-plan.md')) || '', 'Plan') || '', 'Accepted') || '');
  if (accepted) bits.push('build plan accepted');
  else if (p <= 5) bits.push('no product code for this initiative until its build plan is accepted, even if asked to skip: offer to finish the gate, a change, or an override recorded with the person\'s reason');
  const ov = overrides(s);
  if (ov.length) bits.push(`overrides in force: phase ${ov.join('; phase ')}`);
  const against = ['decisions/', `the PRODUCT.md non-goals${nonGoals ? ` (${nonGoals})` : ''}`, 'the conditions earlier phases set'];
  if (oos) against.push(`the spec's out-of-scope (${oos} items)`);
  bits.push(`If this message asks for product work, check it against ${against.join(', ')}; name a collision in at most two lines, then continue`);
  console.log(JSON.stringify({ hookSpecificOutput: { hookEventName: 'UserPromptSubmit', additionalContext: bits.join('. ') + '.' } }));
}

// ---------- main ----------

const cmd = args[0];
if (cmd === 'brief') brief();
else if (cmd === 'gate') runGate(args[1]);
else if (cmd === 'run-check') runCheck();
else if (cmd === 'roadmap') roadmap();
else if (cmd === 'new') newInitiative(args[1]);
else if (cmd === 'cover') cover();
else if (cmd === 'upgrade') upgrade();
else if (cmd === 'record') record(args[1]);
else if (cmd === 'defer-review') deferReview();
else if (cmd === 'migrate') migrate();
else if (cmd === 'pace') pace();
else if (cmd === 'watch') watch();
else if (cmd === 'vendor') vendor();
else if (cmd === 'guard') guard();
else if (cmd === 'context') context();
else if (cmd === 'evidence') evidenceAdd();
else if (cmd === 'review') review();
else {
  console.log('usage: node bos.mjs brief | gate <0-7|C|M> [--json] | new <slug> --title t --track k | cover --c4 reason | cover --m4 reason | upgrade --to feature|product --reason text | record <0-7> --judged ids | run-check --label slug -- executable args... | defer-review --review-due date --reason text | roadmap | migrate | pace | vendor | guard (PreToolUse hook, reads stdin) | context (UserPromptSubmit hook) | evidence add --class c --id id --where w [--shared] [--from file] | review [--file f] [--json] | watch --note text (--recheck date | --clear --breach slug)   [--initiative slug] [--root dir]');
  process.exit(cmd ? 2 : 0);
}
