'use strict';
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

const API_KEY  = process.env.TWELVEDATA_API_KEY  || '';
const TG_TOKEN = process.env.TELEGRAM_TOKEN      || '';
const TG_CHAT  = process.env.TELEGRAM_CHAT_ID    || '';
const CHARTIMG_KEY = process.env.CHARTIMG_API_KEY || '';
if(!API_KEY||!TG_TOKEN||!TG_CHAT)console.warn('Missing env vars.');

// CRT: BTC and Gold only
const CRT_INSTS = [
  {id:'BTCUSD',sym:'BTC/USD',name:'BTC/USD',dec:2},
  {id:'XAUUSD',sym:'XAU/USD',name:'XAU/USD',dec:2},
];
// QMR: 11 non-correlated pairs
const QMR_INSTS = [
  {id:'EURUSD',sym:'EUR/USD',name:'EUR/USD',dec:5},
  {id:'GBPUSD',sym:'GBP/USD',name:'GBP/USD',dec:5},
  {id:'AUDUSD',sym:'AUD/USD',name:'AUD/USD',dec:5},
  {id:'GBPJPY',sym:'GBP/JPY',name:'GBP/JPY',dec:3},
  {id:'XAUUSD',sym:'XAU/USD',name:'XAU/USD',dec:2},
  {id:'BTCUSD',sym:'BTC/USD',name:'BTC/USD',dec:2},
  {id:'EURGBP',sym:'EUR/GBP',name:'EUR/GBP',dec:5},
  {id:'EURCAD',sym:'EUR/CAD',name:'EUR/CAD',dec:5},
  {id:'AUDCAD',sym:'AUD/CAD',name:'AUD/CAD',dec:5},
  {id:'GBPAUD',sym:'GBP/AUD',name:'GBP/AUD',dec:5},
  {id:'GBPNZD',sym:'GBP/NZD',name:'GBP/NZD',dec:5},
];
const QMR_TFS=['1h','4h'];
const CHECK_MS=30*60*1000,DELAY_MS=12000,PROX=0.007,IMPULSE=0.0015,MIN_FVG=0.0003;
const CRT_MIN=3,QMR_MIN=3,WEEKLY_EVERY=24,LON_S=7,LON_E=16,NY_S=13,NY_E=22;

const PAIR_SESSIONS={
  EURUSD:{s:7,e:22},GBPUSD:{s:7,e:22},AUDUSD:{s:0,e:16},
  GBPJPY:{s:0,e:22},XAUUSD:{s:7,e:22},BTCUSD:{s:0,e:24},
  EURGBP:{s:7,e:16},EURCAD:{s:7,e:22},AUDCAD:{s:0,e:16},
  GBPAUD:{s:0,e:16},GBPNZD:{s:0,e:16},
};
const PAIR_CURRENCIES={
  EURUSD:['EUR','USD'],GBPUSD:['GBP','USD'],AUDUSD:['AUD','USD'],
  GBPJPY:['GBP','JPY'],XAUUSD:['XAU','USD'],BTCUSD:['BTC'],
  EURGBP:['EUR','GBP'],EURCAD:['EUR','CAD'],AUDCAD:['AUD','CAD'],
  GBPAUD:['GBP','AUD'],GBPNZD:['GBP','NZD'],
};
// Per-pair killzones (UTC hours) for 1H QMR signals. null = no restriction (24/7)
// Asian-active pairs include Tokyo killzone 0-4; EU/US pairs are London + NY open only
const PAIR_KILLZONES={
  EURUSD:[[7,10],[13,16]],GBPUSD:[[7,10],[13,16]],EURGBP:[[7,10],[13,16]],EURCAD:[[7,10],[13,16]],XAUUSD:[[7,10],[13,16]],
  AUDUSD:[[0,4],[7,10],[13,16]],AUDCAD:[[0,4],[7,10],[13,16]],GBPAUD:[[0,4],[7,10],[13,16]],GBPNZD:[[0,4],[7,10],[13,16]],GBPJPY:[[0,4],[7,10],[13,16]],
  BTCUSD:null,
};
function inKillzone(id){const kz=PAIR_KILLZONES[id];if(!kz)return true;const h=new Date().getUTCHours();return kz.some(w=>h>=w[0]&&h<w[1]);}
// Daily candle cache (refreshed by briefing + CRT scan) for HTF POI and daily structure checks
function checkDailyPOI(instId,type,level){
  const dc=dailyCache[instId];if(!dc||!dc.c||dc.c.length<10)return null;
  const obs=detectOB(dc.c),fvgs=detectFVG(dc.c);
  const inZ=z=>level>=z.bottom*(1-PROX*0.5)&&level<=z.top*(1+PROX*0.5);
  if(type==='BULLISH'){if(obs.bull.some(inZ))return'Daily OB';if(fvgs.bull.some(inZ))return'Daily FVG';}
  else{if(obs.bear.some(inZ))return'Daily OB';if(fvgs.bear.some(inZ))return'Daily FVG';}
  return null;
}
function getDailyTrend(instId){const dc=dailyCache[instId];if(!dc||!dc.c||dc.c.length<12)return'RANGING';return detectStructure(dc.c).trend;}

// Daily messages
const MORNING_MOTIVATION=[
  "The market will always be there tomorrow. Your capital won't if you don't protect it today. Trade with discipline, not desperation.",
  "Patience is not waiting. Patience is knowing exactly what you're looking for and refusing to settle for less. Wait for your setup.",
  "The best traders in the world miss trades every single day. Missing a setup is not a loss. Chasing it is.",
  "Your edge only works if you execute it consistently. One impulsive trade can undo ten disciplined ones. Stay the course.",
  "Confidence in trading comes from trusting your process, not from predicting the market. Trust the system.",
  "The market doesn't owe you a winning trade. It owes you nothing. What you earn today comes from discipline alone.",
  "Every professional trader has losing days. What separates them is how they respond. Losses are part of the process.",
  "Risk management is not the boring part of trading. It is the only part that keeps you in the game long enough to win.",
  "You don't need to trade every day to be a great trader. You need to trade the right setups when they appear.",
  "The goal today is not to make money. The goal is to execute your plan perfectly. The money follows the process.",
  "One good trade done correctly is worth more than ten mediocre trades done impulsively. Quality over quantity always.",
  "Before you enter any trade today, ask yourself — am I trading the setup or am I trading my emotions?",
  "The traders who last in this game are the ones who mastered sitting on their hands. Not every day is a trading day.",
  "Protect your psychology as much as you protect your capital. A damaged mindset leads to damaged accounts.",
  "Success in trading is boring. Same rules, same process, same discipline — every single day. Embrace the boring.",
];
const MORNING_EDUCATION=[
  "CRT reminder: The sweep of the high or low is the manipulation. The close back inside the range is the signal. Never enter on the sweep — wait for the close.",
  "QMR reminder: The head must sweep liquidity — equal highs or equal lows — before the reversal is valid.",
  "Premium and Discount: Always sell in premium (above the 50% midpoint) and buy in discount (below it).",
  "The Draw on Liquidity is where smart money is targeting. Equal highs above price are buy side liquidity. Equal lows below are sell side liquidity.",
  "An Order Block is the last bearish candle before a bullish impulse, or the last bullish candle before a bearish impulse.",
  "Market Structure Shift means the trend has changed. A close through the last swing high or swing low is your confirmation.",
  "A Fair Value Gap is an imbalance — three candles where the third candle's low is above the first candle's high (bullish) or vice versa (bearish).",
  "Displacement after the head in a QMR tells you the reversal is genuine. You need a strong body candle in the reversal direction.",
  "HTF bias matters. A 1H setup going against the weekly structure is a lower probability trade.",
  "Engineered liquidity means smart money intentionally created a setup to trap retail traders. Equal highs and lows are targets.",
  "Stop losses exist to protect your account. A stop at the protected high or low means if price returns there, the setup is invalid.",
  "Confirmation candle before entry. The bot identifies the level. Your job is to wait for rejection before executing.",
  "The weekly bias tells you which direction institutions are positioned for the week. Trading with that bias improves probability.",
  "Liquidity runs in cycles. Price sweeps one side, reverses, sweeps the other. Understanding this is understanding the market.",
  "Session awareness: London creates the range. New York breaks it and delivers the move. The overlap 13:00-16:00 UTC is highest probability.",
];
const EVENING_MOTIVATION=[
  "Whatever happened today — wins or losses — close your charts and rest. Your mental clarity is your most valuable asset.",
  "If you followed your rules today, it was a good day. The outcome does not define the quality of your execution.",
  "A loss taken at your stop loss is a disciplined trade. A loss that ran because you moved your stop is a lesson.",
  "Review your trades from today with honesty, not emotion. What did you do well? What would you do differently?",
  "The trading day is over. Step away from the charts. Rest properly tonight.",
  "Not every day will go your way. The traders who succeed long term show up tomorrow with the same discipline.",
  "If today was frustrating, remember why you started. The journey to consistent profitability takes time.",
  "The market humbles everyone. What matters is that you show up tomorrow better.",
  "Close your charts. Go eat. Spend time with the people you love. Trading is a means to a life.",
  "Tonight, forget the P&L. Ask yourself — did I trade my plan today? If yes, you did your job.",
  "The best traders treat their losses like tuition fees. You paid to learn something today.",
  "Rest is productive. Sleep clears the emotional residue from today's trading.",
  "Every day you stay in this game is a day closer to consistency. Most traders quit before they get there.",
  "Whether today was green or red, the most important trade you make is always the next one.",
  "Trading rewards patience and punishes impatience. The discipline you build now is what the big trades will require.",
];
const EVENING_EDUCATION=[
  "End of day review: Look at every setup the bot flagged today. Did price follow through? This builds pattern recognition.",
  "Reviewing your losses is more valuable than celebrating your wins. A loss always contains information.",
  "Check the higher timeframe bias before tomorrow's session. Weekly and daily structure tell you the higher probability direction.",
  "Mark your key levels for tomorrow — previous day highs and lows, weekly highs and lows, untested OBs and FVGs.",
  "If a QMR setup formed today but you didn't take it — go back and study it. Where was the head? Where was the MSS?",
  "A trade that hit stop loss is not necessarily a bad trade. If the setup was valid and you followed rules — that is a good trade.",
  "Study the session that moved most today. Was it London? New York? The overlap? Understanding this helps plan screen time.",
  "Look at the pairs that moved strongly today — was there a CRT or QMR structure behind that move?",
  "Tomorrow's preparation: identify pairs with the clearest weekly bias and structure. Those are your highest probability candidates.",
  "If you took a trade outside of your rules today, write it down. Understand what triggered the deviation.",
  "Track your win rate, average R:R, and number of impulsive trades. The numbers tell you where your edge is leaking.",
  "Price always tells the story before it moves. Equal highs, equal lows, imbalances, swept liquidity — the market leaves footprints.",
  "The best preparation for tomorrow is reviewing the HTF structure tonight.",
  "Study a recent QMR that played out and draw every component — LL1, LH, head, displacement, MSS, retest.",
  "Remember: the bot finds the setup. You confirm and execute. The system and the trader work together.",
];
function getDailyMsg(pool){return pool[Math.floor(Date.now()/86400000)%pool.length];}

