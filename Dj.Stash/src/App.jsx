import React, { useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { open } from "@tauri-apps/plugin-dialog";

function App() {
  const [query, setQuery] = useState("");
  const [parsedTrack, setParsedTrack] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");

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
      });
      setQuery("");
      setParsedTrack(null);
      alert("Track saved successfully!");
    } catch (error) {
      console.error("Error saving track:", error);
      setErrorMsg(`Save Error: ${error}`);
    }
  };

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
          filePath: selectedPath
        });

        alert(`Digital track '${title}' saved successfully!`);
      }
    } catch (error) {
      console.error("Error importing digital file:", error);
      setErrorMsg(`Import Error: ${error}`);
    }
  };

  return (
    <>
      <div className="grain-overlay"></div>
      <div id="app" className="shell">
        {/* ── LEFT ZONE: Library & Vinyl ── */}
        <section className="zone-left">
          <header className="app-header">
            <div className="logo-text">SETFLOW <span className="badge">COLLAB</span></div>
            <div className="top-bar-right">
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
            <div className="search-bar">
              <input type="text" id="search-input" placeholder="SEARCH TRACKS..." />
            </div>
            <div id="track-list" className="track-list"></div>
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
          <div id="pi" className="panel-inner">
            <div style={{ padding: '20px' }}>
              <h3 style={{ color: 'var(--color-accent-steel)', marginBottom: '10px' }}>DISCOGS TEST SEARCH</h3>
              <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Enter Barcode / Title..."
                  style={{ flex: 1, padding: '8px', background: 'rgba(0,0,0,0.5)', border: '1px solid var(--color-border)', color: '#fff' }}
                />
                <button className="btn btn-primary" onClick={handleDiscogsSearch}>SEARCH</button>
              </div>
              {errorMsg && (
                <div style={{ color: 'red', marginBottom: '10px', fontSize: '12px' }}>
                  {errorMsg}
                </div>
              )}
              {parsedTrack && (
                <div style={{ background: 'rgba(0,0,0,0.7)', padding: '15px', border: '1px solid var(--color-border)', borderRadius: '4px' }}>
                  {parsedTrack.cover_url && (
                    <img
                      src={parsedTrack.cover_url}
                      alt="Cover"
                      style={{ maxWidth: '150px', marginBottom: '10px', display: 'block', borderRadius: '4px' }}
                    />
                  )}
                  <div style={{ marginBottom: '10px', color: '#fff' }}>
                    <strong>Artist:</strong> {parsedTrack.artist} <br/>
                    <strong>Title:</strong> {parsedTrack.title} <br/>
                    <strong>Year:</strong> {parsedTrack.year || "N/A"}
                  </div>
                  <button className="btn btn-primary" onClick={saveTrack} style={{ width: '100%' }}>
                    SAVE TO DB
                  </button>
                </div>
              )}

              <div style={{ marginTop: '30px' }}>
                <button className="btn btn-primary" onClick={handleDigitalFileImport} style={{ width: '100%' }}>
                  ADD DIGITAL FILE
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}

export default App;
