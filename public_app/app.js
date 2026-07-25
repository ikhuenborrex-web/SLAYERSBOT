
(function(){var s=document.createElement("style");s.textContent=
"html,body{background:#000;margin:0;padding:0;height:100dvh;overflow:hidden;-webkit-overflow-scrolling:touch;-webkit-tap-highlight-color:transparent}"+
".card{background:#141416;border-radius:16px;padding:16px;margin-bottom:10px;position:relative;overflow:hidden;transition:transform 0.3s cubic-bezier(0.16,1,0.3,1);animation:springUp 0.5s cubic-bezier(0.16,1,0.3,1) both}"+
".card::before{content:'';position:absolute;top:0;left:0;right:0;height:1px;background:linear-gradient(90deg,transparent,rgba(163,230,53,0.1),transparent)}"+
".card:active{transform:scale(0.985)}"+
".hero{background:linear-gradient(135deg,#141416 0%,#0F0F10 100%);border-radius:18px;padding:20px 18px;margin-bottom:16px;position:relative;overflow:hidden}"+
".hero-glow{position:absolute;top:-60px;right:-60px;width:200px;height:200px;border-radius:50%;background:radial-gradient(circle,rgba(163,230,53,0.08) 0%,transparent 70%)}"+
".hero-glow-2{position:absolute;bottom:-80px;left:-40px;width:160px;height:160px;border-radius:50%;background:radial-gradient(circle,rgba(163,230,53,0.05) 0%,transparent 70%)}"+
".mono{font-family:'SF Mono','JetBrains Mono',monospace;font-weight:600;letter-spacing:-0.02em}"+
".pulse-ring{animation:pulseRing 2s cubic-bezier(0.4,0,0.6,1) infinite}"+
"@keyframes pulseRing{0%,100%{opacity:1}50%{opacity:0.5}}"+
"@keyframes springUp{0%{opacity:0;transform:translateY(14px) scale(0.98)}100%{opacity:1;transform:translateY(0) scale(1)}}"+
"@keyframes fadeIn{0%{opacity:0;transform:translateY(4px)}100%{opacity:1;transform:translateY(0)}}"+
"@keyframes slideUp{0%{transform:translateY(100%)}100%{transform:translateY(0)}}"+
"@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}"+
"@keyframes spin{0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}}"+
"@keyframes shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}"+
".shimmer{background:linear-gradient(90deg,transparent,rgba(255,255,255,0.03),transparent);background-size:200% 100%;animation:shimmer 2s infinite}"+
".chart-line{stroke-dasharray:400;stroke-dashoffset:400;animation:drawLine 1.2s ease forwards}"+
"@keyframes drawLine{to{stroke-dashoffset:0}}"+
".card-enter{opacity:0;animation:springUp 0.5s cubic-bezier(0.16,1,0.3,1) both;animation-delay:var(--delay,0s)}"+
".card-enter{opacity:1}"+
"input:focus{outline:none;border-color:rgba(163,230,53,0.3)!important}"+
"::-webkit-scrollbar{width:0;height:0}"+
'*{-webkit-tap-highlight-color:transparent;-webkit-touch-callout:none}';
document.head.appendChild(s);})();

var C={bg:"#000",surface:"rgba(255,255,255,0.03)",white:"#FFF",text2:"rgba(255,255,255,0.45)",text3:"rgba(255,255,255,0.2)",lime:"#a3e635",limeSoft:"rgba(163,230,53,0.1)",red:"#ef4444",redSoft:"rgba(239,68,68,0.1)",orange:"#f97316",orangeSoft:"rgba(249,115,22,0.1)",blue:"#3b82f6",blueSoft:"rgba(59,130,246,0.1)",border:"rgba(255,255,255,0.06)",lt:""};

function getCode(){try{return localStorage.getItem("qmr_code")||"";}catch(e){return "";}}
function saveCode(c){try{localStorage.setItem("qmr_code",c);fetchJournal();}catch(e){}}
function clearCode(){try{localStorage.removeItem("qmr_code");}catch(e){}}
function getDeviceId(){try{var d=localStorage.getItem("qmr_did");if(!d){d="d_"+Date.now().toString(36)+Math.random().toString(36).slice(2,8);localStorage.setItem("qmr_did",d);}return d;}catch(e){return "unknown";}}
function esc(t){return String(t||"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");}
function withCode(u){if(!u)return"";var c=getCode();if(!c)return u;return u+(u.indexOf("?")>-1?"&":"?")+"c="+encodeURIComponent(c);}
function fetchApi(url,cb,errCb){var x=new XMLHttpRequest();x.open("GET",url,true);x.onload=function(){if(x.status>=200&&x.status<400){try{cb(JSON.parse(x.responseText));}catch(e){if(errCb)errCb(e);}}else{if(errCb)errCb(x.status);}};x.onerror=function(){if(errCb)errCb("network");};x.send();}

function icon(n,c,s){var m={chevronLeft:'<svg width="'+s+'" height="'+s+'" viewBox="0 0 24 24" fill="none" stroke="'+c+'" stroke-width="2.5"><polyline points="15 18 9 12 15 6"/></svg>',back:'<svg width="'+s+'" height="'+s+'" viewBox="0 0 24 24" fill="none" stroke="'+c+'" stroke-width="2.5"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>',target:'<svg width="'+s+'" height="'+s+'" viewBox="0 0 24 24" fill="none" stroke="'+c+'" stroke-width="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>',shield:'<svg width="'+s+'" height="'+s+'" viewBox="0 0 24 24" fill="none" stroke="'+c+'" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>',copy:'<svg width="'+s+'" height="'+s+'" viewBox="0 0 24 24" fill="none" stroke="'+c+'" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>',calc:'<svg width="'+s+'" height="'+s+'" viewBox="0 0 24 24" fill="none" stroke="'+c+'" stroke-width="2"><rect x="4" y="4" width="16" height="16" rx="2"/><line x1="8" y1="8" x2="8.01" y2="8"/><line x1="12" y1="8" x2="12.01" y2="8"/><line x1="16" y1="8" x2="16.01" y2="8"/><line x1="8" y1="12" x2="8.01" y2="12"/><line x1="12" y1="12" x2="12.01" y2="12"/><line x1="16" y1="12" x2="16.01" y2="12"/><line x1="8" y1="16" x2="8.01" y2="16"/><line x1="12" y1="16" x2="12.01" y2="16"/><line x1="16" y1="16" x2="16.01" y2="16"/></svg>',check:'<svg width="'+s+'" height="'+s+'" viewBox="0 0 24 24" fill="none" stroke="'+c+'" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>',up:'<svg width="'+s+'" height="'+s+'" viewBox="0 0 24 24" fill="none" stroke="'+c+'" stroke-width="2.5"><polyline points="18 15 12 9 6 15"/></svg>',down:'<svg width="'+s+'" height="'+s+'" viewBox="0 0 24 24" fill="none" stroke="'+c+'" stroke-width="2.5"><polyline points="6 9 12 15 18 9"/></svg>',warn:'<svg width="'+s+'" height="'+s+'" viewBox="0 0 24 24" fill="none" stroke="'+c+'" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',flame:'<svg width="'+s+'" height="'+s+'" viewBox="0 0 24 24" fill="none" stroke="'+c+'" stroke-width="2"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>',bell:'<svg width="'+s+'" height="'+s+'" viewBox="0 0 24 24" fill="none" stroke="'+c+'" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>',bolt:'<svg width="'+s+'" height="'+s+'" viewBox="0 0 24 24" fill="none" stroke="'+c+'" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>'};return m[n]||"";}

function pill(t,c,bg,cls){return'<span style="font-size:9px;font-weight:700;padding:3px 10px;border-radius:99px;color:'+c+';background:'+bg+';'+(cls?'animation:'+cls:'')+'">'+t+'</span>';}
function mono(v,c,s){return'<span class="mono" style="font-size:'+s+'px;color:'+c+'">'+v+'</span>';}
function fmt(v){if(v==null||v===undefined)return"-";var n=parseFloat(v);if(isNaN(n))return v;return n.toFixed(5).replace(/0+$/,"").replace(/\.$/,"");}
function timeAgo(t){if(!t)return"";var n=Date.now(),d=new Date(t).getTime();if(isNaN(d))return"";var diff=n-d;if(diff<0)return"just now";var s=Math.floor(diff/1e3),m=Math.floor(s/60),h=Math.floor(m/60),d2=Math.floor(h/24);if(d2>0)return d2+"d ago";if(h>0)return h+"h ago";if(m>0)return m+"m ago";return s+"s ago";}
function fmtNum(n){if(n==null)return"0";if(Math.abs(n)>=1e6)return(n/1e6).toFixed(1)+"M";if(Math.abs(n)>=1e3)return(n/1e3).toFixed(1)+"K";return n.toFixed(0);}
function greeting(){var h=new Date().getHours();if(h<12)return"gm";if(h<18)return"gm";return"gm";}
function avatarRing(sz){return'<div style="width:'+sz+'px;height:'+sz+'px;border-radius:99px;background:linear-gradient(135deg,'+C.lime+','+C.lime+'55);display:flex;align-items:center;justify-content:center;flex-shrink:0;font-weight:800;font-size:'+(sz*0.4)+'px;color:#000">Q</div>';}
function animateCounters(){/* no-op for now */}

function emptyState(msg){return'<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;padding:60px 20px;text-align:center"><div style="font-size:28px;margin-bottom:12px;opacity:0.15">\u25CB</div><div style="font-size:14px;color:'+C.text2+';line-height:1.5">'+msg+'</div></div>';}

var state={
  appName:"QMR",appVersion:"3.1.0",screen:"overview",signals:[],active:[],scalpSignals:[],journal:[],
  confluence:[],stats:null,marketData:[],news:[],notifications:[],detailSignal:null,showEntryForm:false,
  showCalc:false,editingEntryId:null,tourStep:null,tourComplete:false,booting:true,journalFilter:"all",
  journalTab:"qmr",journalPairFilter:"all",journalTagFilter:"",lastUpdated:null,scalpActive:"",tourCallbackSave:null
};

function fetchAll(){fetchSignals();fetchActive();fetchConfluence();fetchJournal();fetchMarketData();fetchNews();}

function fetchSignals(){
  fetchApi("/api/signals/live?t="+Date.now(),function(data){
    if(data&&data.signals){state.signals=data.signals;state.lastUpdated=new Date().toISOString();if(!state.booting)render();}
  },function(){if(state.booting){state.booting=false;render();}else if(state.screen==="overview"&&!state.signals.length){render();}});
}

function fetchActive(){
  fetchApi("/api/signals/live?active=true&t="+Date.now(),function(data){
    if(data&&data.signals){state.active=data.signals;}
  });
}

function fetchConfluence(){
  fetchApi("/api/confluence?t="+Date.now(),function(data){
    if(data&&data.confluence){state.confluence=data.confluence;}
    if(data&&data.stats){state.stats=data.stats;}
    if(!state.booting)render();
  },function(){if(state.booting){state.booting=false;render();}});
}

function fetchJournal(){
  try{var c=getCode();if(c){var d=JSON.parse(decodeURIComponent(atob(c)));if(d.journal)state.journal=d.journal;}}catch(e){}
}

function fetchMarketData(){
  fetchApi("/api/market?t="+Date.now(),function(data){
    if(data&&data.pairs){state.marketData=data.pairs;}
  });
}

function fetchNews(){
  fetchApi("/api/news?t="+Date.now(),function(data){
    if(data&&data.articles){state.news=data.news||data.articles;}
  });
}

