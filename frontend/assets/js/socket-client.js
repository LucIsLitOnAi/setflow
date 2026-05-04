import { SETFLOW_STATE, SERVER_URL } from './lib/State.js';

class SocketClient {
  constructor() {
    this.socket = null;
    this.roomId = 'demo'; // Default room
    this.djName = SETFLOW_STATE.authUser?.name || 'DJ_' + Math.floor(Math.random() * 1000);
  }

  init() {
    this.socket = io(SERVER_URL);
    SETFLOW_STATE.socket = this.socket;

    this.socket.on('connect', () => {
      console.log('Connected to server');
      this.joinRoom(this.roomId, this.djName);
      const el = document.getElementById('connection-status');
      if (el) {
        el.textContent = 'ONLINE';
        el.style.background = 'var(--signal-primary)';
        el.style.color = 'var(--paper1)';
      }
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from server');
      const el = document.getElementById('connection-status');
      if (el) {
        el.textContent = 'OFFLINE';
        el.style.background = '';
        el.style.color = '';
      }
    });

    this.socket.on('init-state', (state) => {
      console.log('Received initial state:', state);
      if (state.tracks && state.tracks.length > 0) {
        SETFLOW_STATE.tracks = state.tracks;
        if (window.show) window.show();
      }
      if (state.vinylRecords && state.vinylRecords.length > 0) SETFLOW_STATE.vinylRecords = state.vinylRecords;
      
      if (window.ren) window.ren();
      if (window.sts) window.sts();
    });

    this.socket.on('tracks-updated', (tracks) => {
      SETFLOW_STATE.tracks = tracks;
      if (tracks.length > 0 && window.show) window.show();
      if (window.ren) window.ren();
      if (window.sts) window.sts();
    });

    this.socket.on('vinyl-updated', (vinylRecords) => {
      SETFLOW_STATE.vinylRecords = vinylRecords;
      if (window.renderVinyl) window.renderVinyl();
    });

    this.socket.on('lock-acquired', ({ trackId, djName }) => {
      // Handle lock UI
      console.log(`Lock acquired on ${trackId} by ${djName}`);
    });

    this.socket.on('lock-released', (trackId) => {
      // Handle lock release UI
      console.log(`Lock released on ${trackId}`);
    });
  }

  joinRoom(roomId, djName) {
    this.roomId = roomId;
    this.djName = djName;
    this.socket.emit('join-room', { roomId, djName });
  }

  syncTracks() {
    this.socket.emit('update-tracks', { roomId: this.roomId, tracks: SETFLOW_STATE.tracks });
  }

  syncVinyl() {
    this.socket.emit('update-vinyl', { roomId: this.roomId, vinylRecords: SETFLOW_STATE.vinylRecords });
  }

  acquireLock(trackId) {
    this.socket.emit('acquire-lock', { roomId: this.roomId, trackId, djName: this.djName });
  }

  releaseLock(trackId) {
    this.socket.emit('release-lock', { roomId: this.roomId, trackId });
  }
}

export default new SocketClient();