// State
let weeklyCache={},prevWeeklyCache={},crtSeen=new Set(),qmrSeen=new Set();
let activeQMRTrades=[],lastBriefing=null,lastEOD=null,lastWeeklySummary=null;
let scanCount=0,lastScanTime=null,recentCRTAlerts=[],alertLog=[];
let tradeHistory=[],dailyAlertLog=[],dailyOutcomeLog=[],newsCache=[],lastNewsFetch=0;
let winStreak=0,lossStreak=0,qmr4HCache={},recentQMRFires={};
let dailyCache={};

const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const fmtN=(n,d)=>n==null?'--':n.toLocaleString('en-US',{minimumFractionDigits:d,maximumFractionDigits:d});
const log=msg=>console.log(`[${new Date().toISOString()}] ${msg}`);

function parseC(json){
  if(!json?.values?.length)return[];
  return json.values.map(v=>({dt:v.datetime,open:parseFloat(v.open),high:parseFloat(v.high),low:parseFloat(v.low),close:parseFloat(v.close)})).reverse();
}
function getSess(){const h=new Date().getUTCHours(),l=h>=LON_S&&h<LON_E,n=h>=NY_S&&h<NY_E;return l&&n?'London/NY Overlap':l?'London':n?'New York':'CLOSED';}
function isWeekend(){const d=new Date().getUTCDay(),h=new Date().getUTCHours();return d===6||(d===0&&h<22);}
function isPairInSession(id){const s=PAIR_SESSIONS[id];if(!s)return true;const h=new Date().getUTCHours();if(s.e===24)return true;return h>=s.s&&h<s.e;}

// News
let newsWarnSent=false,newsFirstFail=0;
async function fetchNewsEvents(){
  try{
    const res=await fetch('https://nfs.faireconomy.media/ff_calendar_thisweek.json',{headers:{'User-Agent':'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36','Accept':'application/json,text/plain,*/*','Accept-Language':'en-US,en;q=0.9'}});
    if(!res.ok)throw new Error('HTTP '+res.status);
    const txt=await res.text();
    if(txt.trim().startsWith('<'))throw new Error('feed returned HTML (blocked)');
    const data=JSON.parse(txt);
    newsCache=Array.isArray(data)?data.filter(e=>e.impact==='High'):[];
    lastNewsFetch=Date.now();newsFirstFail=0;newsWarnSent=false;
    log('News: '+newsCache.length+' events');
  }catch(e){
    log('News error: '+e.message);
    if(!newsFirstFail)newsFirstFail=Date.now();
    if(!newsWarnSent&&Date.now()-newsFirstFail>12*60*60*1000){
      newsWarnSent=true;
      await tgSend('\u26A0\uFE0F SYSTEM NOTICE\n\nNews calendar feed has been unavailable for 12+ hours. The news filter is currently inactive.\n\nCheck the economic calendar manually before trading around high-impact events.\n\u2014 The Slayers Model by Rexroz');
    }
  }
}
function isNewsBlocked(instId){
  const cur=PAIR_CURRENCIES[instId]||[],now=Date.now(),win=30*60*1000;
  return newsCache.some(ev=>{if(!cur.includes(ev.country))return false;try{return Math.abs(now-new Date(ev.date).getTime())<win;}catch{return false;}});
}

// Technical
function calcATR(c,p=14){if(c.length<2)return 0;const trs=c.slice(1).map((x,i)=>Math.max(x.high-x.low,Math.abs(x.high-c[i].close),Math.abs(x.low-c[i].close)));return trs.slice(-p).reduce((a,b)=>a+b,0)/Math.min(p,trs.length);}
function detectSD(c){const s=[],d=[];for(let i=0;i<c.length-2;i++){const b=c[i],n=c[i+1];if(Math.abs(n.close-n.open)/n.open<IMPULSE)continue;if(n.close<n.open)s.push({top:b.high,bottom:Math.min(b.open,b.close)});else d.push({top:Math.max(b.open,b.close),bottom:b.low});}return{supply:s.slice(-6).reverse(),demand:d.slice(-6).reverse()};}
function detectOB(c){const bull=[],bear=[];for(let i=0;i<c.length-2;i++){const b=c[i],n=c[i+1];if(Math.abs(n.close-n.open)/n.open<IMPULSE)continue;if(n.close>n.open&&b.close<b.open)bull.push({top:Math.max(b.open,b.close),bottom:Math.min(b.open,b.close)});else if(n.close<n.open&&b.close>b.open)bear.push({top:Math.max(b.open,b.close),bottom:Math.min(b.open,b.close)});}return{bull:bull.slice(-4).reverse(),bear:bear.slice(-4).reverse()};}
function detectFVG(c){const bull=[],bear=[];for(let i=0;i<c.length-2;i++){const a=c[i],z=c[i+2];if(z.low>a.high&&(z.low-a.high)/a.high>MIN_FVG)bull.push({top:z.low,bottom:a.high});if(z.high<a.low&&(a.low-z.high)/a.low>MIN_FVG)bear.push({top:a.low,bottom:z.high});}return{bull:bull.slice(-5).reverse(),bear:bear.slice(-5).reverse()};}
function detectBRK(c,sdZ){const cp=c[c.length-1].close,bull=[],bear=[],near=(p,z)=>p>=z.bottom*(1-PROX)&&p<=z.top*(1+PROX);for(const z of sdZ.demand)if(c.some(x=>x.close<z.bottom)&&near(cp,z))bear.push(z);for(const z of sdZ.supply)if(c.some(x=>x.close>z.top)&&near(cp,z))bull.push(z);return{bull,bear};}
function detectStructure(c){if(c.length<12)return{trend:'RANGING'};const sH=[],sL=[];for(let i=2;i<c.length-2;i++){if(c[i].high>c[i-1].high&&c[i].high>c[i-2].high&&c[i].high>c[i+1].high&&c[i].high>c[i+2].high)sH.push(c[i].high);if(c[i].low<c[i-1].low&&c[i].low<c[i-2].low&&c[i].low<c[i+1].low&&c[i].low<c[i+2].low)sL.push(c[i].low);}if(sH.length<2||sL.length<2)return{trend:'RANGING'};const rH=sH.slice(-2),rL=sL.slice(-2);if(rH[1]>rH[0]&&rL[1]>rL[0])return{trend:'BULLISH'};if(rH[1]<rH[0]&&rL[1]<rL[0])return{trend:'BEARISH'};return{trend:'RANGING'};}
function detectLiquidity(c,sweep,type){const tol=0.001,fp=PROX*2;const eqH=[],eqL=[];for(let i=0;i<c.length-4;i++){for(let j=i+3;j<c.length;j++){if(Math.abs(c[j].high-c[i].high)/c[i].high<tol){eqH.push(c[i].high);break;}}for(let j=i+3;j<c.length;j++){if(Math.abs(c[j].low-c[i].low)/c[i].low<tol){eqL.push(c[i].low);break;}}}if(type==='BEARISH')return eqH.some(h=>Math.abs(sweep-h)/sweep<fp);return eqL.some(l=>Math.abs(sweep-l)/sweep<fp);}
function detectFib(c){const rc=c.slice(-60);let sH=-Infinity,sL=Infinity;rc.forEach(x=>{if(x.high>sH)sH=x.high;if(x.low<sL)sL=x.low;});const r=sH-sL;if(!r)return null;return{f618:sH-r*0.618,f705:sH-r*0.705,f500:sH-r*0.5,b618:sL+r*0.618,b705:sL+r*0.705,b500:sL+r*0.5};}

