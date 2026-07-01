// ===== THE SLAYERS APP v10 — Overview · Journal · Calendar · Settings =====
// Inject styles for class names used in templates
(function(){var s=document.createElement('style');s.textContent=
'.card{background:#0F151A;border:0.5px solid rgba(62,207,142,0.08);border-radius:16px;padding:16px;margin-bottom:12px;transition:transform 0.2s}'+
'.card:active{transform:scale(0.985)}'+
'.card-glass{background:rgba(15,21,26,0.72);backdrop-filter:blur(16px) saturate(1.3);-webkit-backdrop-filter:blur(16px) saturate(1.3);border:0.5px solid rgba(62,207,142,0.15);border-radius:20px;padding:18px;margin-bottom:14px}'+
'.mono{font-family:SF Mono,JetBrains Mono,monospace;font-weight:500;letter-spacing:-0.3px}'+
'.pill{display:inline-flex;align-items:center;gap:4px;font-size:9px;font-weight:600;letter-spacing:0.4px;padding:3px 10px;border-radius:99px;text-transform:uppercase}'+
'.section-h{font-size:20px;font-weight:800;letter-spacing:-0.4px;margin-bottom:14px;display:flex;align-items:baseline;gap:8px;padding-top:18px}'+
'.section-h .sub{font-size:10px;font-weight:500;color:#7C8A87;margin-left:auto}'+
'.progress-track{width:100%;height:3px;background:rgba(255,255,255,0.04);border-radius:99px;overflow:hidden}'+
'.progress-fill{height:100%;border-radius:99px;transition:width 0.8s cubic-bezier(0.34,1.56,0.64,1)}'+
'.toggle{width:42px;height:24px;border-radius:99px;background:#3D4C4A;cursor:pointer;position:relative;flex-shrink:0;transition:background 0.3s}'+
'.toggle.on{background:#3ECF8E}'+
'.toggle::after{content:\"\";position:absolute;top:2px;left:2px;width:20px;height:20px;border-radius:99px;background:white;transition:transform 0.3s cubic-bezier(0.34,1.56,0.64,1)}'+
'.toggle.on::after{transform:translateX(18px)}'+
'.setting-row{display:flex;align-items:center;justify-content:space-between;padding:14px 0}'+
'.setting-row+.setting-row{border-top:0.5px solid rgba(255,255,255,0.03)}'+
'.setting-row .label{font-size:13px;font-weight:600}'+
'.setting-row .hint{font-size:10.5px;color:#7C8A87;margin-top:2px;font-weight:400}'+
'@keyframes breathe{0%,100%{box-shadow:0 0 4px #3ECF8E;opacity:1}50%{box-shadow:0 0 14px #3ECF8E;opacity:0.4}}'+
'.live-dot{width:6px;height:6px;border-radius:99px;background:#3ECF8E;animation:breathe 2.4s ease-in-out infinite;flex-shrink:0}'+
'.tab-btn{flex:1;display:flex;flex-direction:column;align-items:center;gap:2px;padding:8px 0 4px;border:none;background:none;cursor:pointer;transition:color 0.3s;font-family:inherit;position:relative}'+
'.tab-btn span{font-size:9px;font-weight:500;letter-spacing:0.3px}'+
'.tab-btn.active span{font-weight:600}'+
'@keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}'+
'.nav-indicator{position:absolute;top:-0.5px;height:2px;border-radius:99px;background:#3ECF8E;transition:left 0.35s cubic-bezier(0.34,1.56,0.64,1),width 0.35s cubic-bezier(0.34,1.56,0.64,1);box-shadow:0 0 20px rgba(62,207,142,0.2)}'+
'.skeleton{background:rgba(255,255,255,0.04);border-radius:12px;margin-bottom:14px;animation:pulse 1.5s ease-in-out infinite}'+
'@keyframes pulse{0%,100%{opacity:0.4}50%{opacity:0.8}}'+
'.ember{position:absolute;width:2px;height:2px;border-radius:99px;opacity:0;animation:float-up linear infinite}'+
'.ember:nth-child(odd){background:#D4A853;width:1.5px;height:1.5px}'+
'@keyframes float-up{0%{transform:translateY(0) scale(1);opacity:0}8%{opacity:0.5}92%{opacity:0.15}100%{transform:translateY(-100vh) scale(0);opacity:0}}'+
'.btn-primary{display:inline-flex;align-items:center;justify-content:center;gap:6px;padding:10px 20px;border-radius:99px;background:#3ECF8E;border:none;color:#0A0E12;font-family:inherit;font-size:12px;font-weight:700;cursor:pointer;transition:all 0.2s}'+
'.btn-primary:active{transform:scale(0.96);opacity:0.9}'+
'.btn-outline{display:inline-flex;align-items:center;justify-content:center;gap:6px;padding:10px 20px;border-radius:99px;background:transparent;border:0.5px solid rgba(255,255,255,0.08);color:#7C8A87;font-family:inherit;font-size:12px;font-weight:600;cursor:pointer;transition:all 0.2s}'+
'.btn-outline:active{transform:scale(0.96)}';
document.head.appendChild(s);})();

const BLACK='#0A0E12', PANEL='#0F151A', CARD='#0F151A', BORDER='rgba(62,207,142,0.08)',
      MINT='#3ECF8E', MINT_DIM='rgba(62,207,142,0.08)',
      GOLD='#D4A853', GOLD_DIM='rgba(212,168,83,0.08)',
      RED='#E8686A', RED_DIM='rgba(232,104,106,0.08)',
      WHITE='#F2F4F3', TEXT2='#B0BAB6', GREY='#7C8A87', MUTED='#3D4C4A';

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
  grid: '<rect x="4" y="4" width="7" height="7" rx="1.5"/><rect x="13" y="4" width="7" height="7" rx="1.5"/><rect x="4" y="13" width="7" height="7" rx="1.5"/><rect x="13" y="13" width="7" height="7" rx="1.5"/>',
  book: '<path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/><path d="M8 7h8M8 11h6"/>',
  cal: '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/><path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01M16 18h.01"/>',
  gear: '<circle cx="12" cy="12" r="3"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>',
};
function icon(name, color, size) { if (!size) size = 16; return '<svg width="' + size + '" height="' + size + '" viewBox="0 0 24 24" fill="none" stroke="' + color + '" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' + ICONS[name] + '</svg>'; }
function pill(text, color, dim) {
  return '<span class="pill" style="color:' + color + ';background:' + dim + ';border:0.5px solid ' + color + '33">' + text + '</span>';
}
function mono(text, color, size) { if (!color) color = WHITE; if (!size) size = 13.5; return '<span class="mono" style="color:' + color + ';font-size:' + size + 'px">' + text + '</span>'; }
function fmt(n) { return typeof n === 'number' ? n.toFixed(n > 100 ? 2 : 5) : n; }
function timeAgo(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  const n = new Date();
  const diff = Math.floor((n - d) / 60000);
  if (diff < 60) return diff + 'm ago';
  if (diff < 1440) return Math.floor(diff / 60) + 'h ago';
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
}
function fmtNum(n, d) { return n == null ? '--' : n.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d }); }

// ===== STATE =====
let state = {
  tab: 'overview', selected: null,
  signals: [], active: [], confluence: [], stats: null, myStats: null,
  journal: [], news: [], settings: null, notifPrefs: {}, botHistory: [],
  loading: true,
  filter: { pair: '', dir: '', tf: '' },
  journalFilter: 'all',
  showEntryForm: false,
  editingEntry: null,
};