function signalCard(s,i){
  var isBuy=s.type==="BULLISH"||s.type==="BUY";
  var isElite=s.tier==="ELITE";
  var tierColor=isElite?C.white:C.text3;
  var tierBg=isElite?C.limeSoft:"rgba(255,255,255,0.03)";
  var premiumClass=isElite?"pulse-ring":"";
  var isTracked=false;
  for(var j=0;j<state.journal.length;j++)if(state.journal[j].id===s.id){isTracked=true;break;}
  var progressHtml="";
  if(isTracked){
    var je=null;
    for(var j=0;j<state.journal.length;j++)if(state.journal[j].id===s.id){je=state.journal[j];break;}
    var pr=calculateTradeProgress(s);
    progressHtml='<div style="display:flex;align-items:center;gap:6px;margin-top:6px">'+
      '<div style="flex:1;height:3px;background:rgba(255,255,255,0.06);border-radius:99px;overflow:hidden">'+
      '<div style="height:100%;width:'+pr.pct+'%;background:'+pr.color+';border-radius:99px;transition:width 0.5s"></div></div>'+
      '<span style="font-size:9px;color:'+pr.color+';font-weight:600">'+pr.pct+'%</span></div>';
  }
  var dualTag=s.dualEntry?'<span style="font-size:8px;color:'+C.orange+';background:'+C.orangeSoft+';padding:1px 6px;border-radius:4px;font-weight:600">DUAL</span>':"";
  var ctrTag=s.counterTrend?'<span style="font-size:8px;color:'+C.red+';background:'+C.redSoft+';padding:1px 6px;border-radius:4px;font-weight:600">\u26A0 CTR</span>':"";
  return '<div class="card" onclick="detailSignal(\''+s.id+'\')" style="cursor:pointer;border-left:2.5px solid '+tierColor+';animation-delay:'+(i*0.02)+'s'+(isElite?';box-shadow:0 0 16px '+C.lime+'22':'')+'">'+
    '<div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:6px">'+
    '<div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap">'+
    '<span style="font-weight:800;font-size:16px;letter-spacing:-0.2px;color:'+C.white+'">'+s.pair+'</span>'+
    '<span style="font-size:10px;padding:2px 10px;border-radius:99px;background:'+(isBuy?C.limeSoft:C.redSoft)+';color:'+(isBuy?C.lime:C.red)+';font-weight:700">'+(isBuy?"BUY":"SELL")+'</span>'+
    (s.tf!==undefined?'<span class="mono" style="font-size:9px;color:'+C.text2+'">'+s.tf+'</span>':"")+
    dualTag+ctrTag+'</div>'+
    '<div style="text-align:right">'+pill(s.tier,tierColor,"rgba(255,255,255,0.03)",premiumClass)+'</div></div>'+
    '<div style="display:flex;gap:10px;font-size:10px;color:'+C.text2+'">'+
    (s.score!==undefined?'<span style="font-weight:600;color:'+(s.score>=3?C.lime:s.score>=2?C.orange:C.text2)+'">Score: '+s.score+'</span>':"")+
    '<span style="color:'+C.lime+'">\u25cf '+fmt(s.refinedEntry||s.entry)+'</span>'+
    '<span style="color:'+C.red+'">\u25cf '+fmt(s.sl)+'</span>'+
    (s.tp1?'<span style="color:'+C.lime+'">\u25cf '+fmt(s.tp1)+'</span>':"")+'</div>'+
    (s.criteria&&s.criteria.length?'<div style="display:flex;gap:3px;flex-wrap:wrap;margin-top:6px">'+s.criteria.slice(0,3).map(function(c){return '<span style="font-size:8px;color:'+C.lime+';background:'+C.limeSoft+';padding:1px 6px;border-radius:99px">'+c+'</span>';}).join("")+'</div>':"")+
    progressHtml+
    '<div style="display:flex;justify-content:space-between;align-items:center;margin-top:6px">'+
    '<span style="font-size:8px;color:'+C.text3+'">'+timeAgo(s.time)+'</span>'+
    '<span style="font-size:8px;color:'+C.text3+'">'+(s.system||"QMR")+'</span></div></div>';
}

var ptrState={startY:0,currentY:0,isDragging:false,offset:0};
var ptrEl=null;
document.addEventListener("touchstart",function(e){
  if(state.screen!=="overview")return;
  var sc=e.target.closest('[style*="overflow-y:auto"]');
  if(sc&&sc.scrollTop>0)return;
  if(e.target.closest(".card,button"))return;
  ptrState.startY=e.touches[0].clientY;ptrState.isDragging=true;ptrState.offset=0;
},{passive:true});
document.addEventListener("touchmove",function(e){
  if(!ptrState.isDragging)return;
  ptrState.currentY=e.touches[0].clientY;
  ptrState.offset=Math.max(0,(ptrState.currentY-ptrState.startY)*0.4);
  if(ptrState.offset>0){ptrEl=document.getElementById("app");if(ptrEl)ptrEl.style.transform="translateY("+ptrState.offset+"px)";ptrEl.style.transition="none";}
},{passive:true});
document.addEventListener("touchend",function(e){
  if(!ptrState.isDragging)return;
  ptrState.isDragging=false;
  if(ptrState.offset>60){
    if(ptrEl){ptrEl.style.transition="transform 0.3s ease";ptrEl.style.transform="translateY(0)";}
    fetchAll();
    var ind=document.createElement("div");
    ind.style.cssText="position:fixed;top:calc(20px + env(safe-area-inset-top));left:50%;transform:translateX(-50%);background:"+C.lime+";color:"+C.bg+";border-radius:99px;padding:4px 16px;font-size:11px;font-weight:700;z-index:9999;animation:fadeIn 0.2s ease";
    ind.textContent="Refreshing...";document.body.appendChild(ind);setTimeout(function(){ind.remove();},2000);
  }else{
    if(ptrEl){ptrEl.style.transition="transform 0.2s ease";ptrEl.style.transform="translateY(0)";}
  }
  ptrState.offset=0;
},{passive:true});