// CRT
function detectCRT(c){if(c.length<4)return null;const c1=c[c.length-3],c2=c[c.length-2];const sH=c2.high>c1.high,sL=c2.low<c1.low;if(!sH&&!sL)return null;if(c2.close<c1.low||c2.close>c1.high)return null;return{type:sH?'BEARISH':'BULLISH',price:c2.close,sweep:sH?c2.high:c2.low,crtH:c1.high,crtL:c1.low,dt:c2.dt};}
function getWBias(wc){if(!wc||wc.length<2)return'NEUTRAL';const lw=wc[wc.length-2];return lw.close>lw.open?'BULLISH':lw.close<lw.open?'BEARISH':'NEUTRAL';}
function getWLvls(wc){if(!wc||wc.length<2)return null;const lw=wc[wc.length-2];return{high:lw.high,low:lw.low};}
function getPD(c){if(!c||c.length<3)return null;const pd=c[c.length-2];return{high:pd.high,low:pd.low};}
function calcCRTScore(crt,sdZ,obs,fvgs,brk,wBias,sess,prevDay,prevWeek,fib,struct,liq){
  const near=(p,z)=>p>=z.bottom*(1-PROX)&&p<=z.top*(1+PROX),t=crt.type,p=crt.price,sw=crt.sweep,F=[];let sc=0;
  if(t==='BULLISH'?sdZ.demand.some(z=>near(p,z)):sdZ.supply.some(z=>near(p,z))){sc++;F.push('S/D Zone');}
  if(t==='BULLISH'?obs.bull.some(z=>near(p,z)):obs.bear.some(z=>near(p,z))){sc++;F.push('Order Block');}
  if(t==='BULLISH'?fvgs.bull.some(z=>p>=z.bottom&&p<=z.top):fvgs.bear.some(z=>p>=z.bottom&&p<=z.top)){sc++;F.push('FVG');}
  if(t==='BULLISH'?brk.bull.some(z=>near(p,z)):brk.bear.some(z=>near(p,z))){sc++;F.push('Breaker');}
  if(sess!=='CLOSED'){sc++;F.push(sess.split('/')[0]);}
  if((t==='BULLISH'&&wBias==='BULLISH')||(t==='BEARISH'&&wBias==='BEARISH')){sc++;F.push('HTF Bias');}
  const fp=PROX*1.5;let ph=false;
  if(prevDay){if(t==='BEARISH'&&sw>=prevDay.high*(1-fp)){ph=true;F.push('PDH Swept');}else if(t==='BULLISH'&&sw<=prevDay.low*(1+fp)){ph=true;F.push('PDL Swept');}}
  if(!ph&&prevWeek){if(t==='BEARISH'&&sw>=prevWeek.high*(1-fp)){ph=true;F.push('PWH Swept');}else if(t==='BULLISH'&&sw<=prevWeek.low*(1+fp)){ph=true;F.push('PWL Swept');}}
  if(ph)sc++;
  if(fib){const fs=t==='BULLISH'?[fib.f618,fib.f705,fib.f500]:[fib.b618,fib.b705,fib.b500];if(fs.some(f=>Math.abs(p-f)/p<PROX*1.3)){sc++;F.push('Fibonacci');}}
  if((t==='BULLISH'&&struct.trend==='BULLISH')||(t==='BEARISH'&&struct.trend==='BEARISH')){sc++;F.push('Structure');}
  if(liq){sc++;F.push('Liq Pool');}
  return{score:sc,factors:F,strength:sc>=9?'PERFECT':sc>=7?'ELITE':sc>=5?'STRONG':'VALID',max:10};
}

// QMR
function checkPremiumDiscount(c,type,qmLevel){const rc=c.slice(-100);let hi=-Infinity,lo=Infinity;rc.forEach(x=>{if(x.high>hi)hi=x.high;if(x.low<lo)lo=x.low;});return type==='BULLISH'?qmLevel<(hi+lo)/2:qmLevel>(hi+lo)/2;}
function isLevelAlreadySeen(instId,type,qmLevel){for(const key of qmrSeen){if(!key.startsWith(instId+'-'+type+'-'))continue;const ex=parseFloat(key.split('-').pop());if(!isNaN(ex)&&Math.abs(ex-qmLevel)/qmLevel<0.015)return true;}return false;}
// ADR (Average Daily Range) — uses 1H candles grouped by day
function calcADR(c,days=14){
  const ranges=[];let dh=-Infinity,dl=Infinity,cd=null;
  for(const x of c){
    const day=x.dt.slice(0,10);
    if(day!==cd){if(cd!==null&&dh>dl)ranges.push(dh-dl);dh=x.high;dl=x.low;cd=day;}
    else{if(x.high>dh)dh=x.high;if(x.low<dl)dl=x.low;}
  }
  if(cd!==null&&dh>dl)ranges.push(dh-dl);
  const slice=ranges.slice(-days);
  return slice.length?slice.reduce((a,b)=>a+b,0)/slice.length:0;
}
function getTodayRange(c){
  const today=c[c.length-1].dt.slice(0,10);
  let hi=-Infinity,lo=Infinity;
  for(let i=c.length-1;i>=0;i--){
    if(c[i].dt.slice(0,10)!==today)break;
    if(c[i].high>hi)hi=c[i].high;
    if(c[i].low<lo)lo=c[i].low;
  }
  return hi>lo?hi-lo:0;
}
function findSwings(c){const sH=[],sL=[];for(let i=3;i<c.length-3;i++){if(c[i].high>c[i-1].high&&c[i].high>c[i-2].high&&c[i].high>c[i-3].high&&c[i].high>c[i+1].high&&c[i].high>c[i+2].high&&c[i].high>c[i+3].high)sH.push({p:c[i].high,i,dt:c[i].dt});if(c[i].low<c[i-1].low&&c[i].low<c[i-2].low&&c[i].low<c[i-3].low&&c[i].low<c[i+1].low&&c[i].low<c[i+2].low&&c[i].low<c[i+3].low)sL.push({p:c[i].low,i,dt:c[i].dt});}return{sH,sL};}
function headSweptLiquidity(c,head,type){const tol=0.001,refC=c.slice(Math.max(0,head.i-50),head.i);let eq=false;if(type==='BEARISH'){for(let i=0;i<refC.length-2;i++){for(let j=i+2;j<refC.length;j++){if(Math.abs(refC[j].high-refC[i].high)/refC[i].high<tol&&head.p>=refC[i].high){eq=true;break;}}if(eq)break;}return eq||refC.some(x=>head.p>x.high*1.0003);}else{for(let i=0;i<refC.length-2;i++){for(let j=i+2;j<refC.length;j++){if(Math.abs(refC[j].low-refC[i].low)/refC[i].low<tol&&head.p<=refC[i].low){eq=true;break;}}if(eq)break;}return eq||refC.some(x=>head.p<x.low*0.9997);}}
function validateQMRCriteria(c,type,head,qmSwing,atr,sH,sL){const F=[];let sc=0;if(headSweptLiquidity(c,head,type)){sc++;F.push('Liq Sweep');}const first3=c.slice(Math.max(0,head.i+1),Math.min(c.length,head.i+4)),bearD=type==='BEARISH';if(first3.some(x=>{const body=Math.abs(x.close-x.open),range=x.high-x.low;return(bearD?x.close<x.open:x.close>x.open)&&(body>atr*0.85||(range>0&&body/range>0.65));})){sc++;F.push('Displacement');}const cp=c[c.length-1].close;if(type==='BEARISH'?cp<=qmSwing.p*1.004:cp>=qmSwing.p*0.996){sc++;F.push('MSS');}if((type==='BEARISH'?sL:sH).filter(s=>Math.abs(s.p-qmSwing.p)<atr*3&&s.i<head.i).length>=2){sc++;F.push('Eng. Liq');}return{valid:sc>=QMR_MIN,score:sc,factors:F};}
function detectQMR(c){
  if(c.length<35)return[];const{sH,sL}=findSwings(c);if(sH.length<3||sL.length<3)return[];
  const cp=c[c.length-1].close,atr=calcATR(c,14),results=[];
  for(let h=sH.length-1;h>=1;h--){const head=sH[h],hh1=sH[h-1];if(head.p<=hh1.p||head.i<c.length-45)continue;const hlC=sL.filter(l=>l.i>hh1.i&&l.i<head.i);if(!hlC.length)continue;const hl=hlC[hlC.length-1];if(!c.slice(head.i+1,Math.min(c.length,head.i+13)).some(x=>x.close<hl.p))continue;const dist=Math.abs(cp-hl.p);if(!(dist<atr*0.5&&cp<=hl.p*(1+0.0008)&&cp>=hl.p*(1-0.0005)))continue;if(!checkPremiumDiscount(c,'BEARISH',hl.p))continue;const crit=validateQMRCriteria(c,'BEARISH',head,hl,atr,sH,sL);if(!crit.valid)continue;const obs=detectOB(c),fvgs=detectFVG(c),obN=obs.bear.find(z=>Math.abs((z.top+z.bottom)/2-hl.p)<atr*2.0),fvN=fvgs.bear.find(z=>Math.abs((z.top+z.bottom)/2-hl.p)<atr*2.0);if(!obN&&!fvN)continue;if(obN)crit.factors.push('Reclaimed OB');else crit.factors.push('FVG at QM');let trueHigh=head.p;for(let k=head.i;k<c.length;k++){if(c[k].high>trueHigh)trueHigh=c[k].high;}results.push({type:'BEARISH',qmLevel:hl.p,head:head.p,cp,atr,criteria:crit,retestSL:trueHigh+atr*0.25});break;}
  for(let l=sL.length-1;l>=1;l--){const head=sL[l],ll1=sL[l-1];if(head.p>=ll1.p||head.i<c.length-45)continue;const lhC=sH.filter(h=>h.i>ll1.i&&h.i<head.i);if(!lhC.length)continue;const lh=lhC[lhC.length-1];if(!c.slice(head.i+1,Math.min(c.length,head.i+13)).some(x=>x.close>lh.p))continue;const dist=Math.abs(cp-lh.p);if(!(dist<atr*0.5&&cp>=lh.p*(1-0.0008)&&cp<=lh.p*(1+0.0005)))continue;if(!checkPremiumDiscount(c,'BULLISH',lh.p))continue;const crit=validateQMRCriteria(c,'BULLISH',head,lh,atr,sH,sL);if(!crit.valid)continue;const obs=detectOB(c),fvgs=detectFVG(c),obN=obs.bull.find(z=>Math.abs((z.top+z.bottom)/2-lh.p)<atr*2.0),fvN=fvgs.bull.find(z=>Math.abs((z.top+z.bottom)/2-lh.p)<atr*2.0);if(!obN&&!fvN)continue;if(obN)crit.factors.push('Reclaimed OB');else crit.factors.push('FVG at QM');let trueLow=head.p;for(let k=head.i;k<c.length;k++){if(c[k].low<trueLow)trueLow=c[k].low;}results.push({type:'BULLISH',qmLevel:lh.p,head:head.p,cp,atr,criteria:crit,retestSL:trueLow-atr*0.25});break;}
  return results;
}
function findDrawOnLiquidity(c,type,entryPrice,atr){const tol=0.001,minDist=atr*3;const eqH=[],eqL=[];for(let i=0;i<c.length-4;i++){for(let j=i+3;j<c.length;j++){if(Math.abs(c[j].high-c[i].high)/c[i].high<tol){eqH.push(c[i].high);break;}}for(let j=i+3;j<c.length;j++){if(Math.abs(c[j].low-c[i].low)/c[i].low<tol){eqL.push(c[i].low);break;}}}if(type==='BULLISH'){const t=eqH.filter(h=>h>entryPrice+minDist).sort((a,b)=>a-b);return t.length?{price:t[0],label:'Buy Side Liquidity'}:null;}const t=eqL.filter(l=>l<entryPrice-minDist).sort((a,b)=>b-a);return t.length?{price:t[0],label:'Sell Side Liquidity'}:null;}
function findStructuralTP2(c,type,entryPrice,slDist,tp1Price){if(slDist<=0)return null;const minT=type==='BULLISH'?entryPrice+slDist*2.5:entryPrice-slDist*2.5,maxT=type==='BULLISH'?entryPrice+slDist*3:entryPrice-slDist*3,tol=0.001;const eqH=[],eqL=[],swH=[],swL=[];for(let i=0;i<c.length-4;i++){for(let j=i+3;j<c.length;j++){if(Math.abs(c[j].high-c[i].high)/c[i].high<tol){eqH.push(c[i].high);break;}}for(let j=i+3;j<c.length;j++){if(Math.abs(c[j].low-c[i].low)/c[i].low<tol){eqL.push(c[i].low);break;}}}for(let i=3;i<c.length-3;i++){if(c[i].high>c[i-1].high&&c[i].high>c[i-2].high&&c[i].high>c[i+1].high&&c[i].high>c[i+2].high)swH.push(c[i].high);if(c[i].low<c[i-1].low&&c[i].low<c[i-2].low&&c[i].low<c[i+1].low&&c[i].low<c[i+2].low)swL.push(c[i].low);}if(type==='BULLISH'){const cands=[...eqH,...swH].filter(h=>h>tp1Price&&h>=minT&&h<=maxT).sort((a,b)=>a-b);if(cands.length)return{price:cands[0],rr:((cands[0]-entryPrice)/slDist).toFixed(1)};return{price:entryPrice+slDist*2.5,rr:'2.5'};}const cands=[...eqL,...swL].filter(l=>l<tp1Price&&l<=minT&&l>=maxT).sort((a,b)=>b-a);if(cands.length)return{price:cands[0],rr:((entryPrice-cands[0])/slDist).toFixed(1)};return{price:entryPrice-slDist*2.5,rr:'2.5'};}

