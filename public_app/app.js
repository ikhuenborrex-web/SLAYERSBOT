try{document.getElementById('app').innerHTML='<div style="padding:30px;color:rgba(255,255,255,0.4);text-align:center;font-size:13px;font-family:monospace">Loading...</div>';}catch(e){}
window.onerror=function(m,u,l,c,err){try{document.getElementById('app').innerHTML='<div style="padding:30px;color:#EF4444;text-align:center;font-family:monospace;font-size:12px;line-height:1.5">JS Error: '+m+' line: '+l+'</div>';}catch(e){}};

var C={bg:"#000",surface:"#141416",white:"#FFF",text2:"rgba(255,255,255,0.35)",text3:"rgba(255,255,255,0.2)",lime:"#a3e635",limeSoft:"rgba(163,230,53,0.08)",limeBorder:"rgba(163,230,53,0.25)",red:"#FF453A",redSoft:"rgba(255,69,58,0.12)",orange:"#f97316",orangeSoft:"rgba(249,115,22,0.1)",blue:"#3b82f6",blueSoft:"rgba(59,130,246,0.1)",border:"rgba(255,255,255,0.06)"};

function getCode(){try{return localStorage.getItem('qmr_code')||'';}catch(e){return '';}}
function saveCode(c){try{localStorage.setItem('qmr_code',c);}catch(e){}}
function clearCode(){try{localStorage.removeItem('qmr_code');}catch(e){}}
function getDeviceId(){try{var d=localStorage.getItem('qmr_did');if(!d){d='d_'+Date.now().toString(36)+Math.random().toString(36).slice(2,8);localStorage.setItem('qmr_did',d);}return d;}catch(e){return 'unknown';}}
function esc(t){return String(t||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;');}
function withCode(u){if(!u)return'';var c=getCode();if(!c)return u;return u+(u.indexOf('?')>-1?'&':'?')+'code='+encodeURIComponent(c)+'&device='+encodeURIComponent(getDeviceId());}
function fmt(v){if(v==null||v===undefined)return'-';var n=parseFloat(v);if(isNaN(n))return v;return n.toFixed(5).replace(/0+$/,'').replace(/\.$/,'');}
function timeAgo(t){if(!t)return'';var n=Date.now(),d=new Date(t).getTime();if(isNaN(d))return'';var diff=n-d;if(diff<0)return'just now';var s=Math.floor(diff/1e3),m=Math.floor(s/60),h=Math.floor(m/60),d2=Math.floor(h/24);if(d2>0)return d2+'d ago';if(h>0)return h+'h ago';if(m>0)return m+'m ago';return s+'s ago';}
function greeting(){var h=new Date().getHours();if(h<5)return'Late night';if(h<12)return'Good morning';if(h<18)return'Good afternoon';return'Good evening';}
function emptyState(msg){return'<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;padding:60px 20px;text-align:center"><div style="font-size:28px;margin-bottom:12px;opacity:0.15">\u25CB</div><div style="font-size:13px;color:'+C.text2+';line-height:1.5;max-width:260px">'+msg+'</div></div>';}
function showToast(msg){var d=document.createElement('div');d.textContent=msg;d.style.cssText='position:fixed;bottom:100px;left:50%;transform:translateX(-50%);background:'+C.surface+';border:0.5px solid '+C.border+';color:#fff;padding:10px 20px;border-radius:99px;font-size:12px;font-weight:600;z-index:9999;animation:fadeUp 0.2s ease';document.body.appendChild(d);setTimeout(function(){d.style.opacity='0';d.style.transition='opacity 0.3s';setTimeout(function(){d.remove();},300);},2000);}

function icon(path,color,size){return '<svg width="'+(size||18)+'" height="'+(size||18)+'" viewBox="0 0 24 24" fill="none" stroke="'+color+'" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">'+path+'</svg>';}
var I={dash:'<rect x="4" y="4" width="7" height="7" rx="1.5"/><rect x="13" y="4" width="7" height="7" rx="1.5"/><rect x="4" y="13" width="7" height="7" rx="1.5"/><rect x="13" y="13" width="7" height="7" rx="1.5"/>',journal:'<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/><path d="M8 7h8M8 11h6"/>',pulse:'<polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>',intel:'<circle cx="12" cy="12" r="2"/><path d="M16.24 7.76a6 6 0 0 1 0 8.49M7.76 16.24a6 6 0 0 1 0-8.49M19.07 4.93a10 10 0 0 1 0 14.14M4.93 19.07a10 10 0 0 1 0-14.14"/>',gear:'<circle cx="12" cy="12" r="3"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>'};

var lastSignalIds=[],lastScalpIds=[];
var state={
  tab:'dash',selected:null,signals:[],active:[],confluence:[],stats:null,myStats:null,journal:[],
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
    if(lastScalpIds.length&&ss.length>lastScalpIds.length&&!bg){for(var si=0;si<ss.length;si++){if(lastScalpIds.indexOf(ss[si].id)===-1){showToast('\u26A1 Scalp '+(ss[si].type==='BULLISH'?'\uD83D\uDCC8 ':'\uD83D\uDCC9 ')+(ss[si].name||ss[si].pair)+' \u00b7 score '+ss[si].score+'/5');break;}}}
    lastScalpIds=ss.map(function(s){return s.id;});state.scalpSignals=ss;render();
  }).catch(function(){});
  fetch(withCode('/api/scalp/active')).then(function(r){return r.json().catch(function(){return{};});}).then(function(d){state.scalpActive=d.trades||[];render();}).catch(function(){});
  fetch(withCode('/api/scalp/stats')).then(function(r){return r.json().catch(function(){return{};});}).then(function(d){state.scalpStats=d;render();}).catch(function(){});
  fetch(withCode('/api/scalp/pulse')).then(function(r){return r.json().catch(function(){return{};});}).then(function(d){state.scalpPulse=d.pairs||[];render();}).catch(function(){});
  state.loading=false;
}

function miniChart(entries){
  if(!entries||entries.length<2)return '';
  var sorted=entries.slice().sort(function(a,b){return(a.createdAt||a.time||'').localeCompare(b.createdAt||b.time||'');});
  var cumR=0,pts=[];
  for(var i=0;i<sorted.length;i++){cumR+=(sorted[i].rMultiple||sorted[i].r||0);pts.push(cumR);}
  var mn=Math.min(0,Math.min.apply(null,pts)),mx=Math.max(0,Math.max.apply(null,pts)),rng=mx-mn||1,w=340,h=50;
  function y(v){return h-6-((v-mn)/rng)*(h-16);}
  function x(i){return(i/(pts.length-1))*(w-10)+5;}
  var d='';for(var i=0;i<pts.length;i++)d+=(i===0?'M':'L')+x(i).toFixed(1)+','+y(pts[i]).toFixed(1);
  var lv=pts[pts.length-1],col=lv>=0?C.lime:C.red;
  return '<div style="height:50px;margin:8px 0 4px">'+
    '<svg viewBox="0 0 '+w+' 50" preserveAspectRatio="none" style="width:100%;height:100%;display:block">'+
    '<defs><linearGradient id="eqg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="'+col+'" stop-opacity="0.2"/><stop offset="100%" stop-color="'+col+'" stop-opacity="0"/></linearGradient></defs>'+
    '<path d="'+d+'" fill="url(#eqg)" opacity="0.3"/>'+
    '<path d="'+d+'" fill="none" stroke="'+col+'" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>'+
    '<circle cx="'+x(pts.length-1).toFixed(1)+'" cy="'+y(lv).toFixed(1)+'" r="3" fill="'+col+'"/></svg></div>';
}

