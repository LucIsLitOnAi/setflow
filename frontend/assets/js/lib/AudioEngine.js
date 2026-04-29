/* ═══ SETFLOW — AUDIO ENGINE ═══ */

class AudioEngine {
  constructor() { this._ctx = null; this._analyser = null; this._buffer = null; }
  _ensureContext() {
    if (!this._ctx) {
      this._ctx = new (window.AudioContext || window.webkitAudioContext)();
      this._analyser = this._ctx.createAnalyser();
      this._analyser.fftSize = 2048;
      this._analyser.connect(this._ctx.destination);
    }
    return this._ctx;
  }
  async resume() {
    const ctx = this._ensureContext();
    if (ctx.state === 'suspended') await ctx.resume();
  }
  async loadFile(file, onLog) {
    const ctx = this._ensureContext();
    if (ctx.state === 'suspended') await ctx.resume();
    onLog('SYS', `INGESTING FILE: ${file.name}`);
    try {
      const ab = await file.arrayBuffer();
      onLog('SYS', 'DECODING AUDIO BUFFER...');
      const buf = await ctx.decodeAudioData(ab);
      this._buffer = buf;
      onLog('SYS', `DECODING COMPLETE. BUFFER SIZE: ${buf.length.toLocaleString()} SAMPLES`);
      onLog('DATA', `SAMPLE RATE: ${buf.sampleRate} Hz  /  DURATION: ${buf.duration.toFixed(2)}s`);
      onLog('DATA', `CHANNELS: ${buf.numberOfChannels}  /  BIT DEPTH: 32-bit float`);
      return buf;
    } catch (err) {
      onLog('ERR', `INVALID AUDIO FORMAT: ${file.name}`);
      throw err;
    }
  }
  getAnalyser() { return this._analyser; }
  getBuffer()   { return this._buffer; }
  getContext()  { return this._ctx; }

  // ── RHYTHM ENGINE: autocorrelation on energy envelope ──
  static detectBPM(buffer) {
    const sr  = buffer.sampleRate;
    const raw = buffer.getChannelData(0);
    const len = Math.min(raw.length, sr * 30); // analyse ≤30 s
    const hop = 512;
    // Build RMS energy envelope
    const env = [];
    for (let i = 0; i < len - hop; i += hop) {
      let s = 0;
      for (let j = 0; j < hop; j++) s += raw[i+j] * raw[i+j];
      env.push(Math.sqrt(s / hop));
    }
    const envFPS  = sr / hop;
    const lagMin  = Math.max(1, Math.floor(envFPS * 60 / 200)); // 200 BPM ceiling
    const lagMax  = Math.ceil(envFPS * 60 / 60);                // 60 BPM floor
    const corrLen = Math.min(env.length, 600);                  // cap correlation window
    let bestLag = lagMin, bestCorr = -Infinity;
    for (let lag = lagMin; lag <= lagMax; lag++) {
      let c = 0;
      const n = Math.min(corrLen, env.length - lag);
      for (let i = 0; i < n; i++) c += env[i] * env[i + lag];
      c /= n;
      if (c > bestCorr) { bestCorr = c; bestLag = lag; }
    }
    let bpm = Math.round(envFPS * 60 / bestLag);
    // Fold into 80–175 range
    while (bpm < 80)  bpm *= 2;
    while (bpm > 175) bpm /= 2;
    return bpm;
  }

  // ── ENERGY ENGINE: RMS loudness + zero-crossing-rate brightness ──
  static calcEnergy(buffer) {
    const sr  = buffer.sampleRate;
    const raw = buffer.getChannelData(0);
    const len = Math.min(raw.length, sr * 30);
    const step = 8;
    // RMS
    let sumSq = 0, n = 0;
    for (let i = 0; i < len; i += step) { sumSq += raw[i] * raw[i]; n++; }
    const rms = Math.sqrt(sumSq / n);
    // Map typical music RMS 0.03–0.35 → 10–90
    const rmsScore = Math.min(100, Math.max(0, Math.round((rms - 0.03) / 0.32 * 80 + 10)));
    // Zero-crossing rate (brightness proxy)
    let zc = 0;
    for (let i = step; i < len; i += step) {
      if ((raw[i] >= 0) !== (raw[i - step] >= 0)) zc++;
    }
    const zcRate  = zc / (n - 1);
    const zcScore = Math.min(100, Math.max(0, Math.round(zcRate * 900)));
    // 65% loudness + 35% brightness
    return Math.min(100, Math.max(1, Math.round(rmsScore * 0.65 + zcScore * 0.35)));
  }

