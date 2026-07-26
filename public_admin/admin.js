// Slayers Ops Center — Administration Dashboard SPA
// All API calls require x-admin-password header

const COLORS={bg:'#080c10',panel:'#0c1218',border:'#1e2530',mint:'#26A69A',gold:'#F5A623',red:'#F3677A',white:'#c8d8e8',dim:'#4a6a7a',radius:'12px'};

function getPw(){return sessionStorage.getItem('slayersAdminPw')||''}
function savePw(p){sessionStorage.setItem('slayersAdminPw',p)}
function api(path,opts){
  return fetch(path,{...opts,headers:{'Content-Type':'application/json','X-Admin-Password':getPw(),...((opts&&opts.headers)||{})}})
  .then(r=>{if(r.status===401){sessionStorage.removeItem('slayersAdminPw');renderLogin('Session expired');return null}return r.json()})
}
function toast(msg,type){
  const el=document.createElement('div');el.className='toast '+type;el.textContent=msg;
  document.body.appendChild(el);setTimeout(()=>{el.style.opacity='0';el.style.transition='opacity .3s';setTimeout(()=>el.remove(),300)},3000)
}
function confirmDialog(title,msg){
  return new Promise(resolve=>{
    const overlay=document.createElement('div');overlay.className='modal-overlay';
    overlay.innerHTML=`<div class="modal"><h3>${title}</h3><p>${msg}</p>
      <div class="modal-actions"><button class="btn-ghost" id="dlgCancel">Cancel</button><button class="btn-danger" id="dlgConfirm">Confirm</button></div></div>`;
    document.body.appendChild(overlay);
    overlay.querySelector('#dlgCancel').onclick=()=>{overlay.remove();resolve(false)};
    overlay.querySelector('#dlgConfirm').onclick=()=>{overlay.remove();resolve(true)};
    overlay.onclick=e=>{if(e.target===overlay){overlay.remove();resolve(false)}}
  })
}
function promptDialog(title,msg,placeholder){
  return new Promise(resolve=>{
    const overlay=document.createElement('div');overlay.className='modal-overlay';
    overlay.innerHTML=`<div class="modal"><h3>${title}</h3><p>${msg}</p>
      <input id="dlgInput" type="text" placeholder="${placeholder||''}" style="margin-bottom:12px"/>
      <div class="modal-actions"><button class="btn-ghost" id="dlgCancel">Cancel</button><button class="btn-primary" id="dlgConfirm">Apply</button></div></div>`;
    document.body.appendChild(overlay);
    const input=overlay.querySelector('#dlgInput');
    overlay.querySelector('#dlgCancel').onclick=()=>{overlay.remove();resolve(null)};
    overlay.querySelector('#dlgConfirm').onclick=()=>{overlay.remove();resolve(input.value)};
    overlay.onclick=e=>{if(e.target===overlay){overlay.remove();resolve(null)}}
    setTimeout(()=>input.focus(),100)
  })
}
function fmtR(r,dec){
  if(r==null||!isFinite(r))return'—';
  const s=r>=0?'+':'';
  return s+r.toFixed(dec||2)+'R'
}
function fmtN(n,dec){
  if(n==null||!isFinite(n))return'—';
  return n.toFixed(dec||5)
}
function fmtTime(ts){
  if(!ts)return'—';
  const d=new Date(ts);
  return d.toLocaleString('en-GB',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'})
}
function fmtDuration(min){
  if(min==null)return'—';
  if(min<60)return min+'m';
  const h=Math.floor(min/60),m=min%60;
  return h+'h '+m+'m'
}
function route(){return window.location.hash.slice(1)||'dashboard'}

// ===== SIDEBAR =====
function renderSidebar(current){
  const tabs=[
    {id:'dashboard',icon:'\u2302',label:'Dashboard'},
    {id:'trades',icon:'\uD83D\uDCC8',label:'Trades'},
    {id:'scalp',icon:'\u26A1',label:'Scalp'},
    {id:'logs',icon:'\uD83D\uDCCB',label:'Logs'},
    {id:'members',icon:'\uD83D\uDC65',label:'Members'}
  ];
  return `<div class="sidebar">
    <div class="brand"><h1>SLAYERS</h1><div class="sub">Ops Center</div></div>
    <nav>${tabs.map(t=>`<a href="javascript:void(0)" class="${current===t.id?'active':''}" onclick="navigate('${t.id}')"><span class="icon">${t.icon}</span><span>${t.label}</span></a>`).join('')}</nav>
    <div class="footer"><a href="#" onclick="logout()" style="color:${COLORS.dim};text-decoration:none;font-size:12px;font-weight:600">\u2190 Logout</a></div>
  </div>`
}

window.navigate=function(hash){window.location.hash='#'+hash}
window.logout=function(){sessionStorage.removeItem('slayersAdminPw');renderLogin()}

// ===== APP SHELL =====
function renderShell(content){
  const cur=route();
  document.getElementById('app').innerHTML=`${renderSidebar(cur)}<div class="main">${content}</div>`;
}

// ===== LOGIN =====
function renderLogin(errorMsg){
  document.getElementById('app').innerHTML=`
    <div style="min-height:100vh;display:flex;align-items:center;justify-content:center;background:${COLORS.bg};padding:20px">
      <div style="max-width:380px;width:100%">
        <div style="text-align:center;margin-bottom:32px">
          <div style="font-size:28px;font-weight:900;color:${COLORS.white};text-transform:uppercase;letter-spacing:2px">SLAYERS</div>
          <div style="color:${COLORS.dim};font-size:12px;text-transform:uppercase;letter-spacing:2px;margin-top:4px">Operations Center</div>
        </div>
        <div class="card">
          <label style="margin-bottom:8px">Admin Password</label>
          <input id="pwInput" type="password" style="margin-bottom:16px" placeholder="Enter password"/>
          ${errorMsg?`<div style="color:${COLORS.red};font-size:12px;margin-bottom:12px">${errorMsg}</div>`:''}
          <button id="loginBtn" class="btn-primary" style="width:100%;padding:14px;font-size:15px">Login</button>
        </div>
      </div>
    </div>`;
  document.getElementById('loginBtn').onclick=async()=>{
    const pw=document.getElementById('pwInput').value;savePw(pw);
    const res=await api('/api/admin/dashboard');
    if(res)initApp();else renderLogin('Wrong password.');
  };
  document.getElementById('pwInput').addEventListener('keypress',e=>{if(e.key==='Enter')document.getElementById('loginBtn').click()});
  document.getElementById('pwInput').focus()
}

// ===== DASHBOARD =====
async function renderDashboard(){
  renderShell('<div class="topbar"><h2>Dashboard</h2><div class="topbar-actions"><button class="btn-primary" onclick="triggerScan()">\u26A1 Force Scan</button><button class="btn-ghost" onclick="refresh()">\u21BB Refresh</button></div></div><div id="dashContent"><div style="text-align:center;padding:40px;color:'+COLORS.dim+'">Loading...</div></div>');
  const data=await api('/api/admin/dashboard');
  if(!data)return;
  const up=data.uptime,hrs=Math.floor(up/3600),mins=Math.floor((up%3600)/60);
  const wr=data.todayTrades?(data.todayWins+data.todayLosses)?Math.round(data.todayWins/(data.todayWins+data.todayLosses)*100):0:0;
  document.getElementById('dashContent').innerHTML=`
    <div class="grid-4">
      <div class="stat-card green"><div class="value">${data.activeTrades}</div><div class="label">Active Trades</div><div class="sub">${data.activeScalpTrades>0?'+'+data.activeScalpTrades+' scalp':''}</div></div>
      <div class="stat-card gold"><div class="value">${data.pendingSignals}</div><div class="label">Pending Signals</div><div class="sub">${data.totalSignals} total</div></div>
      <div class="stat-card blue"><div class="value">${data.activeUsers}</div><div class="label">Active Users</div><div class="sub">${data.totalUsers} registered</div></div>
      <div class="stat-card green"><div class="value">${data.scanCount}</div><div class="label">Scans Run</div><div class="sub">${data.lastScanTime?fmtTime(data.lastScanTime):'never'}</div></div>
    </div>
    <div class="grid-4">
      <div class="stat-card"><div class="value">${hrs}h ${mins}m</div><div class="label">Uptime</div><div class="sub">${data.session}</div></div>
      <div class="stat-card"><div class="value">${data.totalTradeHistory}</div><div class="label">Closed Trades</div><div class="sub">${data.winStreak>1?'W'+data.winStreak:''}${data.lossStreak>1?'L'+data.lossStreak:''}</div></div>
      <div class="stat-card ${data.todayWins>data.todayLosses?'green':data.todayLosses>0?'red':''}"><div class="value">${data.todayTrades}</div><div class="label">Today</div><div class="sub">${data.todayWins}W ${data.todayLosses}L ${wr>0?wr+'% WR':''}</div></div>
      <div class="stat-card gold"><div class="value">${data.pushSubscribers}</div><div class="label">Push Subs</div><div class="sub"><span class="status-dot ${data.pushSubscribers>0?'live':'warn'}"></span>${data.weeklySummary?'Report Ready':''}</div></div>
    </div>
    <div class="grid-2">
      <div class="card">
        <div class="section-title">Recent Alerts</div>
        ${data.alertLog&&data.alertLog.length?data.alertLog.slice(0,8).map(a=>`
          <div class="log-line"><span class="time">${a.time?fmtTime(a.time):''}</span><span class="sev ${a.dir==='BULLISH'?'success':a.dir==='BEARISH'?'error':'info'}">${a.type||''}</span><span class="msg">${a.id} ${a.tf||''} ${a.dir||''} ${a.score!==undefined?'['+a.score+'/4]':''}</span></div>
        `).join(''):`<div class="empty-state">No alerts yet</div>`}
      </div>
      <div class="card">
        <div class="section-title">Recent Notifications</div>
        ${data.recentNotifications&&data.recentNotifications.length?data.recentNotifications.slice(0,8).map(n=>`
          <div class="log-line"><span class="time">${fmtTime(n.time)}</span><span class="sev ${n.type==='trophy'?'success':n.type==='trade'?'info':'info'}">${n.icon||''}</span><span class="msg"><b>${n.title}</b>${n.body?' — '+n.body:''}</span></div>
        `).join(''):`<div class="empty-state">No notifications</div>`}
      </div>
    </div>`;
}

// ===== TRADES =====
async function renderTrades(){
  renderShell('<div class="topbar"><h2>Active Trades</h2><div class="topbar-actions"><button class="btn-ghost" onclick="refresh()">\u21BB Refresh</button></div></div><div id="tradesContent"><div style="text-align:center;padding:40px;color:'+COLORS.dim+'">Loading prices...</div></div>');
  const data=await api('/api/admin/trades');
  if(!data)return;
  if(!data.trades||!data.trades.length){
    document.getElementById('tradesContent').innerHTML='<div class="empty-state">No active trades.</div>';
    return
  }
  document.getElementById('tradesContent').innerHTML=`
    <div class="card" style="overflow-x:auto;padding:0">
      <table>
        <thead><tr>
          <th>Pair</th><th>TF</th><th>Type</th><th>Entry</th><th>Current</th><th>SL</th><th>TP1/TP2</th><th>P&L</th><th>Age</th><th>Status</th><th>Actions</th>
        </tr></thead>
        <tbody>${data.trades.map(t=>{
          const dirClass=t.type==='BULLISH'?'bull':'bear';
          const rCol=t.rMultiple>0?'bull':t.rMultiple<0?'bear':'neutral';
          const progress=[t.beFired?'BE\u2713':'',t.tp1Fired?'TP1\u2713':'',t.tp2Fired?'TP2\u2713':''].filter(Boolean).join(' ');
          return `<tr>
            <td><b>${t.instName}</b></td>
            <td>${t.tf}</td>
            <td class="${dirClass}">${t.type==='BULLISH'?'BUY':'SELL'}</td>
            <td>${fmtN(t.entry,t.dec)}</td>
            <td class="${rCol}">${fmtN(t.currentPrice,t.dec)}</td>
            <td>${fmtN(t.sl,t.dec)}${t.origSL!==t.sl?'<br><span class="dim">was '+fmtN(t.origSL,t.dec)+'</span>':''}</td>
            <td class="dim">${fmtN(t.tp1,t.dec)} / ${fmtN(t.tp2,t.dec)}</td>
            <td class="${rCol}" style="font-weight:700">${fmtR(t.rMultiple,2)}</td>
            <td class="dim">${fmtDuration(t.age)}</td>
            <td>${progress||'<span class="dim">active</span>'}</td>
            <td style="white-space:nowrap">
              <button class="btn-sm btn-primary" onclick="closeTrade('${t.sigId}','${t.instName}')" style="margin-right:4px">Close</button>
              ${!t.beFired?`<button class="btn-sm btn-gold" onclick="moveBE('${t.sigId}','${t.instName}')" style="margin-right:4px">BE</button>`:''}
              <button class="btn-sm btn-ghost" onclick="moveSL('${t.sigId}','${t.instName}')">SL</button>
            </td>
          </tr>`
        }).join('')}</tbody>
      </table>
    </div>
    <div class="dim" style="margin-top:12px;font-size:12px">${data.count} active trade${data.count!==1?'s':''}</div>`;
}
window.closeTrade=async(sigId,name)=>{
  if(!await confirmDialog('Close Trade','Force close '+name+' now? This will record the trade outcome and notify members.'))return;
  const res=await api('/api/admin/trades/'+encodeURIComponent(sigId)+'/close',{method:'POST',body:JSON.stringify({confirm:'yes'})});
  if(res)toast((res.ok?'Closed '+name+' at '+(res.exitPrice?fmtN(res.exitPrice,5):'')+' ('+fmtR(res.rMultiple,2)+')':'Error: '+res.error),res.ok?'success':'error');
  if(res&&res.ok)renderTrades()
};
window.moveBE=async(sigId,name)=>{
  if(!await confirmDialog('Move to Breakeven','Move SL to entry for '+name+'?'))return;
  const res=await api('/api/admin/trades/'+encodeURIComponent(sigId)+'/move-be',{method:'POST'});
  if(res)toast(res.ok?res.message:'Error: '+res.error,res.ok?'success':'error');
  if(res&&res.ok)renderTrades()
};
window.moveSL=async(sigId,name)=>{
  const price=await promptDialog('Move Stop Loss','Enter new SL price for '+name+':','0.00000');
  if(!price)return;
  if(!isFinite(parseFloat(price))){toast('Invalid price','error');return}
  if(!await confirmDialog('Confirm SL Move','Move SL to '+price+' for '+name+'?'))return;
  const res=await api('/api/admin/trades/'+encodeURIComponent(sigId)+'/move-sl',{method:'POST',body:JSON.stringify({price:parseFloat(price)})});
  if(res)toast(res.ok?res.message:'Error: '+res.error,res.ok?'success':'error');
  if(res&&res.ok)renderTrades()
};

// ===== SCALP =====
async function renderScalp(){
  renderShell('<div class="topbar"><h2>Scalp Trades</h2><div class="topbar-actions"><button class="btn-ghost" onclick="refresh()">\u21BB Refresh</button></div></div><div id="scalpContent"><div style="text-align:center;padding:40px;color:'+COLORS.dim+'">Loading...</div></div>');
  const data=await api('/api/admin/scalp-trades');
  if(!data)return;
  if(!data.trades||!data.trades.length){
    document.getElementById('scalpContent').innerHTML='<div class="empty-state">No active scalp trades.</div>';
    return
  }
  document.getElementById('scalpContent').innerHTML=`
    <div class="card" style="overflow-x:auto;padding:0">
      <table>
        <thead><tr><th>Pair</th><th>Type</th><th>Entry</th><th>SL</th><th>TP1</th><th>TP2</th><th>Session</th><th>Score</th><th>Status</th></tr></thead>
        <tbody>${data.trades.map(t=>{
          const dirClass=t.type==='BULLISH'?'bull':'bear';
          return `<tr>
            <td><b>${t.name||t.pair}</b></td>
            <td class="${dirClass}">${t.type==='BULLISH'?'BUY':'SELL'}</td>
            <td>${fmtN(t.entry,5)}</td>
            <td>${fmtN(t.sl,5)}</td>
            <td>${fmtN(t.tp1,5)}</td>
            <td>${fmtN(t.tp2,5)}</td>
            <td class="dim">${t.session||'—'}</td>
            <td class="gold">${t.score!=null?t.score+'/5':''}</td>
            <td>${t.beFired?'BE\u2713 ':''}${t.tp1Fired?'TP1\u2713 ':''}${t.tp2Fired?'TP2\u2713 ':''}${t.closed?'<span class="dim">closed</span>':'<span class="mint">open</span>'}</td>
          </tr>`
        }).join('')}</tbody>
      </table>
    </div>
    <div class="dim" style="margin-top:12px;font-size:12px">${data.count} active scalp trade${data.count!==1?'s':''}</div>`;
}

// ===== LOGS =====
async function renderLogs(){
  renderShell('<div class="topbar"><h2>System Logs</h2><div class="topbar-actions"><button class="btn-ghost" onclick="refresh()">\u21BB Refresh</button></div></div><div id="logsContent"><div style="text-align:center;padding:40px;color:'+COLORS.dim+'">Loading...</div></div>');
  const data=await api('/api/admin/logs');
  if(!data)return;
  document.getElementById('logsContent').innerHTML=`
    <div class="grid-2">
      <div class="card">
        <div class="section-title">Alert Log <span class="dim">(last 20)</span></div>
        ${data.alertLog&&data.alertLog.length?data.alertLog.map(a=>`
          <div class="log-line"><span class="time">${a.time?fmtTime(a.time):''}</span><span class="sev ${a.dir==='BULLISH'?'success':a.dir==='BEARISH'?'error':'info'}">${a.type||''}</span><span class="msg">${a.id} ${a.tf||''} ${a.dir||''} ${a.score!==undefined?'['+a.score+'/4]':''}</span></div>
        `).join(''):`<div class="empty-state">No alerts</div>`}
      </div>
      <div class="card">
        <div class="section-title">Notifications <span class="dim">(last 20)</span></div>
        ${data.notifications&&data.notifications.length?data.notifications.map(n=>`
          <div class="log-line"><span class="time">${fmtTime(n.time)}</span><span class="sev ${n.type==='trophy'?'success':n.type==='trade'?'info':'info'}">${n.icon||''}</span><span class="msg"><b>${n.title}</b>${n.body?' — '+n.body:''}</span></div>
        `).join(''):`<div class="empty-state">No notifications</div>`}
      </div>
    </div>
    <div class="card" style="margin-top:16px">
      <div class="section-title">Daily Outcome Log <span class="dim">(last 20)</span></div>
      ${data.dailyOutcomeLog&&data.dailyOutcomeLog.length?`
        <div style="overflow-x:auto">
        <table>
          <thead><tr><th>Time</th><th>Pair</th><th>TF</th><th>Type</th><th>Outcome</th></tr></thead>
          <tbody>${data.dailyOutcomeLog.map(o=>`
            <tr><td class="dim">${fmtTime(o.time)}</td><td><b>${o.name||o.id}</b></td><td>${o.tf||''}</td><td class="${o.type==='BULLISH'?'bull':'bear'}">${o.type||''}</td><td class="${o.outcome==='WIN'||o.outcome==='TP1'||o.outcome==='TP2'?'bull':o.outcome==='SL'?'bear':'neutral'}">${o.outcome||''}</td></tr>
          `).join('')}</tbody>
        </table></div>
      `:`<div class="empty-state">No daily outcomes yet</div>`}
    </div>`;
}

// ===== MEMBERS =====
let members=[],newCode=null;
async function renderMembers(){
  renderShell('<div class="topbar"><h2>Members</h2><div class="topbar-actions"><button class="btn-ghost" onclick="refresh()">\u21BB Refresh</button></div></div><div id="membersContent"><div style="text-align:center;padding:40px;color:'+COLORS.dim+'">Loading...</div></div>');
  const data=await api('/api/admin/members');
  if(!data)return;
  members=data.members||[];
  document.getElementById('membersContent').innerHTML=`
    <div class="card" style="margin-bottom:20px">
      <div class="section-title" style="margin-bottom:12px">Add Member</div>
      <div style="display:flex;gap:8px;align-items:center">
        <input id="newName" type="text" placeholder="Member name" style="flex:1"/>
        <button class="btn-primary" onclick="addMember()" style="white-space:nowrap">Generate Code</button>
      </div>
    </div>
    ${newCode?`
      <div style="background:#1a4a44;border:1px solid ${COLORS.mint}66;border-radius:${COLORS.radius};padding:16px;margin-bottom:20px">
        <div style="color:${COLORS.mint};font-size:12px;font-weight:700;margin-bottom:6px">NEW CODE FOR ${newCode.name.toUpperCase()}</div>
        <div style="color:${COLORS.white};font-size:22px;font-weight:900;letter-spacing:2px;margin-bottom:10px">${newCode.code}</div>
        <button class="btn-sm btn-primary" onclick="copyCode('${newCode.code}')">Copy Code</button>
        <div style="color:${COLORS.dim};font-size:11px;margin-top:10px">Send this to ${newCode.name} via Telegram DM.</div>
      </div>`:''}
    <div class="section-title" style="margin-bottom:12px">Active Members <span class="dim">(${members.length})</span></div>
    ${members.length?members.map(m=>`
      <div class="card" style="margin-bottom:8px;display:flex;justify-content:space-between;align-items:center">
        <div>
          <div style="font-weight:700;font-size:14px;color:${COLORS.white}">${m.name}</div>
          <div style="color:${COLORS.dim};font-size:11px;letter-spacing:1px">${m.code}</div>
          ${m.boundDevice?`<div style="color:${COLORS.mint};font-size:10.5px;margin-top:4px">\uD83D\uDD12 Locked to device</div>`:`<div style="color:${COLORS.dim};font-size:10.5px;margin-top:4px">Not used yet</div>`}
        </div>
        <div style="display:flex;gap:6px">
          ${m.boundDevice?`<button class="btn-sm btn-gold" onclick="resetDevice('${m.code}')">Reset Device</button>`:''}
          <button class="btn-sm btn-danger" onclick="removeMember('${m.code}')">Remove</button>
        </div>
      </div>
    `).join(''):`<div class="empty-state">No members yet</div>`}`;
}
window.addMember=async()=>{
  const name=document.getElementById('newName').value.trim();
  if(!name){toast('Enter a name','error');return}
  const res=await api('/api/admin/members',{method:'POST',body:JSON.stringify({name})});
  if(res){newCode=res.member;document.getElementById('newName').value='';toast('Code generated for '+name,'success');renderMembers()}
};
window.removeMember=async(code)=>{
  if(!await confirmDialog('Remove Member','Remove this member? Their app access will stop immediately.'))return;
  await api('/api/admin/members/'+encodeURIComponent(code),{method:'DELETE'});
  renderMembers()
};
window.resetDevice=async(code)=>{
  if(!await confirmDialog('Reset Device','Reset device binding for '+code+'? Their current phone will be logged out.'))return;
  const res=await api('/api/admin/members/'+encodeURIComponent(code)+'/reset-device',{method:'POST'});
  if(res)toast('Device reset for '+code,'success');
  renderMembers()
};
window.copyCode=function(code){navigator.clipboard.writeText(code).then(()=>toast('Copied: '+code,'success'))};

// ===== FORCE SCAN =====
window.triggerScan=async()=>{
  const btn=document.querySelector('.btn-primary');
  if(btn){btn.disabled=true;btn.textContent='\u23F3 Scanning...'}
  const res=await api('/api/admin/force-scan',{method:'POST'});
  if(btn){btn.disabled=false;btn.innerHTML='\u26A1 Force Scan'}
  if(res)toast(res.ok?'Scan completed at '+fmtTime(res.time):'Error: '+res.error,res.ok?'success':'error');
  if(res&&res.ok)refresh()
};

// ===== REFRESH =====
window.refresh=function(){initApp()};

// ===== ROUTER =====
function initApp(){
  const cur=route();
  if(cur==='trades')renderTrades();
  else if(cur==='scalp')renderScalp();
  else if(cur==='logs')renderLogs();
  else if(cur==='members')renderMembers();
  else renderDashboard()
}
window.onhashchange=initApp;

// ===== BOOT =====
if(getPw()){api('/api/admin/dashboard').then(r=>{if(r)initApp();else renderLogin()})}else renderLogin();
