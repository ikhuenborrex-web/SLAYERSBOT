try{document.getElementById('app').innerHTML='<div style="padding:30px;color:rgba(255,255,255,0.4);text-align:center;font-size:13px;font-family:monospace">Loading...</div>';}catch(e){}
window.onerror=function(m,u,l,c,err){try{document.getElementById('app').innerHTML='<div style="padding:30px;color:#FF5252;text-align:center;font-family:monospace;font-size:12px;line-height:1.5">JS Error: '+m+' line: '+l+'</div>';}catch(e){}};

var C={bg:"#090909",surface:"#121212",card:"#121212",white:"#FFF",text2:"#8E8E8E",text3:"#5F5F5F",lime:"#B7FF2A",limeSoft:"rgba(183,255,42,0.08)",limeBorder:"rgba(183,255,42,0.25)",red:"#FF5252",redSoft:"rgba(255,82,82,0.12)",orange:"#f97316",orangeSoft:"rgba(249,115,22,0.1)",blue:"#3b82f6",blueSoft:"rgba(59,130,246,0.1)",border:"rgba(255,255,255,0.06)"};
var lastRefreshTime=Date.now();

var _mascotData='';
var IMG_MASCOT='/app/mascot.png';
function getMascotSrc(){return _mascotData||IMG_MASCOT;}
var _flagN=0;
function flagSVG(code,size){
  var id='fg'+(++_flagN),cx=size/2,cy=size/2,r=size/2-0.5;
  function rect(x,y,w,h,c){return '<rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" fill="'+c+'"/>';}
  function circ(cx,cy,r,c){return '<circle cx="'+cx+'" cy="'+cy+'" r="'+r+'" fill="'+c+'"/>';}
  function line(x1,y1,x2,y2,c,w){return '<line x1="'+x1+'" y1="'+y1+'" x2="'+x2+'" y2="'+y2+'" stroke="'+c+'" stroke-width="'+w+'"/>';}
  function poly(pts,c){return '<polygon points="'+pts+'" fill="'+c+'"/>';}
  function text(x,y,txt,c,s){return '<text x="'+x+'" y="'+y+'" text-anchor="middle" fill="'+c+'" font-size="'+s+'" font-weight="700" font-family="sans-serif">'+txt+'</text>';}
  var s='<svg width="'+size+'" height="'+size+'" viewBox="0 0 '+size+' '+size+'">'+
    '<defs><clipPath id="'+id+'"><circle cx="'+cx+'" cy="'+cy+'" r="'+r+'"/></clipPath></defs>'+
    '<circle cx="'+cx+'" cy="'+cy+'" r="'+r+'" fill="#1a1a1a" stroke="rgba(255,255,255,0.08)" stroke-width="0.5"/>'+
    '<g clip-path="url(#'+id+')">';
  if(code==='USD'){
    var sh=size/13;
    for(var i=0;i<13;i++)s+=rect(0,i*sh,size,sh,i%2===0?'#e0162b':'#FFF');
    s+=rect(0,0,size*0.45,size*0.55,'#002868');
    for(var rw=0;rw<6;rw++)for(var cl=0;cl<5;cl++){var sx=size*0.04+cl*size*0.08,sy=rw%2===0?size*0.06+rw*size*0.08:size*0.12+(rw-1)*size*0.08;if(rw===5&&cl>3)break;s+=circ(sx,sy,size*0.012,'#FFF');}
  }else if(code==='EUR'){
    s+=rect(0,0,size,size,'#003399');
    for(var i=0;i<12;i++){var a=i*Math.PI/6;var sx=cx+size*0.22*Math.cos(a),sy=cy+size*0.22*Math.sin(a);s+=circ(sx,sy,size*0.025,'#FFD700');}
  }else if(code==='GBP'){
    s+=rect(0,0,size,size,'#012169');
    s+=line(0,cy,size,cy,'#FFF',size*0.06);s+=line(cx,0,cx,size,'#FFF',size*0.06);
    s+=line(0,cy,size,cy,'#C8102E',size*0.035);s+=line(cx,0,cx,size,'#C8102E',size*0.035);
    s+=line(0,0,size,size,'#FFF',size*0.05);s+=line(size,0,0,size,'#FFF',size*0.05);
    s+=line(0,0,size,size,'#C8102E',size*0.025);s+=line(size,0,0,size,'#C8102E',size*0.025);
  }else if(code==='JPY'){
    s+=rect(0,0,size,size,'#FFF');s+=circ(cx,cy,size*0.3,'#BC002D');
  }else if(code==='AUD'){
    s+=rect(0,0,size,size,'#00008B');s+=line(0,cy,size*0.4,cy,'#FFF',size*0.04);s+=line(size*0.2,0,size*0.2,size,'#FFF',size*0.04);
    s+=line(0,cy,size*0.4,cy,'#C8102E',size*0.02);s+=line(size*0.2,0,size*0.2,size,'#C8102E',size*0.02);
    s+=line(0,0,size*0.4,size*0.4,'#FFF',size*0.035);s+=line(size*0.4,0,0,size*0.4,'#FFF',size*0.035);
    s+=line(0,0,size*0.4,size*0.4,'#C8102E',size*0.015);s+=line(size*0.4,0,0,size*0.4,'#C8102E',size*0.015);
    s+=circ(size*0.52,size*0.18,size*0.035,'#FFF');s+=circ(size*0.7,size*0.12,size*0.025,'#FFF');
    s+=circ(size*0.7,size*0.32,size*0.025,'#FFF');s+=circ(size*0.6,size*0.28,size*0.02,'#FFF');
    s+=circ(size*0.78,size*0.22,size*0.02,'#FFF');
  }else if(code==='NZD'){
    s+=rect(0,0,size,size,'#00008B');s+=line(0,cy,size*0.4,cy,'#FFF',size*0.04);s+=line(size*0.2,0,size*0.2,size,'#FFF',size*0.04);
    s+=line(0,cy,size*0.4,cy,'#C8102E',size*0.02);s+=line(size*0.2,0,size*0.2,size,'#C8102E',size*0.02);
    s+=line(0,0,size*0.4,size*0.4,'#FFF',size*0.035);s+=line(size*0.4,0,0,size*0.4,'#FFF',size*0.035);
    s+=line(0,0,size*0.4,size*0.4,'#C8102E',size*0.015);s+=line(size*0.4,0,0,size*0.4,'#C8102E',size*0.015);
    s+=circ(size*0.55,size*0.15,size*0.03,'#C8102E');s+=circ(size*0.7,size*0.1,size*0.02,'#C8102E');
    s+=circ(size*0.72,size*0.25,size*0.02,'#C8102E');s+=circ(size*0.6,size*0.3,size*0.015,'#C8102E');
    s+=circ(size*0.5,size*0.22,size*0.015,'#C8102E');
  }else if(code==='CAD'){
    s+=rect(0,0,size,size,'#FFF');s+=rect(0,0,size*0.25,size,'#e0162b');s+=rect(size*0.75,0,size*0.25,size,'#e0162b');
    s+=rect(size*0.35,size*0.12,size*0.3,size*0.76,'#e0162b');
  }else if(code==='CHF'){
    s+=rect(0,0,size,size,'#e0162b');s+=rect(size*0.38,size*0.2,size*0.24,size*0.6,'#FFF');
    s+=rect(size*0.2,size*0.38,size*0.6,size*0.24,'#FFF');
  }else if(code==='BTC'){
    s+=rect(0,0,size,size,'#f7931a');s+=text(cx,cy+size*0.1,'₿','#FFF',Math.round(size*0.5));
  }else if(code==='ETH'){
    s+=rect(0,0,size,size,'#627eea');s+='<polygon points="'+(cx)+','+(cy-size*0.35)+' '+(cx+size*0.35)+','+(cy)+' '+(cx)+','+(cy+size*0.35)+' '+(cx-size*0.35)+','+(cy)+'" fill="#FFF" opacity="0.4"/>';
  }else if(code==='SOL'){
    s+=rect(0,0,size,size,'#9945FF');s+=text(cx,cy+size*0.1,'SOL','#FFF',Math.round(size*0.22));
  }else if(code==='XAU'){
    s+=rect(0,0,size,size,'#1a1a2e');s+=rect(size*0.25,size*0.38,size*0.5,size*0.24,'#d4a743');
  }else if(code==='XAG'){
    s+=rect(0,0,size,size,'#2a2a2a');s+=text(cx,cy+size*0.1,'Ag','#c0c0c0',Math.round(size*0.28));
  }else if(code.indexOf('NAS')===0||code.indexOf('US30')===0||code.indexOf('SPX')===0){
    s+=rect(0,0,size,size,'#1a3a5c');
    s+='<polyline points="'+(size*0.2)+','+(size*0.7)+' '+(size*0.35)+','+(size*0.45)+' '+(size*0.5)+','+(size*0.55)+' '+(size*0.65)+','+(size*0.35)+' '+(size*0.8)+','+(size*0.25)+'" fill="none" stroke="#4cc9f0" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>';
  }else{s+=rect(0,0,size,size,'#121212');s+=text(cx,cy+size*0.1,code.slice(0,2),'#5F5F5F',Math.round(size*0.25));}
  s+='</g></svg>';
  return s;
}
function assetIcon(pair,size){
  size=size||28;
  var parts=pair.split('/'),b=parts[0],q=parts[1]||'',ov=Math.round(size*0.22),tw=size+ov;
  return q?'<span style="display:inline-flex;position:relative;width:'+tw+'px;height:'+size+'px;flex-shrink:0;vertical-align:middle;margin-right:8px">'+
    '<span style="position:absolute;top:0;left:'+ov+'px;z-index:0">'+flagSVG(q,size)+'</span>'+
    '<span style="position:absolute;top:0;left:0;z-index:1;filter:drop-shadow(0 1px 2px rgba(0,0,0,0.3))">'+flagSVG(b,size)+'</span></span>'
    :'<span style="display:inline-flex;width:'+size+'px;height:'+size+'px;flex-shrink:0;vertical-align:middle;margin-right:8px">'+flagSVG(b,size)+'</span>';
}
function getCode(){try{return localStorage.getItem('qmr_code')||'';}catch(e){return '';}}
function saveCode(c){try{localStorage.setItem('qmr_code',c);}catch(e){}}
function clearCode(){try{localStorage.removeItem('qmr_code');}catch(e){}}
function getDeviceId(){try{var d=localStorage.getItem('qmr_did');if(!d){d='d_'+Date.now().toString(36)+Math.random().toString(36).slice(2,8);localStorage.setItem('qmr_did',d);}return d;}catch(e){return 'unknown';}}
function esc(t){return String(t||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;');}
function withCode(u){if(!u)return'';var c=getCode();if(!c)return u;return u+(u.indexOf('?')>-1?'&':'?')+'code='+encodeURIComponent(c)+'&device='+encodeURIComponent(getDeviceId());}
function fmt(v){if(v==null||v===undefined)return'-';var n=parseFloat(v);if(isNaN(n))return v;return n.toFixed(5).replace(/0+$/,'').replace(/\.$/,'');}
function timeAgo(t){if(!t)return'';var n=Date.now(),d=new Date(t).getTime();if(isNaN(d))return'';var diff=n-d;if(diff<0)return'just now';var s=Math.floor(diff/1e3),m=Math.floor(s/60),h=Math.floor(m/60),d2=Math.floor(h/24);if(d2>0)return d2+'d ago';if(h>0)return h+'h ago';if(m>0)return m+'m ago';return s+'s ago';}
function greeting(){var h=new Date().getHours();if(h<5)return'Late night';if(h<12)return'Good morning';if(h<18)return'Good afternoon';return'Good evening';}
function emptyState(msg){return'<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;padding:60px 20px;text-align:center"><div style="font-size:28px;margin-bottom:12px;opacity:0.1">\u25CB</div><div style="font-size:13px;color:#8E8E8E;line-height:1.5;max-width:260px">'+msg+'</div></div>';}
function showToast(msg){var d=document.createElement('div');d.textContent=msg;d.style.cssText='position:fixed;bottom:100px;left:50%;transform:translateX(-50%);background:#151515;border:0.5px solid rgba(255,255,255,0.06);color:#FFF;padding:10px 20px;border-radius:99px;font-size:12px;font-weight:500;z-index:9999;box-shadow:0 4px 24px rgba(0,0,0,0.3);animation:fadeUp 0.2s ease';document.body.appendChild(d);setTimeout(function(){d.style.opacity='0';d.style.transition='opacity 0.3s';setTimeout(function(){d.remove();},300);},2000);}

function icon(path,color,size){return '<svg width="'+(size||18)+'" height="'+(size||18)+'" viewBox="0 0 24 24" fill="none" stroke="'+color+'" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">'+path+'</svg>';}
var I={dash:'<rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/>',journal:'<path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>',pulse:'<polygon points="13 2 3 14 12 14 11 22 21 10 12 10"/>',intel:'<path d="M19.07 4.93A10 10 0 0 0 6.99 3.34"/><path d="M4 6h.01"/><path d="M2.29 9.62A10 10 0 1 0 21.31 8.35"/><path d="m12 12-2.83 2.83"/><circle cx="12" cy="12" r="2"/>',gear:'<circle cx="12" cy="12" r="3"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>',crosshair:'<circle cx="12" cy="12" r="10"/><line x1="22" y1="12" x2="18" y2="12"/><line x1="6" y1="12" x2="2" y2="12"/><line x1="12" y1="6" x2="12" y2="2"/><line x1="12" y1="22" x2="12" y2="18"/>',chart:'<path d="M9 5v4"/><rect width="4" height="6" x="7" y="9" rx="1"/><path d="M9 15v2"/><path d="M17 3v2"/><rect width="4" height="8" x="15" y="5" rx="1"/><path d="M17 13v3"/><path d="M3 3v16a2 2 0 0 0 2 2h16"/>',copy:'<rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>',replay:'<polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/>',
share:'<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>',
search:'<circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>',
bell:'<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>',
clock:'<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',
shield:'<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>',
trendingUp:'<polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>',
trendingDown:'<polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/><polyline points="17 18 23 18 23 12"/>',
globe:'<circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>',
newspaper:'<path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9h2"/><path d="M18 14h-8"/><path d="M15 18h-5"/><path d="M10 6h8v4h-8V6Z"/>',
filter2:'<polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>',
chevronRight:'<polyline points="9 18 15 12 9 6"/>',
arrowUp:'<line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/>',
arrowDown:'<line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/>',
activity:'<polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>',
alertTriangle:'<path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>',
sparkles:'<path d="M12 3l1.5 5.5L19 10l-5.5 1.5L12 17l-1.5-5.5L5 10l5.5-1.5L12 3z"/><path d="M18 14l.7 2.3L21 17l-2.3.7L18 20l-.7-2.3L15 17l2.3-.7L18 14z"/><path d="M4 6l.5 1.5L6 8l-1.5.5L4 10l-.5-1.5L2 8l1.5-.5L4 6z"/>',
zap:'<polygon points="13 2 3 14 12 14 11 22 21 10 12 10"/>',
barChart3:'<path d="M3 3v18h18"/><path d="M7 16v-5"/><path d="M11 16v-9"/><path d="M15 16V9"/><path d="M19 16v-3"/>',
dollarSign:'<line x1="12" y1="2" x2="12" y2="22"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>',
brain:'<path d="M12 4a4 4 0 0 1 3.5 2 4 4 0 0 1 7.5 1.5c0 .9-.3 1.7-.8 2.4.5.7.8 1.5.8 2.4a4 4 0 0 1-7.5 1.5A4 4 0 0 1 12 20a4 4 0 0 1-3.5-2 4 4 0 0 1-7.5-1.5c0-.9.3-1.7.8-2.4-.5-.7-.8-1.5-.8-2.4a4 4 0 0 1 7.5-1.5A4 4 0 0 1 12 4z"/>',
layers:'<path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>',
calendar:'<rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>',
target:'<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>',
bookmark:'<path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/>',
bitcoin:'<path d="M11.5 8H8v8h3.5a4 4 0 1 0 0-8z"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="M16 12a4 4 0 1 1-8 0"/>',
refreshCw:'<path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M3 21v-5h5"/>',
checkCircle:'<path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="m9 12 2 2 4-4"/>'};

// ====== TRADE REPLAY ======
function showTradeReplay(idx){
  var e=_journalDisplayEntries[idx];if(!e)return;
  if(_rp)closeReplay();
  var entry=parseFloat(e.entry),sl=parseFloat(e.sl),tp1=parseFloat(e.tp1),tp2=parseFloat(e.tp2),rv=e.rMultiple||e.r||0;
  if(isNaN(entry))return;
  var isBuy=e.direction==='BUY'||e.direction==='BULLISH';
  var finalPrice=entry;
  if(rv>0){var target=tp2||tp1;if(target&&target!=entry){var range=Math.abs(target-entry),prog=Math.min(rv/3,1);finalPrice=isBuy?entry+range*prog:entry-range*prog;}}
  else if(rv<0&&sl&&sl!=entry)finalPrice=sl;
  var prs=[entry];if(sl>0)prs.push(sl);if(tp1>0)prs.push(tp1);if(tp2>0)prs.push(tp2);
  var minP=Math.min.apply(null,prs),maxP=Math.max.apply(null,prs),pR=(maxP-minP)||0.001,pad=pR*0.2;minP-=pad;maxP+=pad;pR=maxP-minP;
  function toPct(p){return((p-minP)/pR)*100;}
  _rp={idx:idx,entry:entry,sl:sl,tp1:tp1,tp2:tp2,finalPrice:finalPrice,rv:rv,isBuy:isBuy,
    pair:esc(e.pair||''),dir:e.direction||'',tf:e.tf||'',outcome:e.outcome||'',
    toPct:toPct,startPct:toPct(entry),endPct:toPct(finalPrice),progress:0,running:true,
    duration:2800,raf:0,el:null,dotEl:null,priceEl:null,barEl:null,statusEl:null};
  renderRpOverlay();rpAnimate();
}
function renderRpOverlay(){
  var s=_rp,isWin=s.rv>0,isLoss=s.rv<0,col=isWin?C.lime:isLoss?C.red:C.text2;
  var ol='<div style="font-size:22px;font-weight:800;color:'+col+'">'+(isWin?'+':'')+s.rv.toFixed(2)+'R</div><div style="font-size:10px;color:#5F5F5F;margin-top:1px">'+(s.outcome||'')+'</div>';
  var levels=[];if(s.sl>0)levels.push({l:'SL',p:s.sl,c:C.red});if(s.entry>0)levels.push({l:'Entry',p:s.entry,c:'#FFF'});if(s.tp1>0)levels.push({l:'TP1',p:s.tp1,c:C.lime});if(s.tp2>0)levels.push({l:'TP2',p:s.tp2,c:C.lime});
  var lvls='';
  for(var i=0;i<levels.length;i++){var lv=levels[i];var y=s.toPct(lv.p);lvls+='<div style="position:absolute;left:0;right:0;bottom:'+y+'%;display:flex;align-items:center;gap:6px;pointer-events:none"><span style="font-size:9px;font-weight:600;color:'+lv.c+';width:36px;text-align:right;flex-shrink:0">'+lv.l+'</span><div style="flex:1;height:0;border-top:0.5px dashed '+lv.c+'55"></div><span style="font-size:8px;color:'+lv.c+'99;font-family:monospace">'+fmt(lv.p)+'</span></div>';}
  s.el=document.createElement('div');s.el.id='rp';
  s.el.style.cssText='position:fixed;top:0;left:0;right:0;bottom:0;z-index:9999;background:rgba(9,9,9,0.88);backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);display:flex;align-items:center;justify-content:center;padding:20px;animation:fadeIn .2s ease';
  s.el.onclick=function(e){if(e.target===this)closeReplay();};
  document.addEventListener('keydown',s._keyHandler=function(e){if(e.key==='Escape')closeReplay();});
  s.el.innerHTML='<div style="width:100%;max-width:340px;background:#151515;border-radius:24px;border:0.5px solid rgba(255,255,255,0.06);overflow:hidden;box-shadow:0 24px 80px rgba(0,0,0,0.5);animation:springUp .35s cubic-bezier(.16,1,.3,1)">'+
    '<div style="display:flex;align-items:center;justify-content:space-between;padding:18px 20px 12px">'+
      '<div><div style="font-size:18px;font-weight:700;color:#FFF;letter-spacing:-0.03em">'+s.pair+'</div><div style="font-size:10px;color:#5F5F5F;margin-top:2px">'+s.dir+' \u00b7 '+s.tf+'</div></div>'+
      '<div style="text-align:right">'+ol+'</div></div>'+
    '<div style="position:relative;height:200px;margin:0 20px 12px;padding:8px 0">'+lvls+
      '<div class="rpp" style="position:absolute;left:64px;right:0;bottom:'+s.startPct+'%;height:0;transition:none">'+
        '<div class="rpd" style="width:10px;height:10px;border-radius:50%;background:'+col+';position:absolute;top:-5px;right:16px;box-shadow:0 0 20px '+col+';transition:none"></div></div>'+
      '<div class="rppr" style="position:absolute;right:0;bottom:'+s.startPct+'%;font-size:11px;font-weight:700;color:#FFF;font-family:monospace;transform:translateY(50%);pointer-events:none;transition:none">'+fmt(s.entry)+'</div>'+
    '</div>'+
    '<div style="padding:0 20px 16px">'+
      '<div style="height:3px;border-radius:99px;background:rgba(255,255,255,0.06);overflow:hidden">'+
        '<div class="rpb" style="height:100%;width:0%;background:'+col+';border-radius:99px;transition:none"></div></div>'+
      '<div style="display:flex;justify-content:space-between;font-size:8px;color:#5F5F5F;margin-top:4px">'+
        '<span>Entry</span><span class="rps" style="color:'+col+'">0%</span></div></div>'+
    '<div style="display:flex;gap:8px;padding:0 20px 18px">'+
      '<button onclick="closeReplay()" style="flex:1;background:rgba(255,255,255,0.04);border:0.5px solid rgba(255,255,255,0.06);border-radius:12px;padding:12px 0;color:#8E8E8E;font-size:11px;font-weight:600;cursor:pointer;font-family:inherit">Close</button>'+
      '<button onclick="restartReplay()" style="flex:1;background:'+C.limeSoft+';border:0.5px solid '+C.limeBorder+';border-radius:12px;padding:12px 0;color:'+C.lime+';font-size:11px;font-weight:600;cursor:pointer;font-family:inherit"><span style="display:inline-flex;align-items:center;gap:4px;justify-content:center">'+icon(I.replay,C.lime,12)+'Replay</span></button></div></div>';
  document.body.appendChild(s.el);
  s.dotEl=s.el.querySelector('.rpd');s.priceEl=s.el.querySelector('.rppr');s.barEl=s.el.querySelector('.rpb');s.statusEl=s.el.querySelector('.rps');s.pathEl=s.el.querySelector('.rpp');
}
function rpAnimate(){
  var s=_rp;if(!s)return;
  s.startTime=performance.now();
  (function frame(now){
    var s2=_rp;if(!s2||!s2.running)return;
    var el=Math.max((now-s2.startTime)/s2.duration,0),p=Math.min(el,1),eased=1-Math.pow(1-p,3);
    s2.progress=eased;
    var cp=s2.entry+(s2.finalPrice-s2.entry)*eased,cy=s2.toPct(cp);
    if(s2.pathEl){s2.pathEl.style.transition='none';s2.pathEl.style.bottom=cy+'%';}
    if(s2.priceEl){s2.priceEl.style.transition='none';s2.priceEl.style.bottom=cy+'%';s2.priceEl.textContent=fmt(cp);}
    if(s2.barEl)s2.barEl.style.width=(p*100)+'%';
    if(s2.statusEl)s2.statusEl.textContent=p<1?Math.round(p*100)+'%':(s2.rv>0?'+'+s2.rv.toFixed(2)+'R \u2713':s2.rv<0?s2.rv.toFixed(2)+'R \u2717':'BE');
    if(p<1)s2.raf=requestAnimationFrame(frame);else s2.running=false;
  })(s.startTime);
}
window.closeReplay=function(){if(_rp){_rp.running=false;if(_rp.raf)cancelAnimationFrame(_rp.raf);if(_rp._keyHandler)document.removeEventListener('keydown',_rp._keyHandler);if(_rp.el)_rp.el.remove();_rp=null;}};
window.restartReplay=function(){var idx=_rp&&_rp.idx;if(idx!==undefined){closeReplay();showTradeReplay(idx);}};
window.showTradeReplay=function(idx){showTradeReplay(idx);};

var lastSignalIds=[],lastScalpIds=[];
var state={
  tab:'dash',selected:null,signals:[],active:[],confluence:[],stats:null,myStats:null,journal:[],
  news:[],articles:[],settings:null,notifPrefs:{},botHistory:[],scalpSignals:[],scalpActive:[],
  scalpStats:null,scalpPulse:[],weeklyStats:null,weeklySummary:null,detailedStats:null,weeklyReportData:null,
  loading:true,showCalc:false,showOnboarding:false,onboardingStep:-1,showFilters:false,userBusy:false,
  filter:{pair:'',tf:'',dir:'',minScore:0,dateFrom:'',dateTo:'',sort:'time'},
  journalTab:'all',journalTime:'ALL',journalSearch:'',showJournalSearch:false,
  intelTab:'all',sentiment:null,dailyBias:null,briefing:null,
  notifications:[],showNotifPanel:false
};
var _progExp={};
var _journalExp={};
var _rp=null;
var _journalDisplayEntries=[];

async function fetchAll(bg){
  if(bg&&state.userBusy)return;
  var TIMEOUT_MS=15000;
  var ft=function(url){
    return Promise.race([fetch(url),new Promise(function(_,rej){setTimeout(function(){rej(new Error('timeout'));},TIMEOUT_MS);})]);
  };
  var j=function(r){return r&&r.json?r.json().catch(function(){return{};}):Promise.resolve({});};
  var promises=[];
  var sigUrl='/api/signals?limit=20';
  if(state.filter.pair)sigUrl+='&pair='+encodeURIComponent(state.filter.pair);
  if(state.filter.dir)sigUrl+='&dir='+encodeURIComponent(state.filter.dir);
  if(state.filter.tf)sigUrl+='&tf='+encodeURIComponent(state.filter.tf);
  if(state.filter.minScore>0)sigUrl+='&minScore='+state.filter.minScore;
  if(state.filter.dateFrom)sigUrl+='&dateFrom='+encodeURIComponent(state.filter.dateFrom);
  if(state.filter.dateTo)sigUrl+='&dateTo='+encodeURIComponent(state.filter.dateTo);
  if(state.filter.sort!=='time')sigUrl+='&sort='+state.filter.sort;
  promises.push(ft(withCode(sigUrl)).then(function(r){
    if(r.status===401){clearCode();state.loading=false;renderLogin('Your access code has expired or is no longer valid.');return;}
    return j(r).then(function(d){
      var sigs=d.signals||[];
      if(lastSignalIds.length&&sigs.length>lastSignalIds.length&&!bg){
        for(var si=0;si<sigs.length;si++){if(lastSignalIds.indexOf(sigs[si].id)===-1){showToast((sigs[si].type==='BULLISH'?'\uD83D\uDCC8 ':'\uD83D\uDCC9 ')+(sigs[si].dualEntry?'Dual ':'')+sigs[si].pair+' \u00b7 '+sigs[si].tier+(sigs[si].score?' ('+sigs[si].score+'/4)':''));break;}}
      }
      lastSignalIds=sigs.map(function(s){return s.id;});
      state.signals=sigs;render();
    });
  }).catch(function(){}));
  promises.push(ft(withCode('/api/active')).then(function(r){return j(r).then(function(d){state.active=d.trades||[];render();});}).catch(function(){}));
  promises.push(ft(withCode('/api/confluence')).then(function(r){return j(r).then(function(d){state.confluence=d.pairs||[];render();});}).catch(function(){}));
  promises.push(ft(withCode('/api/stats')).then(function(r){return j(r).then(function(d){state.stats=d;render();});}).catch(function(){}));
  promises.push(ft(withCode('/api/stats/detailed')).then(function(r){return j(r).then(function(d){state.detailedStats=d;render();});}).catch(function(){}));
  promises.push(ft(withCode('/api/stats/weekly')).then(function(r){return j(r).then(function(d){state.weeklyStats=d;render();});}).catch(function(){}));
  promises.push(ft(withCode('/api/member/stats')).then(function(r){
    if(r.status===200)return j(r).then(function(d){
      state.myStats=d.myStats||null;
      var local=JSON.parse(localStorage.getItem('notifPrefs')||'{}');
      state.notifPrefs=Object.assign({},d.notifPrefs||{},local);
      render();
    });
  }).catch(function(){}));
  promises.push(ft(withCode('/api/journal')).then(function(r){return j(r).then(function(d){state.journal=d.entries||[];render();});}).catch(function(){}));
  promises.push(ft(withCode('/api/news')).then(function(r){return j(r).then(function(d){state.news=d.events||[];render();});}).catch(function(){}));
  promises.push(ft(withCode('/api/news-feed')).then(function(r){return j(r).then(function(d){state.articles=d.articles||d.data||d.news||d.items||(Array.isArray(d)?d:[])||[];render();});}).catch(function(){}));
  promises.push(ft(withCode('/api/settings')).then(function(r){return j(r).then(function(d){state.settings=d.settings||null;render();});}).catch(function(){}));
  promises.push(ft(withCode('/api/trade-history')).then(function(r){return j(r).then(function(d){state.botHistory=d.outcomes||[];render();});}).catch(function(){}));
  promises.push(ft(withCode('/api/weekly-summary')).then(function(r){return j(r).then(function(d){state.weeklySummary=d.summary||null;render();});}).catch(function(){}));
  promises.push(ft(withCode('/api/weekly-report')).then(function(r){return j(r).then(function(d){state.weeklyReportData=d;render();});}).catch(function(){}));
  promises.push(ft(withCode('/api/notifications')).then(function(r){return j(r).then(function(d){
    var notifs=d.notifications||[];
    for(var ni=0;ni<notifs.length;ni++){addNotification(notifs[ni]);}
    if(notifs.length)render();
  });}).catch(function(){}));
  promises.push(ft(withCode('/api/scalp')).then(function(r){return j(r).then(function(d){var ss=d.signals||[];
    if(lastScalpIds.length&&ss.length>lastScalpIds.length&&!bg){for(var si=0;si<ss.length;si++){if(lastScalpIds.indexOf(ss[si].id)===-1){showToast('\u26A1 Scalp '+(ss[si].type==='BULLISH'?'\uD83D\uDCC8 ':'\uD83D\uDCC9 ')+(ss[si].name||ss[si].pair)+' \u00b7 score '+ss[si].score+'/5');break;}}}
    lastScalpIds=ss.map(function(s){return s.id;});state.scalpSignals=ss;render();});}).catch(function(){}));
  promises.push(ft(withCode('/api/scalp/active')).then(function(r){return j(r).then(function(d){state.scalpActive=d.trades||[];render();});}).catch(function(){}));
  promises.push(ft(withCode('/api/scalp/stats')).then(function(r){return j(r).then(function(d){state.scalpStats=d;render();});}).catch(function(){}));
  promises.push(ft(withCode('/api/scalp/pulse')).then(function(r){return j(r).then(function(d){state.scalpPulse=d.pairs||[];render();});}).catch(function(){}));
  promises.push(ft(withCode('/api/intel-summary')).then(function(r){return j(r).then(function(d){state.briefing=d.briefing||d.summary||d.text||d.content||null;lastRefreshTime=Date.now();render();});}).catch(function(){}));
  state.loading=false;
  if(promises.length&&!bg){
    Promise.allSettled(promises).then(function(){refreshPill.complete();});
    setTimeout(function(){refreshPill.complete();},12000);
  }
}

function miniChart(entries){
  var eqPts=null;
  if(entries&&entries.length>=2){
    var sorted=entries.slice().sort(function(a,b){return(a.createdAt||a.time||'').localeCompare(b.createdAt||b.time||'');});
    var cum=0;eqPts=[];
    for(var i=0;i<sorted.length;i++){cum+=(sorted[i].rMultiple||sorted[i].r||0);eqPts.push(cum);}
  }
  var pts=eqPts||[-0.5,-0.8,-1.2,-0.3,0.5,0.8,1.2,1.5,2.0,2.5,3.0,3.35];
  var mn=Math.min(0,Math.min.apply(null,pts)),mx=Math.max(0,Math.max.apply(null,pts)),rng=mx-mn||1;
  var n=pts.length;
  function py(v){return 8+(mx-v)/rng*(50-8);}
  function px(i){return(i/(n-1))*310+30;}
  var d='';
  for(var i=0;i<n;i++){
    var xi=px(i),yi=py(pts[i]);
    if(i===0){d+='M'+xi.toFixed(1)+','+yi.toFixed(1);continue;}
    var xim1=px(i-1),yim1=py(pts[i-1]);
    var tx1,ty1;
    if(i<2){tx1=xim1+(xi-xim1)*0.25;ty1=yim1;}
    else{var xim2=px(i-2),yim2=py(pts[i-2]);tx1=xim1+(xi-xim2)/6;ty1=yim1+(yi-yim2)/6;}
    var tx2,ty2;
    if(i>=n-1){tx2=xi-(xi-xim1)*0.25;ty2=yi;}
    else{var xip1=px(i+1),yip1=py(pts[i+1]);tx2=xi-(xip1-xim1)/6;ty2=yi-(yip1-yim1)/6;}
    d+='C'+tx1.toFixed(1)+','+ty1.toFixed(1)+' '+tx2.toFixed(1)+','+ty2.toFixed(1)+' '+xi.toFixed(1)+','+yi.toFixed(1);
  }
  var lastV=pts[n-1],col=lastV>=0?'#C7FF38':'#FF5252';
  var lx=px(n-1),ly=py(lastV);
  var eqVal=(lastV>0?'+':'')+lastV.toFixed(2)+'R';
  return '<div id="wt-equity" style="background:#111111;border-radius:20px;padding:16px 20px 14px;border:1px solid rgba(255,255,255,0.04);position:relative;overflow:hidden;margin-top:12px">'+
    '<div style="position:absolute;top:-60px;right:-40px;width:160px;height:160px;border-radius:50%;background:radial-gradient(circle,rgba(199,255,56,0.05) 0%,transparent 70%);pointer-events:none"></div>'+
    '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;position:relative;z-index:1">'+
      '<div style="font-size:9px;font-weight:600;color:#5F5F5F;text-transform:uppercase;letter-spacing:0.06em">Equity Curve <span style="color:rgba(255,255,255,0.12);font-weight:400;text-transform:none">· '+(eqPts?entries.length+' trades':'')+'</span></div>'+
      '<div style="font-size:11px;font-weight:700;color:#C7FF38;display:flex;align-items:center;gap:4px">'+
        '<span style="width:3px;height:3px;border-radius:50%;background:#C7FF38;box-shadow:0 0 4px rgba(199,255,56,0.4)"></span>'+eqVal+'</div></div>'+
    '<div style="height:64px;position:relative;z-index:1">'+
      '<svg viewBox="0 0 340 64" style="width:100%;height:100%;display:block">'+
        '<defs>'+
          '<linearGradient id="eqFill" x1="0" y1="0" x2="0" y2="1">'+
            '<stop offset="0%" stop-color="'+col+'" stop-opacity="0.18"/>'+
            '<stop offset="100%" stop-color="'+col+'" stop-opacity="0"/></linearGradient>'+
          '<filter id="eqBlur"><feGaussianBlur stdDeviation="2.5"/></filter>'+
          '<radialGradient id="endGlow" cx="50%" cy="50%" r="50%">'+
            '<stop offset="0%" stop-color="'+col+'" stop-opacity="0.35"/>'+
            '<stop offset="100%" stop-color="'+col+'" stop-opacity="0"/></radialGradient></defs>'+
        '<line x1="30" y1="8" x2="338" y2="8" stroke="rgba(255,255,255,0.06)" stroke-width="0.5" stroke-dasharray="2 3"/>'+
        '<line x1="30" y1="22" x2="338" y2="22" stroke="rgba(255,255,255,0.06)" stroke-width="0.5" stroke-dasharray="2 3"/>'+
        '<line x1="30" y1="36" x2="338" y2="36" stroke="rgba(255,255,255,0.08)" stroke-width="0.5" stroke-dasharray="2 3"/>'+
        '<line x1="30" y1="50" x2="338" y2="50" stroke="rgba(255,255,255,0.06)" stroke-width="0.5" stroke-dasharray="2 3"/>'+
        '<text x="26" y="11" fill="rgba(255,255,255,0.18)" font-size="5.5" font-weight="500" text-anchor="end">+4R</text>'+
        '<text x="26" y="25" fill="rgba(255,255,255,0.18)" font-size="5.5" font-weight="500" text-anchor="end">+2R</text>'+
        '<text x="26" y="39" fill="rgba(255,255,255,0.22)" font-size="5.5" font-weight="500" text-anchor="end">0R</text>'+
        '<text x="26" y="53" fill="rgba(255,255,255,0.18)" font-size="5.5" font-weight="500" text-anchor="end">-2R</text>'+
        '<text x="58" y="62.5" fill="rgba(255,255,255,0.12)" font-size="5" font-weight="500" text-anchor="middle">Mon</text>'+
        '<text x="106" y="62.5" fill="rgba(255,255,255,0.12)" font-size="5" font-weight="500" text-anchor="middle">Tue</text>'+
        '<text x="154" y="62.5" fill="rgba(255,255,255,0.12)" font-size="5" font-weight="500" text-anchor="middle">Wed</text>'+
        '<text x="202" y="62.5" fill="rgba(255,255,255,0.12)" font-size="5" font-weight="500" text-anchor="middle">Thu</text>'+
        '<text x="250" y="62.5" fill="rgba(255,255,255,0.12)" font-size="5" font-weight="500" text-anchor="middle">Fri</text>'+
        '<text x="290" y="62.5" fill="rgba(255,255,255,0.10)" font-size="5" font-weight="500" text-anchor="middle">Sat</text>'+
        '<text x="330" y="62.5" fill="rgba(255,255,255,0.10)" font-size="5" font-weight="500" text-anchor="middle">Sun</text>'+
        '<path d="'+d+'" fill="none" stroke="'+col+'" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round" opacity="0.2" filter="url(#eqBlur)"/>'+
        '<path d="'+d+' L338,64 L30,64 Z" fill="url(#eqFill)"/>'+
        '<path d="'+d+'" fill="none" stroke="'+col+'" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>'+
        '<circle cx="'+lx.toFixed(1)+'" cy="'+ly.toFixed(1)+'" r="12" fill="url(#endGlow)"/>'+
        '<circle cx="'+lx.toFixed(1)+'" cy="'+ly.toFixed(1)+'" r="5" fill="#FFF" style="filter:drop-shadow(0 0 8px rgba(199,255,56,0.4))"/>'+
        '<circle cx="'+lx.toFixed(1)+'" cy="'+ly.toFixed(1)+'" r="5" fill="none" stroke="'+col+'" stroke-width="2"/></svg></div></div>';
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
  var wr=st.winRate||0,tr=st.totalR||0;
  var rVal=(ws.totalR>0?'+':'')+(ws.totalR||'0')+'R';
  var hero='<div id="wt-hero" style="background:#111111;border-radius:28px;padding:24px;border:1px solid rgba(255,255,255,0.05);position:relative;overflow:hidden">'+
    '<div style="position:absolute;top:-100px;right:-80px;width:260px;height:260px;border-radius:50%;background:radial-gradient(circle,rgba(199,255,56,0.07) 0%,transparent 70%);pointer-events:none"></div>'+
    '<div style="position:absolute;top:0;left:12%;right:12%;height:1px;background:linear-gradient(90deg,transparent,rgba(199,255,56,0.15),transparent)"></div>'+
    '<div style="font-size:12px;font-weight:500;color:#7E7E7E;letter-spacing:-0.01em;margin-bottom:2px;position:relative;z-index:1">'+greeting()+'</div>'+
    '<div style="font-size:38px;font-weight:800;color:#FFF;letter-spacing:-0.04em;line-height:1;margin-bottom:20px;position:relative;z-index:1">SLAYERS.</div>'+
    '<div style="display:flex;align-items:center;position:relative;z-index:1;padding:16px 0 0;border-top:1px solid rgba(255,255,255,0.04)">'+
    '<div style="flex:1;text-align:center"><div style="font-size:22px;font-weight:800;letter-spacing:-0.02em;line-height:1;background:linear-gradient(180deg,#C7FF38,rgba(199,255,56,0.7));-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text">'+rVal+'</div><div style="font-size:8px;font-weight:600;color:#5F5F5F;text-transform:uppercase;letter-spacing:0.07em;margin-top:3px">Week R</div></div>'+
    '<div style="width:1px;height:28px;background:rgba(255,255,255,0.05);flex-shrink:0"></div>'+
    '<div style="flex:1;text-align:center"><div style="font-size:22px;font-weight:800;letter-spacing:-0.02em;line-height:1;background:linear-gradient(180deg,#FFF,rgba(255,255,255,0.7));-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text">'+(ws.winRate||wr)+'%</div><div style="font-size:8px;font-weight:600;color:#5F5F5F;text-transform:uppercase;letter-spacing:0.07em;margin-top:3px">Win Rate</div></div>'+
    '<div style="width:1px;height:28px;background:rgba(255,255,255,0.05);flex-shrink:0"></div>'+
    '<div style="flex:1;text-align:center"><div style="font-size:22px;font-weight:800;letter-spacing:-0.02em;line-height:1;background:linear-gradient(180deg,#FFF,rgba(255,255,255,0.7));-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text">'+state.active.length+'</div><div style="font-size:8px;font-weight:600;color:#5F5F5F;text-transform:uppercase;letter-spacing:0.07em;margin-top:3px">Active</div></div>'+
    '</div></div>';

  var mc=miniChart(state.journal);

  var mp='',confl=state.confluence||[];
  if(confl.length){
    var chips='';
    for(var ci=0;ci<Math.min(confl.length,11);ci++){
      var p=confl[ci],c=p.signalDir!=='NONE'?(p.signalDir==='BULLISH'?C.lime:C.red):p.weeklyBias==='BULLISH'?C.lime:p.weeklyBias==='BEARISH'?C.red:C.text2;
      mp+='<span class="pill-chip" style="background:'+C.surface+';border:0.5px solid '+C.border+';color:'+C.text2+'"><span style="width:5px;height:5px;border-radius:50%;background:'+c+';flex-shrink:0"></span>'+(p.name||p.id)+' <span style="font-size:8px;opacity:0.5">'+(p.signalDir!=='NONE'?'4H':'W')+'</span></span>';
    }
    mp='<div id="wt-pulse" style="display:flex;align-items:center;justify-content:space-between;margin:24px 0 12px">'+
      '<span style="font-size:12px;font-weight:600;color:#8E8E8E;letter-spacing:0.04em;text-transform:uppercase">Market Pulse</span>'+
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
      actCards+='<div class="card" style="flex-shrink:0;width:230px;padding:14px;cursor:pointer;margin-bottom:0" onclick="openDetail(&#39;'+t.sigId+'&#39;)">'+
        '<div style="display:flex;align-items:center;gap:6px;margin-bottom:8px"><span style="font-size:14px;font-weight:800;color:#FFF">'+t.instName+'</span>'+
        '<span style="font-size:8px;font-weight:700;padding:2px 6px;border-radius:3px;background:'+(isB?C.limeSoft:C.redSoft)+';color:'+col+'">'+(isB?'BUY':'SELL')+'</span></div>'+
        '<div style="display:flex;gap:12px;font-size:10px;color:rgba(255,255,255,0.3);margin-bottom:6px">'+
        '<div><div style="font-size:8px;font-weight:600">Entry</div><div style="font-size:12px;font-weight:700;color:#FFF">'+fmt(t.entryPrice||t.entry)+'</div></div>'+
        '<div><div style="font-size:8px;font-weight:600">SL</div><div style="font-size:12px;font-weight:700;color:'+col+'">'+fmt(t.sl)+'</div></div>'+
        '<div><div style="font-size:8px;font-weight:600">'+(t.tp1Fired?'TP1':'Goal')+'</div><div style="font-size:12px;font-weight:700;color:'+C.lime+'">'+fmt(t.tp1||t.tp2||'')+'</div></div></div>'+
        '<div style="height:2px;border-radius:1px;background:rgba(255,255,255,0.06);margin:6px 0;overflow:hidden"><div style="height:100%;background:'+col+';width:'+pct+'%;animation:fillBar 0.8s cubic-bezier(.16,1,.3,1)"></div></div>'+
        '<div style="display:flex;justify-content:space-between;font-size:8px;color:rgba(255,255,255,0.3)"><span>'+timeAgo(t.entryTime)+'</span><span style="color:'+col+';font-weight:600">'+(t.tp1Fired?'TP1 \u2713':t.beFired?'BE':t.slFired?'Stopped':'Active')+'</span></div></div>';
    }
    if(myAct.length)actCards='<div id="wt-active" style="display:flex;align-items:center;justify-content:space-between;margin:24px 0 12px">'+
      '<span style="font-size:12px;font-weight:600;color:#8E8E8E;letter-spacing:0.04em;text-transform:uppercase">Active Trades</span>'+
      '<span style="font-size:10px;color:'+C.lime+';opacity:0.6;font-weight:600">'+myAct.length+' active</span></div>'+
      '<div class="h-scroll">'+actCards+'</div>';
  }

  var filterIcon=state.showFilters?'\u25B2':'<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="'+C.text2+'" stroke-width="2"><line x1="4" y1="6" x2="20" y2="6"/><line x1="8" y1="12" x2="20" y2="12"/><line x1="12" y1="18" x2="20" y2="18"/></svg>';
  var sigHeader='<div id="wt-signals" style="display:flex;align-items:center;justify-content:space-between;margin:24px 0 12px">'+
    '<span style="font-size:12px;font-weight:600;color:#8E8E8E;letter-spacing:0.04em;text-transform:uppercase">Recent Signals</span>'+
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
    var criteriaChips=(s.criteria||[]).map(function(c){return '<span style="font-size:8px;padding:3px 8px;border-radius:6px;background:rgba(183,255,42,0.06);color:'+C.lime+';font-weight:600;border:0.5px solid rgba(183,255,42,0.15)">'+c+'</span>';}).join('');
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
      '<div onclick="event.stopPropagation();toggleTrack(&#39;'+s.id+'&#39;,'+!!isT+')" style="flex:1;display:flex;align-items:center;justify-content:center;gap:4px;padding:8px 0;border-radius:10px;background:'+C.lime+';color:#050505;font-size:10px;font-weight:700;cursor:pointer">'+icon(I.crosshair,'#050505',12)+(isT?'Tracking':'Track')+'</div>'+
      '<div onclick="event.stopPropagation();openDetail(&#39;'+s.id+'&#39;)" style="flex:1;display:flex;align-items:center;justify-content:center;gap:4px;padding:8px 0;border-radius:10px;background:rgba(255,255,255,0.04);color:#5F5F5F;font-size:10px;font-weight:600;cursor:pointer">'+icon(I.chart,'#5F5F5F',12)+'Chart</div>'+
      '<div onclick="event.stopPropagation();copyTrade(&#39;'+s.id+'&#39;)" style="flex:1;display:flex;align-items:center;justify-content:center;gap:4px;padding:8px 0;border-radius:10px;background:rgba(255,255,255,0.04);color:#5F5F5F;font-size:10px;font-weight:600;cursor:pointer">'+icon(I.copy,'#5F5F5F',12)+'Copy</div></div></div>';
  }
  if(!sigCount&&!state.signals.length)sigsHtml=emptyState('Waiting for market data...');

  return '<div style="display:flex;flex-direction:column;height:100%;background:'+C.bg+';position:relative">'+
    '<div id="wt-scroll" class="sc" style="flex:1;overflow-y:auto;padding:calc(30px + env(safe-area-inset-top)) 16px calc(100px + env(safe-area-inset-bottom));-webkit-overflow-scrolling:touch">'+
      hero+mc+mp+actCards+sigHeader+filterHtml+sigsHtml+
    '</div>'+navBar()+'</div>';
}

