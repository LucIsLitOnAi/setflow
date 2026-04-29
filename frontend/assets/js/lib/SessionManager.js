/* ═══ SETFLOW — SESSION MANAGER ═══ */
import { SETFLOW_STATE } from './State.js';

function save() {
  try {
    localStorage.setItem('setflow-data', JSON.stringify({
      tracks: SETFLOW_STATE.tracks,
      vinylRecords: SETFLOW_STATE.vinylRecords,
    }));
    localStorage.setItem('setflow_v3_version', '1');
  } catch(e) {
    if (e.name === 'QuotaExceededError') {
      // toast is called from orchestrator context — we re-throw a typed error
      const err = new Error('Storage voll — Cover oder Tracks löschen');
      err.isQuota = true;
      throw err;
    } else {
      console.error('SetFlow: Speichern fehlgeschlagen.', e);
    }
  }
}

function load() {
  try {
    const stored = localStorage.getItem('setflow-data');
    if (!stored) return;
    const d = JSON.parse(stored);
    SETFLOW_STATE.tracks = Array.isArray(d.tracks) ? d.tracks : [];
    // artists load removed
    SETFLOW_STATE.vinylRecords = Array.isArray(d.vinylRecords) ? d.vinylRecords : [];
  } catch(e) {
    SETFLOW_STATE.tracks = [];
    localStorage.removeItem('setflow-data');
    console.warn('SetFlow: Gespeicherte Daten waren korrupt und wurden zurückgesetzt.', e);
  }
}

/* ── DEMO DATA ── */
const DEMO = [
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

function loadDemo() {
  SETFLOW_STATE.tracks = DEMO.map(t => ({...t, genres: [...(t.genres || [])]}));
  // sts, ren, show, save, toast called from orchestrator after this returns
}

export { save, load, loadDemo };
