#!/usr/bin/env node
// BuilderOS project script. Node built-ins only.
// Run from the project root (the directory holding PRODUCT.md and .builderos/).
//
//   node bos.mjs brief                     session briefing, with the attention line
//   node bos.mjs gate <0-7|C|M> [--json]   script-decided gate conditions; the rest listed as judge
//   node bos.mjs init                      first run: .builderos/ folders, an empty ROADMAP.md, the .gitignore lines
//   node bos.mjs new <slug> --title "..." --track spike|feature|change|product [--mode full|lite] [--reason "..."]
//                                          create an initiative with a valid state.json and make it active
//   node bos.mjs resume <slug> [--reason "..."]   make a paused initiative the active one again
//   node bos.mjs reframe --reason "..."    a new cycle from phase 0, keeping the history
//   node bos.mjs jump <0-7> --reason "..." a forced move: back reopens phases, forward records them overridden, not run
//   node bos.mjs cover --c4 "reason"       feature track: run the coverage check on PRODUCT.md and 00-request.md and, if it
//                                          passes, record phases 0 and 1 as covered and start at phase 2 (C.4 is the model's call)
//   node bos.mjs cover --m4 "reason"       change track: run the mandate check on 00-request.md and, if it passes, record
//                                          phases 0 to 3 as covered and start at phase 4; a failure moves the work to feature
//   node bos.mjs upgrade --to feature|product --reason "..."
//                                          the ratchet: move the active initiative to a heavier track and restart at phase 0
//   node bos.mjs record <0-7> --judged "id=pass|fail,..." [--accepted-by "who"] [--verdict v] [--override reason [--waive ids]] [--review-due date] [--reenter N]
//   node bos.mjs record <0-6> --kill "reason"   end the initiative at the phase it is in, in the person's words
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
//   node bos.mjs roadmap                   regenerate the Now and Done tables of ROADMAP.md, and the project page
//   node bos.mjs page                      write .builderos/index.html: initiatives, what waits on a person, links to every
//                                          document, design, prototype, demo and preview; the roadmap regenerates it
//   node bos.mjs map [slug]                a wayfinding map's destination, decisions so far, frontier, claimed and blocked
//                                          tickets and the fog (.builderos/maps/{slug}/); every open map without a slug
//   node bos.mjs grill [name]              a question log's next number, open questions, answers to ask again because
//                                          what they rest on was replaced, and a broken log; every log without a name
//   node bos.mjs migrate                   move a schema 1 .builderos/state.json to schema 2
//   node bos.mjs doctor                    check the install, the project memory, every initiative's state, and the
//                                          conditions added since each passed gate that its artifact does not meet yet
//   node bos.mjs claim --by "who" [--release | --take --reason "..."]
//                                          one owner per initiative at a time, so two sessions do not write one state
//   node bos.mjs round --asked N | --answered "1B, 2A" --by "who"
//                                          record a round of questions put to the person, and its answer
//   node bos.mjs flows [--apply file]      write design/flows.html, where the person edits each Mermaid diagram of
//                                          DESIGN.md with a live preview; --apply writes the edited blocks back
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

// The BuilderOS release this script belongs to, stamped on every gate record. Kept equal to package.json by a test.
const VERSION = '3.3.0';
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
// A decision the person made: a `**Chosen by:**` line naming someone, never the agent.
const AGENT_NAME = /^(agent|model|claude|codex|ai|auto)\b/i;
function chosenBy(sec, what) {
  const by = field(sec || '', 'Chosen by');
  if (!nonEmpty(by) || AGENT_NAME.test(by)) return { ok: false, detail: by ? `"${by}" is the agent: the person chooses ${what}` : `no "**Chosen by:**": the person chooses ${what}` };
  const w = personWords(by, 'Chosen by');
  return { ok: w.ok, detail: w.ok ? `chosen by ${by}${w.note}` : w.problem };
}

// The person's messages, appended by the UserPromptSubmit hook (`context`) and by nothing else: the guard
// denies hand edits. A field that says a person decided must quote one of them. Where the host runs no
// hook there is no log, and the field passes marked unverified.
const PERSON_LOG = path.join(BOS, 'person-log.jsonl');
const normWords = (t) => String(t).toLowerCase().normalize('NFKD').replace(/[^\p{L}\p{N}]+/gu, ' ').trim();
function personLog() {
  if (!fs.existsSync(PERSON_LOG)) return null;
  return fs.readFileSync(PERSON_LOG, 'utf8').split('\n').map((l) => { try { return normWords(JSON.parse(l).text || ''); } catch { return ''; } }).filter(Boolean);
}
const QUOTED = /["“«]([^"”»]{2,})["”»]/g;
function personWords(value, label) {
  const log = personLog();
  if (!log) return { ok: true, note: ' (not verified: no person log on this host)' };
  const quotes = [...String(value || '').matchAll(QUOTED)].map((m) => m[1]).filter((q) => normWords(q));
  if (!quotes.length) return { ok: false, problem: `"**${label}:** ${value}" quotes no message of the person: copy their words, in quotes, from what they wrote` };
  const unheard = quotes.filter((q) => !log.some((m) => m.includes(normWords(q))));
  if (unheard.length) return { ok: false, problem: `"**${label}:**" quotes words the person never wrote in this project: ${unheard.map((q) => `"${q}"`).join(', ')}` };
  return { ok: true, note: `, in their words` };
}

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
  const hollowVersions = versions.map((r) => (r[2] || '').replace(/[`\[\]]/g, '').replace(/\(.*\)/, '').trim())
    .filter((f) => /\.(html?|png|jpe?g|svg|pdf)$/i.test(f) && !missing.includes(f)).map((f) => [f, whyNot(f, ctx)]).filter(([, why]) => why);
  if (hollowVersions.length) problems.push(`version files that hold no design: ${hollowVersions.map(([f, why]) => `${f} ${why}`).join(', ')}`);
  // Craft: real screens studied before rendering, and each version naming the generic default it steers away from.
  if (need >= 2) {
    const refs = field(sec, 'References') || '';
    const named = (refs.match(/[\w./-]+\.(png|jpe?g|webp|gif|svg|html?|pdf)/gi) || []).filter((f) => located(f, ctx));
    const files = named.filter((f) => !whyNot(f, ctx));
    const hollowRefs = named.filter((f) => whyNot(f, ctx));
    if (hollowRefs.length) problems.push(`reference screens that are not screens: ${hollowRefs.map((f) => `${f} ${whyNot(f, ctx)}`).join(', ')}`);
    const found = new Set([...files, ...tags(refs).filter((t) => t.cls === 'doc').map((t) => t.raw)]).size;
    const want = ctx.track === 'product' && ctx.mode !== 'lite' ? 3 : 2;
    if (found < want) problems.push(`${found} reference screens found under "**References:**" (${want} needed): real products the ICP knows, saved before the versions`);
    const header = ((sec.split(/\*\*Tokens/)[0].split('\n').find((l) => /^\s*\|/.test(l)) || '').split('|').map((c) => c.trim()).filter(Boolean));
    const col = header.findIndex((c) => /avoid/i.test(c));
    if (col < 0) problems.push('the versions table has no "Avoids" column: the generic default each version steers away from');
    else { const silent = versions.filter((r) => !nonEmpty(r[col])); if (silent.length) problems.push(`versions naming no default they avoid: ${silent.map((r) => r[0]).join(', ')}`); }
  }
  for (const label of ['Chosen', 'Chosen by', 'Design kit']) if (!nonEmpty(field(sec, label))) problems.push(`no "**${label}:**"`);
  const by = field(sec, 'Chosen by');
  if (by && NOBODY.test(by)) problems.push('the look was not chosen by a person');
  else if (nonEmpty(by)) { const w = personWords(by, 'Chosen by'); if (!w.ok) problems.push(w.problem); }
  if (!/\*\*Tokens:?\*\*/i.test(sec) || !rawRows(sec.split(/\*\*Tokens:?\*\*/i)[1] || '').some((r) => nonEmpty(r[1]))) problems.push('no tokens extracted from the chosen version');
  return { problems, detail: `${versions.length} versions, chosen by ${by}, kit: ${field(sec, 'Design kit')}` };
}

// Gate 4.11: what the change does to what already exists. Five areas, each with how it is handled.
const IMPACT_AREAS = [['existing data', /data|record|row/i], ['contracts', /contract|api|webhook|export|integration/i], ['tracking events', /event|tracking|analytics/i], ['permissions', /permission|role|access|plan/i], ['current users', /user|customer|account/i]];
function impactInfo(spec, track) {
  const sec = section(spec, 'Impact on what exists');
  // A change answers only for what it touches, and for the users who meet it.
  const kinds = track === 'change' ? touches(spec) : null;
  const tracked = tableRows(section(spec, 'Tracking plan')).filter(realEvent).length > 0;
  const areas = kinds ? IMPACT_AREAS.filter(([name]) => name === 'current users' || (name === 'existing data' && kinds.some((k) => /data/.test(k))) || (name === 'contracts' && kinds.includes('contracts')) || (name === 'permissions' && kinds.includes('permissions')) || (name === 'tracking events' && tracked)) : IMPACT_AREAS;
  const na = notApplicable(sec, '', 'Impact on what exists');
  if (na) return na.reason.length > 3 ? { problems: [], detail: `not applicable: ${na.reason}` } : { problems: ['"not applicable" needs its reason (nothing exists yet)'] };
  if (sec === null) return { problems: ['no "## Impact on what exists": existing data, contracts, tracking events, permissions and current users, each with how it is handled'] };
  const rows = rawRows(sec);
  const problems = [];
  for (const [name, re] of areas) {
    const row = rows.find((r) => re.test(r[0]));
    if (!row) problems.push(`no row for ${name}`);
    else if (!nonEmpty(row[3])) problems.push(`${name}: no handling (write "nothing to do" with the reason when nothing changes)`);
  }
  return { problems, detail: `${rows.length} areas, each with its handling${kinds ? ` (the change answers for ${areas.map(([n]) => n).join(', ')})` : ''}` };
}

// ---------- agent behavior and the first day (gates 4.16, 4.17) ----------

// Gate 4.16: a product whose output comes from a model says what it may do alone, where it hands to a person,
// what can reach it from outside, and what happens when the model is slow, down or wrong.
const AUTONOMY = ['does', 'proposes', 'asks', 'never'];
function agentInfo(spec, ctx) {
  const sec = section(spec, 'Agent behavior');
  if (sec === null) return { problems: ['no "## Agent behavior": autonomy per action, hand-off, injection surfaces, degradation and the latency budget (agent-design)'] };
  const problems = [];
  const acs = new Set(tableRows(section(spec, 'Acceptance criteria')).map((r) => r[0]).filter((x) => /^\d+$/.test(x)));
  const actions = rawRows(sec.split(/^###\s/m)[0]);
  if (!actions.length) problems.push('the autonomy table has no actions');
  for (const r of actions) {
    const level = (r[1] || '').toLowerCase().split(/[\s,;.]/)[0];
    if (!AUTONOMY.includes(level)) { problems.push(`${r[0]}: autonomy "${r[1] || ''}" is not ${AUTONOMY.join(', ')}`); continue; }
    const cited = (r[3] || '').match(/\d+/g) || [];
    if (level === 'asks' && !cited.some((c) => acs.has(c))) problems.push(`${r[0]}: an action that asks the person needs an acceptance criterion that tests the asking`);
  }
  for (const label of ['Hand-off', 'Degradation']) if (!nonEmpty(lineField(sec, label))) problems.push(`no "**${label}:**"`);
  if (!/\d/.test(lineField(sec, 'Latency budget') || '')) problems.push('no "**Latency budget:**" with a number per turn');
  const inj = subsection(sec, 'Injection surfaces');
  if (inj === null) problems.push('no "### Injection surfaces": every input the model reads that someone else can write');
  else {
    const rows = rawRows(inj);
    const ev = evalInfo(ctx);
    const mustPass = new Set(ev.valid ? ev.mustPassIds : []);
    if (!rows.length) problems.push('no injection surface listed: the person typing is one too');
    for (const r of rows) {
      if (!nonEmpty(r[2])) problems.push(`${r[0]}: no mitigation`);
      const id = (r[3] || '').replace(/[`\s]/g, '');
      if (!id) problems.push(`${r[0]}: no eval case`);
      else if (!mustPass.has(id)) problems.push(`${r[0]}: eval case ${id} is not a must-pass case in the dataset`);
    }
  }
  return { problems, detail: `${actions.length} actions with their autonomy, hand-off, degradation, latency budget, injection surfaces each with a must-pass case` };
}

