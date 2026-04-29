/* ═══ SETFLOW — STATE ═══ */

export const SETFLOW_STATE = {
  tracks: [],
  vinylRecords: [],
  sel: null,
  fil: 'all',
  q: '',
  hbSelVinyl: null,
  hbSelTrack: null,
  spPlayheadMin: 0,
  _cpCurve: 'LINEAR',
  _cpProcessing: false,
  authToken: localStorage.getItem('setflow-token') || null,
  authUser: JSON.parse(localStorage.getItem('setflow-user') || 'null'),
  authMode: 'login',
  socket: null,
  _trackFiles: new Map(),
  _scanner: null,
  _nmActive: null,
};

export const SP_PX_MIN = 65;
export const SERVER_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'http://localhost:3000'
  : 'https://setflow-production-6d3b.up.railway.app';

export function getState() {
  return SETFLOW_STATE;
}

export function setState(patch) {
  Object.assign(SETFLOW_STATE, patch);
}
