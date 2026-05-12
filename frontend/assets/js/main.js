/* ═══ SETFLOW — ORCHESTRATOR ═══
   AudioEngine extracted to lib/AudioEngine.js
   State.js, UIController.js, SessionManager.js ready for progressive migration.
   This file owns all feature logic and exposes UI-callable functions on window.
 */
import AudioEngine from './lib/AudioEngine.js';

function esc(str){
  if(!str)return'';
  return String(str)
    .replace(/&/g,'&amp;')
    .replace(/</g,'&lt;')
    .replace(/>/g,'&gt;')
    .replace(/"/g,'&quot;')
    .replace(/'/g,'&#039;');
}

// ── MODULE-LEVEL STATE ──
let tracks=[], vinylRecords=[], sel=null, fil='all', q='';

// ═══ ICON ENGINE ═══
const ICON_MAP={
  SEED: s=>`<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 22C16.4183 22 20 18.4183 20 14C20 9.58172 12 2 12 2C12 2 4 9.58172 4 14C4 18.4183 7.58172 22 12 22Z" fill="currentColor" opacity="0.6"/></svg>`,
  PULSE: s=>`<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M14 3.5C17.5 4.5 21 8 20.5 12.5C20 17 16 20.5 12 21C8 21.5 4 19 3.5 15C3 11 5 7.5 8 5.5C10 4 12 3 14 3.5Z" fill="currentColor" opacity="0.5"/></svg>`,
  PATH: s=>`<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 14C6 8 9 10 12 13C15 16 18 18 21 10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>`,
  ORBIT: s=>`<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="0.75"/><circle cx="12" cy="12" r="7" stroke="currentColor" stroke-width="0.5" opacity="0.7"/><circle cx="12" cy="12" r="4.5" stroke="currentColor" stroke-width="0.5" opacity="0.5"/><circle cx="12" cy="12" r="2" stroke="currentColor" stroke-width="0.75" opacity="0.4"/><circle cx="12" cy="12" r="0.6" fill="currentColor"/></svg>`,
  WAVE: s=>`<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2 12C4 8 5 4 7 8C9 12 11 16 13 12C15 8 17 4 19 8C20 10 21 11 22 12" stroke="currentColor" stroke-width="1.25" stroke-linecap="round"/></svg>`,
};
function getIcon(type,size=24){const fn=ICON_MAP[type];return fn?fn(size):'';}

// ═══ UI RENDERING ═══
const LC={
  'Deep House':    {bg:'#1a1814',label:'#c0392b',text:'#f2efe8'},
  'House':         {bg:'#1a1814',label:'#2a5a8a',text:'#f2efe8'},
  'Techno':        {bg:'#111',label:'#222',text:'#888'},
  'Melodic Techno':{bg:'#1a1814',label:'#3a2a5a',text:'#c0b8d8'},
  'Disco House':   {bg:'#1a1814',label:'#8a4a1a',text:'#f8d8a8'},
  'default':       {bg:'#1a1814',label:'#4a4640',text:'#c0bbb4'},
};
function vSVG(t,sz=38){
  const c=LC[t.genre]||LC.default,r=sz/2;
  const ini=((t.title||'?')[0]+(t.artist||'?')[0]).toUpperCase();
  return`<svg width="${sz}" height="${sz}" viewBox="0 0 ${sz} ${sz}" xmlns="http://www.w3.org/2000/svg">
    <circle cx="${r}" cy="${r}" r="${r-.5}" fill="${c.bg}"/>
    ${[.85,.78,.71,.64,.57,.50].map(f=>`<circle cx="${r}" cy="${r}" r="${(r-.5)*f}" fill="none" stroke="rgba(255,255,255,0.06)" stroke-width="0.5"/>`).join('')}
    <circle cx="${r}" cy="${r}" r="${r*.42}" fill="${c.label}"/>
    <text x="${r}" y="${r+.5}" text-anchor="middle" dominant-baseline="middle" fill="${c.text}" font-family="IBM Plex Mono,monospace" font-size="${sz*.18}" font-weight="600">${esc(ini)}</text>
    <circle cx="${r}" cy="${r}" r="${r*.07}" fill="${c.bg}"/>
    <circle cx="${r}" cy="${r}" r="${r-.5}" fill="none" stroke="rgba(255,255,255,0.07)" stroke-width="0.5"/>
  </svg>`;
}
function vSVGLg(t,sz=220){
  const c=LC[t.genre]||LC.default,r=sz/2;
  return`<svg width="${sz}" height="${sz}" viewBox="0 0 ${sz} ${sz}" xmlns="http://www.w3.org/2000/svg">
    <circle cx="${r}" cy="${r}" r="${r-1}" fill="${c.bg}"/>
    ${[.92,.86,.80,.74,.68,.62,.56,.50].map(f=>`<circle cx="${r}" cy="${r}" r="${(r-1)*f}" fill="none" stroke="rgba(255,255,255,0.05)" stroke-width="0.8"/>`).join('')}
    <circle cx="${r}" cy="${r}" r="${r*.38}" fill="${c.label}"/>
    <circle cx="${r}" cy="${r}" r="${r*.38}" fill="none" stroke="rgba(255,255,255,0.12)" stroke-width=".8"/>
    <text x="${r}" y="${r-10}" text-anchor="middle" dominant-baseline="middle" fill="${c.text}" font-family="IBM Plex Mono,monospace" font-size="${sz*.065}" font-weight="600">${esc((t.title||'').slice(0,14))}</text>
    <text x="${r}" y="${r+7}" text-anchor="middle" dominant-baseline="middle" fill="${c.text}" font-family="IBM Plex Sans,sans-serif" font-size="${sz*.048}" opacity=".7">${esc((t.artist||'').slice(0,16))}</text>
    <text x="${r}" y="${r+21}" text-anchor="middle" dominant-baseline="middle" fill="${c.text}" font-family="IBM Plex Mono,monospace" font-size="${sz*.042}" opacity=".5">${esc(t.bpm||'—')} BPM</text>
    <circle cx="${r}" cy="${r}" r="${r*.055}" fill="${c.bg}"/>
    <circle cx="${r}" cy="${r}" r="${r-1}" fill="none" stroke="rgba(255,255,255,0.07)" stroke-width="1"/>
  </svg>`;
}

const LIC_CONFIG={
  own:     {label:'Eigene Prod.',cls:'lic-own',dot:'ld-own',warn:false},
  licensed:{label:'Lizenziert',cls:'lic-licensed',dot:'ld-licensed',warn:false},
  promo:   {label:'Promo',cls:'lic-promo',dot:'ld-promo',warn:false},
  none:    {label:'Keine Lizenz',cls:'lic-none',dot:'ld-none',warn:true},
  unknown: {label:'Unbekannt',cls:'lic-unknown',dot:'ld-unknown',warn:true},
};

function licBadge(lic){
  const LIC_PILL={
    own:     {pill:'pill-own',     dot:'var(--signal-primary)', label:'OWN'},
    licensed:{pill:'pill-licensed',dot:'var(--blue)',           label:'LICENSED'},
    promo:   {pill:'pill-promo',   dot:'var(--signal-warning)', label:'PROMO'},
    none:    {pill:'pill-none',    dot:'var(--signal-alert)',   label:'NO LICENSE'},
    unknown: {pill:'pill-unknown', dot:'var(--accent-dim)',     label:'UNKNOWN'},
  };
  const c=LIC_PILL[lic]||LIC_PILL.unknown;
  return`<span class="status-pill ${c.pill}"><span class="sp-dot" style="background:${c.dot}"></span>${c.label}</span>`;
}

/* ── DEMO DATA ── */
const DEMO=[
  {id:1,title:'Ritual Movement',artist:'Innervisions',bpm:122,genres:['Deep House'],energy:35,role:'opener',vibe:['melodic','night'],key:'8A',dur:'7:24',a:true,cover:null,lic:'licensed',licNote:'Beatport kauft 2023',isOwn:false,ownArtist:null},
  {id:2,title:'Dusk to Dawn',artist:'Âme',bpm:124,genres:['Deep House'],energy:42,role:'opener',vibe:['melodic','night'],key:'5A',dur:'8:12',a:true,cover:null,lic:'licensed',licNote:'Beatport kauft 2022',isOwn:false,ownArtist:null},
  {id:3,title:'Lost in Sound',artist:'Dixon',bpm:126,genres:['House','Deep House'],energy:55,role:'build',vibe:['melodic'],key:'2A',dur:'9:03',a:true,cover:null,lic:'promo',licNote:'Promo von Innervisions',isOwn:false,ownArtist:null},
  {id:4,title:'Archipelago',artist:'Tale Of Us',bpm:125,genres:['Melodic Techno','Deep House'],energy:60,role:'build',vibe:['melodic','dark'],key:'11A',dur:'7:55',a:true,cover:null,lic:'licensed',licNote:'Fabric kauft 2023',isOwn:false,ownArtist:null},
  {id:5,title:'Forgotten Roots',artist:'Solomun',bpm:128,genres:['House'],energy:68,role:'build',vibe:['night'],key:'4A',dur:'8:44',a:true,cover:null,lic:'unknown',licNote:'',isOwn:false,ownArtist:null},
  {id:6,title:'Burning Bridges',artist:'Recondite',bpm:130,genres:['Techno','Dub Techno'],energy:75,role:'peak',vibe:['dark','night'],key:'9A',dur:'6:30',a:true,cover:null,lic:'none',licNote:'Rip aus SoundCloud',isOwn:false,ownArtist:null},
  {id:7,title:'Phosphene',artist:'Maceo Plex',bpm:132,genres:['Techno'],energy:82,role:'peak',vibe:['dark'],key:'3A',dur:'7:18',a:true,cover:null,lic:'licensed',licNote:'Beatport kauft 2021',isOwn:false,ownArtist:null},
  {id:8,title:'System Override',artist:'Ben Klock',bpm:134,genres:['Techno'],energy:90,role:'peak',vibe:['dark','night'],key:'6A',dur:'8:01',a:true,cover:null,lic:'licensed',licNote:'Ostgut kauft 2023',isOwn:false,ownArtist:null},
  {id:9,title:'Morning Light',artist:'DJ_DEMO',bpm:124,genres:['Afro House','Deep House'],energy:58,role:'build',vibe:['day','melodic'],key:'7A',dur:'6:20',a:true,cover:null,lic:'own',licNote:'Eigene Produktion — unveröffentlicht',isOwn:true,ownArtist:'DJ_DEMO'},
  {id:10,title:'Sunset Ritual',artist:'Peggy Gou',bpm:126,genres:['House','Disco House'],energy:65,role:'build',vibe:['day','melodic'],key:'1A',dur:'6:40',a:true,cover:null,lic:'licensed',licNote:'Beatport kauft 2023',isOwn:false,ownArtist:null},
  {id:11,title:'Golden Hour',artist:'Hunee',bpm:122,genres:['Disco House'],energy:55,role:'build',vibe:['day'],key:'10A',dur:'7:15',a:true,cover:null,lic:'promo',licNote:'Promo 2024',isOwn:false,ownArtist:null},
  {id:12,title:'Deep Connexion',artist:'DJ_DEMO',bpm:126,genres:['Deep House','Minimal'],energy:48,role:'opener',vibe:['night','melodic'],key:'9A',dur:'7:55',a:true,cover:null,lic:'own',licNote:'Release: Bandcamp 2024',isOwn:true,ownArtist:'DJ_DEMO'},
  {id:13,title:'Fadeout Sequence',artist:'Monika Kruse',bpm:126,genres:['Techno'],energy:58,role:'closing',vibe:['dark','night'],key:'5A',dur:'8:00',a:true,cover:null,lic:'unknown',licNote:'',isOwn:false,ownArtist:null},
  {id:14,title:'Morning Dew',artist:'Larry Heard',bpm:120,genres:['Deep House','Chicago House'],energy:38,role:'closing',vibe:['melodic','day'],key:'8A',dur:'7:45',a:true,cover:null,lic:'licensed',licNote:'Traxsource kauft 2022',isOwn:false,ownArtist:null},
  {id:15,title:'Goodbye Ritual',artist:'Âme',bpm:118,genres:['Deep House'],energy:30,role:'closing',vibe:['melodic','night'],key:'2A',dur:'9:10',a:true,cover:null,lic:'none',licNote:'',isOwn:false,ownArtist:null},
];

function loadDemo(){
  tracks=DEMO.map(t=>({...t,genres:[...(t.genres||[])]}));
  sts();ren();show();
  save();
  toast('15 Demo Tracks geladen','grn');
}

// ═══ AUDIO ENGINE ═══
// AudioEngine imported from ./lib/AudioEngine.js
const audioEngine = new AudioEngine();

// ═══ GENRE ENGINE ═══
// Weighted Euclidean classifier — 3D feature vector [bpm_norm, energy_norm, brightness_norm]
// BPM normalised:        (bpm - 60) / 140  → 0 at 60 BPM, 1 at 200 BPM
// Energy normalised:     min(1, rms / 0.35) → 0 silence, 1 loud mastered
// Brightness normalised: min(1, zcr / 0.20) → 0 dark, 1 percussive/bright
class GenreEngine {
  static get _PROFILES() {
    //                   name              [bpm_n, nrg_n, brt_n]   [w_bpm, w_nrg, w_brt]
    return [
      { n:'Techno',          v:[0.51,0.72,0.55], w:[0.40,0.35,0.25] },
      { n:'House',           v:[0.46,0.60,0.45], w:[0.35,0.35,0.30] },
      { n:'Deep House',      v:[0.43,0.46,0.26], w:[0.20,0.40,0.40] },
      { n:'Tech House',      v:[0.47,0.70,0.57], w:[0.30,0.35,0.35] },
      { n:'Drum & Bass',     v:[0.79,0.85,0.75], w:[0.50,0.30,0.20] },
      { n:'Ambient',         v:[0.14,0.10,0.10], w:[0.20,0.45,0.35] },
      { n:'Trance',          v:[0.52,0.80,0.70], w:[0.35,0.30,0.35] },
      { n:'Melodic Techno',  v:[0.44,0.57,0.37], w:[0.25,0.35,0.40] },
      { n:'Minimal',         v:[0.49,0.28,0.18], w:[0.25,0.40,0.35] },
      { n:'Breakbeat',       v:[0.50,0.72,0.70], w:[0.30,0.30,0.40] },
      { n:'Progressive',     v:[0.48,0.65,0.57], w:[0.30,0.35,0.35] },
      { n:'Electro',         v:[0.46,0.70,0.63], w:[0.30,0.30,0.40] },
    ];
  }

  // vec = [bpmNorm, energyNorm, brightnessNorm]
  // Returns [primary, secondary] genre strings
  static classify(vec) {
    const UNKNOWN_THRESH = 0.36; // max weighted distance before "UNKNOWN"
    const scored = GenreEngine._PROFILES.map(g => ({
      name: g.n,
      dist: g.w.reduce((sum, wi, i) => sum + wi * Math.abs(vec[i] - g.v[i]), 0),
    })).sort((a, b) => a.dist - b.dist);

    const primary   = scored[0].dist <= UNKNOWN_THRESH ? scored[0].name : 'UNKNOWN';
    const secondary = scored[1].dist <= UNKNOWN_THRESH ? scored[1].name : 'UNKNOWN';
    return [primary, secondary];
  }
}

const _trackFiles = new Map();

// ═══ SET EXPORTER ═══
class SetExporter {

  // ── Aggregate current sequencer into an ExportManifest ──
  static collect() {
    const ROLE_ORDER = ['opener','build','peak','closing'];
    const setDur = parseInt(document.getElementById('sp-dur-sel')?.value) || 90;
    const tagged = tracks.filter(t => t.role);
    const avgSlot = tagged.length ? setDur / tagged.length : 6;

    const manifest = []; let pos = 0, idx = 1;
    ROLE_ORDER.forEach(role => {
      tracks.filter(t => t.role === role).forEach(t => {
        const durMin = t.dur ? +(t.dur / 60).toFixed(1) : +avgSlot.toFixed(1);
        manifest.push({ position: idx++, startMin: +pos.toFixed(1), durMin,
          role, id: t.id, title: t.title, artist: t.artist,
          bpm: t.bpm, key: t.key, energy: t.energy,
          genres: t.genres || [], license: t.lic || 'unknown', licNote: t.licNote || '' });
        pos += durMin;
      });
    });

    const bpms = manifest.map(m => m.bpm).filter(Boolean);
    const nrgs = manifest.map(m => m.energy).filter(v => v != null);
    const unlic = manifest.filter(m => m.license === 'none' || m.license === 'unknown');
    return {
      app: 'SetFlow Pro', version: '1.0', generated: new Date().toISOString(),
      setDuration: setDur, trackCount: manifest.length,
      avgBPM:      bpms.length ? Math.round(bpms.reduce((a,b)=>a+b,0)/bpms.length) : null,
      bpmRange:    bpms.length ? Math.max(...bpms) - Math.min(...bpms) : null,
      energyProfile: nrgs,
      licenseAudit: { total: manifest.length, unlicensed: unlic.length, flagged: unlic.map(m=>m.title) },
      tracks: manifest,
    };
  }

  // ── JSON download ──
  static exportJSON() {
    const m = SetExporter.collect();
    if (!m.trackCount) { toast('No tagged tracks in sequencer',''); return; }
    const blob = new Blob([JSON.stringify(m, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `setflow-${new Date().toISOString().slice(0,10)}.json`;
    a.click(); URL.revokeObjectURL(url);
    toast('JSON exported','grn');
  }

  // ── Clipboard setlist ──
  static async copySetlist() {
    const m = SetExporter.collect();
    if (!m.trackCount) { toast('No tagged tracks in sequencer',''); return; }
    const lines = [
      'SETFLOW PRO — SETLIST EXPORT',
      `${new Date().toLocaleString()}  |  ${m.setDuration} MIN  |  ${m.trackCount} TRACKS  |  AVG ${m.avgBPM||'—'} BPM`,
      '─'.repeat(60),
      ...m.tracks.map(t =>
        `${String(t.position).padStart(2,'0')}.  ${t.title} — ${t.artist}` +
        `  |  ${t.bpm||'—'} BPM  |  ${t.key||'—'}  |  ${(t.license||'UNKNOWN').toUpperCase()}`
      ),
      '─'.repeat(60),
      m.licenseAudit.unlicensed > 0
        ? `⚠  LICENSE ALERT: ${m.licenseAudit.unlicensed} unlicensed track(s): ${m.licenseAudit.flagged.join(', ')}`
        : '✓  All tracks licensed',
    ];
    try {
      await navigator.clipboard.writeText(lines.join('\n'));
      toast('Setlist copied to clipboard','grn');
    } catch { toast('Clipboard unavailable',''); }
  }

  // ── Professional PDF Set Sheet ──
  static generatePDF() {
    const jsPDFLib = window.jspdf?.jsPDF || window.jsPDF;
    if (!jsPDFLib) { toast('jsPDF not loaded',''); return; }
    const m = SetExporter.collect();
    if (!m.trackCount) { toast('No tagged tracks in sequencer',''); return; }

    const doc   = new jsPDFLib({ orientation:'portrait', unit:'pt', format:'a4' });
    const PW    = doc.internal.pageSize.getWidth();   // 595
    const PH    = doc.internal.pageSize.getHeight();  // 842
    const MG    = 40;
    const CW    = PW - MG * 2;                        // 515

    // ── DTP-V2 palette ──
    const BG    = [18, 20, 23];
    const P3    = [35, 41, 47];
    const P2    = [30, 35, 39];
    const GREEN = [77, 255, 136];
    const WHITE = [240, 240, 240];
    const DIM   = [122, 132, 144];
    const RED   = [255, 77, 77];
    const AMB   = [255, 204, 0];

    const fill  = (r,g,b) => { doc.setFillColor(r,g,b); };
    const ink   = (r,g,b) => { doc.setTextColor(r,g,b); };
    const line  = (r,g,b) => { doc.setDrawColor(r,g,b); };
    const page  = () => {
      fill(...BG); doc.rect(0,0,PW,PH,'F');
    };

    page(); let y = MG;

    // ── HEADER ──
    fill(...P3); doc.rect(MG, y, CW, 46, 'F');
    doc.setFont('courier','bold'); doc.setFontSize(13); ink(...GREEN);
    doc.text('SETFLOW PRO — SET REPORT', MG+12, y+18);
    doc.setFont('courier','normal'); doc.setFontSize(7.5); ink(...DIM);
    doc.text(`GENERATED: ${new Date().toLocaleString().toUpperCase()}`, MG+12, y+32);
    doc.text(`${m.setDuration} MIN  ·  ${m.trackCount} TRACKS`, PW-MG-8, y+18, {align:'right'});
    y += 56;

    // ── SUMMARY CELLS ──
    const cells = [
      { label:'AVG BPM',      val: m.avgBPM?.toString()||'—',        color: WHITE },
      { label:'BPM SPREAD',   val: m.bpmRange!=null?`${m.bpmRange}`:'—', color: WHITE },
      { label:'ENERGY PEAK',  val: m.energyProfile.length ? Math.max(...m.energyProfile)+'%':'—', color: AMB },
      { label:'LICENSE AUDIT',val: m.licenseAudit.unlicensed>0?`${m.licenseAudit.unlicensed} FLAGGED`:'✓ CLEAR',
        color: m.licenseAudit.unlicensed>0 ? RED : GREEN },
    ];
    const CX = CW / cells.length;
    cells.forEach((c,i) => {
      const x = MG + i*CX;
      fill(...P2); doc.rect(x, y, CX-2, 38, 'F');
      ink(...DIM); doc.setFontSize(7); doc.setFont('courier','normal');
      doc.text(c.label, x+8, y+13);
      ink(...c.color); doc.setFontSize(13); doc.setFont('courier','bold');
      doc.text(c.val, x+8, y+30);
    });
    y += 48;

    // ── ENERGY SPARKLINE ──
    ink(...DIM); doc.setFontSize(7); doc.setFont('courier','normal');
    doc.text('ENERGY CURVE', MG, y-2);
    const SH = 42, ep = m.energyProfile;
    fill(...P3); doc.rect(MG, y, CW, SH, 'F');
    // Horizontal midline
    line(...DIM); doc.setLineWidth(0.3);
    doc.line(MG, y+SH/2, MG+CW, y+SH/2);
    if (ep.length > 1) {
      const sx = CW / (ep.length - 1);
      // Fill polygon under curve (approximated as filled quads)
      for (let i = 0; i < ep.length-1; i++) {
        const x1=MG+i*sx,   y1=y+SH-(ep[i]/100)*SH;
        const x2=MG+(i+1)*sx, y2=y+SH-(ep[i+1]/100)*SH;
        fill(30, 80, 55); // dark green fill
        doc.triangle(x1,y+SH, x2,y+SH, x1,y1,'F');
        doc.triangle(x2,y+SH, x2,y2,   x1,y1,'F');
      }
      // Line overlay
      line(...GREEN); doc.setLineWidth(1.4);
      for (let i=0; i<ep.length-1; i++) {
        doc.line(MG+i*sx, y+SH-(ep[i]/100)*SH, MG+(i+1)*sx, y+SH-(ep[i+1]/100)*SH);
      }
      // Dots
      fill(...GREEN);
      ep.forEach((e,i)=>{ doc.circle(MG+i*sx, y+SH-(e/100)*SH, 2,'F'); });
    } else {
      ink(...DIM); doc.setFontSize(8);
      doc.text('INSUFFICIENT DATA FOR CURVE', MG+CW/2, y+SH/2+4, {align:'center'});
    }
    y += SH + 14;

    // ── TABLE HEADER ──
    const COLS = ['#','TITLE / ARTIST','BPM','KEY','ENERGY','ROLE','LICENSE'];
    const CWS  = [22, 170, 42, 38, 48, 60, 65]; // sum = 445, rest is padding
    fill(...P3); doc.rect(MG, y, CW, 15, 'F');
    doc.setFont('courier','bold'); doc.setFontSize(7); ink(...DIM);
    let cx = MG+4;
    COLS.forEach((col,i)=>{ doc.text(col,cx,y+11); cx+=CWS[i]; });
    y += 17;

    // ── TRACK ROWS ──
    m.tracks.forEach((t, ri) => {
      if (y > PH-55) { doc.addPage(); page(); y=MG; }
      const isUnlic = t.license==='none'||t.license==='unknown';
      fill(...(ri%2===0?BG:P2)); doc.rect(MG, y, CW, 20, 'F');
      if (isUnlic) { fill(60,15,15); doc.rect(MG,y,CW,20,'F'); }
      cx = MG+4;
      const rowCells = [
        { txt: String(t.position).padStart(2,'0'), clr: DIM, bold: false },
        { txt: t.title.substring(0,26) + (t.title.length>26?'…':''), clr: WHITE, bold: true,
          sub: (t.artist||'').substring(0,26) },
        { txt: t.bpm?String(t.bpm):'—', clr: WHITE, bold: false },
        { txt: t.key||'—', clr: t.key?GREEN:DIM, bold: false },
        { txt: t.energy!=null?t.energy+'%':'—',
          clr: t.energy>75?RED:t.energy>45?AMB:GREEN, bold: false },
        { txt: (t.role||'—').toUpperCase().substring(0,7), clr: DIM, bold: false },
        { txt: (t.license||'UNKNOWN').toUpperCase(), clr: isUnlic?RED:GREEN, bold: false },
      ];
      rowCells.forEach((c,i)=>{
        doc.setFont('courier', c.bold?'bold':'normal');
        doc.setFontSize(c.bold?7.5:7);
        ink(...c.clr); doc.text(c.txt, cx, y+12);
        if (c.sub) { ink(...DIM); doc.setFontSize(6); doc.setFont('courier','normal'); doc.text(c.sub,cx,y+19); }
        cx += CWS[i];
      });
      y += 22;
    });

    // ── FOOTER ──
    y += 8; line(...DIM); doc.setLineWidth(0.4);
    doc.line(MG,y,PW-MG,y); y+=10;
    doc.setFont('courier','normal'); doc.setFontSize(7);
    if (m.licenseAudit.unlicensed>0) {
      ink(...RED);
      doc.text(`⚠  LICENSE ALERT: ${m.licenseAudit.unlicensed} UNLICENSED TRACK(S) — FLAGGED FOR REVIEW`, MG, y);
    } else { ink(...GREEN); doc.text('✓  ALL TRACKS LICENSED — CLEARED FOR PERFORMANCE', MG, y); }
    ink(...DIM); doc.text('SETFLOW PRO v1.0', PW-MG, y, {align:'right'});

    doc.save(`setflow-set-report-${new Date().toISOString().slice(0,10)}.pdf`);
    toast('PDF generated','grn');
  }

  // ── Export feedback helper (terminal status in panel) ──
  static _flash(msg) {
    const el = document.getElementById('dp-export-status');
    if (!el) return;
    el.textContent = msg; el.classList.add('visible');
    setTimeout(() => el.classList.remove('visible'), 2200);
  }
}

// ═══ SESSION MANAGER (C.2 — Rehydrator) ═══
class SessionManager {

  // ── File-input bridge: triggered by hidden <input type="file"> ──
  static _onFileSelect(input) {
    const file = input.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = e => SessionManager.import(e.target.result);
    reader.onerror = () => SessionManager._feedback('[ERROR] FILE READ FAILED', true);
    reader.readAsText(file);
    input.value = ''; // reset so same file can be re-selected
  }

  // ── Core import & rehydration ──
  static import(text) {
    // C.2.1 — Guard & Parse
    let manifest;
    try { manifest = JSON.parse(text); }
    catch (e) {
      SessionManager._feedback('[ERROR] PARSE FAILED — NOT VALID JSON', true);
      toast('Import failed: not valid JSON', '');
      return;
    }

    if (!manifest || manifest.app !== 'SetFlow Pro') {
      SessionManager._feedback('[ERROR] INVALID MANIFEST — WRONG SOURCE', true);
      toast('Import blocked: invalid SetFlow manifest', '');
      return;
    }

    if (!Array.isArray(manifest.tracks) || manifest.tracks.length === 0) {
      SessionManager._feedback('[ERROR] MANIFEST CORRUPT — NO TRACKS', true);
      toast('Import failed: manifest contains no tracks', '');
      return;
    }

    // Version compatibility check
    const ver = parseFloat(manifest.version || '0');
    if (ver < 1.0) {
      SessionManager._feedback('[WARN] LEGACY VERSION — PARTIAL RESTORE', false);
    }

    // C.2.2 — Rehydration Engine
    let patched = 0, ghosts = 0;

    manifest.tracks.forEach(mt => {
      const existing = tracks.find(t => t.id === mt.id);

      if (existing) {
        // ── Patch: merge manifest metadata onto live track ──
        if (mt.bpm    != null)       existing.bpm    = mt.bpm;
        if (mt.key)                  existing.key    = mt.key;
        if (mt.energy != null)       existing.energy = mt.energy;
        if (mt.genres?.length)       existing.genres = mt.genres;
        if (mt.role)                 existing.role   = mt.role;
        if (mt.license && mt.license !== 'unknown') existing.lic = mt.license;
        if (mt.licNote)              existing.licNote = mt.licNote;
        delete existing.isGhost; // promote ghost to real if file was loaded later
        patched++;
      } else {
        // ── Ghost Track: placeholder for file not in current session ──
        tracks.push({
          id:       mt.id,
          title:    mt.title  || 'UNKNOWN TRACK',
          artist:   mt.artist || 'UNKNOWN ARTIST',
          bpm:      mt.bpm    || null,
          key:      mt.key    || null,
          energy:   mt.energy ?? null,
          genres:   mt.genres || [],
          lic:      mt.license || 'unknown',
          licNote:  mt.licNote || '',
          role:     mt.role   || null,
          dur:      mt.durMin ? +(mt.durMin * 60).toFixed(0) : null,
          isGhost:  true,
          cover:    null,
        });
        ghosts++;
      }
    });

    // Restore set duration selector if present
    const durSel = document.getElementById('sp-dur-sel');
    if (durSel && manifest.setDuration) {
      const opts = Array.from(durSel.options).map(o => parseInt(o.value));
      const best = opts.length
        ? opts.reduce((a, b) => Math.abs(b - manifest.setDuration) < Math.abs(a - manifest.setDuration) ? b : a)
        : null;
      if (best) durSel.value = best;
    }

    // C.2.2 — DOM Sync (full refresh, non-destructive)
    UIController.syncAll();

    // Persist hydrated state to localStorage
    save();

    const summary = `[OK] SESSION RESTORED — ${patched} PATCHED  ${ghosts} GHOST${ghosts !== 1 ? 'S' : ''}`;
    SessionManager._feedback(summary, false);
    toast(`Session restored: ${patched + ghosts} tracks (${ghosts} ghost)`, 'grn');
  }

  // ── Feedback: reuses dp-export-status element ──
  static _feedback(msg, isError) {
    const el = document.getElementById('dp-export-status');
    if (!el) return;
    el.textContent = msg;
    el.style.color = isError ? 'var(--signal-alert)' : 'var(--signal-primary)';
    el.classList.add('visible');
    clearTimeout(SessionManager._ft);
    SessionManager._ft = setTimeout(() => {
      el.classList.remove('visible');
      el.style.color = ''; // reset to default green for export ops
    }, 4500);
  }
}

// ═══ HYDRATION MANAGER (C.3 — Ghost Rehydrator) ═══
class HydrationManager {

  // ── DND handlers: attached inline to <tr class="ghost-row"> via ren() ──
  static _onDragOver(e, trackId) {
    if (!e.dataTransfer.types.includes('Files')) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    const row = document.querySelector(`tr[data-track-id="${trackId}"]`);
    if (row) row.classList.add('dnd-hover');
  }

  static _onDragLeave(e, trackId) {
    // Only remove if truly leaving the row (not entering a child element)
    const row = document.querySelector(`tr[data-track-id="${trackId}"]`);
    if (row && !row.contains(e.relatedTarget)) row.classList.remove('dnd-hover');
  }

  static _onDrop(e, trackId) {
    e.preventDefault();
    const row = document.querySelector(`tr[data-track-id="${trackId}"]`);
    if (row) row.classList.remove('dnd-hover');
    const file = e.dataTransfer.files[0];
    if (!file) return;
    HydrationManager.promote(trackId, file);
  }

  // ── Click-to-link: ghost badge → hidden file picker ──
  static _promptFile(trackId) {
    HydrationManager._pendingId = trackId;
    const inp = document.getElementById('ghost-link-input');
    if (inp) inp.click();
  }

  static _onPick(input) {
    const file = input.files[0];
    const id   = HydrationManager._pendingId;
    HydrationManager._pendingId = null;
    input.value = ''; // reset so same file can re-trigger
    if (file && id != null) HydrationManager.promote(id, file);
  }

  // ── Core promotion pipeline ──
  static async promote(trackId, file) {
    // C.3 Guard: audio formats only
    if (!/\.(mp3|wav|aiff|aif|flac|m4a)$/i.test(file.name)) {
      toast('INVALID FILE TYPE — MP3/WAV/AIFF/FLAC/M4A only', '');
      SessionManager._feedback('[ERROR] INVALID FILE TYPE', true);
      return;
    }

    const track = tracks.find(t => t.id === trackId);
    if (!track) return;

    // Visual: loading state (amber pulse, block further interactions)
    const row = document.querySelector(`tr[data-track-id="${trackId}"]`);
    if (row) row.classList.add('is-loading');

    try {
      // Phase 1: Decode audio
      const buf = await audioEngine.loadFile(file, () => {});
      track.dur = Math.round(buf.duration);

      // Patch title/artist from filename only if still placeholder
      if (track.title === 'UNKNOWN TRACK' || track.title === 'UNKNOWN') {
        const nm = file.name.replace(/\.[^.]+$/, '');
        const parts = nm.split(' - ');
        track.title  = parts[1] || nm;
        track.artist = parts[0] || 'Unknown';
      }

      // Phase 2: Rhythm + Texture (sync, ~30ms, safe on main thread)
      track.bpm    = AudioEngine.detectBPM(buf);
      const tex    = AudioEngine.calcTexture(buf);
      track.energy = tex.energy;

      // Phase 3: Harmonic analysis (heavy FFT — yield before)
      await new Promise(r => setTimeout(r, 0));
      const keyResult = AudioEngine.detectKey(buf);
      if (keyResult.camelot) track.key = keyResult.camelot;

      // Phase 4: Genre classification (yield)
      await new Promise(r => setTimeout(r, 0));
      const bpmNorm = Math.max(0, Math.min(1, (track.bpm - 60) / 140));
      const [g1, g2] = GenreEngine.classify([bpmNorm, tex.rmsNorm, tex.zcrNorm]);
      track.genres = g1 === 'UNKNOWN' ? [] : (g2 === 'UNKNOWN' ? [g1] : [g1, g2]);

      // Promotion: remove ghost flag, register file binary ref
      _trackFiles.set(trackId, file);
      delete track.isGhost;
      track.a = true; // mark as fully analyzed

      // Persist
      save();
      sts();

      // Visual transition: loading → promotion sweep → ui-data-pulse
      if (row) {
        row.classList.remove('is-loading', 'ghost-row');
        row.classList.add('promotion-flash');
        setTimeout(() => {
          row.classList.remove('promotion-flash');
          UIController.syncTrack(trackId); // applies standard ui-data-pulse + DOM patch
        }, 580);
      } else {
        UIController.syncTrack(trackId);
      }

      toast(`PROMOTED: ${track.title} — ${track.bpm} BPM  ${track.key || ''}`, 'grn');

    } catch (err) {
      if (row) row.classList.remove('is-loading');
      toast(`PROMOTION FAILED: ${err.message || 'DECODE ERROR'}`, '');
      SessionManager._feedback('[ERROR] PROMOTION FAILED — CHECK FILE', true);
    }
  }
}

// Resume AudioContext on first user gesture (autoplay policy compliance)
document.addEventListener('click', () => audioEngine.resume(), { once: true });
document.addEventListener('keydown', () => audioEngine.resume(), { once: true });

// ═══ TRACK MANAGEMENT ═══
function fi2(e){proc(Array.from(e.target.files))}
function dzo(e){e.preventDefault();document.getElementById('dz').classList.add('drag')}
function dzl(){document.getElementById('dz').classList.remove('drag')}
function dzd(e){
  e.preventDefault();dzl();
  const fs=Array.from(e.dataTransfer.files).filter(f=>/\.(mp3|wav|aiff|flac|m4a)$/i.test(f.name));
  if(fs.length)proc(fs);
}

// ── LANDING SCREEN HANDLERS ──
function lpDragOver(e){
  e.preventDefault();
  document.getElementById('lp-screen').classList.add('drag-active');
}
function lpDragLeave(e){
  // Only clear if we've truly left the drop zone (not entered a child)
  if(!document.getElementById('lp-dz').contains(e.relatedTarget)){
    document.getElementById('lp-screen').classList.remove('drag-active');
  }
}
function lpDrop(e){
  e.preventDefault();
  document.getElementById('lp-screen').classList.remove('drag-active');
  const fs=Array.from(e.dataTransfer.files).filter(f=>/\.(mp3|wav|aiff|flac|m4a)$/i.test(f.name));
  if(fs.length) proc(fs);
}
function proc(fs){
  const n=Date.now();
  const newTracks=fs.map((f,i)=>{
    const id=n+i;
    const nm=f.name.replace(/\.[^.]+$/,''),p=nm.split(' - ');
    _trackFiles.set(id, f);
    return{id,title:p[1]||nm,artist:p[0]||'Unknown',bpm:null,genres:[],energy:null,role:null,vibe:[],key:null,dur:null,a:false,cover:null,lic:'unknown',licNote:'',isOwn:false,ownArtist:null};
  });
  tracks=[...tracks,...newTracks];
  sts();ren();show();save();toast(`${fs.length} Tracks importiert`);
}

function uploadCover(id){
  const inp=document.createElement('input');inp.type='file';inp.accept='image/*';
  inp.onchange=e=>{
    const f=e.target.files[0];if(!f)return;
    const r=new FileReader();
    r.onload=ev=>{
      const t=tracks.find(t=>t.id===id);if(!t)return;
      const img=new Image();
      img.onload=()=>{
        const MAX=200;
        const scale=Math.min(1,MAX/Math.max(img.width,img.height));
        const c=document.createElement('canvas');
        c.width=Math.round(img.width*scale);c.height=Math.round(img.height*scale);
        c.getContext('2d').drawImage(img,0,0,c.width,c.height);
        t.cover=c.toDataURL('image/jpeg',0.8);ren();rp();save();toast('Cover hinzugefügt','grn');
      };
      img.src=ev.target.result;
    };
    r.readAsDataURL(f);
  };inp.click();
}

async function runAI(){
  const todo=tracks.filter(t=>!t.a);
  if(!todo.length){toast('Alle Tracks analysiert');return}
  document.getElementById('ab').classList.add('vis');
  document.getElementById('aib').disabled=true;
  const GENRE_COMBOS=[
    ['Deep House'],['House'],['Techno'],['Melodic Techno'],
    ['House','Deep House'],['Techno','Dub Techno'],
    ['Afro House','Deep House'],['Disco House','House'],
    ['Deep House','Minimal'],['Techno','Industrial'],
  ];
  for(let i=0;i<todo.length;i++){
    const t=todo[i];
    document.getElementById('ap').style.width=Math.round((i+1)/todo.length*100)+'%';
    document.getElementById('apt').textContent=`${i+1}/${todo.length}`;
    await new Promise(r=>setTimeout(r,150));
    t.bpm=118+Math.floor(Math.random()*18);
    t.energy=30+Math.floor(Math.random()*65);
    t.key=['1A','2A','3A','4A','5A','6A','7A','8A','9A','10A','11A','12A'][Math.floor(Math.random()*12)];
    t.genres=GENRE_COMBOS[Math.floor(Math.random()*GENRE_COMBOS.length)];
    t.role=t.energy<40?'opener':t.energy<60?'build':t.energy<80?'peak':'closing';
    t.vibe=t.energy<50?['melodic']:t.energy>75?['dark']:['night'];
    t.a=true;ren();
  }
  document.getElementById('ab').classList.remove('vis');
  document.getElementById('aib').disabled=false;
  save();sts();toast('Analyse abgeschlossen','grn');
}

function show(){
  // Hide landing screen on first track load
  const lp = document.getElementById('lp-screen');
  if(lp) lp.style.display='none';
  document.getElementById('dz').style.display='none';
  document.getElementById('fb').classList.add('vis');
  document.getElementById('tbl').style.display='table';
}

function bc(b){if(!b)return'';if(b<122)return'z1';if(b<126)return'z2';if(b<130)return'z3';if(b<134)return'z4';return'z5'}
function ec(e){
  if(!e)return'rgba(255,255,255,0.12)';
  if(e<40)return'var(--signal-primary)';
  if(e<60)return'var(--blue)';
  if(e<80)return'#c8d8ff';
  return'var(--signal-alert)';
}
const RC={opener:'co',build:'cb',peak:'cp',closing:'cc'};
const VC={day:'cd',night:'cn',dark:'ck',melodic:'cm',tribal:'ct2'};
const ROLE_PILL={opener:'pill-opener',build:'pill-build',peak:'pill-peak',closing:'pill-closing'};
const ROLE_DOTS={opener:'var(--signal-primary)',build:'var(--blue)',peak:'var(--accent-white)',closing:'var(--signal-warning)'};
function cr(r){
  if(!r)return'<span style="color:var(--accent-dim);font-size:10px">—</span>';
  return`<span class="status-pill ${ROLE_PILL[r]||''}"><span class="sp-dot" style="background:${ROLE_DOTS[r]||'currentColor'}"></span>${r}</span>`;
}

function genreChips(genres){
  if(!genres||!genres.length)return'<span style="color:var(--accent-dim);font-size:10px;letter-spacing:1px">—</span>';
  return genres.map((g,i)=>
    `<span class="tag-pill${i===0?' tag-primary':''}"><span class="tag-pill-dot"></span>${esc(g)}</span>`
  ).join('');
}

function coverCell(t){
  if(t.cover)return`<div class="cover-wrap"><img src="${t.cover}" alt=""></div>`;
  return`<div class="cover-vinyl"><span class="icon-wrapper">${getIcon('ORBIT',38)}</span></div>`;
}

function filtered(){
  let list=tracks;
  if(fil==='untagged')list=list.filter(t=>!t.role);
  else if(fil==='lic-warn')list=list.filter(t=>t.lic==='none'||t.lic==='unknown');
  else if(fil==='own')list=list.filter(t=>t.isOwn);
  else if(fil!=='all')list=list.filter(t=>t.role===fil);
  if(q){const lq=q.toLowerCase();list=list.filter(t=>t.title.toLowerCase().includes(lq)||t.artist.toLowerCase().includes(lq)||(t.genres||[]).join(' ').toLowerCase().includes(lq))}
  return list;
}

function ren(){
  const list=filtered();
  document.getElementById('em').style.display=list.length?'none':'block';
  document.getElementById('tbd').innerHTML=list.map((t,i)=>`
    <tr data-track-id="${t.id}" onclick="selT(${t.id})" class="${sel?.id===t.id?'sel':''}${t.isGhost?' ghost-row':''}"${t.isGhost?` ondragover="HydrationManager._onDragOver(event,${t.id})" ondragleave="HydrationManager._onDragLeave(event,${t.id})" ondrop="HydrationManager._onDrop(event,${t.id})"`:''}>
      <td class="td-num tno">${String(i+1).padStart(2,'0')}</td>
      <td class="td-cover">${coverCell(t)}</td>
      <td>
        <div class="tn" style="display:flex;align-items:center;gap:4px">${esc(t.title)}${t.isGhost?`<span class="ghost-badge" title="Click to link real file — or drag & drop audio onto this row" onclick="event.stopPropagation();HydrationManager._promptFile(${t.id})">⇡ GHOST</span>`:''}${t.isOwn?` <span style="font-size:9px;color:var(--green);font-family:var(--M);letter-spacing:1px">★ EIGEN</span>`:''}${sel?.id===t.id?`<span class="neural-match-node" onclick="event.stopPropagation();nmShow(event,${t.id})" title="NEURAL MATCH"><svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="7" cy="7" r="2" fill="var(--signal-primary)"/><circle cx="2" cy="3" r="1.2" fill="var(--signal-primary)" opacity=".7"/><circle cx="12" cy="3" r="1.2" fill="var(--signal-primary)" opacity=".7"/><circle cx="2" cy="11" r="1.2" fill="var(--signal-primary)" opacity=".7"/><circle cx="12" cy="11" r="1.2" fill="var(--signal-primary)" opacity=".7"/><line x1="7" y1="5" x2="2.8" y2="3.8" stroke="var(--signal-primary)" stroke-width=".8" opacity=".5"/><line x1="7" y1="5" x2="11.2" y2="3.8" stroke="var(--signal-primary)" stroke-width=".8" opacity=".5"/><line x1="7" y1="9" x2="2.8" y2="10.2" stroke="var(--signal-primary)" stroke-width=".8" opacity=".5"/><line x1="7" y1="9" x2="11.2" y2="10.2" stroke="var(--signal-primary)" stroke-width=".8" opacity=".5"/></svg></span>`:''}</div>
        <div class="ta">${esc(t.artist)}</div>
      </td>
      <td>${genreChips(t.genres)}</td>
      <td class="tbpm ${bc(t.bpm)}">${t.bpm||'—'}</td>
      <td><div class="eb"><div class="et"><div class="ef" style="width:${t.energy||0}%;background:${ec(t.energy)}"></div></div><span class="ev">${t.energy||'—'}</span></div></td>
      <td>${cr(t.role)}</td>
      <td>${licBadge(t.lic)}</td>
    </tr>`).join('');
}

function sts(){
  const n=tracks.length,tagged=tracks.filter(t=>t.role).length;
  const unlicensed=tracks.filter(t=>t.lic==='none'||t.lic==='unknown').length;
  const _set=(id,v)=>{const el=document.getElementById(id);if(el)el.textContent=v;};
  _set('ca',n);_set('s1',n);_set('s2',tagged);
  ['opener','build','peak','closing'].forEach(r=>{
    const el=document.getElementById('c'+r[0]);if(el)el.textContent=tracks.filter(t=>t.role===r).length;
  });
  _set('cl-own',tracks.filter(t=>t.lic==='own').length);
  _set('cl-lic',tracks.filter(t=>t.lic==='licensed').length);
  _set('cl-pro',tracks.filter(t=>t.lic==='promo').length);
  _set('cl-non',tracks.filter(t=>t.lic==='none').length);
  const bs=tracks.filter(t=>t.bpm).map(t=>t.bpm);
  _set('s3',bs.length?Math.round(bs.reduce((a,b)=>a+b)/bs.length):'—');
  _set('s4',unlicensed);
  const w=document.getElementById('s4-warn');
  if(w){w.style.color=unlicensed>0?'var(--red)':'var(--ink3)';w.textContent=unlicensed>0?'⚠ Unl.':'Genres';}
}

function sf(f,el){fil=f;document.querySelectorAll('.fp').forEach(p=>p.className='fp');el.className='fp on';ren()}
function qf(f){fil=f;ren()}
function lf(f){fil=f;ren()}
function doQ(v){
  q=v;
  /* keep both search inputs in sync */
  const tb=document.getElementById('topbar-search');
  const fb=document.querySelector('.srch');
  if(tb&&tb.value!==v)tb.value=v;
  if(fb&&fb.value!==v)fb.value=v;
  ren();
}

// ═══ VINYL MANAGEMENT ═══
function renderVinyl(){
  const grid=document.getElementById('vinyl-grid');
  const empty=document.getElementById('em-vinyl');
  if(vinylRecords.length===0){grid.innerHTML='';empty.style.display='block';return;}
  empty.style.display='none';
  grid.innerHTML=vinylRecords.map(v=>`
    <div class="vinyl-card" onclick="selVinyl(${v.id})">
      <div class="vinyl-card-cover" style="display:flex;align-items:center;justify-content:center">
        ${v.cover?`<img src="${v.cover}" style="width:100%;height:100%;object-fit:cover;">`:`<span class="icon-wrapper">${getIcon('ORBIT',60)}</span>`}
      </div>
      <div class="vinyl-card-title">${v.title||'Unknown Title'}</div>
      <div class="vinyl-card-meta">${v.artist||'Unknown Artist'}</div>
      <div class="vinyl-card-meta" style="font-size:9px">${v.label||''} ${v.year?'· '+v.year:''}</div>
    </div>`).join('');
}
let _scanner=null;

function addVinyl(){
  // populate link dropdown
  const sel2=document.getElementById('v-link');
  sel2.innerHTML='<option value="">-- No Digital Track --</option>'+
    tracks.map(t=>`<option value="${t.id}">${t.artist} — ${t.title}</option>`).join('');
  // clear fields
  ['v-search','v-title','v-artist','v-label','v-year'].forEach(id=>document.getElementById(id).value='');
  document.getElementById('scanner-container').style.display='none';
  document.getElementById('vmodal').classList.add('open');
}

function closeVModal(){
  if(_scanner){_scanner.stop().catch(()=>{});_scanner=null;}
  document.getElementById('scanner-container').style.display='none';
  document.getElementById('vmodal').classList.remove('open');
}

async function fetchDiscogs(query){
  const q=query||document.getElementById('v-search').value.trim();
  if(!q){toast('Enter a search term','');return;}
  toast('Searching Discogs…','');
  try{
    const res=await fetch(`https://api.discogs.com/database/search?q=${encodeURIComponent(q)}&type=release&per_page=1`,
      {headers:{'User-Agent':'SetFlow/1.0'}});
    const data=await res.json();
    const r=data.results&&data.results[0];
    if(!r){toast('No results found','');return;}
    const parts=(r.title||'').split(' - ');
    document.getElementById('v-artist').value=parts[0]||'';
    document.getElementById('v-title').value=parts[1]||r.title||'';
    document.getElementById('v-label').value=(r.label&&r.label[0])||'';
    document.getElementById('v-year').value=r.year||'';
    toast('Discogs: record found','grn');
  }catch(e){toast('Discogs unavailable','');console.warn(e);}
}

function startScanner(){
  const container=document.getElementById('scanner-container');
  container.style.display='block';
  container.innerHTML='';
  if(typeof Html5Qrcode==='undefined'){toast('Scanner lib not loaded','');return;}
  _scanner=new Html5Qrcode('scanner-container');
  _scanner.start(
    {facingMode:'environment'},
    {fps:10,qrbox:200},
    code=>{_scanner.stop().catch(()=>{});_scanner=null;container.style.display='none';
      document.getElementById('v-search').value=code;fetchDiscogs(code);},
    ()=>{}
  ).catch(()=>toast('Camera access denied',''));
}

function saveVinyl(){
  const title=document.getElementById('v-title').value.trim();
  const artist=document.getElementById('v-artist').value.trim();
  if(!title&&!artist){toast('Enter at least a title or artist','');return;}
  const linkedTrackId=document.getElementById('v-link').value||null;
  const rec={
    id:Date.now(),isVinyl:true,
    title:title||'Unknown Title',
    artist:artist||'Unknown Artist',
    label:document.getElementById('v-label').value.trim()||'',
    year:document.getElementById('v-year').value.trim()||'',
    cover:null,linkedTrackId:linkedTrackId?+linkedTrackId:null,role:null
  };
  vinylRecords.push(rec);
  save();renderVinyl();
  closeVModal();
  toast('Vinyl record saved','grn');
}

function selVinyl(id){
  sel=vinylRecords.find(v=>v.id===id);
  document.getElementById('pnl').classList.add('open');
  rvp();
}

function rvp(){
  const v=sel;if(!v||!v.isVinyl)return;
  const linked=v.linkedTrackId?tracks.find(t=>t.id===v.linkedTrackId):null;
  document.getElementById('pi').innerHTML=`
    <div class="panel-cover" style="cursor:default;background:var(--paper3);display:flex;align-items:center;justify-content:center">
      ${v.cover?`<img src="${v.cover}" style="width:100%;height:100%;object-fit:cover">`
        :`<span class="icon-wrapper">${getIcon('ORBIT',80)}</span>`}
    </div>
    <button class="px" onclick="closeP()" style="top:8px;right:8px">×</button>
    <div class="p-label">Vinyl Record</div>
    <div class="p-name">${v.title}</div>
    <div class="p-art">${v.artist}</div>
    <div class="pr"><span class="pl">Label</span><span class="pv">${v.label||'—'}</span></div>
    <div class="pr"><span class="pl">Year</span><span class="pv">${v.year||'—'}</span></div>
    <div class="sl2">Digital Link</div>
    ${linked
      ?`<div style="display:flex;align-items:center;gap:8px;padding:6px 0;border-bottom:1px solid var(--rule);cursor:pointer" onclick="selT(${linked.id})">
          <div style="width:26px;height:26px;flex-shrink:0">${coverCell(linked)}</div>
          <div style="flex:1;min-width:0;font-size:11px;font-family:var(--M);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${linked.title}</div>
          <span class="badge-digital">D</span>
        </div>
        <button class="btn b-out" style="margin-top:8px;width:100%" onclick="unlinkVinyl(${v.id})">Remove Link</button>`
      :`<div style="color:var(--ink3);font-size:11px;font-family:var(--S);padding:6px 0">No digital track linked.</div>
        <a href="https://www.youtube.com/results?search_query=${encodeURIComponent(v.artist+' '+v.title)}" target="_blank" class="btn b-out" style="margin-top:6px;width:100%;justify-content:center;text-decoration:none">▶ Pre-listen on YouTube</a>`}
  `;
  document.getElementById('pnl').classList.add('open');
}

function unlinkVinyl(id){
  const v=vinylRecords.find(x=>x.id===id);
  if(v){v.linkedTrackId=null;save();rvp();toast('Link removed','');}
}

// ═══ ARTIST MANAGEMENT ═══
// Artist management module completely removed as per Analog Heritage specifications.


function applyRhythm(track){
  const root=document.documentElement;
  if(track&&track.bpm){
    const duration=(60/track.bpm).toFixed(3);
    root.style.setProperty('--pulse-speed',duration+'s');
    document.body.classList.add('rhythm-on');
  }else{
    root.style.setProperty('--pulse-speed','0s');
    document.body.classList.remove('rhythm-on');
  }
}

function applyAtmosphere(track){
  if(!track)return;
  const root=document.documentElement;
  let bg='#f9f7f2',accent='#8a9a5b',ink='#1a1a1a';
  const vibe=track.vibe?.[0]||'default';
  const energy=track.energy||50;
  if(vibe==='day'){
    bg=energy>60?'#fdf5e6':'#ffffff';
    accent=energy>60?'#e3b448':'#c5d1a5';
  }else if(vibe==='night'){
    bg=energy>60?'#dcdde1':'#e2e5e9';
    accent=energy>60?'#4a5d4e':'#7a8a99';
  }else if(vibe==='dark'){
    bg='#1a1a1a';accent='#3d4d3d';ink='#f9f7f2';
  }else if(vibe==='melodic'){
    bg='#f4f1ea';accent='#b8c4bb';
  }
  root.style.setProperty('--atm-bg',bg);
  root.style.setProperty('--atm-accent',accent);
  root.style.setProperty('--atm-ink',ink);
  root.style.setProperty('--atm-energy',energy);
}

function selT(id){ UIController.openDetail(id); }
function closeP(){ UIController.closeDetail(); }

// Live-sync manual override: flags field as user-defined, patches model, syncs DOM
function updateTrackField(id, field, value) {
  const t = tracks.find(tr => tr.id === id);
  if (!t) return;
  t[field] = value;
  UIController.syncTrack(id);
  save();
}

function rp(){
  const t=sel; if(!t)return;
  const licWarn=(t.lic==='none'||t.lic==='unknown');
  const durFmt=t.dur?(Math.floor(t.dur/60)+':'+String(t.dur%60).padStart(2,'0')):'—';
  const hasFile=_trackFiles.has(t.id);
  const coverHtml=t.cover
    ?`<img src="${t.cover}" alt="">`
    :`<div class="dp-cover-default">${vSVGLg(t,48)}</div>`;
  const LIC_LABELS={own:'OWN PROD.',licensed:'LICENSED',promo:'PROMO',none:'NO LIC.',unknown:'UNKNOWN'};

  document.getElementById('pi').innerHTML=`
    <!-- ── HEADER ── -->
    <div class="dp-header">
      <div class="dp-cover" onclick="uploadCover(${t.id})" title="Add cover art">
        ${coverHtml}<div class="dp-cover-overlay">+ COVER</div>
      </div>
      <div class="dp-header-meta">
        <div class="dp-track-title">${t.title}${t.isOwn?` <span class="dp-own-star">★</span>`:''}</div>
        <div class="dp-track-artist">${t.artist}</div>
        <div class="dp-header-badges">${licBadge(t.lic)}${t.role?' '+cr(t.role):''}</div>
      </div>
      <button class="dp-close-btn" onclick="closeP()">×</button>
    </div>

    ${t.isGhost ? `
    <!-- ── C.4 GHOST BANNER ── -->
    <div class="dp-ghost-banner">
      <div class="dp-ghost-banner-label"><span>⇡</span>GHOST TRACK — NO AUDIO LINKED</div>
      <div class="dp-ghost-banner-sub">Metadata restored from session manifest. Link a real audio file to enable full analysis and playback.</div>
      <button class="dp-ghost-link-btn"
        onclick="this.disabled=true;this.innerHTML='<span>↻</span>LINKING...';HydrationManager._promptFile(${t.id})">
        <span>⇡</span>LINK REAL FILE — REHYDRATE
      </button>
    </div>` : ''}

    <!-- ── SIGNAL TELEMETRY (read-only) ── -->
    <div class="dp-section-label">SIGNAL TELEMETRY</div>
    <div class="dp-telemetry">
      <div class="dp-tl-cell">
        <span class="dp-tl-key">BPM</span>
        <span class="dp-tl-val ${bc(t.bpm)}">${t.bpm||'—'}</span>
      </div>
      <div class="dp-tl-cell">
        <span class="dp-tl-key">KEY</span>
        <span class="dp-tl-val" style="color:var(--signal-primary)">${t.key||'—'}</span>
      </div>
      <div class="dp-tl-cell">
        <span class="dp-tl-key">ENERGY</span>
        <span class="dp-tl-val" style="color:${ec(t.energy)}">${t.energy!=null?t.energy+'%':'—'}</span>
      </div>
      <div class="dp-tl-cell">
        <span class="dp-tl-key">DURATION</span>
        <span class="dp-tl-val">${durFmt}</span>
      </div>
    </div>
    <div class="dp-energy-track">
      <div class="dp-energy-fill" style="width:${t.energy||0}%;background:${ec(t.energy)}"></div>
    </div>
    <div class="dp-genres-row">${genreChips(t.genres)}</div>
    <button class="dp-scan-btn${hasFile?'':' dp-scan-disabled'}" onclick="${hasFile?'openIE(sel)':''}">
      <span>⬡</span>${hasFile?'RUN SIGNAL SCAN':'DROP FILE TO ENABLE SCAN'}
    </button>

    <!-- ── IE QUICK ACTIONS ── -->
    <div class="dp-ie-action-row">
      <button class="dp-action-btn" onclick="openIE(sel)">⬡ INTEL ENGINE</button>
      <button class="dp-action-btn danger" onclick="delT(${t.id})">✕ REMOVE</button>
    </div>

    <!-- ── NEURAL MATCH / COMPATIBILITY ── -->
    <div class="dp-divider"></div>
    <div class="dp-section-label">NEURAL MATCH / COMPATIBILITY</div>
    <div class="dp-compat-grid">${(()=>{
      const matches = findCompatibleTracks(t, 6);
      if (!matches.length) return '<span class="dp-no-matches">NO COMPATIBLE TRACKS IN LIBRARY</span>';
      return matches.map(m => {
        const cls = m._nexusScore >= 0.75 ? 'match-high' : 'match-med';
        const pct  = Math.round(m._nexusScore * 100);
        return `<div class="dp-match-chip ${cls}" onclick="selT(${m.id})">
          <span class="dp-mc-title">${m.title}</span>
          <span class="dp-mc-meta">${m.bpm||'—'} BPM · ${m.key||'—'}</span>
          <span class="dp-mc-score">${pct}%</span>
        </div>`;
      }).join('');
    })()}</div>

    <!-- ── SET ROLE ── -->
    <div class="dp-divider"></div>
    <div class="dp-section-label">SET ROLE</div>
    <div class="dp-btn-grid">
      ${['opener','build','peak','closing'].map(r=>
        `<button class="dp-role-btn${t.role===r?' dp-role-active':''}" onclick="openGigPlanner(${t.id},'${r}')">${r.toUpperCase()}</button>`
      ).join('')}
    </div>

    <!-- ── VIBE TAGS ── -->
    <div class="dp-section-label">VIBE TAGS</div>
    <div class="dp-btn-grid">
      ${['day','night','dark','melodic','tribal'].map(v=>
        `<button class="dp-vibe-btn${(t.vibe||[]).includes(v)?' dp-vibe-active':''}" onclick="tV(${t.id},'${v}')">${v.toUpperCase()}</button>`
      ).join('')}
    </div>

    <!-- ── MANUAL OVERRIDE ── -->
    <div class="dp-divider"></div>
    <div class="dp-section-label">MANUAL OVERRIDE</div>
    <div class="dp-field-row">
      <label class="dp-field-label">BPM</label>
      <input class="dp-field-input" type="number" min="60" max="220" value="${t.bpm||''}" placeholder="—"
        onchange="updateTrackField(${t.id},'bpm',+this.value||null)">
    </div>
    <div class="dp-field-row">
      <label class="dp-field-label">KEY</label>
      <input class="dp-field-input" type="text" value="${t.key||''}" placeholder="e.g. 8A, 12B"
        onchange="updateTrackField(${t.id},'key',this.value.trim()||null)">
    </div>
    <div class="dp-field-row">
      <label class="dp-field-label">GENRE</label>
      <input class="dp-field-input" type="text" value="${(t.genres||[]).join(', ')}" placeholder="House, Techno..."
        onchange="updGenres(${t.id},this.value)">
    </div>
    <div class="dp-field-row">
      <label class="dp-field-label">ENERGY</label>
      <input class="dp-energy-slider" type="range" min="0" max="100" value="${t.energy||50}"
        oninput="uE(${t.id},this.value)">
    </div>

    <!-- ── LICENSE ── -->
    <div class="dp-divider"></div>
    <div class="dp-section-label">LICENSE STATUS</div>
    <div class="dp-lic-grid">
      ${['own','licensed','promo','none','unknown'].map(l=>
        `<button class="dp-lic-btn dp-lic-${l}${t.lic===l?' active':''}" onclick="setLic(${t.id},'${l}')">${LIC_LABELS[l]}</button>`
      ).join('')}
    </div>
    <textarea class="dp-lic-note" placeholder="License notes..."
      oninput="updLicNote(${t.id},this.value)">${t.licNote||''}</textarea>

    <label class="dp-own-toggle">
      <input type="checkbox" ${t.isOwn?'checked':''} onchange="setOwn(${t.id},this.checked)">
      <span>Own Production / Artist Track</span>
    </label>
    ${t.isOwn?`<input class="dp-field-input" style="margin:0 12px 8px;width:calc(100% - 24px);box-sizing:border-box" type="text" value="${t.ownArtist||''}" placeholder="Artist name..." onchange="updOwnArtist(${t.id},this.value)">`:''}

    ${licWarn?`<div class="dp-lic-warning"><span>⚠</span><span>No valid license for club performances. Clarify before set.</span></div>`:''}

    <!-- ── EXPORT HUB ── -->
    <div class="dp-divider"></div>
    <div class="dp-section-label">SET EXPORT</div>
    <div class="dp-export-section">
      <div class="dp-export-grid">
        <button class="dp-export-btn" onclick="SetExporter.exportJSON();SetExporter._flash('EXPORTING JSON...')">
          <span class="eb-icon">⬡</span>EXPORT JSON — FULL BACKUP
        </button>
        <button class="dp-export-btn" onclick="SetExporter.copySetlist();SetExporter._flash('COPYING SETLIST...')">
          <span class="eb-icon">⎘</span>COPY SETLIST — CLIPBOARD
        </button>
        <button class="dp-export-btn primary" onclick="SetExporter.generatePDF();SetExporter._flash('GENERATING PDF...')">
          <span class="eb-icon">▤</span>GENERATE PDF — SET SHEET
        </button>
        <button class="dp-export-btn import" onclick="document.getElementById('session-import-input').click()">
          <span class="eb-icon">⇡</span>IMPORT SESSION — REHYDRATE
        </button>
      </div>
      <div class="dp-export-status" id="dp-export-status"></div>
    </div>
    <div class="dp-bottom"></div>
  `;
}

function updGenres(id,val){
  const t=tracks.find(t=>t.id===id);
  if(t){t.genres=val.split(',').map(s=>s.trim()).filter(Boolean);ren();save();}
}
function uE(id,v){const t=tracks.find(t=>t.id===id);if(t){t.energy=+v;const e=document.getElementById('ev2');if(e)e.textContent=v;ren();save();}}

function tV(id,v){
  const t=tracks.find(t=>t.id===id);if(!t)return;
  if(!t.vibe)t.vibe=[];
  const i=t.vibe.indexOf(v);if(i>=0)t.vibe.splice(i,1);else t.vibe.push(v);
  rp();ren();save();
}
function setLic(id,lic){
  const t=tracks.find(t=>t.id===id);
  if(t){t.lic=lic;rp();ren();sts();save();}
}
function updLicNote(id,v){const t=tracks.find(t=>t.id===id);if(t){t.licNote=v;save();}}
function setOwn(id,v){
  const t=tracks.find(t=>t.id===id);
  if(t){t.isOwn=v;if(v)t.lic='own';rp();ren();sts();save();}
}
function updOwnArtist(id,v){const t=tracks.find(t=>t.id===id);if(t){t.ownArtist=v;save();}}

function goView(v,el){
  ['vl','vv','vs','vhb','vseq'].forEach(id=>document.getElementById(id).style.display='none');
  const viewMap={library:'vl',vinyl:'vv',set:'vs',hybrid:'vhb',seq:'vseq'};
  const flexViews={library:1,vinyl:1,hybrid:1,seq:1};
  const target=document.getElementById(viewMap[v]||'vl');
  target.style.display=flexViews[v]?'flex':'block';
  document.querySelectorAll('.ni').forEach(n=>n.classList.remove('on'));
  if(el)el.classList.add('on');
  const labels={library:'— All Tracks',vinyl:'— Physical Records',set:'— Set Planner',hybrid:'— Hybrid Bridge',seq:'— Performance Sequencer'};
  document.getElementById('vsub').textContent=labels[v]||'';
  if(v==='set')buildSet();
  
  if(v==='vinyl')renderVinyl();
  if(v==='hybrid')renderHB();
  if(v==='seq')renderSP();
}

// ═══ SET PLANNER ═══
const RC2={opener:'var(--green)',build:'var(--blue)',peak:'var(--ink)',closing:'var(--amber)'};
function buildSet(){
  const sdurEl=document.getElementById('sdur');if(!sdurEl)return;
  const dur=parseInt(sdurEl.value)||90;
  const amid=document.getElementById('amid');if(amid)amid.textContent=Math.round(dur/2)+'min';
  const aend=document.getElementById('aend');if(aend)aend.textContent=dur+'min';
  const prof=[15,18,23,30,38,46,55,63,70,76,82,86,88,88,85,80,72,60,44,28];
  const ra=i=>i<5?'opener':i<10?'build':i<16?'peak':'closing';
  const sbars=document.getElementById('sbars');
  if(sbars)sbars.innerHTML=prof.map((h,i)=>`
    <div class="bar" style="height:${h}%;background:${RC2[ra(i)]};opacity:${ra(i)==='peak'?0.9:0.65}"></div>`).join('');
  const secs=[
    {r:'opener',c:'var(--green)',l:'Opener'},
    {r:'build',c:'var(--blue)',l:'Build Up'},
    {r:'peak',c:'var(--ink)',l:'Peak'},
    {r:'closing',c:'var(--amber)',l:'Closing'},
  ];
  const ssec=document.getElementById('ssec');if(!ssec)return;
  ssec.innerHTML=secs.map(s=>{
    const list=tracks.filter(t=>t.role===s.r).slice(0,6);
    return`<div class="sec">
      <div class="sech"><div class="sect" style="color:${s.c}">${s.l}</div><div class="secc">${list.length} tracks</div></div>
      ${list.length?list.map(t=>`
        <div class="stk" onclick="selT(${t.id})">
          <div class="stk-cover">${t.cover?`<img src="${t.cover}">`:`<span class="icon-wrapper">${vinylRecords.find(v=>v.linkedTrackId===t.id)?getIcon('ORBIT',28):getIcon('SEED',28)}</span>`}</div>
          <div class="stki">
            <div class="stkn">${t.title}${t.isOwn?' ★':''}</div>
            <div class="stka">${t.artist}</div>
          </div>
          <span class="stkb" style="color:${s.c}">${t.bpm||'—'}</span>
          <span class="stkk">${t.key||''}</span>
          ${(t.lic==='none'||t.lic==='unknown')?`<span style="color:var(--red);font-size:10px;font-family:var(--M)">⚠</span>`:''}
          ${vinylRecords.find(v=>v.linkedTrackId===t.id)?`<span class="badge-vinyl">V</span>`:`<span class="badge-digital">D</span>`}
        </div>`).join('')
      :`<div class="se">No ${s.l} tracks tagged.</div>`}
    </div>`;
  }).join('');
}
function autoFill(){toast('Set auto-filled','grn');buildSet()}

// ═══ EXPORT (REKORDBOX) ═══
function openExp(){
  const tg=tracks.filter(t=>t.role);
  if(!tg.length){toast('Keine getaggten Tracks');return}
  const warn=tg.filter(t=>t.lic==='none'||t.lic==='unknown');
  if(warn.length){
    if(!confirm(`⚠ ${warn.length} Track(s) ohne Lizenz im Set. Trotzdem exportieren?`))return;
  }
  document.getElementById('eprev').textContent=mkXML(tg).slice(0,560)+'...\n['+tg.length+' tracks]';
  document.getElementById('emod').classList.add('open');
}
function closeExp(){document.getElementById('emod').classList.remove('open')}
function mkXML(list){
  const e=s=>(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  return`<?xml version="1.0" encoding="UTF-8"?>
<DJ_PLAYLISTS Version="1.0.0">
  <PRODUCT Name="SetFlow" Version="0.1.0"/>
  <COLLECTION Entries="${list.length}">
    ${list.map(t=>`<TRACK TrackID="${t.id}" Name="${e(t.title)}" Artist="${e(t.artist)}" Genre="${(t.genres||[]).join('/')}" BPM="${t.bpm||0}" Tonality="${t.key||''}" Comments="${t.role?'['+t.role+']':''} ${(t.vibe||[]).map(v=>'['+v+']').join(' ')} [lic:${t.lic}]" Rating="${Math.round((t.energy||50)/20)}"/>`).join('\n    ')}
  </COLLECTION>
  <PLAYLISTS>
    <NODE Type="0" Name="SetFlow" Count="4">
      ${['opener','build','peak','closing'].map(r=>{
        const rt=list.filter(t=>t.role===r);
        return`<NODE Type="1" Name="${r.charAt(0).toUpperCase()+r.slice(1)}" KeyType="0" Entries="${rt.length}">\n        ${rt.map(t=>`<TRACK Key="${t.id}"/>`).join('\n        ')}\n      </NODE>`;
      }).join('\n      ')}
    </NODE>
  </PLAYLISTS>
</DJ_PLAYLISTS>`;
}
function dlExp(){
  const xml=mkXML(tracks.filter(t=>t.role));
  const a=document.createElement('a');
  a.href=URL.createObjectURL(new Blob([xml],{type:'application/xml'}));
  a.download='setflow-rekordbox.xml';a.click();
  closeExp();toast('XML heruntergeladen','grn');
}

function toast(msg,type){
  const el=document.getElementById('toast');
  document.getElementById('tmsg').textContent=msg;
  const led=document.getElementById('tled');
  led.className='tled'+(type==='grn'?' grn':'');
  el.classList.add('show');
  setTimeout(()=>el.classList.remove('show'),2500);
}

function save(){
  try{
    localStorage.setItem('setflow-data',JSON.stringify({tracks,vinylRecords}));
    localStorage.setItem('setflow_v3_version','1');
  }catch(e){
    if(e.name==='QuotaExceededError'){toast('Storage voll — Cover oder Tracks löschen','');}
    else{console.error('SetFlow: Speichern fehlgeschlagen.',e);}
  }
}
function load(){
  try{
    const stored=localStorage.getItem('setflow-data');
    if(!stored)return;
    const d=JSON.parse(stored);
    tracks=Array.isArray(d.tracks)?d.tracks:[];
    // artists load removed
    vinylRecords=Array.isArray(d.vinylRecords)?d.vinylRecords:[];
  }catch(e){
    tracks=[];
    localStorage.removeItem('setflow-data');
    console.warn('SetFlow: Gespeicherte Daten waren korrupt und wurden zurückgesetzt.',e);
  }
}

// ═══ KEYBOARD SHORTCUTS ═══
function toggleSb(){
  document.getElementById('hbg').classList.toggle('open');
  document.querySelector('.sb').classList.toggle('open');
  document.getElementById('sb-overlay').classList.toggle('vis');
}
function closeSb(){
  document.getElementById('hbg').classList.remove('open');
  document.querySelector('.sb').classList.remove('open');
  document.getElementById('sb-overlay').classList.remove('vis');
}
function bnav(v,el){
  document.querySelectorAll('.bn').forEach(b=>b.classList.remove('on'));
  el.classList.add('on');
  closeSb();
  goView(v,null);
}

// ═══ AUTH ═══
const SERVER_URL = 'https://setflow-production-6d3b.up.railway.app';
let authToken = localStorage.getItem('setflow-token') || null;
let authUser = JSON.parse(localStorage.getItem('setflow-user') || 'null');
let authMode = 'login'; // 'login' | 'register'

function authUpdateUI() {
  const btn = document.getElementById('auth-btn-label');
  if (authUser) {
    btn.textContent = authUser.name || authUser.email.split('@')[0];
  } else {
    btn.textContent = 'Login';
  }
}

function toggleAuthMenu() {
  if (authUser) {
    if (confirm('Logout von ' + authUser.email + '?')) authLogout();
  } else {
    document.getElementById('auth-overlay').classList.add('open');
    document.getElementById('auth-email').focus();
  }
}

function authToggleMode() {
  authMode = authMode === 'login' ? 'register' : 'login';
  document.getElementById('auth-title').textContent = authMode === 'login' ? 'Login' : 'Registrieren';
  document.getElementById('auth-submit').textContent = authMode === 'login' ? 'Login' : 'Account erstellen';
  document.getElementById('auth-name-wrap').style.display = authMode === 'register' ? 'block' : 'none';
  document.getElementById('auth-switch').innerHTML = authMode === 'login'
    ? 'Noch kein Account? <a onclick="authToggleMode()">Registrieren</a>'
    : 'Schon registriert? <a onclick="authToggleMode()">Login</a>';
  document.getElementById('auth-err').textContent = '';
}

async function authSubmit() {
  const email = document.getElementById('auth-email').value.trim();
  const pass = document.getElementById('auth-pass').value;
  const name = document.getElementById('auth-name').value.trim();
  const errEl = document.getElementById('auth-err');
  errEl.textContent = '';

  if (!email || !pass) { errEl.textContent = 'Email und Passwort eingeben'; return; }
  if (authMode === 'register' && pass.length < 6) { errEl.textContent = 'Passwort min. 6 Zeichen'; return; }

  const endpoint = authMode === 'login' ? '/api/auth/login' : '/api/auth/register';
  const body = authMode === 'register' ? { email, password: pass, name: name || undefined } : { email, password: pass };

  try {
    const res = await fetch(SERVER_URL + endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) { errEl.textContent = data.error || 'Fehler'; return; }

    authToken = data.token;
    authUser = data.user;
    localStorage.setItem('setflow-token', authToken);
    localStorage.setItem('setflow-user', JSON.stringify(authUser));

    document.getElementById('auth-overlay').classList.remove('open');
    authUpdateUI();
    connectSocket();
    toast(authMode === 'login' ? 'Eingeloggt' : 'Registriert', 'grn');
  } catch (e) {
    errEl.textContent = 'Server nicht erreichbar';
    console.error('Auth error:', e);
  }
}

function authLogout() {
  authToken = null;
  authUser = null;
  localStorage.removeItem('setflow-token');
  localStorage.removeItem('setflow-user');
  authUpdateUI();
  if (socket) socket.disconnect();
  setConnStatus('offline');
  toast('Ausgeloggt', '');
}

// Close auth modal on Escape
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') document.getElementById('auth-overlay').classList.remove('open');
});

// Task 06: re-render sequencer on resize (desktop ↔ mobile pivot)
(function() {
  let _spResizeTimer = null;
  window.addEventListener('resize', () => {
    clearTimeout(_spResizeTimer);
    _spResizeTimer = setTimeout(() => {
      /* only re-render if seq view is active */
      const vseq = document.getElementById('vseq');
      if (vseq && vseq.style.display !== 'none') renderSP();
    }, 120);
  });
})();
// Submit on Enter
document.getElementById('auth-pass').addEventListener('keydown', e => {
  if (e.key === 'Enter') authSubmit();
});

// ═══ SOCKET.IO ═══
let socket = null;

function setConnStatus(state) {
  const dot   = document.getElementById('conn-dot');
  const label = document.getElementById('conn-label');
  if (!dot) return;
  dot.className   = 'conn-dot ' + (state === 'online' ? 'online' : 'offline');
  label.textContent = state === 'online' ? 'Live' : state === 'connecting' ? '…' : 'Off';
}

function connectSocket() {
  if (!authToken) return;
  if (socket) socket.disconnect();

  socket = io(SERVER_URL, {
    auth: { token: authToken },
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 10000,
    reconnectionAttempts: Infinity,
  });

  socket.on('connect', () => { setConnStatus('online'); });
  socket.on('disconnect', () => { setConnStatus('offline'); });
  socket.on('reconnecting', () => { setConnStatus('connecting'); });
  socket.on('connect_error', (err) => {
    if (err.message === 'Authentication required' || err.message === 'Invalid or expired token') {
      console.warn('Socket auth failed — logging out');
      authLogout();
    }
  });
}

// ═══ INIT ═══
function initIcons(){
  const t=document.querySelector('#bn-tracks .bn-icon');if(t)t.innerHTML=getIcon('SEED',20);
  const s=document.querySelector('#bn-sets .bn-icon');if(s)s.innerHTML=getIcon('PATH',20);
  const x=document.querySelector('#bn-export .bn-icon');if(x)x.innerHTML=getIcon('ORBIT',20);
  const dz=document.getElementById('dz-icon');if(dz)dz.innerHTML=getIcon('ORBIT',46);
}
load();sts();buildSet();authUpdateUI();initIcons();
if(authToken) connectSocket();
function checkLicenses(){const warn=tracks.filter(t=>t.lic==='none'||t.lic==='unknown');if(!warn.length){toast('All licensed ✓','grn');return;}const html='<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:16px"><div style="background:var(--paper2);padding:12px;border-left:4px solid var(--green)"><div style="font-size:10px;letter-spacing:2px;text-transform:uppercase;color:var(--ink3)">Compliant</div><div style="font-size:24px;font-weight:600;color:var(--green)">'+tracks.filter(t=>t.lic!=='none'&&t.lic!=='unknown').length+'</div></div></div>';document.getElementById('lic-modal-body').innerHTML=html;if(!document.getElementById('licmod')){const m=document.createElement('div');m.id='licmod';m.className='modal';m.innerHTML='<div class="modal-content" style="max-width:380px"><button style="position:absolute;top:8px;right:8px;background:none;border:none;font-size:20px;cursor:pointer" onclick="closeCheckLic()">×</button><div style="font-size:12px;font-weight:600;text-transform:uppercase;margin-bottom:16px">License Status</div><div id="lic-modal-body"></div></div>';document.body.appendChild(m);}document.getElementById('licmod').classList.add('open');}
function openGigPlanner(id,role){sel=tracks.find(x=>x.id===id);if(!sel)return;if(!document.getElementById('gig-modal')){const m=document.createElement('div');m.id='gig-modal';m.className='modal';m.innerHTML='<div class="modal-content" style="max-width:380px;position:relative"><div id="gig-modal-body"></div></div>';document.body.appendChild(m);}const html='<button style="position:absolute;top:8px;right:8px;background:none;border:none;font-size:20px;cursor:pointer" onclick="closeGigPlanner()">×</button><div style="font-size:12px;font-weight:600;text-transform:uppercase;margin-bottom:12px">'+esc(sel.title)+' — '+esc(role)+'</div><div style="margin-bottom:10px"><input type="date" id="gig-date" style="width:100%;padding:6px;border:1px solid var(--rule2);font-family:var(--M);color:var(--ink)"></div><div style="margin-bottom:10px"><input type="text" id="gig-venue" placeholder="Venue..." style="width:100%;padding:6px;border:1px solid var(--rule2);font-family:var(--M);color:var(--ink)"></div><div style="margin-bottom:10px"><input type="time" id="gig-time" style="width:100%;padding:6px;border:1px solid var(--rule2);font-family:var(--M);color:var(--ink)"></div><div style="display:flex;gap:8px"><button class="btn b-out" style="flex:1" onclick="closeGigPlanner()">Cancel</button><button class="btn b-grn" style="flex:1" onclick="saveGigPlan()">Save</button></div>';document.getElementById('gig-modal-body').innerHTML=html;document.getElementById('gig-modal').classList.add('open');}
function closeGigPlanner(){const m=document.getElementById('gig-modal');if(m)m.classList.remove('open');}
function saveGigPlan(){const d=document.getElementById('gig-date')?.value,v=document.getElementById('gig-venue')?.value;if(sel&&d){sel.gigDate=d;sel.gigVenue=v||'—';save();toast(sel.role+' @ '+(v||'?')+', '+d,'grn');closeGigPlanner();ren();}};
// ═══ HYBRID BRIDGE — MAPPING STATION ═══
let hbSelVinyl = null, hbSelTrack = null;

function _hbRecordIcon(sz=26){
  const r=sz/2;
  return`<svg width="${sz}" height="${sz}" viewBox="0 0 ${sz} ${sz}" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="${r}" cy="${r}" r="${r-1}"   stroke="currentColor" stroke-width="0.6" opacity="0.6"/>
    <circle cx="${r}" cy="${r}" r="${r*.72}" stroke="currentColor" stroke-width="0.5" opacity="0.45"/>
    <circle cx="${r}" cy="${r}" r="${r*.5}"  stroke="currentColor" stroke-width="0.5" opacity="0.35"/>
    <circle cx="${r}" cy="${r}" r="${r*.3}"  fill="currentColor" opacity="0.5"/>
    <circle cx="${r}" cy="${r}" r="${r*.1}"  fill="currentColor"/>
  </svg>`;
}

function _hbWaveIcon(sz=26){
  const w=sz,h=sz,m=h/2;
  return`<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M0,${m} L${w*.12},${m*.2} L${w*.25},${m*1.8} L${w*.38},${m*.35} L${w*.5},${m*1.65} L${w*.63},${m*.45} L${w*.75},${m*1.55} L${w*.88},${m*.6} L${w},${m}"
      stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" stroke-linecap="round"/>
  </svg>`;
}

function renderHB(){
  if(!document.getElementById('hb-vinyl-list'))return;

  // Stats header
  const linked=vinylRecords.filter(v=>v.linkedTrackId).length;
  const statsEl=document.getElementById('hb-link-stats-top');
  if(statsEl)statsEl.textContent=linked+' LINK'+(linked!==1?'S':'')+' ACTIVE';

  // ── VINYL LIST ──
  const vc=document.getElementById('hb-vinyl-count');
  if(vc)vc.textContent=vinylRecords.length+' RECORD'+(vinylRecords.length!==1?'S':'');
  const vList=document.getElementById('hb-vinyl-list');
  if(!vinylRecords.length){
    vList.innerHTML=`<div class="hb-empty"><span class="lvl-3">NO VINYL<br>RECORDS<br><span style="opacity:.5;font-size:.55rem">ADD VIA VINYL COLLECTION</span></span></div>`;
  }else{
    vList.innerHTML=vinylRecords.map(v=>{
      const isLinked=!!v.linkedTrackId;
      const isSel=hbSelVinyl===v.id;
      const cls=isLinked?'hb-linked':isSel?'hb-selected':'';
      const tagCls=isLinked?'hb-tag-linked':isSel?'hb-tag-selected':'hb-tag-free';
      const tagTxt=isLinked?'✓ LNK':isSel?'◉ SEL':'FREE';
      const sub=[(v.label||''),(v.year||'')].filter(Boolean).join(' · ')||'—';
      const onclick=isLinked?'':` onclick="hbSelectVinyl(${v.id})"`;
      return`<div class="hb-vinyl-card ${cls}"${onclick}>
        <span class="hb-record-icon">${_hbRecordIcon(26)}</span>
        <div class="hb-card-body">
          <div class="hb-card-title">${v.title}</div>
          <div class="hb-card-sub">${v.artist} · ${sub}</div>
        </div>
        <span class="hb-card-tag ${tagCls}">${tagTxt}</span>
      </div>`;
    }).join('');
  }

  // ── TRACK LIST ──
  const tc=document.getElementById('hb-track-count');
  if(tc)tc.textContent=tracks.length+' TRACK'+(tracks.length!==1?'S':'');
  const tList=document.getElementById('hb-track-list');
  if(!tracks.length){
    tList.innerHTML=`<div class="hb-empty"><span class="lvl-3">NO DIGITAL<br>TRACKS<br><span style="opacity:.5;font-size:.55rem">IMPORT VIA LIBRARY</span></span></div>`;
  }else{
    tList.innerHTML=tracks.map(t=>{
      const isLinked=vinylRecords.some(v=>v.linkedTrackId===t.id);
      const isSel=hbSelTrack===t.id;
      const cls=isLinked?'hb-linked':isSel?'hb-selected':'';
      const tagCls=isLinked?'hb-tag-linked':isSel?'hb-tag-selected':'hb-tag-free';
      const tagTxt=isLinked?'✓ LNK':isSel?'◉ SEL':'—';
      const onclick=isLinked?'':` onclick="hbSelectTrack(${t.id})"`;
      return`<div class="hb-track-card ${cls}"${onclick}>
        <span class="hb-wave-icon">${_hbWaveIcon(26)}</span>
        <div class="hb-card-body">
          <div class="hb-card-title">${t.title}</div>
          <div class="hb-card-sub">${t.artist}${t.bpm?' · '+t.bpm+' BPM':''}</div>
        </div>
        <span class="hb-card-tag ${tagCls}">${tagTxt}</span>
      </div>`;
    }).join('');
  }

  _hbSyncBridge();
}

function hbSelectVinyl(id){
  hbSelVinyl = hbSelVinyl===id ? null : id;
  renderHB();
}

function hbSelectTrack(id){
  hbSelTrack = hbSelTrack===id ? null : id;
  renderHB();
}

function _hbSyncBridge(){
  const elIdle   = document.getElementById('hb-idle');
  const elReady  = document.getElementById('hb-ready');
  const elLinked = document.getElementById('hb-linked-state');
  const elBtn    = document.getElementById('hb-execute-btn');
  const elLbl    = document.getElementById('hb-exec-label');
  if(!elIdle)return;

  // Reset all states
  elIdle.style.display='';
  elReady.classList.remove('vis');
  elLinked.classList.remove('vis');
  elBtn.classList.remove('hb-active');

  if(hbSelVinyl && hbSelTrack){
    // READY — both sides selected
    elIdle.style.display='none';
    elReady.classList.add('vis');
    elBtn.classList.add('hb-active');
    if(elLbl) elLbl.textContent='READY TO LINK';
    const vRec=vinylRecords.find(v=>v.id===hbSelVinyl);
    const tRec=tracks.find(t=>t.id===hbSelTrack);
    const vLabel=document.getElementById('hb-ready-vinyl-label');
    const tLabel=document.getElementById('hb-ready-track-label');
    if(vLabel) vLabel.textContent=(vRec?.title||'VINYL').toUpperCase();
    if(tLabel) tLabel.textContent=(tRec?.title||'TRACK').toUpperCase();
  }else{
    // IDLE
    elIdle.style.display='flex';
    if(elLbl){
      if(!hbSelVinyl&&!hbSelTrack) elLbl.textContent='SELECT BOTH SIDES';
      else if(!hbSelVinyl)         elLbl.textContent='← SELECT VINYL';
      else                         elLbl.textContent='SELECT TRACK →';
    }
  }
}

function hbExecuteLink(){
  if(!hbSelVinyl||!hbSelTrack) return;
  const vRec=vinylRecords.find(v=>v.id===hbSelVinyl);
  const tRec=tracks.find(t=>t.id===hbSelTrack);
  if(!vRec) return;

  // Write the link
  vRec.linkedTrackId=hbSelTrack;
  save();

  // Show success state in bridge
  const elIdle   = document.getElementById('hb-idle');
  const elReady  = document.getElementById('hb-ready');
  const elLinked = document.getElementById('hb-linked-state');
  const elBtn    = document.getElementById('hb-execute-btn');
  const elLbl    = document.getElementById('hb-exec-label');
  elIdle.style.display='none';
  elReady.classList.remove('vis');
  elLinked.classList.add('vis');
  elBtn.classList.remove('hb-active');
  if(elLbl){ elLbl.textContent='✓ LINK ESTABLISHED'; elLbl.style.color='var(--signal-primary)'; }

  const vName=vRec.title||'Vinyl';
  const tName=tRec?.title||'Track';

  // Clear selection, re-render after brief pause
  hbSelVinyl=null; hbSelTrack=null;
  setTimeout(()=>{
    renderHB();
    if(elLbl) elLbl.style.color='';
    toast(`LINKED: ${vName} ↔ ${tName}`,'grn');
  },1400);
}

function uploadOwnProduction(){const inp=document.createElement('input');inp.type='file';inp.accept='audio/*';inp.onchange=e=>{const f=e.target.files[0];if(!f)return;const nm=f.name.replace(/\.[^.]+$/,'');const r=new FileReader();r.onload=ev=>{const nt={id:Date.now(),title:nm,artist:'YOU',bpm:null,genres:[],energy:null,role:null,vibe:[],key:null,dur:null,a:false,cover:null,lic:'own',licNote:'Own production',isOwn:true,ownArtist:'YOU'};tracks.push(nt);ren();sts();save();toast('Production uploaded','grn')};r.readAsDataURL(f)};inp.click();}

// ═══ PERFORMANCE SEQUENCER ═══
const SP_PX_MIN = 65; // pixels per minute of set time
let spPlayheadMin = 0;

function _spParseDur(s) {
  if (!s) return 420; // default 7:00
  const p = s.split(':').map(Number);
  return (p[0] || 0) * 60 + (p[1] || 0);
}

function _spGetDurMin() {
  const el = document.getElementById('sp-dur-sel');
  return el ? (parseInt(el.value) || 90) : 90;
}

function _spBuildLayout() {
  const dur = _spGetDurMin();
  // Section time boundaries (fractions of total set)
  const sec = {
    opener:  [0,                      Math.round(dur * 0.24)],
    build:   [Math.round(dur * 0.24), Math.round(dur * 0.56)],
    peak:    [Math.round(dur * 0.56), Math.round(dur * 0.80)],
    closing: [Math.round(dur * 0.80), dur],
  };
  const layout = [];
  ['opener','build','peak','closing'].forEach(role => {
    const [s0, s1] = sec[role];
    let cursor = s0;
    tracks.filter(t => t.role === role).forEach(t => {
      const durMin = _spParseDur(t.dur) / 60;
      const clamped = Math.min(durMin, s1 - cursor);
      if (clamped < 0.5) return;
      layout.push({ track: t, role, startMin: cursor, durMin: clamped });
      cursor += clamped;
    });
  });
  return { layout, dur };
}

function _spCurvePath(layout, W, H) {
  const pts = [{ x: 0, y: H - 1 }];
  layout.forEach(item => {
    const cx = (item.startMin + item.durMin / 2) * SP_PX_MIN;
    const ey = item.track.energy || 40;
    pts.push({ x: cx, y: H - (ey / 100) * H * 0.83 - H * 0.06 });
  });
  pts.push({ x: W, y: H - 1 });
  if (pts.length < 2) return `M 0,${H} L ${W},${H}`;
  let d = `M ${pts[0].x.toFixed(1)},${pts[0].y.toFixed(1)}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i], p1 = pts[i + 1];
    const cx = ((p0.x + p1.x) / 2).toFixed(1);
    d += ` C ${cx},${p0.y.toFixed(1)} ${cx},${p1.y.toFixed(1)} ${p1.x.toFixed(1)},${p1.y.toFixed(1)}`;
  }
  return d;
}

/* ── TASK 06: MOBILE SEQUENCER RENDERER ── */
function renderSP_mobile() {
  const { layout, dur } = _spBuildLayout();
  const scroll = document.getElementById('sp-scroll');
  const inner  = document.getElementById('sp-inner');
  const vrule  = document.getElementById('sp-vrule');
  if (!inner) return;

  const ROLES      = ['opener','build','peak','closing'];
  const ROLE_HEX   = { opener:'#4dff88', build:'#4d8fff', peak:'#ffffff', closing:'#ffcc00' };
  const ROLE_LABEL = { opener:'OPENER',  build:'BUILD',   peak:'PEAK',    closing:'CLOSING' };

  /* ── heights for ruler calculation (must match CSS px values) ── */
  const H_HEADER = 40;   /* .mobile-section-header height */
  const H_CARD   = 75;   /* .mobile-track-card height */
  const H_EMPTY  = 60;   /* empty-section placeholder */

  /* ── vertical energy gradient on scroll area ── */
  const sectionAvg = {};
  ROLES.forEach(role => {
    const items = layout.filter(i => i.role === role);
    sectionAvg[role] = items.length
      ? Math.round(items.reduce((a, i) => a + (i.track.energy || 40), 0) / items.length)
      : 0;
  });
  if (scroll) {
    /* compute % stop positions based on section track counts */
    let cumulative = 0, sectionStops = [];
    ROLES.forEach(role => {
      const n = layout.filter(i => i.role === role).length;
      cumulative += H_HEADER + (n ? n * H_CARD : H_EMPTY);
      sectionStops.push(cumulative);
    });
    const total = cumulative || 1;
    const pct   = sectionStops.map(v => ((v / total) * 100).toFixed(1));
    const stops = [
      `rgba(10,10,10,0.0) 0%`,
      `rgba(77,255,136,${((sectionAvg.opener || 40) / 100 * 0.06).toFixed(3)}) ${pct[0]}%`,
      `rgba(77,143,255,${((sectionAvg.build  || 60) / 100 * 0.08).toFixed(3)}) ${pct[1]}%`,
      `rgba(77,255,136,${((sectionAvg.peak   || 85) / 100 * 0.14).toFixed(3)}) ${pct[2]}%`,
      `rgba(255,204,0, ${((sectionAvg.closing|| 50) / 100 * 0.07).toFixed(3)}) 100%`
    ];
    scroll.style.background = `linear-gradient(to bottom, ${stops.join(', ')})`;
  }

  /* ── build card HTML ── */
  let html = '';
  let totalHeight = 0;

  /* track each section's start Y for ruler */
  const sectionY = {};

  ROLES.forEach(role => {
    const items = layout.filter(i => i.role === role);
    const hex   = ROLE_HEX[role];

    sectionY[role] = totalHeight;
    html += `<div class="mobile-section-header">
      <div class="msh-dot" style="background:${hex};box-shadow:0 0 5px ${hex}40"></div>
      <span class="lvl-3" style="color:${hex};letter-spacing:3px">${ROLE_LABEL[role]}</span>
      <span class="msh-count">${items.length} TRACK${items.length !== 1 ? 'S' : ''}</span>
    </div>`;
    totalHeight += H_HEADER;

    if (!items.length) {
      html += `<div style="height:${H_EMPTY}px;display:flex;align-items:center;padding:0 16px;
        font-family:var(--font-main);font-size:0.48rem;letter-spacing:2px;
        text-transform:uppercase;color:var(--accent-dim);opacity:0.25">
        NO ${role.toUpperCase()} TRACKS TAGGED
      </div>`;
      totalHeight += H_EMPTY;
    } else {
      items.forEach(item => {
        const t  = item.track;
        const pm = Math.floor(item.startMin);
        const ps = Math.round((item.startMin - pm) * 60);
        const ts = String(pm).padStart(2,'0') + ':' + String(ps).padStart(2,'0');
        const key = t.key ? '  ' + t.key : '';
        html += `<div class="mobile-track-card"
          style="border-left-color:${hex}"
          onclick="selT(${t.id})">
          <div class="mtc-body">
            <span class="lvl-2">${t.title}${t.artist ? '<br><span style="opacity:.6;font-size:.65em">' + t.artist + '</span>' : ''}</span>
            <span class="lvl-3">${t.bpm || '—'} BPM${key}</span>
          </div>
          <div class="mtc-time">@${ts}</div>
          <div class="mtc-corner-badge" style="background:${hex}">${ROLE_LABEL[role]}</div>
        </div>`;
        totalHeight += H_CARD;
      });
    }
  });
  inner.innerHTML = html;

  /* ── vertical ruler: tick every 5 minutes ── */
  if (vrule && dur > 0) {
    vrule.style.height = totalHeight + 'px';
    let rHtml = '';
    for (let m = 0; m <= dur; m += 5) {
      const y = ((m / dur) * totalHeight).toFixed(1);
      const hh = String(Math.floor(m / 60)).padStart(2,'0');
      const mm = String(m % 60).padStart(2,'0');
      rHtml += `<div class="sp-vtick" style="top:${y}px">
        <span class="sp-vtick-label">${hh}:${mm}</span>
      </div>`;
    }
    vrule.innerHTML = rHtml;
  }

  /* ── HUD ── */
  const durEl = document.getElementById('sp-hud-dur');
  if (durEl) durEl.textContent = dur >= 60
    ? Math.floor(dur/60)+'h '+String(dur%60).padStart(2,'0')+'MIN' : dur+'MIN';
  const bpms   = layout.map(i => i.track.bpm).filter(Boolean);
  const avgBpm = bpms.length ? Math.round(bpms.reduce((a,b)=>a+b,0)/bpms.length) : null;
  const bpmEl  = document.getElementById('sp-hud-bpm');
  if (bpmEl) bpmEl.textContent = avgBpm ? avgBpm + ' BPM' : '—';
  const cntEl  = document.getElementById('sp-hud-cnt');
  if (cntEl) cntEl.textContent = layout.length + (layout.length === 1 ? ' TRACK' : ' TRACKS');
}

function renderSP() {
  if (window.innerWidth <= 768) { renderSP_mobile(); return; }
  const { layout, dur } = _spBuildLayout();
  const W = dur * SP_PX_MIN;
  const ENERGY_H = 64;
  const inner = document.getElementById('sp-inner');
  if (!inner) return;
  inner.style.minWidth = W + 'px';

  // ── RULER ──
  const ruler = document.getElementById('sp-ruler');
  if (ruler) {
    ruler.style.minWidth = W + 'px';
    let html = '';
    for (let m = 0; m <= dur; m += 5) {
      const x = (m * SP_PX_MIN).toFixed(1);
      const hh = String(Math.floor(m / 60)).padStart(2,'0');
      const mm = String(m % 60).padStart(2,'0');
      html += `<div class="sp-tick" style="left:${x}px"><span class="sp-tick-label">${hh}:${mm}</span></div>`;
    }
    ruler.innerHTML = html;
  }

  // ── ENERGY CURVE ──
  const eRow = document.getElementById('sp-energy-row');
  if (eRow) {
    eRow.style.minWidth = W + 'px';
    const curve    = _spCurvePath(layout, W, ENERGY_H);
    const fillPath = `${curve} L ${W},${ENERGY_H} L 0,${ENERGY_H} Z`;
    const dots     = layout.map(item => {
      const cx = ((item.startMin + item.durMin / 2) * SP_PX_MIN).toFixed(1);
      const ey = item.track.energy || 40;
      const cy = (ENERGY_H - (ey / 100) * ENERGY_H * 0.83 - ENERGY_H * 0.06).toFixed(1);
      return `<circle cx="${cx}" cy="${cy}" r="2.5" fill="#4dff88" opacity="0.9"><title>${item.track.title}: ${ey}</title></circle>`;
    }).join('');
    eRow.innerHTML = `<svg class="sp-curve-svg" width="${W}" height="${ENERGY_H}" viewBox="0 0 ${W} ${ENERGY_H}" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="sp-eg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#4dff88" stop-opacity="0.22"/>
          <stop offset="100%" stop-color="#4dff88" stop-opacity="0.01"/>
        </linearGradient>
        <filter id="sp-glow"><feGaussianBlur stdDeviation="1.5" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
      </defs>
      <path d="${fillPath}" fill="url(#sp-eg)"/>
      <path d="${curve}" stroke="#4dff88" stroke-width="1.5" fill="none" filter="url(#sp-glow)"/>
      ${dots}
    </svg>`;
  }

  // ── TRACK LANES ──
  const ROLE_COL = { opener:'var(--signal-primary)', build:'var(--blue)', peak:'var(--accent-white)', closing:'var(--signal-warning)' };
  const ROLE_BG  = { opener:'rgba(77,255,136,0.07)', build:'rgba(77,143,255,0.07)', peak:'rgba(255,255,255,0.05)', closing:'rgba(255,204,0,0.07)' };
  ['opener','build','peak','closing'].forEach(role => {
    const lane = document.getElementById('sp-lane-' + role);
    if (!lane) return;
    lane.style.minWidth = W + 'px';
    const items = layout.filter(i => i.role === role);
    if (!items.length) {
      lane.innerHTML = `<div class="sp-lane-empty">NO ${role.toUpperCase()} TRACKS TAGGED</div>`;
      return;
    }
    lane.innerHTML = items.map(item => {
      const t  = item.track;
      const x  = (item.startMin * SP_PX_MIN).toFixed(1);
      const bw = Math.max((item.durMin * SP_PX_MIN) - 2, 30).toFixed(1);
      const col= ROLE_COL[role], bg = ROLE_BG[role];
      return `<div class="track-block" data-track-id="${t.id}"
        style="left:${x}px;width:${bw}px;border-color:${col};color:${col};background:${bg}"
        onclick="event.stopPropagation();selT(${t.id})"
        title="${t.title} — ${t.artist} — ${t.bpm||'?'} BPM">
        <span class="tb-title">${t.title}</span>
        <span class="tb-bpm">${t.bpm||'—'} BPM</span>
      </div>`;
    }).join('');
  });

  // ── HUD ──
  const durEl = document.getElementById('sp-hud-dur');
  if (durEl) durEl.textContent = dur >= 60 ? Math.floor(dur/60)+'h '+String(dur%60).padStart(2,'0')+'MIN' : dur+'MIN';

  const bpms = layout.map(i => i.track.bpm).filter(Boolean);
  const avgBpm = bpms.length ? Math.round(bpms.reduce((a,b)=>a+b,0)/bpms.length) : null;
  const bpmEl  = document.getElementById('sp-hud-bpm');
  if (bpmEl) bpmEl.textContent = avgBpm ? avgBpm + ' BPM' : '—';

  let peakNrg = 0, peakAt = null;
  layout.forEach(i => { if ((i.track.energy||0) > peakNrg) { peakNrg=i.track.energy; peakAt=i.startMin+i.durMin/2; } });
  const peakEl = document.getElementById('sp-hud-peak');
  if (peakEl) {
    if (peakAt !== null) {
      const pm=Math.floor(peakAt), ps=Math.round((peakAt-pm)*60);
      peakEl.textContent = peakNrg + ' @ ' + String(pm).padStart(2,'0') + ':' + String(ps).padStart(2,'0');
    } else peakEl.textContent = '—';
  }
  const cntEl = document.getElementById('sp-hud-cnt');
  if (cntEl) cntEl.textContent = layout.length + (layout.length===1?' TRACK':' TRACKS');

  spUpdatePlayhead();
}

function spUpdatePlayhead() {
  const ph = document.getElementById('sp-playhead');
  if (!ph) return;
  ph.style.left = (spPlayheadMin * SP_PX_MIN).toFixed(1) + 'px';
  const phHud = document.getElementById('sp-hud-ph');
  if (phHud) {
    const m=Math.floor(spPlayheadMin), s=Math.round((spPlayheadMin-m)*60);
    phHud.textContent = String(m).padStart(2,'0') + ':' + String(s).padStart(2,'0');
  }
}

function spClickTimeline(e) {
  const scroll = document.getElementById('sp-scroll');
  if (!scroll) return;
  const rect = scroll.getBoundingClientRect();
  const relX = e.clientX - rect.left + scroll.scrollLeft;
  spPlayheadMin = Math.max(0, Math.min(relX / SP_PX_MIN, _spGetDurMin()));
  spUpdatePlayhead();
}

function spAutoFill() {
  // Run AI simulation on unanalyzed tracks, then re-render
  const todo = tracks.filter(t => !t.a);
  if (todo.length) {
    const GENRE_COMBOS=[['Deep House'],['House'],['Techno'],['Melodic Techno'],['House','Deep House'],['Afro House','Deep House'],['Disco House','House']];
    todo.forEach(t => {
      t.bpm=118+Math.floor(Math.random()*18);
      t.energy=30+Math.floor(Math.random()*65);
      t.key=['1A','2A','3A','4A','5A','6A','7A','8A','9A','10A','11A','12A'][Math.floor(Math.random()*12)];
      t.genres=GENRE_COMBOS[Math.floor(Math.random()*GENRE_COMBOS.length)];
      t.role=t.energy<40?'opener':t.energy<60?'build':t.energy<80?'peak':'closing';
      t.a=true;
    });
    save(); sts();
  }
  renderSP();
  toast('SEQUENCER AUTO-FILLED','grn');
}

// ═══ NEURAL MATCH ENGINE ═══
// Scores every track in the library against [currentTrack] using:
//   • Harmonic proximity via _CAMELOT_COMPAT (weight 0.65)
//   • Tempo proximity ±5%/±8% window      (weight 0.35)
// Returns up to [limit] best matches, sorted descending by Nexus Score.
function findCompatibleTracks(current, limit = 6) {
  if (!current) return [];
  const compat = current.key ? (_CAMELOT_COMPAT[current.key] || []) : [];
  const W_HARM = 0.65, W_TEMPO = 0.35;

  return tracks
    .filter(t => t.id !== current.id)
    .map(t => {
      // ── Harmonic score ──
      // _CAMELOT_COMPAT entry: [self, neighbor1, neighbor2, relative]
      let hScore = 0;
      if (t.key && compat.length) {
        if (t.key === current.key)        hScore = 1.0; // identity
        else if (compat.includes(t.key))  hScore = 0.7; // neighbor or relative
      }

      // ── Tempo score ──
      let tScore = 0;
      if (current.bpm && t.bpm) {
        const delta = Math.abs(t.bpm - current.bpm) / current.bpm;
        if (delta <= 0.05)      tScore = 1.0; // ≤±5%
        else if (delta <= 0.08) tScore = 0.5; // ≤±8%
        // else 0 — too far outside tempo window
      }

      const score = W_HARM * hScore + W_TEMPO * tScore;
      return { t, score, hScore, tScore };
    })
    .filter(r => r.score > 0)                // zero-score tracks excluded
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(r => ({ ...r.t, _nexusScore: r.score, _hScore: r.hScore, _tScore: r.tScore }));
}

// ═══ UI CONTROLLER ═══
const UIController = {
  // Non-destructive atomic sync — updates sub-elements only, no full re-render
  syncTrack(id) {
    const track = tracks.find(t => t.id === id);
    if (!track) return;

    // ── Library: <tr data-track-id="…"> ──
    const row = document.querySelector(`tr[data-track-id="${id}"]`);
    if (row) {
      const bpmCell = row.querySelector('.tbpm');
      if (bpmCell) bpmCell.textContent = track.bpm || '—';

      const ef = row.querySelector('.ef');
      if (ef) {
        ef.style.width      = (track.energy || 0) + '%';
        ef.style.background = ec(track.energy);
      }
      const ev = row.querySelector('.ev');
      if (ev) ev.textContent = track.energy || '—';

      // Genre chips: 4th <td> (index 3)
      const tds = row.querySelectorAll('td');
      if (tds[3]) tds[3].innerHTML = genreChips(track.genres);

      // Data-Pulse flash
      row.classList.remove('ui-data-flash');
      void row.offsetWidth; // force reflow to restart animation
      row.classList.add('ui-data-flash');
    }

    // ── Desktop sequencer: .track-block[data-track-id="…"] ──
    document.querySelectorAll(`.track-block[data-track-id="${id}"]`).forEach(block => {
      const bpmSpan = block.querySelector('.tb-bpm');
      if (bpmSpan) bpmSpan.textContent = (track.bpm || '—') + ' BPM';
      block.title = `${track.title} — ${track.artist} — ${track.bpm || '?'} BPM`;
      block.classList.remove('ui-data-flash');
      void block.offsetWidth;
      block.classList.add('ui-data-flash');
    });

    // ── Refresh Command Module if this track is currently open ──
    if (sel && sel.id === id) rp();
  },

  // Open the Command Module for a given track id
  openDetail(id) {
    const t = tracks.find(tr => tr.id === id);
    if (!t) return;
    sel = t;
    applyAtmosphere(t);
    applyRhythm(t);
    document.getElementById('pnl').classList.add('open');
    rp();
    ren(); // highlight selected row in library
  },

  // Close and deselect
  closeDetail() {
    document.getElementById('pnl').classList.remove('open');
    sel = null;
    ren();
  },

  // Full UI refresh after bulk state changes (e.g. session import)
  syncAll() {
    ren();   // re-render library table (picks up ghost-row classes + new tracks)
    sts();   // update sidebar counters
    if (typeof renderSP === 'function') renderSP(); // refresh sequencer if available
    if (sel) rp(); // refresh open detail panel
  },
};

// ═══ INTELLIGENCE ENGINE ═══
function openIE(track) {
  const t = track || sel;
  document.getElementById('ie-overlay').classList.add('open');
  // Reset to scan state
  document.getElementById('ie-scan-state').style.display = 'block';
  document.getElementById('ie-result-state').style.display = 'none';
  document.getElementById('terminal-log').innerHTML = '<span class="terminal-cursor"></span>';
  const dot = document.getElementById('ie-dot');
  dot.className = 'ie-status-dot';
  dot.style.background = '';
  const lbl = document.getElementById('ie-status-label');
  lbl.textContent = 'SCANNING...';
  lbl.style.color = 'var(--signal-warning)';
  const file = t ? _trackFiles.get(t.id) : null;
  if (file) {
    _ieRunRealFile(t, file);
  } else {
    _ieRunTerminal(t);
  }
}

function _ieRunTerminal(t) {
  const log = document.getElementById('terminal-log');
  const bpm    = t && t.bpm    ? t.bpm + ' BPM'                      : '--';
  const key    = t && t.key    ? t.key + '  (confidence: 94%)'       : '--';
  const genre  = t && t.genres && t.genres.length ? t.genres.join(' / ') : '--';
  const energy = t && t.energy != null ? t.energy + ' / 100'          : '--';
  const era    = t && t.year   ? t.year                               : '2020–2024';
  const title  = t ? t.title   : 'NO TRACK SELECTED';

  const lines = [
    { delay: 0,    type: 'SYS',  msg: 'INITIALIZING SIGNAL ANALYSIS ENGINE...' },
    { delay: 340,  type: 'SYS',  msg: `TARGET: ${title.toUpperCase()}` },
    { delay: 680,  type: 'DATA', msg: 'SAMPLE RATE: 44100 Hz  /  BIT DEPTH: 24-bit' },
    { delay: 1050, type: 'SCAN', msg: 'DETECTING TEMPO...' },
    { delay: 1650, type: 'DATA', msg: `TEMPO LOCKED: ${bpm}` },
    { delay: 2000, type: 'SCAN', msg: 'ANALYZING KEY SIGNATURE...' },
    { delay: 2550, type: 'DATA', msg: `TONALITY: ${key}` },
    { delay: 2900, type: 'SCAN', msg: 'PROFILING SONIC TEXTURE...' },
    { delay: 3450, type: 'DATA', msg: `GENRE MATCH: ${genre}` },
    { delay: 3800, type: 'SCAN', msg: 'MEASURING ENERGY DYNAMICS...' },
    { delay: 4200, type: 'DATA', msg: `ENERGY INDEX: ${energy}` },
    { delay: 4550, type: 'SCAN', msg: 'DETECTING ERA MARKERS...' },
    { delay: 5050, type: 'DATA', msg: `DETECTED ERA: ${era}` },
    { delay: 5400, type: 'SYS',  msg: 'CROSS-REFERENCING LIBRARY DATABASE...' },
    { delay: 5900, type: 'FINAL', msg: '✓  ANALYSIS COMPLETE', final: true },
  ];

  lines.forEach(({ delay, type, msg, final }) => {
    setTimeout(() => {
      const cursor = log.querySelector('.terminal-cursor');
      if (cursor) cursor.remove();
      const line = document.createElement('div');
      line.className = `terminal-line tl-${type.toLowerCase()}`;
      line.innerHTML = `<span class="tl-tag">[${type}]</span>${msg}`;
      if (!final) line.innerHTML += '<span class="terminal-cursor"></span>';
      log.appendChild(line);
      log.scrollTop = log.scrollHeight;
      if (final) {
        document.getElementById('ie-dot').className = 'ie-status-dot complete';
        setTimeout(() => _ieShowResults(t), 700);
      }
    }, delay);
  });
}

async function _ieRunRealFile(t, file) {
  const log = document.getElementById('terminal-log');
  const title = t ? t.title : 'NO TRACK SELECTED';

  function appendLine(type, msg, isFinal) {
    const cursor = log.querySelector('.terminal-cursor');
    if (cursor) cursor.remove();
    const line = document.createElement('div');
    line.className = `terminal-line tl-${type.toLowerCase()}`;
    line.innerHTML = `<span class="tl-tag">[${type}]</span>${msg}`;
    if (!isFinal) line.innerHTML += '<span class="terminal-cursor"></span>';
    log.appendChild(line);
    log.scrollTop = log.scrollHeight;
  }

  function delay(ms) { return new Promise(r => setTimeout(r, ms)); }

  appendLine('SYS', 'INITIALIZING SIGNAL ANALYSIS ENGINE...');
  await delay(320);
  appendLine('SYS', `TARGET: ${title.toUpperCase()}`);
  await delay(320);

  try {
    // ── Phase 1: File ingestion + decode ──
    const buf = await audioEngine.loadFile(file, (type, msg) => appendLine(type, msg));
    await delay(300);

    // Start live oscilloscope immediately after buffer is ready
    audioEngine.startOscilloscope(
      document.getElementById('ie-osc-path'),
      document.getElementById('ie-osc-ghost')
    );

    // Patch real duration onto track
    const track = tracks.find(tr => tr.id === t.id);
    if (track && !track.dur) { track.dur = Math.round(buf.duration); }

    // ── Phase 2: Spectral analysis ──
    appendLine('SCAN', 'ANALYZING SPECTRAL DATA...');
    await delay(420);

    // BPM detection (autocorrelation on energy envelope — runs sync, ~30ms)
    appendLine('SCAN', 'DETECTING TEMPO...');
    await delay(180);
    const detectedBPM = AudioEngine.detectBPM(buf);
    if (track && !track.bpm) { track.bpm = detectedBPM; }
    const finalBPM = track ? track.bpm : detectedBPM;
    appendLine('DATA', `TEMPO DETECTED: ${finalBPM} BPM`);
    await delay(280);

    // Energy + texture (single-pass RMS + ZCR, returns normalised components for genre vector)
    appendLine('SCAN', 'MEASURING ENERGY DYNAMICS...');
    await delay(180);
    const texture = AudioEngine.calcTexture(buf);
    if (track && track.energy == null) { track.energy = texture.energy; }
    const finalEnergy = track ? track.energy : texture.energy;
    appendLine('DATA', `ENERGY LEVEL: ${finalEnergy}%`);
    await delay(280);

    // ── Phase 3: Key detection (K-S algorithm) ──
    appendLine('SCAN', 'SCANNING HARMONICS...');
    // Yield to browser for one repaint before heavy FFT computation
    await new Promise(r => setTimeout(r, 80));
    const keyResult = AudioEngine.detectKey(buf);
    await delay(200);
    if (keyResult.camelot) {
      if (track && !track.key) { track.key = keyResult.camelot; }
      const finalKey = (track && track.key) ? track.key : keyResult.camelot;
      appendLine('DATA', `TONALITY: ${finalKey}  (CONFIDENCE: ${keyResult.confidence}%)`);
    } else {
      appendLine('DATA', `TONALITY: UNKNOWN  (CONFIDENCE: ${keyResult.confidence}%)`);
    }
    await delay(280);

    // ── Phase 4: Genre classification (weighted feature-matrix) ──
    appendLine('SCAN', 'SCANNING GENRE PROFILE...');
    await new Promise(r => setTimeout(r, 0)); // yield for repaint
    const bpmNorm  = Math.max(0, Math.min(1, (finalBPM - 60) / 140));
    const genreVec = [bpmNorm, texture.rmsNorm, texture.zcrNorm];
    const [g1, g2] = GenreEngine.classify(genreVec);
    if (track && (!track.genres || !track.genres.length)) {
      track.genres = g1 === 'UNKNOWN' ? [] : (g2 === 'UNKNOWN' ? [g1] : [g1, g2]);
    }
    const genreOut = [g1, g2].filter(g => g !== 'UNKNOWN');
    appendLine('DATA', `GENRE PROFILE: ${genreOut.length ? genreOut.join(' / ') : 'UNKNOWN'}`);
    await delay(280);

    appendLine('SYS', 'CROSS-REFERENCING LIBRARY DATABASE...');
    await delay(480);

    // Persist detections + flush to DOM (non-destructive, no full re-render)
    if (track) { save(); UIController.syncTrack(track.id); }

    appendLine('FINAL', '✓  ANALYSIS COMPLETE', true);
    document.getElementById('ie-dot').className = 'ie-status-dot complete';
    setTimeout(() => _ieShowResults(t), 700);

  } catch (err) {
    audioEngine.stopOscilloscope();
    appendLine('ERR', `DECODE FAILED: ${err.message || 'UNKNOWN ERROR'}`, true);
    const dot = document.getElementById('ie-dot');
    dot.className = 'ie-status-dot';
    dot.style.background = 'var(--signal-alert)';
    const lbl = document.getElementById('ie-status-label');
    lbl.textContent = '✗  SCAN FAILED';
    lbl.style.color = 'var(--signal-alert)';
  }
}

function _ieShowResults(t) {
  document.getElementById('ie-scan-state').style.display = 'none';
  document.getElementById('ie-result-state').style.display = 'block';

  const lbl = document.getElementById('ie-status-label');
  lbl.textContent = '✓  ANALYSIS READY';
  lbl.style.color = 'var(--signal-primary)';

  const LIC_LABELS = { own:'EIGENE PRODUKTION', licensed:'LIZENZIERT', promo:'PROMO', none:'⚠ KEINE LIZENZ', unknown:'UNBEKANNT' };
  const LIC_COLORS = { own:'var(--signal-primary)', licensed:'var(--blue)', promo:'var(--signal-warning)', none:'var(--signal-alert)', unknown:'var(--accent-dim)' };

  document.getElementById('ie-bpm').textContent   = t && t.bpm    ? t.bpm + ' BPM'                       : '— NOT DETECTED';
  document.getElementById('ie-key').textContent   = t && t.key    ? t.key                                 : '— NOT DETECTED';
  document.getElementById('ie-genre').textContent = t && t.genres && t.genres.length ? t.genres.join(' / ') : '— NOT DETECTED';
  document.getElementById('ie-era').textContent   = t && t.year   ? t.year                                : '2020–2024';
  const licKey = t && t.lic ? t.lic : 'unknown';
  const licEl = document.getElementById('ie-lic');
  licEl.textContent  = LIC_LABELS[licKey] || 'UNKNOWN';
  licEl.style.color  = LIC_COLORS[licKey] || 'var(--accent-dim)';

  const energy = t && t.energy != null ? t.energy : null;
  if (energy !== null) {
    document.getElementById('ie-energy-val').textContent = energy + ' / 100';
    setTimeout(() => { document.getElementById('ie-energy-bar').style.width = energy + '%'; }, 120);
  } else {
    document.getElementById('ie-energy-val').textContent = '— N/A';
  }
}

function closeIE() {
  audioEngine.stopOscilloscope();
  document.getElementById('ie-osc-path').setAttribute('d', 'M0,40 L800,40');
  document.getElementById('ie-osc-ghost').setAttribute('d', 'M0,40 L800,40');
  document.getElementById('ie-overlay').classList.remove('open');
  document.getElementById('ie-energy-bar').style.width = '0%';
}

function ieRescan() {
  audioEngine.stopOscilloscope();
  document.getElementById('ie-osc-path').setAttribute('d', 'M0,40 L800,40');
  document.getElementById('ie-osc-ghost').setAttribute('d', 'M0,40 L800,40');
  const dot = document.getElementById('ie-dot');
  dot.className = 'ie-status-dot';
  dot.style.background = '';
  document.getElementById('ie-scan-state').style.display = 'block';
  document.getElementById('ie-result-state').style.display = 'none';
  document.getElementById('terminal-log').innerHTML = '<span class="terminal-cursor"></span>';
  document.getElementById('ie-energy-bar').style.width = '0%';
  const lbl = document.getElementById('ie-status-label');
  lbl.textContent = 'SCANNING...';
  lbl.style.color = 'var(--signal-warning)';
  _ieRunTerminal(sel);
}

/* ═══════════════════════════════════════════════════
   TASK 07 — CO-PILOT INTERFACE
   ═══════════════════════════════════════════════════ */

// ── CAMELOT WHEEL: compatible keys ──
const _CAMELOT_COMPAT = {
  '1A':['1A','12A','2A','1B'], '2A':['2A','1A','3A','2B'],
  '3A':['3A','2A','4A','3B'], '4A':['4A','3A','5A','4B'],
  '5A':['5A','4A','6A','5B'], '6A':['6A','5A','7A','6B'],
  '7A':['7A','6A','8A','7B'], '8A':['8A','7A','9A','8B'],
  '9A':['9A','8A','10A','9B'], '10A':['10A','9A','11A','10B'],
  '11A':['11A','10A','12A','11B'], '12A':['12A','11A','1A','12B'],
  '1B':['1B','12B','2B','1A'], '2B':['2B','1B','3B','2A'],
  '3B':['3B','2B','4B','3A'], '4B':['4B','3B','5B','4A'],
  '5B':['5B','4B','6B','5A'], '6B':['6B','5B','7B','6A'],
  '7B':['7B','6B','8B','7A'], '8B':['8B','7B','9B','8A'],
  '9B':['9B','8B','10B','9A'], '10B':['10B','9B','11B','10A'],
  '11B':['11B','10B','12B','11A'], '12B':['12B','11B','1B','12A'],
};

// ── NEURAL MATCH ──
let _nmActive = null;
function nmShow(e, trackId) {
  const t = tracks.find(x => x.id === trackId);
  if (!t) return;

  // Find best adjacent candidate from library
  const others = tracks.filter(x => x.id !== trackId && x.bpm && x.a);
  const candidate = others.reduce((best, x) => {
    const bpmDiff = Math.abs((x.bpm||0) - (t.bpm||0));
    return (!best || bpmDiff < Math.abs((best.bpm||0)-(t.bpm||0))) ? x : best;
  }, null);

  const bpmDelta = candidate && t.bpm ? Math.abs((candidate.bpm||0) - t.bpm) : null;
  const keyCompat = t.key && candidate?.key
    ? (_CAMELOT_COMPAT[t.key] || []).includes(candidate.key) ? 'COMPATIBLE' : 'TENSION'
    : '— N/A';
  const energyDelta = candidate && t.energy != null
    ? (candidate.energy||0) - (t.energy||0)
    : null;

  // Compute match score
  const bpmScore = bpmDelta != null ? Math.max(0, 100 - bpmDelta * 3) : 50;
  const keyScore = keyCompat === 'COMPATIBLE' ? 100 : keyCompat === 'TENSION' ? 40 : 60;
  const engScore = energyDelta != null ? Math.max(0, 100 - Math.abs(energyDelta) * 1.5) : 60;
  const matchPct = Math.round((bpmScore * 0.4 + keyScore * 0.4 + engScore * 0.2));

  const bpmEl = document.getElementById('nm-bpm-delta');
  bpmEl.textContent = bpmDelta != null ? (bpmDelta <= 2 ? '+' + bpmDelta : '+' + bpmDelta) + ' BPM' : '— N/A';
  bpmEl.className = 'nm-val' + (bpmDelta != null && bpmDelta <= 3 ? ' nm-good' : ' nm-warn');

  const keyEl = document.getElementById('nm-key-compat');
  keyEl.textContent = candidate?.key ? t.key + ' / ' + candidate.key + '  ' + keyCompat : '— N/A';
  keyEl.className = 'nm-val' + (keyCompat === 'COMPATIBLE' ? ' nm-good' : ' nm-warn');

  const engEl = document.getElementById('nm-energy-delta');
  engEl.textContent = energyDelta != null ? (energyDelta >= 0 ? '+' : '') + energyDelta + ' NRG' : '— N/A';
  engEl.className = 'nm-val' + (Math.abs(energyDelta || 0) <= 15 ? ' nm-good' : ' nm-warn');

  document.getElementById('nm-score').textContent = matchPct + '%';
  document.getElementById('nm-score').className = 'nm-val' + (matchPct >= 75 ? ' nm-good' : ' nm-warn');

  const tooltip = document.getElementById('nm-tooltip');
  tooltip.classList.add('visible');
  // Position near the click
  const x = Math.min(e.clientX + 12, window.innerWidth - 230);
  const y = Math.min(e.clientY + 8,  window.innerHeight - 160);
  tooltip.style.left = x + 'px';
  tooltip.style.top  = y + 'px';

  setTimeout(() => {
    document.getElementById('nm-fill').style.width = matchPct + '%';
  }, 50);

  _nmActive = trackId;
  // auto-hide on any click
  const dismissFn = () => { nmHide(); document.removeEventListener('click', dismissFn); };
  setTimeout(() => document.addEventListener('click', dismissFn), 10);
}
function nmHide() {
  document.getElementById('nm-tooltip').classList.remove('visible');
  document.getElementById('nm-fill').style.width = '0%';
  _nmActive = null;
}

// ── CO-PILOT WIZARD ──
let _cpCurve = 'LINEAR';
let _cpProcessing = false;

function openCoPilot() {
  document.getElementById('co-pilot-overlay').classList.add('open');
  _cpReset();
  const n = tracks.filter(t => t.a).length;
  document.getElementById('cpw-footer-info').textContent =
    n + ' ANALYZED TRACKS IN LIBRARY';
}
function closeCoPilot() {
  if (_cpProcessing) return;
  document.getElementById('co-pilot-overlay').classList.remove('open');
}
function cpSetCurve(btn, curve) {
  document.querySelectorAll('.cpw-curve-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  _cpCurve = curve;
}
function _cpReset() {
  _cpProcessing = false;
  document.getElementById('cpw-config').style.display = 'flex';
  document.getElementById('cpw-processing').classList.remove('active');
  document.getElementById('cpw-proc-log').innerHTML = '<span class="terminal-cursor"></span>';
  document.getElementById('cpw-proc-fill').style.width = '0%';
  document.getElementById('cpw-proc-label').textContent = 'EXECUTING GENERATION...';
  document.getElementById('cpw-proc-label').style.color = 'var(--signal-warning)';
}

function cpExecuteGeneration() {
  if (_cpProcessing) return;
  const dur     = parseInt(document.getElementById('cpw-dur').value)     || 90;
  const bpmMin  = parseInt(document.getElementById('cpw-bpm-min').value) || 118;
  const bpmMax  = parseInt(document.getElementById('cpw-bpm-max').value) || 136;
  const genre   = parseInt(document.getElementById('cpw-genre-bias').value) || 50;
  if (bpmMin > bpmMax) { toast('BPM_MIN > BPM_MAX — INVALID PARAMETERS', ''); return; }

  _cpProcessing = true;
  document.getElementById('cpw-config').style.display = 'none';
  document.getElementById('cpw-processing').classList.add('active');

  _cpRunTerminal({ dur, bpmMin, bpmMax, genre, curve: _cpCurve });
}

function _cpRunTerminal(params) {
  const log = document.getElementById('cpw-proc-log');
  const fill = document.getElementById('cpw-proc-fill');
  const { dur, bpmMin, bpmMax, genre, curve } = params;
  const eligible = tracks.filter(t => t.bpm >= bpmMin && t.bpm <= bpmMax);

  const lines = [
    { delay: 0,    pct: 5,  type: 'SYS',  msg: 'INITIALIZING CO-PILOT ENGINE v1.0...' },
    { delay: 300,  pct: 12, type: 'SYS',  msg: `TARGET DURATION: ${dur} MIN  |  CURVE: ${curve}` },
    { delay: 680,  pct: 20, type: 'SYS',  msg: `BPM RANGE: ${bpmMin}–${bpmMax} BPM` },
    { delay: 1050, pct: 28, type: 'AI',   msg: `ANALYZING LIBRARY — ${tracks.length} TRACKS INDEXED` },
    { delay: 1450, pct: 36, type: 'AI',   msg: `ELIGIBLE CANDIDATES: ${eligible.length} TRACKS` },
    { delay: 1850, pct: 44, type: 'AI',   msg: `APPLYING ${curve} ENERGY CURVE MODEL...` },
    { delay: 2250, pct: 54, type: 'SCAN', msg: 'CALCULATING SECTION BOUNDARIES...' },
    { delay: 2650, pct: 62, type: 'AI',   msg: 'MAPPING OPENER CANDIDATES → ENERGY < 50' },
    { delay: 3050, pct: 70, type: 'AI',   msg: 'MAPPING BUILD CANDIDATES   → ENERGY 50–70' },
    { delay: 3350, pct: 78, type: 'AI',   msg: 'MAPPING PEAK CANDIDATES    → ENERGY 70–100' },
    { delay: 3650, pct: 85, type: 'AI',   msg: 'MAPPING CLOSING CANDIDATES → ENERGY 40–65' },
    { delay: 4050, pct: 92, type: 'SCAN', msg: 'RESOLVING KEY COMPATIBILITY MATRIX...' },
    { delay: 4450, pct: 97, type: 'SYS',  msg: 'WRITING TO PERFORMANCE SEQUENCER...' },
    { delay: 4800, pct: 100, type: 'FINAL', msg: '✓  GENERATION COMPLETE — SEQUENCE READY', final: true },
  ];

  lines.forEach(({ delay, pct, type, msg, final }) => {
    setTimeout(() => {
      const cursor = log.querySelector('.terminal-cursor');
      if (cursor) cursor.remove();
      const line = document.createElement('div');
      line.className = `terminal-line tl-${type === 'AI' ? 'data' : type.toLowerCase()}`;
      line.innerHTML = `<span class="tl-tag">[${type}]</span>${msg}`;
      if (!final) line.innerHTML += '<span class="terminal-cursor"></span>';
      log.appendChild(line);
      log.scrollTop = log.scrollHeight;
      fill.style.width = pct + '%';
      if (final) {
        const lbl = document.getElementById('cpw-proc-label');
        lbl.textContent = '✓  GENERATION COMPLETE';
        lbl.style.color = 'var(--signal-primary)';
        document.querySelector('.cpw-proc-dot').style.background = 'var(--signal-primary)';
        document.querySelector('.cpw-proc-dot').style.boxShadow  = '0 0 6px var(--signal-primary)';
        setTimeout(() => _cpApplyResult(params), 800);
      }
    }, delay);
  });
}

function _cpApplyResult(params) {
  const { dur, bpmMin, bpmMax, genre, curve } = params;
  const GENRE_COMBOS = [['Deep House'],['House'],['Techno'],['Melodic Techno'],['Afro House','Deep House'],['Disco House','House']];
  const ROLES = ['opener','build','peak','closing'];

  // Ensure every track has been analyzed
  tracks.forEach(t => {
    if (!t.bpm) t.bpm = bpmMin + Math.floor(Math.random() * (bpmMax - bpmMin + 1));
    if (!t.key) t.key = ['1A','2A','3A','4A','5A','6A','7A','8A','9A','10A','11A','12A'][Math.floor(Math.random()*12)];
    if (!t.genres || !t.genres.length) t.genres = GENRE_COMBOS[Math.floor(Math.random()*GENRE_COMBOS.length)];
    if (t.energy == null) t.energy = 30 + Math.floor(Math.random() * 65);
    t.a = true;
  });

  // Assign roles based on curve model
  const energyCurveFn = {
    LINEAR:     (pct) => pct,
    SINUSOIDAL: (pct) => Math.sin(pct * Math.PI),
    STOCHASTIC: (pct) => Math.random() * 0.4 + pct * 0.6,
    PEAK:       (pct) => pct < 0.5 ? pct * 2 : (1 - pct) * 2,
  }[curve] || ((p) => p);

  // Sort tracks by bpm within the range; assign roles by position in curve
  const eligible = tracks.filter(t => t.bpm >= bpmMin && t.bpm <= bpmMax);
  const sorted   = [...eligible].sort((a,b) => (a.bpm||0) - (b.bpm||0));

  sorted.forEach((t, i) => {
    const pct = eligible.length > 1 ? i / (eligible.length - 1) : 0.5;
    const e   = energyCurveFn(pct);
    t.role    = e < 0.3 ? 'opener' : e < 0.55 ? 'build' : e < 0.8 ? 'peak' : 'closing';
    t.energy  = Math.round(e * 85 + 10);
  });
  // tracks outside range get 'opener' or kept as-is
  tracks.filter(t => t.bpm < bpmMin || t.bpm > bpmMax).forEach(t => {
    if (!t.role) t.role = 'opener';
  });

  save(); sts();

  // Update seq duration selector to match param
  const durSel = document.getElementById('sp-dur-sel');
  if (durSel) {
    const opts = [60, 90, 120, 180];
    const best = opts.reduce((a, b) => Math.abs(b - dur) < Math.abs(a - dur) ? b : a);
    durSel.value = best;
  }

  // Close wizard, navigate to sequencer, re-render
  setTimeout(() => {
    _cpProcessing = false;
    document.getElementById('co-pilot-overlay').classList.remove('open');
    // Activate sequencer view
    const seqNav = document.querySelector('.ni[onclick*="seq"]');
    goView('seq', seqNav);
    renderSP();
    toast('CO-PILOT SEQUENCE READY', 'grn');
  }, 400);
}

// ═══ HARDENING: ZOMBIE BUTTON PREVENTION ═══
// If the user opens the OS file picker and then cancels or alt-tabs away,
// the browser fires a focus event back on the window without triggering the
// input's onchange — leaving HydrationManager._pendingId set and the
// "LINKING…" button state frozen. This listener clears the stale pending ID
// and re-renders the Command Module to reset the button to its normal state.
window.addEventListener('focus', () => {
  if (HydrationManager._pendingId) {
    HydrationManager._pendingId = null;
    if (sel) rp();
  }
});

// ── EXPOSE TO WINDOW (required for HTML inline onclick handlers with type="module") ──
Object.assign(window, {
  // File handling
  proc, fi2, dzo, dzl, dzd, lpDragOver, lpDragLeave, lpDrop,
  // Track display & filtering
  ren, sts, show, sf, doQ, selT, closeP, rp, runAI, uploadCover,
  // Set building & export
  goView, buildSet, autoFill, openExp, closeExp, dlExp, mkXML,
  // Vinyl & Hybrid Bridge
  addVinyl, saveVinyl, closeVModal, selVinyl, unlinkVinyl, renderVinyl,
  renderHB, hbSelectVinyl, hbSelectTrack, hbExecuteLink,
  // Performance Sequencer
  renderSP, spAutoFill, spClickTimeline,
  // Intelligence Engine & Co-Pilot
  openIE, closeIE, ieRescan, openCoPilot, closeCoPilot, cpSetCurve, cpExecuteGeneration,
  // Neural Match
  nmShow, nmHide,
  // Session persistence
  save, load, loadDemo,
  // Authentication
  toggleAuthMenu, authToggleMode, authLogout,
  // License & Gig
  checkLicenses, setLic, setOwn, updGenres, updLicNote, updOwnArtist, updateTrackField,
  tV, uE, openGigPlanner, closeGigPlanner, saveGigPlan,
  // UI utilities
  toast, bnav, toggleSb, closeSb,
  // QR Scanner
  startScanner,
});
