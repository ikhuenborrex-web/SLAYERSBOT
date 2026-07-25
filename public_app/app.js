(function(){var s=document.createElement("style");s.textContent=
"html,body{background:#000;margin:0;padding:0;height:100dvh;overflow:hidden;-webkit-overflow-scrolling:touch;-webkit-tap-highlight-color:transparent}"+
".card{background:#141416;border-radius:16px;padding:16px;margin-bottom:10px;position:relative;overflow:hidden;transition:transform 0.3s cubic-bezier(0.16,1,0.3,1);animation:springUp 0.5s cubic-bezier(0.16,1,0.3,1) both;border:0.5px solid rgba(255,255,255,0.06)}"+
".card:active{transform:scale(0.985)}"+
".hero{background:linear-gradient(135deg,#141416 0%,#0F0F10 100%);border-radius:18px;padding:20px 18px;margin-bottom:16px;position:relative;overflow:hidden}"+
".mono{font-family:'SF Mono','JetBrains Mono',monospace;font-weight:600;letter-spacing:-0.02em}"+
".pulse-ring{animation:pulseRing 2s cubic-bezier(0.4,0,0.6,1) infinite}"+
"@keyframes pulseRing{0%,100%{opacity:1}50%{opacity:0.5}}"+
"@keyframes springUp{0%{opacity:0;transform:translateY(14px) scale(0.98)}100%{opacity:1;transform:translateY(0) scale(1)}}"+
"@keyframes spin{0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}}"+
"@keyframes shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}"+
".shimmer{background:linear-gradient(90deg,transparent,rgba(255,255,255,0.03),transparent);background-size:200% 100%;animation:shimmer 2s infinite}"+
".flash-row{animation:flashRow 0.6s ease 3}"+
"@keyframes flashRow{0%,100%{opacity:1}50%{opacity:0.4}}";
document.head.appendChild(s);})();

var C={bg:"#000",surface:"rgba(255,255,255,0.03)",white:"#FFF",text2:"rgba(255,255,255,0.45)",text3:"rgba(255,255,255,0.2)",lime:"#a3e635",limeSoft:"rgba(163,230,53,0.1)",limeBorder:"rgba(163,230,53,0.25)",red:"#ef4444",redSoft:"rgba(239,68,68,0.1)",orange:"#f97316",orangeSoft:"rgba(249,115,22,0.1)",blue:"#3b82f6",blueSoft:"rgba(59,130,246,0.1)",border:"rgba(255,255,255,0.06)"};

