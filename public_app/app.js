function getCode(){try{return localStorage.getItem('qmr_code')||'';}catch(e){return '';}}
function saveCode(c){try{localStorage.setItem('qmr_code',c);}catch(e){}}
function clearCode(){try{localStorage.removeItem('qmr_code');}catch(e){}}
function getDeviceId(){try{var d=localStorage.getItem('qmr_did');if(!d){d='d_'+Date.now().toString(36)+Math.random().toString(36).slice(2,8);localStorage.setItem('qmr_did',d);}return d;}catch(e){return 'unknown';}}
function withCode(u){if(!u)return'';var c=getCode();if(!c)return u;return u+(u.indexOf('?')>-1?'&':'?')+'code='+encodeURIComponent(c)+'&device='+encodeURIComponent(getDeviceId());}

async function attemptLogin(){
  var ci=document.getElementById('ci'),ls=document.getElementById('ls'),c=ci.value.trim().toUpperCase();
  if(!c)return;ls.textContent='Checking...';saveCode(c);
  try{
    var r=await fetch(withCode('/api/member/stats'));
    if(r.status===401){clearCode();renderLogin('Invalid or expired access code.');return;}
    renderLogin('Logged in! Feature loading...');
  }catch(e){clearCode();renderLogin('Connection error.');}
}

function renderLogin(m){
  var app=document.getElementById('app');
  if(!app)return;
  app.innerHTML='<div style="min-height:100dvh;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:40px 24px;text-align:center;background:#000;color:#FFF">'+
    '<div style="font-weight:900;font-size:34px;letter-spacing:-1px;text-transform:uppercase;margin-bottom:4px">'+
    '<span style="color:#FFF">THE </span><span style="color:#A3E635">SLAYERS</span></div>'+
    '<div style="color:#8E8E93;font-size:12px;margin-bottom:32px">v10</div>'+
    '<div style="background:#141416;border-radius:20px;width:100%;max-width:300px;padding:28px 24px;border:0.5px solid rgba(163,230,53,0.2)">'+
    '<div style="font-size:14px;font-weight:700;color:#FFF;margin-bottom:12px">Enter access code</div>'+
    '<input id="ci" type="text" placeholder="SLAY-XXXXXX" style="width:100%;background:rgba(0,0,0,0.35);border:0.5px solid rgba(255,255,255,0.08);border-radius:12px;padding:14px;color:#FFF;font-size:16px;text-align:center;letter-spacing:2px;margin-bottom:14px;outline:none;box-sizing:border-box"/>'+
    (m?'<div style="color:#EF4444;font-size:12px;margin-bottom:14px">'+m+'</div>':'')+
    '<button id="lb" style="width:100%;background:#A3E635;border:none;border-radius:12px;padding:15px 0;color:#000;font-weight:800;font-size:14px;cursor:pointer">Unlock</button>'+
    '<div id="ls" style="color:#8E8E93;font-size:11px;margin-top:14px"></div></div>'+
    '<div style="color:#48484A;font-size:11px;margin-top:40px">Don\'t have a code? Message Rexroz on Telegram.</div></div>';
  document.getElementById('lb').onclick=attemptLogin;
  document.getElementById('ci').addEventListener('keypress',function(e){if(e.key==='Enter')attemptLogin();});
}

renderLogin();
