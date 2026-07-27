// Slayers — Admin Control Center
(()=>{
'use strict';

// ===== ICONS =====
const I = {
  dashboard:'<svg viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>',
  trades:'<svg viewBox="0 0 24 24"><path d="M4 20V8M8 20V4M12 20V12M16 20V6M20 20V10"/><circle cx="8" cy="4" r="1.5" fill="currentColor" stroke="none"/><circle cx="16" cy="6" r="1.5" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none"/><circle cx="20" cy="10" r="1.5" fill="currentColor" stroke="none"/></svg>',
  scalp:'<svg viewBox="0 0 24 24"><polygon points="13,2 4,14 11,14 10,22 20,10 13,10" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/></svg>',
  logs:'<svg viewBox="0 0 24 24"><line x1="8" y1="6" x2="16" y2="6"/><line x1="8" y1="10" x2="16" y2="10"/><line x1="8" y1="14" x2="16" y2="14"/><line x1="8" y1="18" x2="12" y2="18"/><path d="M3 3h18v18H3z"/></svg>',
  members:'<svg viewBox="0 0 24 24"><circle cx="9" cy="8" r="3"/><path d="M3 21c0-3.3 2.7-6 6-6s6 2.7 6 6"/><circle cx="17" cy="8" r="2"/><path d="M21 21c0-2.5-1.8-4.6-4.2-5.3"/></svg>',
  users:'<svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="3"/><path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8"/></svg>',
  chart:'<svg viewBox="0 0 24 24"><path d="M3 17l4-4 4 4 5-5"/><path d="M18 10h3v7"/></svg>',
  scan:'<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="7"/><path d="M12 8v4l2.5 2.5"/></svg>',
  activity:'<svg viewBox="0 0 24 24"><path d="M22 12h-4l-3 9-4-18-3 9H2"/></svg>',
  signal:'<svg viewBox="0 0 24 24"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>',
  settings:'<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>',
  bell:'<svg viewBox="0 0 24 24"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>',
  close:'<svg viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>',
  check:'<svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>',
  refresh:'<svg viewBox="0 0 24 24"><path d="M23 4v6h-6"/><path d="M1 20v-6h6"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>',
  bolt:'<svg viewBox="0 0 24 24"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10"/></svg>',
  brain:'<svg viewBox="0 0 24 24"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="22"/></svg>',
  send:'<svg viewBox="0 0 24 24"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>',
  report:'<svg viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>',
  list:'<svg viewBox="0 0 24 24"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>',
  arrowUp:'<svg viewBox="0 0 24 24"><polyline points="18 15 12 9 6 15"/></svg>',
  arrowDown:'<svg viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9"/></svg>',
  trendingUp:'<svg viewBox="0 0 24 24"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>',
  dollar:'<svg viewBox="0 0 24 24"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>',
  creditCard:'<svg viewBox="0 0 24 24"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>',
};

// ===== UTILITIES =====
function getPw(){return sessionStorage.getItem('slayersPw')||''}
function savePw(p){sessionStorage.setItem('slayersPw',p)}
function route(){return window.location.hash.slice(1)||'dashboard'}
function fmtTime(ts){if(!ts)return'—';const d=new Date(ts);return d.toLocaleDateString('en-GB',{day:'2-digit',month:'2-digit'})+' '+d.toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit'})}
function fmtTimeShort(ts){if(!ts)return'';const d=new Date(ts);return d.toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit'})}
function fmtN(n,dec){if(n==null||!isFinite(n))return'—';return n.toFixed(dec||2)}
function fmtR(r,dec){if(r==null||!isFinite(r))return'—';return(r>=0?'+':'')+r.toFixed(dec||2)+'R'}
function fmtDur(min){if(min==null)return'—';if(min<60)return min+'m';const h=Math.floor(min/60),m=min%60;return h+'h '+m+'m'}
function genSparkline(vals,color='#B8FF2C'){
  if(!vals||vals.length<2)return'';
  const w=80,h=24,p=1;
  const mn=Math.min(...vals),mx=Math.max(...vals),rng=mx-mn||1;
  const pts=vals.map((v,i)=>({x:p+i*(w-2*p)/(vals.length-1),y:h-p-((v-mn)/rng)*(h-2*p)}));
  const d=pts.map((p,i)=>i===0?'M'+p.x.toFixed(1)+','+p.y.toFixed(1):'L'+p.x.toFixed(1)+','+p.y.toFixed(1)).join('');
  return`<svg viewBox="0 0 ${w} ${h}"><path d="${d}" fill="none" stroke="${color}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
}
function genChartLine(equity){
  if(!equity||equity.length<2)return'';
  const w=600,h=150,p=8;
  const vals=equity.map(e=>e.r);
  const mn=Math.min(...vals),mx=Math.max(...vals),rng=mx-mn||1;
  const pts=equity.map((e,i)=>({x:p+i*(w-2*p)/(equity.length-1),y:h-p-((e.r-mn)/rng)*(h-2*p)}));
  const d=pts.map((p,i)=>i===0?'M'+p.x.toFixed(1)+','+p.y.toFixed(1):'L'+p.x.toFixed(1)+','+p.y.toFixed(1)).join('');
  const area=d+'L'+pts[pts.length-1].x.toFixed(1)+','+(h-p)+'L'+pts[0].x.toFixed(1)+','+(h-p)+'Z';
  return`<svg viewBox="0 0 ${w} ${h}">
    <defs><linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#B8FF2C" stop-opacity=".3"/><stop offset="100%" stop-color="#B8FF2C" stop-opacity="0"/></linearGradient></defs>
    ${equity.map((e,i)=>{const x=p+i*(w-2*p)/(equity.length-1);return'<line class="chart-grid-line" x1="'+x.toFixed(1)+'" y1="0" x2="'+x.toFixed(1)+'" y2="'+h+'"/>'}).filter((_,i)=>i%Math.max(1,Math.floor(equity.length/6))===0).join('')}
    <path class="chart-area" d="${area}"/>
    <path class="chart-path" d="${d}"/>
  </svg>`;
}
function countUp(el,target,duration=800){
  const start=parseFloat(el.textContent)||0,startTime=Date.now();
  const step=()=>{const p=Math.min((Date.now()-startTime)/duration,1),v=start+(target-start)*p;el.textContent=Math.round(v);if(p<1)requestAnimationFrame(step)};
  requestAnimationFrame(step);
}

// ===== API CLIENT =====
async function api(path,opts){
  try{
    const r=await fetch(path,{...opts,headers:{'Content-Type':'application/json','X-Admin-Password':getPw(),...((opts&&opts.headers)||{})}});
    if(r.status===401){sessionStorage.removeItem('slayersPw');renderLogin();return null}
    return r.json();
  }catch(e){return null}
}

// ===== TOAST =====
const toasts=[];let tc=null;
function toast(msg,type){
  const c=tc||(tc=()=>{const e=document.createElement('div');e.className='toast-container';document.body.appendChild(e);return e})();
  const el=document.createElement('div');el.className='toast '+type;el.innerHTML='<span>'+msg+'</span>';
  c.appendChild(el);setTimeout(()=>{el.style.opacity='0';el.style.transition='opacity .3s';setTimeout(()=>el.remove(),300)},3000)
}

// ===== DIALOG =====
function confirmDlg(title,msg){return new Promise(r=>{
  const o=document.createElement('div');o.className='modal-overlay';
  o.innerHTML=`<div class="modal"><h3>${title}</h3><p>${msg}</p><div class="modal-actions"><button class="btn-secondary" id="dc">Cancel</button><button class="btn-danger" id="df">Confirm</button></div></div>`;
  document.body.appendChild(o);
  o.querySelector('#dc').onclick=()=>{o.remove();r(0)};
  o.querySelector('#df').onclick=()=>{o.remove();r(1)};
  o.onclick=e=>{if(e.target===o){o.remove();r(0)}}
})}
function promptDlg(title,msg,placeholder){return new Promise(r=>{
  const o=document.createElement('div');o.className='modal-overlay';
  o.innerHTML=`<div class="modal"><h3>${title}</h3><p>${msg}</p><input id="di" type="text" placeholder="${placeholder||''}" style="margin-bottom:12px"/><div class="modal-actions"><button class="btn-secondary" id="dc">Cancel</button><button class="btn-primary" id="df">Apply</button></div></div>`;
  document.body.appendChild(o);const i=o.querySelector('#di');
  o.querySelector('#dc').onclick=()=>{o.remove();r(null)};
  o.querySelector('#df').onclick=()=>{o.remove();r(i.value)};
  o.onclick=e=>{if(e.target===o){o.remove();r(null)}};setTimeout(()=>i.focus(),100)
})}

// ===== RENDER LOGIN =====
function renderLogin(){
  document.getElementById('app').innerHTML=`
  <div class="login-page">
    <div class="login-box">
      <div class="login-logo"><div class="main">SLAYERS<span>.</span></div><div class="sub">Admin Control Center</div></div>
      <div class="card" style="padding:20px">
        <label style="font-size:12px;color:var(--text3);margin-bottom:8px;display:block;font-weight:600">Admin Password</label>
        <input id="pli" type="password" style="margin-bottom:16px" placeholder="Enter password"/>
        <button id="plb" class="btn-primary" style="width:100%;padding:12px;font-size:14px">Access Console</button>
      </div>
    </div>
  </div>`;
  document.getElementById('plb').onclick=async()=>{
    savePw(document.getElementById('pli').value);
    const d=await api('/api/admin/dashboard');
    if(d)initApp();else{savePw('');renderLogin()}
  };
  document.getElementById('pli').addEventListener('keypress',e=>{if(e.key==='Enter')document.getElementById('plb').click()});
  document.getElementById('pli').focus()
}

// ===== APP SHELL =====
function renderShell(content,title='Dashboard'){
  const cur=route();
  const nav=[
    {id:'dashboard',icon:I.dashboard,label:'Dashboard'},
    {id:'trades',icon:I.trades,label:'Trade Management'},
    {id:'scalp',icon:I.scalp,label:'Scalp Trades'},
    {id:'logs',icon:I.logs,label:'System Logs'},
    {id:'members',icon:I.members,label:'Users'},
    {id:'subscribers',icon:I.creditCard,label:'Subscribers'}
  ];
  const g1=nav.slice(0,3),g2=nav.slice(3);
  document.getElementById('app').innerHTML=`
  <div class="sidebar">
    <div class="sidebar-brand"><div class="logo">SLAYERS<span>.</span></div><div class="tagline">Admin Control Center</div></div>
    <div class="sidebar-nav">
      <div class="sidebar-group"><div class="group-label">Main</div>${g1.map(t=>`<button class="sidebar-item ${cur===t.id?'active':''}" onclick="S.nav('${t.id}')"><span class="icon">${t.icon}</span>${t.label}</button>`).join('')}</div>
      <div class="sidebar-group"><div class="group-label">System</div>${g2.map(t=>`<button class="sidebar-item ${cur===t.id?'active':''}" onclick="S.nav('${t.id}')"><span class="icon">${t.icon}</span>${t.label}</button>`).join('')}</div>
    </div>
    <div class="sidebar-footer"><div class="bot-status" id="botStatus"><div class="ring"><svg width="32" height="32"><circle class="track" cx="16" cy="16" r="14"/></svg><div class="dot"></div></div><div class="info"><div class="name">Engine Online</div><div class="uptime" id="botUptime">—</div></div></div></div>
  </div>
  <div class="main">
    <div class="topbar">
      <div class="topbar-left"><button class="mobile-menu-btn" onclick="document.querySelector('.sidebar').classList.toggle('open')">☰</button><h2>${title}</h2></div>
      <div class="topbar-right">
        <div class="status-indicator"><span class="dot"></span>All Systems Running</div>
        <div class="topbar-profile"><div class="avatar">A</div><div class="name">Admin</div><div class="role">Super Admin</div></div>
      </div>
    </div>
    <div class="content">${content}<div id="pageContent"></div></div>
  </div>
  <div class="sidebar-overlay" onclick="document.querySelector('.sidebar').classList.remove('open')"></div>`;
}

// ===== DASHBOARD =====
async function renderDashboard(){
  renderShell('','Dashboard');
  const cont=document.getElementById('pageContent');
  cont.innerHTML='<div class="empty-state">Loading control center...</div>';
  const data=await api('/api/admin/dashboard');
  if(!data)return;
  const perf=await api('/api/admin/performance?period=week');
  const top=await api('/api/admin/top-markets');
  const ai=await api('/api/admin/ai-summary');
  const svc=await api('/api/admin/services');
  renderDashboardContent(data,perf,top,ai,svc);
}

async function renderDashboardContent(data,perf,top,ai,svc){
  if(!data)return;
  const cont=document.getElementById('pageContent');
  if(!cont)return;

  const up=data.uptime,hrs=Math.floor(up/3600),mins=Math.floor((up%3600)/60);
  const wr=data.todayTrades?(data.todayWins+data.todayLosses)?Math.round(data.todayWins/(data.todayWins+data.todayLosses)*100):0:0;

  // Update sidebar bot status
  const bu=document.getElementById('botUptime');
  if(bu)bu.textContent=hrs+'h '+mins+'m uptime';

  // Signals for sparkline
  const signalHistory=perf&&perf.equity?perf.equity.slice(-8).map(e=>e.r+5):[5,6,5,7,6,8,7,9];

  // Activity feed: combine recent alerts + notifications
  const activity=[];
  if(data.alertLog)data.alertLog.forEach(a=>{activity.push({time:a.time,text:a.id+' '+a.dir+' ['+(a.score||'?')+'/4]',type:a.dir==='BULLISH'?'running':'offline'})});
  if(data.recentNotifications)data.recentNotifications.forEach(n=>{activity.push({time:n.time,text:n.title+(n.body?': '+n.body:''),type:'running'})});

  cont.innerHTML=`
  <div class="kpi-row">
    <div class="kpi-card"><div class="kpi-header"><div class="kpi-icon">${I.users}</div><span class="kpi-badge ${data.activeUsers>0?'badge-green':'badge-neutral'}">${data.activeUsers}</span></div><div class="kpi-value" id="kpi0">${data.totalUsers}</div><div class="kpi-label">Registered Users</div></div>
    <div class="kpi-card"><div class="kpi-header"><div class="kpi-icon">${I.trades}</div><span class="kpi-badge ${data.activeTrades>0?'badge-green':'badge-neutral'}">${data.activeTrades}</span></div><div class="kpi-value" id="kpi1">${data.activeTrades}</div><div class="kpi-label">Active Trades</div></div>
    <div class="kpi-card"><div class="kpi-header"><div class="kpi-icon">${I.signal}</div><span class="kpi-badge ${data.pendingSignals>0?'badge-orange':'badge-neutral'}">${data.pendingSignals}</span></div><div class="kpi-value" id="kpi2">${data.pendingSignals}</div><div class="kpi-label">Pending Signals</div></div>
    <div class="kpi-card"><div class="kpi-header"><div class="kpi-icon">${I.scan}</div><span class="kpi-badge badge-neutral">${data.scanCount}</span></div><div class="kpi-value" id="kpi3">${data.scanCount}</div><div class="kpi-label">Market Scans</div></div>
    <div class="kpi-card"><div class="kpi-header"><div class="kpi-icon">${I.trendingUp}</div><span class="kpi-badge ${wr>=50?'badge-green':'badge-red'}">${wr>0?wr+'%':''}</span></div><div class="kpi-value" id="kpi4">${wr>0?wr+'%':'0%'}</div><div class="kpi-label">Today Win Rate</div></div>
    <div class="kpi-card"><div class="kpi-header"><div class="kpi-icon">${I.dollar}</div><span class="kpi-badge ${data.weeklySummary&&data.weeklySummary.totalR>0?'badge-green':'badge-neutral'}">${data.weeklySummary?data.weeklySummary.totalR+'R':''}</span></div><div class="kpi-value" id="kpi5">${data.weeklySummary?data.weeklySummary.totalR.toFixed(1)+'R':'0R'}</div><div class="kpi-label">Weekly P&L</div></div>
  </div>

  <div class="dash-grid">
    <div class="card">
      <div class="card-header"><h3>System Status</h3></div>
      <div class="card-body" style="padding:0">
        <div class="system-status">
          <div class="system-ring"><svg width="80" height="80"><circle class="track" cx="40" cy="40" r="36"/><circle class="arc" cx="40" cy="40" r="36" stroke-dashoffset="${56.5}" stroke-dasharray="226"/></svg><div class="center"><div class="num">${Object.values(svc||{}).filter(s=>s.status==='running').length}</div><div class="lbl">Services</div></div></div>
          <div class="services-list">${Object.values(svc||{}).map(s=>`<div class="service-item"><span class="s-dot ${s.status}"></span><span class="s-name">${s.label}</span><span class="s-status ${s.status==='running'?'text-green':'text-red'}">${s.status}</span></div>`).join('')}</div>
        </div>
      </div>
    </div>
    <div class="card">
      <div class="card-header"><h3>Market Scanner</h3><span id="scanBtnWrap"><button class="action" id="scanBtn">${I.refresh} Scan Now</button></span></div>
      <div class="card-body" style="padding:0"><div class="scanner-widget">
        <div class="scanner-row"><span class="lbl">Last Scan</span><span class="val">${data.lastScanTime?fmtTime(data.lastScanTime):'Never'}</span></div>
        <div class="scanner-row"><span class="lbl">Session</span><span class="val">${data.session}</span></div>
        <div class="scanner-row"><span class="lbl">Weekend</span><span class="val">${data.isWeekend?'Yes':'No'}</span></div>
        <div class="scanner-row"><span class="lbl">Signals Found</span><span class="val">${data.totalSignals}</span></div>
        <div class="scanner-progress"><div class="bar" style="width:${Math.min(100,data.scanCount%10*10)}%"></div></div>
      </div></div>
    </div>
  </div>

  <div class="dash-grid">
    <div class="card">
      <div class="card-header"><h3>Recent Signals</h3></div>
      <div class="card-body" style="padding:0">
        ${data.alertLog&&data.alertLog.length?`<table class="compact-table"><thead><tr><th>Pair</th><th>Direction</th><th>TF</th><th>Score</th><th>Time</th></tr></thead><tbody>${data.alertLog.slice(0,6).map(a=>`<tr><td style="font-weight:600">${a.id}</td><td class="${a.dir==='BULLISH'?'text-green':'text-red'}">${a.dir}</td><td class="text-muted">${a.tf||'—'}</td><td><span class="badge ${(a.score||0)>=3?'badge-green':'badge-neutral'}">${a.score}/4</span></td><td class="text-muted">${fmtTimeShort(a.time)}</td></tr>`).join('')}</tbody></table>`:'<div class="empty-state">No signals generated yet</div>'}
      </div>
    </div>
    <div class="card">
      <div class="card-header"><h3>AI Market Intelligence</h3><button class="action" id="aiRefreshBtn">${I.refresh} Refresh</button></div>
      <div class="card-body" style="padding:0"><div class="ai-card">
        <div class="ai-summary">${ai&&ai.summary?ai.summary.text||ai.summary.summary||JSON.stringify(ai.summary).slice(0,200):'No analysis yet. Run a scan to generate market intelligence.'}</div>
        <div class="ai-chips">
          <div class="ai-chip"><span class="chip-dot bull"></span>USD Bullish</div>
          <div class="ai-chip"><span class="chip-dot neutral"></span>Gold Neutral</div>
          <div class="ai-chip"><span class="chip-dot bear"></span>Indices Bearish</div>
        </div>
      </div></div>
    </div>
  </div>

  <div class="dash-grid">
    <div class="card">
      <div class="card-header"><h3>System Activity</h3></div>
      <div class="card-body" style="padding:0"><div class="activity-feed">
        ${activity.length?activity.slice(0,8).map(a=>`<div class="activity-item"><span class="a-dot ${a.type}"></span><div class="a-body"><div class="a-title">${a.text}</div></div><div class="a-time">${fmtTimeShort(a.time)}</div></div>`).join(''):'<div class="empty-state">No recent activity</div>'}
      </div></div>
    </div>
    <div class="card">
      <div class="card-header"><h3>Trading Performance</h3><div class="chart-periods"><button class="chart-period" data-p="today">Today</button><button class="chart-period active" data-p="week">Week</button><button class="chart-period" data-p="month">Month</button></div></div>
      <div class="card-body" style="padding:0">
        <div class="chart-container" id="perfChart">${perf&&perf.equity?genChartLine(perf.equity):'<div class="empty-state">No data yet</div>'}</div>
        ${perf&&perf.stats?`<div style="display:flex;gap:16px;padding:0 18px 14px;border-top:1px solid var(--border);padding-top:10px">
          <div><div class="text-sm text-muted">Total</div><div class="mono" style="font-size:15px;font-weight:700">${perf.stats.total}</div></div>
          <div><div class="text-sm text-muted">Win Rate</div><div class="mono" style="font-size:15px;font-weight:700;color:var(--accent)">${perf.stats.winRate}%</div></div>
          <div><div class="text-sm text-muted">Total R</div><div class="mono" style="font-size:15px;font-weight:700;color:${perf.stats.totalR>=0?'var(--green)':'var(--red)'}">${perf.stats.totalR>=0?'+':''}${perf.stats.totalR}R</div></div>
        </div>`:''}
      </div>
    </div>
  </div>

  <div class="dash-grid">
    <div class="card">
      <div class="card-header"><h3>Top Performing Markets</h3></div>
      <div class="card-body" style="padding:0">
        ${top&&top.markets&&top.markets.length?top.markets.slice(0,5).map((m,i)=>`<div class="top-market-row"><div class="pair"><span class="rank">#${i+1}</span>${m.pair}</div><div class="stat"><div class="val ${m.wins>m.losses?'text-green':'text-red'}">${m.total} trades · ${m.total?Math.round(m.wins/(m.wins+m.losses)*100):0}% WR</div><div class="lbl">${m.totalR>=0?'+':''}${(m.totalR||0).toFixed(1)}R</div></div></div>`).join(''):'<div class="empty-state">No trade history yet</div>'}
      </div>
    </div>
    <div class="card">
      <div class="card-header"><h3>Quick Actions</h3></div>
      <div class="card-body" style="padding:0"><div class="quick-grid">
        <button class="quick-btn" onclick="S.triggerScan()">${I.scan}<span>Scan Markets</span></button>
        <button class="quick-btn" onclick="S.refreshAI()">${I.brain}<span>AI Analysis</span></button>
        <button class="quick-btn" onclick="toast('Coming soon','info')">${I.send}<span>Broadcast</span></button>
        <button class="quick-btn" onclick="toast('Coming soon','info')">${I.bell}<span>Push Notify</span></button>
        <button class="quick-btn" onclick="toast('Coming soon','info')">${I.report}<span>Weekly Report</span></button>
        <button class="quick-btn" onclick="S.nav('logs')">${I.list}<span>View Logs</span></button>
      </div></div>
    </div>
  </div>`;

  // Wire up scan button
  const sb=document.getElementById('scanBtn');
  if(sb)sb.onclick=()=>S.triggerScan();
  const ar=document.getElementById('aiRefreshBtn');
  if(ar)ar.onclick=()=>S.refreshAI();

  // Wire up chart period buttons
  document.querySelectorAll('.chart-period').forEach(b=>{
    b.onclick=async()=>{
      document.querySelectorAll('.chart-period').forEach(x=>x.classList.remove('active'));
      b.classList.add('active');
      const p=b.dataset.p;
      const pd=await api('/api/admin/performance?period='+p);
      const cc=document.getElementById('perfChart');
      if(cc&&pd&&pd.equity)cc.innerHTML=genChartLine(pd.equity);
    }
  });
}

// ===== TRADES =====
async function renderTrades(){
  renderShell('','Trade Management');
  const cont=document.getElementById('pageContent');
  cont.innerHTML='<div class="empty-state">Loading active trades...</div>';
  const data=await api('/api/admin/trades');
  if(!data)return;
  if(!data.trades||!data.trades.length){
    cont.innerHTML='<div class="empty-state">No active trades. Market scanner will open trades when conditions align.</div>';
    return
  }
  const updater=setInterval(async()=>{
    const d=await api('/api/admin/trades');
    if(d&&d.trades)updateTradeTable(d.trades);
  },15000);
  window._tradeUpdater=updater;

  cont.innerHTML=`
  <div class="section-header"><h2>Active QMR Trades <span class="text-muted text-sm">(${data.count})</span></h2><div><button class="btn-secondary btn-sm" onclick="S.refresh()">${I.refresh} Refresh</button></div></div>
  <div class="card" style="overflow-x:auto;padding:0" id="tradeTableWrap">
    <table class="compact-table" id="tradeTable">
      <thead><tr><th>Pair</th><th>Type</th><th>Entry</th><th>Current</th><th>SL</th><th>TP1/TP2</th><th>P&L</th><th>Age</th><th>Status</th><th>Actions</th></tr></thead>
      <tbody id="tradeBody"></tbody>
    </table>
  </div>`;
  updateTradeTable(data.trades);
}
function updateTradeTable(trades){
  const tb=document.getElementById('tradeBody');
  if(!tb)return;
  tb.innerHTML=trades.map(t=>{
    const dc=t.type==='BULLISH'?'text-green':'text-red';
    const rc=t.rMultiple>0?'text-green':t.rMultiple<0?'text-red':'text-muted';
    const progress=[t.beFired?'BE✓':'',t.tp1Fired?'TP1✓':'',t.tp2Fired?'TP2✓':''].filter(Boolean).join(' ');
    return `<tr>
      <td style="font-weight:600">${t.instName}</td>
      <td class="${dc}">${t.type==='BULLISH'?'BUY':'SELL'}</td>
      <td class="mono">${fmtN(t.entry,t.dec)}</td>
      <td class="mono ${rc}">${fmtN(t.currentPrice,t.dec)}</td>
      <td class="mono text-muted">${fmtN(t.sl,t.dec)}${t.origSL!==t.sl?'<br><span class="text-muted2 text-xs">was '+fmtN(t.origSL,t.dec)+'</span>':''}</td>
      <td class="mono text-muted">${fmtN(t.tp1,t.dec)} / ${fmtN(t.tp2,t.dec)}</td>
      <td class="mono ${rc}" style="font-weight:700">${fmtR(t.rMultiple,2)}</td>
      <td class="text-muted text-sm">${fmtDur(t.age)}</td>
      <td>${progress?'<span class="badge badge-green">'+progress+'</span>':'<span class="badge badge-neutral">active</span>'}</td>
      <td style="white-space:nowrap">
        <button class="btn-sm btn-primary" onclick="S.closeTrade('${t.sigId}','${t.instName}')" style="margin-right:4px">Close</button>
        ${!t.beFired?`<button class="btn-sm" style="background:var(--orange);color:#000" onclick="S.moveBE('${t.sigId}','${t.instName}')" style="margin-right:4px">BE</button>`:''}
        <button class="btn-sm btn-secondary" onclick="S.moveSL('${t.sigId}','${t.instName}')">SL</button>
      </td>
    </tr>`;
  }).join('');
}

// ===== SCALP =====
async function renderScalp(){
  renderShell('','Scalp Trades');
  const cont=document.getElementById('pageContent');
  cont.innerHTML='<div class="empty-state">Loading scalp trades...</div>';
  const data=await api('/api/admin/scalp-trades');
  if(!data)return;
  if(!data.trades||!data.trades.length){
    cont.innerHTML='<div class="empty-state">No active scalp trades. Scalper runs during London/NY sessions.</div>';
    return
  }
  cont.innerHTML=`
  <div class="section-header"><h2>Active Scalp Trades <span class="text-muted text-sm">(${data.count})</span></h2><div><button class="btn-secondary btn-sm" onclick="S.refresh()">${I.refresh} Refresh</button></div></div>
  <div class="card" style="overflow-x:auto;padding:0">
    <table class="compact-table"><thead><tr><th>Pair</th><th>Type</th><th>Entry</th><th>SL</th><th>TP1</th><th>TP2</th><th>Session</th><th>Score</th><th>Status</th></tr></thead>
    <tbody>${data.trades.map(t=>`<tr>
      <td style="font-weight:600">${t.name||t.pair}</td>
      <td class="${t.type==='BULLISH'?'text-green':'text-red'}">${t.type==='BULLISH'?'BUY':'SELL'}</td>
      <td class="mono">${fmtN(t.entry,5)}</td><td class="mono text-muted">${fmtN(t.sl,5)}</td>
      <td class="mono text-muted">${fmtN(t.tp1,5)}</td><td class="mono text-muted">${fmtN(t.tp2,5)}</td>
      <td class="text-muted text-sm">${t.session||'—'}</td>
      <td><span class="badge ${(t.score||0)>=4?'badge-green':(t.score||0)>=3?'badge-orange':'badge-neutral'}">${t.score}/5</span></td>
      <td>${t.beFired?'<span class="badge badge-green">BE✓</span> ':''}${t.tp1Fired?'<span class="badge badge-green">TP1✓</span> ':''}${t.closed?'<span class="badge badge-neutral">closed</span>':'<span class="badge badge-green">open</span>'}</td>
    </tr>`).join('')}</tbody></table>
  </div>`;
}

// ===== LOGS =====
async function renderLogs(){
  renderShell('','System Logs');
  const cont=document.getElementById('pageContent');
  cont.innerHTML='<div class="empty-state">Loading logs...</div>';
  const data=await api('/api/admin/logs');
  if(!data)return;
  cont.innerHTML=`
  <div class="section-header"><h2>Event Logs</h2><div><button class="btn-secondary btn-sm" onclick="S.refresh()">${I.refresh} Refresh</button></div></div>
  <div class="dash-grid">
    <div class="card"><div class="card-header"><h3>Market Alerts</h3></div><div class="card-body" style="padding:0">
      ${data.alertLog&&data.alertLog.length?data.alertLog.map(a=>`<div class="activity-item"><span class="a-dot ${a.dir==='BULLISH'?'running':a.dir==='BEARISH'?'offline':'warning'}"></span><div class="a-body"><div class="a-title"><span style="font-weight:600">${a.id}</span> ${a.tf||''} ${a.dir||''} <span class="text-muted">[${a.score}/4]</span></div></div><div class="a-time">${fmtTime(a.time)}</div></div>`).join(''):'<div class="empty-state">No alerts yet</div>'}
    </div></div>
    <div class="card"><div class="card-header"><h3>Push Notifications</h3></div><div class="card-body" style="padding:0">
      ${data.notifications&&data.notifications.length?data.notifications.map(n=>`<div class="activity-item"><span class="a-dot running"></span><div class="a-body"><div class="a-title"><span style="font-weight:600">${n.title}</span>${n.body?'<span class="text-muted"> — '+n.body+'</span>':''}</div></div><div class="a-time">${fmtTime(n.time)}</div></div>`).join(''):'<div class="empty-state">No notifications yet</div>'}
    </div></div>
  </div>
  <div class="card" style="margin-top:16px"><div class="card-header"><h3>Daily Trade Outcomes</h3></div><div class="card-body" style="padding:0">
    ${data.dailyOutcomeLog&&data.dailyOutcomeLog.length?`<table class="compact-table"><thead><tr><th>Time</th><th>Pair</th><th>TF</th><th>Type</th><th>Outcome</th></tr></thead><tbody>${data.dailyOutcomeLog.map(o=>`<tr><td class="text-muted text-sm">${fmtTime(o.time)}</td><td style="font-weight:600">${o.name||o.id}</td><td class="text-muted">${o.tf||''}</td><td class="${o.type==='BULLISH'?'text-green':'text-red'}">${o.type||''}</td><td><span class="badge ${o.outcome==='WIN'||o.outcome==='TP1'||o.outcome==='TP2'?'badge-green':o.outcome==='SL'?'badge-red':'badge-neutral'}">${o.outcome||''}</span></td></tr>`).join('')}</tbody></table>`:'<div class="empty-state">No outcomes today</div>'}
  </div>`;
}

// ===== MEMBERS =====
let _members=[],_newCode=null;
async function renderMembers(){
  renderShell('','User Management');
  const cont=document.getElementById('pageContent');
  cont.innerHTML='<div class="empty-state">Loading members...</div>';
  const data=await api('/api/admin/members');
  if(!data)return;
  _members=data.members||[];
  cont.innerHTML=`
  <div class="section-header"><h2>Registered Users <span class="text-muted text-sm">(${_members.length})</span></h2><div><button class="btn-secondary btn-sm" onclick="S.refresh()">${I.refresh} Refresh</button></div></div>
  <div class="card" style="margin-bottom:16px">
    <div class="card-body" style="padding:16px 18px">
      <label style="font-size:12px;color:var(--text3);margin-bottom:8px;display:block;font-weight:600">Generate New Access Code</label>
      <div class="flex gap-2"><input id="nmInput" type="text" placeholder="Member name"/><button class="btn-primary" style="white-space:nowrap;flex-shrink:0" onclick="S.addMember()">Generate Code</button></div>
    </div>
  </div>
  ${_newCode?`<div class="card" style="margin-bottom:16px;border-color:rgba(184,255,44,.2);background:rgba(184,255,44,.04)"><div class="card-body" style="padding:16px 18px">
    <div class="text-xs text-muted" style="font-weight:600;margin-bottom:4px">NEW CODE FOR ${_newCode.name.toUpperCase()}</div>
    <div style="font-size:22px;font-weight:900;letter-spacing:2px;font-family:var(--mono);color:var(--accent);margin-bottom:8px">${_newCode.code}</div>
    <button class="btn-sm btn-primary" onclick="S.copyCode('${_newCode.code}')">Copy Code</button>
    <span class="text-muted text-sm" style="margin-left:10px">Send via Telegram DM</span>
  </div></div>`:''}
  <div class="card" style="overflow:hidden">
    ${_members.length?_members.map(m=>`<div style="display:flex;justify-content:space-between;align-items:center;padding:14px 18px;border-bottom:1px solid var(--border)">
      <div><div style="font-weight:600">${m.name}</div><div class="mono text-muted text-sm">${m.code}</div>${m.boundDevice?`<div class="text-xs text-accent" style="margin-top:2px">● Device locked</div>`:'<div class="text-xs text-muted2">Not activated</div>'}</div>
      <div class="flex gap-2">${m.boundDevice?`<button class="btn-sm" style="background:var(--orange);color:#000" onclick="S.resetDevice('${m.code}')">Reset Device</button>`:''}<button class="btn-sm btn-secondary" onclick="S.removeMember('${m.code}')" style="color:var(--red)">Remove</button></div>
    </div>`).join(''):'<div class="empty-state">No members registered. Generate a code above to get started.</div>'}
  </div>`;
}

// ===== SUBSCRIBERS =====
const PLANS={monthly:{label:'Monthly',days:30,color:'#4ADE80'},quarterly:{label:'Quarterly',days:90,color:'#FFA726'},lifetime:{label:'Lifetime',days:36500,color:'#B8FF2C'},discord:{label:'Discord ($15)',days:30,color:'#42A5F5'}};
let _subs=[],_subFilter='all',_subEdit=null;
function subDays(d){return Math.ceil((new Date(d)-new Date())/86400000)}
function subFmt(d){return new Date(d).toLocaleDateString('en-GB',{day:'2-digit',month:'short',year:'numeric'})}
function subExp(pd,plan){const d=new Date(pd);d.setDate(d.getDate()+PLANS[plan].days);return d.toISOString().slice(0,10)}
function subStatus(m){
  if(m.plan==='lifetime')return{label:'Lifetime',color:'#B8FF2C',bg:'rgba(184,255,44,.12)'};
  const d=subDays(m.exp);
  if(d<0)return{label:'Expired',color:'#FF4444',bg:'rgba(255,68,68,.12)'};
  if(d<=5)return{label:d+'d left',color:'#FF4444',bg:'rgba(255,68,68,.12)'};
  if(d<=10)return{label:d+'d left',color:'#FFA726',bg:'rgba(255,167,38,.12)'};
  return{label:'Active',color:'#4ADE80',bg:'rgba(74,222,128,.1)'};
}
function subLoad(){try{_subs=JSON.parse(localStorage.getItem('slayers-subs')||'[]')}catch{_subs=[]}}
function subSave(){localStorage.setItem('slayers-subs',JSON.stringify(_subs));const f=document.getElementById('subFlash');if(f){f.classList.add('show');setTimeout(()=>f.classList.remove('show'),2000)}}
function subRender(){
  const q=(document.getElementById('subSearch')?.value||'').toLowerCase();
  const exp=_subs.filter(m=>m.plan!=='lifetime'&&subDays(m.exp)>=0&&subDays(m.exp)<=7);
  const expd=_subs.filter(m=>m.plan!=='lifetime'&&subDays(m.exp)<0);
  const act=_subs.filter(m=>m.plan==='lifetime'||subDays(m.exp)>7);
  document.getElementById('subTotal').textContent=_subs.length;
  document.getElementById('subActive').textContent=act.length;
  document.getElementById('subExpiring').textContent=exp.length;
  document.getElementById('subExpired').textContent=expd.length;
  const bw=document.getElementById('subBannerW'),be=document.getElementById('subBannerE');
  if(bw){bw.className='sub-banner sub-banner-warn'+(exp.length?' show':'');bw.innerHTML=exp.length?'⚠️ '+exp.length+' member'+(exp.length>1?'s':'')+' expiring within 7 days':''}
  if(be){be.className='sub-banner sub-banner-err'+(expd.length?' show':'');be.innerHTML=expd.length?'🚫 '+expd.length+' member'+(expd.length>1?'s':'')+' expired':''}
  let fl=_subs.filter(m=>{
    if(!(m.name.toLowerCase().includes(q)||m.tg.toLowerCase().includes(q)||m.name.toLowerCase().includes(q.replace('@',''))))return false;
    if(_subFilter==='expiring'){const d=subDays(m.exp);return m.plan!=='lifetime'&&d>=0&&d<=7}
    if(_subFilter==='expired')return m.plan!=='lifetime'&&subDays(m.exp)<0;
    if(_subFilter==='active')return m.plan==='lifetime'||subDays(m.exp)>7;
    return true
  }).sort((a,b)=>{if(a.plan==='lifetime')return 1;if(b.plan==='lifetime')return -1;return new Date(a.exp)-new Date(b.exp)});
  const list=document.getElementById('subList');
  if(!list)return;
  if(!fl.length){list.innerHTML='<div class="empty-state">'+(q?'No members match.':'No subscribers yet. Add your first above.')+'</div>';}else{
    list.innerHTML=fl.map(m=>{
      const p=PLANS[m.plan]||PLANS.monthly,st=subStatus(m),init=m.name.charAt(0).toUpperCase();
      return'<div class="sub-card">'+
        '<div class="sub-avatar" style="background:'+p.color+'18;border:1px solid '+p.color+'40;color:'+p.color+'">'+init+'</div>'+
        '<div class="sub-info"><div class="name">'+m.name+'</div><div class="tg">@'+m.tg.replace('@','')+'</div>'+(m.notes?'<div class="note">'+m.notes+'</div>':'')+'</div>'+
        '<span class="sub-plan" style="background:'+p.color+'18;border:1px solid '+p.color+'30;color:'+p.color+'">'+p.label+'</span>'+
        '<div class="sub-dates"><div class="paid">Paid: '+subFmt(m.pd)+'</div><div class="exp" style="color:'+(m.plan==='lifetime'?'#B8FF2C':'var(--text2)')+'">'+(m.plan==='lifetime'?'Never':'Exp: '+subFmt(m.exp))+'</div></div>'+
        '<span class="badge" style="background:'+st.bg+';color:'+st.color+';padding:4px 10px;font-size:10px;font-weight:700">'+st.label+'</span>'+
        '<div class="sub-actions">'+(m.plan!=='lifetime'?'<button class="btn-sm btn-primary" onclick="S.subRenew(\''+m.id+'\')">Renew</button>':'')+'<button class="btn-sm btn-secondary" onclick="S.subEdit(\''+m.id+'\')">Edit</button><button class="btn-sm" style="background:rgba(255,68,68,.12);color:var(--red)" onclick="S.subDel(\''+m.id+'\')">✕</button></div>'+
        '</div>'
    }).join('')
  }
  // Reminders
  const rb=document.getElementById('subReminderBox'),rl=document.getElementById('subReminderList');
  if(rb&&rl){
    if(exp.length){rb.classList.add('show');rl.innerHTML=exp.map(m=>'<div class="sub-reminder-msg" onclick="S.subCopyMsg(\''+m.id+'\',this)"><span class="rname">@'+m.tg.replace('@','')+':</span><br>Hey! Your Slayers Bot access expires '+(subDays(m.exp)===0?'today':'in '+subDays(m.exp)+' day'+(subDays(m.exp)>1?'s':''))+'. Renew here: flutterwave.com/pay/nhmzh8msem0x<div class="text-xs text-muted" style="margin-top:4px">Tap to copy</div></div>').join('')}
    else rb.classList.remove('show')
  }
}
async function renderSubscribers(){
  subLoad();
  renderShell('','Subscriber Tracker');
  const cont=document.getElementById('pageContent');
  const m=_subs;
  const exp=m.filter(x=>x.plan!=='lifetime'&&subDays(x.exp)>=0&&subDays(x.exp)<=7);
  const expd=m.filter(x=>x.plan!=='lifetime'&&subDays(x.exp)<0);
  const act=m.filter(x=>x.plan==='lifetime'||subDays(x.exp)>7);
  cont.innerHTML=`
  <div class="section-header"><h2>Subscriber Tracker</h2><div class="flex gap-2 items-center"><span class="sub-save-flash" id="subFlash">✓ Saved</span><button class="btn-primary btn-sm" onclick="S.subOpen()">+ Add Subscriber</button></div></div>
  <div class="sub-stats">
    <div class="sub-stat"><div class="num" id="subTotal" style="color:var(--accent)">${m.length}</div><div class="lbl">Total Members</div></div>
    <div class="sub-stat"><div class="num" id="subActive" style="color:var(--green)">${act.length}</div><div class="lbl">Active</div></div>
    <div class="sub-stat"><div class="num" id="subExpiring" style="color:var(--orange)">${exp.length}</div><div class="lbl">Expiring (7d)</div></div>
    <div class="sub-stat"><div class="num" id="subExpired" style="color:var(--red)">${expd.length}</div><div class="lbl">Expired</div></div>
  </div>
  <div class="sub-banner sub-banner-warn" id="subBannerW">${exp.length?'⚠️ '+exp.length+' member'+(exp.length>1?'s':'')+' expiring within 7 days':''}</div>
  <div class="sub-banner sub-banner-err" id="subBannerE">${expd.length?'🚫 '+expd.length+' member'+(expd.length>1?'s':'')+' expired':''}</div>
  <div class="sub-controls">
    <input class="sub-search" id="subSearch" placeholder="Search name or @username..." oninput="subRender()">
    <div class="sub-filters">
      <button class="sub-fbtn active" onclick="S.subFilter('all',this)">All</button>
      <button class="sub-fbtn" onclick="S.subFilter('active',this)">Active</button>
      <button class="sub-fbtn" onclick="S.subFilter('expiring',this)">Expiring</button>
      <button class="sub-fbtn" onclick="S.subFilter('expired',this)">Expired</button>
    </div>
  </div>
  <div id="subList">${m.length?'<div class="empty-state">Rendering...</div>':'<div class="empty-state">No subscribers yet. Add your first above.</div>'}</div>
  <div class="sub-reminder-box" id="subReminderBox">
    <div class="sub-reminder-title">📩 Renewal reminders — click to copy:</div>
    <div id="subReminderList"></div>
  </div>
  <div class="modal-overlay" id="subModal" style="display:none" onclick="if(event.target===this)S.subClose()">
    <div class="modal"><h3 id="subModalTitle">Add Subscriber</h3>
      <div style="margin-bottom:12px"><label class="text-xs text-muted" style="display:block;margin-bottom:4px;font-weight:600">Full Name</label><input id="subFName" placeholder="e.g. John Smith"></div>
      <div style="margin-bottom:12px"><label class="text-xs text-muted" style="display:block;margin-bottom:4px;font-weight:600">Telegram</label><input id="subFTg" placeholder="@johnsmith"></div>
      <div style="margin-bottom:12px"><label class="text-xs text-muted" style="display:block;margin-bottom:4px;font-weight:600">Plan</label>
        <select id="subFPlan" onchange="S.subPrev()"><option value="monthly">Monthly — $30/mo</option><option value="quarterly">Quarterly — $75</option><option value="lifetime">Lifetime — $180</option><option value="discord">Discord Loyalty — $15/mo</option></select></div>
      <div style="margin-bottom:12px"><label class="text-xs text-muted" style="display:block;margin-bottom:4px;font-weight:600">Payment Date</label><input type="date" id="subFDate" oninput="S.subPrev()"><div class="sub-expiry-preview" id="subPrev"></div></div>
      <div style="margin-bottom:12px"><label class="text-xs text-muted" style="display:block;margin-bottom:4px;font-weight:600">Notes (optional)</label><input id="subFNotes" placeholder="e.g. Discord member"></div>
      <div class="sub-modal-btns"><button class="btn-primary" onclick="S.subSave()">Save</button><button class="btn-secondary" onclick="S.subClose()">Cancel</button></div>
    </div>
  </div>`;
  subRender();
}

// ===== GLOBAL ACTIONS =====
const S={
  nav(h){window.location.hash='#'+h},
  refresh(){const r=route();if(window._tradeUpdater){clearInterval(window._tradeUpdater);window._tradeUpdater=null}if(r==='trades')renderTrades();else if(r==='dashboard')renderDashboard();else if(r==='scalp')renderScalp();else if(r==='logs')renderLogs();else if(r==='members')renderMembers();else if(r==='subscribers')renderSubscribers()},
  async triggerScan(){
    const btn=document.getElementById('scanBtn');
    const qbtn=document.querySelector('.quick-btn');
    const target=btn||qbtn;
    const origHTML=target?target.innerHTML:'';
    if(target){target.disabled=true;target.innerHTML='... scanning';}
    const res=await api('/api/admin/force-scan',{method:'POST'});
    if(target){target.disabled=false;target.innerHTML=origHTML;}
    if(res)toast(res.ok?'Scan completed':'Scan error: '+(res.error||'unknown'),res.ok?'success':'error');
    if(res&&res.ok)S.refresh()
  },
  async refreshAI(){
    const res=await api('/api/admin/ai-refresh',{method:'POST'});
    toast(res&&res.ok?'AI analysis refreshed':'AI refresh failed',res&&res.ok?'success':'error');
  },
  async closeTrade(sigId,name){
    if(!await confirmDlg('Close Trade','Force close '+name+'? This will record the outcome and notify members.'))return;
    const res=await api('/api/admin/trades/'+encodeURIComponent(sigId)+'/close',{method:'POST',body:JSON.stringify({confirm:'yes'})});
    if(res)toast(res.ok?'Closed '+name+' — '+fmtR(res.rMultiple,2):(res.error||'Error'),res.ok?'success':'error');
    if(res&&res.ok)renderTrades()
  },
  async moveBE(sigId,name){
    if(!await confirmDlg('Move to Breakeven','Move SL to entry for '+name+'?'))return;
    const res=await api('/api/admin/trades/'+encodeURIComponent(sigId)+'/move-be',{method:'POST'});
    if(res)toast(res.ok?res.message:'Error',res.ok?'success':'error');
    if(res&&res.ok)renderTrades()
  },
  async moveSL(sigId,name){
    const price=await promptDlg('Move Stop Loss','Enter new SL price for '+name+':','0.00000');
    if(!price||!isFinite(parseFloat(price)))return;
    if(!await confirmDlg('Confirm','Move SL to '+price+' for '+name+'?'))return;
    const res=await api('/api/admin/trades/'+encodeURIComponent(sigId)+'/move-sl',{method:'POST',body:JSON.stringify({price:parseFloat(price)})});
    if(res)toast(res.ok?res.message:'Error',res.ok?'success':'error');
    if(res&&res.ok)renderTrades()
  },
  async addMember(){
    const name=document.getElementById('nmInput')?.value.trim();
    if(!name){toast('Enter a name','error');return}
    const res=await api('/api/admin/members',{method:'POST',body:JSON.stringify({name})});
    if(res){_newCode=res.member;const inp=document.getElementById('nmInput');if(inp)inp.value='';toast('Code generated for '+name,'success');renderMembers()}
  },
  async removeMember(code){
    if(!await confirmDlg('Remove Member','Remove this member? Their app access will stop immediately.'))return;
    await api('/api/admin/members/'+encodeURIComponent(code),{method:'DELETE'});renderMembers()
  },
  async resetDevice(code){
    if(!await confirmDlg('Reset Device','Reset device binding for '+code+'? Their current phone will be logged out.'))return;
    const res=await api('/api/admin/members/'+encodeURIComponent(code)+'/reset-device',{method:'POST'});
    if(res)toast('Device reset for '+code,'success');renderMembers()
  },
  copyCode(code){navigator.clipboard.writeText(code).then(()=>toast('Copied: '+code,'success'))},
  // Subscriber methods
  subFilter(f,btn){_subFilter=f;document.querySelectorAll('.sub-fbtn').forEach(b=>b.classList.remove('active'));btn.classList.add('active');subRender()},
  subOpen(){_subEdit=null;document.getElementById('subModalTitle').textContent='Add Subscriber';document.getElementById('subFName').value='';document.getElementById('subFTg').value='';document.getElementById('subFPlan').value='monthly';document.getElementById('subFDate').value=new Date().toISOString().slice(0,10);document.getElementById('subFNotes').value='';S.subPrev();document.getElementById('subModal').style.display='flex'},
  subClose(){document.getElementById('subModal').style.display='none'},
  subPrev(){const plan=document.getElementById('subFPlan').value,date=document.getElementById('subFDate').value,prev=document.getElementById('subPrev');if(plan==='lifetime'){prev.textContent='Never expires';return}if(date)prev.textContent='Expires: '+subFmt(subExp(date,plan))},
  subSave(){const name=document.getElementById('subFName').value.trim(),tg=document.getElementById('subFTg').value.trim(),plan=document.getElementById('subFPlan').value,date=document.getElementById('subFDate').value,notes=document.getElementById('subFNotes').value.trim();if(!name||!tg||!date){toast('Fill in name, Telegram and date','error');return}const exp=subExp(date,plan);const obj={id:_subEdit||Date.now().toString(),name,tg,plan,pd:date,exp,notes};if(!_subEdit)obj.addedOn=new Date().toISOString().slice(0,10);if(_subEdit){_subs=_subs.map(m=>m.id===_subEdit?{...obj,id:m.id}:m)}else{_subs.push(obj)}subSave();S.subClose();subRender()},
  subEdit(id){_subEdit=id;const m=_subs.find(x=>x.id===id);if(!m)return;document.getElementById('subModalTitle').textContent='Edit Subscriber';document.getElementById('subFName').value=m.name;document.getElementById('subFTg').value=m.tg||m.telegram;document.getElementById('subFPlan').value=m.plan;document.getElementById('subFDate').value=m.pd||m.paidDate;document.getElementById('subFNotes').value=m.notes||'';S.subPrev();document.getElementById('subModal').style.display='flex'},
  subRenew(id){const today=new Date().toISOString().slice(0,10);const m=_subs.find(x=>x.id===id);if(!m)return;_subs=_subs.map(x=>x.id===id?{...x,paidDate:today,pd:today,expiry:subExp(today,x.plan),exp:subExp(today,x.plan)}:x);subSave();subRender();toast('Renewed','success')},
  subDel(id){if(!confirm('Remove this member from tracker?'))return;_subs=_subs.filter(m=>m.id!==id);subSave();subRender()},
  subCopyMsg(id,el){const m=_subs.find(x=>x.id===id);if(!m)return;const days=subDays(m.exp);const text='Hey! Your Slayers Bot access expires '+(days===0?'today':'in '+days+' day'+(days>1?'s':''))+'. Renew here to keep your signals running 👉 flutterwave.com/pay/nhmzh8msem0x';navigator.clipboard.writeText(text).catch(()=>{});el.style.borderColor='var(--green)';const hint=el.querySelector('.text-xs');if(hint)hint.textContent='✓ Copied!';setTimeout(()=>{el.style.borderColor='';if(hint)hint.textContent='Tap to copy'},2000)}
};
window.S=S;

// ===== ROUTER =====
function initApp(){
  if(window._tradeUpdater){clearInterval(window._tradeUpdater);window._tradeUpdater=null}
  const r=route();
  if(r==='trades')renderTrades();
  else if(r==='scalp')renderScalp();
  else if(r==='logs')renderLogs();
  else if(r==='members')renderMembers();
  else if(r==='subscribers')renderSubscribers();
  else renderDashboard()
}
window.onhashchange=initApp;

// ===== AUTO POLL =====
let pollTimer=null;
function startPolling(){
  stopPolling();
  pollTimer=setInterval(async()=>{
    const r=route();
    if(r==='dashboard'){
      const[data,perf,top,ai,svc]=await Promise.all([
        api('/api/admin/dashboard'),
        api('/api/admin/performance?period=week'),
        api('/api/admin/top-markets'),
        api('/api/admin/ai-summary'),
        api('/api/admin/services')
      ]);
      renderDashboardContent(data,perf,top,ai,svc);
    }
  },60000) // every 60s — don't rebuild shell, just refresh content
}
function stopPolling(){if(pollTimer){clearInterval(pollTimer);pollTimer=null}}

// ===== BOOT =====
if(getPw()){api('/api/admin/dashboard').then(d=>{if(d){initApp();startPolling()}else renderLogin()})}else renderLogin();

})();
