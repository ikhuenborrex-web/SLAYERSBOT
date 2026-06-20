// ===== THE SLAYERS APP — vanilla JS, no build step, talks to the bot's live API =====
const BLACK='#000000', PANEL='#0B0F14', BORDER='#1B2430', MINT='#3ECF8E', MINT_DIM='#1F4A38',
      GOLD='#F0B742', GOLD_DIM='#4A3A1A', RED='#F3677A', WHITE='#F2F4F3', GREY='#7C8A87';

// ===== ACCESS CODE MANAGEMENT =====
function getCode() { return localStorage.getItem('slayersAccessCode') || ''; }
function saveCode(c) { localStorage.setItem('slayersAccessCode', c); }
function clearCode() { localStorage.removeItem('slayersAccessCode'); }
function withCode(url) {
  const code = getCode();
  return url + (url.includes('?') ? '&' : '?') + 'code=' + encodeURIComponent(code);
}

const ICONS = {
  bolt: '<path d="M13 2 3 14h7l-1 8 10-12h-7l1-8z"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>',
  chart: '<path d="M3 3v18h18M7 16l4-4 4 4 5-7"/>',
  back: '<path d="M19 12H5M12 19l-7-7 7-7"/>',
  shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>',
  target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>',
  flame: '<path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
  up: '<path d="M23 6l-9.5 9.5-5-5L1 18M17 6h6v6"/>',
  down: '<path d="M23 18l-9.5-9.5-5 5L1 6m22 12h-6v-6"/>',
  warn: '<path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0zM12 9v4M12 17h.01"/>',
  landmark: '<path d="M3 22h18M6 18V11M10 18V11M14 18V11M18 18V11M2 11l10-7 10 7M2 22V20h20v2"/>',
  calc: '<rect x="4" y="2" width="16" height="20" rx="2"/><path d="M8 6h8M8 10h2M12 10h2M16 10h0M8 14h2M12 14h2M16 14h0M8 18h2M12 18h2M16 18h0"/>',
  radio: '<circle cx="12" cy="12" r="2"/><path d="M16.24 7.76a6 6 0 0 1 0 8.49M7.76 16.24a6 6 0 0 1 0-8.49M19.07 4.93a10 10 0 0 1 0 14.14M4.93 19.07a10 10 0 0 1 0-14.14"/>',
};
function icon(name, color, size=16) {
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${ICONS[name]}</svg>`;
}
function pill(text, color, dim, iconName) {
  return `<span class="pill" style="color:${color};background:${dim};border-color:${color}55">${iconName?icon(iconName,color,11):''}${text}</span>`;
}
function fmt(n) { return typeof n === 'number' ? n.toFixed(n > 100 ? 2 : 5) : n; }
function timeAgo(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

// ===== STATE =====
let state = { tab: 'signals', selected: null, signals: [], active: [], briefing: [], stats: null, loading: true };

// ===== DATA FETCHING =====
async function fetchAll() {
  try {
    const [sigRes, activeRes, briefRes, statsRes] = await Promise.all([
      fetch(withCode('/api/signals?limit=20')), fetch(withCode('/api/active')),
      fetch(withCode('/api/briefing')), fetch(withCode('/api/stats'))
    ]);
    if (sigRes.status === 401 || activeRes.status === 401 || briefRes.status === 401 || statsRes.status === 401) {
      clearCode();
      state.loading = false;
      renderLogin('Your access code has expired or is no longer valid. Enter your current code to continue.');
      return;
    }
    state.signals = (await sigRes.json()).signals || [];
    state.active = (await activeRes.json()).trades || [];
    state.briefing = (await briefRes.json()).pairs || [];
    state.stats = await statsRes.json();
  } catch (e) {
    console.error('Fetch error', e);
  }
  state.loading = false;
  render();
}

// ===== RENDER: SIGNAL CARD =====
function signalCard(s) {
  const isBuy = s.type === 'BULLISH' || s.type === 'BUY';
  const tierColor = s.tier === 'ELITE' ? MINT : GOLD;
  const tierDim = s.tier === 'ELITE' ? MINT_DIM : GOLD_DIM;
  const criteria = (s.criteria || []).map(c => `<span style="font-size:10.5px;color:${MINT};background:${MINT_DIM};border:1px solid ${MINT}33;border-radius:99px;padding:3px 10px;font-weight:600;margin:0 6px 6px 0;display:inline-block">✓ ${c}</span>`).join('');
  return `
  <div class="panel signal-card" onclick="openDetail('${s.id}')">
    <div class="row" style="margin-bottom:12px">
      ${pill(s.tier + ' SETUP', tierColor, tierDim, s.tier === 'ELITE' ? 'flame' : 'check')}
      <span style="color:${GREY};font-size:11px">${timeAgo(s.time)}</span>
    </div>
    <div style="display:flex;align-items:center;gap:8px;margin-bottom:14px">
      ${icon(isBuy ? 'up' : 'down', isBuy ? MINT : RED, 20)}
      <span style="color:${WHITE};font-weight:900;font-size:18px;letter-spacing:-0.3px">${s.pair}</span>
      <span style="color:${GREY};font-size:12px">· ${s.tf} ${s.system || 'QMR'}</span>
      <span style="margin-left:auto">${pill(s.zone || s.type, isBuy ? MINT : RED, isBuy ? MINT_DIM : '#3a1a1f')}</span>
    </div>
    <div style="background:${BLACK};border:1px solid ${BORDER};border-radius:12px;padding:14px;margin-bottom:12px">
      <div class="row"><span style="color:${GREY};font-size:12px">${s.refinedEntry ? '4H Zone' : 'Entry'}</span><span style="color:${WHITE};font-weight:800;font-size:13.5px">${fmt(s.entry)}</span></div>
      ${s.refinedEntry ? `<div class="row"><span style="color:${GREY};font-size:12px">Refined Entry</span><span style="color:${GOLD};font-weight:800;font-size:13.5px">${fmt(s.refinedEntry)}</span></div>` : ''}
      <div class="row"><span style="color:${GREY};font-size:12px">Stop Loss</span><span style="color:${RED};font-weight:800;font-size:13.5px">${fmt(s.sl)}</span></div>
      ${s.tp1 ? `<div class="row"><span style="color:${GREY};font-size:12px">TP1</span><span style="color:${GOLD};font-weight:800;font-size:13.5px">${fmt(s.tp1)}</span></div>` : ''}
      ${s.tp2 ? `<div class="row"><span style="color:${GREY};font-size:12px">TP2</span><span style="color:${MINT};font-weight:800;font-size:13.5px">${fmt(s.tp2)}</span></div>` : ''}
    </div>
    <div>${criteria}</div>
    ${s.dailyPOI ? `<div style="font-size:11.5px;color:${MINT};font-weight:600;margin-top:6px">🏛 ${s.dailyPOI} — HTF confluence</div>` : ''}
    ${s.counterTrend ? `<div style="font-size:11.5px;color:${GOLD};font-weight:600;margin-top:6px">⚠️ Counter-trend: ${s.htfBias || ''}</div>` : ''}
    <div style="color:${GREY};font-size:10.5px;margin-top:10px;text-align:center">Tap for full chart →</div>
  </div>`;
}

// ===== RENDER: DETAIL PAGE =====
function detailPage(s) {
  const isBuy = s.type === 'BULLISH' || s.type === 'BUY';
  const tierColor = s.tier === 'ELITE' ? MINT : GOLD;
  const criteriaList = (s.criteria || []).map(c => `<div style="display:flex;align-items:center;gap:8px;padding:6px 0">${icon('check', MINT, 15)}<span style="color:${WHITE};font-size:13.5px">${c}</span></div>`).join('');
  const chartHtml = s.chartUrl
    ? `<img src="${withCode(s.chartUrl)}" style="width:100%;display:block;border-radius:14px" alt="Signal chart">`
    : `<div style="height:170px;display:flex;align-items:center;justify-content:center;color:${GREY};font-size:12px;border:1px solid ${BORDER};border-radius:14px">Chart unavailable</div>`;
  return `
  <div>
    <div style="display:flex;align-items:center;gap:12px;padding:16px 16px 8px">
      <button onclick="closeDetail()" style="background:${PANEL};border:1px solid ${BORDER};border-radius:99px;width:34px;height:34px;display:flex;align-items:center;justify-content:center;cursor:pointer">${icon('back', WHITE, 16)}</button>
      <div>
        <div style="color:${WHITE};font-weight:900;font-size:18px">${s.pair} · ${s.tf}</div>
        <div style="color:${GREY};font-size:11px">${timeAgo(s.time)} · ${s.system || 'QMR'} Signal</div>
      </div>
    </div>
    <div style="padding:12px 16px">
      <div style="display:flex;gap:8px;margin-bottom:14px;flex-wrap:wrap">
        ${pill(s.tier, tierColor, s.tier === 'ELITE' ? MINT_DIM : GOLD_DIM, s.tier === 'ELITE' ? 'flame' : 'check')}
        ${pill(s.type, isBuy ? MINT : RED, isBuy ? MINT_DIM : '#3a1a1f', isBuy ? 'up' : 'down')}
        ${s.zone ? pill(s.zone, WHITE, BORDER) : ''}
      </div>
      ${chartHtml}
      <div style="display:flex;justify-content:space-between;margin:8px 0 18px">
        <span style="font-size:10px;color:${MINT}">● Entry</span>
        <span style="font-size:10px;color:${RED}">● SL</span>
        <span style="font-size:10px;color:${GOLD}">● TP</span>
      </div>
      <div class="heading" style="font-size:14px">Trade Levels</div>
      <div class="panel" style="margin:10px 0 18px">
        <div class="row" style="padding:9px 0"><span style="color:${GREY};font-size:13px">${s.refinedEntry ? '4H Zone' : 'Entry'}</span><span style="color:${WHITE};font-weight:800;font-size:16px">${fmt(s.entry)}</span></div>
        ${s.refinedEntry ? `<div class="row" style="padding:9px 0"><span style="color:${GREY};font-size:13px">${icon('target', GOLD, 13)} Refined Entry</span><span style="color:${GOLD};font-weight:800;font-size:16px">${fmt(s.refinedEntry)}</span></div>` : ''}
        <div class="row" style="padding:9px 0"><span style="color:${GREY};font-size:13px">${icon('shield', RED, 13)} Stop Loss</span><span style="color:${RED};font-weight:800;font-size:16px">${fmt(s.sl)}</span></div>
        ${s.tp1 ? `<div class="row" style="padding:9px 0"><span style="color:${GREY};font-size:13px">TP1</span><span style="color:${GOLD};font-weight:800;font-size:16px">${fmt(s.tp1)}</span></div>` : ''}
        ${s.tp2 ? `<div class="row" style="padding:9px 0"><span style="color:${GREY};font-size:13px">TP2</span><span style="color:${MINT};font-weight:800;font-size:16px">${fmt(s.tp2)}</span></div>` : ''}
      </div>
      <div class="heading" style="font-size:14px">Criteria ${s.score ? '— ' + s.score + '/4' : ''}</div>
      <div class="panel" style="margin:10px 0 18px">
        ${criteriaList}
        ${s.dailyPOI ? `<div style="display:flex;align-items:center;gap:8px;padding:6px 0">${icon('landmark', MINT, 15)}<span style="color:${MINT};font-size:13.5px;font-weight:600">${s.dailyPOI} — HTF confluence</span></div>` : ''}
      </div>
      ${s.counterTrend ? `<div style="background:${GOLD_DIM};border:1px solid ${GOLD}55;border-radius:14px;padding:14px;margin-bottom:18px;display:flex;gap:8px"><span style="flex-shrink:0">${icon('warn', GOLD, 16)}</span><span style="color:${GOLD};font-size:12.5px;font-weight:600">Counter-trend setup — ${s.htfBias || ''}. Reduce position size.</span></div>` : ''}
      <button onclick="window.open('https://slayerbotcalculator.netlify.app/#${s.pair.replace('/','')},${s.entry},${s.sl}','_blank')" style="width:100%;background:${MINT};border:none;border-radius:99px;padding:15px 0;display:flex;align-items:center;justify-content:center;gap:8px;cursor:pointer;margin-bottom:24px">
        ${icon('calc', BLACK, 16)}<span style="color:${BLACK};font-weight:800;font-size:14px">Calculate Position Size</span>
      </button>
    </div>
  </div>`;
}

// ===== RENDER: BRIEFING =====
function briefingScreen() {
  if (!state.briefing.length) return emptyState('No briefing yet today. Check back at 07:00 UTC.');
  return `
    <div class="panel">${pill('🌅 DAILY BRIEFING', GOLD, GOLD_DIM)}<div style="color:${GREY};font-size:11.5px;margin-top:8px">Updated ${timeAgo(state.briefing[0] ? null : null) || 'today'}</div></div>
    ${state.briefing.map(p => `
      <div class="panel" style="display:flex;align-items:center;justify-content:space-between">
        <div><div style="color:${WHITE};font-weight:800;font-size:14.5px">${p.name || p.pair}</div><div style="color:${GREY};font-size:11px">${p.price}</div></div>
        <div style="text-align:right">
          <div style="font-size:10.5px;color:${GREY}">W: <span style="color:${p.weekly==='BULLISH'?MINT:p.weekly==='BEARISH'?RED:GREY};font-weight:700">${p.weekly}</span></div>
          <div style="font-size:10.5px;color:${GREY}">D: <span style="color:${p.daily==='BULLISH'?MINT:RED};font-weight:700">${p.daily}</span></div>
        </div>
        <div style="width:9px;height:9px;border-radius:99px;background:${p.aligned?MINT:GOLD};margin-left:14px;box-shadow:0 0 8px ${p.aligned?MINT:GOLD}"></div>
      </div>`).join('')}
  `;
}

// ===== RENDER: STATS =====
function statsScreen() {
  const st = state.stats || {};
  const cards = [
    ['TOTAL SIGNALS', st.totalSignals ?? '–'],
    ['WIN RATE', (st.winRate ?? '–') + '%'],
    ['TOTAL R', (st.totalR >= 0 ? '+' : '') + (st.totalR ?? '–') + 'R'],
    ['BEST TRADE', st.bestTrade ? '+' + st.bestTrade.rMultiple + 'R' : '–'],
  ];
  return `
    <div class="panel" style="display:grid;grid-template-columns:1fr 1fr;gap:18px">
      ${cards.map(([l, v]) => `<div><div class="glow-mint" style="color:${MINT};font-weight:900;font-size:26px">${v}</div><div style="color:${GREY};font-size:10px;letter-spacing:1px;margin-top:2px">${l}</div></div>`).join('')}
    </div>
    <div class="panel" style="border-color:${GOLD}44">
      ${pill('🏆 PERFORMANCE', GOLD, GOLD_DIM)}
      <div style="color:${WHITE};font-size:13px;margin-top:10px">✅ Wins: ${st.wins ?? 0} &nbsp; 🚫 Losses: ${st.losses ?? 0} &nbsp; ⚖️ BE: ${st.breakevens ?? 0}</div>
      <div style="color:${GREY};font-size:11.5px;margin-top:6px">Win streak: ${st.winStreak ?? 0} · Loss streak: ${st.lossStreak ?? 0}</div>
    </div>
  `;
}

function emptyState(text) {
  return `<div style="text-align:center;padding:60px 20px;color:${GREY};font-size:13px">${text}</div>`;
}

// ===== MAIN RENDER =====
function render() {
  const app = document.getElementById('app');
  if (state.selected) {
    app.innerHTML = `<div style="background:${BLACK};min-height:100vh">${detailPage(state.selected)}</div>`;
    return;
  }
  const ticker = ['⚡ CRT DAILY ALERTS', '🔄 QMR REVERSALS', '🔥 MULTI-TF CONFLUENCE', '🚫 NEWS FILTER', '⚙️ AUTO TRADE MANAGEMENT', '📊 WIN RATE TRACKER'];
  app.innerHTML = `
    <div style="padding:20px 16px 0">
      <div class="row" style="margin-bottom:14px">${pill('LIVE', MINT, MINT_DIM, 'radio')}</div>
      <div style="font-weight:900;font-size:26px;letter-spacing:-1px;line-height:0.95;text-transform:uppercase">
        <span style="color:${WHITE}">THE </span><span class="glow-mint" style="color:${MINT}">SLAYERS</span>
      </div>
      <div style="color:${GREY};font-size:11px;margin-top:4px;margin-bottom:14px">Signal Center · v8.2</div>
    </div>
    <div style="border-top:1px solid ${BORDER};border-bottom:1px solid ${BORDER};padding:10px 0;overflow:hidden;white-space:nowrap;margin-bottom:16px">
      <div class="ticker-track">${[...ticker, ...ticker].map(t => `<span style="color:${MINT};font-size:10.5px;font-weight:700;letter-spacing:0.5px;margin-right:28px">${t}</span>`).join('')}</div>
    </div>
    <div style="flex:1;padding:0 16px;overflow-y:auto" id="content"></div>
    <div style="display:flex;border-top:1px solid ${BORDER};background:${PANEL};margin-top:16px">
      ${['signals', 'briefing', 'stats'].map(t => `
        <button class="navbtn ${state.tab === t ? 'active' : ''}" onclick="setTab('${t}')">
          ${icon(t === 'signals' ? 'bolt' : t === 'briefing' ? 'sun' : 'chart', state.tab === t ? MINT : GREY, 19)}
          <span style="font-size:10px;font-weight:${state.tab === t ? 800 : 500};letter-spacing:0.5px">${t.toUpperCase()}</span>
        </button>`).join('')}
    </div>
  `;
  const content = document.getElementById('content');
  if (state.loading) {
    content.innerHTML = `<div class="skeleton" style="height:200px;margin-bottom:14px"></div><div class="skeleton" style="height:200px"></div>`;
  } else if (state.tab === 'signals') {
    content.innerHTML = `<div class="heading" style="font-size:18px">TODAY'S SIGNALS</div><div style="height:14px"></div>` +
      (state.signals.length ? state.signals.map(signalCard).join('') : emptyState('No signals yet. The bot scans every 30 minutes — check back soon.'));
  } else if (state.tab === 'briefing') {
    content.innerHTML = briefingScreen();
  } else if (state.tab === 'stats') {
    content.innerHTML = statsScreen();
  }
}