function navBar(){
  var tabs=['dash','journal','scalp','intel','settings'];
  var icons={dash:I.dash,journal:I.journal,scalp:I.pulse,intel:I.intel,settings:I.gear};
  var labels={dash:'Dash',journal:'Journal',scalp:'Scalp',intel:'Intel',settings:'Settings'};
  var html='<div class="nav-wrap"><div class="nav-inner">'+
    '<div class="nav-indicator" id="nvi" style="left:8px"></div>';
  for(var i=0;i<tabs.length;i++){
    var t=tabs[i],a=state.tab===t;
    var c=a?'#B7FF2A':'rgba(255,255,255,0.65)';
    var s=a?'scale(1.12)':'scale(1)';
    html+='<button class="nav-btn'+(a?' active':'')+'" data-tab="'+t+'" onclick="setTab(\''+t+'\')" style="transform:'+s+'">'+
      '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="'+c+'" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">'+icons[t]+'</svg>'+
      '<span class="label" style="color:'+c+'">'+labels[t]+'</span></button>';
  }
  return html+'</div></div>';
}

function scalpScreen(){
  var ss=state.scalpStats||{};
  var statsHtml='<div style="display:flex;gap:8px;margin-bottom:14px;margin-top:8px">'+
    '<div class="card" style="flex:1;text-align:center;padding:12px 8px;animation-delay:0s"><div style="font-size:9px;color:'+C.text2+'">WR</div><div class="count-up" style="font-size:18px;font-weight:800;color:'+C.lime+';margin-top:4px">'+(ss.winRate||0)+'%</div></div>'+
    '<div class="card" style="flex:1;text-align:center;padding:12px 8px;animation-delay:0s"><div style="font-size:9px;color:'+C.text2+'">Total R</div><div class="count-up" style="font-size:18px;font-weight:800;color:'+(ss.totalR>=0?C.lime:C.red)+';margin-top:4px">'+(ss.totalR>0?'+':'')+(ss.totalR||0)+'</div></div>'+
    '<div class="card" style="flex:1;text-align:center;padding:12px 8px;animation-delay:0s"><div style="font-size:9px;color:'+C.text2+'">Active</div><div class="count-up" style="font-size:18px;font-weight:800;color:'+C.white+';margin-top:4px">'+state.scalpActive.length+'</div></div></div>';
  var sigs=(state.scalpSignals||[]).map(function(s,i){
    var isB=s.type==='BULLISH'||s.direction==='LONG';var col=isB?C.lime:C.red;var bg=isB?C.limeSoft:C.redSoft;
    return '<div class="card" style="border-left:2.5px solid '+col+'" onclick="openScalpDetail(&#39;'+s.id+'&#39;)">'+
      '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">'+
      '<div style="display:flex;align-items:center;gap:6px"><span style="font-weight:800;font-size:14px;color:#FFF">'+(s.name||s.pair)+'</span>'+
      '<span style="font-size:8px;font-weight:700;padding:2px 6px;border-radius:3px;background:'+bg+';color:'+col+'">'+(isB?'BUY':'SELL')+'</span></div>'+
      '<span style="font-size:9px;color:'+C.text2+'">score '+s.score+'</span></div>'+
      '<div style="display:flex;gap:6px;font-size:10px;color:rgba(255,255,255,0.4)">'+
      '<span>Entry: <b style="color:#FFF">'+fmt(s.entry)+'</b></span><span>SL: <b style="color:'+C.red+'">'+fmt(s.sl)+'</b></span><span>TP: <b style="color:'+C.lime+'">'+fmt(s.takeProfit||s.tp2)+'</b></span></div>'+
      (s.fib?'<div style="font-size:9px;color:'+C.lime+';margin-top:4px">Fib: '+s.fib+' \u00b7 Vol: '+(s.volRatio||'')+'x</div>':'')+
      '<div style="display:flex;justify-content:space-between;margin-top:6px;padding-top:6px;border-top:0.5px solid rgba(255,255,255,0.04)">'+
      '<span style="font-size:8px;color:'+C.text3+'">'+timeAgo(s.time)+'</span>'+
      '<button onclick="event.stopPropagation();toggleTrack(&#39;'+s.id+'&#39;,'+!!(s.isTracked)+')" style="display:inline-flex;align-items:center;gap:3px;background:'+(s.isTracked?C.limeSoft:C.surface)+';border:0.5px solid '+(s.isTracked?C.lime:C.border)+';border-radius:99px;padding:3px 10px;font-size:8px;color:'+(s.isTracked?C.lime:C.text2)+';cursor:pointer;font-family:inherit;font-weight:600">'+icon(I.crosshair,s.isTracked?C.lime:C.text2,10)+(s.isTracked?'Tracking':'Track')+'</button></div></div>';
  }).join('');
  return '<div style="display:flex;flex-direction:column;height:100%;background:'+C.bg+';position:relative">'+
    '<div class="sc" style="flex:1;overflow-y:auto;padding:calc(30px + env(safe-area-inset-top)) 16px calc(100px + env(safe-area-inset-bottom));-webkit-overflow-scrolling:touch">'+
    '<div style="font-size:22px;font-weight:700;color:#FFF;margin-bottom:2px">Scalp</div>'+
    '<div style="font-size:12px;color:#5F5F5F;margin-bottom:20px">Session momentum + FVG breakout</div>'+
    statsHtml+(sigs||emptyState('No scalp signals yet'))+
    '</div>'+navBar()+'</div>';
}

