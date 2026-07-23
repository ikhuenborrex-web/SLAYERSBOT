// ===== THE SLAYERS APP v10 — Dark Luxury Edition =====
(function(){var s=document.createElement('style');s.textContent=
'html,body{background:#000;margin:0;padding:0;height:100dvh;overflow:hidden;-webkit-overflow-scrolling:touch}'+
'.card{background:rgba(255,255,255,0.05);backdrop-filter:blur(30px) saturate(1.2);-webkit-backdrop-filter:blur(30px) saturate(1.2);border:0.5px solid rgba(255,255,255,0.08);border-radius:16px;padding:16px;margin-bottom:12px;transition:all 0.3s cubic-bezier(0.16,1,0.3,1);animation:springUp 0.55s cubic-bezier(0.16,1,0.3,1) both}'+
'.card:active{transform:scale(0.985)}'+
'.card-glass{background:rgba(255,255,255,0.05);backdrop-filter:blur(30px) saturate(1.2);-webkit-backdrop-filter:blur(30px) saturate(1.2);border:0.5px solid rgba(255,255,255,0.08);border-radius:16px;padding:18px;margin-bottom:14px;box-shadow:0 4px 20px rgba(0,0,0,0.25);transition:all 0.3s;animation:springUp 0.55s cubic-bezier(0.16,1,0.3,1) both}'+
'.glass-sm{background:rgba(255,255,255,0.04);backdrop-filter:blur(20px) saturate(1.2);-webkit-backdrop-filter:blur(20px) saturate(1.2);border:0.5px solid rgba(255,255,255,0.08);border-radius:12px;transition:all 0.3s;animation:springUp 0.55s cubic-bezier(0.16,1,0.3,1) both}'+
'.glass-sm:active{transform:scale(0.985)}'+
'.mono{font-family:\'SF Mono\',\'JetBrains Mono\',monospace;font-weight:500;letter-spacing:-0.3px}'+
'.pill{display:inline-flex;align-items:center;gap:4px;font-size:8px;font-weight:600;letter-spacing:0.4px;padding:3px 10px;border-radius:4px;text-transform:uppercase}'+
'.section-h{font-size:18px;font-weight:600;letter-spacing:-0.3px;margin-bottom:14px;display:flex;align-items:baseline;gap:8px;padding-top:12px;color:#FFFFFF}'+
'.section-h .sub{font-size:10px;font-weight:500;color:#8E8E93;margin-left:auto}'+
'.progress-track{width:100%;height:2px;background:rgba(255,255,255,0.04);border-radius:99px;overflow:hidden}'+
'.progress-fill{height:100%;border-radius:99px;background:linear-gradient(90deg,#A3E635,rgba(163,230,53,0.4))}'+
'.toggle{width:40px;height:22px;border-radius:99px;background:#48484A;cursor:pointer;position:relative;flex-shrink:0;transition:background 0.3s}'+
'.toggle.on{background:#A3E635}'+
'.toggle::after{content:"";position:absolute;top:2px;left:2px;width:18px;height:18px;border-radius:99px;background:white;transition:transform 0.3s cubic-bezier(0.16,1,0.3,1)}'+
'.toggle.on::after{transform:translateX(18px);background:#000}'+
'.setting-row{display:flex;align-items:center;justify-content:space-between;padding:14px 0}'+
'.setting-row+.setting-row{border-top:0.5px solid rgba(255,255,255,0.05)}'+
'.setting-row .label{font-size:13px;font-weight:600;color:#FFF}'+
'.setting-row .hint{font-size:10px;color:#8E8E93;margin-top:2px;font-weight:400}'+
'@keyframes breathe{0%,100%{box-shadow:0 0 4px #A3E635;opacity:1}50%{box-shadow:0 0 14px #A3E635;opacity:0.4}}'+
'.live-dot{width:5px;height:5px;border-radius:99px;background:#A3E635;animation:breathe 2.4s ease-in-out infinite;flex-shrink:0}'+
'.btn-primary{display:inline-flex;align-items:center;justify-content:center;gap:6px;padding:12px 20px;border-radius:10px;background:#A3E635;border:none;color:#000;font-family:inherit;font-size:12px;font-weight:700;cursor:pointer;transition:all 0.2s}'+
'.btn-primary:active{transform:scale(0.96);opacity:0.9}'+
'.btn-outline{display:inline-flex;align-items:center;justify-content:center;gap:6px;padding:12px 20px;border-radius:10px;background:transparent;border:0.5px solid rgba(255,255,255,0.08);color:#8E8E93;font-family:inherit;font-size:12px;font-weight:600;cursor:pointer;transition:all 0.2s}'+
'.btn-outline:active{transform:scale(0.96)}'+
'.tab-btn{flex:1;display:flex;flex-direction:column;align-items:center;gap:3px;padding:10px 0 8px;border-radius:18px;cursor:pointer;transition:all 0.35s cubic-bezier(0.16,1,0.3,1);border:none;background:transparent;font-family:inherit;position:relative;color:#48484A}'+
'.tab-btn.active{background:rgba(163,230,53,0.12);color:#A3E635}'+
'.tab-btn svg{width:20px;height:20px;fill:none;stroke:currentColor;stroke-width:1.5;stroke-linecap:round;stroke-linejoin:round;transition:all 0.35s}'+
'.tab-btn span{font-size:9px;font-weight:500;letter-spacing:0.3px;transition:all 0.35s}'+
'.m-chip{display:inline-flex;align-items:center;gap:5px;padding:6px 14px;border-radius:8px;border:0.5px solid rgba(255,255,255,0.08);background:rgba(255,255,255,0.04);color:#8E8E93;font-size:11px;font-weight:600;cursor:pointer;white-space:nowrap;transition:all 0.2s}'+
'@keyframes springUp{from{opacity:0;transform:translateY(18px) scale(0.97)}to{opacity:1;transform:translateY(0) scale(1)}}'+
'@keyframes fillBar{from{width:0%}}'+
'@keyframes pulseRing{0%{box-shadow:0 0 0 0 rgba(163,230,53,0.5)}70%{box-shadow:0 0 0 8px rgba(163,230,53,0)}100%{box-shadow:0 0 0 0 rgba(163,230,53,0)}}'+
'@keyframes ptrSpin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}'+
'.ptr-wrap{overflow:hidden;position:relative;flex-shrink:0;width:100%;display:flex;align-items:center;justify-content:center;transition:height 0.35s cubic-bezier(0.16,1,0.3,1)}'+
'.ptr-inner{display:flex;align-items:center;gap:12px;padding:8px}'+
'.ptr-logo{width:28px;height:28px;border-radius:6px;background:#A3E635;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:12px;color:#000;flex-shrink:0}'+
'.ptr-logo.spinning{animation:ptrSpin 0.6s linear infinite}'+
'.ptr-text{font-size:10px;color:#8E8E93;font-weight:500;letter-spacing:0.1px}'+
'.pulse-ring{animation:pulseRing 2.5s ease-in-out infinite}'+
'@keyframes bounceIn{0%{opacity:0;transform:scale(0.8)}50%{transform:scale(1.05)}to{opacity:1;transform:scale(1)}}'+
'.onboard-overlay{position:absolute;inset:0;z-index:50;display:flex;flex-direction:column;align-items:center;justify-content:center;background:rgba(0,0,0,0.85);backdrop-filter:blur(60px);-webkit-backdrop-filter:blur(60px);animation:fadeIn 0.5s ease forwards}'+
'.onboard-welcome{background:rgba(255,255,255,0.04);backdrop-filter:blur(40px);-webkit-backdrop-filter:blur(40px);border:0.5px solid rgba(255,255,255,0.06);border-radius:28px;padding:36px 28px;max-width:320px;text-align:center;animation:slideUp 0.6s cubic-bezier(0.16,1,0.3,1) forwards}'+
'.onboard-logo{width:64px;height:64px;border-radius:18px;background:#A3E635;display:flex;align-items:center;justify-content:center;margin:0 auto 20px;font-size:28px;font-weight:800;color:#000;animation:bounceIn 0.6s 0.15s both}'+
'.onboard-feature{display:flex;align-items:center;gap:12px;padding:10px 14px;background:rgba(255,255,255,0.03);border-radius:10px}'+
'.onboard-feature-icon{width:32px;height:32px;border-radius:8px;background:rgba(163,230,53,0.12);display:flex;align-items:center;justify-content:center;flex-shrink:0}'+
'.onboard-feature-icon svg{width:16px;height:16px;fill:none;stroke:#A3E635;stroke-width:1.5;stroke-linecap:round;stroke-linejoin:round}'+
'.tour-overlay{position:absolute;inset:0;z-index:40;background:rgba(0,0,0,0.7);display:none;animation:fadeIn 0.35s ease forwards}'+
'.tour-overlay.show{display:block}'+
'.tour-tooltip{position:absolute;left:14px;right:14px;bottom:90px;max-width:340px;margin:0 auto;background:rgba(20,20,22,0.95);backdrop-filter:blur(40px);-webkit-backdrop-filter:blur(40px);border:0.5px solid rgba(255,255,255,0.08);border-radius:18px;padding:22px 20px;box-sizing:border-box;overflow-wrap:break-word;word-wrap:break-word;overflow:hidden;animation:slideUp 0.45s cubic-bezier(0.16,1,0.3,1) forwards;box-shadow:0 20px 60px rgba(0,0,0,0.5);z-index:45}'+
'.tour-highlight{position:absolute;z-index:35;border-radius:22px;border:2px solid #A3E635;box-shadow:0 0 30px rgba(163,230,53,0.2);animation:pulse 2s ease-in-out infinite;pointer-events:none;display:none}'+
'.tour-header{display:flex;align-items:center;gap:10px;margin-bottom:8px}'+
'.tour-title{font-size:14px;font-weight:700;color:#FFF;line-height:1.3}'+
'.tour-header svg{width:22px;height:22px;flex-shrink:0;fill:none;stroke:#A3E635;stroke-width:1.5;stroke-linecap:round;stroke-linejoin:round}'+
'.tour-point{display:flex;gap:9px;padding:5px 0}'+
'.tour-dot{width:5px;height:5px;border-radius:50%;margin-top:5px;flex-shrink:0}'+
'@keyframes fadeIn{from{opacity:0}to{opacity:1}}'+
'@keyframes slideUp{from{opacity:0;transform:translateY(24px) scale(0.96)}to{opacity:1;transform:translateY(0) scale(1)}}'+
'.tour-dot.lime{background:#A3E635}.tour-dot.red{background:#EF4444}.tour-dot.gray{background:#48484A}'+
'.tour-point-label{font-size:12px;color:#8E8E93;line-height:1.4}'+
'.tour-point-label strong{color:#FFF}'+
'.tour-nav{display:flex;align-items:center;justify-content:space-between;margin-top:14px;padding-top:12px;border-top:0.5px solid rgba(255,255,255,0.06)}'+
'.tour-dots-wrap{display:flex;gap:5px}'+
'.tour-dot-nav{width:7px;height:7px;border-radius:50%;background:rgba(255,255,255,0.12);transition:all 0.3s}'+
'.tour-dot-nav.active{background:#A3E635;width:20px;border-radius:4px}'+
'@keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:0.6;transform:scale(1.1)}}';
document.head.appendChild(s);})();

var C = {
  bg: '#000000',
  surface: 'rgba(255,255,255,0.04)',
  surface2: 'rgba(255,255,255,0.02)',
  card: 'rgba(255,255,255,0.05)',
  cardHover: 'rgba(255,255,255,0.08)',
  border: 'rgba(255,255,255,0.08)',
  border2: 'rgba(255,255,255,0.12)',
  lime: '#A3E635',
  limeSoft: 'rgba(163,230,53,0.1)',
  limeBorder: 'rgba(163,230,53,0.25)',
  white: '#FFFFFF',
  text2: '#8E8E93',
  text3: '#48484A',
  red: '#EF4444',
  redSoft: 'rgba(239,68,68,0.1)',
  redBorder: 'rgba(239,68,68,0.25)',
  orange: '#F97316',
  orangeSoft: 'rgba(249,115,22,0.1)',
  screenBg: '#000000',
  separator: 'rgba(255,255,255,0.05)',
  tabBg: 'rgba(255,255,255,0.06)',
  tabBorder: 'rgba(255,255,255,0.08)',
  shadowSm: '0 4px 20px rgba(0,0,0,0.25)',
};

function getCode(){return localStorage.getItem('slayersAccessCode')||'';}
function saveCode(c){localStorage.setItem('slayersAccessCode',c);}
function clearCode(){localStorage.removeItem('slayersAccessCode');}
function getDeviceId(){
  var id=localStorage.getItem('slayersDeviceId');
  if(!id){id=(crypto.randomUUID?crypto.randomUUID():'dev-'+Date.now()+'-'+Math.random().toString(36).slice(2));localStorage.setItem('slayersDeviceId',id);}
  return id;
}
function esc(s){return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');}
function withCode(url){
  var code=getCode();
  var sep1=url.includes('?')?'&':'?';
  return url+sep1+'code='+encodeURIComponent(code)+'&device='+encodeURIComponent(getDeviceId());
}
function fetchApi(url,opts){
  opts=opts||{};
  opts.headers=opts.headers||{};
  opts.headers['x-access-code']=getCode();
  opts.headers['x-device-id']=getDeviceId();
  return fetch(url, opts);
}

var ICONS={
  bolt:'<path d="M13 2 3 14h7l-1 8 10-12h-7l1-8z"/>',
  sun:'<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>',
  chart:'<path d="M3 3v18h18M7 16l4-4 4 4 5-7"/>',
  back:'<path d="M19 12H5M12 19l-7-7 7-7"/>',
  shield:'<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>',
  target:'<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>',
  flame:'<path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>',
  check:'<path d="M20 6 9 17l-5-5"/>',
  up:'<path d="M23 6l-9.5 9.5-5-5L1 18M17 6h6v6"/>',
  down:'<path d="M23 18l-9.5-9.5-5 5L1 6m22 12h-6v-6"/>',
  warn:'<path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0zM12 9v4M12 17h.01"/>',
  landmark:'<path d="M3 22h18M6 18V11M10 18V11M14 18V11M18 18V11M2 11l10-7 10 7M2 22V20h20v2"/>',
  calc:'<rect x="4" y="2" width="16" height="20" rx="2"/><path d="M8 6h8M8 10h2M12 10h2M16 10h0M8 14h2M12 14h2M16 14h0M8 18h2M12 18h2M16 18h0"/>',
  radio:'<circle cx="12" cy="12" r="2"/><path d="M16.24 7.76a6 6 0 0 1 0 8.49M7.76 16.24a6 6 0 0 1 0-8.49M19.07 4.93a10 10 0 0 1 0 14.14M4.93 19.07a10 10 0 0 1 0-14.14"/>',
  grid:'<rect x="4" y="4" width="7" height="7" rx="1.5"/><rect x="13" y="4" width="7" height="7" rx="1.5"/><rect x="4" y="13" width="7" height="7" rx="1.5"/><rect x="13" y="13" width="7" height="7" rx="1.5"/>',
  book:'<path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/><path d="M8 7h8M8 11h6"/>',
   cal:'<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/><path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01M16 18h.01"/>',
   pulse:'<polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>',
  gear:'<circle cx="12" cy="12" r="3"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>',
  copy:'<rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>',
};
function icon(name,color,size){if(!size)size=16;return '<svg width="'+size+'" height="'+size+'" viewBox="0 0 24 24" fill="none" stroke="'+color+'" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">'+ICONS[name]+'</svg>';}
function pill(text,color,dim,cls){return '<span class="pill'+(cls?' '+cls:'')+'" style="color:'+color+';background:'+dim+';border:0.5px solid '+color+'33">'+text+'</span>';}
function mono(text,color,size){if(!color)color=C.white;if(!size)size=13.5;return '<span class="mono" style="color:'+color+';font-size:'+size+'px">'+text+'</span>';}
function fmt(n){return typeof n==='number'?n.toFixed(n>100?2:5):n;}
function timeAgo(iso){
  if(!iso)return '';
  var d=new Date(iso),n=new Date(),diff=Math.floor((n-d)/60000);
  if(diff<60)return diff+'m ago';
  if(diff<1440)return Math.floor(diff/60)+'h ago';
  return d.toLocaleDateString([],{month:'short',day:'numeric'});
}
function fmtNum(n,d){return n==null?'--':n.toLocaleString('en-US',{minimumFractionDigits:d,maximumFractionDigits:d});}
function greeting(){
  var h=new Date().getHours();
  if(h<5)return 'Good night';
  if(h<12)return 'Good morning';
  if(h<17)return 'Good afternoon';
  if(h<22)return 'Good evening';
  return 'Good night';
}
function avatarRing(size){
  if(!size)size=34;
  var inner=size-4;
  return '<div style="width:'+size+'px;height:'+size+'px;border-radius:99px;background:conic-gradient(#A3E635,#FFF,#A3E635);padding:2px;flex-shrink:0">'+
    '<div style="width:'+inner+'px;height:'+inner+'px;border-radius:99px;background:#000;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:'+Math.round(inner*0.4)+'px;color:#A3E635">S</div></div>';
}

function animateCounters(){
  var els=document.querySelectorAll('.count-up');
  for(var i=0;i<els.length;i++){
    (function(el){
      var target=parseFloat(el.getAttribute('data-target'));
      var dur=parseInt(el.getAttribute('data-dur'))||700;
      var start=performance.now();
      function tick(now){
        var p=Math.min((now-start)/dur,1);
        var eased=1-Math.pow(1-p,3);
        var val=eased*target;
        el.textContent=target%1===0?Math.round(val):val.toFixed(1);
        if(p<1)requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
    })(els[i]);
  }
}

// ===== PTR =====
var ptr={pulling:false,startY:0,curr:0,refreshing:false};
function setupPTR(sc){
  if(!sc||ptr.refreshing)return;
  var pw=document.getElementById('ptrWrap'),pl=document.getElementById('ptrLogo'),pt=document.getElementById('ptrText');
  function reset(){
    ptr.pulling=false;ptr.curr=0;
    if(pw){pw.style.height='0';pw.style.transition='height 0.35s cubic-bezier(0.16,1,0.3,1)';}
    if(pl){pl.style.transform='';pl.className='ptr-logo';pl.style.opacity='';}
    if(pt){pt.textContent='Pull to refresh';pt.style.opacity='';}
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
    var damped=Math.min(dist*0.45,100);ptr.curr=damped;
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
        fetchAll();ptr.refreshing=false;
        var pw2=document.getElementById('ptrWrap'),pl2=document.getElementById('ptrLogo'),pt2=document.getElementById('ptrText');
        if(pw2){pw2.style.transition='height 0.35s cubic-bezier(0.16,1,0.3,1)';pw2.style.height='0';}
        if(pl2){pl2.className='ptr-logo';pl2.style.transform='';pl2.style.opacity='';}
        if(pt2){pt2.textContent='Pull to refresh';pt2.style.opacity='';}
      },800);
    }else{reset();}
  },{passive:true});
}

