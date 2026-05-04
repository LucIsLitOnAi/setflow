import { SETFLOW_STATE, getState } from './lib/State.js';
import * as UI from './lib/UIController.js';
import * as Session from './lib/SessionManager.js';
import socketClient from './socket-client.js';
import * as Vinyl from './vinyl-engine.js';
import { audioEngine } from './lib/AudioEngine.js';

// ── WINDOW EXPORTS ──
window.fetchDiscogs = Vinyl.fetchDiscogs;
window.startScanner = Vinyl.startScanner;
window.saveVinyl = Vinyl.saveVinyl;
window.selVinyl = (id) => {
  SETFLOW_STATE.sel = SETFLOW_STATE.vinylRecords.find(v => v.id === id);
  document.getElementById('pnl').classList.add('open');
  rvp();
};
window.renderVinyl = renderVinyl;
window.addVinyl = addVinyl;
window.closeVModal = closeVModal;
window.closeP = closeP;
window.rvp = rvp;
window.uploadCover = uploadCover;
window.unlinkVinyl = unlinkVinyl;
window.hbSelV = hbSelV;
window.hbSelT = hbSelT;
window.hbExecuteLink = hbExecuteLink;
window.renderHB = renderHB;
window.upgradeToPro = upgradeToPro;

// ── CORE LOGIC ──

function renderVinyl() {
  const container = document.getElementById('vinyl-grid');
  if (!container) return;
  container.innerHTML = SETFLOW_STATE.vinylRecords.map(v => `
    <div class="vinyl-card" onclick="selVinyl(${v.id})">
      <div class="vinyl-card-cover">
        ${v.cover ? `<img src="${v.cover}" alt="">` : `<div class="dp-cover-default">${UI.getIcon('ORBIT', 32)}</div>`}
      </div>
      <div class="vinyl-card-info">
        <div class="v-title">${v.title}</div>
        <div class="v-artist">${v.artist}</div>
      </div>
    </div>
  `).join('') + `
    <div class="vinyl-card add-card" onclick="addVinyl()">
      <div class="add-icon">+</div>
      <div class="add-text">Add Record</div>
    </div>
  `;
}