function calcPos(s){
  var e=parseFloat(document.getElementById('pc-entry')?.value)||0,sl=parseFloat(document.getElementById('pc-sl')?.value)||0;
  var b=parseFloat(document.getElementById('pc-bal')?.value)||0,rp=parseFloat(document.getElementById('pc-rp')?.value)||0,t=parseFloat(document.getElementById('pc-tp')?.value)||0;
  if(!b||!rp||!e||!sl||sl===e){var el=document.getElementById('pc-r');if(el){el.style.display='block';el.innerHTML='<div style="color:'+C.red+';font-size:11px;text-align:center">Fill Balance, Risk %, Entry, SL</div>';}return;}
  var riskAmt=b*rp/100,riskPU=Math.abs(e-sl),units=riskAmt/riskPU,lots=units/100000;
  var el2=document.getElementById('pc-r');if(!el2)return;
  el2.style.display='block';
  el2.innerHTML='<div style="background:'+C.limeSoft+';border:0.5px solid '+C.limeBorder+';border-radius:10px;padding:12px;display:grid;grid-template-columns:1fr 1fr;gap:10px;font-size:12px">'+
    '<div><div style="color:'+C.text2+';font-size:9px">Risk</div><div style="font-weight:700;color:#FFF">$'+riskAmt.toFixed(2)+'</div></div>'+
    '<div><div style="color:'+C.text2+';font-size:9px">Size</div><div style="font-weight:700;color:#FFF">'+(units<1000?units.toFixed(2)+' u':(units/1000).toFixed(2)+'K')+'</div></div>'+
    '<div><div style="color:'+C.text2+';font-size:9px">Lots</div><div style="font-weight:700;color:#FFF">'+lots.toFixed(2)+'</div></div>'+
    '<div><div style="color:'+C.text2+';font-size:9px">R:R</div><div style="font-weight:700;color:#FFF">'+(t&&t!==e?Math.abs(t-e)/riskPU:'---')+'</div></div></div>';
}

