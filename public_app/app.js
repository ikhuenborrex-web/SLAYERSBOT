// ===== THE SLAYERS APP — vanilla JS, no build step, talks to the bot's live API =====
const BLACK='#000000', PANEL='#0B0F14', BORDER='#1B2430', MINT='#3ECF8E', MINT_DIM='#1F4A38',
      GOLD='#F0B742', GOLD_DIM='#4A3A1A', RED='#F3677A', WHITE='#F2F4F3', GREY='#7C8A87';

// ===== ACCESS CODE MANAGEMENT =====
function getCode() { return localStorage.getItem('slayersAccessCode') || ''; }
function saveCode(c) { localStorage.setItem('slayersAccessCode', c); }
function clearCode() { localStorage.removeItem('slayersAccessCode'); }
function getDeviceId() {
  let id = localStorage.getItem('slayersDeviceId');
  if (!id) {
    id = (crypto.randomUUID ? crypto.randomUUID() : 'dev-' + Date.now() + '-' + Math.random().toString(36).slice(2));
    localStorage.setItem('slayersDeviceId', id);
  }
  return id;
}
function withCode(url) {
  const code = getCode();
  const sep1 = url.includes('?') ? '&' : '?';
  return url + sep1 + 'code=' + encodeURIComponent(code) + '&device=' + encodeURIComponent(getDeviceId());
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
function mono(text, color = WHITE, size = 13.5) {
  return `<span class="mono" style="color:${color};font-size:${size}px">${text}</span>`;
}
function fmt(n) { return typeof n === 'number' ? n.toFixed(n > 100 ? 2 : 5) : n; }
function timeAgo(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

// ===== STATE =====
let state = { tab: 'signals', selected: null, signals: [], active: [], confluence: [], stats: null, myStats: null, loading: true, filter: { pair: '', dir: '', tf: '' }, showSettings: false, notifPrefs: {} };

// ===== DATA FETCHING =====
async function fetchAll() {
  const TIMEOUT_MS = 10000;
  const withTimeout = (p) => Promise.race([
    p, new Promise((_, rej) => setTimeout(() => rej(new Error('Request timed out')), TIMEOUT_MS))
  ]);
  try {
    const [sigRes, activeRes, confluRes, statsRes, myStatsRes] = await withTimeout(Promise.all([
      fetch(withCode('/api/signals?limit=20')), fetch(withCode('/api/active')),
      fetch(withCode('/api/confluence')), fetch(withCode('/api/stats')),
      fetch(withCode('/api/member/stats'))
    ]));
    if (sigRes.status === 401 || activeRes.status === 401 || confluRes.status === 401 || statsRes.status === 401) {
      clearCode();
      state.loading = false;
      renderLogin('Your access code has expired or is no longer valid. Enter your current code to continue.');
      return;
    }
    state.signals = (await sigRes.json()).signals || [];
    state.active = (await activeRes.json()).trades || [];
    state.confluence = (await confluRes.json()).pairs || [];
    state.stats = await statsRes.json();
    if (myStatsRes.status === 200) {
      const myData = await myStatsRes.json();
      state.myStats = myData.myStats || null;
      state.notifPrefs = myData.notifPrefs || {};
    }
    state.fetchError = null;
  } catch (e) {
    console.error('Fetch error', e);
    state.fetchError = e.message || 'Connection error';
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
      <div class="row"><span style="color:${GREY};font-size:12px">${s.refinedEntry ? '4H Zone' : 'Entry'}</span>${mono(fmt(s.entry), WHITE)}</div>
      ${s.refinedEntry ? `<div class="row"><span style="color:${GREY};font-size:12px">Refined Entry</span>${mono(fmt(s.refinedEntry), GOLD)}</div>` : ''}
      <div class="row"><span style="color:${GREY};font-size:12px">Stop Loss</span>${mono(fmt(s.sl), RED)}</div>
      ${s.tp1 ? `<div class="row"><span style="color:${GREY};font-size:12px">TP1</span>${mono(fmt(s.tp1), GOLD)}</div>` : ''}
      ${s.tp2 ? `<div class="row"><span style="color:${GREY};font-size:12px">TP2</span>${mono(fmt(s.tp2), MINT)}</div>` : ''}
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
    <div style="display:flex;align-items:center;gap:12px;padding:calc(16px + env(safe-area-inset-top)) 16px 8px">
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
        <div class="row" style="padding:9px 0"><span style="color:${GREY};font-size:13px">${s.refinedEntry ? '4H Zone' : 'Entry'}</span>${mono(fmt(s.entry), WHITE, 16)}</div>
        ${s.refinedEntry ? `<div class="row" style="padding:9px 0"><span style="color:${GREY};font-size:13px">${icon('target', GOLD, 13)} Refined Entry</span>${mono(fmt(s.refinedEntry), GOLD, 16)}</div>` : ''}
        <div class="row" style="padding:9px 0"><span style="color:${GREY};font-size:13px">${icon('shield', RED, 13)} Stop Loss</span>${mono(fmt(s.sl), RED, 16)}</div>
        ${s.tp1 ? `<div class="row" style="padding:9px 0"><span style="color:${GREY};font-size:13px">TP1</span>${mono(fmt(s.tp1), GOLD, 16)}</div>` : ''}
        ${s.tp2 ? `<div class="row" style="padding:9px 0"><span style="color:${GREY};font-size:13px">TP2</span>${mono(fmt(s.tp2), MINT, 16)}</div>` : ''}
      </div>
      <div class="heading" style="font-size:14px">Criteria ${s.score ? '— ' + s.score + '/4' : ''}</div>
      <div class="panel" style="margin:10px 0 18px">
        ${criteriaList}
        ${s.dailyPOI ? `<div style="display:flex;align-items:center;gap:8px;padding:6px 0">${icon('landmark', MINT, 15)}<span style="color:${MINT};font-size:13.5px;font-weight:600">${s.dailyPOI} — HTF confluence</span></div>` : ''}
      </div>
      ${s.counterTrend ? `<div style="background:${GOLD_DIM};border:1px solid ${GOLD}55;border-radius:14px;padding:14px;margin-bottom:18px;display:flex;gap:8px"><span style="flex-shrink:0">${icon('warn', GOLD, 16)}</span><span style="color:${GOLD};font-size:12.5px;font-weight:600">Counter-trend setup — ${s.htfBias || ''}. Reduce position size.</span></div>` : ''}
      <button onclick="toggleTrack('${s.id}', ${!!s.isTracked})" style="width:100%;background:${s.isTracked ? MINT_DIM : 'transparent'};border:1px solid ${s.isTracked ? MINT : BORDER};border-radius:99px;padding:14px 0;display:flex;align-items:center;justify-content:center;gap:8px;cursor:pointer;margin-bottom:12px">
        ${icon(s.isTracked ? 'check' : 'target', s.isTracked ? MINT : GREY, 16)}
        <span style="color:${s.isTracked ? MINT : GREY};font-weight:700;font-size:13px">${s.isTracked ? 'Tracking — you will get updates on this trade' : "I'm in this trade — notify me of updates"}</span>
      </button>
      <button onclick="window.open('https://slayerbotcalculator.netlify.app/#${s.pair.replace('/','')},${s.entry},${s.sl}','_blank')" style="width:100%;background:${MINT};border:none;border-radius:99px;padding:15px 0;display:flex;align-items:center;justify-content:center;gap:8px;cursor:pointer;margin-bottom:24px">
        ${icon('calc', BLACK, 16)}<span style="color:${BLACK};font-weight:800;font-size:14px">Calculate Position Size</span>
      </button>
    </div>
  </div>`;
}

// ===== RENDER: MARKET CONFLUENCE =====
function confluenceScreen() {
  if (!state.confluence.length) return emptyState('Market data loading...');
  return `
    <div class="panel">${pill('📊 MARKET CONFLUENCE', MINT, MINT_DIM)}</div>
    ${state.confluence.map(p => {
      const isBull = p.weeklyBias === 'BULLISH' || p.signalDir === 'BULLISH';
      const iconColor = p.signalDir === 'BULLISH' ? MINT : p.signalDir === 'BEARISH' ? RED : GREY;
      const tierColor = p.convictionLabel === 'ELITE' ? MINT : p.convictionLabel === 'STRONG' ? GOLD : p.convictionLabel === 'VALID' ? '#FFD70088' : GREY;
      const weekColor = p.weeklyBias === 'BULLISH' ? MINT : p.weeklyBias === 'BEARISH' ? RED : GREY;
      const dayColor = p.dailyTrend === 'BULLISH' ? MINT : p.dailyTrend === 'BEARISH' ? RED : GREY;
      const userTag = p.userInTrade ? `<span style="font-size:10px;color:${MINT};background:${MINT_DIM};border-radius:99px;padding:2px 8px;font-weight:700">YOURS${p.activeTradeProgress?.tp1Fired?' TP1✓':''}${p.activeTradeProgress?.beFired?' BE✓':''}</span>` : '';
      return `<div class="panel" style="border-left:3px solid ${tierColor}">
        <div class="row" style="margin-bottom:8px">
          <div style="display:flex;align-items:center;gap:6px">
            <span style="color:${WHITE};font-weight:900;font-size:16px">${p.name}</span>
            <span class="mono" style="color:${GREY};font-size:12px">${p.price}</span>
          </div>
          ${userTag}
        </div>
        <div class="row" style="margin-bottom:6px;gap:4px;flex-wrap:wrap">
          <span style="font-size:10.5px;border:1px solid ${weekColor}44;background:${PANEL};border-radius:99px;padding:3px 10px;color:${weekColor};font-weight:700">W: ${p.weeklyBias}</span>
          <span style="font-size:10.5px;border:1px solid ${dayColor}44;background:${PANEL};border-radius:99px;padding:3px 10px;color:${dayColor};font-weight:700">D: ${p.dailyTrend}</span>
          ${p.biasRelation === 'ALIGNED' ? `<span style="font-size:10.5px;border:1px solid ${MINT}44;background:${MINT_DIM};border-radius:99px;padding:3px 10px;color:${MINT};font-weight:600">ALIGNED</span>` : p.biasRelation === 'CONFLICT' ? `<span style="font-size:10.5px;border:1px solid ${RED}44;background:#3a1a1f;border-radius:99px;padding:3px 10px;color:${RED};font-weight:600">CONFLICT</span>` : `<span style="font-size:10.5px;border:1px solid ${GOLD}44;background:${GOLD_DIM};border-radius:99px;padding:3px 10px;color:${GOLD};font-weight:600">MIXED</span>`}
          ${pill(p.convictionLabel, tierColor, tierColor+'22')}
        </div>
        ${p.signalDir !== 'NONE' ? `<div style="display:flex;align-items:center;gap:6px;margin-bottom:6px">${icon(isBull?'up':'down',iconColor,14)}<span style="color:${WHITE};font-size:12px;font-weight:600">${p.signalDir === 'BULLISH' ? 'BUY' : 'SELL'} signal</span></div>` : `<div style="color:${GREY};font-size:11.5px;margin-bottom:6px">No active signals</div>`}
        ${p.factors.length ? `<div style="display:flex;gap:4px;flex-wrap:wrap;margin-top:4px">${p.factors.map(f => `<span style="font-size:10px;color:${MINT};background:${MINT_DIM}66;border-radius:99px;padding:2px 8px">✓ ${f}</span>`).join('')}</div>` : ''}
      </div>`;
    }).join('')}
  `;
}

// ===== RENDER: STATS =====
function statsScreen() {
  const st = state.stats || {};
  const my = state.myStats || {};
  const notifLabels = { be: 'Breakeven', tp1: 'TP1 Hit', tp2: 'TP2 Hit', sl: 'Stop Loss', be_close: 'TP1 Close', be_sl: 'Breakeven Close', trail: 'Trailing Stop' };
  const myCards = [
    ['MY SIGNALS', my.total ?? '–'],
    ['MY WIN RATE', (my.winRate ?? '–') + '%'],
    ['MY TOTAL R', (my.totalR >= 0 ? '+' : '') + (my.totalR ?? '–') + 'R'],
  ];
  const cards = [
    ['TOTAL SIGNALS', st.totalSignals ?? '–'],
    ['WIN RATE', (st.winRate ?? '–') + '%'],
    ['TOTAL R', (st.totalR >= 0 ? '+' : '') + (st.totalR ?? '–') + 'R'],
    ['BEST TRADE', st.bestTrade ? '+' + st.bestTrade.rMultiple + 'R' : '–'],
  ];
  // Notification prefs toggles
  const prefs = state.notifPrefs;
  const notifToggles = Object.entries(notifLabels).map(([level, label]) => {
    const enabled = prefs[level] !== false; // default enabled
    return `<button onclick="toggleNotif('${level}')" style="display:flex;align-items:center;gap:10px;width:100%;background:${PANEL};border:1px solid ${BORDER};border-radius:10px;padding:10px 12px;margin-bottom:6px;cursor:pointer">
      <div style="width:20px;height:20px;border-radius:99px;background:${enabled?MINT:MINT_DIM};border:1px solid ${enabled?MINT:BORDER};display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:11px">${enabled?'✓':''}</div>
      <span style="color:${WHITE};font-size:12.5px;font-weight:600">${label}</span>
      <span style="margin-left:auto;color:${GREY};font-size:10px">${enabled?'ON':'OFF'}</span>
    </button>`;
  }).join('');
  return `
    <div class="panel" style="display:grid;grid-template-columns:1fr 1fr;gap:18px">
      ${my.total ? myCards.map(([l, v]) => `<div class="count-up"><div class="mono" style="color:${GOLD};font-size:22px">${v}</div><div style="color:${GREY};font-size:10px;letter-spacing:1px;margin-top:2px">${l}</div></div>`).join('') : `<div style="grid-column:1/-1;color:${GREY};font-size:12px;text-align:center;padding:10px 0">Track trades to see your personal stats</div>`}
    </div>
    ${my.total ? `<div class="panel" style="border-color:${GOLD}44">
      ${pill('👤 YOUR STATS', GOLD, GOLD_DIM)}
      <div style="color:${WHITE};font-size:13px;margin-top:10px">✅ ${my.wins??0}W &nbsp; 🚫 ${my.losses??0}L &nbsp; ⚖️ ${my.bes??0}BE</div>
    </div>` : ''}
    <div class="panel" style="display:grid;grid-template-columns:1fr 1fr;gap:18px;margin-top:14px">
      ${cards.map(([l, v]) => `<div class="count-up"><div class="mono glow-mint" style="color:${MINT};font-size:26px">${v}</div><div style="color:${GREY};font-size:10px;letter-spacing:1px;margin-top:2px">${l}</div></div>`).join('')}
    </div>
    <div class="panel" style="border-color:${GOLD}44">
      ${pill('🏆 BOT PERFORMANCE', GOLD, GOLD_DIM)}
      <div style="color:${WHITE};font-size:13px;margin-top:10px">✅ ${st.wins ?? 0} &nbsp; 🚫 ${st.losses ?? 0} &nbsp; ⚖️ ${st.breakevens ?? 0}</div>
      <div style="color:${GREY};font-size:11.5px;margin-top:6px">Win streak: ${st.winStreak ?? 0} · Loss streak: ${st.lossStreak ?? 0}</div>
    </div>
    <div style="margin-top:16px">
      <div class="row" style="margin-bottom:8px">
        <span class="heading" style="font-size:14px">🔔 Notification Preferences</span>
        <button onclick="toggleSettings()" style="background:none;border:none;color:${GREY};font-size:11px;cursor:pointer">${state.showSettings?'Hide':'Edit'}</button>
      </div>
      ${state.showSettings ? `<div class="panel">${notifToggles}</div>` : ''}
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
  app.innerHTML = `
    <div style="position:fixed;top:0;left:0;right:0;bottom:56px;display:flex;flex-direction:column;background:${BLACK}" id="scrollWrap">
      <div style="padding:calc(20px + env(safe-area-inset-top)) 16px 0;flex-shrink:0">
        <div class="row" style="margin-bottom:10px">
          <span class="pill" style="color:${MINT};background:${MINT_DIM};border-color:${MINT}55"><span class="live-dot"></span>&nbsp;LIVE</span>
        </div>
        <div style="font-weight:900;font-size:28px;letter-spacing:-1px;line-height:0.95;text-transform:uppercase">
          <span style="color:${WHITE}">THE </span><span class="grad-text" style="text-shadow:0 0 30px ${MINT}55">SLAYERS</span>
        </div>
        <div style="color:${GREY};font-size:11px;margin-top:4px;margin-bottom:14px">Signal Center · v9.0</div>
        ${pushStatus === 'available' ? `
          <button onclick="enablePush()" style="width:100%;background:${MINT_DIM};border:1px solid ${MINT}66;border-radius:12px;padding:12px;color:${MINT};font-weight:700;font-size:12.5px;cursor:pointer;margin-bottom:14px;display:flex;align-items:center;justify-content:center;gap:8px">
            🔔 Tap to enable push notifications
          </button>` : ''}
        ${pushStatus === 'denied' ? `
          <div style="width:100%;background:${GOLD_DIM};border:1px solid ${GOLD}66;border-radius:12px;padding:12px;color:${GOLD};font-weight:600;font-size:11.5px;margin-bottom:14px;text-align:center">
            Notifications blocked. Enable in iPhone Settings → Notifications → Slayers.
          </div>` : ''}
      </div>
      <div style="flex:1;padding:10px 16px 0;overflow-y:auto" id="content"></div>
    </div>
    <div style="position:fixed;bottom:0;left:0;right:0;display:flex;border-top:1px solid ${BORDER};background:rgba(13,22,17,0.6);backdrop-filter:blur(18px);-webkit-backdrop-filter:blur(18px);padding-bottom:env(safe-area-inset-bottom)">
      <div class="nav-underline" style="left:${['signals','market','stats'].indexOf(state.tab) * 33.333}%;width:33.333%"></div>
      ${['signals', 'market', 'stats'].map(t => `
        <button class="navbtn ${state.tab === t ? 'active' : ''}" onclick="setTab('${t}')">
          ${icon(t === 'signals' ? 'bolt' : t === 'market' ? 'landmark' : 'chart', state.tab === t ? MINT : GREY, 19)}
          <span style="font-size:10px;font-weight:${state.tab === t ? 800 : 500};letter-spacing:0.5px">${t === 'market' ? 'MARKET' : t.toUpperCase()}</span>
        </button>`).join('')}
    </div>
  `;
  const content = document.getElementById('content');
  if (state.loading) {
    content.innerHTML = `<div class="skeleton" style="height:200px;margin-bottom:14px"></div><div class="skeleton" style="height:200px"></div>`;
  } else if (state.tab === 'signals') {
    // Build filter options from current signals
    const pairs = [...new Set(state.signals.map(s => s.pair))].sort();
    const dirs = ['', 'BULLISH', 'BEARISH'];
    const tfs = ['', '1H', '4H', 'DAILY'];
    const selectedPair = state.filter.pair, selectedDir = state.filter.dir, selectedTf = state.filter.tf;
    const filtered = state.signals.filter(s =>
      (!selectedPair || s.pair === selectedPair) &&
      (!selectedDir || s.type === selectedDir) &&
      (!selectedTf || s.tf === selectedTf)
    );
    const filterBar = `
      <div style="display:flex;gap:6px;margin-bottom:14px;flex-wrap:wrap">
        <select onchange="setFilter('pair',this.value)" style="background:${PANEL};border:1px solid ${BORDER};border-radius:8px;padding:8px 10px;color:${WHITE};font-size:12px;flex:1;min-width:80px">
          <option value="">Pair: All</option>${pairs.map(p => `<option value="${p}" ${p===selectedPair?'selected':''}>${p}</option>`).join('')}
        </select>
        <select onchange="setFilter('dir',this.value)" style="background:${PANEL};border:1px solid ${BORDER};border-radius:8px;padding:8px 10px;color:${WHITE};font-size:12px;flex:1;min-width:80px">
          <option value="">Dir: All</option>
          <option value="BULLISH" ${selectedDir==='BULLISH'?'selected':''}>${icon('up', MINT, 12)} BUY</option>
          <option value="BEARISH" ${selectedDir==='BEARISH'?'selected':''}>${icon('down', RED, 12)} SELL</option>
        </select>
        <select onchange="setFilter('tf',this.value)" style="background:${PANEL};border:1px solid ${BORDER};border-radius:8px;padding:8px 10px;color:${WHITE};font-size:12px;flex:1;min-width:80px">
          <option value="">TF: All</option>${tfs.filter(Boolean).map(t => `<option value="${t}" ${t===selectedTf?'selected':''}>${t}</option>`).join('')}
        </select>
      </div>`;
    content.innerHTML = `<div class="heading" style="font-size:18px">TODAY'S SIGNALS</div>${filterBar}` +
      (state.fetchError ? emptyState('Connection problem: ' + state.fetchError + '. Pull down or reopen the app to retry.') :
       filtered.length ? filtered.map(signalCard).join('') : emptyState('No signals match your filters.'));
  } else if (state.tab === 'market') {
    content.innerHTML = confluenceScreen();
  } else if (state.tab === 'stats') {
    content.innerHTML = statsScreen();
  }
}

// ===== ACTIONS (exposed globally for inline onclick) =====
window.setTab = (t) => { state.tab = t; render(); };
window.setFilter = (key, value) => { state.filter[key] = value; render(); };
window.toggleSettings = () => { state.showSettings = !state.showSettings; render(); };
window.openDetail = (id) => { state.selected = state.signals.find(s => s.id === id); render(); window.scrollTo(0,0); };
window.enablePush = enablePush;
window.closeDetail = () => { state.selected = null; render(); };
window.toggleNotif = async (level) => {
  const prefs = { ...state.notifPrefs };
  prefs[level] = prefs[level] === false ? true : false;
  state.notifPrefs = prefs;
  render();
  try {
    await fetch(withCode('/api/member/notif-prefs'), {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ notifPrefs: prefs })
    });
  } catch (e) { console.error('Notif prefs save failed', e); }
};

window.toggleTrack = async (signalId, currentlyTracking) => {
  try {
    if (currentlyTracking) {
      await fetch(withCode('/api/track/' + encodeURIComponent(signalId)), { method: 'DELETE' });
    } else {
      await fetch(withCode('/api/track'), {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ signalId })
      });
    }
    // Update local state immediately so the button flips without waiting on next poll
    const sig = state.signals.find(s => s.id === signalId);
    if (sig) sig.isTracked = !currentlyTracking;
    if (state.selected && state.selected.id === signalId) state.selected.isTracked = !currentlyTracking;
    render();
  } catch (e) {
    console.error('Track toggle failed', e);
  }
};

