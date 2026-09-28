import fs from 'fs';
import path from 'path';
import { track } from './track.mjs';

export function sendWeeklyReport(report, { to, outbox = 'outbox' }) {
  fs.mkdirSync(outbox, { recursive: true });
  const file = path.join(outbox, `${report.account}-weekly.json`);
  fs.writeFileSync(file, JSON.stringify({ to, subject: `Your AI visibility this week: ${report.brand}`, report }, null, 2));
  track('weekly_report_sent', { account: report.account, engines: report.engines.length });
  return file;
}