function journalScreen(){
  var allEntries=state.journal||[];
  var now=Date.now();
  var cutDays={'1W':7,'2W':14,'1M':30,'3M':90,'6M':180}[state.journalTime];
  if(cutDays)allEntries=allEntries.filter(function(e){return now-new Date(e.createdAt||e.time||0).getTime()<cutDays*864e5;});
  function isW(e){return e.outcome==='WIN'||e.outcome==='TP1'||e.outcome==='TP2'||e.outcome==='TP';}
  function isL(e){return e.outcome==='SL'||e.outcome==='LOSS';}
  function isB(e){return e.outcome==='BE';}
  var tab=state.journalTab||'all';
  var entries=tab==='all'?allEntries.slice():tab==='wins'?allEntries.filter(isW):tab==='losses'?allEntries.filter(isL):tab==='be'?allEntries.filter(isB):tab==='notes'?allEntries.filter(function(e){return e.notes&&e.notes.trim();}):allEntries.slice();
  var wins=entries.filter(isW),losses=entries.filter(isL),bes=entries.filter(isB);
  var totalR=0,posR=0,negR=0,bestR=0,bestPair='',worstR=0,worstPair='',pairR={},dayR={};
  for(var si=0;si<entries.length;si++){
    var e=entries[si],rv=e.rMultiple||e.r||0;totalR+=rv;
    if(rv>0)posR+=rv;else if(rv<0)negR+=Math.abs(rv);
    if(rv>bestR){bestR=rv;bestPair=e.pair||'';}
    if(rv<worstR){worstR=rv;worstPair=e.pair||'';}
    var p=e.pair||'X';pairR[p]=(pairR[p]||0)+rv;
    var d=new Date(e.createdAt||e.time||0).getDay();dayR[d]=(dayR[d]||0)+rv;
  }
  var wr=wins.length+losses.length?Math.round(wins.length/(wins.length+losses.length)*100):0;
  var pf=negR?(posR/negR).toFixed(2):'\u221e';
  var expV=entries.length?(totalR/entries.length).toFixed(2):'0';

  // Win streak
  var winStreak=0,curStreak=0;
  for(var si=0;si<entries.length;si++){
    if(isW(entries[si])){curStreak++;if(curStreak>winStreak)winStreak=curStreak;}
    else curStreak=0;
  }

  // Drawdown & Sharpe
  var sorted=entries.slice().sort(function(a,b){return(a.createdAt||a.time||'').localeCompare(b.createdAt||b.time||'');});
  var cum=0,pts=[],peak=100,runs=100;
  var maxDD=0;
  for(var ei=0;ei<sorted.length;ei++){
    var rv_=sorted[ei].rMultiple||sorted[ei].r||0;
    cum+=rv_;pts.push(cum);
    runs+=rv_;
    if(runs>peak)peak=runs;
    var dd=((peak-runs)/peak)*100;
    if(dd>maxDD)maxDD=dd;
  }
  var drawdownPct=-maxDD;
  var mean=entries.length?totalR/entries.length:0;
  var sqDiffs=0;
  for(var si=0;si<entries.length;si++){
    var rv_=(entries[si].rMultiple||entries[si].r||0);
    sqDiffs+=(rv_-mean)*(rv_-mean);
  }
  var stdDev=Math.sqrt(sqDiffs/(entries.length||1));
  var sharpe=stdDev?(mean/stdDev)*Math.sqrt(365):0;
  var bestDays=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];var bD='\u2014',bDR=0;for(var k in dayR){if(dayR[k]>bDR){bDR=dayR[k];bD=bestDays[parseInt(k)];}}
  var bestP='\u2014',bPR=0;for(var k in pairR){if(pairR[k]>bPR){bPR=pairR[k];bestP=k;}}
  var avgRR=entries.length?Math.abs(totalR/(wins.length+losses.length||1)).toFixed(1):'\u2014';
  var peakEq=pts.length?100+Math.max.apply(null,pts):0;

  // Equity curve
  var eqSvg='';
  if(pts.length>1){
    var mn=Math.min(0,Math.min.apply(null,pts)),mx=Math.max(0,Math.max.apply(null,pts)),rg=mx-mn||1,eW=320,eH=64;
    function ey(v){return eH-6-((v-mn)/rg)*(eH-16);}
    function ex(i2){return(i2/(pts.length-1))*(eW-10)+5;}
    var ed='';for(var ei=0;ei<pts.length;ei++)ed+=(ei===0?'M':'L')+ex(ei).toFixed(1)+','+ey(pts[ei]).toFixed(1);
    var eC=cum>=0?C.lime:C.red;
    eqSvg='<div class="chart" style="height:64px;margin:8px 0 10px"><svg viewBox="0 0 '+eW+' '+eH+'" preserveAspectRatio="none" style="width:100%;height:100%;display:block">'+
      '<defs><linearGradient id="jeg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="'+eC+'" stop-opacity="0.12"/><stop offset="100%" stop-color="'+eC+'" stop-opacity="0"/></linearGradient></defs>'+
      '<path d="'+ed+'" fill="url(#jeg)"/>'+
      '<path d="'+ed+'" fill="none" stroke="'+eC+'" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>'+
      '<circle cx="'+ex(pts.length-1).toFixed(1)+'" cy="'+ey(cum).toFixed(1)+'" r="3" fill="'+eC+'"/></svg></div>';
  }

  // ====== TIME FILTER ======
  var times=['1W','2W','1M','3M','6M','ALL'];
  var timeHtml='<div style="display:flex;gap:4px;margin:0 0 14px;background:#121212;border-radius:99px;padding:3px">';
  for(var ti=0;ti<times.length;ti++){
    var a=state.journalTime===times[ti];
    timeHtml+='<button onclick="state.journalTime=\''+times[ti]+'\';state.journalTab=\'all\';render()" style="flex:1;border-radius:99px;padding:8px 0;font-size:10px;font-weight:600;font-family:inherit;cursor:pointer;background:'+(a?'#C7FF38':'transparent')+';color:'+(a?'#090909':'#5F5F5F')+';border:none;transition:all .2s;box-shadow:'+(a?'0 0 12px rgba(199,255,56,0.2)':'none')+'">'+times[ti]+'</button>';
  }
  timeHtml+='</div>';

  // ====== HEADER ======
  var header='<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px">'+
    '<div><div style="font-size:24px;font-weight:800;color:#FFF;letter-spacing:-0.04em">Journal</div>'+
    '<div style="font-size:11px;color:#5F5F5F;margin-top:4px">Every trade. Every lesson.</div></div>'+
    '<button onclick="toggleNotifPanel()" style="width:40px;height:40px;border-radius:99px;background:rgba(255,255,255,0.04);border:0.5px solid rgba(255,255,255,0.06);cursor:pointer;display:flex;align-items:center;justify-content:center;position:relative;flex-shrink:0">'+
      icon(I.bell,'#8E8E8E',16)+
      (unreadCount()?'<span style="position:absolute;top:-4px;right:-4px;min-width:18px;height:18px;border-radius:99px;background:#FF5252;color:#FFF;font-size:10px;font-weight:700;display:flex;align-items:center;justify-content:center;padding:0 5px;border:2px solid #090909">'+unreadCount()+'</span>':'')+
    '</button></div>';

  // ====== EQUITY HERO ======
  var equityHero='<div style="background:#111111;border-radius:20px;padding:20px;margin:14px 0;border:1px solid rgba(255,255,255,0.05);position:relative;overflow:hidden">'+
    '<div style="position:absolute;top:-80px;right:-60px;width:200px;height:200px;border-radius:50%;background:radial-gradient(circle,rgba(199,255,56,0.06) 0%,transparent 70%);pointer-events:none"></div>'+
    '<div style="display:flex;justify-content:space-between;align-items:flex-end;position:relative;z-index:1">'+
      '<div><div style="font-size:9px;color:#5F5F5F;font-weight:500;text-transform:uppercase;letter-spacing:0.06em">Total P&amp;L</div>'+
      '<div style="font-size:32px;font-weight:800;letter-spacing:-0.05em;line-height:1;color:'+(totalR>=0?C.lime:C.red)+'">'+(totalR>0?'+':'')+totalR.toFixed(1)+'<span style="font-size:14px;color:#5F5F5F;font-weight:600;margin-left:4px">R</span></div>'+
      '<div style="font-size:10px;color:#8E8E8E;margin-top:2px">Start: 100R \u00b7 Peak: '+(peakEq>100?'+':'')+(peakEq-100).toFixed(1)+'R</div></div>'+
      '<div style="display:flex;gap:14px">'+
        '<div style="text-align:right"><div style="font-size:12px;font-weight:700;color:'+C.lime+'">'+(bestR>0?'+':'')+bestR.toFixed(1)+'R</div><div style="font-size:7px;color:#5F5F5F;text-transform:uppercase;letter-spacing:0.05em;margin-top:1px">Best</div></div>'+
        '<div style="text-align:right"><div style="font-size:12px;font-weight:700;color:'+C.red+'">'+worstR.toFixed(1)+'R</div><div style="font-size:7px;color:#5F5F5F;text-transform:uppercase;letter-spacing:0.05em;margin-top:1px">Worst</div></div>'+
        '<div style="text-align:right"><div style="font-size:12px;font-weight:700;color:#FFF">'+winStreak+'</div><div style="font-size:7px;color:#5F5F5F;text-transform:uppercase;letter-spacing:0.05em;margin-top:1px">Streak</div></div>'+
      '</div></div>'+
    eqSvg+
    '<div style="display:flex;justify-content:space-between;margin-bottom:12px">'+
      '<span style="font-size:7px;color:#5F5F5F">Mon</span><span style="font-size:7px;color:#5F5F5F">Tue</span><span style="font-size:7px;color:#5F5F5F">Wed</span><span style="font-size:7px;color:#5F5F5F">Thu</span>'+
      '<span style="font-size:7px;color:#5F5F5F">Fri</span><span style="font-size:7px;color:#5F5F5F">Sat</span><span style="font-size:7px;color:#5F5F5F">Sun</span></div>'+
    '<div style="display:grid;grid-template-columns:1fr 1fr 1fr 1fr;gap:8px;padding-top:12px;border-top:0.5px solid rgba(255,255,255,0.05)">'+
      '<div><div style="font-size:7px;color:#5F5F5F;text-transform:uppercase;letter-spacing:0.05em">Drawdown</div><div style="font-size:10px;font-weight:700;margin-top:1px;color:'+C.red+'">'+drawdownPct.toFixed(1)+'%</div></div>'+
      '<div><div style="font-size:7px;color:#5F5F5F;text-transform:uppercase;letter-spacing:0.05em">Sharpe</div><div style="font-size:10px;font-weight:700;margin-top:1px;color:#FFF">'+sharpe.toFixed(2)+'</div></div>'+
      '<div><div style="font-size:7px;color:#5F5F5F;text-transform:uppercase;letter-spacing:0.05em">Avg R</div><div style="font-size:10px;font-weight:700;margin-top:1px;color:'+(mean>=0?C.lime:C.red)+'">'+(mean>0?'+':'')+mean.toFixed(2)+'R</div></div>'+
      '<div><div style="font-size:7px;color:#5F5F5F;text-transform:uppercase;letter-spacing:0.05em">Expectancy</div><div style="font-size:10px;font-weight:700;margin-top:1px;color:'+(parseFloat(expV)>=0?C.lime:C.red)+'">'+(parseFloat(expV)>0?'+':'')+expV+'R</div></div>'+
    '</div></div>';

  // ====== 2x2 STAT GRID ======
  var statsHtml='<div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin:0 0 14px">'+
    '<div style="background:#111111;border-radius:16px;padding:14px 16px;border:1px solid rgba(255,255,255,0.04)">'+
      '<div style="font-size:9px;color:#5F5F5F;font-weight:500;text-transform:uppercase;letter-spacing:0.06em">Win Rate</div>'+
      '<div style="font-size:22px;font-weight:800;color:#FFF;letter-spacing:-0.04em;line-height:1.1;margin-top:2px">'+wr+'<span style="font-size:12px;color:#5F5F5F;font-weight:600;margin-left:2px">%</span></div>'+
      '<div style="font-size:10px;color:#8E8E8E;margin-top:2px">'+wins.length+'W \u00b7 '+losses.length+'L \u00b7 '+bes.length+'BE</div></div>'+
    '<div style="background:#111111;border-radius:16px;padding:14px 16px;border:1px solid rgba(255,255,255,0.04)">'+
      '<div style="font-size:9px;color:#5F5F5F;font-weight:500;text-transform:uppercase;letter-spacing:0.06em">Profit Factor</div>'+
      '<div style="font-size:22px;font-weight:800;letter-spacing:-0.04em;line-height:1.1;margin-top:2px;color:'+(parseFloat(pf)>1?C.lime:'#FFF')+'">'+pf+'</div>'+
      '<div style="font-size:10px;color:#8E8E8E;margin-top:2px">Gross +'+posR.toFixed(1)+' / -'+negR.toFixed(1)+'</div></div>'+
    '<div style="background:#111111;border-radius:16px;padding:14px 16px;border:1px solid rgba(255,255,255,0.04)">'+
      '<div style="font-size:9px;color:#5F5F5F;font-weight:500;text-transform:uppercase;letter-spacing:0.06em">Total Trades</div>'+
      '<div style="font-size:22px;font-weight:800;color:#FFF;letter-spacing:-0.04em;line-height:1.1;margin-top:2px">'+(wins.length+losses.length+bes.length)+'</div>'+
      '<div style="font-size:10px;color:#8E8E8E;margin-top:2px">'+allEntries.filter(function(e){return e.notes&&e.notes.trim();}).length+' with notes</div></div>'+
    '<div style="background:#111111;border-radius:16px;padding:14px 16px;border:1px solid rgba(255,255,255,0.04)">'+
      '<div style="font-size:9px;color:#5F5F5F;font-weight:500;text-transform:uppercase;letter-spacing:0.06em">Avg Win</div>'+
      '<div style="font-size:22px;font-weight:800;letter-spacing:-0.04em;line-height:1.1;margin-top:2px;color:'+C.lime+'">'+(wins.length?'+'+posR.toFixed(2):'0')+'R</div>'+
      '<div style="font-size:10px;color:#8E8E8E;margin-top:2px">Avg Loss: '+(losses.length?'-'+((negR||0)/losses.length).toFixed(2):'0')+'R</div></div>'+
    '</div>';

  // ====== CATEGORY TABS ======
  var tabs=['all','wins','losses','notes'];
  var tabLabels={all:'All',wins:'Wins',losses:'Losses',notes:'Notes'};
  var tabCounts={all:allEntries.length,wins:allEntries.filter(isW).length,losses:allEntries.filter(isL).length,notes:allEntries.filter(function(e){return e.notes&&e.notes.trim();}).length};
  var tabHtml='<div style="display:flex;gap:4px;margin-bottom:14px;overflow-x:auto;scrollbar-width:none">';
  for(var ti=0;ti<tabs.length;ti++){
    var t=tabs[ti],a=tab===t;
    tabHtml+='<button onclick="state.journalTab=\''+t+'\';render()" style="flex-shrink:0;border:0.5px solid '+(a?'rgba(199,255,56,0.25)':'rgba(255,255,255,0.06)')+';border-radius:99px;padding:7px 16px;font-size:11px;font-weight:600;font-family:inherit;cursor:pointer;background:'+(a?'rgba(199,255,56,0.1)':'#121212')+';color:'+(a?C.lime:'#5F5F5F')+';transition:all .2s;white-space:nowrap">'+tabLabels[t]+' <span style="font-size:9px;color:'+(a?C.lime:'#5F5F5F')+';opacity:0.5">'+tabCounts[t]+'</span></button>';
  }
  tabHtml+='</div>';

  // ====== TRADE CARDS ======
  var displayEntries=entries;
  _journalDisplayEntries=displayEntries.slice();
  var cardsHtml='';
  for(var i=0;i<displayEntries.length;i++){
    var e=displayEntries[i],rv=e.rMultiple||e.r||0;
    var iw=isW(e),il=isL(e),ib=isB(e);
    var col=iw?C.lime:il?C.red:ib?C.text2:'rgba(255,255,255,0.3)';
    var dir=e.direction||'';
    var isBuy=dir==='BUY'||dir==='BULLISH';
    var dirCol=isBuy?C.lime:C.red;
    var dirBg=isBuy?'rgba(199,255,56,0.1)':'rgba(255,82,82,0.1)';
    var dirLabel=isBuy?'BUY':'SELL';
    var criteria=(e.criteria||[]).slice(0,5);
    var isBest=rv>=bestR&&rv>0;
    cardsHtml+='<div style="background:#111111;border-radius:16px;padding:12px 14px;margin-bottom:6px;border:1px solid rgba(255,255,255,0.04);cursor:pointer;transition:all .2s'+(isBest?';border-left:2.5px solid #C7FF38':'')+'" onclick="this.querySelector(\'.trade-expand\').classList.toggle(\'open\')">'+
      '<div style="display:flex;align-items:flex-start;gap:10px">'+
        '<div style="width:36px;height:36px;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:9px;font-weight:800;flex-shrink:0;letter-spacing:0.02em;background:'+dirBg+';color:'+dirCol+'">'+dirLabel+'</div>'+
        '<div style="flex:1;min-width:0">'+
          '<div style="font-size:13px;font-weight:700;letter-spacing:-0.02em;display:flex;align-items:center;gap:6px;color:#FFF">'+esc(e.pair||'')+
            (isBest?'<span style="font-size:6px;font-weight:700;padding:2px 4px;border-radius:3px;background:rgba(199,255,56,0.12);color:#C7FF38;text-transform:uppercase">BEST</span>':'')+
          '</div>'+
          '<div style="font-size:9px;color:#5F5F5F;margin-top:2px;display:flex;align-items:center;gap:6px">'+
            '<span>'+timeAgo(e.createdAt||e.time)+'</span>'+
            (e.tf?' \u00b7 <span>'+e.tf+'</span>':'')+
            ' \u00b7 <span>'+(e.notes?'Manual':'Auto')+'</span>'+
          '</div></div>'+
        '<div style="text-align:right;flex-shrink:0">'+
          '<div style="font-size:15px;font-weight:800;letter-spacing:-0.03em;line-height:1;color:'+col+'">'+(rv>0?'+':'')+rv+'R</div>'+
          '<div style="font-size:8px;font-weight:600;margin-top:1px;color:'+col+'">'+esc(e.outcome||'')+'</div></div></div>'+
      (criteria.length?'<div style="display:flex;gap:3px;margin-top:8px;flex-wrap:wrap">'+
        criteria.map(function(c){return '<span style="font-size:7px;padding:2px 7px;border-radius:4px;background:rgba(199,255,56,0.04);color:#8E8E8E;border:0.5px solid rgba(199,255,56,0.06)">'+esc(c)+'</span>';}).join('')+
        (e.criteria.length>5?'<span style="font-size:7px;padding:2px 7px;border-radius:4px;background:rgba(255,255,255,0.03);color:#5F5F5F">+'+(e.criteria.length-5)+'</span>':'')+
      '</div>':'')+
      '<div class="trade-expand">'+
        '<div style="padding-top:8px;border-top:0.5px solid rgba(255,255,255,0.05)">'+
          '<div style="display:grid;grid-template-columns:1fr 1fr;gap:4px 10px;margin-bottom:8px">'+
            (e.entry?'<div><div style="font-size:7px;color:#5F5F5F;text-transform:uppercase;letter-spacing:0.06em;font-weight:600">Entry</div><div style="font-size:10px;font-weight:600;font-family:monospace;color:#FFF;margin-top:1px">'+fmt(e.entry)+'</div></div>':'')+
            (e.sl?'<div><div style="font-size:7px;color:#5F5F5F;text-transform:uppercase;letter-spacing:0.06em;font-weight:600">Stop</div><div style="font-size:10px;font-weight:600;font-family:monospace;color:'+C.red+';margin-top:1px">'+fmt(e.sl)+'</div></div>':'')+
            (e.tp1?'<div><div style="font-size:7px;color:#5F5F5F;text-transform:uppercase;letter-spacing:0.06em;font-weight:600">TP1</div><div style="font-size:10px;font-weight:600;font-family:monospace;color:'+C.lime+';margin-top:1px">'+fmt(e.tp1)+'</div></div>':'')+
            (e.tp2?'<div><div style="font-size:7px;color:#5F5F5F;text-transform:uppercase;letter-spacing:0.06em;font-weight:600">TP2</div><div style="font-size:10px;font-weight:600;font-family:monospace;color:'+C.lime+';margin-top:1px">'+fmt(e.tp2)+'</div></div>':'')+
          '</div>'+
          (e.notes?'<div style="font-size:9px;color:#8E8E8E;line-height:1.5;padding:6px 10px;background:rgba(255,255,255,0.02);border-radius:8px;margin-bottom:8px"><div style="font-size:7px;color:#5F5F5F;text-transform:uppercase;letter-spacing:0.06em;font-weight:600;margin-bottom:3px">Journal Entry</div>'+esc(e.notes)+'</div>':'')+
          (!e.notes?'<div style="font-size:9px;color:#5F5F5F;padding:6px 10px;background:rgba(255,255,255,0.02);border-radius:8px;font-style:italic;margin-bottom:8px">No notes. <span style="color:'+C.lime+';font-style:normal">Add note</span></div>':'')+
          '<div style="display:flex;gap:6px">'+
            (e.entry&&e.direction?'<button onclick="event.stopPropagation();showTradeReplay('+i+')" style="flex:1;display:flex;align-items:center;justify-content:center;gap:4px;padding:6px 0;border-radius:8px;border:none;font-size:8px;font-weight:600;cursor:pointer;font-family:inherit;background:rgba(199,255,56,0.06);color:#C7FF38;border:0.5px solid rgba(199,255,56,0.15);transition:all .2s">'+icon(I.replay,'#C7FF38',9)+' Replay</button>':'')+
            '<button onclick="event.stopPropagation();openShareModal('+i+')" style="flex:1;display:flex;align-items:center;justify-content:center;gap:4px;padding:6px 0;border-radius:8px;border:none;font-size:8px;font-weight:600;cursor:pointer;font-family:inherit;background:rgba(199,255,56,0.06);color:#C7FF38;border:0.5px solid rgba(199,255,56,0.15);transition:all .2s">'+icon(I.share,'#C7FF38',9)+' Share</button>'+
            '<button onclick="event.stopPropagation();navigator.clipboard.writeText(\''+esc((e.direction||'')+' '+(e.pair||'')+' | Entry: '+(e.entry||'')+' | SL: '+(e.sl||'')+(e.tp1?' | TP1: '+(e.tp1||''):'')+(e.tp2?' | TP2: '+(e.tp2||''):''))+'").then(function(){showToast(\'Copied\');}).catch(function(){})" style="width:auto;display:flex;align-items:center;justify-content:center;padding:6px 8px;border-radius:8px;border:none;font-size:8px;font-weight:600;cursor:pointer;font-family:inherit;background:rgba(255,255,255,0.03);color:#8E8E8E;border:0.5px solid rgba(255,255,255,0.06);transition:all .2s" title="Copy">'+icon(I.copy,'#8E8E8E',9)+'</button>'+
          '</div></div></div>'+
    '</div>';
  }

  // ====== EMPTY STATE ======
  var empty='';
  if(!displayEntries.length){
    empty='<div style="display:flex;flex-direction:column;align-items:center;padding:60px 20px;text-align:center">'+
      '<div style="width:56px;height:56px;border-radius:99px;background:#111111;display:flex;align-items:center;justify-content:center;margin-bottom:16px;border:1px solid rgba(255,255,255,0.05)">'+
      '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#5F5F5F" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg></div>'+
      '<div style="font-size:16px;font-weight:600;color:#FFF;margin-bottom:6px">No trades yet</div>'+
      '<div style="font-size:12px;color:#5F5F5F;line-height:1.5;max-width:260px">Every great trading journal starts with the first disciplined execution.</div>'+
      '<button onclick="setTab(\'dash\')" style="margin-top:20px;background:#C7FF38;border:none;border-radius:14px;padding:14px 32px;color:#090909;font-weight:600;font-size:13px;font-family:inherit;cursor:pointer;box-shadow:0 0 24px rgba(199,255,56,0.15)">Start Trading</button></div>';
  }

  return '<div style="display:flex;flex-direction:column;height:100%;background:'+C.bg+';position:relative">'+
    '<div class="sc" style="flex:1;overflow-y:auto;padding:calc(34px + env(safe-area-inset-top)) 18px calc(100px + env(safe-area-inset-bottom));-webkit-overflow-scrolling:touch">'+
      header+timeHtml+equityHero+statsHtml+tabHtml+(cardsHtml||empty)+
    '</div>'+navBar()+'</div>';
}

