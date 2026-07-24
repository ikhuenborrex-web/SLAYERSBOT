'use strict';
process.on('unhandledRejection',function(err){console.error('Unhandled Rejection:',err.message);});
process.on('uncaughtException',function(err){console.error('Uncaught Exception:',err.message);});
const express = require('express');
const fs = require('fs');
const path = require('path');
let webpush=null;
try{webpush=require('web-push');}catch(e){console.log('web-push not installed yet — push notifications disabled until package.json is updated');}
const VAPID_PUBLIC=process.env.VAPID_PUBLIC_KEY||'';
const VAPID_PRIVATE=process.env.VAPID_PRIVATE_KEY||'';
const ADMIN_PASSWORD=process.env.ADMIN_PASSWORD||'';
let BREAKOUT_ATR=0.3; // min ATR multiplier for first breakout candle close beyond QM level
function genCode(){
  const chars='ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no 0/O/1/I to avoid confusion
  let c='SLAY-';
  for(let i=0;i<6;i++)c+=chars[Math.floor(Math.random()*chars.length)];
  return c;
}
function checkAdmin(req){
  return ADMIN_PASSWORD && req.headers['x-admin-password']===ADMIN_PASSWORD;
}
function checkMemberCode(req){
  const code=req.query.code||req.headers['x-access-code'];
  const deviceId=req.query.device||req.headers['x-device-id']||'';
  if(!code)return 'invalid';
  const member=memberCodes.find(m=>m.code===code);
  if(!member)return 'invalid';
  if(!member.boundDevice){
    // First time this code is ever used — claim it for this device
    member.boundDevice=deviceId||'unknown';
    member.boundAt=new Date().toISOString();
    saveState();
    return 'ok';
  }
  if(member.boundDevice===deviceId)return 'ok';
  return 'device_mismatch';
}
if(webpush&&VAPID_PUBLIC&&VAPID_PRIVATE){
  webpush.setVapidDetails('mailto:rexroz@theslayersmodel.com',VAPID_PUBLIC,VAPID_PRIVATE);
}
const app = express();
const PORT = process.env.PORT || 3000;

const API_KEY  = process.env.TWELVEDATA_API_KEY  || '';
const TG_TOKEN = process.env.TELEGRAM_TOKEN      || '';
const TG_CHAT  = process.env.TELEGRAM_CHAT_ID    || '';
const CHARTIMG_KEY = process.env.CHARTIMG_API_KEY || '';
if(!API_KEY||!TG_TOKEN||!TG_CHAT)console.warn('Missing env vars.');

// Daily data fetch for BTC and Gold (keeps dailyCache populated)
const CRT_INSTS = [
  {id:'BTCUSD',sym:'BTC/USD',name:'BTC/USD',dec:2},
  {id:'XAUUSD',sym:'XAU/USD',name:'XAU/USD',dec:2},
];
// QMR pairs (forex + XAU + BTC)
const QMR_INSTS = [
  {id:'EURUSD',sym:'EUR/USD',name:'EUR/USD',dec:5},
  {id:'GBPUSD',sym:'GBP/USD',name:'GBP/USD',dec:5},
  {id:'AUDUSD',sym:'AUD/USD',name:'AUD/USD',dec:5},
  {id:'GBPJPY',sym:'GBP/JPY',name:'GBP/JPY',dec:3},
  {id:'XAUUSD',sym:'XAU/USD',name:'XAU/USD',dec:2},
  {id:'BTCUSD',sym:'BTC/USD',name:'BTC/USD',dec:2},
  {id:'EURGBP',sym:'EUR/GBP',name:'EUR/GBP',dec:5},
  {id:'EURCAD',sym:'EUR/CAD',name:'EUR/CAD',dec:5},
  {id:'USDJPY',sym:'USD/JPY',name:'USD/JPY',dec:3},
  {id:'USDCAD',sym:'USD/CAD',name:'USD/CAD',dec:5},
  {id:'NZDUSD',sym:'NZD/USD',name:'NZD/USD',dec:5},
];
const QMR_TFS=['1h','4h'];
const SCALP_INSTS=[
  {id:'EURUSD',sym:'EUR/USD',name:'EUR/USD',dec:5},
  {id:'GBPUSD',sym:'GBP/USD',name:'GBP/USD',dec:5},
  {id:'USDJPY',sym:'USD/JPY',name:'USD/JPY',dec:3},
  {id:'NAS100',sym:'NASDAQ100',name:'NAS100',dec:2},
];
const CHECK_MS=30*60*1000,DELAY_MS=12000,PROX=0.007,IMPULSE=0.0015,MIN_FVG=0.0003;
const QMR_MIN=3,WEEKLY_EVERY=24,LON_S=7,LON_E=16,NY_S=13,NY_E=22;

// Correlation groups — pairs that move together; opposite-direction signals on correlated pairs flag a warning
const CORRELATION_GROUPS=[
  ['EURUSD','GBPUSD','EURGBP'],
  ['AUDUSD','NZDUSD'],
  ['GBPJPY','USDJPY'],
  ['EURUSD','EURCAD','EURGBP'],
  ['USDCAD','NZDUSD'],
  ['USDJPY','USDCAD'],
];
const PAIR_SESSIONS={
  EURUSD:{s:7,e:22},GBPUSD:{s:7,e:22},AUDUSD:{s:0,e:16},
  GBPJPY:{s:0,e:22},XAUUSD:{s:7,e:22},BTCUSD:{s:0,e:24},
  EURGBP:{s:7,e:16},EURCAD:{s:7,e:22},USDJPY:{s:0,e:22},
  USDCAD:{s:7,e:22},NZDUSD:{s:0,e:16},
};
const PAIR_CURRENCIES={
  EURUSD:['EUR','USD'],GBPUSD:['GBP','USD'],AUDUSD:['AUD','USD'],
  GBPJPY:['GBP','JPY'],XAUUSD:['XAU','USD'],BTCUSD:['BTC'],
  EURGBP:['EUR','GBP'],EURCAD:['EUR','CAD'],USDJPY:['USD','JPY'],
  USDCAD:['USD','CAD'],NZDUSD:['NZD','USD'],
};
// Per-pair killzones (UTC hours) for 1H QMR signals. null = no restriction (24/7)
// Asian-active pairs include Tokyo killzone 0-4; EU/US pairs are London + NY open only
const PAIR_KILLZONES={
  EURUSD:[[7,10],[13,16]],GBPUSD:[[7,10],[13,16]],EURGBP:[[7,10],[13,16]],EURCAD:[[7,10],[13,16]],XAUUSD:[[7,10],[13,16]],
  AUDUSD:[[0,4],[7,10],[13,16]],USDJPY:[[0,4],[7,10],[13,16]],USDCAD:[[7,10],[13,16]],NZDUSD:[[0,4],[7,10],[13,16]],GBPJPY:[[0,4],[7,10],[13,16]],
  BTCUSD:null,
};
function inKillzone(id){const kz=PAIR_KILLZONES[id];if(!kz)return true;const h=new Date().getUTCHours();return kz.some(w=>h>=w[0]&&h<w[1]);}
// Daily candle cache (refreshed by briefing + daily fetch) for HTF POI and daily structure checks
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
let weeklyCache={},prevWeeklyCache={},qmrSeen=new Set();
let scalpSignals=[],scalpSeen=new Set();
let activeScalpTrades=[],scalpTradeHistory=[];
let activeQMRTrades=[],lastBriefing=null,lastEOD=null,lastWeeklySummary=null,lastMonthlyRecap=null;
let earlyEntryCache={}; // {pair+type+level: {entryPrice,sl,tp1,tp2,wickRatio}}
let pairPerformance={}; // {instId:{wins,losses}} — accumulates across all weeks, never cleared
let scanCount=0,lastScanTime=null,alertLog=[];
let tradeHistory=[],dailyAlertLog=[],dailyOutcomeLog=[],newsCache=[],lastNewsFetch=0;
let winStreak=0,lossStreak=0,qmr4HCache={},recentQMRFires={};
let suppressedPairs=new Set(); // pairs auto-suppressed due to poor win rate
const STATE_FILE=process.env.STATE_FILE_PATH||'/tmp/slayers_state.json';
let redis=null;
try{
  if(process.env.UPSTASH_REDIS_REST_URL&&process.env.UPSTASH_REDIS_REST_TOKEN){
    const {Redis}=require('@upstash/redis');
    redis=new Redis({url:process.env.UPSTASH_REDIS_REST_URL,token:process.env.UPSTASH_REDIS_REST_TOKEN});
    console.log('Redis persistence enabled — state now survives every deploy.');
  }else{
    console.log('WARNING: Redis not configured (UPSTASH_REDIS_REST_URL/TOKEN missing). Falling back to file storage at '+STATE_FILE);
    console.log('TIP: Set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN for cross-deploy persistence,');
    console.log('      or mount a Render Disk and set STATE_FILE_PATH to a path on that disk.');
  }
}catch(e){
  console.log('WARNING: Redis client failed to initialize ('+e.message+'). Falling back to file storage at '+STATE_FILE);
  redis=null;
}
const CHARTS_DIR='/tmp/slayers_charts';
if(!fs.existsSync(CHARTS_DIR))fs.mkdirSync(CHARTS_DIR,{recursive:true});
let appSignalFeed=[];
let pushSubscriptions=[];
let memberCodes=[]; // [{code,name,addedAt}]
let memberStats={}; // {memberCode:{total,wins,losses,bes,totalR}}
let trackedTrades={}; // { signalId: [code, code, ...] }
let chartCounter=0;
let lastBriefingSnapshot=[];
let lastBriefingTime=null;
let weeklySummaryData=null;
let saveTimer=null;
function saveState(){
  // debounce: collapse rapid calls into one write
  if(saveTimer)clearTimeout(saveTimer);
  saveTimer=setTimeout(async()=>{
    const state={
      activeQMRTrades,tradeHistory,winStreak,lossStreak,
      weeklyCache,prevWeeklyCache,recentQMRFires,qmr4HCache,suppressedPairs:[...suppressedPairs],
      lastBriefing,lastEOD,lastWeeklySummary,lastMonthlyRecap,pairPerformance,
      dailyAlertLog,dailyOutcomeLog,
      qmrSeen:[...qmrSeen],scalpSeen:[...scalpSeen],earlyEntryCache,appSignalFeed,lastBriefingSnapshot,lastBriefingTime,      pushSubscriptions,memberCodes,trackedTrades,memberStats,weeklySummaryData,scalpSignals,activeScalpTrades,scalpTradeHistory,
      savedAt:Date.now()
    };
    const json=JSON.stringify(state);
    // Always write to file
    try{
      const dir=STATE_FILE.substring(0,STATE_FILE.lastIndexOf('/'));
      if(dir&&!fs.existsSync(dir))fs.mkdirSync(dir,{recursive:true});
      fs.writeFileSync(STATE_FILE,json);
    }catch(e){log('saveState file error: '+e.message);}
    // Also try Redis if available
    if(redis){
      try{
        await redis.set('slayers:state',json);
      }catch(e){
        log('Redis save failed ('+e.message+') — file save already completed.');
      }
    }
  },1500);
}
function refine1HEntry(c,qmrType,zoneLevel,zoneSL){
  // Same concept as refine4HEntry, but works on the 1H candles already fetched for this scan — no extra API call
  try{
    if(!c||c.length<25)return null;
    const isBull=qmrType==='BULLISH';
    const hi=Math.max(zoneLevel,zoneSL),lo=Math.min(zoneLevel,zoneSL);
    const inZone=p=>p<=hi&&p>=lo;
    const obs=detectOB(c);
    const obList=isBull?obs.bull:obs.bear;
    for(const ob of obList){const mid=(ob.top+ob.bottom)/2;if(inZone(mid))return{price:mid,source:'1H Order Block'};}
    const fvgs=detectFVG(c);
    const fvgList=isBull?fvgs.bull:fvgs.bear;
    for(const f of fvgList){const mid=(f.top+f.bottom)/2;if(inZone(mid))return{price:mid,source:'1H FVG'};}
    return null;
  }catch(e){return null;}
}
async function refine4HEntry(inst,qmrType,zoneLevel,zoneSL){
  // Returns {price,source} for a refined 1H entry inside the 4H zone, or null
  try{
    const res=await fetch('https://api.twelvedata.com/time_series?symbol='+encodeURIComponent(inst.sym)+'&interval=1h&outputsize=100&apikey='+API_KEY);
    const json=await res.json();
    if(json.status==='error')return null;
    const c=parseC(json);
    if(c.length<25)return null;
    const isBull=qmrType==='BULLISH';
    // zone spans from the QM level toward the SL; refined entry must sit inside it
    const hi=Math.max(zoneLevel,zoneSL),lo=Math.min(zoneLevel,zoneSL);
    const inZone=p=>p<=hi&&p>=lo;
    // 1) 1H order block inside the zone, matching direction
    const obs=detectOB(c);
    const obList=isBull?obs.bull:obs.bear;
    for(const ob of obList){const mid=(ob.top+ob.bottom)/2;if(inZone(mid))return{price:mid,source:'1H Order Block'};}
    // 2) 1H FVG inside the zone
    const fvgs=detectFVG(c);
    const fvgList=isBull?fvgs.bull:fvgs.bear;
    for(const f of fvgList){const mid=(f.top+f.bottom)/2;if(inZone(mid))return{price:mid,source:'1H FVG'};}
    // 3) 1H structure already shifting in signal direction -> use most recent swing inside zone
    const st=detectStructure(c).trend;
    if((isBull&&st==='BULLISH')||(!isBull&&st==='BEARISH')){
      const recent=c.slice(-6);
      const pivot=isBull?Math.min(...recent.map(x=>x.low)):Math.max(...recent.map(x=>x.high));
      if(inZone(pivot))return{price:pivot,source:'1H Structure Shift'};
    }
    return null;
  }catch(e){log('refine4H '+inst.id+': '+e.message);return null;}
}
function computeR(t,exitPrice){
  const risk=t.origSL!==undefined?Math.abs(t.qmLevel-t.origSL):Math.abs(t.qmLevel-t.sl);
  if(!risk||!isFinite(risk))return 0;
  const dir=t.type==='BULLISH'?1:-1;
  const r=((exitPrice-t.qmLevel)*dir)/risk;
  return Math.round(r*100)/100;
}
async function loadState(){
  try{
    let raw=null,src='none';
    if(redis){
      try{
        const fromRedis=await redis.get('slayers:state');
        if(fromRedis){raw=typeof fromRedis==='string'?fromRedis:JSON.stringify(fromRedis);src='Redis';}
      }catch(e){log('Redis load failed ('+e.message+'), trying file fallback.');}
    }
    if(!raw&&fs.existsSync(STATE_FILE)){raw=fs.readFileSync(STATE_FILE,'utf8');src=STATE_FILE;}
    if(!raw){log('No saved state — starting fresh');return;}
    const st=JSON.parse(raw);
    if(Array.isArray(st.activeQMRTrades))activeQMRTrades=st.activeQMRTrades;
    if(Array.isArray(st.tradeHistory))tradeHistory=st.tradeHistory;
    if(typeof st.winStreak==='number')winStreak=st.winStreak;
    if(typeof st.lossStreak==='number')lossStreak=st.lossStreak;
    if(st.weeklyCache)weeklyCache=st.weeklyCache;
    if(st.prevWeeklyCache)prevWeeklyCache=st.prevWeeklyCache;
    if(st.recentQMRFires)recentQMRFires=st.recentQMRFires;
    if(st.qmr4HCache)qmr4HCache=st.qmr4HCache;
    if(st.lastBriefing!==undefined)lastBriefing=st.lastBriefing;
    if(st.lastEOD!==undefined)lastEOD=st.lastEOD;
    if(st.lastWeeklySummary!==undefined)lastWeeklySummary=st.lastWeeklySummary;
    if(st.pairPerformance&&typeof st.pairPerformance==='object')pairPerformance=st.pairPerformance;
    if(st.lastMonthlyRecap!==undefined)lastMonthlyRecap=st.lastMonthlyRecap;
    if(Array.isArray(st.dailyAlertLog))dailyAlertLog=st.dailyAlertLog;
    if(Array.isArray(st.dailyOutcomeLog))dailyOutcomeLog=st.dailyOutcomeLog;
    if(Array.isArray(st.qmrSeen))qmrSeen=new Set(st.qmrSeen);
    if(st.earlyEntryCache&&typeof st.earlyEntryCache==='object')earlyEntryCache=st.earlyEntryCache;
    if(st.suppressedPairs&&typeof st.suppressedPairs==='object')suppressedPairs=new Set(st.suppressedPairs);
    if(Array.isArray(st.appSignalFeed))appSignalFeed=st.appSignalFeed;
    if(Array.isArray(st.lastBriefingSnapshot))lastBriefingSnapshot=st.lastBriefingSnapshot;
    if(st.lastBriefingTime)lastBriefingTime=st.lastBriefingTime;
    if(Array.isArray(st.pushSubscriptions))pushSubscriptions=st.pushSubscriptions;
    if(Array.isArray(st.memberCodes))memberCodes=st.memberCodes;
    if(st.trackedTrades&&typeof st.trackedTrades==='object')trackedTrades=st.trackedTrades;
    if(st.memberStats&&typeof st.memberStats==='object')memberStats=st.memberStats;
    if(st.weeklySummaryData)weeklySummaryData=st.weeklySummaryData;
    if(Array.isArray(st.scalpSignals))scalpSignals=st.scalpSignals;
    if(Array.isArray(st.activeScalpTrades))activeScalpTrades=st.activeScalpTrades;
    if(Array.isArray(st.scalpTradeHistory))scalpTradeHistory=st.scalpTradeHistory;
    if(Array.isArray(st.scalpSeen))scalpSeen=new Set(st.scalpSeen);
    const ageMin=st.savedAt?Math.round((Date.now()-st.savedAt)/60000):'?';
    log('State restored from '+src+': '+activeQMRTrades.length+' active trades, '+tradeHistory.length+' history ('+ageMin+'m old)');
    tradeHistory=(tradeHistory||[]).filter(t=>t.instId!=='EURGBP');
    dailyOutcomeLog=(dailyOutcomeLog||[]).filter(t=>t.id!=='EURGBP');
    appSignalFeed=(appSignalFeed||[]).filter(s=>s.pair!=='EURGBP');
    if(tradeHistory.length!==st?.tradeHistory?.length||appSignalFeed.length!==st?.appSignalFeed?.length)saveState();
    if(tradeHistory.length!==st?.tradeHistory?.length)saveState();
  }catch(e){log('loadState error (starting fresh): '+e.message);}
}
let dailyCache={};

const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const fmtN=(n,d)=>n==null?'--':n.toLocaleString('en-US',{minimumFractionDigits:d,maximumFractionDigits:d});
const log=msg=>console.log(`[${new Date().toISOString()}] ${msg}`);

function parseC(json){
  if(!json?.values?.length)return[];
  return json.values.map(v=>({dt:v.datetime,open:parseFloat(v.open),high:parseFloat(v.high),low:parseFloat(v.low),close:parseFloat(v.close),volume:parseFloat(v.volume)||0})).reverse();
}
function getSess(){const h=new Date().getUTCHours(),l=h>=LON_S&&h<LON_E,n=h>=NY_S&&h<NY_E;return l&&n?'London/NY Overlap':l?'London':n?'New York':'CLOSED';}
function isSessionActive(){const h=new Date().getUTCHours();return h>=LON_S&&h<NY_E;}
const MIN_RR=1.5;
function isWeekend(){const d=new Date().getUTCDay(),h=new Date().getUTCHours();return d===6||(d===0&&h<22);}
function isPairInSession(id){const s=PAIR_SESSIONS[id];if(!s)return true;const h=new Date().getUTCHours();if(s.e===24)return true;return h>=s.s&&h<s.e;}

