// Share of voice: the fraction of answers, per engine, that cite the brand.
export function shareOfVoice(runs, brand) {
  const byEngine = {};
  for (const r of runs) {
    const e = (byEngine[r.engine] ??= { answers: 0, cited: 0 });
    e.answers++;
    if (r.citedBrands.includes(brand)) e.cited++;
  }
  return Object.fromEntries(Object.entries(byEngine).map(([engine, { answers, cited }]) => [engine, answers ? cited / answers : 0]));
}

// Competitors cited in answers where the brand is absent, most frequent first.
export function displacedBy(runs, brand) {
  const counts = {};
  for (const r of runs) if (!r.citedBrands.includes(brand)) for (const b of r.citedBrands) counts[b] = (counts[b] || 0) + 1;
  return Object.entries(counts).sort((a, b) => b[1] - a[1]).map(([name, count]) => ({ name, count }));
}
