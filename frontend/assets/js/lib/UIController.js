/* ═══ SETFLOW — UI CONTROLLER ═══ */
import { SETFLOW_STATE } from './State.js';

// ── ICON ENGINE ──
const ICON_MAP = {
  SEED: s => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 22C16.4183 22 20 18.4183 20 14C20 9.58172 12 2 12 2C12 2 4 9.58172 4 14C4 18.4183 7.58172 22 12 22Z" fill="currentColor" opacity="0.6"/></svg>`,
  PULSE: s => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M14 3.5C17.5 4.5 21 8 20.5 12.5C20 17 16 20.5 12 21C8 21.5 4 19 3.5 15C3 11 5 7.5 8 5.5C10 4 12 3 14 3.5Z" fill="currentColor" opacity="0.5"/></svg>`,
  PATH: s => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 14C6 8 9 10 12 13C15 16 18 18 21 10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>`,
  ORBIT: s => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="0.75"/><circle cx="12" cy="12" r="7" stroke="currentColor" stroke-width="0.5" opacity="0.7"/><circle cx="12" cy="12" r="4.5" stroke="currentColor" stroke-width="0.5" opacity="0.5"/><circle cx="12" cy="12" r="2" stroke="currentColor" stroke-width="0.75" opacity="0.4"/><circle cx="12" cy="12" r="0.6" fill="currentColor"/></svg>`,
  WAVE: s => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2 12C4 8 5 4 7 8C9 12 11 16 13 12C15 8 17 4 19 8C20 10 21 11 22 12" stroke="currentColor" stroke-width="1.25" stroke-linecap="round"/></svg>`,
};
export function getIcon(type, size = 24) { const fn = ICON_MAP[type]; return fn ? fn(size) : ''; }

function bc(b) {
  if (!b) return '';
  if (b < 122) return 'z1';
  if (b < 126) return 'z2';
  if (b < 130) return 'z3';
  if (b < 134) return 'z4';
  return 'z5';
}

function ec(e) {
  if (!e) return 'rgba(255,255,255,0.12)';
  if (e < 40) return 'var(--signal-primary)';
  if (e < 60) return 'var(--blue)';
  if (e < 80) return '#c8d8ff';
  return 'var(--signal-alert)';
}

const RC = {opener:'co', build:'cb', peak:'cp', closing:'cc'};
const VC = {day:'cd', night:'cn', dark:'ck', melodic:'cm', tribal:'ct2'};
const ROLE_PILL = {opener:'pill-opener', build:'pill-build', peak:'pill-peak', closing:'pill-closing'};
const ROLE_DOTS = {opener:'var(--signal-primary)', build:'var(--blue)', peak:'var(--accent-white)', closing:'var(--signal-warning)'};

function cr(r) {
  if (!r) return '<span style="color:var(--accent-dim);font-size:10px">—</span>';
  return `<span class="status-pill ${ROLE_PILL[r]||''}"><span class="sp-dot" style="background:${ROLE_DOTS[r]||'currentColor'}"></span>${r}</span>`;
}

function genreChips(genres) {
  if (!genres || !genres.length) return '<span style="color:var(--accent-dim);font-size:10px;letter-spacing:1px">—</span>';
  return genres.map((g, i) =>
    `<span class="tag-pill${i === 0 ? ' tag-primary' : ''}"><span class="tag-pill-dot"></span>${g}</span>`
  ).join('');
}

function coverCell(t) {
  if (t.cover) return `<div class="cover-wrap"><img src="${t.cover}" alt=""></div>`;
  return `<div class="cover-vinyl"><span class="icon-wrapper">${getIcon('ORBIT', 38)}</span></div>`;
}

function filtered() {
  let list = SETFLOW_STATE.tracks;
  const fil = SETFLOW_STATE.fil;
  const q   = SETFLOW_STATE.q;
  if (fil === 'untagged')   list = list.filter(t => !t.role);
  else if (fil === 'lic-warn') list = list.filter(t => t.lic === 'none' || t.lic === 'unknown');
  else if (fil === 'own')   list = list.filter(t => t.isOwn);
  else if (fil !== 'all')   list = list.filter(t => t.role === fil);
  if (q) {
    const lq = q.toLowerCase();
    list = list.filter(t =>
      t.title.toLowerCase().includes(lq) ||
      t.artist.toLowerCase().includes(lq) ||
      (t.genres || []).join(' ').toLowerCase().includes(lq)
    );
  }
  return list;
}