// News
let newsWarnSent=false,newsFirstFail=0;
async function fetchNewsEvents(){
  try{
    const UA={'User-Agent':'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36','Accept':'application/json,text/plain,*/*','Accept-Language':'en-US,en;q=0.9'};
    let data=null,sourceUsed='';
    // Source 1: Investing.com style JSON calendar (primary)
    const sources=[
      {name:'investing',url:'https://economic-calendar.tradingview.com/events?from='+new Date().toISOString().slice(0,10)+'T00:00:00.000Z&to='+new Date(Date.now()+7*864e5).toISOString().slice(0,10)+'T00:00:00.000Z',headers:{'Referer':'https://www.tradingview.com/','Origin':'https://www.tradingview.com'},map:j=>{const arr=(j&&j.result)||[];return arr.filter(e=>e.importance>=1).map(e=>({impact:e.importance===3?'High':e.importance===2?'Medium':'Low',country:(e.currency||e.country||'').toUpperCase(),title:e.title,date:e.date,description:e.description||'',forecast:e.forecast||null,previous:e.previous||null,actual:e.actual||null}));}},
      {name:'forexfactory',url:'https://nfs.faireconomy.media/ff_calendar_thisweek.json',map:j=>Array.isArray(j)?j.map(e=>({impact:e.impact||'Low',country:e.country||'',title:e.title,date:e.date,description:'',forecast:e.forecast||null,previous:e.previous||null,actual:null})):[]}
    ];
    for(const src of sources){
      try{
        var fetchHeaders={};for(var h in UA)fetchHeaders[h]=UA[h];if(src.headers)for(var h in src.headers)fetchHeaders[h]=src.headers[h];
        const r=await fetch(src.url,{headers:fetchHeaders});
        if(!r.ok)continue;
        const t=await r.text();
        if(t.trim().startsWith('<'))continue;
        const j=JSON.parse(t);
        const mapped=src.map(j);
        if(mapped&&mapped.length){data=mapped;sourceUsed=src.name;break;}
        if(mapped){data=mapped;sourceUsed=src.name;}
      }catch(e){/* try next source */}
    }
    if(data===null)throw new Error('all news sources unavailable');
    newsCache=data;
    lastNewsFetch=Date.now();newsFirstFail=0;newsWarnSent=false;
    log('News: '+newsCache.length+' events'+(sourceUsed?' ('+sourceUsed+')':''));
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

// RSS news feed
let newsFeedCache=[];
let lastNewsFeedFetch=0;
async function fetchNewsFeed(){
  try{
    const UA={'User-Agent':'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36','Accept':'text/xml,application/xml,application/xhtml+xml','Accept-Language':'en-US,en;q=0.9'};
    const feeds=[
      {url:'https://feeds.bbci.co.uk/news/business/rss.xml',cat:'Economy',src:'BBC'},
      {url:'https://feeds.bbci.co.uk/news/technology/rss.xml',cat:'Economy',src:'BBC'},
      {url:'https://rss.nytimes.com/services/xml/rss/nyt/Business.xml',cat:'Economy',src:'NYT'},
      {url:'https://feeds.bbci.co.uk/news/world/rss.xml',cat:'Geopolitics',src:'BBC'},
      {url:'https://www.investing.com/rss/news_301.rss',cat:'Forex',src:'Investing'},
    ];
    const parseRSS=function(xml,sourceName){
      const items=[];
      const itemRegex=/<item>([\s\S]*?)<\/item>/gi;
      let m;
      while((m=itemRegex.exec(xml))!==null){
        const block=m[1];
        const title=(block.match(/<title[^>]*><!\[CDATA\[([\s\S]*?)\]\]><\/title>/)||block.match(/<title[^>]*>([\s\S]*?)<\/title>/))?.[1]||'';
        const link=(block.match(/<link[^>]*>([\s\S]*?)<\/link>/)||block.match(/<link[^>]*\/>(?:([\s\S]*?))?/)||[])[1]||'';
        const desc=(block.match(/<description[^>]*><!\[CDATA\[([\s\S]*?)\]\]><\/description>/)||block.match(/<description[^>]*>([\s\S]*?)<\/description>/))?.[1]||'';
        const pubDateStr=(block.match(/<pubDate[^>]*>([\s\S]*?)<\/pubDate>/)||[])[1];
        const pubDate=pubDateStr?new Date(pubDateStr).toISOString():new Date().toISOString();
        const cleanDesc=desc.replace(/<[^>]+>/g,'').slice(0,200);
        var img='';
        var imgMatch=block.match(/<enclosure[^>]*url="([^"]+)"/i)||block.match(/<media:content[^>]*url="([^"]+)"/i)||block.match(/<media:thumbnail[^>]*url="([^"]+)"/i)||[];
        if(imgMatch[1])img=imgMatch[1];
        if(!img){var simpleImg=block.match(/<img[^>]+src="([^"]+)"/i);if(simpleImg)img=simpleImg[1];}
        if(title)items.push({title,link,summary:cleanDesc,source:sourceName,time:pubDate,image:img});
      }
      return items;
    };
    let allItems=[];
    for(const feed of feeds){
      try{
        const r=await fetch(feed.url,{headers:UA});
        if(!r.ok){log('News feed: '+feed.src+' HTTP '+r.status);continue;}
        const xml=await r.text();
        if(xml.trim().startsWith('<')===false){log('News feed: '+feed.src+' returned non-XML');continue;}
        const items=parseRSS(xml,feed.src);
        log('News feed: '+feed.src+' -> '+items.length+' items');
        for(const item of items){item.category=feed.cat;allItems.push(item);}
      }catch(e){log('News feed error ('+feed.src+'): '+e.message);}
    }
    // Categorize forex/geopolitics by keyword matching
    const forexKW=['EUR','USD','GBP','JPY','CHF','AUD','NZD','CAD','forex','currency','dollar','euro','sterling','yen','pair','fx','exchange rate','pound','swiss'];
    const geoKW=['tariff','sanction','war','conflict','military','NATO','diplomat','treaty','geopolitic','election','trade war','China','Russia','Iran','Ukraine','Israel','tariffs'];
    const comKW=['oil','gold','silver','copper','crude','commodity','brent','wti','precious metal','gas','wheat','corn'];
    for(const item of allItems){
      const txt=(item.title+' '+item.summary).toLowerCase();
      if(geoKW.some(k=>txt.includes(k))){if(item.category!=='Geopolitics')item.category='Geopolitics';}
      else if(comKW.some(k=>txt.includes(k)))item.category='Commodities';
      else if(forexKW.some(k=>txt.includes(k)))item.category='Forex';
    }
    allItems.sort((a,b)=>b.time.localeCompare(a.time));
    // Remove duplicates by title
    var seen=new Set();
    newsFeedCache=allItems.filter(function(i){var key=i.title.toLowerCase().slice(0,40);if(seen.has(key))return false;seen.add(key);return true;}).slice(0,50);
    lastNewsFeedFetch=Date.now();
    log('News feed: '+newsFeedCache.length+' total articles');
  }catch(e){
    log('News feed error: '+e.message);
  }
}

// Technical
function calcATR(c,p=14){if(c.length<2)return 0;const trs=c.slice(1).map((x,i)=>Math.max(x.high-x.low,Math.abs(x.high-c[i].close),Math.abs(x.low-c[i].close)));return trs.slice(-p).reduce((a,b)=>a+b,0)/Math.min(p,trs.length);}
function detectSD(c){const s=[],d=[];for(let i=0;i<c.length-2;i++){const b=c[i],n=c[i+1];if(Math.abs(n.close-n.open)/n.open<IMPULSE)continue;if(n.close<n.open)s.push({top:b.high,bottom:Math.min(b.open,b.close)});else d.push({top:Math.max(b.open,b.close),bottom:b.low});}return{supply:s.slice(-6).reverse(),demand:d.slice(-6).reverse()};}
function detectOB(c){const bull=[],bear=[];for(let i=0;i<c.length-2;i++){const b=c[i],n=c[i+1];if(Math.abs(n.close-n.open)/n.open<IMPULSE)continue;if(n.close>n.open&&b.close<b.open)bull.push({top:Math.max(b.open,b.close),bottom:Math.min(b.open,b.close)});else if(n.close<n.open&&b.close>b.open)bear.push({top:Math.max(b.open,b.close),bottom:Math.min(b.open,b.close)});}return{bull:bull.slice(-4).reverse(),bear:bear.slice(-4).reverse()};}
function detectFVG(c){const bull=[],bear=[];for(let i=0;i<c.length-2;i++){const a=c[i],z=c[i+2];if(z.low>a.high&&(z.low-a.high)/a.high>MIN_FVG)bull.push({top:z.low,bottom:a.high});if(z.high<a.low&&(a.low-z.high)/a.low>MIN_FVG)bear.push({top:a.low,bottom:z.high});}return{bull:bull.slice(-5).reverse(),bear:bear.slice(-5).reverse()};}
function detectBRK(c,sdZ){const cp=c[c.length-1].close,bull=[],bear=[],near=(p,z)=>p>=z.bottom*(1-PROX)&&p<=z.top*(1+PROX);for(const z of sdZ.demand)if(c.some(x=>x.close<z.bottom)&&near(cp,z))bear.push(z);for(const z of sdZ.supply)if(c.some(x=>x.close>z.top)&&near(cp,z))bull.push(z);return{bull,bear};}
function detectScalp(c,instId){
  const h=new Date().getUTCHours(),m=new Date().getUTCMinutes();
  let session=null;
  if((h===7&&m>=0)||(h>7&&h<10)||(h===10&&m===0))session='LONDON';
  else if((h===13&&m>=0)||(h>13&&h<16)||(h===16&&m===0))session='NY';
  else return null;
  const ss=session==='LONDON'?7:13;
  let openIdx=-1;
  for(let i=c.length-1;i>=0;i--){
    const dt=c[i].dt;if(!dt)continue;
    const tPart=dt.includes('T')?dt.split('T')[1]:dt.split(' ')[1];
    if(!tPart)continue;
    const parts=tPart.split(':');if(parts.length<2)continue;
    if(parseInt(parts[0])===ss&&parseInt(parts[1])===0){openIdx=i;break;}
  }
  if(openIdx===-1||c.length-1-openIdx<6)return null;
  const rangeC=c.slice(openIdx,openIdx+6);if(rangeC.length<6)return null;
  const rangeHigh=Math.max(...rangeC.map(x=>x.high)),rangeLow=Math.min(...rangeC.map(x=>x.low));
  const lastC=c[c.length-1],prevC=c[c.length-2];
  const brokeBull=prevC.close>rangeHigh||lastC.close>rangeHigh;
  const brokeBear=prevC.close<rangeLow||lastC.close<rangeLow;
  if(!brokeBull&&!brokeBear)return null;
  const dir=brokeBull?'BULLISH':'BEARISH';
  const postC=c.slice(openIdx+6);
  const fvgs=detectFVG(postC);
  const hits=dir==='BULLISH'?fvgs.bull:fvgs.bear;
  if(!hits.length)return null;
  const fvg=hits[0];
  if(dir==='BULLISH'&&lastC.close>fvg.top)return null;
  if(dir==='BEARISH'&&lastC.close<fvg.bottom)return null;
  const rng=rangeHigh-rangeLow;if(!rng)return null;
  const fibs={
    f618:dir==='BULLISH'?rangeHigh-rng*0.618:rangeLow+rng*0.618,
    f702:dir==='BULLISH'?rangeHigh-rng*0.702:rangeLow+rng*0.702,
    f786:dir==='BULLISH'?rangeHigh-rng*0.786:rangeLow+rng*0.786,
  };
  const fvgMid=(fvg.top+fvg.bottom)/2;
  const inZone=(p,zone)=>p>=zone.bottom&&p<=zone.top;
  const fvgZone={bottom:fvg.bottom,top:fvg.top};
  let fibScore=0,hitFib=null;
  const fibPct=dir==='BULLISH'?((fvgMid-rangeLow)/rng*100):((rangeHigh-fvgMid)/rng*100);
  if(inZone(fibs.f618,fvgZone)||Math.abs(fvgMid-fibs.f618)/rng<0.02){fibScore++;hitFib='61.8';}
  if(inZone(fibs.f702,fvgZone)||Math.abs(fvgMid-fibs.f702)/rng<0.02){fibScore+=2;hitFib='70.2';}
  if(inZone(fibs.f786,fvgZone)||Math.abs(fvgMid-fibs.f786)/rng<0.02){fibScore+=3;hitFib='78.6';}
  let entry,sl,tp2;
  if(dir==='BULLISH'){entry=fvg.bottom;sl=entry-(fvg.top-fvg.bottom);tp2=entry+Math.abs(entry-sl)*2;}
  else{entry=fvg.top;sl=entry+(fvg.top-fvg.bottom);tp2=entry-Math.abs(entry-sl)*2;}
  const rr=Math.abs(tp2-entry)/Math.abs(entry-sl);
  let score=fibScore+1;
  if(rr>=2)score++;
  if(score<3)return null;
  const avgVol=rangeC.reduce((s,x)=>s+x.volume,0)/rangeC.length;
  const volRatio=avgVol>0?postC.slice(-5).reduce((s,x)=>s+x.volume,0)/5/avgVol:1;
  return{type:dir,entry,sl,tp2,session,rangeHigh,rangeLow,score,rr,fib:hitFib,fibPct:Math.round(fibPct*10)/10,fvgTop:fvg.top,fvgBottom:fvg.bottom,volRatio:Math.round(volRatio*10)/10};
}
function detectStructure(c){if(c.length<12)return{trend:'RANGING'};const sH=[],sL=[];for(let i=2;i<c.length-2;i++){if(c[i].high>c[i-1].high&&c[i].high>c[i-2].high&&c[i].high>c[i+1].high&&c[i].high>c[i+2].high)sH.push(c[i].high);if(c[i].low<c[i-1].low&&c[i].low<c[i-2].low&&c[i].low<c[i+1].low&&c[i].low<c[i+2].low)sL.push(c[i].low);}if(sH.length<2||sL.length<2)return{trend:'RANGING'};const rH=sH.slice(-2),rL=sL.slice(-2);if(rH[1]>rH[0]&&rL[1]>rL[0])return{trend:'BULLISH'};if(rH[1]<rH[0]&&rL[1]<rL[0])return{trend:'BEARISH'};return{trend:'RANGING'};}
function detectLiquidity(c,sweep,type){const tol=0.001,fp=PROX*2;const eqH=[],eqL=[];for(let i=0;i<c.length-4;i++){for(let j=i+3;j<c.length;j++){if(Math.abs(c[j].high-c[i].high)/c[i].high<tol){eqH.push(c[i].high);break;}}for(let j=i+3;j<c.length;j++){if(Math.abs(c[j].low-c[i].low)/c[i].low<tol){eqL.push(c[i].low);break;}}}if(type==='BEARISH')return eqH.some(h=>Math.abs(sweep-h)/sweep<fp);return eqL.some(l=>Math.abs(sweep-l)/sweep<fp);}
function detectFib(c){const rc=c.slice(-60);let sH=-Infinity,sL=Infinity;rc.forEach(x=>{if(x.high>sH)sH=x.high;if(x.low<sL)sL=x.low;});const r=sH-sL;if(!r)return null;return{f618:sH-r*0.618,f705:sH-r*0.705,f500:sH-r*0.5,b618:sL+r*0.618,b705:sL+r*0.705,b500:sL+r*0.5};}

function getWBias(wc){if(!wc||wc.length<2)return'NEUTRAL';const lw=wc[wc.length-2];return lw.close>lw.open?'BULLISH':lw.close<lw.open?'BEARISH':'NEUTRAL';}
function getWLvls(wc){if(!wc||wc.length<2)return null;const lw=wc[wc.length-2];return{high:lw.high,low:lw.low};}
function getPD(c){if(!c||c.length<3)return null;const pd=c[c.length-2];return{high:pd.high,low:pd.low};}

// RSI divergence (zero API cost — uses existing candle data)
function build4HFrom1H(h1Candles){
  const h4=[];
  for(let i=0;i<h1Candles.length;i+=4){
    const slice=h1Candles.slice(i,Math.min(i+4,h1Candles.length));
    if(slice.length<2)continue;
    h4.push({
      open:slice[0].open,
      high:Math.max(...slice.map(x=>x.high)),
      low:Math.min(...slice.map(x=>x.low)),
      close:slice[slice.length-1].close,
      dt:slice[slice.length-1].dt
    });
  }
  return h4;
}
function calcRSIValues(candles,p=14){
  if(candles.length<p+1)return [];
  const r=[];r.length=candles.length;r.fill(null);
  let g=0,l=0;
  for(let i=1;i<=p;i++){const d=candles[i].close-candles[i-1].close;if(d>0)g+=d;else l-=d;}
  let ag=g/p,al=l/p;
  r[p]=100-100/(1+(al!==0?ag/al:ag>0?100:0));
  for(let i=p+1;i<candles.length;i++){
    const d=candles[i].close-candles[i-1].close;
    ag=(ag*(p-1)+Math.max(d,0))/p;
    al=(al*(p-1)+Math.max(-d,0))/p;
    r[i]=100-100/(1+(al!==0?ag/al:ag>0?100:0));
  }
  return r;
}
function checkRSIDivergence(candles,direction){
  if(candles.length<30)return null;
  const r=calcRSIValues(candles,14);
  const valid=r.filter(x=>x!==null);
  if(valid.length<20)return null;
  const si=Math.max(14,candles.length-30),swings=[];
  for(let i=si+2;i<candles.length-2;i++){
    if(r[i]===null)continue;
    if(r[i]>r[i-1]&&r[i]>r[i-2]&&r[i]>r[i+1]&&r[i]>r[i+2])swings.push({i,t:'H',r:r[i],p:direction==='BEARISH'?candles[i].high:candles[i].low});
    if(r[i]<r[i-1]&&r[i]<r[i-2]&&r[i]<r[i+1]&&r[i]<r[i+2])swings.push({i,t:'L',r:r[i],p:direction==='BEARISH'?candles[i].low:candles[i].high});
  }
  if(direction==='BEARISH'){
    const h=swings.filter(s=>s.t==='H').slice(-2);
    if(h.length<2)return null;
    if(h[1].p>h[0].p&&h[1].r<h[0].r)return'Regular Bearish Divergence';
    if(h[1].p<h[0].p&&h[1].r<h[0].r)return'Hidden Bearish Divergence';
  }else{
    const l=swings.filter(s=>s.t==='L').slice(-2);
    if(l.length<2)return null;
    if(l[1].p<l[0].p&&l[1].r>l[0].r)return'Regular Bullish Divergence';
    if(l[1].p>l[0].p&&l[1].r>l[0].r)return'Hidden Bullish Divergence';
  }
  return null;
}

// QMR
function checkPremiumDiscount(c,type,qmLevel){
  const rc=c.slice(-100);let hi=-Infinity,lo=Infinity;
  rc.forEach(x=>{if(x.high>hi)hi=x.high;if(x.low<lo)lo=x.low;});
  return type==='BULLISH'?qmLevel<(hi+lo)/2:qmLevel>(hi+lo)/2;
}
function calcFibLevels(high,low){
  if(!high||!low||high<=low)return null;
  const r=high-low;
  return{p236:high-r*0.236,p382:high-r*0.382,p50:high-r*0.5,p618:high-r*0.618,p786:high-r*0.786,p886:high-r*0.886};
}
function getFibDepth(price,high,low,type){
  if(!high||!low||high<=low)return{zone:'UNKNOWN',level:null,score:0};
  const r=high-low,pct=type==='BULLISH'?(high-price)/r:(price-low)/r;
  if(pct>=0.886)return{zone:'EXTREME',level:'88.6%',score:4};
  if(pct>=0.786)return{zone:'DEEP',level:'78.6%',score:3};
  if(pct>=0.702)return{zone:'DEEP_PLUS',level:'70.2%',score:2.5};
  if(pct>=0.618)return{zone:'STRONG',level:'61.8%',score:2};
  if(pct>=0.5)return{zone:'MODERATE',level:'50.0%',score:1};
  return{zone:'WEAK',level:null,score:0};
}
function calcFibConfluence(price,type,weeklyLvls,dailyLvls){
  let totalScore=0,zones=[],labels=[];
  const checks=[
    {lvls:weeklyLvls,label:'Weekly'},{lvls:dailyLvls,label:'Daily'}
  ];
  for(const c of checks){
    if(!c.lvls||!c.lvls.high||!c.lvls.low||c.lvls.high<=c.lvls.low)continue;
    const fd=getFibDepth(price,c.lvls.high,c.lvls.low,type);
    if(fd.score>0){
      totalScore+=fd.score;
      zones.push(fd.zone);
      labels.push(c.label+' '+fd.level);
    }
    const levels=calcFibLevels(c.lvls.high,c.lvls.low);
    if(!levels)continue;
    const tolerance=(c.lvls.high-c.lvls.low)*0.01;
    const exacts=[];
    for(const [key,p] of Object.entries(levels)){
      const pct=type==='BULLISH'?(c.lvls.high-price)/(c.lvls.high-c.lvls.low):(price-c.lvls.low)/(c.lvls.high-c.lvls.low);
      const lvlPct={'p236':23.6,'p382':38.2,'p50':50,'p618':61.8,'p786':78.6,'p886':88.6}[key]||0;
      if(Math.abs(price-p)<=tolerance){exacts.push(lvlPct);}
    }
    if(exacts.length>1){
      totalScore+=exacts.length;
      labels.push(c.label+' confluence: '+exacts.join('/')+'%');
    }
  }
  return{score:totalScore,zones:zones.length?zones.join(','):'NONE',labels};
}
function isLevelAlreadySeen(instId,type,qmLevel,variant){
  for(const key of qmrSeen){
    if(!key.startsWith(instId+'-'+type+'-'))continue;
    var parts=key.split('-');
    if(parts.length<4)continue;
    // New format (>=5 parts): instId-type-variant-timestamp-level
    // Old format (4 parts):   instId-type-timestamp-level
    var hasVariant=parts.length>=5,pVariant=hasVariant?parts[2]:null,ts=parseFloat(hasVariant?parts[3]:parts[2]),level=parseFloat(hasVariant?parts[4]:parts[3]);
    if(variant&&pVariant&&pVariant!==variant)continue;
    if(Date.now()-ts>48*60*60*1000)continue;
    if(!isNaN(level)&&Math.abs(level-qmLevel)/qmLevel<0.005)return true;
  }
  return false;
}
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
  for(let h=sH.length-1;h>=1;h--){const head=sH[h],hh1=sH[h-1];if(head.p<=hh1.p||head.i<c.length-30)continue;const hlC=sL.filter(l=>l.i>hh1.i&&l.i<head.i);if(!hlC.length)continue;const hl=hlC[hlC.length-1];const bc=c.slice(head.i+1,Math.min(c.length,head.i+13)).filter(x=>x.close<hl.p);if(!bc.length||hl.p-bc[0].close<atr*BREAKOUT_ATR)continue;const dist=Math.abs(cp-hl.p);if(!(dist<atr*0.5&&cp<=hl.p*(1+0.0008)&&cp>=hl.p*(1-0.0005)))continue;if(!checkPremiumDiscount(c,'BEARISH',hl.p))continue;const crit=validateQMRCriteria(c,'BEARISH',head,hl,atr,sH,sL);if(!crit.valid)continue;const obs=detectOB(c),fvgs=detectFVG(c),obN=obs.bear.find(z=>Math.abs((z.top+z.bottom)/2-hl.p)<atr*2.0),fvN=fvgs.bear.find(z=>Math.abs((z.top+z.bottom)/2-hl.p)<atr*2.0);if(!obN&&!fvN)continue;if(obN)crit.factors.push('Reclaimed OB');else crit.factors.push('FVG at QM');let trueHigh=head.p;for(let k=head.i;k<c.length;k++){if(c[k].high>trueHigh)trueHigh=c[k].high;}results.push({type:'BEARISH',qmLevel:hl.p,head:head.p,cp,atr,criteria:crit,retestSL:trueHigh+atr*0.25});break;}
  for(let l=sL.length-1;l>=1;l--){const head=sL[l],ll1=sL[l-1];if(head.p>=ll1.p||head.i<c.length-30)continue;const lhC=sH.filter(h=>h.i>ll1.i&&h.i<head.i);if(!lhC.length)continue;const lh=lhC[lhC.length-1];const bc=c.slice(head.i+1,Math.min(c.length,head.i+13)).filter(x=>x.close>lh.p);if(!bc.length||bc[0].close-lh.p<atr*BREAKOUT_ATR)continue;const dist=Math.abs(cp-lh.p);if(!(dist<atr*0.5&&cp>=lh.p*(1-0.0008)&&cp<=lh.p*(1+0.0005)))continue;if(!checkPremiumDiscount(c,'BULLISH',lh.p))continue;const crit=validateQMRCriteria(c,'BULLISH',head,lh,atr,sH,sL);if(!crit.valid)continue;const obs=detectOB(c),fvgs=detectFVG(c),obN=obs.bull.find(z=>Math.abs((z.top+z.bottom)/2-lh.p)<atr*2.0),fvN=fvgs.bull.find(z=>Math.abs((z.top+z.bottom)/2-lh.p)<atr*2.0);if(!obN&&!fvN)continue;if(obN)crit.factors.push('Reclaimed OB');else crit.factors.push('FVG at QM');let trueLow=head.p;for(let k=head.i;k<c.length;k++){if(c[k].low<trueLow)trueLow=c[k].low;}results.push({type:'BULLISH',qmLevel:lh.p,head:head.p,cp,atr,criteria:crit,retestSL:trueLow-atr*0.25});break;}
  return results;
}
function checkSweepRejection(c,headIdx,type){const sc=c[headIdx],range=sc.high-sc.low;if(range<=0)return{valid:false,ratio:0,entryPrice:sc.close};let ratio;if(type==='BEARISH'){const bodyTop=Math.max(sc.open,sc.close);ratio=(sc.high-bodyTop)/range;}else{const bodyBottom=Math.min(sc.open,sc.close);ratio=(bodyBottom-sc.low)/range;}return{valid:ratio>=0.60,ratio,entryPrice:sc.close};}
function detectQMREarly(c){if(c.length<35)return[];const{sH,sL}=findSwings(c);if(sH.length<3||sL.length<3)return[];const cp=c[c.length-1].close,atr=calcATR(c,14),adr=calcADR(c,14),results=[];for(let h=sH.length-1;h>=1;h--){const head=sH[h],hh1=sH[h-1];if(head.p<=hh1.p||head.i<c.length-5)continue;const hlC=sL.filter(l=>l.i>hh1.i&&l.i<head.i);if(!hlC.length)continue;const hl=hlC[hlC.length-1];const bc=c.slice(head.i+1,Math.min(c.length,head.i+13)).filter(x=>x.close<hl.p);if(!bc.length||hl.p-bc[0].close<atr*BREAKOUT_ATR)continue;if(!(cp<=hl.p*1.008&&cp>=hl.p*0.992))continue;if(!checkPremiumDiscount(c,'BEARISH',hl.p))continue;const crit=validateQMRCriteria(c,'BEARISH',head,hl,atr,sH,sL);if(!crit.valid)continue;const obs=detectOB(c),fvgs=detectFVG(c),obN=obs.bear.find(z=>Math.abs((z.top+z.bottom)/2-hl.p)<atr*2.0),fvN=fvgs.bear.find(z=>Math.abs((z.top+z.bottom)/2-hl.p)<atr*2.0);if(!obN&&!fvN)continue;if(obN)crit.factors.push('Reclaimed OB');else crit.factors.push('FVG at QM');const wickCheck=checkSweepRejection(c,head.i,'BEARISH');if(!wickCheck.valid)continue;crit.factors.push('Wick '+(wickCheck.ratio*100).toFixed(0)+'%');let trueHigh=head.p;for(let k=head.i;k<c.length;k++){if(c[k].high>trueHigh)trueHigh=c[k].high;}const retestSL=trueHigh+atr*0.25,entryPrice=wickCheck.entryPrice,slDist=Math.abs(entryPrice-retestSL),rawTp1=entryPrice-slDist*3,tp1=adr>0?Math.max(rawTp1,entryPrice-adr*0.5):rawTp1,rr=slDist>0?Math.abs(entryPrice-tp1)/slDist:0;if(rr<MIN_RR)continue;results.push({type:'BEARISH',qmLevel:hl.p,head:head.p,headIdx:head.i,cp,atr,criteria:crit,retestSL,entryPrice,slDist,tp1,tp2:entryPrice-slDist*2.5,rr,wickRatio:wickCheck.ratio});break;}for(let l=sL.length-1;l>=1;l--){const head=sL[l],ll1=sL[l-1];if(head.p>=ll1.p||head.i<c.length-5)continue;const lhC=sH.filter(h=>h.i>ll1.i&&h.i<head.i);if(!lhC.length)continue;const lh=lhC[lhC.length-1];const bc=c.slice(head.i+1,Math.min(c.length,head.i+13)).filter(x=>x.close>lh.p);if(!bc.length||bc[0].close-lh.p<atr*BREAKOUT_ATR)continue;if(!(cp>=lh.p*0.992&&cp<=lh.p*1.008))continue;if(!checkPremiumDiscount(c,'BULLISH',lh.p))continue;const crit=validateQMRCriteria(c,'BULLISH',head,lh,atr,sH,sL);if(!crit.valid)continue;const obs=detectOB(c),fvgs=detectFVG(c),obN=obs.bull.find(z=>Math.abs((z.top+z.bottom)/2-lh.p)<atr*2.0),fvN=fvgs.bull.find(z=>Math.abs((z.top+z.bottom)/2-lh.p)<atr*2.0);if(!obN&&!fvN)continue;if(obN)crit.factors.push('Reclaimed OB');else crit.factors.push('FVG at QM');const wickCheck=checkSweepRejection(c,head.i,'BULLISH');if(!wickCheck.valid)continue;crit.factors.push('Wick '+(wickCheck.ratio*100).toFixed(0)+'%');let trueLow=head.p;for(let k=head.i;k<c.length;k++){if(c[k].low<trueLow)trueLow=c[k].low;}const retestSL=trueLow-atr*0.25,entryPrice=wickCheck.entryPrice,slDist=Math.abs(entryPrice-retestSL),rawTp1=entryPrice+slDist*3,tp1=adr>0?Math.min(rawTp1,entryPrice+adr*0.5):rawTp1,rr=slDist>0?Math.abs(entryPrice-tp1)/slDist:0;if(rr<MIN_RR)continue;results.push({type:'BULLISH',qmLevel:lh.p,head:head.p,headIdx:head.i,cp,atr,criteria:crit,retestSL,entryPrice,slDist,tp1,tp2:entryPrice+slDist*2.5,rr,wickRatio:wickCheck.ratio});break;}return results;}
function findDrawOnLiquidity(c,type,entryPrice,atr){const tol=0.001,minDist=atr*3;const eqH=[],eqL=[];for(let i=0;i<c.length-4;i++){for(let j=i+3;j<c.length;j++){if(Math.abs(c[j].high-c[i].high)/c[i].high<tol){eqH.push(c[i].high);break;}}for(let j=i+3;j<c.length;j++){if(Math.abs(c[j].low-c[i].low)/c[i].low<tol){eqL.push(c[i].low);break;}}}if(type==='BULLISH'){const t=eqH.filter(h=>h>entryPrice+minDist).sort((a,b)=>a-b);return t.length?{price:t[0],label:'Buy Side Liquidity'}:null;}const t=eqL.filter(l=>l<entryPrice-minDist).sort((a,b)=>b-a);return t.length?{price:t[0],label:'Sell Side Liquidity'}:null;}
function findStructuralTP2(c,type,entryPrice,slDist,tp1Price){if(slDist<=0)return null;const minT=type==='BULLISH'?entryPrice+slDist*2.5:entryPrice-slDist*2.5,maxT=type==='BULLISH'?entryPrice+slDist*3:entryPrice-slDist*3,tol=0.001;const eqH=[],eqL=[],swH=[],swL=[];for(let i=0;i<c.length-4;i++){for(let j=i+3;j<c.length;j++){if(Math.abs(c[j].high-c[i].high)/c[i].high<tol){eqH.push(c[i].high);break;}}for(let j=i+3;j<c.length;j++){if(Math.abs(c[j].low-c[i].low)/c[i].low<tol){eqL.push(c[i].low);break;}}}for(let i=3;i<c.length-3;i++){if(c[i].high>c[i-1].high&&c[i].high>c[i-2].high&&c[i].high>c[i+1].high&&c[i].high>c[i+2].high)swH.push(c[i].high);if(c[i].low<c[i-1].low&&c[i].low<c[i-2].low&&c[i].low<c[i+1].low&&c[i].low<c[i+2].low)swL.push(c[i].low);}if(type==='BULLISH'){const cands=[...eqH,...swH].filter(h=>h>tp1Price&&h>=minT&&h<=maxT).sort((a,b)=>a-b);if(cands.length)return{price:cands[0],rr:((cands[0]-entryPrice)/slDist).toFixed(1)};return{price:entryPrice+slDist*2.5,rr:'2.5'};}const cands=[...eqL,...swL].filter(l=>l<tp1Price&&l<=minT&&l>=maxT).sort((a,b)=>b-a);if(cands.length)return{price:cands[0],rr:((entryPrice-cands[0])/slDist).toFixed(1)};return{price:entryPrice-slDist*2.5,rr:'2.5'};}

