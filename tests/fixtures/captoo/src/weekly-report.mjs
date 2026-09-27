import { shareOfVoice, displacedBy } from './sov.mjs';

export function weeklyReport({ account, brand, thisWeek, lastWeek }) {
  const now = shareOfVoice(thisWeek, brand);
  const before = shareOfVoice(lastWeek, brand);
  const engines = Object.keys(now).map((engine) => ({
    engine,
    sov: now[engine],
    previous: before[engine] ?? null,
    delta: before[engine] == null ? null : now[engine] - before[engine],
  }));
  return { account, brand, engines, displacedBy: displacedBy(thisWeek, brand).slice(0, 5) };
}
