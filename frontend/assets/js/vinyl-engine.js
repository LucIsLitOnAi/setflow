import { SETFLOW_STATE } from './lib/State.js';
import { toast, ren } from './lib/UIController.js';
import { save } from './lib/SessionManager.js';
import socketClient from './socket-client.js';

export async function fetchDiscogs(query) {
  const q = query || document.getElementById('v-search').value.trim();
  if (!q) { toast('Enter a search term', ''); return; }
  toast('Searching Discogs…', '');
  try {
    const res = await fetch(`https://api.discogs.com/database/search?q=${encodeURIComponent(q)}&type=release&per_page=1`,
      { headers: { 'User-Agent': 'SetFlow/1.0' } });
    const data = await res.json();
    const r = data.results && data.results[0];
    if (!r) { toast('No results found', ''); return; }
    const parts = (r.title || '').split(' - ');
    document.getElementById('v-artist').value = parts[0] || '';
    document.getElementById('v-title').value = parts[1] || r.title || '';
    document.getElementById('v-label').value = (r.label && r.label[0]) || '';
    document.getElementById('v-year').value = r.year || '';
    
    // Store cover temporarily on the element
    document.getElementById('vmodal').dataset.tempCover = r.cover_image || r.thumb || '';
    
    toast('Discogs: record found', 'grn');
  } catch (e) {
    toast('Discogs unavailable', '');
    console.warn(e);
  }
}

export function startScanner() {
  const container = document.getElementById('scanner-container');
  container.style.display = 'block';
  container.innerHTML = '';
  if (typeof Html5Qrcode === 'undefined') { toast('Scanner lib not loaded', ''); return; }
  SETFLOW_STATE._scanner = new Html5Qrcode('scanner-container');
  SETFLOW_STATE._scanner.start(
    { facingMode: 'environment' },
    { fps: 10, qrbox: 200 },
    code => {
      SETFLOW_STATE._scanner.stop().catch(() => { });
      SETFLOW_STATE._scanner = null;
      container.style.display = 'none';
      document.getElementById('v-search').value = code;
      fetchDiscogs(code);
    },
    () => { }
  ).catch(() => toast('Camera access denied', ''));
}

export function saveVinyl() {
  const title = document.getElementById('v-title').value.trim();
  const artist = document.getElementById('v-artist').value.trim();
  if (!title && !artist) { toast('Enter at least a title or artist', ''); return; }
  const linkedTrackId = document.getElementById('v-link').value || null;
  const cover = document.getElementById('vmodal').dataset.tempCover || null;
  const rec = {
    id: Date.now(), isVinyl: true,
    title: title || 'Unknown Title',
    artist: artist || 'Unknown Artist',
    label: document.getElementById('v-label').value.trim() || '',
    year: document.getElementById('v-year').value.trim() || '',
    cover: cover, linkedTrackId: linkedTrackId ? +linkedTrackId : null, role: null
  };
  SETFLOW_STATE.vinylRecords.push(rec);
  save();
  if (window.renderVinyl) window.renderVinyl();
  if (window.closeVModal) window.closeVModal();
  toast('Vinyl record saved', 'grn');
  
  // Sync to server
  socketClient.syncVinyl();
}

export function selVinyl(id) {
  SETFLOW_STATE.sel = SETFLOW_STATE.vinylRecords.find(v => v.id === id);
  document.getElementById('pnl').classList.add('open');
  if (window.rvp) window.rvp();
}