// Conflict resolution hierarchy: Daily CRT > 4H QMR > 1H QMR
function tfWeight(tf){if(tf==='DAILY')return 3;if(tf==='4H')return 2;if(tf==='1H')return 1;return 0;}
async function tgTradeInvalidated(trade,reason,weeklyBias){const isB=trade.type==='BULLISH';const biasLine=weeklyBias&&weeklyBias!=='NEUTRAL'?'\nWeekly Bias: '+weeklyBias+' - market aligned with new direction':'';await tgSend('\u26A0\uFE0F TRADE INVALIDATED\n'+'='.repeat(28)+'\n\uD83D\uDCCA '+trade.instName+' | '+(isB?'BUY':'SELL')+' QMR '+trade.tf+'\n\n\uD83D\uDD34 Reason: '+reason+biasLine+'\n\n'+(isB?'Close any open BUY positions on '+trade.instName+'.':'Close any open SELL positions on '+trade.instName+'.')+'\n\n\u2014 The Slayers Model by Rexroz');}
async function resolveConflicts(instId,newType,newTf,source,weeklyBias){const newW=tfWeight(newTf);let blocked=false;for(let i=activeQMRTrades.length-1;i>=0;i--){const t=activeQMRTrades[i];if(t.instId!==instId||t.type===newType)continue;const exW=tfWeight(t.tf);if(newW>=exW){const reason=source==='CRT'?'Daily CRT confirmed '+newType+' - structure shifted on Daily timeframe':newTf+' QMR '+newType+' - '+newTf+' overrides '+t.tf;log(`INVALIDATING: ${t.instName} ${t.type} ${t.tf}`);await tgTradeInvalidated(t,reason,weeklyBias);tradeHistory.push({instId:t.instId,type:t.type,tf:t.tf,outcome:'INVALIDATED',time:new Date().toISOString()});activeQMRTrades.splice(i,1);}else{log(`BLOCKED: ${instId} ${newTf} ${newType} by ${t.tf} ${t.type}`);blocked=true;}}return blocked;}

