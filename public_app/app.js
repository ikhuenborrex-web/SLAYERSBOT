// ===== THE SLAYERS APP v10 — Full Prototype Design =====
(function(){var s=document.createElement('style');s.textContent=
'html,body{background:#0A0E12;margin:0;padding:0;height:100dvh;overflow:hidden;-webkit-overflow-scrolling:touch}'+
'.mono{font-family:SF Mono,JetBrains Mono,monospace;font-weight:500;letter-spacing:-0.3px}'+
'.section-h{font-size:22px;font-weight:600;letter-spacing:-0.3px;margin-bottom:14px;display:flex;align-items:baseline;gap:8px;padding-top:18px}'+
'.section-h .sub{font-size:10px;font-weight:500;color:#6B7B78;margin-left:auto}'+
'.progress-track{width:100%;height:2px;background:rgba(255,255,255,0.03);border-radius:99px;overflow:hidden}'+
'.progress-fill{height:100%;border-radius:99px}'+
'.toggle{width:40px;height:22px;border-radius:99px;background:#3D4C4A;cursor:pointer;position:relative;flex-shrink:0;transition:background 0.3s}'+
'.toggle.on{background:#2DD4BF}'+
'.toggle::after{content:"";position:absolute;top:3px;left:2px;width:16px;height:16px;border-radius:99px;background:white;transition:transform 0.3s cubic-bezier(0.16,1,0.3,1)}'+
'.toggle.on::after{transform:translateX(18px)}'+
'.setting-row{display:flex;align-items:center;justify-content:space-between;padding:14px 0}'+
'.setting-row+.setting-row{border-top:0.5px solid rgba(255,255,255,0.03)}'+
'.setting-row .label{font-size:13px;font-weight:600}'+
'.setting-row .hint{font-size:10.5px;color:#6B7B78;margin-top:2px;font-weight:400}'+
'@keyframes breathe{0%,100%{box-shadow:0 0 4px #2DD4BF;opacity:1}50%{box-shadow:0 0 14px #2DD4BF;opacity:0.4}}'+
'.live-dot{width:6px;height:6px;border-radius:99px;background:#2DD4BF;animation:breathe 2.4s ease-in-out infinite;flex-shrink:0}'+
'@keyframes springUp{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}'+
'@keyframes fillBar{from{width:0%}}'+
'@keyframes pulseRing{0%{box-shadow:0 0 0 0 rgba(45,212,191,0.5)}70%{box-shadow:0 0 0 8px rgba(45,212,191,0)}100%{box-shadow:0 0 0 0 rgba(45,212,191,0)}}'+
'@keyframes ptrSpin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}'+
'@keyframes ptrBounce{0%{transform:translateY(0)}50%{transform:translateY(-6px)}100%{transform:translateY(0)}}'+
'.ptr-wrap{overflow:hidden;position:relative;flex-shrink:0;width:100%;display:flex;align-items:center;justify-content:center;transition:height 0.35s cubic-bezier(0.16,1,0.3,1)}'+
'.ptr-inner{display:flex;align-items:center;gap:12px;padding:8px}'+
'.ptr-logo{width:36px;height:36px;border-radius:10px;background:linear-gradient(135deg,#2DD4BF,#0D9488);display:flex;align-items:center;justify-content:center;font-weight:800;font-size:15px;color:#0A0E12;flex-shrink:0;box-shadow:0 0 20px rgba(45,212,191,0.15)}'+
'.ptr-logo.spinning{animation:ptrSpin 0.6s linear infinite}'+
'.ptr-logo.bouncing{animation:ptrBounce 0.5s ease-in-out 2}'+
'.ptr-text{font-size:11px;color:#6B7B78;font-weight:500;letter-spacing:0.1px}'+
'.pulse-ring{animation:pulseRing 2.5s ease-in-out infinite}'+
'.ember{position:absolute;width:2px;height:2px;border-radius:99px;opacity:0;animation:float-up linear infinite}'+
'.ember:nth-child(odd){background:#D4A853;width:1.5px;height:1.5px}'+
'@keyframes float-up{0%{transform:translateY(0) scale(1);opacity:0}8%{opacity:0.5}92%{opacity:0.15}100%{transform:translateY(-100vh) scale(0);opacity:0}}'+
'.btn-primary{display:inline-flex;align-items:center;justify-content:center;gap:6px;padding:10px 20px;border-radius:99px;background:#2DD4BF;border:none;color:#0A0E12;font-family:inherit;font-size:12px;font-weight:700;cursor:pointer;transition:all 0.2s}'+
'.btn-primary:active{transform:scale(0.96);opacity:0.9}'+
'.btn-outline{display:inline-flex;align-items:center;justify-content:center;gap:6px;padding:10px 20px;border-radius:99px;background:transparent;border:0.5px solid rgba(255,255,255,0.08);color:#6B7B78;font-family:inherit;font-size:12px;font-weight:600;cursor:pointer;transition:all 0.2s}'+
'.btn-outline:active{transform:scale(0.96)}';
document.head.appendChild(s);})();

var C = {
  bg: '#0A0E12',
  surface: 'rgba(255,255,255,0.04)',
  border: 'rgba(255,255,255,0.06)',
  emerald: '#2DD4BF',
  emeraldSoft: 'rgba(45,212,191,0.08)',
  emeraldBorder: 'rgba(45,212,191,0.12)',
  gold: '#D4A853',
  goldSoft: 'rgba(212,168,83,0.08)',
  goldBorder: 'rgba(212,168,83,0.12)',
  rose: '#FF5A5F',
  roseSoft: 'rgba(255,90,95,0.08)',
  roseBorder: 'rgba(255,90,95,0.12)',
  purple: '#A78BFA',
  purpleSoft: 'rgba(167,139,250,0.08)',
  purpleBorder: 'rgba(167,139,250,0.15)',
  white: '#E8EDEA',
  text2: '#6B7B78',
  separator: 'rgba(255,255,255,0.05)',
  tabBg: 'rgba(10,14,18,0.92)',
  tabBorder: 'rgba(255,255,255,0.05)',
  shadowSm: '0 4px 20px rgba(0,0,0,0.25)',
};

function getCode(){return localStorage.getItem('slayersAccessCode')||'';}
function saveCode(c){localStorage.setItem('slayersAccessCode',c);}
function clearCode(){localStorage.removeItem('slayersAccessCode');}
function getDeviceId(){
  var id = localStorage.getItem('slayersDeviceId');
  if (!id){
    id = (crypto.randomUUID ? crypto.randomUUID() : 'dev-' + Date.now() + '-' + Math.random().toString(36).slice(2));
    localStorage.setItem('slayersDeviceId', id);
  }
  return id;
}
function withCode(url){
  var code = getCode();
  var sep1 = url.includes('?') ? '&' : '?';
  return url + sep1 + 'code=' + encodeURIComponent(code) + '&device=' + encodeURIComponent(getDeviceId());
}

function timeAgo(t){
  if (!t) return '';
  var d = typeof t === 'number' ? t : new Date(t).getTime();
  var diff = Math.floor((Date.now() - d) / 60000);
  if (diff < 60) return diff + 'm ago';
  if (diff < 1440) return Math.floor(diff / 60) + 'h ago';
  return new Date(t).toLocaleDateString([], {month:'short',day:'numeric'});
}

function fmt(n){
  return typeof n === 'number' ? n.toFixed(n > 100 ? 2 : 5) : (n || '--');
}
function fmtNum(n,d){return n==null?'--':n.toLocaleString('en-US',{minimumFractionDigits:d,maximumFractionDigits:d});}

function pill(text, color, bg, border, cls){
  bg = bg || color + '12';
  border = border || color + '25';
  return '<span style="display:inline-flex;align-items:center;gap:4px;font-size:9px;font-weight:600;letter-spacing:0.2px;padding:4px 12px;border-radius:6px;background:' + bg + ';color:' + color + ';border:0.5px solid ' + border + (cls ? ';animation:pulseRing 2.5s ease-in-out infinite' : '') + '">' + text + '</span>';
}

function icon(name,color){
  var map = {
    home:'<path d="M3.5 12L12 4.5l8.5 7.5M6 10.5V20a1 1 0 001 1h3.5v-6.5h3V21H17a1 1 0 001-1v-9.5" stroke="'+color+'" fill="none" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>',
    book:'<path d="M4 6.5h16M4 12h16M4 17.5h12" stroke="'+color+'" fill="none" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>',
    cal:'<rect x="3" y="4.5" width="18" height="17" rx="2.5" stroke="'+color+'" fill="none" stroke-width="1.5"/><path d="M16 2v4M8 2v4M3 9.5h18" stroke="'+color+'" stroke-width="1.5" stroke-linecap="round"/><circle cx="8" cy="14" r="1.5" fill="'+color+'"/><circle cx="12" cy="14" r="1.5" fill="'+color+'"/><circle cx="16" cy="14" r="1.5" fill="'+color+'"/>',
    globe:'<circle cx="12" cy="12" r="9" stroke="'+color+'" fill="none" stroke-width="1.5"/><path d="M3 12h18M12 3a15 15 0 010 18 15 15 0 010-18z" stroke="'+color+'" fill="none" stroke-width="1.5"/>',
    gear:'<circle cx="12" cy="12" r="3" stroke="'+color+'" fill="none" stroke-width="1.5"/><path d="M12 2v2.5M12 19.5V22M4.5 4.5l1.8 1.8M17.7 17.7l1.8 1.8M2 12h2.5M19.5 12H22M4.5 19.5l1.8-1.8M17.7 6.3l1.8-1.8" stroke="'+color+'" stroke-width="1.5" stroke-linecap="round"/>',
  };
  return '<svg width="20" height="20" viewBox="0 0 24 24">' + (map[name]||'') + '</svg>';
}

