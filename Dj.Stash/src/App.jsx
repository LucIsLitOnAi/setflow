import React, { useState, useEffect, useRef } from "react";
import { invoke } from "@tauri-apps/api/core";
import { convertFileSrc } from "@tauri-apps/api/core";
import { open } from "@tauri-apps/plugin-dialog";
import { writeTextFile } from "@tauri-apps/plugin-fs";
import { save } from "@tauri-apps/plugin-dialog";

function App() {
  const [query, setQuery] = useState("");
  const [parsedTrack, setParsedTrack] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [tracks, setTracks] = useState([]);
  const [locations, setLocations] = useState([]);
  const [sets, setSets] = useState([]);
  const [newSetName, setNewSetName] = useState("");

  const [selectedSet, setSelectedSet] = useState(null);
  const [activeSetTracks, setActiveSetTracks] = useState([]);
  const [draggedIndex, setDraggedIndex] = useState(null);

  const [editingTrackId, setEditingTrackId] = useState(null);
  const [editFormData, setEditFormData] = useState({ artist: "", title: "", bpm: "", duration: "" });

  const [playingTrackId, setPlayingTrackId] = useState(null);
  const audioRef = useRef(null);

  const [exportSuccess, setExportSuccess] = useState(false);

  const [isDarkMode, setIsDarkMode] = useState(true);
  const [accentColor, setAccentColor] = useState('#ff0055');

  const [searchQuery, setSearchQuery] = useState("");
  const [filterFormat, setFilterFormat] = useState("all");
  const [sortBy, setSortBy] = useState("added");

  const loadTracks = async () => {
    try {
      const dbTracks = await invoke("get_tracks");
      setTracks(dbTracks);
    } catch (error) {
      console.error("Error loading tracks:", error);
    }
  };

  const loadLocations = async () => {
    try {
      let dbLocations = await invoke("get_locations");
      if (dbLocations.length === 0) {
        // Fallback: create a test location if the array is empty
        await invoke("add_location", { name: "Record Bag", locationType: "bag" });
        dbLocations = await invoke("get_locations");
      }
      setLocations(dbLocations);
    } catch (error) {
      console.error("Error loading locations:", error);
    }
  };

  const loadSets = async () => {
    try {
      const dbSets = await invoke("get_sets");
      setSets(dbSets);
    } catch (error) {
      console.error("Error loading sets:", error);
    }
  };

  const openSetDetail = async (set) => {
    try {
      setSelectedSet(set);
      const tracks = await invoke("get_tracks_in_set", { setId: set.id });
      setActiveSetTracks(tracks);
    } catch (error) {
      console.error("Error loading tracks for set:", error);
    }
  };

  const closeSetDetail = () => {
    setSelectedSet(null);
    setActiveSetTracks([]);
  };

  useEffect(() => {
    loadTracks();
    loadLocations();
    loadSets();
  }, []);

  const handleDiscogsSearch = async () => {
    try {
      setErrorMsg("");
      const result = await invoke("search_discogs", { query });
      setParsedTrack(result);
    } catch (error) {
      console.error("Error searching Discogs:", error);
      setParsedTrack(null);
      setErrorMsg(`Error: ${error}`);
    }
  };

  const saveTrack = async () => {
    if (!parsedTrack) return;
    try {
      await invoke("add_track", {
        title: parsedTrack.title,
        artist: parsedTrack.artist,
        format: "analog",
        locationId: null,
        coverUrl: parsedTrack.cover_url || null,
        filePath: null,
        bpm: null,
        duration: null,
      });
      setQuery("");
      setParsedTrack(null);
      alert("Track saved successfully!");
      await loadTracks();
    } catch (error) {
      console.error("Error saving track:", error);
      setErrorMsg(`Save Error: ${error}`);
    }
  };

  const formatDuration = (totalSeconds) => {
    if (!totalSeconds) return "--:--";
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;

    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleLocationChange = async (trackId, newLocationIdStr) => {
    try {
      // If empty string (""), pass null to the backend
      const newLocationId = newLocationIdStr ? parseInt(newLocationIdStr, 10) : null;
      await invoke("update_track_location", { trackId, newLocationId });
      await loadTracks();
    } catch (error) {
      console.error("Error updating track location:", error);
    }
  };

  const handlePlayPause = (track) => {
    if (playingTrackId === track.id) {
      audioRef.current.pause();
      setPlayingTrackId(null);
    } else {
      if (!track.file_path) return;
      const assetUrl = convertFileSrc(track.file_path);
      audioRef.current.src = assetUrl;
      audioRef.current.play().catch(e => console.error("Error playing audio:", e));
      setPlayingTrackId(track.id);
    }
  };

  const handleRemoveTrackFromSet = async (trackId) => {
    if (!selectedSet) return;
    try {
      await invoke("remove_track_from_set", { setId: selectedSet.id, trackId });
      const tracks = await invoke("get_tracks_in_set", { setId: selectedSet.id });
      setActiveSetTracks(tracks);
    } catch (error) {
      console.error("Error removing track from set:", error);
    }
  };

  const handleExportSet = async () => {
    if (!selectedSet || activeSetTracks.length === 0) return;
    try {
      const filePath = await save({
        filters: [{ name: 'Text', extensions: ['txt'] }],
        defaultPath: `${selectedSet.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_export.txt`,
      });

      if (!filePath) return;

      const trackListString = activeSetTracks.map((t, idx) => {
        const bpmPart = t.bpm ? ` (${t.bpm} BPM)` : "";
        return `${idx + 1}. ${t.artist} - ${t.title}${bpmPart} - ${t.format.charAt(0).toUpperCase() + t.format.slice(1)}`;
      }).join('\n');

      const header = `SET: ${selectedSet.name}\nTRACKS: ${activeSetTracks.length}\n-----------------------------------\n`;
      await writeTextFile(filePath, header + trackListString);

      setExportSuccess(true);
      setTimeout(() => {
        setExportSuccess(false);
      }, 2000);
    } catch (error) {
      console.error("Error exporting set:", error);
      alert("Failed to export set.");
    }
  };

  const handleCreateSet = async () => {
    if (!newSetName.trim()) return;
    try {
      await invoke("create_set", { name: newSetName });
      setNewSetName("");
      await loadSets();
    } catch (error) {
      console.error("Error creating set:", error);
    }
  };

  const handleAddTrackToSet = async (trackId) => {
    if (!selectedSet) return;
    try {
      await invoke("add_track_to_set", {
        setId: selectedSet.id,
        trackId: trackId,
        orderIndex: activeSetTracks.length
      });
      // Reload the set's tracks to show the new addition
      const updatedTracks = await invoke("get_tracks_in_set", { setId: selectedSet.id });
      setActiveSetTracks(updatedTracks);
    } catch (error) {
      console.error("Error adding track to set:", error);
    }
  };

  const handleDragStart = (index) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = async (index) => {
    if (draggedIndex === null || draggedIndex === index || !selectedSet) return;

    // Create a new array and move the dragged item
    const newTracks = [...activeSetTracks];
    const [draggedItem] = newTracks.splice(draggedIndex, 1);
    newTracks.splice(index, 0, draggedItem);

    // Update local state instantly for a snappy UI
    setActiveSetTracks(newTracks);
    setDraggedIndex(null);

    // Extract ordered track IDs and send to backend
    const newOrderArray = newTracks.map(t => t.id);
    try {
      await invoke("update_set_track_order", {
        setId: selectedSet.id,
        trackIds: newOrderArray
      });
    } catch (error) {
      console.error("Error updating track order:", error);
      // Optional: re-fetch from DB if it fails to revert
    }
  };

  const startEditing = (track) => {
    setEditingTrackId(track.id);
    setEditFormData({
      artist: track.artist || "",
      title: track.title || "",
      bpm: track.bpm || "",
      duration: track.duration || ""
    });
  };

  const handleEditChange = (field, value) => {
    setEditFormData(prev => ({ ...prev, [field]: value }));
  };

  const saveEdit = async () => {
    try {
      const bpmVal = editFormData.bpm ? parseInt(editFormData.bpm, 10) : null;
      const durationVal = editFormData.duration ? parseInt(editFormData.duration, 10) : null;

      await invoke("update_track_metadata", {
        trackId: editingTrackId,
        artist: editFormData.artist.trim(),
        title: editFormData.title.trim(),
        bpm: isNaN(bpmVal) ? null : bpmVal,
        duration: isNaN(durationVal) ? null : durationVal
      });

      setEditingTrackId(null);
      await loadTracks();
      if (selectedSet) {
        const tracks = await invoke("get_tracks_in_set", { setId: selectedSet.id });
        setActiveSetTracks(tracks);
      }
    } catch (error) {
      console.error("Error saving track metadata:", error);
    }
  };

  const filteredAndSortedTracks = tracks
    .filter((track) => {
      // 1. Search Filter (case-insensitive)
      if (searchQuery) {
        const queryLower = searchQuery.toLowerCase();
        const matchesArtist = track.artist.toLowerCase().includes(queryLower);
        const matchesTitle = track.title.toLowerCase().includes(queryLower);
        if (!matchesArtist && !matchesTitle) return false;
      }

      // 2. Format Filter
      if (filterFormat !== "all") {
        if (track.format !== filterFormat) return false;
      }

      return true;
    })
    .sort((a, b) => {
      // 3. Sorting
      if (sortBy === "artist") {
        return a.artist.localeCompare(b.artist);
      }
      if (sortBy === "bpm") {
        // null values go to the bottom
        if (a.bpm === null && b.bpm === null) return 0;
        if (a.bpm === null) return 1;
        if (b.bpm === null) return -1;
        return b.bpm - a.bpm;
      }
      // "added" is default, maintain array order (by id implicitly from DB)
      return 0;
    });

  const handleDigitalFileImport = async () => {
    try {
      const selectedPath = await open({
        multiple: false,
        filters: [{
          name: 'Audio',
          extensions: ['mp3', 'wav', 'aiff', 'flac', 'm4a']
        }]
      });

      if (selectedPath) {
        // Extract filename from the path
        const filenameWithExt = selectedPath.split(/[/\\]/).pop();
        const filename = filenameWithExt.substring(0, filenameWithExt.lastIndexOf('.')) || filenameWithExt;

        let artist = "Unknown";
        let title = filename;

        const parts = filename.split(" - ");
        if (parts.length >= 2) {
          artist = parts[0].trim();
          title = parts.slice(1).join(" - ").trim();
        }

        await invoke("add_track", {
          title: title,
          artist: artist,
          format: "digital",
          locationId: null,
          coverUrl: null,
          filePath: selectedPath,
          bpm: null,
          duration: null,
        });

        alert(`Digital track '${title}' saved successfully!`);
        await loadTracks();
      }
    } catch (error) {
      console.error("Error importing digital file:", error);
      setErrorMsg(`Import Error: ${error}`);
    }
  };

  return (
    <div style={{
      '--bg-color': isDarkMode ? '#121212' : '#f5f5f5',
      '--text-color': isDarkMode ? '#ffffff' : '#000000',
      '--panel-bg': isDarkMode ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.8)',
      '--accent-color': accentColor,
      minHeight: '100vh',
      background: 'var(--bg-color)',
      color: 'var(--text-color)',
      transition: 'background 0.3s ease, color 0.3s ease'
    }}>
      <div className="grain-overlay"></div>
      <div id="app" className="shell">
        {/* ── LEFT ZONE: Library & Vinyl ── */}
        <section className="zone-left">
          <header className="app-header">
            <div className="logo-text">SETFLOW <span className="badge">COLLAB</span></div>
            <div className="top-bar-right" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                style={{ background: 'transparent', border: '1px solid var(--color-border)', borderRadius: '4px', cursor: 'pointer', fontSize: '16px', padding: '4px' }}
              >
                {isDarkMode ? '☀️' : '🌙'}
              </button>
              <input
                type="color"
                value={accentColor}
                onChange={(e) => setAccentColor(e.target.value)}
                style={{ width: '30px', height: '30px', padding: '0', border: 'none', borderRadius: '4px', cursor: 'pointer', background: 'transparent' }}
                title="Accent Color"
              />
              <button id="upgrade-btn" className="btn b-out">UPGRADE</button>
              <div id="pro-badge" className="status-badge" style={{ display: 'none' }}>PRO</div>
              <div id="connection-status" className="status-badge">OFFLINE</div>
            </div>
          </header>

          <div className="tab-header">
            <button className="tab-btn active">LIBRARY</button>
            <button className="tab-btn">VINYL COLLECTION</button>
          </div>

          <div id="library-panel" className="panel-content">
            <div className="search-bar" style={{ display: 'flex', gap: '10px', padding: '10px 0', borderBottom: '1px solid var(--color-border)' }}>
              <input
                type="text"
                placeholder="SEARCH TRACKS..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ flex: 1, padding: '6px', background: 'var(--panel-bg)', border: '1px solid var(--color-border)', color: 'var(--text-color)', outline: 'none', borderRadius: '4px' }}
              />
              <select
                value={filterFormat}
                onChange={(e) => setFilterFormat(e.target.value)}
                style={{ background: 'var(--panel-bg)', border: '1px solid var(--color-border)', color: 'var(--text-color)', padding: '6px', borderRadius: '4px', outline: 'none', cursor: 'pointer' }}
              >
                <option value="all">All Formats</option>
                <option value="analog">Analog</option>
                <option value="digital">Digital</option>
              </select>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                style={{ background: 'var(--panel-bg)', border: '1px solid var(--color-border)', color: 'var(--text-color)', padding: '6px', borderRadius: '4px', outline: 'none', cursor: 'pointer' }}
              >
                <option value="added">Sort: Added</option>
                <option value="artist">Sort: Artist</option>
                <option value="bpm">Sort: BPM</option>
              </select>
            </div>
            <div id="track-list" className="track-list">
              {filteredAndSortedTracks.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-color)', opacity: 0.5, fontSize: '13px', fontStyle: 'italic' }}>
                  Keine Tracks gefunden. Füge Musik hinzu oder passe deine Suche an.
                </div>
              ) : (
                filteredAndSortedTracks.map((track) => (
                <div key={track.id} style={{ display: 'flex', alignItems: 'center', padding: '10px', borderBottom: '1px solid var(--color-border)', background: 'var(--panel-bg)' }}>
                  {track.cover_url ? (
                    <img src={track.cover_url} alt="Cover" style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px', marginRight: '15px' }} />
                  ) : (
                    <div style={{ width: '40px', height: '40px', background: 'var(--color-bg-deep)', borderRadius: '4px', marginRight: '15px', border: '1px dashed var(--color-border)' }}></div>
                  )}
                  <div style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
                    {track.format === "digital" && track.file_path && (
                      <div
                        onClick={() => handlePlayPause(track)}
                        style={{ cursor: 'pointer', marginRight: '10px', fontSize: '16px', transition: 'all 0.2s ease', opacity: 0.8 }}
                        onMouseOver={(e) => e.currentTarget.style.opacity = 1}
                        onMouseOut={(e) => e.currentTarget.style.opacity = 0.8}
                      >
                        {playingTrackId === track.id ? '⏸️' : '▶️'}
                      </div>
                    )}
                    <div style={{ flex: 1 }}>
                    {editingTrackId === track.id ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', paddingRight: '10px' }}>
                        <input
                          type="text"
                          value={editFormData.title}
                          onChange={(e) => handleEditChange('title', e.target.value)}
                          placeholder="Title"
                          style={{ background: 'var(--bg-color)', color: 'var(--text-color)', border: 'none', borderBottom: '1px solid var(--accent-color)', outline: 'none', fontSize: '12px', fontWeight: 'bold' }}
                        />
                        <div style={{ display: 'flex', gap: '8px', fontSize: '11px' }}>
                          <input
                            type="text"
                            value={editFormData.artist}
                            onChange={(e) => handleEditChange('artist', e.target.value)}
                            placeholder="Artist"
                            style={{ flex: 1, background: 'var(--bg-color)', color: 'var(--text-color)', opacity: 0.8, border: 'none', borderBottom: '1px solid var(--accent-color)', outline: 'none' }}
                          />
                          <input
                            type="number"
                            value={editFormData.bpm}
                            onChange={(e) => handleEditChange('bpm', e.target.value)}
                            placeholder="BPM"
                            style={{ width: '45px', background: 'var(--bg-color)', color: 'var(--text-color)', opacity: 0.6, border: 'none', borderBottom: '1px solid var(--accent-color)', outline: 'none' }}
                          />
                          <input
                            type="number"
                            value={editFormData.duration}
                            onChange={(e) => handleEditChange('duration', e.target.value)}
                            placeholder="Sec"
                            style={{ width: '45px', background: 'var(--bg-color)', color: 'var(--text-color)', opacity: 0.6, border: 'none', borderBottom: '1px solid var(--accent-color)', outline: 'none' }}
                          />
                        </div>
                      </div>
                    ) : (
                      <>
                        <div style={{ fontWeight: 'bold', color: 'var(--color-text-main)' }}>{track.title}</div>
                        <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                          {track.artist}
                          <span style={{ marginLeft: '10px', color: 'var(--text-color)', opacity: 0.4 }}>
                            BPM: {track.bpm || '--'} | {track.duration ? formatDuration(track.duration) : '--:--'}
                          </span>
                        </div>
                      </>
                    )}
                    </div>
                  </div>
                  <div style={{ marginRight: '15px' }}>
                    <select
                      value={track.location_id || ""}
                      onChange={(e) => handleLocationChange(track.id, e.target.value)}
                      style={{
                        background: 'var(--panel-bg)',
                        border: '1px solid var(--color-border)',
                        color: 'var(--text-color)',
                        padding: '4px 8px',
                        fontSize: '11px',
                        borderRadius: '4px',
                        outline: 'none',
                        cursor: 'pointer'
                      }}
                    >
                      <option value="">Kein Ort zugewiesen</option>
                      {locations.map((loc) => (
                        <option key={loc.id} value={loc.id}>
                          {loc.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <span className="badge" style={{ fontSize: '10px' }}>{track.format.toUpperCase()}</span>
                  </div>
                  <div style={{ marginLeft: '15px', display: 'flex', gap: '8px' }}>
                    {editingTrackId === track.id ? (
                      <button
                        onClick={saveEdit}
                        style={{ background: 'transparent', border: 'none', color: 'var(--accent-color)', cursor: 'pointer', fontSize: '16px' }}
                        title="Save"
                      >
                        💾
                      </button>
                    ) : (
                      <button
                        onClick={() => startEditing(track)}
                        style={{ background: 'transparent', border: 'none', color: 'var(--text-color)', opacity: 0.6, cursor: 'pointer', fontSize: '14px' }}
                        title="Edit"
                      >
                        ✏️
                      </button>
                    )}
                    {selectedSet && (
                      <button
                        onClick={() => handleAddTrackToSet(track.id)}
                        style={{
                          background: 'transparent',
                          border: '1px solid var(--accent-color)',
                          color: 'var(--accent-color)',
                          width: '28px',
                          height: '28px',
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          fontSize: '18px',
                          lineHeight: '1',
                          outline: 'none',
                          transition: 'background 0.2s, color 0.2s'
                        }}
                        onMouseOver={(e) => {
                          e.target.style.background = 'var(--accent-color)';
                          e.target.style.color = 'var(--bg-color)';
                        }}
                        onMouseOut={(e) => {
                          e.target.style.background = 'transparent';
                          e.target.style.color = 'var(--accent-color)';
                        }}
                      >
                        +
                      </button>
                    )}
                  </div>
                </div>
              )))}
            </div>
          </div>

          <div id="vinyl-panel" className="panel-content" style={{ display: 'none' }}>
            <div id="vinyl-grid" className="vinyl-grid"></div>
          </div>
        </section>

        {/* ── MID ZONE: Hybrid Bridge Mapper ── */}
        <section className="zone-mid">
          <div className="bridge-container">
            <div className="bridge-header">HYBRID BRIDGE <span className="badge">MAPPER</span></div>

            <div className="bridge-slots">
              <div id="hb-vinyl-list" className="hb-list"></div>
              <div className="bridge-arrow">⟷</div>
              <div id="hb-track-list" className="hb-list"></div>
            </div>

            <div className="bridge-footer">
              <div id="hb-idle" className="hb-status">SELECT BOTH SIDES TO LINK</div>
              <div id="hb-ready" className="hb-status" style={{ display: 'none' }}>
                <span id="hb-ready-vinyl-label"></span> ⟷ <span id="hb-ready-track-label"></span>
              </div>
              <button id="hb-execute-btn" className="btn btn-primary">EXECUTE LINK</button>
              <div id="hb-exec-label"></div>
            </div>
          </div>
        </section>

        {/* ── RIGHT ZONE: Detail Panel ── */}
        <section id="pnl" className="zone-right">
          <div id="pi" className="panel-inner" style={{ background: 'var(--panel-bg)', color: 'var(--text-color)' }}>
            <div style={{ padding: '20px' }}>
              <h3 style={{ color: 'var(--accent-color)', marginBottom: '10px' }}>DISCOGS TEST SEARCH</h3>
              <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Enter Barcode / Title..."
                  style={{ flex: 1, padding: '8px', background: 'var(--bg-color)', border: '1px solid var(--color-border)', color: 'var(--text-color)', outline: 'none' }}
                />
                <button className="btn btn-primary" onClick={handleDiscogsSearch} style={{ background: 'var(--accent-color)', color: 'var(--bg-color)', border: 'none' }}>SEARCH</button>
              </div>
              {errorMsg && (
                <div style={{ color: 'red', marginBottom: '10px', fontSize: '12px' }}>
                  {errorMsg}
                </div>
              )}
              {parsedTrack && (
                <div style={{ background: 'var(--bg-color)', padding: '15px', border: '1px solid var(--color-border)', borderRadius: '4px' }}>
                  {parsedTrack.cover_url && (
                    <img
                      src={parsedTrack.cover_url}
                      alt="Cover"
                      style={{ maxWidth: '150px', marginBottom: '10px', display: 'block', borderRadius: '4px' }}
                    />
                  )}
                  <div style={{ marginBottom: '10px', color: 'var(--text-color)' }}>
                    <strong>Artist:</strong> {parsedTrack.artist} <br/>
                    <strong>Title:</strong> {parsedTrack.title} <br/>
                    <strong>Year:</strong> {parsedTrack.year || "N/A"}
                  </div>
                  <button className="btn btn-primary" onClick={saveTrack} style={{ width: '100%', background: 'var(--accent-color)', color: 'var(--bg-color)', border: 'none' }}>
                    SAVE TO DB
                  </button>
                </div>
              )}

              <div style={{ marginTop: '30px' }}>
                <button className="btn btn-primary" onClick={handleDigitalFileImport} style={{ width: '100%', background: 'var(--accent-color)', color: 'var(--bg-color)', border: 'none' }}>
                  ADD DIGITAL FILE
                </button>
              </div>

              {selectedSet ? (
                <div style={{ marginTop: '30px', borderTop: '1px solid var(--color-border)', paddingTop: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <h3 style={{ color: 'var(--accent-color)', margin: 0 }}>SET: {selectedSet.name}</h3>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        className="btn b-out"
                        onClick={handleExportSet}
                        style={{ padding: '4px 8px', fontSize: '11px', transition: 'all 0.2s ease', backgroundColor: exportSuccess ? 'var(--accent-color)' : 'transparent', color: exportSuccess ? 'var(--bg-color)' : 'var(--text-color)', borderColor: 'var(--accent-color)' }}
                      >
                        {exportSuccess ? "Erfolgreich exportiert! ✅" : "EXPORT SET"}
                      </button>
                      <button className="btn b-out" onClick={closeSetDetail} style={{ padding: '4px 8px', fontSize: '11px', transition: 'all 0.2s ease', color: 'var(--text-color)', borderColor: 'var(--accent-color)' }}>BACK</button>
                    </div>
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-color)', opacity: 0.6, marginBottom: '15px' }}>
                    Tracks: {activeSetTracks.length} | Dauer: {formatDuration(activeSetTracks.reduce((acc, curr) => acc + (curr.duration || 0), 0))} | Ø BPM: {
                      (() => {
                        const bpmTracks = activeSetTracks.filter(t => t.bpm && t.bpm > 0);
                        if (bpmTracks.length === 0) return "--";
                        return Math.round(bpmTracks.reduce((acc, t) => acc + t.bpm, 0) / bpmTracks.length);
                      })()
                    } | {
                      (() => {
                        const analogs = activeSetTracks.filter(t => t.format === 'analog').length;
                        const digitals = activeSetTracks.filter(t => t.format === 'digital').length;
                        return `Analog: ${analogs} | Digital: ${digitals}`;
                      })()
                    }
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {activeSetTracks.length === 0 ? (
                      <div style={{ color: 'var(--text-color)', opacity: 0.5, textAlign: 'center', padding: '20px', fontSize: '12px', fontStyle: 'italic' }}>
                        Dieses Set ist noch leer. Klicke auf das '+' in deiner Bibliothek, um Tracks hinzuzufügen.
                      </div>
                    ) : (
                      activeSetTracks.map((track, index) => (
                        <div
                          key={`${track.id}-${index}`}
                          draggable={true}
                          onDragStart={() => handleDragStart(index)}
                          onDragOver={handleDragOver}
                          onDrop={() => handleDrop(index)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            background: 'var(--bg-color)',
                            padding: '6px',
                            borderRadius: '4px',
                            border: '1px solid var(--color-border)',
                            transition: 'border 0.2s',
                          }}
                          onDragEnter={(e) => e.currentTarget.style.border = '1px dashed var(--accent-color)'}
                          onDragLeave={(e) => e.currentTarget.style.border = '1px solid var(--color-border)'}
                          onDropCapture={(e) => e.currentTarget.style.border = '1px solid var(--color-border)'}
                        >
                          <div
                            onClick={() => handleRemoveTrackFromSet(track.id)}
                            style={{ color: 'var(--text-color)', opacity: 0.6, cursor: 'pointer', padding: '0 6px', fontSize: '12px', fontWeight: 'bold', transition: 'all 0.2s ease' }}
                            title="Remove track"
                            onMouseOver={(e) => { e.currentTarget.style.color = '#ff4444'; e.currentTarget.style.transform = 'scale(1.2)'; }}
                            onMouseOut={(e) => { e.currentTarget.style.color = 'var(--text-color)'; e.currentTarget.style.transform = 'scale(1)'; }}
                          >
                            X
                          </div>
                          <div style={{ cursor: 'grab', color: 'var(--text-color)', opacity: 0.5, padding: '0 8px', fontSize: '14px', userSelect: 'none' }}>
                            ≡
                          </div>
                          <div style={{ fontSize: '10px', color: 'var(--accent-color)', width: '20px', textAlign: 'center', fontWeight: 'bold', marginRight: '6px' }}>
                            {index + 1}.
                          </div>
                          {track.cover_url ? (
                            <img src={track.cover_url} alt="Cover" style={{ width: '24px', height: '24px', objectFit: 'cover', borderRadius: '2px', marginRight: '10px' }} />
                          ) : (
                            <div style={{ width: '24px', height: '24px', background: 'var(--color-bg-deep)', borderRadius: '2px', marginRight: '10px', border: '1px dashed var(--color-border)' }}></div>
                          )}
                          {track.format === "digital" && track.file_path && (
                            <div
                              onClick={() => handlePlayPause(track)}
                              style={{ cursor: 'pointer', marginRight: '8px', fontSize: '14px', transition: 'all 0.2s ease', opacity: 0.8, color: 'var(--accent-color)' }}
                              onMouseOver={(e) => e.currentTarget.style.opacity = 1}
                              onMouseOut={(e) => e.currentTarget.style.opacity = 0.8}
                            >
                              {playingTrackId === track.id ? '⏸️' : '▶️'}
                            </div>
                          )}
                          <div style={{ flex: 1, overflow: 'hidden' }}>
                            <div style={{ fontWeight: 'bold', color: 'var(--text-color)', fontSize: '11px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{track.title}</div>
                            <div style={{ fontSize: '10px', color: 'var(--text-color)', opacity: 0.7, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {track.artist}
                              <span style={{ marginLeft: '6px', color: 'var(--text-color)', opacity: 0.4 }}>
                                BPM: {track.bpm || '--'} | {track.duration ? formatDuration(track.duration) : '--:--'}
                              </span>
                            </div>
                          </div>
                          <div>
                            <span className="badge" style={{ fontSize: '8px', padding: '2px 4px', background: 'var(--accent-color)', color: 'var(--bg-color)', border: 'none' }}>{track.format.toUpperCase()}</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              ) : (
                <div style={{ marginTop: '30px', borderTop: '1px solid var(--color-border)', paddingTop: '20px' }}>
                  <h3 style={{ color: 'var(--accent-color)', marginBottom: '10px' }}>SET MANAGEMENT</h3>
                  <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
                    <input
                      type="text"
                      value={newSetName}
                      onChange={(e) => setNewSetName(e.target.value)}
                      placeholder="Enter Set Name..."
                      style={{ flex: 1, padding: '8px', background: 'var(--bg-color)', border: '1px solid var(--color-border)', color: 'var(--text-color)', outline: 'none' }}
                    />
                    <button className="btn btn-primary" onClick={handleCreateSet} style={{ background: 'var(--accent-color)', color: 'var(--bg-color)', border: 'none' }}>CREATE SET</button>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {sets.map(set => (
                      <div
                        key={set.id}
                        onClick={() => openSetDetail(set)}
                        style={{
                          background: 'var(--bg-color)',
                          border: '1px solid var(--color-border)',
                          color: 'var(--text-color)',
                          padding: '12px',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          transition: 'all 0.2s ease'
                        }}
                        onMouseOver={(e) => { e.currentTarget.style.borderColor = 'var(--accent-color)'; e.currentTarget.style.transform = 'translateY(-2px)'}}
                        onMouseOut={(e) => { e.currentTarget.style.borderColor = 'var(--color-border)'; e.currentTarget.style.transform = 'translateY(0)'}}
                      >
                        <span style={{ fontWeight: 'bold' }}>{set.name}</span>
                        <span style={{ fontSize: '10px', opacity: 0.5 }}>ID: {set.id}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
      <audio ref={audioRef} onEnded={() => setPlayingTrackId(null)} style={{ display: 'none' }} />
    </div>
  );
}

export default App;