// Conflict resolution hierarchy: Daily CRT > 4H QMR > 1H QMR
function tfWeight(tf){if(tf==='DAILY')return 3;if(tf==='4H')return 2;if(tf==='1H')return 1;return 0;}
async function tgTradeInvalidated(trade,reason,weeklyBias){const isB=trade.type==='BULLISH';const biasLine=weeklyBias&&weeklyBias!=='NEUTRAL'?'\nWeekly Bias: '+weeklyBias+' - market aligned with new direction':'';await tgSend('\u26A0\uFE0F TRADE INVALIDATED\n'+'='.repeat(28)+'\n\uD83D\uDCCA '+trade.instName+' | '+(isB?'BUY':'SELL')+' QMR '+trade.tf+'\n\n\uD83D\uDD34 Reason: '+reason+biasLine+'\n\n'+(isB?'Close any open BUY positions on '+trade.instName+'.':'Close any open SELL positions on '+trade.instName+'.')+'\n\n\u2014 The Slayers Model by Rexroz');}
async function resolveConflicts(instId,newType,newTf,source,weeklyBias){const newW=tfWeight(newTf);let blocked=false;for(let i=activeQMRTrades.length-1;i>=0;i--){const t=activeQMRTrades[i];if(t.instId!==instId||t.type===newType)continue;const exW=tfWeight(t.tf);if(newW>exW){// Fib protection: don't invalidate trades at 61.8%+ HTF zones
const wLvls=weeklyCache[instId]?.lvls;if(wLvls&&wLvls.high&&wLvls.low){const fd=getFibDepth(t.qmLevel,wLvls.high,wLvls.low,t.type);if(fd.zone==='STRONG'||fd.zone==='DEEP'){log(`FIB PROTECTED: ${t.instName} ${t.type} at ${fd.level} — not invalidating`);blocked=true;continue;}}
const reason=source==='CRT'?'Daily CRT confirmed '+newType+' - structure shifted on Daily timeframe':newTf+' QMR '+newType+' - '+newTf+' overrides '+t.tf;log(`INVALIDATING: ${t.instName} ${t.type} ${t.tf}`);await tgTradeInvalidated(t,reason,weeklyBias);tradeHistory.push({instId:t.instId,type:t.type,tf:t.tf,outcome:'INVALIDATED',rMultiple:0,time:new Date().toISOString()});delete trackedTrades[t.sigId];activeQMRTrades.splice(i,1);}else{log(`BLOCKED: ${instId} ${newTf} ${newType} by ${t.tf} ${t.type}`);blocked=true;}}return blocked;}
function checkCorrelationConflict(instId,type){
  // Returns array of active trade descriptions that conflict with this new signal
  const conflicts=[];
  for(const group of CORRELATION_GROUPS){
    if(!group.includes(instId))continue;
    for(const t of activeQMRTrades){
      if(!group.includes(t.instId)||t.instId===instId)continue;
      if(t.type!==type)conflicts.push(t.instName+' '+(t.type==='BULLISH'?'BUY':'SELL')+' '+t.tf);
    }
  }
  return conflicts;
}

// Telegram functions
async function tgSend(text){if(!TG_TOKEN||!TG_CHAT)return;try{await fetch(`https://api.telegram.org/bot${TG_TOKEN}/sendMessage`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({chat_id:TG_CHAT,text})});}catch(e){log('TG error: '+e.message);}}
// Chart snapshots via chart-img.com (optional - only active when CHARTIMG_API_KEY is set)
const CHART_SYMBOLS={EURUSD:'OANDA:EURUSD',GBPUSD:'OANDA:GBPUSD',AUDUSD:'OANDA:AUDUSD',GBPJPY:'OANDA:GBPJPY',XAUUSD:'OANDA:XAUUSD',BTCUSD:'COINBASE:BTCUSD',EURGBP:'OANDA:EURGBP',EURCAD:'OANDA:EURCAD',USDJPY:'OANDA:USDJPY',USDCAD:'OANDA:USDCAD',NZDUSD:'OANDA:NZDUSD',NAS100:'OANDA:NAS100USD'};
async function tgSendChart(instId,interval,lines,caption,saveForApp,noTg){
  // saveForApp: if provided, save the exact same image bytes for the app to display later
  let savedFile=null;
  if(!CHARTIMG_KEY){return saveForApp?null:undefined;}
  try{
    const sym=CHART_SYMBOLS[instId];if(!sym)return null;
    const drawings=lines.map(l=>({name:'Horizontal Line',input:{price:l.price,text:l.text},override:{lineColor:l.color,textColor:l.color,fontSize:12,showLabel:true,lineWidth:2}}));
    const res=await fetch('https://api.chart-img.com/v2/tradingview/advanced-chart',{method:'POST',headers:{'x-api-key':CHARTIMG_KEY,'content-type':'application/json'},body:JSON.stringify({symbol:sym,interval,theme:'dark',width:800,height:600,drawings})});
    if(!res.ok){log('ChartImg '+instId+': HTTP '+res.status);return null;}
    const buf=await res.arrayBuffer();
    // Save the exact same bytes to disk for the app, before sending to Telegram
    if(saveForApp){
      try{
        savedFile=saveForApp+'.png';
        fs.writeFileSync(CHARTS_DIR+'/'+savedFile,Buffer.from(buf));
      }catch(e){log('Chart save error: '+e.message);savedFile=null;}
    }
    if(!noTg&&TG_TOKEN&&TG_CHAT){
      const fd=new FormData();
      fd.append('chat_id',TG_CHAT);
      fd.append('caption',caption);
      fd.append('photo',new Blob([buf],{type:'image/png'}),'chart.png');
      const tg=await fetch('https://api.telegram.org/bot'+TG_TOKEN+'/sendPhoto',{method:'POST',body:fd});
      if(!tg.ok)log('TG photo '+instId+': HTTP '+tg.status);
    }
    return savedFile;
  }catch(e){log('Chart error '+instId+': '+e.message);return null;}
}
async function genScalpChart(instId,interval,lines,saveKey){
  if(!CHARTIMG_KEY)return null;
  try{
    const sym=CHART_SYMBOLS[instId];if(!sym)return null;
    const drawings=lines.map(l=>({name:'Horizontal Line',input:{price:l.price,text:l.text},override:{lineColor:l.color,textColor:l.color,fontSize:12,showLabel:true,lineWidth:2}}));
    const res=await fetch('https://api.chart-img.com/v2/tradingview/advanced-chart',{method:'POST',headers:{'x-api-key':CHARTIMG_KEY,'content-type':'application/json'},body:JSON.stringify({symbol:sym,interval,theme:'dark',width:800,height:600,drawings})});
    if(!res.ok){log('ScalpChart '+instId+': HTTP '+res.status);return null;}
    const buf=await res.arrayBuffer();
    const file=saveKey+'.png';
    fs.writeFileSync(CHARTS_DIR+'/'+file,Buffer.from(buf));
    return file;
  }catch(e){log('ScalpChart error '+instId+': '+e.message);return null;}
}
async function tgQMRPreAlert(id,tf,qmr,htfBias,earlyEntry,wickRatio,aggSL,aggTP1,aggTP2){const bear=qmr.type==='BEARISH',p=qmr.qmLevel>10?2:5,zone=bear?'PREMIUM - Sell Zone':'DISCOUNT - Buy Zone',slDist=Math.abs(earlyEntry-aggSL),rr1=slDist>0?(Math.abs(aggTP1-earlyEntry)/slDist).toFixed(1):'--',rr2=slDist>0?(Math.abs(aggTP2-earlyEntry)/slDist).toFixed(1):'2.5',slLabel=bear?'above protected high':'below protected low';let htfLine='';if(htfBias&&htfBias!=='NEUTRAL'){const agrees=(bear&&htfBias==='BEARISH')||((!bear)&&htfBias==='BULLISH');htfLine='\n'+(agrees?'\uD83D\uDD25 HTF Aligned: Weekly '+htfBias+' - HIGH PROBABILITY':'\u26A0\uFE0F Counter-trend: Weekly '+htfBias);}const tier=qmr.criteria.score>=4?'\uD83D\uDC8E ELITE SETUP':'\uD83D\uDFE1 VALID SETUP';await tgSend('\u26A1 EARLY QMR ENTRY \u2014 '+tier+'\n'+'='.repeat(28)+'\n\uD83D\uDCCA '+id+' \u00B7 '+tf+' \u00B7 '+zone+'\n'+(bear?'\uD83D\uDD34 BEARISH QM (AGGRESSIVE)':'\uD83D\uDFE2 BULLISH QM (AGGRESSIVE)')+htfLine+'\n\n\u26A1 Aggressive Entry: '+earlyEntry.toFixed(p)+' (sweep close)\n\uD83D\uDEAB SL:    '+aggSL.toFixed(p)+' ('+slLabel+') \u2014 '+slDist.toFixed(p)+'pts\n\uD83C\uDFAF TP1:    '+aggTP1.toFixed(p)+' (1:'+rr1+'R)\n\uD83C\uDFAF Full TP2: '+aggTP2.toFixed(p)+' (1:'+rr2+'R)\n\n\uD83C\uDFD4\uFE0F Head: '+qmr.head.toFixed(p)+'\n\uD83D\uDD04 Wick rejection: '+(wickRatio*100).toFixed(0)+'% \u2014 genuine sweep\n\n\uD83D\uDD25 Criteria: '+qmr.criteria.score+'/4\n'+qmr.criteria.factors.map(f=>'\u2705 '+f).join('\n')+(qmr.dailyPOI?'\n\uD83C\uDFDB\uFE0F '+qmr.dailyPOI+' \u2014 HTF confluence':'')+(qmr.rsiDivergence?'\n\uD83D\uDD25 '+qmr.rsiDivergence+' on 4H':'')+'\n\n\u23F3 Standard QMR confirmation pending at QM level: '+qmr.qmLevel.toFixed(p)+'\n'+'='.repeat(28)+'\n\u2014 The Slayers Model by Rexroz');}
async function tgQMR(id,tf,qmr,htfBias,sessWarn,adrWarn){const bear=qmr.type==='BEARISH',p=qmr.qmLevel>10?2:5,zone=bear?'PREMIUM - Sell Zone':'DISCOUNT - Buy Zone',entry=qmr.qmLevel,sl=qmr.retestSL!=null?qmr.retestSL:(bear?qmr.head+qmr.atr*0.1:qmr.head-qmr.atr*0.1),slDist=Math.abs(entry-sl),dol=qmr.drawOnLiquidity,tp1=dol?dol.price:(bear?entry-slDist*3:entry+slDist*3),rr1=slDist>0?(Math.abs(tp1-entry)/slDist).toFixed(1):'--',td=qmr.structuralTP2,tp2=td?td.price:(bear?entry-slDist*2.5:entry+slDist*2.5),rr2=td?td.rr:(slDist>0?(Math.abs(tp2-entry)/slDist).toFixed(1):'2.5'),dolLabel=dol?dol.label:'Draw on Liquidity',slLabel=bear?'above protected high':'below protected low';let htfLine='';if(htfBias&&htfBias!=='NEUTRAL'){const agrees=(bear&&htfBias==='BEARISH')||((!bear)&&htfBias==='BULLISH');htfLine='\n'+(agrees?'\uD83D\uDD25 HTF Aligned: Weekly '+htfBias+' - HIGH PROBABILITY':'\u26A0\uFE0F Counter-trend: Weekly '+htfBias);}const tier=qmr.criteria.score>=4?'\uD83D\uDC8E ELITE SETUP':'\uD83D\uDFE1 VALID SETUP';let msg='\uD83D\uDD04 QMR SIGNAL \u2014 '+tier+'\n'+'='.repeat(28)+'\n\uD83D\uDCCA '+id+' \u00B7 '+tf+' \u00B7 '+zone+'\n'+(bear?'\uD83D\uDD34 BEARISH QM':'\uD83D\uDFE2 BULLISH QM')+htfLine+'\n\n\uD83D\uDCCD '+(qmr.refinedEntry?'4H Zone: ':'Entry: ')+entry.toFixed(p)+' (QM Level)\n'+(qmr.refinedEntry?'\uD83C\uDFAF Refined Entry: '+qmr.refinedEntry.price.toFixed(p)+' ('+qmr.refinedEntry.source+')\n\u2192 Enter at refined level for better R\n':'')+'\uD83D\uDEAB SL:    '+sl.toFixed(p)+' ('+slLabel+')\n\uD83C\uDFAF '+dolLabel+': '+tp1.toFixed(p)+' (1:'+rr1+'R)\n\uD83C\uDFAF Next Structure: '+tp2.toFixed(p)+' (1:'+rr2+'R)\n\n\uD83C\uDFD4\uFE0F Head: '+qmr.head.toFixed(p)+'\n\n\uD83D\uDD25 Criteria: '+qmr.criteria.score+'/4\n'+qmr.criteria.factors.map(f=>'\u2705 '+f).join('\n')+(qmr.dailyPOI?'\n\uD83C\uDFDB\uFE0F '+qmr.dailyPOI+' \u2014 HTF confluence':'')+(qmr.rsiDivergence?'\n\uD83D\uDD25 '+qmr.rsiDivergence+' on 4H':'')+'\n\n';if(qmr.counterTrend)msg+='\u26A0\uFE0F COUNTER-TREND \u2014 potential trend reversal. Reduce size.\n\n';const riskRec=qmr.criteria.score>=4?'1% (ELITE)':'0.5% (VALID)';msg+='\uD83D\uDCB0 Recommended risk: '+riskRec+'\n\n';if(sessWarn)msg+='\u23F0 Outside prime session hours\n\n';if(adrWarn)msg+='\u26A0\uFE0F '+adrWarn+'% of avg daily range already used \u2014 TP may need 1-2 sessions\n\n';msg+='\uD83D\uDCB0 Calc position size: https://slayerbotcalculator.netlify.app/#'+id+','+entry.toFixed(p)+','+sl.toFixed(p)+'\n\n\u26A1 Price at QM level. Look for confirmation candle before entering.\n\u2014 The Slayers Model by Rexroz';await tgSend(msg);}
async function tgMultiTFConfluence(id,qmr1H,qmr4H){const bear=qmr1H.type==='BEARISH',p=qmr1H.qmLevel>10?2:5,zone=bear?'PREMIUM - Sell Zone':'DISCOUNT - Buy Zone',entry=qmr1H.qmLevel,sl=qmr1H.retestSL!=null?qmr1H.retestSL:(bear?qmr1H.head+qmr1H.atr*0.1:qmr1H.head-qmr1H.atr*0.1),slDist=Math.abs(entry-sl),dol=qmr1H.drawOnLiquidity,tp1=dol?dol.price:(bear?entry-slDist*3:entry+slDist*3),tp2=qmr1H.structuralTP2?qmr1H.structuralTP2.price:(bear?entry-slDist*2.5:entry+slDist*2.5),rr1=slDist>0?(Math.abs(tp1-entry)/slDist).toFixed(1):'--',rr2=slDist>0?(Math.abs(tp2-entry)/slDist).toFixed(1):'2.5',dolLabel=dol?dol.label:'Draw on Liquidity',slLabel=bear?'above protected high':'below protected low';await tgSend('\uD83D\uDD25\uD83D\uDD04 MULTI-TF CONFLUENCE - HIGHEST PROBABILITY\n'+'='.repeat(28)+'\n\uD83D\uDCCA '+id+' \u00B7 1H + 4H \u00B7 '+zone+'\n'+(bear?'\uD83D\uDD34 BEARISH QM':'\uD83D\uDFE2 BULLISH QM')+'\n\n\u2705 1H QMR level: '+qmr1H.qmLevel.toFixed(p)+'\n\u2705 4H QMR level: '+qmr4H.qmLevel.toFixed(p)+'\n\u2705 Both timeframes aligned\n\n\uD83D\uDCCD '+(qmr.refinedEntry?'4H Zone: ':'Entry: ')+entry.toFixed(p)+' (QM Level)\n'+(qmr.refinedEntry?'\uD83C\uDFAF Refined Entry: '+qmr.refinedEntry.price.toFixed(p)+' ('+qmr.refinedEntry.source+')\n\u2192 Enter at refined level for better R\n':'')+'\uD83D\uDEAB SL:    '+sl.toFixed(p)+' ('+slLabel+')\n\uD83C\uDFAF '+dolLabel+': '+tp1.toFixed(p)+' (1:'+rr1+'R)\n\uD83C\uDFAF Next Structure: '+tp2.toFixed(p)+' (1:'+rr2+'R)\n\n\uD83D\uDD25 1H Score: '+qmr1H.criteria.score+'/4 | 4H Score: '+qmr4H.criteria.score+'/4\n\n'+(qmr1H.dailyPOI?'\uD83C\uDFDB\uFE0F '+qmr1H.dailyPOI+' \u2014 HTF confluence\n\n':'')+(qmr1H.rsiDivergence?'\uD83D\uDD25 '+qmr1H.rsiDivergence+' on 4H\n\n':'')+(qmr1H.counterTrend?'\u26A0\uFE0F COUNTER-TREND \u2014 potential trend reversal. Reduce size.\n\n':'')+'\uD83D\uDCB0 Calc position size: https://slayerbotcalculator.netlify.app/#'+id+','+entry.toFixed(p)+','+sl.toFixed(p)+'\n\n\u26A1 BOTH TIMEFRAMES CONFIRMED. Highest conviction setup.\n\u2014 The Slayers Model by Rexroz');}
async function tgQMRUpdate(trade,level){const isB=trade.type==='BULLISH',p=trade.dec;const icons={be:'\u26A1 MOVE TO BREAKEVEN',tp1:'\u2705 TP1 HIT!',tp2:'\uD83D\uDCB0 FULL TARGET HIT!',sl:'\uD83D\uDEAB STOP LOSS HIT',be_close:'\u2705 TRADE CLOSED - TP1 SECURED',be_sl:'\u2696\uFE0F CLOSED AT BREAKEVEN',trail:'\uD83D\uDD39 TRAILING STOP ACTIVE'};const msgs={be:'Trade moved 1:1 in your favour.\nMove SL to entry: '+trade.qmLevel.toFixed(p)+'\nTrade is now risk-free.',tp1:'\uD83C\uDFAF Draw on Liquidity: '+trade.tp1.toFixed(p)+' reached.\nClose 50% of your position now.\nSL moved to entry zone (buffer) \u2014 partial profit locked.\nLet the rest run to TP2.',tp2:'\uD83C\uDFAF Next Structure: '+trade.tp2.toFixed(p)+' reached.\nClose trade - full profit taken!',sl:'SL: '+trade.sl.toFixed(p)+' triggered.\nTrade closed. Stay disciplined, next setup coming.',be_close:'TP1 was secured. Remainder hit the buffer stop.\nPartial profit locked \u2014 TP1 + buffer gain banked.\u2705',be_sl:'Price returned to entry after the breakeven move.\nTrade closed flat \u2014 no loss taken.\nCapital protected. Wait for the next setup.',trail:'Trailing stop is now active.\nSL will follow price as it moves in your favour.\nLocking in gains beyond TP1.'};await tgSend(icons[level]+'\n'+'='.repeat(28)+'\n\uD83D\uDCCA '+trade.instName+' \u00B7 '+trade.tf+' | '+(isB?'BUY':'SELL')+' QMR\n\n'+msgs[level]+'\n\n\u2014 The Slayers Model by Rexroz');}
async function tgBiasFlip(id,oldBias,newBias){await tgSend('\uD83D\uDD04 WEEKLY BIAS FLIPPED - '+id+'\n'+'='.repeat(28)+'\n\n\uD83D\uDCCA '+id+'\n'+(oldBias==='BULLISH'?'\uD83D\uDFE2':'\uD83D\uDD34')+' Previous: '+oldBias+'\n'+(newBias==='BULLISH'?'\uD83D\uDFE2':'\uD83D\uDD34')+' New Bias: '+newBias+'\n\n\u26A0\uFE0F HTF direction shifted. This affects NEW trades.\nExisting trades remain valid — let price structure confirm the flip.\n'+(newBias==='BEARISH'?'Look for sell setups in premium only.':'Look for buy setups in discount only.')+'\n\n\u2014 The Slayers Model by Rexroz');}

