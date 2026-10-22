import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const script = new URL('../../scripts/bos.mjs', import.meta.url).pathname;
const fixture = new URL('../fixtures/acme', import.meta.url).pathname;
function project(t) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'bos-map-'));
  fs.cpSync(fixture, root, { recursive: true });
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const map = path.join(root, '.builderos/maps/pricing');
  fs.mkdirSync(path.join(map, 'tickets'), { recursive: true });
  const write = (f, s) => fs.writeFileSync(path.join(map, f), s);
  const run = (...a) => spawnSync(process.execPath, [script, ...a, '--root', root], { encoding: 'utf8' }).stdout;
  return { write, run };
}
const TICKET = (n, title, { type = 'grilling', status = 'open', blocked = 'none', claimed = '' } = {}) => `# ${n}: ${title}\n**Type:** ${type}\n**Status:** ${status}\n**Blocked by:** ${blocked}\n**Claimed by:** ${claimed}\n\n## Question\n${title}?\n`;
const MAP = `# Map — Pricing\n**Status:** open\n\n## Destination\nA priced self-serve plan on the roadmap as an initiative.\n\n## Notes\nItalian SMEs.\n\n## Decisions so far\n\n## Not yet specified\n- whether agencies resell\n- annual discount\n\n## Out of scope\n`;

test('map computes the frontier from blocking edges and claims, and the briefing names the next ticket', (t) => {
  const p = project(t);
  p.write('MAP.md', MAP);
  p.write('tickets/01-who-pays.md', TICKET('01', 'Who pays', { status: 'closed' }));
  p.write('tickets/02-price-anchor.md', TICKET('02', 'Price anchor', { type: 'research', blocked: '01' }));
  p.write('tickets/03-trial-length.md', TICKET('03', 'Trial length', { blocked: '02' }));
  p.write('tickets/04-billing-provider.md', TICKET('04', 'Billing provider', { type: 'task', claimed: 'Mario, 2026-10-21' }));
  const out = p.run('map');
  assert.match(out, /Frontier: 02 Price anchor \(research\)$/m);
  assert.match(out, /Claimed: 04 Billing provider \(task\) by Mario/);
  assert.match(out, /Blocked: 03 Trial length \(grilling\) by 02/);
  assert.match(out, /Decided: 1 · Fog: 2/);
  assert.match(p.run('brief'), /Map Pricing → A priced self-serve plan.*next 02 Price anchor \(research\); 1 on the frontier, 1 claimed, 1 blocked, 1 decided, 2 in the fog\./);
});

test('a ticket without a type is flagged, and a done map leaves the briefing', (t) => {
  const p = project(t);
  p.write('MAP.md', MAP);
  p.write('tickets/01-who-pays.md', TICKET('01', 'Who pays', { type: '' }));
  assert.match(p.run('brief'), /Attention:.*map pricing: 01-who-pays\.md has no \*\*Type:\*\*/);
  p.write('MAP.md', MAP.replace('**Status:** open', '**Status:** done'));
  assert.doesNotMatch(p.run('brief'), /Map Pricing/);
  assert.match(p.run('map'), /No open map/);
});