// Telegram functions
async function tgSend(text){if(!TG_TOKEN||!TG_CHAT)return;try{await fetch(`https://api.telegram.org/bot${TG_TOKEN}/sendMessage`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({chat_id:TG_CHAT,text})});}catch(e){log('TG error: '+e.message);}}
// Chart snapshots via chart-img.com (optional - only active when CHARTIMG_API_KEY is set)
const CHART_SYMBOLS={EURUSD:'OANDA:EURUSD',GBPUSD:'OANDA:GBPUSD',AUDUSD:'OANDA:AUDUSD',GBPJPY:'OANDA:GBPJPY',XAUUSD:'OANDA:XAUUSD',BTCUSD:'COINBASE:BTCUSD',EURGBP:'OANDA:EURGBP',EURCAD:'OANDA:EURCAD',AUDCAD:'OANDA:AUDCAD',GBPAUD:'OANDA:GBPAUD',GBPNZD:'OANDA:GBPNZD'};
async function tgSendChart(instId,interval,lines,caption){
  if(!CHARTIMG_KEY||!TG_TOKEN||!TG_CHAT)return;
  try{
    const sym=CHART_SYMBOLS[instId];if(!sym)return;
    const drawings=lines.map(l=>({name:'Horizontal Line',input:{price:l.price,text:l.text},override:{lineColor:l.color,textColor:l.color,fontSize:12,showLabel:true,lineWidth:2}}));
    const res=await fetch('https://api.chart-img.com/v2/tradingview/advanced-chart',{method:'POST',headers:{'x-api-key':CHARTIMG_KEY,'content-type':'application/json'},body:JSON.stringify({symbol:sym,interval,theme:'dark',width:800,height:600,drawings})});
    if(!res.ok){log('ChartImg '+instId+': HTTP '+res.status);return;}
    const buf=await res.arrayBuffer();
    const fd=new FormData();
    fd.append('chat_id',TG_CHAT);
    fd.append('caption',caption);
    fd.append('photo',new Blob([buf],{type:'image/png'}),'chart.png');
    const tg=await fetch('https://api.telegram.org/bot'+TG_TOKEN+'/sendPhoto',{method:'POST',body:fd});
    if(!tg.ok)log('TG photo '+instId+': HTTP '+tg.status);
  }catch(e){log('Chart error '+instId+': '+e.message);}
}
async function tgCRT(id,crt,sc,wBias,sess,newsWarn){const bear=crt.type==='BEARISH',p=crt.price>10?2:5;const strMap={PERFECT:'\uD83D\uDC8E PERFECT',ELITE:'\u26A1 ELITE',STRONG:'\uD83D\uDD25 STRONG',VALID:'\uD83D\uDFE1 VALID'};const filled='\u2B50'.repeat(sc.score)+'\u25A1'.repeat(sc.max-sc.score);let msg='\u26A1 SLAYERS CRT ALERT \u26A1\n'+(strMap[sc.strength]||'\uD83D\uDFE1 VALID')+'\n'+'='.repeat(28)+'\n\uD83D\uDCCA '+id+' \u00B7 DAILY\n'+(bear?'\uD83D\uDD34 SELL SETUP':'\uD83D\uDFE2 BUY SETUP')+'\n\n\uD83C\uDFAF Swept: '+crt.sweep.toFixed(p)+'\n\u2705 Closed: '+crt.price.toFixed(p)+'\n\uD83D\uDCE6 Range: '+crt.crtL.toFixed(p)+' - '+crt.crtH.toFixed(p)+'\n\n\uD83D\uDD25 Score: '+sc.score+'/'+sc.max+'  '+filled+'\n'+sc.factors.map(f=>'\u2705 '+f).join('\n')+'\n\n\uD83D\uDCC5 Weekly Bias: '+wBias+'\n\uD83D\uDFE2 Session: '+sess+'\n\n';if(newsWarn)msg+='\u26A0\uFE0F HIGH IMPACT NEWS NEARBY - Trade with caution\n\n';msg+='\u26A0\uFE0F Confirm structure on chart before entering.\n\u2014 The Slayers Model by Rexroz';await tgSend(msg);}
async function tgQMR(id,tf,qmr,htfBias,sessWarn,adrWarn){const bear=qmr.type==='BEARISH',p=qmr.qmLevel>10?2:5,zone=bear?'PREMIUM - Sell Zone':'DISCOUNT - Buy Zone',entry=qmr.qmLevel,sl=qmr.retestSL!=null?qmr.retestSL:(bear?qmr.head+qmr.atr*0.1:qmr.head-qmr.atr*0.1),slDist=Math.abs(entry-sl),dol=qmr.drawOnLiquidity,tp1=dol?dol.price:(bear?entry-slDist*3:entry+slDist*3),rr1=slDist>0?(Math.abs(tp1-entry)/slDist).toFixed(1):'--',td=qmr.structuralTP2,tp2=td?td.price:(bear?entry-slDist*2.5:entry+slDist*2.5),rr2=td?td.rr:(slDist>0?(Math.abs(tp2-entry)/slDist).toFixed(1):'2.5'),dolLabel=dol?dol.label:'Draw on Liquidity',slLabel=bear?'above protected high':'below protected low';let htfLine='';if(htfBias&&htfBias!=='NEUTRAL'){const agrees=(bear&&htfBias==='BEARISH')||((!bear)&&htfBias==='BULLISH');htfLine='\n'+(agrees?'\uD83D\uDD25 HTF Aligned: Weekly '+htfBias+' - HIGH PROBABILITY':'\u26A0\uFE0F Counter-trend: Weekly '+htfBias);}const tier=qmr.criteria.score>=4?'\uD83D\uDC8E ELITE SETUP':'\uD83D\uDFE1 VALID SETUP';let msg='\uD83D\uDD04 QMR SIGNAL \u2014 '+tier+'\n'+'='.repeat(28)+'\n\uD83D\uDCCA '+id+' \u00B7 '+tf+' \u00B7 '+zone+'\n'+(bear?'\uD83D\uDD34 BEARISH QM':'\uD83D\uDFE2 BULLISH QM')+htfLine+'\n\n\uD83D\uDCCD Entry: '+entry.toFixed(p)+' (QM Level)\n\uD83D\uDEAB SL:    '+sl.toFixed(p)+' ('+slLabel+')\n\uD83C\uDFAF '+dolLabel+': '+tp1.toFixed(p)+' (1:'+rr1+'R)\n\uD83C\uDFAF Next Structure: '+tp2.toFixed(p)+' (1:'+rr2+'R)\n\n\uD83C\uDFD4\uFE0F Head: '+qmr.head.toFixed(p)+'\n\n\uD83D\uDD25 Criteria: '+qmr.criteria.score+'/4\n'+qmr.criteria.factors.map(f=>'\u2705 '+f).join('\n')+(qmr.dailyPOI?'\n\uD83C\uDFDB\uFE0F '+qmr.dailyPOI+' \u2014 HTF confluence':'')+'\n\n';if(qmr.counterTrend)msg+='\u26A0\uFE0F COUNTER-TREND \u2014 potential trend reversal. Reduce size.\n\n';if(sessWarn)msg+='\u23F0 Outside prime session hours\n\n';if(adrWarn)msg+='\u26A0\uFE0F '+adrWarn+'% of avg daily range already used \u2014 TP may need 1-2 sessions\n\n';msg+='\uD83D\uDCB0 Calc position size: https://slayerbotcalculator.netlify.app/#'+id+','+entry.toFixed(p)+','+sl.toFixed(p)+'\n\n\u26A1 Price at QM level. Look for confirmation candle before entering.\n\u2014 The Slayers Model by Rexroz';await tgSend(msg);}
async function tgMultiTFConfluence(id,qmr1H,qmr4H){const bear=qmr1H.type==='BEARISH',p=qmr1H.qmLevel>10?2:5,zone=bear?'PREMIUM - Sell Zone':'DISCOUNT - Buy Zone',entry=qmr1H.qmLevel,sl=qmr1H.retestSL!=null?qmr1H.retestSL:(bear?qmr1H.head+qmr1H.atr*0.1:qmr1H.head-qmr1H.atr*0.1),slDist=Math.abs(entry-sl),dol=qmr1H.drawOnLiquidity,tp1=dol?dol.price:(bear?entry-slDist*3:entry+slDist*3),tp2=qmr1H.structuralTP2?qmr1H.structuralTP2.price:(bear?entry-slDist*2.5:entry+slDist*2.5),rr1=slDist>0?(Math.abs(tp1-entry)/slDist).toFixed(1):'--',rr2=slDist>0?(Math.abs(tp2-entry)/slDist).toFixed(1):'2.5',dolLabel=dol?dol.label:'Draw on Liquidity',slLabel=bear?'above protected high':'below protected low';await tgSend('\uD83D\uDD25\uD83D\uDD04 MULTI-TF CONFLUENCE - HIGHEST PROBABILITY\n'+'='.repeat(28)+'\n\uD83D\uDCCA '+id+' \u00B7 1H + 4H \u00B7 '+zone+'\n'+(bear?'\uD83D\uDD34 BEARISH QM':'\uD83D\uDFE2 BULLISH QM')+'\n\n\u2705 1H QMR level: '+qmr1H.qmLevel.toFixed(p)+'\n\u2705 4H QMR level: '+qmr4H.qmLevel.toFixed(p)+'\n\u2705 Both timeframes aligned\n\n\uD83D\uDCCD Entry: '+entry.toFixed(p)+' (QM Level)\n\uD83D\uDEAB SL:    '+sl.toFixed(p)+' ('+slLabel+')\n\uD83C\uDFAF '+dolLabel+': '+tp1.toFixed(p)+' (1:'+rr1+'R)\n\uD83C\uDFAF Next Structure: '+tp2.toFixed(p)+' (1:'+rr2+'R)\n\n\uD83D\uDD25 1H Score: '+qmr1H.criteria.score+'/4 | 4H Score: '+qmr4H.criteria.score+'/4\n\n'+(qmr1H.dailyPOI?'\uD83C\uDFDB\uFE0F '+qmr1H.dailyPOI+' \u2014 HTF confluence\n\n':'')+(qmr1H.counterTrend?'\u26A0\uFE0F COUNTER-TREND \u2014 potential trend reversal. Reduce size.\n\n':'')+'\uD83D\uDCB0 Calc position size: https://slayerbotcalculator.netlify.app/#'+id+','+entry.toFixed(p)+','+sl.toFixed(p)+'\n\n\u26A1 BOTH TIMEFRAMES CONFIRMED. Highest conviction setup.\n\u2014 The Slayers Model by Rexroz');}
async function tgQMRUpdate(trade,level){const isB=trade.type==='BULLISH',p=trade.dec;const icons={be:'\u26A1 MOVE TO BREAKEVEN',tp1:'\u2705 TP1 HIT!',tp2:'\uD83D\uDCB0 FULL TARGET HIT!',sl:'\uD83D\uDEAB STOP LOSS HIT',be_close:'\u2705 TRADE CLOSED - TP1 SECURED',be_sl:'\u2696\uFE0F CLOSED AT BREAKEVEN'};const msgs={be:'Trade moved 1:1 in your favour.\nMove SL to entry: '+trade.qmLevel.toFixed(p)+'\nTrade is now risk-free.',tp1:'\uD83C\uDFAF Draw on Liquidity: '+trade.tp1.toFixed(p)+' reached.\nClose 50% of your position now.\nMove SL to entry and let the rest run to TP2.',tp2:'\uD83C\uDFAF Next Structure: '+trade.tp2.toFixed(p)+' reached.\nClose trade - full profit taken!',sl:'SL: '+trade.sl.toFixed(p)+' triggered.\nTrade closed. Stay disciplined, next setup coming.',be_close:'TP1 was secured. Price returned to entry.\nRemainder closed at breakeven.\nTP1 profit is yours. \u2705 Recorded as WIN.',be_sl:'Price returned to entry after the breakeven move.\nTrade closed flat \u2014 no loss taken.\nCapital protected. Wait for the next setup.'};await tgSend(icons[level]+'\n'+'='.repeat(28)+'\n\uD83D\uDCCA '+trade.instName+' \u00B7 '+trade.tf+' | '+(isB?'BUY':'SELL')+' QMR\n\n'+msgs[level]+'\n\n\u2014 The Slayers Model by Rexroz');}
async function tgBiasFlip(id,oldBias,newBias){await tgSend('\uD83D\uDD04 WEEKLY BIAS FLIPPED - '+id+'\n'+'='.repeat(28)+'\n\n\uD83D\uDCCA '+id+'\n'+(oldBias==='BULLISH'?'\uD83D\uDFE2':'\uD83D\uDD34')+' Previous: '+oldBias+'\n'+(newBias==='BULLISH'?'\uD83D\uDFE2':'\uD83D\uDD34')+' New Bias: '+newBias+'\n\n\u26A0\uFE0F Institutional direction has shifted. Adjust your bias accordingly.\n'+(newBias==='BEARISH'?'Look for sell setups in premium only.':'Look for buy setups in discount only.')+'\n\n\u2014 The Slayers Model by Rexroz');}
async function sendDailyBriefing(){
  const now=new Date(),days=['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'],months=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const dateStr=days[now.getUTCDay()]+' '+now.getUTCDate()+' '+months[now.getUTCMonth()]+' '+now.getUTCFullYear();
  let msg='\uD83C\uDF05 SLAYERS DAILY BRIEFING\n'+dateStr+' | 07:00 UTC\n'+'='.repeat(28)+'\n\n';
  const aligned=[];
  for(const inst of QMR_INSTS){
    try{
      const res=await fetch('https://api.twelvedata.com/time_series?symbol='+encodeURIComponent(inst.sym)+'&interval=1day&outputsize=60&apikey='+API_KEY);
      const json=await res.json();
      if(json.status==='error'){await sleep(DELAY_MS);continue;}
      const c=parseC(json);
      if(c.length<12){await sleep(DELAY_MS);continue;}
      dailyCache[inst.id]={c,ts:Date.now()};
      const price=fmtN(c[c.length-1].close,inst.dec);
      const daily=detectStructure(c).trend;
      const weekly=weeklyCache[inst.id]?.bias||'NEUTRAL';
      const agree=weekly!=='NEUTRAL'&&weekly===daily;
      const icon=agree?(weekly==='BULLISH'?'\uD83D\uDFE2':'\uD83D\uDD34'):'\uD83D\uDFE1';
      msg+=icon+' '+inst.name+' \u2014 '+price+'\nWeekly: '+weekly+' \u00B7 Daily: '+daily+'\n\n';
      if(agree)aligned.push(inst.name+' ('+weekly+')');
      await sleep(DELAY_MS);
    }catch(e){log('Briefing '+inst.id+': '+e.message);await sleep(DELAY_MS);}
  }
  if(aligned.length)msg+='\uD83C\uDFAF FOCUS TODAY \u2014 Weekly + Daily aligned:\n'+aligned.map(a=>'\u2705 '+a).join('\n')+'\n\n';
  else msg+='\uD83D\uDFE1 No pairs fully aligned today. Be selective.\n\n';
  msg+='\uD83D\uDCC5 London: 07:00-16:00 UTC | New York: 13:00-22:00 UTC\n\n\u26A0\uFE0F Wait for confirmation before entering.\n\u2014 The Slayers Model by Rexroz';
  await tgSend(msg);
  dailyAlertLog=[];dailyOutcomeLog=[];
}
async function tgMorningMessage(){const day=Math.floor(Date.now()/86400000),pool=day%2===0?MORNING_MOTIVATION:MORNING_EDUCATION,icon=day%2===0?'\uD83D\uDD25 MINDSET':'\uD83D\uDCDA LEARN';await tgSend(icon+' | GOOD MORNING\n'+'='.repeat(28)+'\n\n'+getDailyMsg(pool)+'\n\n\u2014 The Slayers Model by Rexroz');}
async function tgEveningMessage(){const day=Math.floor(Date.now()/86400000),pool=day%2===0?EVENING_MOTIVATION:EVENING_EDUCATION,icon=day%2===0?'\uD83C\uDF19 CLOSE OUT':'\uD83D\uDCD6 REVIEW';await tgSend(icon+' | END OF DAY\n'+'='.repeat(28)+'\n\n'+getDailyMsg(pool)+'\n\n\u2014 The Slayers Model by Rexroz');}
async function tgEODSummary(){
  const now=new Date(),days=['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  const hasAnything=dailyAlertLog.length||dailyOutcomeLog.length||activeQMRTrades.length;
  if(!hasAnything)return;
  let msg='\uD83D\uDCCA SLAYERS END OF DAY\n'+days[now.getUTCDay()]+' '+now.getUTCDate()+' | 22:00 UTC\n'+'='.repeat(28)+'\n';

  // Section 1: New signals today
  if(dailyAlertLog.length){
    msg+='\n\u26A1 SIGNALS TODAY: '+dailyAlertLog.length+'\n';
    dailyAlertLog.filter(a=>a.type==='CRT').forEach(a=>msg+=(a.dir==='BULLISH'?'\uD83D\uDFE2':'\uD83D\uDD34')+' '+a.id+' CRT — '+a.score+'/10\n');
    dailyAlertLog.filter(a=>a.type==='QMR').forEach(a=>msg+=(a.dir==='BULLISH'?'\uD83D\uDFE2':'\uD83D\uDD34')+' '+a.id+' '+a.tf+' QMR — '+a.score+'/4\n');
  }

  // Section 2: Outcomes today (SL, TP1, TP2, wins)
  if(dailyOutcomeLog.length){
    msg+='\n\uD83C\uDFAF OUTCOMES TODAY:\n';
    dailyOutcomeLog.forEach(o=>{
      const dir=o.type==='BULLISH'?'\uD83D\uDFE2':'\uD83D\uDD34';
      const out=o.outcome==='SL'?'\uD83D\uDEAB STOP LOSS':o.outcome==='BE'?'\u2696\uFE0F BREAKEVEN':o.outcome==='TP1'?'\u2705 TP1 HIT':o.outcome==='TP2'?'\uD83D\uDCB0 FULL TARGET':'\u2705 WIN (TP1 Secured)';
      msg+=dir+' '+o.name+' '+o.tf+' — '+out+'\n';
    });
  }

  // Section 3: All currently active trades
  if(activeQMRTrades.length){
    msg+='\n\uD83D\uDD04 ACTIVE TRADES ('+activeQMRTrades.length+'):\n';
    activeQMRTrades.forEach(t=>{
      const isB=t.type==='BULLISH';
      const progress=(t.beFired?'BE\u2713 ':' ')+(t.tp1Fired?'TP1\u2713 ':' ');
      msg+=(isB?'\uD83D\uDFE2':'\uD83D\uDD34')+' '+t.instName+' '+t.tf+' '+(isB?'BUY':'SELL')+' — Entry: '+t.qmLevel.toFixed(t.dec)+(progress.trim()?' ['+progress.trim()+']':'')+' (running)\n';
    });
  }

  msg+='\n\uD83D\uDD14 Review your charts. Manage open positions.\n\u2014 The Slayers Model by Rexroz';
  await tgSend(msg);
}
async function tgWeeklySummary(){const total=tradeHistory.length;if(!total){await tgSend('\uD83D\uDCCA WEEKLY SUMMARY\nNo completed trades this week.\n\u2014 The Slayers Model by Rexroz');return;}const tp=tradeHistory.filter(t=>t.outcome==='TP1'||t.outcome==='TP2'||t.outcome==='WIN').length,sl=tradeHistory.filter(t=>t.outcome==='SL').length,be=tradeHistory.filter(t=>t.outcome==='BE').length,wr=(tp+sl)?Math.round((tp/(tp+sl))*100):0,bar='\u2588'.repeat(Math.round(wr/10))+'\u2591'.repeat(10-Math.round(wr/10)),now=new Date(),months=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],withDur=tradeHistory.filter(t=>t.duration!=null),avgDur=withDur.length?Math.round(withDur.reduce((a,t)=>a+t.duration,0)/withDur.length):null;let msg='\uD83D\uDCCA SLAYERS WEEKLY PERFORMANCE\nWeek ending '+now.getUTCDate()+' '+months[now.getUTCMonth()]+'\n'+'='.repeat(28)+'\n\n\uD83D\uDD25 Total: '+total+' | \u2705 TP: '+tp+' | \uD83D\uDEAB SL: '+sl+' | \u2696\uFE0F BE: '+be+'\n\nWin Rate: '+bar+' '+wr+'%\n';if(avgDur)msg+='Avg trade duration: '+(avgDur>=60?Math.floor(avgDur/60)+'h '+(avgDur%60)+'m':avgDur+'m')+'\n';msg+='\n'+(wr>=60?'\uD83D\uDD25 Excellent week.':wr>=45?'\uD83D\uDFE1 Solid week. Stay disciplined.':'\u26A0\uFE0F Tough week. Trust the process.')+'\n\n\u2014 The Slayers Model by Rexroz';await tgSend(msg);tradeHistory=[];}