// Sends ONE bundled message for all bias flips that happened in a single scan
async function tgBiasFlipBundle(flips){
  if(!flips||!flips.length)return;
  if(flips.length===1){await tgBiasFlip(flips[0].id,flips[0].old,flips[0].new);return;}
  const lines=flips.map(f=>{
    const arrow=(f.old==='BULLISH'?'\uD83D\uDFE2':'\uD83D\uDD34')+' \u2192 '+(f.new==='BULLISH'?'\uD83D\uDFE2':'\uD83D\uDD34');
    return `${arrow} ${f.id} — ${f.old} \u2192 ${f.new}`;
  });
  await tgSend('\uD83D\uDD04 WEEKLY BIAS UPDATE\n'+'='.repeat(28)+'\n\n'+lines.join('\n')+'\n\n\u26A0\uFE0F HTF direction shifted on the above pairs. Affects NEW trades only.\nExisting trades remain valid until price structure confirms otherwise.\n\u2014 The Slayers Model by Rexroz');
}
async function sendDailyBriefing(){
  const now=new Date(),days=['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'],months=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const dateStr=days[now.getUTCDay()]+' '+now.getUTCDate()+' '+months[now.getUTCMonth()]+' '+now.getUTCFullYear();
  let msg='\uD83C\uDF05 SLAYERS DAILY BRIEFING\n'+dateStr+' | 07:00 UTC\n'+'='.repeat(28)+'\n\n';
  const aligned=[];const snapshot=[];
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
      snapshot.push({pair:inst.id,name:inst.name,price,weekly,daily,aligned:agree});
      await sleep(DELAY_MS);
    }catch(e){log('Briefing '+inst.id+': '+e.message);await sleep(DELAY_MS);}
  }
  if(aligned.length)msg+='\uD83C\uDFAF FOCUS TODAY \u2014 Weekly + Daily aligned:\n'+aligned.map(a=>'\u2705 '+a).join('\n')+'\n\n';
  else msg+='\uD83D\uDFE1 No pairs fully aligned today. Be selective.\n\n';
  msg+='\uD83D\uDCC5 London: 07:00-16:00 UTC | New York: 13:00-22:00 UTC\n\n\u26A0\uFE0F Wait for confirmation before entering.\n\u2014 The Slayers Model by Rexroz';
  await tgSend(msg);
  lastBriefingSnapshot=snapshot;lastBriefingTime=new Date().toISOString();saveState();
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
function rTotal(list){return Math.round(list.reduce((a,t)=>a+(typeof t.rMultiple==='number'?t.rMultiple:0),0)*10)/10;}
async function tgMonthlyRecap(){
  const now=new Date();
  const months=['January','February','March','April','May','June','July','August','September','October','November','December'];
  // history covers the trailing window; for a monthly card we report all currently-held history
  const hist=tradeHistory.filter(t=>t.outcome&&t.outcome!=='INVALIDATED');
  if(!hist.length){await tgSend('\uD83D\uDCCA SLAYERS BOT \u2014 MONTHLY RECAP\nNo completed trades this period.\n\u2014 The Slayers Model by Rexroz');return;}
  const wins=hist.filter(t=>t.outcome==='TP1'||t.outcome==='TP2'||t.outcome==='WIN');
  const losses=hist.filter(t=>t.outcome==='SL');
  const bes=hist.filter(t=>t.outcome==='BE');
  const wr=(wins.length+losses.length)?Math.round((wins.length/(wins.length+losses.length))*100):0;
  const totalR=rTotal(hist);
  // best / worst by R
  let best=null,worst=null;
  for(const t of hist){if(typeof t.rMultiple!=='number')continue;if(!best||t.rMultiple>best.rMultiple)best=t;if(!worst||t.rMultiple<worst.rMultiple)worst=t;}
  // most active pair
  const counts={};hist.forEach(t=>{counts[t.instId]=(counts[t.instId]||0)+1;});
  const mostActive=Object.entries(counts).sort((a,b)=>b[1]-a[1])[0];
  const filled=Math.round(wr/10);const bar='\u2588'.repeat(filled)+'\u2591'.repeat(10-filled);
  let msg='\uD83D\uDCCA SLAYERS BOT \u2014 '+months[now.getUTCMonth()].toUpperCase()+' '+now.getUTCFullYear()+'\n';
  msg+='='.repeat(28)+'\n';
  msg+='Total Signals: '+hist.length+'\n';
  msg+='\u2705 Wins: '+wins.length+' | \uD83D\uDEAB Losses: '+losses.length+' | \u2696\uFE0F BE: '+bes.length+'\n';
  msg+='Win Rate: '+wr+'% (wins vs losses)\n';
  msg+='Total R: '+(totalR>=0?'+':'')+totalR+'R\n\n';
  if(best)msg+='\uD83D\uDC8E Best Trade: '+best.instId+' '+best.tf+' \u2014 '+(best.rMultiple>=0?'+':'')+best.rMultiple+'R\n';
  if(worst)msg+='\uD83D\uDCC9 Worst: '+worst.instId+' '+worst.tf+' \u2014 '+(worst.rMultiple>=0?'+':'')+worst.rMultiple+'R\n';
  if(mostActive)msg+='\uD83D\uDD25 Most Active: '+mostActive[0]+'\n';
  msg+='\n'+bar+' '+wr+'% Win Rate\n';
  msg+='\u2014 The Slayers Model by Rexroz';
  await tgSend(msg);
}
async function tgTradeOfWeek(t){
  // Fired when an ELITE setup closes at >= 2.5R
  let msg='\uD83C\uDFC6 TRADE OF THE WEEK\n'+'='.repeat(28)+'\n';
  msg+=(t.type==='BULLISH'?'\uD83D\uDFE2':'\uD83D\uDD34')+' '+t.instId+' \u00B7 '+t.tf+' QMR\n\n';
  msg+='\uD83D\uDCCD Entry: '+fmtN(t.qmLevel,t.dec)+'\n';
  msg+='\uD83C\uDFAF Result: +'+t.rMultiple+'R\n\n';
  msg+='Why it was ELITE:\n';
  if(Array.isArray(t.eliteFactors))t.eliteFactors.forEach(f=>{msg+='\u2705 '+f+'\n';});
  else msg+='\u2705 All 4 criteria confirmed\n';
  if(t.dailyPOI)msg+='\uD83C\uDFDB\uFE0F '+t.dailyPOI+' \u2014 HTF confluence\n';
  msg+='\nThis is what patience and confirmation produce.\n\u2014 The Slayers Model by Rexroz';
  await tgSend(msg);
}
async function tgWeeklySummary(){suppressedPairs.clear();const total=tradeHistory.length;if(!total){await tgSend('\uD83D\uDCCA WEEKLY SUMMARY\nNo completed trades this week.\n\u2014 The Slayers Model by Rexroz');return;}const tp=tradeHistory.filter(t=>t.outcome==='TP1'||t.outcome==='TP2'||t.outcome==='WIN').length,sl=tradeHistory.filter(t=>t.outcome==='SL').length,be=tradeHistory.filter(t=>t.outcome==='BE').length,wr=(tp+sl)?Math.round((tp/(tp+sl))*100):0,bar='\u2588'.repeat(Math.round(wr/10))+'\u2591'.repeat(10-Math.round(wr/10)),now=new Date(),months=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],withDur=tradeHistory.filter(t=>t.duration!=null),avgDur=withDur.length?Math.round(withDur.reduce((a,t)=>a+t.duration,0)/withDur.length):null;let msg='\uD83D\uDCCA SLAYERS WEEKLY PERFORMANCE\nWeek ending '+now.getUTCDate()+' '+months[now.getUTCMonth()]+'\n'+'='.repeat(28)+'\n\n\uD83D\uDD25 Total: '+total+' | \u2705 TP: '+tp+' | \uD83D\uDEAB SL: '+sl+' | \u2696\uFE0F BE: '+be+'\n\nWin Rate: '+bar+' '+wr+'%\n';if(avgDur)msg+='Avg trade duration: '+(avgDur>=60?Math.floor(avgDur/60)+'h '+(avgDur%60)+'m':avgDur+'m')+'\n';msg+='\n'+(wr>=60?'\uD83D\uDD25 Excellent week.':wr>=45?'\uD83D\uDFE1 Solid week. Stay disciplined.':'\u26A0\uFE0F Tough week. Trust the process.')+'\n\n\u2014 The Slayers Model by Rexroz';await tgSend(msg);const __weekTrades=[...tradeHistory];tradeHistory=[];
  // Roll this week's results into permanent per-pair tracking, then flag any pair that's quietly underperforming
  for(const t of __weekTrades){
    if(t.outcome!=='TP1'&&t.outcome!=='TP2'&&t.outcome!=='WIN'&&t.outcome!=='SL')continue;
    if(!pairPerformance[t.instId])pairPerformance[t.instId]={wins:0,losses:0};
    if(t.outcome==='SL')pairPerformance[t.instId].losses++;else pairPerformance[t.instId].wins++;
  }
  const weak=Object.entries(pairPerformance).filter(([id,p])=>{const total=p.wins+p.losses;return total>=8&&(p.wins/total)<0.35;});
  const newlySuppressed=[];
  for(const [id] of weak){
    if(!suppressedPairs.has(id)){
      suppressedPairs.add(id);
      newlySuppressed.push(id);
      log(`Auto-suppressed ${id} — ${Math.round((pairPerformance[id].wins/(pairPerformance[id].wins+pairPerformance[id].losses))*100)}% win rate`);
    }
  }
  if(newlySuppressed.length){
    await tgSend('\u26A0\uFE0F PAIR AUTO-SUPPRESSED\n'+'='.repeat(28)+'\n\n'+newlySuppressed.map(id=>'\u274C '+id+' \u2014 '+Math.round((pairPerformance[id].wins/(pairPerformance[id].wins+pairPerformance[id].losses))*100)+'% win rate ('+pairPerformance[id].wins+'W/'+pairPerformance[id].losses+'L)').join('\n')+'\n\nNo new signals will be sent for these pairs until next weekly reset.\n\u2014 The Slayers Model by Rexroz');
  }
  // Decay historical pair performance — halve the weights so recent weeks matter more than early months
  for(const id in pairPerformance){
    var pp=pairPerformance[id];
    pp.wins=Math.round(pp.wins*0.5);
    pp.losses=Math.round(pp.losses*0.5);
  }
  weeklySummaryData={total,tp,sl,be,wr,totalR:__weekTrades.reduce((a,t)=>a+(typeof t.rMultiple==='number'?t.rMultiple:0),0),winners:__weekTrades.filter(t=>t.outcome==='WIN'||t.outcome==='TP1'||t.outcome==='TP2').length,losers:__weekTrades.filter(t=>t.outcome==='SL').length,best:__weekTrades.reduce((a,t)=>(typeof t.rMultiple==='number'&&t.rMultiple>a)?t.rMultiple:a,0),avgDur:__weekTrades.filter(t=>t.duration!=null).reduce((a,t)=>a+t.duration,0)/(__weekTrades.filter(t=>t.duration!=null).length||1),pairs:Object.fromEntries(__weekTrades.filter(t=>t.outcome!=='BE'&&t.outcome!=='INVALIDATED').reduce((m,t)=>{if(!m.has(t.instId))m.set(t.instId,{wins:0,losses:0,total:0});const e=m.get(t.instId);e.total++;(t.outcome==='WIN'||t.outcome==='TP1'||t.outcome==='TP2')?e.wins++:e.losses++;return m;},new Map())),time:new Date().toISOString()};
  saveState();
}


// Trade management
async function checkQMRTrades(instId,price,cHigh,cLow){
  const hi=cHigh||price,lo=cLow||price;
  for(let i=activeQMRTrades.length-1;i>=0;i--){
    const t=activeQMRTrades[i];if(t.instId!==instId)continue;
    const isB=t.type==='BULLISH';
    const duration=t.openTime?Math.round((Date.now()-t.openTime)/60000):null;

    // ---- PRIORITY ORDER: TP checks BEFORE SL so same-candle scenarios resolve correctly ----

    // 1. TP2 / full win
    if(t.tp1Fired&&!t.slFired&&(isB?hi>=t.tp2:lo<=t.tp2)){
      t.slFired=true;
      await tgQMRUpdate(t,'tp2');try{const[pt,pb]=pushTextFor('tp2',t);sendPushToTrackers(t.sigId,pt,pb,'tp2');}catch(e){}
      const winR=computeR(t,t.tp2);
      tradeHistory.push({instId:t.instId,type:t.type,tf:t.tf,outcome:'WIN',rMultiple:winR,time:new Date().toISOString(),duration});
      updateMemberStats(t.sigId,'WIN',winR);
      autoJournalEntry(t,'WIN',winR,duration);
      if(t.isElite&&winR>=2.5){t.rMultiple=winR;await tgTradeOfWeek(t);}
      dailyOutcomeLog.push({id:t.instId,name:t.instName,tf:t.tf,type:t.type,outcome:'WIN',time:new Date().toISOString()});
      lossStreak=0;winStreak++;
      if(winStreak===3)await tgSend('\uD83D\uDD25 3 wins in a row. System is performing. Stay disciplined.\n\u2014 The Slayers Model by Rexroz');
      markFeedOutcome(t.sigId,t.tp1Fired?'WIN':t.beFired?'BE':'SL');
      clearAggBanner(t.sigId);delete trackedTrades[t.sigId];activeQMRTrades.splice(i,1);saveState();continue;
    }

    // 2. TP1 hit — requires minimum 2 hours trade age to prevent immediate trigger
    if(!t.tp1Fired&&duration!==null&&duration>=120&&(isB?hi>=t.tp1:lo<=t.tp1)){
      t.tp1Fired=true;t.tp1Time=Date.now();t.openTime=t.openTime||t.tp1Time;
      // Move SL to entry + 0.3R buffer — protects profit while giving room to breathe
      var slDist=Math.abs(t.qmLevel-(t.origSL||t.sl));
      var buffer=slDist*0.3;
      if(isB){t.sl=t.qmLevel-buffer;}else{t.sl=t.qmLevel+buffer;}
      t.beFired=true;
      await tgQMRUpdate(t,'tp1');try{const[pt,pb]=pushTextFor('tp1',t);sendPushToTrackers(t.sigId,pt,pb,'tp1');}catch(e){}
      // Same-candle check: if this candle also touches buffer SL, close remainder immediately
      if(isB?lo<=t.sl:hi>=t.sl){
        t.slFired=true;
        await tgQMRUpdate(t,'be_close');try{const[pt,pb]=pushTextFor('be_close',t);sendPushToTrackers(t.sigId,pt,pb,'be_close');}catch(e){}
        const winR=computeR(t,t.tp1);
        tradeHistory.push({instId:t.instId,type:t.type,tf:t.tf,outcome:'WIN',rMultiple:winR,time:new Date().toISOString(),duration});
        updateMemberStats(t.sigId,'WIN',winR);
        autoJournalEntry(t,'WIN',winR,duration);
        if(t.isElite&&winR>=2.5){t.rMultiple=winR;await tgTradeOfWeek(t);}
        dailyOutcomeLog.push({id:t.instId,name:t.instName,tf:t.tf,type:t.type,outcome:'WIN',time:new Date().toISOString()});
        lossStreak=0;winStreak++;
        if(winStreak===3)await tgSend('\uD83D\uDD25 3 wins in a row. System is performing. Stay disciplined.\n\u2014 The Slayers Model by Rexroz');
        markFeedOutcome(t.sigId,'WIN');
        clearAggBanner(t.sigId);delete trackedTrades[t.sigId];activeQMRTrades.splice(i,1);saveState();continue;
      }
    }

    // 4. Auto-trailing stop (after TP1, dynamically move SL)
    if(t.tp1Fired&&!t.slFired){
      const slDist=Math.abs(t.qmLevel-(t.origSL||t.sl));
      if(!t.trailActive){
        // Not trailing yet — wait for price to move 1×SL beyond TP1
        const trailTrigger=isB?t.tp1+slDist:t.tp1-slDist;
        if(isB?price>=trailTrigger:price<=trailTrigger){
          t.trailActive=true;
          t.trailDist=slDist;
          t.bestPrice=price;
          await tgQMRUpdate(t,'trail');try{const[pt,pb]=pushTextFor('trail',t);sendPushToTrackers(t.sigId,pt,pb,'trail');}catch(e){}
        }
      } else {
        // Already trailing — update best price and tighten SL
        if(isB){
          if(price>t.bestPrice){
            t.bestPrice=price;
            const newSl=price-t.trailDist;
            if(newSl>t.sl){t.sl=newSl;}
          }
        } else {
          if(price<t.bestPrice){
            t.bestPrice=price;
            const newSl=price+t.trailDist;
            if(newSl<t.sl){t.sl=newSl;}
          }
        }
      }
    }

    // 5. TP1 expiry — auto-close if TP1 was hit >5 days ago but TP2 never reached
    if(t.tp1Fired&&!t.slFired){
      var tp1Age=t.tp1Time||t.openTime;
      if(tp1Age&&Date.now()-tp1Age>5*24*60*60*1000){
        t.slFired=true;
        var expiryR=computeR(t,t.tp1);
        await tgSend('\u23F3 TRADE AUTO-CLOSED\n'+'='.repeat(28)+'\n\uD83D\uDCCA '+t.instName+' | '+(t.type==='BULLISH'?'BUY':'SELL')+' '+t.tf+'\n\nTP1 was reached '+Math.round((Date.now()-tp1Age)/86400000)+' days ago but TP2 was not reached.\n\n\u2705 Auto-closing as WIN (+'+expiryR.toFixed(t.dec||1)+'R)\n\n\uD83D\uDCAC Members who haven\'t closed yet should consider exiting.\n\n\u2014 The Slayers Model by Rexroz');
        tradeHistory.push({instId:t.instId,type:t.type,tf:t.tf,outcome:'WIN',rMultiple:expiryR,time:new Date().toISOString(),duration:t.openTime?Math.round((Date.now()-t.openTime)/60000):null});
        updateMemberStats(t.sigId,'WIN',expiryR);
        autoJournalEntry(t,'WIN',expiryR,duration);
        dailyOutcomeLog.push({id:t.instId,name:t.instName,tf:t.tf,type:t.type,outcome:'WIN',time:new Date().toISOString()});
        lossStreak=0;winStreak++;
        if(winStreak===3)await tgSend('\uD83D\uDD25 3 wins in a row. System is performing. Stay disciplined.\n\u2014 The Slayers Model by Rexroz');
        markFeedOutcome(t.sigId,'WIN');
        clearAggBanner(t.sigId);delete trackedTrades[t.sigId];activeQMRTrades.splice(i,1);saveState();continue;
      }
    }

    // 6. SL / BE-close — checked LAST so TP1 always gets registered first
    // After BE/TP1, use close price (not wick) to avoid false triggers from brief wicks back to entry
    const slHit = t.beFired ? (isB ? price <= t.sl : price >= t.sl) : (isB ? lo <= t.sl : hi >= t.sl);
    if(!t.slFired&&slHit){
      // Grace period: right after BE fires, ignore stale candle range for one full candle
      // BUT only when TP1 has NOT yet fired — if TP1 already fired, return to entry is always legitimate
      if(!t.tp1Fired&&t.beFired&&t.beTime&&Date.now()-t.beTime<(t.tf==='4H'?4:1)*60*60*1000){
        log('BE grace: ignoring stale candle range on '+t.instId+' '+t.tf);continue;
      }
      t.slFired=true;
      if(t.tp1Fired){
        // TP1 was already banked — remainder hit buffer, record as TP1 achievement
        await tgQMRUpdate(t,'be_close');
        const winR=computeR(t,t.tp1);
        tradeHistory.push({instId:t.instId,type:t.type,tf:t.tf,outcome:'WIN',rMultiple:winR,time:new Date().toISOString(),duration});
        updateMemberStats(t.sigId,'WIN',winR);
        autoJournalEntry(t,'WIN',winR,duration);
        if(t.isElite&&winR>=2.5){t.rMultiple=winR;await tgTradeOfWeek(t);}
        dailyOutcomeLog.push({id:t.instId,name:t.instName,tf:t.tf,type:t.type,outcome:'WIN',time:new Date().toISOString()});
        lossStreak=0;winStreak++;
        if(winStreak===3)await tgSend('\uD83D\uDD25 3 wins in a row. System is performing. Stay disciplined.\n\u2014 The Slayers Model by Rexroz');
      } else if(t.beFired){
        // SL moved to entry and price returned — breakeven
        await tgQMRUpdate(t,'be_sl');try{const[pt,pb]=pushTextFor('be_sl',t);sendPushToTrackers(t.sigId,pt,pb,'be_sl');}catch(e){}
        tradeHistory.push({instId:t.instId,type:t.type,tf:t.tf,outcome:'BE',rMultiple:0,time:new Date().toISOString(),duration});
        updateMemberStats(t.sigId,'BE',0);
        autoJournalEntry(t,'BE',0,duration);
        dailyOutcomeLog.push({id:t.instId,name:t.instName,tf:t.tf,type:t.type,outcome:'BE',time:new Date().toISOString()});
      } else {
        // Clean stop loss — trade never reached BE
        await tgQMRUpdate(t,'sl');try{const[pt,pb]=pushTextFor('sl',t);sendPushToTrackers(t.sigId,pt,pb,'sl');}catch(e){}
        tradeHistory.push({instId:t.instId,type:t.type,tf:t.tf,outcome:'SL',rMultiple:-1,time:new Date().toISOString(),duration});
        updateMemberStats(t.sigId,'SL',-1);
        autoJournalEntry(t,'SL',-1,duration);
        dailyOutcomeLog.push({id:t.instId,name:t.instName,tf:t.tf,type:t.type,outcome:'SL',time:new Date().toISOString()});
        winStreak=0;lossStreak++;
        if(lossStreak>=2)await tgSend('\u26A0\uFE0F 2 consecutive losses. Review your risk. Reduce position size if needed.\n\u2014 The Slayers Model by Rexroz');
      }
      markFeedOutcome(t.sigId,t.tp1Fired?'WIN':t.beFired?'BE':'SL');
      clearAggBanner(t.sigId);delete trackedTrades[t.sigId];activeQMRTrades.splice(i,1);saveState();continue;
    }
  }
}
function checkScalpTrades(instId,cHigh,cLow){
  const hi=cHigh||0,lo=cLow||0;
  for(let i=activeScalpTrades.length-1;i>=0;i--){
    const t=activeScalpTrades[i];if(t.pair!==instId||t.closed)continue;
    const isB=t.type==='BULLISH';
    const slDist=Math.abs(t.entry-t.origSL);
    const didHitTP1=isB?hi>=t.tp1:lo<=t.tp1;
    const didHitTP2=isB?hi>=t.tp2:lo<=t.tp2;
    const didHitSL=isB?lo<=t.sl:hi>=t.sl;
    const didHitBE=isB?lo<=t.beLevel:hi>=t.beLevel;

    // TP1 → record +1R immediately, move SL to BE, keep remainder open
    if(!t.tp1Fired&&didHitTP1){
      t.tp1Fired=true;
      t.tp1Time=Date.now();
      t.sl=t.beLevel;
      const tp1R=slDist>0?Math.abs(t.tp1-t.entry)/slDist:1;
      const durMin=t.openTime?Math.round((Date.now()-t.openTime)/60000):null;
      scalpTradeHistory.push({pair:t.pair,type:t.type,outcome:'TP1',r:tp1R,entry:t.entry,sl:t.origSL,tp2:t.tp1,session:t.session,openTime:t.openTime,closeTime:Date.now()});
      saveState();
      log('Scalp TP1: '+t.pair+' '+t.type+' +'+tp1R.toFixed(2)+'R booked, SL moved to BE');
      try{scalpJournalEntry(t,'TP1',tp1R,durMin,[t.session,'Score '+t.score+'/5','TP1 booked']);}catch(e){}
      try{sendPushToTrackers(t.sigId,'\u2705 Scalp '+tp1R.toFixed(1)+'R Banked '+t.pair,t.name+' — TP1 hit, +'+tp1R.toFixed(2)+'R secured. Remainder running with BE SL.','scalp_tp1');}catch(e){}
      // Don't continue — check if TP2 also hit in same candle
    }

    // TP2 — remainder closes here
    if(!t.tp2Fired&&didHitTP2){
      t.tp2Fired=true;t.closed=true;
      const remR=slDist>0?Math.abs(t.tp2-t.tp1)/slDist:1;
      const durMin=t.openTime?Math.round((Date.now()-t.openTime)/60000):null;
      scalpTradeHistory.push({pair:t.pair,type:t.type,outcome:'WIN',r:remR,entry:t.tp1,sl:t.beLevel,tp2:t.tp2,session:t.session,openTime:t.tp1Fired?t.tp1Time||t.openTime:t.openTime,closeTime:Date.now(),remainder:true});
      activeScalpTrades.splice(i,1);saveState();
      log('Scalp WIN: '+t.pair+' '+t.type+' remainder +'+remR.toFixed(2)+'R (total '+(t.tp1Fired?1+remR:remR).toFixed(1)+'R)');
      try{scalpJournalEntry(t,'WIN',remR,durMin,[t.session,'Remainder']);}catch(e){}
      try{sendPushToTrackers(t.sigId,'\uD83D\uDCB0 Scalp Remainder TP2 '+t.pair,t.name+' — remainder hit TP2, +'+remR.toFixed(2)+'R.','scalp_tp2');}catch(e){}
      continue;
    }

    // BE after TP1 — remainder closes at BE
    if(t.tp1Fired&&!t.beFired&&didHitBE){
      t.beFired=true;t.closed=true;
      const durMin=t.openTime?Math.round((Date.now()-t.openTime)/60000):null;
      scalpTradeHistory.push({pair:t.pair,type:t.type,outcome:'BE',r:0,entry:t.tp1,sl:t.beLevel,tp2:t.tp2,session:t.session,openTime:t.tp1Fired?t.tp1Time||t.openTime:t.openTime,closeTime:Date.now(),remainder:true});
      activeScalpTrades.splice(i,1);saveState();
      log('Scalp BE: '+t.pair+' '+t.type+' remainder 0R (TP1 already banked at +1R)');
      try{scalpJournalEntry(t,'BE',0,durMin,[t.session,'TP1 secured','Remainder BE']);}catch(e){}
      try{sendPushToTrackers(t.sigId,'\u2705 Scalp Remainder BE '+t.pair,t.name+' — remainder closed at entry. TP1 already banked.','scalp_be');}catch(e){}
      continue;
    }

    // SL (only before TP1 fires — after TP1, SL=BE handled above)
    if(!t.tp1Fired&&!t.slFired&&didHitSL){
      t.slFired=true;t.closed=true;
      const rLoss=slDist>0?-1:-1;
      const durMin=t.openTime?Math.round((Date.now()-t.openTime)/60000):null;
      scalpTradeHistory.push({pair:t.pair,type:t.type,outcome:'LOSS',r:rLoss,entry:t.entry,sl:t.origSL,tp2:t.tp2,session:t.session,openTime:t.openTime,closeTime:Date.now()});
      activeScalpTrades.splice(i,1);saveState();
      log('Scalp LOSS: '+t.pair+' '+t.type+' '+rLoss.toFixed(1)+'R');
      try{scalpJournalEntry(t,'LOSS',rLoss,durMin,[t.session]);}catch(e){}
      try{sendPushToTrackers(t.sigId,'\u274C Scalp SL '+t.pair,t.name+' — stop loss hit, '+rLoss.toFixed(1)+'R.','scalp_sl');}catch(e){}
      continue;
    }

    // Expiry — auto-close after 4 hours
    if(!t.closed&&t.openTime&&Date.now()-t.openTime>4*60*60*1000){
      t.closed=true;
      const exitPrice=isB?lo:hi;
      const rExp=isB?(exitPrice-t.entry)/Math.abs(t.entry-t.origSL):(t.entry-exitPrice)/Math.abs(t.entry-t.origSL);
      const outcome=rExp>0?'WIN':rExp===0?'BE':'LOSS';
      const adjR=Math.round(rExp*100)/100;
      scalpTradeHistory.push({pair:t.pair,type:t.type,outcome,entry:t.entry,sl:t.origSL,tp2:t.tp2,session:t.session,openTime:t.openTime,closeTime:Date.now(),r:adjR,expired:true});
      const durMin=t.openTime?Math.round((Date.now()-t.openTime)/60000):null;
      activeScalpTrades.splice(i,1);saveState();
      log('Scalp EXPIRED: '+t.pair+' '+t.type+' R='+adjR.toFixed(2)+' (open >4h)');
      try{scalpJournalEntry(t,outcome,adjR,durMin,[t.session,'Expired']);}catch(e){}
      try{sendPushToTrackers(t.sigId,'\u23F0 Scalp Expired '+t.pair,t.name+' — auto-closed after 4h, '+adjR.toFixed(2)+'R.','scalp_expiry');}catch(e){}
    }
  }
}
function getScalpStats(){
  const hist=scalpTradeHistory||[];
  const wins=hist.filter(t=>t.outcome==='WIN'||t.outcome==='TP1').length;
  const losses=hist.filter(t=>t.outcome==='LOSS').length;
  const bes=hist.filter(t=>t.outcome==='BE').length;
  const totalR=hist.reduce((s,t)=>s+(t.r||0),0);
  const byPair={};
  for(const t of hist){
    if(!byPair[t.pair])byPair[t.pair]={wins:0,losses:0,bes:0,totalR:0};
    if(t.outcome==='WIN'||t.outcome==='TP1')byPair[t.pair].wins++;
    else if(t.outcome==='LOSS')byPair[t.pair].losses++;
    else if(t.outcome==='BE')byPair[t.pair].bes++;
    byPair[t.pair].totalR+=t.r||0;
  }
  const equity=[...hist].reduce((acc,t)=>{const last=acc.length?acc[acc.length-1].r:0;acc.push({t:new Date(t.closeTime).toISOString().slice(0,10),r:last+(t.r||0)});return acc;},[]);
  return{wins,losses,bes,total:wins+losses,winRate:(wins+losses?Math.round(wins/(wins+losses)*100):0),totalR:Math.round(totalR*100)/100,byPair,equity};
}

