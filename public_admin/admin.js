const BLACK='#000000', PANEL='#0B0F14', BORDER='#1B2430', MINT='#3ECF8E', MINT_DIM='#1F4A38',
      GOLD='#F0B742', RED='#F3677A', WHITE='#F2F4F3', GREY='#7C8A87';

function getPw() { return sessionStorage.getItem('slayersAdminPw') || ''; }
function savePw(p) { sessionStorage.setItem('slayersAdminPw', p); }

let members = [];
let newCode = null; // freshly generated code to show prominently after adding

async function loadMembers() {
  const res = await fetch('/api/admin/members', { headers: { 'X-Admin-Password': getPw() } });
  if (res.status === 401) { renderLogin('Session expired. Enter password again.'); return; }
  const data = await res.json();
  members = data.members || [];
  render();
}

async function addMember() {
  const nameInput = document.getElementById('newName');
  const name = nameInput.value.trim();
  if (!name) return;
  const res = await fetch('/api/admin/members', {
    method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Admin-Password': getPw() },
    body: JSON.stringify({ name })
  });
  if (res.status === 401) { renderLogin('Session expired. Enter password again.'); return; }
  const data = await res.json();
  newCode = data.member;
  nameInput.value = '';
  await loadMembers();
}

async function removeMember(code) {
  if (!confirm('Remove this member? Their app access will stop working immediately.')) return;
  await fetch('/api/admin/members/' + encodeURIComponent(code), {
    method: 'DELETE', headers: { 'X-Admin-Password': getPw() }
  });
  await loadMembers();
}

async function resetDevice(code) {
  if (!confirm("Reset this member's device? Their current phone will be logged out, and whichever device uses the code next will be locked in instead.")) return;
  await fetch('/api/admin/members/' + encodeURIComponent(code) + '/reset-device', {
    method: 'POST', headers: { 'X-Admin-Password': getPw() }
  });
  await loadMembers();
}

function copyCode(code) {
  navigator.clipboard.writeText(code).then(() => alert('Copied: ' + code));
}

function renderLogin(errorMsg) {
  const app = document.getElementById('app');
  app.innerHTML = `
    <div style="font-weight:900;font-size:22px;color:${WHITE};text-transform:uppercase;margin-bottom:24px">Slayers Admin</div>
    <div style="color:${GREY};font-size:13px;margin-bottom:10px">Enter admin password</div>
    <input id="pwInput" type="password" style="margin-bottom:12px"/>
    ${errorMsg ? `<div style="color:${RED};font-size:12.5px;margin-bottom:12px">${errorMsg}</div>` : ''}
    <button id="loginBtn" style="width:100%;background:${MINT};border:none;border-radius:99px;padding:15px 0;color:${BLACK};font-weight:800;font-size:14px">Login</button>
  `;
  document.getElementById('loginBtn').onclick = async () => {
    const pw = document.getElementById('pwInput').value;
    savePw(pw);
    const res = await fetch('/api/admin/members', { headers: { 'X-Admin-Password': pw } });
    if (res.status === 401) { renderLogin('Wrong password.'); return; }
    loadMembers();
  };
  document.getElementById('pwInput').addEventListener('keypress', e => { if (e.key === 'Enter') document.getElementById('loginBtn').click(); });
}

function render() {
  const app = document.getElementById('app');
  app.innerHTML = `
    <div style="font-weight:900;font-size:22px;color:${WHITE};text-transform:uppercase;margin-bottom:4px">Slayers Admin</div>
    <div style="color:${GREY};font-size:12px;margin-bottom:24px">${members.length} active member${members.length === 1 ? '' : 's'}</div>

    <div style="background:${PANEL};border:1px solid ${BORDER};border-radius:14px;padding:16px;margin-bottom:20px">
      <div style="color:${MINT};font-weight:700;font-size:13px;margin-bottom:10px">ADD MEMBER</div>
      <input id="newName" type="text" placeholder="Member name" style="margin-bottom:10px"/>
      <button onclick="addMember()" style="width:100%;background:${MINT};border:none;border-radius:99px;padding:13px 0;color:${BLACK};font-weight:800;font-size:13px">Generate Code</button>
    </div>

    ${newCode ? `
      <div style="background:${MINT_DIM};border:1px solid ${MINT}66;border-radius:14px;padding:16px;margin-bottom:20px">
        <div style="color:${MINT};font-size:12px;font-weight:700;margin-bottom:6px">NEW CODE FOR ${newCode.name.toUpperCase()}</div>
        <div style="color:${WHITE};font-size:20px;font-weight:900;letter-spacing:2px;margin-bottom:10px">${newCode.code}</div>
        <button onclick="copyCode('${newCode.code}')" style="background:${MINT};border:none;border-radius:99px;padding:10px 18px;color:${BLACK};font-weight:700;font-size:12px">Copy Code</button>
        <div style="color:${GREY};font-size:11px;margin-top:10px">Send this to ${newCode.name} via Telegram DM.</div>
      </div>` : ''}

    <div style="color:${GOLD};font-weight:700;font-size:13px;margin-bottom:10px">ACTIVE MEMBERS</div>
    ${members.length === 0 ? `<div style="color:${GREY};font-size:13px;text-align:center;padding:30px 0">No members yet.</div>` : members.map(m => `
      <div style="background:${PANEL};border:1px solid ${BORDER};border-radius:12px;padding:14px;margin-bottom:10px">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:${m.boundDevice ? '10px' : '0'}">
          <div>
            <div style="color:${WHITE};font-weight:700;font-size:14px">${m.name}</div>
            <div style="color:${GREY};font-size:11px;letter-spacing:1px">${m.code}</div>
          </div>
          <button onclick="removeMember('${m.code}')" style="background:none;border:1px solid ${RED};border-radius:99px;padding:8px 14px;color:${RED};font-weight:700;font-size:11px">Remove</button>
        </div>
        ${m.boundDevice ? `
          <div style="display:flex;justify-content:space-between;align-items:center;border-top:1px solid ${BORDER};padding-top:10px">
            <span style="color:${MINT};font-size:10.5px">🔒 Locked to a device</span>
            <button onclick="resetDevice('${m.code}')" style="background:none;border:1px solid ${GOLD};border-radius:99px;padding:6px 12px;color:${GOLD};font-weight:700;font-size:10.5px">Reset Device</button>
          </div>` : `<div style="color:${GREY};font-size:10.5px">Not used yet — will lock to whichever device logs in first</div>`}
      </div>`).join('')}
  `;
}

if (getPw()) loadMembers(); else renderLogin();