// Trade management
async function checkQMRTrades(instId,price,cHigh,cLow){
  const hi=cHigh||price,lo=cLow||price;
  for(let i=activeQMRTrades.length-1;i>=0;i--){
    const t=activeQMRTrades[i];if(t.instId!==instId)continue;
    const isB=t.type==='BULLISH';
    if(!t.slFired&&(isB?lo<=t.sl:hi>=t.sl)){
      // BE grace period: after SL moves to entry, ignore the still-forming candle's stale range
      // for one full candle of the trade's timeframe before the entry-stop can be declared hit
      if(t.beFired&&t.beTime&&Date.now()-t.beTime<(t.tf==='4H'?4:1)*60*60*1000){log('BE grace: ignoring stale candle range on '+t.instId+' '+t.tf);}
      else{
      t.slFired=true;const duration=t.openTime?Math.round((Date.now()-t.openTime)/60000):null;
      if(t.tp1Fired){await tgQMRUpdate(t,'be_close');tradeHistory.push({instId:t.instId,type:t.type,tf:t.tf,outcome:'WIN',time:new Date().toISOString(),duration});dailyOutcomeLog.push({id:t.instId,name:t.instName,tf:t.tf,type:t.type,outcome:'WIN',time:new Date().toISOString()});lossStreak=0;winStreak++;if(winStreak===3)await tgSend('\uD83D\uDD25 3 wins in a row. System is performing. Stay disciplined.\n\u2014 The Slayers Model by Rexroz');}
      else if(t.beFired){await tgQMRUpdate(t,'be_sl');tradeHistory.push({instId:t.instId,type:t.type,tf:t.tf,outcome:'BE',time:new Date().toISOString(),duration});dailyOutcomeLog.push({id:t.instId,name:t.instName,tf:t.tf,type:t.type,outcome:'BE',time:new Date().toISOString()});}else{await tgQMRUpdate(t,'sl');tradeHistory.push({instId:t.instId,type:t.type,tf:t.tf,outcome:'SL',time:new Date().toISOString(),duration});dailyOutcomeLog.push({id:t.instId,name:t.instName,tf:t.tf,type:t.type,outcome:'SL',time:new Date().toISOString()});winStreak=0;lossStreak++;if(lossStreak>=2)await tgSend('\u26A0\uFE0F 2 consecutive losses. Review your risk. Reduce position size if needed.\n\u2014 The Slayers Model by Rexroz');}
      activeQMRTrades.splice(i,1);continue;
      }
    }
    if(!t.beFired&&(isB?price>=t.beLevel:price<=t.beLevel)){t.beFired=true;t.sl=t.qmLevel;t.beTime=Date.now();await tgQMRUpdate(t,'be');}
    if(!t.tp1Fired&&(isB?hi>=t.tp1:lo<=t.tp1)){t.tp1Fired=true;t.tp1Time=Date.now();t.openTime=t.openTime||t.tp1Time;await tgQMRUpdate(t,'tp1');tradeHistory.push({instId:t.instId,type:t.type,tf:t.tf,outcome:'TP1',time:new Date().toISOString(),duration:t.openTime?Math.round((Date.now()-t.openTime)/60000):null});dailyOutcomeLog.push({id:t.instId,name:t.instName,tf:t.tf,type:t.type,outcome:'TP1',time:new Date().toISOString()});}
    // Trailing stop suggestion: if price moves 1R past TP1, suggest trailing SL to TP1
    if(t.tp1Fired&&!t.trailSuggested){
      const slDist=Math.abs(t.qmLevel-t.sl);
      const trailTrigger=isB?t.tp1+slDist:t.tp1-slDist;
      if((isB?price>=trailTrigger:price<=trailTrigger)){
        t.trailSuggested=true;
        const p2=t.dec;
        await tgSend('\uD83D\uDD12 TRAIL YOUR STOP\n'+'='.repeat(28)+'\n'+
          '\uD83D\uDCCA '+t.instName+' \u00B7 '+t.tf+' | '+(isB?'BUY':'SELL')+' QMR\n\n'+
          'Price has moved 1R past TP1.\n'+
          'Consider trailing your SL to TP1: '+t.tp1.toFixed(p2)+'\n'+
          'This locks in additional profit on your remaining 50%.\n\n'+
          '\u2014 The Slayers Model by Rexroz');
      }
    }
    if(!t.tp2Fired&&(isB?hi>=t.tp2:lo<=t.tp2)){t.tp2Fired=true;await tgQMRUpdate(t,'tp2');const dur2=t.openTime?Math.round((Date.now()-t.openTime)/60000):null;dailyOutcomeLog.push({id:t.instId,name:t.instName,tf:t.tf,type:t.type,outcome:'TP2',time:new Date().toISOString()});const r=tradeHistory.findLast(x=>x.instId===t.instId&&x.outcome==='TP1');if(r){r.outcome='TP2';r.duration=dur2;}else tradeHistory.push({instId:t.instId,type:t.type,tf:t.tf,outcome:'TP2',time:new Date().toISOString(),duration:dur2});lossStreak=0;winStreak++;if(winStreak===3)await tgSend('\uD83D\uDD25 3 wins in a row. System is performing. Stay disciplined.\n\u2014 The Slayers Model by Rexroz');activeQMRTrades.splice(i,1);}
  }
}