function intelScreen(){
  var confl=state.confluence||[];
  var arts=state.articles||state.news||[];
  var activeTab=state.intelTab||'all';
  var sent={};
  if(confl.length){
    var bullP=confl.filter(function(p){return p.signalDir==='BULLISH'||p.weeklyBias==='BULLISH';}).length;
    var bearP=confl.filter(function(p){return p.signalDir==='BEARISH'||p.weeklyBias==='BEARISH';}).length;
    var dirT=bullP+bearP;
    sent.riskAppetite=dirT?Math.round(bullP/dirT*100):50;
    var usdP=confl.filter(function(p){return p.name&&p.name.indexOf('USD')>-1;});
    var usdB=usdP.filter(function(p){return p.signalDir==='BULLISH'||p.weeklyBias==='BULLISH';}).length;
    var usdBe=usdP.filter(function(p){return p.signalDir==='BEARISH'||p.weeklyBias==='BEARISH';}).length;
    sent.usdStrength=usdB+usdBe?Math.round(usdB/(usdB+usdBe)*100):50;
    var actC=(state.active||[]).length,sigC=(state.signals||[]).length,artC=arts.length;
    sent.fearGreed=Math.min(100,Math.round(actC*12+Math.min(sigC,20)*2+Math.min(artC,30)*1.2));
    sent.volatility=Math.min(100,Math.round(actC*10+Math.min(sigC,15)*3+Math.min(artC,20)*2));
  }
  var biasData=state.dailyBias||[];
  // confl already declared above

  // ====== HEADER ======
  var header='<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:2px">'+
    '<div><div style="font-size:24px;font-weight:700;color:#FFF;letter-spacing:-0.03em">Intel</div>'+
    '<div style="font-size:12px;color:#5F5F5F;margin-top:2px">Market intelligence & analysis</div></div>'+
    '<div style="display:flex;gap:10px">'+
      '<button style="width:40px;height:40px;border-radius:99px;background:rgba(255,255,255,0.04);border:0.5px solid rgba(255,255,255,0.06);cursor:pointer;display:flex;align-items:center;justify-content:center">'+icon(I.search,'#8E8E8E',16)+'</button>'+
      '<button style="width:40px;height:40px;border-radius:99px;background:rgba(255,255,255,0.04);border:0.5px solid rgba(255,255,255,0.06);cursor:pointer;display:flex;align-items:center;justify-content:center">'+icon(I.bell,'#8E8E8E',16)+'</button>'+
    '</div></div>';

  // ====== LAYER 1: MARKET PULSE ======
  var pulseHtml='';
  if(confl.length){
    var chips='';
    for(var ci=0;ci<Math.min(confl.length,12);ci++){
      var p=confl[ci],c=p.signalDir!=='NONE'?(p.signalDir==='BULLISH'?C.lime:C.red):p.weeklyBias==='BULLISH'?C.lime:p.weeklyBias==='BEARISH'?C.red:C.text2;
      var dirIcon=p.signalDir==='BULLISH'||p.weeklyBias==='BULLISH'?I.trendingUp:p.signalDir==='BEARISH'||p.weeklyBias==='BEARISH'?I.trendingDown:'';
      chips+='<div style="display:flex;align-items:center;gap:6px;padding:6px 12px;border-radius:99px;background:'+C.surface+';border:0.5px solid '+C.border+';flex-shrink:0;font-size:9px;font-weight:600;color:'+C.text2+'">'+
        (dirIcon?icon(dirIcon,c,10):'')+'<span>'+(p.name||p.id)+'</span></div>';
    }
    pulseHtml='<div style="margin-bottom:16px">'+
      '<div class="section-label" style="margin-bottom:8px">'+icon(I.activity,C.text2,10)+' Market Pulse</div>'+
      '<div class="h-scroll">'+chips+'</div></div>';
  }

  // ====== TRADING SESSIONS ======
  var now=new Date(),utcH=now.getUTCHours();
  var sessionDefs=[
    {name:'Sydney',open:22,close:7},{name:'Tokyo',open:0,close:9},
    {name:'London',open:8,close:17},{name:'New York',open:13,close:22}
  ];
  var sessHtml='<div class="h-scroll" style="gap:6px">';
  for(var si=0;si<sessionDefs.length;si++){
    var sd=sessionDefs[si],isActive=sd.open<=sd.close?utcH>=sd.open&&utcH<sd.close:utcH>=sd.open||utcH<sd.close;
    sessHtml+='<div style="display:flex;align-items:center;gap:6px;padding:6px 12px;border-radius:99px;background:'+(isActive?C.limeSoft:C.surface)+';border:0.5px solid '+(isActive?C.limeBorder:C.border)+';flex-shrink:0;font-size:9px;font-weight:'+(isActive?'600':'400')+';color:'+(isActive?C.lime:C.text2)+'">'+
      (isActive?'<span class="live-dot" style="width:5px;height:5px"></span>':'')+sd.name+'</div>';
  }
  sessHtml+='</div>';

  // ====== DAILY BIAS ======
  var pairsBias=biasData.length?biasData:null;
  var biasHtml='';
  if(pairsBias){
    biasHtml='<div style="margin-bottom:16px">'+
      '<div class="section-label" style="margin-bottom:10px">'+icon(I.target,C.text2,10)+' Daily Bias</div>'+
      '<div class="card" style="padding:14px;margin-bottom:0;border-radius:20px;background:#151515">';
    for(var bi=0;bi<pairsBias.length;bi++){
      var b=pairsBias[bi],bDir=b.dir||'NEUTRAL';
      var isBull=bDir==='BULLISH',isBear=bDir==='BEARISH';
      var bCol=isBull?C.lime:isBear?C.red:C.text2;
      var bIcon=isBull?I.arrowUp:isBear?I.arrowDown:'<circle cx="12" cy="12" r="2"/>';
      var conf=b.conf||50,confCol=conf>=70?C.lime:conf>=50?C.text2:C.red;
      biasHtml+='<div style="display:flex;align-items:center;gap:10px;padding:8px 0;'+(bi<pairsBias.length-1?'border-bottom:0.5px solid rgba(255,255,255,0.04)':'')+'">'+
        assetIcon(b.pair,22)+
        '<span style="flex:1;font-size:12px;font-weight:600;color:#FFF">'+esc(b.pair)+'</span>'+
        icon(bIcon,bCol,14)+
        '<div style="width:60px;height:4px;border-radius:99px;background:rgba(255,255,255,0.06);overflow:hidden">'+
          '<div style="height:100%;width:'+conf+'%;border-radius:99px;background:'+confCol+';transition:width .6s ease"></div></div>'+
        '<span style="font-size:10px;font-weight:600;color:'+confCol+';min-width:28px;text-align:right">'+conf+'%</span></div>';
    }
    biasHtml+='</div></div>';
  }

  // ====== SENTIMENT GAUGES ======
  var gaugeHtml='';
  if(sent&&sent.riskAppetite!=null){
    var gaugeDefs=[
      {key:'riskAppetite',label:'Risk Appetite'},{key:'fearGreed',label:'Fear & Greed'},
      {key:'usdStrength',label:'USD Strength'},{key:'volatility',label:'Volatility'}
    ];
    gaugeHtml='<div style="margin-bottom:16px">'+
      '<div class="section-label" style="margin-bottom:10px">'+icon(I.layers,C.text2,10)+' Sentiment</div>'+
      '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">';
    for(var gi=0;gi<gaugeDefs.length;gi++){
      var g=gaugeDefs[gi],val=sent[g.key]||0,circ=2*Math.PI*36,offset=circ*(1-Math.min(val,100)/100);
      var gCol=val>=60?C.lime:val>=40?C.text2:C.red;
      gaugeHtml+='<div class="card" style="display:flex;flex-direction:column;align-items:center;padding:16px 8px;margin-bottom:0;border-radius:20px;background:#151515">'+
        '<svg width="76" height="76" viewBox="0 0 100 100">'+
          '<circle cx="50" cy="50" r="36" fill="none" stroke="rgba(255,255,255,0.04)" stroke-width="6"/>'+
          '<circle cx="50" cy="50" r="36" fill="none" stroke="'+gCol+'" stroke-width="6" stroke-linecap="round" stroke-dasharray="'+circ+'" stroke-dashoffset="'+circ+'" transform="rotate(-90 50 50)"><animate attributeName="stroke-dashoffset" from="'+circ+'" to="'+offset+'" dur="1.2s" fill="freeze" calcMode="spline" keySplines=".16 1 .3 1"/></circle>'+
          '<text x="50" y="46" text-anchor="middle" fill="#FFF" font-size="20" font-weight="700">'+Math.round(val)+'</text>'+
          '<text x="50" y="66" text-anchor="middle" fill="#5F5F5F" font-size="7">%</text>'+
        '</svg>'+
        '<div style="font-size:9px;color:#5F5F5F;font-weight:500;margin-top:4px">'+g.label+'</div></div>';
    }
    gaugeHtml+='</div></div>';
  }

  // ====== LAYER 2: SLAYERS INTELLIGENCE ======
  var briefHtml='';
  try{
    var ws=state.weeklyStats||{},ac=state.active||[],sigs=state.signals||[],bf=state.briefing||{};
    var bullC=0,bearC=0;
    for(var xi=0;xi<confl.length;xi++){
      var d=confl[xi].signalDir||confl[xi].weeklyBias||'';
      if(d==='BULLISH')bullC++;else if(d==='BEARISH')bearC++;
    }
    var totC=bullC+bearC;
    var mktSent=totC?(bullC/totC>0.55?'bullish':bearC/totC>0.55?'bearish':'mixed'):'neutral';
    var usdStrong=(sent.usdStrength||50)>55;
    var volHigh=(sent.volatility||50)>62;
    var riskHigh=(sent.riskAppetite||50)>55;

    function activeSessionName(){
      var h=new Date().getUTCHours(),defs=[{n:'Sydney',o:22,c:7},{n:'Tokyo',o:0,c:9},{n:'London',o:8,c:17},{n:'New York',o:13,c:22}];
      for(var i=0;i<defs.length;i++){var s=defs[i];if(s.o<=s.c?h>=s.o&&h<s.c:h>=s.o||h<s.c)return s.n;}
      return'';
    }
    var sessN=activeSessionName();

    var overviewTxt=(bf&&(bf.overview||bf.marketOverview))||
      'Markets are trading in a '+mktSent+' bias as '+(usdStrong?'the USD holds firm':'USD faces selling pressure')+
      (ac.length?' with '+ac.length+' active trade'+(ac.length>1?'s':'')+'':'')+'. '+
      'Risk appetite is '+(riskHigh?'elevated':'cautious')+' ahead of the '+(sessN||'next')+' session.';

    var whyTxt=(bf&&(bf.why||bf.whyHappening))||
      (usdStrong?'The Dollar continues to draw support from '+(volHigh?'elevated yields and a hawkish rate outlook':'steady economic data and rate differentials')+
      '. This is weighing on EUR/USD and commodity currencies while keeping Gold under pressure.':
      'Dollar softness is driving a recovery in risk assets. Weaker USD momentum is providing a tailwind for Gold and EUR/USD.')+
      ' Equity futures reflect '+(riskHigh?'optimism':'caution')+' with '+(bullC>bearC?'more bullish':'bearish-leaning')+' market pulse signals.';

    var expectTxt=(bf&&(bf.expect||bf.whatToExpect))||
      'Expect '+(volHigh?'elevated':'moderate')+' volatility during '+(sessN||'the upcoming')+' session. '+
      (usdStrong?'If USD strength continues, expect further downside in Gold and EUR/USD.':
      'If USD weakness persists, look for Gold and EUR/USD to extend their recoveries.')+
      (ac.length?' Active trades need close monitoring — manage SL levels.':' Watch for fresh setups as new signals emerge.');

    function findAssetDir(kws){
      var best=null;
      for(var xi=0;xi<confl.length;xi++){
        var pn=confl[xi].name||confl[xi].id||'';
        for(var ni=0;ni<kws.length;ni++){if(pn.indexOf(kws[ni])>-1||kws[ni].indexOf(pn)>-1){if(!best)best=confl[xi];break;}}
      }
      if(!best)return'neutral';
      var dd=best.signalDir||best.weeklyBias||'';
      return dd==='BULLISH'?'bullish':dd==='BEARISH'?'bearish':'neutral';
    }

    var assets=[
      {l:'USD',k:['USD']},{l:'Gold',k:['XAU','GOLD']},{l:'Indices',k:['NAS100','US30','SPX500']},
      {l:'EUR',k:['EUR']},{l:'Bitcoin',k:['BTC']},{l:'GBP',k:['GBP']}
    ];
    var assetHtml='';
    for(var ai=0;ai<assets.length;ai++){
      var a=assets[ai],ad=findAssetDir(a.k);
      var aC=ad==='bullish'?C.lime:ad==='bearish'?C.red:C.text2,aS=ad==='bullish'?'\u2191':ad==='bearish'?'\u2193':'\u2192';
      var aL=ad==='bullish'?'Bullish':ad==='bearish'?'Bearish':'Neutral';
      assetHtml+='<div style="display:flex;align-items:center;justify-content:space-between;padding:5px 10px;border-radius:8px;background:rgba(255,255,255,0.02)">'+
        '<span style="font-size:10px;font-weight:700;color:#FFF">'+a.l+'</span>'+
        '<span style="font-size:9px;font-weight:600;color:'+aC+'">'+aS+' '+aL+'</span></div>';
    }

    function findPairsByDir(dir){
      var out=[];
      for(var xi=0;xi<confl.length;xi++){
        var dd=confl[xi].signalDir||confl[xi].weeklyBias||'';
        if(dd===dir)out.push(confl[xi].name||confl[xi].id);
      }
      return out;
    }
    var bulls=findPairsByDir('BULLISH'),bears=findPairsByDir('BEARISH');

    var avoidList=[];
    if(bears.length)avoidList.push('Counter-trend buys in '+bears.slice(0,2).join(' & ')+' while bearish momentum holds');
    else if(usdStrong)avoidList.push('Counter-trend Gold buys while USD momentum is strong');
    else avoidList.push('Chasing momentum into overbought levels without confirmation');
    if(volHigh)avoidList.push('Oversized positions with wide stops in high-volatility conditions');
    else avoidList.push('Low-volume breakouts ahead of the next major catalyst');
    if(bulls.length&&bears.length)avoidList.push('Adding to positions in '+bears[0]+' — mixed signals suggest range-bound risk');
    else if(usdStrong)avoidList.push('Short USD pairs near strong support levels');
    else avoidList.push('Fading strong directional moves without divergence confirmation');

    var focusList=[];
    if(usdStrong)focusList.push('USD strength continuation into '+(sessN||'NY')+' session');
    else focusList.push('USD weakness — look for long setups in EUR/USD and Gold');
    if(ac.length){var ba=ac[0];focusList.push('Manage active '+(ba.instName||ba.pair||'trade')+' — trail stops as price moves');}
    else if(bulls.length)focusList.push(bulls[0]+' long if key resistance breaks with volume');
    else focusList.push('Monitor EUR/USD for potential breakout above resistance');
    if(bears.length)focusList.push(bears[0]+' sell on rallies if bearish structure holds');
    else if(!usdStrong)focusList.push('Watch Gold for continuation above recent highs');
    else focusList.push('Monitor USD/JPY for trend continuation setup');
    focusList.push('Watch price action during '+(sessN||'London')+' — '+(bulls.length?'key levels to test':'potential setup brewing'));

    var confScore=Math.min(100,Math.max(0,Math.round((ws.winRate||65)*0.6+Math.min(sigs.length,10)*1.5+Math.min(ac.length,5)*2+(riskHigh?5:0))));
    var confLabel=confScore>=75?'High':confScore>=55?'Medium':'Low';
    var riskVal=sent.volatility||50;
    var riskLevel=riskVal>65?'High':riskVal>40?'Medium':'Low';
    var riskReason=riskLevel==='High'?'Elevated volatility':riskLevel==='Medium'?'Normal conditions':'Quiet session ahead';

    var watchPs=confl.slice(0,3);
    var quotes=[
      '"Don\'t force trades today. Let the market come to you."',
      '"Plan the trade, trade the plan. Stick to your levels."',
      '"The trend is your friend until the bend at the end."',
      '"Patience is a trader\'s edge. Wait for confirmation."',
      '"Manage risk first. Profits take care of themselves."',
      '"Sometimes the best trade is the one you don\'t take."'
    ];
    var qIdx=new Date().getDate()%quotes.length;

    briefHtml='<div style="margin-bottom:16px">'+
      '<div class="section-label" style="margin-bottom:10px">'+icon(I.sparkles,C.text2,10)+' Slayers Intelligence</div>'+
      '<div class="card" style="padding:20px;margin-bottom:0;border-radius:24px;background:#151515;position:relative;overflow:hidden;border:0.5px solid rgba(255,255,255,0.05)">'+
        '<div style="position:absolute;top:-60px;right:-60px;width:160px;height:160px;border-radius:50%;background:radial-gradient(circle,rgba(199,255,56,0.03),transparent 70%);pointer-events:none"></div>'+
        '<div style="display:flex;align-items:center;gap:8px;margin-bottom:2px">'+
          icon(I.eye,C.lime,14)+'<span style="font-size:10px;font-weight:700;color:#FFF">The Slayers Intelligence</span></div>'+
        '<div style="font-size:7px;color:#5F5F5F;margin-bottom:14px">Updated '+timeAgo(bf.updatedAt||lastRefreshTime)+'</div>'+

        '<div style="font-size:8px;font-weight:700;color:#5F5F5F;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:3px">\u2460 Market Overview</div>'+
        '<p style="font-size:11px;color:#CECECE;line-height:1.55;margin-bottom:12px">'+esc(overviewTxt)+'</p>'+

        '<div style="font-size:8px;font-weight:700;color:#5F5F5F;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:3px">\u2461 Why It\'s Happening</div>'+
        '<p style="font-size:11px;color:#CECECE;line-height:1.55;margin-bottom:12px">'+esc(whyTxt)+'</p>'+

        '<div style="font-size:8px;font-weight:700;color:#5F5F5F;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:3px">\u2462 What To Expect</div>'+
        '<p style="font-size:11px;color:#CECECE;line-height:1.55;margin-bottom:12px">'+esc(expectTxt)+'</p>'+

        '<div style="font-size:8px;font-weight:700;color:#5F5F5F;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:5px">\u2463 Asset Strength</div>'+
        '<div style="display:grid;grid-template-columns:1fr 1fr;gap:4px;margin-bottom:12px">'+assetHtml+'</div>'+

        '<div style="font-size:8px;font-weight:700;color:#5F5F5F;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:3px">\u2464 What To Avoid</div>'+
        avoidList.slice(0,3).map(function(l){return '<div style="display:flex;align-items:flex-start;gap:5px;font-size:9px;color:#8E8E8E;padding:3px 0"><span style="color:#FF5D5D;flex-shrink:0;font-weight:700;font-size:10px">\u2715</span> '+esc(l)+'</div>';}).join('')+
        '<div style="margin-bottom:10px"></div>'+

        '<div style="font-size:8px;font-weight:700;color:#5F5F5F;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:3px">\u2465 Today\'s Focus</div>'+
        focusList.slice(0,4).map(function(l){return '<div style="display:flex;align-items:flex-start;gap:5px;font-size:9px;color:#CECECE;padding:3px 0"><span style="color:#C7FF38;flex-shrink:0;font-weight:700;font-size:10px">\u2713</span> '+esc(l)+'</div>';}).join('')+
        '<div style="margin-bottom:12px"></div>'+

        '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:10px">'+
          '<div style="border-radius:12px;background:rgba(255,255,255,0.02);border:0.5px solid rgba(255,255,255,0.04);padding:10px;text-align:center">'+
            '<div style="font-size:7px;color:#5F5F5F;text-transform:uppercase;letter-spacing:0.04em;margin-bottom:2px">Confidence</div>'+
            '<div style="font-size:20px;font-weight:800;color:'+(confScore>=75?C.lime:confScore>=55?C.text2:C.red)+'">'+confScore+'%</div>'+
            '<div style="font-size:9px;font-weight:600;color:'+(confScore>=75?C.lime:confScore>=55?C.text2:C.red)+'">'+confLabel+'</div></div>'+
          '<div style="border-radius:12px;background:rgba(255,255,255,0.02);border:0.5px solid rgba(255,255,255,0.04);padding:10px;text-align:center">'+
            '<div style="font-size:7px;color:#5F5F5F;text-transform:uppercase;letter-spacing:0.04em;margin-bottom:2px">Risk</div>'+
            '<div style="font-size:20px;font-weight:800;color:'+(riskLevel==='High'?C.red:riskLevel==='Medium'?C.text2:C.lime)+'">'+riskLevel+'</div>'+
            '<div style="font-size:8px;color:#5F5F5F;margin-top:1px">'+riskReason+'</div></div>'+
        '</div>'+

        (watchPs.length?'<div style="display:flex;align-items:center;gap:6px;font-size:9px;color:#5F5F5F;margin-bottom:10px;flex-wrap:wrap">'+
          '<span style="font-weight:600;color:#8E8E8E">Session:</span> '+(sessN||'Sydney')+
          watchPs.map(function(p){return '<span style="padding:2px 8px;border-radius:4px;background:rgba(199,255,56,0.06);color:#C7FF38;font-weight:600;font-size:8px">'+(p.name||p.id||'')+'</span>';}).join('')+
        '</div>':'')+

        '<div style="font-size:10px;color:'+C.lime+';font-style:italic;line-height:1.4;padding-top:10px;border-top:0.5px solid rgba(255,255,255,0.06)">'+quotes[qIdx]+'</div>'+

      '</div></div>';
  }catch(e){}

  // ====== LAYER 3: NEWS FEED ======
  var catMap={
    'all':'All Intel','macro':'Macro','central_banks':'Central Banks','centralbank':'Central Banks',
    'currencies':'Currencies','forex':'Currencies','crypto':'Crypto','cryptocurrency':'Crypto',
    'indices':'Indices','index':'Indices','commodities':'Commodities','commodity':'Commodities',
    'energy':'Energy','oil':'Energy',
    'economy':'Economy','economic':'Economy','gdp':'Economy','inflation':'Economy',
    'geopolitical':'Geopolitical','geopolitics':'Geopolitical','politics':'Geopolitical','political':'Geopolitical'
  };
  var availCats={};
  for(var ai=0;ai<arts.length;ai++){
    var raw=(arts[ai].category||'General').toLowerCase().replace(/[^a-z0-9]/g,'_');
    var norm=catMap[raw]||null;
    if(norm)availCats[norm]=1;else availCats['All Intel']=availCats['All Intel']||0;
  }
  var catList=['All Intel'];
  for(var k in catMap){var n=catMap[k];if(n!=='All Intel'&&availCats[n]&&catList.indexOf(n)===-1)catList.push(n);}
  if(arts.length&&catList.length===1)catList=['All Intel'];
  var tabHtml='<div style="margin-bottom:16px">'+
    '<div class="section-label" style="margin-bottom:8px">'+icon(I.newspaper,C.text2,10)+' News Feed</div>'+
    '<div class="h-scroll" style="gap:0;padding:0">';
  for(var ti=0;ti<catList.length;ti++){
    var ck=catList[ti]==='All Intel'?'all':catList[ti].toLowerCase().replace(/[^a-z]/g,'');
    var isA=activeTab===ck;
    tabHtml+='<button onclick="switchIntelTab(\''+ck+'\')" style="position:relative;flex-shrink:0;padding:8px 14px;font-size:11px;font-weight:'+(isA?'700':'500')+';color:'+(isA?'#FFF':'#5F5F5F')+';background:transparent;border:none;cursor:pointer;font-family:inherit;white-space:nowrap;transition:color .2s">'+
      catList[ti]+(isA?'<div style="position:absolute;bottom:0;left:14px;right:14px;height:2px;border-radius:1px;background:'+C.lime+';box-shadow:0 0 8px rgba(183,255,42,0.4);animation:fadeIn .2s"></div>':'')+'</button>';
  }
  tabHtml+='</div></div>';

  var filtered=activeTab==='all'?arts:arts.filter(function(a){
    var raw=(a.category||'').toLowerCase().replace(/[^a-z0-9]/g,'_');
    var norm=catMap[raw]||'';
    return norm.toLowerCase().replace(/[^a-z]/g,'')===activeTab;
  });

  var items=filtered.slice(0,25).map(function(a,ai){
    var img=a.imageUrl||a.image||'';
    var imgHtml=img?'<img src="'+img+'" style="width:100%;height:100%;object-fit:cover;display:block">':
      '<div style="display:flex;align-items:center;justify-content:center;height:100%;background:'+C.surface+'">'+icon(I.newspaper,'#5F5F5F',20)+'</div>';

    return '<div class="card" style="padding:0;overflow:hidden;margin-bottom:12px;border-radius:20px;background:#151515">'+
      '<div style="display:flex;gap:12px;padding:14px">'+
        '<div style="width:100px;height:76px;border-radius:12px;overflow:hidden;flex-shrink:0;background:'+C.surface+'">'+imgHtml+'</div>'+
        '<div style="flex:1;min-width:0">'+
          '<div style="font-size:12px;font-weight:700;color:#FFF;line-height:1.35;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden">'+esc(a.title)+'</div>'+
          '<div style="font-size:10px;color:'+C.text2+';line-height:1.4;margin-top:4px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden">'+esc(a.summary||'').slice(0,120)+'</div>'+
          '<div style="display:flex;align-items:center;gap:8px;margin-top:6px;flex-wrap:wrap">'+
            (a.source?'<span style="font-size:7px;font-weight:600;padding:2px 6px;border-radius:4px;background:'+C.limeSoft+';color:'+C.lime+'">'+esc(a.source).toUpperCase()+'</span>':'')+
            '<span style="font-size:8px;color:#5F5F5F">'+timeAgo(a.time||a.publishedAt||a.createdAt)+'</span>'+
            '<span style="font-size:7px;font-weight:600;padding:2px 6px;border-radius:4px;background:rgba(255,255,255,0.04);color:'+C.text2+'">'+esc((a.category||'General').toUpperCase())+'</span>'+
          '</div></div>'+
      '</div>'+
      (a.link||a.url?'<a href="'+esc(a.link||a.url)+'" target="_blank" style="display:flex;align-items:center;justify-content:space-between;text-decoration:none;padding:10px 14px;border-top:0.5px solid rgba(255,255,255,0.04);font-size:9px;font-weight:600;color:'+C.lime+'">Read full article '+icon(I.chevronRight,C.lime,10)+'</a>':'')+
    '</div>';
  }).join('');

  // ====== ASSEMBLE ======
  var content=
    header+
    (pulseHtml||sessHtml?'<div style="height:2px;background:rgba(255,255,255,0.04);margin:16px 0 14px;border-radius:1px"></div>':'')+
    '<div class="section-label" style="margin-bottom:12px">'+icon(I.layers,C.text2,10)+' Market Snapshot</div>'+
    pulseHtml+
    '<div style="margin-bottom:16px">'+
      '<div class="section-label" style="margin-bottom:8px">'+icon(I.clock,C.text2,10)+' Sessions</div>'+
      sessHtml+
    '</div>'+
    biasHtml+
    gaugeHtml+
    '<div style="height:2px;background:rgba(255,255,255,0.04);margin:16px 0 14px;border-radius:1px"></div>'+
    briefHtml+
    '<div style="height:2px;background:rgba(255,255,255,0.04);margin:16px 0 14px;border-radius:1px"></div>'+
    tabHtml+
    (items||emptyState('No news for this category'))+
    '<div style="height:20px"></div>';

  return '<div style="display:flex;flex-direction:column;height:100%;background:'+C.bg+';position:relative">'+
    '<div class="sc" style="flex:1;overflow-y:auto;padding:calc(34px + env(safe-area-inset-top)) 18px calc(100px + env(safe-area-inset-bottom));-webkit-overflow-scrolling:touch">'+
      content+
    '</div>'+navBar()+'</div>';
}