function overviewScreen(){
  var st=state.stats||{},ws=state.weeklyStats||{},m=state.myStats||state.stats||{};
  var heroStat=function(v,u,c2){return'<div style="flex:1"><div style="font-size:20px;font-weight:800;letter-spacing:-0.02em;color:'+c2+'">'+v+'<span style="font-size:12px;font-weight:600;margin-left:1px">'+u+'</span></div><div style="font-size:8px;color:rgba(255,255,255,0.25);font-weight:500;text-transform:uppercase;letter-spacing:0.04em;margin-top:2px">'+(u==='R'?'Week':u==='%'?'WR':'Active')+'</div></div>';};
  var wr=st.winRate||0,tr=st.totalR||0;
  var hero= '<div class="hero">'+
    '<div class="glow"></div><div class="glow-2"></div>'+
    '<div style="font-size:11px;color:rgba(255,255,255,0.3);font-weight:600;letter-spacing:0.06em;text-transform:uppercase;margin-bottom:4px;position:relative;z-index:1">'+greeting()+'</div>'+
    '<div style="font-size:32px;font-weight:800;letter-spacing:-0.03em;line-height:1.05;margin-bottom:6px;position:relative;z-index:1">SLAYERS<span style="color:'+C.lime+'">.</span></div>'+
    '<div style="font-size:12px;color:rgba(255,255,255,0.3);font-weight:500;position:relative;z-index:1">'+tr+'R total \u00b7 '+wr+'% WR \u00b7 '+state.active.length+' active</div>'+
    '<div style="display:flex;gap:16px;margin-top:14px;padding-top:14px;border-top:0.5px solid rgba(255,255,255,0.06);position:relative;z-index:1">'+
    heroStat((ws.totalR>0?'+':'')+(ws.totalR||'0'),'R',C.lime)+
    heroStat(state.active.length,'',C.white)+
    heroStat((ws.winRate||wr),'%',C.lime)+
    '</div></div>';

  var mc=miniChart(state.journal);

  var mp='',confl=state.confluence||[];
  if(confl.length){
    var chips='';
    for(var ci=0;ci<Math.min(confl.length,11);ci++){
      var p=confl[ci],c=p.signalDir!=='NONE'?(p.signalDir==='BULLISH'?C.lime:C.red):p.weeklyBias==='BULLISH'?C.lime:p.weeklyBias==='BEARISH'?C.red:C.text2;
      mp+='<span class="pill-chip" style="background:'+C.surface+';border:0.5px solid '+C.border+';color:'+C.text2+'"><span style="width:5px;height:5px;border-radius:50%;background:'+c+';flex-shrink:0"></span>'+(p.name||p.id)+' <span style="font-size:8px;opacity:0.5">'+(p.signalDir!=='NONE'?'4H':'W')+'</span></span>';
    }
    mp='<div style="display:flex;align-items:center;justify-content:space-between;margin:20px 0 10px">'+
      '<span style="font-size:12px;font-weight:700;color:rgba(255,255,255,0.35);letter-spacing:0.08em;text-transform:uppercase">Market Pulse</span>'+
      '<span style="font-size:10px;color:'+C.lime+';opacity:0.6;font-weight:600">'+confl.length+' pairs</span></div>'+
      '<div class="h-scroll">'+mp+'</div>';
  }

  var actCards='',act=state.active||[];
  if(act.length){
    var trackedIds={};
    for(var j=0;j<state.signals.length;j++)if(state.signals[j].isTracked)trackedIds[state.signals[j].id]=true;
    var myAct=[];
    for(var j=0;j<act.length;j++)if(trackedIds[act[j].sigId])myAct.push(act[j]);
    for(var j=0;j<myAct.length;j++){
      var t=myAct[j],isB=t.type==='BULLISH';var col=isB?C.lime:C.red;
      var pct=t.tp1Fired?75:t.beFired?99:t.slFired?100:25;
      actCards+='<div class="card" style="flex-shrink:0;width:230px;padding:14px;cursor:pointer;margin-bottom:0" onclick="openDetail(\''+t.sigId+'\')">'+
        '<div style="display:flex;align-items:center;gap:6px;margin-bottom:8px"><span style="font-size:14px;font-weight:800;color:#FFF">'+t.instName+'</span>'+
        '<span style="font-size:8px;font-weight:700;padding:2px 6px;border-radius:3px;background:'+(isB?C.limeSoft:C.redSoft)+';color:'+col+'">'+(isB?'BUY':'SELL')+'</span></div>'+
        '<div style="display:flex;gap:12px;font-size:10px;color:rgba(255,255,255,0.3);margin-bottom:6px">'+
        '<div><div style="font-size:8px;font-weight:600">Entry</div><div style="font-size:12px;font-weight:700;color:#FFF">'+fmt(t.entryPrice||t.entry)+'</div></div>'+
        '<div><div style="font-size:8px;font-weight:600">SL</div><div style="font-size:12px;font-weight:700;color:'+col+'">'+fmt(t.sl)+'</div></div>'+
        '<div><div style="font-size:8px;font-weight:600">'+(t.tp1Fired?'TP1':'Goal')+'</div><div style="font-size:12px;font-weight:700;color:'+C.lime+'">'+fmt(t.tp1||t.tp2||'')+'</div></div></div>'+
        '<div style="height:2px;border-radius:1px;background:rgba(255,255,255,0.06);margin:6px 0;overflow:hidden"><div style="height:100%;background:'+col+';width:'+pct+'%"></div></div>'+
        '<div style="display:flex;justify-content:space-between;font-size:8px;color:rgba(255,255,255,0.3)"><span>'+timeAgo(t.entryTime)+'</span><span style="color:'+col+';font-weight:600">'+(t.tp1Fired?'TP1 \u2713':t.beFired?'BE':t.slFired?'Stopped':'Active')+'</span></div></div>';
    }
    if(myAct.length)actCards='<div style="display:flex;align-items:center;justify-content:space-between;margin:20px 0 10px">'+
      '<span style="font-size:12px;font-weight:700;color:rgba(255,255,255,0.35);letter-spacing:0.08em;text-transform:uppercase">Active Trades</span>'+
      '<span style="font-size:10px;color:'+C.lime+';opacity:0.6;font-weight:600">'+myAct.length+' active</span></div>'+
      '<div class="h-scroll">'+actCards+'</div>';
  }

  var filterIcon=state.showFilters?'\u25B2':'<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="'+C.text2+'" stroke-width="2"><line x1="4" y1="6" x2="20" y2="6"/><line x1="8" y1="12" x2="20" y2="12"/><line x1="12" y1="18" x2="20" y2="18"/></svg>';
  var sigHeader='<div style="display:flex;align-items:center;justify-content:space-between;margin:20px 0 10px">'+
    '<span style="font-size:12px;font-weight:700;color:rgba(255,255,255,0.35);letter-spacing:0.08em;text-transform:uppercase">Recent Signals</span>'+
    '<span onclick="state.showFilters=!state.showFilters;render()" style="font-size:10px;color:'+C.lime+';opacity:0.6;font-weight:600;cursor:pointer">'+filterIcon+' Filter</span></div>';

  var filterHtml='';
  if(state.showFilters){
    filterHtml='<div class="card" style="padding:12px;margin-bottom:10px;animation-delay:0s">'+
      '<div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-bottom:6px">'+
      '<input placeholder="Pair" value="'+esc(state.filter.pair)+'" oninput="state.filter.pair=this.value.toUpperCase();fetchAll(true)" style="background:rgba(255,255,255,0.04);border:0.5px solid '+C.border+';border-radius:6px;padding:7px 10px;color:#FFF;font-size:11px;outline:none;font-family:inherit">'+
      '<select onchange="state.filter.tf=this.value;fetchAll(true)" style="background:rgba(255,255,255,0.04);border:0.5px solid '+C.border+';border-radius:6px;padding:7px 10px;color:#FFF;font-size:11px;outline:none;font-family:inherit">'+
      '<option value="">TF</option><option value="1H"'+(state.filter.tf==='1H'?' selected':'')+'>1H</option><option value="4H"'+(state.filter.tf==='4H'?' selected':'')+'>4H</option></select>'+
      '<select onchange="state.filter.dir=this.value;fetchAll(true)" style="background:rgba(255,255,255,0.04);border:0.5px solid '+C.border+';border-radius:6px;padding:7px 10px;color:#FFF;font-size:11px;outline:none;font-family:inherit">'+
      '<option value="">Dir</option><option value="BULLISH"'+(state.filter.dir==='BULLISH'?' selected':'')+'>Buy</option><option value="BEARISH"'+(state.filter.dir==='BEARISH'?' selected':'')+'>Sell</option></select>'+
      '<select onchange="state.filter.minScore=parseInt(this.value);fetchAll(true)" style="background:rgba(255,255,255,0.04);border:0.5px solid '+C.border+';border-radius:6px;padding:7px 10px;color:#FFF;font-size:11px;outline:none;font-family:inherit">'+
      '<option value="0">Score</option><option value="1"'+(state.filter.minScore===1?' selected':'')+'>1+</option><option value="2"'+(state.filter.minScore===2?' selected':'')+'>2+</option><option value="3"'+(state.filter.minScore===3?' selected':'')+'>3+</option></select></div>'+
      '<div style="display:flex;gap:6px"><input type="date" value="'+state.filter.dateFrom+'" onchange="state.filter.dateFrom=this.value;fetchAll(true)" style="flex:1;background:rgba(255,255,255,0.04);border:0.5px solid '+C.border+';border-radius:6px;padding:6px;color:'+C.text2+';font-size:10px;outline:none;font-family:inherit">'+
      '<input type="date" value="'+state.filter.dateTo+'" onchange="state.filter.dateTo=this.value;fetchAll(true)" style="flex:1;background:rgba(255,255,255,0.04);border:0.5px solid '+C.border+';border-radius:6px;padding:6px;color:'+C.text2+';font-size:10px;outline:none;font-family:inherit"></div>'+
      '<select onchange="state.filter.sort=this.value;fetchAll(true)" style="width:100%;margin-top:6px;background:rgba(255,255,255,0.04);border:0.5px solid '+C.border+';border-radius:6px;padding:6px;color:#FFF;font-size:11px;outline:none;font-family:inherit">'+
      '<option value="time"'+(state.filter.sort==='time'?' selected':'')+'>Sort: Time</option>'+
      '<option value="score"'+(state.filter.sort==='score'?' selected':'')+'>Sort: Score</option></select></div>';
  }

  var sigsHtml='',sigCount=0,actSigIds={};
  for(var i=0;i<state.active.length;i++)actSigIds[state.active[i].sigId]=true;
  for(var i=0;i<state.signals.length;i++){
    var s=state.signals[i];
    if(s.outcome||(s.isTracked&&!actSigIds[s.id]))continue;
    sigCount++;
    var isB=s.type==='BULLISH',isE=s.tier==='ELITE',isD=s.dualEntry;
    var tc=isE?C.white:'rgba(255,255,255,0.5)';
    var col=isB?C.lime:C.red,bg=isB?C.limeSoft:C.redSoft;
    var isN=s.time&&(Date.now()-new Date(s.time).getTime())<300000;
    var criteriaChips=(s.criteria||[]).map(function(c){return '<span style="font-size:8px;padding:3px 6px;border-radius:3px;background:rgba(163,230,53,0.08);color:'+C.lime+';font-weight:600">'+c+'</span>';}).join('');
    var isT=s.isTracked;
    sigsHtml+='<div class="card'+(isN?' flash-row':'')+'" style="cursor:pointer;border-left:2.5px solid '+(isD?C.orange:tc)+'" onclick="openDetail(&#39;'+s.id+'&#39;)">'+
      '<div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:8px">'+
      '<div style="display:flex;align-items:center;gap:6px"><span style="font-size:14px;font-weight:800;color:#FFF">'+s.pair+'</span>'+
      '<span style="font-size:8px;font-weight:700;padding:2px 8px;border-radius:3px;background:'+(isE?'rgba(255,255,255,0.1)':'rgba(255,255,255,0.05)')+';color:'+tc+'">'+s.tier+'</span>'+
      (s.tf?'<span style="font-size:9px;color:rgba(255,255,255,0.25);font-family:monospace">'+s.tf+'</span>':'')+'</div>'+
      '<div style="text-align:right"><span style="font-size:8px;font-weight:700;padding:2px 6px;border-radius:3px;background:'+bg+';color:'+col+'">'+(isB?'BUY':'SELL')+'</span>'+
      '<div style="font-size:9px;color:rgba(255,255,255,0.25);margin-top:2px">'+timeAgo(s.time)+'</div></div></div>'+
      (isD&&!s.consEntry&&!s.aggResolved?'<div style="font-size:9px;color:'+C.orange+';background:'+C.orangeSoft+';border:0.5px solid '+C.orange+'44;border-radius:6px;padding:4px 8px;font-weight:600;margin-bottom:6px">\u23F3 Conservative pending at '+fmt(s.qmLevel)+'</div>':'')+
      (isD&&s.consEntry?'<div style="font-size:9px;color:'+C.lime+';background:'+C.limeSoft+';border:0.5px solid '+C.limeBorder+';border-radius:6px;padding:4px 8px;font-weight:600;margin-bottom:6px">\u2705 Dual entry complete</div>':'')+
      '<div style="display:flex;gap:10px;padding:8px 0;border-top:0.5px solid rgba(255,255,255,0.04);border-bottom:0.5px solid rgba(255,255,255,0.04);margin-bottom:8px;font-size:10px;color:rgba(255,255,255,0.4)">'+
      (isD?'<span>Agg <b style="color:#FFF;font-weight:700">'+fmt(s.aggEntry)+'</b></span><span>SL <b style="color:'+C.red+';font-weight:700">'+fmt(s.aggSl)+'</b></span>'+
        (s.aggTp1?'<span>TP1 <b style="color:'+C.lime+';font-weight:700">'+fmt(s.aggTp1)+'</b></span>':'')
      :'<span>Entry <b style="color:#FFF;font-weight:700">'+fmt(s.entry)+'</b></span><span>SL <b style="color:'+C.red+';font-weight:700">'+fmt(s.sl)+'</b></span>'+
        (s.tp1?'<span>TP1 <b style="color:'+C.lime+';font-weight:700">'+fmt(s.tp1)+'</b></span>':'')+
        (s.tp2?'<span>TP2 <b style="color:'+C.lime+';font-weight:700">'+fmt(s.tp2)+'</b></span>':''))+
      '</div>'+criteriaChips+
      (s.dailyPOI?'<div style="font-size:10px;color:'+C.lime+';font-weight:600;margin-top:4px">\uD83C\uDFDB '+s.dailyPOI+'</div>':'')+
      (s.rsiDivergence?'<div style="font-size:10px;color:'+C.orange+';font-weight:600;margin-top:2px">\uD83D\uDD25 '+s.rsiDivergence+'</div>':'')+
      '<div style="display:flex;gap:6px;padding-top:8px;border-top:0.5px solid rgba(255,255,255,0.04);margin-top:8px">'+
      '<div onclick="event.stopPropagation();toggleTrack(&#39;'+s.id+'&#39;,'+!!isT+')" style="flex:1;text-align:center;padding:7px 0;border-radius:8px;background:'+C.lime+';color:#000;font-size:10px;font-weight:700;cursor:pointer">'+(isT?'Tracking':'Track')+'</div>'+
      '<div onclick="event.stopPropagation();openDetail(&#39;'+s.id+'&#39;)" style="flex:1;text-align:center;padding:7px 0;border-radius:8px;background:rgba(255,255,255,0.06);color:rgba(255,255,255,0.5);font-size:10px;font-weight:700;cursor:pointer">Chart</div>'+
      '<div onclick="event.stopPropagation();copyTrade(&#39;'+s.id+'&#39;)" style="flex:1;text-align:center;padding:7px 0;border-radius:8px;background:rgba(255,255,255,0.06);color:rgba(255,255,255,0.5);font-size:10px;font-weight:700;cursor:pointer">Copy</div></div></div>';
  }
  if(!sigCount&&!state.signals.length)sigsHtml=emptyState('Waiting for market data...');

  return '<div style="padding:calc(30px + env(safe-area-inset-top)) 16px 0;background:'+C.bg+';min-height:100dvh">'+
    hero+mc+mp+actCards+sigHeader+filterHtml+sigsHtml+navBar()+'</div>';
}

