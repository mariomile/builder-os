import fs from 'fs';

// Development sink: one JSON line per event. Production sends the same payload to the analytics provider.
export function track(event, properties = {}, { log = process.env.CAPTOO_EVENTS_LOG || 'events.log' } = {}) {
  fs.appendFileSync(log, JSON.stringify({ event, properties, at: new Date().toISOString() }) + '\n');
}