// Main scan
async function runScan(manual=false){
  if(!API_KEY)return;
  const sess=getSess(),doW=manual||scanCount%WEEKLY_EVERY===0;
  log(`Scan #${scanCount} | Session: ${sess} | Weekend: ${isWeekend()}`);
  const briefingData={};
  if(Date.now()-lastNewsFetch>6*60*60*1000)await fetchNewsEvents();
  const now=new Date(),h=now.getUTCHours(),m=now.getUTCMinutes(),today=now.toUTCString().slice(0,16),dow=now.getUTCDay();
  if(!isWeekend()&&h===7&&m<30&&lastBriefing!==today){lastBriefing=today;await sendDailyBriefing();await tgMorningMessage();}
  if(!isWeekend()&&h===22&&m<30&&lastEOD!==today){lastEOD=today;await tgEODSummary();await tgEveningMessage();}
  const thisWeek=now.toISOString().slice(0,10);
  if(dow===0&&h===20&&m<30&&lastWeeklySummary!==thisWeek){lastWeeklySummary=thisWeek;await tgWeeklySummary();}

  // CRT scan
  for(const inst of CRT_INSTS){
    if(doW){
      try{
        const wr=await fetch(`https://api.twelvedata.com/time_series?symbol=${encodeURIComponent(inst.sym)}&interval=1week&outputsize=20&apikey=${API_KEY}`);
        const wj=await wr.json();
        if(wj.status!=='error'){
          const wc=parseC(wj),newBias=getWBias(wc),oldBias=weeklyCache[inst.id]?.bias;
          if(oldBias&&oldBias!=='NEUTRAL'&&newBias!=='NEUTRAL'&&oldBias!==newBias){log(`BIAS FLIP: ${inst.id} ${oldBias}->${newBias}`);await tgBiasFlip(inst.id,oldBias,newBias);}
          prevWeeklyCache[inst.id]=weeklyCache[inst.id];weeklyCache[inst.id]={bias:newBias,lvls:getWLvls(wc)};
        }
        await sleep(DELAY_MS);
      }catch(e){log('Weekly '+inst.id+': '+e.message);}
    }
    const wc=weeklyCache[inst.id]||{bias:'NEUTRAL',lvls:null};
    try{
      const res=await fetch(`https://api.twelvedata.com/time_series?symbol=${encodeURIComponent(inst.sym)}&interval=1day&outputsize=100&apikey=${API_KEY}`);
      const json=await res.json();if(json.status==='error'){await sleep(DELAY_MS);continue;}
      const c=parseC(json);if(c.length<10){await sleep(DELAY_MS);continue;}
      briefingData[inst.id]={price:fmtN(c[c.length-1].close,inst.dec)};
      dailyCache[inst.id]={c,ts:Date.now()};
      const sdZ=detectSD(c),obs=detectOB(c),fvgs=detectFVG(c),brk=detectBRK(c,sdZ),fib=detectFib(c),struct=detectStructure(c),prevDay=getPD(c),prevWeek=wc.lvls,crt=detectCRT(c);
      if(crt&&!(isWeekend()&&inst.id!=='BTCUSD')){
        const sc=calcCRTScore(crt,sdZ,obs,fvgs,brk,wc.bias,sess,prevDay,prevWeek,fib,struct,detectLiquidity(c,crt.sweep,crt.type));
        if(sc.score>=CRT_MIN){const key=inst.id+'-DAILY-CRT-'+crt.dt;if(!crtSeen.has(key)){crtSeen.add(key);const newsWarn=isNewsBlocked(inst.id);log(`CRT: ${inst.id} ${crt.type} ${sc.score}/10`);await tgCRT(inst.id,crt,sc,wc.bias,sess,newsWarn);
        await tgSendChart(inst.id,'1D',[
          {price:crt.crtH,text:'CRT HIGH',color:'rgb(245,166,35)'},
          {price:crt.crtL,text:'CRT LOW',color:'rgb(245,166,35)'},
          {price:crt.sweep,text:'SWEEP',color:'rgb(244,67,54)'}
        ],(crt.type==='BULLISH'?'\uD83D\uDFE2 BUY':'\uD83D\uDD34 SELL')+' SETUP '+inst.id+' \u00B7 DAILY CRT \u00B7 '+sc.score+'/10\n\u2014 The Slayers Model by Rexroz');await resolveConflicts(inst.id,crt.type,'DAILY','CRT',wc.bias);recentCRTAlerts=recentCRTAlerts.filter(a=>Date.now()-a.ts<4*60*60*1000);recentCRTAlerts.push({id:inst.id,price:crt.price,type:crt.type,score:sc.score,ts:Date.now()});alertLog.unshift({type:'CRT',id:inst.id,tf:'DAILY',dir:crt.type,score:sc.score,time:new Date().toISOString()});dailyAlertLog.push({type:'CRT',id:inst.id,tf:'DAILY',dir:crt.type,score:sc.score,time:new Date().toISOString()});if(alertLog.length>20)alertLog.pop();}}
      }
      await sleep(DELAY_MS);
    }catch(e){log('CRT '+inst.id+': '+e.message);await sleep(DELAY_MS);}
  }

  // Weekly bias fetch for QMR-only pairs (pairs not in CRT_INSTS)
  if(doW){
    const qmrOnly=QMR_INSTS.filter(qi=>!CRT_INSTS.find(ci=>ci.id===qi.id));
    for(const inst of qmrOnly){
      try{
        const wr=await fetch(`https://api.twelvedata.com/time_series?symbol=${encodeURIComponent(inst.sym)}&interval=1week&outputsize=20&apikey=${API_KEY}`);
        const wj=await wr.json();
        if(wj.status!=='error'){
          const wc=parseC(wj),newBias=getWBias(wc),oldBias=weeklyCache[inst.id]?.bias;
          if(oldBias&&oldBias!=='NEUTRAL'&&newBias!=='NEUTRAL'&&oldBias!==newBias){
            log(`BIAS FLIP: ${inst.id} ${oldBias}->${newBias}`);
            await tgBiasFlip(inst.id,oldBias,newBias);
          }
          prevWeeklyCache[inst.id]=weeklyCache[inst.id];
          weeklyCache[inst.id]={bias:newBias,lvls:getWLvls(wc)};
        }
        await sleep(DELAY_MS);
      }catch(e){log('Weekly QMR '+inst.id+': '+e.message);}
    }
  }

  // QMR scan
  if(manual||scanCount%2===0){
    for(const inst of QMR_INSTS){
      const dce=dailyCache[inst.id];
      if(!dce||Date.now()-dce.ts>26*60*60*1000){
        try{
          const dres=await fetch(`https://api.twelvedata.com/time_series?symbol=${encodeURIComponent(inst.sym)}&interval=1day&outputsize=60&apikey=${API_KEY}`);
          const dj=await dres.json();
          if(dj.status!=='error'){const dcand=parseC(dj);if(dcand.length>=10)dailyCache[inst.id]={c:dcand,ts:Date.now()};}
          await sleep(DELAY_MS);
        }catch(e){log('DailyCache '+inst.id+': '+e.message);await sleep(DELAY_MS);}
      }
    }
    for(const inst of QMR_INSTS){
      for(const tf of QMR_TFS){
        try{
          const res=await fetch(`https://api.twelvedata.com/time_series?symbol=${encodeURIComponent(inst.sym)}&interval=${tf}&outputsize=100&apikey=${API_KEY}`);
          const json=await res.json();if(json.status==='error'){await sleep(DELAY_MS);continue;}
          const c=parseC(json);if(c.length<25){await sleep(DELAY_MS);continue;}
          const lastC=c[c.length-1];
          await checkQMRTrades(inst.id,lastC.close,lastC.high,lastC.low);
          const qmrs=detectQMR(c);
          for(const qmr of qmrs){
            qmr.drawOnLiquidity=findDrawOnLiquidity(c,qmr.type,qmr.qmLevel,qmr.atr);
            const sl_q=qmr.retestSL!=null?qmr.retestSL:(qmr.type==='BULLISH'?qmr.head-qmr.atr*0.1:qmr.head+qmr.atr*0.1),slD_q=Math.abs(qmr.qmLevel-sl_q),tp1_q=qmr.drawOnLiquidity?qmr.drawOnLiquidity.price:(qmr.type==='BULLISH'?qmr.qmLevel+slD_q*3:qmr.qmLevel-slD_q*3);
            qmr.structuralTP2=slD_q>0?findStructuralTP2(c,qmr.type,qmr.qmLevel,slD_q,tp1_q):null;
            if(isWeekend()&&inst.id!=='BTCUSD')continue;
            if(tf==='1h'&&!inKillzone(inst.id)){log('QMR skipped (outside killzone): '+inst.id+' '+qmr.type);continue;}
            if(isLevelAlreadySeen(inst.id,qmr.type,qmr.qmLevel))continue;
            if(isNewsBlocked(inst.id)){log(`QMR BLOCKED (news): ${inst.id} ${tf}`);continue;}
            const key=inst.id+'-'+qmr.type+'-'+qmr.qmLevel.toFixed(3);
            if(!qmrSeen.has(key)){
              const qmrTF=tf==='1h'?'1H':'4H',htfBias=weeklyCache[inst.id]?.bias||'NEUTRAL';
              const dailyPOI=checkDailyPOI(inst.id,qmr.type,qmr.qmLevel);
              if(dailyPOI)qmr.dailyPOI=dailyPOI;
              const counterTrend=htfBias!=='NEUTRAL'&&qmr.type!==htfBias;
              if(counterTrend){
                const dTrend=getDailyTrend(inst.id),dFlip=dTrend!=='RANGING'&&dTrend===qmr.type;
                if(!(qmr.criteria.score>=4||dailyPOI||dFlip)){log('QMR suppressed (weak counter-trend): '+inst.id+' '+qmrTF+' '+qmr.type);continue;}
                qmr.counterTrend=true;
              }
              const isBlocked=await resolveConflicts(inst.id,qmr.type,qmrTF,'QMR',htfBias);
              if(isBlocked){log(`QMR BLOCKED by higher TF: ${inst.id} ${qmrTF} ${qmr.type}`);continue;}
              // Time-based duplicate guard — same pair+direction within 4h
              const fireKey=inst.id+'-'+qmr.type;
              const lastFire=recentQMRFires[fireKey];
              if(lastFire&&Date.now()-lastFire<4*60*60*1000){
                log(`QMR suppressed (4h cooldown): ${inst.id} ${qmrTF} ${qmr.type}`);
                continue;
              }
              recentQMRFires[fireKey]=Date.now();
              qmrSeen.add(key);
              if(qmrTF==='4H')qmr4HCache[inst.id]={qmr,time:Date.now()};
              const cached4H=qmr4HCache[inst.id],multiTF=qmrTF==='1H'&&cached4H&&cached4H.qmr.type===qmr.type&&(Date.now()-cached4H.time)<24*60*60*1000;
              const sessWarn=!isPairInSession(inst.id);
              // ADR context — informational only, never blocks a valid setup
              // If range is extended today, note that TP may take 1-2 sessions
              const adr=calcADR(c,14),todayRng=getTodayRange(c);
              const adrPct=adr>0?Math.round((todayRng/adr)*100):0;
              const adrWarn=adrPct>=80?adrPct:null; // only note if very extended (80%+)
              if(adrWarn)log(`ADR context: ${inst.id} ${adrPct}% daily range consumed`);
              log(`QMR: ${inst.id} ${qmrTF} ${qmr.type} ${qmr.qmLevel} HTF:${htfBias}${multiTF?' [MULTI-TF]':''}${adrWarn?' ADR:'+adrWarn+'%':''}`);
              if(multiTF){await tgMultiTFConfluence(inst.id,qmr,cached4H.qmr);}
              else{await tgQMR(inst.id,qmrTF,qmr,htfBias,sessWarn,adrWarn);}
              const crtMatch=recentCRTAlerts.find(a=>a.id===inst.id&&a.type===qmr.type&&Math.abs(a.price-qmr.qmLevel)/qmr.qmLevel<PROX*5);
              if(crtMatch&&!multiTF)await tgSend('\uD83D\uDD25\uD83D\uDD04 CRT+QMR CONFLUENCE: '+inst.id+' - EXTREMELY HIGH PROBABILITY\n\u2705 Daily CRT: '+crtMatch.score+'/10\n\u2705 '+qmrTF+' QMR: '+qmr.criteria.score+'/4\n\u2014 The Slayers Model by Rexroz');
              const isB2=qmr.type==='BULLISH',entry2=qmr.qmLevel,sl2=sl_q,slDist2=slD_q,tp2_2=qmr.structuralTP2?qmr.structuralTP2.price:(isB2?entry2+slDist2*2.5:entry2-slDist2*2.5);
              const instObj=QMR_INSTS.find(x=>x.id===inst.id)||{dec:5,name:inst.id};
              activeQMRTrades.push({instId:inst.id,instName:instObj.name,tf:qmrTF,type:qmr.type,qmLevel:entry2,sl:sl2,tp1:tp1_q,tp2:tp2_2,beLevel:isB2?entry2+slDist2:entry2-slDist2,dec:instObj.dec,beFired:false,tp1Fired:false,tp2Fired:false,slFired:false,trailSuggested:false,openTime:Date.now()});
              await tgSendChart(inst.id,qmrTF==='1H'?'1h':'4h',[
                {price:entry2,text:'ENTRY',color:'rgb(38,166,154)'},
                {price:sl2,text:'SL',color:'rgb(244,67,54)'},
                {price:tp1_q,text:'TP1',color:'rgb(245,166,35)'}
              ],(qmr.type==='BULLISH'?'\uD83D\uDFE2 BUY':'\uD83D\uDD34 SELL')+' '+inst.id+' \u00B7 '+qmrTF+' QMR\nEntry '+entry2.toFixed(instObj.dec)+' | SL '+sl2.toFixed(instObj.dec)+' | TP2 '+tp2_2.toFixed(instObj.dec)+'\n\u2014 The Slayers Model by Rexroz');
              alertLog.unshift({type:'QMR',id:inst.id,tf:qmrTF,dir:qmr.type,score:qmr.criteria.score,time:new Date().toISOString()});
              dailyAlertLog.push({type:'QMR',id:inst.id,tf:qmrTF,dir:qmr.type,score:qmr.criteria.score,time:new Date().toISOString()});
              if(alertLog.length>20)alertLog.pop();
            }
          }
          await sleep(DELAY_MS);
        }catch(e){log('QMR '+inst.id+' '+tf+': '+e.message);await sleep(DELAY_MS);}
      }
    }
  }
  if(qmrSeen.size>400)qmrSeen=new Set([...qmrSeen].slice(-200));if(crtSeen.size>400)crtSeen=new Set([...crtSeen].slice(-200));for(const k in recentQMRFires)if(Date.now()-recentQMRFires[k]>24*60*60*1000)delete recentQMRFires[k];scanCount++;lastScanTime=new Date().toISOString();
  log(`Scan complete #${scanCount}`);
}