function navBar(){
  var tabs=['dash','journal','scalp','intel','settings'];
  var labels={dash:'Dashboard',journal:'Journal',scalp:'Scalp',intel:'Intel',settings:'Settings'};
  var icons={dash:I.dash,journal:I.journal,scalp:I.pulse,intel:I.intel,settings:I.gear};
  var btns='';
  for(var i=0;i<tabs.length;i++){
    var t=tabs[i],a=state.tab===t;
    var c=a?'#000':'rgba(255,255,255,0.35)';
    btns+='<button class="nav-btn" onclick="setTab(\''+t+'\')" style="background:'+(a?C.lime:'transparent')+'">'+
      icon(icons[t],c,16)+
      '<span style="font-size:7px;font-weight:700;color:'+c+';letter-spacing:0.02em">'+labels[t]+'</span></button>';
  }
  return '<div style="padding:8px 16px calc(8px + env(safe-area-inset-bottom));background:'+C.bg+'">'+
    '<div style="background:'+C.surface+';border-radius:99px;padding:4px;display:flex;border:0.5px solid '+C.border+'">'+btns+'</div></div>';
}

function scalpScreen(){
  var ss=state.scalpStats||{};
  var statsHtml='<div style="display:flex;gap:8px;margin-bottom:14px;margin-top:8px">'+
    '<div class="card" style="flex:1;text-align:center;padding:12px 8px;animation-delay:0s"><div style="font-size:9px;color:'+C.text2+'">WR</div><div style="font-size:18px;font-weight:800;color:'+C.lime+';margin-top:4px">'+(ss.winRate||0)+'%</div></div>'+
    '<div class="card" style="flex:1;text-align:center;padding:12px 8px;animation-delay:0s"><div style="font-size:9px;color:'+C.text2+'">Total R</div><div style="font-size:18px;font-weight:800;color:'+(ss.totalR>=0?C.lime:C.red)+';margin-top:4px">'+(ss.totalR>0?'+':'')+(ss.totalR||0)+'</div></div>'+
    '<div class="card" style="flex:1;text-align:center;padding:12px 8px;animation-delay:0s"><div style="font-size:9px;color:'+C.text2+'">Active</div><div style="font-size:18px;font-weight:800;color:'+C.white+';margin-top:4px">'+state.scalpActive.length+'</div></div></div>';
  var sigs=(state.scalpSignals||[]).map(function(s,i){
    var isB=s.type==='BULLISH'||s.direction==='LONG';var col=isB?C.lime:C.red;var bg=isB?C.limeSoft:C.redSoft;
    return '<div class="card" style="border-left:2.5px solid '+col+'" onclick="openScalpDetail(\''+s.id+'\')">'+
      '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">'+
      '<div style="display:flex;align-items:center;gap:6px"><span style="font-weight:800;font-size:14px;color:#FFF">'+(s.name||s.pair)+'</span>'+
      '<span style="font-size:8px;font-weight:700;padding:2px 6px;border-radius:3px;background:'+bg+';color:'+col+'">'+(isB?'BUY':'SELL')+'</span></div>'+
      '<span style="font-size:9px;color:'+C.text2+'">score '+s.score+'</span></div>'+
      '<div style="display:flex;gap:6px;font-size:10px;color:rgba(255,255,255,0.4)">'+
      '<span>Entry: <b style="color:#FFF">'+fmt(s.entry)+'</b></span><span>SL: <b style="color:'+C.red+'">'+fmt(s.sl)+'</b></span><span>TP: <b style="color:'+C.lime+'">'+fmt(s.takeProfit||s.tp2)+'</b></span></div>'+
      (s.fib?'<div style="font-size:9px;color:'+C.lime+';margin-top:4px">Fib: '+s.fib+' \u00b7 Vol: '+(s.volRatio||'')+'x</div>':'')+
      '<div style="display:flex;justify-content:space-between;margin-top:6px;padding-top:6px;border-top:0.5px solid rgba(255,255,255,0.04)">'+
      '<span style="font-size:8px;color:'+C.text3+'">'+timeAgo(s.time)+'</span>'+
      '<button onclick="event.stopPropagation();toggleTrack(\''+s.id+'\','+!!(s.isTracked)+')" style="background:'+(s.isTracked?C.limeSoft:C.surface)+';border:0.5px solid '+(s.isTracked?C.lime:C.border)+';border-radius:99px;padding:3px 10px;font-size:8px;color:'+(s.isTracked?C.lime:C.text2)+';cursor:pointer;font-family:inherit;font-weight:600">'+(s.isTracked?'Tracking':'Track')+'</button></div></div>';
  }).join('');
  return '<div style="padding:calc(30px + env(safe-area-inset-top)) 16px 0;background:'+C.bg+';min-height:100dvh">'+
    '<div style="font-size:22px;font-weight:800;color:#FFF;margin-bottom:4px">Scalp</div>'+
    '<div style="font-size:11px;color:'+C.text2+';margin-bottom:12px">Session momentum + FVG breakout</div>'+
    statsHtml+(sigs||emptyState('No scalp signals yet'))+navBar()+'</div>';
}