function detailPage(s){
  var isBuy=s.type==="BULLISH"||s.type==="BUY";
  var isElite=s.tier==="ELITE";
  var tierColor=isElite?C.white:C.text3;
  var crit=(s.criteria||[]).map(function(c){return '<div style="display:flex;align-items:center;gap:8px;padding:6px 0">'+icon("check",C.lime,15)+'<span style="font-size:13px;color:'+C.white+'">'+c+'</span></div>';}).join("");
  var isDual=s.dualEntry;
  var aggC=s.aggChartUrl?'<img src="'+withCode(s.aggChartUrl)+'" style="width:100%;display:block;border-radius:14px">':"";
  var consC=s.consChartUrl?'<img src="'+withCode(s.consChartUrl)+'" style="width:100%;display:block;border-radius:14px;margin-top:8px">':"";
  var ch=isDual
    ?'<div style="font-size:11px;color:'+C.orange+';font-weight:600;margin-bottom:4px">\u26A1 Aggressive Chart</div>'+aggC+
     '<div style="display:flex;justify-content:space-between;margin:6px 0 14px;font-size:9px;color:'+C.text2+'">'+
     '<span style="color:'+C.orange+'">\u25cf Agg Entry: '+fmt(s.aggEntry)+'</span>'+
     '<span style="color:'+C.red+'">\u25cf SL: '+fmt(s.aggSl)+'</span>'+
     '<span style="color:'+C.lime+'">\u25cf TP2: '+fmt(s.aggTp2)+'</span></div>'+
     (s.consEntry?'<div style="font-size:11px;color:'+C.white+';font-weight:600;margin-bottom:4px">\uD83C\uDFAF Conservative Chart</div>'+consC+
     '<div style="display:flex;justify-content:space-between;margin:6px 0 18px;font-size:9px;color:'+C.text2+'">'+
     '<span style="color:'+C.white+'">\u25cf Cons Entry: '+fmt(s.consEntry)+'</span>'+
     '<span style="color:'+C.red+'">\u25cf SL: '+fmt(s.consSl)+'</span>'+
     '<span style="color:'+C.lime+'">\u25cf TP2: '+fmt(s.consTp2)+'</span></div>':"")
    :(s.chartUrl
      ?'<img src="'+withCode(s.chartUrl)+'" style="width:100%;display:block;border-radius:14px">'
      :'<div style="height:170px;display:flex;align-items:center;justify-content:center;color:'+C.text2+';font-size:12px;border:0.5px solid '+C.border+';border-radius:14px">Chart unavailable</div>');
  return '<div style="display:flex;flex-direction:column;height:100dvh;background:'+C.bg+';color:'+C.white+'">'+
    '<div style="flex:1;overflow-y:auto;background:'+C.bg+';color:'+C.white+'">'+
    '<div style="display:flex;align-items:center;gap:12px;padding:calc(20px + env(safe-area-inset-top)) 16px 10px">'+
    '<button onclick="closeDetail()" style="background:rgba(255,255,255,0.1);border:none;border-radius:99px;width:34px;height:34px;display:flex;align-items:center;justify-content:center;cursor:pointer;color:'+C.white+'">'+icon("back",C.white,16)+'</button>'+
    '<div><div style="font-weight:800;font-size:18px;letter-spacing:-0.3px;color:'+C.white+'">'+s.pair+' \u00b7 '+s.tf+'</div>'+
    '<div style="color:'+C.text2+';font-size:11px">'+timeAgo(s.time)+' \u00b7 '+(s.system||"QMR")+' Signal</div></div></div>'+
    '<div style="padding:8px 16px">'+
    '<div style="display:flex;gap:8px;margin-bottom:14px;flex-wrap:wrap">'+
    pill(s.tier,tierColor,isElite?"rgba(255,255,255,0.1)":"rgba(255,255,255,0.03)")+
    pill(s.type,isBuy?C.lime:C.red,isBuy?C.limeSoft:C.redSoft)+
    '</div>'+ch+
    '<div style="font-size:14px;font-weight:700;color:'+C.white+';margin-bottom:10px">Trade Levels</div>'+
    '<div class="card" style="margin-bottom:18px">'+
    (isDual&&s.aggEntry?'<div style="display:flex;justify-content:space-between;padding:9px 0"><span style="color:'+C.orange+'">'+icon("bolt",C.orange,13)+' Aggressive Entry (sweep)</span>'+mono(fmt(s.aggEntry),C.orange,16)+'</div>':"")+
    (isDual&&s.consEntry?'<div style="display:flex;justify-content:space-between;padding:9px 0;border-top:0.5px solid rgba(255,255,255,0.05)"><span style="color:'+C.white+'">Conservative Entry (QM)</span>'+mono(fmt(s.consEntry),C.white,16)+'</div>':"")+
    (!isDual?'<div style="display:flex;justify-content:space-between;padding:9px 0"><span style="color:'+C.text2+'">'+(s.refinedEntry?"4H Zone":"Entry")+'</span>'+mono(fmt(s.entry),C.white,16)+'</div>':"")+
    (!isDual&&s.refinedEntry?'<div style="display:flex;justify-content:space-between;padding:9px 0"><span style="color:'+C.lime+'">'+icon("target",C.lime,13)+' Refined Entry</span>'+mono(fmt(s.refinedEntry),C.lime,16)+'</div>':"")+
    '<div style="display:flex;justify-content:space-between;padding:9px 0;border-top:'+(isDual?"0.5px solid rgba(255,255,255,0.05)":"0")+'"><span style="color:'+C.red+'">'+icon("shield",C.red,13)+' Stop Loss</span>'+mono(fmt(isDual?s.aggSl:s.sl),C.red,16)+'</div>'+
    (isDual&&s.consTp1?'<div style="display:flex;justify-content:space-between;padding:9px 0;border-top:0.5px solid rgba(255,255,255,0.05)"><span style="color:'+C.text2+'">Conservative TP1</span>'+mono(fmt(s.consTp1),C.white,16)+'</div>':"")+
    (isDual&&s.consTp2?'<div style="display:flex;justify-content:space-between;padding:9px 0;border-top:0.5px solid rgba(255,255,255,0.05)"><span style="color:'+C.text2+'">Conservative TP2</span>'+mono(fmt(s.consTp2),C.lime,16)+'</div>':"")+
    (!isDual?(s.tp1?'<div style="display:flex;justify-content:space-between;padding:9px 0"><span style="color:'+C.text2+'">TP1</span>'+mono(fmt(s.tp1),C.white,16)+'</div>':""):"")+
    (!isDual?(s.tp2?'<div style="display:flex;justify-content:space-between;padding:9px 0"><span style="color:'+C.text2+'">TP2</span>'+mono(fmt(s.tp2),C.lime,16)+'</div>':""):"")+
    '</div>'+
    '<button onclick="copyTrade(\''+s.id+'\')" style="width:100%;background:rgba(255,255,255,0.03);border:0.5px solid '+C.border+';border-radius:10px;padding:12px 0;display:flex;align-items:center;justify-content:center;gap:8px;cursor:pointer;margin-bottom:18px">'+
    icon("copy",C.lime,14)+'<span style="color:'+C.lime+';font-weight:600;font-size:12px">Copy trade details</span></button>'+
    '<div style="font-size:14px;font-weight:700;color:'+C.white+';margin-bottom:10px">Criteria '+(s.score?"\u2014 "+s.score+"/4":"")+'</div>'+
    '<div class="card" style="margin-bottom:18px">'+crit+'</div>'+
    (s.counterTrend?'<div style="background:'+C.redSoft+';border:0.5px solid '+C.red+'55;border-radius:14px;padding:14px;margin-bottom:18px;display:flex;gap:8px"><span>'+icon("warn",C.red,16)+'</span><span style="color:'+C.red+';font-size:12.5px;font-weight:600">Counter-trend setup \u2014 '+(s.htfBias||"")+'. Reduce position size.</span></div>':"")+
    (s.rsiDivergence?'<div style="background:'+C.orangeSoft+';border:0.5px solid '+C.orange+'55;border-radius:14px;padding:14px;margin-bottom:18px;display:flex;gap:8px"><span>'+icon("flame",C.orange,16)+'</span><span style="color:'+C.orange+';font-size:12.5px;font-weight:600">'+s.rsiDivergence+' on 4H \u2014 HTF momentum confluence</span></div>':"")+
    (isDual
      ?'<div style="font-size:14px;font-weight:700;color:'+C.white+';margin-bottom:10px">Track Your Entry</div>'+
      '<button onclick="toggleTrack(\''+s.id+'-agg\','+!!s.isTrackedAgg+')" style="width:100%;background:'+(s.isTrackedAgg?C.orangeSoft:"rgba(249,115,22,0.05)")+';border:0.5px solid '+(s.isTrackedAgg?C.orange:C.orange+"55")+';border-radius:10px;padding:14px 0;display:flex;align-items:center;justify-content:center;gap:8px;cursor:pointer;margin-bottom:10px">'+
      icon(s.isTrackedAgg?"check":"target",s.isTrackedAgg?C.orange:C.orange,16)+
      '<span style="color:'+C.orange+';font-weight:700;font-size:13px">'+(s.isTrackedAgg?"Tracking \u2014 aggressive at "+fmt(s.aggEntry):"\u26A1 I took the aggressive entry at "+fmt(s.aggEntry))+'</span></button>'+
      '<button onclick="toggleTrack(\''+s.id+'-cons\','+!!s.isTrackedCons+')" style="width:100%;background:'+(s.isTrackedCons?C.limeSoft:s.consEntry?"rgba(255,255,255,0.03)":"transparent")+';border:0.5px solid '+(s.isTrackedCons?C.lime:(s.consEntry?C.border:"rgba(255,255,255,0.04)"))+';border-radius:10px;padding:14px 0;display:flex;align-items:center;justify-content:center;gap:8px;cursor:pointer;margin-bottom:12px">'+
      icon(s.isTrackedCons?"check":"target",s.isTrackedCons?C.lime:(s.consEntry?C.text2:C.text3),16)+
      '<span style="color:'+(s.isTrackedCons?C.lime:(s.consEntry?C.text2:C.text3))+';font-weight:700;font-size:13px">'+(s.isTrackedCons?"Tracking \u2014 conservative at "+fmt(s.consEntry):(s.consEntry?"\uD83C\uDFAF I took the conservative entry at "+fmt(s.consEntry):"\u23F3 Conservative entry pending"))+'</span></button>'
      :'<button onclick="toggleTrack(\''+s.id+'\','+!!s.isTracked+')" style="width:100%;background:'+(s.isTracked?C.limeSoft:"transparent")+';border:0.5px solid '+(s.isTracked?C.lime:C.border)+';border-radius:10px;padding:14px 0;display:flex;align-items:center;justify-content:center;gap:8px;cursor:pointer;margin-bottom:12px">'+
      icon(s.isTracked?"check":"target",s.isTracked?C.lime:C.text2,16)+
      '<span style="color:'+(s.isTracked?C.lime:C.text2)+';font-weight:700;font-size:13px">'+(s.isTracked?"Tracking \u2014 you will get updates on this trade":"I'm in this trade \u2014 notify me")+'</span></button>')+
    '<button onclick="toggleCalc()" style="width:100%;background:'+C.lime+';border:none;border-radius:10px;padding:15px 0;display:flex;align-items:center;justify-content:center;gap:8px;cursor:pointer;margin-bottom:8px">'+
    icon("calc",C.bg,16)+'<span style="color:'+C.bg+';font-weight:800;font-size:14px">'+(state.showCalc?"Close Calculator":"Calculate Position Size")+'</span></button>'+
    (state.showCalc?positionCalcForm(s):"")+
    '</div></div></div>';
}

window.toggleCalc=function(){state.showCalc=!state.showCalc;render();};
window.positionCalcForm=function(s){
  var dir=(s.type==="BULLISH"||s.type==="BUY")?"Long":"Short";
  return '<div id="calc-form" style="background:rgba(255,255,255,0.03);border:0.5px solid '+C.border+';border-radius:14px;padding:16px;margin-bottom:24px;font-size:13px">'+
    '<div style="font-weight:700;font-size:14px;color:'+C.white+';margin-bottom:14px">'+icon("calc",C.lime,15)+' Position Calculator</div>'+
    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:14px">'+
    inp("balance","Account Balance ($)","1000")+
    inp("riskpct","Risk %","2")+
    inp("entry","Entry",fmt(s.entry))+
    inp("sl","Stop Loss",fmt(s.sl))+
    inp("tp","TP (optional)",s.tp1?fmt(s.tp1):"")+
    '<div style="display:flex;flex-direction:column;gap:4px"><span style="color:'+C.text2+';font-size:10px">Direction</span><div style="background:rgba(255,255,255,0.05);border:0.5px solid '+C.border+';border-radius:8px;padding:10px 12px;color:'+(dir==="Long"?C.lime:C.red)+';font-weight:600;font-size:13px">'+dir+'</div></div>'+
    '</div>'+
    '<button onclick="doCalc()" style="width:100%;background:'+C.lime+';border:none;border-radius:8px;padding:12px 0;display:flex;align-items:center;justify-content:center;gap:6px;cursor:pointer;color:'+C.bg+';font-weight:700;font-size:13px">'+icon("calc",C.bg,14)+' Calculate</button>'+
    '<div id="calc-result" style="margin-top:14px;display:none"></div></div>';
};
window.doCalc=function(){
  var el=document.getElementById("calc-result");
  function gb(id){return parseFloat(document.getElementById("calc-"+id).value)||0;}
  var bal=gb("balance"),rp=gb("riskpct"),entry=gb("entry"),sl=gb("sl"),tp=gb("tp");
  if(!bal||!rp||!entry||!sl||sl===entry){el.style.display="block";el.innerHTML='<div style="color:'+C.red+';font-size:12px;text-align:center">Please fill in Balance, Risk %, Entry, and SL (Entry \u2260 SL).</div>';return;}
  var riskAmt=bal*rp/100;
  var riskPerUnit=Math.abs(entry-sl);
  var units=riskAmt/riskPerUnit;
  var lots=units/100000;
  var rr="\u2014";
  var profit="\u2014";
  if(tp&&tp!==entry){
    var rewardPerUnit=Math.abs(tp-entry);
    rr=(rewardPerUnit/riskPerUnit).toFixed(2);
    profit="$"+units*rewardPerUnit;
  }
  el.style.display="block";
  el.innerHTML='<div style="background:rgba(163,230,53,0.08);border:0.5px solid '+C.lime+'55;border-radius:10px;padding:14px;display:grid;grid-template-columns:1fr 1fr;gap:12px">'+
    ri("Risk Amount","$"+riskAmt.toFixed(2))+
    ri("Position Size",units<1000?units.toFixed(2)+" units":(units/1000).toFixed(2)+"K units")+
    ri("Lots (Std)",lots.toFixed(2))+
    ri("R:R",rr)+
    (tp&&tp!==entry?ri("Potential Profit","$"+profit.toFixed(2)):"")+'</div>';
};
function inp(id,label,val){return '<div style="display:flex;flex-direction:column;gap:4px"><span style="color:'+C.text2+';font-size:10px">'+label+'</span><input id="calc-'+id+'" type="number" step="any" value="'+val+'" style="background:rgba(255,255,255,0.05);border:0.5px solid '+C.border+';border-radius:8px;padding:10px 12px;color:'+C.white+';font-size:13px;font-family:monospace;outline:none"></div>';}
function ri(label,val){return '<div><div style="color:'+C.text2+';font-size:10px;margin-bottom:3px">'+label+'</div><div style="color:'+C.white+';font-weight:600;font-size:16px;letter-spacing:-0.3px">'+val+'</div></div>';}