function addVinyl() {
  ['v-search', 'v-title', 'v-artist', 'v-label', 'v-year'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
  document.getElementById('vmodal').dataset.tempCover = '';
  const scannerContainer = document.getElementById('scanner-container');
  if (scannerContainer) scannerContainer.style.display = 'none';
  document.getElementById('vmodal').classList.add('open');
}

function closeVModal() {
  document.getElementById('vmodal').classList.remove('open');
}

function renderTrackPanel() {
  const t = SETFLOW_STATE.sel; if (!t) return;
  const licWarn = (t.lic === 'none' || t.lic === 'unknown');
  const coverHtml = t.cover
    ? `<img src="${t.cover}" alt="">`
    : `<div class="dp-cover-default">${UI.getIcon('ORBIT', 48)}</div>`;
  const LIC_LABELS = { own: 'OWN PROD.', licensed: 'LICENSED', promo: 'PROMO', none: 'NO LIC.', unknown: 'UNKNOWN' };

  document.getElementById('pi').innerHTML = `
    <div class="top-bar-right">
      <button id="upgrade-btn" class="btn b-out" style="border-color:var(--signal-primary);color:var(--signal-primary);margin-right:12px" onclick="upgradeToPro()">UPGRADE</button>
      <div id="pro-badge" class="status-badge" style="display:none;background:var(--signal-primary);color:var(--paper1);margin-right:12px">PRO</div>
      <div id="connection-status" class="status-badge">OFFLINE</div>
    </div>
    <div class="dp-header">
      <div class="dp-cover" onclick="uploadCover(${t.id})" title="Add cover art">
        ${coverHtml}<div class="dp-cover-overlay">+ COVER</div>
      </div>
      <div class="dp-header-meta">
        <div class="p-name">${t.title}</div>
        <div class="p-art">${t.artist}</div>
        <div class="p-label" style="margin-top:4px">${t.genres?.join(', ') || 'No Genres'}</div>
      </div>
    </div>
    <button class="px" onclick="closeP()">×</button>
    
    <div class="dp-body">
      <div class="pr"><span class="pl">TEMPO</span><span class="pv">${t.bpm || '—'} BPM</span></div>
      <div class="pr"><span class="pl">KEY</span><span class="pv">${t.key || '—'}</span></div>
      <div class="pr"><span class="pl">ENERGY</span><span class="pv">${t.energy || '—'}%</span></div>
      <div class="pr"><span class="pl">ROLE</span><span class="pv">${t.role || '—'}</span></div>
      <div class="pr"><span class="pl">LICENSE</span><span class="pv" style="color:${licWarn ? 'var(--red)' : 'var(--green)'}">${LIC_LABELS[t.lic] || '—'}</span></div>
      
      <div class="sl2" style="margin-top:16px">Signal Properties</div>
      <div class="dp-tags">
        ${(t.vibe || []).map(v => `<span class="tag-pill"><span class="tag-pill-dot"></span>${v}</span>`).join('') || '<span style="color:var(--ink3)">No vibes defined</span>'}
      </div>
    </div>
  `;
}

function rvp() {
  const v = SETFLOW_STATE.sel; if (!v || !v.isVinyl) return;
  const linked = v.linkedTrackId ? SETFLOW_STATE.tracks.find(t => t.id === v.linkedTrackId) : null;
  document.getElementById('pi').innerHTML = `
    <div class="panel-cover" style="cursor:default;background:var(--paper3);display:flex;align-items:center;justify-content:center">
      ${v.cover ? `<img src="${v.cover}" style="width:100%;height:100%;object-fit:cover">`
      : `<span class="icon-wrapper">${UI.getIcon('ORBIT', 80)}</span>`}
    </div>
    <button class="px" onclick="closeP()" style="top:8px;right:8px">×</button>
    <div class="p-label">Vinyl Record</div>
    <div class="p-name">${v.title}</div>
    <div class="p-art">${v.artist}</div>
    <div class="pr"><span class="pl">Label</span><span class="pv">${v.label || '—'}</span></div>
    <div class="pr"><span class="pl">Year</span><span class="pv">${v.year || '—'}</span></div>
    <div class="sl2">Digital Link</div>
    ${linked
      ? `<div style="display:flex;align-items:center;gap:8px;padding:6px 0;border-bottom:1px solid var(--rule);cursor:pointer" onclick="selT(${linked.id})">
          <div style="width:26px;height:26px;flex-shrink:0">${UI.coverCell(linked)}</div>
          <div style="flex:1;min-width:0;font-size:11px;font-family:var(--font-mono);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${linked.title}</div>
          <span class="badge-digital">D</span>
        </div>
        <button class="btn b-out" style="margin-top:8px;width:100%" onclick="unlinkVinyl(${v.id})">Remove Link</button>`
      : `<div style="color:var(--ink3);font-size:11px;padding:6px 0">No digital track linked.</div>
        <a href="https://www.youtube.com/results?search_query=${encodeURIComponent(v.artist + ' ' + v.title)}" target="_blank" class="btn b-out" style="margin-top:6px;width:100%;justify-content:center;text-decoration:none">▶ Pre-listen on YouTube</a>`}
  `;
  document.getElementById('pnl').classList.add('open');
}

function closeP() {
  document.getElementById('pnl').classList.remove('open');
  SETFLOW_STATE.sel = null;
  UI.ren();
}

function uploadCover(id) {
  const inp = document.createElement('input'); inp.type = 'file'; inp.accept = 'image/*';
  inp.onchange = e => {
    const f = e.target.files[0]; if (!f) return;
    const r = new FileReader();
    r.onload = ev => {
      const t = SETFLOW_STATE.tracks.find(t => t.id === id); if (!t) return;
      const img = new Image();
      img.onload = () => {
        const MAX = 200;
        const scale = Math.min(1, MAX / Math.max(img.width, img.height));
        const c = document.createElement('canvas');
        c.width = Math.round(img.width * scale); c.height = Math.round(img.height * scale);
        c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
        t.cover = c.toDataURL('image/jpeg', 0.8);
        UI.ren(); renderTrackPanel(); Session.save();
        UI.toast('Cover hinzugefügt', 'grn');
        socketClient.syncTracks();
      };
      img.src = ev.target.result;
    };
    r.readAsDataURL(f);
  }; inp.click();
}

function unlinkVinyl(id) {
  const v = SETFLOW_STATE.vinylRecords.find(x => x.id === id);
  if (v) {
    v.linkedTrackId = null;
    Session.save();
    rvp();
    UI.toast('Link removed', '');
    socketClient.syncVinyl();
  }
}

// ── HYBRID BRIDGE ──

function hbSelV(id) {
  SETFLOW_STATE.hbSelVinyl = id;
  renderHB();
}

function hbSelT(id) {
  SETFLOW_STATE.hbSelTrack = id;
  renderHB();
}

function renderHB() {
  const vList = document.getElementById('hb-vinyl-list');
  const tList = document.getElementById('hb-track-list');
  if (!vList || !tList) return;

  vList.innerHTML = SETFLOW_STATE.vinylRecords.map(v => `
    <div class="hb-item ${SETFLOW_STATE.hbSelVinyl === v.id ? 'active' : ''}" onclick="hbSelV(${v.id})">
      <div class="hb-item-name">${v.title}</div>
      <div class="hb-item-art">${v.artist}</div>
      ${v.linkedTrackId ? '<span class="hb-item-status">LINKED</span>' : ''}
    </div>`).join('');

  tList.innerHTML = SETFLOW_STATE.tracks.map(t => `
    <div class="hb-item ${SETFLOW_STATE.hbSelTrack === t.id ? 'active' : ''}" onclick="hbSelT(${t.id})">
      <div class="hb-item-name">${t.title}</div>
      <div class="hb-item-art">${t.artist}</div>
    </div>`).join('');

  const elIdle = document.getElementById('hb-idle');
  const elReady = document.getElementById('hb-ready');
  const elBtn = document.getElementById('hb-execute-btn');
  const elLbl = document.getElementById('hb-exec-label');

  if (SETFLOW_STATE.hbSelVinyl && SETFLOW_STATE.hbSelTrack) {
    elIdle.style.display = 'none';
    elReady.classList.add('vis');
    elBtn.classList.add('hb-active');
    elLbl.textContent = 'READY TO LINK';
    
    const v = SETFLOW_STATE.vinylRecords.find(x => x.id === SETFLOW_STATE.hbSelVinyl);
    const t = SETFLOW_STATE.tracks.find(x => x.id === SETFLOW_STATE.hbSelTrack);
    document.getElementById('hb-ready-vinyl-label').textContent = v?.title || '—';
    document.getElementById('hb-ready-track-label').textContent = t?.title || '—';
  } else {
    elIdle.style.display = 'flex';
    elReady.classList.remove('vis');
    elBtn.classList.remove('hb-active');
    elLbl.textContent = 'SELECT BOTH SIDES';
  }
}

function hbExecuteLink() {
  if (!SETFLOW_STATE.hbSelVinyl || !SETFLOW_STATE.hbSelTrack) return;
  const vRec = SETFLOW_STATE.vinylRecords.find(v => v.id === SETFLOW_STATE.hbSelVinyl);
  const tRec = SETFLOW_STATE.tracks.find(t => t.id === SETFLOW_STATE.hbSelTrack);
  if (!vRec) return;

  vRec.linkedTrackId = SETFLOW_STATE.hbSelTrack;
  Session.save();

  const elIdle = document.getElementById('hb-idle');
  const elReady = document.getElementById('hb-ready');
  const elLinked = document.getElementById('hb-linked-state');
  const elBtn = document.getElementById('hb-execute-btn');
  const elLbl = document.getElementById('hb-exec-label');

  elIdle.style.display = 'none';
  elReady.classList.remove('vis');
  elLinked.classList.add('vis');
  elBtn.classList.remove('hb-active');
  if (elLbl) { elLbl.textContent = '✓ LINK ESTABLISHED'; elLbl.style.color = 'var(--signal-primary)'; }

  const vName = vRec.title || 'Vinyl';
  const tName = tRec?.title || 'Track';

  SETFLOW_STATE.hbSelVinyl = null; SETFLOW_STATE.hbSelTrack = null;
  setTimeout(() => {
    renderHB();
    elLinked.classList.remove('vis');
    if (elLbl) elLbl.style.color = '';
    UI.toast(`LINKED: ${vName} ↔ ${tName}`, 'grn');
    socketClient.syncVinyl();
    socketClient.syncTracks();
  }, 1400);
}

async function upgradeToPro() {
  const priceId = SETFLOW_STATE.proPriceId;
  if (!priceId) {
    UI.toast('Pro configuration missing. Please contact support.', 'red');
    return;
  }
  try {
    const res = await fetch('/create-checkout-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ priceId })
    });
    const { url } = await res.json();
    if (url) window.location.href = url;
  } catch (err) {
    UI.toast('Failed to start checkout.', 'red');
  }
}

