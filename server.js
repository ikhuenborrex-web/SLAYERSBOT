'use strict';
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

const API_KEY  = process.env.TWELVEDATA_API_KEY  || '';
const TG_TOKEN = process.env.TELEGRAM_TOKEN      || '';
const TG_CHAT  = process.env.TELEGRAM_CHAT_ID    || '';
if(!API_KEY||!TG_TOKEN||!TG_CHAT)console.warn('Missing env vars.');

// ═══ CONFIG ══════════════════════════════════════════════════════
const CRT_INSTS = [
  {id:'EURUSD',sym:'EUR/USD',name:'EUR/USD',dec:5},
  {id:'GBPUSD',sym:'GBP/USD',name:'GBP/USD',dec:5},
  {id:'USDJPY',sym:'USD/JPY',name:'USD/JPY',dec:3},
  {id:'AUDUSD',sym:'AUD/USD',name:'AUD/USD',dec:5},
  {id:'BTCUSD',sym:'BTC/USD',name:'BTC/USD',dec:2},
  {id:'XAUUSD',sym:'XAU/USD',name:'XAU/USD',dec:2},
  {id:'US30',  sym:'DIA',    name:'US30',   dec:2},
  {id:'SP500', sym:'SPY',    name:'SP500',  dec:2},
];
const QMR_INSTS = [
  {id:'EURUSD',sym:'EUR/USD',name:'EUR/USD',dec:5},
  {id:'GBPUSD',sym:'GBP/USD',name:'GBP/USD',dec:5},
  {id:'USDJPY',sym:'USD/JPY',name:'USD/JPY',dec:3},
  {id:'AUDUSD',sym:'AUD/USD',name:'AUD/USD',dec:5},
  {id:'EURJPY',sym:'EUR/JPY',name:'EUR/JPY',dec:3},
  {id:'GBPJPY',sym:'GBP/JPY',name:'GBP/JPY',dec:3},
  {id:'US30',  sym:'DIA',    name:'US30',   dec:2},
  {id:'SP500', sym:'SPY',    name:'SP500',  dec:2},
  {id:'BTCUSD',sym:'BTC/USD',name:'BTC/USD',dec:2},
];
const QMR_TFS  = ['1h','4h'];
const CHECK_MS = 30*60*1000;
const DELAY_MS = 12000;
const PROX     = 0.007;
const IMPULSE  = 0.0015;
const MIN_FVG  = 0.0003;
const CRT_MIN  = 3;
const QMR_MIN  = 3;
const WEEKLY_EVERY = 6;
const LON_S=7,LON_E=16,NY_S=13,NY_E=22;

// ═══ PAIR SESSION MAP ════════════════════════════════════════════
const PAIR_SESSIONS = {
  EURUSD:{s:7, e:22},GBPUSD:{s:7, e:22},USDJPY:{s:0, e:22},
  AUDUSD:{s:0, e:16},EURJPY:{s:0, e:22},GBPJPY:{s:0, e:22},
  XAUUSD:{s:7, e:22},US30:  {s:13,e:22},SP500: {s:13,e:22},
  BTCUSD:{s:0, e:24},
};
const PAIR_CURRENCIES = {
  EURUSD:['EUR','USD'],GBPUSD:['GBP','USD'],USDJPY:['USD','JPY'],
  AUDUSD:['AUD','USD'],EURJPY:['EUR','JPY'],GBPJPY:['GBP','JPY'],
  XAUUSD:['XAU','USD'],US30:['USD'],SP500:['USD'],BTCUSD:['BTC'],
};