// ===== ACTIONS (exposed globally for inline onclick) =====
window.setTab = (t) => { state.tab = t; render(); };
window.openDetail = (id) => { state.selected = state.signals.find(s => s.id === id); render(); window.scrollTo(0,0); };
window.closeDetail = () => { state.selected = null; render(); };

// ===== LOGIN SCREEN =====
function renderLogin(errorMsg) {
  const app = document.getElementById('app');
  app.innerHTML = `
    <div style="min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:24px;text-align:center">
      <div style="font-weight:900;font-size:28px;letter-spacing:-1px;text-transform:uppercase;margin-bottom:6px">
        <span style="color:${WHITE}">THE </span><span class="glow-mint" style="color:${MINT}">SLAYERS</span>
      </div>
      <div style="color:${GREY};font-size:12px;margin-bottom:32px">Signal Center</div>
      <div style="width:100%;max-width:300px">
        <div style="color:${WHITE};font-size:14px;font-weight:700;margin-bottom:10px">Enter your access code</div>
        <input id="codeInput" type="text" placeholder="SLAY-XXXXXX" autocapitalize="characters" autocomplete="off"
          style="width:100%;background:${PANEL};border:1px solid ${BORDER};border-radius:12px;padding:14px;color:${WHITE};font-size:16px;text-align:center;letter-spacing:2px;margin-bottom:14px;outline:none"/>
        ${errorMsg ? `<div style="color:${RED};font-size:12.5px;margin-bottom:14px">${errorMsg}</div>` : ''}
        <button id="loginBtn" style="width:100%;background:${MINT};border:none;border-radius:99px;padding:15px 0;color:${BLACK};font-weight:800;font-size:14px;cursor:pointer">Unlock</button>
        <div id="loginStatus" style="color:${GREY};font-size:11.5px;margin-top:14px"></div>
      </div>
      <div style="color:${GREY};font-size:11px;margin-top:40px">Don't have a code? Message Rexroz on Telegram.</div>
    </div>`;
  document.getElementById('loginBtn').onclick = attemptLogin;
  document.getElementById('codeInput').addEventListener('keypress', e => { if (e.key === 'Enter') attemptLogin(); });
}