function getCode(){try{return localStorage.getItem('qmr_code')||'';}catch(e){return '';}}
function saveCode(c){try{localStorage.setItem('qmr_code',c);}catch(e){}}
function clearCode(){try{localStorage.removeItem('qmr_code');}catch(e){}}
function getDeviceId(){try{var d=localStorage.getItem('qmr_did');if(!d){d='d_'+Date.now().toString(36)+Math.random().toString(36).slice(2,8);localStorage.setItem('qmr_did',d);}return d;}catch(e){return 'unknown';}}
function esc(t){return String(t||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;');}
function withCode(u){if(!u)return'';var c=getCode();if(!c)return u;return u+(u.indexOf('?')>-1?'&':'?')+'c='+encodeURIComponent(c)+'&device='+encodeURIComponent(getDeviceId());}
function fmt(v){if(v==null||v===undefined)return'-';var n=parseFloat(v);if(isNaN(n))return v;return n.toFixed(5).replace(/0+$/,'').replace(/\.$/,'');}
function timeAgo(t){if(!t)return'';var n=Date.now(),d=new Date(t).getTime();if(isNaN(d))return'';var diff=n-d;if(diff<0)return'just now';var s=Math.floor(diff/1e3),m=Math.floor(s/60),h=Math.floor(m/60),d2=Math.floor(h/24);if(d2>0)return d2+'d ago';if(h>0)return h+'h ago';if(m>0)return m+'m ago';return s+'s ago';}
function greeting(){var h=new Date().getHours();if(h<12)return'Good morning';if(h<18)return'Good afternoon';return'Good evening';}
function pill(t,c,bg){return'<span style="font-size:9px;font-weight:700;padding:3px 10px;border-radius:99px;color:'+c+';background:'+bg+';display:inline-block">'+t+'</span>';}
function mono(v,c,s){return'<span class="mono" style="font-size:'+s+'px;color:'+c+'">'+v+'</span>';}
function emptyState(msg){return'<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;padding:60px 20px;text-align:center"><div style="font-size:28px;margin-bottom:12px;opacity:0.15">\u25CB</div><div style="font-size:14px;color:'+C.text2+';line-height:1.5">'+msg+'</div></div>';}
function showToast(msg){var d=document.createElement('div');d.textContent=msg;d.style.cssText='position:fixed;bottom:80px;left:50%;transform:translateX(-50%);background:rgba(255,255,255,0.1);backdrop-filter:blur(10px);color:#fff;padding:10px 20px;border-radius:99px;font-size:13px;font-weight:600;z-index:9999;transition:opacity 0.3s';document.body.appendChild(d);setTimeout(function(){d.style.opacity='0';setTimeout(function(){d.remove();},300);},2000);}

var lastSignalIds=[],lastScalpIds=[];
var state={
  tab:'overview',selected:null,signals:[],active:[],confluence:[],stats:null,myStats:null,journal:[],
  news:[],articles:[],settings:null,notifPrefs:{},botHistory:[],scalpSignals:[],scalpActive:[],
  scalpStats:null,scalpPulse:[],weeklyStats:null,weeklySummary:null,detailedStats:null,
  loading:true,showCalc:false,showOnboarding:false,onboardingStep:-1,showFilters:false,userBusy:false,
  filter:{pair:'',tf:'',dir:'',minScore:0,dateFrom:'',dateTo:'',sort:'time'}
};

async function fetchAll(bg){
  if(bg&&state.userBusy)return;
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
  ft(withCode(sigUrl)).then(function(r){
    if(r.status===401){clearCode();state.loading=false;renderLogin('Your access code has expired or is no longer valid.');return;}
    j(r).then(function(d){
      var sigs=d.signals||[];
      if(lastSignalIds.length&&sigs.length>lastSignalIds.length&&!bg){
        for(var si=0;si<sigs.length;si++){if(lastSignalIds.indexOf(sigs[si].id)===-1){showToast((sigs[si].type==='BULLISH'?'\uD83D\uDCC8 ':'\uD83D\uDCC9 ')+(sigs[si].dualEntry?'Dual ':'')+sigs[si].pair+' \u00b7 '+sigs[si].tier+(sigs[si].score?' ('+sigs[si].score+'/4)':''));break;}}
      }
      lastSignalIds=sigs.map(function(s){return s.id;});
      state.signals=sigs;render();
    });
  }).catch(function(){});
  ft(withCode('/api/active')).then(function(r){j(r).then(function(d){state.active=d.trades||[];render();});}).catch(function(){});
  ft(withCode('/api/confluence')).then(function(r){j(r).then(function(d){state.confluence=d.pairs||[];render();});}).catch(function(){});
  ft(withCode('/api/stats')).then(function(r){j(r).then(function(d){state.stats=d;render();});}).catch(function(){});
  ft(withCode('/api/stats/detailed')).then(function(r){j(r).then(function(d){state.detailedStats=d;render();});}).catch(function(){});
  ft(withCode('/api/stats/weekly')).then(function(r){j(r).then(function(d){state.weeklyStats=d;render();});}).catch(function(){});
  ft(withCode('/api/member/stats')).then(function(r){
    if(r.status===200)j(r).then(function(d){state.myStats=d.myStats||null;state.notifPrefs=d.notifPrefs||{};render();});
  }).catch(function(){});
  ft(withCode('/api/journal')).then(function(r){j(r).then(function(d){state.journal=d.entries||[];render();});}).catch(function(){});
  ft(withCode('/api/news')).then(function(r){j(r).then(function(d){state.news=d.events||[];render();});}).catch(function(){});
  ft(withCode('/api/news-feed')).then(function(r){j(r).then(function(d){state.articles=d.articles||d.data||d.news||d.items||(Array.isArray(d)?d:[])||[];render();});}).catch(function(){});
  ft(withCode('/api/settings')).then(function(r){j(r).then(function(d){state.settings=d.settings||null;render();});}).catch(function(){});
  ft(withCode('/api/trade-history')).then(function(r){j(r).then(function(d){state.botHistory=d.outcomes||[];render();});}).catch(function(){});
  ft(withCode('/api/weekly-summary')).then(function(r){j(r).then(function(d){state.weeklySummary=d.summary||null;render();});}).catch(function(){});
  fetch(withCode('/api/scalp')).then(function(r){return r.json().catch(function(){return{};});}).then(function(d){
    var ss=d.signals||[];
    if(lastScalpIds.length&&ss.length>lastScalpIds.length&&!bg){
      for(var si=0;si<ss.length;si++){if(lastScalpIds.indexOf(ss[si].id)===-1){showToast('\u26A1 Scalp '+(ss[si].type==='BULLISH'?'\uD83D\uDCC8 ':'\uD83D\uDCC9 ')+(ss[si].name||ss[si].pair)+' \u00b7 score '+ss[si].score+'/5');break;}}
    }
    lastScalpIds=ss.map(function(s){return s.id;});
    state.scalpSignals=ss;render();
  }).catch(function(){});
  fetch(withCode('/api/scalp/active')).then(function(r){return r.json().catch(function(){return{};});}).then(function(d){state.scalpActive=d.trades||[];render();}).catch(function(){});
  fetch(withCode('/api/scalp/stats')).then(function(r){return r.json().catch(function(){return{};});}).then(function(d){state.scalpStats=d;render();}).catch(function(){});
  fetch(withCode('/api/scalp/pulse')).then(function(r){return r.json().catch(function(){return{};});}).then(function(d){state.scalpPulse=d.pairs||[];render();}).catch(function(){});
  state.loading=false;
}

function signalCard(s){
  var isBuy=s.type==='BULLISH'||s.type==='BUY';
  var isElite=s.tier==='ELITE';
  var tierColor=isElite?C.white:C.text3;
  var tierDim=isElite?'rgba(255,255,255,0.1)':'rgba(255,255,255,0.03)';
  var criteria=(s.criteria||[]).map(function(c){return '<span style="font-size:10px;color:'+C.lime+';background:'+C.limeSoft+';border:0.5px solid '+C.limeBorder+';border-radius:4px;padding:3px 10px;font-weight:600;display:inline-block;margin:0 6px 6px 0">'+c+'</span>';}).join('');
  var isDual=s.dualEntry;
  var isStandalone=!isDual;
  var isNew=s.time&&(Date.now()-new Date(s.time).getTime())<300000;
  return '<div class="card'+(isNew?' flash-row':'')+'" onclick="openDetail(\''+s.id+'\')" style="cursor:pointer;border-left:2.5px solid '+(isDual?C.orange:tierColor)+'">'+
    '<div style="display:flex;align-items:center;gap:8px;margin-bottom:10px">'+
    '<span style="font-weight:800;font-size:16px;letter-spacing:-0.2px;color:'+C.white+'">'+s.pair+'</span>'+
    pill(s.tier,tierColor,tierDim)+
    pill(isBuy?'BUY':'SELL',isBuy?C.lime:C.red,isBuy?C.limeSoft:C.redSoft)+
    '<span style="margin-left:auto;font-size:10px;color:'+C.text2+'">'+timeAgo(s.time)+'</span>'+
    '</div>'+
    (isDual&&!s.consEntry&&!s.aggResolved?'<div style="font-size:10px;color:'+C.orange+';background:'+C.orangeSoft+';border:0.5px solid '+C.orange+'44;border-radius:6px;padding:5px 8px;font-weight:600;margin-bottom:8px">\u23F3 Conservative QM entry pending at '+fmt(s.qmLevel)+'</div>':'')+
    (isDual&&s.consEntry?'<div style="font-size:10px;color:'+C.lime+';background:'+C.limeSoft+';border:0.5px solid '+C.limeBorder+';border-radius:6px;padding:5px 8px;font-weight:600;margin-bottom:8px">\u2705 Dual Entry Complete</div>':'')+
    (isDual?'<div style="display:flex;gap:12px;font-size:12px;color:'+C.text2+'">'+
      '<span><span style="color:'+C.orange+'">\u26A1 Aggressive</span> <span class="mono" style="font-weight:700;color:'+C.orange+';font-size:13.5px">'+fmt(s.aggEntry)+'</span></span>'+
      '<span><span style="color:'+C.text2+'">SL</span> <span class="mono" style="font-weight:700;color:'+C.red+';font-size:13.5px">'+fmt(s.aggSl)+'</span></span>'+
      (s.aggTp1?'<span><span style="color:'+C.text2+'">TP1</span> <span class="mono" style="font-weight:700;color:'+C.lime+';font-size:13.5px">'+fmt(s.aggTp1)+'</span></span>':'')+
    '</div>':'')+
    (isStandalone?'<div style="display:flex;gap:12px;font-size:12px;color:'+C.text2+'">'+
      '<span><span style="color:'+C.text2+'">Entry</span> <span style="font-weight:700;color:'+C.white+'">'+fmt(s.entry)+'</span></span>'+
      '<span><span style="color:'+C.text2+'">SL</span> <span style="font-weight:700;color:'+C.red+'">'+fmt(s.sl)+'</span></span>'+
      (s.tp1?'<span><span style="color:'+C.text2+'">TP1</span> <span style="font-weight:700;color:'+C.lime+'">'+fmt(s.tp1)+'</span></span>':'')+
    '</div>':'')+
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

function detailPage(s){
  var isBuy=s.type==='BULLISH'||s.type==='BUY';
  var isElite=s.tier==='ELITE';
  var tierColor=isElite?C.white:C.text3;
  var criteriaList=(s.criteria||[]).map(function(c){return '<div style="display:flex;align-items:center;gap:8px;padding:6px 0">\u2713 <span style="font-size:13px;color:'+C.white+'">'+c+'</span></div>';}).join('');
  var isDual=s.dualEntry;
  var aggChart=s.aggChartUrl?'<img src="'+withCode(s.aggChartUrl)+'" style="width:100%;display:block;border-radius:14px">':'';
  var consChart=s.consChartUrl?'<img src="'+withCode(s.consChartUrl)+'" style="width:100%;display:block;border-radius:14px;margin-top:8px">':'';
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
      ?'<img src="'+withCode(s.chartUrl)+'" style="width:100%;display:block;border-radius:14px">'
      :'<div style="height:170px;display:flex;align-items:center;justify-content:center;color:'+C.text2+';font-size:12px;border:0.5px solid '+C.border+';border-radius:14px">Chart unavailable</div>');
  return '<div style="display:flex;flex-direction:column;height:100dvh;background:'+C.bg+';color:'+C.white+'">'+
    '<div style="flex:1;overflow-y:auto">'+
    '<div style="display:flex;align-items:center;gap:12px;padding:calc(20px + env(safe-area-inset-top)) 16px 10px">'+
    '<button onclick="closeDetail()" style="background:'+C.surface+';border:0.5px solid '+C.border+';border-radius:99px;width:34px;height:34px;display:flex;align-items:center;justify-content:center;cursor:pointer;color:'+C.white+'">\u2190</button>'+
    '<div><div style="font-weight:800;font-size:18px;color:'+C.white+'">'+s.pair+' \u00b7 '+s.tf+'</div>'+
    '<div style="color:'+C.text2+';font-size:11px">'+timeAgo(s.time)+' \u00b7 '+(s.system||'QMR')+' Signal</div></div></div>'+
    '<div style="padding:8px 16px">'+
    '<div style="display:flex;gap:8px;margin-bottom:14px;flex-wrap:wrap">'+
    pill(s.tier,tierColor,isElite?'rgba(255,255,255,0.1)':'rgba(255,255,255,0.03)')+
    pill(s.type,isBuy?C.lime:C.red,isBuy?C.limeSoft:C.redSoft)+
    '</div>'+chartHtml+
    '<div style="font-size:14px;font-weight:700;color:'+C.white+';margin-bottom:10px">Trade Levels</div>'+
    '<div class="card" style="margin-bottom:18px">'+
    (isDual&&s.aggEntry?'<div style="display:flex;justify-content:space-between;padding:9px 0"><span style="color:'+C.orange+'">\u26A1 Aggressive Entry (sweep)</span>'+mono(fmt(s.aggEntry),C.orange,16)+'</div>':'')+
    (isDual&&s.consEntry?'<div style="display:flex;justify-content:space-between;padding:9px 0;border-top:0.5px solid rgba(255,255,255,0.05)"><span style="color:'+C.white+'">Conservative Entry (QM)</span>'+mono(fmt(s.consEntry),C.white,16)+'</div>':'')+
    (!isDual?'<div style="display:flex;justify-content:space-between;padding:9px 0"><span style="color:'+C.text2+'">'+(s.refinedEntry?'4H Zone':'Entry')+'</span>'+mono(fmt(s.entry),C.white,16)+'</div>':'')+
    (!isDual&&s.refinedEntry?'<div style="display:flex;justify-content:space-between;padding:9px 0"><span style="color:'+C.lime+'">\uD83C\uDFAF Refined Entry</span>'+mono(fmt(s.refinedEntry),C.lime,16)+'</div>':'')+
    '<div style="display:flex;justify-content:space-between;padding:9px 0;border-top:'+(isDual?'0.5px solid rgba(255,255,255,0.05)':'0')+'"><span style="color:'+C.red+'">\uD83D\uDEE1 Stop Loss</span>'+mono(fmt(isDual?s.aggSl:s.sl),C.red,16)+'</div>'+
    (isDual&&s.consTp1?'<div style="display:flex;justify-content:space-between;padding:9px 0;border-top:0.5px solid rgba(255,255,255,0.05)"><span style="color:'+C.text2+'">Conservative TP1</span>'+mono(fmt(s.consTp1),C.white,16)+'</div>':'')+
    (isDual&&s.consTp2?'<div style="display:flex;justify-content:space-between;padding:9px 0;border-top:0.5px solid rgba(255,255,255,0.05)"><span style="color:'+C.text2+'">Conservative TP2</span>'+mono(fmt(s.consTp2),C.lime,16)+'</div>':'')+
    (!isDual?s.tp1?'<div style="display:flex;justify-content:space-between;padding:9px 0"><span style="color:'+C.text2+'">TP1</span>'+mono(fmt(s.tp1),C.white,16)+'</div>':'':'')+
    (!isDual?s.tp2?'<div style="display:flex;justify-content:space-between;padding:9px 0"><span style="color:'+C.text2+'">TP2</span>'+mono(fmt(s.tp2),C.lime,16)+'</div>':'':'')+
    '</div>'+
    (isDual?'<div style="font-size:14px;font-weight:700;color:'+C.white+';margin-bottom:10px">Track Your Entry</div>'+
    '<button onclick="toggleTrack(\''+s.id+'-agg\','+!!s.isTrackedAgg+')" style="width:100%;background:'+(s.isTrackedAgg?C.orangeSoft:'rgba(249,115,22,0.05)')+';border:0.5px solid '+(s.isTrackedAgg?C.orange:C.orange+'55')+';border-radius:10px;padding:14px 0;display:flex;align-items:center;justify-content:center;gap:8px;cursor:pointer;margin-bottom:10px">'+
    '<span style="color:'+C.orange+';font-weight:700;font-size:13px">'+(s.isTrackedAgg?'Tracking \u2014 aggressive at '+fmt(s.aggEntry):'\u26A1 I took the aggressive entry at '+fmt(s.aggEntry))+'</span></button>'+
    '<button onclick="toggleTrack(\''+s.id+'-cons\','+!!s.isTrackedCons+')" style="width:100%;background:'+(s.isTrackedCons?C.limeSoft:s.consEntry?'rgba(255,255,255,0.03)':'transparent')+';border:0.5px solid '+(s.isTrackedCons?C.lime:(s.consEntry?C.border:'rgba(255,255,255,0.04)'))+';border-radius:10px;padding:14px 0;display:flex;align-items:center;justify-content:center;gap:8px;cursor:pointer;margin-bottom:12px">'+
    '<span style="color:'+(s.isTrackedCons?C.lime:(s.consEntry?C.text2:C.text3))+';font-weight:700;font-size:13px">'+(s.isTrackedCons?'Tracking \u2014 conservative at '+fmt(s.consEntry):(s.consEntry?'\uD83C\uDFAF I took the conservative entry at '+fmt(s.consEntry):'\u23F3 Conservative entry pending'))+'</span></button>'
    :'<button onclick="toggleTrack(\''+s.id+'\','+!!s.isTracked+')" style="width:100%;background:'+(s.isTracked?C.limeSoft:'transparent')+';border:0.5px solid '+(s.isTracked?C.lime:C.border)+';border-radius:10px;padding:14px 0;display:flex;align-items:center;justify-content:center;gap:8px;cursor:pointer;margin-bottom:12px">'+
    '<span style="color:'+(s.isTracked?C.lime:C.text2)+';font-weight:700;font-size:13px">'+(s.isTracked?"Tracking \u2014 you will get updates":"I'm in this trade \u2014 notify me")+'</span></button>')+
    '<button onclick="toggleCalc()" style="width:100%;background:'+C.lime+';border:none;border-radius:10px;padding:15px 0;display:flex;align-items:center;justify-content:center;gap:8px;cursor:pointer;margin-bottom:8px">'+
    '<span style="color:'+C.bg+';font-weight:800;font-size:14px">'+(state.showCalc?'Close Calculator':'Calculate Position Size')+'</span></button>'+
    (state.showCalc?positionCalcForm(s):'')+
    '</div></div></div>';
}

function positionCalcForm(s){
  return '<div style="background:rgba(255,255,255,0.03);border:0.5px solid '+C.border+';border-radius:14px;padding:16px;margin-bottom:24px;font-size:13px">'+
    '<div style="font-weight:700;font-size:14px;color:'+C.white+';margin-bottom:14px">Position Calculator</div>'+
    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:14px">'+
    '<div><span style="color:'+C.text2+';font-size:10px">Balance ($)</span><input id="pc-bal" type="number" value="1000" style="width:100%;background:rgba(255,255,255,0.05);border:0.5px solid '+C.border+';border-radius:8px;padding:10px 12px;color:'+C.white+';font-size:13px;box-sizing:border-box"></div>'+
    '<div><span style="color:'+C.text2+';font-size:10px">Risk %</span><input id="pc-rp" type="number" value="2" style="width:100%;background:rgba(255,255,255,0.05);border:0.5px solid '+C.border+';border-radius:8px;padding:10px 12px;color:'+C.white+';font-size:13px;box-sizing:border-box"></div>'+
    '<div><span style="color:'+C.text2+';font-size:10px">Entry</span><input id="pc-entry" type="number" step="any" value="'+fmt(s.entry||s.aggEntry)+'" style="width:100%;background:rgba(255,255,255,0.05);border:0.5px solid '+C.border+';border-radius:8px;padding:10px 12px;color:'+C.white+';font-size:13px;box-sizing:border-box"></div>'+
    '<div><span style="color:'+C.text2+';font-size:10px">Stop Loss</span><input id="pc-sl" type="number" step="any" value="'+fmt(s.sl||s.aggSl)+'" style="width:100%;background:rgba(255,255,255,0.05);border:0.5px solid '+C.border+';border-radius:8px;padding:10px 12px;color:'+C.white+';font-size:13px;box-sizing:border-box"></div>'+
    '<div><span style="color:'+C.text2+';font-size:10px">TP (optional)</span><input id="pc-tp" type="number" step="any" value="'+fmt(s.tp1||s.aggTp1||'')+'" style="width:100%;background:rgba(255,255,255,0.05);border:0.5px solid '+C.border+';border-radius:8px;padding:10px 12px;color:'+C.white+';font-size:13px;box-sizing:border-box"></div>'+
    '</div>'+
    '<button onclick="doCalc()" style="width:100%;background:'+C.lime+';border:none;border-radius:8px;padding:12px 0;cursor:pointer;color:'+C.bg+';font-weight:700;font-size:13px">Calculate</button>'+
    '<div id="pc-r" style="margin-top:14px;display:none"></div></div>';
}
function doCalc(){
  var el=document.getElementById('pc-r');if(!el)return;
  var b=parseFloat(document.getElementById('pc-bal')?.value)||0,r=parseFloat(document.getElementById('pc-rp')?.value)||0,e=parseFloat(document.getElementById('pc-entry')?.value)||0,s=parseFloat(document.getElementById('pc-sl')?.value)||0,t=parseFloat(document.getElementById('pc-tp')?.value)||0;
  if(!b||!r||!e||!s||s===e){el.style.display='block';el.innerHTML='<div style="color:'+C.red+';font-size:12px;text-align:center">Fill Balance, Risk %, Entry, SL (Entry \u2260 SL)</div>';return;}
  var riskAmt=b*r/100,riskPU=Math.abs(e-s),units=riskAmt/riskPU,lots=units/100000;
  el.style.display='block';
  el.innerHTML='<div style="background:'+C.limeSoft+';border:0.5px solid '+C.limeBorder+';border-radius:10px;padding:14px;display:grid;grid-template-columns:1fr 1fr;gap:12px">'+
    '<div><div style="color:'+C.text2+';font-size:10px">Risk Amount</div><div style="color:'+C.white+';font-weight:600;font-size:18px">$'+riskAmt.toFixed(2)+'</div></div>'+
    '<div><div style="color:'+C.text2+';font-size:10px">Size</div><div style="color:'+C.white+';font-weight:600;font-size:18px">'+(units<1000?units.toFixed(2)+' units':(units/1000).toFixed(2)+'K')+'</div></div>'+
    '<div><div style="color:'+C.text2+';font-size:10px">Lots</div><div style="color:'+C.white+';font-weight:600;font-size:18px">'+lots.toFixed(2)+'</div></div>'+
    '<div><div style="color:'+C.text2+';font-size:10px">R:R</div><div style="color:'+C.white+';font-weight:600;font-size:18px">'+(t&&t!==e?Math.abs(t-e)/riskPU:'---')+'</div></div></div>';
}

function iconSVG(name,color){
  var m={grid:'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="'+color+'" stroke-width="1.5"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>',book:'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="'+color+'" stroke-width="1.5"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>',pulse:'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="'+color+'" stroke-width="1.5"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>',radio:'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="'+color+'" stroke-width="1.5"><circle cx="12" cy="12" r="2"/><path d="M16.24 7.76a6 6 0 0 1 0 8.49m-8.48-.01a6 6 0 0 1 0-8.49m11.31-2.82a10 10 0 0 1 0 14.14m-14.14 0a10 10 0 0 1 0-14.14"/></svg>',gear:'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="'+color+'" stroke-width="1.5"><circle cx="12" cy="12" r="3"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>'};
  return m[name]||'';
}

function tabBar(){
  var tabs=['overview','scalp','journal','news','settings'];
  var labels={overview:'QMR',scalp:'Scalp',journal:'Journal',news:'News',settings:'Settings'};
  var icons={overview:'grid',scalp:'pulse',journal:'book',news:'radio',settings:'gear'};
  var btns='';
  for(var i=0;i<tabs.length;i++){
    var t=tabs[i],a=state.tab===t;
    btns+='<button class="tab-btn'+(a?' active':'')+'" data-tab="'+t+'" style="flex:1;display:flex;flex-direction:column;align-items:center;gap:2px;padding:10px 0;background:transparent;border:none;color:'+(a?C.lime:C.text2)+';font-size:9px;font-weight:'+(a?'700':'500')+';cursor:pointer;transition:color 0.2s">'+
      iconSVG(icons[t],a?C.lime:C.text2)+
      '<span>'+labels[t]+'</span></button>';
  }
  return '<div style="display:flex;background:'+C.surface+';border:0.5px solid '+C.border+';border-radius:22px;padding:4px;gap:2px">'+btns+'</div>';
}

function overviewScreen(){
  var myActive=[];
  var trackedIds={};
  for(var i=0;i<state.signals.length;i++)if(state.signals[i].isTracked)trackedIds[state.signals[i].id]=true;
  if(state.signals.length)for(var i=0;i<state.active.length;i++)if(trackedIds[state.active[i].sigId])myActive.push(state.active[i]);
  var activeSigIds={};
  for(var i=0;i<state.active.length;i++)activeSigIds[state.active[i].sigId]=true;
  var weeklyCard='';
  if(state.weeklyStats&&state.weeklyStats.total){
    var ws=state.weeklyStats;
    var wrColor=ws.winRate>=50?C.lime:(ws.winRate>=30?C.orange:C.red);
    var pairsHtml='';
    for(var pi=0;pi<ws.pairs.length;pi++){
      var p=ws.pairs[pi];var pColor=p.sumR>=0?C.lime:C.red;
      pairsHtml+='<div style="display:flex;align-items:center;padding:5px 0;border-bottom:0.5px solid rgba(255,255,255,0.04)">'+
        '<span style="flex:1;font-size:12px;font-weight:600;color:'+C.white+'">'+p.id+'</span>'+
        '<span style="font-size:10px;color:'+C.text2+';margin-right:8px">'+p.trades+'t '+p.wins+'W '+p.losses+'L'+(p.bes?' '+p.bes+'BE':'')+'</span>'+
        '<span style="font-size:12px;font-weight:700;color:'+pColor+'">'+(p.sumR>0?'+':'')+p.sumR+'</span></div>';
    }
    weeklyCard='<div class="card" style="padding:12px 14px;margin-bottom:10px;border:0.5px solid rgba(163,230,53,0.12)">'+
      '<div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">'+
      iconSVG('pulse',C.lime)+
      '<span style="flex:1;font-size:12px;font-weight:700;color:'+C.white+'">This Week</span>'+
      '<span style="font-size:14px;font-weight:800;color:'+wrColor+'">'+(ws.totalR>0?'+':'')+ws.totalR+'R</span></div>'+
      '<div style="display:flex;gap:6px;margin-bottom:8px">'+
      '<div style="flex:1;text-align:center"><div style="font-size:17px;font-weight:800;color:'+C.white+'">'+ws.total+'</div><div style="font-size:8px;color:'+C.text2+';text-transform:uppercase">Trades</div></div>'+
      '<div style="flex:1;text-align:center"><div style="font-size:17px;font-weight:800;color:'+C.white+'">'+ws.winRate+'%</div><div style="font-size:8px;color:'+C.text2+';text-transform:uppercase">Win Rate</div></div>'+
      '<div style="flex:1;text-align:center"><div style="font-size:17px;font-weight:800;color:'+C.white+'">'+(ws.totalR>0?'+':'')+ws.totalR+'</div><div style="font-size:8px;color:'+C.text2+';text-transform:uppercase">Total R</div></div>'+
      '</div><div style="height:4px;background:rgba(255,255,255,0.06);border-radius:99px;margin:8px 0;overflow:hidden"><div style="height:100%;width:'+ws.winRate+'%;background:linear-gradient(90deg,'+C.lime+',rgba(163,230,53,0.3));border-radius:99px"></div></div>'+
      pairsHtml+'</div>';
  }
  var mpRow='';
  if(state.confluence.length){
    var chips='';
    for(var ci=0;ci<Math.min(state.confluence.length,11);ci++){
      var p=state.confluence[ci];
      var wb=p.weeklyBias||'NEUTRAL';
      var dir=p.signalDir!=='NONE'?p.signalDir:wb;
      var c=dir==='BULLISH'?C.lime:dir==='BEARISH'?C.red:C.text2;
      var bg=dir!=='NONE'?(dir==='BULLISH'?C.limeSoft:C.redSoft):'rgba(255,255,255,0.02)';
      var badge=p.signalDir!=='NONE'?'4H':'W';
      chips+='<span style="flex-shrink:0;font-size:9px;font-weight:700;padding:4px 10px;border-radius:99px;border:0.5px solid '+c+'44;background:'+bg+';color:'+c+'">'+
        (p.name||p.id)+' <span style="font-size:7px;opacity:0.6">'+badge+'</span></span>';
    }
    mpRow='<div style="font-size:11px;font-weight:700;color:'+C.text2+';margin:0 0 8px 4px;text-transform:uppercase;letter-spacing:0.3px">Market Pulse</div>'+
      '<div style="display:flex;gap:8px;overflow-x:auto;padding-bottom:4px;margin-bottom:6px;scrollbar-width:none">'+(chips||'')+'</div>';
  }
  var statsHtml='';
  if(state.stats){
    var st=state.stats;
    statsHtml='<div style="display:flex;gap:8px;margin-bottom:14px">'+
      '<div class="card" style="flex:1;text-align:center;padding:14px 8px"><div style="font-size:9px;color:'+C.text2+'">Win Rate</div><div style="font-size:20px;font-weight:800;color:'+C.lime+';margin-top:4px">'+(st.winRate||0)+'%</div></div>'+
      '<div class="card" style="flex:1;text-align:center;padding:14px 8px"><div style="font-size:9px;color:'+C.text2+'">Total R</div><div style="font-size:20px;font-weight:800;color:'+(st.totalR>=0?C.lime:C.red)+';margin-top:4px">'+(st.totalR>0?'+':'')+(st.totalR||0)+'</div></div>'+
      '<div class="card" style="flex:1;text-align:center;padding:14px 8px"><div style="font-size:9px;color:'+C.text2+'">Active</div><div style="font-size:20px;font-weight:800;color:'+C.white+';margin-top:4px">'+state.active.length+'</div></div></div>';
  }
  var activeHtml='';
  for(var i=0;i<myActive.length;i++){
    var t=myActive[i];
    var isB=t.type==='BULLISH';var col=isB?C.lime:C.red;
    var prog=t.tp1Fired?75:t.beFired?99:t.slFired?100:25;
    var progCol=t.slFired?C.red:t.tp1Fired?C.lime:t.beFired?C.text2:C.orange;
    activeHtml+='<div class="card" onclick="openDetail(\''+t.sigId+'\')" style="cursor:pointer;padding:12px 16px">'+
      '<div style="display:flex;justify-content:space-between;align-items:center"><span style="font-weight:800;font-size:14px;color:'+C.white+'">'+t.instName+'</span>'+
      '<span style="font-size:10px;color:'+col+';background:'+(isB?C.limeSoft:C.redSoft)+';padding:2px 8px;border-radius:99px;font-weight:700">'+(isB?'BUY':'SELL')+'</span></div>'+
      '<div style="height:3px;background:rgba(255,255,255,0.06);border-radius:99px;margin:8px 0;overflow:hidden"><div style="height:100%;width:'+prog+'%;background:'+progCol+';border-radius:99px;transition:width 0.5s"></div></div>'+
      '<div style="display:flex;justify-content:space-between;font-size:9px;color:'+C.text2+'"><span>'+t.tf+' \u00b7 '+timeAgo(t.entryTime)+'</span><span style="color:'+progCol+';font-weight:600">'+(t.tp1Fired?'TP1 Hit':t.beFired?'BE':t.slFired?'Stopped':'Active')+'</span></div></div>';
  }
  var filterIcon=state.showFilters?'\u25B2':'<span style="font-size:12px">\u2630</span>';
  var filterBar='<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px">'+
    '<div style="font-size:13px;font-weight:700;color:'+C.white+'">Signals</div>'+
    '<span onclick="state.showFilters=!state.showFilters;render()" style="font-size:10px;color:'+C.text2+';cursor:pointer;padding:6px">'+filterIcon+'</span></div>';
  var filterOpts='';
  if(state.showFilters){
    filterOpts='<div class="card" style="padding:10px 14px;margin-bottom:8px">'+
      '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:6px">'+
      '<input placeholder="Pair (e.g. EUR)" value="'+esc(state.filter.pair)+'" oninput="state.filter.pair=this.value.toUpperCase();fetchAll(true)" style="background:rgba(255,255,255,0.04);border:0.5px solid '+C.border+';border-radius:6px;padding:8px;color:'+C.white+';font-size:11px;outline:none">'+
      '<select onchange="state.filter.tf=this.value;fetchAll(true)" style="background:rgba(255,255,255,0.04);border:0.5px solid '+C.border+';border-radius:6px;padding:8px;color:'+C.white+';font-size:11px;outline:none">'+
      '<option value="">All TF</option><option value="1H"'+(state.filter.tf==='1H'?' selected':'')+'>1H</option><option value="4H"'+(state.filter.tf==='4H'?' selected':'')+'>4H</option></select>'+
      '<select onchange="state.filter.dir=this.value;fetchAll(true)" style="background:rgba(255,255,255,0.04);border:0.5px solid '+C.border+';border-radius:6px;padding:8px;color:'+C.white+';font-size:11px;outline:none">'+
      '<option value="">All Directions</option><option value="BULLISH"'+(state.filter.dir==='BULLISH'?' selected':'')+'>Buy</option><option value="BEARISH"'+(state.filter.dir==='BEARISH'?' selected':'')+'>Sell</option></select>'+
      '<select onchange="state.filter.minScore=parseInt(this.value);fetchAll(true)" style="background:rgba(255,255,255,0.04);border:0.5px solid '+C.border+';border-radius:6px;padding:8px;color:'+C.white+';font-size:11px;outline:none">'+
      '<option value="0">Min Score</option><option value="1"'+(state.filter.minScore===1?' selected':'')+'>1+</option><option value="2"'+(state.filter.minScore===2?' selected':'')+'>2+</option><option value="3"'+(state.filter.minScore===3?' selected':'')+'>3+</option><option value="4"'+(state.filter.minScore===4?' selected':'')+'>4+</option></select></div>'+
      '<div style="display:flex;gap:6px;align-items:center">'+
      '<input type="date" value="'+state.filter.dateFrom+'" onchange="state.filter.dateFrom=this.value;fetchAll(true)" style="flex:1;background:rgba(255,255,255,0.04);border:0.5px solid '+C.border+';border-radius:6px;padding:6px;color:'+C.text2+';font-size:10px;outline:none">'+
      '<span style="color:'+C.text2+';font-size:10px">to</span>'+
      '<input type="date" value="'+state.filter.dateTo+'" onchange="state.filter.dateTo=this.value;fetchAll(true)" style="flex:1;background:rgba(255,255,255,0.04);border:0.5px solid '+C.border+';border-radius:6px;padding:6px;color:'+C.text2+';font-size:10px;outline:none"></div>'+
      '<div style="margin-top:6px"><select onchange="state.filter.sort=this.value;fetchAll(true)" style="width:100%;background:rgba(255,255,255,0.04);border:0.5px solid '+C.border+';border-radius:6px;padding:6px;color:'+C.white+';font-size:11px;outline:none">'+
      '<option value="time"'+(state.filter.sort==='time'?' selected':'')+'>Sort by Time</option>'+
      '<option value="score"'+(state.filter.sort==='score'?' selected':'')+'>Sort by Score</option></select></div></div>';
  }
  var signalsHtml='';var signalCount=0;
  for(var i=0;i<state.signals.length;i++){
    var s=state.signals[i];
    if(s.outcome||(s.isTracked&&!activeSigIds[s.id]))continue;
    signalCount++;signalsHtml+=signalCard(s);
  }
  if(!signalCount&&!state.signals.length)signalsHtml=emptyState(state.loading?'Loading signals...':'No signals yet');
  return '<div style="display:flex;flex-direction:column;height:100dvh;background:'+C.bg+'">'+
    '<div style="padding:calc(24px + env(safe-area-inset-top)) 16px 10px;flex-shrink:0">'+
    '<div style="font-size:22px;font-weight:800;color:'+C.white+';margin-bottom:4px">'+greeting()+'</div>'+
    '<div style="font-size:11px;color:'+C.text2+';margin-bottom:12px">'+(state.signals.length||'0')+' signals today</div>'+
    tabBar()+'</div>'+
    '<div style="flex:1;overflow-y:auto;-webkit-overflow-scrolling:touch;padding:0 16px 1px">'+
    statsHtml+weeklyCard+mpRow+
    (activeHtml?'<div style="font-size:13px;font-weight:700;color:'+C.white+';margin:8px 0 6px">Active Trades</div>'+activeHtml:'')+
    filterBar+filterOpts+signalsHtml+'</div></div>';
}

function scalpScreen(){
  var statsHtml='';
  if(state.scalpStats){
    var ss=state.scalpStats;
    statsHtml='<div style="display:flex;gap:8px;margin-bottom:14px">'+
      '<div class="card" style="flex:1;text-align:center;padding:14px 8px"><div style="font-size:9px;color:'+C.text2+'">WR</div><div style="font-size:20px;font-weight:800;color:'+C.lime+';margin-top:4px">'+(ss.winRate||0)+'%</div></div>'+
      '<div class="card" style="flex:1;text-align:center;padding:14px 8px"><div style="font-size:9px;color:'+C.text2+'">Total R</div><div style="font-size:20px;font-weight:800;color:'+(ss.totalR>=0?C.lime:C.red)+';margin-top:4px">'+(ss.totalR>0?'+':'')+(ss.totalR||0)+'</div></div>'+
      '<div class="card" style="flex:1;text-align:center;padding:14px 8px"><div style="font-size:9px;color:'+C.text2+'">Active</div><div style="font-size:20px;font-weight:800;color:'+C.white+';margin-top:4px">'+state.scalpActive.length+'</div></div></div>';
  }
  var sigs=(state.scalpSignals||[]).map(function(s,i){
    var isB=s.type==='BULLISH'||s.direction==='LONG';var col=isB?C.lime:C.red;var bg=isB?C.limeSoft:C.redSoft;
    var isT=s.isTracked;
    return '<div class="card" style="border-left:2.5px solid '+col+'" onclick="openScalpDetail(\''+s.id+'\')">'+
      '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">'+
      '<div style="display:flex;align-items:center;gap:6px"><span style="font-weight:800;font-size:15px;color:'+C.white+'">'+(s.name||s.pair)+'</span>'+
      pill(isB?'BUY':'SELL',col,bg)+'</div>'+
      '<span style="font-size:9px;color:'+C.text2+'">score '+s.score+'</span></div>'+
      '<div style="display:flex;gap:6px;font-size:10px;color:'+C.text2+'">'+
      '<span>Entry: '+fmt(s.entry)+'</span><span>SL: '+fmt(s.sl)+'</span><span>TP: '+fmt(s.takeProfit||s.tp2)+'</span></div>'+
      (s.fib?'<div style="font-size:9px;color:'+C.lime+';margin-top:4px">Fib: '+s.fib+' \u00b7 Vol: '+(s.volRatio||'')+'x</div>':'')+
      '<div style="display:flex;justify-content:space-between;margin-top:6px">'+
      '<span style="font-size:8px;color:'+C.text3+'">'+timeAgo(s.time)+'</span>'+
      '<button onclick="event.stopPropagation();toggleTrack(\''+s.id+'\','+!!isT+')" style="background:'+(isT?C.limeSoft:C.surface)+';border:0.5px solid '+(isT?C.lime:C.border)+';border-radius:99px;padding:3px 10px;font-size:9px;color:'+(isT?C.lime:C.text2)+';cursor:pointer">'+(isT?'Tracking':'Track')+'</button></div></div>';
  }).join('');
  return '<div style="display:flex;flex-direction:column;height:100dvh;background:'+C.bg+'">'+
    '<div style="padding:calc(24px + env(safe-area-inset-top)) 16px 10px;flex-shrink:0">'+
    '<div style="font-size:22px;font-weight:800;color:'+C.white+';margin-bottom:12px">Scalp</div>'+tabBar()+'</div>'+
    '<div style="flex:1;overflow-y:auto;padding:0 16px 1px">'+statsHtml+
    (sigs||emptyState('No scalp signals yet'))+'</div></div>';
}

function journalScreen(){
  var entries=state.journal||[];
  var wins=entries.filter(function(e){return e.outcome==='WIN'||e.outcome==='TP1'||e.outcome==='TP2'||e.outcome==='TP';});
  var losses=entries.filter(function(e){return e.outcome==='SL'||e.outcome==='LOSS';});
  var bes=entries.filter(function(e){return e.outcome==='BE';});
  var wr=(wins.length+losses.length)?Math.round((wins.length/(wins.length+losses.length))*100):0;
  var totalR=entries.reduce(function(a,e){return a+((e.rMultiple||e.r||0));},0);
  var sorted=entries.slice().sort(function(a,b){return(b.createdAt||b.time||'').localeCompare(a.createdAt||a.time||'');});
  var rows=sorted.map(function(e,i){
    var o=e.outcome||'';
    var iw=o==='WIN'||o==='TP1'||o==='TP2'||o==='TP';
    var ic=iw?C.lime:o==='SL'||o==='LOSS'?C.red:o==='BE'?C.text2:C.text3;
    var ib=iw?C.limeSoft:o==='SL'||o==='LOSS'?C.redSoft:o==='BE'?C.surface:C.surface;
    var rv=e.rMultiple||e.r||0;
    return '<div class="card" style="padding:10px 14px;cursor:pointer" onclick="editEntry(\''+(e.id||e._id||'')+'\')">'+
      '<div style="display:flex;justify-content:space-between;align-items:center">'+
      '<span style="font-weight:700;font-size:13px;color:'+C.white+'">'+esc(e.pair||'')+'</span>'+
      '<span style="font-weight:800;font-size:13px;color:'+(iw?C.lime:o==='SL'||o==='LOSS'?C.red:C.text2)+'">'+(rv>0?'+':'')+rv+'R</span></div>'+
      '<div style="display:flex;gap:6px;margin-top:4px;font-size:10px;color:'+C.text2+'">'+
      '<span>'+(e.direction||'')+'</span><span>'+(e.tf||e.timeframe||'')+'</span><span>'+timeAgo(e.createdAt||e.time)+'</span></div>'+
      (e.notes?'<div style="font-size:11px;color:'+C.text2+';margin-top:4px">'+esc(e.notes).slice(0,60)+'</div>':'')+'</div>';
  }).join('');
  return '<div style="display:flex;flex-direction:column;height:100dvh;background:'+C.bg+'">'+
    '<div style="padding:calc(24px + env(safe-area-inset-top)) 16px 10px;flex-shrink:0">'+
    '<div style="display:flex;align-items:center;gap:12px;margin-bottom:12px">'+
    '<span style="font-size:22px;font-weight:800;color:'+C.white+'">Journal</span>'+
    '<span style="font-size:11px;color:'+C.lime+'">'+wins.length+'W</span>'+
    '<span style="font-size:11px;color:'+C.red+'">'+losses.length+'L</span>'+
    '<span style="font-size:11px;color:'+C.text2+'">'+bes.length+'BE</span>'+
    (wins.length+losses.length?'<span style="font-size:11px;font-weight:700;color:'+C.white+'">'+wr+'%</span>':'')+
    '</div>'+tabBar()+'</div>'+
    '<div style="flex:1;overflow-y:auto;padding:0 16px 1px">'+
    (entries.length?rows:emptyState('No journal entries yet'))+'</div></div>';
}

function newsScreen(){
  var arts=state.articles||state.news||[];
  var cats={};
  for(var i=0;i<arts.length;i++){var c=arts[i].category||'General';if(!cats[c])cats[c]=0;cats[c]++;}
  var catList=Object.keys(cats);
  var catChips=catList.map(function(c){
    var a=(state.newsCat||'All')===c;
    return '<span onclick="toggleNewsCat(\''+c+'\')" style="display:inline-block;font-size:9px;padding:4px 10px;border-radius:99px;background:'+(a?C.limeSoft:C.surface)+';color:'+(a?C.lime:C.text2)+';cursor:pointer;font-weight:'+(a?'700':'400')+';border:0.5px solid '+(a?C.limeBorder:C.border)+'">'+c+' '+cats[c]+'</span>';
  }).join('');
  var filtered=state.newsCat&&state.newsCat!=='All'?arts.filter(function(a){return a.category===state.newsCat;}):arts;
  var items=filtered.slice(0,30).map(function(a,i){
    var img=a.imageUrl||a.image||'';
    var imgHtml=img?'<img src="'+img+'" style="width:100%;height:100%;object-fit:cover;position:absolute;top:0;left:0">':'<div style="display:flex;align-items:center;justify-content:center;height:100%;color:'+C.text3+';font-size:20px;font-weight:800">'+esc((a.title||'N')[0])+'</div>';
    return '<a href="'+esc(a.link||a.url||'')+'" target="_blank" style="text-decoration:none;display:block">'+
      '<div class="card" style="padding:0;overflow:hidden">'+
      '<div style="height:140px;background:'+C.surface+';position:relative;overflow:hidden">'+imgHtml+'</div>'+
      '<div style="padding:14px"><div style="font-size:13px;font-weight:700;color:'+C.white+';line-height:1.4;margin-bottom:4px">'+esc(a.title)+'</div>'+
      (a.summary?'<div style="font-size:11px;color:'+C.text2+';line-height:1.4">'+esc(a.summary).slice(0,100)+'</div>':'')+
      '<div style="display:flex;gap:6px;margin-top:6px">'+
      (a.source?'<span style="font-size:8px;color:'+C.text3+';background:'+C.surface+';padding:1px 6px;border-radius:4px">'+esc(a.source)+'</span>':'')+
      '<span style="font-size:8px;color:'+C.text3+';margin-left:auto">'+timeAgo(a.time||a.publishedAt||a.createdAt)+'</span></div></div></div></a>';
  }).join('');
  return '<div style="display:flex;flex-direction:column;height:100dvh;background:'+C.bg+'">'+
    '<div style="padding:calc(24px + env(safe-area-inset-top)) 16px 10px;flex-shrink:0">'+
    '<div style="font-size:22px;font-weight:800;color:'+C.white+';margin-bottom:8px">News</div>'+tabBar()+'</div>'+
    '<div style="padding:0 16px;flex-shrink:0"><div style="display:flex;gap:6px;overflow-x:auto;padding-bottom:8px;scrollbar-width:none">'+catChips+'</div></div>'+
    '<div style="flex:1;overflow-y:auto;padding:0 16px 1px">'+(items||emptyState('No news articles'))+'</div></div>';
}

function settingsScreen(){
  var prefs=state.notifPrefs||{};
  function tp(key,label,desc){
    var val=prefs[key];
    return '<div style="display:flex;align-items:center;gap:12px;padding:12px 16px;border-bottom:0.5px solid rgba(255,255,255,0.04)">'+
      '<div style="flex:1"><div style="font-size:13px;font-weight:600;color:'+C.white+'">'+label+'</div>'+(desc?'<div style="font-size:9px;color:'+C.text2+'">'+desc+'</div>':'')+'</div>'+
      '<button onclick="toggleNotifPref(\''+key+'\')" style="width:44px;height:26px;border-radius:99px;background:'+(val?C.lime:'rgba(255,255,255,0.1)')+';border:none;position:relative;cursor:pointer;flex-shrink:0">'+
      '<div style="width:20px;height:20px;border-radius:99px;background:#FFF;position:absolute;top:2px;left:'+(val?'22px':'2px')+';transition:left 0.2s"></div></button></div>';
  }
  var pushBtns='';
  if(window.pushStatus==='subscribed')pushBtns='<div style="font-size:11px;color:'+C.lime+';text-align:center;padding:10px">Push notifications active</div>';
  else if(window.pushStatus==='denied')pushBtns='<div style="font-size:11px;color:'+C.red+';text-align:center;padding:10px">Push blocked in browser settings</div>';
  else if(typeof Notification!=='undefined'&&Notification.permission!=='denied')pushBtns='<button onclick="enablePush()" style="width:100%;background:'+C.lime+';border:none;border-radius:10px;padding:12px 0;color:'+C.bg+';font-weight:700;font-size:13px;cursor:pointer;margin-top:8px">Enable Push Notifications</button>';
  return '<div style="display:flex;flex-direction:column;height:100dvh;background:'+C.bg+'">'+
    '<div style="padding:calc(24px + env(safe-area-inset-top)) 16px 10px;flex-shrink:0">'+
    '<div style="font-size:22px;font-weight:800;color:'+C.white+';margin-bottom:4px">Settings</div>'+
    '<div style="font-size:11px;color:'+C.text2+';margin-bottom:12px">v10</div>'+tabBar()+'</div>'+
    '<div style="flex:1;overflow-y:auto;padding:0 16px 1px">'+
    '<div style="margin-bottom:16px"><div style="font-size:11px;font-weight:700;color:'+C.text2+';text-transform:uppercase;margin-bottom:6px;padding:0 4px">Notifications</div>'+
    '<div style="background:#141416;border-radius:14px;overflow:hidden">'+
    tp('tradeAlerts','Trade Alerts','Notify me on new QMR signals')+
    tp('scalpAlerts','Scalp Alerts','Notify me on new scalp signals')+
    tp('newsAlerts','News Alerts','Daily news digest')+'</div>'+pushBtns+'</div>'+
    '<div style="margin-bottom:16px"><div style="font-size:11px;font-weight:700;color:'+C.text2+';text-transform:uppercase;margin-bottom:6px;padding:0 4px">Account</div>'+
    '<div style="background:#141416;border-radius:14px;overflow:hidden">'+
    '<button onclick="logout()" style="width:100%;background:transparent;border:none;padding:14px 16px;color:'+C.red+';font-size:13px;font-weight:600;cursor:pointer;text-align:left">Disconnect / Logout</button></div></div>'+
    '<div style="text-align:center;padding:20px;color:'+C.text3+';font-size:9px">Made by roz & n8s \u00b7 QMR</div></div></div>';
}

function render(){
  var app=document.getElementById('app');
  if(state.selected){app.innerHTML=detailPage(state.selected);return;}
  var content='';
  if(state.tab==='overview'){content=overviewScreen();}
  else if(state.tab==='scalp'){content=scalpScreen();}
  else if(state.tab==='journal'){content=journalScreen();}
  else if(state.tab==='news'){content=newsScreen();}
  else if(state.tab==='settings'){content=settingsScreen();}
  else{content=overviewScreen();}
  app.innerHTML=content;
  requestAnimationFrame(function(){
    app.querySelectorAll('.card').forEach(function(c,i){c.style.animationDelay=(i*0.03).toFixed(3)+'s';});
  });
}

function renderLogin(errorMsg){
  var app=document.getElementById('app');
  app.innerHTML='<div style="min-height:100dvh;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:calc(24px + env(safe-area-inset-top)) 24px calc(24px + env(safe-area-inset-bottom));text-align:center;background:#000;color:#FFF">'+
    '<div style="font-weight:900;font-size:30px;letter-spacing:-1px;text-transform:uppercase;margin-bottom:6px">'+
    '<span style="color:#FFF">THE </span><span style="color:#A3E635">SLAYERS</span></div>'+
    '<div style="color:#8E8E93;font-size:12px;margin-bottom:32px">v10</div>'+
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
      signals:[],active:[],confluence:[],stats:null,myStats:null,journal:[],
      news:[],articles:[],settings:null,notifPrefs:{},botHistory:[],
      scalpSignals:[],scalpActive:[],scalpStats:null,scalpPulse:[],
      weeklyStats:null,weeklySummary:null,detailedStats:null,
      loading:true,showCalc:false,showFilters:false
    });
    fetchAll();
  }catch(e){clearCode();renderLogin('Connection error. Try again.');}
}