// When an aggressive trade closes, remove the pending banner on its card
function clearAggBanner(sigId){
  if(!sigId.endsWith('-agg'))return;
  var cardId=sigId.slice(0,-4);
  var card=appSignalFeed.find(function(s){return s.id===cardId&&s.dualEntry;});
  if(card&&!card.consEntry)card.aggResolved=true;
}
// Update per-member stats when a tracked trade closes
function updateMemberStats(sigId,outcome,rMultiple){
  const codes=trackedTrades[sigId];
  if(!codes||!codes.length)return;
  for(const code of codes){
    if(!memberStats[code])memberStats[code]={total:0,wins:0,losses:0,bes:0,totalR:0};
    memberStats[code].total++;
    memberStats[code].totalR+=rMultiple||0;
    if(outcome==='WIN'||outcome==='TP1'||outcome==='TP2')memberStats[code].wins++;
    else if(outcome==='SL')memberStats[code].losses++;
    else if(outcome==='BE')memberStats[code].bes++;
  }
}

// Auto-create journal entries for all members on every trade close
function autoJournalEntry(t,outcome,rMultiple,durationMin){
  const dir=t.type==='BULLISH'?'BUY':'SELL';
  const tf=t.tf==='1h'?'1H':t.tf==='4h'?'4H':t.tf.toUpperCase();
  const durStr=durationMin!=null?Math.floor(durationMin/60)+'h '+(durationMin%60)+'m':'';
  const flags=[];
  if(outcome==='WIN'||outcome==='TP2')flags.push('Perfect setup');
  if(outcome==='TP1')flags.push('Managed well');
  if(outcome==='BE')flags.push('Capital protected');
  if(rMultiple>3)flags.push('Home run');
  if(rMultiple<-1.5)flags.push('Wider SL needed');
  if(durationMin!=null&&durationMin<120&&(outcome==='SL'||outcome==='BE'))flags.push('Quick exit');
  const base={pair:t.instName||t.instId,direction:dir,tf:tf,outcome:outcome,rMultiple:rMultiple,duration:durStr,notes:'Auto-logged from bot trade',tags:[],reviewFlags:flags};
  for(const member of memberCodes){
    if(!member.code||member.code==='admin')continue;
    if(!member.journal)member.journal=[];
    member.journal.push({...base,id:Date.now().toString(36)+Math.random().toString(36).slice(2,6),createdAt:new Date().toISOString()});
  }
}
function scalpJournalEntry(t,outcome,rMultiple,durationMin,extraTags){
  const dir=t.type==='BULLISH'?'BUY':'SELL';
  const durStr=durationMin!=null?Math.floor(durationMin/60)+'h '+(durationMin%60)+'m':'';
  const flags=[];
  if(outcome==='WIN'||outcome==='TP2')flags.push('Perfect setup');
  if(outcome==='TP1')flags.push('Managed well');
  if(outcome==='BE')flags.push('Capital protected');
  if(rMultiple>3)flags.push('Home run');
  if(rMultiple<-1.5)flags.push('Wider SL needed');
  if(durationMin!=null&&durationMin<120&&(outcome==='LOSS'||outcome==='BE'))flags.push('Quick exit');
  if(outcome==='LOSS'&&t.expired)flags.push('Expired');
  const pairName=t.name||t.pair;
  const base={pair:pairName,direction:dir,tf:'SCALP',outcome:outcome,rMultiple:rMultiple,duration:durStr,notes:'Auto-logged from scalp trade',tags:extraTags||[],reviewFlags:flags,system:'scalp'};
  for(const member of memberCodes){
    if(!member.code||member.code==='admin')continue;
    if(!member.journal)member.journal=[];
    member.journal.push({...base,id:Date.now().toString(36)+Math.random().toString(36).slice(2,6),createdAt:new Date().toISOString()});
  }
}

// Mark a signal in the app feed as closed so EOD cleanup can remove it
function markFeedOutcome(sigId, outcome){
  const baseId=sigId.replace(/-(agg|cons)$/,'');
  const entry=appSignalFeed.find(s=>s.id===baseId);
  if(entry){entry.outcome=outcome;entry.closedAt=new Date().toISOString();}
}