function journalScreen(){
  var entries=state.journal||[];
  var wins=entries.filter(function(e){return e.outcome==='WIN'||e.outcome==='TP1'||e.outcome==='TP2'||e.outcome==='TP';});
  var losses=entries.filter(function(e){return e.outcome==='SL'||e.outcome==='LOSS';});
  var bes=entries.filter(function(e){return e.outcome==='BE';});
  var wr=(wins.length+losses.length)?Math.round((wins.length/(wins.length+losses.length))*100):0;
  var sorted=entries.slice().sort(function(a,b){return(b.createdAt||b.time||'').localeCompare(a.createdAt||a.time||'');});
  var rows=sorted.map(function(e){
    var o=e.outcome||'',rv=e.rMultiple||e.r||0;
    var iw=o==='WIN'||o==='TP1'||o==='TP2'||o==='TP';
    var col=iw?C.lime:o==='SL'||o==='LOSS'?C.red:o==='BE'?C.text2:'rgba(255,255,255,0.3)';
    return '<div class="card" style="padding:10px 14px;cursor:pointer;animation-delay:0s">'+
      '<div style="display:flex;justify-content:space-between;align-items:center">'+
      '<span style="font-weight:700;font-size:13px;color:#FFF">'+esc(e.pair||'')+'</span>'+
      '<span style="font-weight:800;font-size:13px;color:'+col+'">'+(rv>0?'+':'')+rv+'R</span></div>'+
      '<div style="display:flex;gap:6px;margin-top:4px;font-size:9px;color:'+C.text2+'">'+
      '<span>'+(e.direction||'')+'</span><span>'+(e.tf||e.timeframe||'')+'</span><span>'+timeAgo(e.createdAt||e.time)+'</span></div>'+
      (e.notes?'<div style="font-size:10px;color:'+C.text2+';margin-top:4px;line-height:1.4">'+esc(e.notes).slice(0,80)+'</div>':'')+'</div>';
  }).join('');
  return '<div style="padding:calc(30px + env(safe-area-inset-top)) 16px 0;background:'+C.bg+';min-height:100dvh">'+
    '<div style="display:flex;align-items:center;gap:10px;margin-bottom:4px">'+
    '<span style="font-size:22px;font-weight:800;color:#FFF">Journal</span>'+
    '<span style="font-size:10px;color:'+C.lime+';font-weight:600">'+wins.length+'W</span>'+
    '<span style="font-size:10px;color:'+C.red+';font-weight:600">'+losses.length+'L</span>'+
    '<span style="font-size:10px;color:'+C.text2+';font-weight:600">'+bes.length+'BE</span>'+
    (wins.length+losses.length?'<span style="font-size:10px;font-weight:700;color:#FFF">'+wr+'%</span>':'')+
    '</div>'+
    '<div style="font-size:11px;color:'+C.text2+';margin-bottom:12px">'+entries.length+' total entries</div>'+
    (entries.length?rows:emptyState('No journal entries yet'))+navBar()+'</div>';
}

function intelScreen(){
  var arts=state.articles||state.news||[];
  var cats={};
  for(var i=0;i<arts.length;i++){var c=arts[i].category||'General';if(!cats[c])cats[c]=0;cats[c]++;}
  var catList=Object.keys(cats);
  var catChips=catList.map(function(c){
    var a=(state.newsCat||'All')===c;
    return '<span onclick="window.newsCat=state.newsCat===c?null:c;render()" style="display:inline-block;font-size:9px;padding:4px 10px;border-radius:99px;background:'+(a?C.limeSoft:C.surface)+';color:'+(a?C.lime:C.text2)+';cursor:pointer;font-weight:'+(a?'700':'400')+';border:0.5px solid '+(a?C.limeBorder:C.border)+'">'+c+' '+cats[c]+'</span>';
  }).join('');
  var filtered=state.newsCat&&state.newsCat!=='All'?arts.filter(function(a){return a.category===state.newsCat;}):arts;
  var items=filtered.slice(0,30).map(function(a){
    var img=a.imageUrl||a.image||'';
    var imgHtml=img?'<img src="'+img+'" style="width:100%;height:100%;object-fit:cover;position:absolute;top:0;left:0">':'<div style="display:flex;align-items:center;justify-content:center;height:100%;color:'+C.text3+';font-size:20px;font-weight:800">'+esc((a.title||'N')[0])+'</div>';
    return '<a href="'+esc(a.link||a.url||'')+'" target="_blank" style="text-decoration:none;display:block">'+
      '<div class="card" style="padding:0;overflow:hidden">'+
      '<div style="height:140px;background:'+C.surface+';position:relative;overflow:hidden">'+imgHtml+'</div>'+
      '<div style="padding:12px"><div style="font-size:12px;font-weight:700;color:#FFF;line-height:1.4;margin-bottom:4px">'+esc(a.title)+'</div>'+
      (a.summary?'<div style="font-size:10px;color:'+C.text2+';line-height:1.4">'+esc(a.summary).slice(0,120)+'</div>':'')+
      '<div style="display:flex;gap:6px;margin-top:6px">'+
      (a.source?'<span style="font-size:8px;color:'+C.text3+';background:'+C.surface+';padding:1px 6px;border-radius:4px">'+esc(a.source)+'</span>':'')+
      '<span style="font-size:8px;color:'+C.text3+';margin-left:auto">'+timeAgo(a.time||a.publishedAt||a.createdAt)+'</span></div></div></div></a>';
  }).join('');
  return '<div style="padding:calc(30px + env(safe-area-inset-top)) 16px 0;background:'+C.bg+';min-height:100dvh">'+
    '<div style="font-size:22px;font-weight:800;color:#FFF;margin-bottom:4px">Intel</div>'+
    '<div style="font-size:11px;color:'+C.text2+';margin-bottom:10px">Market news & analysis</div>'+
    (catChips?'<div style="display:flex;gap:6px;overflow-x:auto;padding-bottom:8px;margin-bottom:4px;scrollbar-width:none">'+catChips+'</div>':'')+
    (items||emptyState('No news available'))+navBar()+'</div>';
}

