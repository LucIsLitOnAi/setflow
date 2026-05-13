import React, { useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";

function App() {
  useEffect(() => {
    const fetchBackendData = async () => {
      try {
        const locations = await invoke("get_locations");
        console.log("Fetched locations from backend:", locations);

        const sets = await invoke("get_sets");
        console.log("Fetched sets from backend:", sets);
      } catch (error) {
        console.error("Error communicating with backend:", error);
      }
    };

    fetchBackendData();
  }, []);

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
          <div id="pi" className="panel-inner"></div>
        </section>
      </div>
    </>
  );
}

export default App;