// ===== STATE =====
var state={
  tab:'overview',selected:null,showCalc:false,
  signals:[],active:[],confluence:[],stats:null,myStats:null,detailedStats:null,
  journal:[],news:[],settings:null,notifPrefs:{},botHistory:[],
  loading:true,
  filter:{pair:'',dir:'',tf:'',minScore:0,dateFrom:'',dateTo:'',sort:'time'},
  journalTab:'qmr',
  journalFilter:'all',
  journalPairFilter:'all',
  journalDirFilter:'all',
  showEntryForm:false,
  editingEntry:null,
  newsFilter:'All',
  articles:[],
  showOnboarding:false,
  onboardingStep:-1,
  showFilters:false,showJournalCustomize:false,
  statsTab:'overview',
  scalpSignals:[],scalpActive:[],scalpStats:null,scalpPulse:[],
};

// ===== DATA FETCHING =====
async function fetchAll(){
  var TIMEOUT_MS=15000;
  var ft=function(url){
    return Promise.race([fetch(url),new Promise(function(_,rej){setTimeout(function(){rej(new Error('timeout'));},TIMEOUT_MS);})]);
  };
  var j=function(r){return r&&r.json?r.json().catch(function(){return{};}):Promise.resolve({});};
  var sigUrl='/api/signals?limit=20';
  if(state.filter.pair)sigUrl+='&pair='+encodeURIComponent(state.filter.pair);
  if(state.filter.dir)sigUrl+='&dir='+encodeURIComponent(state.filter.dir);
  if(state.filter.tf)sigUrl+='&tf='+encodeURIComponent(state.filter.tf);
  if(state.filter.minScore>0)sigUrl+='&minScore='+state.filter.minScore;
  if(state.filter.dateFrom)sigUrl+='&dateFrom='+encodeURIComponent(state.filter.dateFrom);
  if(state.filter.dateTo)sigUrl+='&dateTo='+encodeURIComponent(state.filter.dateTo);
  if(state.filter.sort!=='time')sigUrl+='&sort='+state.filter.sort;
  // Each fetch is independent — one slow endpoint won't wipe all data
  // Each successful fetch re-renders so new data shows immediately
  ft(withCode(sigUrl)).then(function(r){
    if(r.status===401){clearCode();state.loading=false;renderLogin('Your access code has expired or is no longer valid.');return;}
    j(r).then(function(d){state.signals=d.signals||[];render();});
  }).catch(function(){});
  ft(withCode('/api/active')).then(function(r){j(r).then(function(d){state.active=d.trades||[];render();});}).catch(function(){});
  ft(withCode('/api/confluence')).then(function(r){j(r).then(function(d){state.confluence=d.pairs||[];render();});}).catch(function(){});
  ft(withCode('/api/stats')).then(function(r){j(r).then(function(d){state.stats=d;render();});}).catch(function(){});
  ft(withCode('/api/stats/detailed')).then(function(r){j(r).then(function(d){state.detailedStats=d;render();});}).catch(function(){});
  ft(withCode('/api/member/stats')).then(function(r){
    if(r.status===200)j(r).then(function(d){state.myStats=d.myStats||null;state.notifPrefs=d.notifPrefs||{};render();});
  }).catch(function(){});
  ft(withCode('/api/journal')).then(function(r){j(r).then(function(d){state.journal=d.entries||[];render();});}).catch(function(){});
  ft(withCode('/api/news')).then(function(r){j(r).then(function(d){state.news=d.events||[];render();});}).catch(function(){});
  ft(withCode('/api/news-feed')).then(function(r){j(r).then(function(d){
    state.articles=d.articles||d.data||d.news||d.items||(Array.isArray(d)?d:[])||[];
    state.newsFeedOk=state.articles.length>0;render();
  });}).catch(function(){});
  ft(withCode('/api/settings')).then(function(r){j(r).then(function(d){state.settings=d.settings||null;render();});}).catch(function(){});
  ft(withCode('/api/trade-history')).then(function(r){j(r).then(function(d){state.botHistory=d.outcomes||[];render();});}).catch(function(){});
  ft(withCode('/api/weekly-summary')).then(function(r){j(r).then(function(d){state.weeklySummary=d.summary||null;render();});}).catch(function(){});
  // Scalp data — non-blocking, never disrupts main data
  fetch(withCode('/api/scalp')).then(function(r){return r.json().catch(function(){return{};});}).then(function(d){state.scalpSignals=d.signals||[];render();}).catch(function(){});
  fetch(withCode('/api/scalp/active')).then(function(r){return r.json().catch(function(){return{};});}).then(function(d){state.scalpActive=d.trades||[];render();}).catch(function(){});
  fetch(withCode('/api/scalp/stats')).then(function(r){return r.json().catch(function(){return{};});}).then(function(d){state.scalpStats=d;render();}).catch(function(){});
  fetch(withCode('/api/scalp/pulse')).then(function(r){return r.json().catch(function(){return{};});}).then(function(d){state.scalpPulse=d.pairs||[];render();}).catch(function(){});
  state.fetchError=null;
  state.loading=false;
  if(!state.showOnboarding&&getCode()&&!localStorage.getItem('slayersToured')&&!state.fetchError){
    state.showOnboarding=true;render();
  }
}

// ===== SIGNAL CARD =====
function signalCard(s){
  var isBuy=s.type==='BULLISH'||s.type==='BUY';
  var isElite=s.tier==='ELITE';
  var tierColor=isElite?C.white:C.text3;
  var tierDim=isElite?'rgba(255,255,255,0.1)':'rgba(255,255,255,0.03)';
  var criteria=(s.criteria||[]).map(function(c){
    return '<span style="font-size:10px;color:'+C.lime+';background:'+C.limeSoft+';border:0.5px solid '+C.limeBorder+';border-radius:4px;padding:3px 10px;font-weight:600;display:inline-block;margin:0 6px 6px 0">'+c+'</span>';
  }).join('');
  var isDual=s.dualEntry;
  var isStandalone=!isDual;
  return '<div class="card" onclick="openDetail(\''+s.id+'\')" style="cursor:pointer;border-left:2.5px solid '+(isDual?C.orange:tierColor)+';animation-delay:'+(Math.random()*0.2)+'s">'+
    '<div style="display:flex;align-items:center;gap:8px;margin-bottom:10px">'+
    '<span style="font-weight:800;font-size:16px;letter-spacing:-0.2px;color:'+C.white+'">'+s.pair+'</span>'+
    pill(s.tier,tierColor,tierDim,isElite?'pulse-ring':'')+
    pill(isBuy?'BUY':'SELL',isBuy?C.lime:C.red,isBuy?C.limeSoft:C.redSoft)+
    '<span style="margin-left:auto;font-size:10px;color:'+C.text2+'">'+timeAgo(s.time)+'</span>'+
    '</div>'+
    // Dual entry: pending conservative banner (hidden if aggressive trade closed)
    (isDual&&!s.consEntry&&!s.aggResolved?'<div style="font-size:10px;color:'+C.orange+';background:'+C.orangeSoft+';border:0.5px solid '+C.orange+'44;border-radius:6px;padding:5px 8px;font-weight:600;margin-bottom:8px">\u23F3 Conservative QM entry pending at '+fmt(s.qmLevel)+'</div>':'')+
    // Dual entry: complete banner
    (isDual&&s.consEntry?'<div style="font-size:10px;color:'+C.lime+';background:'+C.limeSoft+';border:0.5px solid '+C.limeBorder+';border-radius:6px;padding:5px 8px;font-weight:600;margin-bottom:8px">\u2705 Dual Entry Complete</div>':'')+
    // Aggressive row (dual) or standard entry row (standalone)
    (isDual?'<div style="display:flex;gap:12px;font-size:12px;color:'+C.text2+'">'+
      '<span><span style="color:'+C.orange+'">\u26A1 Aggressive</span> <span class="mono" style="font-weight:700;color:'+C.orange+';font-size:13.5px">'+fmt(s.aggEntry)+'</span></span>'+
      '<span><span style="color:'+C.text2+'">SL</span> <span class="mono" style="font-weight:700;color:'+C.red+';font-size:13.5px">'+fmt(s.aggSl)+'</span></span>'+
      (s.aggTp1?'<span><span style="color:'+C.text2+'">TP1</span> <span class="mono" style="font-weight:700;color:'+C.lime+';font-size:13.5px">'+fmt(s.aggTp1)+'</span></span>':'')+
    '</div>':'')+
    // Standard standalone entry row
    (isStandalone?'<div style="display:flex;gap:12px;font-size:12px;color:'+C.text2+'">'+
      '<span><span style="color:'+C.text2+'">Entry</span> <span style="font-weight:700;color:'+C.white+'">'+fmt(s.entry)+'</span></span>'+
      '<span><span style="color:'+C.text2+'">SL</span> <span style="font-weight:700;color:'+C.red+'">'+fmt(s.sl)+'</span></span>'+
      (s.tp1?'<span><span style="color:'+C.text2+'">TP1</span> <span style="font-weight:700;color:'+C.lime+'">'+fmt(s.tp1)+'</span></span>':'')+
    '</div>':'')+
    // Conservative row (dual entry, after confirmation)
    (isDual&&s.consEntry?'<div style="display:flex;gap:12px;font-size:12px;color:'+C.text2+';margin-top:4px;padding-top:6px;border-top:0.5px solid rgba(255,255,255,0.06)">'+
      '<span><span style="color:'+C.white+'">Conservative</span> <span class="mono" style="font-weight:700;color:'+C.white+';font-size:13.5px">'+fmt(s.consEntry)+'</span></span>'+
      '<span><span style="color:'+C.text2+'">SL</span> <span class="mono" style="font-weight:700;color:'+C.red+';font-size:13.5px">'+fmt(s.consSl)+'</span></span>'+
      (s.consTp1?'<span><span style="color:'+C.text2+'">TP1</span> <span class="mono" style="font-weight:700;color:'+C.lime+';font-size:13.5px">'+fmt(s.consTp1)+'</span></span>':'')+
    '</div>':'')+
    '<div style="margin-top:8px">'+criteria+'</div>'+
    (s.dailyPOI?'<div style="font-size:11px;color:'+C.lime+';font-weight:600;margin-top:6px">\uD83C\uDFDB '+s.dailyPOI+'</div>':'')+
    (s.rsiDivergence?'<div style="font-size:11px;color:'+C.orange+';font-weight:600;margin-top:4px">\uD83D\uDD25 '+s.rsiDivergence+'</div>':'')+
    '<div style="display:flex;gap:8px;margin-top:10px">'+
    '<div style="flex:1;color:'+C.text2+';font-size:10px;text-align:center">Tap for full chart \u2192</div>'+
    '<span onclick="event.stopPropagation();copyTrade(\''+s.id+'\')" style="font-size:9px;color:'+C.lime+';cursor:pointer;font-weight:600">\uD83D\uDCCB Copy</span>'+
    '</div>'+
    '</div>';
}