function settingsScreen(){
  var prefs=state.notifPrefs||{};
  function tp(key,label,desc){
    var val=prefs[key];
    return '<div style="display:flex;align-items:center;gap:12px;padding:12px 14px;border-bottom:0.5px solid rgba(255,255,255,0.04)">'+
      '<div style="flex:1"><div style="font-size:13px;font-weight:600;color:#FFF">'+label+'</div>'+(desc?'<div style="font-size:9px;color:'+C.text2+'">'+desc+'</div>':'')+'</div>'+
      '<button onclick="toggleNotifPref(&#39;'+key+'&#39;)" style="width:44px;height:26px;border-radius:99px;background:'+(val?C.lime:'rgba(255,255,255,0.1)')+';border:none;position:relative;cursor:pointer;flex-shrink:0">'+
      '<div style="width:20px;height:20px;border-radius:99px;background:#FFF;position:absolute;top:2px;left:'+(val?'22px':'2px')+';transition:left 0.2s"></div></button></div>';
  }
  var pushBtns='';
  if(window.pushStatus==='subscribed')pushBtns='<div style="font-size:11px;color:'+C.lime+';text-align:center;padding:10px;font-weight:600">\u2713 Push active</div>'+
    '<button onclick="testPush()" style="width:100%;background:rgba(255,255,255,0.04);border:0.5px solid rgba(255,255,255,0.06);border-radius:14px;padding:12px 0;color:#8E8E8E;font-size:11px;font-weight:600;cursor:pointer;margin-top:6px;font-family:inherit">Send Test Notification</button>';
  else if(window.pushStatus==='denied')pushBtns='<div style="font-size:11px;color:'+C.red+';text-align:center;padding:10px">Push blocked</div>';
  else if(!swRegistration)pushBtns='<div style="font-size:11px;color:#5F5F5F;text-align:center;padding:10px">Setting up notifications...</div>';
  else if(typeof Notification!=='undefined'&&Notification.permission!=='denied')pushBtns='<button onclick="enablePush()" style="width:100%;background:#B7FF2A;border:none;border-radius:14px;padding:14px 0;color:#050505;font-weight:600;font-size:13px;cursor:pointer;margin-top:12px;font-family:inherit;box-shadow:0 0 20px rgba(183,255,42,0.2)">Enable Push</button>';
  return '<div style="display:flex;flex-direction:column;height:100%;background:'+C.bg+';position:relative">'+
    '<div class="sc" style="flex:1;overflow-y:auto;padding:calc(30px + env(safe-area-inset-top)) 16px calc(100px + env(safe-area-inset-bottom));-webkit-overflow-scrolling:touch">'+
    '<div style="font-size:22px;font-weight:700;color:#FFF;margin-bottom:2px">Settings</div>'+
    '<div style="font-size:12px;color:#5F5F5F;margin-bottom:20px">v10</div>'+
    '<div style="margin-bottom:16px"><div style="font-size:10px;font-weight:600;color:#5F5F5F;text-transform:uppercase;margin-bottom:8px;padding:0 4px;letter-spacing:0.04em">Notifications</div>'+
    '<div style="background:#151515;border-radius:22px;overflow:hidden;border:0.5px solid rgba(255,255,255,0.04)">'+
    tp('tradeAlerts','Trade Alerts','New QMR signals')+
    tp('scalpAlerts','Scalp Alerts','New scalp signals')+
    tp('newsAlerts','News Alerts','Daily news digest')+'</div>'+pushBtns+'</div>'+
    '<div style="margin-bottom:16px"><div style="font-size:10px;font-weight:600;color:#5F5F5F;text-transform:uppercase;margin-bottom:8px;padding:0 4px;letter-spacing:0.04em">Account</div>'+
    '<div style="background:#151515;border-radius:22px;overflow:hidden;border:0.5px solid rgba(255,255,255,0.04)">'+
    '<button onclick="startOnboarding()" style="width:100%;background:transparent;border:none;padding:16px 16px;color:#C7FF38;font-size:13px;font-weight:500;cursor:pointer;text-align:left;font-family:inherit">Restart Tour</button>'+
    '<div style="height:0.5px;background:rgba(255,255,255,0.04)"></div>'+
    '<button onclick="logout()" style="width:100%;background:transparent;border:none;padding:16px 16px;color:#FF5252;font-size:13px;font-weight:500;cursor:pointer;text-align:left;font-family:inherit">Disconnect / Logout</button></div></div>'+
    '<div style="text-align:center;padding:24px;color:#5F5F5F;font-size:9px">Made by REXROZ \u00b7 QMR</div>'+
    '</div>'+navBar()+'</div>';
}

function switchIntelTab(ck){
  var container=document.querySelector('[style*="overflow-y:auto"]');
  var saved=container?container.scrollTop:0;
  state.intelTab=ck;
  render();
  requestAnimationFrame(function(){
    var c=document.querySelector('[style*="overflow-y:auto"]');
    if(c&&saved)c.scrollTop=saved;
  });
}

function weeklyReportScreen(){
  var wd=state.weeklyReportData;
  if(!wd)return '<div class="sc" style="padding:16px"><div class="loading-spinner" style="margin:40% auto"></div></div>';
  var weekEnd=new Date().toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'});
  var r=wd.report||{},ms=wd.myStats||{};
  var totalR=ms.totalR||0,wr=ms.winRate||0,total=ms.total||0;
  var rLabel=totalR>=0?'+'+totalR.toFixed(1)+'':'';
  var wrBar='<div style="height:6px;border-radius:3px;background:rgba(255,255,255,0.06);overflow:hidden;margin:12px 0 6px"><div style="height:100%;width:'+wr+'%;border-radius:3px;background:linear-gradient(90deg,#B7FF2A,#7FFF00);transition:width 1s"></div></div>';
  var grade=wr>=80?'A':wr>=60?'B':wr>=40?'C':wr>=20?'D':'F';
  var gradeCol=grade==='A'?'#B7FF2A':grade==='B'?'#7FFF00':grade==='C'?'#FFD700':grade==='D'?'#FF8C00':'#FF5252';
  var aiMsg=wr>=80?'Excellent discipline. You followed the model perfectly — keep this up and 100K/month is inevitable.':
    wr>=60?'Solid execution. A few small mistakes but overall you stayed in control.':
    wr>=40?'Average performance. Review your losses — were you chasing or forcing trades?':
    wr>=20?'Below par. Take a step back, reduce size, and focus only on A+ setups.':
    'Tough week. Trust the process — every great trader has these. Rest, review, reset.';

  return '<div class="sc" style="padding:16px;background:#090909;min-height:100vh;display:flex;flex-direction:column;align-items:center">'+
    '<div style="width:100%;max-width:400px;position:relative">'+
      // Back button
      '<button onclick="setTab(\'dash\')" style="background:none;border:none;color:#8E8E8E;font-size:14px;padding:8px 0;margin-bottom:8px;cursor:pointer">\u2190 Dashboard</button>'+
      
      // Header with mascot
      '<div style="text-align:center;margin:8px 0 20px">'+
        '<img src="mascot.png" style="width:56px;height:56px;border-radius:50%;object-fit:cover;border:2px solid rgba(183,255,42,0.3);margin-bottom:8px" onerror="this.style.display=\'none\'">'+
        '<div style="font-size:20px;font-weight:700;color:#FFF">Weekly Report</div>'+
        '<div style="font-size:13px;color:#8E8E8E;margin-top:2px">Week ending '+esc(weekEnd)+'</div>'+
      '</div>'+

      // R-Multiple card
      '<div style="background:linear-gradient(135deg,#1A1A1A,#121212);border-radius:16px;padding:24px;margin-bottom:12px;border:1px solid rgba(255,255,255,0.06);text-align:center">'+
        '<div style="font-size:15px;color:#8E8E8E;margin-bottom:4px">Total R</div>'+
        '<div style="font-size:48px;font-weight:800;color:#B7FF2A;line-height:1.1">'+rLabel+'R</div>'+
        '<div style="font-size:13px;color:#5F5F5F;margin-top:2px">Across '+total+' trade'+(total!==1?'s':'')+'</div>'+
      '</div>'+

      // Win Rate card
      '<div style="background:#121212;border-radius:16px;padding:20px;margin-bottom:12px;border:1px solid rgba(255,255,255,0.06)">'+
        '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px">'+
          '<span style="font-size:15px;color:#8E8E8E">Win Rate</span>'+
          '<span style="font-size:24px;font-weight:700;color:#FFF">'+wr+'%</span>'+
        '</div>'+wrBar+
        '<div style="display:flex;justify-content:space-between;font-size:12px;color:#5F5F5F">'+
          '<span>'+ (ms.wins||0) + 'W</span><span>' + (ms.losses||0) + 'L</span><span>' + (ms.bes||0) + 'BE</span>'+
        '</div>'+
      '</div>'+

      // AI Coach section
      '<div style="background:#121212;border-radius:16px;padding:20px;margin-bottom:12px;border:1px solid rgba(255,255,255,0.06)">'+
        '<div style="display:flex;align-items:center;gap:8px;margin-bottom:12px">'+
          '<span style="font-size:28px;font-weight:700;color:'+gradeCol+'">'+grade+'</span>'+
          '<span style="font-size:13px;color:#8E8E8E">AI Coach Grade</span>'+
        '</div>'+
        '<div style="font-size:14px;color:#CCC;line-height:1.5">'+esc(aiMsg)+'</div>'+
      '</div>'+

      // Share button
      '<button onclick="shareWeeklyReport()" style="width:100%;padding:14px;border-radius:12px;border:1px solid rgba(183,255,42,0.3);background:transparent;color:#B7FF2A;font-size:15px;font-weight:600;margin-top:4px;cursor:pointer">Share Report</button>'+
    '</div>'+
  '</div>';
}

function shareWeeklyReport(){
  if(navigator.share){
    var wd=state.weeklyReportData;
    if(!wd)return;
    var ms=wd.myStats||{},r=ms.totalR||0,wr=ms.winRate||0,t=ms.total||0;
    navigator.share({title:'Weekly Trade Report',text:'\uD83D\uDCCA My trades this week: '+(r>=0?'+'+r.toFixed(1):r.toFixed(1))+'R \u00B7 '+wr+'% WR \u00B7 '+t+' trades'});
  }
}