window.setTab=function(t){state.tab=t;state.selected=null;render();};
window.openDetail=function(id){state.showCalc=false;for(var i=0;i<state.signals.length;i++)if(state.signals[i].id===id){state.selected=state.signals[i];break;}render();};
window.closeDetail=function(){state.selected=null;state.showCalc=false;render();};
window.toggleCalc=function(){state.showCalc=!state.showCalc;render();};
window.toggleNewsCat=function(c){if(state.newsCat===c)state.newsCat=null;else state.newsCat=c;render();};
window.openScalpDetail=function(id){
  for(var i=0;i<state.scalpSignals.length;i++)if(state.scalpSignals[i].id===id){state.selected=state.scalpSignals[i];break;}
  render();
};
window.logout=function(){if(confirm('Logout and clear code?')){clearCode();window.location.reload();}};
window.editEntry=function(id){showToast('Journal editing via server API coming soon');};
window.toggleNotifPref=async function(key){
  var prefs=state.notifPrefs||{};
  var nv=!prefs[key];
  prefs[key]=nv;
  try{await fetch(withCode('/api/member/notif-prefs'),{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({[key]:nv})});}catch(e){}
  render();
};

window.toggleTrack=async function(signalId,currentlyTracking){
  try{
    if(currentlyTracking){await fetch(withCode('/api/track/'+encodeURIComponent(signalId)),{method:'DELETE'});}
    else{await fetch(withCode('/api/track'),{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({signalId:signalId})});}
    var baseId=signalId.replace(/-(agg|cons)$/,'');
    var sig=null;
    for(var i=0;i<state.signals.length;i++)if(state.signals[i].id===baseId){sig=state.signals[i];break;}
    if(!sig)for(var i=0;i<state.scalpSignals.length;i++)if(state.scalpSignals[i].id===baseId){sig=state.scalpSignals[i];break;}
    if(sig){
      if(sig.dualEntry){
        if(signalId.endsWith('-agg'))sig.isTrackedAgg=!currentlyTracking;
        else if(signalId.endsWith('-cons'))sig.isTrackedCons=!currentlyTracking;
      }else{sig.isTracked=!currentlyTracking;}
    }
    if(state.selected&&state.selected.id===baseId){
      if(state.selected.dualEntry){
        if(signalId.endsWith('-agg'))state.selected.isTrackedAgg=!currentlyTracking;
        else if(signalId.endsWith('-cons'))state.selected.isTrackedCons=!currentlyTracking;
      }else{state.selected.isTracked=!currentlyTracking;}
    }
    render();
  }catch(e){console.error('Track toggle failed',e);}
};