// ===== DETAIL PAGE =====
function detailPage(s){
  var isBuy=s.type==='BULLISH'||s.type==='BUY';
  var isElite=s.tier==='ELITE';
  var tierColor=isElite?C.white:C.text3;
  var criteriaList=(s.criteria||[]).map(function(c){
    return '<div style="display:flex;align-items:center;gap:8px;padding:6px 0">'+icon('check',C.lime,15)+'<span style="font-size:13px;color:'+C.white+'">'+c+'</span></div>';
  }).join('');
  var isDual=s.dualEntry;
  // Dual entry: show two chart images
  var aggChart=s.aggChartUrl?'<img src="'+withCode(s.aggChartUrl)+'" style="width:100%;display:block;border-radius:14px" alt="Aggressive chart">':'';
  var consChart=s.consChartUrl?'<img src="'+withCode(s.consChartUrl)+'" style="width:100%;display:block;border-radius:14px;margin-top:8px" alt="Conservative chart">':'';
  var chartHtml=isDual
    ?'<div style="font-size:11px;color:'+C.orange+';font-weight:600;margin-bottom:4px">\u26A1 Aggressive Chart</div>'+aggChart+
     '<div style="display:flex;justify-content:space-between;margin:6px 0 14px;font-size:9px;color:'+C.text2+'">'+
     '<span style="color:'+C.orange+'">\u25cf Agg Entry: '+fmt(s.aggEntry)+'</span>'+
     '<span style="color:'+C.red+'">\u25cf SL: '+fmt(s.aggSl)+'</span>'+
     '<span style="color:'+C.lime+'">\u25cf TP2: '+fmt(s.aggTp2)+'</span></div>'+
     (s.consEntry?'<div style="font-size:11px;color:'+C.white+';font-weight:600;margin-bottom:4px">\uD83C\uDFAF Conservative Chart</div>'+consChart+
     '<div style="display:flex;justify-content:space-between;margin:6px 0 18px;font-size:9px;color:'+C.text2+'">'+
     '<span style="color:'+C.white+'">\u25cf Cons Entry: '+fmt(s.consEntry)+'</span>'+
     '<span style="color:'+C.red+'">\u25cf SL: '+fmt(s.consSl)+'</span>'+
     '<span style="color:'+C.lime+'">\u25cf TP2: '+fmt(s.consTp2)+'</span></div>':'')
    :(s.chartUrl
      ?'<img src="'+withCode(s.chartUrl)+'" style="width:100%;display:block;border-radius:14px" alt="Signal chart">'
      :'<div style="height:170px;display:flex;align-items:center;justify-content:center;color:'+C.text2+';font-size:12px;border:0.5px solid '+C.border+';border-radius:14px">Chart unavailable</div>');
  return '<div style="display:flex;flex-direction:column;height:100dvh;background:'+C.bg+';color:'+C.white+'">'+
    '<div style="flex:1;overflow-y:auto;background:'+C.bg+';color:'+C.white+'">'+
    '<div style="display:flex;align-items:center;gap:12px;padding:calc(20px + env(safe-area-inset-top)) 16px 10px">'+
    '<button onclick="closeDetail()" style="background:rgba(255,255,255,0.1);border:none;border-radius:99px;width:34px;height:34px;display:flex;align-items:center;justify-content:center;cursor:pointer;color:'+C.white+'">'+icon('back',C.white,16)+'</button>'+
    '<div><div style="font-weight:800;font-size:18px;letter-spacing:-0.3px;color:'+C.white+'">'+s.pair+' \u00b7 '+s.tf+'</div>'+
    '<div style="color:'+C.text2+';font-size:11px">'+timeAgo(s.time)+' \u00b7 '+(s.system||'QMR')+' Signal</div></div></div>'+
    '<div style="padding:8px 16px">'+
    '<div style="display:flex;gap:8px;margin-bottom:14px;flex-wrap:wrap">'+
    pill(s.tier,tierColor,isElite?'rgba(255,255,255,0.1)':'rgba(255,255,255,0.03)')+
    pill(s.type,isBuy?C.lime:C.red,isBuy?C.limeSoft:C.redSoft)+
    '</div>'+chartHtml+
    '<div style="font-size:14px;font-weight:700;color:'+C.white+';margin-bottom:10px">Trade Levels</div>'+
    '<div class="card" style="margin-bottom:18px">'+
    (isDual&&s.aggEntry?'<div style="display:flex;justify-content:space-between;padding:9px 0"><span style="color:'+C.orange+'">'+icon('bolt',C.orange,13)+' Aggressive Entry (sweep)</span>'+mono(fmt(s.aggEntry),C.orange,16)+'</div>':'')+
    (isDual&&s.consEntry?'<div style="display:flex;justify-content:space-between;padding:9px 0;border-top:0.5px solid rgba(255,255,255,0.05)"><span style="color:'+C.white+'">Conservative Entry (QM)</span>'+mono(fmt(s.consEntry),C.white,16)+'</div>':'')+
    (!isDual?'<div style="display:flex;justify-content:space-between;padding:9px 0"><span style="color:'+C.text2+'">'+(s.refinedEntry?'4H Zone':'Entry')+'</span>'+mono(fmt(s.entry),C.white,16)+'</div>':'')+
    (!isDual&&s.refinedEntry?'<div style="display:flex;justify-content:space-between;padding:9px 0"><span style="color:'+C.lime+'">'+icon('target',C.lime,13)+' Refined Entry</span>'+mono(fmt(s.refinedEntry),C.lime,16)+'</div>':'')+
    '<div style="display:flex;justify-content:space-between;padding:9px 0;border-top:'+(isDual?'0.5px solid rgba(255,255,255,0.05)':'0')+'"><span style="color:'+C.red+'">'+icon('shield',C.red,13)+' Stop Loss</span>'+mono(fmt(isDual?s.aggSl:s.sl),C.red,16)+'</div>'+
    (isDual&&s.consTp1?'<div style="display:flex;justify-content:space-between;padding:9px 0;border-top:0.5px solid rgba(255,255,255,0.05)"><span style="color:'+C.text2+'">Conservative TP1</span>'+mono(fmt(s.consTp1),C.white,16)+'</div>':'')+
    (isDual&&s.consTp2?'<div style="display:flex;justify-content:space-between;padding:9px 0;border-top:0.5px solid rgba(255,255,255,0.05)"><span style="color:'+C.text2+'">Conservative TP2</span>'+mono(fmt(s.consTp2),C.lime,16)+'</div>':'')+
    (!isDual?s.tp1?'<div style="display:flex;justify-content:space-between;padding:9px 0"><span style="color:'+C.text2+'">TP1</span>'+mono(fmt(s.tp1),C.white,16)+'</div>':'':'')+
    (!isDual?s.tp2?'<div style="display:flex;justify-content:space-between;padding:9px 0"><span style="color:'+C.text2+'">TP2</span>'+mono(fmt(s.tp2),C.lime,16)+'</div>':'':'')+
    '</div>'+
    '<button onclick="copyTrade(\''+s.id+'\')" style="width:100%;background:rgba(255,255,255,0.03);border:0.5px solid '+C.border+';border-radius:10px;padding:12px 0;display:flex;align-items:center;justify-content:center;gap:8px;cursor:pointer;margin-bottom:18px">'+
    icon('copy',C.lime,14)+'<span style="color:'+C.lime+';font-weight:600;font-size:12px">Copy trade details</span></button>'+
    '<div style="font-size:14px;font-weight:700;color:'+C.white+';margin-bottom:10px">Criteria '+(s.score?'\u2014 '+s.score+'/4':'')+'</div>'+
    '<div class="card" style="margin-bottom:18px">'+criteriaList+'</div>'+
    (s.counterTrend?'<div style="background:'+C.redSoft+';border:0.5px solid '+C.red+'55;border-radius:14px;padding:14px;margin-bottom:18px;display:flex;gap:8px"><span>'+icon('warn',C.red,16)+'</span><span style="color:'+C.red+';font-size:12.5px;font-weight:600">Counter-trend setup \u2014 '+(s.htfBias||'')+'. Reduce position size.</span></div>':'')+
    (s.rsiDivergence?'<div style="background:'+C.orangeSoft+';border:0.5px solid '+C.orange+'55;border-radius:14px;padding:14px;margin-bottom:18px;display:flex;gap:8px"><span>'+icon('flame',C.orange,16)+'</span><span style="color:'+C.orange+';font-size:12.5px;font-weight:600">'+s.rsiDivergence+' on 4H \u2014 HTF momentum confluence</span></div>':'')+
    // Dual entry: two track buttons
    (isDual?'<div style="font-size:14px;font-weight:700;color:'+C.white+';margin-bottom:10px">Track Your Entry</div>'+
    '<button onclick="toggleTrack(\''+s.id+'-agg\','+!!s.isTrackedAgg+')" style="width:100%;background:'+(s.isTrackedAgg?C.orangeSoft:'rgba(249,115,22,0.05)')+';border:0.5px solid '+(s.isTrackedAgg?C.orange:C.orange+'55')+';border-radius:10px;padding:14px 0;display:flex;align-items:center;justify-content:center;gap:8px;cursor:pointer;margin-bottom:10px">'+
    icon(s.isTrackedAgg?'check':'target',s.isTrackedAgg?C.orange:C.orange,16)+
    '<span style="color:'+C.orange+';font-weight:700;font-size:13px">'+(s.isTrackedAgg?'Tracking \u2014 aggressive at '+fmt(s.aggEntry):'\u26A1 I took the aggressive entry at '+fmt(s.aggEntry))+'</span></button>'+
    '<button onclick="toggleTrack(\''+s.id+'-cons\','+!!s.isTrackedCons+')" style="width:100%;background:'+(s.isTrackedCons?C.limeSoft:s.consEntry?'rgba(255,255,255,0.03)':'transparent')+';border:0.5px solid '+(s.isTrackedCons?C.lime:(s.consEntry?C.border:'rgba(255,255,255,0.04)'))+';border-radius:10px;padding:14px 0;display:flex;align-items:center;justify-content:center;gap:8px;cursor:pointer;margin-bottom:12px">'+
    icon(s.isTrackedCons?'check':'target',s.isTrackedCons?C.lime:(s.consEntry?C.text2:C.text3),16)+
    '<span style="color:'+(s.isTrackedCons?C.lime:(s.consEntry?C.text2:C.text3))+';font-weight:700;font-size:13px">'+(s.isTrackedCons?'Tracking \u2014 conservative at '+fmt(s.consEntry):(s.consEntry?'\uD83C\uDFAF I took the conservative entry at '+fmt(s.consEntry):'\u23F3 Conservative entry pending'))+'</span></button>':'')+
    // Standard: single track button
    (!isDual?'<button onclick="toggleTrack(\''+s.id+'\','+!!s.isTracked+')" style="width:100%;background:'+(s.isTracked?C.limeSoft:'transparent')+';border:0.5px solid '+(s.isTracked?C.lime:C.border)+';border-radius:10px;padding:14px 0;display:flex;align-items:center;justify-content:center;gap:8px;cursor:pointer;margin-bottom:12px">'+
    icon(s.isTracked?'check':'target',s.isTracked?C.lime:C.text2,16)+
    '<span style="color:'+(s.isTracked?C.lime:C.text2)+';font-weight:700;font-size:13px">'+(s.isTracked?'Tracking \u2014 you will get updates on this trade':"I'm in this trade \u2014 notify me")+'</span></button>':'')+
    '<button onclick="toggleCalc()" style="width:100%;background:'+C.lime+';border:none;border-radius:10px;padding:15px 0;display:flex;align-items:center;justify-content:center;gap:8px;cursor:pointer;margin-bottom:8px">'+
    icon('calc',C.bg,16)+'<span style="color:'+C.bg+';font-weight:800;font-size:14px">'+(state.showCalc?'Close Calculator':'Calculate Position Size')+'</span></button>'+
    (state.showCalc?positionCalcForm(s):'')+
    '</div></div></div>';
}

// ===== POSITION CALCULATOR =====
window.toggleCalc=function(){state.showCalc=!state.showCalc;render();};

window.positionCalcForm=function(s){
  var dir=(s.type==='BULLISH'||s.type==='BUY')?'Long':'Short';
  return '<div id="calc-form" style="background:rgba(255,255,255,0.03);border:0.5px solid '+C.border+';border-radius:14px;padding:16px;margin-bottom:24px;font-size:13px">'+
    '<div style="font-weight:700;font-size:14px;color:'+C.white+';margin-bottom:14px">'+icon('calc',C.lime,15)+' Position Calculator</div>'+
    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:14px">'+
    inp('balance','Account Balance ($)','1000')+
    inp('riskpct','Risk %','2')+
    inp('entry','Entry',fmt(s.entry))+
    inp('sl','Stop Loss',fmt(s.sl))+
    inp('tp','TP (optional)',s.tp1?fmt(s.tp1):'')+
    '<div style="display:flex;flex-direction:column;gap:4px"><span style="color:'+C.text2+';font-size:10px">Direction</span><div style="background:rgba(255,255,255,0.05);border:0.5px solid '+C.border+';border-radius:8px;padding:10px 12px;color:'+(dir==='Long'?C.lime:C.red)+';font-weight:600;font-size:13px">'+dir+'</div></div>'+
    '</div>'+
    '<button onclick="doCalc()" style="width:100%;background:'+C.lime+';border:none;border-radius:8px;padding:12px 0;display:flex;align-items:center;justify-content:center;gap:6px;cursor:pointer;color:'+C.bg+';font-weight:700;font-size:13px">'+icon('calc',C.bg,14)+' Calculate</button>'+
    '<div id="calc-result" style="margin-top:14px;display:none"></div>'+
    '</div>';
};

window.doCalc=function(){
  var el=document.getElementById('calc-result');
  var gb=function(id){return parseFloat(document.getElementById('calc-'+id).value)||0;};
  var bal=gb('balance'),rp=gb('riskpct'),entry=gb('entry'),sl=gb('sl'),tp=gb('tp');
  if(!bal||!rp||!entry||!sl||sl===entry){el.style.display='block';el.innerHTML='<div style="color:'+C.red+';font-size:12px;text-align:center">Please fill in Balance, Risk %, Entry, and SL (Entry \u2260 SL).</div>';return;}
  var riskAmt=bal*rp/100;
  var riskPerUnit=Math.abs(entry-sl);
  var units=riskAmt/riskPerUnit;
  var lots=units/100000;
  var rr='\u2014';
  var profit='\u2014';
  if(tp&&tp!==entry){
    var rewardPerUnit=Math.abs(tp-entry);
    rr=(rewardPerUnit/riskPerUnit).toFixed(2);
    profit='$'+(units*rewardPerUnit).toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2});
  }
  el.style.display='block';
  el.innerHTML='<div style="background:rgba(163,230,53,0.08);border:0.5px solid '+C.lime+'55;border-radius:10px;padding:14px;display:grid;grid-template-columns:1fr 1fr;gap:12px">'+
    resultItem('Risk Amount','$'+riskAmt.toFixed(2))+
    resultItem('Position Size',units<1000?units.toFixed(2)+' units':(units/1000).toFixed(2)+'K units')+
    resultItem('Lots (Std)',lots.toFixed(2))+
    resultItem('R:R',rr)+
    (tp&&tp!==entry?resultItem('Potential Profit',profit):'')+
    '</div>';
};

function inp(id,label,val){
  return '<div style="display:flex;flex-direction:column;gap:4px">'+
    '<span style="color:'+C.text2+';font-size:10px">'+label+'</span>'+
    '<input id="calc-'+id+'" type="number" step="any" value="'+val+'" style="background:rgba(255,255,255,0.05);border:0.5px solid '+C.border+';border-radius:8px;padding:10px 12px;color:'+C.white+';font-size:13px;font-family:monospace;outline:none">'+
    '</div>';
}
function resultItem(label,val){
  return '<div><div style="color:'+C.text2+';font-size:10px;margin-bottom:3px">'+label+'</div><div style="color:'+C.white+';font-weight:600;font-size:16px;letter-spacing:-0.3px">'+val+'</div></div>';
}

// ===== CONFLUENCE =====
function confluenceScreen(){
  if(!state.confluence.length)return emptyState('Market data loading...');
  return state.confluence.map(function(p){
    var isBull=p.weeklyBias==='BULLISH'||p.signalDir==='BULLISH';
    var wc=p.weeklyBias==='BULLISH'?C.lime:p.weeklyBias==='BEARISH'?C.red:C.text2;
    var dc=p.dailyTrend==='BULLISH'?C.lime:p.dailyTrend==='BEARISH'?C.red:C.text2;
    var tc=p.convictionLabel==='ELITE'?C.lime:p.convictionLabel==='STRONG'?C.white:p.convictionLabel==='VALID'?C.text3:C.text2;
    var userTag=p.userInTrade
      ?'<span style="font-size:9px;color:'+C.lime+';background:'+C.limeSoft+';border-radius:99px;padding:2px 8px;font-weight:700">YOURS'+(p.activeTradeProgress?.tp1Fired?' TP1\u2713':'')+(p.activeTradeProgress?.beFired?' BE\u2713':'')+'</span>'
      :'';
    return '<div class="card" style="border-left:2.5px solid '+tc+';animation-delay:'+(Math.random()*0.15)+'s">'+
      '<div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">'+
      '<span style="font-weight:800;font-size:16px;letter-spacing:-0.2px;color:'+C.white+'">'+p.name+'</span>'+
      '<span class="mono" style="color:'+C.text2+';font-size:12px">'+p.price+'</span>'+userTag+'</div>'+
      '<div style="display:flex;gap:5px;flex-wrap:wrap;margin-bottom:8px">'+
      '<span style="font-size:10px;border:0.5px solid '+wc+'44;border-radius:99px;padding:3px 10px;color:'+wc+';font-weight:700">W: '+p.weeklyBias+'</span>'+
      '<span style="font-size:10px;border:0.5px solid '+dc+'44;border-radius:99px;padding:3px 10px;color:'+dc+';font-weight:700">D: '+p.dailyTrend+'</span>'+
      (p.biasRelation==='ALIGNED'?'<span style="font-size:10px;border:0.5px solid '+C.lime+'44;background:'+C.limeSoft+';border-radius:99px;padding:3px 10px;color:'+C.lime+';font-weight:600">ALIGNED</span>'
        :p.biasRelation==='CONFLICT'?'<span style="font-size:10px;border:0.5px solid '+C.red+'44;background:'+C.redSoft+';border-radius:99px;padding:3px 10px;color:'+C.red+';font-weight:600">CONFLICT</span>'
        :'<span style="font-size:10px;border:0.5px solid '+C.text2+'44;background:'+C.surface+';border-radius:99px;padding:3px 10px;color:'+C.text2+';font-weight:600">MIXED</span>')+
      pill(p.convictionLabel,tc,tc+'22',p.convictionLabel==='ELITE'?'pulse-ring':'')+'</div>'+
      (p.signalDir!=='NONE'?'<div style="display:flex;align-items:center;gap:6px;margin-bottom:6px">'+icon(isBull?'up':'down',isBull?C.lime:C.red,14)+'<span style="font-weight:600;font-size:12px;color:'+C.white+'">'+(p.signalDir==='BULLISH'?'BUY':'SELL')+' signal</span></div>':'<div style="color:'+C.text2+';font-size:11px;margin-bottom:6px">No active signals</div>')+
      (p.factors.length?'<div style="display:flex;gap:4px;flex-wrap:wrap">'+p.factors.map(function(f){return '<span style="font-size:9px;color:'+C.lime+';background:'+C.limeSoft+';border-radius:99px;padding:2px 8px">\u2713 '+f+'</span>';}).join('')+'</div>':'')+
      '</div>';
  }).join('');
}

// ===== STATS OVERVIEW =====
function statsOverview(){
  var st=state.stats||{};
  var wrTotal=st.winRate||0;
  var trTotal=st.totalR||0;
  return '<div style="display:flex;gap:8px;margin-bottom:14px">'+
    '<div class="glass-sm" style="flex:1;padding:14px;text-align:center;animation-delay:0s">'+
    '<div style="font-size:10px;color:'+C.text2+';font-weight:500">Win Rate</div>'+
    '<div style="display:flex;align-items:baseline;justify-content:center;gap:1px;margin-top:2px">'+
    '<div class="count-up" style="font-size:24px;font-weight:800;color:'+C.lime+';letter-spacing:-0.5px" data-target="'+wrTotal+'">0</div>'+
    '<span style="font-size:13px;font-weight:700;color:'+C.lime+'">%</span></div></div>'+
    '<div class="glass-sm" style="flex:1;padding:14px;text-align:center;animation-delay:0.05s">'+
    '<div style="font-size:10px;color:'+C.text2+';font-weight:500">Total R</div>'+
    '<div style="display:flex;align-items:baseline;justify-content:center;gap:1px;margin-top:2px">'+
    '<span style="font-size:13px;font-weight:700;color:'+(trTotal>=0?C.lime:C.red)+'">'+(trTotal>=0?'+':'-')+'</span>'+
    '<div class="count-up" style="font-size:24px;font-weight:800;color:'+C.lime+';letter-spacing:-0.5px" data-target="'+Math.abs(trTotal)+'" data-dur="800">0</div>'+
    '<span style="font-size:13px;font-weight:700;color:'+C.lime+'">R</span></div></div>'+
    '<div class="glass-sm" style="flex:1;padding:14px;text-align:center;animation-delay:0.1s">'+
    '<div style="font-size:10px;color:'+C.text2+';font-weight:500">Active</div>'+
    '<div class="count-up" style="font-size:24px;font-weight:800;color:'+C.white+';margin-top:2px;letter-spacing:-0.5px" data-target="'+state.active.length+'">0</div></div></div>';
}

