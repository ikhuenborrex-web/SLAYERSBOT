// Pauses/resumes an UptimeRobot monitor to match the bot's last-Saturday
// maintenance window (Sat 00:00 -> Sun 00:00 America/New_York). Runs from
// GitHub Actions cron; UptimeRobot's free plan has no scheduled maintenance,
// so this keeps the bot's Render instance asleep for ~24h each month.
const API_KEY = process.env.UPTIMEROBOT_API_KEY;
const MONITOR_ID = process.env.UPTIMEROBOT_MONITOR_ID || '803163555';
const TZ = 'America/New_York';

function nyNow() {
  return new Date(new Date().toLocaleString('en-US', { timeZone: TZ }));
}

function inMaintenanceWindow() {
  const d = nyNow();
  if (d.getDay() !== 6) return false;
  const nextSat = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 7);
  return nextSat.getMonth() !== d.getMonth();
}

async function api(endpoint, params) {
  const body = new URLSearchParams({ api_key: API_KEY, ...params });
  const res = await fetch('https://api.uptimerobot.com/v2/' + endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  });
  return res.json();
}

(async () => {
  if (!API_KEY) {
    console.error('UPTIMEROBOT_API_KEY secret is not set');
    process.exit(1);
  }
  const inside = inMaintenanceWindow();
  const targetStatus = inside ? 0 : 1; // 0=paused, 1=monitor up
  const action = inside ? 'PAUSE' : 'RESUME';

  const info = await api('getMonitors', { monitors: MONITOR_ID });
  if (info.stat !== 'ok') {
    console.error('getMonitors failed:', JSON.stringify(info));
    process.exit(1);
  }
  const current = info.monitors && info.monitors[0] ? info.monitors[0].status : null;
  if (current === targetStatus) {
    console.log(`Inside window: ${inside} | status already ${current} (${action === 'PAUSE' ? 'paused' : 'up'}) — no change`);
    return;
  }
  const res = await api('editMonitor', { id: MONITOR_ID, status: targetStatus });
  if (res.stat === 'ok') {
    console.log(`${action} monitor ${MONITOR_ID} (was status ${current}, now ${targetStatus})`);
  } else {
    console.error(`${action} failed:`, JSON.stringify(res));
    process.exit(1);
  }
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