// ===== NOTIFICATION HELPERS =====
function loadNotifs(){
  try{state.notifications=JSON.parse(localStorage.getItem('sl_notifs')||'[]');}catch(e){state.notifications=[];}
}
function saveNotifs(){
  try{localStorage.setItem('sl_notifs',JSON.stringify(state.notifications));}catch(e){}
}
function unreadCount(){
  return state.notifications.filter(function(n){return n.unread;}).length;
}
function addNotification(n){
  if(!n.id)n.id='notif_'+(Date.now())+'_'+Math.random().toString(36).slice(2,6);
  // Dedup by id
  for(var di=0;di<state.notifications.length;di++){if(state.notifications[di].id===n.id)return;}
  n.time=n.time||Date.now();
  n.unread=n.unread!==false;
  state.notifications.unshift(n);
  if(state.notifications.length>50)state.notifications=state.notifications.slice(0,50);
  saveNotifs();
}
function clearNotifs(){
  state.notifications=[];
  saveNotifs();
  if(state.showNotifPanel)closeNotifPanel();
  render();
}
function openNotif(id){
  var n=null;
  for(var i=0;i<state.notifications.length;i++){
    if(state.notifications[i].id===id){state.notifications[i].unread=false;n=state.notifications[i];break;}
  }
  saveNotifs();
  closeNotifPanel();
  render();
  if(n&&n.url&&n.url!=='/app/'){
    if(n.url.indexOf('#weekly-report')>-1){state.tab='weekly-report';render();}
    else if(n.url.indexOf('#')>-1){location.hash=n.url.split('#')[1];}
  }
}
function closeNotifPanel(){
  state.showNotifPanel=false;
  var p=document.getElementById('notifPanel');if(p)p.classList.remove('open');
  var o=document.getElementById('notifOverlay');if(o)o.classList.remove('open');
  setTimeout(function(){
    var p2=document.getElementById('notifPanel');if(p2)p2.remove();
    var o2=document.getElementById('notifOverlay');if(o2)o2.remove();
  },350);
}
function toggleNotifPanel(){
  var p=document.getElementById('notifPanel');
  if(p&&p.classList.contains('open')){closeNotifPanel();return;}
  state.showNotifPanel=true;
  var div=document.createElement('div');
  div.id='notifOverlay';
  div.style.cssText='position:fixed;top:0;left:0;right:0;bottom:0;z-index:999;background:rgba(9,9,9,0.6);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);opacity:0;transition:opacity .3s';
  div.onclick=closeNotifPanel;
  document.body.appendChild(div);
  var panel=document.createElement('div');
  panel.id='notifPanel';
  panel.style.cssText='position:fixed;bottom:0;left:0;right:0;z-index:1000;max-width:400px;margin:0 auto;background:#121212;border-radius:20px 20px 0 0;padding:0 0 env(safe-area-inset-bottom,16px);transform:translateY(100%);transition:transform .35s cubic-bezier(0.32,0.72,0,1);max-height:75vh;display:flex;flex-direction:column';
  var notifs=state.notifications;
  var listHtml='';
  if(notifs.length===0){
    listHtml='<div style="display:flex;flex-direction:column;align-items:center;padding:40px 20px;color:#5F5F5F;text-align:center">'+
      '<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#5F5F5F" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>'+
      '<div style="font-size:15px;font-weight:600;color:#8E8E8E;margin-bottom:4px">No notifications</div>'+
      '<div style="font-size:13px">Trade alerts and weekly reports will appear here.</div></div>';
  }else{
    for(var i=0;i<notifs.length;i++){
      var n=notifs[i];
      var ta=getTimeAgo(n.time);
      listHtml+='<div style="display:flex;gap:12px;padding:14px 0;border-bottom:0.5px solid rgba(255,255,255,0.04);cursor:pointer;position:relative'+(n.unread?';padding-left:16px':'')+'" onclick="openNotif(\''+n.id+'\')">'+
        (n.unread?'<div style="width:8px;height:8px;border-radius:50%;background:#B7FF2A;position:absolute;top:16px;left:0"></div>':'')+
        '<div style="width:40px;height:40px;border-radius:50%;background:'+(n.type==='trophy'?'rgba(183,255,42,0.12)':n.type==='trade'?'rgba(255,82,82,0.12)':n.type==='scalp'?'rgba(249,115,22,0.12)':'rgba(59,130,246,0.12)')+';flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:18px">'+(n.icon||'\uD83D\uDD14')+'</div>'+
        '<div style="flex:1;min-width:0">'+
          '<div style="font-size:14px;font-weight:600;color:'+(n.unread?'#B7FF2A':'#FFF')+';line-height:1.3">'+esc(n.title||'')+'</div>'+
          '<div style="font-size:13px;color:#8E8E8E;line-height:1.3;margin-top:2px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden">'+esc(n.body||'')+'</div>'+
          '<div style="font-size:11px;color:#5F5F5F;margin-top:4px">'+ta+'</div>'+
        '</div></div>';
    }
  }
  panel.innerHTML='<div style="width:36px;height:4px;border-radius:2px;background:rgba(255,255,255,0.12);margin:12px auto 8px;flex-shrink:0"></div>'+
    '<div style="display:flex;align-items:center;justify-content:space-between;padding:8px 20px 12px;flex-shrink:0">'+
      '<h3 style="font-size:17px;font-weight:700;color:#FFF;margin:0">Notifications'+(unreadCount()?' <span style="font-size:12px;color:#B7FF2A;font-weight:600">('+unreadCount()+')</span>':'')+'</h3>'+
      (notifs.length?'<button onclick="clearNotifs()" style="background:none;border:none;color:#FF5252;font-size:13px;font-weight:500;cursor:pointer;padding:4px 8px;border-radius:6px">Clear all</button>':'')+
    '</div>'+
    '<div style="flex:1;overflow-y:auto;padding:0 16px 8px;-webkit-overflow-scrolling:touch">'+listHtml+'</div>';
  document.body.appendChild(panel);
  requestAnimationFrame(function(){
    div.style.opacity='1';
    panel.style.transform='translateY(0)';
  });
}
function getTimeAgo(ts){
  var diff=Date.now()-ts;
  var mins=Math.floor(diff/60000);
  if(mins<1)return'Just now';
  if(mins<60)return mins+'m ago';
  var hrs=Math.floor(mins/60);
  if(hrs<24)return hrs+'h ago';
  var days=Math.floor(hrs/24);
  if(days<7)return days+'d ago';
  return Math.floor(days/7)+'w ago';
}
function render(){
  var app=document.getElementById('app');
  if(!window._sp)window._sp={};
  var oldSc=app.querySelector('.sc');
  if(oldSc&&state.tab)window._sp[state.tab]=oldSc.scrollTop;
  if(state.selected){app.innerHTML=detailPage(state.selected);void app.offsetWidth;return;}
  var t=state.tab||'dash';
  if(t==='dash'){app.innerHTML=overviewScreen();}
  else if(t==='journal'){app.innerHTML=journalScreen();}
  else if(t==='scalp'){app.innerHTML=scalpScreen();}
  else if(t==='intel'){app.innerHTML=intelScreen();}
  else if(t==='settings'){app.innerHTML=settingsScreen();}
  else if(t==='weekly-report'){app.innerHTML=weeklyReportScreen();}
  else{app.innerHTML=overviewScreen();}
  void app.offsetWidth;
  var newSc=app.querySelector('.sc');
  if(newSc&&window._sp[state.tab])requestAnimationFrame(function(){newSc.scrollTop=window._sp[state.tab];});
  positionNavIndicator();
}

function positionNavIndicator(){
  var indicator=document.getElementById('nvi');
  var activeBtn=document.querySelector('.nav-btn.active');
  if(!indicator||!activeBtn)return;
  var dock=activeBtn.closest('.nav-inner');
  if(!dock)return;
  var dockRect=dock.getBoundingClientRect();
  var btnRect=activeBtn.getBoundingClientRect();
  var offset=btnRect.left-dockRect.left;
  var indW=parseInt(getComputedStyle(indicator).width)||52;
  indicator.style.left=(offset+(btnRect.width-indW)/2)+'px';
}

function detailPage(s){
  var isB=s.type==='BULLISH'||s.type==='BUY',isE=s.tier==='ELITE',isD=s.dualEntry;
  var dir=isB?'BUY':'SELL',dirCol=isB?'#B7FF2A':'#FF5252',dirBg=isB?'rgba(183,255,42,0.12)':'rgba(255,82,82,0.12)';
  var entry=fmt(isD?s.aggEntry:s.entry),sl=fmt(isD?s.aggSl:s.sl);
  var tp1=fmt(s.tp1||(isD?s.aggTp1:null)),tp2=fmt(s.tp2||(isD?s.aggTp2:null));
  var eNum=parseFloat(entry),slNum=parseFloat(sl),tp1Num=parseFloat(tp1),tp2Num=parseFloat(tp2);
  var riskPips=Math.abs(eNum-slNum),rr=riskPips&&tp1Num?Math.abs(tp1Num-eNum)/riskPips:0;

  // Criteria explanations
  var critChips=(s.criteria||[]).map(function(c){return '<span class="chip" style="cursor:default">'+c+'</span>';}).join('');

  // Progress timeline
  var activeTrade=null;
  for(var ai=0;ai<state.active.length;ai++){if(state.active[ai].sigId===s.id){activeTrade=state.active[ai];break;}}
  var progressSteps=[
    {label:'Signal Generated',desc:'Trade signal created successfully.',done:true,ts:timeAgo(s.time)},
    {label:'Entry Triggered',desc:'Price entered the execution zone.',done:!!s.isTracked,ts:activeTrade?timeAgo(activeTrade.entryTime):''},
    {label:'TP1 Target',desc:activeTrade&&activeTrade.tp1Fired?'TP1 hit — partial profit taken.':'Waiting for first target.',done:!!(activeTrade&&activeTrade.tp1Fired)},
    {label:'Move SL to Breakeven',desc:activeTrade&&activeTrade.beFired?'Stop moved to breakeven.':'Pending.',done:!!(activeTrade&&activeTrade.beFired)},
    {label:'TP2 Target',desc:activeTrade&&activeTrade.tp2Fired?'TP2 hit — full runner closed.':'Pending.',done:!!(activeTrade&&activeTrade.tp2Fired)}
  ];
  var lastDone=-1;
  for(var pi=0;pi<progressSteps.length;pi++)if(progressSteps[pi].done)lastDone=pi;
  var progExp=_progExp[s.id]||{};
  var progHtml='<div style="display:flex;flex-direction:column">';
  for(var i=0;i<progressSteps.length;i++){
    var ps=progressSteps[i];
    progHtml+='<div style="display:flex;gap:18px">'+
      '<div style="display:flex;flex-direction:column;align-items:center;width:24px;flex-shrink:0">'+
        '<div style="width:24px;height:24px;border-radius:99px;flex-shrink:0;display:flex;align-items:center;justify-content:center;'+
          (ps.done?'background:#B7FF2A;border:none':'background:transparent;border:1.5px solid rgba(255,255,255,0.1)')+
          '">'+
          (ps.done?'<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#090909" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>':'')+
        '</div>'+
        (i<progressSteps.length-1?'<div style="width:1.5px;flex:1;margin:3px 0;background:'+(i<lastDone?'#B7FF2A':'rgba(255,255,255,0.06)')+'"></div>':'')+
      '</div>'+
      '<div style="flex:1;padding:2px 0'+(i<progressSteps.length-1?' 16px':'')+';cursor:pointer" onclick="toggleProgExp(\''+s.id+'\','+i+')">'+
        '<div style="font-size:15px;font-weight:600;color:'+(ps.done?'#FFF':'rgba(255,255,255,0.5)')+';line-height:1.3">'+esc(ps.label)+'</div>'+
        '<div style="font-size:13px;color:#8E8E8E;line-height:1.3;margin-top:1px">'+esc(ps.desc)+'</div>'+
        (ps.ts?'<div style="font-size:11px;color:#5F5F5F;margin-top:3px;'+(progExp[i]?'':'display:none')+'">'+esc(ps.ts)+'</div>':'')+
      '</div></div>';
  }
  progHtml+='</div>';

  // Strategy explanation
  var strategyParts=[];
  if(s.criteria&&s.criteria.length){
    if(s.criteria.indexOf('Liq Sweep')>-1)strategyParts.push('Liquidity was swept at a key level');
    if(s.criteria.indexOf('MSS')>-1)strategyParts.push('market structure shifted');
    if(s.criteria.indexOf('Displacement')>-1)strategyParts.push('a strong displacement candle confirmed the move');
    if(s.criteria.indexOf('FVG @ QM')>-1||s.criteria.indexOf('FVG at QM')>-1)strategyParts.push('a fair value gap at the QM level provided the entry zone');
    if(s.criteria.indexOf('Daily OB')>-1)strategyParts.push('the daily order block aligned with the direction');
    if(s.criteria.indexOf('Weekly Discount')>-1)strategyParts.push('price was in the weekly discount zone');
  }
  var strategy=strategyParts.length
    ?'Price action triggered this '+(isD?'dual-entry ':'')+s.tf+' QMR signal. '+strategyParts.join(', ')+'. '+(s.score?'Score: '+s.score+'/4 criteria confirmed.':'')+' This setup follows The Slayers model — combining liquidity, structure, and momentum for high-probability entries.'
    :'This '+(isD?'dual-entry ':'')+s.tf+' QMR signal was generated by The Slayers trading model. '+(s.score?'Score: '+s.score+'/4 criteria confirmed.':'')+' Follow the trade levels and manage risk accordingly.';

  // Warnings
  var warnings='';
  if(s.counterTrend)warnings+='<div style="display:flex;align-items:flex-start;gap:10px;background:rgba(255,82,82,0.06);border:0.5px solid rgba(255,82,82,0.15);border-radius:16px;padding:14px;margin-bottom:12px"><span style="font-size:14px;flex-shrink:0;margin-top:1px">\u26A0</span><div><div style="font-size:12px;font-weight:600;color:#FF5252;margin-bottom:2px">Counter-trend signal</div><div style="font-size:10px;color:#8E8E8E;line-height:1.4">'+(s.htfBias||'HTF bias')+' — consider reducing position size.</div></div></div>';
  if(s.rsiDivergence)warnings+='<div style="display:flex;align-items:flex-start;gap:10px;background:rgba(249,115,22,0.06);border:0.5px solid rgba(249,115,22,0.15);border-radius:16px;padding:14px;margin-bottom:12px"><span style="font-size:14px;flex-shrink:0;margin-top:1px">\uD83D\uDD25</span><div><div style="font-size:12px;font-weight:600;color:#f97316;margin-bottom:2px">RSI Divergence</div><div style="font-size:10px;color:#8E8E8E;line-height:1.4">'+s.rsiDivergence+'</div></div></div>';

  // Quick actions
  var trackBtnLabel=s.isTracked?'\u2713 Tracking':'Track';
  var trackBtnBg=s.isTracked?C.lime:'#0C0C0C';
  var trackBtnCol=s.isTracked?'#090909':'#8E8E8E';
  var trackBtnBdr=s.isTracked?'none':'0.5px solid rgba(255,255,255,0.04)';
  var trackBtnShad=s.isTracked?'none':'0 0 30px rgba(183,255,42,0.12)';

  // Mascot watermark
  var mascot='<div style="position:absolute;bottom:0;right:0;width:120px;height:140px;opacity:0.18;pointer-events:none;overflow:hidden">'+
    '<img src="/app/mascot.png" style="width:100%;height:100%;object-fit:contain;display:block;filter:brightness(1.4)">'+
    '</div>';

  // Chart image
  var chartImg='';
  if(isD){
    chartImg='<div class="card" style="padding:0;overflow:hidden;margin-bottom:16px">'+
      (s.aggChartUrl?'<img src="'+withCode(s.aggChartUrl)+'" style="width:100%;display:block">':'<div style="height:160px;background:#0C0C0C;display:flex;align-items:center;justify-content:center;color:#5F5F5F;font-size:11px;font-weight:500">Aggressive chart</div>')+
      '<div style="display:flex;gap:16px;padding:14px 20px;border-top:0.5px solid rgba(255,255,255,0.04)">'+
      '<div><div style="font-size:9px;color:#5F5F5F;margin-bottom:2px">Agg Entry</div><div style="font-size:13px;font-weight:600;color:#FFF">'+fmt(s.aggEntry)+'</div></div>'+
      '<div><div style="font-size:9px;color:#5F5F5F;margin-bottom:2px">SL</div><div style="font-size:13px;font-weight:600;color:#FF5252">'+fmt(s.aggSl)+'</div></div>'+
      '<div><div style="font-size:9px;color:#5F5F5F;margin-bottom:2px">TP</div><div style="font-size:13px;font-weight:600;color:#B7FF2A">'+fmt(s.aggTp2||s.aggTp1)+'</div></div></div>'+
      (s.consEntry?'<div style="padding:0 20px 14px;border-top:0.5px solid rgba(255,255,255,0.04)"><div style="font-size:9px;color:#5F5F5F;margin-bottom:6px;margin-top:10px">Conservative</div>'+
        (s.consChartUrl?'<img src="'+withCode(s.consChartUrl)+'" style="width:100%;border-radius:14px;margin-bottom:6px;display:block">':'')+
        '<div style="display:flex;gap:16px"><div><div style="font-size:9px;color:#5F5F5F;margin-bottom:2px">Entry</div><div style="font-size:13px;font-weight:600;color:#FFF">'+fmt(s.consEntry)+'</div></div>'+
        '<div><div style="font-size:9px;color:#5F5F5F;margin-bottom:2px">SL</div><div style="font-size:13px;font-weight:600;color:#FF5252">'+fmt(s.consSl)+'</div></div>'+
        '<div><div style="font-size:9px;color:#5F5F5F;margin-bottom:2px">TP</div><div style="font-size:13px;font-weight:600;color:#B7FF2A">'+fmt(s.consTp2||s.consTp1)+'</div></div></div></div>':'')+
      '</div>';
  }else{
    chartImg='<div class="card" style="padding:0;overflow:hidden;margin-bottom:16px">'+
      (s.chartUrl?'<img src="'+withCode(s.chartUrl)+'" style="width:100%;display:block">':'<div style="height:160px;background:#0C0C0C;display:flex;align-items:center;justify-content:center;color:#5F5F5F;font-size:11px;font-weight:500">Chart</div>')+
      '</div>';
  }

  return '<div style="display:flex;flex-direction:column;height:100%;background:#090909;position:relative">'+mascot+
    '<div style="flex:1;overflow-y:auto;padding:calc(30px + env(safe-area-inset-top)) 0 0;-webkit-overflow-scrolling:touch">'+

    // Header
    '<div style="display:flex;align-items:center;gap:12px;padding:0 20px 16px">'+
    '<button onclick="closeDetail()" style="background:#121212;border:0.5px solid rgba(255,255,255,0.06);border-radius:99px;width:36px;height:36px;display:flex;align-items:center;justify-content:center;cursor:pointer;color:#FFF;font-size:16px;flex-shrink:0">\u2190</button>'+
    '<div style="flex:1"><div style="font-weight:700;font-size:22px;color:#FFF;letter-spacing:-0.03em">'+s.pair+'<span style="font-weight:400;font-size:14px;color:#5F5F5F;margin-left:6px">'+s.tf+'</span></div>'+
    '<div style="font-size:11px;color:#5F5F5F;margin-top:1px">'+timeAgo(s.time)+' \u00b7 '+(s.system||'QMR')+'</div></div>'+
    '<div style="display:flex;flex-direction:column;gap:4px;align-items:flex-end">'+
    '<span style="font-size:8px;font-weight:700;padding:4px 10px;border-radius:6px;background:'+dirBg+';color:'+dirCol+'">'+dir+'</span>'+
    (isE?'<span style="font-size:8px;font-weight:600;padding:3px 8px;border-radius:6px;background:rgba(255,255,255,0.08);color:#FFF">ELITE</span>':'')+
    '</div></div>'+

    '<div style="padding:0 20px">'+

    // 1. Trade Overview Card
    '<div class="card" style="margin-bottom:16px;padding:0;overflow:hidden">'+
    '<div style="padding:20px;position:relative;overflow:hidden">'+
    '<div style="position:absolute;top:-40px;right:-40px;width:120px;height:120px;border-radius:50%;background:radial-gradient(circle,rgba(183,255,42,0.06),transparent 70%);pointer-events:none"></div>'+
    '<div class="row-l" style="padding:0 0 12px;border-bottom:0.5px solid rgba(255,255,255,0.04)"><span style="font-size:15px;font-weight:600;color:#FFF">'+s.pair+'</span><span style="font-size:11px;color:#5F5F5F">'+(isD?'Dual Entry':s.tier)+'</span></div>'+
    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;padding-top:12px">'+
    '<div><div style="font-size:9px;color:#5F5F5F;font-weight:500;margin-bottom:2px">Entry</div><div style="font-size:16px;font-weight:700;color:#FFF">'+entry+'</div></div>'+
    '<div><div style="font-size:9px;color:#5F5F5F;font-weight:500;margin-bottom:2px">Stop Loss</div><div style="font-size:16px;font-weight:600;color:#FF5252">'+sl+'</div></div>'+
    '<div><div style="font-size:9px;color:#5F5F5F;font-weight:500;margin-bottom:2px">TP1</div><div style="font-size:16px;font-weight:600;color:'+(tp1Num?'#B7FF2A':'#5F5F5F')+'">'+(tp1||'—')+'</div></div>'+
    '<div><div style="font-size:9px;color:#5F5F5F;font-weight:500;margin-bottom:2px">TP2</div><div style="font-size:16px;font-weight:600;color:'+(tp2Num?'#B7FF2A':'#5F5F5F')+'">'+(tp2||'—')+'</div></div>'+
    '</div>'+
    (rr>0?'<div style="display:flex;gap:20px;margin-top:14px;padding-top:12px;border-top:0.5px solid rgba(255,255,255,0.04)">'+
      '<div><div style="font-size:9px;color:#5F5F5F;font-weight:500;margin-bottom:2px">Risk:Reward</div><div style="font-size:14px;font-weight:700;color:#B7FF2A">1:'+rr.toFixed(1)+'</div></div>'+
      '<div><div style="font-size:9px;color:#5F5F5F;font-weight:500;margin-bottom:2px">Risk</div><div style="font-size:14px;font-weight:600;color:#FFF">'+riskPips.toFixed(s.tf==='1H'?0:2)+'</div></div>'+
      '<div><div style="font-size:9px;color:#5F5F5F;font-weight:500;margin-bottom:2px">Score</div><div style="font-size:14px;font-weight:700;color:'+(s.score&&s.score>=3?'#B7FF2A':'#FFF')+'">'+(s.score||'—')+'<span style="font-size:10px;color:#5F5F5F">/4</span></div></div>'+
    '</div>':'')+
    '</div></div>'+

    // 2. Chart (if available)
    chartImg+

    // 3. Progress Timeline
    '<div style="margin-bottom:16px"><div class="section-label">Trade Progress</div>'+
    '<div class="card" style="padding:24px;margin-bottom:0">'+progHtml+'</div></div>'+

    // 4. Criteria Chips
    (critChips?'<div style="margin-bottom:16px"><div class="section-label">Setup Criteria</div>'+
    '<div class="card" style="padding:20px;margin-bottom:0"><div style="display:flex;flex-wrap:wrap;gap:6px">'+critChips+'</div></div></div>':'')+

    // 5. Strategy Explanation
    '<div style="margin-bottom:16px"><div class="section-label">About This Setup</div>'+
    '<div class="card" style="padding:20px;margin-bottom:0;position:relative">'+
    '<div style="font-size:12px;color:#8E8E8E;line-height:1.7">'+strategy+'</div></div></div>'+

    // Warnings
    (warnings?'<div style="margin-bottom:16px">'+warnings+'</div>':'')+

    // 6. Quick Actions
    '<div style="margin-bottom:16px"><div class="section-label">Actions</div>'+
    '<div style="display:flex;gap:10px">'+
    '<button onclick="toggleTrack(&#39;'+s.id+'&#39;,'+!!s.isTracked+')" class="track-btn" style="background:'+trackBtnBg+';color:'+trackBtnCol+';border:'+trackBtnBdr+';box-shadow:'+trackBtnShad+'"><span style="display:inline-flex;align-items:center;gap:6px">'+icon(I.crosshair,trackBtnCol,14)+(s.isTracked?'\u2713':'')+' Track</span></button>'+
    '<button onclick="event.stopPropagation();openDetail(&#39;'+s.id+'&#39;)" class="action-btn"><span style="display:inline-flex;align-items:center;gap:6px;justify-content:center">'+icon(I.chart,'#8E8E8E',14)+'Chart</span></button>'+
    '<button onclick="event.stopPropagation();copyTrade(&#39;'+s.id+'&#39;)" class="action-btn"><span style="display:inline-flex;align-items:center;gap:6px;justify-content:center">'+icon(I.copy,'#8E8E8E',14)+'Copy</span></button>'+
    '</div></div>'+

    // Position calculator toggle
    '<button onclick="toggleCalc()" style="width:100%;background:#0C0C0C;border:0.5px solid rgba(255,255,255,0.04);border-radius:14px;padding:16px 0;color:#8E8E8E;font-weight:500;font-size:12px;cursor:pointer;margin-bottom:12px;font-family:inherit">'+(state.showCalc?'\u2212 Position Calculator':'Position Size Calculator')+'</button>'+
    (state.showCalc?'<div style="background:#121212;border:0.5px solid rgba(255,255,255,0.04);border-radius:24px;padding:20px;margin-bottom:16px">'+
      '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:14px">'+
      '<div><div style="color:#5F5F5F;font-size:9px;font-weight:500;margin-bottom:4px">Balance ($)</div><input id="pc-bal" type="number" value="1000" style="width:100%;background:#0C0C0C;border:0.5px solid rgba(255,255,255,0.04);border-radius:10px;padding:10px;color:#FFF;font-size:13px;box-sizing:border-box;outline:none;font-family:inherit"></div>'+
      '<div><div style="color:#5F5F5F;font-size:9px;font-weight:500;margin-bottom:4px">Risk %</div><input id="pc-rp" type="number" value="2" style="width:100%;background:#0C0C0C;border:0.5px solid rgba(255,255,255,0.04);border-radius:10px;padding:10px;color:#FFF;font-size:13px;box-sizing:border-box;outline:none;font-family:inherit"></div>'+
      '<div><div style="color:#5F5F5F;font-size:9px;font-weight:500;margin-bottom:4px">Entry</div><input id="pc-entry" type="number" step="any" value="'+entry+'" style="width:100%;background:#0C0C0C;border:0.5px solid rgba(255,255,255,0.04);border-radius:10px;padding:10px;color:#FFF;font-size:13px;box-sizing:border-box;outline:none;font-family:inherit"></div>'+
      '<div><div style="color:#5F5F5F;font-size:9px;font-weight:500;margin-bottom:4px">Stop Loss</div><input id="pc-sl" type="number" step="any" value="'+sl+'" style="width:100%;background:#0C0C0C;border:0.5px solid rgba(255,255,255,0.04);border-radius:10px;padding:10px;color:#FFF;font-size:13px;box-sizing:border-box;outline:none;font-family:inherit"></div>'+
      '<div style="grid-column:1/-1"><div style="color:#5F5F5F;font-size:9px;font-weight:500;margin-bottom:4px">TP (optional)</div><input id="pc-tp" type="number" step="any" value="'+(tp1||'')+'" style="width:100%;background:#0C0C0C;border:0.5px solid rgba(255,255,255,0.04);border-radius:10px;padding:10px;color:#FFF;font-size:13px;box-sizing:border-box;outline:none;font-family:inherit"></div>'+
      '</div><button onclick="calcPos()" style="width:100%;background:#B7FF2A;border:none;border-radius:14px;padding:14px 0;color:#090909;font-weight:600;font-size:13px;cursor:pointer;font-family:inherit">Calculate</button><div id="pc-r" style="margin-top:14px;display:none"></div></div>':'')+

    // Back button
    '<button onclick="closeDetail()" style="width:100%;background:#0C0C0C;border:0.5px solid rgba(255,255,255,0.04);border-radius:14px;padding:16px 0;color:#5F5F5F;font-size:12px;font-weight:500;cursor:pointer;margin-bottom:24px;font-family:inherit">\u2190 All Signals</button>'+

    '</div></div></div>';
}