// Main scan
async function runScan(manual=false){
  if(!API_KEY){log('Scan skipped — TWELVEDATA_API_KEY not set');return;}
  const sess=getSess(),doW=manual||scanCount%WEEKLY_EVERY===0;
  log(`Scan #${scanCount} | Session: ${sess} | Weekend: ${isWeekend()}`);
  const briefingData={};
  if(Date.now()-lastNewsFetch>15*60*1000){await fetchNewsEvents();}
  if(Date.now()-lastNewsFeedFetch>15*60*1000){await fetchNewsFeed();}
  const now=new Date(),h=now.getUTCHours(),m=now.getUTCMinutes(),today=now.toUTCString().slice(0,16),dow=now.getUTCDay();
  if(!isWeekend()&&h===7&&m<30&&lastBriefing!==today){lastBriefing=today;await sendDailyBriefing();await tgMorningMessage();}
  if(!isWeekend()&&h===22&&m<30&&lastEOD!==today){
    lastEOD=today;
    // Remove closed QMR trades + all CRT signals (CRT is a daily setup, only relevant for that day)
    const before=appSignalFeed.length;
    const cutoff=new Date();cutoff.setUTCHours(0,0,0,0); // start of today UTC
    appSignalFeed=appSignalFeed.filter(s=>{
      if(s.outcome)return false; // QMR trade that closed (SL/TP/BE)
      if(s.system==='CRT'&&new Date(s.time)<cutoff)return false; // CRT from a previous day
      return true; // keep active QMR trades
    });
    if(before!==appSignalFeed.length)log(`EOD feed cleanup: removed ${before-appSignalFeed.length} signals, ${appSignalFeed.length} active remain`);
    saveState();
    await tgEODSummary();await tgEveningMessage();
  }
  const thisWeek=now.toISOString().slice(0,10);
  if(dow===0&&h===20&&m<30&&lastWeeklySummary!==thisWeek){lastWeeklySummary=thisWeek;await tgWeeklySummary();}
  const tomorrow=new Date(now.getTime()+864e5);
  const isLastDayOfMonth=tomorrow.getUTCMonth()!==now.getUTCMonth();
  const thisMonth=now.toISOString().slice(0,7);
  if(isLastDayOfMonth&&h===22&&m<30&&lastMonthlyRecap!==thisMonth){lastMonthlyRecap=thisMonth;await tgMonthlyRecap();}

  // Daily data fetch for BTC & XAU (keep dailyCache + weeklyCache for QMR features, no CRT alerting)
  const biasFlips=[]; // collect all bias flips this scan, send ONE bundled message at the end
  for(const inst of CRT_INSTS){
    if(doW){
      try{
        const wr=await fetch(`https://api.twelvedata.com/time_series?symbol=${encodeURIComponent(inst.sym)}&interval=1week&outputsize=20&apikey=${API_KEY}`);
        const wj=await wr.json();
        if(wj.status!=='error'){
          const wc=parseC(wj),newBias=getWBias(wc),oldBias=weeklyCache[inst.id]?.bias;
          if(!manual&&oldBias&&oldBias!=='NEUTRAL'&&newBias!=='NEUTRAL'&&oldBias!==newBias){log(`BIAS FLIP: ${inst.id} ${oldBias}->${newBias}`);biasFlips.push({id:inst.id,old:oldBias,new:newBias});}
          prevWeeklyCache[inst.id]=weeklyCache[inst.id];weeklyCache[inst.id]={bias:newBias,lvls:getWLvls(wc)};
        }
        await sleep(DELAY_MS);
      }catch(e){log('Weekly '+inst.id+': '+e.message);}
    }
    try{
      const res=await fetch(`https://api.twelvedata.com/time_series?symbol=${encodeURIComponent(inst.sym)}&interval=1day&outputsize=100&apikey=${API_KEY}`);
      const json=await res.json();if(json.status==='error'){await sleep(DELAY_MS);continue;}
      const c=parseC(json);if(c.length<10){await sleep(DELAY_MS);continue;}
      briefingData[inst.id]={price:fmtN(c[c.length-1].close,inst.dec)};
      dailyCache[inst.id]={c,ts:Date.now()};
      await sleep(DELAY_MS);
    }catch(e){log('Daily '+inst.id+': '+e.message);await sleep(DELAY_MS);}
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
          if(!manual&&oldBias&&oldBias!=='NEUTRAL'&&newBias!=='NEUTRAL'&&oldBias!==newBias){
            log(`BIAS FLIP: ${inst.id} ${oldBias}->${newBias}`);
            biasFlips.push({id:inst.id,old:oldBias,new:newBias});
          }
          prevWeeklyCache[inst.id]=weeklyCache[inst.id];
          weeklyCache[inst.id]={bias:newBias,lvls:getWLvls(wc)};
        }
        await sleep(DELAY_MS);
      }catch(e){log('Weekly QMR '+inst.id+': '+e.message);}
    }
    // Send ONE bundled message for all bias flips this scan
    await tgBiasFlipBundle(biasFlips);
  }

  // QMR scan — per-pair session aware
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
      if(!manual&&!isPairInSession(inst.id)){log('QMR scan skipped for '+inst.id+' (outside pair session)');continue;}
      for(const tf of QMR_TFS){
        try{
          const res=await fetch(`https://api.twelvedata.com/time_series?symbol=${encodeURIComponent(inst.sym)}&interval=${tf}&outputsize=100&apikey=${API_KEY}`);
          const json=await res.json();if(json.status==='error'){log('QMR: TwelveData API error for '+inst.id+' '+tf+': '+(json.message||json.status));await sleep(DELAY_MS);continue;}
          const c=parseC(json);if(c.length<25){log('QMR: insufficient data for '+inst.id+' '+tf+' ('+c.length+' candles)');await sleep(DELAY_MS);continue;}
          const lastC=c[c.length-1],prevC=c.length>=2?c[c.length-2]:lastC;
          // Check both current forming candle AND previous closed candle to catch wicks between scans
          const scanHigh=Math.max(lastC.high,prevC.high),scanLow=Math.min(lastC.low,prevC.low);
          await checkQMRTrades(inst.id,lastC.close,scanHigh,scanLow);
          // Pre-calculate ADR for TP1 capping and ADR gap filter
          const adrQ=calcADR(c,14),todayRngQ=getTodayRange(c),adrPctQ=adrQ>0?Math.round((todayRngQ/adrQ)*100):0;
          const instObj=QMR_INSTS.find(x=>x.id===inst.id)||{dec:5,name:inst.id};
          if(inst.id==='GBPUSD')continue; // removed: 17% win rate over 90-day backtest
          const qmrs=detectQMR(c);
          for(const qmr of qmrs){
            qmr.drawOnLiquidity=findDrawOnLiquidity(c,qmr.type,qmr.qmLevel,qmr.atr);
            const sl_q=qmr.retestSL!=null?qmr.retestSL:(qmr.type==='BULLISH'?qmr.head-qmr.atr*0.1:qmr.head+qmr.atr*0.1),slD_q=Math.abs(qmr.qmLevel-sl_q);
            // ADR-capped TP1: respect draw on liquidity if found, otherwise cap at min(3x SL, 50% of ADR)
            const rawTp1=qmr.drawOnLiquidity?qmr.drawOnLiquidity.price:(qmr.type==='BULLISH'?qmr.qmLevel+slD_q*3:qmr.qmLevel-slD_q*3);
            const tp1_q=adrQ>0?(qmr.type==='BULLISH'?Math.min(rawTp1,qmr.qmLevel+adrQ*0.5):Math.max(rawTp1,qmr.qmLevel-adrQ*0.5)):rawTp1;
            // For 1H signals: try refined entry first (zero extra API cost) so the RR gate reflects the actual trade quality
            let earlyRefined=null;
            if(tf==='1h'){earlyRefined=refine1HEntry(c,qmr.type,qmr.qmLevel,sl_q);}
            const entryForRR=earlyRefined?earlyRefined.price:qmr.qmLevel;
            const slDistForRR=Math.abs(entryForRR-sl_q);
            const rr1_q=slDistForRR>0?Math.abs(tp1_q-entryForRR)/slDistForRR:0;
            if(rr1_q<MIN_RR){log('QMR suppressed (weak TP1 reward '+rr1_q.toFixed(2)+'R from '+(earlyRefined?'refined':'zone')+' entry): '+inst.id+' '+qmr.type);continue;}
            qmr.structuralTP2=slD_q>0?findStructuralTP2(c,qmr.type,qmr.qmLevel,slD_q,tp1_q):null;
            // Cap structural TP2 at 2.5R — prevents TP2 being too far if structure is beyond 2.5R
            if(qmr.structuralTP2){
              const maxTP2Price=qmr.type==='BULLISH'?qmr.qmLevel+slD_q*2.5:qmr.qmLevel-slD_q*2.5;
              const isOver=qmr.type==='BULLISH'?qmr.structuralTP2.price>maxTP2Price:qmr.structuralTP2.price<maxTP2Price;
              if(isOver){qmr.structuralTP2.price=maxTP2Price;qmr.structuralTP2.rr='2.5';}
            }
            if(isWeekend()&&inst.id!=='BTCUSD')continue;
            if(tf==='1h'&&!inKillzone(inst.id)){log('QMR outside killzone (alerting with session warning): '+inst.id+' '+qmr.type);}
            if(tf==='4h'&&!isPairInSession(inst.id)){log('QMR 4H suppressed (pair not in session): '+inst.id+' '+qmr.type);continue;}
            if(isLevelAlreadySeen(inst.id,qmr.type,qmr.qmLevel,'CONSERVATIVE'))continue;
            if(isNewsBlocked(inst.id)){log(`QMR BLOCKED (news): ${inst.id} ${tf}`);continue;}
            const key=inst.id+'-'+qmr.type+'-CONSERVATIVE-'+Date.now()+'-'+qmr.qmLevel.toFixed(3);
            if(!qmrSeen.has(key)){
              // Auto-suppressed pairs due to poor performance
              if(suppressedPairs.has(inst.id)){
                log('QMR suppressed (pair underperforming): '+inst.id+' '+qmr.type);
                continue;
              }
              const qmrTF=tf==='1h'?'1H':'4H',htfBias=weeklyCache[inst.id]?.bias||'NEUTRAL';
              // instObj already defined above
              const dailyPOI=checkDailyPOI(inst.id,qmr.type,qmr.qmLevel);
              if(dailyPOI)qmr.dailyPOI=dailyPOI;
              // ICT-style multi-TF fib confluence scoring
              const wLvls=weeklyCache[inst.id]?.lvls;
              const dce=dailyCache[inst.id];
              const dLvls=dce&&dce.c&&dce.c.length>10?getWLvls(dce.c):null;
              const fibConfluence=calcFibConfluence(qmr.qmLevel,qmr.type,wLvls,dLvls);
              let fibZone=fibConfluence.zones;
              let fibScore=fibConfluence.score;
              if(fibScore>0){
                for(const lbl of fibConfluence.labels){
                  qmr.criteria.factors.push(lbl+' '+(qmr.type==='BULLISH'?'Discount':'Premium'));
                }
                if(fibScore>=2)qmr.criteria.score+=Math.min(Math.floor(fibScore),3);
                if(fibScore>=4)qmr.criteria.factors.push('STRONG FIB CONFLUENCE');
              }
              qmr.fibZone=fibZone;
              qmr.fibScore=fibScore;
              const counterTrend=htfBias!=='NEUTRAL'&&qmr.type!==htfBias;
              if(counterTrend){
                const dTrend=getDailyTrend(inst.id),dFlip=dTrend!=='RANGING'&&dTrend===qmr.type;
                if(qmr.criteria.score<4){log('QMR suppressed (counter-trend needs 4/4, has '+qmr.criteria.score+'/4): '+inst.id+' '+qmrTF+' '+qmr.type);continue;}
                qmr.counterTrend=true;
              }
              // RSI divergence check on 4H (zero API cost — uses existing candle data)
              const h4c=tf==='1h'?build4HFrom1H(c):c;
              const div=checkRSIDivergence(h4c,qmr.type);
              if(div)qmr.rsiDivergence=div;
              const STRICT_PAIRS=['EURGBP','USDJPY'];
              if(STRICT_PAIRS.includes(inst.id)&&qmr.criteria.score<4){
                log('QMR suppressed (strict pair requires 4/4, has '+qmr.criteria.score+'/4): '+inst.id+' '+qmrTF+' '+qmr.type);
                continue;
              }
              // Multi-TF bonus: 1H signals need 4/4 if no 4H alignment exists for this direction
              if(qmrTF==='1H'){
                const cached4HCheck=qmr4HCache[inst.id];
                const has4HAlignment=cached4HCheck&&cached4HCheck.qmr.type===qmr.type&&(Date.now()-cached4HCheck.time)<24*60*60*1000;
                if(!has4HAlignment&&qmr.criteria.score<4){
                  log('QMR suppressed (1H without 4H alignment needs 4/4, has '+qmr.criteria.score+'/4): '+inst.id+' '+qmr.type);
                  continue;
                }
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
              // HTF entry refinement: 4H signals get a precise 1H entry inside the zone
              let refinedEntry=null;
              if(qmrTF==='4H'){
                refinedEntry=await refine4HEntry(inst,qmr.type,qmr.qmLevel,sl_q);
                if(refinedEntry){qmr.refinedEntry=refinedEntry;log('4H refined entry '+inst.id+': '+refinedEntry.price.toFixed(instObj.dec)+' ('+refinedEntry.source+')');}
              } else if(qmrTF==='1H'){
                refinedEntry=earlyRefined||refine1HEntry(c,qmr.type,qmr.qmLevel,sl_q);
                if(refinedEntry){qmr.refinedEntry=refinedEntry;log('1H refined entry '+inst.id+': '+refinedEntry.price.toFixed(instObj.dec)+' ('+refinedEntry.source+')');}
              }
              if(qmrTF==='4H')qmr4HCache[inst.id]={qmr,time:Date.now()};
              const cached4H=qmr4HCache[inst.id],multiTF=qmrTF==='1H'&&cached4H&&cached4H.qmr.type===qmr.type&&(Date.now()-cached4H.time)<24*60*60*1000;
              const sessWarn=!isPairInSession(inst.id);
              // ADR context — informational only, never blocks a valid setup
              // If range is extended today, note that TP may take 1-2 sessions
              const adrWarn=adrPctQ>=80?adrPctQ:null;
              if(adrWarn)log(`ADR context: ${inst.id} ${adrPctQ}% daily range consumed`);
              // ADR gap filter: suppress if TP1 is unreachable (>120% of ADR)
              const tp1Dist=Math.abs(tp1_q-qmr.qmLevel);
              if(adrQ>0&&tp1Dist>adrQ*1.2){
                log(`QMR suppressed (TP1 ${tp1Dist.toFixed(1)}pts > ADR×1.2 = ${(adrQ*1.2).toFixed(1)}pts): ${inst.id} ${qmrTF} ${qmr.type}`);
                continue;
              }
              log(`QMR: ${inst.id} ${qmrTF} ${qmr.type} ${qmr.qmLevel} HTF:${htfBias}${multiTF?' [MULTI-TF]':''}${adrWarn?' ADR:'+adrWarn+'%':''}`);
              if(multiTF){await tgMultiTFConfluence(inst.id,qmr,cached4H.qmr);}
              else{await tgQMR(inst.id,qmrTF,qmr,htfBias,sessWarn,adrWarn);}
              // Correlation warning: check if any active trade conflicts with this signal
              const corrConflicts=checkCorrelationConflict(inst.id,qmr.type);
              if(corrConflicts.length){
                await tgSend('\u26A0\uFE0F CORRELATION WARNING: '+inst.id+'\n'+'='.repeat(28)+'\n\nThis '+qmrTF+' '+(qmr.type==='BULLISH'?'BUY':'SELL')+' signal conflicts with:\n'+corrConflicts.map(c=>'\u274C '+c).join('\n')+'\n\nBe careful with double-direction exposure on correlated pairs.\n\u2014 The Slayers Model by Rexroz');
              }
              const isB2=qmr.type==='BULLISH',entry2=qmr.qmLevel,sl2=sl_q,slDist2=slD_q,tp2_2=qmr.structuralTP2?qmr.structuralTP2.price:(isB2?entry2+slDist2*2.5:entry2-slDist2*2.5);
              const sigId='qmr-'+(++chartCounter)+'-'+Date.now();
              const chartFile=await tgSendChart(inst.id,qmrTF==='1H'?'1h':'4h',[
                {price:entry2,text:'ENTRY',color:'rgb(38,166,154)'},
                {price:sl2,text:'SL',color:'rgb(244,67,54)'},
                {price:tp2_2,text:'TP2',color:'rgb(245,166,35)'}
              ],(qmr.type==='BULLISH'?'\uD83D\uDFE2 BUY':'\uD83D\uDD34 SELL')+' '+inst.id+' \u00B7 '+qmrTF+' QMR\nEntry '+entry2.toFixed(instObj.dec)+' | SL '+sl2.toFixed(instObj.dec)+' | TP2 '+tp2_2.toFixed(instObj.dec)+'\n\u2014 The Slayers Model by Rexroz',sigId);
              // Check if a dual card already exists for this setup (from pre-alert)
              const eKey=inst.id+'-'+qmr.type+'-'+qmr.qmLevel.toFixed(3);
              const earlyData=earlyEntryCache[eKey];
              if(earlyData){
                // Update existing dual card with conservative entry
                const existingCard=appSignalFeed.find(s=>s.id===earlyData.aggTradeId.slice(0,-4));
                // If aggressive already resolved, don't link — treat conservative as standalone
                if(existingCard&&existingCard.aggResolved){
                  appSignalFeed.unshift({id:sigId,system:'QMR',pair:inst.id,tf:qmrTF,type:qmr.type,zone:isB2?'DISCOUNT':'PREMIUM',entry:entry2,refinedEntry:qmr.refinedEntry?qmr.refinedEntry.price:null,refinedSource:qmr.refinedEntry?qmr.refinedEntry.source:null,sl:sl2,tp1:tp1_q,tp2:tp2_2,tier:qmr.criteria.score>=4?'ELITE':'VALID',criteria:qmr.criteria.factors,score:qmr.criteria.score,dailyPOI:qmr.dailyPOI||null,rsiDivergence:qmr.rsiDivergence||null,counterTrend:qmr.counterTrend||false,htfBias:htfBias,dec:instObj.dec,chartFile:chartFile,time:new Date().toISOString()});
                  activeQMRTrades.push({sigId:sigId,instId:inst.id,instName:instObj.name,tf:qmrTF,type:qmr.type,qmLevel:entry2,sl:sl2,tp1:tp1_q,tp2:tp2_2,beLevel:isB2?entry2+slDist2*1.3:entry2-slDist2*1.3,origSL:sl2,isElite:qmr.criteria.score>=4,eliteFactors:qmr.criteria.factors,dailyPOI:qmr.dailyPOI||null,dec:instObj.dec,beFired:false,tp1Fired:false,tp2Fired:false,slFired:false,trailActive:false,openTime:Date.now()});
                  delete earlyEntryCache[eKey];
                  log('QMR standalone (agg was resolved): '+inst.id+' '+qmrTF+' '+qmr.type+' cons='+entry2.toFixed(instObj.dec));
                } else if(existingCard){
                  existingCard.consEntry=entry2;existingCard.consSl=sl2;existingCard.consTp1=tp1_q;existingCard.consTp2=tp2_2;
                  existingCard.consChartFile=chartFile;existingCard.refinedEntry=qmr.refinedEntry?qmr.refinedEntry.price:null;existingCard.refinedSource=qmr.refinedEntry?qmr.refinedEntry.source:null;
                  existingCard.dailyPOI=qmr.dailyPOI||null;existingCard.rsiDivergence=qmr.rsiDivergence||null;existingCard.counterTrend=qmr.counterTrend||false;
                  existingCard.aggChartFile=earlyData.aggChartFile;
                  activeQMRTrades.push({sigId:earlyData.aggTradeId.replace('-agg','-cons'),instId:inst.id,instName:instObj.name,tf:qmrTF,type:qmr.type,qmLevel:entry2,sl:sl2,tp1:tp1_q,tp2:tp2_2,beLevel:isB2?entry2+slDist2*1.3:entry2-slDist2*1.3,origSL:sl2,isElite:qmr.criteria.score>=4,eliteFactors:qmr.criteria.factors,dailyPOI:qmr.dailyPOI||null,dec:instObj.dec,beFired:false,tp1Fired:false,tp2Fired:false,slFired:false,trailActive:false,openTime:Date.now(),entryType:'conservative'});
                  delete earlyEntryCache[eKey];
                  log('QMR dual card updated with conservative: '+inst.id+' '+qmrTF+' '+qmr.type+' cons='+entry2.toFixed(instObj.dec));
                } else {
                  // Card not found (shouldn't happen), create standalone
                  appSignalFeed.unshift({id:sigId,system:'QMR',pair:inst.id,tf:qmrTF,type:qmr.type,zone:isB2?'DISCOUNT':'PREMIUM',entry:entry2,refinedEntry:qmr.refinedEntry?qmr.refinedEntry.price:null,refinedSource:qmr.refinedEntry?qmr.refinedEntry.source:null,sl:sl2,tp1:tp1_q,tp2:tp2_2,tier:qmr.criteria.score>=4?'ELITE':'VALID',criteria:qmr.criteria.factors,score:qmr.criteria.score,dailyPOI:qmr.dailyPOI||null,rsiDivergence:qmr.rsiDivergence||null,counterTrend:qmr.counterTrend||false,htfBias:htfBias,dec:instObj.dec,chartFile:chartFile,time:new Date().toISOString()});
                  activeQMRTrades.push({sigId:sigId,instId:inst.id,instName:instObj.name,tf:qmrTF,type:qmr.type,qmLevel:entry2,sl:sl2,tp1:tp1_q,tp2:tp2_2,beLevel:isB2?entry2+slDist2*1.3:entry2-slDist2*1.3,origSL:sl2,isElite:qmr.criteria.score>=4,eliteFactors:qmr.criteria.factors,dailyPOI:qmr.dailyPOI||null,dec:instObj.dec,beFired:false,tp1Fired:false,tp2Fired:false,slFired:false,trailActive:false,openTime:Date.now()});
                }
              } else {
                // No pre-alert — standalone signal as before
                appSignalFeed.unshift({id:sigId,system:'QMR',pair:inst.id,tf:qmrTF,type:qmr.type,zone:isB2?'DISCOUNT':'PREMIUM',entry:entry2,refinedEntry:qmr.refinedEntry?qmr.refinedEntry.price:null,refinedSource:qmr.refinedEntry?qmr.refinedEntry.source:null,sl:sl2,tp1:tp1_q,tp2:tp2_2,tier:qmr.criteria.score>=4?'ELITE':'VALID',criteria:qmr.criteria.factors,score:qmr.criteria.score,dailyPOI:qmr.dailyPOI||null,rsiDivergence:qmr.rsiDivergence||null,counterTrend:qmr.counterTrend||false,htfBias:htfBias,dec:instObj.dec,chartFile:chartFile,time:new Date().toISOString()});
                activeQMRTrades.push({sigId:sigId,instId:inst.id,instName:instObj.name,tf:qmrTF,type:qmr.type,qmLevel:entry2,sl:sl2,tp1:tp1_q,tp2:tp2_2,beLevel:isB2?entry2+slDist2*1.3:entry2-slDist2*1.3,origSL:sl2,isElite:qmr.criteria.score>=4,eliteFactors:qmr.criteria.factors,dailyPOI:qmr.dailyPOI||null,dec:instObj.dec,beFired:false,tp1Fired:false,tp2Fired:false,slFired:false,trailActive:false,openTime:Date.now()});
              }
              appSignalFeed=appSignalFeed.slice(0,50);saveState();
              try{
                sendPushToAll(
                  (qmr.type==='BULLISH'?'\uD83D\uDFE2 BUY':'\uD83D\uDD34 SELL')+' '+inst.id,
                  qmrTF+' QMR \u2014 '+(qmr.criteria.score>=4?'ELITE':'VALID')+' setup at '+entry2.toFixed(instObj.dec),
                  '/'
                );
              }catch(pushErr){log('Push notify skipped (non-fatal): '+pushErr.message);}
              alertLog.unshift({type:'QMR',id:inst.id,tf:qmrTF,dir:qmr.type,score:qmr.criteria.score,time:new Date().toISOString()});
              dailyAlertLog.push({type:'QMR',id:inst.id,tf:qmrTF,dir:qmr.type,score:qmr.criteria.score,time:new Date().toISOString()});
              if(alertLog.length>20)alertLog.pop();
            }
          }
          // Early QMR detection (aggressive entry at sweep close) — 1H only
          if(tf==='1h'){
            const earlyQmrs=detectQMREarly(c);
            for(const eQ of earlyQmrs){
              if(isLevelAlreadySeen(inst.id,eQ.type,eQ.qmLevel,'AGG'))continue;
              if(isWeekend()&&inst.id!=='BTCUSD')continue;
              if(!inKillzone(inst.id)){log('QMR Early outside killzone: '+inst.id+' '+eQ.type);}
              if(isNewsBlocked(inst.id)){log('QMR Early blocked (news): '+inst.id);continue;}
              const eKey=inst.id+'-'+eQ.type+'-AGG-'+Date.now()+'-'+eQ.qmLevel.toFixed(3);
              if(qmrSeen.has(eKey))continue;
              if(suppressedPairs.has(inst.id)){log('QMR Early suppressed (pair underperforming): '+inst.id+' '+eQ.type);continue;}
              const htfBias=weeklyCache[inst.id]?.bias||'NEUTRAL';
              log('QMR EARLY: '+inst.id+' 1H '+eQ.type+' sweep@'+eQ.entryPrice.toFixed(instObj.dec)+' QM@'+eQ.qmLevel.toFixed(instObj.dec));
              qmrSeen.add(eKey);
              await tgQMRPreAlert(inst.id,'1H',eQ,htfBias,eQ.entryPrice,eQ.wickRatio,eQ.retestSL,eQ.tp1,eQ.tp2);
              // Single card — created at pre-alert, updated when conservative fires
              const eSigId='qmr-'+(++chartCounter)+'-'+Date.now();
              const aggTradeId=eSigId+'-agg',eIsB=eQ.type==='BULLISH',eSlDist=Math.abs(eQ.entryPrice-eQ.retestSL);
              activeQMRTrades.push({sigId:aggTradeId,instId:inst.id,instName:instObj.name,tf:'1H',type:eQ.type,qmLevel:eQ.entryPrice,sl:eQ.retestSL,tp1:eQ.tp1,tp2:eQ.tp2,beLevel:eIsB?eQ.entryPrice+eSlDist*1.3:eQ.entryPrice-eSlDist*1.3,origSL:eQ.retestSL,isElite:eQ.criteria.score>=4,eliteFactors:eQ.criteria.factors,dailyPOI:null,dec:instObj.dec,beFired:false,tp1Fired:false,tp2Fired:false,slFired:false,trailActive:false,openTime:Date.now(),entryType:'aggressive'});
              const eChartFile=await tgSendChart(inst.id,'1h',[
                {price:eQ.entryPrice,text:'AGGR ENTRY',color:'rgb(38,166,154)'},
                {price:eQ.retestSL,text:'SL',color:'rgb(244,67,54)'},
                {price:eQ.tp2,text:'TP2',color:'rgb(245,166,35)'}
              ],'\u26A1 EARLY '+(eQ.type==='BULLISH'?'BUY':'SELL')+' '+inst.id+' 1H QMR\nAggressive: '+eQ.entryPrice.toFixed(instObj.dec)+' | SL: '+eQ.retestSL.toFixed(instObj.dec)+' | TP2: '+eQ.tp2.toFixed(instObj.dec)+'\n\u2014 The Slayers Model by Rexroz',eSigId+'-agg');
              // Cache for conservative update
              earlyEntryCache[inst.id+'-'+eQ.type+'-'+eQ.qmLevel.toFixed(3)]={aggEntry:eQ.entryPrice,aggSl:eQ.retestSL,aggTp1:eQ.tp1,aggTp2:eQ.tp2,aggChartFile:eSigId+'-agg',aggTradeId,criteria:eQ.criteria};
              appSignalFeed.unshift({
                id:eSigId,system:'QMR',pair:inst.id,tf:'1H',type:eQ.type,
                zone:eIsB?'DISCOUNT':'PREMIUM',
                aggEntry:eQ.entryPrice,aggSl:eQ.retestSL,aggTp1:eQ.tp1,aggTp2:eQ.tp2,
                consEntry:null,consSl:null,consTp1:null,consTp2:null,
                tier:eQ.criteria.score>=4?'ELITE':'VALID',
                criteria:eQ.criteria.factors,score:eQ.criteria.score,
                dailyPOI:null,rsiDivergence:null,counterTrend:false,htfBias:htfBias,
                dec:instObj.dec,chartFile:eChartFile,time:new Date().toISOString(),
                dualEntry:true,qmLevel:eQ.qmLevel
              });
              log('QMR dual card created: '+inst.id+' 1H '+eQ.type+' agg='+eQ.entryPrice.toFixed(instObj.dec)+' qm='+eQ.qmLevel.toFixed(instObj.dec));
            }
          }
          await sleep(DELAY_MS);
        }catch(e){log('QMR '+inst.id+' '+tf+': '+e.message);await sleep(DELAY_MS);}
      }
    }
  }
  // Aggressive qmrSeen cleanup — drop entries older than 72h, keep max 50 most recent
  if(qmrSeen.size){
    var qmrNow=Date.now(),qmrArr=[...qmrSeen];
    qmrArr=qmrArr.filter(function(k){var parts=k.split('-');if(parts.length<4)return false;var ts=parseFloat(parts.length>=5?parts[3]:parts[2]);return qmrNow-ts<=72*60*60*1000;});
    if(qmrArr.length>50)qmrArr=qmrArr.slice(-50);
    qmrSeen=new Set(qmrArr);
  }
  for(const k in recentQMRFires)if(Date.now()-recentQMRFires[k]>24*60*60*1000)delete recentQMRFires[k];
  // Scalp scan — session momentum + FVG 5M, London/NY only
  if(!isWeekend()){
    const sh=new Date().getUTCHours();
    const inLondon=(sh===7)||(sh>7&&sh<10)||(sh===10);
    const inNY=(sh===13)||(sh>13&&sh<16)||(sh===16);
    if(inLondon||inNY){
      for(const inst of SCALP_INSTS){
        try{
          const sres=await fetch(`https://api.twelvedata.com/time_series?symbol=${encodeURIComponent(inst.sym)}&interval=5min&outputsize=100&apikey=${API_KEY}`);
          const sj=await sres.json();
          if(sj.status==='error'){await sleep(DELAY_MS);continue;}
          const sc=parseC(sj);if(sc.length<25){await sleep(DELAY_MS);continue;}
          const signal=detectScalp(sc,inst.id);
          if(signal){
            const sKey=inst.id+'-'+signal.type+'-'+signal.session;
            if(!scalpSeen.has(sKey)){
              scalpSeen.add(sKey);
              const chartFile=await genScalpChart(inst.id,'5min',[
                {price:signal.entry,text:'Entry',color:'#3B82F6'},
                {price:signal.sl,text:'SL',color:'#EF4444'},
                {price:signal.tp2,text:'TP2',color:'#A3E635'}
              ],'scalp_'+inst.id+'_'+Date.now());
              scalpSignals.unshift({
                id:'SCALP-'+inst.id+'-'+Date.now(),
                pair:inst.id,name:inst.name,type:signal.type,
                entry:signal.entry,sl:signal.sl,tp2:signal.tp2,
                session:signal.session,score:signal.score,rr:signal.rr,
                fib:signal.fib,fibPct:signal.fibPct,
                rangeHigh:signal.rangeHigh,rangeLow:signal.rangeLow,
                fvgTop:signal.fvgTop,fvgBottom:signal.fvgBottom,
                volRatio:signal.volRatio,
                chartFile,time:new Date().toISOString()
              });
              if(scalpSignals.length>50)scalpSignals=scalpSignals.slice(0,50);
              const slDist=Math.abs(signal.entry-signal.sl);
              const tp1Price=signal.type==='BULLISH'?signal.entry+slDist:signal.entry-slDist;
              activeScalpTrades.push({sigId:'SCALP-'+inst.id+'-'+Date.now(),pair:inst.id,name:inst.name,type:signal.type,entry:signal.entry,sl:signal.sl,tp2:signal.tp2,tp1:tp1Price,beLevel:signal.entry,origSL:signal.sl,session:signal.session,score:signal.score,openTime:Date.now(),closed:false,tp1Fired:false,beFired:false,tp2Fired:false,slFired:false});
              try{sendScalpPushToAll(
                (signal.type==='BULLISH'?'\uD83D\uDFE2 BUY':'\uD83D\uDD34 SELL')+' '+inst.id,
                'Scalp '+(signal.type==='BULLISH'?'BUY':'SELL')+' \u2014 '+signal.session+' breakout \u2014 \uD83D\uDCA5Score '+signal.score+'/5 \u2014 RR '+signal.rr,
                '/'
              );}catch(pushErr){log('Scalp push skipped: '+pushErr.message);}
              log(`Scalp signal: ${inst.id} ${signal.type} ${signal.session} score=${signal.score} fib=${signal.fib} RR=${signal.rr}`);
            }
          }
          const scHigh=Math.max(...sc.slice(-3).map(x=>x.high));
          const scLow=Math.min(...sc.slice(-3).map(x=>x.low));
          checkScalpTrades(inst.id,scHigh,scLow);
          await sleep(DELAY_MS);
        }catch(e){log('Scalp '+inst.id+': '+e.message);await sleep(DELAY_MS);}
      }
    }
  }
  // ScalpSeen cleanup — keep max 100 most recent
  if(scalpSeen.size>100){
    const arr=[...scalpSeen];
    scalpSeen=new Set(arr.slice(-100));
  }
  scanCount++;lastScanTime=new Date().toISOString();saveState();
  log(`Scan complete #${scanCount}`);
}

// Dashboard
app.use(express.json());
async function sendPushToAll(title,body,url){
  if(!webpush||!VAPID_PUBLIC||!VAPID_PRIVATE||!pushSubscriptions.length)return;
  const payload=JSON.stringify({title,body,url:url||'/'});
  const dead=[];
  for(const entry of pushSubscriptions){
    const {code,...sub}=entry;
    try{await webpush.sendNotification(sub,payload);}
    catch(e){
      if(e.statusCode===410||e.statusCode===404)dead.push(entry);
      else log('Push error: '+e.message);
    }
  }
  if(dead.length){pushSubscriptions=pushSubscriptions.filter(s=>!dead.includes(s));saveState();}
}