window.renderTrackPanel = renderTrackPanel;
window.show = () => {
  const roomIdEl = document.getElementById('room-id');
  const roomId = roomIdEl ? roomIdEl.value : 'demo';
  socketClient.joinRoom(roomId, socketClient.djName);
  UI.show();
  UI.ren();
  UI.sts();
};
window.ren = UI.ren;
window.sts = UI.sts;

// ── INITIALIZATION ──
document.addEventListener('DOMContentLoaded', () => {
  Session.load();
  socketClient.init();
  
  // Check for successful payment
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('success') === 'true') {
    SETFLOW_STATE.isPro = true;
    UI.toast('WELCOME TO PRO!', 'grn');
  }

  if (SETFLOW_STATE.tracks.length > 0) UI.show();
  UI.sts(); UI.ren();
  updateProUI();
});

function updateProUI() {
  const upgradeBtn = document.getElementById('upgrade-btn');
  const proBadge = document.getElementById('pro-badge');
  if (SETFLOW_STATE.isPro) {
    if (upgradeBtn) upgradeBtn.style.display = 'none';
    if (proBadge) proBadge.style.display = 'flex';
  }
}

// Resume AudioContext on first user gesture
document.addEventListener('click', () => audioEngine.resume(), { once: true });
document.addEventListener('keydown', () => audioEngine.resume(), { once: true });