function confluenceScreen(){
  if(!state.confluence.length)return emptyState("Market data loading...");
  return state.confluence.map(function(p){
    var isBull=p.weeklyBias==="BULLISH"||p.signalDir==="BULLISH";
    var wc=p.weeklyBias==="BULLISH"?C.lime:p.weeklyBias==="BEARISH"?C.red:C.text2;
    var dc=p.dailyTrend==="BULLISH"?C.lime:p.dailyTrend==="BEARISH"?C.red:C.text2;
    var tc=p.convictionLabel==="ELITE"?C.lime:p.convictionLabel==="STRONG"?C.white:p.convictionLabel==="VALID"?C.text3:C.text2;
    var ut=p.userInTrade?'<span style="font-size:9px;color:'+C.lime+';background:'+C.limeSoft+';border-radius:99px;padding:2px 8px;font-weight:700">YOURS'+(p.activeTradeProgress?.tp1Fired?" TP1\u2713":"")+(p.activeTradeProgress?.beFired?" BE\u2713":"")+'</span>':"";
    return '<div class="card" style="border-left:2.5px solid '+tc+';animation-delay:'+(Math.random()*0.15)+'s">'+
      '<div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">'+
      '<span style="font-weight:800;font-size:16px;letter-spacing:-0.2px;color:'+C.white+'">'+p.name+'</span>'+
      '<span class="mono" style="color:'+C.text2+';font-size:12px">'+p.price+'</span>'+ut+'</div>'+
      '<div style="display:flex;gap:5px;flex-wrap:wrap;margin-bottom:8px">'+
      '<span style="font-size:10px;border:0.5px solid '+wc+'44;border-radius:99px;padding:3px 10px;color:'+wc+';font-weight:700">W: '+p.weeklyBias+'</span>'+
      '<span style="font-size:10px;border:0.5px solid '+dc+'44;border-radius:99px;padding:3px 10px;color:'+dc+';font-weight:700">D: '+p.dailyTrend+'</span>'+
      (p.biasRelation==="ALIGNED"?'<span style="font-size:10px;border:0.5px solid '+C.lime+'44;background:'+C.limeSoft+';border-radius:99px;padding:3px 10px;color:'+C.lime+';font-weight:600">ALIGNED</span>'
        :p.biasRelation==="CONFLICT"?'<span style="font-size:10px;border:0.5px solid '+C.red+'44;background:'+C.redSoft+';border-radius:99px;padding:3px 10px;color:'+C.red+';font-weight:600">CONFLICT</span>'
        :'<span style="font-size:10px;border:0.5px solid '+C.text2+'44;background:'+C.surface+';border-radius:99px;padding:3px 10px;color:'+C.text2+';font-weight:600">MIXED</span>')+
      pill(p.convictionLabel,tc,tc+"22",p.convictionLabel==="ELITE"?"pulse-ring":"")+'</div>'+
      (p.signalDir!=="NONE"?'<div style="display:flex;align-items:center;gap:6px;margin-bottom:6px">'+icon(isBull?"up":"down",isBull?C.lime:C.red,14)+'<span style="font-weight:600;font-size:12px;color:'+C.white+'">'+(p.signalDir==="BULLISH"?"BUY":"SELL")+' signal</span></div>':'<div style="color:'+C.text2+';font-size:11px;margin-bottom:6px">No active signals</div>')+
      (p.factors.length?'<div style="display:flex;gap:4px;flex-wrap:wrap">'+p.factors.map(function(f){return '<span style="font-size:9px;color:'+C.lime+';background:'+C.limeSoft+';border-radius:99px;padding:2px 8px">\u2713 '+f+'</span>';}).join("")+'</div>':"")+'</div>';
  }).join("");
}

function statsOverview(){
  var st=state.stats||{};
  var wr=st.winRate||0;
  var tr=st.totalR||0;
  return '<div style="display:flex;gap:8px;margin-bottom:14px">'+
    '<div style="flex:1;background:#141416;border-radius:14px;padding:14px;text-align:center">'+
    '<div style="font-size:9px;color:'+C.text2+';font-weight:500">Win Rate</div>'+
    '<div style="display:flex;align-items:baseline;justify-content:center;gap:1px;margin-top:3px">'+
    '<div class="count-up" style="font-size:22px;font-weight:800;color:'+C.lime+';letter-spacing:-0.5px">'+wr+'</div>'+
    '<span style="font-size:12px;font-weight:700;color:'+C.lime+'">%</span></div></div>'+
    '<div style="flex:1;background:#141416;border-radius:14px;padding:14px;text-align:center">'+
    '<div style="font-size:9px;color:'+C.text2+';font-weight:500">Total R</div>'+
    '<div style="display:flex;align-items:baseline;justify-content:center;gap:1px;margin-top:3px">'+
    '<span style="font-size:12px;font-weight:700;color:'+(tr>=0?C.lime:C.red)+'">'+(tr>=0?"+":"-")+'</span>'+
    '<div class="count-up" style="font-size:22px;font-weight:800;color:'+C.lime+';letter-spacing:-0.5px">'+Math.abs(tr)+'</div>'+
    '<span style="font-size:12px;font-weight:700;color:'+C.lime+'">R</span></div></div>'+
    '<div style="flex:1;background:#141416;border-radius:14px;padding:14px;text-align:center">'+
    '<div style="font-size:9px;color:'+C.text2+';font-weight:500">Active</div>'+
    '<div class="count-up" style="font-size:22px;font-weight:800;color:'+C.white+';margin-top:3px;letter-spacing:-0.5px">'+state.active.length+'</div></div></div>';
}

function equityChart(entries){
  if(entries.length<2)return "";
  var sorted=entries.slice().sort(function(a,b){return(a.createdAt||"").localeCompare(b.createdAt||"");});
  var cumR=0,points=[];
  for(var i=0;i<sorted.length;i++){cumR+=(sorted[i].rMultiple||0);points.push(cumR);}
  var mn=Math.min(0,Math.min.apply(null,points));
  var mx=Math.max(0,Math.max.apply(null,points));
  var rng=mx-mn||1;
  var w=310,h=62,pad=4;
  function toY(v){return pad+(1-(v-mn)/rng)*(h-pad*2);}
  function toX(i2){return pad+(i2/(points.length-1))*(w-pad*2);}
  var d="";
  for(var i=0;i<points.length;i++)d+=(i===0?"M":"L")+toX(i).toFixed(1)+","+toY(points[i]).toFixed(1);
  var zeroY=toY(0);
  var fillD=d+"L"+toX(points.length-1).toFixed(1)+","+zeroY.toFixed(1)+"L"+toX(0).toFixed(1)+","+zeroY.toFixed(1)+"Z";
  var lv=points[points.length-1];
  var col=lv>=0?C.lime:C.red;
  return '<div class="card" style="padding:14px 16px;animation-delay:0.02s">'+
    '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">'+
    '<span style="font-size:12px;font-weight:700;color:'+C.white+'">Equity Curve</span>'+
    '<span style="font-size:11px;font-weight:700;color:'+col+'">'+(lv>=0?"+":"")+lv.toFixed(1)+'R</span></div>'+
    '<svg width="100%" height="'+h+'" viewBox="0 0 '+w+' '+h+'" style="display:block">'+
    '<path d="'+fillD+'" fill="url(#eqG)" opacity="0.15"/>'+
    '<defs><linearGradient id="eqG" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="'+col+'"/><stop offset="100%" stop-color="'+col+'" stop-opacity="0"/></linearGradient></defs>'+
    '<path d="'+d+'" class="chart-line" stroke="'+col+'" stroke-width="1.8" fill="none" stroke-linecap="round" stroke-linejoin="round"/>'+
    '<circle cx="'+toX(points.length-1).toFixed(1)+'" cy="'+toY(lv).toFixed(1)+'" r="2.5" fill="'+col+'"/></svg></div>';
}

function rBarChart(entries){
  if(!entries.length)return "";
  var slice=entries.slice(-20);
  var maxR=Math.max.apply(null,slice.map(function(e){return Math.abs(e.rMultiple||0);}));
  maxR=Math.max(maxR,0.5);
  var bw=12,gap=3,tw=slice.length*(bw+gap);
  var h=60,zy=h-10;
  var bars="";
  for(var i=0;i<slice.length;i++){
    var e=slice[i],r=e.rMultiple||0;
    var bh=(Math.abs(r)/maxR)*(h-16);
    var x=i*(bw+gap);
    var y=r>=0?zy-bh:zy;
    var c=r>0?C.lime:r<0?C.red:C.text2;
    bars+='<rect x="'+x+'" y="'+y.toFixed(1)+'" width="'+bw+'" height="'+bh.toFixed(1)+'" rx="2" fill="'+c+'" opacity="0.8"/>';
  }
  return '<div class="card" style="padding:14px 16px;animation-delay:0.04s">'+
    '<div style="font-size:12px;font-weight:700;color:'+C.white+';margin-bottom:8px">R per Trade <span style="font-size:9px;color:'+C.text2+';font-weight:400">(last '+slice.length+')</span></div>'+
    '<svg width="100%" height="'+h+'" viewBox="0 0 '+(tw+4)+' '+h+'" style="display:block">'+
    '<line x1="0" y1="'+zy+'" x2="'+(tw+4)+'" y2="'+zy+'" stroke="rgba(255,255,255,0.06)" stroke-width="0.5"/>'+
    bars+'</svg></div>';
}

function jcPref(key){return localStorage.getItem("jc_"+key)!=="false";}
function toggleJC(key){localStorage.setItem("jc_"+key,!(jcPref(key)));render();}