// ===== DATA FETCHING =====
async function fetchAll() {
  const TIMEOUT_MS = 10000;
  const withTimeout = (p) => Promise.race([
    p, new Promise((_, rej) => setTimeout(() => rej(new Error('Request timed out')), TIMEOUT_MS))
  ]);
  try {
    const [sigRes, activeRes, confluRes, statsRes, myStatsRes, journalRes, newsRes, settingsRes, tradeHistRes] = await withTimeout(Promise.all([
      fetch(withCode('/api/signals?limit=20')), fetch(withCode('/api/active')),
      fetch(withCode('/api/confluence')), fetch(withCode('/api/stats')),
      fetch(withCode('/api/member/stats')), fetch(withCode('/api/journal')),
      fetch(withCode('/api/news')), fetch(withCode('/api/settings')),
      fetch(withCode('/api/trade-history'))
    ]));
    if (sigRes.status === 401) {
      clearCode();
      state.loading = false;
      renderLogin('Your access code has expired or is no longer valid.');
      return;
    }
    const j = (r) => r.json().catch(() => ({}));
    state.signals = (await j(sigRes)).signals || [];
    state.active = (await j(activeRes)).trades || [];
    state.confluence = (await j(confluRes)).pairs || [];
    state.stats = await j(statsRes);
    if (myStatsRes.status === 200) {
      const myData = await j(myStatsRes);
      state.myStats = myData.myStats || null;
      state.notifPrefs = myData.notifPrefs || {};
    }
    state.journal = (await j(journalRes)).entries || [];
    state.news = (await j(newsRes)).events || [];
    const sData = await j(settingsRes);
    state.settings = sData.settings || null;
    const histRes = await j(tradeHistRes);
    state.botHistory = histRes.outcomes || [];
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
  const criteria = (s.criteria || []).map(function(c) {
    return '<span style="font-size:10px;color:' + MINT + ';background:' + MINT_DIM + ';border:0.5px solid ' + MINT + '44;border-radius:99px;padding:3px 10px;font-weight:600;display:inline-block;margin:0 6px 6px 0">' + c + '</span>';
  }).join('');
  return '<div class="card" onclick="openDetail(\'' + s.id + '\')" style="cursor:pointer;border-left:2.5px solid ' + tierColor + ';animation-delay:' + (Math.random()*0.2) + 's">' +
    '<div style="display:flex;align-items:center;gap:8px;margin-bottom:10px">' +
    '<span style="font-weight:800;font-size:16px;letter-spacing:-0.2px">' + s.pair + '</span>' +
    pill(s.tier, tierColor, tierDim) +
    pill(isBuy ? 'BUY' : 'SELL', isBuy ? MINT : RED, isBuy ? MINT_DIM : RED_DIM) +
    '<span style="margin-left:auto;font-size:10px;color:' + GREY + '">' + timeAgo(s.time) + '</span>' +
    '</div>' +
    '<div style="display:flex;gap:12px;font-size:12px">' +
    '<span><span class="dim">Entry</span> <span style="font-weight:700">' + fmt(s.entry) + '</span></span>' +
    '<span><span class="dim">SL</span> <span style="font-weight:700;color:' + RED + '">' + fmt(s.sl) + '</span></span>' +
    (s.tp1 ? '<span><span class="dim">TP1</span> <span style="font-weight:700;color:' + GOLD + '">' + fmt(s.tp1) + '</span></span>' : '') +
    '</div>' +
      '<div style="margin-top:8px">' + criteria + '</div>' +
      (s.dailyPOI ? '<div style="font-size:11px;color:' + MINT + ';font-weight:600;margin-top:6px">\uD83C\uDFDB ' + s.dailyPOI + '</div>' : '') +
      '<div style="color:' + GREY + ';font-size:10px;margin-top:10px;text-align:center">Tap for full chart \u2192</div>' +
      '</div>';
}

// ===== RENDER: DETAIL PAGE =====
function detailPage(s) {
  const isBuy = s.type === 'BULLISH' || s.type === 'BUY';
  const tierColor = s.tier === 'ELITE' ? MINT : GOLD;
  const criteriaList = (s.criteria || []).map(function(c) {
    return '<div style="display:flex;align-items:center;gap:8px;padding:6px 0">' + icon('check', MINT, 15) + '<span style="font-size:13px">' + c + '</span></div>';
  }).join('');
  const chartHtml = s.chartUrl
    ? '<img src="' + withCode(s.chartUrl) + '" style="width:100%;display:block;border-radius:14px" alt="Signal chart">'
    : '<div style="height:170px;display:flex;align-items:center;justify-content:center;color:' + GREY + ';font-size:12px;border:0.5px solid ' + BORDER + ';border-radius:14px">Chart unavailable</div>';
  return '<div style="display:flex;flex-direction:column;height:100dvh;background:' + BLACK + ';color:' + WHITE + '">' +
    '<div style="flex:1;overflow-y:auto;background:' + BLACK + ';color:' + WHITE + '">' +
    '<div style="display:flex;align-items:center;gap:12px;padding:calc(20px + env(safe-area-inset-top)) 16px 10px">' +
    '<button onclick="closeDetail()" style="background:' + PANEL + ';border:0.5px solid ' + BORDER + ';border-radius:99px;width:34px;height:34px;display:flex;align-items:center;justify-content:center;cursor:pointer">' + icon('back', WHITE, 16) + '</button>' +
    '<div>' +
    '<div style="font-weight:800;font-size:18px;letter-spacing:-0.3px">' + s.pair + ' · ' + s.tf + '</div>' +
    '<div style="color:' + GREY + ';font-size:11px">' + timeAgo(s.time) + ' · ' + (s.system || 'QMR') + ' Signal</div>' +
    '</div></div>' +
    '<div style="padding:8px 16px">' +
    '<div style="display:flex;gap:8px;margin-bottom:14px;flex-wrap:wrap">' +
    pill(s.tier, tierColor, s.tier === 'ELITE' ? MINT_DIM : GOLD_DIM) +
    pill(s.type, isBuy ? MINT : RED, isBuy ? MINT_DIM : RED_DIM) +
    '</div>' + chartHtml +
    '<div style="display:flex;justify-content:space-between;margin:12px 0 18px;font-size:10px">' +
    '<span style="color:' + MINT + '">● Entry</span>' +
    '<span style="color:' + RED + '">● SL</span>' +
    '<span style="color:' + GOLD + '">● TP</span></div>' +
    '<div style="font-size:14px;font-weight:700;margin-bottom:10px">Trade Levels</div>' +
    '<div class="card" style="margin-bottom:18px">' +
    '<div style="display:flex;justify-content:space-between;padding:9px 0"><span class="dim">' + (s.refinedEntry ? '4H Zone' : 'Entry') + '</span>' + mono(fmt(s.entry), WHITE, 16) + '</div>' +
    (s.refinedEntry ? '<div style="display:flex;justify-content:space-between;padding:9px 0"><span class="dim">' + icon('target', GOLD, 13) + ' Refined Entry</span>' + mono(fmt(s.refinedEntry), GOLD, 16) + '</div>' : '') +
    '<div style="display:flex;justify-content:space-between;padding:9px 0"><span class="dim">' + icon('shield', RED, 13) + ' Stop Loss</span>' + mono(fmt(s.sl), RED, 16) + '</div>' +
    (s.tp1 ? '<div style="display:flex;justify-content:space-between;padding:9px 0"><span class="dim">TP1</span>' + mono(fmt(s.tp1), GOLD, 16) + '</div>' : '') +
    (s.tp2 ? '<div style="display:flex;justify-content:space-between;padding:9px 0"><span class="dim">TP2</span>' + mono(fmt(s.tp2), MINT, 16) + '</div>' : '') +
    '</div>' +
    '<div style="font-size:14px;font-weight:700;margin-bottom:10px">Criteria ' + (s.score ? '— ' + s.score + '/4' : '') + '</div>' +
    '<div class="card" style="margin-bottom:18px">' + criteriaList + '</div>' +
    (s.counterTrend ? '<div style="background:' + GOLD_DIM + ';border:0.5px solid ' + GOLD + '55;border-radius:14px;padding:14px;margin-bottom:18px;display:flex;gap:8px"><span>' + icon('warn', GOLD, 16) + '</span><span style="color:' + GOLD + ';font-size:12.5px;font-weight:600">Counter-trend setup — ' + (s.htfBias || '') + '. Reduce position size.</span></div>' : '') +
    '<button onclick="toggleTrack(\'' + s.id + '\', ' + (!!s.isTracked) + ')" style="width:100%;background:' + (s.isTracked ? MINT_DIM : 'transparent') + ';border:0.5px solid ' + (s.isTracked ? MINT : BORDER) + ';border-radius:99px;padding:14px 0;display:flex;align-items:center;justify-content:center;gap:8px;cursor:pointer;margin-bottom:12px">' +
    icon(s.isTracked ? 'check' : 'target', s.isTracked ? MINT : GREY, 16) +
    '<span style="color:' + (s.isTracked ? MINT : GREY) + ';font-weight:700;font-size:13px">' + (s.isTracked ? 'Tracking — you will get updates on this trade' : "I'm in this trade — notify me") + '</span></button>' +
    '<button onclick="window.open(\'https://slayerbotcalculator.netlify.app/#' + s.pair.replace('/', '') + ',' + s.entry + ',' + s.sl + '\', \'_blank\')" style="width:100%;background:' + MINT + ';border:none;border-radius:99px;padding:15px 0;display:flex;align-items:center;justify-content:center;gap:8px;cursor:pointer;margin-bottom:24px">' +
    icon('calc', BLACK, 16) + '<span style="color:' + BLACK + ';font-weight:800;font-size:14px">Calculate Position Size</span></button>' +
    '</div></div></div>';
}

// ===== RENDER: CONFLUENCE =====
function confluenceScreen() {
  if (!state.confluence.length) return emptyState('Market data loading...');
  return state.confluence.map(function(p) {
    const isBull = p.weeklyBias === 'BULLISH' || p.signalDir === 'BULLISH';
    const wc = p.weeklyBias === 'BULLISH' ? MINT : p.weeklyBias === 'BEARISH' ? RED : GREY;
    const dc = p.dailyTrend === 'BULLISH' ? MINT : p.dailyTrend === 'BEARISH' ? RED : GREY;
    const tc = p.convictionLabel === 'ELITE' ? MINT : p.convictionLabel === 'STRONG' ? GOLD : p.convictionLabel === 'VALID' ? GOLD : GREY;
    const userTag = p.userInTrade
      ? '<span style="font-size:9px;color:' + MINT + ';background:' + MINT_DIM + ';border-radius:99px;padding:2px 8px;font-weight:700">YOURS' + (p.activeTradeProgress?.tp1Fired ? ' TP1✓' : '') + (p.activeTradeProgress?.beFired ? ' BE✓' : '') + '</span>'
      : '';
    return '<div class="card" style="border-left:2.5px solid ' + tc + ';animation-delay:' + (Math.random()*0.15) + 's">' +
      '<div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">' +
      '<span style="font-weight:800;font-size:16px;letter-spacing:-0.2px">' + p.name + '</span>' +
      '<span class="mono" style="color:' + GREY + ';font-size:12px">' + p.price + '</span>' + userTag + '</div>' +
      '<div style="display:flex;gap:5px;flex-wrap:wrap;margin-bottom:8px">' +
      '<span style="font-size:10px;border:0.5px solid ' + wc + '44;border-radius:99px;padding:3px 10px;color:' + wc + ';font-weight:700">W: ' + p.weeklyBias + '</span>' +
      '<span style="font-size:10px;border:0.5px solid ' + dc + '44;border-radius:99px;padding:3px 10px;color:' + dc + ';font-weight:700">D: ' + p.dailyTrend + '</span>' +
      (p.biasRelation === 'ALIGNED' ? '<span style="font-size:10px;border:0.5px solid ' + MINT + '44;background:' + MINT_DIM + ';border-radius:99px;padding:3px 10px;color:' + MINT + ';font-weight:600">ALIGNED</span>' : p.biasRelation === 'CONFLICT' ? '<span style="font-size:10px;border:0.5px solid ' + RED + '44;background:' + RED_DIM + ';border-radius:99px;padding:3px 10px;color:' + RED + ';font-weight:600">CONFLICT</span>' : '<span style="font-size:10px;border:0.5px solid ' + GOLD + '44;background:' + GOLD_DIM + ';border-radius:99px;padding:3px 10px;color:' + GOLD + ';font-weight:600">MIXED</span>') +
      pill(p.convictionLabel, tc, tc + '22') + '</div>' +
      (p.signalDir !== 'NONE' ? '<div style="display:flex;align-items:center;gap:6px;margin-bottom:6px">' + icon(isBull ? 'up' : 'down', isBull ? MINT : RED, 14) + '<span style="font-weight:600;font-size:12px">' + (p.signalDir === 'BULLISH' ? 'BUY' : 'SELL') + ' signal</span></div>' : '<div style="color:' + GREY + ';font-size:11px;margin-bottom:6px">No active signals</div>') +
      (p.factors.length ? '<div style="display:flex;gap:4px;flex-wrap:wrap">' + p.factors.map(function(f) { return '<span style="font-size:9px;color:' + MINT + ';background:' + MINT_DIM + ';border-radius:99px;padding:2px 8px">✓ ' + f + '</span>'; }).join('') + '</div>' : '') +
      '</div>';
  }).join('');
}

// ===== RENDER: STATS OVERVIEW =====
function statsOverview() {
  const st = state.stats || {};
  return '<div style="display:flex;gap:8px;margin-bottom:14px">' +
    '<div class="card" style="flex:1;padding:12px;text-align:center;animation-delay:0s">' +
    '<div style="font-size:10px;color:' + GREY + ';font-weight:500">Win Rate</div>' +
    '<div style="font-size:22px;font-weight:800;color:' + MINT + ';margin-top:2px;letter-spacing:-0.5px">' + (st.winRate ?? '--') + '%</div></div>' +
    '<div class="card" style="flex:1;padding:12px;text-align:center;animation-delay:0.05s">' +
    '<div style="font-size:10px;color:' + GREY + ';font-weight:500">Total R</div>' +
    '<div style="font-size:22px;font-weight:800;color:' + GOLD + ';margin-top:2px;letter-spacing:-0.5px">' + (st.totalR >= 0 ? '+' : '') + (st.totalR ?? '--') + '</div></div>' +
    '<div class="card" style="flex:1;padding:12px;text-align:center;animation-delay:0.1s">' +
    '<div style="font-size:10px;color:' + GREY + ';font-weight:500">Active</div>' +
    '<div style="font-size:22px;font-weight:800;margin-top:2px;letter-spacing:-0.5px">' + state.active.length + '</div></div></div>';
}

// ===== PERFORMANCE CHARTS =====
function equityChart(entries) {
  if (entries.length < 2) return '';
  var sorted = entries.slice().sort(function(a, b) { return (a.createdAt || '').localeCompare(b.createdAt || ''); });
  var cumR = 0, points = [];
  for (var i = 0; i < sorted.length; i++) {
    cumR += (sorted[i].rMultiple || 0);
    points.push(cumR);
  }
  var mn = Math.min(0, Math.min.apply(null, points));
  var mx = Math.max(0, Math.max.apply(null, points));
  var rng = mx - mn || 1;
  var w = 310, h = 62, pad = 4;
  var toY = function(v) { return pad + (1 - (v - mn) / rng) * (h - pad * 2); };
  var toX = function(i) { return pad + (i / (points.length - 1)) * (w - pad * 2); };
  var d = '';
  for (var i = 0; i < points.length; i++) {
    d += (i === 0 ? 'M' : 'L') + toX(i).toFixed(1) + ',' + toY(points[i]).toFixed(1);
  }
  var zeroY = toY(0);
  var fillD = d + 'L' + toX(points.length - 1).toFixed(1) + ',' + zeroY.toFixed(1) + 'L' + toX(0).toFixed(1) + ',' + zeroY.toFixed(1) + 'Z';
  var lastVal = points[points.length - 1];
  var color = lastVal >= 0 ? MINT : RED;
  return '<div class="card" style="padding:14px 16px;animation-delay:0.02s">' +
    '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">' +
    '<span style="font-size:12px;font-weight:700">Equity Curve</span>' +
    '<span style="font-size:11px;font-weight:700;color:' + color + '">' + (lastVal >= 0 ? '+' : '') + lastVal.toFixed(1) + 'R</span></div>' +
    '<svg width="100%" height="' + h + '" viewBox="0 0 ' + w + ' ' + h + '" style="display:block">' +
    '<path d="' + fillD + '" fill="url(#eqGrad)" opacity="0.15"/>' +
    '<defs><linearGradient id="eqGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="' + color + '"/><stop offset="100%" stop-color="' + color + '" stop-opacity="0"/></linearGradient></defs>' +
    '<path d="' + d + '" stroke="' + color + '" stroke-width="1.8" fill="none" stroke-linecap="round" stroke-linejoin="round"/>' +
    '<circle cx="' + toX(points.length - 1).toFixed(1) + '" cy="' + toY(lastVal).toFixed(1) + '" r="2.5" fill="' + color + '"/></svg></div>';
}

function rBarChart(entries) {
  if (!entries.length) return '';
  var slice = entries.slice(-20);
  var maxR = Math.max.apply(null, slice.map(function(e) { return Math.abs(e.rMultiple || 0); }));
  maxR = Math.max(maxR, 0.5);
  var barW = 12, gap = 3, totalW = slice.length * (barW + gap);
  var h = 60, zeroY = h - 10;
  var bars = '';
  for (var i = 0; i < slice.length; i++) {
    var e = slice[i];
    var r = e.rMultiple || 0;
    var barH = (Math.abs(r) / maxR) * (h - 16);
    var x = i * (barW + gap);
    var y = r >= 0 ? zeroY - barH : zeroY;
    var c = r > 0 ? MINT : r < 0 ? RED : GOLD;
    bars += '<rect x="' + x + '" y="' + y.toFixed(1) + '" width="' + barW + '" height="' + barH.toFixed(1) + '" rx="2" fill="' + c + '" opacity="0.8"/>';
  }
  return '<div class="card" style="padding:14px 16px;animation-delay:0.04s">' +
    '<div style="font-size:12px;font-weight:700;margin-bottom:8px">R per Trade <span style="font-size:9px;color:' + GREY + ';font-weight:400">(last ' + slice.length + ')</span></div>' +
    '<svg width="100%" height="' + h + '" viewBox="0 0 ' + (totalW + 4) + ' ' + h + '" style="display:block">' +
    '<line x1="0" y1="' + zeroY + '" x2="' + (totalW + 4) + '" y2="' + zeroY + '" stroke="rgba(255,255,255,0.06)" stroke-width="0.5"/>' +
    bars + '</svg></div>';
}

// ===== RENDER: JOURNAL SCREEN =====
function journalScreen() {
  const entries = state.journal;
  const wins = entries.filter(function(e) { return e.outcome === 'WIN' || e.outcome === 'TP1' || e.outcome === 'TP2'; });
  const losses = entries.filter(function(e) { return e.outcome === 'SL'; });
  const bes = entries.filter(function(e) { return e.outcome === 'BE'; });
  const wr = (wins.length + losses.length) ? Math.round((wins.length / (wins.length + losses.length)) * 100) : 0;
  const totalR = entries.reduce(function(a, e) { return a + (e.rMultiple || 0); }, 0);
  const filtered = state.journalFilter === 'all' ? entries
    : state.journalFilter === 'wins' ? wins
    : state.journalFilter === 'losses' ? losses
    : entries.filter(function(e) { return e.outcome === state.journalFilter; });
  const allTags = [...new Set(entries.flatMap(function(e) { return e.tags || []; }))].slice(0, 8);
  const streakInfo = state.stats || {};

  function renderDayHeaders() {
    var days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
    var h = '';
    for (var i = 0; i < days.length; i++) {
      h += '<span style="font-size:7px;color:' + GREY + ';width:10px;text-align:center;display:inline-block">' + days[i] + '</span>';
    }
    return h;
  }

   function renderCells(outcomes, getDate, getOutcome) {
     var now = new Date();
     var start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
     start.setUTCDate(start.getUTCDate() - 27);
     var cells = [];
     for (var i = 0; i < 28; i++) {
       var d = new Date(start);
       d.setUTCDate(start.getUTCDate() + i);
       var ds = d.toISOString().slice(0, 10);
      var match = null;
      for (var j = 0; j < outcomes.length; j++) {
        if (getDate(outcomes[j]) === ds) { match = outcomes[j]; break; }
      }
      var outcome = match ? getOutcome(match) : null;
      var color = outcome === 'WIN' || outcome === 'TP1' || outcome === 'TP2' ? MINT
        : outcome === 'SL' ? RED
        : outcome === 'BE' ? GOLD
        : 'rgba(255,255,255,0.04)';
      cells.push('<span style="display:inline-block;width:10px;height:10px;border-radius:2.5px;background:' + color + '"></span>');
    }
    var rows = '';
    for (var w = 0; w < 4; w++) {
      rows += '<div style="display:flex;gap:3px;margin-top:3px">' + cells.slice(w * 7, w * 7 + 7).join('') + '</div>';
    }
    return rows;
  }

  function heatmapCard(label, outcomes, getDate, getOutcome) {
    var monthName = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    return '<div class="card" style="animation-delay:0.05s">' +
      '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">' +
      '<span style="font-size:13px;font-weight:700">' + label + '</span>' +
      '<div style="display:flex;gap:8px;font-size:9px;color:' + GREY + '">' +
      '<span><span style="display:inline-block;width:8px;height:8px;border-radius:2px;background:' + MINT + ';vertical-align:middle;margin-right:2px"></span>W</span>' +
      '<span><span style="display:inline-block;width:8px;height:8px;border-radius:2px;background:' + RED + ';vertical-align:middle;margin-right:2px"></span>L</span>' +
      '<span><span style="display:inline-block;width:8px;height:8px;border-radius:2px;background:' + GOLD + ';vertical-align:middle;margin-right:2px"></span>BE</span>' +
      '</div></div>' +
      '<div style="font-size:9px;color:' + GREY + ';margin-bottom:6px">' + monthName + '</div>' +
      '<div style="display:flex;gap:3px">' + renderDayHeaders() + '</div>' +
      renderCells(outcomes, getDate, getOutcome) + '</div>';
  }

  function tagHtml(tag) {
    var isEarly = tag === 'Early Entry';
    var isFeeling = tag === 'Confident' || tag === 'Impatient' || tag === 'Neutral';
    var emojiMap = { Displacement: '', 'Liq Sweep': '🧹', MSS: '📐', 'Eng. Liq': '⚡', FVG: '💰', OB: '🏦', CRT: '📈', 'Early Entry': '⏰', Confident: '🏋️', Impatient: '🤯', Neutral: '😐' };
    var bg, col;
    if (isEarly) { bg = RED_DIM; col = RED; }
    else if (isFeeling) { bg = GOLD_DIM; col = GOLD; }
    else { bg = MINT_DIM; col = MINT; }
    return '<span style="font-size:8.5px;padding:2px 8px;border-radius:99px;background:' + bg + ';color:' + col + '">' + (emojiMap[tag] || '') + ' ' + tag + '</span>';
  }

  function flagHtml(f) {
    return '<span style="font-size:8.5px;padding:2px 8px;border-radius:99px;background:' + GOLD_DIM + ';color:' + GOLD + ';font-weight:600">\u26A0 ' + f + '</span>';
  }

  function entryHtml(e) {
    var outcome = e.outcome;
    var isWin = outcome === 'WIN' || outcome === 'TP1' || outcome === 'TP2';
    var iconColor = isWin ? MINT : outcome === 'SL' ? RED : GOLD;
    var iconBg = isWin ? MINT_DIM : outcome === 'SL' ? RED_DIM : GOLD_DIM;
    var iconText = isWin ? '✓' : outcome === 'SL' ? '✕' : '—';
    var resultColor = isWin ? MINT : outcome === 'SL' ? RED : GOLD;
    var tagsHtml = '';
    if (e.tags && e.tags.length) {
      tagsHtml = '<div style="display:flex;gap:4px;margin-top:5px">';
      for (var i = 0; i < e.tags.length; i++) { tagsHtml += tagHtml(e.tags[i]); }
      tagsHtml += '</div>';
    }
    var flagsHtml = '';
    if (e.reviewFlags && e.reviewFlags.length) {
      flagsHtml = '<div style="display:flex;gap:4px;margin-top:4px">';
      for (var i = 0; i < e.reviewFlags.length; i++) { flagsHtml += flagHtml(e.reviewFlags[i]); }
      flagsHtml += '</div>';
    }
    var notesHtml = e.notes ? '<div style="font-size:11.5px;color:' + TEXT2 + ';margin-top:5px;line-height:1.4">' + e.notes + '</div>' : '';
    return '<div class="card" onclick="editEntry(\'' + e.id + '\')" style="padding:12px 16px;cursor:pointer;animation-delay:0s">' +
      '<div style="display:flex;gap:12px;align-items:flex-start">' +
      '<div style="width:30px;height:30px;border-radius:99px;flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:13px;background:' + iconBg + ';color:' + iconColor + '">' + iconText + '</div>' +
      '<div style="flex:1;min-width:0">' +
      '<div style="display:flex;justify-content:space-between;align-items:center">' +
      '<span style="font-weight:700;font-size:13px">' + e.pair + '</span>' +
      '<span style="font-weight:800;font-size:13px;color:' + resultColor + '">' + (e.rMultiple >= 0 ? '+' : '') + (e.rMultiple || 0) + 'R</span></div>' +
      '<div style="font-size:10px;color:' + GREY + ';margin-top:2px">' + (e.direction || '') + ' · ' + (e.tf || '') + ' · ' + (e.duration || '') + ' · ' + (e.createdAt ? timeAgo(e.createdAt) : '') + '</div>' +
      notesHtml + flagsHtml + tagsHtml + '</div></div></div>';
  }

  var entriesHtml = '';
  if (filtered.length) {
    for (var i = 0; i < filtered.length; i++) { entriesHtml += entryHtml(filtered[i]); }
  } else {
    entriesHtml = '<div class="card" style="text-align:center;padding:30px;color:' + GREY + ';font-size:12px">' +
      (state.journalFilter === 'all' ? 'No journal entries yet. Tap "+ New Journal Entry" to start tracking your trades.' : 'No entries match this filter.') + '</div>';
  }

  var filterChips = ['all', 'wins', 'losses', 'BE'];
  for (var i = 0; i < allTags.length; i++) { filterChips.push(allTags[i]); }
  var chipsHtml = '';
  for (var i = 0; i < filterChips.length; i++) {
    var active = state.journalFilter === filterChips[i];
    var label = filterChips[i] === 'all' ? 'All' : filterChips[i].charAt(0).toUpperCase() + filterChips[i].slice(1);
    chipsHtml += '<span onclick="setJournalFilter(\'' + filterChips[i] + '\')" style="font-size:10px;font-weight:600;padding:5px 12px;border-radius:99px;cursor:pointer;background:' + (active ? MINT_DIM : 'rgba(255,255,255,0.03)') + ';color:' + (active ? MINT : GREY) + ';border:0.5px solid ' + (active ? MINT + '33' : 'rgba(255,255,255,0.05)') + '">' + label + '</span>';
  }

  return     '<div class="section-h">Journal' +
    '<span class="sub" style="display:flex;gap:6px">' +
    '<span onclick="toggleEntryForm()" style="font-size:16px;font-weight:800;color:' + MINT + ';cursor:pointer;line-height:1">+</span>' +
    '<span onclick="window.open(withCode(\'/api/journal\'), \'_blank\')" style="font-size:10px;font-weight:600;color:' + GREY + ';cursor:pointer;line-height:1.6">Export</span>' +
    '</span></div>' +
    '<div class="card" style="padding:16px 20px;border-color:' + MINT + '1E;animation-delay:0s">' +
    '<div style="display:flex;justify-content:space-around">' +
    '<div style="text-align:center"><div style="font-size:22px;font-weight:800;color:' + MINT + ';letter-spacing:-0.5px">' + wr + '%</div><div style="font-size:9px;color:' + GREY + ';font-weight:500;margin-top:2px">Win Rate</div></div>' +
    '<div style="text-align:center"><div style="font-size:22px;font-weight:800;color:' + GOLD + ';letter-spacing:-0.5px">' + (totalR >= 0 ? '+' : '') + totalR.toFixed(1) + '</div><div style="font-size:9px;color:' + GREY + ';font-weight:500;margin-top:2px">Total R</div></div>' +
    '<div style="text-align:center"><div style="font-size:22px;font-weight:800;letter-spacing:-0.5px">' + entries.length + '</div><div style="font-size:9px;color:' + GREY + ';font-weight:500;margin-top:2px">Trades</div></div>' +
     '<div style="text-align:center"><div style="font-size:22px;font-weight:800;color:' + RED + ';letter-spacing:-0.5px">' + losses.length + '</div><div style="font-size:9px;color:' + GREY + ';font-weight:500;margin-top:2px">Losses</div></div></div></div>' +
     equityChart(entries) +
     rBarChart(entries) +
     heatmapCard('Your Trades', entries, function(e) { return e.createdAt ? e.createdAt.slice(0, 10) : ''; }, function(e) { return e.outcome; }) +
    heatmapCard('Bot Trades', state.botHistory, function(o) { return o.time ? o.time.slice(0, 10) : ''; }, function(o) { return o.outcome; }) +
    '<div class="card" style="display:flex;justify-content:space-around;padding:14px 10px;animation-delay:0.1s">' +
    '<div style="text-align:center"><div style="font-size:9px;color:' + GREY + ';font-weight:500">🔥 Win Streak</div>' +
    '<div style="font-size:20px;font-weight:800;color:' + MINT + ';letter-spacing:-0.5px;margin-top:2px">' + (streakInfo.winStreak ?? 0) + '</div></div>' +
    '<div style="width:0.5px;background:rgba(255,255,255,0.05)"></div>' +
    '<div style="text-align:center"><div style="font-size:9px;color:' + GREY + ';font-weight:500">😤 Loss Streak</div>' +
    '<div style="font-size:20px;font-weight:800;color:' + RED + ';letter-spacing:-0.5px;margin-top:2px">' + (streakInfo.lossStreak ?? 0) + '</div></div>' +
    '<div style="width:0.5px;background:rgba(255,255,255,0.05)"></div>' +
    '<div style="text-align:center"><div style="font-size:9px;color:' + GREY + ';font-weight:500">🏆 Best Day</div>' +
    '<div style="font-size:20px;font-weight:800;color:' + GOLD + ';letter-spacing:-0.5px;margin-top:2px">' + (state.stats?.bestTrade ? '+' + state.stats.bestTrade.rMultiple + 'R' : '--') + '</div></div></div>' +
    (state.showEntryForm || state.editingEntry ? journalEntryForm() : '') +
    '<div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:12px">' + chipsHtml + '</div>' +
    entriesHtml;
}

// ===== RENDER: JOURNAL ENTRY FORM =====
function journalEntryForm() {
  var edit = state.editingEntry;
  var title = edit ? 'Edit Journal Entry' : 'New Journal Entry';
  var btnLabel = edit ? 'Update Entry' : 'Save Entry';
  var pairV = edit ? (edit.pair || '') : '';
  var dirV = edit ? (edit.direction || 'BUY') : 'BUY';
  var tfV = edit ? (edit.tf || '4H') : '4H';
  var outV = edit ? (edit.outcome || 'WIN') : 'WIN';
  var rV = edit ? (edit.rMultiple || '') : '';
  var durV = edit ? (edit.duration || '') : '';
  var notesV = edit ? (edit.notes || '') : '';
  var tagOpts = ['Displacement', 'Liq Sweep', 'MSS', 'Eng. Liq', 'FVG', 'OB', 'CRT', 'Early Entry', 'Confident', 'Impatient', 'Neutral'];

  var sel = function(v, val) { return v === val ? 'selected' : ''; };
  var tagsHtml = '';
  for (var i = 0; i < tagOpts.length; i++) {
    var active = edit && edit.tags && edit.tags.indexOf(tagOpts[i]) !== -1;
    tagsHtml += '<span onclick="toggleTag(this, \'' + tagOpts[i] + '\')" style="font-size:9px;padding:4px 10px;border-radius:99px;cursor:pointer;background:' + (active ? MINT_DIM : 'rgba(255,255,255,0.03)') + ';color:' + (active ? MINT : GREY) + ';border:0.5px solid ' + (active ? MINT + '33' : 'rgba(255,255,255,0.05)') + '">' + tagOpts[i] + '</span>';
  }

  var deleteHtml = edit ? '<div style="text-align:center;margin-top:10px"><span onclick="deleteEntry(\'' + edit.id + '\')" style="font-size:12px;color:' + RED + ';font-weight:600;cursor:pointer">Delete this entry</span></div>' : '';

  return '<div class="card" style="border-color:' + MINT + '33;animation-delay:0s">' +
    '<div style="font-size:13px;font-weight:700;margin-bottom:12px">' + title + '</div>' +
    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:10px">' +
    '<input id="jPair" value="' + pairV + '" placeholder="Pair (e.g. EURUSD)" style="background:' + BLACK + ';border:0.5px solid ' + BORDER + ';border-radius:8px;padding:10px;color:' + WHITE + ';font-size:12px;outline:none">' +
    '<select id="jDir" style="background:' + BLACK + ';border:0.5px solid ' + BORDER + ';border-radius:8px;padding:10px;color:' + WHITE + ';font-size:12px;outline:none">' +
    '<option value="BUY" ' + sel(dirV, 'BUY') + '>BUY</option><option value="SELL" ' + sel(dirV, 'SELL') + '>SELL</option></select>' +
    '<select id="jTF" style="background:' + BLACK + ';border:0.5px solid ' + BORDER + ';border-radius:8px;padding:10px;color:' + WHITE + ';font-size:12px;outline:none">' +
    '<option value="1H" ' + sel(tfV, '1H') + '>1H</option><option value="4H" ' + sel(tfV, '4H') + '>4H</option><option value="DAILY" ' + sel(tfV, 'DAILY') + '>DAILY</option></select>' +
    '<select id="jOutcome" style="background:' + BLACK + ';border:0.5px solid ' + BORDER + ';border-radius:8px;padding:10px;color:' + WHITE + ';font-size:12px;outline:none">' +
    '<option value="WIN" ' + sel(outV, 'WIN') + '>WIN</option><option value="TP1" ' + sel(outV, 'TP1') + '>TP1</option><option value="TP2" ' + sel(outV, 'TP2') + '>TP2</option>' +
    '<option value="SL" ' + sel(outV, 'SL') + '>SL</option><option value="BE" ' + sel(outV, 'BE') + '>BE</option></select>' +
    '<input id="jR" type="number" step="0.1" value="' + rV + '" placeholder="R multiple (e.g. 1.8)" style="background:' + BLACK + ';border:0.5px solid ' + BORDER + ';border-radius:8px;padding:10px;color:' + WHITE + ';font-size:12px;outline:none">' +
    '<input id="jDuration" value="' + durV + '" placeholder="Duration (e.g. 2h 34m)" style="background:' + BLACK + ';border:0.5px solid ' + BORDER + ';border-radius:8px;padding:10px;color:' + WHITE + ';font-size:12px;outline:none">' +
    '</div>' +
    '<textarea id="jNotes" placeholder="Notes about the trade..." style="width:100%;background:' + BLACK + ';border:0.5px solid ' + BORDER + ';border-radius:8px;padding:10px;color:' + WHITE + ';font-size:12px;outline:none;resize:none;height:60px;font-family:inherit">' + notesV + '</textarea>' +
    '<div style="display:flex;gap:6px;flex-wrap:wrap;margin:10px 0">' + tagsHtml + '</div>' +
    '<div style="display:flex;gap:8px">' +
    '<button onclick="saveJournalEntry()" class="btn-primary" style="flex:1">' + btnLabel + '</button>' +
    '<button onclick="toggleEntryForm()" class="btn-outline" style="flex:0">Cancel</button></div>' +
    deleteHtml +
    '<div id="jStatus" style="font-size:11px;color:' + MINT + ';margin-top:8px;text-align:center"></div></div>';
}

let selectedTags = [];
function toggleTag(el, tag) {
  var idx = selectedTags.indexOf(tag);
  if (idx > -1) { selectedTags.splice(idx, 1); el.style.background = 'rgba(255,255,255,0.03)'; el.style.color = GREY; }
  else { selectedTags.push(tag); el.style.background = MINT_DIM; el.style.color = MINT; el.style.borderColor = MINT + '33'; }
}

async function saveJournalEntry() {
  var pair = document.getElementById('jPair').value.trim().toUpperCase();
  var direction = document.getElementById('jDir').value;
  var tf = document.getElementById('jTF').value;
  var outcome = document.getElementById('jOutcome').value;
  var rMultiple = parseFloat(document.getElementById('jR').value) || 0;
  var duration = document.getElementById('jDuration').value;
  var notes = document.getElementById('jNotes').value.trim();
  var edit = state.editingEntry;
  if (!pair) { document.getElementById('jStatus').textContent = 'Pair is required'; return; }
  try {
    var body = { pair: pair, direction: direction, tf: tf, outcome: outcome, rMultiple: rMultiple, duration: duration, notes: notes, tags: selectedTags.slice() };
    var res;
    if (edit) {
      res = await fetch(withCode('/api/journal/' + edit.id), { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    } else {
      res = await fetch(withCode('/api/journal'), { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    }
    if (res.ok) {
      state.showEntryForm = false;
      state.editingEntry = null;
      selectedTags = [];
      state.journalFilter = 'all';
      var jRes = await fetch(withCode('/api/journal'));
      if (jRes.ok) state.journal = (await jRes.json()).entries || [];
      render();
    } else {
      document.getElementById('jStatus').textContent = 'Failed to save';
    }
  } catch (e) {
    document.getElementById('jStatus').textContent = 'Connection error';
  }
}

function toggleEntryForm() {
  state.showEntryForm = !state.showEntryForm;
  state.editingEntry = null;
  if (!state.showEntryForm) selectedTags = [];
  render();
}

window.editEntry = function(id) {
  state.editingEntry = null;
  for (var i = 0; i < state.journal.length; i++) {
    if (state.journal[i].id === id) { state.editingEntry = state.journal[i]; break; }
  }
  if (state.editingEntry) selectedTags = (state.editingEntry.tags || []).slice();
  state.showEntryForm = false;
  render();
};

window.deleteEntry = async function(id) {
  if (!confirm('Delete this journal entry?')) return;
  try {
    await fetch(withCode('/api/journal/' + id), { method: 'DELETE' });
    state.editingEntry = null;
    selectedTags = [];
    var jRes = await fetch(withCode('/api/journal'));
    if (jRes.ok) state.journal = (await jRes.json()).entries || [];
    render();
  } catch (e) { console.error('Delete failed', e); }
};

window.setJournalFilter = function(f) { state.journalFilter = f; render(); };

// ===== RENDER: CALENDAR SCREEN =====
function calendarScreen() {
  var events = state.news;
  var high = events.filter(function(e) { return e.impact === 'High'; });
  var med = events.filter(function(e) { return e.impact === 'Medium' || e.impact === 'MEDIUM'; });
  var low = events.filter(function(e) { return e.impact === 'Low' || e.impact === 'LOW'; });
  var dateStrip = '';
  var dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  var today = new Date().toISOString().slice(0, 10);
  for (var i = 0; i < dayNames.length; i++) {
    var dt = new Date();
    dt.setDate(dt.getDate() - dt.getDay() + 1 + i);
    var active = dt.toISOString().slice(0, 10) === today;
    dateStrip += '<div style="text-align:center;padding:6px 14px;border-radius:99px;cursor:pointer;background:' + (active ? MINT_DIM : 'transparent') + ';border:0.5px solid ' + (active ? MINT + '33' : 'rgba(255,255,255,0.04)') + '">' +
      '<div style="font-size:9px;color:' + (active ? MINT : GREY) + '">' + dayNames[i].toUpperCase() + '</div>' +
      '<div style="font-size:15px;font-weight:800;color:' + (active ? MINT : WHITE) + '">' + dt.getDate() + '</div></div>';
  }
  var eventsHtml = '';
  if (events.length) {
    for (var i = 0; i < events.length; i++) {
      var e = events[i];
      var impactColor = e.impact === 'High' || e.impact === 'HIGH' ? RED : e.impact === 'Medium' || e.impact === 'MEDIUM' ? GOLD : MINT;
      var bars = e.impact === 'High' || e.impact === 'HIGH' ? 3 : e.impact === 'Medium' || e.impact === 'MEDIUM' ? 2 : 1;
      var timeStr = e.date ? new Date(e.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--';
      var impBars = '';
      for (var j = 0; j < 3; j++) { impBars += '<span style="width:12px;height:3px;border-radius:99px;background:' + (j < bars ? impactColor : 'rgba(255,255,255,0.05)') + '"></span>'; }
      eventsHtml += '<div class="card" style="padding:10px 16px;animation-delay:' + (i * 0.03) + 's">' +
        '<div style="font-size:9.5px;font-weight:600;color:' + impactColor + ';letter-spacing:0.2px">' + '🔴'.repeat(Math.min(3, bars)) + ' ' + (e.impact || 'N/A') + ' · ' + timeStr + '</div>' +
        '<div style="font-size:13px;font-weight:700;margin-top:3px;line-height:1.3">' + (e.title || e.country || '') + '</div>' +
        (e.desc ? '<div style="font-size:11px;color:' + TEXT2 + ';margin-top:3px;line-height:1.4">' + e.desc + '</div>' : '') +
        '<div style="display:flex;gap:3px;margin-top:5px">' + impBars + '</div></div>';
    }
  } else {
    eventsHtml = '<div class="card" style="text-align:center;padding:30px;color:' + GREY + ';font-size:12px">No upcoming events loaded.</div>';
  }
  return '<div class="section-h">Calendar</div>' +
    '<div style="display:flex;gap:6px;overflow-x:auto;padding-bottom:4px;margin-bottom:14px;scrollbar-width:none">' + dateStrip + '</div>' +
    eventsHtml +
    '<div class="card" style="margin-top:4px;animation-delay:0.1s">' +
    '<div style="font-size:13px;font-weight:700;margin-bottom:8px">This Week</div>' +
    '<div style="display:flex;justify-content:space-between;padding:8px 0"><span style="font-size:12px;font-weight:600">High Impact</span><span style="font-size:12px;font-weight:700;color:' + RED + '">' + high.length + '</span></div>' +
    '<div style="display:flex;justify-content:space-between;padding:8px 0;border-top:0.5px solid rgba(255,255,255,0.03)"><span style="font-size:12px;font-weight:600">Medium Impact</span><span style="font-size:12px;font-weight:700;color:' + GOLD + '">' + med.length + '</span></div>' +
    '<div style="display:flex;justify-content:space-between;padding:8px 0;border-top:0.5px solid rgba(255,255,255,0.03)"><span style="font-size:12px;font-weight:600">Low Impact</span><span style="font-size:12px;font-weight:700;color:' + GREY + '">' + low.length + '</span></div></div>';
}

// ===== RENDER: SETTINGS SCREEN =====
function settingsScreen() {
  var s = state.settings || {};
  var prefs = state.notifPrefs || {};
  var notifItems = [
    ['Signal Alerts', 'signalAlerts', 'New ELITE/STRONG signals'],
    ['Trade Updates', 'tradeUpdates', 'TP1, BE, trail, SL hits'],
    ['Weekly Summary', 'weeklySummary', 'Sunday performance report'],
    ['News Alerts', 'newsAlerts', 'High-impact events'],
    ['Market Pulse', 'marketPulse', 'Daily market overview'],
  ];
  var notifToggles = '';
  for (var i = 0; i < notifItems.length; i++) {
    var key = notifItems[i][1];
    var enabled = prefs[key] !== false;
    notifToggles += '<div class="setting-row"><div><div class="label">' + notifItems[i][0] + '</div><div class="hint">' + notifItems[i][2] + '</div></div>' +
      '<div class="toggle ' + (enabled ? 'on' : '') + '" onclick="toggleNotifPref(\'' + key + '\', ' + (!enabled) + ')"></div></div>';
  }
  return '<div class="section-h">Settings</div>' +
    '<div class="card" style="display:flex;align-items:center;gap:14px;padding:14px 16px;animation-delay:0s">' +
    '<div style="width:44px;height:44px;border-radius:99px;background:' + MINT_DIM + ';display:flex;align-items:center;justify-content:center;font-size:18px;font-weight:800;color:' + MINT + ';flex-shrink:0">S</div>' +
    '<div style="flex:1"><div style="font-size:14px;font-weight:700">Slayers Member</div><div style="font-size:11px;color:' + GREY + ';margin-top:1px">Code: ' + getCode().slice(0, 8) + '...</div></div>' +
    '<span style="font-size:18px;color:' + GREY + '">›</span></div>' +
    '<div style="font-size:11px;font-weight:700;color:' + TEXT2 + ';padding:6px 4px 4px;letter-spacing:0.5px;text-transform:uppercase">Notifications</div>' +
    '<div class="card" style="padding:4px 16px;animation-delay:0.05s">' +
    '<div class="setting-row"><div><div class="label">Push Notifications</div><div class="hint">Receive alerts on your phone</div></div>' +
    '<div class="toggle ' + (pushStatus === 'subscribed' ? 'on' : '') + '" onclick="' + (pushStatus === 'subscribed' ? 'alert(\'To disable, go to iPhone Settings → Notifications → Slayers.\')' : 'enablePush()') + '"></div></div>' +
    '<div class="setting-row"><div><div class="label">Sound Alerts</div><div class="hint">Play sound on new signals</div></div>' +
    '<div class="toggle on" onclick="this.classList.toggle(\'on\')"></div></div>' +
    notifToggles + '</div>' +
    '<div style="font-size:11px;font-weight:700;color:' + TEXT2 + ';padding:6px 4px 4px;letter-spacing:0.5px;text-transform:uppercase">About</div>' +
    '<div class="card" style="padding:4px 16px;animation-delay:0.1s">' +
    '<div class="setting-row" style="border-bottom:none"><div><div class="label">Version</div><div class="hint">Build ' + new Date().toISOString().slice(0, 10) + '</div></div>' +
    '<span style="font-size:13px;font-weight:600;color:' + GREY + '">v10.0</span></div></div>' +
    '<div class="card" style="padding:4px 16px;animation-delay:0.15s">' +
    '<div class="setting-row" style="border-bottom:none"><div><div class="label">Clear Local Data</div><div class="hint">Reset app cache</div></div>' +
    '<span onclick="localStorage.clear();location.reload()" style="font-size:12px;font-weight:600;color:' + RED + ';cursor:pointer">Clear</span></div></div>' +
    '<div style="text-align:center;padding:16px 0 8px;font-size:10px;color:' + MUTED + '">Made with intent · Slayers Trading</div>';
}

async function toggleNotifPref(key, newVal) {
  var prefs = Object.assign({}, state.notifPrefs);
  prefs[key] = newVal;
  state.notifPrefs = prefs;
  render();
  try {
    await fetch(withCode('/api/member/notif-prefs'), {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ notifPrefs: prefs })
    });
  } catch (e) { console.error('Notif save failed', e); }
}

function emptyState(text) {
  return '<div style="text-align:center;padding:40px 20px;color:' + GREY + ';font-size:13px">' + text + '</div>';
}

// ===== ACTIVE TRADE WIDGET =====
function activeTradeWidget(t) {
  var isB = t.type === 'BULLISH';
  var p = t.dec || 5;
  var progress = t.tp1 ? Math.min(100, Math.max(0, ((isB ? t.qmLevel - (t.tp1) : (t.tp1) - t.qmLevel) / (isB ? t.qmLevel - (t.tp1 || t.sl) : (t.tp1 || t.sl) - t.qmLevel)) * 100)) : 0;
  var badges = '';
  if (t.tp1Fired) badges += '<span style="font-size:8px;font-weight:600;padding:2px 8px;border-radius:99px;background:' + MINT_DIM + ';color:' + MINT + '">TP1 ✓</span>';
  if (t.beFired) badges += '<span style="font-size:8px;font-weight:600;padding:2px 8px;border-radius:99px;background:' + RED_DIM + ';color:' + RED + '">BE ✓</span>';
  if (t.trailActive) badges += '<span style="font-size:8px;font-weight:600;padding:2px 8px;border-radius:99px;background:' + GOLD_DIM + ';color:' + GOLD + '">Trailing</span>';
  var duration = '';
  if (t.openTime) {
    var ms = Date.now() - t.openTime;
    duration = Math.floor(ms / 3600000) + 'h ' + Math.floor((ms % 3600000) / 60000) + 'm';
  }
  var rVal = ((t.tp1 ? Math.abs(t.tp1 - t.qmLevel) : 0) / Math.abs(t.qmLevel - t.sl)).toFixed(1) || '0.0';
  return '<div class="card-glass" style="animation-delay:0s">' +
    '<div style="display:flex;align-items:center;gap:10px;margin-bottom:14px">' +
    '<span class="live-dot"></span>' +
    '<span style="font-weight:800;font-size:18px;letter-spacing:-0.3px">' + (t.instName || t.instId) + '</span>' +
    '<span style="font-size:10px;color:' + GREY + ';font-weight:500">' + t.tf + '</span>' +
    '<span style="margin-left:auto;font-size:9px;font-weight:600;padding:3px 10px;border-radius:99px;background:' + (isB ? MINT_DIM : RED_DIM) + ';color:' + (isB ? MINT : RED) + ';border:0.5px solid ' + (isB ? MINT : RED) + '33;text-transform:uppercase">' + (isB ? 'BUY' : 'SELL') + '</span></div>' +
    '<div style="display:flex;justify-content:space-between;margin-bottom:4px">' +
    '<div><div style="font-size:10px;color:' + GREY + '">Entry</div><div style="font-size:14px;font-weight:800;letter-spacing:-0.3px">' + fmt(t.qmLevel) + '</div></div>' +
    '<div style="text-align:center"><div style="font-size:10px;color:' + GREY + '">Now</div><div style="font-size:14px;font-weight:800;color:' + MINT + ';letter-spacing:-0.3px">' + fmt(t.tp1 || t.sl) + '</div></div>' +
    '<div style="text-align:right"><div style="font-size:10px;color:' + GREY + '">TP1</div><div style="font-size:14px;font-weight:800;color:' + GOLD + ';letter-spacing:-0.3px">' + (t.tp1 ? fmt(t.tp1) : '--') + '</div></div></div>' +
    '<div class="progress-track" style="margin-top:8px"><div class="progress-fill" style="width:' + progress + '%;background:linear-gradient(90deg,' + MINT + ',' + GOLD + ')"></div></div>' +
    '<div style="display:flex;justify-content:space-between;margin-top:10px;align-items:center">' +
    '<div style="display:flex;gap:6px">' + badges + '</div>' +
    '<div style="display:flex;align-items:center;gap:8px">' +
    '<span style="font-size:13px;font-weight:800;color:' + MINT + '">+' + rVal + 'R</span>' +
    '<span style="font-size:10px;color:' + GREY + '">' + duration + '</span></div></div></div>';
}

// ===== MAIN RENDER =====
function render() {
  var app = document.getElementById('app');
  if (state.selected) {
    app.innerHTML = detailPage(state.selected);
    return;
  }
  var tabLabels = { overview: 'Overview', journal: 'Journal', calendar: 'Calendar', settings: 'Settings' };
  var tabsArr = ['overview', 'journal', 'calendar', 'settings'];
  var tabBtns = '';
  for (var i = 0; i < tabsArr.length; i++) {
    var t = tabsArr[i];
    var active = state.tab === t;
    var color = active ? MINT : MUTED;
    var iconKey = t === 'overview' ? 'grid' : t === 'journal' ? 'book' : t === 'calendar' ? 'cal' : 'gear';
    tabBtns += '<button class="tab-btn' + (active ? ' active' : '') + '" data-tab="' + t + '" style="color:' + color + '">' +
      '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">' + ICONS[iconKey] + '</svg>' +
      '<span>' + tabLabels[t] + '</span></button>';
  }
  var skeletonHtml = state.loading ? '<div style="padding:40px 0"><div class="skeleton" style="height:200px;margin-bottom:14px"></div><div class="skeleton" style="height:200px"></div></div>' : '';
  app.innerHTML = '<div style="display:flex;flex-direction:column;height:100dvh;background:' + BLACK + ';color:' + WHITE + ';position:relative">' +
    '<div style="flex:1;overflow-y:auto;padding:0 16px 10px;background:' + BLACK + ';color:' + WHITE + '" id="content">' + skeletonHtml + '</div>' +
    '<div id="tabbar" style="flex-shrink:0;display:flex;position:relative;border-top:0.5px solid rgba(255,255,255,0.04);background:rgba(10,14,18,0.88);backdrop-filter:blur(32px) saturate(1.4);-webkit-backdrop-filter:blur(32px) saturate(1.4);padding:6px 0 calc(6px + env(safe-area-inset-bottom,0px));z-index:10">' +
    '<div class="nav-indicator" style="position:absolute;top:-0.5px;height:2px;border-radius:99px;background:' + MINT + ';transition:left 0.35s cubic-bezier(0.34,1.56,0.64,1),width 0.35s cubic-bezier(0.34,1.56,0.64,1);box-shadow:0 0 20px ' + MINT + '33"></div>' +
    tabBtns + '</div>' +
    '<div id="embers" style="position:fixed;top:0;left:0;width:100%;height:100dvh;pointer-events:none;z-index:999;overflow:hidden"></div></div>';

  var idx = tabsArr.indexOf(state.tab);
  var indicator = document.querySelector('.nav-indicator');
  if (indicator) { indicator.style.left = (idx * 25 + 12.5) + '%'; indicator.style.width = '25%'; }

  if (!state.loading) {
    var content = document.getElementById('content');
    if (state.tab === 'overview') {
      content.innerHTML = overviewScreen();
    } else if (state.tab === 'journal') {
      content.innerHTML = journalScreen();
    } else if (state.tab === 'calendar') {
      content.innerHTML = calendarScreen();
    } else if (state.tab === 'settings') {
      content.innerHTML = settingsScreen();
    }
  }
  spawnEmbers();
}

function overviewScreen() {
  var trackedIds = {};
  for (var i = 0; i < state.signals.length; i++) {
    if (state.signals[i].isTracked) { trackedIds[state.signals[i].id] = true; }
  }
  var myActive = [];
  for (var i = 0; i < state.active.length; i++) {
    if (trackedIds[state.active[i].sigId]) { myActive.push(state.active[i]); }
  }
  var activeSigIds = {};
  for (var i = 0; i < state.active.length; i++) { activeSigIds[state.active[i].sigId] = true; }
  var tradesHtml = '';
  for (var i = 0; i < myActive.length; i++) { tradesHtml += activeTradeWidget(myActive[i]); }
  var signalsHtml = '';
  var signalCount = 0;
  if (state.signals.length) {
    for (var i = 0; i < state.signals.length; i++) {
      var s = state.signals[i];
      if (s.isTracked && !activeSigIds[s.id]) continue;
      signalCount++;
      signalsHtml += signalCard(s);
    }
    if (signalCount) signalsHtml = '<div class="section-h">Recent Signals</div>' + signalsHtml;
  }
  var emptyHtml = '';
  if (!myActive.length && !signalCount) {
    emptyHtml = emptyState(state.fetchError ? 'Connection problem: ' + state.fetchError : 'No signals yet. Waiting for the next scan...');
  }
  return tradesHtml +
    '<div class="section-h">Market Pulse</div>' + marketPulseRow() +
    statsOverview() + signalsHtml + emptyHtml;
}

function marketPulseRow() {
  var pairs = state.confluence.length ? state.confluence : [];
  var chips = '';
  var maxChips = Math.min(pairs.length, 11);
  for (var i = 0; i < maxChips; i++) {
    var p = pairs[i];
    var c = p.signalDir === 'BULLISH' ? MINT : p.signalDir === 'BEARISH' ? RED : TEXT2;
    var bg = p.signalDir !== 'NONE' ? (p.signalDir === 'BULLISH' ? MINT_DIM : RED_DIM) : 'rgba(255,255,255,0.02)';
    chips += '<span style="display:inline-flex;align-items:center;gap:5px;padding:6px 14px;border-radius:99px;border:0.5px solid ' + c + '44;background:' + bg + ';color:' + c + ';font-size:12px;font-weight:600;cursor:pointer;white-space:nowrap;transition:all 0.2s" onclick="setTab(\'journal\');state.journalFilter=\'all\';render()">' +
      '<span style="width:5px;height:5px;border-radius:99px;background:' + c + '"></span>' + (p.name || p.id) + '</span>';
  }
  return '<div style="display:flex;gap:8px;overflow-x:auto;padding-bottom:4px;margin-bottom:6px;scrollbar-width:none">' + (chips || '<span style="color:' + GREY + ';font-size:12px">No market data yet</span>') + '</div>';
}

// ===== FLOATING EMBERS =====
function spawnEmbers() {
  var container = document.getElementById('embers');
  if (!container || container.children.length > 0) return;
  for (var i = 0; i < 10; i++) {
    var e = document.createElement('div');
    e.className = 'ember';
    e.style.left = Math.random() * 100 + '%';
    e.style.bottom = '-10px';
    e.style.animationDuration = (12 + Math.random() * 10) + 's';
    e.style.animationDelay = (Math.random() * 14) + 's';
    container.appendChild(e);
  }
}

// ===== ACTIONS (globally accessible for onclick handlers) =====
window.setTab = function(t) { state.tab = t; state.selected = null; render(); };
window.setFilter = function(key, value) { state.filter[key] = value; render(); };
window.openDetail = function(id) { state.selected = state.signals.find(function(s) { return s.id === id; }); render(); window.scrollTo(0, 0); };
window.enablePush = enablePush;
window.closeDetail = function() { state.selected = null; render(); };
window.toggleNotif = toggleNotifPref;
window.toggleNotifPref = toggleNotifPref;
window.toggleEntryForm = toggleEntryForm;
window.saveJournalEntry = saveJournalEntry;
window.toggleTag = toggleTag;

// Tab bar click handler (delegated — works with dynamically rendered tabs)
document.addEventListener('click', function(e) {
  var btn = e.target.closest('.tab-btn');
  if (btn) {
    state.tab = btn.dataset.tab;
    state.selected = null;
    render();
  }
});

window.toggleTrack = async function(signalId, currentlyTracking) {
  try {
    if (currentlyTracking) {
      await fetch(withCode('/api/track/' + encodeURIComponent(signalId)), { method: 'DELETE' });
    } else {
      await fetch(withCode('/api/track'), {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ signalId: signalId })
      });
    }
    var sig = null;
    for (var i = 0; i < state.signals.length; i++) {
      if (state.signals[i].id === signalId) { sig = state.signals[i]; break; }
    }
    if (sig) sig.isTracked = !currentlyTracking;
    if (state.selected && state.selected.id === signalId) state.selected.isTracked = !currentlyTracking;
    render();
  } catch (e) { console.error('Track toggle failed', e); }
};

// ===== LOGIN SCREEN =====
function renderLogin(errorMsg) {
  var app = document.getElementById('app');
  app.innerHTML = '<div style="min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:calc(24px + env(safe-area-inset-top)) 24px calc(24px + env(safe-area-inset-bottom));text-align:center;background:' + BLACK + ';color:' + WHITE + '">' +
    '<div style="font-weight:900;font-size:30px;letter-spacing:-1px;text-transform:uppercase;margin-bottom:6px">' +
    '<span style="color:' + WHITE + '">THE </span><span style="color:' + MINT + ';text-shadow:0 0 30px ' + MINT + '55">SLAYERS</span></div>' +
    '<div style="color:' + GREY + ';font-size:12px;margin-bottom:32px">v10.0</div>' +
    '<div class="card" style="width:100%;max-width:300px;padding:24px;border-color:' + MINT + '1A">' +
    '<div style="font-size:14px;font-weight:700;margin-bottom:10px">Enter your access code</div>' +
    '<input id="codeInput" type="text" placeholder="SLAY-XXXXXX" autocapitalize="characters" autocomplete="off" style="width:100%;background:rgba(0,0,0,0.35);border:0.5px solid ' + BORDER + ';border-radius:12px;padding:14px;color:' + WHITE + ';font-size:16px;text-align:center;letter-spacing:2px;margin-bottom:14px;outline:none" class="mono"/>' +
    (errorMsg ? '<div style="color:' + RED + ';font-size:12.5px;margin-bottom:14px">' + errorMsg + '</div>' : '') +
    '<button id="loginBtn" style="width:100%;background:' + MINT + ';border:none;border-radius:99px;padding:15px 0;color:' + BLACK + ';font-weight:800;font-size:14px;cursor:pointer">Unlock</button>' +
    '<div id="loginStatus" style="color:' + GREY + ';font-size:11.5px;margin-top:14px"></div></div>' +
    '<div style="color:' + GREY + ';font-size:11px;margin-top:40px">Don\'t have a code? Message Rexroz on Telegram.</div></div>' +
    '<div id="embers" style="position:fixed;top:0;left:0;width:100%;height:100dvh;pointer-events:none;z-index:999;overflow:hidden"></div>';
  document.getElementById('loginBtn').onclick = attemptLogin;
  document.getElementById('codeInput').addEventListener('keypress', function(e) { if (e.key === 'Enter') attemptLogin(); });
  spawnEmbers();
}

async function attemptLogin() {
  var input = document.getElementById('codeInput');
  var status = document.getElementById('loginStatus');
  var code = input.value.trim().toUpperCase();
  if (!code) return;
  status.textContent = 'Checking...';
  saveCode(code);
  try {
    var res = await fetch(withCode('/api/member/stats'));
    if (res.status === 401) {
      clearCode();
      renderLogin('Invalid or expired access code. Check and try again.');
      return;
    }
    state.loading = true;
    state = Object.assign(state, {
      signals: [], active: [], confluence: [], stats: null, myStats: null,
      journal: [], news: [], settings: null, notifPrefs: {}, botHistory: [],
      loading: true
    });
    fetchAll();
  } catch (e) {
    clearCode();
    renderLogin('Connection error. Try again.');
  }
}

// ===== BOOT =====
if (getCode()) {
  fetchAll();
} else {
  renderLogin();
}
setInterval(function() { if (getCode()) fetchAll(); }, 60000);

// ===== SERVICE WORKER + PUSH =====
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/app/service-worker.js')
    .then(function(reg) { swRegistration = reg; if (getCode()) checkPushStatus(); })
    .catch(function(e) { console.error('SW failed', e); });
}

let swRegistration = null;
let pushStatus = 'unknown';

async function checkPushStatus() {
  if (!getCode()) return;
  try {
    if (!('PushManager' in window) || !swRegistration) { pushStatus = 'unsupported'; render(); return; }
    var sub = await swRegistration.pushManager.getSubscription();
    pushStatus = sub ? 'subscribed' : 'unsupported';
    render();
  } catch (e) { console.error('checkPushStatus failed', e); pushStatus = 'unsupported'; }
}

async function enablePush() {
  if (!swRegistration || !getCode()) return;
  try {
    var keyRes = await fetch(withCode('/api/vapid-key'));
    var keyData = await keyRes.json();
    if (!keyData.enabled || !keyData.key) { alert('Push notifications are not configured on the server yet.'); return; }
    var perm = await Notification.requestPermission();
    if (perm !== 'granted') { pushStatus = 'denied'; render(); return; }
    var sub = await swRegistration.pushManager.subscribe({
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
    alert('Could not enable notifications: ' + (e.message || 'unknown error'));
  }
}

function urlBase64ToUint8Array(base64String) {
  var padding = '='.repeat((4 - base64String.length % 4) % 4);
  var base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  var rawData = atob(base64);
  return Uint8Array.from([...rawData].map(function(c) { return c.charCodeAt(0); }));
}
