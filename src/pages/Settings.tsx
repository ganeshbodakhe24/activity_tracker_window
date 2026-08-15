import { useState, useEffect } from "react";
import { Settings as SettingsIcon, Database, Sparkles, AlertTriangle } from "lucide-react";

const invoke = (window as any).__TAURI__?.core?.invoke || (() => Promise.resolve());

export default function Settings() {
  const [autostart, setAutostart] = useState(false);
  const [filterActive, setFilterActive] = useState(true);
  const [cleaning, setCleaning] = useState(false);
  const [prunedCount, setPrunedCount] = useState<number | null>(null);
  const [showPruneConfirm, setShowPruneConfirm] = useState(false);

  useEffect(() => {
    // Fetch settings state from Rust on load
    invoke("get_settings")
      .then((res: any) => {
        if (res) {
          setAutostart(res.autostart || false);
          setFilterActive(res.filter_active || false);
        }
      })
      .catch(() => {});
  }, []);

  const handleAutostartToggle = async () => {
    try {
      const nextVal = !autostart;
      await invoke("set_autostart", { enabled: nextVal });
      setAutostart(nextVal);
    } catch (e) {
      alert("Failed to toggle autostart.");
    }
  };

  const handleFilterToggle = async () => {
    try {
      const nextVal = !filterActive;
      await invoke("set_filter_active", { enabled: nextVal });
      setFilterActive(nextVal);
    } catch (e) {
      alert("Failed to toggle classification filter.");
    }
  };

  const triggerPruning = () => {
    setShowPruneConfirm(true);
  };

  const executePruning = async () => {
    setShowPruneConfirm(false);
    setCleaning(true);
    setPrunedCount(null);
    try {
      // Manually trigger pruning old detailed visits older than Sunday
      const count = await invoke("trigger_manual_cleanup");
      setPrunedCount(count || 0);
    } catch (e) {
      alert("Pruning failed.");
    } finally {
      setCleaning(false);
    }
  };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem" }}>
      {/* General Settings */}
      <div className="dashboard-card" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        <h3 className="card-title">
          <span style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <SettingsIcon size={18} />
            General Tracker Configuration
          </span>
        </h3>

        <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginTop: "0.5rem" }}>
          {/* Autostart */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <span style={{ fontWeight: "600", fontSize: "0.95rem", display: "block" }}>Launch on system startup</span>
              <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>
                Start tracking automatically when Windows starts up.
              </span>
            </div>
            <input
              type="checkbox"
              checked={autostart}
              onChange={handleAutostartToggle}
              style={{ width: "20px", height: "20px", cursor: "pointer", accentColor: "var(--accent-color)" }}
            />
          </div>

          {/* Filter Enable */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: "1px solid var(--border-color)", paddingTop: "1rem" }}>
            <div>
              <span style={{ fontWeight: "600", fontSize: "0.95rem", display: "block" }}>Use Dynamic Classifier Rules</span>
              <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>
                Enable automatic category classification using sqlite keywords list.
              </span>
            </div>
            <input
              type="checkbox"
              checked={filterActive}
              onChange={handleFilterToggle}
              style={{ width: "20px", height: "20px", cursor: "pointer", accentColor: "var(--accent-color)" }}
            />
          </div>
        </div>
      </div>

      {/* Database Pruning Control */}
      <div className="dashboard-card" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        <h3 className="card-title">
          <span style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Database size={18} />
            Database Maintenance
          </span>
        </h3>

        <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", lineHeight: "1.4" }}>
          To keep the tracker running efficiently on normal laptops, detailed raw log history (`activity_visits`) is automatically purged every Sunday morning, keeping only aggregate calculations inside the `activities` table.
        </p>

        <div style={{ marginTop: "0.5rem" }}>
          <button
            onClick={triggerPruning}
            disabled={cleaning}
            className="btn btn-secondary"
            style={{ width: "100%" }}
          >
            {cleaning ? "Wiping Database history..." : "Prune Detailed Logs Manually Now"}
          </button>
        </div>

        {prunedCount !== null && (
          <p style={{ fontSize: "0.85rem", color: "var(--success-color)", fontWeight: "500", marginTop: "0.5rem" }}>
            Successfully cleaned up {prunedCount} detailed visits older than Sunday.
          </p>
        )}
      </div>

      {/* App Info Card */}
      <div className="dashboard-card" style={{ gridColumn: "span 2", display: "flex", gap: "1.5rem", alignItems: "center" }}>
        <Sparkles size={40} className="text-indigo-400" style={{ flexShrink: 0 }} />
        <div>
          <h4 style={{ fontWeight: "700", fontSize: "1rem", marginBottom: "0.25rem" }}>Activity Tracker v0.1.0</h4>
          <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", lineHeight: "1.4" }}>
            A lightweight, resource-efficient background task tracking engine built in Rust with Tauri GUI for Windows systems. It operates safely locally, ensuring all your data remains on your machine in the SQLite backend.
          </p>
        </div>
      </div>
      {/* Custom Confirmation Popup Warning Modal */}
      {showPruneConfirm && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ borderColor: "var(--danger-color)" }}>
            <h4 style={{ fontWeight: "700", marginBottom: "1.5rem", color: "var(--danger-color)", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <AlertTriangle size={24} />
              Confirm Database Cleanup
            </h4>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", marginBottom: "1.5rem", lineHeight: "1.4" }}>
              WARNING: This will permanently delete ALL detailed activity session logs (activity_visits) from your SQLite database. Your aggregated dashboard dashboard metrics will not be affected.
            </p>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem" }}>
              <button onClick={() => setShowPruneConfirm(false)} className="btn btn-secondary">
                Cancel
              </button>
              <button onClick={executePruning} className="btn btn-danger">
                Proceed Wiping Data
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