window.copyTrade=function(id){
  for(var i=0;i<state.signals.length;i++){
    var s=state.signals[i];
    if(s.id===id||s.id+'-agg'===id||s.id+'-cons'===id){
      var txt;var base=s.id===id?s:null;if(!base)continue;
      if(s.dualEntry){txt=(s.type==='BULLISH'?'BUY':'SELL')+' '+s.pair+' | Aggressive: '+fmt(s.aggEntry)+(s.consEntry?' | Conservative: '+fmt(s.consEntry):'')+' | SL: '+fmt(s.aggSl)+' | '+s.system+' Signal';}
      else{txt=(s.type==='BULLISH'?'BUY':'SELL')+' '+s.pair+' | Entry: '+fmt(s.entry)+' | SL: '+fmt(s.sl)+(s.tp1?' | TP1: '+fmt(s.tp1):'')+(s.tp2?' | TP2: '+fmt(s.tp2):'')+' | '+s.system+' Signal';}
      navigator.clipboard.writeText(txt).then(function(){showToast('Trade copied to clipboard');}).catch(function(){});break;
    }
  }
};

async function enablePush(){
  if(!swRegistration||!getCode())return;
  try{
    var keyRes=await fetch(withCode('/api/vapid-key'));
    var keyData=await keyRes.json();
    if(!keyData.enabled||!keyData.key){alert('Push notifications are not configured on the server yet.');return;}
    var perm=await Notification.requestPermission();
    if(perm!=='granted'){window.pushStatus='denied';render();return;}
    var sub=await swRegistration.pushManager.subscribe({userVisibleOnly:true,applicationServerKey:urlBase64ToUint8Array(keyData.key)});
    await fetch(withCode('/api/subscribe'),{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(sub)});
    window.pushStatus='subscribed';render();
  }catch(e){console.error('Push subscribe failed',e);alert('Could not enable notifications: '+(e.message||'unknown error'));}
}