// ===== PERFORMANCE CHARTS =====
function equityChart(entries){
  if(entries.length<2)return '';
  var sorted=entries.slice().sort(function(a,b){return(a.createdAt||'').localeCompare(b.createdAt||'');});
  var cumR=0,points=[];
  for(var i=0;i<sorted.length;i++){cumR+=(sorted[i].rMultiple||0);points.push(cumR);}
  var mn=Math.min(0,Math.min.apply(null,points));
  var mx=Math.max(0,Math.max.apply(null,points));
  var rng=mx-mn||1;
  var w=310,h=62,pad=4;
  var toY=function(v){return pad+(1-(v-mn)/rng)*(h-pad*2);};
  var toX=function(i){return pad+(i/(points.length-1))*(w-pad*2);};
  var d='';
  for(var i=0;i<points.length;i++){d+=(i===0?'M':'L')+toX(i).toFixed(1)+','+toY(points[i]).toFixed(1);}
  var zeroY=toY(0);
  var fillD=d+'L'+toX(points.length-1).toFixed(1)+','+zeroY.toFixed(1)+'L'+toX(0).toFixed(1)+','+zeroY.toFixed(1)+'Z';
  var lastVal=points[points.length-1];
  var color=lastVal>=0?C.lime:C.red;
  return '<div class="card" style="padding:14px 16px;animation-delay:0.02s">'+
    '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">'+
    '<span style="font-size:12px;font-weight:700;color:'+C.white+'">Equity Curve</span>'+
    '<span style="font-size:11px;font-weight:700;color:'+color+'">'+(lastVal>=0?'+':'')+lastVal.toFixed(1)+'R</span></div>'+
    '<svg width="100%" height="'+h+'" viewBox="0 0 '+w+' '+h+'" style="display:block">'+
    '<path d="'+fillD+'" fill="url(#eqGrad)" opacity="0.15"/>'+
    '<defs><linearGradient id="eqGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="'+color+'"/><stop offset="100%" stop-color="'+color+'" stop-opacity="0"/></linearGradient></defs>'+
    '<path d="'+d+'" stroke="'+color+'" stroke-width="1.8" fill="none" stroke-linecap="round" stroke-linejoin="round"/>'+
    '<circle cx="'+toX(points.length-1).toFixed(1)+'" cy="'+toY(lastVal).toFixed(1)+'" r="2.5" fill="'+color+'"/></svg></div>';
}

function rBarChart(entries){
  if(!entries.length)return '';
  var slice=entries.slice(-20);
  var maxR=Math.max.apply(null,slice.map(function(e){return Math.abs(e.rMultiple||0);}));
  maxR=Math.max(maxR,0.5);
  var barW=12,gap=3,totalW=slice.length*(barW+gap);
  var h=60,zeroY=h-10;
  var bars='';
  for(var i=0;i<slice.length;i++){
    var e=slice[i],r=e.rMultiple||0;
    var barH=(Math.abs(r)/maxR)*(h-16);
    var x=i*(barW+gap);
    var y=r>=0?zeroY-barH:zeroY;
    var c=r>0?C.lime:r<0?C.red:C.text2;
    bars+='<rect x="'+x+'" y="'+y.toFixed(1)+'" width="'+barW+'" height="'+barH.toFixed(1)+'" rx="2" fill="'+c+'" opacity="0.8"/>';
  }
  return '<div class="card" style="padding:14px 16px;animation-delay:0.04s">'+
    '<div style="font-size:12px;font-weight:700;color:'+C.white+';margin-bottom:8px">R per Trade <span style="font-size:9px;color:'+C.text2+';font-weight:400">(last '+slice.length+')</span></div>'+
    '<svg width="100%" height="'+h+'" viewBox="0 0 '+(totalW+4)+' '+h+'" style="display:block">'+
    '<line x1="0" y1="'+zeroY+'" x2="'+(totalW+4)+'" y2="'+zeroY+'" stroke="rgba(255,255,255,0.06)" stroke-width="0.5"/>'+
    bars+'</svg></div>';
}

function jcPref(key){return localStorage.getItem('jc_'+key)!=='false';}
function toggleJC(key){localStorage.setItem('jc_'+key,!(jcPref(key)));render();}
// ===== JOURNAL SCREEN =====
function journalScreen(){
  var entries=state.journal;
  // Tab filter (QMR vs Scalp)
  if(state.journalTab==='scalp')entries=entries.filter(function(e){return e.system==='scalp';});
  else entries=entries.filter(function(e){return e.system!=='scalp';});
  // Pair filter
  var pairs={};
  for(var pi=0;pi<entries.length;pi++)pairs[entries[pi].pair]=true;
  var pairList=Object.keys(pairs).sort();
  if(state.journalPairFilter!=='all')entries=entries.filter(function(e){return e.pair===state.journalPairFilter;});
  // Direction filter
  if(state.journalDirFilter!=='all')entries=entries.filter(function(e){return (e.direction||'')===state.journalDirFilter;});
  var wins=entries.filter(function(e){return e.outcome==='WIN'||e.outcome==='TP1'||e.outcome==='TP2';});
  var losses=entries.filter(function(e){return e.outcome==='SL';});
  var bes=entries.filter(function(e){return e.outcome==='BE';});
  var wr=(wins.length+losses.length)?Math.round((wins.length/(wins.length+losses.length))*100):0;
  var totalR=entries.reduce(function(a,e){return a+(e.rMultiple||0);},0);
  var filtered=state.journalFilter==='all'?entries
    :state.journalFilter==='wins'?wins
    :state.journalFilter==='losses'?losses
    :entries.filter(function(e){return e.outcome===state.journalFilter;});
  var allTags=[...new Set(entries.flatMap(function(e){return e.tags||[];}))].slice(0,8);
  var streakInfo=state.stats||{};

  function renderDayHeaders(){
    var days=['M','T','W','T','F','S','S'],h='';
    for(var d=0;d<days.length;d++)h+='<span style="font-size:7px;color:'+C.text2+';width:10px;text-align:center;display:inline-block">'+days[d]+'</span>';
    return h;
  }
  function renderCells(outcomes,getDate,getOutcome){
    var now=new Date();
    var start=new Date(Date.UTC(now.getUTCFullYear(),now.getUTCMonth(),now.getUTCDate()));
    start.setUTCDate(start.getUTCDate()-27);
    var cells=[];
    for(var i=0;i<28;i++){
      var d=new Date(start);d.setUTCDate(start.getUTCDate()+i);
      var ds=d.toISOString().slice(0,10);
      var match=null;
      for(var j=0;j<outcomes.length;j++)if(getDate(outcomes[j])===ds){match=outcomes[j];break;}
      var outcome=match?getOutcome(match):null;
      var color=outcome==='WIN'||outcome==='TP1'||outcome==='TP2'?C.lime:outcome==='SL'?C.red:outcome==='BE'?C.text2:'rgba(255,255,255,0.04)';
      cells.push('<span style="display:inline-block;width:10px;height:10px;border-radius:2.5px;background:'+color+'"></span>');
    }
    var rows='';
    for(var w=0;w<4;w++)rows+='<div style="display:flex;gap:3px;margin-top:3px">'+cells.slice(w*7,w*7+7).join('')+'</div>';
    return rows;
  }
  function heatmapCard(label,outcomes,getDate,getOutcome){
    var monthName=new Date().toLocaleDateString('en-US',{month:'long',year:'numeric'});
    return '<div class="card" style="animation-delay:0.05s">'+
      '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">'+
      '<span style="font-size:13px;font-weight:700;color:'+C.white+'">'+label+'</span>'+
      '<div style="display:flex;gap:8px;font-size:9px;color:'+C.text2+'">'+
      '<span><span style="display:inline-block;width:8px;height:8px;border-radius:2px;background:'+C.lime+';vertical-align:middle;margin-right:2px"></span>W</span>'+
      '<span><span style="display:inline-block;width:8px;height:8px;border-radius:2px;background:'+C.red+';vertical-align:middle;margin-right:2px"></span>L</span>'+
      '<span><span style="display:inline-block;width:8px;height:8px;border-radius:2px;background:'+C.text2+';vertical-align:middle;margin-right:2px"></span>BE</span>'+
      '</div></div>'+
      '<div style="font-size:9px;color:'+C.text2+';margin-bottom:6px">'+monthName+'</div>'+
      '<div style="display:flex;gap:3px">'+renderDayHeaders()+'</div>'+
      renderCells(outcomes,getDate,getOutcome)+'</div>';
  }
  function tagHtml(tag){
    var isEarly=tag==='Early Entry';
    var isFeeling=tag==='Confident'||tag==='Impatient'||tag==='Neutral';
    var emojiMap={Displacement:'', 'Liq Sweep':'\uD83E\uDDF9', MSS:'\uD83D\uDCD0', 'Eng. Liq':'\u26A1', FVG:'\uD83D\uDCB0', OB:'\uD83C\uDFE6', CRT:'\uD83D\uDCC8', 'Early Entry':'\u23F0', Confident:'\uD83C\uDFCB\uFE0F', Impatient:'\uD83E\uDD2F', Neutral:'\uD83D\uDE10'};
    var bg,col;
    if(isEarly){bg=C.redSoft;col=C.red;}
    else if(isFeeling){bg=C.surface;col=C.text2;}
    else{bg=C.limeSoft;col=C.lime;}
    return '<span style="font-size:8.5px;padding:2px 8px;border-radius:99px;background:'+bg+';color:'+col+'">'+(emojiMap[tag]||'')+' '+tag+'</span>';
  }
  function flagHtml(f){return '<span style="font-size:8.5px;padding:2px 8px;border-radius:99px;background:'+C.redSoft+';color:'+C.red+';font-weight:600">\u26A0 '+f+'</span>';}

  function entryHtml(e){
    var outcome=e.outcome;
    var isWin=outcome==='WIN'||outcome==='TP1'||outcome==='TP2';
    var iconColor=isWin?C.lime:outcome==='SL'?C.red:C.text2;
    var iconBg=isWin?C.limeSoft:outcome==='SL'?C.redSoft:C.surface;
    var iconText=isWin?'\u2713':outcome==='SL'?'\u2715':'\u2014';
    var resultColor=isWin?C.lime:outcome==='SL'?C.red:C.text2;
    var tagsHtml='';
    if(e.tags&&e.tags.length){tagsHtml='<div style="display:flex;gap:4px;margin-top:5px">';for(var i=0;i<e.tags.length;i++)tagsHtml+=tagHtml(e.tags[i]);tagsHtml+='</div>';}
    var flagsHtml='';
    if(e.reviewFlags&&e.reviewFlags.length){flagsHtml='<div style="display:flex;gap:4px;margin-top:4px">';for(var i=0;i<e.reviewFlags.length;i++)flagsHtml+=flagHtml(e.reviewFlags[i]);flagsHtml+='</div>';}
    var notesHtml=e.notes?'<div style="font-size:11.5px;color:'+C.text2+';margin-top:5px;line-height:1.4">'+esc(e.notes)+'</div>':'';
    var sysTag=e.system==='scalp'?'<span style="font-size:8px;font-weight:700;padding:1px 4px;border-radius:2px;background:#3B82F6;color:#FFF;margin-left:4px">SCALP</span>':'<span style="font-size:8px;font-weight:700;padding:1px 4px;border-radius:2px;background:'+C.lime+';color:#000;margin-left:4px">QMR</span>';
    return '<div class="card" onclick="editEntry(\''+e.id+'\')" style="padding:12px 16px;cursor:pointer;animation-delay:0s">'+
      '<div style="display:flex;gap:12px;align-items:flex-start">'+
      '<div style="width:30px;height:30px;border-radius:99px;flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:13px;background:'+iconBg+';color:'+iconColor+'">'+iconText+'</div>'+
      '<div style="flex:1;min-width:0">'+
      '<div style="display:flex;justify-content:space-between;align-items:center">'+
      '<span style="font-weight:700;font-size:13px;color:'+C.white+'">'+e.pair+sysTag+'</span>'+
      '<span style="font-weight:800;font-size:13px;color:'+resultColor+'">'+(e.rMultiple>=0?'+':'')+(e.rMultiple||0)+'R</span></div>'+
      '<div style="font-size:10px;color:'+C.text2+';margin-top:2px">'+(e.direction||'')+' \u00b7 '+(e.tf||'')+' \u00b7 '+(e.duration||'')+' \u00b7 '+(e.createdAt?timeAgo(e.createdAt):'')+'</div>'+
      notesHtml+flagsHtml+tagsHtml+'</div></div></div>';
  }

  var entriesHtml='';
  if(filtered.length){for(var i=0;i<filtered.length;i++)entriesHtml+=entryHtml(filtered[i]);}
  else{entriesHtml='<div class="card" style="text-align:center;padding:30px;color:'+C.text2+';font-size:12px">'+(state.journalFilter==='all'?'No journal entries yet. Tap "+ New Journal Entry" to start tracking your trades.':'No entries match this filter.')+'</div>';}

  var filterChips=['all','wins','losses','BE'];
  for(var i=0;i<allTags.length;i++)filterChips.push(allTags[i]);
  var chipsHtml='';
  for(var i=0;i<filterChips.length;i++){
    var active=state.journalFilter===filterChips[i];
    var label=filterChips[i]==='all'?'All':filterChips[i].charAt(0).toUpperCase()+filterChips[i].slice(1);
    chipsHtml+='<span onclick="setJournalFilter(\''+filterChips[i]+'\')" style="font-size:10px;font-weight:600;padding:5px 12px;border-radius:4px;cursor:pointer;background:'+(active?C.limeSoft:'rgba(255,255,255,0.03)')+';color:'+(active?C.lime:C.text2)+';border:0.5px solid '+(active?C.limeBorder:'rgba(255,255,255,0.05)')+'">'+label+'</span>';
  }

  // Performance dashboard
  var ds=state.detailedStats||{};
  function perfTabBtn(label,key){var a=state.statsTab===key;return'<span onclick="state.statsTab=\''+key+'\';render()" style="font-size:10px;font-weight:600;padding:5px 14px;border-radius:4px;cursor:pointer;background:'+(a?C.limeSoft:'rgba(255,255,255,0.03)')+';color:'+(a?C.lime:C.text2)+';border:0.5px solid '+(a?C.limeBorder:'rgba(255,255,255,0.05)')+'">'+label+'</span>';}
  var perfContent='';
  if(state.statsTab==='overview'){
    perfContent=(jcPref('charts')?equityChart(entries)+rBarChart(entries):'')+
    (jcPref('heatmap')?heatmapCard('Your Trades',entries,function(e){return e.createdAt?e.createdAt.slice(0,10):'';},function(e){return e.outcome;})+
    heatmapCard('Bot Trades',state.botHistory,function(o){return o.time?o.time.slice(0,10):'';},function(o){return o.outcome;}):'');
  }else if(state.statsTab==='pairs'&&ds.byPair){
    var pairRows='';
    var sortedPairs=Object.keys(ds.byPair).sort(function(a,b){return ds.byPair[b].total-ds.byPair[a].total;});
    for(var pi=0;pi<sortedPairs.length;pi++){
      var p=ds.byPair[sortedPairs[pi]];
      var pwr=p.wins+p.losses?Math.round(p.wins/(p.wins+p.losses)*100):0;
      pairRows+='<div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:0.5px solid rgba(255,255,255,0.04);font-size:12px">'+
        '<span style="font-weight:600;color:'+C.white+'">'+sortedPairs[pi]+'</span>'+
        '<span style="color:'+C.lime+'">'+p.wins+'W</span>'+
        '<span style="color:'+C.red+'">'+p.losses+'L</span>'+
        '<span style="color:'+(pwr>=50?C.lime:C.red)+'">'+pwr+'%</span>'+
        '<span style="color:'+C.text2+'">'+(p.totalR>=0?'+':'')+p.totalR.toFixed(1)+'R</span></div>';
    }
    perfContent='<div class="card" style="padding:4px 16px;animation-delay:0s">'+
      '<div style="display:flex;justify-content:space-between;padding:8px 0;font-size:10px;color:'+C.text2+';font-weight:600;text-transform:uppercase">'+
      '<span>Pair</span><span>Wins</span><span>Losses</span><span>WR</span><span>Total R</span></div>'+pairRows+'</div>';
  }else if(state.statsTab==='days'&&ds.byDay){
    var dayRows='',dayNames=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
    for(var di=0;di<dayNames.length;di++){
      var dk=dayNames[di],dc=ds.byDay.counts[dk]||0,dw=ds.byDay.wins[dk]||0;
      var dwr=dc?Math.round(dw/dc*100):0;
      dayRows+='<div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:0.5px solid rgba(255,255,255,0.04);font-size:12px">'+
        '<span style="font-weight:600;color:'+C.white+'">'+dk+'</span>'+
        '<span style="color:'+C.text2+'">'+dc+' trades</span>'+
        '<span style="color:'+C.lime+'">'+dw+' wins</span>'+
        '<span style="color:'+(dwr>=50?C.lime:C.red)+'">'+dwr+'%</span></div>';
    }
    perfContent='<div class="card" style="padding:4px 16px;animation-delay:0s">'+
      '<div style="display:flex;justify-content:space-between;padding:8px 0;font-size:10px;color:'+C.text2+';font-weight:600;text-transform:uppercase">'+
      '<span>Day</span><span>Count</span><span>Wins</span><span>WR</span></div>'+dayRows+'</div>';
  }
  // Weekly summary
  var wsHtml='';
  var ws=state.weeklySummary;
  if(ws&&ws.total>0){
    var wsBar='\u2588'.repeat(Math.round(ws.wr/10))+'\u2591'.repeat(10-Math.round(ws.wr/10));
    wsHtml='<div class="card" style="border-color:'+C.limeBorder+';padding:14px 16px;animation-delay:0s">'+
      '<div style="font-size:11px;font-weight:700;color:'+C.text2+';letter-spacing:0.5px;text-transform:uppercase;margin-bottom:8px">\uD83D\uDCCA This Week</div>'+
      '<div style="display:flex;justify-content:space-around;margin-bottom:8px">'+
      '<div style="text-align:center"><div style="font-size:18px;font-weight:800;color:'+C.lime+'">'+ws.total+'</div><div style="font-size:9px;color:'+C.text2+'">Trades</div></div>'+
      '<div style="text-align:center"><div style="font-size:18px;font-weight:800;color:'+C.lime+'">'+(ws.wr||0)+'%</div><div style="font-size:9px;color:'+C.text2+'">Win Rate</div></div>'+
      '<div style="text-align:center"><div style="font-size:18px;font-weight:800;color:'+(ws.totalR>=0?C.lime:C.red)+'">'+(ws.totalR>=0?'+':'')+(ws.totalR||0).toFixed(1)+'R</div><div style="font-size:9px;color:'+C.text2+'">Total R</div></div></div>'+
      '<div style="font-size:10px;font-family:monospace;color:'+C.lime+'">'+wsBar+'</div>'+
      '<div style="display:flex;gap:12px;margin-top:6px;font-size:10px;color:'+C.text2+'">'+
      '<span>\u2705 '+ws.tp+' wins</span><span>\u274C '+ws.sl+' losses</span><span>\u2696\uFE0F '+ws.be+' BE</span></div></div>';
  }

  var customizeBtn='<span onclick="state.showJournalCustomize=!state.showJournalCustomize;render()" style="font-size:10px;font-weight:600;color:'+(state.showJournalCustomize?C.lime:C.text2)+';cursor:pointer">'+(state.showJournalCustomize?'Done':'Customize')+'</span>';
  var customizePanel='';
  if(state.showJournalCustomize){
    var cardLabels={summary:'Weekly Summary',stats:'Stats Card',charts:'Equity & R Chart',pairs:'By Pair Table',days:'By Day Table',streaks:'Streaks Card',heatmap:'Heatmaps'},cardKeys=['summary','stats','charts','pairs','days','streaks','heatmap'];
    customizePanel='<div class="card" style="padding:10px 16px;animation-delay:0s;margin-bottom:8px"><div style="font-size:10px;font-weight:700;color:'+C.text2+';letter-spacing:0.3px;text-transform:uppercase;margin-bottom:6px">Toggle Dashboard Cards</div>';
    for(var ci=0;ci<cardKeys.length;ci++){var k=cardKeys[ci],on=jcPref(k);customizePanel+='<div class="setting-row" style="padding:8px 0"><span style="font-size:12px;color:'+C.white+'">'+cardLabels[k]+'</span><div class="toggle '+(on?'on':'')+'" onclick="toggleJC(\''+k+'\')"></div></div>';}
    customizePanel+='</div>';
  }
  return '<div style="display:flex;align-items:center;justify-content:space-between;padding-top:12px;margin-bottom:14px">'+
    '<div style="font-size:18px;font-weight:600;letter-spacing:-0.3px;color:'+C.white+'">Journal</div>'+
    '<div style="display:flex;gap:8px;align-items:center">'+
    customizeBtn+
    '<span onclick="window.open(withCode(\'/api/journal\'),\'_blank\')" style="font-size:10px;font-weight:600;color:'+C.text2+';cursor:pointer">Export</span>'+
    '<button onclick="toggleEntryForm()" style="background:'+C.lime+';border:none;border-radius:8px;width:30px;height:30px;display:flex;align-items:center;justify-content:center;cursor:pointer;color:#000;font-weight:800;font-size:18px;line-height:1">+</button>'+
    '</div></div>'+
    '<div style="display:flex;gap:6px;margin-bottom:12px">'+
    '<span onclick="state.journalTab=\'qmr\';render()" style="flex:1;text-align:center;padding:8px 0;border-radius:8px;font-size:11px;font-weight:700;cursor:pointer;background:'+(state.journalTab==='qmr'?C.lime:'rgba(255,255,255,0.04)')+';color:'+(state.journalTab==='qmr'?'#000':C.text2)+'">QMR Journal</span>'+
    '<span onclick="state.journalTab=\'scalp\';render()" style="flex:1;text-align:center;padding:8px 0;border-radius:8px;font-size:11px;font-weight:700;cursor:pointer;background:'+(state.journalTab==='scalp'?'#3B82F6':'rgba(255,255,255,0.04)')+';color:'+(state.journalTab==='scalp'?'#FFF':C.text2)+'">Scalp Journal</span>'+
    '</div>'+
    customizePanel+
    (jcPref('summary')?wsHtml:'')+
    (jcPref('stats')?'<div class="card" style="padding:16px 20px;border-color:'+C.limeBorder+';animation-delay:0s"><div style="display:flex;justify-content:space-around">'+
    '<div style="text-align:center"><div style="display:flex;align-items:baseline;justify-content:center;gap:1px"><div class="count-up" style="font-size:22px;font-weight:800;color:'+C.lime+';letter-spacing:-0.5px" data-target="'+wr+'">0</div><span style="font-size:12px;font-weight:700;color:'+C.lime+'">%</span></div><div style="font-size:9px;color:'+C.text2+';font-weight:500;margin-top:2px">Win Rate</div></div>'+
    '<div style="text-align:center"><div style="display:flex;align-items:baseline;justify-content:center;gap:1px"><span style="font-size:12px;font-weight:700;color:'+(totalR>=0?C.lime:C.red)+'">'+(totalR>=0?'+':'-')+'</span><div class="count-up" style="font-size:22px;font-weight:800;color:'+(totalR>=0?C.lime:C.red)+';letter-spacing:-0.5px" data-target="'+Math.abs(totalR||0)+'" data-dur="800">0</div><span style="font-size:12px;font-weight:700;color:'+(totalR>=0?C.lime:C.red)+'">R</span></div><div style="font-size:9px;color:'+C.text2+';font-weight:500;margin-top:2px">Total R</div></div>'+
    '<div style="text-align:center"><div class="count-up" style="font-size:22px;font-weight:800;color:'+C.white+';letter-spacing:-0.5px" data-target="'+entries.length+'">0</div><div style="font-size:9px;color:'+C.text2+';font-weight:500;margin-top:2px">Trades</div></div>'+
    '<div style="text-align:center"><div class="count-up" style="font-size:22px;font-weight:800;color:'+C.red+';letter-spacing:-0.5px" data-target="'+losses.length+'">0</div><div style="font-size:9px;color:'+C.text2+';font-weight:500;margin-top:2px">Losses</div></div></div></div>':'')+
    (jcPref('charts')||jcPref('pairs')||jcPref('days')?'<div style="display:flex;gap:6px;margin-bottom:8px">'+perfTabBtn('Overview','overview')+perfTabBtn('By Pair','pairs')+perfTabBtn('By Day','days')+'</div>':'')+
    ((jcPref('charts')&&state.statsTab==='overview')||(jcPref('pairs')&&state.statsTab==='pairs')||(jcPref('days')&&state.statsTab==='days')?perfContent:'')+
    (jcPref('streaks')?'<div class="card" style="display:flex;justify-content:space-around;padding:14px 10px;animation-delay:0.1s">'+
    '<div style="text-align:center"><div style="font-size:9px;color:'+C.text2+';font-weight:500">\uD83D\uDD25 Win Streak</div>'+
    '<div style="font-size:20px;font-weight:800;color:'+C.lime+';letter-spacing:-0.5px;margin-top:2px">'+(streakInfo.winStreak??0)+'</div></div>'+
    '<div style="width:0.5px;background:rgba(255,255,255,0.05)"></div>'+
    '<div style="text-align:center"><div style="font-size:9px;color:'+C.text2+';font-weight:500">\uD83D\uDE24 Loss Streak</div>'+
    '<div style="font-size:20px;font-weight:800;color:'+C.red+';letter-spacing:-0.5px;margin-top:2px">'+(streakInfo.lossStreak??0)+'</div></div>'+
    '<div style="width:0.5px;background:rgba(255,255,255,0.05)"></div>'+
    '<div style="text-align:center"><div style="font-size:9px;color:'+C.text2+';font-weight:500">\uD83C\uDFC6 Best Day</div>'+
    '<div style="font-size:20px;font-weight:800;color:'+C.white+';letter-spacing:-0.5px;margin-top:2px">'+(state.stats?.bestTrade?'+'+state.stats.bestTrade.rMultiple+'R':'--')+'</div></div></div>':'')+
    (state.showEntryForm||state.editingEntry?journalEntryForm():'')+
    '<div style="display:flex;gap:6px;margin-bottom:8px">'+
    '<select onchange="setJournalPairFilter(this.value)" style="flex:1;font-size:10px;padding:5px 8px;background:rgba(255,255,255,0.03);border:0.5px solid rgba(255,255,255,0.05);border-radius:4px;color:'+C.text2+';outline:none">'+
    '<option value="all"'+(state.journalPairFilter==='all'?' selected':'')+'>All Pairs</option>'+
    pairList.map(function(p){return '<option value="'+p+'"'+(state.journalPairFilter===p?' selected':'')+'>'+p+'</option>';}).join('')+
    '</select>'+
    '<select onchange="setJournalDirFilter(this.value)" style="flex:1;font-size:10px;padding:5px 8px;background:rgba(255,255,255,0.03);border:0.5px solid rgba(255,255,255,0.05);border-radius:4px;color:'+C.text2+';outline:none">'+
    '<option value="all"'+(state.journalDirFilter==='all'?' selected':'')+'>All Directions</option>'+
    '<option value="BULLISH"'+(state.journalDirFilter==='BULLISH'?' selected':'')+'>Buy</option>'+
    '<option value="BEARISH"'+(state.journalDirFilter==='BEARISH'?' selected':'')+'>Sell</option>'+
    '</select></div>'+
    '<div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:12px">'+chipsHtml+'</div>'+
    entriesHtml;
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
    tagsHtml+='<span onclick="toggleTag(this,\''+tagOpts[i]+'\')" style="font-size:9px;padding:4px 10px;border-radius:4px;cursor:pointer;background:'+(active?C.limeSoft:'rgba(255,255,255,0.03)')+';color:'+(active?C.lime:C.text2)+';border:0.5px solid '+(active?C.limeBorder:'rgba(255,255,255,0.05)')+'">'+tagOpts[i]+'</span>';
  }
  var deleteHtml=edit?'<div style="text-align:center;margin-top:10px"><span onclick="deleteEntry(\''+edit.id+'\')" style="font-size:12px;color:'+C.red+';font-weight:600;cursor:pointer">Delete this entry</span></div>':'';
  return '<div class="card" style="border-color:'+C.limeBorder+';animation-delay:0s">'+
    '<div style="font-size:13px;font-weight:700;color:'+C.white+';margin-bottom:12px">'+title+'</div>'+
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
    '<div id="jStatus" style="font-size:11px;color:'+C.lime+';margin-top:8px;text-align:center"></div></div>';
}