function journalScreen(){
  var entries=state.journal;
  if(state.journalTab==="scalp")entries=entries.filter(function(e){return e.system==="scalp";});
  else entries=entries.filter(function(e){return e.system!=="scalp";});
  var pairs={};
  for(var pi=0;pi<entries.length;pi++)pairs[entries[pi].pair]=true;
  var pairList=Object.keys(pairs).sort();
  if(state.journalPairFilter!=="all")entries=entries.filter(function(e){return e.pair===state.journalPairFilter;});
  if(state.journalDirFilter!=="all")entries=entries.filter(function(e){return(e.direction||"")===state.journalDirFilter;});
  var wins=entries.filter(function(e){return e.outcome==="WIN"||e.outcome==="TP1"||e.outcome==="TP2";});
  var losses=entries.filter(function(e){return e.outcome==="SL";});
  var bes=entries.filter(function(e){return e.outcome==="BE";});
  var wr=(wins.length+losses.length)?Math.round((wins.length/(wins.length+losses.length))*100):0;
  var totalR=entries.reduce(function(a,e){return a+(e.rMultiple||0);},0);
  var filtered=state.journalFilter==="all"?entries
    :state.journalFilter==="wins"?wins
    :state.journalFilter==="losses"?losses
    :entries.filter(function(e){return e.outcome===state.journalFilter;});
  var allTags=[].concat(...new Set(entries.map(function(e){return e.tags||[];}))).slice(0,8);
  var streakInfo=state.stats||{};
  if(state.journalTab==="scalp")filtered.sort(function(a,b){return(b.createdAt||"").localeCompare(a.createdAt||"");});
  else filtered.sort(function(a,b){return(b.createdAt||"").localeCompare(a.createdAt||"");});

  function hdr(){var ds=["M","T","W","T","F","S","S"],h="";for(var d=0;d<ds.length;d++)h+='<span style="font-size:7px;color:'+C.text2+';width:10px;text-align:center;display:inline-block">'+ds[d]+'</span>';return h;}
  function cells(oc,gd,go){
    var now=new Date();
    var start=new Date(Date.UTC(now.getUTCFullYear(),now.getUTCMonth(),now.getUTCDate()));
    start.setUTCDate(start.getUTCDate()-27);
    var cells2=[];
    for(var i=0;i<28;i++){
      var d=new Date(start);d.setUTCDate(start.getUTCDate()+i);
      var ds=d.toISOString().slice(0,10);
      var match=null;
      for(var j=0;j<oc.length;j++)if(gd(oc[j])===ds){match=oc[j];break;}
      var o=match?go(match):null;
      var c=o==="WIN"||o==="TP1"||o==="TP2"?C.lime:o==="SL"?C.red:o==="BE"?C.text2:"rgba(255,255,255,0.04)";
      cells2.push('<span style="display:inline-block;width:10px;height:10px;border-radius:2.5px;background:'+c+'"></span>');
    }
    var rows="";
    for(var w=0;w<4;w++)rows+='<div style="display:flex;gap:3px;margin-top:3px">'+cells2.slice(w*7,w*7+7).join("")+'</div>';
    return rows;
  }
  function hm(label,oc,gd,go){
    return '<div class="card" style="animation-delay:0.05s"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">'+
      '<span style="font-size:13px;font-weight:700;color:'+C.white+'">'+label+'</span>'+
      '<div style="display:flex;gap:8px;font-size:9px;color:'+C.text2+'">'+
      '<span><span style="display:inline-block;width:8px;height:8px;border-radius:2px;background:'+C.lime+';vertical-align:middle;margin-right:2px"></span>W</span>'+
      '<span><span style="display:inline-block;width:8px;height:8px;border-radius:2px;background:'+C.red+';vertical-align:middle;margin-right:2px"></span>L</span>'+
      '<span><span style="display:inline-block;width:8px;height:8px;border-radius:2px;background:'+C.text2+';vertical-align:middle;margin-right:2px"></span>BE</span></div></div>'+
      '<div style="font-size:9px;color:'+C.text2+';margin-bottom:6px">'+new Date().toLocaleDateString("en-US",{month:"long",year:"numeric"})+'</div>'+
      '<div style="display:flex;gap:3px">'+hdr()+'</div>'+cells(oc,gd,go)+'</div>';
  }

  function eh(e){
    var o=e.outcome;
    var iw=o==="WIN"||o==="TP1"||o==="TP2";
    var ic=iw?C.lime:o==="SL"?C.red:C.text2;
    var ib=iw?C.limeSoft:o==="SL"?C.redSoft:C.surface;
    var it=iw?"\u2713":o==="SL"?"\u2715":"\u2014";
    var rc=iw?C.lime:o==="SL"?C.red:C.text2;
    var th=(e.tags&&e.tags.length)?'<div style="display:flex;gap:4px;margin-top:5px">'+e.tags.map(function(t){return tg(t);}).join("")+'</div>':"";
    var fh=(e.reviewFlags&&e.reviewFlags.length)?'<div style="display:flex;gap:4px;margin-top:4px">'+e.reviewFlags.map(function(f){return fl(f);}).join("")+'</div>':"";
    var nh=e.notes?'<div style="font-size:11.5px;color:'+C.text2+';margin-top:5px;line-height:1.4">'+esc(e.notes)+'</div>':"";
    var st=e.system==="scalp"?+'<span style="font-size:8px;font-weight:700;padding:1px 4px;border-radius:2px;background:#3B82F6;color:#FFF;margin-left:4px">SCALP</span>':'<span style="font-size:8px;font-weight:700;padding:1px 4px;border-radius:2px;background:'+C.lime+';color:#000;margin-left:4px">QMR</span>';
    return '<div class="card" onclick="editEntry(\''+e.id+'\')" style="padding:12px 16px;cursor:pointer;animation-delay:0s">'+
      '<div style="display:flex;gap:12px;align-items:flex-start">'+
      '<div style="width:30px;height:30px;border-radius:99px;flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:13px;background:'+ib+';color:'+ic+'">'+it+'</div>'+
      '<div style="flex:1;min-width:0">'+
      '<div style="display:flex;justify-content:space-between;align-items:center">'+
      '<span style="font-weight:700;font-size:13px;color:'+C.white+'">'+e.pair+st+'</span>'+
      '<span style="font-weight:800;font-size:13px;color:'+rc+'">'+(e.rMultiple>=0?"+":"")+(e.rMultiple||0)+'R</span></div>'+
      '<div style="font-size:10px;color:'+C.text2+';margin-top:2px">'+(e.direction||"")+' \u00b7 '+(e.tf||"")+' \u00b7 '+(e.duration||"")+' \u00b7 '+(e.createdAt?timeAgo(e.createdAt):"")+'</div>'+
      nh+fh+th+'</div></div></div>';
  }
  function tg(tag){
    var isEarly=tag==="Early Entry";
    var isFeel=tag==="Confident"||tag==="Impatient"||tag==="Neutral";
    var em={Displacement:"",LiqSweep:"\uD83E\uDDF9",MSS:"\uD83D\uDCD0",EngLiq:"\u26A1",FVG:"\uD83D\uDCB0",OB:"\uD83C\uDFE6",CRT:"\uD83D\uDCC8",EarlyEntry:"\u23F0",Confident:"\uD83C\uDFCB\uFE0F",Impatient:"\uD83E\uDD2F",Neutral:"\uD83D\uDE10"};
    var bg=isEarly?C.redSoft:isFeel?C.surface:C.limeSoft;
    var col=isEarly?C.red:isFeel?C.text2:C.lime;
    return '<span style="font-size:8.5px;padding:2px 8px;border-radius:99px;background:'+bg+';color:'+col+'">'+(em[tag.replace(/ /g,"")]||"")+' '+tag+'</span>';
  }
  function fl(f){return '<span style="font-size:8.5px;padding:2px 8px;border-radius:99px;background:'+C.redSoft+';color:'+C.red+';font-weight:600">\u26A0 '+f+'</span>';}

  var body=filtered.map(eh).join("");
  return '<div style="display:flex;flex-direction:column;height:100dvh;background:'+C.bg+'">'+
    '<div style="padding:calc(24px + env(safe-area-inset-top)) 16px 6px">'+
    '<div style="display:flex;align-items:center;gap:10px;margin-bottom:8px">'+
    '<span style="font-size:22px;font-weight:800;color:'+C.white+';letter-spacing:-0.5px">Journal</span>'+
    '<span style="font-size:12px;color:'+C.lime+'">'+wins.length+'W</span>'+
    '<span style="font-size:12px;color:'+C.red+'">'+losses.length+'L</span>'+
    '<span style="font-size:12px;color:'+C.text2+'">'+bes.length+'BE</span>'+
    (wins.length+losses.length?'<span style="font-size:11px;font-weight:700;color:'+C.white+'">'+wr+'%</span>':"")+
    '</div>'+
    '<div style="display:flex;gap:6px;margin-bottom:10px">'+
    tb("all","All",state.journalFilter==="all")+
    tb("wins","Wins",state.journalFilter==="wins")+
    tb("losses","Losses",state.journalFilter==="losses")+
    tb("win","TP",state.journalFilter==="win")+
    tb("sl","SL",state.journalFilter==="sl")+
    tb("be","BE",state.journalFilter==="be")+
    '</div>'+
    '<div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:8px">'+
    '<div style="display:flex;gap:3px;margin-right:6px;flex-wrap:wrap">'+
    '<span style="font-size:10px;color:'+C.text2+';padding:5px 10px;border:0.5px solid '+C.border+';border-radius:8px;background:'+C.surface+'">Pair:</span>'+
    '<button onclick="setJournalPairFilter(\'all\')" style="background:'+(state.journalPairFilter==="all"?C.lime:C.surface)+';border:none;border-radius:8px;padding:5px 12px;font-size:10px;font-weight:600;color:'+(state.journalPairFilter==="all"?C.bg:C.text2)+';cursor:pointer">All</button>'+
    pairList.slice(0,5).map(function(p){return '<button onclick="setJournalPairFilter(\''+p+'\')" style="background:'+(state.journalPairFilter===p?C.lime:C.surface)+';border:none;border-radius:8px;padding:5px 12px;font-size:10px;font-weight:600;color:'+(state.journalPairFilter===p?C.bg:C.text2)+';cursor:pointer">'+p+'</button>';}).join("")+
    '</div></div>'+
    (allTags.length?'<div style="display:flex;gap:4px;flex-wrap:wrap;margin-bottom:6px">'+allTags.map(function(t){
      var act=state.journalTagFilter===t;
      return '<button onclick="setJournalTagFilter(\''+t+'\')" style="background:'+(act?C.limeSoft:C.surface)+';border:0.5px solid '+(act?C.lime+"55":C.border)+';border-radius:99px;padding:4px 10px;font-size:9px;color:'+(act?C.lime:C.text2)+';cursor:pointer;font-weight:'+(act?"600":"400")+'">'+t+'</button>';
    }).join("")+'</div>':"")+
    '<div style="display:flex;gap:4px">'+tb("qmr","QMR",state.journalTab==="qmr")+tb("scalp","Scalp",state.journalTab==="scalp")+
    '<div style="flex:1"></div>'+
    (state.journalPairFilter!=="all"?+'<button onclick="setJournalPairFilter(\'all\')" style="background:transparent;border:0.5px solid '+C.border+';border-radius:8px;padding:4px 8px;font-size:9px;color:'+C.red+';cursor:pointer">\u2715 Clear</button>':"")+
    '</div></div>'+
    hm("Outcome Grid",entries,function(e){return(e.createdAt||"").split("T")[0];},function(e){return e.outcome;})+
    '<div style="padding:0 14px 0"><div class="card" style="display:flex;gap:16px;justify-content:space-around;animation-delay:0.06s">'+
    '<div style="text-align:center"><div style="font-size:9px;color:'+C.text2+'">Avg Win</div><div style="font-size:16px;font-weight:800;color:'+C.lime+';margin-top:2px">'+(wins.length?((wins.reduce(function(a,e){return a+(e.rMultiple||0);},0)/wins.length)||0).toFixed(2)+"R":"0")+'</div></div>'+
    '<div style="width:0.5px;background:'+C.border+'"></div>'+
    '<div style="text-align:center"><div style="font-size:9px;color:'+C.text2+'">Avg Loss</div><div style="font-size:16px;font-weight:800;color:'+C.red+';margin-top:2px">'+(losses.length?((losses.reduce(function(a,e){return a+(e.rMultiple||0);},0)/losses.length)||0).toFixed(2)+"R":"0")+'</div></div>'+
    '<div style="width:0.5px;background:'+C.border+'"></div>'+
    '<div style="text-align:center"><div style="font-size:9px;color:'+C.text2+'">Best</div><div style="font-size:16px;font-weight:800;color:'+C.lime+';margin-top:2px">'+(entries.length?Math.max.apply(null,entries.map(function(e){return e.rMultiple||0;})).toFixed(2)+"R":"0")+'</div></div>'+
    '<div style="width:0.5px;background:'+C.border+'"></div>'+
    '<div style="text-align:center"><div style="font-size:9px;color:'+C.text2+'">Worst</div><div style="font-size:16px;font-weight:800;color:'+C.red+';margin-top:2px">'+(entries.length?Math.min.apply(null,entries.map(function(e){return e.rMultiple||0;})).toFixed(2)+"R":"0")+'</div></div>'+
    '</div></div>'+
    equityChart(entries)+rBarChart(entries)+
    '<div style="padding:0 16px;flex:1;overflow-y:auto;-webkit-overflow-scrolling:touch">'+body+'</div>'+
    '<div style="padding:10px 16px calc(10px + env(safe-area-inset-bottom))">'+
    '<button onclick="resetJournalFilters()" style="width:100%;background:'+C.surface+';border:0.5px solid '+C.border+';border-radius:10px;padding:12px 0;color:'+C.text2+';font-size:12px;cursor:pointer">Clear Filters</button></div></div>';
}
function tb(id,label,active){
  var fn=id==="scalp"?'setJournalTab("scalp")':id==="qmr"?'setJournalTab("qmr")':'setJournalFilter("'+id+'")';
  return '<button onclick="'+fn+'" style="background:'+(active?C.lime:C.surface)+';border:none;border-radius:8px;padding:5px 12px;font-size:10px;font-weight:'+(active?"700":"500")+';color:'+(active?C.bg:C.text2)+';cursor:pointer">'+label+'</button>';
}
window.setJournalFilter=function(f){state.journalFilter=f;render();};
window.setJournalTab=function(t){state.journalTab=t;render();};
window.setJournalPairFilter=function(p){state.journalPairFilter=p;render();};
window.setJournalTagFilter=function(t){state.journalTagFilter=t;render();};
window.resetJournalFilters=function(){state.journalFilter="all";state.journalTab="qmr";state.journalPairFilter="all";state.journalTagFilter="";render();};