async function attemptLogin() {
  const input = document.getElementById('codeInput');
  const status = document.getElementById('loginStatus');
  const code = input.value.trim().toUpperCase();
  if (!code) return;
  status.textContent = 'Checking...';
  saveCode(code);
  try {
    const res = await fetch(withCode('/api/stats'));
    if (res.status === 401) {
      clearCode();
      renderLogin('That code is not valid. Double-check and try again.');
      return;
    }
    state.loading = true;
    render();
    fetchAll();
  } catch (e) {
    status.textContent = 'Connection error. Try again.';
  }
}

// ===== BOOT =====
if (getCode()) {
  fetchAll();
} else {
  renderLogin();
}
setInterval(() => { if (getCode()) fetchAll(); }, 60000); // refresh every 60s, only if logged in

// ===== SERVICE WORKER + PUSH NOTIFICATIONS =====
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/app/service-worker.js')
    .then(reg => { setTimeout(() => trySubscribePush(reg), 1500); })
    .catch(e => console.error('SW failed', e));
}

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map(c => c.charCodeAt(0)));
}

async function trySubscribePush(reg) {
  if (!('PushManager' in window) || !getCode()) return;
  try {
    const existing = await reg.pushManager.getSubscription();
    if (existing) return; // already subscribed on this device

    const keyRes = await fetch(withCode('/api/vapid-key'));
    const keyData = await keyRes.json();
    if (!keyData.enabled || !keyData.key) return; // push not configured server-side yet

    if (Notification.permission === 'denied') return;
    const perm = Notification.permission === 'granted' ? 'granted' : await Notification.requestPermission();
    if (perm !== 'granted') return;

    const sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(keyData.key)
    });
    await fetch(withCode('/api/subscribe'), {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(sub)
    });
    console.log('Push notifications enabled for this device.');
  } catch (e) {
    console.error('Push subscribe failed', e);
  }
}