var selectedTags=[];
function toggleTag(el,tag){
  var idx=selectedTags.indexOf(tag);
  if(idx>-1){selectedTags.splice(idx,1);el.style.background='rgba(255,255,255,0.03)';el.style.color=C.text2;el.style.borderColor='rgba(255,255,255,0.05)';}
  else{selectedTags.push(tag);el.style.background=C.limeSoft;el.style.color=C.lime;el.style.borderColor=C.limeBorder;}
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
window.setJournalPairFilter=function(f){state.journalPairFilter=f;render();};
window.setJournalDirFilter=function(f){state.journalDirFilter=f;render();};
window.setNewsFilter=function(f){state.newsFilter=f;render();};

// ===== SCALP SCREEN =====
function scalpScreen(){
  var signals=state.scalpSignals||[];
  var active=state.scalpActive||[];
  var stats=state.scalpStats;
  var pulse=state.scalpPulse||[];
  var h=new Date().getUTCHours();
  var session='CLOSED';
  if((h===7||(h>7&&h<10)||h===10))session='LONDON';
  else if((h===13||(h>13&&h<16)||h===16))session='NY';
  var sessionColor=session==='LONDON'?'#A3E635':session==='NY'?'#EF4444':'#8E8E93';
  var sessionLabel=session==='LONDON'?'London Open':session==='NY'?'New York Open':'Market Closed';
  var icon=session==='LONDON'?'\uD83C\uDDEC\uD83C\uDDE7':session==='NY'?'\uD83C\uDDFA\uD83C\uDDF8':'\uD83D\uDD34';

  // Header
  var html='<div style="display:flex;justify-content:space-between;align-items:center;padding-top:0;margin-bottom:14px">'+
    '<div style="font-size:15px;font-weight:800;color:#FFF;letter-spacing:-0.01em">Scalp <span style="font-size:11px;font-weight:400;color:#8E8E93">\u00B7 Session Breakout + FVG</span></div>'+
    '<div style="display:flex;align-items:center;gap:6px">'+
    '<div style="width:8px;height:8px;border-radius:99px;background:'+sessionColor+'"></div>'+
    '<span style="font-size:11px;font-weight:600;color:'+sessionColor+'">'+icon+' '+sessionLabel+'</span></div></div>';

  // Market pulse — daily direction for each scalp pair
  if(pulse.length){
    html+='<div style="display:flex;gap:6px;overflow-x:auto;padding-bottom:4px;margin-bottom:14px;scrollbar-width:none">';
    for(var i=0;i<pulse.length;i++){
      var p=pulse[i];
      var isUp=p.direction==='BULLISH';
      var dirColor=isUp?'#A3E635':'#EF4444';
      var dirIcon=isUp?'\u25B2':'\u25BC';
      html+='<div style="display:flex;align-items:center;gap:6px;padding:6px 12px;border-radius:99px;background:rgba(255,255,255,0.04);border:0.5px solid rgba(255,255,255,0.06);flex-shrink:0">'+
        '<span style="font-size:11px;font-weight:700;color:#FFF">'+p.id+'</span>'+
        '<span style="font-size:10px;font-weight:700;color:'+dirColor+'">'+dirIcon+'</span>'+
        '<span style="font-size:9px;color:#8E8E93">Daily</span></div>';
    }
    html+='</div>';
  }

  // Stats card (always visible)
  var st=stats||{winRate:0,totalR:0,wins:0,losses:0,bes:0,total:0};
  var wrColor=st.winRate>=60?'#A3E635':st.winRate>=40?'#FBBF24':'#EF4444';
  html+='<div class="card" style="padding:12px 16px;margin-bottom:14px;animation-delay:0s">'+
    '<div style="display:flex;justify-content:space-between;margin-bottom:6px">'+
    '<span style="font-size:11px;font-weight:700;color:#FFF">Scalp Performance</span>'+
    '<span style="font-size:9px;color:#8E8E93">'+st.total+' trades</span></div>'+
    '<div style="display:flex;gap:16px">'+
    '<div><span style="font-size:10px;color:#8E8E93">Win Rate</span><br><span style="font-size:20px;font-weight:800;color:'+wrColor+'">'+st.winRate+'%</span></div>'+
    '<div><span style="font-size:10px;color:#8E8E93">Total R</span><br><span style="font-size:20px;font-weight:800;color:'+(st.totalR>=0?'#A3E635':'#EF4444')+'">'+(st.totalR>=0?'+':'')+st.totalR+'R</span></div>'+
    '<div><span style="font-size:10px;color:#8E8E93">W / L / BE</span><br><span style="font-size:18px;font-weight:700;color:#FFF">'+st.wins+'<span style="color:#A3E635;font-size:12px">W</span> / '+st.losses+'<span style="color:#EF4444;font-size:12px">L</span> / '+st.bes+'<span style="color:#8E8E93;font-size:12px">BE</span></span></div>'+
    '</div></div>';

  // Active trades (always visible)
  html+='<div class="section-h" style="margin-bottom:8px;color:#FFF;font-size:12px">Active Scalp Trades <span style="font-size:10px;color:#A3E635;font-weight:400">('+active.length+')</span></div>';
  if(active.length){
    for(var i=0;i<active.length;i++){
      var t=active[i];
      var isB=t.type==='BULLISH';
      var dec=t.pair==='NAS100'?2:t.pair==='USDJPY'||t.pair==='GBPJPY'?3:5;
      var fmt=function(v){return v==null?'--':v.toFixed(dec);};
      var dur=Math.round((Date.now()-t.openTime)/60000);
      html+='<div class="card" style="padding:12px 16px;margin-bottom:6px;animation-delay:0.02s">'+
        '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px">'+
        '<div style="display:flex;align-items:center;gap:6px">'+
        '<span style="font-size:12px;font-weight:700;color:#FFF">'+t.name+'</span>'+
        '<span style="font-size:9px;font-weight:600;padding:2px 6px;border-radius:3px;background:'+(isB?'rgba(163,230,53,0.15)':'rgba(239,68,68,0.15)')+';color:'+(isB?'#A3E635':'#EF4444')+'">'+(isB?'BUY':'SELL')+'</span></div>'+
        '<span style="font-size:9px;color:#8E8E93">'+(dur>=60?Math.floor(dur/60)+'h '+dur%60+'m':dur+'m')+'</span></div>'+
        '<div style="display:flex;gap:12px;font-size:10px;color:#8E8E93">'+
        '<span>Entry: <b style="color:#FFF">'+fmt(t.entry)+'</b></span>'+
        '<span>SL: <b style="color:#EF4444">'+fmt(t.sl)+'</b></span>'+
        '<span>TP2: <b style="color:#A3E635">'+fmt(t.tp2)+'</b></span></div></div>';
    }
  }else{
    html+='<div class="card" style="padding:20px 16px;margin-bottom:14px;text-align:center;color:#636366;font-size:11px">No active scalp trades</div>';
  }

  // Signal cards
  if(!signals.length){
    if(session==='CLOSED')return html+'<div style="margin-top:20px;text-align:center;padding:40px;color:#8E8E93;font-size:12px">No active session. Scalp signals appear during London (7-10 UTC) and New York (13-16 UTC).</div>';
    return html+'<div style="margin-top:20px;text-align:center;padding:40px;color:#8E8E93;font-size:12px">Waiting for a breakout with FVG + deep Fib confluence...<br><span style="font-size:10px;color:#636366">Checking every 30 min during '+session+' session</span></div>';
  }
  html+='<div class="section-h" style="margin-bottom:8px;color:#FFF;font-size:12px">Recent Signals</div>';
  for(var i=0;i<signals.length;i++){
    var s=signals[i];
    var isBuy=s.type==='BULLISH'||s.type==='BUY';
    var p=s.pair==='NAS100'?2:s.pair==='USDJPY'||s.pair==='GBPJPY'?3:5;
    var fmt=function(v){return v==null?'--':v.toFixed(p);};
    var slDist=Math.abs(s.entry-s.sl);
    var rr=slDist>0?((Math.abs(s.tp2-s.entry)/slDist).toFixed(1)):'--';
    var sessionTag=s.session==='LONDON'?'\uD83C\uDDEC\uD83C\uDDE7':' \uD83C\uDDFA\uD83C\uDDF8';
    var fibColors={'61.8':'#3B82F6','70.2':'#8B5CF6','78.6':'#EC4899'};
    var fibColor=fibColors[s.fib]||'#A3E635';
    var timeStr=s.time?new Date(s.time).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'}):'';
    var tracked=state.trackedIds&&state.trackedIds[s.id];
    html+='<div class="card" style="padding:14px 16px;animation-delay:'+(i*0.04)+'s">'+
      '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">'+
      '<div style="display:flex;align-items:center;gap:6px">'+
      '<span style="font-size:13px;font-weight:800;color:#FFF">'+(s.name||s.pair)+'</span>'+
      '<span style="font-size:9px;font-weight:600;padding:2px 6px;border-radius:3px;background:'+(isBuy?'rgba(163,230,53,0.15)':'rgba(239,68,68,0.15)')+';color:'+(isBuy?'#A3E635':'#EF4444')+'">'+(isBuy?'BUY':'SELL')+'</span>'+
      '<span style="font-size:9px;color:#8E8E93">'+sessionTag+' '+s.session+'</span></div>'+
      '<div style="display:flex;align-items:center;gap:6px">'+
      '<span style="font-size:9px;color:#8E8E93">'+timeStr+'</span>'+
      '<span onclick="trackScalp(\''+s.id+'\')" style="font-size:9px;font-weight:600;padding:3px 8px;border-radius:4px;cursor:pointer;background:'+(tracked?'rgba(163,230,53,0.15)':'rgba(255,255,255,0.06)')+';color:'+(tracked?'#A3E635':'#8E8E93')+'">'+(tracked?'\u2705 Tracked':'Track')+'</span></div></div>'+
      '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-bottom:8px">'+
      '<div><div style="font-size:8px;color:#636366;text-transform:uppercase">Entry</div><div style="font-size:15px;font-weight:700;color:#FFF">'+fmt(s.entry)+'</div></div>'+
      '<div><div style="font-size:8px;color:#636366;text-transform:uppercase">SL</div><div style="font-size:13px;font-weight:600;color:#EF4444">'+fmt(s.sl)+'</div></div>'+
      '<div><div style="font-size:8px;color:#636366;text-transform:uppercase">TP2</div><div style="font-size:13px;font-weight:600;color:#A3E635">'+fmt(s.tp2)+'</div></div></div>'+
      '<div style="display:flex;gap:10px;flex-wrap:wrap;margin-bottom:8px">'+
      '<div style="display:flex;align-items:center;gap:4px"><span style="font-size:10px;color:#8E8E93">Score</span><span style="font-size:13px;font-weight:800;color:#FFF">'+s.score+'/5</span></div>'+
      '<div style="display:flex;align-items:center;gap:4px"><span style="font-size:10px;color:#8E8E93">RR</span><span style="font-size:13px;font-weight:700;color:#A3E635">1:'+rr+'</span></div>'+
      '<div style="display:flex;align-items:center;gap:4px"><span style="font-size:10px;color:#8E8E93">Fib</span><span style="font-size:11px;font-weight:700;color:'+fibColor+'">'+s.fib+'%</span></div>'+
      (s.volRatio>1?'<span style="font-size:9px;padding:2px 6px;border-radius:3px;background:rgba(163,230,53,0.12);color:#A3E635">Volume '+(s.volRatio*100).toFixed(0)+'%</span>':'')+
      '</div>'+
      '<div style="display:flex;gap:4px;flex-wrap:wrap;margin-bottom:6px">'+
      '<span style="font-size:9px;padding:2px 6px;border-radius:3px;background:rgba(59,130,246,0.12);color:#60A5FA">Range: '+fmt(s.rangeHigh)+' / '+fmt(s.rangeLow)+'</span>'+
      '<span style="font-size:9px;padding:2px 6px;border-radius:3px;background:rgba(139,92,246,0.12);color:#A78BFA">FVG: '+fmt(s.fvgBottom)+' - '+fmt(s.fvgTop)+'</span></div>'+
      (s.chartUrl?'<div class="chart-container" style="margin-top:6px;border-radius:6px;overflow:hidden;max-height:180px;cursor:pointer" onclick="window.open(\''+withCode(s.chartUrl)+'\',\'_blank\')"><img src="'+withCode(s.chartUrl)+'" style="width:100%;height:auto;display:block" loading="lazy"></div>':'')+
      '</div>';
  }
  return html;
}

// ===== SETTINGS SCREEN =====
function settingsScreen(){
  var s=state.settings||{};
  var prefs=state.notifPrefs||{};
  var alertFilters=s.alertFilters||{};
  var notifItems=[
    ['Signal Alerts','signalAlerts','New ELITE/STRONG signals'],
    ['Scalp Alerts','scalpAlerts','New scalp breakout signals'],
    ['Trade Updates','tradeUpdates','TP1, BE, trail, SL hits'],
    ['Weekly Summary','weeklySummary','Sunday performance report'],
    ['News Alerts','newsAlerts','High-impact events'],
  ];
  var notifToggles='';
  for(var i=0;i<notifItems.length;i++){
    var key=notifItems[i][1];
    var enabled=prefs[key]!==false;
    notifToggles+='<div class="setting-row"><div><div class="label" style="color:'+C.white+'">'+notifItems[i][0]+'</div><div class="hint">'+notifItems[i][2]+'</div></div>'+
      '<div class="toggle '+(enabled?'on':'')+'" onclick="toggleNotifPref(\''+key+'\','+(!enabled)+')"></div></div>';
  }
  return '<div class="section-h" style="color:'+C.white+'">Settings</div>'+
    '<div class="card" style="display:flex;align-items:center;gap:14px;padding:14px 16px;animation-delay:0s">'+
    '<div style="width:44px;height:44px;border-radius:99px;background:conic-gradient(#A3E635,#FFF,#A3E635);padding:2px;flex-shrink:0">'+
    '<div style="width:40px;height:40px;border-radius:99px;background:#000;display:flex;align-items:center;justify-content:center;font-size:18px;font-weight:800;color:#A3E635">S</div></div>'+
    '<div style="flex:1"><div style="font-size:14px;font-weight:700;color:'+C.white+'">Slayers Member</div><div style="font-size:11px;color:'+C.text2+';margin-top:1px">Code: '+(getCode().slice(0,8)||'')+'...</div></div>'+
    '<span style="font-size:18px;color:'+C.text2+'">\u203A</span></div>'+
    '<div style="font-size:11px;font-weight:700;color:'+C.text2+';padding:6px 4px 4px;letter-spacing:0.5px;text-transform:uppercase">Notifications</div>'+
    '<div class="card" style="padding:4px 16px;animation-delay:0.05s">'+
    '<div class="setting-row"><div><div class="label" style="color:'+C.white+'">Push Notifications</div><div class="hint">Receive alerts on your phone</div></div>'+
    '<div class="toggle '+(pushStatus==='subscribed'?'on':'')+'" onclick="'+(pushStatus==='subscribed'?'alert(\'To disable, go to iPhone Settings \u2192 Notifications \u2192 Slayers.\')':'enablePush()')+'"></div></div>'+
    '<div class="setting-row"><div><div class="label" style="color:'+C.white+'">Sound Alerts</div><div class="hint">Play sound on new signals</div></div>'+
    '<div class="toggle on" onclick="this.classList.toggle(\'on\')"></div></div>'+
    notifToggles+'</div>'+
    '<div style="font-size:11px;font-weight:700;color:'+C.text2+';padding:6px 4px 4px;letter-spacing:0.5px;text-transform:uppercase">Alert Filters</div>'+
    '<div class="card" style="padding:4px 16px;animation-delay:0.06s">'+
    '<div class="setting-row"><div><div class="label" style="color:'+C.white+'">Min RR Threshold</div><div class="hint">Only alert if RR ≥ this value</div></div>'+
    '<select onchange="saveAlertFilter(\'minRR\',parseFloat(this.value))" style="background:'+C.bg+';border:0.5px solid '+C.border+';border-radius:6px;padding:6px 8px;color:'+C.white+';font-size:11px;outline:none">'+
    '<option value="1.2"'+(alertFilters.minRR===1.2?' selected':'')+'>1.2R</option>'+
    '<option value="1.5"'+(alertFilters.minRR===1.5?' selected':'')+'>1.5R</option>'+
    '<option value="2.0"'+(alertFilters.minRR===2.0?' selected':'')+'>2.0R</option>'+
    '<option value="3.0"'+(alertFilters.minRR===3.0?' selected':'')+'>3.0R</option></select></div>'+
    '<div class="setting-row"><div><div class="label" style="color:'+C.white+'">Min Score</div><div class="hint">Only alert if score ≥ this</div></div>'+
    '<select onchange="saveAlertFilter(\'minScore\',parseInt(this.value))" style="background:'+C.bg+';border:0.5px solid '+C.border+';border-radius:6px;padding:6px 8px;color:'+C.white+';font-size:11px;outline:none">'+
    '<option value="0"'+(alertFilters.minScore===0?' selected':'')+'>Any</option>'+
    '<option value="1"'+(alertFilters.minScore===1?' selected':'')+'>1+</option>'+
    '<option value="2"'+(alertFilters.minScore===2?' selected':'')+'>2+</option>'+
    '<option value="3"'+(alertFilters.minScore===3?' selected':'')+'>3+</option>'+
    '<option value="4"'+(alertFilters.minScore===4?' selected':'')+'>4+ (ELITE)</option></select></div>'+
    '<div class="setting-row" style="border-bottom:none"><div><div class="label" style="color:'+C.white+'">Session Only</div><div class="hint">Only scan during London/NY hours</div></div>'+
    '<div class="toggle '+(alertFilters.sessionOnly?'on':'')+'" onclick="saveAlertFilter(\'sessionOnly\','+(!alertFilters.sessionOnly)+')"></div></div></div>'+
    '<div style="font-size:11px;font-weight:700;color:'+C.text2+';padding:6px 4px 4px;letter-spacing:0.5px;text-transform:uppercase">About</div>'+
    '<div class="card" style="padding:4px 16px;animation-delay:0.1s">'+
    '<div class="setting-row"><div><div class="label" style="color:'+C.white+'">Version</div><div class="hint">Build '+new Date().toISOString().slice(0,10)+'</div></div>'+
    '<span style="font-size:13px;font-weight:600;color:'+C.text2+'">v10.0</span></div>'+
    '<div class="setting-row" style="border-bottom:none"><div><div class="label" style="color:'+C.white+'">Onboarding Tour</div><div class="hint">Replay the intro walkthrough</div></div>'+
    '<span onclick="localStorage.removeItem(\'slayersToured\');state.showOnboarding=true;state.onboardingStep=-1;render()" style="font-size:12px;font-weight:600;color:'+C.lime+';cursor:pointer">Restart</span></div></div>'+
    '<div class="card" style="padding:4px 16px;animation-delay:0.15s">'+
    '<div class="setting-row" style="border-bottom:none"><div><div class="label" style="color:'+C.white+'">Clear Local Data</div><div class="hint">Reset app cache</div></div>'+
    '<span onclick="localStorage.clear();location.reload()" style="font-size:12px;font-weight:600;color:'+C.red+';cursor:pointer">Clear</span></div></div>'+
    '<div style="text-align:center;padding:16px 0 8px;font-size:10px;color:'+C.text3+'">Made with intent \u00b7 Slayers Trading</div>';
}

async function toggleNotifPref(key,newVal){
  var prefs=Object.assign({},state.notifPrefs);
  prefs[key]=newVal;state.notifPrefs=prefs;render();
  try{await fetch(withCode('/api/member/notif-prefs'),{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({notifPrefs:prefs})});}
  catch(e){console.error('Notif save failed',e);}
}
async function saveAlertFilter(key,val){
  var settings=Object.assign({},state.settings);
  settings.alertFilters=Object.assign({},settings.alertFilters||{});
  settings.alertFilters[key]=val;
  state.settings=settings;render();
  try{await fetch(withCode('/api/settings'),{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({settings:{alertFilters:settings.alertFilters}})});}
  catch(e){console.error('Alert filter save failed',e);}
}

// ===== NEWS SCREEN =====
function newsScreen(){
  var articles=state.articles;
  var newsFilter=state.newsFilter;
  var categories=['All','Forex','Economy','Geopolitics','Commodities'];
  var catChips='';
  for(var i=0;i<categories.length;i++){
    var active=newsFilter===categories[i];
    var catColors={'Forex':C.lime,'Economy':C.white,'Geopolitics':C.red,'Commodities':C.text2};
    var catDims={'Forex':C.limeSoft,'Economy':'rgba(255,255,255,0.04)','Geopolitics':C.redSoft,'Commodities':C.surface};
    var c=categories[i]==='All'?C.text2:catColors[categories[i]];
    var d=categories[i]==='All'?'rgba(255,255,255,0.03)':catDims[categories[i]];
    catChips+='<span onclick="setNewsFilter(\''+categories[i]+'\')" style="font-size:9px;font-weight:600;padding:4px 12px;border-radius:4px;cursor:pointer;background:'+(active?d:'rgba(255,255,255,0.03)')+';color:'+(active?c:C.text2)+';border:0.5px solid '+(active?c+'33':'rgba(255,255,255,0.05)')+'">'+categories[i]+'</span>';
  }
  var filtered=newsFilter==='All'?articles:articles.filter(function(a){return a.category===newsFilter;});
  var heroArticle=filtered[0];
  var heroHtml='';
  if(heroArticle){
    var heroCatColor={'Forex':C.lime,'Economy':C.white,'Geopolitics':C.red,'Commodities':C.text2}[heroArticle.category]||C.text2;
    var heroImg=heroArticle.image||'';
    var heroBg=heroImg?'url('+heroImg+') center/cover':'linear-gradient(135deg,rgba(0,0,0,0.6),rgba(255,255,255,0.04))';
    var heroLink=(heroArticle.link||'').replace(/'/g,'%27');
    heroHtml='<div class="card" style="padding:0;overflow:hidden;border-color:'+heroCatColor+'1E;animation-delay:0s;cursor:pointer" onclick="window.open(\''+heroLink+'\',\'_blank\')">'+
      '<div style="height:160px;background:'+heroBg+';display:flex;align-items:flex-end;position:relative">'+
      '<div style="position:absolute;inset:0;background:linear-gradient(0deg,rgba(0,0,0,0.85) 0%,rgba(0,0,0,0.3) 50%,rgba(0,0,0,0.1) 100%)"></div>'+
      '<div style="position:absolute;top:10px;right:10px">'+
      pill('Featured',heroCatColor,heroCatColor+'22')+'</div>'+
      '<div style="padding:16px;width:100%;position:relative;z-index:1">'+
      '<span style="font-size:9px;color:'+C.text2+'">'+(heroArticle.source||'')+' \u00b7 '+timeAgo(heroArticle.time)+'</span>'+
      '<div style="font-size:15px;font-weight:800;color:'+C.white+';margin-top:4px;line-height:1.3">'+esc(heroArticle.title)+'</div></div></div></div>';
  }
  var articlesHtml='';
  if(filtered.length>1){
    for(var i=1;i<filtered.length;i++){
      var a=filtered[i];
      var catColor={'Forex':C.lime,'Economy':C.white,'Geopolitics':C.red,'Commodities':C.text2}[a.category]||C.text2;
      var aLink=(a.link||'').replace(/'/g,'%27');
      articlesHtml+='<div class="card" style="padding:12px 16px;cursor:pointer;animation-delay:'+(i*0.03)+'s" onclick="window.open(\''+aLink+'\',\'_blank\')">'+
        '<div style="display:flex;justify-content:space-between;align-items:flex-start;gap:10px">'+
        '<div style="flex:1;min-width:0">'+
        '<div style="display:flex;gap:6px;align-items:center;margin-bottom:4px">'+
        pill(a.source||'',catColor,catColor+'22')+
        '<span style="font-size:9px;color:'+C.text2+'">'+timeAgo(a.time)+'</span></div>'+
        '<div style="font-size:13px;font-weight:700;color:'+C.white+';line-height:1.3">'+esc(a.title)+'</div>'+
        (a.summary?'<div style="font-size:11px;color:'+C.text2+';margin-top:4px;line-height:1.4">'+esc(a.summary)+'</div>':'')+
        '</div></div></div>';
    }
  }
  if(!articlesHtml&&!heroArticle)articlesHtml='<div class="card" style="text-align:center;padding:30px;color:'+C.text2+';font-size:12px">No news available.'+
    (state.fetchError?'<br><span style="color:'+C.red+';font-size:10px;margin-top:8px;display:block">'+state.fetchError+'</span>':'')+
    (state.newsFeedOk===false?'<br><span style="color:'+C.text2+';font-size:10px;margin-top:8px;display:block">News feed endpoint not responding. Try again later.</span>':'')+
    '<br><span onclick="fetchAll()" style="color:'+C.lime+';font-size:10px;margin-top:10px;display:inline-block;cursor:pointer;font-weight:600">\u21BB Refresh</span></div>';
  return '<div class="section-h" style="padding-top:12px;margin-bottom:8px;color:'+C.white+'">News</div>'+
    '<div style="font-size:10px;color:'+C.text2+';font-weight:500;margin:-10px 0 12px">Market Intel</div>'+
    '<div style="display:flex;gap:4px;flex-wrap:wrap;margin-bottom:12px">'+catChips+'</div>'+
    (heroArticle?heroHtml:'')+articlesHtml;
}

function emptyState(text){return '<div style="text-align:center;padding:40px 20px;color:'+C.text2+';font-size:13px">'+text+'</div>';}

// ===== ACTIVE TRADE WIDGET =====
function activeTradeWidget(t){
  var isB=t.type==='BULLISH';
  var progress=t.tp1?Math.min(100,Math.max(0,((isB?t.qmLevel-(t.tp1):(t.tp1)-t.qmLevel)/(isB?t.qmLevel-(t.tp1||t.sl):(t.tp1||t.sl)-t.qmLevel))*100)):0;
  var badges='';
  if(t.tp1Fired)badges+='<span style="font-size:8px;font-weight:600;padding:2px 8px;border-radius:4px;background:'+C.limeSoft+';color:'+C.lime+'">TP1 \u2713</span>';
  if(t.beFired)badges+='<span style="font-size:8px;font-weight:600;padding:2px 8px;border-radius:4px;background:'+C.redSoft+';color:'+C.red+'">BE \u2713</span>';
  if(t.trailActive)badges+='<span style="font-size:8px;font-weight:600;padding:2px 8px;border-radius:4px;background:'+C.limeSoft+';color:'+C.lime+'">Trailing</span>';
  var duration='';
  if(t.openTime){var ms=Date.now()-t.openTime;duration=Math.floor(ms/3600000)+'h '+Math.floor((ms%3600000)/60000)+'m';}
  var rVal=((t.tp1?Math.abs(t.tp1-t.qmLevel):0)/Math.abs(t.qmLevel-t.sl)).toFixed(1)||'0.0';
  return '<div class="card-glass" style="animation-delay:0s">'+
    '<div style="display:flex;align-items:center;gap:10px;margin-bottom:14px">'+
    '<span class="live-dot"></span>'+
    '<span style="font-weight:800;font-size:18px;letter-spacing:-0.3px;color:'+C.white+'">'+(t.instName||t.instId)+'</span>'+
    '<span style="font-size:10px;color:'+C.text2+';font-weight:500">'+t.tf+'</span>'+
    '<span style="margin-left:auto;font-size:9px;font-weight:600;padding:3px 10px;border-radius:4px;background:'+(isB?C.limeSoft:C.redSoft)+';color:'+(isB?C.lime:C.red)+';border:0.5px solid '+(isB?C.lime:C.red)+'33;text-transform:uppercase">'+(isB?'BUY':'SELL')+'</span></div>'+
    '<div style="display:flex;justify-content:space-between;margin-bottom:4px">'+
    '<div><div style="font-size:10px;color:'+C.text2+'">Entry</div><div style="font-size:14px;font-weight:800;letter-spacing:-0.3px;color:'+C.white+'">'+fmt(t.qmLevel)+'</div></div>'+
    '<div style="text-align:center"><div style="font-size:10px;color:'+C.text2+'">Now</div><div style="font-size:14px;font-weight:800;color:'+C.lime+';letter-spacing:-0.3px">'+(t.tp1||fmt(t.sl))+'</div></div>'+
    '<div style="text-align:right"><div style="font-size:10px;color:'+C.text2+'">TP1</div><div style="font-size:14px;font-weight:800;color:'+C.white+';letter-spacing:-0.3px">'+(t.tp1?fmt(t.tp1):'--')+'</div></div></div>'+
    '<div class="progress-track" style="margin-top:8px"><div class="progress-fill" style="animation:fillBar 0.8s cubic-bezier(0.16,1,0.3,1);width:'+progress+'%"></div></div>'+
    '<div style="display:flex;justify-content:space-between;margin-top:10px;align-items:center">'+
    '<div style="display:flex;gap:6px">'+badges+'</div>'+
    '<div style="display:flex;align-items:center;gap:8px">'+
    '<span style="font-size:13px;font-weight:800;color:'+C.lime+'">+'+rVal+'R</span>'+
    '<span style="font-size:10px;color:'+C.text2+'">'+duration+'</span></div></div></div>';
}

// ===== MAIN RENDER =====
function render(){
  var app=document.getElementById('app');
  if(state.selected){app.innerHTML=detailPage(state.selected);return;}
  var tabLabels={overview:'QMR',scalp:'Scalp',journal:'Journal',news:'News',settings:'Settings'};
  var tabsArr=['overview','scalp','journal','news','settings'];
  var tabBtns='';
  for(var i=0;i<tabsArr.length;i++){
    var t=tabsArr[i];
    var active=state.tab===t;
    var iconKey=t==='overview'?'grid':t==='journal'?'book':t==='scalp'?'pulse':t==='news'?'radio':'gear';
    tabBtns+='<button class="tab-btn'+(active?' active':'')+'" data-tab="'+t+'">'+
      '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">'+ICONS[iconKey]+'</svg>'+
      '<span>'+tabLabels[t]+'</span></button>';
  }
  var skeletonHtml=state.loading?'<div style="padding:40px 0"><div class="card" style="height:200px;margin-bottom:14px;background:rgba(255,255,255,0.03);animation:none"></div><div class="card" style="height:200px;background:rgba(255,255,255,0.03);animation:none"></div></div>':'';
  app.innerHTML='<div class="app" style="display:flex;flex-direction:column;height:100dvh;background:#000;color:#FFF;position:relative">'+
    '<div class="ptr-wrap" id="ptrWrap" style="height:0"><div class="ptr-inner"><div class="ptr-logo" id="ptrLogo">S</div><span class="ptr-text" id="ptrText">Pull to refresh</span></div></div>'+
    '<div id="content" style="flex:1;overflow-y:auto;padding:44px 20px 0;background:#000;color:'+C.white+'">'+skeletonHtml+'</div>'+
    '<div style="padding:0 14px 14px">'+
    '<div id="tabbar" style="display:flex;background:rgba(255,255,255,0.06);backdrop-filter:blur(40px);border-radius:22px;border:0.5px solid rgba(255,255,255,0.08);padding:4px;gap:2px;position:relative">'+
    '<div class="nav-indicator" style="position:absolute;bottom:4px;height:2px;border-radius:2px;background:#A3E635;transition:left 0.4s cubic-bezier(0.16,1,0.3,1),width 0.4s cubic-bezier(0.16,1,0.3,1)"></div>'+
    tabBtns+'</div>'+
    (state.showOnboarding?onboardingHTML():'')+
    '</div>';
  if(!state.loading){
    var content=document.getElementById('content');
    if(state.tab==='overview'){content.innerHTML=overviewScreen();}
    else if(state.tab==='journal'){content.innerHTML=journalScreen();}
    else if(state.tab==='scalp'){content.innerHTML=scalpScreen();}
    else if(state.tab==='settings'){content.innerHTML=settingsScreen();}
    else if(state.tab==='news'){content.innerHTML=newsScreen();}
  }
  requestAnimationFrame(function(){
    var indicator=document.querySelector('.nav-indicator');
    var activeBtn=document.querySelector('.tab-btn.active');
    if(indicator&&activeBtn){
      var rect=activeBtn.getBoundingClientRect();
      var parentRect=activeBtn.closest('#tabbar').getBoundingClientRect();
      indicator.style.left=(rect.left-parentRect.left)+'px';
      indicator.style.width=rect.width+'px';
    }
  });
  setupPTR(document.getElementById('content'));
  setTimeout(animateCounters,50);
}

function overviewScreen(){
  var trackedIds={};
  for(var i=0;i<state.signals.length;i++)if(state.signals[i].isTracked)trackedIds[state.signals[i].id]=true;
  var myActive=[];
  for(var i=0;i<state.active.length;i++)if(trackedIds[state.active[i].sigId])myActive.push(state.active[i]);
  var activeSigIds={};
  for(var i=0;i<state.active.length;i++)activeSigIds[state.active[i].sigId]=true;
  var headerHtml='<div style="padding-top:0;margin-bottom:18px">'+
    '<div style="font-size:14px;font-weight:500;color:'+C.text2+'">'+greeting()+'</div>'+
    '<div style="font-size:26px;font-weight:800;letter-spacing:-0.5px;color:'+C.white+'">SLAYERS.</div></div>';
  var statsHtml=statsOverview();
  var tradesHtml='';
  for(var i=0;i<myActive.length;i++)tradesHtml+=activeTradeWidget(myActive[i]);
  // Signal filter bar
  var filterIcon=state.showFilters?'\u25B2':'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="4" y1="6" x2="20" y2="6"/><line x1="8" y1="12" x2="20" y2="12"/><line x1="12" y1="18" x2="20" y2="18"/></svg>';
  var filterBar='<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px">'+
    '<div class="section-h" style="color:'+C.white+';margin-bottom:0;padding-top:0">Recent Signals</div>'+
    '<span onclick="state.showFilters=!state.showFilters;render()" style="font-size:10px;color:'+C.text2+';cursor:pointer;padding:6px">'+filterIcon+'</span></div>';
  var filterOpts='';
  if(state.showFilters){
    filterOpts='<div class="card" style="padding:10px 14px;animation-delay:0s;margin-bottom:8px">'+
      '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:6px">'+
      '<input placeholder="Pair (e.g. EUR)" value="'+esc(state.filter.pair)+'" oninput="state.filter.pair=this.value.toUpperCase();fetchAll()" style="background:rgba(255,255,255,0.04);border:0.5px solid rgba(255,255,255,0.08);border-radius:6px;padding:8px;color:'+C.white+';font-size:11px;outline:none">'+
      '<select onchange="state.filter.tf=this.value;fetchAll()" style="background:rgba(255,255,255,0.04);border:0.5px solid rgba(255,255,255,0.08);border-radius:6px;padding:8px;color:'+C.white+';font-size:11px;outline:none">'+
      '<option value="">All TF</option><option value="1H"'+(state.filter.tf==='1H'?' selected':'')+'>1H</option><option value="4H"'+(state.filter.tf==='4H'?' selected':'')+'>4H</option></select>'+
      '<select onchange="state.filter.dir=this.value;fetchAll()" style="background:rgba(255,255,255,0.04);border:0.5px solid rgba(255,255,255,0.08);border-radius:6px;padding:8px;color:'+C.white+';font-size:11px;outline:none">'+
      '<option value="">All Directions</option><option value="BULLISH"'+(state.filter.dir==='BULLISH'?' selected':'')+'>Buy</option><option value="BEARISH"'+(state.filter.dir==='BEARISH'?' selected':'')+'>Sell</option></select>'+
      '<select onchange="state.filter.minScore=parseInt(this.value);fetchAll()" style="background:rgba(255,255,255,0.04);border:0.5px solid rgba(255,255,255,0.08);border-radius:6px;padding:8px;color:'+C.white+';font-size:11px;outline:none">'+
      '<option value="0">Min Score</option><option value="1"'+(state.filter.minScore===1?' selected':'')+'>1+</option><option value="2"'+(state.filter.minScore===2?' selected':'')+'>2+</option><option value="3"'+(state.filter.minScore===3?' selected':'')+'>3+</option><option value="4"'+(state.filter.minScore===4?' selected':'')+'>4+</option></select></div>'+
      '<div style="display:flex;gap:6px;align-items:center">'+
      '<input type="date" value="'+state.filter.dateFrom+'" onchange="state.filter.dateFrom=this.value;fetchAll()" style="flex:1;background:rgba(255,255,255,0.04);border:0.5px solid rgba(255,255,255,0.08);border-radius:6px;padding:6px;color:'+C.text2+';font-size:10px;outline:none">'+
      '<span style="color:'+C.text2+';font-size:10px">to</span>'+
      '<input type="date" value="'+state.filter.dateTo+'" onchange="state.filter.dateTo=this.value;fetchAll()" style="flex:1;background:rgba(255,255,255,0.04);border:0.5px solid rgba(255,255,255,0.08);border-radius:6px;padding:6px;color:'+C.text2+';font-size:10px;outline:none"></div>'+
      '<div style="margin-top:6px"><select onchange="state.filter.sort=this.value;fetchAll()" style="width:100%;background:rgba(255,255,255,0.04);border:0.5px solid rgba(255,255,255,0.08);border-radius:6px;padding:6px;color:'+C.white+';font-size:11px;outline:none">'+
      '<option value="time"'+(state.filter.sort==='time'?' selected':'')+'>Sort by Time</option>'+
      '<option value="score"'+(state.filter.sort==='score'?' selected':'')+'>Sort by Score</option>'+
      '<option value="rr"'+(state.filter.sort==='rr'?' selected':'')+'>Sort by RR</option></select></div></div>';
  }
  var signalsHtml='';
  var signalCount=0;
  if(state.signals.length){
    for(var i=0;i<state.signals.length;i++){
      var s=state.signals[i];
      if(s.outcome||(s.isTracked&&!activeSigIds[s.id]))continue;
      signalCount++;signalsHtml+=signalCard(s);
    }
    if(signalCount)signalsHtml=filterBar+filterOpts+signalsHtml;
    else if(signalCount===0&&state.showFilters)signalsHtml=filterBar+filterOpts+'<div style="text-align:center;padding:24px;color:'+C.text2+';font-size:12px">No signals match your filters</div>';
  }
  var emptyHtml='';
  if(!myActive.length&&!signalCount)emptyHtml=emptyState(state.fetchError?'Connection problem: '+state.fetchError:'No signals yet. Waiting for the next scan...');
  return headerHtml+
    statsHtml+
    '<div class="section-h" style="color:'+C.white+'">Market Pulse</div>'+marketPulseRow()+
    tradesHtml+signalsHtml+emptyHtml;
}

function marketPulseRow(){
  var pairs=state.confluence.length?state.confluence:[];
  var chips='';
  var maxChips=Math.min(pairs.length,11);
  for(var i=0;i<maxChips;i++){
    var p=pairs[i];
    var wb=p.weeklyBias||'NEUTRAL';
    var dir=p.signalDir!=='NONE'?p.signalDir:wb;
    var c=dir==='BULLISH'?C.lime:dir==='BEARISH'?C.red:C.text2;
    var bg=dir!=='NONE'?(dir==='BULLISH'?C.limeSoft:C.redSoft):'rgba(255,255,255,0.02)';
    var badge=p.signalDir!=='NONE'?'4H':'W';
    chips+='<span class="m-chip" style="border:0.5px solid '+c+'44;background:'+bg+';color:'+c+'" onclick="setTab(\'journal\');state.journalFilter=\'all\';render()">'+
      '<span style="width:5px;height:5px;border-radius:99px;background:'+c+'"></span>'+(p.name||p.id)+
      '<span style="font-size:7px;font-weight:700;opacity:0.6">'+badge+'</span></span>';
  }
  return '<div style="display:flex;gap:8px;overflow-x:auto;padding-bottom:4px;margin-bottom:6px;scrollbar-width:none">'+(chips||'<span style="color:'+C.text2+';font-size:12px">No market data yet</span>')+'</div>';
}

// ===== ACTIONS =====
window.setTab=function(t){state.tab=t;state.selected=null;render();};
window.setFilter=function(key,value){state.filter[key]=value;render();};
window.openDetail=function(id){state.showCalc=false;for(var i=0;i<state.signals.length;i++)if(state.signals[i].id===id){state.selected=state.signals[i];break;}render();window.scrollTo(0,0);};
window.copyTrade=function(id){for(var i=0;i<state.signals.length;i++){var s=state.signals[i];if(s.id===id||s.id+'-agg'===id||s.id+'-cons'===id){var base=s.id===id?s:null;if(!base)continue;var txt;if(s.dualEntry){txt=(s.type==='BULLISH'?'BUY':'SELL')+' '+s.pair+' | Aggressive: '+fmt(s.aggEntry)+(s.consEntry?' | Conservative: '+fmt(s.consEntry):'')+' | SL: '+fmt(s.aggSl)+' | '+s.system+' Signal';}else{txt=(s.type==='BULLISH'?'BUY':'SELL')+' '+s.pair+' | Entry: '+fmt(s.entry)+' | SL: '+fmt(s.sl)+(s.tp1?' | TP1: '+fmt(s.tp1):'')+(s.tp2?' | TP2: '+fmt(s.tp2):'')+' | '+s.system+' Signal';}navigator.clipboard.writeText(txt).then(function(){showToast('Trade copied to clipboard');}).catch(function(){});break;}}};
function showToast(msg){var d=document.createElement('div');d.textContent=msg;d.style.cssText='position:fixed;bottom:80px;left:50%;transform:translateX(-50%);background:rgba(255,255,255,0.1);backdrop-filter:blur(10px);color:#fff;padding:10px 20px;border-radius:99px;font-size:13px;font-weight:600;z-index:9999;transition:opacity 0.3s';document.body.appendChild(d);setTimeout(function(){d.style.opacity='0';setTimeout(function(){d.remove();},300);},2000);}
window.enablePush=enablePush;
window.closeDetail=function(){state.showCalc=false;state.selected=null;render();};
window.toggleNotif=toggleNotifPref;
window.toggleNotifPref=toggleNotifPref;
window.toggleEntryForm=toggleEntryForm;
window.saveJournalEntry=saveJournalEntry;
window.toggleTag=toggleTag;
window.setNewsFilter=setNewsFilter;

document.addEventListener('click',function(e){
  var btn=e.target.closest('.tab-btn');
  if(btn){
    state.tab=btn.dataset.tab;state.selected=null;render();
    requestAnimationFrame(function(){
      var indicator=document.querySelector('.nav-indicator');
      if(indicator&&btn){
        var rect=btn.getBoundingClientRect();
        var parentRect=btn.closest('#tabbar').getBoundingClientRect();
        indicator.style.left=(rect.left-parentRect.left)+'px';
        indicator.style.width=rect.width+'px';
      }
    });
  }
});

window.toggleTrack=async function(signalId,currentlyTracking){
  try{
    if(currentlyTracking){await fetch(withCode('/api/track/'+encodeURIComponent(signalId)),{method:'DELETE'});}
    else{await fetch(withCode('/api/track'),{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({signalId:signalId})});}
    var baseId=signalId.replace(/-(agg|cons)$/,'');
    var sig=null;
    for(var i=0;i<state.signals.length;i++)if(state.signals[i].id===baseId){sig=state.signals[i];break;}
    if(sig){
      if(sig.dualEntry){
        if(signalId.endsWith('-agg'))sig.isTrackedAgg=!currentlyTracking;
        else if(signalId.endsWith('-cons'))sig.isTrackedCons=!currentlyTracking;
      } else {
        sig.isTracked=!currentlyTracking;
      }
    }
    if(state.selected&&state.selected.id===baseId){
      if(state.selected.dualEntry){
        if(signalId.endsWith('-agg'))state.selected.isTrackedAgg=!currentlyTracking;
        else if(signalId.endsWith('-cons'))state.selected.isTrackedCons=!currentlyTracking;
      } else {
        state.selected.isTracked=!currentlyTracking;
      }
    }
    render();
  }catch(e){console.error('Track toggle failed',e);}
};
window.trackScalp=async function(signalId){
  try{
    var sig=null;
    for(var i=0;i<state.scalpSignals.length;i++)if(state.scalpSignals[i].id===signalId){sig=state.scalpSignals[i];break;}
    var currentlyTracking=sig&&sig.isTracked;
    if(currentlyTracking){await fetch(withCode('/api/track/'+encodeURIComponent(signalId)),{method:'DELETE'});}
    else{await fetch(withCode('/api/track'),{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({signalId:signalId})});}
    if(sig)sig.isTracked=!currentlyTracking;
    render();
  }catch(e){}
};

// ===== LOGIN =====
function renderLogin(errorMsg){
  var app=document.getElementById('app');
  app.innerHTML='<div style="min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:calc(24px + env(safe-area-inset-top)) 24px calc(24px + env(safe-area-inset-bottom));text-align:center;background:#000;color:#FFF">'+
    '<div style="font-weight:900;font-size:30px;letter-spacing:-1px;text-transform:uppercase;margin-bottom:6px">'+
    '<span style="color:#FFF">THE </span><span style="color:#A3E635;text-shadow:0 0 30px rgba(163,230,53,0.33)">SLAYERS</span></div>'+
    '<div style="color:#8E8E93;font-size:12px;margin-bottom:32px">v10.0</div>'+
    '<div class="card" style="width:100%;max-width:300px;padding:24px;border-color:rgba(163,230,53,0.25)">'+
    '<div style="font-size:14px;font-weight:700;color:#FFF;margin-bottom:10px">Enter your access code</div>'+
    '<input id="codeInput" type="text" placeholder="SLAY-XXXXXX" autocapitalize="characters" autocomplete="off" style="width:100%;background:rgba(0,0,0,0.35);border:0.5px solid rgba(255,255,255,0.08);border-radius:12px;padding:14px;color:#FFF;font-size:16px;text-align:center;letter-spacing:2px;margin-bottom:14px;outline:none" class="mono"/>'+
    (errorMsg?'<div style="color:#EF4444;font-size:12.5px;margin-bottom:14px">'+errorMsg+'</div>':'')+
    '<button id="loginBtn" style="width:100%;background:#A3E635;border:none;border-radius:10px;padding:15px 0;color:#000;font-weight:800;font-size:14px;cursor:pointer">Unlock</button>'+
    '<div id="loginStatus" style="color:#8E8E93;font-size:11.5px;margin-top:14px"></div></div>'+
    '<div style="color:#48484A;font-size:11px;margin-top:40px">Don\'t have a code? Message Rexroz on Telegram.</div></div>';
  document.getElementById('loginBtn').onclick=attemptLogin;
  document.getElementById('codeInput').addEventListener('keypress',function(e){if(e.key==='Enter')attemptLogin();});
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
      loading:true,showCalc:false,showOnboarding:false,onboardingStep:-1
    });
    fetchAll();
  }catch(e){clearCode();renderLogin('Connection error. Try again.');}
}