window.closeEntryForm=function(){state.showEntryForm=false;render();};
window.showEntryForm=function(){state.showEntryForm=true;render();};
window.editEntry=function(id){state.editingEntryId=id;state.showEntryForm=true;render();};

function journalEntryForm(editId){
  var existing=null;
  for(var i=0;i<state.journal.length;i++)if(state.journal[i].id===editId){existing=state.journal[i];break;}
  var isEdit=!!existing;
  return '<div style="position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.6);z-index:9999;display:flex;align-items:flex-end;-webkit-backdrop-filter:blur(12px);backdrop-filter:blur(12px);animation:slideUp 0.25s ease" onclick="if(event.target===this)closeEntryForm()">'+
    '<div style="width:100%;max-height:90dvh;overflow-y:auto;background:'+C.bg+';border-radius:20px 20px 0 0;padding:calc(24px + env(safe-area-inset-bottom)) 20px;animation:slideUp 0.3s ease">'+
    '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px">'+
    '<span style="font-size:18px;font-weight:800;color:'+C.white+'">'+(isEdit?"Edit Trade Entry":"New Trade Entry")+'</span>'+
    '<button onclick="closeEntryForm()" style="background:'+C.surface+';border:none;border-radius:99px;width:32px;height:32px;display:flex;align-items:center;justify-content:center;cursor:pointer;color:'+C.text2+';font-size:16px">\u2715</button></div>'+
    '<div class="card" style="padding:16px;margin-bottom:14px">'+
    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">'+
    ff("pair","Pair",existing?existing.pair:"",true)+
    ff("dir","Direction",existing?existing.direction||"":"",true)+
    ff("tf","Timeframe",existing?existing.tf||"":"",true)+
    ff("system","System",existing?existing.system||"qmr":"")+
    ff("duration","Duration",existing?existing.duration||"":"")+
    ff("outcome","Outcome",existing?existing.outcome||"":"",true)+
    ff("r","R Multiple",existing?(existing.rMultiple||""):"")+
    '</div>'+
    '<div style="display:flex;gap:8px;margin-top:14px">'+
    '<div style="flex:1">'+ff("date","Date",existing&&existing.createdAt?existing.createdAt.slice(0,10):new Date().toISOString().slice(0,10))+'</div>'+
    '<div style="flex:1">'+ff("tags","Tags (comma separated)",existing&&existing.tags?existing.tags.join(", "):"")+'</div>'+
    '</div>'+
    '<div style="margin-top:14px">'+ta("notes","Notes",existing?existing.notes||"":"")+'</div></div>'+
    '<div style="display:flex;gap:10px">'+
    '<button onclick="deleteJournalEntry(\''+(existing?existing.id:"")+'\')" style="flex:1;background:'+C.redSoft+';border:0.5px solid '+C.red+"55"+';border-radius:10px;padding:13px 0;color:'+C.red+';font-weight:700;font-size:13px;cursor:pointer">'+(isEdit?"Delete":"")+'</button>'+
    '<button onclick="saveJournalEntry(\''+(existing?existing.id:"")+'\')" style="flex:2;background:'+C.lime+';border:none;border-radius:10px;padding:13px 0;color:'+C.bg+';font-weight:700;font-size:13px;cursor:pointer">Save</button></div></div></div>';
}
function ff(id,label,val,req){
  return '<div style="display:flex;flex-direction:column;gap:4px"><span style="font-size:10px;color:'+C.text2+'">'+label+(req?' <span style="color:'+C.red+'">*</span>':"")+'</span><input id="je-'+id+'" type="text" value="'+esc(val||"")+'" placeholder="'+label+'" style="background:'+C.surface+';border:0.5px solid '+C.border+';border-radius:8px;padding:10px 12px;color:'+C.white+';font-size:13px;outline:none;width:100%;box-sizing:border-box;-webkit-appearance:none"></div>';
}

window.saveJournalEntry=function(id){
  function get(f){return document.getElementById("je-"+f.charAt(0).toUpperCase()+f.slice(1))?.value?.trim()||"";}
  var pair=get("pair"),dir=get("dir"),tf=get("tf"),system=get("system"),dur=get("duration"),outcome=get("outcome"),rStr=get("r"),date=get("date"),tagsStr=get("tags"),notes=get("notes");
  if(!pair||!dir||!tf||!outcome){alert("Please fill in Pair, Direction, Timeframe, and Outcome.");return;}
  var r=parseFloat(rStr)||0;
  var tags=tagsStr?tagsStr.split(",").map(function(s){return s.trim();}).filter(function(s){return s;}):[];
  var ed={pair:pair.toUpperCase(),direction:dir,timeframe:tf,system:system||"qmr",duration:dur,outcome:outcome,rMultiple:r,createdAt:date+"T12:00:00Z",tags:tags,notes:notes};
  var base=getCode()||"";
  var data=JSON.parse(decodeURIComponent(atob(base)))||{journal:[]};
  if(!data.journal)data.journal=[];
  if(id){for(var i=0;i<data.journal.length;i++)if(data.journal[i].id===id){Object.assign(data.journal[i],ed);break;}
  }else{ed.id="je_"+(Date.now().toString(36)+Math.random().toString(36).slice(2,8));data.journal.push(ed);}
  saveCode(JSON.stringify(data));closeEntryForm();
};
window.deleteJournalEntry=function(id){
  if(!id)return;
  var base=getCode()||"";var data=JSON.parse(decodeURIComponent(atob(base)))||{journal:[]};
  data.journal=data.journal.filter(function(e){return e.id!==id;});saveCode(JSON.stringify(data));closeEntryForm();
};

function scalpScreen(){
  return '<div style="display:flex;flex-direction:column;background:'+C.bg+'">'+
    '<div style="padding:calc(24px + env(safe-area-inset-top)) 16px 10px">'+
    '<div style="display:flex;align-items:center;gap:10px;margin-bottom:8px">'+
    '<span style="font-size:22px;font-weight:800;color:'+C.white+';letter-spacing:-0.5px">Scalp Signals</span>'+
    '<span style="font-size:10px;color:'+C.text2+';background:'+C.surface+';padding:3px 8px;border-radius:99px">'+(state.scalpActive||"")+' active</span></div>'+
    (state.stats?statsOverview():"")+'</div>'+
    '<div style="padding:0 16px;flex:1;overflow-y:auto;-webkit-overflow-scrolling:touch">'+
    state.scalpSignals.map(function(s,i){
      var isBuy=s.direction==="LONG";
      var col=isBuy?C.lime:C.red;
      var bg=isBuy?C.limeSoft:C.redSoft;
      var isActive=s.status==="ACTIVE";
      return '<div class="card" style="border-left:2.5px solid '+col+';animation-delay:'+(i*0.02)+'s" onclick="showScalpDetail(\''+s.id+'\')">'+
        '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">'+
        '<div style="display:flex;align-items:center;gap:6px"><span style="font-weight:800;font-size:15px;color:'+C.white+'">'+s.pair+'</span>'+
        '<span class="mono" style="font-size:11px;color:'+C.text2+'">'+fmt(s.price)+'</span></div>'+
        '<div style="display:flex;align-items:center;gap:4px">'+pill(s.direction,col,bg)+
        (isActive?'<span style="width:6px;height:6px;border-radius:99px;background:'+C.lime+';animation:pulse 1.5s infinite"></span>':"")+'</div></div>'+
        '<div style="display:flex;gap:6px;align-items:center">'+
        '<span style="font-size:10px;color:'+C.text2+'">S: <span style="color:'+C.white+'">'+fmt(s.support)+'</span></span>'+
        '<span style="font-size:10px;color:'+C.text2+'">R: <span style="color:'+C.white+'">'+fmt(s.resistance)+'</span></span>'+
        '<span style="font-size:10px;color:'+C.lime+'">TK: '+fmt(s.takeProfit)+'</span></div>'+
        '<div style="display:flex;justify-content:space-between;margin-top:5px">'+
        '<span style="font-size:9px;color:'+C.text2+'">'+timeAgo(s.time)+'</span>'+
        (s.notes?'<span style="font-size:9px;color:'+C.text2+';max-width:120px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">'+esc(s.notes)+'</span>':"")+'</div></div>';
    }).join("")+'</div></div>';
}

function settingsScreen(){
  var jc={track:jcPref("track"),priceReveal:jcPref("priceReveal"),confirmExit:jcPref("confirmExit"),sounds:jcPref("sounds"),easterEggs:jcPref("easterEggs"),premiumAlerts:jcPref("premiumAlerts")};
  return '<div style="display:flex;flex-direction:column;height:100dvh;background:'+C.bg+'">'+
    '<div style="padding:calc(24px + env(safe-area-inset-top)) 16px 10px;flex-shrink:0">'+
    '<div style="display:flex;align-items:center;gap:10px;margin-bottom:16px">'+
    avatarRing(36)+'<div><div style="font-weight:800;font-size:18px;color:'+C.white+'">Settings</div><div style="font-size:11px;color:'+C.text2+'">v'+state.appVersion+'</div></div></div>'+
    sg("General",[sr("bell","Notifications","premiumAlerts",jc.premiumAlerts,false,"Trade alerts & push notifications"),sr("volume","Sound Effects","sounds",jc.sounds,false,"UI feedback sounds")])+
    sg("Trading",[sr("eye","Trade Tracking","track",jc.track,false,"Show tracking buttons"),sr("eye","Quick Price View","priceReveal",jc.priceReveal,false,"Tap to reveal prices"),sr("check-square","Confirm Exit","confirmExit",jc.confirmExit,false,"Require confirmation")])+
    sg("Appearance",[sr("zap","Sparkles","easterEggs",jc.easterEggs,false,"Hidden animations")])+
    sg("Data",['<div style="display:flex;gap:8px;margin-top:8px">'+
      '<button onclick="exportData()" style="flex:1;background:'+C.surface+';border:0.5px solid '+C.border+';border-radius:10px;padding:12px 0;color:'+C.white+';font-size:12px;font-weight:600;cursor:pointer">Export</button>'+
      '<button onclick="importData()" style="flex:1;background:'+C.surface+';border:0.5px solid '+C.border+';border-radius:10px;padding:12px 0;color:'+C.white+';font-size:12px;font-weight:600;cursor:pointer">Import</button>'+
      '<button onclick="clearAllData()" style="flex:1;background:'+C.redSoft+';border:0.5px solid '+C.red+"55"+';border-radius:10px;padding:12px 0;color:'+C.red+';font-size:12px;font-weight:600;cursor:pointer">Clear</button></div>'+
      '<div style="font-size:9px;color:'+C.text2+';margin-top:8px;text-align:center">Data stored locally. Export to back up.</div>',])+
    '<div style="display:flex;flex-direction:column;align-items:center;gap:4px;margin:20px 0 calc(20px + env(safe-area-inset-bottom));text-align:center">'+
    '<span style="font-size:10px;color:'+C.text2+'">Made by roz and n8s\u88c2\u9699</span>'+
    '<span style="font-size:8px;color:'+C.text3+'">QMR v'+state.appVersion+'</span></div></div></div>';
}
function sg(label,rows){return '<div style="margin-bottom:16px"><div style="font-size:11px;font-weight:700;color:'+C.text2+';text-transform:uppercase;letter-spacing:0.5px;margin-bottom:6px;padding:0 4px">'+label+'</div><div style="background:#141416;border-radius:14px;overflow:hidden">'+rows.join("")+'</div></div>';}
function sr(iconName,label,key,val,isLast,desc){
  var ic=getSvg(iconName,val);
  return '<div style="display:flex;align-items:center;gap:12px;padding:12px 16px;border-bottom:'+(isLast?"none":"0.5px solid rgba(255,255,255,0.04)")+'">'+
    '<div style="display:flex;align-items:center;justify-content:center;width:32px;height:32px;border-radius:8px;background:rgba(255,255,255,0.04);flex-shrink:0">'+ic+'</div>'+
    '<div style="flex:1;min-width:0"><div style="font-size:13px;font-weight:600;color:'+C.white+'">'+label+'</div>'+(desc?'<div style="font-size:9px;color:'+C.text2+'">'+desc+'</div>':"")+'</div>'+
    '<button onclick="toggleJC(\''+key+'\')" style="width:44px;height:26px;border-radius:99px;background:'+(val?C.lime:"rgba(255,255,255,0.1)")+';border:'+(val?"none":"0.5px solid rgba(255,255,255,0.1)")+';position:relative;cursor:pointer;transition:background 0.2s;flex-shrink:0">'+
    '<div style="width:20px;height:20px;border-radius:99px;background:#FFF;position:absolute;top:2px;left:'+(val?"22px":"2px")+';transition:left 0.2s;box-shadow:0 0 4px rgba(0,0,0,0.3)"></div></button></div>';
}
function getSvg(n,on){var c=on?C.lime:C.text2;
  var m={bell:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="'+c+'" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>',volume:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="'+c+'" stroke-width="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>',eye:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="'+c+'" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>','check-square':'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="'+c+'" stroke-width="2"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>',zap:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="'+c+'" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>'};return m[n]||"";}