// ═══ DAILY MESSAGES ══════════════════════════════════════════════
const MORNING_MOTIVATION = [
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
const MORNING_EDUCATION = [
  "CRT reminder: The sweep of the high or low is the manipulation. The close back inside the range is the signal. Never enter on the sweep — wait for the close.",
  "QMR reminder: The head is the most important candle in the pattern. It must sweep liquidity — equal highs or equal lows — before the reversal is valid.",
  "Premium and Discount: Always sell in premium (above the 50% midpoint) and buy in discount (below it). Trading against this is trading against institutional positioning.",
  "The Draw on Liquidity is where smart money is targeting next. Equal highs above price are buy side liquidity. Equal lows below are sell side liquidity. That is where the move is going.",
  "An Order Block is the last bearish candle before a bullish impulse, or the last bullish candle before a bearish impulse. When price returns to it, institutions are re-entering.",
  "Market Structure Shift means the trend has changed. A close through the last swing high or swing low is your confirmation. Structure defines direction.",
  "A Fair Value Gap is an imbalance in price delivery. Three candles where the third candle's low is above the first candle's high (bullish) or vice versa (bearish). Price tends to return and fill it.",
  "Displacement after the head in a QMR tells you the reversal is genuine. A weak candle after the sweep is not displacement — you need a strong body candle moving decisively in the reversal direction.",
  "HTF bias matters. A 1H setup going against the weekly structure is a lower probability trade. Always check what the higher timeframe is doing before entering.",
  "Engineered liquidity means smart money intentionally created a setup to trap retail traders. Equal highs, equal lows, and obvious swing levels are targets. When they get swept — that is your signal.",
  "Stop losses exist to protect your account, not to predict the market. A stop at the protected high or low means if price returns there, the entire setup is invalid anyway.",
  "Confirmation candle before entry. The bot identifies the level. Your job is to wait for price to show rejection before you execute. A wick, pin bar or engulfing candle is your confirmation.",
  "The weekly bias tells you which direction institutions are positioned for the week. Trading with that bias on your intraday setups dramatically improves your probability.",
  "Liquidity runs in cycles. Price sweeps one side, reverses, sweeps the other. Understanding this cycle is understanding how the market actually moves.",
  "Session awareness: London creates the range. New York breaks it and delivers the move. The overlap between 13:00 and 16:00 UTC is where the highest probability moves happen.",
];
const EVENING_MOTIVATION = [
  "Whatever happened today — wins or losses — close your charts and rest. The market opens again tomorrow. Your mental clarity is your most valuable asset.",
  "If you followed your rules today, it was a good day. Full stop. The outcome does not define the quality of your execution.",
  "A loss taken at your stop loss is a disciplined trade. A loss that ran because you moved your stop is a lesson you need to learn from tonight.",
  "Review your trades from today with honesty, not emotion. What did you do well? What would you do differently? Growth comes from reflection.",
  "The trading day is over. Step away from the charts. The best thing you can do for tomorrow's performance is rest properly tonight.",
  "Not every day will go your way. The traders who succeed long term show up tomorrow with the same discipline regardless of today's result.",
  "If today was frustrating, remember why you started. The journey to consistent profitability takes time. Stay committed.",
  "The market humbles everyone. Every professional trader you admire has had days like today. What matters is that you show up tomorrow better.",
  "Close your charts. Go eat. Spend time with the people you love. Trading is a means to a life — not a substitute for one.",
  "Tonight, forget the P&L. Ask yourself one question — did I trade my plan today? If yes, you did your job. The rest is market noise.",
  "The best traders treat their losses like tuition fees. You paid to learn something today. Make sure you actually learned it.",
  "Rest is productive. Sleep clears the emotional residue from today's trading. Tomorrow you need a fresh mind, not a tired one.",
  "Every day you stay in this game is a day closer to consistency. Most traders quit before they get there. You are still here. That matters.",
  "Whether today was green or red, the most important trade you make is always the next one. Stay disciplined. See you tomorrow.",
  "Trading rewards patience and punishes impatience. If today tested you, take it as training. The discipline you build now is what the big trades will require.",
];
const EVENING_EDUCATION = [
  "End of day review habit: Look at every setup the bot flagged today. Did price follow through? Did it hit the Draw on Liquidity? This is how you build pattern recognition over time.",
  "Reviewing your losses is more valuable than celebrating your wins. A loss always contains information. A win sometimes just contains luck. Know the difference.",
  "Check the higher timeframe bias before tomorrow's session. Weekly and daily structure tell you which direction has the higher probability. Prepare your bias tonight.",
  "Mark your key levels for tomorrow now — previous day highs and lows, weekly highs and lows, and any untested Order Blocks or FVGs near current price.",
  "If a QMR setup formed today but you didn't take it — go back and study it. Where was the head? Where was the MSS? Where was the retest? Cementing the pattern builds your eye.",
  "A trade that hit stop loss is not necessarily a bad trade. If the setup was valid and you followed your rules, that is a good trade with a negative outcome. There is a difference.",
  "Study the session that moved most today. Was it London? New York? The overlap? Understanding which session delivered the move helps you plan your screen time more effectively.",
  "Look at the pairs that moved strongly today — was there a CRT or QMR structure behind that move? Training yourself to see the pattern after the fact builds the skill to see it before.",
  "Tomorrow's preparation: identify the pairs with the clearest weekly bias and structure. Those are your highest probability candidates for the next session.",
  "If you took a trade outside of your rules today, write it down. Not to punish yourself — to understand what triggered the deviation. Emotional awareness is a trading skill.",
  "End of week habit: Track your win rate, average R:R, and number of impulsive trades. The numbers tell you where your edge is leaking. You cannot fix what you do not measure.",
  "Price always tells the story before it moves. Equal highs, equal lows, imbalances, swept liquidity — the market leaves footprints. Your job is to read them before the crowd does.",
  "The best preparation for tomorrow is reviewing the HTF structure tonight. Daily and weekly candles tell you where institutional money is positioned. Never ignore the bigger picture.",
  "One thing to study tonight: find a recent QMR that played out and draw every component — LL1, LH, head, displacement, MSS, retest. The more you draw it, the faster you see it in real time.",
  "Remember: the bot finds the setup. You confirm and execute. Your role is to apply judgement, manage the trade, and protect your capital. The system and the trader work together.",
];
function getDailyMsg(pool){
  const day=Math.floor(Date.now()/86400000);
  return pool[day%pool.length];
}

// ═══ STATE ═══════════════════════════════════════════════════════
let weeklyCache={},crtSeen=new Set(),qmrSeen=new Set();
let activeQMRTrades=[],lastBriefing=null,lastEOD=null,lastWeeklySummary=null;
let scanCount=0,lastScanTime=null,recentCRTAlerts=[],alertLog=[];
let tradeHistory=[],dailyAlertLog=[],newsCache=[],lastNewsFetch=0;

const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const fmtN=(n,d)=>n==null?'--':n.toLocaleString('en-US',{minimumFractionDigits:d,maximumFractionDigits:d});
const log=msg=>console.log(`[${new Date().toISOString()}] ${msg}`);

// ═══ PARSE ═══════════════════════════════════════════════════════
function parseC(json){
  if(!json?.values?.length)return[];
  return json.values.map(v=>({
    dt:v.datetime,open:parseFloat(v.open),high:parseFloat(v.high),
    low:parseFloat(v.low),close:parseFloat(v.close)
  })).reverse();
}

// ═══ SESSION ═════════════════════════════════════════════════════
function getSess(){
  const h=new Date().getUTCHours(),l=h>=LON_S&&h<LON_E,n=h>=NY_S&&h<NY_E;
  return l&&n?'London/NY Overlap':l?'London':n?'New York':'CLOSED';
}
function isWeekend(){
  const d=new Date().getUTCDay(),h=new Date().getUTCHours();
  return d===6||(d===0&&h<22);
}
function isPairInSession(instId){
  const s=PAIR_SESSIONS[instId];if(!s)return true;
  const h=new Date().getUTCHours();
  if(s.e===24)return true;
  return h>=s.s&&h<s.e;
}

// ═══ NEWS FILTER ═════════════════════════════════════════════════
async function fetchNewsEvents(){
  try{
    const res=await fetch('https://nfs.faireconomy.media/ff_calendar_thisweek.json');
    const data=await res.json();
    newsCache=Array.isArray(data)?data.filter(e=>e.impact==='High'):[];
    lastNewsFetch=Date.now();
    log(`News cache: ${newsCache.length} high-impact events`);
  }catch(e){log('News fetch error: '+e.message);}
}
function isNewsBlocked(instId){
  const currencies=PAIR_CURRENCIES[instId]||[];
  const now=Date.now(),win=30*60*1000;
  return newsCache.some(ev=>{
    if(!currencies.includes(ev.country))return false;
    try{const t=new Date(ev.date).getTime();return Math.abs(now-t)<win;}catch{return false;}
  });
}

// ═══ TECHNICAL ═══════════════════════════════════════════════════
function calcATR(c,p=14){
  if(c.length<2)return 0;
  const trs=c.slice(1).map((x,i)=>Math.max(x.high-x.low,Math.abs(x.high-c[i].close),Math.abs(x.low-c[i].close)));
  return trs.slice(-p).reduce((a,b)=>a+b,0)/Math.min(p,trs.length);
}
function detectSD(c){
  const s=[],d=[];
  for(let i=0;i<c.length-2;i++){
    const b=c[i],n=c[i+1];if(Math.abs(n.close-n.open)/n.open<IMPULSE)continue;
    if(n.close<n.open)s.push({top:b.high,bottom:Math.min(b.open,b.close)});
    else d.push({top:Math.max(b.open,b.close),bottom:b.low});
  }
  return{supply:s.slice(-6).reverse(),demand:d.slice(-6).reverse()};
}
function detectOB(c){
  const bull=[],bear=[];
  for(let i=0;i<c.length-2;i++){
    const b=c[i],n=c[i+1];if(Math.abs(n.close-n.open)/n.open<IMPULSE)continue;
    if(n.close>n.open&&b.close<b.open)bull.push({top:Math.max(b.open,b.close),bottom:Math.min(b.open,b.close)});
    else if(n.close<n.open&&b.close>b.open)bear.push({top:Math.max(b.open,b.close),bottom:Math.min(b.open,b.close)});
  }
  return{bull:bull.slice(-4).reverse(),bear:bear.slice(-4).reverse()};
}
function detectFVG(c){
  const bull=[],bear=[];
  for(let i=0;i<c.length-2;i++){
    const a=c[i],z=c[i+2];
    if(z.low>a.high&&(z.low-a.high)/a.high>MIN_FVG)bull.push({top:z.low,bottom:a.high});
    if(z.high<a.low&&(a.low-z.high)/a.low>MIN_FVG)bear.push({top:a.low,bottom:z.high});
  }
  return{bull:bull.slice(-5).reverse(),bear:bear.slice(-5).reverse()};
}
function detectBRK(c,sdZ){
  const cp=c[c.length-1].close,bull=[],bear=[];
  const near=(p,z)=>p>=z.bottom*(1-PROX)&&p<=z.top*(1+PROX);
  for(const z of sdZ.demand)if(c.some(x=>x.close<z.bottom)&&near(cp,z))bear.push(z);
  for(const z of sdZ.supply)if(c.some(x=>x.close>z.top)&&near(cp,z))bull.push(z);
  return{bull,bear};
}
function detectStructure(c){
  if(c.length<12)return{trend:'RANGING'};
  const sH=[],sL=[];
  for(let i=2;i<c.length-2;i++){
    if(c[i].high>c[i-1].high&&c[i].high>c[i-2].high&&c[i].high>c[i+1].high&&c[i].high>c[i+2].high)sH.push(c[i].high);
    if(c[i].low<c[i-1].low&&c[i].low<c[i-2].low&&c[i].low<c[i+1].low&&c[i].low<c[i+2].low)sL.push(c[i].low);
  }
  if(sH.length<2||sL.length<2)return{trend:'RANGING'};
  const rH=sH.slice(-2),rL=sL.slice(-2);
  if(rH[1]>rH[0]&&rL[1]>rL[0])return{trend:'BULLISH'};
  if(rH[1]<rH[0]&&rL[1]<rL[0])return{trend:'BEARISH'};
  return{trend:'RANGING'};
}
function detectLiquidity(c,sweep,type){
  const tol=0.001,fp=PROX*2;const eqH=[],eqL=[];
  for(let i=0;i<c.length-4;i++){
    for(let j=i+3;j<c.length;j++){if(Math.abs(c[j].high-c[i].high)/c[i].high<tol){eqH.push(c[i].high);break;}}
    for(let j=i+3;j<c.length;j++){if(Math.abs(c[j].low-c[i].low)/c[i].low<tol){eqL.push(c[i].low);break;}}
  }
  if(type==='BEARISH')return eqH.some(h=>Math.abs(sweep-h)/sweep<fp);
  return eqL.some(l=>Math.abs(sweep-l)/sweep<fp);
}
function detectFib(c){
  const rc=c.slice(-60);let sH=-Infinity,sL=Infinity;
  rc.forEach(x=>{if(x.high>sH)sH=x.high;if(x.low<sL)sL=x.low;});
  const r=sH-sL;if(!r)return null;
  return{f618:sH-r*0.618,f705:sH-r*0.705,f500:sH-r*0.5,b618:sL+r*0.618,b705:sL+r*0.705,b500:sL+r*0.5};
}

// ═══ CRT ═════════════════════════════════════════════════════════
function detectCRT(c){
  if(c.length<4)return null;
  const c1=c[c.length-3],c2=c[c.length-2];
  const sH=c2.high>c1.high,sL=c2.low<c1.low;
  if(!sH&&!sL)return null;
  if(c2.close<c1.low||c2.close>c1.high)return null;
  return{type:sH?'BEARISH':'BULLISH',price:c2.close,sweep:sH?c2.high:c2.low,crtH:c1.high,crtL:c1.low,dt:c2.dt};
}
function getWBias(wc){if(!wc||wc.length<2)return'NEUTRAL';const lw=wc[wc.length-2];return lw.close>lw.open?'BULLISH':lw.close<lw.open?'BEARISH':'NEUTRAL';}
function getWLvls(wc){if(!wc||wc.length<2)return null;const lw=wc[wc.length-2];return{high:lw.high,low:lw.low};}
function getPD(c){if(!c||c.length<3)return null;const pd=c[c.length-2];return{high:pd.high,low:pd.low};}
function calcCRTScore(crt,sdZ,obs,fvgs,brk,wBias,sess,prevDay,prevWeek,fib,struct,liq){
  const near=(p,z)=>p>=z.bottom*(1-PROX)&&p<=z.top*(1+PROX);
  const t=crt.type,p=crt.price,sw=crt.sweep;
  const F=[];let sc=0;
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
  const str=sc>=9?'PERFECT':sc>=7?'ELITE':sc>=5?'STRONG':sc>=3?'VALID':'WEAK';
  return{score:sc,factors:F,strength:str,max:10};
}

// ═══ QMR ═════════════════════════════════════════════════════════
function checkPremiumDiscount(c,type,qmLevel){
  const rc=c.slice(-100);let hi=-Infinity,lo=Infinity;
  rc.forEach(x=>{if(x.high>hi)hi=x.high;if(x.low<lo)lo=x.low;});
  return type==='BULLISH'?qmLevel<(hi+lo)/2:qmLevel>(hi+lo)/2;
}
function isLevelAlreadySeen(instId,type,qmLevel){
  for(const key of qmrSeen){
    if(!key.startsWith(instId+'-'+type+'-'))continue;
    const ex=parseFloat(key.split('-').pop());
    if(!isNaN(ex)&&Math.abs(ex-qmLevel)/qmLevel<0.015)return true;
  }
  return false;
}
function findSwings(c){
  const sH=[],sL=[];
  for(let i=3;i<c.length-3;i++){
    if(c[i].high>c[i-1].high&&c[i].high>c[i-2].high&&c[i].high>c[i-3].high&&
       c[i].high>c[i+1].high&&c[i].high>c[i+2].high&&c[i].high>c[i+3].high)
      sH.push({p:c[i].high,i,dt:c[i].dt});
    if(c[i].low<c[i-1].low&&c[i].low<c[i-2].low&&c[i].low<c[i-3].low&&
       c[i].low<c[i+1].low&&c[i].low<c[i+2].low&&c[i].low<c[i+3].low)
      sL.push({p:c[i].low,i,dt:c[i].dt});
  }
  return{sH,sL};
}
function headSweptLiquidity(c,head,type){
  const tol=0.001,refC=c.slice(Math.max(0,head.i-50),head.i);
  let eqSwept=false;
  if(type==='BEARISH'){
    for(let i=0;i<refC.length-2;i++){
      for(let j=i+2;j<refC.length;j++){if(Math.abs(refC[j].high-refC[i].high)/refC[i].high<tol&&head.p>=refC[i].high){eqSwept=true;break;}}
      if(eqSwept)break;
    }
    return eqSwept||refC.some(x=>head.p>x.high*1.0003);
  } else {
    for(let i=0;i<refC.length-2;i++){
      for(let j=i+2;j<refC.length;j++){if(Math.abs(refC[j].low-refC[i].low)/refC[i].low<tol&&head.p<=refC[i].low){eqSwept=true;break;}}
      if(eqSwept)break;
    }
    return eqSwept||refC.some(x=>head.p<x.low*0.9997);
  }
}
function validateQMRCriteria(c,type,head,qmSwing,atr,sH,sL){
  const F=[];let sc=0;
  if(headSweptLiquidity(c,head,type)){sc++;F.push('Liq Sweep');}
  const first3=c.slice(Math.max(0,head.i+1),Math.min(c.length,head.i+4));
  const bearD=type==='BEARISH';
  if(first3.some(x=>{const body=Math.abs(x.close-x.open),range=x.high-x.low;return(bearD?x.close<x.open:x.close>x.open)&&(body>atr*0.85||(range>0&&body/range>0.65));})){sc++;F.push('Displacement');}
  const cp=c[c.length-1].close;
  if(type==='BEARISH'?cp<=qmSwing.p*1.004:cp>=qmSwing.p*0.996){sc++;F.push('MSS');}
  if((type==='BEARISH'?sL:sH).filter(s=>Math.abs(s.p-qmSwing.p)<atr*3&&s.i<head.i).length>=2){sc++;F.push('Eng. Liq');}
  return{valid:sc>=QMR_MIN,score:sc,factors:F};
}
function detectQMR(c){
  if(c.length<35)return[];
  const{sH,sL}=findSwings(c);
  if(sH.length<3||sL.length<3)return[];
  const cp=c[c.length-1].close,atr=calcATR(c,14),results=[];
  // BEARISH
  for(let h=sH.length-1;h>=1;h--){
    const head=sH[h],hh1=sH[h-1];
    if(head.p<=hh1.p||head.i<c.length-45)continue;
    const hlCands=sL.filter(l=>l.i>hh1.i&&l.i<head.i);if(!hlCands.length)continue;
    const hl=hlCands[hlCands.length-1];
    if(!c.slice(head.i+1,Math.min(c.length,head.i+13)).some(x=>x.close<hl.p))continue;
    const dist=Math.abs(cp-hl.p);
    if(!(dist<atr*0.5&&cp<=hl.p*(1+0.0008)&&cp>=hl.p*(1-0.0005)))continue;
    if(!checkPremiumDiscount(c,'BEARISH',hl.p))continue;
    const crit=validateQMRCriteria(c,'BEARISH',head,hl,atr,sH,sL);if(!crit.valid)continue;
    const obs=detectOB(c),fvgs=detectFVG(c);
    const obN=obs.bear.find(z=>Math.abs((z.top+z.bottom)/2-hl.p)<atr*2.0);
    const fvN=fvgs.bear.find(z=>Math.abs((z.top+z.bottom)/2-hl.p)<atr*2.0);
    if(!obN&&!fvN)continue;
    if(obN)crit.factors.push('Reclaimed OB');else crit.factors.push('FVG at QM');
    let trueHigh=head.p;for(let k=head.i;k<c.length;k++){if(c[k].high>trueHigh)trueHigh=c[k].high;}
    results.push({type:'BEARISH',qmLevel:hl.p,head:head.p,cp,atr,criteria:crit,retestSL:trueHigh+atr*0.25});
    break;
  }
  // BULLISH
  for(let l=sL.length-1;l>=1;l--){
    const head=sL[l],ll1=sL[l-1];
    if(head.p>=ll1.p||head.i<c.length-45)continue;
    const lhCands=sH.filter(h=>h.i>ll1.i&&h.i<head.i);if(!lhCands.length)continue;
    const lh=lhCands[lhCands.length-1];
    if(!c.slice(head.i+1,Math.min(c.length,head.i+13)).some(x=>x.close>lh.p))continue;
    const dist=Math.abs(cp-lh.p);
    if(!(dist<atr*0.5&&cp>=lh.p*(1-0.0008)&&cp<=lh.p*(1+0.0005)))continue;
    if(!checkPremiumDiscount(c,'BULLISH',lh.p))continue;
    const crit=validateQMRCriteria(c,'BULLISH',head,lh,atr,sH,sL);if(!crit.valid)continue;
    const obs=detectOB(c),fvgs=detectFVG(c);
    const obN=obs.bull.find(z=>Math.abs((z.top+z.bottom)/2-lh.p)<atr*2.0);
    const fvN=fvgs.bull.find(z=>Math.abs((z.top+z.bottom)/2-lh.p)<atr*2.0);
    if(!obN&&!fvN)continue;
    if(obN)crit.factors.push('Reclaimed OB');else crit.factors.push('FVG at QM');
    let trueLow=head.p;for(let k=head.i;k<c.length;k++){if(c[k].low<trueLow)trueLow=c[k].low;}
    results.push({type:'BULLISH',qmLevel:lh.p,head:head.p,cp,atr,criteria:crit,retestSL:trueLow-atr*0.25});
    break;
  }
  return results;
}
function findDrawOnLiquidity(c,type,entryPrice,atr){
  const tol=0.001,minDist=atr*3;
  const eqH=[],eqL=[];
  for(let i=0;i<c.length-4;i++){
    for(let j=i+3;j<c.length;j++){if(Math.abs(c[j].high-c[i].high)/c[i].high<tol){eqH.push(c[i].high);break;}}
    for(let j=i+3;j<c.length;j++){if(Math.abs(c[j].low-c[i].low)/c[i].low<tol){eqL.push(c[i].low);break;}}
  }
  if(type==='BULLISH'){const t=eqH.filter(h=>h>entryPrice+minDist).sort((a,b)=>a-b);return t.length?{price:t[0],label:'Buy Side Liquidity'}:null;}
  const t=eqL.filter(l=>l<entryPrice-minDist).sort((a,b)=>b-a);return t.length?{price:t[0],label:'Sell Side Liquidity'}:null;
}
// TP2: next structural target between 2.5R and 3R from entry
function findStructuralTP2(c,type,entryPrice,slDist,tp1Price){
  if(slDist<=0)return null;
  const minTarget=type==='BULLISH'?entryPrice+slDist*2.5:entryPrice-slDist*2.5;
  const maxTarget=type==='BULLISH'?entryPrice+slDist*3.0:entryPrice-slDist*3.0;
  const tol=0.001;const eqH=[],eqL=[],swH=[],swL=[];
  for(let i=0;i<c.length-4;i++){
    for(let j=i+3;j<c.length;j++){if(Math.abs(c[j].high-c[i].high)/c[i].high<tol){eqH.push(c[i].high);break;}}
    for(let j=i+3;j<c.length;j++){if(Math.abs(c[j].low-c[i].low)/c[i].low<tol){eqL.push(c[i].low);break;}}
  }
  for(let i=3;i<c.length-3;i++){
    if(c[i].high>c[i-1].high&&c[i].high>c[i-2].high&&c[i].high>c[i+1].high&&c[i].high>c[i+2].high)swH.push(c[i].high);
    if(c[i].low<c[i-1].low&&c[i].low<c[i-2].low&&c[i].low<c[i+1].low&&c[i].low<c[i+2].low)swL.push(c[i].low);
  }
  if(type==='BULLISH'){
    const cands=[...eqH,...swH].filter(h=>h>tp1Price&&h>=minTarget&&h<=maxTarget).sort((a,b)=>a-b);
    if(cands.length)return{price:cands[0],rr:((cands[0]-entryPrice)/slDist).toFixed(1)};
    // fallback: use 2.5R fixed if no structure found in range
    return{price:entryPrice+slDist*2.5,rr:'2.5'};
  } else {
    const cands=[...eqL,...swL].filter(l=>l<tp1Price&&l<=minTarget&&l>=maxTarget).sort((a,b)=>b-a);
    if(cands.length)return{price:cands[0],rr:((entryPrice-cands[0])/slDist).toFixed(1)};
    return{price:entryPrice-slDist*2.5,rr:'2.5'};
  }
}

// ═══ TELEGRAM ════════════════════════════════════════════════════
async function tgSend(text){
  if(!TG_TOKEN||!TG_CHAT)return;
  try{
    await fetch(`https://api.telegram.org/bot${TG_TOKEN}/sendMessage`,{
      method:'POST',headers:{'Content-Type':'application/json'},
      body:JSON.stringify({chat_id:TG_CHAT,text})
    });
  }catch(e){log('Telegram error: '+e.message);}
}
async function tgCRT(id,crt,sc,wBias,sess,newsWarn){
  const bear=crt.type==='BEARISH',p=crt.price>10?2:5;
  const strMap={PERFECT:'\uD83D\uDC8E PERFECT',ELITE:'\u26A1 ELITE',STRONG:'\uD83D\uDD25 STRONG',VALID:'\uD83D\uDFE1 VALID'};
  const filled='\u2B50'.repeat(sc.score)+'\u25A1'.repeat(sc.max-sc.score);
  let msg='\u26A1 SLAYERS CRT ALERT \u26A1\n'+(strMap[sc.strength]||'\uD83D\uDFE1 VALID')+'\n'+'='.repeat(28)+'\n'+
    '\uD83D\uDCCA '+id+' \u00B7 DAILY\n'+(bear?'\uD83D\uDD34 SELL SETUP':'\uD83D\uDFE2 BUY SETUP')+'\n'+(bear?'\uD83D\uDCC9 BEARISH CRT':'\uD83D\uDCC8 BULLISH CRT')+'\n\n'+
    '\uD83C\uDFAF Swept:  '+crt.sweep.toFixed(p)+'\n\u2705 Closed: '+crt.price.toFixed(p)+'\n\uD83D\uDCE6 Range:  '+crt.crtL.toFixed(p)+' \u2013 '+crt.crtH.toFixed(p)+'\n\n'+
    '\uD83D\uDD25 Score: '+sc.score+'/'+sc.max+'  '+filled+'\n'+sc.factors.map(f=>'\u2705 '+f).join('\n')+'\n\n'+
    '\uD83D\uDCC5 Weekly Bias: '+wBias+'\n\uD83D\uDFE2 Session: '+sess+'\n\n';
  if(newsWarn)msg+='\u26A0\uFE0F HIGH IMPACT NEWS NEARBY \u2014 Trade with caution\n\n';
  msg+='\u26A0\uFE0F Confirm structure on chart before entering.\n\u2014 The Slayers Model by Rexroz';
  await tgSend(msg);
}
async function tgQMR(id,tf,qmr,htfBias,sessWarn){
  const bear=qmr.type==='BEARISH',p=qmr.qmLevel>10?2:5;
  const zone=bear?'PREMIUM \u2014 Sell Zone':'DISCOUNT \u2014 Buy Zone';
  const entry=qmr.qmLevel;
  const sl=qmr.retestSL!=null?qmr.retestSL:(bear?qmr.head+qmr.atr*0.1:qmr.head-qmr.atr*0.1);
  const slDist=Math.abs(entry-sl);
  const dol=qmr.drawOnLiquidity;
  const tp1=dol?dol.price:(bear?entry-slDist*3:entry+slDist*3);
  const rr1=slDist>0?(Math.abs(tp1-entry)/slDist).toFixed(1):'--';
  const tp2data=qmr.structuralTP2;
  const tp2=tp2data?tp2data.price:(bear?entry-slDist*2.5:entry+slDist*2.5);
  const rr2=tp2data?tp2data.rr:(slDist>0?(Math.abs(tp2-entry)/slDist).toFixed(1):'2.5');
  const dolLabel=dol?dol.label:'Draw on Liquidity';
  const slLabel=bear?'above protected high':'below protected low';
  let htfLine='';
  if(htfBias&&htfBias!=='NEUTRAL'){
    const agrees=(bear&&htfBias==='BEARISH')||((!bear)&&htfBias==='BULLISH');
    htfLine='\n'+(agrees?'\uD83D\uDD25 HTF Aligned: Weekly '+htfBias+' \u2014 HIGH PROBABILITY':'\u26A0\uFE0F Counter-trend: Weekly '+htfBias);
  }
  let msg='\uD83D\uDD04 QMR SIGNAL \u2014 \uD83D\uDC8E AT LEVEL\n'+'='.repeat(28)+'\n'+
    '\uD83D\uDCCA '+id+' \u00B7 '+tf+' \u00B7 '+zone+'\n'+(bear?'\uD83D\uDD34 BEARISH QM':'\uD83D\uDFE2 BULLISH QM')+htfLine+'\n\n'+
    '\uD83D\uDCCD Entry: '+entry.toFixed(p)+' (QM Level)\n'+
    '\uD83D\uDEAB SL:    '+sl.toFixed(p)+' ('+slLabel+')\n'+
    '\uD83C\uDFAF '+dolLabel+': '+tp1.toFixed(p)+' (1:'+rr1+'R)\n'+
    '\uD83C\uDFAF Next Structure: '+tp2.toFixed(p)+' (1:'+rr2+'R)\n\n'+
    '\uD83C\uDFD4\uFE0F Head: '+qmr.head.toFixed(p)+'\n\n'+
    '\uD83D\uDD25 Criteria: '+qmr.criteria.score+'/4\n'+qmr.criteria.factors.map(f=>'\u2705 '+f).join('\n')+'\n\n';
  if(sessWarn)msg+='\u23F0 Outside prime session hours for this pair\n\n';
  msg+='\u26A1 Price at QM level. Look for confirmation candle before entering.\n\u2014 The Slayers Model by Rexroz';
  await tgSend(msg);
}
async function tgQMRUpdate(trade,level){
  const isB=trade.type==='BULLISH',p=trade.dec;
  const icons={be:'\u26A1 MOVE TO BREAKEVEN',tp1:'\u2705 TP1 HIT!',tp2:'\uD83D\uDCB0 FULL TARGET HIT!',sl:'\uD83D\uDEAB STOP LOSS HIT'};
  const msgs={
    be:'Trade moved 1:1 in your favour.\nMove SL to entry: '+trade.qmLevel.toFixed(p)+'\nTrade is now risk-free.',
    tp1:'\uD83C\uDFAF Draw on Liquidity: '+trade.tp1.toFixed(p)+' reached.\nConsider partial close. Trail SL to entry.',
    tp2:'\uD83C\uDFAF Next Structure: '+trade.tp2.toFixed(p)+' reached.\nClose trade \u2014 full profit taken!',
    sl:'SL: '+trade.sl.toFixed(p)+' triggered.\nTrade closed. Stay disciplined, next setup coming.',
  };
  await tgSend(icons[level]+'\n'+'='.repeat(28)+'\n\uD83D\uDCCA '+trade.instName+' \u00B7 '+trade.tf+' | '+(isB?'BUY':'SELL')+' QMR\n\n'+msgs[level]+'\n\n\u2014 The Slayers Model by Rexroz');
}
async function tgDailyBriefing(scanData){
  const now=new Date(),days=['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  const months=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const dateStr=days[now.getUTCDay()]+' '+now.getUTCDate()+' '+months[now.getUTCMonth()]+' '+now.getUTCFullYear();
  let msg='\uD83C\uDF05 SLAYERS DAILY BRIEFING\n'+dateStr+' | 07:00 UTC\n'+'='.repeat(28)+'\n\n';
  for(const inst of CRT_INSTS){
    const d=scanData[inst.id];if(!d)continue;
    const bias=weeklyCache[inst.id]?.bias||'NEUTRAL';
    const bI=bias==='BULLISH'?'\uD83D\uDFE2':bias==='BEARISH'?'\uD83D\uDD34':'\uD83D\uDFE1';
    msg+='\uD83D\uDCCA '+inst.name+' \u2014 '+d.price+'\n'+bI+' '+bias+'\n\n';
  }
  msg+='\uD83D\uDCC5 London: 07:00\u201316:00 UTC | New York: 13:00\u201322:00 UTC\n\n\u26A0\uFE0F Wait for confirmation before entering.\n\u2014 The Slayers Model by Rexroz';
  await tgSend(msg);
  dailyAlertLog=[];
}
// Daily motivational messages — alternate motivation and education
async function tgMorningMessage(){
  const day=Math.floor(Date.now()/86400000);
  const pool=day%2===0?MORNING_MOTIVATION:MORNING_EDUCATION;
  const icon=day%2===0?'\uD83D\uDD25 MINDSET':'\uD83D\uDCDA LEARN';
  await tgSend(icon+' | GOOD MORNING\n'+'='.repeat(28)+'\n\n'+getDailyMsg(pool)+'\n\n\u2014 The Slayers Model by Rexroz');
}
async function tgEveningMessage(){
  const day=Math.floor(Date.now()/86400000);
  const pool=day%2===0?EVENING_MOTIVATION:EVENING_EDUCATION;
  const icon=day%2===0?'\uD83C\uDF19 CLOSE OUT':'\uD83D\uDCD6 REVIEW';
  await tgSend(icon+' | END OF DAY\n'+'='.repeat(28)+'\n\n'+getDailyMsg(pool)+'\n\n\u2014 The Slayers Model by Rexroz');
}
async function tgEODSummary(){
  if(!dailyAlertLog.length)return;
  const now=new Date(),days=['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  let msg='\uD83D\uDCCA SLAYERS END OF DAY\n'+days[now.getUTCDay()]+' '+now.getUTCDate()+' | 22:00 UTC\n'+'='.repeat(28)+'\n\nSignals today: '+dailyAlertLog.length+'\n';
  dailyAlertLog.filter(a=>a.type==='CRT').forEach(a=>msg+=(a.dir==='BULLISH'?'\uD83D\uDFE2':'\uD83D\uDD34')+' '+a.id+' CRT \u2014 '+a.score+'/10\n');
  dailyAlertLog.filter(a=>a.type==='QMR').forEach(a=>msg+=(a.dir==='BULLISH'?'\uD83D\uDFE2':'\uD83D\uDD34')+' '+a.id+' '+a.tf+' QMR \u2014 '+a.score+'/4\n');
  msg+='\n\uD83D\uDD14 Review your charts. Manage open positions.\n\u2014 The Slayers Model by Rexroz';
  await tgSend(msg);
}
async function tgWeeklySummary(){
  const total=tradeHistory.length;
  if(!total){await tgSend('\uD83D\uDCCA WEEKLY SUMMARY\nNo completed trades this week.\n\u2014 The Slayers Model by Rexroz');return;}
  const tp=tradeHistory.filter(t=>t.outcome==='TP1'||t.outcome==='TP2').length;
  const sl=tradeHistory.filter(t=>t.outcome==='SL').length;
  const wr=Math.round((tp/total)*100);
  const bar='\u2588'.repeat(Math.round(wr/10))+'\u2591'.repeat(10-Math.round(wr/10));
  const now=new Date(),months=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  let msg='\uD83D\uDCCA SLAYERS WEEKLY PERFORMANCE\nWeek ending '+now.getUTCDate()+' '+months[now.getUTCMonth()]+'\n'+'='.repeat(28)+'\n\n';
  msg+='\uD83D\uDD25 Total: '+total+' | \u2705 TP: '+tp+' | \uD83D\uDEAB SL: '+sl+'\n\nWin Rate: '+bar+' '+wr+'%\n\n';
  msg+=(wr>=60?'\uD83D\uDD25 Excellent week. System performing strongly.':wr>=45?'\uD83D\uDFE1 Solid week. Stay disciplined.':'\u26A0\uFE0F Tough week. Trust the process.')+'\n\n\u2014 The Slayers Model by Rexroz';
  await tgSend(msg);
  tradeHistory=[];
}

// ═══ TRADE MANAGEMENT ════════════════════════════════════════════
async function checkQMRTrades(instId,price,cHigh,cLow){
  const hi=cHigh||price,lo=cLow||price;
  for(let i=activeQMRTrades.length-1;i>=0;i--){
    const t=activeQMRTrades[i];if(t.instId!==instId)continue;
    const isB=t.type==='BULLISH';
    if(!t.slFired&&(isB?lo<=t.sl:hi>=t.sl)){
      t.slFired=true;await tgQMRUpdate(t,'sl');
      tradeHistory.push({instId:t.instId,type:t.type,tf:t.tf,outcome:'SL',time:new Date().toISOString()});
      activeQMRTrades.splice(i,1);continue;
    }
    if(!t.beFired&&(isB?price>=t.beLevel:price<=t.beLevel)){t.beFired=true;await tgQMRUpdate(t,'be');}
    if(!t.tp1Fired&&(isB?hi>=t.tp1:lo<=t.tp1)){
      t.tp1Fired=true;await tgQMRUpdate(t,'tp1');
      tradeHistory.push({instId:t.instId,type:t.type,tf:t.tf,outcome:'TP1',time:new Date().toISOString()});
    }
    if(!t.tp2Fired&&(isB?hi>=t.tp2:lo<=t.tp2)){
      t.tp2Fired=true;await tgQMRUpdate(t,'tp2');
      const r=tradeHistory.findLast(x=>x.instId===t.instId&&x.outcome==='TP1');
      if(r)r.outcome='TP2';else tradeHistory.push({instId:t.instId,type:t.type,tf:t.tf,outcome:'TP2',time:new Date().toISOString()});
      activeQMRTrades.splice(i,1);
    }
  }
}

// ═══ MAIN SCAN ═══════════════════════════════════════════════════
async function runScan(manual=false){
  if(!API_KEY)return;
  const sess=getSess(),doW=manual||scanCount%WEEKLY_EVERY===0;
  log(`Scan #${scanCount} | Session: ${sess} | Weekend: ${isWeekend()}`);
  const briefingData={};
  if(Date.now()-lastNewsFetch>6*60*60*1000)await fetchNewsEvents();
  const now=new Date(),h=now.getUTCHours(),m=now.getUTCMinutes();
  const today=now.toUTCString().slice(0,16),dow=now.getUTCDay();
  if(!isWeekend()&&h===7&&m<30&&lastBriefing!==today){
    lastBriefing=today;await tgDailyBriefing(briefingData);await tgMorningMessage();
  }
  if(!isWeekend()&&h===22&&m<30&&lastEOD!==today){
    lastEOD=today;await tgEODSummary();await tgEveningMessage();
  }
  const thisWeek=now.toISOString().slice(0,10);
  if(dow===0&&h===20&&m<30&&lastWeeklySummary!==thisWeek){lastWeeklySummary=thisWeek;await tgWeeklySummary();}

  // CRT
  for(const inst of CRT_INSTS){
    if(doW){
      try{
        const wr=await fetch(`https://api.twelvedata.com/time_series?symbol=${encodeURIComponent(inst.sym)}&interval=1week&outputsize=20&apikey=${API_KEY}`);
        const wj=await wr.json();
        if(wj.status!=='error'){const wc=parseC(wj);weeklyCache[inst.id]={bias:getWBias(wc),lvls:getWLvls(wc)};}
        await sleep(DELAY_MS);
      }catch(e){log('Weekly '+inst.id+': '+e.message);}
    }
    const wc=weeklyCache[inst.id]||{bias:'NEUTRAL',lvls:null};
    try{
      const res=await fetch(`https://api.twelvedata.com/time_series?symbol=${encodeURIComponent(inst.sym)}&interval=1day&outputsize=100&apikey=${API_KEY}`);
      const json=await res.json();if(json.status==='error'){await sleep(DELAY_MS);continue;}
      const c=parseC(json);if(c.length<10){await sleep(DELAY_MS);continue;}
      briefingData[inst.id]={price:fmtN(c[c.length-1].close,inst.dec)};
      const sdZ=detectSD(c),obs=detectOB(c),fvgs=detectFVG(c),brk=detectBRK(c,sdZ);
      const fib=detectFib(c),struct=detectStructure(c),prevDay=getPD(c),prevWeek=wc.lvls;
      const crt=detectCRT(c);
      if(crt&&!(isWeekend()&&inst.id!=='BTCUSD')){
        const sc=calcCRTScore(crt,sdZ,obs,fvgs,brk,wc.bias,sess,prevDay,prevWeek,fib,struct,detectLiquidity(c,crt.sweep,crt.type));
        if(sc.score>=CRT_MIN){
          const key=inst.id+'-DAILY-CRT-'+crt.dt;
          if(!crtSeen.has(key)){
            crtSeen.add(key);
            const newsWarn=isNewsBlocked(inst.id);
            log(`CRT: ${inst.id} ${crt.type} ${sc.score}/10${newsWarn?' [NEWS]':''}`);
            await tgCRT(inst.id,crt,sc,wc.bias,sess,newsWarn);
            recentCRTAlerts=recentCRTAlerts.filter(a=>Date.now()-a.ts<4*60*60*1000);
            recentCRTAlerts.push({id:inst.id,price:crt.price,type:crt.type,score:sc.score,ts:Date.now()});
            alertLog.unshift({type:'CRT',id:inst.id,tf:'DAILY',dir:crt.type,score:sc.score,time:new Date().toISOString()});
            dailyAlertLog.push({type:'CRT',id:inst.id,tf:'DAILY',dir:crt.type,score:sc.score,time:new Date().toISOString()});
            if(alertLog.length>20)alertLog.pop();
          }
        }
      }
      await sleep(DELAY_MS);
    }catch(e){log('CRT '+inst.id+': '+e.message);await sleep(DELAY_MS);}
  }

  // QMR
  if(manual||scanCount%2===0){
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
            const sl_q=qmr.retestSL!=null?qmr.retestSL:(qmr.type==='BULLISH'?qmr.head-qmr.atr*0.1:qmr.head+qmr.atr*0.1);
            const slD_q=Math.abs(qmr.qmLevel-sl_q);
            const tp1_q=qmr.drawOnLiquidity?qmr.drawOnLiquidity.price:(qmr.type==='BULLISH'?qmr.qmLevel+slD_q*3:qmr.qmLevel-slD_q*3);
            qmr.structuralTP2=slD_q>0?findStructuralTP2(c,qmr.type,qmr.qmLevel,slD_q,tp1_q):null;
            if(isWeekend()&&inst.id!=='BTCUSD')continue;
            if(isLevelAlreadySeen(inst.id,qmr.type,qmr.qmLevel))continue;
            if(isNewsBlocked(inst.id)){log(`QMR BLOCKED (news): ${inst.id} ${tf}`);continue;}
            const key=inst.id+'-'+qmr.type+'-'+qmr.qmLevel.toFixed(3);
            if(!qmrSeen.has(key)){
              qmrSeen.add(key);
              const sessWarn=!isPairInSession(inst.id);
              const htfBias=weeklyCache[inst.id]?.bias||'NEUTRAL';
              log(`QMR: ${inst.id} ${tf.toUpperCase()} ${qmr.type} ${qmr.qmLevel} HTF:${htfBias}`);
              await tgQMR(inst.id,tf==='1h'?'1H':'4H',qmr,htfBias,sessWarn);
              const crtMatch=recentCRTAlerts.find(a=>a.id===inst.id&&a.type===qmr.type&&Math.abs(a.price-qmr.qmLevel)/qmr.qmLevel<PROX*5);
              if(crtMatch)await tgSend('\uD83D\uDD25\uD83D\uDD04 CRT+QMR CONFLUENCE: '+inst.id+' \u2014 EXTREMELY HIGH PROBABILITY\n\u2705 Daily CRT: '+crtMatch.score+'/10\n\u2705 '+tf.toUpperCase()+' QMR: '+qmr.criteria.score+'/4\n\u2014 The Slayers Model by Rexroz');
              const isB2=qmr.type==='BULLISH';
              const entry2=qmr.qmLevel,sl2=sl_q,slDist2=slD_q;
              const tp1_2=tp1_q;
              const tp2_2=qmr.structuralTP2?qmr.structuralTP2.price:(isB2?entry2+slDist2*2.5:entry2-slDist2*2.5);
              const instObj=QMR_INSTS.find(x=>x.id===inst.id)||{dec:5,name:inst.id};
              activeQMRTrades.push({
                instId:inst.id,instName:instObj.name,tf:tf.toUpperCase(),type:qmr.type,
                qmLevel:entry2,sl:sl2,tp1:tp1_2,tp2:tp2_2,
                beLevel:isB2?entry2+slDist2:entry2-slDist2,dec:instObj.dec,
                beFired:false,tp1Fired:false,tp2Fired:false,slFired:false,
              });
              alertLog.unshift({type:'QMR',id:inst.id,tf:tf.toUpperCase(),dir:qmr.type,score:qmr.criteria.score,time:new Date().toISOString()});
              dailyAlertLog.push({type:'QMR',id:inst.id,tf:tf.toUpperCase(),dir:qmr.type,score:qmr.criteria.score,time:new Date().toISOString()});
              if(alertLog.length>20)alertLog.pop();
            }
          }
          await sleep(DELAY_MS);
        }catch(e){log('QMR '+inst.id+' '+tf+': '+e.message);await sleep(DELAY_MS);}
      }
    }
  }
  scanCount++;lastScanTime=new Date().toISOString();
  log(`Scan complete #${scanCount}`);
}