// ===== ONBOARDING =====
var tourSteps=[
  {tab:'overview',title:'QMR Dashboard',desc:'Your command center. QMR stats, active trades, signal cards, and market pulse — all at a glance.'},
  {tab:'overview',title:'Signal Cards',desc:'Each card shows: <strong>Pair + Timeframe</strong>, <strong>Direction</strong> (BUY/SELL), <strong>Entry/SL/TP</strong>, and <strong>criteria chips</strong> explaining why the bot took the trade. Tap a card to open the detail page.'},
  {tab:'overview',title:'Signal Detail Page',desc:'View <strong>chart screenshot</strong>, <strong>trade levels</strong> (entry, zone, refined entry, SL, TP1, TP2), <strong>criteria checklist</strong> scored X/4, <strong>counter-trend warnings</strong>, and the <strong>track button</strong> to get updates on this trade.'},
  {tab:'overview',title:'Position Calculator',desc:'Tap <strong>Calculate Position Size</strong> on the detail page. Enter your balance & risk % — it calculates <strong>risk amount</strong>, <strong>position size</strong>, <strong>lots</strong>, <strong>R:R</strong>, and <strong>potential profit</strong>, pre-filled with the signal\'s entry & SL.'},
  {tab:'scalp',title:'Scalp Trading',desc:'<strong>Session Momentum + FVG</strong> scalping system during London (7-10 UTC) and New York (13-16 UTC). Each signal shows entry, SL, TP2, <strong>deep Fib level</strong> (61.8/70.2/78.6%), volume confirmation, and chart screenshot. Track signals to get TP1/SL/BE push alerts.'},
  {tab:'journal',title:'Trade Journal',desc:'Log every trade. Switch between <strong>QMR Journal</strong> and <strong>Scalp Journal</strong> using the tabs at the top. Use <strong>+ New Entry</strong> to add notes & tags. Tap any entry to edit or delete.'},
  {tab:'news',title:'Market Intel',desc:'Curated news across <strong>Forex</strong>, <strong>Economy</strong>, <strong>Geopolitics</strong>, and <strong>Commodities</strong>. Filter by category using the chips at the top.'},
  {tab:'settings',title:'Settings',desc:'Toggle <strong>Push Alerts</strong>, <strong>Scalp Alerts</strong>, <strong>News Alerts</strong>, and configure <strong>Alert Filters</strong>. Disconnect to clear your code.'},
];
var tourIcons=[
  '<svg viewBox="0 0 24 24"><rect x="4" y="4" width="7" height="7" rx="1.5"/><rect x="13" y="4" width="7" height="7" rx="1.5"/><rect x="4" y="13" width="7" height="7" rx="1.5"/><rect x="13" y="13" width="7" height="7" rx="1.5"/></svg>',
  '<svg viewBox="0 0 24 24"><rect x="4" y="4" width="7" height="7" rx="1.5"/><rect x="13" y="4" width="7" height="7" rx="1.5"/><rect x="4" y="13" width="7" height="7" rx="1.5"/><rect x="13" y="13" width="7" height="7" rx="1.5"/></svg>',
  '<svg viewBox="0 0 24 24"><rect x="4" y="4" width="7" height="7" rx="1.5"/><rect x="13" y="4" width="7" height="7" rx="1.5"/><rect x="4" y="13" width="7" height="7" rx="1.5"/><rect x="13" y="13" width="7" height="7" rx="1.5"/></svg>',
  '<svg viewBox="0 0 24 24"><rect x="4" y="4" width="7" height="7" rx="1.5"/><rect x="13" y="4" width="7" height="7" rx="1.5"/><rect x="4" y="13" width="7" height="7" rx="1.5"/><rect x="13" y="13" width="7" height="7" rx="1.5"/></svg>',
  '<svg viewBox="0 0 24 24"><path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/><path d="M8 7h8M8 11h6"/></svg>',
  '<svg viewBox="0 0 24 24"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>',
  '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="2"/><path d="M16.24 7.76a6 6 0 010 8.49M7.76 16.24a6 6 0 010-8.49M19.07 4.93a10 10 0 010 14.14M4.93 19.07a10 10 0 010-14.14"/></svg>',
  '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>'
];