window.exportData=function(){
  var d=getCode()||"";if(!d)return;
  var b=new Blob([d],{type:"text/plain"});var a=document.createElement("a");a.href=URL.createObjectURL(b);a.download="qmr_backup_"+new Date().toISOString().slice(0,10)+".qmr";
  document.body.appendChild(a);a.click();document.body.removeChild(a);
};
window.importData=function(){
  var inp=document.createElement("input");inp.type="file";inp.accept=".qmr,.txt";
  inp.onchange=function(ev){var f=ev.target.files[0];if(!f)return;var r=new FileReader();r.onload=function(){var d=r.result;if(!d||d.length>50000){alert("Invalid or too large file.");return;}saveCode(d);render();};r.readAsText(f);};
  inp.click();
};
window.clearAllData=function(){
  if(!confirm("This will clear ALL your journal entries and settings. Are you sure?")||!confirm("This cannot be undone. Proceed?"))return;
  clearCode();localStorage.clear();render();
};

function newsScreen(){
  var arts=state.news||[];
  return '<div style="display:flex;flex-direction:column;background:'+C.bg+'">'+
    '<div style="padding:calc(24px + env(safe-area-inset-top)) 16px 10px;flex-shrink:0">'+
    '<div style="display:flex;align-items:center;gap:10px;margin-bottom:8px">'+
    '<span style="font-size:22px;font-weight:800;color:'+C.white+';letter-spacing:-0.5px">News</span>'+
    '<span style="font-size:10px;color:'+C.text2+';background:'+C.surface+';padding:3px 8px;border-radius:99px">'+(state.news.length||"")+' articles</span></div></div>'+
    '<div style="padding:0 16px 1px;flex:1;overflow-y:auto;-webkit-overflow-scrolling:touch">'+
    (arts.length?arts.slice(0,30).map(function(a,i){
      var img=a.imageUrl?'<img src="'+a.imageUrl+'" style="width:100%;height:100%;object-fit:cover;position:absolute;top:0;left:0">':'<div style="display:flex;align-items:center;justify-content:center;height:100%;color:'+C.text3+';font-size:20px;font-weight:800">'+a.title.slice(0,2)+'</div>';
      return '<a href="'+esc(a.url)+'" target="_blank" style="text-decoration:none;display:block">'+
        '<div class="card" style="padding:0;overflow:hidden;animation-delay:'+(i*0.01)+'s">'+
        '<div style="height:140px;background:'+C.surface+';position:relative;overflow:hidden">'+img+'</div>'+
        '<div style="padding:14px"><div style="font-size:13px;font-weight:700;color:'+C.white+';line-height:1.4;margin-bottom:4px">'+esc(a.title)+'</div>'+
        (a.summary?'<div style="font-size:11px;color:'+C.text2+';line-height:1.4;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden">'+esc(a.summary)+'</div>':"")+
        '<div style="display:flex;gap:6px;margin-top:6px">'+(a.source?'<span style="font-size:8px;color:'+C.text3+';background:'+C.surface+';padding:1px 6px;border-radius:4px">'+esc(a.source)+'</span>':"")+
        (a.symbols?esc(a.symbols):"")+'<span style="font-size:8px;color:'+C.text3+';margin-left:auto">'+timeAgo(a.publishedAt||a.createdAt)+'</span></div></div></div></a>';
    }).join(""):emptyState("No news available"))+'</div></div>';
}

function activeTradeWidget(){
  var act=state.active||[];
  if(!act.length)return "";
  var entries=state.journal||[];
  var ap={};
  for(var i=0;i<act.length;i++){
    var s=act[i];
    for(var j=0;j<entries.length;j++)if(entries[j].id===s.id){ap[s.id]=s;break;}
  }
  var ids=Object.keys(ap);
  if(!ids.length)return "";
  var h='<div style="margin:14px 0 8px"><div style="font-size:11px;font-weight:700;color:'+C.text2+';text-transform:uppercase;letter-spacing:0.5px;margin-bottom:6px;padding:0 4px">Active Tracks <span style="color:'+C.lime+'">'+ids.length+'</span></div>';
  for(var i=0;i<ids.length;i++){
    var s=ap[ids[i]];var isBuy=s.type==="BULLISH"||s.type==="BUY";var col=isBuy?C.lime:C.red;var is=isBuy?"\u2191":"\u2193";var pr=calculateTradeProgress(s);
    h+='<div class="card" onclick="detailSignal(\''+s.id+'\')" style="cursor:pointer;animation-delay:'+(i*0.03)+'s">'+
      '<div style="display:flex;justify-content:space-between;align-items:center">'+
      '<div style="display:flex;align-items:center;gap:8px"><span style="font-weight:800;font-size:15px;color:'+C.white+'">'+s.pair+'</span>'+
      '<span style="font-size:10px;color:'+col+';background:'+(isBuy?C.limeSoft:C.redSoft)+';padding:2px 8px;border-radius:99px;font-weight:700">'+is+'</span></div>'+
      '<span style="font-size:12px;font-weight:700;color:'+C.text2+'">'+s.tf+'</span></div>'+
      '<div style="display:flex;gap:8px;margin-top:8px"><div style="flex:1;display:flex;gap:6px;align-items:center">'+
      '<div style="flex:1;height:4px;background:rgba(255,255,255,0.08);border-radius:99px;overflow:hidden">'+
      '<div style="height:100%;width:'+pr.pct+'%;background:'+pr.color+';border-radius:99px;transition:width 0.5s ease"></div></div></div></div>'+
      '<div style="display:flex;justify-content:space-between;margin-top:6px;font-size:9px;color:'+C.text2+'">'+
      '<span>'+pr.label+'</span><span style="color:'+pr.color+';font-weight:700">'+pr.pct+'%</span></div></div>';
  }
  return h+'</div>';
}

function calculateTradeProgress(s){
  var entries=state.journal||[];var je=null;
  for(var j=0;j<entries.length;j++)if(entries[j].id===s.id){je=entries[j];break;}
  if(!je)return{pct:0,color:C.text2,label:"Not tracked"};
  var o=je.outcome||"";
  if(o==="TP2"||o==="WIN")return{pct:100,color:C.lime,label:"Complete"};
  if(o==="TP1")return{pct:75,color:C.lime,label:"TP1 Hit"};
  if(o==="SL")return{pct:100,color:C.red,label:"Stopped"};
  if(o==="BE")return{pct:100,color:C.text2,label:"Breakeven"};
  return{pct:25,color:C.orange,label:"Active"};
}

function render(){
  var app=document.getElementById("app");
  if(!app||state.booting)return;
  var scr=state.screen||"overview";
  var content="";
  if(state.showEntryForm){content=journalEntryForm(state.editingEntryId);}
  else if(state.detailSignal){content=detailPage(state.detailSignal);}
  else if(scr==="overview"){content=overviewScreen();}
  else if(scr==="journal"){content=journalScreen();}
  else if(scr==="scalp"){content=scalpScreen();}
  else if(scr==="confluence"){content=confluenceScreen();}
  else if(scr==="settings"){content=settingsScreen();}
  else if(scr==="news"){content=newsScreen();}
  else{content=overviewScreen();}
  app.innerHTML=content;
  requestAnimationFrame(function(){
    app.querySelectorAll(".card, .count-up").forEach(function(c,i){
      c.style.setProperty("--delay",(i*0.03).toFixed(3)+"s");
      c.classList.add("card-enter");
    });
  });
}

function overviewScreen(){
  var signals=state.signals||[];
  var activeTrades=state.active||[];
  var hasTracks=false;
  for(var i=0;i<activeTrades.length;i++)for(var j=0;j<state.journal.length;j++)if(state.journal[j].id===activeTrades[i].id){hasTracks=true;break;}
  return '<div style="display:flex;flex-direction:column;height:100dvh;background:'+C.bg+'">'+
    '<div style="padding:calc(24px + env(safe-area-inset-top)) 16px 10px;flex-shrink:0">'+
    '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">'+
    '<div><div style="display:flex;align-items:center;gap:10px">'+avatarRing(34)+
    '<div><div style="font-size:20px;font-weight:800;letter-spacing:-0.5px;color:'+C.white+'">'+greeting()+'</div>'+
    '<div style="font-size:11px;color:'+C.text2+'">'+(signals.length||"0")+' signals today</div></div></div></div>'+
    '<div style="display:flex;gap:4px">'+
    nb("overview","Home","\u25A6")+nb("journal","Journal","\uD83D\uDCD6")+nb("scalp","Scalp","\u26A1")+
    nb("confluence","Confluence","\uD83D\uDCCA")+nb("news","News","\uD83C\uDF0D")+nb("settings","Settings","\u2699\uFE0F")+
    '</div></div>'+
    '<div style="flex:1;overflow-y:auto;-webkit-overflow-scrolling:touch;padding:0 16px 1px">'+
    (state.stats?statsOverview():"")+
    (hasTracks?activeTradeWidget():"")+
    (state.notifications&&state.notifications.length?nb2(state.notifications[0]):"")+
    (signals.length?signals.map(function(s,i){return signalCard(s,i);}).join(""):emptyState('No signals yet today<br><span style="font-size:11px;color:'+C.text2+'">Waiting for market data...</span>'))+
    '</div>'+
    '<div style="padding:8px 16px calc(8px + env(safe-area-inset-bottom));flex-shrink:0;display:flex;align-items:center;justify-content:space-between;border-top:0.5px solid '+C.border+'">'+
    '<span style="font-size:10px;color:'+C.text3+'">Last: '+(state.lastUpdated?timeAgo(state.lastUpdated):"...")+'</span>'+
    '<div style="display:flex;gap:16px;align-items:center">'+
    '<button onclick="fetchAll()" style="background:'+C.surface+';border:0.5px solid '+C.border+';border-radius:99px;padding:6px 12px;font-size:10px;color:'+C.text2+';cursor:pointer;display:flex;align-items:center;gap:4px">\u21BB Refresh</button>'+
    '<button onclick="openJournalEntry()" style="background:'+C.lime+';border:none;border-radius:99px;padding:6px 14px;font-size:10px;color:'+C.bg+';font-weight:700;cursor:pointer;display:flex;align-items:center;gap:4px">+ Entry</button></div></div></div>';
}
window.openJournalEntry=function(){state.showEntryForm=true;state.editingEntryId=null;render();};