// ===== LOGIN SCREEN =====
function renderLogin(errorMsg) {
  const app = document.getElementById('app');
  app.innerHTML = `
    <div style="min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:calc(24px + env(safe-area-inset-top)) 24px calc(24px + env(safe-area-inset-bottom));text-align:center">
      <div style="font-weight:900;font-size:30px;letter-spacing:-1px;text-transform:uppercase;margin-bottom:6px">
        <span style="color:${WHITE}">THE </span><span class="grad-text" style="text-shadow:0 0 30px ${MINT}55">SLAYERS</span>
      </div>
      <div style="color:${GREY};font-size:12px;margin-bottom:32px">Signal Center</div>
      <div class="panel" style="width:100%;max-width:300px;padding:24px">
        <div style="color:${WHITE};font-size:14px;font-weight:700;margin-bottom:10px">Enter your access code</div>
        <input id="codeInput" type="text" placeholder="SLAY-XXXXXX" autocapitalize="characters" autocomplete="off"
          style="width:100%;background:rgba(0,0,0,0.35);border:1px solid ${BORDER};border-radius:12px;padding:14px;color:${WHITE};font-size:16px;text-align:center;letter-spacing:2px;margin-bottom:14px;outline:none" class="mono"/>
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
      let msg = 'That code is not valid. Double-check and try again.';
      try { const data = await res.json(); if (data.error) msg = data.error; } catch (e) {}
      clearCode();
      renderLogin(msg);
      return;
    }
    state.loading = true;
    render();
    fetchAll();
    if (swRegistration) checkPushStatus();
  } catch (e) {
    status.textContent = 'Connection error. Try again.';
  }
}

// ===== FLOATING EMBERS =====
function spawnEmbers() {
  const container = document.getElementById('embers');
  if (!container) return;
  for (let i = 0; i < 10; i++) {
    const e = document.createElement('div');
    e.className = 'ember';
    e.style.left = Math.random() * 100 + '%';
    e.style.bottom = '-10px';
    e.style.animationDuration = (12 + Math.random() * 10) + 's';
    e.style.animationDelay = (Math.random() * 14) + 's';
    container.appendChild(e);
  }
}
spawnEmbers();

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
    .then(reg => { swRegistration = reg; if (getCode()) checkPushStatus(); })
    .catch(e => console.error('SW failed', e));
}

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map(c => c.charCodeAt(0)));
}

let swRegistration = null;
let pushStatus = 'unknown'; // 'unknown' | 'available' | 'subscribed' | 'denied' | 'unsupported'

async function checkPushStatus() {
  if (!getCode()) return; // never touch render() while the user isn't logged in
  try {
    if (!('PushManager' in window) || !swRegistration) { pushStatus = 'unsupported'; render(); return; }
    if (Notification.permission === 'denied') { pushStatus = 'denied'; render(); return; }
    const existing = await swRegistration.pushManager.getSubscription();
    pushStatus = existing ? 'subscribed' : 'available';
    render();
  } catch (e) {
    console.error('checkPushStatus failed', e);
    pushStatus = 'unsupported';
  }
}

// Called directly from a button tap — iOS requires this to be a real user gesture, not automatic
async function enablePush() {
  if (!swRegistration || !getCode()) return;
  try {
    const keyRes = await fetch(withCode('/api/vapid-key'));
    const keyData = await keyRes.json();
    if (!keyData.enabled || !keyData.key) { alert('Push notifications are not configured on the server yet.'); return; }

    const perm = await Notification.requestPermission();
    if (perm !== 'granted') { pushStatus = 'denied'; render(); return; }

    const sub = await swRegistration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(keyData.key)
    });
    await fetch(withCode('/api/subscribe'), {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(sub)
    });
    pushStatus = 'subscribed';
    render();
  } catch (e) {
    console.error('Push subscribe failed', e);
    alert('Could not enable notifications: ' + (e.message || 'unknown error') + '. Screenshot this and send it.');
  }
}