function mono(text, color, size){if(!color)color=C.white;if(!size)size=13.5;return '<span class="mono" style="color:'+color+';font-size:'+size+'px">'+text+'</span>';}

function animateCounters(){
  var els = document.querySelectorAll('.stat-value');
  for (var i = 0; i < els.length; i++) {
    (function(el){
      var target = parseFloat(el.getAttribute('data-count'));
      var isInt = (el.getAttribute('data-count')||'').indexOf('.') === -1;
      var dur = 700;
      var startTime = null;
      function step(ts){
        if (!startTime) startTime = ts;
        var p = Math.min((ts - startTime) / dur, 1);
        var eased = 1 - Math.pow(1 - p, 3);
        var val = target * eased;
        el.textContent = isInt ? Math.round(val) : val.toFixed(1);
        if (p < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    })(els[i]);
  }
}

// ===== PTR =====
var ptr = {pulling:false,startY:0,curr:0,refreshing:false};

function setupPTR(sc){
  if (!sc || ptr.refreshing) return;
  var pw = document.getElementById('ptrWrap');
  var pl = document.getElementById('ptrLogo');
  var pt = document.getElementById('ptrText');

  function reset(){
    ptr.pulling = false; ptr.curr = 0;
    if (pw){pw.style.height='0';pw.style.transition='height 0.35s cubic-bezier(0.16,1,0.3,1)';}
    if (pl){pl.style.transform='';pl.className='ptr-logo';pl.style.opacity='';}
    if (pt){pt.textContent='Pull to refresh';pt.style.opacity='';}
  }

  sc.addEventListener('touchstart',function(e){
    if(ptr.refreshing)return;
    if(sc.scrollTop<=0){ptr.pulling=true;ptr.startY=e.touches[0].clientY;if(pw)pw.style.transition='none';}
  },{passive:true});

  sc.addEventListener('touchmove',function(e){
    if(!ptr.pulling||ptr.refreshing)return;
    var dist=e.touches[0].clientY-ptr.startY;
    if(dist<=0){ptr.pulling=false;reset();return;}
    e.preventDefault();
    var damped=Math.min(dist*0.45,100);
    ptr.curr=damped;
    if(pw)pw.style.height=damped+'px';
    var progress=Math.min(damped/60,1);
    if(pl){pl.style.transform='rotate('+(progress*360)+'deg)';pl.style.opacity=0.4+progress*0.6;}
    if(pt){pt.style.opacity=progress;pt.textContent=damped>=60?'Release to refresh':'Pull to refresh';}
  },{passive:false});

  sc.addEventListener('touchend',function(e){
    if(!ptr.pulling||ptr.refreshing)return;
    ptr.pulling=false;
    if(ptr.curr>=60){
      ptr.refreshing=true;
      if(pw){pw.style.transition='height 0.25s cubic-bezier(0.16,1,0.3,1)';pw.style.height='56px';}
      if(pl){pl.style.transform='rotate(360deg)';pl.className='ptr-logo spinning';}
      if(pt)pt.textContent='Refreshing\u2026';
      setTimeout(function(){
        fetchAll();
        ptr.refreshing=false;
        var pw2=document.getElementById('ptrWrap'),pl2=document.getElementById('ptrLogo'),pt2=document.getElementById('ptrText');
        if(pw2){pw2.style.transition='height 0.35s cubic-bezier(0.16,1,0.3,1)';pw2.style.height='0';}
        if(pl2){pl2.className='ptr-logo';pl2.style.transform='';pl2.style.opacity='';}
        if(pt2){pt2.textContent='Pull to refresh';pt2.style.opacity='';}
      },800);
    }else{reset();}
  },{passive:true});
}

// ===== STATE =====
var state = {
  tab:'home',selected:null,
  signals:[],active:[],confluence:[],stats:null,myStats:null,
  journal:[],news:[],settings:null,notifPrefs:{},botHistory:[],
  loading:true,
  filter:{pair:'',dir:'',tf:''},
  journalFilter:'all',
  showEntryForm:false,
  editingEntry:null,
  calF:{co:'all',im:'all'},
  newsF:'All',
  articles:[],
};

// ===== DATA FETCHING =====
async function fetchAll(){
  var TIMEOUT_MS = 10000;
  var withTimeout = function(p){return Promise.race([p,new Promise(function(_,rej){setTimeout(function(){rej(new Error('Request timed out'));},TIMEOUT_MS);})]);};
  try {
    var [sigRes,activeRes,confluRes,statsRes,myStatsRes,journalRes,newsRes,newsFeedRes,settingsRes,tradeHistRes] = await withTimeout(Promise.all([
      fetch(withCode('/api/signals?limit=20')),fetch(withCode('/api/active')),
      fetch(withCode('/api/confluence')),fetch(withCode('/api/stats')),
      fetch(withCode('/api/member/stats')),fetch(withCode('/api/journal')),
      fetch(withCode('/api/news')),fetch(withCode('/api/news-feed')),fetch(withCode('/api/settings')),
      fetch(withCode('/api/trade-history'))
    ]));
    if(sigRes.status===401){clearCode();state.loading=false;renderLogin('Your access code has expired or is no longer valid.');return;}
    var j=function(r){return r.json().catch(function(){return{};});};
    state.signals=(await j(sigRes)).signals||[];
    state.active=(await j(activeRes)).trades||[];
    state.confluence=(await j(confluRes)).pairs||[];
    state.stats=await j(statsRes);
    if(myStatsRes.status===200){var myData=await j(myStatsRes);state.myStats=myData.myStats||null;state.notifPrefs=myData.notifPrefs||{};}
    state.journal=(await j(journalRes)).entries||[];
    state.news=(await j(newsRes)).events||[];
    state.articles=(await j(newsFeedRes)).articles||[];
    var sData=await j(settingsRes);
    state.settings=sData.settings||null;
    var histRes=await j(tradeHistRes);
    state.botHistory=histRes.outcomes||[];
    state.fetchError=null;
  }catch(e){console.error('Fetch error',e);state.fetchError=e.message||'Connection error';}
  state.loading=false;
  render();
}

// ===== CARD HELPERS =====
function card(inner,opts){
  opts=opts||{};
  var delay=opts.delay||0;
  var borderColor=opts.border||C.border;
  var inset=opts.inset!==false;
  var extra=opts.extra||'';
  var accent=opts.accent||'';
  var pulse=opts.pulse?' pulse-ring':'';
  var topAccent=accent?'<div style="position:absolute;top:0;left:12px;right:12px;height:0.5px;background:linear-gradient(90deg,transparent,'+accent+',transparent);opacity:0.15"></div>':'';
  return '<div style="background:'+C.surface+';border-radius:24px;padding:20px;border:0.5px solid '+borderColor+';margin-bottom:10px;box-shadow:'+C.shadowSm+';animation:springUp 0.6s cubic-bezier(0.16,1,0.3,1) '+(delay||0)+'s both;position:relative;overflow:hidden'+extra+'">'+topAccent+inner+'</div>';
}

function statGrid(items){
  var html='<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:20px">';
  for(var i=0;i<items.length;i++){
    var m=items[i];
    html+='<div style="background:'+C.surface+';border-radius:24px;padding:16px;border:0.5px solid '+C.border+';box-shadow:'+C.shadowSm+';animation:springUp 0.6s cubic-bezier(0.16,1,0.3,1) '+(i*0.08)+'s both">';
    html+='<div style="font-size:'+(m.big?24:26)+'px;font-weight:700;color:'+m[1]+';letter-spacing:-0.8px;line-height:1.1;margin-bottom:4px"><span class="stat-value" data-count="'+(m[0]||0)+'">0</span>'+(m.suf||'')+'</div>';
    html+='<div style="font-size:10px;color:'+C.text2+'">'+m[2]+'</div></div>';
  }
  html+='</div>';
  return html;
}

function section(title,right){
  return '<div style="display:flex;align-items:center;gap:12px;margin-bottom:14px">'+
    '<span style="font-size:11px;font-weight:600;color:'+C.text2+';text-transform:uppercase;letter-spacing:0.5px">'+title+'</span>'+
    '<div style="flex:1;height:0.5px;background:'+C.separator+'"></div>'+(right||'')+'</div>';
}

function chipFilter(text,active,onclick,color){
  var c=color||C.emerald;
  return '<span onclick="'+onclick+'" style="font-size:9px;font-weight:600;padding:4px 12px;border-radius:6px;cursor:pointer;background:'+(active?c+'14':'transparent')+';color:'+(active?c:C.text2)+';border:0.5px solid '+(active?c+'30':C.border)+';transition:all 0.2s;display:inline-block">'+text+'</span>';
}

// ===== SIGNAL CARD (detail page use) =====
function signalCard(s){
  var isBuy = s.type==='BULLISH'||s.type==='BUY';
  var tierColor = s.tier==='ELITE'?C.emerald:s.tier==='STRONG'?C.purple:C.gold;
  var tierBorder = s.tier==='ELITE'?C.emeraldBorder:s.tier==='STRONG'?C.purpleBorder:C.goldBorder;
  var tierDim = s.tier==='ELITE'?C.emeraldSoft:s.tier==='STRONG'?C.purpleSoft:C.goldSoft;
  var criteria = (s.criteria||[]).map(function(c){
    return '<span style="font-size:8px;font-weight:500;padding:3px 8px;border-radius:6px;background:'+C.emeraldSoft+';color:'+C.emerald+';border:0.5px solid '+C.emeraldBorder+'">'+c+'</span>';
  }).join('');
  return card(
    '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px">'+
    '<div style="display:flex;align-items:center;gap:10px"><span style="font-size:17px;font-weight:600;color:'+C.white+';letter-spacing:-0.3px">'+s.pair+'</span>'+
    pill(s.tier,tierColor,tierDim,tierBorder,s.tier==='ELITE')+
    pill(isBuy?'BUY':'SELL',isBuy?C.emerald:C.rose,isBuy?C.emeraldSoft:C.roseSoft,isBuy?C.emeraldBorder:C.roseBorder)+'</div>'+
    '<span style="font-size:10px;color:'+C.text2+'">'+(s.score||'')+'/'+(s.criteria?4:0)+' \u00b7 '+timeAgo(s.time)+'</span></div>'+
    '<div style="display:flex;gap:20px;font-size:12px;color:'+C.text2+';margin-bottom:8px">'+
    '<span>Entry <b style="color:'+C.white+';font-weight:600">'+fmt(s.entry)+'</b></span>'+
    '<span>SL <b style="color:'+C.rose+';font-weight:600">'+fmt(s.sl)+'</b></span>'+
    (s.tp1?'<span>TP1 <b style="color:'+C.gold+';font-weight:600">'+fmt(s.tp1)+'</b></span>':'')+
    (s.tp2?'<span>TP2 <b style="color:'+C.emerald+';font-weight:600">'+fmt(s.tp2)+'</b></span>':'')+
    '</div><div style="display:flex;gap:4px;flex-wrap:wrap">'+criteria+'</div>'+
    (s.dailyPOI?'<div style="font-size:10px;color:'+C.emerald+';font-weight:500;margin-top:10px;display:flex;align-items:center;gap:6px"><span style="font-size:12px;opacity:0.7">\uD83C\uDFDB</span>Daily POI: '+s.dailyPOI+'</div>':''),
    {border:tierBorder,accent:tierBorder.replace('0.12','0.2')}
  );
}

// ===== ACTIVE TRADE WIDGET =====
function activeTradeWidget(t){
  var isB = t.type==='BULLISH';
  var progress = t.tp1?Math.min(100,Math.max(0,((isB?t.qmLevel-(t.tp1):(t.tp1)-t.qmLevel)/(isB?t.qmLevel-(t.tp1||t.sl):(t.tp1||t.sl)-t.qmLevel))*100)):0;
  var badges = '';
  if(t.tp1Fired)badges+='<span style="font-size:8px;font-weight:500;padding:3px 8px;border-radius:6px;background:'+C.emeraldSoft+';color:'+C.emerald+';border:0.5px solid '+C.emeraldBorder+'">TP1 ✓</span>';
  if(t.beFired)badges+='<span style="font-size:8px;font-weight:500;padding:3px 8px;border-radius:6px;background:'+C.roseSoft+';color:'+C.rose+';border:0.5px solid '+C.roseBorder+'">BE ✓</span>';
  if(t.trailActive)badges+='<span style="font-size:8px;font-weight:500;padding:3px 8px;border-radius:6px;background:'+C.goldSoft+';color:'+C.gold+';border:0.5px solid '+C.goldBorder+'">Trailing</span>';
  var dur='';
  if(t.openTime){var ms=Date.now()-t.openTime;dur=Math.floor(ms/3600000)+'h '+Math.floor((ms%3600000)/60000)+'m';}
  var rVal=((t.tp1?Math.abs(t.tp1-t.qmLevel):0)/Math.abs(t.qmLevel-t.sl)).toFixed(1)||'0.0';
  return card(
    '<div style="display:flex;align-items:center;gap:12px;margin-bottom:16px">'+
    '<div style="width:8px;height:8px;border-radius:50%;background:'+C.emerald+';box-shadow:0 0 12px rgba(45,212,191,0.2);animation:breathe 2s ease-in-out infinite"></div>'+
    '<span style="font-size:18px;font-weight:600;letter-spacing:-0.3px;color:'+C.white+'">'+(t.instName||t.instId)+'</span>'+
    '<span style="font-size:11px;color:'+C.text2+';font-weight:400">'+t.tf+'</span>'+
    '<span style="margin-left:auto">'+pill(isB?'BUY':'SELL',isB?C.emerald:C.rose,isB?C.emeraldSoft:C.roseSoft,isB?C.emeraldBorder:C.roseBorder)+'</span></div>'+
    '<div style="display:grid;grid-template-columns:1fr 1fr 1fr 1fr;gap:12px;margin-bottom:14px">'+
    '<div><div style="font-size:9px;color:'+C.text2+';font-weight:500;margin-bottom:3px">Entry</div><div style="font-size:15px;font-weight:600;color:'+C.white+'">'+fmt(t.qmLevel)+'</div></div>'+
    '<div><div style="font-size:9px;color:'+C.text2+';font-weight:500;margin-bottom:3px">Current</div><div style="font-size:15px;font-weight:600;color:'+C.emerald+'">'+(t.tp1||fmt(t.qmLevel))+'</div></div>'+
    '<div><div style="font-size:9px;color:'+C.text2+';font-weight:500;margin-bottom:3px">TP1</div><div style="font-size:15px;font-weight:600;color:'+C.gold+'">'+(t.tp1?fmt(t.tp1):'--')+'</div></div>'+
    '<div><div style="font-size:9px;color:'+C.text2+';font-weight:500;margin-bottom:3px">Return</div><div style="font-size:15px;font-weight:600;color:'+C.emerald+'">+'+rVal+'R</div></div></div>'+
    '<div class="progress-track"><div class="progress-fill" style="animation:fillBar 1.2s cubic-bezier(0.16,1,0.3,1) 0.4s forwards;width:'+progress+'%;background:linear-gradient(90deg,'+C.emerald+','+C.gold+')"></div></div>'+
    '<div style="display:flex;justify-content:space-between;margin-top:10px;font-size:10px;color:'+C.text2+'"><span>'+dur+' ago</span><div style="display:flex;gap:6px">'+badges+'</div></div>',
    {border:C.emeraldBorder,accent:C.emerald,delay:0}
  );
}

// ===== DETAIL PAGE =====
function detailPage(s){
  var isBuy=s.type==='BULLISH'||s.type==='BUY';
  var tierColor=s.tier==='ELITE'?C.emerald:C.gold;
  var criteriaList=(s.criteria||[]).map(function(c){
    return '<div style="display:flex;align-items:center;gap:8px;padding:6px 0">'+
      '<span style="width:16px;height:16px;border-radius:4px;background:'+C.emeraldSoft+';display:flex;align-items:center;justify-content:center;font-size:9px;color:'+C.emerald+'">✓</span>'+
      '<span style="font-size:13px;color:'+C.white+'">'+c+'</span></div>';
  }).join('');
  var chartHtml=s.chartUrl
    ?'<img src="'+withCode(s.chartUrl)+'" style="width:100%;display:block;border-radius:14px" alt="Signal chart">'
    :'<div style="height:170px;display:flex;align-items:center;justify-content:center;color:'+C.text2+';font-size:12px;border:0.5px solid '+C.border+';border-radius:24px">Chart unavailable</div>';
  return '<div style="display:flex;flex-direction:column;height:100%;background:'+C.bg+';color:'+C.white+'">'+
    '<div style="flex:1;overflow-y:auto;background:'+C.bg+';color:'+C.white+'">'+
    '<div style="display:flex;align-items:center;gap:12px;padding:calc(20px + env(safe-area-inset-top)) 20px 10px">'+
    '<button onclick="closeDetail()" style="width:34px;height:34px;border-radius:10px;background:'+C.surface+';border:0.5px solid '+C.border+';display:flex;align-items:center;justify-content:center;cursor:pointer">'+
    '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="'+C.white+'" stroke-width="2" stroke-linecap="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg></button>'+
    '<div><div style="font-weight:600;font-size:18px;letter-spacing:-0.3px;color:'+C.white+'">'+s.pair+' \u00b7 '+s.tf+'</div>'+
    '<div style="color:'+C.text2+';font-size:11px">'+timeAgo(s.time)+' \u00b7 '+(s.system||'QMR')+' Signal</div></div></div>'+
    '<div style="padding:0 20px">'+
    '<div style="display:flex;gap:8px;margin-bottom:14px;flex-wrap:wrap">'+
    pill(s.tier,tierColor,s.tier==='ELITE'?C.emeraldSoft:C.goldSoft,s.tier==='ELITE'?C.emeraldBorder:C.goldBorder)+
    pill(s.type,isBuy?C.emerald:C.rose,isBuy?C.emeraldSoft:C.roseSoft,isBuy?C.emeraldBorder:C.roseBorder)+
    '</div>'+chartHtml+
    '<div style="display:flex;justify-content:space-between;margin:12px 0 18px;font-size:10px;color:'+C.text2+'">'+
    '<span style="color:'+C.emerald+'">\u25cf Entry</span>'+
    '<span style="color:'+C.rose+'">\u25cf SL</span>'+
    '<span style="color:'+C.gold+'">\u25cf TP</span></div>'+
    '<div style="font-size:14px;font-weight:600;margin-bottom:10px;color:'+C.white+'">Trade Levels</div>'+
    card(
      '<div style="display:flex;justify-content:space-between;padding:9px 0"><span style="color:'+C.text2+'">'+(s.refinedEntry?'4H Zone':'Entry')+'</span>'+mono(fmt(s.entry),C.white,16)+'</div>'+
      (s.refinedEntry?'<div style="display:flex;justify-content:space-between;padding:9px 0"><span style="color:'+C.gold+'">\uD83C\uDFDB Refined Entry</span>'+mono(fmt(s.refinedEntry),C.gold,16)+'</div>':'')+
      '<div style="display:flex;justify-content:space-between;padding:9px 0"><span style="color:'+C.rose+'">\uD83D\uDEE1 Stop Loss</span>'+mono(fmt(s.sl),C.rose,16)+'</div>'+
      (s.tp1?'<div style="display:flex;justify-content:space-between;padding:9px 0"><span style="color:'+C.text2+'">TP1</span>'+mono(fmt(s.tp1),C.gold,16)+'</div>':'')+
      (s.tp2?'<div style="display:flex;justify-content:space-between;padding:9px 0"><span style="color:'+C.text2+'">TP2</span>'+mono(fmt(s.tp2),C.emerald,16)+'</div>':''),
      {border:C.border,delay:0}
    )+
    '<div style="font-size:14px;font-weight:600;margin-bottom:10px;margin-top:10px;color:'+C.white+'">Criteria '+(s.score?'\u2014 '+s.score+'/4':'')+'</div>'+
    card(criteriaList,{border:C.border,delay:0.04})+
    (s.counterTrend?'<div style="background:'+C.goldSoft+';border:0.5px solid '+C.goldBorder+';border-radius:24px;padding:14px;margin-bottom:18px;display:flex;gap:8px"><span style="font-size:14px;flex-shrink:0">⚠</span><span style="color:'+C.gold+';font-size:12.5px;font-weight:600">Counter-trend setup \u2014 '+(s.htfBias||'')+'. Reduce position size.</span></div>':'')+
    '<button onclick="toggleTrack(\''+s.id+'\','+!!s.isTracked+')" style="width:100%;background:'+(s.isTracked?C.emeraldSoft:'transparent')+';border:0.5px solid '+(s.isTracked?C.emerald:C.border)+';border-radius:99px;padding:14px 0;display:flex;align-items:center;justify-content:center;gap:8px;cursor:pointer;margin-bottom:12px;color:'+(s.isTracked?C.emerald:C.text2)+'">'+
    '<span style="font-weight:600;font-size:13px">'+(s.isTracked?"I'm in this trade \u2014 notify me":'Track this trade')+'</span></button>'+
    '<div style="height:28px"></div></div></div></div>';
}

// ===== HOME =====
function homeScreen(){
  var st=state.stats||{};
  var html='<div style="padding:calc(20px + env(safe-area-inset-top,10px)) 20px 0">';
  html+='<div style="margin-bottom:24px"><div style="font-size:22px;font-weight:600;letter-spacing:-0.3px;color:'+C.white+'">Dashboard</div></div>';

  // Stats 2x2
  var wins=0;
  for(var i=0;i<state.signals.length;i++)if(state.signals[i].outcome==='WIN'||state.signals[i].outcome==='TP1')wins++;
  var activeCount=state.active.length;
  html+=statGrid([
    [st.winRate||0,C.emerald,'Win Rate',{suf:'%'}],
    [(st.totalR||0),C.gold,'Total R'],
    [activeCount||0,C.white,'Active'],
    [wins||0,C.purple,'Wins'],
  ]);

  // Active trades
  if(activeCount){
    html+=section('Active','<span style="display:inline-flex;align-items:center;gap:4px;font-size:9px;font-weight:600;letter-spacing:0.2px;padding:4px 12px;border-radius:6px;background:'+C.emeraldSoft+';color:'+C.emerald+';border:0.5px solid '+C.emeraldBorder+'">LIVE</span>');
    for(var i=0;i<state.active.length;i++)html+=activeTradeWidget(state.active[i]);
  }

  // Market Pulse
  if(state.confluence.length){
    html+=section('Market Pulse');
    html+='<div style="display:flex;gap:8px;overflow-x:auto;scrollbar-width:none;padding-bottom:4px;margin-bottom:20px">';
    for(var i=0;i<Math.min(state.confluence.length,11);i++){
      var p=state.confluence[i];
      var c=p.signalDir==='BULLISH'?C.emerald:p.signalDir==='BEARISH'?C.rose:C.text2;
      html+='<div style="display:flex;align-items:center;gap:8px;padding:10px 18px;border-radius:12px;background:'+C.surface+';border:0.5px solid '+C.border+';white-space:nowrap;font-size:12px;font-weight:500;color:'+C.white+';box-shadow:'+C.shadowSm+';animation:springUp 0.5s cubic-bezier(0.16,1,0.3,1) '+(0.15+i*0.04)+'s both">';
      html+='<span style="width:5px;height:5px;border-radius:50%;background:'+c+';box-shadow:0 0 8px '+c+'40"></span>'+(p.name||p.id)+'</div>';
    }
    html+='</div>';
  }

  // Signals
  var hasSignals=false;
  for(var i=0;i<state.signals.length;i++){
    var s=state.signals[i];
    if(s.outcome||(s.isTracked))continue;
    hasSignals=true;
  }
  if(hasSignals){
    html+=section('Signals');
    for(var i=0;i<state.signals.length;i++){
      var s=state.signals[i];
      if(s.outcome||(s.isTracked))continue;
      html+=signalCard(s);
    }
  }

  if(!activeCount&&!hasSignals){
    html+=card(
      '<div style="text-align:center;padding:20px;color:'+C.text2+';font-size:12px">'+
      (state.fetchError?'Connection problem: '+state.fetchError:'No signals yet. Waiting for the next scan...')+'</div>',
      {border:C.border,delay:0}
    );
  }

  html+='<div style="height:28px"></div></div>';
  return html;
}

// ===== JOURNAL =====
function journalScreen(){
  var en=state.journal;
  var w=en.filter(function(e){return e.outcome==='WIN'||e.outcome==='TP1'||e.outcome==='TP2'});
  var l=en.filter(function(e){return e.outcome==='SL'});
  var wr=Math.round(w.length/(w.length+l.length)*100)||0;
  var tr=0;
  for(var i=0;i<en.length;i++)tr+=(e.rMultiple||0);
  tr=parseFloat(tr.toFixed(1));

  var html='<div style="padding:calc(20px + env(safe-area-inset-top,10px)) 20px 0">';
  html+='<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:24px">';
  html+='<div style="font-size:22px;font-weight:600;letter-spacing:-0.3px;color:'+C.white+'">Journal</div>';
  html+='<div style="display:flex;gap:12px;align-items:center"><span onclick="toggleEntryForm()" style="font-size:20px;font-weight:600;color:'+C.emerald+';cursor:pointer">+</span><span onclick="window.open(withCode(\'/api/journal\'),\'_blank\')" style="font-size:11px;color:'+C.text2+';cursor:pointer;font-weight:500">Export</span></div></div>';

  html+=statGrid([
    [wr,C.emerald,'Win Rate',{suf:'%'}],
    [tr,C.gold,'Total R'],
    [en.length,C.white,'Trades'],
    [l.length,C.rose,'Losses'],
  ]);

  // 28-Day heatmap
  if(en.length){
    var now=new Date();
    var start=new Date(Date.UTC(now.getUTCFullYear(),now.getUTCMonth(),now.getUTCDate()));
    start.setUTCDate(start.getUTCDate()-27);
    html+=card(
      '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">'+
      '<span style="font-size:14px;font-weight:600;color:'+C.white+';letter-spacing:-0.2px">28-Day Activity</span>'+
      '<div style="display:flex;gap:10px;font-size:8px;color:'+C.text2+'"><span><span style="display:inline-block;width:7px;height:7px;border-radius:2px;background:'+C.emerald+';vertical-align:middle;margin-right:4px"></span>Win</span>'+
      '<span><span style="display:inline-block;width:7px;height:7px;border-radius:2px;background:'+C.rose+';vertical-align:middle;margin-right:4px"></span>Loss</span>'+
      '<span><span style="display:inline-block;width:7px;height:7px;border-radius:2px;background:'+C.gold+';vertical-align:middle;margin-right:4px"></span>BE</span></div></div>'+
      '<div style="font-size:10px;color:'+C.text2+';margin-bottom:10px">'+now.toLocaleDateString('en-US',{month:'long',year:'numeric'})+'</div>'+
      (function(){
        var days=['M','T','W','T','F','S','S'];
        var h='<div style="display:flex;gap:3px;margin-bottom:4px">';
        for(var d=0;d<days.length;d++)h+='<span style="font-size:7px;color:'+C.text2+';width:11px;text-align:center;font-weight:500">'+days[d]+'</span>';
        h+='</div>';
        for(var w=0;w<4;w++){
          h+='<div style="display:flex;gap:3px;margin-bottom:3px">';
          for(var d=0;d<7;d++){
            var dd=new Date(start);dd.setUTCDate(start.getUTCDate()+w*7+d);
            var ds=dd.toISOString().slice(0,10);
            var match=null;
            for(var j=0;j<en.length;j++)if(en[j].createdAt&&en[j].createdAt.slice(0,10)===ds){match=en[j];break;}
            var col=match?(match.outcome==='WIN'||match.outcome==='TP1'||match.outcome==='TP2'?C.emerald:match.outcome==='SL'?C.rose:C.gold):'rgba(255,255,255,0.03)';
            h+='<span style="display:inline-block;width:11px;height:11px;border-radius:3px;background:'+col+'"></span>';
          }
          h+='</div>';
        }
        return h;
      })(),
      {border:C.emeraldBorder,accent:C.emerald,delay:0.08}
    );
  }

  // Filters
  var filters=['all','wins','losses','BE'];
  html+='<div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:16px">';
  for(var i=0;i<filters.length;i++){
    var a=state.journalFilter===filters[i];
    var fl=filters[i]==='all'?'All':filters[i].charAt(0).toUpperCase()+filters[i].slice(1);
    html+=chipFilter(fl,a,'setJournalFilter(\''+filters[i]+'\')');
  }
  html+='</div>';

  // Entries
  var filtered=state.journalFilter==='all'?en
    :state.journalFilter==='wins'?w
    :state.journalFilter==='losses'?l
    :en.filter(function(e){return e.outcome===state.journalFilter;});

  if(filtered.length){
    for(var i=0;i<filtered.length;i++){
      var e=filtered[i];
      var iw=e.outcome==='WIN'||e.outcome==='TP1'||e.outcome==='TP2';
      var ic=iw?C.emerald:e.outcome==='SL'?C.rose:C.gold;
      var ib=iw?C.emeraldBorder:e.outcome==='SL'?C.roseBorder:C.goldBorder;
      var ibg=iw?C.emeraldSoft:e.outcome==='SL'?C.roseSoft:C.goldSoft;

      html+=card(
        '<div style="display:flex;gap:14px;align-items:flex-start">'+
        '<div style="width:32px;height:32px;border-radius:10px;flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;background:'+ibg+';color:'+ic+';border:0.5px solid '+ib+'">'+(iw?'W':e.outcome==='SL'?'L':'BE')+'</div>'+
        '<div style="flex:1;min-width:0">'+
        '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:2px">'+
        '<span style="font-size:15px;font-weight:600;color:'+C.white+'">'+e.pair+' <span style="font-weight:400;color:'+C.text2+'">'+e.tf+'</span></span>'+
        '<span style="font-size:15px;font-weight:700;color:'+ic+'">'+(e.rMultiple>=0?'+':'')+e.rMultiple+'R</span></div>'+
        '<div style="font-size:10px;color:'+C.text2+'">'+(e.direction||'')+' \u00b7 '+(e.duration||'')+' \u00b7 '+timeAgo(e.createdAt)+'</div>'+
        (e.notes?'<div style="font-size:11px;color:'+C.text2+';margin-top:6px;line-height:1.5;border-left:1.5px solid '+ib+';padding-left:10px">'+e.notes+'</div>':'')+
        ((e.tags&&e.tags.length)?'<div style="display:flex;gap:4px;margin-top:8px">'+e.tags.map(function(t){return '<span style="font-size:8px;font-weight:500;padding:3px 8px;border-radius:6px;background:'+C.emeraldSoft+';color:'+C.emerald+';border:0.5px solid '+C.emeraldBorder+'">'+t+'</span>';}).join('')+'</div>':'')+
        '</div></div>',
        {border:ib,accent:ib.replace('0.12','0.15'),delay:0.12+i*0.08}
      );
    }
  }else{
    html+=card(
      '<div style="text-align:center;padding:20px;color:'+C.text2+';font-size:12px">'+
      (state.journalFilter==='all'?'No journal entries yet. Tap "+ New Journal Entry" to start tracking your trades.':'No entries match this filter.')+'</div>',
      {border:C.border,delay:0}
    );
  }

  html+=(state.showEntryForm||state.editingEntry?journalEntryForm():'');
  html+='<div style="height:28px"></div></div>';
  return html;
}

// ===== JOURNAL ENTRY FORM =====
function journalEntryForm(){
  var edit=state.editingEntry;
  var title=edit?'Edit Journal Entry':'New Journal Entry';
  var btnLabel=edit?'Update Entry':'Save Entry';
  var pairV=edit?(edit.pair||''):'';
  var dirV=edit?(edit.direction||'BUY'):'BUY';
  var tfV=edit?(edit.tf||'4H'):'4H';
  var outV=edit?(edit.outcome||'WIN'):'WIN';
  var rV=edit?(edit.rMultiple||''):'';
  var durV=edit?(edit.duration||''):'';
  var notesV=edit?(edit.notes||''):'';
  var tagOpts=['Displacement','Liq Sweep','MSS','Eng. Liq','FVG','OB','CRT','Early Entry','Confident','Impatient','Neutral'];

  var sel=function(v,val){return v===val?'selected':'';};
  var tagsHtml='';
  for(var i=0;i<tagOpts.length;i++){
    var active=edit&&edit.tags&&edit.tags.indexOf(tagOpts[i])!==-1;
    tagsHtml+='<span onclick="toggleTag(this,\''+tagOpts[i]+'\')" style="font-size:9px;padding:4px 10px;border-radius:6px;cursor:pointer;background:'+(active?C.emeraldSoft:'transparent')+';color:'+(active?C.emerald:C.text2)+';border:0.5px solid '+(active?C.emeraldBorder:C.border)+'">'+tagOpts[i]+'</span>';
  }

  var deleteHtml=edit?'<div style="text-align:center;margin-top:10px"><span onclick="deleteEntry(\''+edit.id+'\')" style="font-size:12px;color:'+C.rose+';font-weight:600;cursor:pointer">Delete this entry</span></div>':'';

  return card(
    '<div style="font-size:13px;font-weight:600;color:'+C.white+';margin-bottom:12px">'+title+'</div>'+
    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:10px">'+
    '<input id="jPair" value="'+pairV+'" placeholder="Pair (e.g. EURUSD)" style="background:'+C.bg+';border:0.5px solid '+C.border+';border-radius:8px;padding:10px;color:'+C.white+';font-size:12px;outline:none">'+
    '<select id="jDir" style="background:'+C.bg+';border:0.5px solid '+C.border+';border-radius:8px;padding:10px;color:'+C.white+';font-size:12px;outline:none">'+
    '<option value="BUY" '+sel(dirV,'BUY')+'>BUY</option><option value="SELL" '+sel(dirV,'SELL')+'>SELL</option></select>'+
    '<select id="jTF" style="background:'+C.bg+';border:0.5px solid '+C.border+';border-radius:8px;padding:10px;color:'+C.white+';font-size:12px;outline:none">'+
    '<option value="1H" '+sel(tfV,'1H')+'>1H</option><option value="4H" '+sel(tfV,'4H')+'>4H</option><option value="DAILY" '+sel(tfV,'DAILY')+'>DAILY</option></select>'+
    '<select id="jOutcome" style="background:'+C.bg+';border:0.5px solid '+C.border+';border-radius:8px;padding:10px;color:'+C.white+';font-size:12px;outline:none">'+
    '<option value="WIN" '+sel(outV,'WIN')+'>WIN</option><option value="TP1" '+sel(outV,'TP1')+'>TP1</option><option value="TP2" '+sel(outV,'TP2')+'>TP2</option>'+
    '<option value="SL" '+sel(outV,'SL')+'>SL</option><option value="BE" '+sel(outV,'BE')+'>BE</option></select>'+
    '<input id="jR" type="number" step="0.1" value="'+rV+'" placeholder="R multiple (e.g. 1.8)" style="background:'+C.bg+';border:0.5px solid '+C.border+';border-radius:8px;padding:10px;color:'+C.white+';font-size:12px;outline:none">'+
    '<input id="jDuration" value="'+durV+'" placeholder="Duration (e.g. 2h 34m)" style="background:'+C.bg+';border:0.5px solid '+C.border+';border-radius:8px;padding:10px;color:'+C.white+';font-size:12px;outline:none">'+
    '</div>'+
    '<textarea id="jNotes" placeholder="Notes about the trade..." style="width:100%;background:'+C.bg+';border:0.5px solid '+C.border+';border-radius:8px;padding:10px;color:'+C.white+';font-size:12px;outline:none;resize:none;height:60px;font-family:inherit">'+notesV+'</textarea>'+
    '<div style="display:flex;gap:6px;flex-wrap:wrap;margin:10px 0">'+tagsHtml+'</div>'+
    '<div style="display:flex;gap:8px">'+
    '<button onclick="saveJournalEntry()" class="btn-primary" style="flex:1">'+btnLabel+'</button>'+
    '<button onclick="toggleEntryForm()" class="btn-outline" style="flex:0">Cancel</button></div>'+
    deleteHtml+
    '<div id="jStatus" style="font-size:11px;color:'+C.emerald+';margin-top:8px;text-align:center"></div>',
    {border:C.emeraldBorder,delay:0}
  );
}

var selectedTags=[];
function toggleTag(el,tag){
  var idx=selectedTags.indexOf(tag);
  if(idx>-1){selectedTags.splice(idx,1);el.style.background='transparent';el.style.color=C.text2;el.style.borderColor=C.border;}
  else{selectedTags.push(tag);el.style.background=C.emeraldSoft;el.style.color=C.emerald;el.style.borderColor=C.emeraldBorder;}
}

async function saveJournalEntry(){
  var pair=document.getElementById('jPair').value.trim().toUpperCase();
  var direction=document.getElementById('jDir').value;
  var tf=document.getElementById('jTF').value;
  var outcome=document.getElementById('jOutcome').value;
  var rMultiple=parseFloat(document.getElementById('jR').value)||0;
  var duration=document.getElementById('jDuration').value;
  var notes=document.getElementById('jNotes').value.trim();
  var edit=state.editingEntry;
  if(!pair){document.getElementById('jStatus').textContent='Pair is required';return;}
  try{
    var body={pair:pair,direction:direction,tf:tf,outcome:outcome,rMultiple:rMultiple,duration:duration,notes:notes,tags:selectedTags.slice()};
    var res;
    if(edit){res=await fetch(withCode('/api/journal/'+edit.id),{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});}
    else{res=await fetch(withCode('/api/journal'),{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});}
    if(res.ok){
      state.showEntryForm=false;state.editingEntry=null;selectedTags=[];state.journalFilter='all';
      var jRes=await fetch(withCode('/api/journal'));
      if(jRes.ok)state.journal=(await jRes.json()).entries||[];
      render();
    }else{document.getElementById('jStatus').textContent='Failed to save';}
  }catch(e){document.getElementById('jStatus').textContent='Connection error';}
}

function toggleEntryForm(){state.showEntryForm=!state.showEntryForm;state.editingEntry=null;if(!state.showEntryForm)selectedTags=[];render();}
window.editEntry=function(id){
  state.editingEntry=null;
  for(var i=0;i<state.journal.length;i++)if(state.journal[i].id===id){state.editingEntry=state.journal[i];break;}
  if(state.editingEntry)selectedTags=(state.editingEntry.tags||[]).slice();
  state.showEntryForm=false;render();
};
window.deleteEntry=async function(id){
  if(!confirm('Delete this journal entry?'))return;
  try{
    await fetch(withCode('/api/journal/'+id),{method:'DELETE'});
    state.editingEntry=null;selectedTags=[];
    var jRes=await fetch(withCode('/api/journal'));
    if(jRes.ok)state.journal=(await jRes.json()).entries||[];
    render();
  }catch(e){console.error('Delete failed',e);}
};

window.setJournalFilter=function(f){state.journalFilter=f;render();};
window.setCalFilter=function(k,v){state.calF[k]=v;render();};
window.setNewsFilter=function(f){state.newsF=f;render();};

// ===== CALENDAR =====
function calendarScreen(){
  var ev=state.news||[];
  var icol={High:C.rose,Medium:C.gold,Low:C.emerald};
  var ibol={High:C.roseBorder,Medium:C.goldBorder,Low:C.emeraldBorder};

  var html='<div style="padding:calc(20px + env(safe-area-inset-top,10px)) 20px 0">';
  html+='<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:24px">';
  html+='<div style="font-size:22px;font-weight:600;letter-spacing:-0.3px;color:'+C.white+'">Calendar</div>';
  html+='<span onclick="fetchAll()" style="font-size:11px;color:'+C.emerald+';cursor:pointer;font-weight:500">\u21BB</span></div>';

  // Country filter
  var countries=['all'];
  for(var i=0;i<ev.length;i++)if(ev[i].country&&countries.indexOf(ev[i].country)===-1)countries.push(ev[i].country);
  html+='<div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:8px">';
  for(var i=0;i<countries.length;i++){
    var a=state.calF.co===countries[i];
    html+=chipFilter(countries[i]==='all'?'All':countries[i],a,'setCalFilter(\'co\',\''+countries[i]+'\')');
  }
  html+='</div>';

  // Impact filter
  var im=['all','High','Medium','Low'];
  html+='<div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:20px">';
  for(var i=0;i<im.length;i++){
    var a=state.calF.im===im[i];
    var cl=im[i]==='all'?C.text2:icol[im[i]];
    html+='<span onclick="setCalFilter(\'im\',\''+im[i]+'\')" style="font-size:9px;font-weight:600;padding:4px 12px;border-radius:6px;cursor:pointer;background:'+(a?cl+'14':'transparent')+';color:'+(a?cl:C.text2)+';border:0.5px solid '+(a?cl+'30':C.border)+';transition:all 0.2s">'+im[i]+'</span>';
  }
  html+='</div>';

  // Filter logic
  var filtered=ev;
  if(state.calF.co!=='all')filtered=filtered.filter(function(e){return e.country===state.calF.co;});
  if(state.calF.im!=='all')filtered=filtered.filter(function(e){return e.impact===state.calF.im;});

  if(filtered.length){
    for(var i=0;i<filtered.length;i++){
      var e=filtered[i];
      var c=icol[e.impact]||C.text2;
      var cb=ibol[e.impact]||C.border;
      var bars=e.impact==='High'?3:e.impact==='Medium'?2:1;
      var ts=e.date?new Date(e.date).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'}):'--:--';
      var released=!!e.actual;
      var eventDate=e.date?new Date(e.date):null;
      var cd='';
      if(!released&&eventDate&&eventDate>new Date()){
        var dd=Math.floor((eventDate-new Date())/86400000);
        var hh=Math.floor(((eventDate-new Date())%86400000)/3600000);
        cd=(dd>0?dd+'d ':'')+hh+'h';
      }

      html+=card(
        '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px">'+
        '<div style="font-size:10px;font-weight:600;color:'+c+'">'+e.impact+' \u00b7 '+ts+
        (cd?' <span style="color:'+C.emerald+';font-weight:600;margin-left:8px">\u23F1'+cd+'</span>':'')+
        '</div>'+
        (released?'<span style="font-size:8px;font-weight:600;padding:3px 10px;border-radius:6px;background:'+C.emeraldSoft+';color:'+C.emerald+';border:0.5px solid '+C.emeraldBorder+'">Released</span>':'')+
        '</div>'+
        '<div style="font-size:15px;font-weight:600;color:'+C.white+';margin-top:4px;letter-spacing:-0.2px">'+(e.title||e.country||'')+'</div>'+
        ((e.previous||e.forecast||e.actual)?'<div style="display:flex;gap:16px;font-size:10px;color:'+C.text2+';margin-top:8px">'+
        (e.previous?'Prev <b style="color:'+C.white+';font-weight:600">'+e.previous+'</b>':'')+
        (e.forecast?'Fcst <b style="color:'+C.white+';font-weight:600">'+e.forecast+'</b>':'')+
        (e.actual?'Actual <b style="color:'+C.emerald+';font-weight:600">'+e.actual+'</b>':'')+
        '</div>':'')+
        '<div style="display:flex;gap:3px;margin-top:8px">'+
        (function(){var h='';for(var j=0;j<3;j++)h+='<span style="width:12px;height:3px;border-radius:99px;background:'+(j<bars?c:'rgba(255,255,255,0.03)')+'"></span>';return h;})()+
        '</div>',
        {border:cb,accent:cb.replace('0.12','0.15'),delay:0.08+i*0.06}
      );
    }
  }else{
    html+=card(
      '<div style="text-align:center;padding:20px;color:'+C.text2+';font-size:12px">No events match the selected filters.</div>',
      {border:C.border}
    );
  }

  html+='<div style="height:28px"></div></div>';
  return html;
}

// ===== NEWS =====
function newsScreen(){
  var ar=state.articles||[];
  var nf=state.newsF;
  var ccs={Forex:C.emerald,Economy:C.gold,Geopolitics:C.rose,Commodities:'#FB923C'};
  var cbs={Forex:C.emeraldBorder,Economy:C.goldBorder,Geopolitics:C.roseBorder,Commodities:'rgba(251,146,60,0.15)'};
  var ca=['All','Forex','Economy','Geopolitics','Commodities'];

  var html='<div style="padding:calc(20px + env(safe-area-inset-top,10px)) 20px 0">';
  html+='<div style="font-size:22px;font-weight:600;letter-spacing:-0.3px;color:'+C.white+';margin-bottom:20px">News</div>';

  html+='<div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:20px">';
  for(var i=0;i<ca.length;i++){
    var a=nf===ca[i];
    var cl=ca[i]==='All'?C.text2:ccs[ca[i]];
    html+=chipFilter(ca[i],a,'setNewsFilter(\''+ca[i]+'\')',cl);
  }
  html+='</div>';

  var filtered=nf==='All'?ar:ar.filter(function(a){return a.category===nf;});

  if(filtered.length){
    var hero=filtered[0];
    var hc=ccs[hero.category]||C.text2;
    html+=card(
      '<div style="height:140px;background:linear-gradient(135deg,rgba(45,212,191,0.03),rgba(167,139,250,0.03));border-radius:16px;margin:-20px;margin-bottom:12px;display:flex;align-items:flex-end;position:relative;padding:20px;border-bottom:0.5px solid '+hc+'">'+
      '<div style="position:absolute;top:14px;right:14px">'+pill('Featured',hc,hc+'14',hc+'30')+'</div>'+
      '<div><span style="font-size:9px;color:'+C.text2+'">'+(hero.source||'')+' \u00b7 '+timeAgo(hero.time)+'</span>'+
      '<div style="font-size:17px;font-weight:600;color:'+C.white+';margin-top:6px;line-height:1.3;letter-spacing:-0.2px">'+hero.title+'</div></div></div>',
      {border:hc,delay:0}
    );

    for(var i=1;i<filtered.length;i++){
      var a=filtered[i];
      var cl=ccs[a.category]||C.text2;
      var cb=cbs[a.category]||C.border;
      html+=card(
        '<div style="display:flex;gap:6px;align-items:center;margin-bottom:6px">'+
        pill(a.source||'',cl,cl+'14',cl+'30')+
        '<span style="font-size:9px;color:'+C.text2+'">'+timeAgo(a.time)+'</span></div>'+
        '<div style="font-size:14px;font-weight:600;color:'+C.white+';line-height:1.3;letter-spacing:-0.1px">'+a.title+'</div>',
        {border:cb,delay:0.08+i*0.06}
      );
    }
  }else{
    html+=card(
      '<div style="text-align:center;padding:20px;color:'+C.text2+';font-size:12px">No news available.</div>',
      {border:C.border}
    );
  }

  html+='<div style="height:28px"></div></div>';
  return html;
}

// ===== SETTINGS =====
function settingsScreen(){
  var prefs=state.notifPrefs||{};
  var pushHtml=document.getElementById('app')&&pushStatus==='subscribed'
    ?'<div class="toggle on"></div>'
    :'<div class="toggle '+(pushStatus==='subscribed'?'on':'')+'" onclick="'+(pushStatus==='subscribed'?'alert(\'To disable, go to iPhone Settings \u2192 Notifications \u2192 Slayers.\')':'enablePush()')+'"></div>';
  var notifItems=[
    ['Signal Alerts','signalAlerts','New ELITE/STRONG signals'],
    ['Trade Updates','tradeUpdates','TP1, BE, trail, SL hits'],
    ['Weekly Summary','weeklySummary','Sunday performance report'],
    ['News Alerts','newsAlerts','High-impact events'],
    ['Market Pulse','marketPulse','Daily market overview'],
  ];
  var notifToggles='';
  for(var i=0;i<notifItems.length;i++){
    var key=notifItems[i][1];
    var enabled=prefs[key]!==false;
    notifToggles+='<div class="setting-row"><div><div class="label" style="color:'+C.white+'">'+notifItems[i][0]+'</div><div class="hint">'+notifItems[i][2]+'</div></div>'+
      '<div class="toggle '+(enabled?'on':'')+'" onclick="toggleNotifPref(\''+key+'\','+(!enabled)+')"></div></div>';
  }

  var html='<div style="padding:calc(20px + env(safe-area-inset-top,10px)) 20px 0">';
  html+='<div style="font-size:22px;font-weight:600;letter-spacing:-0.3px;color:'+C.white+';margin-bottom:20px">Settings</div>';

  html+=card(
    '<div style="display:flex;align-items:center;gap:14px">'+
    '<div style="width:44px;height:44px;border-radius:14px;background:linear-gradient(135deg,'+C.emerald+',#0D9488);display:flex;align-items:center;justify-content:center;font-weight:700;font-size:18px;color:#0A0E12;flex-shrink:0">S</div>'+
    '<div style="flex:1"><div style="font-size:15px;font-weight:600;color:'+C.white+'">Slayers Member</div><div style="font-size:10px;color:'+C.text2+';margin-top:3px">Code: '+(getCode().slice(0,8)||'')+'...</div></div>'+
    '<span style="font-size:20px;color:'+C.text2+'">\u203A</span></div>',
    {border:C.border,delay:0}
  );

  html+='<div style="font-size:11px;font-weight:600;color:'+C.text2+';text-transform:uppercase;letter-spacing:0.5px;padding:18px 2px 12px">Notifications</div>';

  html+=card(
    '<div class="setting-row"><div><div class="label" style="color:'+C.white+'">Push Notifications</div><div class="hint">Receive alerts on your phone</div></div>'+pushHtml+'</div>'+
    '<div class="setting-row"><div><div class="label" style="color:'+C.white+'">Sound Alerts</div><div class="hint">Play sound on new signals</div></div>'+
    '<div class="toggle on" onclick="this.classList.toggle(\'on\')"></div></div>'+
    notifToggles,
    {border:C.border,delay:0.04}
  );

  html+='<div style="font-size:11px;font-weight:600;color:'+C.text2+';text-transform:uppercase;letter-spacing:0.5px;padding:18px 2px 12px">About</div>';

  html+=card(
    '<div style="display:flex;align-items:center;justify-content:space-between;padding:12px 0"><div><div style="font-size:13px;font-weight:600;color:'+C.white+'">Version</div><div style="font-size:10px;color:'+C.text2+';margin-top:2px">Build '+new Date().toISOString().slice(0,10)+'</div></div><span style="font-size:13px;font-weight:600;color:'+C.text2+'">v10.0</span></div>'+
    '<div style="display:flex;align-items:center;justify-content:space-between;padding:12px 0;border-top:0.5px solid '+C.separator+'"><div><div style="font-size:13px;font-weight:600;color:'+C.white+'">Clear Local Data</div><div style="font-size:10px;color:'+C.text2+';margin-top:2px">Reset app cache</div></div>'+
    '<span onclick="localStorage.clear();location.reload()" style="font-size:12px;font-weight:600;color:'+C.rose+';cursor:pointer">Clear</span></div>',
    {border:C.border,delay:0.08}
  );

  html+='<div style="text-align:center;padding:24px 0 28px;font-size:10px;color:'+C.text2+';letter-spacing:0.3px">Made with intent \u00b7 Slayers Trading</div>';
  html+='</div>';
  return html;
}

async function toggleNotifPref(key,newVal){
  var prefs=Object.assign({},state.notifPrefs);
  prefs[key]=newVal;
  state.notifPrefs=prefs;
  render();
  try{await fetch(withCode('/api/member/notif-prefs'),{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({notifPrefs:prefs})});}
  catch(e){console.error('Notif save failed',e);}
}

function spawnEmbers(){
  var container=document.getElementById('embers');
  if(!container||container.children.length>0)return;
  for(var i=0;i<10;i++){
    var e=document.createElement('div');
    e.className='ember';
    e.style.left=Math.random()*100+'%';
    e.style.bottom='-10px';
    e.style.animationDuration=(12+Math.random()*10)+'s';
    e.style.animationDelay=(Math.random()*14)+'s';
    container.appendChild(e);
  }
}

// ===== MAIN RENDER =====
var tabs=[
  {k:'home',l:'Home',i:'home'},
  {k:'journal',l:'Journal',i:'book'},
  {k:'calendar',l:'Calendar',i:'cal'},
  {k:'news',l:'News',i:'globe'},
  {k:'settings',l:'Settings',i:'gear'},
];

var screens={
  home:homeScreen,
  journal:journalScreen,
  calendar:calendarScreen,
  news:newsScreen,
  settings:settingsScreen,
};

function render(){
  var app=document.getElementById('app');
  if(state.selected){app.innerHTML=detailPage(state.selected);return;}

  var content=screens[state.tab]?screens[state.tab]():homeScreen();
  var tabW=20,tabIndex=0;
  for(var i=0;i<tabs.length;i++)if(tabs[i].k===state.tab){tabIndex=i;break;}

  var nav='<div style="position:relative;display:flex;width:100%">';
  nav+='<div style="position:absolute;top:-0.5px;left:'+(tabIndex*tabW)+'%;width:20%;height:2px;border-radius:99px;background:'+C.emerald+';transition:left 0.35s cubic-bezier(0.16,1,0.3,1),width 0.35s cubic-bezier(0.16,1,0.3,1);box-shadow:0 0 20px rgba(45,212,191,0.2)"></div>';
  for(var i=0;i<tabs.length;i++){
    var t=tabs[i];
    var a=state.tab===t.k;
    nav+='<button data-tab="'+t.k+'" style="flex:1;display:flex;flex-direction:column;align-items:center;gap:2px;padding:10px 0 6px;border:none;background:none;cursor:pointer;color:'+(a?C.emerald:C.text2)+';font-family:inherit;transition:color 0.25s">'+
      icon(t.i,a?C.emerald:C.text2)+
      '<span style="font-size:8px;font-weight:'+(a?'700':'500')+';letter-spacing:0.2px">'+t.l+'</span></button>';
  }
  nav+='</div>';

  var skeleton=state.loading?'<div style="padding:40px 0"><div style="background:rgba(255,255,255,0.04);border-radius:24px;height:200px;margin-bottom:14px;animation:pulse 1.5s ease-in-out infinite"></div><div style="background:rgba(255,255,255,0.04);border-radius:24px;height:200px;animation:pulse 1.5s ease-in-out infinite"></div></div>':'';

  var html=
    '<div style="display:flex;flex-direction:column;height:100dvh;position:relative">'+
      '<div class="ptr-wrap" id="ptrWrap" style="height:0">'+
        '<div class="ptr-inner"><div class="ptr-logo" id="ptrLogo">S</div><span class="ptr-text" id="ptrText">Pull to refresh</span></div></div>'+
      '<div style="flex:1;overflow-y:auto;-webkit-overflow-scrolling:touch" id="scroll">'+(state.loading?skeleton:content)+'</div>'+
      '<div style="flex-shrink:0;z-index:10;background:'+C.tabBg+';border-top:0.5px solid '+C.tabBorder+';padding:0 8px calc(0px + env(safe-area-inset-bottom,0px))">'+
        nav+'</div>'+
      '<div id="embers" style="position:fixed;top:0;left:0;width:100%;height:100dvh;pointer-events:none;z-index:999;overflow:hidden"></div></div>';

  app.innerHTML=html;

  var btns=document.querySelectorAll('button[data-tab]');
  for(var i=0;i<btns.length;i++){
    btns[i].addEventListener('click',function(){
      var newTab=this.getAttribute('data-tab');
      if(newTab===state.tab)return;
      state.tab=newTab;state.selected=null;render();
    });
  }

  var sc=document.getElementById('scroll');
  if(sc)sc.scrollTop=0;
  setupPTR(sc);
  spawnEmbers();
  setTimeout(animateCounters,50);
}

window.setTab=function(t){state.tab=t;state.selected=null;render();};
window.openDetail=function(id){
  for(var i=0;i<state.signals.length;i++)if(state.signals[i].id===id){state.selected=state.signals[i];break;}
  render();
};
window.closeDetail=function(){state.selected=null;render();};
window.enablePush=enablePush;
window.toggleNotif=toggleNotifPref;
window.toggleNotifPref=toggleNotifPref;

window.toggleTrack=async function(signalId,currentlyTracking){
  try{
    if(currentlyTracking){await fetch(withCode('/api/track/'+encodeURIComponent(signalId)),{method:'DELETE'});}
    else{await fetch(withCode('/api/track'),{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({signalId:signalId})});}
    var sig=null;
    for(var i=0;i<state.signals.length;i++)if(state.signals[i].id===signalId){sig=state.signals[i];break;}
    if(sig)sig.isTracked=!currentlyTracking;
    if(state.selected&&state.selected.id===signalId)state.selected.isTracked=!currentlyTracking;
    render();
  }catch(e){console.error('Track toggle failed',e);}
};

// ===== LOGIN SCREEN =====
function renderLogin(errorMsg){
  var app=document.getElementById('app');
  app.innerHTML='<div style="min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:calc(24px + env(safe-area-inset-top)) 24px calc(24px + env(safe-area-inset-bottom));text-align:center;background:'+C.bg+';color:'+C.white+'">'+
    '<div style="font-weight:900;font-size:30px;letter-spacing:-1px;text-transform:uppercase;margin-bottom:6px">'+
    '<span style="color:'+C.white+'">THE </span><span style="color:'+C.emerald+';text-shadow:0 0 30px '+C.emerald+'55">SLAYERS</span></div>'+
    '<div style="color:'+C.text2+';font-size:12px;margin-bottom:32px">v10.0</div>'+
    '<div style="background:'+C.surface+';border-radius:24px;padding:24px;border:0.5px solid '+C.emeraldBorder+';width:100%;max-width:300px;box-shadow:'+C.shadowSm+'">'+
    '<div style="font-size:14px;font-weight:600;margin-bottom:10px;color:'+C.white+'">Enter your access code</div>'+
    '<input id="codeInput" type="text" placeholder="SLAY-XXXXXX" autocapitalize="characters" autocomplete="off" style="width:100%;background:rgba(0,0,0,0.35);border:0.5px solid '+C.border+';border-radius:12px;padding:14px;color:'+C.white+';font-size:16px;text-align:center;letter-spacing:2px;margin-bottom:14px;outline:none" class="mono"/>'+
    (errorMsg?'<div style="color:'+C.rose+';font-size:12.5px;margin-bottom:14px">'+errorMsg+'</div>':'')+
    '<button id="loginBtn" style="width:100%;background:'+C.emerald+';border:none;border-radius:99px;padding:15px 0;color:'+C.bg+';font-weight:800;font-size:14px;cursor:pointer">Unlock</button>'+
    '<div id="loginStatus" style="color:'+C.text2+';font-size:11.5px;margin-top:14px"></div></div>'+
    '<div style="color:'+C.text2+';font-size:11px;margin-top:40px">Don\'t have a code? Message Rexroz on Telegram.</div></div>'+
    '<div id="embers" style="position:fixed;top:0;left:0;width:100%;height:100dvh;pointer-events:none;z-index:999;overflow:hidden"></div>';
  document.getElementById('loginBtn').onclick=attemptLogin;
  document.getElementById('codeInput').addEventListener('keypress',function(e){if(e.key==='Enter')attemptLogin();});
  spawnEmbers();
}

async function attemptLogin(){
  var input=document.getElementById('codeInput');
  var status=document.getElementById('loginStatus');
  var code=input.value.trim().toUpperCase();
  if(!code)return;
  status.textContent='Checking...';
  saveCode(code);
  try{
    var res=await fetch(withCode('/api/member/stats'));
    if(res.status===401){clearCode();renderLogin('Invalid or expired access code. Check and try again.');return;}
    state.loading=true;
    state=Object.assign(state,{
      signals:[],active:[],confluence:[],stats:null,myStats:null,
      journal:[],news:[],articles:[],settings:null,notifPrefs:{},botHistory:[],
      loading:true
    });
    fetchAll();
  }catch(e){clearCode();renderLogin('Connection error. Try again.');}
}

// ===== BOOT =====
if(getCode()){fetchAll();}else{renderLogin();}
setInterval(function(){if(getCode())fetchAll();},60000);

// ===== PUSH =====
if('serviceWorker'in navigator){
  navigator.serviceWorker.register('/app/service-worker.js')
    .then(function(reg){swRegistration=reg;if(getCode())checkPushStatus();})
    .catch(function(e){console.error('SW failed',e);});
}

var swRegistration=null;
var pushStatus='unknown';

async function checkPushStatus(){
  if(!getCode())return;
  try{
    if(!('PushManager'in window)||!swRegistration){pushStatus='unsupported';render();return;}
    var sub=await swRegistration.pushManager.getSubscription();
    pushStatus=sub?'subscribed':'unsupported';
    render();
  }catch(e){console.error('checkPushStatus failed',e);pushStatus='unsupported';}
}

async function enablePush(){
  if(!swRegistration||!getCode())return;
  try{
    var keyRes=await fetch(withCode('/api/vapid-key'));
    var keyData=await keyRes.json();
    if(!keyData.enabled||!keyData.key){alert('Push notifications are not configured on the server yet.');return;}
    var perm=await Notification.requestPermission();
    if(perm!=='granted'){pushStatus='denied';render();return;}
    var sub=await swRegistration.pushManager.subscribe({userVisibleOnly:true,applicationServerKey:urlBase64ToUint8Array(keyData.key)});
    await fetch(withCode('/api/subscribe'),{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(sub)});
    pushStatus='subscribed';render();
  }catch(e){console.error('Push subscribe failed',e);alert('Could not enable notifications: '+(e.message||'unknown error'));}
}

function urlBase64ToUint8Array(base64String){
  var padding='='.repeat((4-base64String.length%4)%4);
  var base64=(base64String+padding).replace(/-/g,'+').replace(/_/g,'/');
  var rawData=atob(base64);
  return Uint8Array.from([...rawData].map(function(c){return c.charCodeAt(0);}));
}