// Sends only to members who marked themselves as tracking this specific trade
async function sendPushToTrackers(signalId,title,body,level){
  if(!webpush||!VAPID_PUBLIC||!VAPID_PRIVATE||!signalId)return;
  const codes=trackedTrades[signalId];
  if(!codes||!codes.length)return;
  const payload=JSON.stringify({title,body,url:'/'});
  const dead=[];
  for(const entry of pushSubscriptions){
    const {code,...sub}=entry;
    if(!codes.includes(code))continue;
    // Check member's notification preferences
    if(level){
      const member=memberCodes.find(m=>m.code===code);
      if(member&&member.notifPrefs&&member.notifPrefs[level]===false)continue;
    }
    try{await webpush.sendNotification(sub,payload);}
    catch(e){
      if(e.statusCode===410||e.statusCode===404)dead.push(entry);
      else log('Push error: '+e.message);
    }
  }
  if(dead.length){pushSubscriptions=pushSubscriptions.filter(s=>!dead.includes(s));saveState();}
}
async function sendScalpPushToAll(title,body,url){
  if(!webpush||!VAPID_PUBLIC||!VAPID_PRIVATE||!pushSubscriptions.length)return;
  const payload=JSON.stringify({title,body,url:url||'/'});
  const dead=[];
  for(const entry of pushSubscriptions){
    const {code,...sub}=entry;
    const member=memberCodes.find(m=>m.code===code);
    if(member&&member.notifPrefs&&member.notifPrefs.scalpAlerts===false)continue;
    try{await webpush.sendNotification(sub,payload);}
    catch(e){
      if(e.statusCode===410||e.statusCode===404)dead.push(entry);
      else log('Push error: '+e.message);
    }
  }
  if(dead.length){pushSubscriptions=pushSubscriptions.filter(s=>!dead.includes(s));saveState();}
}

// Short push title/body per trade event, mirrors tgQMRUpdate's content
function pushTextFor(level,trade){
  const p=trade.dec,name=trade.instName||trade.instId;
  const map={
    be:['\u26A1 Moved to Breakeven',name+' \u2014 SL now at entry, trade is risk-free.'],
    tp1:['\u2705 TP1 Hit',name+' \u2014 close 50%, buffer SL active.'],
    tp2:['\uD83D\uDCB0 Full Target Hit',name+' \u2014 take full profit.'],
    sl:['\uD83D\uDEAB Stop Loss Hit',name+' \u2014 trade closed.'],
    be_close:['\u2705 Closed \u2014 TP1 Secured',name+' \u2014 remainder hit buffer, partial profit banked.'],
    be_sl:['\u2696\uFE0F Closed at Breakeven',name+' \u2014 no loss taken.'],
    trail:['\uD83D\uDD39 Trailing Active',name+' \u2014 SL now trails behind price.']
  };
  return map[level]||[name,level];
}
// ===== RATE LIMITER (in-memory, no external deps) =====
var rlStore={};
setInterval(function(){
  var cut=Date.now()-60000;
  for(var k in rlStore){rlStore[k]=rlStore[k].filter(function(t){return t>cut;});if(!rlStore[k].length)delete rlStore[k];}
},60000);
function checkRate(key,maxPerMin){
  var now=Date.now();
  if(!rlStore[key])rlStore[key]=[];
  rlStore[key].push(now);
  return rlStore[key].filter(function(t){return now-t<60000;}).length>maxPerMin;
}
function rlMiddleware(maxPerMin,label){
  return function(req,res,next){
    var ip=req.ip||req.connection.remoteAddress||'unknown';
    var code=req.query.code||req.headers['x-access-code']||'anon';
    var key=label+':'+ip+':'+code;
    if(checkRate(key,maxPerMin))return res.status(429).json({error:'Too many requests. Slow down.'});
    next();
  };
}

// ===== JSON API for the Slayers App (PWA) =====
app.use((req,res,next)=>{
  res.header('X-Content-Type-Options','nosniff');
  res.header('X-Frame-Options','DENY');
  if(req.path.startsWith('/api/'))res.header('Access-Control-Allow-Origin','*');
  next();
});
// Apply rate limiting to all /api/ routes
app.use('/api',rlMiddleware(60,'api')); // 60 req/min general cap
app.use('/api/member/stats',rlMiddleware(10,'auth')); // tighter on login
app.use('/app', express.static(path.join(__dirname, 'public_app')));
app.use('/admin', express.static(path.join(__dirname, 'public_admin')));
app.post('/api/admin/login',(req,res)=>{
  if(!ADMIN_PASSWORD)return res.status(500).json({error:'Admin password not configured on server'});
  const pw=(req.body&&req.body.password)||req.headers['x-admin-password'];
  if(pw!==ADMIN_PASSWORD)return res.status(401).json({error:'Wrong password'});
  res.json({ok:true});
});
app.post('/api/track',(req,res)=>{
  const codeCheck=checkMemberCode(req);if(codeCheck!=='ok')return res.status(401).json({error:codeCheck==='device_mismatch'?'This code is already active on another device. Ask your admin to reset it.':'Invalid or expired access code',reason:codeCheck});
  const code=req.query.code||req.headers['x-access-code'];
  const signalId=req.body&&req.body.signalId;
  if(!signalId)return res.status(400).json({error:'signalId required'});
  if(!trackedTrades[signalId])trackedTrades[signalId]=[];
  if(!trackedTrades[signalId].includes(code))trackedTrades[signalId].push(code);
  saveState();
  res.json({ok:true,tracking:true});
});
app.delete('/api/track/:signalId',(req,res)=>{
  const codeCheck=checkMemberCode(req);if(codeCheck!=='ok')return res.status(401).json({error:codeCheck==='device_mismatch'?'This code is already active on another device. Ask your admin to reset it.':'Invalid or expired access code',reason:codeCheck});
  const code=req.query.code||req.headers['x-access-code'];
  const signalId=req.params.signalId;
  if(trackedTrades[signalId])trackedTrades[signalId]=trackedTrades[signalId].filter(c=>c!==code);
  saveState();
  res.json({ok:true,tracking:false});
});
app.get('/api/admin/members',(req,res)=>{
  if(!checkAdmin(req))return res.status(401).json({error:'Unauthorized'});
  res.json({members:memberCodes});
});
app.post('/api/admin/members',(req,res)=>{
  if(!checkAdmin(req))return res.status(401).json({error:'Unauthorized'});
  const name=(req.body&&req.body.name||'').trim();
  if(!name)return res.status(400).json({error:'Name required'});
  let code=genCode();
  while(memberCodes.some(m=>m.code===code))code=genCode(); // ensure uniqueness
  const entry={code,name,addedAt:new Date().toISOString()};
  memberCodes.push(entry);saveState();
  res.json({member:entry});
});
app.post('/api/admin/members/:code/reset-device',(req,res)=>{
  if(!checkAdmin(req))return res.status(401).json({error:'Unauthorized'});
  const member=memberCodes.find(m=>m.code===req.params.code);
  if(!member)return res.status(404).json({error:'Member not found'});
  member.boundDevice=null;member.boundAt=null;
  saveState();
  res.json({ok:true});
});
app.delete('/api/admin/members/:code',(req,res)=>{
  if(!checkAdmin(req))return res.status(401).json({error:'Unauthorized'});
  const before=memberCodes.length;
  memberCodes=memberCodes.filter(m=>m.code!==req.params.code);
  saveState();
  res.json({removed:before-memberCodes.length});
});
// Admin: manually close an active QMR trade by pair (e.g. EURUSD)
// Safety: requires body.confirm === "yes" to prevent accidental closes
app.post('/api/admin/close-trade/:pair',async(req,res)=>{
  if(!checkAdmin(req))return res.status(401).json({error:'Unauthorized'});
  const pair=req.params.pair.toUpperCase();
  if((req.body&&req.body.confirm)!=='yes')return res.status(400).json({error:'Set confirm:"yes" in request body to confirm you want to close '+pair});
  const idx=activeQMRTrades.findIndex(t=>t.instId===pair&&!t.slFired);
  if(idx===-1)return res.status(404).json({error:'No active trade found for '+pair});
  const t=activeQMRTrades[idx];
  // Fetch current price
  let price;
  try{
    const allInsts=[...QMR_INSTS,...SCALP_INSTS,...CRT_INSTS];
    const inst=allInsts.find(i=>i.id===pair)||{sym:pair};
    const pRes=await fetch(`https://api.twelvedata.com/time_series?symbol=${encodeURIComponent(inst.sym||pair)}&interval=1h&outputsize=1&apikey=${API_KEY}`);
    const pJson=await pRes.json();
    const c=parseC(pJson);
    if(!c.length)return res.status(502).json({error:'Could not fetch current price'});
    price=c[0].close;
  }catch(e){return res.status(502).json({error:'Price fetch failed: '+e.message});}
  const isB=t.type==='BULLISH';
  const rMultiple=computeR(t,price);
  const inProfit=isB?price>=t.qmLevel:price<=t.qmLevel;
  const outcome=inProfit?'WIN':'SL';
  const duration=t.openTime?Math.round((Date.now()-t.openTime)/60000):null;
  // Record trade
  tradeHistory.push({instId:t.instId,type:t.type,tf:t.tf,outcome,rMultiple,time:new Date().toISOString(),duration,manualClose:true});
  updateMemberStats(t.sigId,outcome,rMultiple);
  autoJournalEntry(t,outcome,rMultiple,duration);
  dailyOutcomeLog.push({id:t.instId,name:t.instName,tf:t.tf,type:t.type,outcome,time:new Date().toISOString()});
  if(outcome==='WIN'){lossStreak=0;winStreak++;}else{winStreak=0;lossStreak++;}
  const rStr=rMultiple>=0?'+'+rMultiple.toFixed(t.dec||2)+'R':rMultiple.toFixed(t.dec||2)+'R';
  await tgSend('\uD83D\uDD04 MANUAL CLOSE - '+pair+'\n'+'='.repeat(28)+'\n\uD83D\uDCCA '+t.instName+' \u00B7 '+t.tf+' | '+(isB?'BUY':'SELL')+' QMR\n\n\uD83D\uDCCD Entry: '+t.qmLevel.toFixed(t.dec||5)+'\n\uD83C\uDF1F Exit: '+price.toFixed(t.dec||5)+'\n\uD83D\uDCB0 '+rStr+'\n\nTrade closed manually by admin.\n'+(outcome==='WIN'?'\u2705 Profit secured.':'Stay disciplined, next setup coming.')+'\n\n\u2014 The Slayers Model by Rexroz');
  const[pt,pb]=pushTextFor(outcome==='WIN'?'tp2':'sl',t);
  try{sendPushToTrackers(t.sigId,'\uD83D\uDD04 Manual Close '+t.instName+' — '+rStr,t.instName,outcome==='WIN'?'tp2':'sl');}catch(e){}
  markFeedOutcome(t.sigId,outcome);
  clearAggBanner(t.sigId);
  delete trackedTrades[t.sigId];
  activeQMRTrades.splice(idx,1);
  saveState();
  res.json({ok:true,pair,outcome,rMultiple,exitPrice:price});
});
app.get('/api/signals',(req,res)=>{
  const codeCheck=checkMemberCode(req);if(codeCheck!=='ok')return res.status(401).json({error:codeCheck==='device_mismatch'?'This code is already active on another device. Ask your admin to reset it.':'Invalid or expired access code',reason:codeCheck});
  const myCode=req.query.code||req.headers['x-access-code'];
  const limit=Math.min(parseInt(req.query.limit)||20,50);
  const pairFilter=req.query.pair?req.query.pair.toUpperCase():null;
  const tfFilter=req.query.tf?req.query.tf.toUpperCase():null;
  const dirFilter=req.query.dir?req.query.dir.toUpperCase():null;
  const minScore=parseInt(req.query.minScore)||0;
  const dateFrom=req.query.dateFrom?new Date(req.query.dateFrom):null;
  const dateTo=req.query.dateTo?new Date(req.query.dateTo):null;
  const sort=req.query.sort||'time';
  let filtered=appSignalFeed;
  if(pairFilter)filtered=filtered.filter(s=>s.pair&&s.pair.toUpperCase().includes(pairFilter));
  if(tfFilter)filtered=filtered.filter(s=>s.tf===tfFilter);
  if(dirFilter)filtered=filtered.filter(s=>s.type===dirFilter);
  if(minScore>0)filtered=filtered.filter(s=>(s.score||0)>=minScore);
  if(dateFrom)filtered=filtered.filter(s=>new Date(s.time)>=dateFrom);
  if(dateTo)filtered=filtered.filter(s=>new Date(s.time)<=dateTo);
  if(sort==='score')filtered=[...filtered].sort((a,b)=>(b.score||0)-(a.score||0));
  else if(sort==='rr')filtered=[...filtered].sort((a,b)=>((b.aggTp1&&b.aggEntry?Math.abs(b.aggTp1-b.aggEntry)/(b.aggSl?Math.abs(b.aggEntry-b.aggSl):1):0)-((a.aggTp1&&a.aggEntry?Math.abs(a.aggTp1-a.aggEntry)/(a.aggSl?Math.abs(a.aggEntry-a.aggSl):1):0))));
  const out=filtered.slice(0,limit).map(s=>{
    var isDual=s.dualEntry;
    return {...s,chartUrl:s.chartFile?'/api/chart/'+s.chartFile:null,aggChartUrl:s.aggChartFile?'/api/chart/'+s.aggChartFile:null,consChartUrl:s.consChartFile?'/api/chart/'+s.consChartFile:null,isTracked:isDual?false:!!(trackedTrades[s.id]&&trackedTrades[s.id].includes(myCode)),isTrackedAgg:isDual?!!(trackedTrades[s.id+'-agg']&&trackedTrades[s.id+'-agg'].includes(myCode)):false,isTrackedCons:isDual?!!(trackedTrades[s.id+'-cons']&&trackedTrades[s.id+'-cons'].includes(myCode)):false};
  });
  res.json({signals:out,count:out.length,total:filtered.length});
});
// Admin backtesting — runs QMR on historical data (uses BACKTEST_API_KEY env var)
app.post('/api/admin/backtest',async(req,res)=>{
  if(!checkAdmin(req))return res.status(401).json({error:'Unauthorized'});
  const backtestKey=process.env.BACKTEST_API_KEY;
  if(!backtestKey)return res.status(500).json({error:'BACKTEST_API_KEY not set on server'});
  const{pair,interval,days,breakoutATR}=req.body||{};
  if(!pair||!interval)return res.status(400).json({error:'pair and interval required (e.g. NZDUSD, 1h)'});
  const id=pair.toUpperCase();
  const allInsts=[...QMR_INSTS,...SCALP_INSTS,...CRT_INSTS];
  const inst=allInsts.find(i=>i.id===id);
  if(!inst)return res.status(400).json({error:'Unknown pair: '+id});
  const tf=interval.toLowerCase();
  if(tf!=='1h'&&tf!=='4h')return res.status(400).json({error:'Interval must be 1h or 4h'});
  const numDays=Math.min(days||60,180);
  const outputSize=numDays*(tf==='1h'?24:6)+100;
  try{
    const url=`https://api.twelvedata.com/time_series?symbol=${encodeURIComponent(inst.sym)}&interval=${tf}&outputsize=${outputSize}&apikey=${backtestKey}`;
    const dRes=await fetch(url);
    const dJson=await dRes.json();
    if(dJson.status==='error')return res.status(502).json({error:'Twelve Data error: '+dJson.message});
    const c=parseC(dJson);
    if(c.length<40)return res.status(502).json({error:'Not enough data (got '+c.length+' candles, need 40+)'});
    const trades=[],maxLookahead=200;
    let lastSigIdx=-20;
    const prevBA=BREAKOUT_ATR;
    if(typeof breakoutATR==='number')BREAKOUT_ATR=breakoutATR;
    for(let i=35;i<c.length;i++){
      if(i-lastSigIdx<10)continue; // min gap between signals
      const window=c.slice(0,i+1);
      const qmrResults=detectQMR(window);
      if(!qmrResults.length)continue;
      const qmr=qmrResults[0];
      const isB=qmr.type==='BULLISH';
      const slDist=Math.abs(qmr.qmLevel-qmr.retestSL);
      const entryPrice=qmr.qmLevel;
      let outcome='OPEN',exitPrice=null,hitTp1=false,closeIdx=null;
      const tp1Price=isB?entryPrice+slDist*3:entryPrice-slDist*3;
      const tp2Price=isB?entryPrice+slDist*2.5:entryPrice-slDist*2.5;
      for(let j=i+1;j<Math.min(c.length,i+maxLookahead);j++){
        const candle=c[j];
        if(isB){
          if(candle.low<=qmr.retestSL&&!hitTp1){outcome='LOSS';exitPrice=qmr.retestSL;closeIdx=j;break;}
          if(!hitTp1&&candle.high>=tp1Price){hitTp1=true;continue;}
          if(hitTp1&&candle.high>=tp2Price){outcome='WIN';exitPrice=tp2Price;closeIdx=j;break;}
        }else{
          if(candle.high>=qmr.retestSL&&!hitTp1){outcome='LOSS';exitPrice=qmr.retestSL;closeIdx=j;break;}
          if(!hitTp1&&candle.low<=tp1Price){hitTp1=true;continue;}
          if(hitTp1&&candle.low<=tp2Price){outcome='WIN';exitPrice=tp2Price;closeIdx=j;break;}
        }
      }
      if(hitTp1){outcome='WIN';exitPrice=tp1Price;closeIdx=closeIdx||i+1;} // TP1 banked = partial win
      if(outcome==='OPEN')continue; // skip still-open trades
      lastSigIdx=i;
      const rMultiple=computeR({qmLevel:entryPrice,origSL:qmr.retestSL,type:qmr.type},exitPrice);
      trades.push({entry:entryPrice,sl:qmr.retestSL,tp1:tp1Price,tp2:tp2Price,outcome,rMultiple:Math.round(rMultiple*100)/100,duration:closeIdx-i,score:qmr.criteria.score});
    }
    BREAKOUT_ATR=prevBA;
    const wins=trades.filter(t=>t.outcome==='WIN').length;
    const losses=trades.filter(t=>t.outcome==='LOSS').length;
    const bes=trades.filter(t=>t.outcome==='BE').length;
    const total=trades.length;
    const totalR=trades.reduce((s,t)=>s+(t.rMultiple||0),0);
    const avgR=total?Math.round(totalR/total*100)/100:0;
    const equity=[0];for(const t of trades)equity.push(Math.round((equity[equity.length-1]+(t.rMultiple||0))*100)/100);
    res.json({
      pair:id,interval:tf,days:numDays,candles:c.length,
      total,wins,losses,bes,
      winRate:total?Math.round(wins/(wins+losses)*100):0,
      totalR:Math.round(totalR*100)/100,avgR,equity,
      trades:trades.slice(-20).map(t=>({outcome:t.outcome,r:t.rMultiple,score:t.score}))
    });
  }catch(e){res.status(500).json({error:'Backtest error: '+e.message});}
});
app.get('/api/scalp',(req,res)=>{
  const codeCheck=checkMemberCode(req);if(codeCheck!=='ok')return res.status(401).json({error:codeCheck==='device_mismatch'?'This code is already active on another device. Ask your admin to reset it.':'Invalid or expired access code',reason:codeCheck});
  const myCode=req.query.code||req.headers['x-access-code'];
  const limit=Math.min(parseInt(req.query.limit)||20,50);
  const sorted=[...scalpSignals].sort((a,b)=>new Date(b.time)-new Date(a.time));
  res.json({signals:sorted.slice(0,limit).map(s=>{
    const tracked=trackedTrades[s.id]&&trackedTrades[s.id].includes(myCode);
    return {...s,isTracked:!!tracked,chartUrl:s.chartFile?'/api/chart/'+s.chartFile:null};
  }),count:Math.min(limit,sorted.length),total:scalpSignals.length});
});
app.get('/api/scalp/active',(req,res)=>{
  const codeCheck=checkMemberCode(req);if(codeCheck!=='ok')return res.status(401).json({error:codeCheck==='device_mismatch'?'This code is already active on another device. Ask your admin to reset it.':'Invalid or expired access code',reason:codeCheck});
  res.json({trades:activeScalpTrades.filter(t=>!t.closed),count:activeScalpTrades.filter(t=>!t.closed).length});
});
app.get('/api/scalp/stats',(req,res)=>{
  const codeCheck=checkMemberCode(req);if(codeCheck!=='ok')return res.status(401).json({error:codeCheck==='device_mismatch'?'This code is already active on another device. Ask your admin to reset it.':'Invalid or expired access code',reason:codeCheck});
  res.json(getScalpStats());
});
app.get('/api/scalp/pulse',(req,res)=>{
  const codeCheck=checkMemberCode(req);if(codeCheck!=='ok')return res.status(401).json({error:codeCheck==='device_mismatch'?'This code is already active on another device. Ask your admin to reset it.':'Invalid or expired access code',reason:codeCheck});
  const pulse=SCALP_INSTS.map(inst=>{
    const dc=dailyCache[inst.id];let dir='NEUTRAL',price=null;
    if(dc&&dc.c&&dc.c.length){const last=dc.c[dc.c.length-1];dir=last.close>last.open?'BULLISH':'BEARISH';price=last.close;}
    return{id:inst.id,name:inst.name,direction:dir,price};
  });
  res.json({pairs:pulse});
});
app.get('/api/vapid-key',(req,res)=>{
  const codeCheck=checkMemberCode(req);if(codeCheck!=='ok')return res.status(401).json({error:codeCheck==='device_mismatch'?'This code is already active on another device. Ask your admin to reset it.':'Invalid or expired access code',reason:codeCheck});
  res.json({key:VAPID_PUBLIC||null,enabled:!!(webpush&&VAPID_PUBLIC&&VAPID_PRIVATE)});
});
app.post('/api/subscribe',(req,res)=>{
  const codeCheck=checkMemberCode(req);if(codeCheck!=='ok')return res.status(401).json({error:codeCheck==='device_mismatch'?'This code is already active on another device. Ask your admin to reset it.':'Invalid or expired access code',reason:codeCheck});
  const sub=req.body;
  const code=req.query.code||req.headers['x-access-code'];
  if(!sub||!sub.endpoint)return res.status(400).json({error:'Invalid subscription'});
  const existing=pushSubscriptions.find(s=>s.endpoint===sub.endpoint);
  if(existing){existing.code=code;} // keep subscription fresh + correctly attributed
  else{pushSubscriptions.push({...sub,code});}
  saveState();
  log('Push subscription registered for '+code+'. Total: '+pushSubscriptions.length);
  res.json({ok:true});
});
app.post('/api/member/notif-prefs',(req,res)=>{
  const codeCheck=checkMemberCode(req);if(codeCheck!=='ok')return res.status(401).json({error:codeCheck==='device_mismatch'?'This code is already active on another device. Ask your admin to reset it.':'Invalid or expired access code',reason:codeCheck});
  const code=req.query.code||req.headers['x-access-code'];
  const prefs=req.body&&req.body.notifPrefs;
  if(!prefs||typeof prefs!=='object')return res.status(400).json({error:'notifPrefs object required'});
  const member=memberCodes.find(m=>m.code===code);
  if(!member)return res.status(404).json({error:'Member not found'});
  member.notifPrefs=prefs;
  saveState();
  res.json({ok:true,notifPrefs:prefs});
});
app.get('/api/news',(req,res)=>{
  const codeCheck=checkMemberCode(req);
  if(codeCheck!=='ok')return res.status(401).json({error:'Invalid or expired access code',reason:codeCheck});
  res.json({events:newsCache.slice(0,30),fetchedAt:lastNewsFetch});
});
app.get('/api/news-feed',(req,res)=>{
  const codeCheck=checkMemberCode(req);
  if(codeCheck!=='ok')return res.status(401).json({error:'Invalid or expired access code',reason:codeCheck});
  res.json({articles:newsFeedCache,fetchedAt:Date.now()});
});
app.get('/api/journal',(req,res)=>{
  const codeCheck=checkMemberCode(req);
  if(codeCheck!=='ok')return res.status(401).json({error:'Invalid or expired access code',reason:codeCheck});
  const code=req.query.code||req.headers['x-access-code'];
  const member=memberCodes.find(m=>m.code===code);
  const entries=member&&member.journal?member.journal:[];
  res.json({entries:entries.slice(-50).reverse()});
});
app.post('/api/journal',(req,res)=>{
  const codeCheck=checkMemberCode(req);
  if(codeCheck!=='ok')return res.status(401).json({error:'Invalid or expired access code',reason:codeCheck});
  const code=req.query.code||req.headers['x-access-code'];
  const member=memberCodes.find(m=>m.code===code);
  if(!member)return res.status(404).json({error:'Member not found'});
  const entry=req.body;
  if(!entry||!entry.pair)return res.status(400).json({error:'Pair required'});
  if(!member.journal)member.journal=[];
  member.journal.push({...entry,id:Date.now().toString(36)+Math.random().toString(36).slice(2,6),createdAt:new Date().toISOString()});
  saveState();
  res.json({ok:true,entry:member.journal[member.journal.length-1]});
});
app.put('/api/journal/:id',(req,res)=>{
  const codeCheck=checkMemberCode(req);
  if(codeCheck!=='ok')return res.status(401).json({error:'Invalid or expired access code',reason:codeCheck});
  const code=req.query.code||req.headers['x-access-code'];
  const member=memberCodes.find(m=>m.code===code);
  if(!member||!member.journal)return res.status(404).json({error:'Not found'});
  const idx=member.journal.findIndex(e=>e.id===req.params.id);
  if(idx===-1)return res.status(404).json({error:'Entry not found'});
  member.journal[idx]={...member.journal[idx],...req.body,id:req.params.id};
  saveState();
  res.json({ok:true,entry:member.journal[idx]});
});
app.delete('/api/journal/:id',(req,res)=>{
  const codeCheck=checkMemberCode(req);
  if(codeCheck!=='ok')return res.status(401).json({error:'Invalid or expired access code',reason:codeCheck});
  const code=req.query.code||req.headers['x-access-code'];
  const member=memberCodes.find(m=>m.code===code);
  if(!member||!member.journal)return res.status(404).json({error:'Not found'});
  member.journal=member.journal.filter(e=>e.id!==req.params.id);
  saveState();
  res.json({ok:true});
});
app.get('/api/trade-history',(req,res)=>{
  const codeCheck=checkMemberCode(req);
  if(codeCheck!=='ok')return res.status(401).json({error:'Invalid or expired access code',reason:codeCheck});
  res.json({outcomes:dailyOutcomeLog.slice(-500),count:dailyOutcomeLog.length});
});
app.post('/api/delete-trades',(req,res)=>{
  const codeCheck=checkMemberCode(req);
  if(codeCheck!=='ok')return res.status(401).json({error:'Invalid or expired access code',reason:codeCheck});
  const {instId}=req.body||{};
  if(!instId)return res.json({error:'instId required'});
  const beforeHist=tradeHistory.length,beforeLog=dailyOutcomeLog.length;
  tradeHistory=tradeHistory.filter(t=>t.instId!==instId);
  dailyOutcomeLog=dailyOutcomeLog.filter(t=>t.id!==instId);
  appSignalFeed=appSignalFeed.filter(s=>s.instId!==instId&&s.pair!==instId);
  saveState();
  res.json({ok:true,removed:{tradeHistory:beforeHist-tradeHistory.length,dailyOutcomeLog:beforeLog-dailyOutcomeLog.length}});
});
app.get('/api/settings',(req,res)=>{
  const codeCheck=checkMemberCode(req);
  if(codeCheck!=='ok')return res.status(401).json({error:'Invalid or expired access code',reason:codeCheck});
  const code=req.query.code||req.headers['x-access-code'];
  const member=memberCodes.find(m=>m.code===code);
  const defaults={theme:'dark',defaultTF:'4H',defaultRisk:0.5,quoteCurrency:'USD',soundAlerts:true,notifPrefs:{},alertFilters:{minRR:1.2,minScore:0,enabledPairs:'ALL',sessionOnly:false}};
  const settings=member&&member.settings?{...defaults,...member.settings,notifPrefs:member.notifPrefs||{},alertFilters:member.settings?.alertFilters||defaults.alertFilters}:defaults;
  res.json({settings});
});
app.post('/api/settings',(req,res)=>{
  const codeCheck=checkMemberCode(req);
  if(codeCheck!=='ok')return res.status(401).json({error:'Invalid or expired access code',reason:codeCheck});
  const code=req.query.code||req.headers['x-access-code'];
  const member=memberCodes.find(m=>m.code===code);
  if(!member)return res.status(404).json({error:'Member not found'});
  const updates=req.body&&req.body.settings;
  if(!updates||typeof updates!=='object')return res.status(400).json({error:'settings object required'});
  member.settings={...(member.settings||{}),...updates};
  if(updates.notifPrefs)member.notifPrefs=updates.notifPrefs;
  saveState();
  res.json({ok:true,settings:member.settings});
});
app.get('/api/briefing',(req,res)=>{
  const codeCheck=checkMemberCode(req);if(codeCheck!=='ok')return res.status(401).json({error:codeCheck==='device_mismatch'?'This code is already active on another device. Ask your admin to reset it.':'Invalid or expired access code',reason:codeCheck});
  res.json({pairs:lastBriefingSnapshot,generatedAt:lastBriefingTime});
});
app.get('/api/active',(req,res)=>{
  const codeCheck=checkMemberCode(req);if(codeCheck!=='ok')return res.status(401).json({error:codeCheck==='device_mismatch'?'This code is already active on another device. Ask your admin to reset it.':'Invalid or expired access code',reason:codeCheck});
  res.json({trades:activeQMRTrades,count:activeQMRTrades.length});
});
app.get('/api/stats',(req,res)=>{
  const codeCheck=checkMemberCode(req);if(codeCheck!=='ok')return res.status(401).json({error:codeCheck==='device_mismatch'?'This code is already active on another device. Ask your admin to reset it.':'Invalid or expired access code',reason:codeCheck});
  const hist=tradeHistory.filter(t=>t.outcome&&t.outcome!=='INVALIDATED');
  const wins=hist.filter(t=>t.outcome==='TP1'||t.outcome==='TP2'||t.outcome==='WIN');
  const losses=hist.filter(t=>t.outcome==='SL');
  const bes=hist.filter(t=>t.outcome==='BE');
  const wr=(wins.length+losses.length)?Math.round((wins.length/(wins.length+losses.length))*100):0;
  const totalR=Math.round(hist.reduce((a,t)=>a+(typeof t.rMultiple==='number'?t.rMultiple:0),0)*10)/10;
  let best=null;for(const t of hist){if(typeof t.rMultiple==='number'&&(!best||t.rMultiple>best.rMultiple))best=t;}
  res.json({totalSignals:hist.length,wins:wins.length,losses:losses.length,breakevens:bes.length,winRate:wr,totalR,bestTrade:best,winStreak,lossStreak});
});
app.get('/api/stats/detailed',(req,res)=>{
  const codeCheck=checkMemberCode(req);if(codeCheck!=='ok')return res.status(401).json({error:'Invalid or expired access code',reason:codeCheck});
  const hist=tradeHistory.filter(t=>t.outcome&&t.outcome!=='INVALIDATED');
  // Per-pair breakdown
  const byPair={};
  for(const t of hist){
    const k=t.instId||'UNKNOWN';
    if(!byPair[k])byPair[k]={wins:0,losses:0,bes:0,totalR:0,total:0};
    byPair[k].total++;
    if(t.outcome==='WIN'||t.outcome==='TP1'||t.outcome==='TP2')byPair[k].wins++;
    else if(t.outcome==='SL')byPair[k].losses++;
    else if(t.outcome==='BE')byPair[k].bes++;
    if(typeof t.rMultiple==='number')byPair[k].totalR+=t.rMultiple;
  }
  // Per-day-of-week breakdown
  const byDay={Sun:0,Mon:0,Tue:0,Wed:0,Thu:0,Fri:0,Sat:0};
  const byDayWin={Sun:0,Mon:0,Tue:0,Wed:0,Thu:0,Fri:0,Sat:0};
  for(const t of hist){
    if(!t.time)continue;
    const day=new Date(t.time).toLocaleDateString('en',{weekday:'short'});
    if(byDay[day]!==undefined){byDay[day]++;if(t.outcome==='WIN'||t.outcome==='TP1'||t.outcome==='TP2')byDayWin[day]++;}
  }
  // Per-TF breakdown
  const byTF={};
  for(const t of hist){
    const k=t.tf||'UNKNOWN';
    if(!byTF[k])byTF[k]={wins:0,losses:0,total:0};
    byTF[k].total++;
    if(t.outcome==='WIN'||t.outcome==='TP1'||t.outcome==='TP2')byTF[k].wins++;
    else if(t.outcome==='SL')byTF[k].losses++;
  }
  // Equity curve (cumulative R)
  const equity=[];let cumR=0;
  for(const t of hist.slice().sort((a,b)=>(a.time||'').localeCompare(b.time||''))){
    cumR+=typeof t.rMultiple==='number'?t.rMultiple:0;
    equity.push({time:t.time,r:cumR});
  }
  // R multiple distribution
  const rDist={under0:0,r0_1:0,r1_2:0,r2_3:0,r3plus:0};
  for(const t of hist){
    const r=typeof t.rMultiple==='number'?t.rMultiple:0;
    if(r<0)rDist.under0++;
    else if(r<=1)rDist.r0_1++;
    else if(r<=2)rDist.r1_2++;
    else if(r<=3)rDist.r2_3++;
    else rDist.r3plus++;
  }
  res.json({byPair,byDay:{counts:byDay,wins:byDayWin},byTF,equity:equity.slice(-100),rDist,weeklySummary:weeklySummaryData});
});
app.get('/api/weekly-summary',(req,res)=>{
  const codeCheck=checkMemberCode(req);if(codeCheck!=='ok')return res.status(401).json({error:'Invalid or expired access code',reason:codeCheck});
  res.json({summary:weeklySummaryData});
});
app.get('/api/member/stats',(req,res)=>{
  const codeCheck=checkMemberCode(req);
  if(codeCheck!=='ok')return res.status(401).json({error:codeCheck==='device_mismatch'?'This code is already active on another device. Ask your admin to reset it.':'Invalid or expired access code',reason:codeCheck});
  const code=req.query.code||req.headers['x-access-code'];
  const myStats=memberStats[code]||{total:0,wins:0,losses:0,bes:0,totalR:0};
  const myWr=myStats.total?(myStats.wins+myStats.losses)?Math.round((myStats.wins/(myStats.wins+myStats.losses))*100):0:0;
  // Also return global stats alongside for comparison
  const hist=tradeHistory.filter(t=>t.outcome&&t.outcome!=='INVALIDATED');
  const gWins=hist.filter(t=>t.outcome==='TP1'||t.outcome==='TP2'||t.outcome==='WIN').length;
  const gLosses=hist.filter(t=>t.outcome==='SL').length;
  const globalWr=(gWins+gLosses)?Math.round((gWins/(gWins+gLosses))*100):0;
  const member=memberCodes.find(m=>m.code===code);
  const notifPrefs=member&&member.notifPrefs?member.notifPrefs:{};
  res.json({
    myStats:{...myStats,winRate:myWr},
    globalStats:{totalSignals:hist.length,wins:gWins,losses:gLosses,breakevens:hist.filter(t=>t.outcome==='BE').length,winRate:globalWr},
    notifPrefs
  });
});
app.get('/api/confluence',(req,res)=>{
  const codeCheck=checkMemberCode(req);
  if(codeCheck!=='ok')return res.status(401).json({error:codeCheck==='device_mismatch'?'This code is already active on another device. Ask your admin to reset it.':'Invalid or expired access code',reason:codeCheck});
  const code=req.query.code||req.headers['x-access-code'];
  const pairs=[];
  for(const inst of QMR_INSTS.filter(i=>i.id!=='GBPUSD')){
    const wb=weeklyCache[inst.id]?.bias||'NEUTRAL';
    const dc=dailyCache[inst.id];
    const dt=dc&&dc.c&&dc.c.length>=12?detectStructure(dc.c).trend:'RANGING';
    const rt=wb===dt&&wb!=='NEUTRAL'?'ALIGNED':wb==='NEUTRAL'||dt==='RANGING'?'MIXED':'CONFLICT';
    const qmr4H=qmr4HCache[inst.id];
    const has4H=qmr4H&&(Date.now()-qmr4H.time)<24*60*60*1000;
    // User's active trade on this pair
    const userTrade=activeQMRTrades.find(t=>t.instId===inst.id);
    const tracking=userTrade&&trackedTrades[userTrade.sigId]&&trackedTrades[userTrade.sigId].includes(code);
    // Determine signal direction (if any active signal exists)
    let signalDir='NONE';
    if(has4H)signalDir=qmr4H.qmr.type;
    // Conviction score 0-10
    let conv=0;
    if(wb===dt&&wb!=='NEUTRAL')conv+=3;
    else if(wb!=='NEUTRAL'&&dt!=='RANGING'&&wb!==dt)conv-=1;
    if(has4H)conv+=2;
    if(tracking)conv+=1;
    if(has4H&&signalDir!=='NONE'){
      const cTrend=wb!=='NEUTRAL'&&signalDir!==wb;
      if(cTrend)conv-=2;
    }
    conv=Math.max(0,Math.min(10,conv));
    // Build a list of factors for display
    const factors=[];
    if(rt==='ALIGNED')factors.push('HTF Aligned');
    if(has4H)factors.push('QMR 4H: '+qmr4H.qmr.type+' '+(qmr4H.qmr.refinedEntry?'(refined)':''));
    if(tracking)factors.push('Your Trade'+(userTrade.tp1Fired?' TP1✓':'')+(userTrade.beFired?' BE✓':''));
    const price=dc&&dc.c&&dc.c.length?fmtN(dc.c[dc.c.length-1].close,inst.dec):'--';
    pairs.push({
      id:inst.id,name:inst.name,price,
      weeklyBias:wb,dailyTrend:dt,biasRelation:rt,
      signalDir,signalTier:null,
      has4HQMR:!!has4H,
      userInTrade:tracking,
      activeTradeProgress:tracking&&userTrade?{tp1Fired:userTrade.tp1Fired,beFired:userTrade.beFired,slFired:userTrade.slFired}:null,
      conviction:conv,convictionLabel:conv>=8?'ELITE':conv>=6?'STRONG':conv>=4?'VALID':'WEAK',
      factors
    });
  }
  res.json({pairs,generatedAt:new Date().toISOString()});
});
app.get('/api/chart/:file',async(req,res)=>{
  const codeCheck=checkMemberCode(req);if(codeCheck!=='ok')return res.status(401).json({error:codeCheck==='device_mismatch'?'This code is already active on another device. Ask your admin to reset it.':'Invalid or expired access code',reason:codeCheck});
  const file=req.params.file.replace(/[^a-zA-Z0-9_.-]/g,'');
  const filePath=CHARTS_DIR+'/'+file;
  if(fs.existsSync(filePath))return res.sendFile(filePath);
  // Chart file missing (e.g. after deploy that wiped /tmp/) — try to regenerate from signal data
  try{
    const base=file.replace(/\.png$/,'');
    // Check QMR signals
    const qmrSig=appSignalFeed.find(s=>s.chartFile===file||s.aggChartFile===file||s.consChartFile===file);
    if(qmrSig){
      const p=qmrSig.dec||5;
      const lines=[
        {price:qmrSig.entry,text:'ENTRY',color:'rgb(38,166,154)'},
        {price:qmrSig.sl,text:'SL',color:'rgb(244,67,54)'}
      ];
      if(qmrSig.tp2!=null)lines.push({price:qmrSig.tp2,text:'TP2',color:'rgb(245,166,35)'});
      const interval=(qmrSig.tf||'1H').toLowerCase();
      await tgSendChart(qmrSig.pair,interval,lines,'',base,true);
    }else{
      // Check scalp signals
      const scSig=(scalpSignals||[]).find(s=>s.chartFile===file);
      if(scSig){
        const lines=[
          {price:scSig.entry,text:'Entry',color:'#3B82F6'},
          {price:scSig.sl,text:'SL',color:'#EF4444'}
        ];
        if(scSig.tp2!=null)lines.push({price:scSig.tp2,text:'TP2',color:'#A3E635'});
        await genScalpChart(scSig.pair,'5min',lines,base);
      }
    }
  }catch(e){log('Chart regeneration failed: '+e.message);}
  if(fs.existsSync(filePath))res.sendFile(filePath);
  else res.status(404).json({error:'Chart not found'});
});
app.get('/',(req,res)=>{
  const up=process.uptime(),hrs=Math.floor(up/3600),mins=Math.floor((up%3600)/60),wr=(()=>{const w=tradeHistory.filter(t=>t.outcome==='TP1'||t.outcome==='TP2'||t.outcome==='WIN').length,l=tradeHistory.filter(t=>t.outcome==='SL').length;return(w+l)?Math.round((w/(w+l))*100):0;})();
  const alerts=alertLog.slice(0,10).map(a=>`<tr><td>${a.time.slice(11,19)}</td><td>${a.type}</td><td>${a.id}</td><td>${a.tf}</td><td style="color:${a.dir==='BULLISH'?'#4ade80':'#f87171'}">${a.dir}</td><td>${a.score}</td></tr>`).join('');
  const trades=activeQMRTrades.map(t=>`<tr><td>${t.instName}</td><td>${t.tf}</td><td style="color:${t.type==='BULLISH'?'#4ade80':'#f87171'}">${t.type}</td><td>${t.qmLevel.toFixed(t.dec)}</td><td>${t.sl.toFixed(t.dec)}</td><td>${t.beFired?'BE&#10003; ':''}${t.tp1Fired?'TP1&#10003; ':''}${t.tp2Fired?'TP2&#10003;':''}</td></tr>`).join('');
  const news=newsCache.slice(0,8).map(e=>`<tr><td>${e.country}</td><td>${e.title}</td><td style="color:#f87171">High</td><td>${new Date(e.date).toUTCString().slice(17,22)} UTC</td></tr>`).join('');
  res.send(`<!DOCTYPE html><html><head><title>Slayers v9.0</title><meta charset="UTF-8"><style>body{background:#080c10;color:#c8d8e8;font-family:monospace;padding:20px}h1{color:#26A69A}h2{color:#c084fc;font-size:13px;margin-top:20px}table{border-collapse:collapse;width:100%;margin-top:6px}td,th{border:1px solid #1e2530;padding:6px 10px;font-size:12px}th{color:#26A69A;background:#0c1218}.dim{color:#4a6a7a}.live{color:#4ade80}.gold{color:#F5A623}</style></head><body>
<h1>SLAYERS ALERT SYSTEM v8.2</h1>
<p>Status: <span class="live">LIVE</span> | Uptime: ${hrs}h ${mins}m | Scans: ${scanCount} | Last: ${lastScanTime||'&mdash;'}</p>
<p class="dim">Session: ${getSess()} | Weekend: ${isWeekend()?'Yes':'No'} | Pairs: ${QMR_INSTS.length} | System: QMR</p>
<p class="gold">Win Rate: ${wr}% | Completed: ${tradeHistory.length} | News: ${newsCache.length} | W:${winStreak} L:${lossStreak}</p>
<h2>RECENT ALERTS</h2>
<table><tr><th>Time</th><th>System</th><th>Pair</th><th>TF</th><th>Direction</th><th>Score</th></tr>${alerts||'<tr><td colspan="6" class="dim">No alerts yet</td></tr>'}</table>
<h2>ACTIVE QMR TRADES</h2>
<table><tr><th>Pair</th><th>TF</th><th>Type</th><th>Entry</th><th>SL</th><th>Progress</th></tr>${trades||'<tr><td colspan="6" class="dim">No active trades</td></tr>'}</table>
<h2>HIGH IMPACT NEWS THIS WEEK</h2>
<table><tr><th>Currency</th><th>Event</th><th>Impact</th><th>Time</th></tr>${news||'<tr><td colspan="4" class="dim">Loading...</td></tr>'}</table>
<p class="dim" style="margin-top:20px">The Slayers Model by Rex Roz | v8.2</p>
</body></html>`);
});