function onboardingHTML(){
  if(state.onboardingStep<0){
    // Welcome screen
    return '<div class="onboard-overlay" id="onboardWrap">'+
      '<div class="onboard-welcome">'+
      '<div class="onboard-logo">S</div>'+
      '<div style="font-size:12px;color:#8E8E93;font-weight:500;letter-spacing:3px;text-transform:uppercase;margin-bottom:4px">Welcome to</div>'+
      '<div style="font-size:30px;font-weight:800;color:#FFF;letter-spacing:-1px;margin-bottom:4px">SLAYERS<span style="color:#A3E635">.</span></div>'+
      '<p style="font-size:13px;color:#8E8E93;line-height:1.5;margin-bottom:24px">QMR signals, scalp breakout trading, trade journal, and market intelligence — all in one place.</p>'+
      '<div style="display:flex;flex-direction:column;gap:10px;margin-bottom:28px;text-align:left">'+
      '<div class="onboard-feature"><div class="onboard-feature-icon"><svg viewBox="0 0 24 24"><rect x="4" y="4" width="7" height="7" rx="1.5"/><rect x="13" y="4" width="7" height="7" rx="1.5"/><rect x="4" y="13" width="7" height="7" rx="1.5"/><rect x="13" y="13" width="7" height="7" rx="1.5"/></svg></div><div><div style="font-size:12px;font-weight:600;color:#FFF">Real-Time Signals</div><div style="font-size:10px;color:#8E8E93;margin-top:1px">Elite trade setups with entry, SL, TP &amp; criteria</div></div></div>'+
      '<div class="onboard-feature"><div class="onboard-feature-icon"><svg viewBox="0 0 24 24"><path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/><path d="M8 7h8M8 11h6"/></svg></div><div><div style="font-size:12px;font-weight:600;color:#FFF">Trade Journal</div><div style="font-size:10px;color:#8E8E93;margin-top:1px">Log, edit, and review every trade you take</div></div></div>'+
      '<div class="onboard-feature"><div class="onboard-feature-icon"><svg viewBox="0 0 24 24"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg></div><div><div style="font-size:12px;font-weight:600;color:#FFF">Live Scalp Signals</div><div style="font-size:10px;color:#8E8E93;margin-top:1px">Session breakout + FVG scalping with Fib confluence</div></div></div>'+
      '<div class="onboard-feature"><div class="onboard-feature-icon"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="2"/><path d="M16.24 7.76a6 6 0 010 8.49M7.76 16.24a6 6 0 010-8.49M19.07 4.93a10 10 0 010 14.14M4.93 19.07a10 10 0 010-14.14"/></svg></div><div><div style="font-size:12px;font-weight:600;color:#FFF">Market Intel</div><div style="font-size:10px;color:#8E8E93;margin-top:1px">Curated news &amp; analysis across asset classes</div></div></div>'+
      '</div>'+
      '<button class="btn-primary" style="width:100%;padding:14px 0;font-size:15px" onclick="startTour()">Take the Tour</button>'+
      '<button onclick="endTour(true)" style="background:transparent;border:none;font-size:12px;color:#8E8E93;cursor:pointer;padding:10px;margin-top:4px;width:100%;font-family:inherit">Skip &mdash; I\'ll explore</button>'+
      '</div></div>';
  }
  // Tour step
  var step=tourSteps[state.onboardingStep];
  var dots='';
  for(var i=0;i<tourSteps.length;i++)dots+='<div class="tour-dot-nav'+(i===state.onboardingStep?' active':'')+'"></div>';
  var isLast=state.onboardingStep===tourSteps.length-1;
  return '<div class="tour-overlay show" id="tourOverlay" onclick="event.stopPropagation()"></div>'+
    '<div class="tour-highlight" id="tourHighlight"></div>'+
    '<div class="tour-tooltip" id="tourTooltip" style="bottom:90px">'+
    '<div style="font-size:10px;color:#A3E635;font-weight:700;letter-spacing:1px;text-transform:uppercase;margin-bottom:8px">Step '+(state.onboardingStep+1)+' / '+tourSteps.length+'</div>'+
    '<div class="tour-header">'+tourIcons[state.onboardingStep]+'<div class="tour-title">'+step.title+'</div></div>'+
    '<div style="font-size:13px;color:#8E8E93;line-height:1.5;margin-bottom:12px">'+step.desc+'</div>'+
    '<div class="tour-nav">'+
    '<div class="tour-dots-wrap">'+dots+'</div>'+
    '<div class="tour-nav-right" style="display:flex;gap:8px;align-items:center">'+
    (state.onboardingStep>0?'<button class="btn-outline" style="padding:8px 12px;font-size:12px" onclick="prevTourStep()">\u2190 Back</button>':'')+
    (isLast
      ?'<button class="btn-primary" style="padding:8px 18px;font-size:12px;width:auto" onclick="endTour(false)">Got it</button>'
      :'<button class="btn-primary" style="padding:8px 16px;font-size:12px;width:auto" onclick="nextTourStep()">Next \u2192</button>')+
    '</div></div></div>';
}