function nb(screen,label,icon){
  var act=state.screen===screen;
  return '<button onclick="navigateTo(\''+screen+'\')" style="flex:1;background:'+(act?C.lime:C.surface)+';border:none;border-radius:8px;padding:7px 0;font-size:9px;font-weight:'+(act?"700":"500")+';color:'+(act?C.bg:C.text2)+';cursor:pointer;display:flex;flex-direction:column;align-items:center;gap:2px"><span style="font-size:14px">'+icon+'</span>'+label+'</button>';
}

function nb2(n){
  if(!n)return "";
  return '<div style="background:'+C.blueSoft+';border:0.5px solid '+C.blue+"55"+';border-radius:14px;padding:14px;margin-bottom:14px;display:flex;gap:10px;align-items:center;animation-delay:0.01s">'+
    '<span>'+icon("bell",C.blue,18)+'</span>'+
    '<div style="flex:1"><div style="font-size:12px;font-weight:600;color:'+C.blue+'">'+(n.title||"Alert")+'</div><div style="font-size:11px;color:'+C.text2+'">'+(n.body||"")+'</div></div>'+
    '<button onclick="dismissNotif(\''+n.id+'\')" style="background:transparent;border:none;color:'+C.blue+';cursor:pointer;font-size:16px">\u2715</button></div>';
}
window.dismissNotif=function(id){state.notifications=(state.notifications||[]).filter(function(n){return n.id!==id;});render();};

function marketPulseRow(){
  if(!state.marketData||!state.marketData.length)return "";
  var pairs=state.marketData.slice(0,8);
  return '<div style="display:flex;gap:8px;overflow-x:auto;-webkit-overflow-scrolling:touch;padding:8px 0 12px;scrollbar-width:none">'+
    pairs.map(function(p){var ch=parseFloat(p.change||0);var col=ch>=0?C.lime:C.red;
      return '<div style="flex-shrink:0;background:'+C.surface+';border:0.5px solid '+C.border+';border-radius:10px;padding:8px 12px;min-width:80px">'+
        '<div style="font-size:11px;font-weight:700;color:'+C.white+'">'+p.pair+'</div>'+
        '<div style="font-size:13px;font-weight:700;color:'+col+'">'+(ch>=0?"+":"")+(p.change||"0.0")+'%</div></div>';}).join("")+'</div>';
}

window.navigateTo=function(s){state.screen=s;state.detailSignal=null;state.showCalc=false;render();};
window.closeDetail=function(){state.detailSignal=null;state.showCalc=false;render();};
window.detailSignal=function(id){
  var all=[].concat(state.signals||[],state.scalpSignals||[]);
  for(var i=0;i<all.length;i++)if(all[i].id===id){state.detailSignal=all[i];break;}
  render();
};
window.showScalpDetail=function(id){
  for(var i=0;i<state.scalpSignals.length;i++)if(state.scalpSignals[i].id===id){state.detailSignal=state.scalpSignals[i];break;}
  render();
};
window.copyTrade=function(id){
  var all=[].concat(state.signals||[],state.scalpSignals||[]);
  var s=null;for(var i=0;i<all.length;i++)if(all[i].id===id){s=all[i];break;}
  if(!s)return;
  var isDual=s.dualEntry;
  var text=s.pair+" "+s.tf+" | "+s.type+"\\n";
  if(isDual){text+="Agg Entry: "+s.aggEntry+" | SL: "+s.aggSl+" | TP2: "+s.aggTp2;if(s.consEntry)text+="\\nCons Entry: "+s.consEntry+" | SL: "+s.consSl+" | TP2: "+s.consTp2;
  }else{text+="Entry: "+s.entry+" | SL: "+s.sl;if(s.tp1)text+=" | TP1: "+s.tp1;if(s.tp2)text+=" | TP2: "+s.tp2;}
  if(s.score)text+="\\nScore: "+s.score+"/4";if(s.criteria&&s.criteria.length)text+="\\n"+s.criteria.join(", ");
  copyToClipboard(text);
};
window.toggleTrack=function(id,current){
  var base=getCode()||"";var data=JSON.parse(decodeURIComponent(atob(base)))||{journal:[]};
  if(!data.journal)data.journal=[];
  if(current){data.journal=data.journal.filter(function(e){return e.id!==id;});
  }else{
    var all=[].concat(state.signals||[],state.scalpSignals||[]);
    var s=null;for(var i=0;i<all.length;i++)if(all[i].id===id||all[i].id+"-agg"===id||all[i].id+"-cons"===id){s=all[i];break;}
    if(s){var isAgg=id.indexOf("-agg")>0;var isCons=id.indexOf("-cons")>0;var ep=s.dualEntry?(isAgg?s.aggEntry:(isCons?s.consEntry:s.entry)):s.entry;
      data.journal.push({id:id,pair:s.pair,direction:s.type==="BULLISH"||s.type==="BUY"?"LONG":"SHORT",tf:s.tf,system:"qmr",entryPrice:ep,outcome:"ACTIVE",rMultiple:0,createdAt:new Date().toISOString(),tags:["Active"],notes:""});}
  }
  saveCode(JSON.stringify(data));render();
};
window.copyToClipboard=function(t){
  if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(t);
  else{var ta=document.createElement("textarea");ta.value=t;ta.style.position="fixed";ta.style.opacity="0";document.body.appendChild(ta);ta.select();document.execCommand("copy");document.body.removeChild(ta);}
};

// ===== LOGIN =====
function loginScreen(){
  return '<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100dvh;background:'+C.bg+';padding:32px">'+
    '<div style="font-size:38px;font-weight:800;color:'+C.lime+';margin-bottom:6px;letter-spacing:-1px">'+state.appName+'</div>'+
    '<div style="font-size:12px;color:'+C.text2+';margin-bottom:40px">Enter your access code</div>'+
    '<input id="login-code" type="text" placeholder="Access code" maxlength="50" style="width:100%;max-width:280px;background:#141416;border:0.5px solid '+C.border+';border-radius:12px;padding:14px 16px;color:'+C.white+';font-size:16px;text-align:center;outline:none;box-sizing:border-box;-webkit-appearance:none">'+
    '<button onclick="handleLogin()" style="width:100%;max-width:280px;background:'+C.lime+';border:none;border-radius:12px;padding:14px 0;color:'+C.bg+';font-size:15px;font-weight:800;margin-top:12px;cursor:pointer">Sign In</button>'+
    '<div style="font-size:9px;color:'+C.text3+';margin-top:24px;text-align:center">v'+state.appVersion+'</div></div>';
}

window.handleLogin=function(){
  var code=document.getElementById("login-code")?.value?.trim();
  if(!code||code.length<3){alert("Please enter a valid code.");return;}
  saveCode(code);
  document.getElementById("app").innerHTML='<div style="display:flex;align-items:center;justify-content:center;height:100dvh;background:'+C.bg+'"><span style="color:'+C.lime+';font-size:14px">\u2713 Loading...</span></div>';
  setTimeout(function(){initApp();},300);
};
window.logout=function(){if(confirm("Logout and clear code?")){clearCode();window.location.reload();}};

// ===== TOUR =====
function showTour(){
  state.tourStep=0;renderTour();
}
function renderTour(){
  if(state.tourStep==null)return;
  var steps=[{title:"Welcome to QMR",body:"Your trading command center.",icon:"\uD83D\uDE80"},{title:"Signals Feed",body:"Live trade signals ranked by conviction.",icon:"\u26A1"},{title:"Track Trades",body:"Tap a signal to start tracking.",icon:"\uD83C\uDFAF"},{title:"Journal",body:"Log wins, losses, and notes.",icon:"\uD83D\uDCDD"},{title:"Position Calculator",body:"Calculate position sizing from any signal.",icon:"\uD83E\uDEE9"}];
  var step=steps[state.tourStep];
  if(!step){state.tourStep=null;state.tourComplete=true;render();return;}
  state.tourCallbackSave=function(){state.tourStep++;if(state.tourStep>=steps.length){state.tourStep=null;state.tourComplete=true;render();return;}renderTour();};
  var app=document.getElementById("app");if(!app)return;
  app.innerHTML='<div style="position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.85);z-index:99999;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:32px;text-align:center">'+
    '<div style="font-size:48px;margin-bottom:20px">'+step.icon+'</div>'+
    '<div style="font-size:22px;font-weight:800;color:'+C.white+';margin-bottom:12px">'+step.title+'</div>'+
    '<div style="font-size:14px;color:'+C.text2+';line-height:1.5;margin-bottom:32px;max-width:300px">'+step.body+'</div>'+
    '<div style="display:flex;gap:12px">'+
    '<button onclick="closeTour()" style="background:rgba(255,255,255,0.1);border:none;border-radius:10px;padding:12px 24px;color:'+C.text2+';font-size:13px;font-weight:600;cursor:pointer">Skip</button>'+
    '<button onclick="state.tourCallbackSave&&state.tourCallbackSave()" style="background:'+C.lime+';border:none;border-radius:10px;padding:12px 28px;color:'+C.bg+';font-size:13px;font-weight:800;cursor:pointer">'+(state.tourStep<steps.length-1?"Next \u2192":"Done \u2713")+'</button></div></div>';
}
window.closeTour=function(){state.tourStep=null;state.tourComplete=true;render();};

// ===== BOOT =====
function initApp(){
  var code=getCode();
  if(!code){state.booting=false;document.getElementById("app").innerHTML=loginScreen();return;}
  state.booting=true;
  document.getElementById("app").innerHTML='<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100dvh;background:'+C.bg+'">'+
    '<div style="font-size:14px;color:'+C.lime+';margin-bottom:8px;font-weight:600">'+state.appName+'</div><div style="font-size:11px;color:'+C.text2+'">v'+state.appVersion+'</div>'+
    '<div style="margin-top:20px;width:24px;height:24px;border:2px solid '+C.border+';border-top-color:'+C.lime+';border-radius:99px;animation:spin 0.8s linear infinite"></div></div>';
  try{var data=JSON.parse(decodeURIComponent(atob(code)));state.journal=data.journal||[];}catch(e){state.journal=[];}
  fetchAll();
}

// ===== PUSH NOTIFICATIONS =====
var swRegistration=null;
if("serviceWorker" in navigator&&"Notification" in window&&Notification.permission!=="denied"){
  navigator.serviceWorker.register("/service-worker.js").then(function(reg){
    swRegistration=reg;
    if(Notification.permission==="granted")reg.showNotification("QMR Active",{body:"Monitoring signals...",icon:"/icon.png"});
    reg.onupdatefound=function(){var iw=reg.installing;if(iw)iw.onstatechange=function(){if(iw.state==="installed"&&navigator.serviceWorker.controller)console.log("QMR: Update available");};};
  }).catch(function(err){console.log("SW registration failed:",err);});
}

// ===== PERIODIC REFRESH =====
setInterval(function(){if(!state.booting)fetchAll();},45000);
setInterval(function(){if(!state.booting){fetchSignals();fetchActive();fetchConfluence();}},15000);

// ===== EVENT LISTENERS =====
window.addEventListener("focusin",function(){if(!state.booting)fetchAll();});
window.addEventListener("focusout",function(){});

// ===== INIT =====
document.addEventListener("DOMContentLoaded",function(){state.booting=true;initApp();});