// Dashboard
app.get('/',(req,res)=>{
  const up=process.uptime(),hrs=Math.floor(up/3600),mins=Math.floor((up%3600)/60),wr=(()=>{const w=tradeHistory.filter(t=>t.outcome==='TP1'||t.outcome==='TP2'||t.outcome==='WIN').length,l=tradeHistory.filter(t=>t.outcome==='SL').length;return(w+l)?Math.round((w/(w+l))*100):0;})();
  const alerts=alertLog.slice(0,10).map(a=>`<tr><td>${a.time.slice(11,19)}</td><td>${a.type}</td><td>${a.id}</td><td>${a.tf}</td><td style="color:${a.dir==='BULLISH'?'#4ade80':'#f87171'}">${a.dir}</td><td>${a.score}</td></tr>`).join('');
  const trades=activeQMRTrades.map(t=>`<tr><td>${t.instName}</td><td>${t.tf}</td><td style="color:${t.type==='BULLISH'?'#4ade80':'#f87171'}">${t.type}</td><td>${t.qmLevel.toFixed(t.dec)}</td><td>${t.sl.toFixed(t.dec)}</td><td>${t.beFired?'BE&#10003; ':''}${t.tp1Fired?'TP1&#10003; ':''}${t.tp2Fired?'TP2&#10003;':''}</td></tr>`).join('');
  const news=newsCache.slice(0,8).map(e=>`<tr><td>${e.country}</td><td>${e.title}</td><td style="color:#f87171">High</td><td>${new Date(e.date).toUTCString().slice(17,22)} UTC</td></tr>`).join('');
  res.send(`<!DOCTYPE html><html><head><title>Slayers v8.0</title><meta charset="UTF-8"><style>body{background:#080c10;color:#c8d8e8;font-family:monospace;padding:20px}h1{color:#26A69A}h2{color:#c084fc;font-size:13px;margin-top:20px}table{border-collapse:collapse;width:100%;margin-top:6px}td,th{border:1px solid #1e2530;padding:6px 10px;font-size:12px}th{color:#26A69A;background:#0c1218}.dim{color:#4a6a7a}.live{color:#4ade80}.gold{color:#F5A623}</style></head><body>
<h1>SLAYERS ALERT SYSTEM v8.0</h1>
<p>Status: <span class="live">LIVE</span> | Uptime: ${hrs}h ${mins}m | Scans: ${scanCount} | Last: ${lastScanTime||'&mdash;'}</p>
<p class="dim">Session: ${getSess()} | Weekend: ${isWeekend()?'Yes':'No'} | CRT: ${CRT_INSTS.length} pairs | QMR: ${QMR_INSTS.length} pairs</p>
<p class="gold">Win Rate: ${wr}% | Completed: ${tradeHistory.length} | News: ${newsCache.length} | W:${winStreak} L:${lossStreak}</p>
<h2>RECENT ALERTS</h2>
<table><tr><th>Time</th><th>System</th><th>Pair</th><th>TF</th><th>Direction</th><th>Score</th></tr>${alerts||'<tr><td colspan="6" class="dim">No alerts yet</td></tr>'}</table>
<h2>ACTIVE QMR TRADES</h2>
<table><tr><th>Pair</th><th>TF</th><th>Type</th><th>Entry</th><th>SL</th><th>Progress</th></tr>${trades||'<tr><td colspan="6" class="dim">No active trades</td></tr>'}</table>
<h2>HIGH IMPACT NEWS THIS WEEK</h2>
<table><tr><th>Currency</th><th>Event</th><th>Impact</th><th>Time</th></tr>${news||'<tr><td colspan="4" class="dim">Loading...</td></tr>'}</table>
<p class="dim" style="margin-top:20px">The Slayers Model by Rex Roz | v8.0</p>
</body></html>`);
});

app.listen(PORT,()=>log(`Port ${PORT}`));
// Keep-alive: ping own public URL every 10 min so Render free tier never sleeps
const SELF_URL=process.env.RENDER_EXTERNAL_URL||'';
if(SELF_URL)setInterval(()=>{fetch(SELF_URL+'/').catch(()=>{});},10*60*1000);
log('Slayers Alert System v8.0 starting...');
runScan(true).then(()=>{setInterval(()=>runScan(false),CHECK_MS);log(`Scanning every ${CHECK_MS/60000} minutes`);});