function settingsScreen(){
  var prefs=state.notifPrefs||{};
  function tp(key,label,desc){
    var val=prefs[key];
    return '<div style="display:flex;align-items:center;gap:12px;padding:12px 14px;border-bottom:0.5px solid rgba(255,255,255,0.04)">'+
      '<div style="flex:1"><div style="font-size:13px;font-weight:600;color:#FFF">'+label+'</div>'+(desc?'<div style="font-size:9px;color:'+C.text2+'">'+desc+'</div>':'')+'</div>'+
      '<button onclick="toggleNotifPref(\''+key+'\')" style="width:44px;height:26px;border-radius:99px;background:'+(val?C.lime:'rgba(255,255,255,0.1)')+';border:none;position:relative;cursor:pointer;flex-shrink:0">'+
      '<div style="width:20px;height:20px;border-radius:99px;background:#FFF;position:absolute;top:2px;left:'+(val?'22px':'2px')+';transition:left 0.2s"></div></button></div>';
  }
  var pushBtns='';
  if(window.pushStatus==='subscribed')pushBtns='<div style="font-size:11px;color:'+C.lime+';text-align:center;padding:10px;font-weight:600">\u2713 Push active</div>';
  else if(window.pushStatus==='denied')pushBtns='<div style="font-size:11px;color:'+C.red+';text-align:center;padding:10px">Push blocked</div>';
  else if(typeof Notification!=='undefined'&&Notification.permission!=='denied')pushBtns='<button onclick="enablePush()" style="width:100%;background:'+C.lime+';border:none;border-radius:10px;padding:12px 0;color:#000;font-weight:700;font-size:13px;cursor:pointer;margin-top:8px;font-family:inherit">Enable Push</button>';
  return '<div style="padding:calc(30px + env(safe-area-inset-top)) 16px 0;background:'+C.bg+';min-height:100dvh">'+
    '<div style="font-size:22px;font-weight:800;color:#FFF;margin-bottom:4px">Settings</div>'+
    '<div style="font-size:11px;color:'+C.text2+';margin-bottom:16px">v10</div>'+
    '<div style="margin-bottom:16px"><div style="font-size:11px;font-weight:700;color:'+C.text2+';text-transform:uppercase;margin-bottom:6px;padding:0 4px;letter-spacing:0.06em">Notifications</div>'+
    '<div style="background:#141416;border-radius:14px;overflow:hidden">'+
    tp('tradeAlerts','Trade Alerts','New QMR signals')+
    tp('scalpAlerts','Scalp Alerts','New scalp signals')+
    tp('newsAlerts','News Alerts','Daily news digest')+'</div>'+pushBtns+'</div>'+
    '<div style="margin-bottom:16px"><div style="font-size:11px;font-weight:700;color:'+C.text2+';text-transform:uppercase;margin-bottom:6px;padding:0 4px;letter-spacing:0.06em">Account</div>'+
    '<div style="background:#141416;border-radius:14px;overflow:hidden">'+
    '<button onclick="logout()" style="width:100%;background:transparent;border:none;padding:14px 16px;color:'+C.red+';font-size:13px;font-weight:600;cursor:pointer;text-align:left;font-family:inherit">Disconnect / Logout</button></div></div>'+
    '<div style="text-align:center;padding:20px;color:'+C.text3+';font-size:9px">Made by roz & n8s \u00b7 QMR</div>'+navBar()+'</div>';
}

function render(){
  var app=document.getElementById('app');
  if(state.selected){app.innerHTML=detailPage(state.selected);return;}
  var t=state.tab||'dash';
  if(t==='dash'){app.innerHTML=overviewScreen();}
  else if(t==='journal'){app.innerHTML=journalScreen();}
  else if(t==='scalp'){app.innerHTML=scalpScreen();}
  else if(t==='intel'){app.innerHTML=intelScreen();}
  else if(t==='settings'){app.innerHTML=settingsScreen();}
  else{app.innerHTML=overviewScreen();}
}