// ═══ DASHBOARD ═══════════════════════════════════════════════════
app.get('/',(req,res)=>{
  const up=process.uptime(),hrs=Math.floor(up/3600),mins=Math.floor((up%3600)/60);
  const wr=tradeHistory.length?Math.round((tradeHistory.filter(t=>t.outcome!=='SL').length/tradeHistory.length)*100):0;
  const alerts=alertLog.slice(0,10).map(a=>`<tr><td>${a.time.slice(11,19)}</td><td>${a.type}</td><td>${a.id}</td><td>${a.tf}</td><td style="color:${a.dir==='BULLISH'?'#4ade80':'#f87171'}">${a.dir}</td><td>${a.score}</td></tr>`).join('');
  const trades=activeQMRTrades.map(t=>`<tr><td>${t.instName}</td><td>${t.tf}</td><td style="color:${t.type==='BULLISH'?'#4ade80':'#f87171'}">${t.type}</td><td>${t.qmLevel.toFixed(t.dec)}</td><td>${t.sl.toFixed(t.dec)}</td><td>${t.beFired?'BE&#10003; ':''}${t.tp1Fired?'TP1&#10003; ':''}${t.tp2Fired?'TP2&#10003;':''}</td></tr>`).join('');
  const news=newsCache.slice(0,8).map(e=>`<tr><td>${e.country}</td><td>${e.title}</td><td style="color:#f87171">High</td><td>${new Date(e.date).toUTCString().slice(17,22)} UTC</td></tr>`).join('');
  res.send(`<!DOCTYPE html><html><head><title>Slayers v6.1</title><meta charset="UTF-8"><style>body{background:#080c10;color:#c8d8e8;font-family:monospace;padding:20px}h1{color:#26A69A}h2{color:#c084fc;font-size:13px;margin-top:20px}table{border-collapse:collapse;width:100%;margin-top:6px}td,th{border:1px solid #1e2530;padding:6px 10px;font-size:12px}th{color:#26A69A;background:#0c1218}.dim{color:#4a6a7a}.live{color:#4ade80}.gold{color:#F5A623}</style></head><body>
<h1>SLAYERS ALERT SYSTEM v6.1</h1>
<p>Status: <span class="live">LIVE</span> | Uptime: ${hrs}h ${mins}m | Scans: ${scanCount} | Last: ${lastScanTime||'&mdash;'}</p>
<p class="dim">Session: ${getSess()} | Weekend: ${isWeekend()?'Yes':'No'} | CRT: 8 pairs | QMR: 9 pairs</p>
<p class="gold">Win Rate: ${wr}% | Completed: ${tradeHistory.length} | News events: ${newsCache.length}</p>
<h2>RECENT ALERTS</h2>
<table><tr><th>Time</th><th>System</th><th>Pair</th><th>TF</th><th>Direction</th><th>Score</th></tr>${alerts||'<tr><td colspan="6" class="dim">No alerts yet</td></tr>'}</table>
<h2>ACTIVE QMR TRADES</h2>
<table><tr><th>Pair</th><th>TF</th><th>Type</th><th>Entry</th><th>SL</th><th>Progress</th></tr>${trades||'<tr><td colspan="6" class="dim">No active trades</td></tr>'}</table>
<h2>HIGH IMPACT NEWS THIS WEEK</h2>
<table><tr><th>Currency</th><th>Event</th><th>Impact</th><th>Time</th></tr>${news||'<tr><td colspan="4" class="dim">Loading...</td></tr>'}</table>
<p class="dim" style="margin-top:20px">The Slayers Model by Rex Roz | v6.1</p>
</body></html>`);
});

app.listen(PORT,()=>log(`Port ${PORT}`));
log('Slayers Alert System v6.1 starting...');
runScan(true).then(()=>{
  setInterval(()=>runScan(false),CHECK_MS);
  log(`Scanning every ${CHECK_MS/60000} minutes`);
});