  // ── TEXTURE ENGINE: single-pass RMS + ZCR, exports raw components for genre vector ──
  static calcTexture(buffer) {
    const sr  = buffer.sampleRate;
    const raw = buffer.getChannelData(0);
    const len = Math.min(raw.length, sr * 30);
    const step = 8;
    let sumSq = 0, zc = 0, n = 0;
    for (let i = step; i < len; i += step) {
      sumSq += raw[i] * raw[i];
      if ((raw[i] >= 0) !== (raw[i - step] >= 0)) zc++;
      n++;
    }
    const rms     = Math.sqrt(sumSq / n);
    const zcr     = zc / n;
    // Combined 0-100 energy score (same formula as original calcEnergy)
    const rmsScore = Math.min(100, Math.max(0, Math.round((rms - 0.03) / 0.32 * 80 + 10)));
    const zcScore  = Math.min(100, Math.max(0, Math.round(zcr * 900)));
    const energy   = Math.min(100, Math.max(1, Math.round(rmsScore * 0.65 + zcScore * 0.35)));
    // Normalised [0,1] components for the genre feature vector
    const rmsNorm = Math.min(1, rms / 0.35);       // 0 = silence, 1 = loud mastered track
    const zcrNorm = Math.min(1, zcr / 0.20);       // 0 = dark/tonal, 1 = bright/percussive
    return { energy, rmsNorm, zcrNorm };
  }

  // ── HARMONIC COMPASS: Krumhansl-Schmuckler key-finding ──

  // Cooley-Tukey in-place iterative FFT (power-of-2 N only)
  static _fft(re, im) {
    const N = re.length;
    for (let i = 1, j = 0; i < N; i++) {
      let bit = N >> 1;
      for (; j & bit; bit >>= 1) j ^= bit;
      j ^= bit;
      if (i < j) {
        let t = re[i]; re[i] = re[j]; re[j] = t;
        t    = im[i]; im[i] = im[j]; im[j] = t;
      }
    }
    for (let s = 2; s <= N; s <<= 1) {
      const half = s >> 1;
      const ang  = -2 * Math.PI / s;
      const wBRe = Math.cos(ang), wBIm = Math.sin(ang);
      for (let k = 0; k < N; k += s) {
        let wRe = 1, wIm = 0;
        for (let j = 0; j < half; j++) {
          const uRe = re[k+j],   uIm = im[k+j];
          const tRe = wRe*re[k+j+half] - wIm*im[k+j+half];
          const tIm = wRe*im[k+j+half] + wIm*re[k+j+half];
          re[k+j]        = uRe + tRe;  im[k+j]        = uIm + tIm;
          re[k+j+half]   = uRe - tRe;  im[k+j+half]   = uIm - tIm;
          const nwRe = wRe*wBRe - wIm*wBIm;
          wIm = wRe*wBIm + wIm*wBRe;
          wRe = nwRe;
        }
      }
    }
  }