function renderLogin(m){
  var app=document.getElementById('app');
  app.innerHTML='<div style="min-height:100dvh;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:calc(24px + env(safe-area-inset-top)) 24px calc(24px + env(safe-area-inset-bottom));text-align:center;background:#050505;color:#FFF">'+
    '<div style="font-weight:800;font-size:36px;letter-spacing:-1px;text-transform:uppercase;margin-bottom:2px">'+
    '<span style="color:#FFF">THE </span><span style="color:#B7FF2A;text-shadow:0 0 50px rgba(183,255,42,0.3)">SLAYERS.</span></div>'+
    '<div style="color:#5F5F5F;font-size:12px;font-weight:500;margin-bottom:40px">Signal Center</div>'+
    '<div style="background:#151515;border-radius:24px;width:100%;max-width:300px;padding:32px 24px;border:0.5px solid rgba(183,255,42,0.12);box-shadow:0 8px 40px rgba(0,0,0,0.4)">'+
    '<div style="font-size:14px;font-weight:600;color:#FFF;margin-bottom:16px">Access code</div>'+
    '<input id="ci" type="text" placeholder="SLAY-XXXXXX" autocapitalize="characters" autocomplete="off" style="width:100%;background:#0A0A0A;border:0.5px solid rgba(255,255,255,0.06);border-radius:14px;padding:14px;color:#FFF;font-size:16px;text-align:center;letter-spacing:2px;margin-bottom:16px;outline:none;font-family:monospace;box-sizing:border-box"/>'+
    (m?'<div style="color:#FF5252;font-size:12px;margin-bottom:14px">'+m+'</div>':'')+
    '<button id="lb" style="width:100%;background:#B7FF2A;border:none;border-radius:14px;padding:16px 0;color:#050505;font-weight:700;font-size:14px;cursor:pointer;font-family:inherit;box-shadow:0 0 20px rgba(183,255,42,0.2)">Unlock</button>'+
    '<div id="ls" style="color:#5F5F5F;font-size:11px;margin-top:16px"></div></div>'+
    '<div style="color:#5F5F5F;font-size:11px;margin-top:48px">Don\'t have a code? Message Rexroz on Telegram.</div></div>';
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

window.setTab=function(t){if(_rp)closeReplay();state.tab=t;state.selected=null;render();};
window.openDetail=function(id){state.showCalc=false;for(var i=0;i<state.signals.length;i++)if(state.signals[i].id===id){state.selected=state.signals[i];break;}render();};
window.closeDetail=function(){state.selected=null;state.showCalc=false;render();};
window.toggleCalc=function(){state.showCalc=!state.showCalc;render();};
window.toggleJournalExp=function(i){_journalExp[i]=!_journalExp[i];render();};
window.toggleProgExp=function(sid,i){if(!_progExp[sid])_progExp[sid]={};_progExp[sid][i]=!_progExp[sid][i];render();};
window.openScalpDetail=function(id){for(var i=0;i<state.scalpSignals.length;i++)if(state.scalpSignals[i].id===id){state.selected=state.scalpSignals[i];break;}render();};
window.logout=function(){if(confirm('Logout and clear code?')){clearCode();window.location.reload();}};
window.calcPos=calcPos;
window.toggleNotifPref=async function(key){
  var prefs=state.notifPrefs||{},nv=!prefs[key];prefs[key]=nv;
  localStorage.setItem('notifPrefs',JSON.stringify(prefs));
  try{
    await fetch(withCode('/api/member/notif-prefs'),{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({notifPrefs:prefs})});
    showToast((nv?'On: ':'Off: ')+key.replace(/([A-Z])/g,' $1').replace(/^./,function(s){return s.toUpperCase();}));
  }catch(e){showToast('Saved locally only');}
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
  if(!swRegistration){window.pushStatus='unsupported';render();return;}
  if(!getCode())return;
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
window.testPush=async function(){
  try{
    var r=await fetch(withCode('/api/test-push'),{method:'POST'});
    var d=await r.json();
    if(d.error){alert(d.error);}else{showToast('Test push sent');}
  }catch(e){alert('Could not send test.');}
};
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
  navigator.serviceWorker.register('/app/service-worker.js').then(function(reg){swRegistration=reg;if(getCode())checkPushStatus();}).catch(function(e){});
  navigator.serviceWorker.addEventListener('message',function(e){
    if(e.data&&e.data.type==='refresh'&&getCode())fetchAll(true);
  });
}
document.addEventListener('click',function(e){
  var btn=e.target.closest('.nav-btn');
  if(btn&&btn.dataset)return; // nav handled by onclick
});
document.addEventListener('focusin',function(e){var t=e.target.tagName;if(t==='INPUT'||t==='TEXTAREA'||t==='SELECT')state.userBusy=true;});
document.addEventListener('focusout',function(e){var t=e.target.tagName;if(t==='INPUT'||t==='TEXTAREA'||t==='SELECT')setTimeout(function(){state.userBusy=false;},200);});

// ====== REFRESH PILL ======
var refreshPill={
  active:false,el:null,iconEl:null,textEl:null,
  msgs:['Syncing Live Markets\u2026','Updating Signals\u2026','Checking Active Trades\u2026','Refreshing Dashboard\u2026'],
  create:function(){
    this.el=document.createElement('div');
    this.el.style.cssText='position:fixed;top:calc(12px + env(safe-area-inset-top));left:50%;transform:translateX(-50%) translateY(-20px);z-index:9999;display:none;align-items:center;gap:8px;background:#151515;border:1px solid rgba(183,255,42,0.2);border-radius:999px;padding:8px 16px;box-shadow:0 0 20px rgba(183,255,42,0.08),0 4px 24px rgba(0,0,0,0.3);pointer-events:none;opacity:0';
    this.iconEl=document.createElement('span');
    this.iconEl.style.cssText='display:flex;align-items:center;justify-content:center;width:16px;height:16px;flex-shrink:0;color:#B7FF2A';
    this.el.appendChild(this.iconEl);
    this.textEl=document.createElement('span');
    this.textEl.style.cssText='font-size:11px;font-weight:600;color:#FFF;white-space:nowrap';
    this.el.appendChild(this.textEl);
    document.body.appendChild(this.el);
  },
  show:function(){
    if(!this.el)this.create();
    this.active=true;
    this.el.style.display='flex';
    void this.el.offsetHeight;
    this.el.style.transition='opacity 0.35s cubic-bezier(.16,1,.3,1), transform 0.4s cubic-bezier(.16,1,.3,1)';
    this.el.style.opacity='1';
    this.el.style.transform='translateX(-50%) translateY(0)';
    this.iconEl.style.animation='refreshSpin 1.2s linear infinite';
    this.iconEl.innerHTML=I.refreshCw;
    this.iconEl.style.color='#B7FF2A';
    this.textEl.textContent=this.msgs[0];
    var self=this,i=0;
    if(this._timer)clearInterval(this._timer);
    this._timer=setInterval(function(){i=(i+1)%self.msgs.length;self.textEl.textContent=self.msgs[i];},2000);
  },
  complete:function(){
    if(!this.active)return;
    this.active=false;
    if(this._timer)clearInterval(this._timer);
    this.iconEl.style.animation='none';
    this.iconEl.innerHTML=I.checkCircle;
    this.iconEl.style.color='#B7FF2A';
    this.textEl.textContent='Live \u2022 Just Updated';
    var self=this;
    if(this._done)clearTimeout(this._done);
    this._done=setTimeout(function(){self.hide();},600);
  },
  hide:function(){
    if(!this.el)return;
    if(this._timer)clearInterval(this._timer);
    if(this._done)clearTimeout(this._done);
    this.active=false;
    this.el.style.transition='opacity 0.3s cubic-bezier(.16,1,.3,1), transform 0.35s cubic-bezier(.16,1,.3,1)';
    this.el.style.opacity='0';
    this.el.style.transform='translateX(-50%) translateY(-20px)';
    var self=this;
    setTimeout(function(){if(self.el)self.el.style.display='none';},350);
  }
};

// ===== SHARE CARDS =====
var _shareTradeIdx=-1;
var _shareStyle='poster';

function fmtR(n){return (n>=0?'+':'')+Math.abs(n).toFixed(2)+'R';}

function openShareModal(i){
  _shareTradeIdx=i;
  _shareStyle='poster';
  document.getElementById('shareOverlay').classList.add('open');
  renderSharePicker();
  renderShareCard();
}

function closeShareModal(){
  document.getElementById('shareOverlay').classList.remove('open');
}

function renderSharePicker(){
  var styles=[
    {id:'poster',label:'Trade Completed'},
    {id:'hero',label:'Hero'},
    {id:'minimal',label:'Minimal'},
    {id:'ticket',label:'Ticket'},
    {id:'certificate',label:'Certificate'},
    {id:'story',label:'Story'}
  ];
  var h='';
  for(var si=0;si<styles.length;si++){
    var s=styles[si];
    h+='<button class="share-btn'+(s.id===_shareStyle?' active':'')+'" onclick="selectShareStyle(\''+s.id+'\')">'+s.label+'</button>';
  }
  document.getElementById('sharePicker').innerHTML=h;
}

function selectShareStyle(s){
  _shareStyle=s;
  renderSharePicker();
  renderShareCard();
}

function getShareTradeData(){
  var entries=_journalDisplayEntries||[];
  var e=entries[_shareTradeIdx];
  if(!e)return null;
  var rv=e.rMultiple||e.r||0;
  var method=(e.tf?e.tf+' ':'')+'QMR';
  var durTxt='\u2014';
  if(e.createdAt&&e.exitTime){
    var ms=e.exitTime-(e.createdAt instanceof Date?e.createdAt.getTime():e.createdAt);
    if(ms>0){
      var h=Math.floor(ms/36e5),m=Math.floor((ms%36e5)/6e4);
      durTxt=(h?h+'h ':'')+m+'m';
    }
  }
  return {
    pair:e.pair||'',
    direction:e.direction||'',
    r:(rv>0?'+':'')+(rv||'0')+'R',
    rNum:rv||0,
    outcome:e.outcome||'',
    risk:'1R',
    duration:durTxt,
    entry:e.entry||'',
    exit:e.exit||'',
    criteria:(e.criteria||[]).slice(0,5),
    notes:e.notes||'',
    date:formatDate(e.createdAt||e.time),
    tradeNum:_shareTradeIdx+1,
    method:method,
    logged:e.notes?'Manual':'Auto'
  };
}

function renderShareCard(){
  var t=getShareTradeData();
  if(!t){document.getElementById('shareCardWrap').innerHTML='';return;}

  function barcodeSVG(){
    var bars='';
    for(var bi=0;bi<36;bi++){
      var h=12+Math.floor(Math.random()*20);
      bars+='<rect x="'+(bi*3)+'" y="'+(28-h)+'" width="2" height="'+h+'" fill="rgba(255,255,255,0.15)" rx="0.5"/>';
    }
    return '<svg width="108" height="32" viewBox="0 0 108 32" style="display:block">'+bars+'</svg>';
  }

  var builders={
    hero:function(){
      return '<div class="share-card" style="background:#111111;border-radius:24px;border:1px solid rgba(255,255,255,0.06);overflow:hidden;position:relative;width:100%;aspect-ratio:1/1;display:flex;flex-direction:column;padding:28px 24px 20px">'+
        '<div style="position:absolute;top:20px;left:20px;width:120px;height:120px;border-radius:50%;background:radial-gradient(circle,rgba(199,255,56,0.04) 0%,transparent 70%);pointer-events:none"></div>'+
        '<div style="display:flex;align-items:center;gap:10px;margin-bottom:20px">'+
          '<div style="width:36px;height:36px;border-radius:99px;overflow:hidden;border:0.5px solid rgba(255,255,255,0.06);flex-shrink:0"><img src="'+getMascotSrc()+'" style="width:100%;height:100%;object-fit:cover"></div>'+
          '<div>'+
            '<div style="font-size:7px;font-weight:700;letter-spacing:0.16em;text-transform:uppercase;color:#5F5F5F;line-height:1.2">THE SLAYERS</div>'+
            '<div style="font-size:8px;font-weight:500;color:#5F5F5F;letter-spacing:0.03em">TRADE COMPLETED</div>'+
          '</div>'+
        '</div>'+
        '<div style="display:inline-flex;align-items:center;gap:4px;font-size:7px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;padding:3px 10px;border-radius:99px;background:rgba(199,255,56,0.08);border:0.5px solid rgba(199,255,56,0.12);color:#C7FF38;align-self:flex-start;margin-bottom:14px">'+t.direction+'</div>'+
        '<div style="font-size:15px;font-weight:800;color:#FFF;letter-spacing:-0.03em;margin-bottom:8px">NEW HIGH</div>'+
        '<div style="font-size:52px;font-weight:900;letter-spacing:-0.04em;line-height:1;color:#C7FF38;margin-bottom:6px">'+fmtR(t.rNum)+'</div>'+
        '<div style="display:flex;align-items:center;gap:8px;margin-bottom:auto">'+
          '<span style="font-size:13px;font-weight:700;color:#FFF;letter-spacing:-0.02em">'+t.pair+'</span>'+
          '<span style="display:inline-flex;align-items:center;gap:3px;font-size:8px;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;padding:2px 8px;border-radius:99px;background:rgba(199,255,56,0.1);color:#C7FF38">'+t.outcome+'</span>'+
        '</div>'+
        '<div style="width:100%;height:0.5px;background:rgba(255,255,255,0.05);margin:12px 0 10px"></div>'+
        '<div style="display:flex;gap:24px">'+
          '<div><div style="font-size:7px;font-weight:600;color:#5F5F5F;text-transform:uppercase;letter-spacing:0.06em;margin-bottom:2px">Risk</div><div style="font-size:11px;font-weight:700;color:#FFF">'+t.risk+'</div></div>'+
          '<div><div style="font-size:7px;font-weight:600;color:#5F5F5F;text-transform:uppercase;letter-spacing:0.06em;margin-bottom:2px">Duration</div><div style="font-size:11px;font-weight:700;color:#FFF">'+t.duration+'</div></div>'+
          '<div><div style="font-size:7px;font-weight:600;color:#5F5F5F;text-transform:uppercase;letter-spacing:0.06em;margin-bottom:2px">Method</div><div style="font-size:11px;font-weight:700;color:#FFF">'+t.method+'</div></div>'+
        '</div>'+
        '<div style="display:flex;justify-content:space-between;align-items:center;margin-top:auto;padding-top:10px">'+
          '<div style="font-size:8px;color:#5F5F5F;font-style:italic;letter-spacing:0.02em">"'+t.notes.replace(/ \u2014 .*/,'')+'."</div>'+
          '<div style="width:22px;height:22px;border-radius:99px;overflow:hidden;border:0.5px solid rgba(255,255,255,0.06);flex-shrink:0"><img src="'+getMascotSrc()+'" style="width:100%;height:100%;object-fit:cover"></div>'+
        '</div>'+
      '</div>';
    },
    certificate:function(){
      var corner='<div style="position:absolute;width:16px;height:16px;border-color:rgba(199,255,56,0.1);border-style:solid;border-width:';
      return '<div class="share-card" style="background:#111111;border-radius:24px;border:1px solid rgba(255,255,255,0.06);overflow:hidden;position:relative;width:100%;aspect-ratio:1/1;display:flex;flex-direction:column;align-items:center;padding:32px 28px 24px;text-align:center">'+
        corner+'1px 0 0 1px;border-radius:3px 0 0 0;top:14px;left:14px;pointer-events:none"></div>'+
        corner+'1px 1px 0 0;border-radius:0 3px 0 0;top:14px;right:14px;pointer-events:none"></div>'+
        corner+'0 0 1px 1px;border-radius:0 0 0 3px;bottom:14px;left:14px;pointer-events:none"></div>'+
        corner+'0 1px 1px 0;border-radius:0 0 3px 0;bottom:14px;right:14px;pointer-events:none"></div>'+
        '<div style="position:relative;width:56px;height:56px;margin-bottom:12px">'+
          '<div style="position:absolute;inset:-4px;border-radius:50%;border:0.5px solid rgba(199,255,56,0.08)"></div>'+
          '<div style="width:56px;height:56px;border-radius:50%;overflow:hidden;border:0.5px solid rgba(199,255,56,0.12)"><img src="'+getMascotSrc()+'" style="width:100%;height:100%;object-fit:cover"></div>'+
        '</div>'+
        '<div style="font-size:8px;font-weight:700;letter-spacing:0.16em;text-transform:uppercase;color:#C7FF38;margin-bottom:2px">THE SLAYERS</div>'+
        '<div style="font-size:9px;font-weight:600;color:#5F5F5F;letter-spacing:0.06em;text-transform:uppercase;margin-bottom:14px">CERTIFIED TRADE</div>'+
        '<div style="font-size:9px;color:#8E8E8E;margin-bottom:2px">This certifies that</div>'+
        '<div style="font-size:20px;font-weight:800;color:#FFF;letter-spacing:-0.03em;margin:4px 0">'+t.pair+'</div>'+
        '<div style="font-size:9px;color:#8E8E8E;margin-bottom:2px">returned</div>'+
        '<div style="font-size:44px;font-weight:900;letter-spacing:-0.04em;line-height:1;color:#C7FF38;margin:6px 0">'+fmtR(t.rNum)+'</div>'+
        '<div style="font-size:9px;color:#5F5F5F;margin-bottom:2px">using</div>'+
        '<div style="font-size:12px;font-weight:700;color:#FFF;letter-spacing:0.02em;margin-bottom:3px">'+t.method+'</div>'+
        '<div style="width:36px;height:0.5px;background:rgba(199,255,56,0.12);margin:12px auto 10px"></div>'+
        '<div style="font-size:8px;color:#5F5F5F;margin-bottom:auto">'+t.date+'</div>'+
        '<div style="display:flex;align-items:center;gap:5px;margin-top:4px">'+
          '<div style="width:14px;height:14px;border-radius:99px;overflow:hidden;border:0.5px solid rgba(255,255,255,0.06)"><img src="'+getMascotSrc()+'" style="width:100%;height:100%;object-fit:cover"></div>'+
          '<span style="font-size:7px;font-weight:600;color:#5F5F5F;letter-spacing:0.12em;text-transform:uppercase">The Slayers</span>'+
        '</div>'+
      '</div>';
    },
    story:function(){
      return '<div class="share-card" style="background:#111111;border-radius:24px;border:1px solid rgba(255,255,255,0.06);overflow:hidden;position:relative;width:100%;aspect-ratio:9/16;display:flex;flex-direction:column">'+
        '<div style="position:absolute;inset:0;pointer-events:none"><img src="'+getMascotSrc()+'" style="width:100%;height:100%;object-fit:cover;opacity:0.08"></div>'+
        '<div style="position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,0.15) 0%,rgba(0,0,0,0.02) 40%,rgba(17,17,17,0.3) 70%,#111111 100%);pointer-events:none"></div>'+
        '<div style="position:relative;z-index:1;flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:40px 24px;text-align:center">'+
          '<div style="width:48px;height:48px;border-radius:99px;overflow:hidden;border:0.5px solid rgba(255,255,255,0.06);margin-bottom:14px"><img src="'+getMascotSrc()+'" style="width:100%;height:100%;object-fit:cover"></div>'+
          '<div style="font-size:8px;font-weight:600;color:#5F5F5F;letter-spacing:0.08em;text-transform:uppercase;margin-bottom:10px">TRADE COMPLETED</div>'+
          '<div style="font-size:60px;font-weight:900;letter-spacing:-0.05em;line-height:1;color:#FFF;margin-bottom:4px"><span style="color:#C7FF38">+</span>'+t.rNum.toFixed(2)+'<span style="font-size:28px;font-weight:700;color:#C7FF38">R</span></div>'+
          '<div style="font-size:15px;font-weight:600;color:#8E8E8E;letter-spacing:0.02em;margin-bottom:10px">'+t.pair+'</div>'+
          '<div style="display:inline-flex;align-items:center;gap:3px;font-size:8px;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;padding:3px 10px;border-radius:99px;background:rgba(199,255,56,0.08);border:0.5px solid rgba(199,255,56,0.12);color:#C7FF38">'+t.outcome+'</div>'+
        '</div>'+
        '<div style="position:relative;z-index:1;display:flex;justify-content:center;gap:28px;padding:14px 24px;border-top:0.5px solid rgba(255,255,255,0.04)">'+
          '<div style="text-align:center"><div style="font-size:7px;font-weight:600;color:#5F5F5F;text-transform:uppercase;letter-spacing:0.06em">Risk</div><div style="font-size:10px;font-weight:700;color:#FFF;margin-top:2px">'+t.risk+'</div></div>'+
          '<div style="text-align:center"><div style="font-size:7px;font-weight:600;color:#5F5F5F;text-transform:uppercase;letter-spacing:0.06em">Method</div><div style="font-size:10px;font-weight:700;color:#FFF;margin-top:2px">'+t.method+'</div></div>'+
          '<div style="text-align:center"><div style="font-size:7px;font-weight:600;color:#5F5F5F;text-transform:uppercase;letter-spacing:0.06em">Date</div><div style="font-size:10px;font-weight:700;color:#FFF;margin-top:2px">'+t.date.split(' ')[0]+'</div></div>'+
        '</div>'+
      '</div>';
    },
    ticket:function(){
      return '<div class="share-card" style="background:#111111;border-radius:20px;border:1px solid rgba(255,255,255,0.06);overflow:hidden;position:relative;width:100%;aspect-ratio:16/9;display:flex">'+
        '<div style="flex:1;padding:22px 20px;display:flex;flex-direction:column;position:relative">'+
          '<div style="position:absolute;top:-40px;left:-40px;width:140px;height:140px;border-radius:50%;background:radial-gradient(circle,rgba(199,255,56,0.025) 0%,transparent 70%);pointer-events:none"></div>'+
          '<div style="position:relative;z-index:1;display:flex;flex-direction:column;height:100%">'+
            '<div style="font-size:6px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:#5F5F5F;margin-bottom:8px">THE SLAYERS &bull; TRADE COMPLETED</div>'+
            '<div style="font-size:18px;font-weight:800;color:#FFF;letter-spacing:-0.03em;margin-bottom:4px">'+t.pair+'</div>'+
            '<div style="font-size:32px;font-weight:900;letter-spacing:-0.04em;line-height:1;color:#C7FF38;margin-bottom:auto">'+fmtR(t.rNum)+'</div>'+
            '<div style="font-size:8px;color:#5F5F5F;font-style:italic;letter-spacing:0.02em">"'+t.notes.replace(/ \u2014 .*/,'')+'."</div>'+
          '</div>'+
        '</div>'+
        '<div style="width:20px;display:flex;flex-direction:column;justify-content:space-between;padding:8px 0;flex-shrink:0">'+
          '<div style="width:20px;height:20px;border-radius:99px;background:#0A0A0A;flex-shrink:0"></div>'+
          '<div style="flex:1;width:2px;margin:0 auto;background:repeating-linear-gradient(180deg,rgba(255,255,255,0.05) 0,rgba(255,255,255,0.05) 4px,transparent 4px,transparent 8px)"></div>'+
          '<div style="width:20px;height:20px;border-radius:99px;background:#0A0A0A;flex-shrink:0"></div>'+
        '</div>'+
        '<div style="width:140px;padding:22px 16px;display:flex;flex-direction:column;flex-shrink:0">'+
          '<div style="font-size:7px;font-weight:600;color:#5F5F5F;text-transform:uppercase;letter-spacing:0.06em;margin-bottom:2px">Risk</div>'+
          '<div style="font-size:13px;font-weight:700;color:#FFF;margin-bottom:10px">'+t.risk+'</div>'+
          '<div style="font-size:7px;font-weight:600;color:#5F5F5F;text-transform:uppercase;letter-spacing:0.06em;margin-bottom:2px">Method</div>'+
          '<div style="font-size:13px;font-weight:700;color:#FFF;margin-bottom:10px">'+t.method+'</div>'+
          '<div style="font-size:7px;font-weight:600;color:#5F5F5F;text-transform:uppercase;letter-spacing:0.06em;margin-bottom:2px">Date</div>'+
          '<div style="font-size:13px;font-weight:700;color:#FFF;margin-bottom:auto">'+t.date+'</div>'+
          '<div style="align-self:flex-end;margin-top:4px">'+barcodeSVG()+'</div>'+
        '</div>'+
      '</div>';
    },
    minimal:function(){
      return '<div class="share-card" style="background:#111111;border-radius:24px;border:1px solid rgba(255,255,255,0.06);overflow:hidden;position:relative;width:100%;aspect-ratio:1/1;display:flex;flex-direction:column;align-items:center;padding:40px 32px;text-align:center">'+
        '<div style="font-size:7px;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;color:#5F5F5F;margin-bottom:auto;padding-top:12px">THE SLAYERS</div>'+
        '<div style="font-size:64px;font-weight:200;letter-spacing:-0.06em;line-height:1;color:#FFF;margin-bottom:4px"><span style="font-weight:200;color:#C7FF38">+</span>'+t.rNum.toFixed(2)+'R</div>'+
        '<div style="font-size:14px;font-weight:400;color:#5F5F5F;letter-spacing:0.02em;margin-bottom:10px">'+t.pair+'</div>'+
        '<div style="display:inline-flex;align-items:center;gap:3px;font-size:8px;font-weight:600;color:#C7FF38;letter-spacing:0.08em;text-transform:uppercase;margin-bottom:auto">'+t.outcome+'</div>'+
        '<div style="width:24px;height:0.5px;background:rgba(255,255,255,0.06);margin:0 auto 16px"></div>'+
        '<div style="display:flex;gap:28px;margin-bottom:12px">'+
          '<div><div style="font-size:7px;font-weight:600;color:#5F5F5F;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:2px">Status</div><div style="font-size:10px;font-weight:500;color:#8E8E8E">'+t.logged+'</div></div>'+
          '<div><div style="font-size:7px;font-weight:600;color:#5F5F5F;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:2px">Date</div><div style="font-size:10px;font-weight:500;color:#8E8E8E">'+t.date+'</div></div>'+
        '</div>'+
        '<div style="display:flex;align-items:center;gap:5px">'+
          '<div style="width:14px;height:14px;border-radius:99px;overflow:hidden;border:0.5px solid rgba(255,255,255,0.06)"><img src="'+getMascotSrc()+'" style="width:100%;height:100%;object-fit:cover"></div>'+
          '<span style="font-size:7px;font-weight:600;color:#5F5F5F;letter-spacing:0.12em;text-transform:uppercase">The Slayers</span>'+
        '</div>'+
      '</div>';
    },
    poster:function(){
      return '<div class="share-card" style="background:#0E0E0E;border-radius:24px;border:1px solid rgba(255,255,255,0.06);overflow:hidden;position:relative;width:100%;aspect-ratio:9/16;display:flex;flex-direction:column">'+
        '<div style="position:absolute;top:-20px;left:50%;transform:translateX(-50%);width:340px;height:340px;border-radius:50%;background:radial-gradient(circle,rgba(199,255,56,0.025) 0%,rgba(199,255,56,0.008) 40%,transparent 70%);pointer-events:none"></div>'+
        '<div style="position:absolute;top:0;left:0;right:0;height:70%;pointer-events:none">'+
          '<img src="'+getMascotSrc()+'" style="width:100%;height:100%;object-fit:cover;opacity:0.6">'+
        '</div>'+
        '<div style="position:absolute;top:50%;left:0;right:0;bottom:0;background:linear-gradient(180deg,transparent 0%,#0E0E0E 50%);pointer-events:none"></div>'+
        '<div style="position:absolute;top:40%;left:50%;transform:translateX(-50%);width:240px;height:200px;background:radial-gradient(ellipse at center,rgba(199,255,56,0.03) 0%,transparent 60%);pointer-events:none"></div>'+
        '<div style="position:relative;z-index:1;flex:1;display:flex;flex-direction:column;align-items:center;justify-content:flex-end;padding:0 24px 28px;text-align:center">'+
          '<div style="font-size:52px;font-weight:900;letter-spacing:-0.05em;line-height:1;color:#FFF;margin-bottom:2px"><span style="color:#C7FF38">+</span>'+t.rNum.toFixed(2)+'<span style="font-size:24px;font-weight:700;color:#C7FF38">R</span></div>'+
          '<div style="font-size:13px;font-weight:600;color:#8E8E8E;letter-spacing:0.02em;margin-bottom:8px">'+t.pair+'</div>'+
          '<div style="display:inline-flex;align-items:center;gap:3px;font-size:7px;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;padding:3px 10px;border-radius:99px;background:rgba(199,255,56,0.08);border:0.5px solid rgba(199,255,56,0.12);color:#C7FF38;margin-bottom:20px">'+t.outcome+'</div>'+
          '<div style="font-size:8px;color:#5F5F5F;margin-bottom:2px">'+t.date+'</div>'+
          '<div style="font-size:7px;font-weight:700;letter-spacing:0.16em;text-transform:uppercase;color:#5F5F5F">THE SLAYERS</div>'+
        '</div>'+
      '</div>';
    }
  };

  var cardHtml=builders[_shareStyle]();
  document.getElementById('shareCardWrap').innerHTML='<div class="share-card-preview" id="shareCardPreview">'+cardHtml+'</div>';
}

function formatDate(ts){
  if(!ts)return '\u2014';
  var d=new Date(ts);
  var months=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return d.getDate()+' '+months[d.getMonth()]+' '+d.getFullYear();
}

function prepCardForCapture(){
  var el=document.getElementById('shareCardPreview');
  if(!el)return null;
  // Clone off-screen to avoid scroll-container clipping (9:16 cards exceed modal height)
  var clone=el.cloneNode(true);
  var w=el.offsetWidth||360;
  clone.style.cssText='position:fixed;left:-9999px;top:0;width:'+w+'px;z-index:-1;';
  document.body.appendChild(clone);
  // Re-assign image sources so they load in the clone
  var imgs=clone.querySelectorAll('img');
  for(var ci=0;ci<imgs.length;ci++)imgs[ci].src=imgs[ci].src;
  return clone;
}
function cleanupCardClone(clone){if(clone&&clone.parentNode)clone.parentNode.removeChild(clone);}

function waitForEl(el){
  var imgs=el.querySelectorAll('img'),ps=[];
  for(var wi=0;wi<imgs.length;wi++){
    if(imgs[wi].complete)continue;
    ps.push(new Promise(function(res){imgs[wi].onload=res;imgs[wi].onerror=res;}));
  }
  return Promise.all(ps);
}

function captureAndDownload(){
  var el=document.getElementById('shareCardPreview');
  if(!el||!el.children.length)return;
  var clone=prepCardForCapture();
  if(!clone){showToast('Could not generate image');return;}
  waitForEl(clone).then(function(){
    html2canvas(clone,{backgroundColor:'#0A0A0A',scale:3,useCORS:true,allowTaint:true,logging:false}).then(function(canvas){
      cleanupCardClone(clone);
      var link=document.createElement('a');
      link.download='slayers-trade-'+_shareStyle+'.png';
      link.href=canvas.toDataURL('image/png');
      link.click();
      showToast('Image saved!');
    }).catch(function(){cleanupCardClone(clone);showToast('Could not generate image');});
  }).catch(function(){cleanupCardClone(clone);showToast('Could not generate image');});
}

function captureAndShare(){
  var el=document.getElementById('shareCardPreview');
  if(!el||!el.children.length)return;
  var clone=prepCardForCapture();
  if(!clone){showToast('Could not generate image');return;}
  waitForEl(clone).then(function(){
    html2canvas(clone,{backgroundColor:'#0A0A0A',scale:3,useCORS:true,allowTaint:true,logging:false}).then(function(canvas){
      cleanupCardClone(clone);
      canvas.toBlob(function(blob){
        if(!blob)return;
        if(navigator.share&&navigator.canShare({files:[new File([blob],'slayers-trade.png',{type:'image/png'})]})){
          navigator.share({files:[new File([blob],'slayers-trade.png',{type:'image/png'})]}).catch(function(){});
        } else {
          var link=document.createElement('a');
          link.download='slayers-trade-'+_shareStyle+'.png';
          link.href=canvas.toDataURL('image/png');
          link.click();
          showToast('Image saved!');
        }
      },'image/png');
    }).catch(function(){cleanupCardClone(clone);showToast('Could not generate image');});
  }).catch(function(){cleanupCardClone(clone);showToast('Could not generate image');});
}

function preloadMascot(){
  var img=new Image();
  img.onload=function(){
    var c=document.createElement('canvas');
    c.width=img.naturalWidth;
    c.height=img.naturalHeight;
    var ctx=c.getContext('2d');
    ctx.drawImage(img,0,0);
    _mascotData=c.toDataURL('image/png');
    if(document.getElementById('shareOverlay').classList.contains('open'))renderShareCard();
  };
  img.onerror=function(){};
  img.src='/app/mascot.png';
}

// Pull-to-refresh
var ptr={startY:0,dy:0,refreshing:false};
document.addEventListener('touchstart',function(e){
  if(ptr.refreshing)return;
  var s=e.target.closest('[style*="overflow-y:auto"]');
  if(!s||s.scrollTop>0)return;
  ptr.startY=e.touches[0].clientY;ptr.dy=0;
},{passive:true});
document.addEventListener('touchmove',function(e){
  if(!ptr.startY||ptr.refreshing)return;
  ptr.dy=e.touches[0].clientY-ptr.startY;
},{passive:true});
document.addEventListener('touchend',function(e){
  if(!ptr.startY)return;
  if(ptr.dy>70&&!ptr.refreshing){
    ptr.refreshing=true;
    refreshPill.show();
    fetchAll();
  }
  ptr.startY=0;ptr.dy=0;
},{passive:true});

// ===== WALKTHROUGH / ONBOARDING =====
var _wtSteps=[
  {
    id:'welcome',
    title:'Welcome to THE SLAYERS',
    body:"Let's show you around. This takes less than a minute.",
    skipable:true,
    label:'Start Tour',
    centered:true
  },
  {
    id:'dashboard',
    sel:'#wt-hero',
    title:'Dashboard',
    body:'This is your <strong>Dashboard</strong>.<br>It gives you an instant overview of:<br>\u2022 Weekly Performance<br>\u2022 Win Rate<br>\u2022 Active Trades<br><br>Everything important is here.',
    tip:'Tap the Dashboard card to continue'
  },
  {
    id:'equity',
    sel:'#wt-equity',
    title:'Equity Curve',
    body:'Your <strong>Equity Curve</strong> shows your consistency.<br><br>The goal isn\'t to win every trade.<br>The goal is <strong>steady growth</strong>.',
    tip:'Tap the chart to continue',
    onEnter:function(){
      var bars=document.querySelectorAll('#wt-equity svg path');
      if(bars.length)bars[bars.length-1].style.transition='opacity 1.5s, stroke 1.5s';
    }
  },
  {
    id:'pulse',
    sel:'#wt-pulse',
    title:'Market Pulse',
    body:'<strong>Market Pulse</strong> tells you what pairs are currently being monitored.<br><br>Green = bullish<br>Red = bearish<br><br>Tap any pair to view details.',
    tip:'Tap the Market Pulse section to continue'
  },
  {
    id:'active',
    sel:'#wt-active',
    title:'Active Trades',
    body:'Whenever a trade is active, it appears here.<br><br>You\'ll see:<br>\u2022 Entry<br>\u2022 SL<br>\u2022 TP<br>\u2022 Status<br><br>Live updates happen automatically.',
    tip:'Tap the Active Trades to continue'
  },
  {
    id:'signals',
    sel:'#wt-signals',
    title:'Recent Signals',
    body:'Every signal generated by <strong>The Slayers</strong> appears here.<br><br>Tap a signal to see the full analysis.',
    tip:'Tap Recent Signals to continue'
  },
  {
    id:'nav',
    sel:'.nav-inner',
    title:'Bottom Navigation',
    body:'',
    isNav:true,
    items:[
      {tab:'dash',label:'Dashboard',desc:'Your trading home.'},
      {tab:'journal',label:'Journal',desc:'Track every trade.'},
      {tab:'scalp',label:'Scalp',desc:'Fast opportunities.'},
      {tab:'intel',label:'Intel',desc:'Market news and analysis.'},
      {tab:'settings',label:'Settings',desc:'Customize your experience.'}
    ]
  }
];

var _wtIdx=-1;
var _wtNavSub=0;
var _wtTapEl=null;

function startOnboarding(){
  state.showOnboarding=true;
  state.onboardingStep=-1;
  try{localStorage.removeItem('wt_done');}catch(e){}
  if(state.tab!=='dash')setTab('dash');
  var ov=document.getElementById('wtOverlay');
  if(!ov)return;
  ov.style.display='';
  document.getElementById('wtFinal').classList.remove('open');
  ov.classList.add('open');
  _wtGoTo(0);
}

function endOnboarding(completed){
  var ov=document.getElementById('wtOverlay');
  ov.classList.remove('open');
  ov.style.display='none';
  document.getElementById('wtFinal').classList.remove('open');
  state.showOnboarding=false;
  state.onboardingStep=-1;
  _wtNavSub=0;
  _wtRemoveTap();
  if(completed)try{localStorage.setItem('wt_done','1');}catch(e){}
}

function _wtGoTo(idx){
  if(idx>=_wtSteps.length){_wtShowFinal();return;}
  _wtRemoveTap();
  _wtIdx=idx;
  state.onboardingStep=idx;
  var s=_wtSteps[idx];
  var ov=document.getElementById('wtOverlay');
  var hl=document.getElementById('wtHighlight');
  var bubble=document.getElementById('wtBubble');

  if(s.centered){
    hl.style.display='none';
    bubble.style.position='fixed';
    bubble.style.top='50%';
    bubble.style.left='50%';
    bubble.style.transform='translate(-50%,-50%)';
    bubble.style.maxWidth='300px';
    document.getElementById('wtSkip').style.display=s.skipable?'block':'none';
    document.getElementById('wtTitle').style.fontSize='18px';
    document.getElementById('wtTitle').textContent=s.title;
    document.getElementById('wtBody').innerHTML=s.body;
    document.getElementById('wtTapHint').textContent='';
    document.getElementById('wtNext').textContent=s.label||'Next';
    _wtDots();
    return;
  }

  document.getElementById('wtTitle').style.fontSize='13px';
  document.getElementById('wtSkip').style.display='block';
  bubble.style.position='absolute';
  bubble.style.transform='none';
  bubble.style.maxWidth='280px';

  if(s.isNav){
    _wtNavSub=0;
    _wtNavStep(0);
    return;
  }

  var target=s.sel?document.querySelector(s.sel):null;
  if(!target){
    _wtGoTo(idx+1);
    return;
  }

  // Scroll into view
  var sc=document.getElementById('wt-scroll');
  if(sc){
    var tRect=target.getBoundingClientRect();
    var sRect=sc.getBoundingClientRect();
    if(tRect.top<sRect.top+20||tRect.bottom>sRect.bottom-20){
      sc.scrollTo({top:sc.scrollTop+(tRect.top-sRect.top-60),behavior:'smooth'});
    }
  }

  // Position highlight
  hl.style.display='block';
  hl.className='wt-highlight glow';
  _wtPosEl(hl,target,6);

  // Position bubble
  _wtPosBubble(bubble,target);

  document.getElementById('wtTitle').textContent=s.title;
  document.getElementById('wtBody').innerHTML=s.body;
  document.getElementById('wtTapHint').textContent=s.tip||'';
  document.getElementById('wtNext').textContent='Next';

  // Tap target
  if(s.sel){
    var tapEl=document.querySelector(s.sel);
    if(tapEl){
      _wtTapEl=tapEl;
      _wtTapEl.style.cursor='pointer';
      _wtTapEl._wtNext=function(){_wtGoTo(_wtIdx+1);};
      _wtTapEl.addEventListener('click',_wtTapEl._wtNext);
    }
  }

  _wtDots();
  if(s.onEnter)s.onEnter();
}

function _wtNavStep(sub){
  var s=_wtSteps[_wtIdx];
  if(sub>=s.items.length){_wtGoTo(_wtIdx+1);return;}
  _wtNavSub=sub;
  var item=s.items[sub];
  var navEl=document.querySelector('.nav-btn[data-tab="'+item.tab+'"]');
  var hl=document.getElementById('wtHighlight');
  var bubble=document.getElementById('wtBubble');

  if(!navEl){_wtNavStep(sub+1);return;}

  hl.style.display='block';
  hl.className='wt-highlight glow';
  _wtPosEl(hl,navEl,6);
  _wtPosBubble(bubble,navEl);

  document.getElementById('wtTitle').textContent=item.label;
  document.getElementById('wtBody').innerHTML=item.desc;
  document.getElementById('wtTapHint').textContent='Tap the icon or press Next';
  document.getElementById('wtNext').textContent=sub<s.items.length-1?'Next':'Done';
  document.getElementById('wtSkip').style.display='block';

  // Highlight this nav item
  var allBtns=document.querySelectorAll('.nav-btn');
  for(var ni=0;ni<allBtns.length;ni++)allBtns[ni].classList.toggle('active',allBtns[ni].dataset.tab===item.tab);

  // Tap nav item to proceed
  _wtRemoveTap();
  _wtTapEl=navEl;
  _wtTapEl.style.cursor='pointer';
  _wtTapEl._wtNext=function(){_wtNavStep(sub+1);};
  _wtTapEl.addEventListener('click',_wtTapEl._wtNext);

  _wtDots();
}

function _wtPosEl(hl,target,pad){
  pad=pad||4;
  var r=target.getBoundingClientRect();
  hl.style.left=(r.left-pad)+'px';
  hl.style.top=(r.top-pad)+'px';
  hl.style.width=(r.width+pad*2)+'px';
  hl.style.height=(r.height+pad*2)+'px';
}

function _wtPosBubble(bubble,target){
  var tRect=target.getBoundingClientRect();
  var top=tRect.bottom+12;
  var left=Math.max(16,Math.min(window.innerWidth-296,tRect.left+tRect.width/2-140));
  bubble.style.top=top+'px';
  bubble.style.left=left+'px';
  bubble.className='wt-bubble arrow-b';

  // If off bottom, place above
  if(top+200>window.innerHeight-20){
    var alt=tRect.top-220;
    if(alt<10)alt=10;
    bubble.style.top=alt+'px';
    bubble.className='wt-bubble arrow-t';
  }
}

function _wtRemoveTap(){
  if(_wtTapEl){
    _wtTapEl.style.cursor='';
    if(_wtTapEl._wtNext)_wtTapEl.removeEventListener('click',_wtTapEl._wtNext);
    _wtTapEl._wtNext=null;
    _wtTapEl=null;
  }
}

function _wtDots(){
  var el=document.getElementById('wtDots');
  el.innerHTML='';
  for(var di=0;di<_wtSteps.length;di++){
    var d=document.createElement('span');
    d.className='wt-dot'+(di===_wtIdx?' active':'');
    el.appendChild(d);
  }
}

function _wtShowFinal(){
  _wtRemoveTap();
  document.getElementById('wtOverlay').classList.remove('open');
  document.getElementById('wtFinal').classList.add('open');
}

// Walkthrough event listeners
document.getElementById('wtNext').addEventListener('click',function(){
  var s=_wtSteps[_wtIdx];
  if(!s)return;
  if(s.isNav){_wtNavStep(_wtNavSub+1);}
  else{_wtGoTo(_wtIdx+1);}
});
document.getElementById('wtSkip').addEventListener('click',function(){_wtShowFinal();});
document.getElementById('wtFinalBtn').addEventListener('click',function(){
  document.getElementById('wtFinal').classList.remove('open');
  endOnboarding(true);
});

function checkHash(){
  if(location.hash==='#weekly-report'&&getCode()){state.tab='weekly-report';render();}
}
// Auto-start on first launch
if(getCode()){preloadMascot();try{var _localP=JSON.parse(localStorage.getItem('notifPrefs')||'{}');state.notifPrefs=Object.assign({},state.notifPrefs,_localP);}catch(e){}loadNotifs();checkHash();render();fetchAll();setTimeout(function(){try{if(!localStorage.getItem('wt_done'))startOnboarding();}catch(e){}},1500);}else{renderLogin();}
setInterval(function(){if(getCode())fetchAll(true);},300000);
window.addEventListener('hashchange',checkHash);