// Gate 4.17 (product track): the first day is designed, from the first visit to the first useful outcome,
// and the moment that counts as activated is a criterion and an event.
function firstDayInfo(ctx) {
  const flows = section(ctx.design || '', 'Flows');
  const problems = [];
  if (subsection(flows || '', 'First day') === null) problems.push('no "### First day" flow in DESIGN.md → ## Flows: from the first visit to the first useful outcome');
  const act = field(ctx.artifact || '', 'Activation');
  if (!nonEmpty(act)) problems.push('no "**Activation:**" in the spec: the acceptance criterion that marks the first useful outcome and the event that measures it');
  else {
    const acs = new Set(tableRows(section(ctx.artifact, 'Acceptance criteria')).map((r) => r[0]).filter((x) => /^\d+$/.test(x)));
    const events = tableRows(section(ctx.artifact, 'Tracking plan')).map((r) => r[0].replace(/`/g, '').trim()).filter(Boolean);
    if (!(act.match(/\d+/g) || []).some((c) => acs.has(c))) problems.push('"**Activation:**" cites no acceptance criterion that exists');
    if (!events.some((e) => act.includes(e))) problems.push('"**Activation:**" names no event from the tracking plan');
  }
  return { problems, detail: 'first day designed, activation is a criterion and a tracked event' };
}

// ---------- diagrams and the demo (gates 4.20, 5.15) ----------

const mermaidBlocks = (text) => [...(text || '').matchAll(/```mermaid[^\n]*\n([\s\S]*?)```/g)].map((m) => m[1]);
const diagramKind = (block) => ((block.split('\n').find((l) => l.trim() && !/^\s*%%/.test(l)) || '').trim().split(/\s/)[0] || '').toLowerCase();
const ARROW = /-->|-\.->|==>|--[^-\n>|]+-->|---/g;
const squash = (s) => String(s || '').toLowerCase().replace(/[\s_`*-]+/g, '');
// Every "### {name}" block inside a "## " section, in order.
function subsections(text) {
  const out = [];
  for (const line of (text || '').split('\n')) {
    if (/^###\s/.test(line)) out.push({ name: line.replace(/^###\s+/, '').trim(), lines: [] });
    else if (/^##\s/.test(line)) break;
    else if (out.length) out.at(-1).lines.push(line);
  }
  return out.map(({ name, lines }) => ({ name, body: lines.join('\n') }));
}

// Gate 4.20: each flow is drawn as well as tabled, and each lifecycle as a state diagram that agrees with its table.
function diagramInfo(ctx) {
  const flows = section(ctx.design || '', 'Flows');
  if (flows === null) return { problems: ['no "## Flows" in DESIGN.md: each flow with its steps table and its Mermaid flowchart'] };
  const problems = [];
  const subs = subsections(flows);
  if (!subs.length) problems.push('no "### {flow}" under ## Flows');
  for (const s of subs) {
    const chart = mermaidBlocks(s.body).find((b) => ['flowchart', 'graph'].includes(diagramKind(b)));
    if (!chart) { problems.push(`${s.name}: no Mermaid flowchart`); continue; }
    const arrows = (chart.match(ARROW) || []).length;
    if (arrows < 2) problems.push(`${s.name}: the flowchart has ${arrows} arrow${arrows === 1 ? '' : 's'}; draw the entry, the steps and both exits`);
    const branches = rawRows(s.body).some((r) => nonEmpty(r[3]) && !/^(none|no|—|-|–|n\/?a)$/i.test(r[3]));
    if (branches && !/[A-Za-z0-9_]\{[^}]+\}/.test(chart)) problems.push(`${s.name}: the table has branches and the flowchart draws no decision`);
  }
  let lifecycles = 0;
  const dm = section(ctx.design || '', 'Domain model');
  if (dm !== null && !notApplicable(dm, ctx.design, 'Domain model')) {
    for (const e of rawRows(subsection(dm, 'Entities')).filter((r) => /^yes/i.test(r[2] || ''))) {
      const sub = subsection(dm, `Transitions: ${e[0]}`);
      if (sub === null) continue; // gate 4.10 asks for the table
      lifecycles++;
      const chart = mermaidBlocks(sub).find((b) => diagramKind(b).startsWith('statediagram'));
      if (!chart) { problems.push(`${e[0]}: no Mermaid stateDiagram for its transitions`); continue; }
      const drawn = squash(chart);
      const states = [...new Set(rawRows(sub).flatMap((r) => [r[0], r[1]]).filter((x) => nonEmpty(x) && !/^\[\*\]$|^(start|end|none|—|-)$/i.test(x)))];
      const missing = states.filter((x) => !drawn.includes(squash(x)));
      if (missing.length) problems.push(`${e[0]}: states in the table and not in the diagram: ${missing.join(', ')}`);
    }
  }
  return { problems, detail: `${subs.length} flow${subs.length === 1 ? '' : 's'} drawn as flowcharts${lifecycles ? `, ${lifecycles} lifecycle${lifecycles === 1 ? '' : 's'} as state diagrams matching their tables` : ''}` };
}

// ---------- flows: an editable page for the diagrams, and the edits back into DESIGN.md ----------

// The page loads its libraries from a CDN, pinned, and installs nothing in the project. Pele (MIT) renders Mermaid
// to SVG beside the text. Excalidraw (MIT) is the hand-drawn canvas: its Mermaid importer lays a flowchart out as
// boxes and arrows the person drags, adds and relabels, and the page turns the drawing back into a flowchart.
// Offline, the text stays editable.
const LIBS = {
  pele: 'https://esm.sh/pele@1.3.0',
  react: 'https://esm.sh/react@19.3.0',
  'react/jsx-runtime': 'https://esm.sh/react@19.3.0/jsx-runtime',
  'react-dom': 'https://esm.sh/react-dom@19.3.0',
  'react-dom/client': 'https://esm.sh/react-dom@19.3.0/client',
  '@excalidraw/excalidraw': 'https://esm.sh/@excalidraw/excalidraw@0.18.1/dist/prod/index.js?external=react,react-dom',
  '@excalidraw/mermaid-to-excalidraw': 'https://esm.sh/@excalidraw/mermaid-to-excalidraw@2.2.2',
};
const EXCALIDRAW_ASSETS = 'https://esm.sh/@excalidraw/excalidraw@0.18.1/dist/prod/';

// Every Mermaid block DESIGN.md holds under ## Flows and ## Domain model, keyed "Section › Subsection" and,
// when one subsection holds several, "#2", "#3".
function designDiagrams(design) {
  const out = [];
  for (const top of ['Flows', 'Domain model']) {
    for (const sub of subsections(section(design, top))) {
      mermaidBlocks(sub.body).forEach((src, i) => out.push({ key: `${top} › ${sub.name}${i ? ` #${i + 1}` : ''}`, top, sub: sub.name, index: i, src: src.replace(/\s+$/, '') }));
    }
  }
  return out;
}

// A drawing back into a flowchart: every box, diamond and ellipse is a node with its text, every arrow attached at
// both ends an edge with its label, a dashed arrow an abandonment. Runs in the page; kept here so a test can run it.
function canvasToMermaid(elements, direction = 'TD') {
  const live = elements.filter((e) => !e.isDeleted);
  const textOf = (id) => live.filter((e) => e.type === 'text' && e.containerId === id).map((e) => e.text).join(' ').replace(/\s+/g, ' ').trim();
  const q = (t) => `"${t.replace(/"/g, '#quot;')}"`;
  const shapes = live.filter((e) => ['rectangle', 'diamond', 'ellipse'].includes(e.type)).sort((a, b) => a.y - b.y || a.x - b.x);
  const ids = new Map(shapes.map((e, i) => [e.id, `n${i + 1}`]));
  const lines = [`flowchart ${direction}`];
  for (const e of shapes) {
    const t = q(textOf(e.id) || ' ');
    lines.push(`  ${ids.get(e.id)}${e.type === 'diamond' ? `{${t}}` : e.type === 'ellipse' ? `([${t}])` : `[${t}]`}`);
  }
  let loose = 0;
  for (const a of live.filter((e) => e.type === 'arrow')) {
    const from = ids.get(a.startBinding && a.startBinding.elementId), to = ids.get(a.endBinding && a.endBinding.elementId);
    if (!from || !to) { loose++; continue; }
    const label = textOf(a.id);
    lines.push(`  ${from} ${a.strokeStyle && a.strokeStyle !== 'solid' ? '-.->' : '-->'}${label ? `|${q(label)}|` : ''} ${to}`);
  }
  return { text: lines.join('\n'), loose };
}

const PAGE_SCRIPT = String.raw`
const data = JSON.parse(document.getElementById('diagrams').textContent);
const canvasToMermaid = CANVAS_TO_MERMAID;
const $ = (id) => document.getElementById(id);
const say = (m) => { $('note').textContent = m; };
let render = null, lib = null;
try { ({ render } = await import('pele')); } catch { say('Offline: the drawings did not load; the text is still editable.'); }
try {
  const [React, ReactDOM, Ex, M2E] = await Promise.all([import('react'), import('react-dom/client'), import('@excalidraw/excalidraw'), import('@excalidraw/mermaid-to-excalidraw')]);
  lib = { React, ReactDOM, Ex, M2E };
} catch { /* the canvas needs the network; the text and its drawing still work */ }
const original = data.map((d) => d.src);
const isFlow = (src) => /^\s*(flowchart|graph)\b/m.test(src.split('\n').find((l) => l.trim() && !/^\s*%%/.test(l)) || '');
const direction = (src) => (src.match(/^\s*(?:flowchart|graph)\s+(TD|TB|BT|LR|RL)/m) || [, 'TD'])[1];
data.forEach((d, i) => {
  const card = document.createElement('section');
  card.className = 'card';
  card.innerHTML = '<h2></h2><div class="tabs"><button data-tab="draw">Draw</button><button data-tab="text">Text</button></div><div class="canvas" hidden></div><div class="pair" hidden><textarea spellcheck="false"></textarea><div class="view"></div></div><p class="err"></p>';
  card.querySelector('h2').textContent = d.key;
  $('cards').append(card);
  const area = card.querySelector('textarea'), view = card.querySelector('.view'), err = card.querySelector('.err');
  const canvasEl = card.querySelector('.canvas'), pair = card.querySelector('.pair');
  area.value = d.src;
  const draw = () => { if (!render) return; try { view.innerHTML = render(area.value).svg; err.textContent = ''; } catch (e) { err.textContent = String(e.message || e); } };
  area.addEventListener('input', () => { draw(); drawnFrom = null; });
  let api = null, drawnFrom = null, baseline = null;
  const openCanvas = async () => {
    if (drawnFrom === area.value) return;
    try {
      const { elements } = await lib.M2E.parseMermaidToExcalidraw(area.value);
      const scene = lib.Ex.convertToExcalidrawElements(elements);
      drawnFrom = area.value;
      baseline = canvasToMermaid(scene, direction(area.value)).text;
      if (api) { api.updateScene({ elements: scene }); api.scrollToContent(scene, { fitToViewport: true, viewportZoomFactor: 0.75 }); return; }
      const onChange = (els) => {
        if (drawnFrom === null) return;
        const out = canvasToMermaid(els, direction(area.value));
        // The text changes only when the drawing does: opening the canvas rewrites nothing.
        if (out.text !== baseline && out.text !== area.value) { area.value = out.text; drawnFrom = out.text; baseline = out.text; draw(); }
        err.textContent = out.loose ? out.loose + ' arrow(s) not attached at both ends are left out: drag each end onto a box.' : '';
      };
      lib.ReactDOM.createRoot(canvasEl).render(lib.React.createElement(lib.Ex.Excalidraw, { initialData: { elements: scene, scrollToContent: true }, excalidrawAPI: (a) => { api = a; (window.flowsCanvases ||= []).push(a); setTimeout(() => a.scrollToContent(a.getSceneElements(), { fitToViewport: true, viewportZoomFactor: 0.75 }), 300); }, onChange }));
    } catch (e) { err.textContent = 'The canvas could not read this diagram: ' + String(e.message || e) + '. Edit it as text.'; show('text'); }
  };
  const show = (tab) => {
    canvasEl.hidden = tab !== 'draw'; pair.hidden = tab !== 'text';
    card.querySelectorAll('.tabs button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.tab === tab)));
    if (tab === 'draw') openCanvas(); else draw();
  };
  const drawable = lib && isFlow(d.src);
  if (!drawable) card.querySelector('[data-tab="draw"]').hidden = true;
  card.querySelectorAll('.tabs button').forEach((b) => b.addEventListener('click', () => show(b.dataset.tab)));
  show(drawable ? 'draw' : 'text');
  d.area = area;
});
const changes = () => data.map((d, i) => d.area.value === original[i] ? null : '## ' + d.key + '\n\n' + '\u0060\u0060\u0060mermaid\n' + d.area.value.replace(/\s+$/, '') + '\n\u0060\u0060\u0060\n').filter(Boolean);
const text = () => { const c = changes(); return c.length ? '# Flows edited\n\n' + c.join('\n') : ''; };
$('copy').onclick = async () => { const t = text(); if (!t) return say('Nothing changed yet.'); try { await navigator.clipboard.writeText(t); say('Copied ' + changes().length + ' diagram(s).'); } catch { say('Copy blocked: use Save.'); } };
$('save').onclick = () => { const t = text(); if (!t) return say('Nothing changed yet.'); const u = URL.createObjectURL(new Blob([t], { type: 'text/markdown' })); const l = document.createElement('a'); l.href = u; l.download = 'flows-edited.md'; l.click(); URL.revokeObjectURL(u); };
`;

function flowsPage(title, diagrams, libs = LIBS) {
  const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const json = (v) => JSON.stringify(v).replace(/</g, '\\u003c');
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Flows · ${esc(title)}</title>
<script type="importmap">${json({ imports: libs })}</script>
<script>window.EXCALIDRAW_ASSET_PATH = ${json(EXCALIDRAW_ASSETS)};</script>
<link rel="stylesheet" href="${esc(EXCALIDRAW_ASSETS)}index.css">
<style>
:root{--bg:#fffcf0;--fg:#100f0f;--muted:#6f6e69;--line:#e6e4d9;--accent:#205ea6;--bad:#af3029;--pele-bg:var(--bg);--pele-fg:var(--fg);--pele-accent:var(--accent)}
@media (prefers-color-scheme:dark){:root{--bg:#100f0f;--fg:#cecdc3;--muted:#878580;--line:#343331;--accent:#4385be;--bad:#d14d41}}
[hidden]{display:none!important}*{box-sizing:border-box}body{margin:0;padding:24px 16px;background:var(--bg);color:var(--fg);font:15px/1.5 system-ui,sans-serif}
header{max-width:1200px;margin:0 auto 16px}h1{font-size:20px;margin:0 0 4px}header p{color:var(--muted);margin:0 0 12px}
button{font:inherit;padding:6px 12px;border:1px solid var(--line);border-radius:6px;background:transparent;color:var(--fg);cursor:pointer}button:focus-visible{outline:2px solid var(--accent);outline-offset:2px}button[aria-pressed=true]{border-color:var(--accent);color:var(--accent)}
.card{max-width:1200px;margin:0 auto 20px;border:1px solid var(--line);border-radius:8px;padding:12px}.card h2{font-size:15px;margin:0 0 8px}.tabs{display:flex;gap:6px;margin-bottom:8px}
.canvas{height:560px;border:1px solid var(--line);border-radius:6px;overflow:hidden}
.pair{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1.4fr);gap:12px}@media (max-width:760px){.pair{grid-template-columns:1fr}}
textarea{width:100%;min-height:260px;font:13px/1.45 ui-monospace,monospace;background:transparent;color:var(--fg);border:1px solid var(--line);border-radius:6px;padding:8px;resize:vertical}
.view{overflow:auto}.view svg{max-width:100%;height:auto}.err{color:var(--bad);font:12px ui-monospace,monospace;margin:6px 0 0;white-space:pre-wrap}
</style></head><body>
<header><h1>Flows · ${esc(title)}</h1>
<p>Draw: drag the boxes, add one from the toolbar, join two with an arrow, double-click to rename, a dashed arrow for abandonment. Text: the same flow as Mermaid, redrawn as you type. When it says what you mean, copy the changes and give them to the agent, or save them and run <code>node scripts/bos.mjs flows --apply flows-edited.md</code>. DESIGN.md stays the record; state diagrams are edited as text.</p>
<button id="copy">Copy changes</button> <button id="save">Save flows-edited.md</button> <span id="note" role="status"></span></header>
<main id="cards">${diagrams.length ? '' : '<p>No Mermaid diagrams in DESIGN.md yet.</p>'}</main>
<script type="application/json" id="diagrams">${json(diagrams.map((d) => ({ key: d.key, src: d.src })))}</script>
<script type="module">${PAGE_SCRIPT.replace('CANVAS_TO_MERMAID', canvasToMermaid.toString())}</script>
</body></html>
`;
}

function flows() {
  const init = resolveActive(loadInitiatives());
  if (!init) die('no active initiative: pass --initiative <slug>');
  const file = path.join(init.dir, 'DESIGN.md');
  const design = read(file);
  if (!design) die(`no DESIGN.md in ${rel(init.dir)}`);
  const apply = opt('--apply');
  if (!apply) {
    const diagrams = designDiagrams(design);
    const out = path.join(init.dir, 'design', 'flows.html');
    fs.mkdirSync(path.dirname(out), { recursive: true });
    fs.writeFileSync(out, flowsPage(init.state.title || init.slug, diagrams));
    console.log(`${rel(out)}: ${diagrams.length} diagram${diagrams.length === 1 ? '' : 's'} to edit. Open it in a browser.`);
    return;
  }
  const edited = read(path.resolve(ROOT, apply));
  if (!edited) die(`cannot read ${apply}`);
  const edits = [...edited.matchAll(/^##\s+(.+?)\s*\n+```mermaid[^\n]*\n([\s\S]*?)```/gm)].map((m) => ({ key: m[1].trim(), src: m[2].replace(/\s+$/, '') }));
  if (!edits.length) die(`${apply} holds no "## Section › Subsection" heading followed by a mermaid block`);
  const known = designDiagrams(design);
  const unknown = edits.filter((e) => !known.some((d) => d.key === e.key));
  if (unknown.length) die(`no diagram in DESIGN.md for: ${unknown.map((e) => e.key).join(', ')}`);
  // Replace the n-th mermaid block of the named subsection inside the named section, leaving every other line as it was.
  const lines = design.split('\n');
  let top = null, sub = null, n = -1, inBlock = false, target = null, changed = 0;
  const out = [];
  for (const line of lines) {
    if (inBlock) {
      if (/^```/.test(line)) { inBlock = false; if (target) { out.push(...target.src.split('\n')); target = null; changed++; } out.push(line); }
      else if (!target) out.push(line);
      continue;
    }
    if (/^##\s/.test(line) && !/^###/.test(line)) { top = line.replace(/^##\s+/, '').trim(); sub = null; }
    else if (/^###\s/.test(line)) { sub = line.replace(/^###\s+/, '').trim(); n = -1; }
    out.push(line);
    if (/^```mermaid/.test(line)) {
      inBlock = true; n++;
      const key = `${['Flows', 'Domain model'].find((t) => (top || '').toLowerCase().startsWith(t.toLowerCase())) || top} › ${sub}${n ? ` #${n + 1}` : ''}`;
      target = edits.find((e) => e.key === key) || null;
    }
  }
  fs.writeFileSync(file, out.join('\n'));
  console.log(`DESIGN.md: ${changed} diagram${changed === 1 ? '' : 's'} replaced. Bring each steps or transitions table in line with its drawing, then rerun gate 4.`);
}

// Gate 5.15: the feature was seen working, recorded from the end-to-end test walking its primary flow.
const VIDEO_FILE = /[\w./-]+\.(webm|mp4|mov|gif)\b/gi;
const IMAGE_FILE = /[\w./-]+\.(png|jpe?g|webp)\b/gi;
function demoInfo(plan, ctx) {
  const vd = section(ctx.design || '', 'Visual direction');
  if (notApplicable(vd, ctx.design, 'Visual direction')) return { skip: 'no interface (visual direction not applicable)' };
  if (ctx.track === 'change' && notApplicable(vd, ctx.design, 'Visual direction', 'inherited')) return { skip: 'change track: no screen changes its composition' };
  const sec = section(plan, 'Demo');
  const na = notApplicable(sec, '', 'Demo');
  if (na) return na.reason.length > 3 ? { problems: [], detail: `not applicable: ${na.reason}` } : { problems: ['"not applicable" needs its reason'] };
  if (sec === null) return { problems: ['no "## Demo": a recording of the end-to-end test walking the primary flow, from a passing run (feature-demo)'] };
  const problems = [];
  const test = field(sec, 'Test');
  if (!nonEmpty(test)) problems.push('no "**Test:**": the end-to-end test that walks the flow');
  else if (!mappedTestFile(test)) problems.push(`**Test:** ${test} is not a file in the project`);
  else if (fileProblem(mappedTestFile(test))) problems.push(`**Test:** ${test} ${fileProblem(mappedTestFile(test))}`);
  const run = runEvidence(sec, ctx);
  // The recording is the run of that test: a passing run of something else proves nothing about the flow.
  if (run.valid && nonEmpty(test) && mappedTestFile(test) && !run.record.command.some((c) => c.includes(path.basename(mappedTestFile(test))) || /playwright|cypress|test/i.test(path.basename(c)) && run.output.includes(path.basename(mappedTestFile(test))))) problems.push(`the recorded run (${run.record.command.join(' ')}) does not run ${test}`);
  const by = field(sec, 'Recorded by');
  if (!run.valid && !(nonEmpty(by) && !AGENT_NAME.test(by))) problems.push(`the recording is not from a passing run: ${run.detail}; or "**Recorded by:**" the person who recorded the screen`);
  const where = (f) => [path.join(ctx.dir, f), path.join(ROOT, f)].find((p) => fs.existsSync(p));
  const exists = (f) => Boolean(where(f));
  // Recordings stay out of the repository: a file git would commit fails. Outside a git repository nothing is committed.
  const ignored = (f) => { const r = spawnSync('git', ['check-ignore', '-q', where(f)], { cwd: ROOT }); return r.status !== 1; };
  const rows = rawRows(sec);
  if (!rows.length) problems.push('no recordings table (Flow / Recording / Shows): the primary flow at least');
  if (ctx.track === 'product' && !rows.some((r) => /first day/i.test(r[0]))) problems.push('no recording of the first day (product track)');
  let stills = 0;
  for (const r of rows) {
    const cell = r[1] || '';
    const videos = cell.match(VIDEO_FILE) || [];
    const images = cell.match(IMAGE_FILE) || [];
    const lost = [...videos, ...images].filter((f) => !exists(f));
    const tracked = [...videos, ...images].filter((f) => exists(f) && !ignored(f));
    if (tracked.length) problems.push(`${r[0]}: ${tracked.join(', ')} would go into the codebase; keep recordings in a git-ignored folder (.builderos/media/) or where the person opens them, and link them`);
    const hollowMedia = [...videos, ...images].filter((f) => exists(f) && fileProblem(where(f)));
    if (lost.length) problems.push(`${r[0]}: ${lost.join(', ')} not found`);
    else if (hollowMedia.length) problems.push(`${r[0]}: ${hollowMedia.map((f) => `${f} ${fileProblem(where(f))}`).join(', ')}`);
    else if (videos.length || /https:\/\/\S+/.test(cell)) { /* a video, in the project or where the person opens it */ }
    else if (images.length >= 2) stills++;
    else problems.push(`${r[0]}: no video file or link, nor a sequence of step screenshots from the run`);
    if (!nonEmpty(r[2])) problems.push(`${r[0]}: no "Shows": the steps and the outcome a viewer sees`);
  }
  const how = run.valid ? 'from a passing run' : `recorded by ${by}`;
  return { problems, detail: `${rows.length} flow${rows.length === 1 ? '' : 's'} recorded ${how}${stills ? `, ${stills} as step screenshots (no video)` : ''}` };
}

// ---------- the system behind the interface (gates 4.18, 4.19, 5.13, 5.14) ----------

const acNumbers = (spec) => new Set(tableRows(section(spec, 'Acceptance criteria')).map((r) => r[0]).filter((x) => /^\d+$/.test(x)));
const naReason = (cell) => (/^not applicable\b/i.test(cell || '') ? (cell || '').replace(/^not applicable[\s,.:;—-]*/i, '') : null);

// Gate 4.18: how the product fits together, fails and grows, written before the code.
const SCALE_DEFAULTS = [['owner key on every row', /owner|tenant|workspace/i], ['paginated lists', /paginat/i], ['indexed queries', /index/i], ['idempotent writes', /idempot/i], ['slow work off the request', /slow|background|job/i], ['reversible migrations', /migration/i]];
function architectureInfo(spec) {
  const sec = section(spec, 'Architecture');
  const na = notApplicable(sec, spec, 'Architecture');
  if (na) return na.reason.length > 3 ? { problems: [], detail: `not applicable: ${na.reason}` } : { problems: ['"not applicable" needs its reason (no server, no stored data, no input from other people)'] };
  if (sec === null) return { problems: ['no "## Architecture": components, contracts, external calls with timeouts, the six scale defaults and the capacity (system-design)'] };
  const problems = [];
  const comps = rawRows(subsection(sec, 'Components'));
  if (!comps.length) problems.push('no "### Components" table: each component, what it owns and what it talks to');
  for (const r of comps) if (!nonEmpty(r[1]) || !nonEmpty(r[3])) problems.push(`${r[0]}: a responsibility and what it talks to, by which mechanism`);
  if (subsection(sec, 'Contracts') === null) problems.push('no "### Contracts": every interface this work exposes, with its errors and paging');
  const ext = subsection(sec, 'External calls');
  if (ext === null) problems.push('no "### External calls": every call that leaves the process, or "none: nothing leaves the process"');
  else {
    const calls = rawRows(ext);
    if (!calls.length && !/\bnone\b/i.test(ext)) problems.push('"### External calls" lists no call and does not say none');
    for (const r of calls) {
      if (!/\d/.test(r[1] || '')) problems.push(`${r[0]}: no timeout in seconds`);
      const missing = [['retry rule', r[2]], ['idempotency', r[3]], ['failure behavior', r[4]]].filter(([, v]) => !nonEmpty(v)).map(([n]) => n);
      if (missing.length) problems.push(`${r[0]}: no ${missing.join(', ')}`);
    }
  }
  const defaults = rawRows(subsection(sec, 'Scale defaults'));
  for (const [name, re] of SCALE_DEFAULTS) {
    const row = defaults.find((r) => re.test(r[0]));
    if (!row) problems.push(`no scale default row for ${name}`);
    else if (!nonEmpty(row[1]) && (!nonEmpty(row[2]) || row[2].length <= 3)) problems.push(`${name}: how this design does it, or why it does not apply`);
  }
  if (!/\d/.test(lineField(sec, 'Capacity') || '')) problems.push('no "**Capacity:**" with numbers: the expected load at this stage and the target at ten times it');
  return { problems, detail: `${comps.length} components, external calls planned for failure, ${SCALE_DEFAULTS.length} scale defaults, capacity ${lineField(sec, 'Capacity')}` };
}

// Gate 4.19: who could break it, and the test that shows they cannot. Four threats always get a row.
const STANDING_THREATS = [['another user\'s or customer\'s data', /another|other (user|customer|tenant|workspace|account)|cross|someone else|access/i], ['untrusted input', /input|inject|upload|payload|malformed|script/i], ['abuse', /abuse|rate|brute|stuffing|spam|flood|scrap/i], ['secrets', /secret|credential|api key|\bkeys?\b|token/i]];
function threatInfo(spec) {
  const sec = section(spec, 'Threat model');
  const na = notApplicable(sec, spec, 'Threat model');
  if (na) return na.reason.length > 3 ? { problems: [], detail: `not applicable: ${na.reason}` } : { problems: ['"not applicable" needs its reason (no server, no stored data, no input from other people)'] };
  if (sec === null) return { problems: ['no "## Threat model": the trust boundaries and, per threat, a mitigation and the criterion that tests it (system-design)'] };
  const problems = [];
  if (!nonEmpty(lineField(sec, 'Boundaries'))) problems.push('no "**Boundaries:**": each trust boundary in one line');
  const acs = acNumbers(spec);
  const rows = rawRows(sec);
  for (const [name, re] of STANDING_THREATS) if (!rows.some((r) => re.test(r[1] || ''))) problems.push(`no row for ${name}`);
  for (const r of rows) {
    const label = `${r[0]} / ${r[1] || ''}`;
    if (!nonEmpty(r[2])) problems.push(`${label}: no mitigation`);
    const why = naReason(r[3]);
    if (why !== null) { if (why.length <= 3) problems.push(`${label}: "not applicable" needs its reason`); continue; }
    const cited = (r[3] || '').match(/\d+/g) || [];
    if (!cited.length) problems.push(`${label}: no acceptance criterion that tests the mitigation`);
    else { const missing = cited.filter((c) => !acs.has(c)); if (missing.length) problems.push(`${label}: cites criteria that do not exist: ${missing.join(', ')}`); }
  }
  return { problems, detail: `${rows.length} threats, each mitigated and tested by a criterion` };
}

// Gate 5.13: someone who did not write the code read the diff against the threat model.
const SECURITY_AREAS = [['access control', /access/i], ['input handling', /input/i], ['secrets and configuration', /secret|config/i], ['abuse limits', /abuse|rate/i], ['data exposure', /exposure|leak|log/i]];
function securityReview(plan, ctx) {
  const tm = section(ctx.spec || '', 'Threat model');
  if (notApplicable(tm, ctx.spec, 'Threat model')) return { skip: 'threat model not applicable' };
  const sec = section(plan, 'Security review');
  if (sec === null) return { problems: ['no "## Security review": a fresh-context read of the diff against the threat model, for access control, input handling, secrets and configuration, abuse limits and data exposure'] };
  const problems = [];
  const by = field(sec, 'Run by');
  if (!nonEmpty(by)) problems.push('no "**Run by:**": a separate agent given the diff, the threat model and TECH.md, or a person who did not build it');
  const rows = rawRows(sec);
  for (const [name, re] of SECURITY_AREAS) {
    const row = rows.find((r) => re.test(r[0]));
    if (!row) problems.push(`no row for ${name}`);
    else if (!nonEmpty(row[1]) || !nonEmpty(row[2])) problems.push(`${name}: a finding (or "none found") and what happened to it`);
  }
  if (blankReview(rows)) problems.push('every area says "none found" and nothing about what was looked at: write the findings, or "none: {what was checked}" for an area that really had none');
  return { problems, detail: `${rows.length} areas reviewed by ${by}` };
}

// Gate 5.14: the performance budget from the spec, measured on what was built. With an interface, the page too.
const WEB_VITALS = /LCP|INP|CLS|contentful|next paint|layout shift|web vitals/i;
function performanceInfo(plan, ctx) {
  const perf = rawRows(section(ctx.spec || '', 'Quality bar')).find((r) => /perform|latency|speed|budget/i.test(r[0]));
  if (perf && !((perf[1] || '').match(/\d+/g) || []).length) return { skip: 'performance not applicable in the spec\'s quality bar' };
  const sec = section(plan, 'Performance');
  if (sec === null) return { problems: ['no "## Performance": the budget from the spec\'s quality bar, measured on the built product, with its evidence'] };
  const problems = [];
  const rows = rawRows(sec);
  if (!rows.length) problems.push('no measurement rows');
  for (const r of rows) {
    if (!/\d/.test(r[1] || '') || !/\d/.test(r[2] || '')) problems.push(`${r[0]}: a budget and a measured value, both with numbers`);
    if (!/^yes\b/i.test(r[3] || '')) problems.push(`${r[0]}: not within budget (fix it, or change the budget in the spec with the person)`);
    // A measurement is a captured run whose output holds the measured number, or a data tag; a line of code is not one.
    const record = ((r[4] || '').match(/[\w./-]+\.json/gi) || [])[0];
    if (record) {
      const ev = runEvidence(`**Run:** ${record}`, ctx);
      const value = firstNumber(r[2]);
      if (!ev.valid) problems.push(`${r[0]}: ${ev.detail}`);
      else if (value !== null && !(ev.output.match(/\d+(?:[.,]\d+)?/g) || []).some((x) => Math.abs(Number(x.replace(',', '.')) - value) < 1e-9)) problems.push(`${r[0]}: the measured ${r[2]} does not appear in the run's output`);
    } else if (!hasTag(r[4] || '', ['data'])) problems.push(`${r[0]}: no evidence (a captured run of the measurement, or a data tag)`);
  }
  const vd = section(ctx.design || '', 'Visual direction');
  if (vd !== null && !notApplicable(vd, ctx.design, 'Visual direction') && !rows.some((r) => WEB_VITALS.test(r[0]))) problems.push('no page-load row (largest contentful paint, interaction to next paint or layout shift) for an interface');
  return { problems, detail: `${rows.length} measures within budget, each with its evidence` };
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
  // The price and channel lines live in this section too; their tags say nothing about a session with a user.
  const session = sec.split('\n').filter((l) => !/^\s*\*\*[^*]+:\*\*/.test(l)).join('\n');
  const t = tags(session).filter((x) => ['interview', 'doc', 'data'].includes(x.cls));
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

// ---------- deciding what to build: value, the test worth running, go-to-market, the stake (gates 3.4, 3.9-3.15, 4.22, 6.14, 7.8) ----------

// Money as written in a business case: "about €1.1M", "€300K", "0,4 M€", "€47,000". Returns euros, or null.
function money(text) {
  const m = String(text || '').replace(/\s/g, '').match(/(-?\d+(?:[.,]\d+)*)(k|m|mln|mio)?/i);
  if (!m) return null;
  let n = m[1];
  // A lone separator followed by one or two digits is a decimal; groups of three are thousands.
  n = /^-?\d+[.,]\d{1,2}$/.test(n) ? n.replace(',', '.') : n.replace(/[.,](?=\d{3}\b)/g, '').replace(',', '.');
  const v = Number(n);
  if (!Number.isFinite(v)) return null;
  const mult = /^k$/i.test(m[2] || '') ? 1e3 : /^(m|mln|mio)$/i.test(m[2] || '') ? 1e6 : 1;
  return v * mult;
}
// Significant digits of each number in a line: "1.123.200€" has five, which is precision the estimate does not have.
const falsePrecision = (line) => (String(line || '').match(/\d[\d.,]*/g) || [])
  .filter((n) => !/^(19|20)\d{2}$/.test(n.replace(/[.,]$/, '')))
  .map((n) => n.replace(/[.,]/g, '').replace(/^0+/, '').replace(/0+$/, ''))
  .filter((d) => d.length > 3);

const KINDS = ['data', 'analogy', 'estimate', 'decision'];
// Gate 3.9: every number of the chosen bet has a kind, a source and three scenarios, and the result is money over two years.
function valueInfo(bet, ctx, lite) {
  const sec = section(bet, 'Value');
  if (sec === null) return { problems: ['no "## Value": the quick estimate of each option and the full table of the chosen one (business-case)'] };
  const judgment = field(sec, 'Judgment');
  if (nonEmpty(judgment) && judgment.length >= 40) return { judgment, problems: [] };
  const problems = [];
  const opts = tableRows(section(bet, 'Options')).length;
  const quick = rawRows(subsection(sec, 'Quick estimates')).filter((r) => nonEmpty(r[r.length - 1]));
  const quickNeed = Math.min(lite ? 2 : 4, Math.max(opts, lite ? 2 : 3));
  if (quick.length < quickNeed) problems.push(`${quick.length} options with a quick estimate in "### Quick estimates" (${quickNeed} needed): a formula, the assumption it rests on and a two-year value each`);
  const rows = rawRows(subsection(sec, 'Assumptions'));
  if (rows.length < 3) problems.push(`${rows.length} rows in "### Assumptions" (3 needed): every number the value is built from`);
  const badKind = rows.filter((r) => !KINDS.includes((r[2] || '').toLowerCase()));
  if (badKind.length) problems.push(`kind is not one of ${KINDS.join(', ')}: ${badKind.map((r) => r[0]).join(', ')}`);
  const unsourced = rows.filter((r) => ['data', 'analogy'].includes((r[2] || '').toLowerCase()) && !hasTag(r[3] || '', ['data', 'doc', 'code', 'interview']));
  if (unsourced.length) problems.push(`data or analogy without a data, doc, code or interview tag: ${unsourced.map((r) => r[0]).join(', ')}`);
  const noRange = rows.filter((r) => [4, 5, 6].some((i) => !nonEmpty(r[i])));
  if (noRange.length) problems.push(`no P14, P50 and P86 for: ${noRange.map((r) => r[0]).join(', ')}`);
  const noPop = rows.filter((r) => /%/.test(r.slice(4, 7).join(' ')) && !nonEmpty(r[1]));
  if (noPop.length) problems.push(`a percentage with no population (the denominator): ${noPop.map((r) => r[0]).join(', ')}`);
  const result = field(sec, 'Two-year value') || '';
  const scen = ['P14', 'P50', 'P86'].filter((p) => new RegExp(`${p}\\b[^·;|]*\\d`, 'i').test(result));
  if (scen.length < 3) problems.push(`"**Two-year value:**" needs P14, P50 and P86 in money (has ${scen.join(', ') || 'none'})`);
  const precise = falsePrecision(result);
  if (precise.length) problems.push(`false precision in "**Two-year value:**" (${precise.join(', ')} significant digits): round to what the estimates carry, "about €1.1M"`);
  if (!nonEmpty(field(sec, 'Costs'))) problems.push('no "**Costs:**": modeled when over 10% of revenue (build, upkeep, model and infrastructure per use), or "under 10%" with why');
  return { rows, problems, detail: `${rows.length} numbers (${KINDS.map((k) => `${rows.filter((r) => (r[2] || '').toLowerCase() === k).length} ${k}`).join(', ')}), ${result}` };
}

// Gate 3.10: the assumption that moves the result most is named, and the test aims at it.
function sensitivityInfo(bet, value) {
  const sec = section(bet, 'Value') || '';
  const rows = rawRows(subsection(sec, 'Sensitivity'));
  const problems = [];
  if (rows.length < 2) return { problems: [`${rows.length} rows in "### Sensitivity" (2 needed): each assumption swung alone from P14 to P86, the rest held at P50`] };
  const lb = field(sec, 'Load-bearing') || '';
  if (!nonEmpty(lb)) return { problems: ['no "**Load-bearing:**": the assumption at the top of the sensitivity, the one the test measures'] };
  const swing = rows.map((r) => ({ name: r[0], lo: money(r[2]), hi: money(r[3]) })).map((r) => ({ ...r, swing: r.lo !== null && r.hi !== null ? Math.abs(r.hi - r.lo) : null }));
  const named = swing.find((r) => lb.toLowerCase().includes(r.name.toLowerCase()));
  if (!named) problems.push(`"**Load-bearing:**" names none of the sensitivity rows (${rows.map((r) => r[0]).join(', ')})`);
  else if (swing.every((r) => r.swing !== null)) {
    const top = swing.reduce((a, b) => (b.swing > a.swing ? b : a));
    if (top.name !== named.name) problems.push(`"${named.name}" is named load-bearing, but "${top.name}" swings the result most`);
  }
  if (named) {
    const kind = ((value.rows || []).find((r) => r[0].toLowerCase() === named.name.toLowerCase()) || [])[2] || rows.find((r) => r[0] === named.name)[1] || '';
    const ct = section(bet, 'Cheapest test') || '';
    if (/^(estimate|analogy)$/i.test(kind) && !(field(ct, 'Assumption') || '').toLowerCase().includes(named.name.toLowerCase()) && !/^build first/i.test(field(ct, 'Order') || '')) problems.push(`the load-bearing "${named.name}" is ${kind.toLowerCase()}: "## Cheapest test" → "**Assumption:**" should name it`);
    if (/^data$/i.test(kind) && !nonEmpty(field(sec, 'What it counts'))) problems.push(`the load-bearing "${named.name}" is data: "**What it counts:**" says whether it counts visits or people, all users or a part`);
  }
  return { problems, detail: named ? `load-bearing: ${named.name}${named.swing !== null ? `, swing about ${Math.round(named.swing).toLocaleString('en')}` : ''}` : '' };
}

// Gate 3.11: the five questions asked before approving a business case, each answered.
function fiveQuestions(bet) {
  const sec = subsection(section(bet, 'Value') || '', 'Five questions');
  // "New" and "no" are answers; an empty line or the template's {answer} is not.
  const answers = (sec || '').split('\n').filter((l) => { const a = l.replace(/^\s*\d\.\s+/, '').split(/[?:]/).slice(1).join('').trim(); return /^\s*\d\.\s+\S/.test(l) && a.length >= 2 && nonEmpty(a); });
  return { ok: answers.length >= 5, detail: `${answers.length} of the five questions answered (source, new or moved revenue, denominator, five times smaller, what was killed)` };
}

// Gate 3.4: a test runs when its result can change the decision; skipping it names why.
const SKIP_REASONS = /cheap and reversible|reversible and cheap|pessimistic (case )?(still )?proceeds|P14 (still )?proceeds|strong precedent|precedents?|unreliable (measure|measurement)|override/i;
function testWorth(bet) {
  const ct = section(bet, 'Cheapest test') || '';
  const order = field(ct, 'Order') || '';
  const tc = (ct.match(/\*\*Test cost:\*\*\s*([\d.]+)/i) || [])[1];
  const bc = (ct.match(/\*\*Build cost:\*\*\s*([\d.]+)/i) || [])[1];
  const ratio = tc !== undefined && bc !== undefined && Number(bc) > 0 ? ` (test ${Math.round((Number(tc) / Number(bc)) * 100)}% of the build)` : '';
  if (/^test first/i.test(order)) {
    const why = field(ct, 'Changes the decision');
    return { first: true, ok: nonEmpty(why), detail: nonEmpty(why) ? `test first: ${why}${ratio}` : `test first, but no "**Changes the decision:**": which result would flip the bet, and why the decision is not already made${ratio}` };
  }
  const skip = field(ct, 'Skip because') || '';
  const ok = SKIP_REASONS.test(skip) || /override/i.test(order);
  return { first: false, ok, detail: ok ? `build first: ${skip || order}${ratio}` : `build first without "**Skip because:**" naming why the test could not change the decision (cheap and reversible, the pessimistic case still proceeds, strong precedent, unreliable measure) or a logged override${ratio}` };
}

// Gate 3.12: the experiment is a decision written before the data.
function experimentCard(bet) {
  const ct = section(bet, 'Cheapest test') || '';
  const problems = [];
  const digit = (k) => /\d/.test(field(ct, k) || '');
  if (!digit('Question')) problems.push('"**Question:**" written as a number to beat');
  if (!nonEmpty(field(ct, 'Event'))) problems.push('"**Event:**" the exact event counted, on whom, over how long');
  if (!digit('Stop below')) problems.push('"**Stop below:**" a number');
  if (!digit('Build above')) problems.push('"**Build above:**" a number');
  if (!nonEmpty(field(ct, 'Second idea'))) problems.push('"**Second idea:**" the runner-up and its value, which sets the build threshold');
  if (!digit('Sample')) problems.push('"**Sample:**" people per group, or the declared small sample before PMF');
  const lo = money(field(ct, 'Stop below')), hi = money(field(ct, 'Build above'));
  if (lo !== null && hi !== null && lo > hi) problems.push(`"Stop below" (${field(ct, 'Stop below')}) is above "Build above" (${field(ct, 'Build above')})`);
  return { problems: problems.length ? [`the card is missing: ${problems.join('; ')}`] : [], detail: `stop below ${field(ct, 'Stop below')}, build above ${field(ct, 'Build above')}, against ${field(ct, 'Second idea')}` };
}

// Gate 3.13: go-to-market before the build. The product track finds its market; a feature reaches the users it already has.
function gtmBefore(bet, track) {
  const sec = section(bet, 'Go-to-market');
  const need = track === 'product' ? ['Trigger', 'Positioning', 'Motion', 'Channel', 'Channel test'] : ['Audience', 'Message', 'Where'];
  if (sec === null) return { problems: [`no "## Go-to-market": ${need.join(', ')}`] };
  const missing = need.filter((k) => !nonEmpty(field(sec, k)));
  return { problems: missing.length ? [`"## Go-to-market" has no ${missing.map((k) => `"**${k}:**"`).join(', ')}`] : [], detail: track === 'product' ? `motion: ${field(sec, 'Motion')}; channel: ${field(sec, 'Channel')}` : `audience: ${field(sec, 'Audience')}; where: ${field(sec, 'Where')}` };
}

// Gate 3.14: the stake is declared and the build fits inside it.
function betSize(bet) {
  const sec = section(bet, 'Bet size');
  if (sec === null) return { problems: ['no "## Bet size": door, confidence, appetite and what we lose if wrong'] };
  const problems = [];
  const door = field(sec, 'Door') || '';
  if (!/^(one-way|two-way)\b/i.test(door)) problems.push('"**Door:**" one-way (hard to undo) or two-way (undone in days), with why');
  if (!/\d+\s*%/.test(field(sec, 'Confidence') || '')) problems.push('"**Confidence:**" a percentage, with what it rests on');
  const app = Number(((field(sec, 'Appetite') || '').match(/[\d.]+/) || [])[0]);
  if (!(app > 0)) problems.push('"**Appetite:**" the most days this bet is worth');
  if (!nonEmpty(field(sec, 'If wrong'))) problems.push('"**If wrong:**" what we lose, in days and money, and how we undo it');
  const ct = section(bet, 'Cheapest test') || '';
  const build = Number(((ct.match(/\*\*Build cost:\*\*\s*([\d.]+)/i) || [])[1]));
  if (app > 0 && build > app) problems.push(`the build (${build} days) is over the appetite (${app} days): cut the scope to fit, or put a bigger stake to the person`);
  if (/^one-way/i.test(door) && /cheap and reversible|reversible and cheap/i.test(field(ct, 'Skip because') || '')) problems.push('a one-way door skips its test as "cheap and reversible"');
  return { door, problems, detail: `${door.split(/[,.;]/)[0]} door, confidence ${field(sec, 'Confidence')}, appetite ${app} days` };
}

// Gate 4.22: the tests phase 3 wrote down came back, and their results are read against the lines written before
// the data. A result under its stop line is a decision to make (kill, change the bet, or a waiver with a reason),
// not a number to file.
const firstNumber = (t) => { const m = String(t || '').replace(TAG_RE, '').match(/-?\d+(?:[.,]\d+)?/); return m ? Number(m[0].replace(',', '.')) : null; };
function testsRead(ctx) {
  const problems = [], seen = [];
  const bet = ctx.bet || '';
  if (ctx.track === 'product') {
    const r = field(ctx.artifact, 'Channel result');
    if (!r) problems.push('no "**Channel result:**": what the channel test of phase 3 returned, against its thresholds, tagged');
    else if (!hasTag(r, ['interview', 'doc', 'data'])) problems.push('"**Channel result:**" cites no interview, doc or data tag: a plan for the channel is not its result');
    else {
      const stop = firstNumber((field(section(bet, 'Go-to-market') || '', 'Channel test') || '').match(/stop below\s*[^;,.]*/i)?.[0]);
      const got = firstNumber(r);
      if (stop !== null && got !== null && got < stop) problems.push(`the channel test returned ${got}, below its stop line of ${stop}: kill the initiative (record --kill), change the bet, or waive 4.22 with the person's reason`);
      else seen.push(`channel ${r.replace(TAG_RE, '').trim().slice(0, 60)}`);
    }
  }
  const tw = testWorth(bet);
  if (tw.first) {
    const ct = section(bet, 'Cheapest test') || '';
    const res = field(ct, 'Result');
    const stop = firstNumber(field(ct, 'Stop below'));
    if (!res) problems.push('the bet chose "test first" and 03-solution-bet.md → Cheapest test has no "**Result:**": run the test and write what it returned, as a number with its tag, before the build');
    else if (!hasTag(res, ['interview', 'doc', 'data'])) problems.push('the cheapest test "**Result:**" cites no interview, doc or data tag');
    else if (stop !== null && firstNumber(res) !== null && firstNumber(res) < stop) problems.push(`the cheapest test returned ${firstNumber(res)}, below its stop line of ${stop}: kill the initiative (record --kill), change the bet, or waive 4.22 with the person's reason`);
    else seen.push(`cheapest test ${res.replace(TAG_RE, '').trim().slice(0, 60)}`);
  }
  if (!problems.length && !seen.length) return { skip: `${ctx.track} track with no test before the build` };
  return { problems, detail: `read against their lines: ${seen.join('; ')}` };
}
function launchPlan(release) {
  const sec = section(release, 'Launch');
  const need = ['Who hears first', 'Message', 'Channels', 'When', 'Measured by'];
  if (sec === null) return { problems: [`no "## Launch": ${need.join(', ')}`] };
  const missing = need.filter((k) => !nonEmpty(field(sec, k)));
  return { problems: missing.length ? [`"## Launch" has no ${missing.map((k) => `"**${k}:**"`).join(', ')}`] : [], detail: `${field(sec, 'Who hears first')} via ${field(sec, 'Channels')}, ${field(sec, 'When')}` };
}

// Gate 7.8: the outcome reads the go-to-market too: each channel with its result, and for a product its stage.
// One stage model: PRODUCT.md's Stage. Signal, Resonance and Orbit are the go-to-market names for the same stages.
const GTM_STAGES = /\b(idea|pre-PMF|emerging-PMF|scaling|signal|resonance|orbit)\b/i;
function gtmRead(outcome, track) {
  const sec = section(outcome, 'Go-to-market read');
  if (sec === null) return { problems: ['no "## Go-to-market read": each channel, what it reached and converted, tagged, and what happens to it next'] };
  const rows = rawRows(sec);
  const problems = [];
  if (!rows.length) problems.push('no channel rows');
  const blind = rows.filter((r) => !hasTag(r.join(' ')) && !/unavailable/i.test(r.join(' ')));
  if (blind.length) problems.push(`channels with neither a tagged result nor "unavailable" and its question: ${blind.map((r) => r[0]).join(', ')}`);
  const stage = field(sec, 'Stage') || field(sec, 'GTM stage') || '';
  if (track === 'product' && !GTM_STAGES.test(stage)) problems.push('"**Stage:**" the PRODUCT.md stage (idea, pre-PMF, emerging-PMF, scaling), with the Stage exit it meets or misses');
  return { problems, detail: `${rows.length} channel${rows.length === 1 ? '' : 's'} read${track === 'product' ? `, stage ${stage}` : ''}` };
}

// Gate 4.14 (product track, for sale): someone showed they would pay, and the stack can take the money.
// What a person did with the price, as opposed to what they said they would do.
const PAID_ACT = /pre-?order|pre-?ordin|paid|pays\b|payment|deposit|letter of intent|\bLOI\b|signed|clicked|accepted|bought|purchased|subscribed|card\b|invoice|checkout|bonifico|pagat|acquist|firmat|accettat|preordin/i;
const PAYMENT_LAYER = /pay|billing|checkout|subscription|invoice|fattur/i;
function moneyBeforeBuild(spec) {
  const problems = [];
  const wtp = field(spec, 'Willingness to pay');
  if (!wtp) problems.push('no "**Willingness to pay:**": what a person from the ICP did when shown the price (pre-order, letter of intent, a click on a price, a price accepted in the session), tagged');
  else if (!hasTag(wtp, ['interview', 'doc', 'data'])) problems.push('"**Willingness to pay:**" cites no interview, doc or data tag: an opinion about the price is not a test of it');
  else if (!PAID_ACT.test(wtp.replace(TAG_RE, ''))) problems.push('"**Willingness to pay:**" reports an opinion, not what someone did: a pre-order, a deposit, a letter of intent, a click on a price, a price accepted in the session');
  const pay = rawRows(section(spec, 'Stack')).find((r) => PAYMENT_LAYER.test(r[0]));
  if (!pay) problems.push('no payments row in "## Stack": how the product takes money and who handles tax and invoices');
  else if (!/^(inherited|decided)\b/i.test(pay[2] || '')) problems.push(`payments layer is "${pay[2] || ''}", not inherited or decided`);
  return { problems, detail: `willingness to pay ${wtp ? 'evidenced' : 'missing'}, payments: ${pay ? pay[1] : 'missing'}` };
}

// Gate 6.10: what a release needs, plus what the product needs at its stage, from TECH.md → Operations.
function productionGaps(release, ctx) {
  const pr = section(release, 'Production readiness') || '';
  const model = /\*\*Model output:\*\*\s*yes/i.test(ctx.spec || '');
  // A model's mistakes are found in its traces: where they are kept and who reads them is part of being ready.
  const gaps = ['Errors seen by', 'Backup restored', ...(model ? ['Agent traces'] : [])].filter((k) => !nonEmpty(field(pr, k))).map((k) => `"## Production readiness" has no "**${k}:**"`);
  const ops = section(read(path.join(ROOT, 'TECH.md')) || '', 'Operations');
  const stage = productStage(ctx.product);
  const need = ['Privacy'];
  if (model) need.push('AI disclosure');
  if (stage && !preScale(stage)) need.push('SLO', 'Incident response', 'Cost per active user', 'Load tested');
  if (model && stage && !preScale(stage)) need.push('Model degradation');
  const missing = need.filter((k) => !nonEmpty(field(ops || '', k)));
  if (missing.length) gaps.push(`TECH.md → "## Operations" has no ${missing.map((k) => `"**${k}:**"`).join(', ')}${stage && !preScale(stage) ? ` (stage ${stage})` : ''}`);
  return { gaps, detail: `release ready for its first incident; TECH.md → Operations covers ${need.join(', ')}` };
}

// What the current phase waits for from people outside the agent: acceptance, a session, a payment, a channel.
const PERSON_WAITS = { '4.13': 'a session with someone from the ICP', '4.14': 'what someone did when shown the price', '4.22': 'the result of the test chosen before the build', '5.6': 'the person to accept the build plan', '5.17': 'the person to try what was built', '6.8': 'the person to authorize exposure', '6.11': 'someone outside the team using it', '6.12': 'a first payment', '6.13': 'the person to choose the rollout' };
function personWaits(init) {
  const p = init.state.current_phase ?? 0;
  if (!fs.existsSync(path.join(init.dir, ARTIFACTS[p]))) return [];
  let j;
  try { j = JSON.parse(spawnSyncSelf(['gate', String(p), '--json', '--initiative', init.slug]) || '{}'); } catch { return []; }
  return (j.failed || []).filter((id) => PERSON_WAITS[id]).map((id) => `phase ${p} waits on ${PERSON_WAITS[id]} (${id})`);
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
  // An idea has no product to review yet: its Business section is drafted at initialization, the review starts with users.
  if (!last && stage === 'idea') return null;
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
  // A change touches one screen: its hard states are enough. New screens are seen in all six states, at two widths.
  const full = ctx.track !== 'change';
  const states = full ? STATES : ['empty', 'error'];
  const shots = new Map(), captured = new Set();
  for (const st of states) if (!rows.some((r) => new RegExp(st, 'i').test(r[0]))) problems.push(`no ${st} state reviewed`);
  const widths = (field(sec, 'Widths') || '').match(/\d{3,4}/g) || [];
  if (full && new Set(widths).size < 2) problems.push('no "**Widths:**" naming two widths (the widest and the narrowest the ICP uses)');
  for (const r of rows) {
    const na = /^not applicable\b/i.test(r[1] || '');
    if (na) { if ((r[1] || '').replace(/^not applicable[\s,.:;—-]*/i, '').length <= 3) problems.push(`${r[0]}: "not applicable" needs its reason`); continue; }
    if (!nonEmpty(r[1])) problems.push(`${r[0]}: no screenshot or route`);
    else for (const f of (r[1].match(/[\w./-]+\.(png|jpe?g|webp|gif)/gi) || [])) {
      if (whyNot(f, ctx)) { problems.push(`${r[0]}: ${f} ${whyNot(f, ctx)}`); continue; }
      const buf = fs.readFileSync(located(f, ctx));
      const key = digest(buf.toString('latin1'));
      shots.set(key, [...(shots.get(key) || []), r[0]]);
      const size = imageSize(buf);
      if (size) captured.add(size.w);
    }
    if (!/^yes\b/i.test(r[2] || '')) problems.push(`${r[0]}: does not match the chosen direction (fix it, or record the deviation in DESIGN.md and say yes)`);
  }
  // One capture standing for several states is one state seen; widths are read from the images themselves.
  for (const states of shots.values()) if (new Set(states).size > 1) problems.push(`the same capture stands for ${[...new Set(states)].join(', ')}`);
  const declared = [...new Set(widths.map(Number))];
  const stray = declared.length ? [...captured].filter((c) => !declared.some((w) => c === w || c === 2 * w || c === 3 * w)) : [];
  if (stray.length) problems.push(`captures ${stray.join(', ')} pixels wide match none of the widths reviewed (${declared.join(', ')})`);
  // Messages are seen as received, from the built product, not as designed.
  if (designedMessages(ctx).length && !nonEmpty(field(sec, 'Messages received'))) problems.push('no "**Messages received:**": each message in DESIGN.md → Messages, sent by the built product to a test inbox or phone, with its capture');
  return { problems, detail: `${rows.length} states reviewed against the chosen direction${full ? ` at ${widths.slice(0, 2).join(' and ')}` : ''}` };
}

// A review whose every row is a bare "none found" cannot be told apart from one that never happened. A row that
// found nothing says what was looked at: "none: tab order checked on the six states".
const BARE_NONE = /^\W*(none|none found|nothing( found)?|no (findings?|issues?)|n\/?a|ok|fine|nessun[oa]?)\W*$/i;
const blankReview = (rows) => rows.length > 0 && rows.every((r) => BARE_NONE.test(r[1] || ''));

// Gate 5.12: someone who did not build it looked at the craft, aspect by aspect, and every finding went somewhere.
const STATES = ['empty', 'loading', 'partial', 'error', 'success', 'permission'];
const CRAFT = [['hierarchy', /hierarch/i], ['spacing rhythm', /spacing|rhythm/i], ['typography', /typograph|type\b/i], ['copy against the voice', /copy|voice/i], ['focus states', /focus/i], ['motion and reduced motion', /motion/i], ['interaction states', /interaction/i], ['next to the references', /reference/i]];
function craftCritique(plan, ctx) {
  const ir = interfaceReview(plan, ctx);
  if (ir.skip) return { skip: ir.skip };
  if (notApplicable(section(plan, 'Interface review'), '', 'Interface review')) return { skip: 'interface review not applicable' };
  const sec = section(plan, 'Craft critique');
  if (sec === null) return { problems: ['no "## Craft critique": a fresh-context review of hierarchy, spacing rhythm, typography, copy against the voice, focus states, motion, interaction states, and the captures next to the references'] };
  const problems = [];
  const by = field(sec, 'Run by');
  if (!nonEmpty(by)) problems.push('no "**Run by:**": a separate agent or a person who did not build it, with what they were given');
  const rows = rawRows(sec);
  for (const [name, re] of CRAFT) {
    const row = rows.find((r) => re.test(r[0]));
    if (!row) problems.push(`no row for ${name}`);
    else if (!nonEmpty(row[1]) || !nonEmpty(row[2])) problems.push(`${name}: a finding (or "none found") and what happened to it`);
  }
  if (blankReview(rows)) problems.push('every aspect says "none found" and nothing about what was looked at: write the findings, or "none: {what was checked}" for an aspect that really had none');
  return { problems, detail: `${rows.length} aspects reviewed by ${by}` };
}

// Gate 5.8: a guardrail is a file that exists and runs the Verify commands: a CI workflow or a pre-commit hook.
const GUARD_FILE = /(?:\.github\/workflows\/[\w.-]+\.ya?ml|\.gitlab-ci\.ya?ml|\.circleci\/[\w.-]+|\.husky\/[\w.-]+|\.git\/hooks\/[\w.-]+|\.pre-commit-config\.ya?ml|lefthook\.ya?ml|bitbucket-pipelines\.ya?ml|azure-pipelines\.ya?ml|Jenkinsfile|[\w./-]+\.(?:ya?ml|sh|toml))/g;
function guardrailFile() {
  const guard = field(read(path.join(ROOT, 'TECH.md')) || '', 'Guardrail') || '';
  const names = [...new Set(guard.replace(/`/g, '').match(GUARD_FILE) || [])];
  const found = names.map((n) => path.join(ROOT, n)).find((p) => fs.existsSync(p) && fs.statSync(p).isFile());
  return { guard, names, file: found || null, text: found ? read(found) : '' };
}
const verifyCommands = () => rawRows(section(read(path.join(ROOT, 'TECH.md')) || '', 'Verify')).filter((r) => !/^run\b/i.test(r[0]) && nonEmpty(r[1])).map((r) => r[1].replace(/`/g, '').trim());
function guardrailInfo(guard) {
  if (!nonEmpty(guard) || /^(none|no|n\/?a|—|-)\b/i.test(guard)) return { problems: ['TECH.md names no "**Guardrail:**" running Verify on every change'] };
  const g = guardrailFile();
  if (!g.names.length) return { problems: [`"**Guardrail:** ${guard}" names no file: the CI workflow or the hook that defines it (.github/workflows/ci.yml, .husky/pre-commit)`] };
  if (!g.file) return { problems: [`the guardrail file does not exist: ${g.names.join(', ')}`] };
  const cmds = verifyCommands();
  const runs = cmds.filter((c) => g.text.includes(c) || g.text.includes(c.split(/\s+/).slice(0, 2).join(' ')));
  if (cmds.length && !runs.length) return { problems: [`${rel(g.file)} does not run any Verify command (${cmds.join('; ')})`] };
  return { problems: [], detail: `${rel(g.file)} runs ${runs.length ? runs.join('; ') : 'the checks'}` };
}

// Gate 5.10: quality a machine can check runs every time, in the guardrail, not in someone's memory.
// With an interface, a token check keeps the chosen look in the code; once a look has shipped, visual regression keeps it.
const QUALITY_CHECKS = [['accessibility', /accessib|a11y|axe/i], ['end-to-end', /end-to-end|e2e|playwright|cypress/i], ['dependency audit', /dependenc|audit/i], ['secret scan', /secret/i], ['static analysis', /static analysis|sast|semgrep|codeql/i]];
function qualityChecks(ctx = {}) {
  const tech = read(path.join(ROOT, 'TECH.md')) || '';
  const v = field(tech, 'Quality checks');
  if (!nonEmpty(v)) return { problems: ['TECH.md names no "**Quality checks:**": accessibility, end-to-end, dependency audit, secret scan and static analysis in the guardrail (plus a token check with an interface), each named or "n/a" with why'] };
  if (/^declined by\s+\S+.{6,}/i.test(v)) return { declined: v };
  const vd = section(ctx.design || '', 'Visual direction');
  const ui = vd !== null && !notApplicable(vd, ctx.design, 'Visual direction');
  const shipped = nonEmpty(field(section(tech, 'Design system') || '', 'Kit'));
  const checks = [...QUALITY_CHECKS, ...(ui ? [['token check', /token/i]] : []), ...(ui && shipped ? [['visual regression', /visual regression|screenshot diff|snapshot/i]] : [])];
  const missing = checks.filter(([, re]) => !re.test(v)).map(([n]) => n);
  if (missing.length) return { problems: [`Quality checks does not cover: ${missing.join(', ')}`] };
  // Named is not running: each tool must appear in the guardrail file that runs on every change.
  const g = guardrailFile();
  if (!g.file) return { problems: [`the quality checks run in the guardrail, and the guardrail file ${g.names.length ? `does not exist (${g.names.join(', ')})` : 'is not named in TECH.md'}`] };
  const segments = v.split(/\s*[·;,]\s*(?![^(]*\))/);
  const absent = checks.filter(([name, re]) => {
    const seg = segments.find((x) => re.test(x)) || '';
    if (/\bn\/?a\b|not applicable/i.test(seg)) return false;
    const tools = (seg.split(/[:(]/)[1] || '').match(/[A-Za-z][\w@.-]{2,}/g) || [];
    return !re.test(g.text) && !tools.some((t) => g.text.toLowerCase().includes(t.toLowerCase()));
  });
  return absent.length ? { problems: [`named in Quality checks but not run by ${rel(g.file)}: ${absent.map(([n]) => n).join(', ')}`] } : { problems: [], detail: `quality checks run by ${rel(g.file)}: ${v}` };
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
  else { const w = personWords(by, 'Rules decided by'); if (!w.ok) problems.push(w.problem); }
  const proto = (field(sec, 'Prototype') || '').replace(/[`\[\]]/g, '').trim();
  if (/\.html?$/i.test(proto) && whyNot(proto, ctx)) problems.push(`prototype ${proto} ${whyNot(proto, ctx)}`);
  return { problems, detail: `${entities.length} entities, rules decided by ${by}` };
}

// ---------- what a file holds (gates check the thing, not its name) ----------

// A file a gate counts must hold what its extension promises: an image that decodes to a size, a page with words
// on it, a recording that is a video. A 0-byte file, or a page with no visible text, is a name without the thing.
const TRIVIAL = new Set(['echo', 'true', 'false', 'printf', ':', 'cat', 'yes', 'sleep', 'exit', 'test', 'touch']);
function imageSize(buf) {
  if (buf.length >= 24 && buf.readUInt32BE(0) === 0x89504e47 && buf.toString('latin1', 12, 16) === 'IHDR') return { w: buf.readUInt32BE(16), h: buf.readUInt32BE(20) };
  if (buf.length >= 10 && buf.toString('latin1', 0, 4) === 'GIF8') return { w: buf.readUInt16LE(6), h: buf.readUInt16LE(8) };
  if (buf.length >= 4 && buf[0] === 0xff && buf[1] === 0xd8) {
    for (let i = 2; i + 9 < buf.length;) {
      if (buf[i] !== 0xff) { i++; continue; }
      const m = buf[i + 1];
      if (m >= 0xc0 && m <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(m)) return { w: buf.readUInt16BE(i + 7), h: buf.readUInt16BE(i + 5) };
      i += 2 + buf.readUInt16BE(i + 2);
    }
    return null;
  }
  if (buf.length >= 30 && buf.toString('latin1', 0, 4) === 'RIFF' && buf.toString('latin1', 8, 12) === 'WEBP') {
    const kind = buf.toString('latin1', 12, 16);
    if (kind === 'VP8X') return { w: 1 + buf.readUIntLE(24, 3), h: 1 + buf.readUIntLE(27, 3) };
    if (kind === 'VP8 ') return { w: buf.readUInt16LE(26) & 0x3fff, h: buf.readUInt16LE(28) & 0x3fff };
    if (kind === 'VP8L') { const b = buf.readUInt32LE(21); return { w: 1 + (b & 0x3fff), h: 1 + ((b >> 14) & 0x3fff) }; }
  }
  return null;
}
const visibleText = (html) => html.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>|<!--[\s\S]*?-->/gi, ' ').replace(/<[^>]+>/g, ' ').replace(/&[a-z#0-9]+;/gi, ' ').replace(/\s+/g, ' ').trim();
// Why the file at p does not hold what its name promises, or null when it does.
function fileProblem(p) {
  if (!p || !fs.existsSync(p)) return 'not found';
  const buf = fs.readFileSync(p);
  if (!buf.length) return 'is empty';
  const ext = path.extname(p).toLowerCase();
  if (/^\.(png|jpe?g|gif|webp)$/.test(ext)) { const size = imageSize(buf); return size && size.w > 0 && size.h > 0 ? null : 'is not an image'; }
  if (ext === '.svg') return /<svg[\s>]/i.test(buf.toString('utf8')) ? null : 'is not an SVG';
  if (/^\.html?$/.test(ext)) return visibleText(buf.toString('utf8')).length >= 20 ? null : 'has no visible text';
  if (/^\.(md|txt)$/.test(ext)) return buf.toString('utf8').replace(/\s+/g, '').length >= 20 ? null : 'holds almost nothing';
  if (ext === '.webm') return buf.length > 1024 && buf.readUInt32BE(0) === 0x1a45dfa3 ? null : 'is not a WebM video';
  if (/^\.(mp4|mov|m4v)$/.test(ext)) return buf.length > 1024 && buf.toString('latin1', 4, 8) === 'ftyp' ? null : 'is not an MP4 or MOV video';
  if (ext === '.pdf') return buf.toString('latin1', 0, 4) === '%PDF' ? null : 'is not a PDF';
  if (/^\.(m?[jt]sx?|py|rb|go|rs|java|kt|swift|php|cs)$/.test(ext)) return buf.toString('utf8').replace(/\s+/g, '').length >= 20 ? null : 'holds almost no code';
  return null;
}
// The first of the project or initiative paths a name resolves to.
const located = (name, ctx) => [path.join(ctx.dir || ROOT, name), path.join(ROOT, name)].find((p) => fs.existsSync(p)) || null;
const whyNot = (name, ctx) => { const p = located(name, ctx); return p ? fileProblem(p) : 'not found'; };
// A run of echo, true or printf records that a string was printed, not that anything was checked.
const trivialRun = (record) => TRIVIAL.has(path.basename(String((record && record.command && record.command[0]) || '')));

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

// ---------- what people open, click and receive (gates 4.21, 5.16, 5.17; bos.mjs page) ----------

// Gate 4.21: every message the product sends outside its screens (email, notification, chat, text) is designed
// like a screen: what triggers it, who gets it, on which channel, its real text, how to stop it, and a preview.
const MESSAGE_PARTS = ['message', 'trigger', 'recipient', 'channel', 'text', 'opt-out', 'preview'];
const FILLER = /\b(lorem|ipsum|tbd|todo|placeholder|xxx)\b/i;
function messagesInfo(ctx) {
  const design = ctx.design || '';
  const sec = section(design, 'Messages');
  const none = field(sec === null ? design : sec, 'Messages');
  if (none && /^none\b/i.test(none)) {
    return none.replace(/^none[\s,.:;—-]*/i, '').length > 3 ? { problems: [], detail: `sends no messages: ${none}` } : { problems: ['"**Messages:** none" needs its reason'] };
  }
  if (sec === null) return { problems: ['no "## Messages" in DESIGN.md: every email, notification, chat or text message the product sends (trigger, recipient, channel, real text, opt-out, preview), or "**Messages:** none, {reason}"'] };
  const rows = rawRows(sec);
  if (!rows.length) return { problems: ['"## Messages" has no rows (Message / Trigger / Recipient / Channel / Text / Opt-out / Preview)'] };
  const problems = [];
  for (const r of rows) {
    const empty = MESSAGE_PARTS.slice(1).filter((_, i) => !nonEmpty(r[i + 1]));
    if (empty.length) problems.push(`${r[0]}: no ${empty.join(', ')}`);
    if (nonEmpty(r[4]) && (FILLER.test(r[4]) || r[4].replace(/[`"*]/g, '').trim().length < 12)) problems.push(`${r[0]}: the text is a placeholder; write what the person will read`);
    for (const f of (r[6] || '').match(/[\w./-]+\.(html?|md|txt|png|jpe?g|webp)/gi) || []) if (whyNot(f, ctx)) problems.push(`${r[0]}: preview ${f} ${whyNot(f, ctx)}`);
  }
  return { problems, detail: `${rows.length} message${rows.length > 1 ? 's' : ''} designed with trigger, recipient, channel, text, opt-out and preview` };
}
const designedMessages = (ctx) => rawRows(section(ctx.design || '', 'Messages'));

// Gate 5.16: production exists before the release, set up by the build from its first slice, so going live is
// opening a door rather than a first deploy. TECH.md → Environments is the record.
const PROD_FIELDS = ['Domain', 'Secrets', 'Email sender', 'Live keys', 'Legal pages'];
function environments() {
  const sec = section(read(path.join(ROOT, 'TECH.md')) || '', 'Environments');
  const rows = rawRows(sec);
  const prod = rows.find((r) => /^prod/i.test(r[0])) || null;
  const preview = rows.find((r) => /^preview/i.test(r[0])) || null;
  return { sec, rows, prod, preview, url: prod && ((prod[1] || '').match(/https?:\/\/[^\s|)`]+/) || [])[0] };
}
function productionInfo(ctx) {
  const env = environments();
  const full = ctx.track === 'product';
  if (env.sec === null) return { warnOnly: !full, problems: ['TECH.md has no "## Environments": production with its URL, how it deploys and who can see it, set up from the first slice (production-setup)'] };
  const problems = [];
  if (!env.prod) problems.push('"## Environments" has no production row (Environment / URL / Deploys from / Who can see it)');
  else {
    if (!/^https:\/\//i.test(env.url || '')) problems.push('the production URL is not an https:// address');
    if (!nonEmpty(env.prod[2])) problems.push('production: how it deploys (the branch and the job)');
    if (!nonEmpty(env.prod[3])) problems.push('production: who can see it now (behind a password, a flag, or everyone)');
  }
  if (full) for (const k of PROD_FIELDS) if (!nonEmpty(field(env.sec, k))) problems.push(`no "**${k}:**"`);
  const check = field(env.sec, 'Production check');
  const run = runEvidence(env.sec, ctx, 'Production check');
  let host = null;
  try { host = env.url ? new URL(env.url).host : null; } catch { problems.push('the production URL does not parse'); }
  if (run.valid) { if (host && !run.record.command.join(' ').includes(host)) problems.push(`the production check did not call ${host}`); }
  else if (!(check && hasTag(check, ['data', 'doc']))) problems.push(check ? `"**Production check:**" is not a captured request to production nor a tagged observation: ${run.detail}` : `no "**Production check:**": a captured request to the production URL (run-check) or the person's observation with its tag`);
  return { problems, warnOnly: !full, detail: `production at ${env.url}${env.preview ? ', with previews' : ''}, checked ${run.valid ? run.detail : 'by a person'}` };
}

// Gate 5.17: a person opened what was built and used it, before anyone authorizes exposure. The video shows that it
// works; trying it shows whether it is right.
function triedInfo(plan, ctx) {
  const ir = interfaceReview(plan, ctx);
  if (ir.skip) return { skip: ir.skip };
  const problems = [];
  const verify = rawRows(section(read(path.join(ROOT, 'TECH.md')) || '', 'Verify'));
  if (!verify.some((r) => /^run\b/i.test(r[0]) && nonEmpty(r[1]))) problems.push('TECH.md → Verify has no "Run" row: the one command that starts the product locally');
  const sec = section(plan, 'Tried');
  if (sec === null) return { problems: [...problems, 'no "## Tried": the person opened the preview link (or ran the product) and said what they found'] };
  const link = field(sec, 'Link');
  if (!nonEmpty(link) || !(/https?:\/\//.test(link) || /`[^`]+`/.test(link))) problems.push('no "**Link:**": the preview URL, or the Run command in backticks');
  const by = field(sec, 'Tried by') || '';
  if (!nonEmpty(by) || AGENT_NAME.test(by)) problems.push(by ? `"${by}" is the agent: a person tries it` : 'no "**Tried by:**": who tried it, and when');
  else if (!DATE_RE.test(by)) problems.push('"**Tried by:**" needs the date');
  else { const w = personWords(by, 'Tried by'); if (!w.ok) problems.push(w.problem); }
  const rows = rawRows(sec);
  if (!rows.length) problems.push('no rows (What they tried / What they found / What happened)');
  for (const r of rows) if (!nonEmpty(r[1]) || !nonEmpty(r[2])) problems.push(`${r[0]}: what they found and what happened to it`);
  return { problems, detail: `tried by ${by.replace(DATE_RE, '').replace(/[·,\s]+$/, '').trim()} on ${link}, ${rows.length} finding${rows.length === 1 ? '' : 's'} handled` };
}

// `bos.mjs page`: one HTML file a person opens or sends, regenerated with the roadmap. Written by the script, so it costs
// no model tokens; it links to the files, it never copies them.
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
function listFiles(dir, re, depth = 2) {
  if (!fs.existsSync(dir) || depth < 0) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((d) => {
    const p = path.join(dir, d.name);
    return d.isDirectory() ? listFiles(p, re, depth - 1) : re.test(d.name) ? [p] : [];
  }).sort();
}
function writePage(quiet) {
  if (!fs.existsSync(BOS)) { if (quiet) return; die('no .builderos/ here'); }
  const out = path.join(BOS, 'index.html');
  const link = (p, label) => `<a href="${esc(path.relative(BOS, p).split(path.sep).join('/'))}">${esc(label || path.basename(p))}</a>`;
  const product = read(path.join(ROOT, 'PRODUCT.md')) || '';
  const name = ((product.match(/^#\s+(.+)$/m) || [])[1] || path.basename(ROOT)).replace(/^PRODUCT\.md\s*[—-]\s*/, '');
  const env = environments();
  const stage = productStage(product);
  const all = loadInitiatives().sort((a, b) => String(b.state.updated_at || '').localeCompare(String(a.state.updated_at || '')));
  const waiting = [];
  const cards = all.map((i) => {
    const s = i.state;
    const ph = s.current_phase ?? 0;
    const g = (s.phases && s.phases[String(ph)] && s.phases[String(ph)].gate) || null;
    const round = openRound(s);
    if (round) waiting.push(`${s.title || i.slug}: ${round.questions || 'a'} question${round.questions === 1 ? '' : 's'} waiting since ${String(round.at).slice(0, 10)}`);
    if (g && !g.passed && (g.failed_conditions || []).length) waiting.push(`${s.title || i.slug}: gate ${ph} failed on ${g.failed_conditions.join(', ')}`);
    else if ((s.status || 'open') === 'open') for (const w of personWaits(i)) waiting.push(`${s.title || i.slug}: ${w}`);
    const docs = [REQUEST, ...ARTIFACTS, 'DESIGN.md'].map((f) => path.join(i.dir, f)).filter((p) => fs.existsSync(p));
    const visuals = listFiles(path.join(i.dir, 'design'), /\.(html?|png|jpe?g|webp|svg)$/i);
    const media = listFiles(path.join(BOS, 'media'), /\.(mp4|webm|mov|gif|png)$/i, 3).filter((p) => p.includes(i.slug));
    const tried = section(read(path.join(i.dir, ARTIFACTS[5])) || '', 'Tried');
    const preview = tried && field(tried, 'Link');
    const row = (label, items) => (items.length ? `<dt>${label}</dt><dd>${items.join(' · ')}</dd>` : '');
    return `<article><header><h3>${esc(s.title || i.slug)}</h3><span class="pill">${esc(s.track || 'product')}</span><span class="pill ${s.status === 'closed' ? 'done' : ''}">${s.status === 'closed' ? 'closed' : `phase ${ph} ${esc(PHASES[ph])}`}</span></header>
<ol class="phases">${PHASES.map((p, k) => { const st = (s.phases && s.phases[String(k)] && s.phases[String(k)].status) || 'pending'; return `<li class="${esc(st)}${k === ph && s.status !== 'closed' ? ' now' : ''}" title="${esc(st)}">${k}</li>`; }).join('')}</ol>
<dl>${row('Documents', docs.map((p) => link(p)))}${row('Designs and prototypes', visuals.map((p) => link(p)))}${row('Demo', media.map((p) => link(p)))}${preview ? row('Try it', [/https?:\/\//.test(preview) ? `<a href="${esc((preview.match(/https?:\/\/[^\s)`]+/) || [])[0])}">${esc(preview)}</a>` : esc(preview)]) : ''}${claimNote(s) ? row('Owner', [esc(claimNote(s))]) : ''}</dl></article>`;
  });
  const decisions = listFiles(path.join(BOS, 'decisions'), /\.md$/i, 0);
  const reviews = listFiles(path.join(BOS, 'reviews'), /\.md$/i, 0);
  const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(name)}: BuilderOS</title>
<style>
:root{--bg:#fbfbfa;--fg:#1b1b1a;--muted:#6b6b66;--line:#e4e3df;--card:#fff;--accent:#2f5bd3;--ok:#2e7d4f;--warn:#b26a00}
@media (prefers-color-scheme:dark){:root{--bg:#141413;--fg:#ecebe6;--muted:#a3a29b;--line:#2c2c2a;--card:#1c1c1b;--accent:#8aa7ff;--ok:#6fcf97;--warn:#f2b54b}}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--fg);font:15px/1.55 system-ui,sans-serif}
main{max-width:960px;margin:0 auto;padding:32px 16px 64px}h1{font-size:28px;margin:0}h2{font-size:15px;text-transform:uppercase;letter-spacing:.06em;color:var(--muted);margin:36px 0 12px}
h3{font-size:17px;margin:0;flex:1}a{color:var(--accent)}.sub{color:var(--muted);margin:4px 0 0}
article{background:var(--card);border:1px solid var(--line);border-radius:10px;padding:16px 18px;margin:0 0 12px}
article header{display:flex;gap:8px;align-items:center;flex-wrap:wrap}.pill{font-size:12px;border:1px solid var(--line);border-radius:99px;padding:2px 9px;color:var(--muted)}.pill.done{color:var(--ok)}
.phases{display:flex;gap:4px;list-style:none;padding:0;margin:12px 0}.phases li{flex:1;text-align:center;font-size:12px;border-radius:4px;padding:3px 0;background:var(--line);color:var(--muted)}
.phases li.passed,.phases li.answered{background:var(--ok);color:var(--card)}.phases li.covered{background:transparent;border:1px dashed var(--muted)}.phases li.now{outline:2px solid var(--accent);color:var(--fg)}.phases li.killed{background:var(--warn);color:var(--card)}
dl{display:grid;grid-template-columns:minmax(120px,auto) 1fr;gap:4px 16px;margin:0}dt{color:var(--muted)}dd{margin:0;overflow-wrap:anywhere}
ul{padding-left:18px;margin:0}.warn li{color:var(--warn)}footer{color:var(--muted);font-size:13px;margin-top:40px}
@media (max-width:560px){dl{grid-template-columns:1fr}dt{margin-top:6px}}
</style></head><body><main>
<h1>${esc(name)}</h1>
<p class="sub">${stage ? `Stage ${esc(stage)} · ` : ''}${env.url ? `<a href="${esc(env.url)}">${esc(env.url)}</a>` : 'not in production yet'}${env.preview ? ` · previews: ${esc(env.preview[1] || '')}` : ''}</p>
<h2>Waiting on you</h2>${waiting.length ? `<ul class="warn">${waiting.map((w) => `<li>${esc(w)}</li>`).join('')}</ul>` : '<p class="sub">Nothing.</p>'}
<h2>Initiatives</h2>${cards.join('\n') || '<p class="sub">None yet.</p>'}
<h2>Project memory</h2><dl>${['PRODUCT.md', 'DOMAIN.md', 'TECH.md'].map((f) => path.join(ROOT, f)).filter((p) => fs.existsSync(p)).map((p) => `<dt>${esc(path.basename(p))}</dt><dd>${link(p, 'open')}</dd>`).join('')}${fs.existsSync(path.join(BOS, 'ROADMAP.md')) ? `<dt>Roadmap</dt><dd>${link(path.join(BOS, 'ROADMAP.md'), 'ROADMAP.md')}</dd>` : ''}${decisions.length ? `<dt>Decisions</dt><dd>${decisions.map((p) => link(p)).join(' · ')}</dd>` : ''}${reviews.length ? `<dt>Product reviews</dt><dd>${reviews.map((p) => link(p)).join(' · ')}</dd>` : ''}</dl>
<footer>Generated by BuilderOS ${VERSION} on ${new Date().toISOString().slice(0, 16).replace('T', ' ')} UTC. Regenerated with the roadmap; edit the files, not this page.</footer>
</main></body></html>
`;
  fs.writeFileSync(out, html);
  if (!quiet) console.log(`Wrote ${rel(out)}: ${all.length} initiative${all.length === 1 ? '' : 's'}, ${waiting.length} waiting on a person.`);
}

// The change track owes six things: scope, criteria with their tests, the impact on what it touches, tests
// green against the baseline, the scope check, a release with its rollback (gate 6). Everything else in
// gates 4 and 5 applies when 04-spec.md → **Touches:** names what calls for it. Undeclared, everything runs.
const TOUCH_KINDS = [
  ['interface', /^(interface|screens?|ui|pages?|layout|components?)\b/, ['4.3', '4.5', '4.9', '4.20', '5.9', '5.12', '5.15', '5.17']],
  ['copy', /^(copy|labels?|wording|text)\b/, ['5.17']],
  ['data', /^(data|schema|migrations?|records?)\b/, ['4.10', '4.18']],
  ['personal data', /^(personal data|pii)\b/, ['4.12', '4.19', '5.13']],
  ['permissions', /^(permissions?|roles?|access)\b/, ['4.12', '4.19', '5.13']],
  ['money', /^(money|payments?|pricing|prices?|billing|invoices?|checkout)\b/, ['4.7', '4.12', '4.19', '5.13']],
  ['messages', /^(messages?|emails?|notifications?|sms)\b/, ['4.21']],
  ['contracts', /^(contracts?|apis?|webhooks?|integrations?)\b/, ['4.18']],
  ['stack', /^(stack|dependenc(y|ies)|librar(y|ies)|frameworks?)\b/, ['4.8']],
];
const CHANGE_SLIM = { 4: ['4.3', '4.5', '4.7', '4.8', '4.9', '4.10', '4.12', '4.15', '4.18', '4.19', '4.20', '4.21'], 5: ['5.8', '5.9', '5.10', '5.11', '5.12', '5.13', '5.14', '5.15', '5.16', '5.17'] };
const UI_FILE = /\.(tsx|jsx|vue|svelte|css|scss|html?)\b/i;
const DATA_FILE = /migrat|schema|\.sql\b|prisma/i;
// "**Touches:** copy (the export button label), personal data": kinds separated by commas, each explained in parentheses.
function touches(spec) {
  const t = field(spec || '', 'Touches');
  if (!nonEmpty(t)) return null;
  const items = t.replace(/\([^)]*\)/g, '').toLowerCase().split(/[,;]|\band\b/).map((x) => x.trim()).filter(Boolean);
  return TOUCH_KINDS.filter(([, re]) => items.some((i) => re.test(i))).map(([k]) => k);
}
function gate(n, ctx) {
  const R = gateConditions(n, ctx);
  if (ctx.track !== 'change' || !CHANGE_SLIM[n]) return R;
  const spec = ctx.spec || (n === 4 ? ctx.artifact : '');
  const kinds = touches(spec);
  if (!kinds) {
    if (n === 4) { const r = R.find((x) => x.id === '4.2'); if (r) Object.assign(r, { status: 'fail', detail: `${r.detail}; change track: no "**Touches:**" naming what the change touches (interface, data, personal data, permissions, money, messages, contracts, stack) or "none of these"` }); }
    return R;
  }
  const due = new Set(TOUCH_KINDS.filter(([k]) => kinds.includes(k)).flatMap(([, , ids]) => ids));
  for (const r of R) {
    if (!CHANGE_SLIM[n].includes(r.id) || due.has(r.id)) continue;
    const by = TOUCH_KINDS.filter(([, , ids]) => ids.includes(r.id)).map(([k]) => k);
    Object.assign(r, { status: 'skip', detail: `change track touching ${kinds.join(', ') || 'none of the listed kinds'}${by.length ? `: applies when it touches ${by.join(' or ')}` : ''}` });
  }
  if (n === 5) {
    const files = rawRows(section(ctx.artifact, 'Slices')).flat().join(' ').split(/[\s,`]+/).filter((f) => /\.\w+$|\//.test(f));
    const hidden = [['interface', UI_FILE], ['data', DATA_FILE]].filter(([k, re]) => !kinds.includes(k) && files.some((f) => re.test(f))).map(([k, re]) => `${k} (${files.filter((f) => re.test(f)).slice(0, 3).join(', ')})`);
    const r = R.find((x) => x.id === '5.4');
    if (r && hidden.length) Object.assign(r, { status: 'fail', detail: `the slices touch ${hidden.join('; ')}, which 04-spec.md → **Touches:** does not declare: declare it and meet what it calls for` });
  }
  return R;
}

function gateConditions(n, ctx) {
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
    const risk = chosenBy(section(a, 'Riskiest assumption'), 'which assumption phase 1 tests');
    pass('0.5', risk.ok, risk.detail);
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
    const next = chosenBy(v, 'whether the work continues, stops or reshapes');
    pass('1.6', next.ok, next.detail);
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
    const opp = chosenBy(section(a, 'Selected'), 'the opportunity and its target');
    pass('2.8', opp.ok, opp.detail);
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
    pass('3.3', tc !== undefined, tc !== undefined ? `test costs ${tc} days` : 'no test cost in days');
    const tw = testWorth(a);
    pass('3.4', tw.ok, tw.detail);
    const raw = tableRows(section(a, 'Divergence')).filter((r) => nonEmpty(r[1]));
    const rawNeed = lite ? 5 : 8;
    pass('3.5', raw.length >= rawNeed, `${raw.length} raw ideas before convergence (${rawNeed} needed)`);
    const bet = chosenBy(section(a, 'Selected'), 'the bet');
    pass('3.6', bet.ok, bet.detail);
    if (ctx.track !== 'product') skip('3.7', `${ctx.track} track: the product already reaches its users and is priced`);
    else { const bc = businessCase(a, ctx.product); pass('3.7', bc.problems.length === 0, bc.problems.length ? bc.problems.join('; ') : bc.detail); }
    const stage = productStage(ctx.product);
    if (preScale(stage)) judge('3.8', `stage ${stage}: does the bet test whether there is a product, rather than scale, optimize or harden one nobody uses yet?`);
    else skip('3.8', `stage ${stage || 'unknown'}: scale work is allowed`);
    // Deciding what to build (business-case, go-to-market): the value in money, the assumption that carries it, the stake.
    const val = valueInfo(a, ctx, lite);
    if (val.judgment) judge('3.9', `value declared as a judgment, not a number: does it rest on what resists a number (trust, defensibility, brand), and is the reasoning explicit? "${val.judgment.slice(0, 120)}"`);
    else pass('3.9', val.problems.length === 0, val.problems.length ? val.problems.join('; ') : val.detail);
    if (val.judgment) { skip('3.10', 'value declared as a judgment'); skip('3.11', 'value declared as a judgment'); }
    else {
      const sens = sensitivityInfo(a, val);
      pass('3.10', sens.problems.length === 0, sens.problems.length ? sens.problems.join('; ') : sens.detail);
      const fq = fiveQuestions(a);
      pass('3.11', fq.ok, fq.detail);
    }
    if (!tw.first) skip('3.12', 'no test runs before the build');
    else { const card = experimentCard(a); pass('3.12', card.problems.length === 0, card.problems.length ? card.problems.join('; ') : card.detail); }
    const gtm = gtmBefore(a, ctx.track);
    pass('3.13', gtm.problems.length === 0, gtm.problems.length ? gtm.problems.join('; ') : gtm.detail);
    const size = betSize(a);
    pass('3.14', size.problems.length === 0, size.problems.length ? size.problems.join('; ') : size.detail);
    judge('3.15', `stage ${stage || 'unknown'}, ${size.door ? size.door.split(/[,.;]/)[0] + ' door' : 'door not declared'}: does the evidence behind the bet meet the bar for this stage and door (business-case, Evidence bar)? A judgment call is declared with its reasoning and a revisit date`);
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
    const im = impactInfo(a, ctx.track);
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
    if (preScale(stage)) judge('4.15', `stage ${stage}: is anything in this spec scale work (optimization, enterprise controls, infrastructure for load nobody has) that should wait for PMF? The six scale defaults in ## Architecture are not scale work.`);
    else skip('4.15', `stage ${stage || 'unknown'}: scale work is allowed`);
    if (!modelOut) skip('4.16', 'no model output declared');
    else { const ag = agentInfo(a, ctx); pass('4.16', ag.problems.length === 0, ag.problems.length ? ag.problems.join('; ') : ag.detail); }
    if (ctx.track !== 'product') skip('4.17', `${ctx.track} track: the first day already exists`);
    else { const fd = firstDayInfo(ctx); pass('4.17', fd.problems.length === 0, fd.problems.length ? fd.problems.join('; ') : fd.detail); }
    const ar = architectureInfo(a);
    pass('4.18', ar.problems.length === 0, ar.problems.length ? ar.problems.join('; ') : ar.detail);
    const tm = threatInfo(a);
    pass('4.19', tm.problems.length === 0, tm.problems.length ? tm.problems.join('; ') : tm.detail);
    const dg = diagramInfo(ctx);
    (lite ? warn : pass)('4.20', dg.problems.length === 0, dg.problems.length ? dg.problems.join('; ') : dg.detail);
    const ms = messagesInfo(ctx);
    pass('4.21', ms.problems.length === 0, ms.problems.length ? ms.problems.join('; ') : ms.detail);
    const tr = testsRead(ctx);
    if (tr.skip) skip('4.22', tr.skip);
    else pass('4.22', tr.problems.length === 0, tr.problems.length ? tr.problems.join('; ') : tr.detail);
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
      acceptedAt && !personWords(accepted, 'Accepted').ok && personWords(accepted, 'Accepted').problem,
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
    else { const gi = guardrailInfo(guard); pass('5.8', gi.problems.length === 0, gi.problems.length ? gi.problems.join('; ') : gi.detail); }
    const ir = interfaceReview(a, ctx);
    if (ir.skip) skip('5.9', ir.skip);
    else pass('5.9', ir.problems.length === 0, ir.problems.length ? ir.problems.join('; ') : ir.detail);
    const cc = craftCritique(a, ctx);
    if (cc.skip) skip('5.12', cc.skip);
    else pass('5.12', cc.problems.length === 0, cc.problems.length ? cc.problems.join('; ') : cc.detail);
    const sr = securityReview(a, ctx);
    if (sr.skip) skip('5.13', sr.skip);
    else pass('5.13', sr.problems.length === 0, sr.problems.length ? sr.problems.join('; ') : sr.detail);
    const pf = performanceInfo(a, ctx);
    if (pf.skip) skip('5.14', pf.skip);
    else pass('5.14', pf.problems.length === 0, pf.problems.length ? pf.problems.join('; ') : pf.detail);
    const dd = demoInfo(a, ctx);
    if (dd.skip) skip('5.15', dd.skip);
    else pass('5.15', dd.problems.length === 0, dd.problems.length ? dd.problems.join('; ') : dd.detail);
    const pr = productionInfo(ctx);
    (pr.warnOnly ? warn : pass)('5.16', pr.problems.length === 0, pr.problems.length ? pr.problems.join('; ') : pr.detail);
    const tr = triedInfo(a, ctx);
    if (tr.skip) skip('5.17', tr.skip);
    else pass('5.17', tr.problems.length === 0, tr.problems.length ? tr.problems.join('; ') : tr.detail);
    const qc = qualityChecks(ctx);
    if (qc.declined) warn('5.10', false, `no automated quality checks, ${qc.declined}`);
    else pass('5.10', qc.problems.length === 0, qc.problems.length ? qc.problems.join('; ') : qc.detail);
    const cp = contextPaths();
    pass('5.11', cp.tech && cp.hasMap && cp.missing.length === 0, !cp.tech ? 'no TECH.md' : !cp.hasMap ? 'no "## Map" in TECH.md: where the code the next session needs lives (entry points, modules, tests, generated files), or "not applicable, {reason}"' : cp.missing.length ? `paths that no longer exist: ${cp.missing.join('; ')}` : `TECH.md → Map has ${cp.rows} rows; every path in AGENTS.md, CLAUDE.md and the map exists`);
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
    // An event seen arriving is data from a real environment; a line of code shows the call exists, not that it fired.
  const unverified = inst.filter((r) => !/^yes/i.test(r[2] || '') || !(hasTag(r[4] || '', ['data']) || runEvidence(`**Run:** ${(r[4] || '').match(/[\w./-]+\.json/)?.[0] || ''}`, ctx).valid));
    if (ctx.track === 'change' && !tableRows(section(ctx.spec, 'Tracking plan')).filter(realEvent).length) skip('5.3', 'change track with no tracking plan in the spec: nothing to instrument');
    else pass('5.3', inst.length > 0 && unverified.length === 0, inst.length === 0 ? 'no instrumentation rows' : unverified.length ? `not seen arriving in a real environment (a data tag or a captured run): ${unverified.map((r) => r[0]).join(', ')}` : `${inst.length} events verified`);
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
    judge('6.4', `are the release notes written for users, not a commit list, and does **Help:** say where users find answers and what changed there?${lite ? ' (lite: a fail is a warning)' : ''}`);
    const orv = section(a, 'Outcome review') || '';
    const reviewDate = (field(orv, 'Date') || '').match(/^\d{4}-\d{2}-\d{2}/)?.[0];
    if (unmeasured) skip('6.5', 'change track with no outcome review: the initiative closes here');
    else pass('6.5', /\*\*Owner:\*\*\s*[^·{]+\S/.test(orv) && validDate(reviewDate), 'owner and valid review Date');
    const authorized = field(exposure, 'Authorized by');
    const authWords = nonEmpty(authorized) ? personWords(authorized, 'Authorized by') : { ok: false, problem: 'Exposure verification names nobody under "**Authorized by:**"' };
    pass('6.8', authWords.ok, authWords.ok ? `exposure authorized by ${authorized}${authWords.note}` : authWords.problem);
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
    const roll = chosenBy(section(a, 'Rollout'), 'the rollout strategy');
    pass('6.13', roll.ok, roll.detail);
    if (ctx.track === 'change' || ctx.track === 'spike') skip('6.14', `${ctx.track} track: nothing new to announce`);
    else { const lp = launchPlan(a); pass('6.14', lp.problems.length === 0, lp.problems.length ? lp.problems.join('; ') : lp.detail); }
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
    const verdict = chosenBy(section(a, 'Decision'), 'keep, iterate or kill');
    pass('7.7', verdict.ok, verdict.detail);
    if (ctx.track === 'change' || ctx.track === 'spike') skip('7.8', `${ctx.track} track: no launch to read`);
    else { const gr = gtmRead(a, ctx.track); pass('7.8', gr.problems.length === 0, gr.problems.length ? gr.problems.join('; ') : gr.detail); }
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
  // The documented shape `**Production check:** **Run:** {path}` and the bare path both resolve.
  const p = resourceFile((field(sec, label) || '').replace(/^\*\*Run:\*\*\s*/, ''), ctx);
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
  if (trivialRun(r)) return fail(`the recorded command (${r.command.join(' ')}) prints text and checks nothing: run the real test, measurement or request`);
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
    bet: read(path.join(dir, ARTIFACTS[3])),
    design: read(path.join(dir, 'DESIGN.md')),
    request: init ? read(path.join(dir, REQUEST)) : null,
  };
  const results = [];
  const evDirs = [path.join(dir, 'evidence'), path.join(BOS, 'evidence')];
  const missing = checkEvidence(artifact + (n === 4 ? '\n' + (ctx.design || '') : '') + (n === 'C' ? '\n' + (ctx.request || '') : ''), evDirs);
  results.push({ id: 'E.1', status: missing.length ? 'fail' : 'pass', detail: missing.length ? `unresolved: ${missing.slice(0, 5).join('; ')}${missing.length > 5 ? ` (+${missing.length - 5})` : ''}` : 'every tag resolves' });
  // Work drafted ahead on a recommended option while a round waited is not a decision: the answer confirms or discards it.
  const provisional = (stripFences(artifact + (n === 4 ? '\n' + (ctx.design || '') : '')).match(/\*\*Provisional:?\*\*/gi) || []).length;
  results.push({ id: 'E.2', status: provisional ? 'fail' : 'pass', detail: provisional ? `${provisional} provisional block${provisional > 1 ? 's' : ''} still drafted on a recommendation: keep each one the person's answer confirmed (drop the marker), delete the rest` : 'no provisional work left' });
  results.push(...gate(n, ctx));
  const au = audit(artifact);
  const checked_by = { script: results.filter((r) => ['pass', 'fail', 'warn'].includes(r.status)).map((r) => r.id), model: results.filter((r) => r.status === 'judge').map((r) => r.id) };
  const skipped = results.filter((r) => r.status === 'skip').map((r) => r.id);
  const failed = results.filter((r) => r.status === 'fail').map((r) => r.id);
  const out = { gate: n, initiative: init ? init.slug : null, artifact: rel(file), mode: ctx.mode, bos_version: VERSION, results, failed, checked_by, skipped, audit: au };
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

// The files that point the next session at the code: AGENTS.md and CLAUDE.md at the root, and TECH.md → Map.
// A path they name that no longer exists sends the agent looking for something that is gone.
const STEERING = ['AGENTS.md', 'CLAUDE.md'];
function pathLike(token) {
  const p = token.trim().replace(/[),.;:]+$/, '').replace(/:\d+([-,]\d+)*$/, '');
  if (!p.includes('/') || /^(https?:|~|\/|-)/.test(p) || /[*{}<>$|]/.test(p) || /\s/.test(p)) return null;
  return p.replace(/^\.\//, '');
}
function contextPaths() {
  const missing = [];
  const named = (file, text) => {
    for (const m of (text || '').matchAll(/`([^`\n]+)`/g)) {
      const p = pathLike(m[1]);
      if (p && !fs.existsSync(path.join(ROOT, p))) missing.push(`${file} names \`${p}\``);
    }
  };
  for (const f of STEERING) named(f, read(path.join(ROOT, f)));
  const tech = read(path.join(ROOT, 'TECH.md'));
  const mapSec = section(tech || '', 'Map');
  const rows = tableRows(mapSec).filter((r) => nonEmpty(r[0]));
  named('TECH.md → Map', rows.map((r) => r[0]).join('\n') + '\n' + (field(mapSec || '', 'Generated') || ''));
  const notApplicable = /not applicable[,:;—-]\s*\S.{2,}/i.test(mapSec || '');
  return { tech: !!tech, hasMap: rows.length > 0 || notApplicable, rows: rows.length, missing };
}
function domainStale() {
  if (!fs.existsSync(path.join(ROOT, 'DOMAIN.md')) || git('rev-parse', '--is-inside-work-tree') !== 'true') return null;
  const domain = Number(git('log', '-1', '--format=%ct', '--', 'DOMAIN.md') || 0);
  const schema = git('log', '-1', '--format=%ct %h', '--', ':(glob)**/migrations/**', ':(glob)**/*schema*', ':(glob)**/*.prisma', ':(glob)**/models/**');
  if (!domain || !schema) return null;
  const [when, sha] = schema.split(' ');
  return Number(when) > domain ? `DOMAIN.md is older than the last schema or migration change (${sha}): check the entities and rules still hold` : null;
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

// Conditions in force now that a passed gate never checked: a release added them after the gate ran.
// Each passed phase is gated again on its artifact; what fails or waits for judgment now, and was not in the
// record, is debt. It is shown, never retro-failed: the phase is not reopened.
function gateDebt(init) {
  const s = init.state, out = [];
  for (const [k, ph] of Object.entries(s.phases || {})) {
    if (!ph || ph.status !== 'passed' || !ph.gate || !ph.gate.passed || Number(k) >= (s.current_phase ?? 0) && s.status !== 'closed') continue;
    if (!fs.existsSync(path.join(init.dir, ARTIFACTS[k]))) continue;
    let j;
    try { j = JSON.parse(spawnSyncSelf(['gate', k, '--json', '--initiative', init.slug]) || '{}'); } catch { continue; }
    if (!j.results) continue;
    const g = ph.gate;
    const seen = new Set([...((g.checked_by || {}).script || []), ...((g.checked_by || {}).model || []), ...(g.skipped || [])]);
    const owed = j.results.filter((r) => r.status !== 'pass' && r.status !== 'skip' && !seen.has(r.id));
    if (owed.length) out.push({ phase: Number(k), version: g.bos_version || null, at: (g.checked_at || '').slice(0, 10), conditions: owed });
  }
  return out;
}
const debtLine = (init, debt) => {
  const ids = debt.flatMap((d) => d.conditions.map((c) => c.id));
  return `${init.state.title || init.slug}: ${ids.length} condition${ids.length > 1 ? 's' : ''} added since its gates passed ${ids.length > 1 ? 'are' : 'is'} not met yet (${ids.slice(0, 6).join(', ')}${ids.length > 6 ? ` and ${ids.length - 6} more` : ''}): debt, not a failure; meet ${ids.length > 1 ? 'them' : 'it'} when the work touches that phase again (\`bos.mjs doctor\` lists each)`;
};

const claimNote = (s) => (s.claim && s.claim.by ? `claimed by ${s.claim.by} since ${String(s.claim.at || '').slice(0, 10)}` : null);
// The newest round still waiting for the person's answer, or null.
function openRound(s) {
  const h = Array.isArray(s.history) ? s.history : [];
  const lastAsked = h.map((e, i) => [e, i]).filter(([e]) => e.event === 'round_asked').at(-1);
  if (!lastAsked) return null;
  return h.slice(lastAsked[1] + 1).some((e) => e.event === 'round_answered') ? null : lastAsked[0];
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
    lines.push(`${product} · ${s.title || active.slug} (${s.track || 'product'} track, cycle ${s.cycle || 1}): phase ${p} ${PHASES[p]}, ${lastGate(s)}${claimNote(s) ? `, ${claimNote(s)}` : ''}.`);
    const ov = overrides(s);
    lines.push(ov.length ? `Overrides in force: phase ${ov.join('; phase ')}.` : 'No overrides.');
    const ap = appetite(active);
    if (ap) lines.push(`${ap.line}.`);
    const dec = decisions();
    if (dec.length) lines.push(`Latest decision: ${dec[dec.length - 1].name}.`);
    const status = (s.phases || {})[p] ? s.phases[p].status : 'pending';
    const coverage = p === 0 && ['feature', 'change'].includes(s.track) ? (s.track === 'change' ? `write ${REQUEST} with its mandate, then the mandate check (\`gate M\`, \`cover --m4\`)` : `write ${REQUEST} with its evidence, then the coverage check (\`gate C\`, \`cover --c4\`)`) : null;
    const round = openRound(s);
    const waiting = round ? `the round asked ${round.at.slice(0, 16).replace('T', ' ')} waits for the person; meanwhile draft ahead on its recommended options, each block marked provisional (pressure-testing)` : null;
    lines.push(`Next: ${status === 'answered' ? 'the spike is answered; reclassify to continue' : waiting || coverage || `${status === 'in_progress' ? 'finish' : 'start'} phase ${p} ${PHASES[p]} (skill: ${PHASE_SKILLS[p]})`}.`);
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
    if ((s.status || 'open') === 'open' && s.claim && s.claim.at && (today - Date.parse(s.claim.at)) / DAY > 14) attention.push(`${s.title || i.slug} is ${claimNote(s)}: still theirs, or release it (\`bos.mjs claim --release\`)`);
    if ((s.status || 'open') !== 'closed' && !schemaProblems(i).length) { const debt = gateDebt(i); if (debt.length) attention.push(debtLine(i, debt)); }
  }
  for (const i of all) { const pr = schemaProblems(i); if (pr.length) attention.push(`${i.slug}/state.json does not follow the schema (${pr.slice(0, 3).join(', ')})`); }
  const ts = techStale();
  if (ts) attention.push(ts);
  const dead = contextPaths().missing;
  if (dead.length) attention.push(`${dead.slice(0, 3).join(', ')}${dead.length > 3 ? ` and ${dead.length - 3} more` : ''}: no longer there, update the pointer`);
  const ds = domainStale();
  if (ds) attention.push(ds);
  const agentsLines = (read(path.join(ROOT, 'AGENTS.md')) || '').split('\n').length;
  if (agentsLines > 150) attention.push(`AGENTS.md is ${agentsLines} lines and loads into every session: keep pointers and must-hold rules there, move the rest (agents-md)`);
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
  for (const m of loadMaps()) { if (!m.done) lines.push(mapLine(m)); attention.push(...m.problems.map((pr) => `map ${m.slug}: ${pr}`)); }
  for (const l of loadGrillingLogs()) { const gl = grillLine(l); if (gl) lines.push(gl); attention.push(...l.problems.map((pr) => `question log ${l.name}: ${pr}`)); }
  console.log(lines.slice(0, 6).join('\n'));
  if (attention.length) console.log(`Attention: ${attention.join('; ')}.`);
}

// ---------- wayfinding maps ----------

// A map is .builderos/maps/{slug}/MAP.md plus one file per decision ticket in tickets/, numbered NN-slug.md.
const TICKET_TYPES = ['research', 'prototype', 'grilling', 'task'];
// Ticket labels are often left empty (an unclaimed ticket), so read them on their own line only.
const lineField = (text, label) => { const m = (text || '').match(new RegExp(`\\*\\*${label}:?\\*\\*:?[ \\t]*(.*)`, 'i')); return m && m[1].trim() ? m[1].trim() : null; };
function loadMaps() {
  const root = path.join(BOS, 'maps');
  if (!fs.existsSync(root)) return [];
  return fs.readdirSync(root).filter((d) => fs.existsSync(path.join(root, d, 'MAP.md'))).sort().map((slug) => {
    const dir = path.join(root, slug);
    const md = read(path.join(dir, 'MAP.md'));
    const tdir = path.join(dir, 'tickets');
    const tickets = (fs.existsSync(tdir) ? fs.readdirSync(tdir) : []).filter((f) => /^\d{2,}-.+\.md$/.test(f)).sort().map((f) => {
      const tx = read(path.join(tdir, f));
      const num = f.match(/^(\d+)/)[1];
      const blockers = (lineField(tx, 'Blocked by') || '').match(/\b\d{2,}\b/g) || [];
      return { num, file: f, title: ((tx.match(/^#\s*(?:\d+\s*[:.]\s*)?(.+)$/m) || [])[1] || f).trim(), type: (lineField(tx, 'Type') || '').toLowerCase(), status: (lineField(tx, 'Status') || 'open').toLowerCase().split(/\s/)[0], claimed: lineField(tx, 'Claimed by'), blockers };
    });
    const closed = new Set(tickets.filter((x) => ['closed', 'out-of-scope'].includes(x.status)).map((x) => x.num));
    const open = tickets.filter((x) => !closed.has(x.num));
    const fog = tableRows(section(md, 'Not yet specified')).length + ((section(md, 'Not yet specified') || '').split('\n').filter((l) => /^\s*[-*]\s+\S/.test(l)).length);
    return {
      slug, dir, md, tickets, fog,
      title: ((md.match(/^#\s*(?:Map\s*[—:-]\s*)?(.+)$/m) || [])[1] || slug).trim(),
      destination: firstParagraph(section(md, 'Destination')) || '',
      done: /^(done|reached|closed)\b/i.test(lineField(md, 'Status') || ''),
      frontier: open.filter((x) => !nonEmpty(x.claimed) && x.blockers.every((b) => closed.has(b))),
      claimed: open.filter((x) => nonEmpty(x.claimed)),
      blocked: open.filter((x) => !nonEmpty(x.claimed) && !x.blockers.every((b) => closed.has(b))),
      decided: tickets.filter((x) => x.status === 'closed').length,
      problems: tickets.filter((x) => !TICKET_TYPES.includes(x.type)).map((x) => `${x.file} has no **Type:** (${TICKET_TYPES.join(', ')})`),
    };
  });
}
const named = (x) => `${x.num} ${x.title}${x.type ? ` (${x.type})` : ''}`;
function mapLine(m) {
  if (!m.frontier.length && !m.claimed.length && !m.blocked.length) return `Map ${m.title}: no open ticket${m.fog ? `, ${m.fog} patches of fog left to chart` : '; the way to the destination is clear, hand off or mark it done'}.`;
  return `Map ${m.title} → ${m.destination || 'destination not named'}: next ${m.frontier.length ? named(m.frontier[0]) : 'nothing takeable (all open tickets claimed or blocked)'}; ${m.frontier.length} on the frontier, ${m.claimed.length} claimed, ${m.blocked.length} blocked, ${m.decided} decided, ${m.fog} in the fog.`;
}
function map() {
  const all = loadMaps();
  const slug = args[1] && !args[1].startsWith('--') ? args[1] : null;
  const pick = slug ? all.filter((m) => m.slug === slug) : all.filter((m) => !m.done);
  if (slug && !pick.length) die(`no map .builderos/maps/${slug}/MAP.md`);
  if (!pick.length) { console.log('No open map in .builderos/maps/.'); return; }
  for (const m of pick) {
    console.log(`# ${m.title}\nDestination: ${m.destination || 'not named: name it before charting tickets'}`);
    console.log(`Frontier: ${m.frontier.map(named).join('; ') || 'none'}`);
    if (m.claimed.length) console.log(`Claimed: ${m.claimed.map((x) => `${named(x)} by ${x.claimed}`).join('; ')}`);
    if (m.blocked.length) console.log(`Blocked: ${m.blocked.map((x) => `${named(x)} by ${x.blockers.join(', ')}`).join('; ')}`);
    console.log(`Decided: ${m.decided} · Fog: ${m.fog}`);
    if (m.problems.length) console.log(`Problems: ${m.problems.join('; ')}`);
  }
}

// ---------- question logs ----------

// One question log per grilled decision, shared by every session on it (pressure-testing, Across Sessions):
// grilling.md in an initiative's folder, or .builderos/grilling/{topic}.md. Rows: Q | Question | Answer | By, date | Rests on | Status.
const qnums = (cell) => (String(cell || '').match(/\bQ\d+\b/gi) || []).map((q) => q.toUpperCase());
function loadGrillingLogs() {
  const files = [];
  const gdir = path.join(BOS, 'grilling');
  if (fs.existsSync(gdir)) for (const f of fs.readdirSync(gdir).filter((x) => x.endsWith('.md')).sort()) files.push({ name: f.replace(/\.md$/, ''), file: path.join(gdir, f) });
  for (const i of loadInitiatives()) { const f = path.join(i.dir, 'grilling.md'); if (fs.existsSync(f)) files.push({ name: i.slug, file: f }); }
  return files.map(({ name, file }) => {
    const md = read(file);
    const lines = md.split('\n').filter((l) => /^\s*\|/.test(l));
    const head = lines.length ? lines[0].replace(/^\s*\||\|\s*$/g, '').split('|').map((c) => c.trim().toLowerCase()) : [];
    const col = (re) => head.findIndex((h) => re.test(h));
    const at = { q: col(/^q$/), question: col(/^question/), answer: col(/^answer/), by: col(/^by/), rests: col(/^rests on/), status: col(/^status/) };
    const problems = [];
    if (at.q < 0 || at.status < 0) problems.push('no Q and Status columns');
    if (at.rests < 0) problems.push('no Rests on column, so a superseded answer cannot reopen what rests on it');
    const rows = tableRows(md).map((r) => ({ q: (r[at.q] || '').toUpperCase(), question: r[at.question] || '', answer: r[at.answer] || '', by: r[at.by] || '', rests: at.rests < 0 ? [] : qnums(r[at.rests]), status: (r[at.status] || '').toLowerCase() })).filter((r) => /^Q\d+$/.test(r.q));
    const seen = new Set();
    let last = 0;
    for (const r of rows) {
      const n = Number(r.q.slice(1));
      if (seen.has(r.q)) problems.push(`${r.q} appears twice: one number, one question`);
      else if (n < last) problems.push(`${r.q} comes after Q${last}: numbers run on, they never restart`);
      seen.add(r.q); last = Math.max(last, n);
    }
    const byQ = new Map(rows.map((r) => [r.q, r]));
    const superseded = (r) => /^superseded\b/.test(r.status);
    const decided = (r) => /^decided\b/.test(r.status);
    for (const r of rows) {
      const target = (r.status.match(/^superseded by (q\d+)/i) || [])[1];
      if (superseded(r) && (!target || !byQ.has(target.toUpperCase()))) problems.push(`${r.q} is superseded by ${target ? target.toUpperCase() : 'nothing named'}, which is not in the log`);
      if (decided(r) && (!nonEmpty(r.answer) || /^[—–-]$/.test(r.answer) || !/\d{4}-\d{2}-\d{2}/.test(r.by))) problems.push(`${r.q} is decided without an answer, who gave it and when`);
      for (const d of r.rests) if (!byQ.has(d)) problems.push(`${r.q} rests on ${d}, which is not in the log`);
    }
    // An answer resting on a replaced answer is reopened, and so is everything resting on it.
    const stale = new Set();
    let grew = true;
    while (grew) {
      grew = false;
      for (const r of rows) if (decided(r) && !stale.has(r.q) && r.rests.some((d) => stale.has(d) || (byQ.has(d) && superseded(byQ.get(d))))) { stale.add(r.q); grew = true; }
    }
    return {
      name, file: path.relative(ROOT, file), rows, problems,
      title: ((md.match(/^#\s*(?:Question log\s*[:—-]\s*)?(.+)$/m) || [])[1] || name).trim(),
      next: `Q${last + 1}`,
      open: rows.filter((r) => /^open\b/.test(r.status)),
      reask: rows.filter((r) => stale.has(r.q)).map((r) => ({ ...r, because: r.rests.filter((d) => stale.has(d) || (byQ.has(d) && superseded(byQ.get(d)))) })),
    };
  });
}
const reaskText = (l) => l.reask.map((r) => `${r.q} (rests on ${r.because.join(', ')})`).join(', ');
function grillLine(l) {
  if (!l.open.length && !l.reask.length) return null;
  return `Question log ${l.title}: next number ${l.next}; ${l.open.length} open${l.open.length ? ` (${l.open.map((r) => r.q).join(', ')})` : ''}${l.reask.length ? `, ${l.reask.length} to ask again because what they rest on was replaced: ${reaskText(l)}` : ''}.`;
}
function grill() {
  const all = loadGrillingLogs();
  const name = args[1] && !args[1].startsWith('--') ? args[1] : null;
  const pick = name ? all.filter((l) => l.name === name) : all;
  if (name && !pick.length) die(`no question log named ${name} (an initiative's grilling.md or .builderos/grilling/${name}.md)`);
  if (!pick.length) { console.log('No question log in this project.'); return; }
  for (const l of pick) {
    console.log(`# ${l.title} (${l.file})\nNext number: ${l.next}`);
    console.log(`Open: ${l.open.map((r) => `${r.q} ${r.question}`).join('; ') || 'none'}`);
    console.log(`Ask again: ${l.reask.length ? l.reask.map((r) => `${r.q} ${r.question} (rests on ${r.because.join(', ')})`).join('; ') : 'none'}`);
    console.log(`Decided: ${l.rows.filter((r) => /^decided\b/.test(r.status)).length - l.reask.length} · Superseded: ${l.rows.filter((r) => /^superseded\b/.test(r.status)).length}`);
    if (l.problems.length) console.log(`Problems: ${l.problems.join('; ')}`);
  }
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
    const killedAt = Object.keys(ph).find((k) => ph[k] && ph[k].status === 'killed');
    if (killedAt !== undefined) return `killed at phase ${killedAt}`;
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
  writePage(true);
}

// ---------- new ----------

function newInitiative(slug) {
  if (!slug || !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug)) die('new needs a lowercase hyphenated slug');
  if (!fs.existsSync(path.join(BOS, 'ROADMAP.md'))) die('no .builderos/ROADMAP.md: run `bos.mjs init` first');
  const track = opt('--track');
  if (!TRACKS.includes(track)) die('new needs --track spike|feature|change|product: classify the work and say why before creating it (references/lifecycle-setup.md, Tracks); on an existing product a change with a mandate (bug, debt, compliance, contract) is change, a new behavior to bet on is feature');
  if (opt('--mode') && !['full', 'lite'].includes(opt('--mode'))) die('mode is full or lite');
  const dir = path.join(INIT_DIR, slug);
  if (fs.existsSync(path.join(dir, 'state.json'))) die(`initiative ${slug} already exists`);
  fs.mkdirSync(path.join(dir, 'evidence'), { recursive: true });
  const now = new Date().toISOString();
  pauseOthers(slug, now, `${slug} became active`);
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

// The project memory a first run needs, and nothing invented: the folders, an empty roadmap, the ignore lines.
// PRODUCT.md and TECH.md are written with the person (references/lifecycle-setup.md, step 5); init never guesses them.
function initProject() {
  for (const d of ['decisions', 'evidence', 'initiatives']) fs.mkdirSync(path.join(BOS, d), { recursive: true });
  const rm = path.join(BOS, 'ROADMAP.md');
  if (!fs.existsSync(rm)) fs.writeFileSync(rm, `# ROADMAP\n\n**Verified:** ${new Date().toISOString().slice(0, 10)}\n\n## Direction\nWritten from PRODUCT.md once it exists.\n\n## Now\n| Initiative | Track | Phase | Bet in one line | Folder |\n|------------|-------|-------|-----------------|--------|\n\n## Done\n| Initiative | Outcome | Learning | Date |\n|------------|---------|----------|------|\n`);
  const gi = path.join(ROOT, '.gitignore');
  const have = read(gi) || '';
  const add = ['.builderos/local.json', '.builderos/media/'].filter((l) => !have.split('\n').includes(l));
  if (add.length) fs.writeFileSync(gi, have + (have && !have.endsWith('\n') ? '\n' : '') + add.join('\n') + '\n');
  const missing = ['PRODUCT.md', 'TECH.md'].filter((f) => !fs.existsSync(path.join(ROOT, f)));
  console.log(`BuilderOS memory ready in .builderos/.${missing.length ? ` Still to write with the person: ${missing.join(', ')} (references/lifecycle-setup.md, step 5).` : ''} Next: name the initiative with \`new {slug} --track ... --reason ...\`.`);
}

function pauseOthers(slug, now, why) {
  for (const i of loadInitiatives()) {
    if (i.slug === slug || (i.state.status || 'open') !== 'open') continue;
    i.state.status = 'paused';
    i.state.history = [...(i.state.history || []), { at: now, event: 'paused', reason: why }];
    writeJSON(path.join(i.dir, 'state.json'), i.state);
  }
}

// Back to a paused initiative: it becomes the open one on this checkout, the others pause.
function resume(slug) {
  const init = loadInitiatives().find((i) => i.slug === slug);
  if (!init) die(`no initiative ${slug || '(none named)'}: resume takes the slug of a paused or open initiative`);
  if (init.state.status === 'closed') die(`${slug} is closed: start a new initiative, or reframe it if the problem came back`);
  const now = new Date().toISOString();
  pauseOthers(slug, now, `${slug} resumed`);
  const s = init.state;
  s.status = 'open';
  s.updated_at = now;
  s.history.push({ at: now, event: 'initiative_switched', to: slug, reason: opt('--reason') || 'resumed' });
  writeJSON(path.join(init.dir, 'state.json'), s);
  writeJSON(path.join(BOS, 'local.json'), { active: slug });
  roadmap();
  console.log(`${slug} is active again at phase ${s.current_phase} ${PHASES[s.current_phase]}; other open initiatives are paused.`);
}

// The frame was wrong (a reshaped discovery, a kill criterion that moved): a new cycle from phase 0. The
// history stays; the artifacts of the old cycle stay on disk to be rewritten.
function reframe() {
  const init = resolveActive(loadInitiatives());
  if (!init) die('no active initiative');
  const reason = opt('--reason');
  if (!nonEmpty(reason)) die('reframe needs --reason: what made the frame wrong');
  const s = init.state;
  if (s.status === 'closed') die('a closed initiative is not reframed: start a new one');
  const now = new Date().toISOString();
  s.cycle = (s.cycle || 1) + 1;
  for (let k = 0; k < 8; k++) s.phases[String(k)] = { status: k === 0 ? 'in_progress' : 'pending', artifact: null, gate: null };
  s.history.push({ at: now, event: 'cycle_started', cycle: s.cycle, phase: 0, from: s.current_phase, reason });
  s.current_phase = 0;
  s.updated_at = now;
  writeJSON(path.join(init.dir, 'state.json'), s);
  roadmap();
  console.log(`${init.slug} starts cycle ${s.cycle} at phase 0 FRAME: ${reason}. Rewrite ${ARTIFACTS[0]} first; later artifacts are rewritten as their phases come.`);
}

// A forced move. Back: the phases from the target on are reopened. Forward: the phases jumped are recorded as
// overridden, not run, with the person's reason, and the briefing shows them until a later cycle runs them.
function jump(which) {
  const init = resolveActive(loadInitiatives());
  if (!init) die('no active initiative');
  const n = Number(which);
  const s = init.state;
  if (!Number.isInteger(n) || n < 0 || n > 7) die('jump takes a phase number 0-7');
  if (s.status === 'closed') die('a closed initiative does not move');
  if (n === s.current_phase) die(`${init.slug} is already at phase ${n}`);
  const reason = opt('--reason');
  if (!nonEmpty(reason)) die('jump needs --reason, in the person\'s words');
  const w = personWords(reason, 'jump'); if (!w.ok) die(`--reason: ${w.problem}`);
  const now = new Date().toISOString();
  const from = s.current_phase;
  if (n < from) for (let k = n; k <= 7; k++) s.phases[String(k)] = { ...(s.phases[String(k)] || {}), status: k === n ? 'in_progress' : 'pending', gate: null };
  else {
    for (let k = from; k < n; k++) s.phases[String(k)] = { ...(s.phases[String(k)] || { artifact: null }), status: 'passed', gate: { passed: true, checked_at: now, bos_version: VERSION, checked_by: { script: [], model: [] }, skipped: [], failed_conditions: ['not run'], overridden: true, override_reason: `jumped: ${reason}`, waived: ['not run'] } };
    s.phases[String(n)] = { ...(s.phases[String(n)] || { artifact: null, gate: null }), status: 'in_progress' };
  }
  s.current_phase = n;
  s.updated_at = now;
  s.history.push({ at: now, event: 'phase_jump', from, to: n, reason });
  writeJSON(path.join(init.dir, 'state.json'), s);
  roadmap();
  console.log(n < from ? `${init.slug} back at phase ${n} ${PHASES[n]}; phases ${n} to 7 reopen.` : `${init.slug} jumped to phase ${n} ${PHASES[n]}; phases ${from} to ${n - 1} stand as overridden, not run, and the briefing shows them.`);
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
    s.phases[k] = { status: 'covered', artifact: null, gate: { passed: true, checked_at: now, bos_version: VERSION, checked_by: { script: j.checked_by.script, model: ['C.4'] }, failed_conditions: [], overridden: false } };
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
    s.phases[k] = { status: 'covered', artifact: null, gate: { passed: true, checked_at: now, bos_version: VERSION, checked_by: { script: j.checked_by.script, model: ['M.4'] }, failed_conditions: [], overridden: false } };
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
  if (nonEmpty(opt('--accepted-by'))) { const w = personWords(opt('--accepted-by'), 'accepted by'); if (!w.ok) die(`--accepted-by: ${w.problem}`); }
  const init = resolveActive(loadInitiatives());
  if (!init) die('no active initiative');
  const n = Number(which);
  const s = init.state;
  if (!Number.isInteger(n) || !(n >= 0 && n <= 7)) die('record takes a phase number 0-7');
  if (s.status === 'closed') die('a closed initiative cannot record another gate');
  const problems = schemaProblems(init);
  if (problems.length) die(`invalid state: ${problems.join(', ')}`);
  if (n !== s.current_phase) die(`${init.slug} is at phase ${s.current_phase}; record ${s.current_phase}, or pass --initiative`);
  if (flag('--kill')) return kill(init, n);
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
  const waive = (opt('--waive') || '').split(',').map((x) => x.trim()).filter(Boolean);
  if (flag('--waive') && !override) die('--waive needs --override "the person\'s reason"');
  // An override waives conditions by name: one failure is named by itself, several need --waive, so a
  // reason given for one condition never carries the others with it.
  let waived = [];
  if (override && failed.length) {
    waived = waive.length ? waive : failed.length === 1 ? failed : [];
    if (!waived.length) die(`${failed.length} conditions failed (${failed.join(', ')}): an override waives each by name, --waive ${failed.join(',')}, with the person's reason for each`);
    const stray = waived.filter((id) => !failed.includes(id));
    if (stray.length) die(`--waive names conditions that did not fail: ${stray.join(', ')}`);
    const w = personWords(override, 'override'); if (!w.ok) die(`--override: ${w.problem}`);
  }
  const unwaived = failed.filter((id) => !waived.includes(id));
  const acceptedBy = opt('--accepted-by');
  if (flag('--accepted-by') && !nonEmpty(acceptedBy)) die('--accepted-by needs the name of the person who accepted');
  if (flag('--accepted-by') && !ACCEPTANCE_PHASES.includes(n)) die(`--accepted-by applies to phases ${ACCEPTANCE_PHASES.join(', ')}; the phase 5 plan is accepted in 05-build-plan.md`);
  const passing = unwaived.length === 0;
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
  const gateEntry = { passed: passing, checked_at: now, bos_version: VERSION, checked_by: j.checked_by, skipped: j.skipped || [], failed_conditions: failed, overridden: Boolean(passing && failed.length) };
  if (gateEntry.overridden) { gateEntry.override_reason = override; gateEntry.waived = waived; }
  if (gateEntry.passed && nonEmpty(acceptedBy)) { gateEntry.accepted_by = acceptedBy; gateEntry.accepted_at = now; }
  const ph = (s.phases[String(n)] = { ...(s.phases[String(n)] || {}), artifact: ARTIFACTS[n], gate: gateEntry });
  s.history = s.history || [];
  s.updated_at = now;
  if (!gateEntry.passed) {
    ph.status = 'in_progress';
    s.history.push({ at: now, event: 'gate_failed', phase: n, failed_conditions: failed });
    writeJSON(path.join(init.dir, 'state.json'), s);
    console.log(`Gate ${n} failed on ${unwaived.join(', ')}${waived.length ? ` (waived: ${waived.join(', ')})` : ''}: ${init.slug} stays at phase ${n}.`);
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
// A test that came back under its stop line, an appetite spent, a person who says stop: the initiative ends
// at the phase it is in, with the reason in the person's words. Phase 7 decides through --verdict kill.
function kill(init, n) {
  const s = init.state;
  const reason = opt('--kill');
  if (!nonEmpty(reason)) die('--kill needs the reason, as the person gave it');
  if (n === 7) die('phase 7 decides with --verdict kill');
  const w = personWords(reason, 'kill'); if (!w.ok) die(`--kill: ${w.problem}`);
  const now = new Date().toISOString();
  s.phases[String(n)] = { ...(s.phases[String(n)] || { artifact: null, gate: null }), status: 'killed' };
  s.status = 'closed';
  s.updated_at = now;
  s.history = [...(s.history || []), { at: now, event: 'closed', phase: n, verdict: 'killed', reason }];
  writeJSON(path.join(init.dir, 'state.json'), s);
  roadmap();
  console.log(`${init.slug} killed at phase ${n} ${PHASES[n]}: ${reason}. Write what it taught in ROADMAP.md → Done.`);
}

// The appetite the bet declared, against the days since phase 3 passed. Past it, the work stops for a decision.
function appetite(init) {
  const s = init.state;
  const p = s.current_phase ?? 0;
  if ((s.status || 'open') !== 'open' || p < 4 || p > 6) return null;
  const days = firstNumber(field(section(read(path.join(init.dir, ARTIFACTS[3])) || '', 'Bet size') || '', 'Appetite'));
  const start = [...(s.history || [])].reverse().find((e) => e.phase === 3 && ['gate_passed', 'gate_overridden', 'phase_covered'].includes(e.event));
  if (!days || !start || !validTimestamp(start.at)) return null;
  const spent = Math.floor((Date.now() - Date.parse(start.at)) / DAY);
  return { days, spent, over: spent > days, line: spent > days ? `Appetite spent: ${spent} days since the bet against ${days} declared. Stop and put the choice to the person: cut scope to what fits, a new bet with a new appetite, or record --kill` : `Appetite: ${spent} of ${days} days spent since the bet` };
}

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

const HISTORY_EVENTS = ['track_set', 'phase_covered', 'track_upgraded', 'phase_jump', 'initiative_switched', 'paused', 'migrated', 'gate_passed', 'gate_failed', 'gate_overridden', 'review_deferred', 'cycle_started', 'closed', 'watch_checked', 'watch_breached', 'claimed', 'claim_released', 'claim_taken', 'round_asked', 'round_answered'];

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
  if (s.claim !== undefined && s.claim !== null && (typeof s.claim !== 'object' || !nonEmpty(s.claim.by) || !validTimestamp(s.claim.at))) p.push('claim needs by and an at timestamp');
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

// ---------- claim, rounds ----------

// One owner per initiative at a time: two sessions writing one state.json is a merge conflict nobody resolves well.
function claim() {
  const init = resolveActive(loadInitiatives());
  if (!init) die('no active initiative: pass --initiative <slug>');
  const s = init.state;
  const problems = schemaProblems(init);
  if (problems.length) die(`invalid state: ${problems.join(', ')}`);
  const by = opt('--by');
  if (!nonEmpty(by)) die('claim needs --by "who": the person the session works for');
  const now = new Date().toISOString();
  const held = s.claim && s.claim.by;
  if (flag('--release')) {
    if (!held) die(`${init.slug} is not claimed`);
    if (held !== by && !nonEmpty(opt('--reason'))) die(`${init.slug} is claimed by ${held}: releasing someone else's claim needs --reason`);
    s.claim = null;
    s.history.push({ at: now, event: 'claim_released', by, ...(held !== by ? { from: held, reason: opt('--reason') } : {}) });
  } else if (held && held !== by) {
    if (!flag('--take')) die(`${init.slug} is ${claimNote(s)}: ask them to release it, or take it over with --take --reason "..."`);
    if (!nonEmpty(opt('--reason'))) die('--take needs --reason: why the work changes hands');
    s.claim = { by, at: now };
    s.history.push({ at: now, event: 'claim_taken', by, from: held, reason: opt('--reason') });
  } else {
    s.claim = { by, at: now };
    s.history.push({ at: now, event: 'claimed', by });
  }
  s.updated_at = now;
  writeJSON(path.join(init.dir, 'state.json'), s);
  console.log(s.claim ? `${init.slug} is claimed by ${by}. Commit and push state.json so the other sessions see it.` : `${init.slug} is free to claim.`);
}

// A round is asked when the questions reach the person and answered when the person replies.
// The gap between the two is how long the work waited on a decision; pace reads it.
function round() {
  const init = resolveActive(loadInitiatives());
  if (!init || init.state.status === 'closed') die('round needs an open initiative: pass --initiative <slug>');
  const s = init.state;
  const problems = schemaProblems(init);
  if (problems.length) die(`invalid state: ${problems.join(', ')}`);
  const now = new Date().toISOString();
  const phase = s.current_phase ?? 0;
  const asked = opt('--asked');
  const answers = opt('--answered');
  if (asked !== undefined) {
    const q = Number(asked);
    if (!Number.isInteger(q) || q < 1 || q > 4) die('--asked takes the number of questions in the round, 1 to 4');
    if (openRound(s)) die('a round is already waiting for an answer: record it with --answered first');
    s.history.push({ at: now, event: 'round_asked', phase, questions: q });
  } else if (answers !== undefined) {
    if (!nonEmpty(answers)) die('--answered needs the answer as the person gave it ("1B, 2A", "go with the recommendations")');
    const by = opt('--by');
    if (!nonEmpty(by) || AGENT_NAME.test(by)) die('--answered needs --by: the person who answered, never the agent');
    const open = openRound(s);
    s.history.push({ at: now, event: 'round_answered', phase, answers, by, ...(open ? { waited_hours: Math.round((Date.parse(now) - Date.parse(open.at)) / 36e5 * 10) / 10 } : {}) });
  } else die('usage: round --asked N | --answered "1B, 2A" --by "who"');
  s.updated_at = now;
  writeJSON(path.join(init.dir, 'state.json'), s);
  console.log(asked !== undefined ? `Round of ${asked} recorded as asked at phase ${phase}. While it waits, draft ahead on the recommended options, each block marked **Provisional:**.` : `Answer recorded. Keep the provisional work the answer confirmed (drop its marker), delete the rest, then write the decisions with **Chosen by:**.`);
}

// ---------- doctor ----------

// Whether this install and this project are in the shape BuilderOS expects, in one read.
function doctor() {
  const rows = [];
  const add = (status, what, detail) => rows.push({ status, what, detail });
  const major = Number(process.versions.node.split('.')[0]);
  add(major >= 18 ? 'ok' : 'fail', 'Node.js', `${process.versions.node}${major >= 18 ? '' : ': BuilderOS needs 18 or later'}`);
  const vendored = path.resolve(SELF) === path.resolve(VENDORED);
  add('ok', 'Script', `${VERSION}, ${vendored ? 'the project copy' : `the installed plugin (${path.dirname(path.dirname(SELF))})`}`);
  if (!vendored) {
    const hooks = readJSONSafe(path.join(path.dirname(path.dirname(SELF)), 'hooks', 'hooks.json'));
    const events = hooks && hooks.hooks ? Object.keys(hooks.hooks) : [];
    const want = ['SessionStart', 'PreToolUse', 'UserPromptSubmit'];
    const lacking = want.filter((e) => !events.includes(e));
    add(lacking.length ? 'warn' : 'ok', 'Hooks', lacking.length ? `${hooks ? `missing ${lacking.join(', ')}` : 'no hooks/hooks.json next to the script'}: on a host without hooks, read using-builder-os first and run \`brief\`` : want.join(', '));
  } else add('warn', 'Hooks', 'running the project copy: hooks come from the installed plugin, not checked from here');
  if (!fs.existsSync(BOS)) {
    add('warn', 'Project', 'no .builderos/ here: nothing to check beyond the install (initialize to start)');
    return printDoctor(rows);
  }
  if (!vendored) add(!fs.existsSync(VENDORED) ? 'warn' : vendoredStale() ? 'warn' : 'ok', 'Project copy', !fs.existsSync(VENDORED) ? 'no .builderos/bin/bos.mjs: sessions without the plugin cannot brief or gate; run `bos.mjs vendor`' : vendoredStale() || `${rel(VENDORED)} matches this script`);
  for (const f of ['PRODUCT.md', 'TECH.md', 'AGENTS.md']) add(fs.existsSync(path.join(ROOT, f)) ? 'ok' : f === 'AGENTS.md' ? 'warn' : 'fail', f, fs.existsSync(path.join(ROOT, f)) ? 'present' : f === 'AGENTS.md' ? 'missing: run agents-md so a new session finds the memory' : 'missing: project memory is incomplete');
  const agents = read(path.join(ROOT, 'AGENTS.md')) || '';
  if (agents) add(/builderos|\.builderos\//i.test(agents) ? 'ok' : 'warn', 'AGENTS.md block', /builderos|\.builderos\//i.test(agents) ? 'names BuilderOS' : 'no BuilderOS block: run agents-md');
  if (read(path.join(BOS, 'state.json'))) add('fail', 'Schema', 'schema 1 state at .builderos/state.json: run `bos.mjs migrate`');
  for (const i of loadInitiatives()) {
    const name = `Initiative ${i.slug}`;
    const pr = schemaProblems(i);
    if (pr.length) { add('fail', name, `state.json does not follow the schema: ${pr.join(', ')}`); continue; }
    const s = i.state;
    add('ok', name, `${s.status}, phase ${s.current_phase} ${PHASES[s.current_phase]}${claimNote(s) ? `, ${claimNote(s)}` : ', unclaimed'}`);
    if (s.status === 'closed') continue;
    for (const d of gateDebt(i)) add('warn', `  phase ${d.phase} debt`, `gate passed ${d.at}${d.version ? ` under ${d.version}` : ' before gates recorded their version'}; now owed: ${d.conditions.map((c) => `${c.id} (${c.status === 'judge' ? 'to judge' : c.status}: ${String(c.detail).slice(0, 90)})`).join('; ')}`);
  }
  return printDoctor(rows);
}
function readJSONSafe(p) { try { return JSON.parse(fs.readFileSync(p, 'utf8')); } catch { return null; } }
function printDoctor(rows) {
  const mark = { ok: '✓', warn: '!', fail: '✗' };
  console.log(`## BuilderOS doctor · ${VERSION}\n\n| | Check | Detail |\n|---|---|---|`);
  for (const r of rows) console.log(`| ${mark[r.status]} | ${r.what} | ${String(r.detail).replace(/\|/g, '/')} |`);
  const failed = rows.filter((r) => r.status === 'fail').length;
  console.log(failed ? `\n**${failed} to fix.**` : '\n**Nothing to fix.** Warnings are debt or setup worth doing, not breakage.');
  process.exit(failed ? 1 : 0);
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
    const waits = h.filter((e) => e.event === 'round_answered' && typeof e.waited_hours === 'number').map((e) => e.waited_hours).sort((x, y) => x - y);
    const asked = h.filter((e) => e.event === 'round_asked').length;
    out.push('', asked ? `**Rounds:** ${asked} asked, ${waits.length} answered with a recorded wait${waits.length ? `; median wait ${waits[Math.floor((waits.length - 1) / 2)]} h, longest ${waits.at(-1)} h` : ''}` : '**Rounds:** none recorded (`bos.mjs round --asked N` when a round reaches the person)');
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
  if (PERSON_LOG_PATH.test(abs)) decide('deny', 'The person log holds what the person wrote, appended by the BuilderOS hook at each message and by nothing else. Quote their words from it; ask them when the words are not there.');
}
const PERSON_LOG_PATH = /(^|[\\/])\.builderos[\\/]person-log\.jsonl$/;

// UserPromptSubmit hook: one line per message, so the check against standing conditions happens
// at every request and not only when the session starts. Silent outside an active initiative.
function context() {
  let input = {};
  try { input = JSON.parse(fs.readFileSync(0, 'utf8') || '{}'); } catch { /* no payload: nothing to log */ }
  if (!fs.existsSync(INIT_DIR)) return;
  if (typeof input.prompt === 'string' && input.prompt.trim()) {
    try { fs.appendFileSync(PERSON_LOG, JSON.stringify({ at: new Date().toISOString(), text: input.prompt.slice(0, 4000) }) + '\n'); } catch { /* logging never blocks the message */ }
  }
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
  if (claimNote(s)) bits.push(`${claimNote(s)}: work on it only as that person or with their release`);
  const accepted = p === 5 && /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(field(section(read(path.join(dir, '05-build-plan.md')) || '', 'Plan') || '', 'Accepted') || '');
  if (accepted) bits.push('build plan accepted');
  else if (p <= 5) bits.push('no product code for this initiative until its build plan is accepted, even if asked to skip: offer to finish the gate, a change, or an override recorded with the person\'s reason');
  const ov = overrides(s);
  if (ov.length) bits.push(`overrides in force: phase ${ov.join('; phase ')}`);
  const ap = appetite(active);
  if (ap && ap.over) bits.push(ap.line);
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
else if (cmd === 'page') writePage();
else if (cmd === 'new') newInitiative(args[1]);
else if (cmd === 'init') initProject();
else if (cmd === 'resume') resume(args[1]);
else if (cmd === 'reframe') reframe();
else if (cmd === 'jump') jump(args[1]);
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
else if (cmd === 'map') map();
else if (cmd === 'grill') grill();
else if (cmd === 'doctor') doctor();
else if (cmd === 'claim') claim();
else if (cmd === 'round') round();
else if (cmd === 'flows') flows();
else {
  console.log('usage: node bos.mjs brief | gate <0-7|C|M> [--json] | new <slug> --title t --track k | cover --c4 reason | cover --m4 reason | upgrade --to feature|product --reason text | record <0-7> --judged ids | run-check --label slug -- executable args... | defer-review --review-due date --reason text | roadmap | page | migrate | pace | vendor | guard (PreToolUse hook, reads stdin) | context (UserPromptSubmit hook) | evidence add --class c --id id --where w [--shared] [--from file] | review [--file f] [--json] | map [slug] | doctor | claim --by who [--release | --take --reason text] | round --asked N | round --answered "1B, 2A" --by who | watch --note text (--recheck date | --clear --breach slug)   [--initiative slug] [--root dir]');
  process.exit(cmd ? 2 : 0);
}