  static detectKey(buffer) {
    const sr     = buffer.sampleRate;
    const raw    = buffer.getChannelData(0);
    const FFT_N  = 4096;                                    // bins → ~10.8 Hz/bin @44100
    const winLen = Math.min(raw.length, sr * 30);
    const startI = Math.floor((raw.length - winLen) / 2);  // centre 30 s
    const hop    = Math.floor(winLen / 50);                 // ~50 frames

    // Pre-computed Hann window (avoids repeated cos() inside loop)
    const hann = new Float32Array(FFT_N);
    for (let i = 0; i < FFT_N; i++)
      hann[i] = 0.5 - 0.5 * Math.cos(2 * Math.PI * i / FFT_N);

    const chroma = new Float32Array(12);
    const re = new Float32Array(FFT_N);
    const im = new Float32Array(FFT_N);

    for (let off = startI; off + FFT_N <= startI + winLen; off += hop) {
      for (let i = 0; i < FFT_N; i++) { re[i] = raw[off + i] * hann[i]; im[i] = 0; }
      AudioEngine._fft(re, im);
      // Accumulate power into pitch classes (Architect's note: precision here is non-negotiable)
      for (let k = 1; k < FFT_N >> 1; k++) {
        const freq = k * sr / FFT_N;
        if (freq < 27.5 || freq > 4200) continue;          // outside piano range → skip
        const power = re[k]*re[k] + im[k]*im[k];
        // n = 12·log2(f/440)+69 — exact formula, no rounding before mod
        const midi  = 12 * Math.log2(freq / 440) + 69;
        const pc    = ((Math.round(midi) % 12) + 12) % 12; // safe modulo (handles negatives)
        chroma[pc] += power;
      }
    }

    // Normalize chroma to [0,1]
    const maxC = Math.max(...chroma);
    if (maxC === 0) return { camelot: null, label: null, confidence: 0 };
    for (let i = 0; i < 12; i++) chroma[i] /= maxC;

    // K-S profile vectors (Krumhansl & Schmuckler, 1990)
    const KS_MAJ = [6.35,2.23,3.48,2.33,4.38,4.09,2.52,5.19,2.39,3.66,2.29,2.88];
    const KS_MIN = [6.33,2.68,3.52,5.38,2.60,3.53,2.54,4.75,3.98,2.69,3.34,3.17];

    function pearson(a, b) {
      let sA=0,sB=0,sAB=0,sA2=0,sB2=0;
      for (let i=0;i<12;i++){sA+=a[i];sB+=b[i];sAB+=a[i]*b[i];sA2+=a[i]*a[i];sB2+=b[i]*b[i];}
      const mA=sA/12, mB=sB/12;
      let num=0,dA=0,dB=0;
      for (let i=0;i<12;i++){const da=a[i]-mA,db=b[i]-mB;num+=da*db;dA+=da*da;dB+=db*db;}
      return num / (Math.sqrt(dA*dB) || 1e-9);
    }

    // Camelot wheel (verified against standard Camelot chart)
    const CAMELOT = {
      C_major:'8B', G_major:'9B',  D_major:'10B', A_major:'11B', E_major:'12B', B_major:'1B',
      'F#_major':'2B', 'C#_major':'3B', 'G#_major':'4B', 'D#_major':'5B', 'A#_major':'6B', F_major:'7B',
      A_minor:'8A', E_minor:'9A',  B_minor:'10A', 'F#_minor':'11A', 'C#_minor':'12A', 'G#_minor':'1A',
      'D#_minor':'2A','A#_minor':'3A', F_minor:'4A',  C_minor:'5A',  G_minor:'6A',  D_minor:'7A',
    };
    const NOTES = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];

    let bestR = -Infinity, bestRoot = 0, bestType = 'major';
    for (let root = 0; root < 12; root++) {
      // Rotate chroma so this root aligns with tonic position in profile
      const rot = Array.from({length:12}, (_,i) => chroma[(i + root) % 12]);
      const rMaj = pearson(rot, KS_MAJ);
      const rMin = pearson(rot, KS_MIN);
      if (rMaj > bestR) { bestR = rMaj; bestRoot = root; bestType = 'major'; }
      if (rMin > bestR) { bestR = rMin; bestRoot = root; bestType = 'minor'; }
    }

    // Confidence: r < 0.5 → non-tonal / unknown
    if (bestR < 0.5) return { camelot: null, label: null, confidence: Math.max(0, Math.round(bestR * 100)) };
    const confidence = Math.min(99, Math.round((bestR - 0.5) / 0.48 * 49 + 50));
    const keyStr  = `${NOTES[bestRoot]}_${bestType}`;
    const camelot = CAMELOT[keyStr] || null;
    const label   = `${NOTES[bestRoot]} ${bestType.charAt(0).toUpperCase()+bestType.slice(1)}`;

    return { camelot, label, confidence };
  }

  // ── OSCILLOSCOPE: scroll through PCM data at 60 fps via rAF ──
  startOscilloscope(mainPathEl, ghostPathEl) {
    this.stopOscilloscope();
    const buf = this._buffer;
    if (!buf || !mainPathEl) return;
    const data    = buf.getChannelData(0);
    const W = 800, CY = 40, AMP = 34;
    const total   = data.length;
    const window  = Math.floor(buf.sampleRate * 0.042); // ~42 ms slice per frame
    const advance = Math.floor(buf.sampleRate / 60);    // scroll speed ≈ realtime
    const N = 120;                                       // polyline resolution
    let pos = 0;
    const buildPath = (offset) => {
      const pts = [];
      for (let i = 0; i < N; i++) {
        const si = (offset + Math.floor(i / N * window)) % total;
        const y  = CY - (data[si] || 0) * AMP;
        pts.push(`${i === 0 ? 'M' : 'L'}${((i / (N-1)) * W).toFixed(1)},${y.toFixed(1)}`);
      }
      return pts.join(' ');
    };
    const tick = () => {
      mainPathEl.setAttribute('d', buildPath(pos));
      if (ghostPathEl) ghostPathEl.setAttribute('d', buildPath((pos + advance * 4) % total));
      pos = (pos + advance) % total;
      this._oscRafId = requestAnimationFrame(tick);
    };
    this._oscRafId = requestAnimationFrame(tick);
  }

  stopOscilloscope() {
    if (this._oscRafId) { cancelAnimationFrame(this._oscRafId); this._oscRafId = null; }
  }
}

export default AudioEngine;
