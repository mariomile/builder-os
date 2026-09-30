// Equal-allocation, two-sided normal approximation: 95% confidence and 80% power.
// No dependencies. This is the calculation source for the committed lookup table.
import { pathToFileURL } from 'node:url';

export const Z_ALPHA = 1.96;
export const Z_POWER = 0.84;

export function sampleSize({ baseline, mde, mdeType = 'absolute', direction = 'increase' }) {
  if (!Number.isFinite(baseline) || baseline <= 0 || baseline >= 1) {
    throw new RangeError('baseline must be a probability strictly between 0 and 1');
  }
  if (!Number.isFinite(mde) || mde <= 0) throw new RangeError('mde must be positive and finite');
  if (!['absolute', 'relative'].includes(mdeType)) throw new RangeError('mdeType must be absolute or relative');
  if (!['increase', 'decrease'].includes(direction)) throw new RangeError('direction must be increase or decrease');
  const delta = (mdeType === 'relative' ? baseline * mde : mde) * (direction === 'increase' ? 1 : -1);
  const alternative = baseline + delta;
  if (alternative <= 0 || alternative >= 1) throw new RangeError('alternative must be strictly between 0 and 1');
  const unrounded = (Z_ALPHA + Z_POWER) ** 2
    * (baseline * (1 - baseline) + alternative * (1 - alternative)) / delta ** 2;
  return { baseline, alternative, absoluteMde: Math.abs(delta), relativeMde: Math.abs(delta) / baseline,
    perVariant: Math.ceil(unrounded), unrounded };
}

export function lookupTable() {
  const baselines = [0.05, 0.10, 0.15, 0.20, 0.30, 0.40, 0.50];
  const mdes = [0.01, 0.02, 0.05, 0.10];
  return [
    '| Baseline | MDE 1pp | MDE 2pp | MDE 5pp | MDE 10pp |',
    '|----------|---------|---------|---------|----------|',
    ...baselines.map((baseline) => `| ${Math.round(baseline * 100)}% | ${mdes.map((mde) =>
      sampleSize({ baseline, mde }).perVariant.toLocaleString('en-US')).join(' | ')} |`),
  ].join('\n');
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  if (process.argv[2] === '--table') console.log(lookupTable());
  else {
    try {
      if (process.argv.length < 4 || process.argv.length > 6) throw new Error('usage: node proportions.mjs baseline mde [absolute|relative] [increase|decrease], or --table');
      console.log(JSON.stringify(sampleSize({ baseline: Number(process.argv[2]), mde: Number(process.argv[3]),
        mdeType: process.argv[4] ?? 'absolute', direction: process.argv[5] ?? 'increase' }), null, 2));
    } catch (error) { console.error(error.message); process.exitCode = 1; }
  }
}