function detailPage(s){
  var isB=s.type==='BULLISH'||s.type==='BUY',isE=s.tier==='ELITE',isD=s.dualEntry;
  var tc=isE?C.white:'rgba(255,255,255,0.5)';
  var crit=(s.criteria||[]).map(function(c){return '<div style="display:flex;align-items:center;gap:8px;padding:6px 0"><span style="color:'+C.lime+';font-weight:700">\u2713</span><span style="font-size:13px;color:#FFF">'+c+'</span></div>';}).join('');
  var ch=isD
    ?'<div style="font-size:11px;color:'+C.orange+';font-weight:600;margin-bottom:4px">\u26A1 Aggressive Chart</div>'+(s.aggChartUrl?'<img src="'+withCode(s.aggChartUrl)+'" style="width:100%;border-radius:14px">':'<div style="height:140px;background:'+C.surface+';border-radius:14px;display:flex;align-items:center;justify-content:center;color:'+C.text2+';font-size:11px">Chart</div>')+
     '<div style="display:flex;justify-content:space-between;margin:6px 0 14px;font-size:9px;color:rgba(255,255,255,0.4)">'+
     '<span style="color:'+C.orange+'">Agg: '+fmt(s.aggEntry)+'</span><span style="color:'+C.red+'">SL: '+fmt(s.aggSl)+'</span><span style="color:'+C.lime+'">TP2: '+fmt(s.aggTp2)+'</span></div>'+
     (s.consEntry?'<div style="font-size:11px;color:#FFF;font-weight:600;margin-bottom:4px">\uD83C\uDFAF Conservative</div>'+(s.consChartUrl?'<img src="'+withCode(s.consChartUrl)+'" style="width:100%;border-radius:14px;margin-bottom:8px">':'')+
     '<div style="display:flex;justify-content:space-between;font-size:9px;color:rgba(255,255,255,0.4);margin-bottom:18px">'+
     '<span style="color:#FFF">Entry: '+fmt(s.consEntry)+'</span><span style="color:'+C.red+'">SL: '+fmt(s.consSl)+'</span><span style="color:'+C.lime+'">TP2: '+fmt(s.consTp2)+'</span></div>':'')
    :(s.chartUrl?'<img src="'+withCode(s.chartUrl)+'" style="width:100%;border-radius:14px">':'<div style="height:140px;background:'+C.surface+';border-radius:14px;display:flex;align-items:center;justify-content:center;color:'+C.text2+';font-size:11px">Chart unavailable</div>');
  return '<div style="min-height:100dvh;background:'+C.bg+';padding:calc(30px + env(safe-area-inset-top)) 16px 24px">'+
    '<div style="display:flex;align-items:center;gap:10px;margin-bottom:16px">'+
    '<button onclick="closeDetail()" style="background:'+C.surface+';border:0.5px solid '+C.border+';border-radius:99px;width:34px;height:34px;display:flex;align-items:center;justify-content:center;cursor:pointer;color:#FFF;font-size:16px">\u2190</button>'+
    '<div><div style="font-weight:800;font-size:18px;color:#FFF">'+s.pair+' \u00b7 '+s.tf+'</div>'+
    '<div style="font-size:11px;color:'+C.text2+'">'+timeAgo(s.time)+' \u00b7 '+(s.system||'QMR')+' Signal</div></div></div>'+
    '<div style="display:flex;gap:6px;margin-bottom:12px;flex-wrap:wrap">'+
    '<span style="font-size:8px;font-weight:700;padding:2px 8px;border-radius:3px;background:'+(isE?'rgba(255,255,255,0.1)':'rgba(255,255,255,0.05)')+';color:'+tc+'">'+s.tier+'</span>'+
    '<span style="font-size:8px;font-weight:700;padding:2px 6px;border-radius:3px;background:'+(isB?C.limeSoft:C.redSoft)+';color:'+(isB?C.lime:C.red)+'">'+(isB?'BUY':'SELL')+'</span></div>'+
    ch+
    '<div style="font-size:14px;font-weight:700;color:#FFF;margin:14px 0 10px">Trade Levels</div>'+
    '<div class="card" style="margin-bottom:16px">'+
    (isD&&s.aggEntry?'<div style="display:flex;justify-content:space-between;padding:8px 0"><span style="color:'+C.orange+'">\u26A1 Aggressive</span>'+fmt(s.aggEntry)+'</div>':'')+
    (isD&&s.consEntry?'<div style="display:flex;justify-content:space-between;padding:8px 0;border-top:0.5px solid rgba(255,255,255,0.04)"><span style="color:#FFF">Conservative</span>'+fmt(s.consEntry)+'</div>':'')+
    (!isD?'<div style="display:flex;justify-content:space-between;padding:8px 0"><span style="color:'+C.text2+'">'+(s.refinedEntry?'Zone':'Entry')+'</span><span style="font-weight:700;color:#FFF">'+fmt(s.entry)+'</span></div>':'')+
    (!isD&&s.refinedEntry?'<div style="display:flex;justify-content:space-between;padding:8px 0"><span style="color:'+C.lime+'">Refined</span><span style="font-weight:700;color:'+C.lime+'">'+fmt(s.refinedEntry)+'</span></div>':'')+
    '<div style="display:flex;justify-content:space-between;padding:8px 0;border-top:0.5px solid rgba(255,255,255,0.04)"><span style="color:'+C.red+'">Stop Loss</span><span style="font-weight:700;color:'+C.red+'">'+fmt(isD?s.aggSl:s.sl)+'</span></div>'+
    (isD&&s.consTp1?'<div style="display:flex;justify-content:space-between;padding:8px 0;border-top:0.5px solid rgba(255,255,255,0.04)"><span style="color:'+C.text2+'">Cons TP1</span><span style="font-weight:700;color:#FFF">'+fmt(s.consTp1)+'</span></div>':'')+
    (isD&&s.consTp2?'<div style="display:flex;justify-content:space-between;padding:8px 0;border-top:0.5px solid rgba(255,255,255,0.04)"><span style="color:'+C.text2+'">Cons TP2</span><span style="font-weight:700;color:'+C.lime+'">'+fmt(s.consTp2)+'</span></div>':'')+
    (!isD?s.tp1?'<div style="display:flex;justify-content:space-between;padding:8px 0"><span style="color:'+C.text2+'">TP1</span><span style="font-weight:700;color:#FFF">'+fmt(s.tp1)+'</span></div>':'':'')+
    (!isD?s.tp2?'<div style="display:flex;justify-content:space-between;padding:8px 0"><span style="color:'+C.text2+'">TP2</span><span style="font-weight:700;color:'+C.lime+'">'+fmt(s.tp2)+'</span></div>':'':'')+
    '</div>'+
    (isD?'<div style="font-size:13px;font-weight:700;color:#FFF;margin:12px 0 8px">Track Your Entry</div>'+
    '<button onclick="toggleTrack(\''+s.id+'-agg\','+!!s.isTrackedAgg+')" style="width:100%;background:'+(s.isTrackedAgg?C.lime:C.surface)+';border:0.5px solid '+(s.isTrackedAgg?C.lime:C.border)+';border-radius:10px;padding:12px 0;font-size:12px;font-weight:700;cursor:pointer;color:'+(s.isTrackedAgg?'#000':'rgba(255,255,255,0.6)')+';margin-bottom:8px;font-family:inherit">'+(s.isTrackedAgg?'\u2713 Tracking aggressive at '+fmt(s.aggEntry):'\u26A1 Aggressive entry at '+fmt(s.aggEntry))+'</button>'+
    (s.consEntry?'<button onclick="toggleTrack(\''+s.id+'-cons\','+!!s.isTrackedCons+')" style="width:100%;background:'+(s.isTrackedCons?C.lime:C.surface)+';border:0.5px solid '+(s.isTrackedCons?C.lime:C.border)+';border-radius:10px;padding:12px 0;font-size:12px;font-weight:700;cursor:pointer;color:'+(s.isTrackedCons?'#000':'rgba(255,255,255,0.6)')+';margin-bottom:12px;font-family:inherit">'+(s.isTrackedCons?'\u2713 Conservative at '+fmt(s.consEntry):'\uD83C\uDFAF Conservative at '+fmt(s.consEntry))+'</button>':'')
    :'<button onclick="toggleTrack(\''+s.id+'\','+!!s.isTracked+')" style="width:100%;background:'+(s.isTracked?C.lime:C.surface)+';border:0.5px solid '+(s.isTracked?C.lime:C.border)+';border-radius:10px;padding:12px 0;font-size:12px;font-weight:700;cursor:pointer;color:'+(s.isTracked?'#000':'rgba(255,255,255,0.6)')+';margin-bottom:12px;font-family:inherit">'+(s.isTracked?"\u2713 Tracking – you'll get updates":"I'm in this trade")+'</button>')+
    '<button onclick="toggleCalc()" style="width:100%;background:'+C.lime+';border:none;border-radius:10px;padding:12px 0;color:#000;font-weight:700;font-size:12px;cursor:pointer;margin-bottom:12px;font-family:inherit">'+(state.showCalc?'Close Calculator':'Calculate Position Size')+'</button>'+
    (state.showCalc?'<div style="background:'+C.surface+';border:0.5px solid '+C.border+';border-radius:14px;padding:14px;margin-bottom:16px">'+
      '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:10px">'+
      '<div><span style="color:'+C.text2+';font-size:9px">Balance ($)</span><input id="pc-bal" type="number" value="1000" style="width:100%;background:rgba(255,255,255,0.05);border:0.5px solid '+C.border+';border-radius:6px;padding:8px 10px;color:#FFF;font-size:12px;box-sizing:border-box;outline:none;font-family:inherit"></div>'+
      '<div><span style="color:'+C.text2+';font-size:9px">Risk %</span><input id="pc-rp" type="number" value="2" style="width:100%;background:rgba(255,255,255,0.05);border:0.5px solid '+C.border+';border-radius:6px;padding:8px 10px;color:#FFF;font-size:12px;box-sizing:border-box;outline:none;font-family:inherit"></div>'+
      '<div><span style="color:'+C.text2+';font-size:9px">Entry</span><input id="pc-entry" type="number" step="any" value="'+fmt(s.entry||s.aggEntry)+'" style="width:100%;background:rgba(255,255,255,0.05);border:0.5px solid '+C.border+';border-radius:6px;padding:8px 10px;color:#FFF;font-size:12px;box-sizing:border-box;outline:none;font-family:inherit"></div>'+
      '<div><span style="color:'+C.text2+';font-size:9px">Stop Loss</span><input id="pc-sl" type="number" step="any" value="'+fmt(s.sl||s.aggSl)+'" style="width:100%;background:rgba(255,255,255,0.05);border:0.5px solid '+C.border+';border-radius:6px;padding:8px 10px;color:#FFF;font-size:12px;box-sizing:border-box;outline:none;font-family:inherit"></div>'+
      '<div><span style="color:'+C.text2+';font-size:9px">TP (opt)</span><input id="pc-tp" type="number" step="any" value="'+fmt(s.tp1||s.aggTp1||'')+'" style="width:100%;background:rgba(255,255,255,0.05);border:0.5px solid '+C.border+';border-radius:6px;padding:8px 10px;color:#FFF;font-size:12px;box-sizing:border-box;outline:none;font-family:inherit"></div>'+
      '</div><button onclick="calcPos()" style="width:100%;background:'+C.lime+';border:none;border-radius:8px;padding:10px 0;color:#000;font-weight:700;font-size:12px;cursor:pointer;font-family:inherit">Calculate</button><div id="pc-r" style="margin-top:10px;display:none"></div></div>':'')+
    '<div style="font-size:14px;font-weight:700;color:#FFF;margin:14px 0 10px">Criteria '+(s.score?'\u2014 '+s.score+'/4':'')+'</div>'+
    '<div class="card" style="margin-bottom:16px">'+crit+'</div>'+
    (s.counterTrend?'<div style="background:'+C.redSoft+';border:0.5px solid '+C.red+'55;border-radius:14px;padding:14px;margin-bottom:16px;font-size:12px;color:'+C.red+';font-weight:600">\u26A0 Counter-trend \u2014 '+(s.htfBias||'')+'. Reduce size.</div>':'')+
    (s.rsiDivergence?'<div style="background:'+C.orangeSoft+';border:0.5px solid '+C.orange+'55;border-radius:14px;padding:14px;margin-bottom:16px;font-size:12px;color:'+C.orange+';font-weight:600">\uD83D\uDD25 '+s.rsiDivergence+'</div>':'')+
    '<button onclick="closeDetail()" style="width:100%;background:'+C.surface+';border:0.5px solid '+C.border+';border-radius:10px;padding:12px 0;color:'+C.text2+';font-size:12px;cursor:pointer;font-family:inherit">\u2190 Back to Dashboard</button></div>';
}