function urlBase64ToUint8Array(base64String){
  var padding='='.repeat((4-base64String.length%4)%4);
  var base64=(base64String+padding).replace(/-/g,'+').replace(/_/g,'/');
  var rawData=atob(base64);
  return Uint8Array.from([...rawData].map(function(c){return c.charCodeAt(0);}));
}

var swRegistration=null;
window.pushStatus='unknown';
async function checkPushStatus(){
  if(!getCode()||!swRegistration){window.pushStatus='unsupported';return;}
  try{
    var sub=await swRegistration.pushManager.getSubscription();
    window.pushStatus=sub?'subscribed':'unsupported';
    render();
  }catch(e){window.pushStatus='unsupported';}
}
if('serviceWorker'in navigator){
  navigator.serviceWorker.register('/service-worker.js').then(function(reg){
    swRegistration=reg;
    if(getCode())checkPushStatus();
  }).catch(function(e){console.error('SW failed',e);});
}

document.addEventListener('click',function(e){
  var btn=e.target.closest('.tab-btn');
  if(btn){state.tab=btn.dataset.tab;state.selected=null;render();}
});

document.addEventListener('focusin',function(e){
  var tag=e.target.tagName;
  if(tag==='INPUT'||tag==='TEXTAREA'||tag==='SELECT')state.userBusy=true;
});
document.addEventListener('focusout',function(e){
  var tag=e.target.tagName;
  if(tag==='INPUT'||tag==='TEXTAREA'||tag==='SELECT')setTimeout(function(){state.userBusy=false;},200);
});

if(getCode()){fetchAll();}else{renderLogin();}
setInterval(function(){if(getCode())fetchAll(true);},120000);