window.startTour=function(){
  state.onboardingStep=0;
  setTab(tourSteps[0].tab);
  requestAnimationFrame(function(){
    positionTourHighlight();
  });
};
window.nextTourStep=function(){
  if(state.onboardingStep<tourSteps.length-1){
    state.onboardingStep++;
    setTab(tourSteps[state.onboardingStep].tab);
    requestAnimationFrame(positionTourHighlight);
  }
};
window.prevTourStep=function(){
  if(state.onboardingStep>0){
    state.onboardingStep--;
    setTab(tourSteps[state.onboardingStep].tab);
    requestAnimationFrame(positionTourHighlight);
  }
};
window.endTour=function(skip){
  if(!skip)localStorage.setItem('slayersToured','1');
  state.showOnboarding=false;
  state.onboardingStep=-1;
  render();
};
function positionTourHighlight(){
  var el=document.getElementById('tourHighlight');
  var tabEl=document.getElementById('tabbar');
  if(!el||!tabEl)return;
  var appEl=document.querySelector('.app');
  if(!appEl)return;
  var appRect=appEl.getBoundingClientRect();
  var tabRect=tabEl.getBoundingClientRect();
  el.style.display='block';
  el.style.left=(tabRect.left-appRect.left-2)+'px';
  el.style.top=(tabRect.top-appRect.top-2)+'px';
  el.style.width=(tabRect.width+4)+'px';
  el.style.height=(tabRect.height+4)+'px';
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