function renderLogin(m){
  var app=document.getElementById('app');
  app.innerHTML='<div style="min-height:100dvh;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:calc(24px + env(safe-area-inset-top)) 24px calc(24px + env(safe-area-inset-bottom));text-align:center;background:#000;color:#FFF">'+
    '<div style="font-weight:900;font-size:34px;letter-spacing:-1px;text-transform:uppercase;margin-bottom:4px">'+
    '<span style="color:#FFF">THE </span><span style="color:#A3E635;text-shadow:0 0 40px rgba(163,230,53,0.33)">SLAYERS</span></div>'+
    '<div style="color:#8E8E93;font-size:12px;margin-bottom:32px">v10</div>'+
    '<div style="background:#141416;border-radius:20px;width:100%;max-width:300px;padding:28px 24px;border:0.5px solid rgba(163,230,53,0.2)">'+
    '<div style="font-size:14px;font-weight:700;color:#FFF;margin-bottom:12px">Enter your access code</div>'+
    '<input id="ci" type="text" placeholder="SLAY-XXXXXX" autocapitalize="characters" autocomplete="off" style="width:100%;background:rgba(0,0,0,0.35);border:0.5px solid rgba(255,255,255,0.08);border-radius:12px;padding:14px;color:#FFF;font-size:16px;text-align:center;letter-spacing:2px;margin-bottom:14px;outline:none;font-family:monospace;box-sizing:border-box"/>'+
    (m?'<div style="color:#EF4444;font-size:12px;margin-bottom:14px">'+m+'</div>':'')+
    '<button id="lb" style="width:100%;background:#A3E635;border:none;border-radius:12px;padding:15px 0;color:#000;font-weight:800;font-size:14px;cursor:pointer;font-family:inherit">Unlock</button>'+
    '<div id="ls" style="color:#8E8E93;font-size:11px;margin-top:14px"></div></div>'+
    '<div style="color:#48484A;font-size:11px;margin-top:40px">Don\'t have a code? Message Rexroz on Telegram.</div></div>';
  document.getElementById('lb').onclick=attemptLogin;
  document.getElementById('ci').addEventListener('keypress',function(e){if(e.key==='Enter')attemptLogin();});
}

async function attemptLogin(){
  var ci=document.getElementById('ci'),ls=document.getElementById('ls'),c=ci.value.trim().toUpperCase();
  if(!c)return;ls.textContent='Checking...';saveCode(c);
  try{
    var r=await fetch(withCode('/api/member/stats'));
    if(r.status===401){clearCode();renderLogin('Invalid or expired access code.');return;}
    state=Object.assign(state,{signals:[],active:[],confluence:[],stats:null,myStats:null,journal:[],news:[],articles:[],settings:null,notifPrefs:{},botHistory:[],scalpSignals:[],scalpActive:[],scalpStats:null,scalpPulse:[],weeklyStats:null,weeklySummary:null,detailedStats:null,loading:true,showCalc:false,showFilters:false});
    fetchAll();
  }catch(e){clearCode();renderLogin('Connection error.');}
}

window.setTab=function(t){state.tab=t;state.selected=null;render();};
window.openDetail=function(id){state.showCalc=false;for(var i=0;i<state.signals.length;i++)if(state.signals[i].id===id){state.selected=state.signals[i];break;}render();};
window.closeDetail=function(){state.selected=null;state.showCalc=false;render();};
window.toggleCalc=function(){state.showCalc=!state.showCalc;render();};
window.openScalpDetail=function(id){for(var i=0;i<state.scalpSignals.length;i++)if(state.scalpSignals[i].id===id){state.selected=state.scalpSignals[i];break;}render();};
window.logout=function(){if(confirm('Logout and clear code?')){clearCode();window.location.reload();}};
window.calcPos=calcPos;
window.toggleNotifPref=async function(key){
  var prefs=state.notifPrefs||{},nv=!prefs[key];prefs[key]=nv;
  try{await fetch(withCode('/api/member/notif-prefs'),{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({[key]:nv})});}catch(e){}
  render();
};
window.toggleTrack=async function(signalId,currentlyTracking){
  try{
    if(currentlyTracking){await fetch(withCode('/api/track/'+encodeURIComponent(signalId)),{method:'DELETE'});}
    else{await fetch(withCode('/api/track'),{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({signalId:signalId})});}
    var baseId=signalId.replace(/-(agg|cons)$/,''),sig=null;
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
  }catch(e){console.error('Track failed',e);}
};
window.copyTrade=function(id){
  for(var i=0;i<state.signals.length;i++){
    var s=state.signals[i];
    if(s.id===id||s.id+'-agg'===id||s.id+'-cons'===id){
      var txt=s.dualEntry?(s.type==='BULLISH'?'BUY ':'SELL ')+s.pair+' | Agg: '+fmt(s.aggEntry)+(s.consEntry?' | Cons: '+fmt(s.consEntry):'')+' | SL: '+fmt(s.aggSl)
        :(s.type==='BULLISH'?'BUY ':'SELL ')+s.pair+' | Entry: '+fmt(s.entry)+' | SL: '+fmt(s.sl)+(s.tp1?' | TP1: '+fmt(s.tp1):'')+(s.tp2?' | TP2: '+fmt(s.tp2):'');
      navigator.clipboard.writeText(txt).then(function(){showToast('Copied');}).catch(function(){});break;
    }
  }
};
async function enablePush(){
  if(!swRegistration||!getCode())return;
  try{
    var kr=await fetch(withCode('/api/vapid-key')),kd=await kr.json();
    if(!kd.enabled||!kd.key){alert('Push not configured on server yet.');return;}
    var p=await Notification.requestPermission();
    if(p!=='granted'){window.pushStatus='denied';render();return;}
    var sub=await swRegistration.pushManager.subscribe({userVisibleOnly:true,applicationServerKey:urlBase64ToUint8Array(kd.key)});
    await fetch(withCode('/api/subscribe'),{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(sub)});
    window.pushStatus='subscribed';render();
  }catch(e){console.error('Push failed',e);alert('Could not enable notifications.');}
}
function urlBase64ToUint8Array(b){
  var p='='.repeat((4-b.length%4)%4),s=(b+p).replace(/-/g,'+').replace(/_/g,'/');
  return Uint8Array.from([...atob(s)].map(function(c){return c.charCodeAt(0);}));
}
var swRegistration=null;
window.pushStatus='unknown';
async function checkPushStatus(){
  if(!getCode()||!swRegistration){window.pushStatus='unsupported';return;}
  try{var sub=await swRegistration.pushManager.getSubscription();window.pushStatus=sub?'subscribed':'unsupported';render();}catch(e){window.pushStatus='unsupported';}
}
if('serviceWorker'in navigator){
  navigator.serviceWorker.register('/service-worker.js').then(function(reg){swRegistration=reg;if(getCode())checkPushStatus();}).catch(function(e){});
}
document.addEventListener('click',function(e){
  var btn=e.target.closest('.nav-btn');
  if(btn&&btn.dataset)return; // nav handled by onclick
});
document.addEventListener('focusin',function(e){var t=e.target.tagName;if(t==='INPUT'||t==='TEXTAREA'||t==='SELECT')state.userBusy=true;});
document.addEventListener('focusout',function(e){var t=e.target.tagName;if(t==='INPUT'||t==='TEXTAREA'||t==='SELECT')setTimeout(function(){state.userBusy=false;},200);});
if(getCode()){render();fetchAll();}else{renderLogin();}
setInterval(function(){if(getCode())fetchAll(true);},120000);