function ren() {
  const list = filtered();
  document.getElementById('em').style.display = list.length ? 'none' : 'block';
  document.getElementById('tbd').innerHTML = list.map((t, i) => `
    <tr data-track-id="${t.id}" onclick="selT(${t.id})" class="${SETFLOW_STATE.sel?.id === t.id ? 'sel' : ''}${t.isGhost ? ' ghost-row' : ''}"${t.isGhost ? ` ondragover="HydrationManager._onDragOver(event,${t.id})" ondragleave="HydrationManager._onDragLeave(event,${t.id})" ondrop="HydrationManager._onDrop(event,${t.id})"` : ''}>
      <td class="td-num tno">${String(i + 1).padStart(2, '0')}</td>
      <td class="td-cover">${coverCell(t)}</td>
      <td>
        <div class="tn" style="display:flex;align-items:center;gap:4px">${t.title}${t.isGhost ? `<span class="ghost-badge" title="Click to link real file — or drag & drop audio onto this row" onclick="event.stopPropagation();HydrationManager._promptFile(${t.id})">⇡ GHOST</span>` : ''}${t.isOwn ? ` <span style="font-size:9px;color:var(--green);font-family:var(--M);letter-spacing:1px">★ EIGEN</span>` : ''}${SETFLOW_STATE.sel?.id === t.id ? `<span class="neural-match-node" onclick="event.stopPropagation();nmShow(event,${t.id})" title="NEURAL MATCH"><svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="7" cy="7" r="2" fill="var(--signal-primary)"/><circle cx="2" cy="3" r="1.2" fill="var(--signal-primary)" opacity=".7"/><circle cx="12" cy="3" r="1.2" fill="var(--signal-primary)" opacity=".7"/><circle cx="2" cy="11" r="1.2" fill="var(--signal-primary)" opacity=".7"/><circle cx="12" cy="11" r="1.2" fill="var(--signal-primary)" opacity=".7"/><line x1="7" y1="5" x2="2.8" y2="3.8" stroke="var(--signal-primary)" stroke-width=".8" opacity=".5"/><line x1="7" y1="5" x2="11.2" y2="3.8" stroke="var(--signal-primary)" stroke-width=".8" opacity=".5"/><line x1="7" y1="9" x2="2.8" y2="10.2" stroke="var(--signal-primary)" stroke-width=".8" opacity=".5"/><line x1="7" y1="9" x2="11.2" y2="10.2" stroke="var(--signal-primary)" stroke-width=".8" opacity=".5"/></svg></span>` : ''}</div>
        <div class="ta">${t.artist}</div>
      </td>
      <td>${genreChips(t.genres)}</td>
      <td class="tbpm ${bc(t.bpm)}">${t.bpm || '—'}</td>
      <td><div class="eb"><div class="et"><div class="ef" style="width:${t.energy || 0}%;background:${ec(t.energy)}"></div></div><span class="ev">${t.energy || '—'}</span></div></td>
      <td>${cr(t.role)}</td>
      <td>${licBadge(t.lic)}</td>
    </tr>`).join('');
}

function sts() {
  const tracks    = SETFLOW_STATE.tracks;
  const n         = tracks.length;
  const tagged    = tracks.filter(t => t.role).length;
  const unlicensed = tracks.filter(t => t.lic === 'none' || t.lic === 'unknown').length;
  document.getElementById('ca').textContent = n;
  // cart removed
  document.getElementById('s1').textContent = n;
  document.getElementById('s2').textContent = tagged;
  ['opener', 'build', 'peak', 'closing'].forEach(r => {
    const el = document.getElementById('c' + r[0]);
    if (el) el.textContent = tracks.filter(t => t.role === r).length;
  });
  document.getElementById('cl-own').textContent = tracks.filter(t => t.lic === 'own').length;
  document.getElementById('cl-lic').textContent = tracks.filter(t => t.lic === 'licensed').length;
  document.getElementById('cl-pro').textContent = tracks.filter(t => t.lic === 'promo').length;
  document.getElementById('cl-non').textContent = tracks.filter(t => t.lic === 'none').length;
  const bs = tracks.filter(t => t.bpm).map(t => t.bpm);
  document.getElementById('s3').textContent = bs.length ? Math.round(bs.reduce((a, b) => a + b) / bs.length) : '—';
  document.getElementById('s4').textContent = unlicensed;
  document.getElementById('s4-warn').style.color = unlicensed > 0 ? 'var(--red)' : 'var(--ink3)';
  document.getElementById('s4-warn').textContent = unlicensed > 0 ? '⚠ Unl.' : 'Genres';
}

function show() {
  // Hide landing screen on first track load
  const lp = document.getElementById('lp-screen');
  if (lp) lp.style.display = 'none';
  document.getElementById('dz').style.display = 'none';
  document.getElementById('fb').classList.add('vis');
  document.getElementById('tbl').style.display = 'table';
}

function goView(v, el) {
  ['vl', 'vv', 'vs', 'vhb', 'vseq'].forEach(id => document.getElementById(id).style.display = 'none');
  const viewMap = {library:'vl', vinyl:'vv', set:'vs', hybrid:'vhb', seq:'vseq'};
  const flexViews = {library:1, vinyl:1, hybrid:1, seq:1};
  const target = document.getElementById(viewMap[v] || 'vl');
  target.style.display = flexViews[v] ? 'flex' : 'block';
  document.querySelectorAll('.ni').forEach(n => n.classList.remove('on'));
  if (el) el.classList.add('on');
  const labels = {library:'— All Tracks', vinyl:'— Physical Records', set:'— Set Planner', hybrid:'— Hybrid Bridge', seq:'— Performance Sequencer'};
  document.getElementById('vsub').textContent = labels[v] || '';
  if (v === 'set') buildSet();
  if (v === 'vinyl') renderVinyl();
  if (v === 'hybrid') renderHB();
  if (v === 'seq') renderSP();
}

function toast(msg, type) {
  const el = document.getElementById('toast');
  document.getElementById('tmsg').textContent = msg;
  const led = document.getElementById('tled');
  led.className = 'tled' + (type === 'grn' ? ' grn' : '');
  el.classList.add('show');
  setTimeout(() => el.classList.remove('show'), 2500);
}

export { ren, sts, show, goView, bc, ec, cr, genreChips, coverCell, filtered, toast };