app.listen(PORT,()=>log(`Port ${PORT}`));
// Keep-alive: ping own public URL every 10 min so Render free tier never sleeps
const SELF_URL=process.env.RENDER_EXTERNAL_URL||'';
if(SELF_URL)setInterval(()=>{fetch(SELF_URL+'/').catch(()=>{});},10*60*1000);
log('Slayers Alert System v8.2 starting...');
loadState().then(()=>{
  // Clear any stale CRT signals from previous days immediately on startup
  const cutoff=new Date();cutoff.setUTCHours(0,0,0,0);
  const before=appSignalFeed.length;
  appSignalFeed=appSignalFeed.filter(s=>!(s.system==='CRT'&&new Date(s.time)<cutoff));
  if(appSignalFeed.length!==before)log(`Startup cleanup: removed ${before-appSignalFeed.length} stale CRT signal(s) from previous day(s)`);
  // Remove stale trades from activeQMRTrades (signals already marked as closed or no longer in feed)
  const signalIds=new Set(appSignalFeed.map(s=>s.id));
  const signalOutcomes={};
  for(const s of appSignalFeed)if(s.outcome)signalOutcomes[s.id]=s.outcome;
  const beforeActive=activeQMRTrades.length;
  activeQMRTrades=activeQMRTrades.filter(t=>signalIds.has(t.sigId)&&!signalOutcomes[t.sigId]);
  if(activeQMRTrades.length!==beforeActive)log(`Startup cleanup: removed ${beforeActive-activeQMRTrades.length} stale trade(s) from activeQMRTrades`);
  // Remove signal cards for closed trades from the app feed
  var beforeFeed=appSignalFeed.length;
  var activeSet=new Set(activeQMRTrades.map(t=>t.sigId));
  appSignalFeed=appSignalFeed.filter(function(s){return !s.outcome&&!(trackedTrades[s.id]&&!activeSet.has(s.id));});
  if(appSignalFeed.length!==beforeFeed)log(`Startup cleanup: removed ${beforeFeed-appSignalFeed.length} signal card(s) for closed trades`);
  // Rebuild activeSet after signal feed may have changed, then clear trackedTrades
  activeSet=new Set(activeQMRTrades.map(t=>t.sigId));
  var cleaned=0;
  for(var sigId in trackedTrades){if(!activeSet.has(sigId)){delete trackedTrades[sigId];cleaned++;}}
  if(cleaned)log(`Startup cleanup: removed ${cleaned} stale tracking entr(ies) from closed trades`);
  fetchNewsFeed().then(function(){log('News feed: initial fetch complete ('+newsFeedCache.length+' articles)');});
  setInterval(function(){fetchNewsFeed().catch(function(){});},10*60*1000);
  runScan(true).then(function(){setInterval(function(){runScan(false).catch(function(){});},CHECK_MS);log('Scanning every '+CHECK_MS/60000+' minutes');});
  // Scalp trade check loop — runs every 2 min during active sessions
  setInterval(async function(){
    const sh=new Date().getUTCHours();
    const inLondon=(sh===7)||(sh>7&&sh<11);
    const inNY=(sh===13)||(sh>13&&sh<17);
    if(!inLondon&&!inNY)return;
    const openPairs=new Set(activeScalpTrades.filter(t=>!t.closed).map(t=>t.pair));
    if(!openPairs.size)return;
    for(const pid of openPairs){
      try{
        const inst=SCALP_INSTS.find(i=>i.id===pid);if(!inst)continue;
        const res=await fetch(`https://api.twelvedata.com/time_series?symbol=${encodeURIComponent(inst.sym)}&interval=5min&outputsize=5&apikey=${API_KEY}`);
        const j=await res.json();
        if(j.status==='error')continue;
        const c=parseC(j);if(c.length<3)continue;
        const hi=Math.max(...c.slice(-3).map(x=>x.high));
        const lo=Math.min(...c.slice(-3).map(x=>x.low));
        checkScalpTrades(pid,hi,lo);
      }catch(e){log('Scalp check '+pid+': '+e.message);}
    }
  },120000);
});
