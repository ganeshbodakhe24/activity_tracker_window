import { useState, useEffect } from "react";
import SplashScreen from "./components/SplashScreen";
import Dashboard from "./pages/Dashboard";
import Timeline from "./pages/Timeline";
import Activities from "./pages/Activities";
import DataManagement from "./pages/DataManagement";
import Settings from "./pages/Settings";
import {
  LayoutDashboard,
  Clock,
  ListCollapse,
  Database,
  Settings as SettingsIcon,
  Play,
  Pause
} from "lucide-react";

export type Tab = "dashboard" | "timeline" | "activities" | "data" | "settings";

// Safe invoke import for Tauri
const invoke = (window as any).__TAURI__?.core?.invoke || (() => Promise.resolve());
const listen = (window as any).__TAURI__?.event?.listen || (() => () => {});

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>("dashboard");
  const [isTracking, setIsTracking] = useState(true);
  const [currentApp, setCurrentApp] = useState<string>("");
  const [currentAppDuration, setCurrentAppDuration] = useState<number>(0);

  // Load tracking status & listen for Rust events
  useEffect(() => {
    // Check initial tracking status
    invoke("is_tracking")
      .then((status: any) => {
        if (typeof status === "boolean") setIsTracking(status);
      })
      .catch(() => {});

    // Listen for current activity updates from Rust
    let unlisten: any;
    const setupListener = async () => {
      try {
        unlisten = await listen("active_window_changed", (event: any) => {
          if (event.payload) {
            setCurrentApp(event.payload.application || "");
            setCurrentAppDuration(0);
          }
        });
      } catch (e) {}
    };
    setupListener();

    return () => {
      if (unlisten) unlisten();
    };
  }, []);

  // Update counter for current app duration
  useEffect(() => {
    let timer: any;
    if (currentApp) {
      timer = setInterval(() => {
        setCurrentAppDuration((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [currentApp]);

  const toggleTracking = async () => {
    try {
      const newStatus = !isTracking;
      await invoke("set_tracking_status", { active: newStatus });
      setIsTracking(newStatus);
    } catch (e) {}
  };

  const formatDuration = (sec: number) => {
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className="app-container">
      <SplashScreen />

      {/* Sidebar */}
      <aside className="sidebar">
        <div className="logo-section">
          <div className="logo-dot"></div>
          <span className="logo-text">Activity Tracker</span>
        </div>

        <nav className="nav-links">
          <button
            onClick={() => setActiveTab("dashboard")}
            className={`nav-link ${activeTab === "dashboard" ? "active" : ""}`}
            style={{ background: "none", border: "none", width: "100%", textAlign: "left" }}
          >
            <LayoutDashboard size={18} />
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab("timeline")}
            className={`nav-link ${activeTab === "timeline" ? "active" : ""}`}
            style={{ background: "none", border: "none", width: "100%", textAlign: "left" }}
          >
            <Clock size={18} />
            Timeline
          </button>
          <button
            onClick={() => setActiveTab("activities")}
            className={`nav-link ${activeTab === "activities" ? "active" : ""}`}
            style={{ background: "none", border: "none", width: "100%", textAlign: "left" }}
          >
            <ListCollapse size={18} />
            Activities
          </button>
          <button
            onClick={() => setActiveTab("data")}
            className={`nav-link ${activeTab === "data" ? "active" : ""}`}
            style={{ background: "none", border: "none", width: "100%", textAlign: "left" }}
          >
            <Database size={18} />
            Data Management
          </button>
          <button
            onClick={() => setActiveTab("settings")}
            className={`nav-link ${activeTab === "settings" ? "active" : ""}`}
            style={{ background: "none", border: "none", width: "100%", textAlign: "left" }}
          >
            <SettingsIcon size={18} />
            Settings
          </button>
        </nav>

        {/* Tracking Controller */}
        <div
          style={{
            marginTop: "auto",
            backgroundColor: "var(--bg-tertiary)",
            padding: "1rem",
            borderRadius: "0.5rem",
            border: "1px solid var(--border-color)",
            display: "flex",
            flexDirection: "column",
            gap: "0.75rem",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: "0.35rem" }}>
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  backgroundColor: isTracking ? "var(--success-color)" : "var(--text-muted)",
                  display: "inline-block",
                }}
              ></span>
              {isTracking ? "Tracking Active" : "Tracking Paused"}
            </span>
            <button
              onClick={toggleTracking}
              className="btn btn-secondary"
              style={{ padding: "0.25rem 0.5rem" }}
            >
              {isTracking ? <Pause size={14} /> : <Play size={14} />}
            </button>
          </div>

          {isTracking && currentApp && (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.15rem" }}>
              <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: "500" }}>CURRENT APP</span>
              <span style={{ fontSize: "0.9rem", fontWeight: "600", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>
                {currentApp}
              </span>
              <span style={{ fontSize: "0.8rem", color: "var(--accent-color)", fontFamily: "monospace" }}>
                {formatDuration(currentAppDuration)}
              </span>
            </div>
          )}
        </div>
      </aside>

      {/* Main View Area */}
      <main className="main-layout">
        <header className="header">
          <h1 className="header-title">
            {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
          </h1>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
              Local Time: {new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </span>
          </div>
        </header>

        <div className="content-body">
          {activeTab === "dashboard" && <Dashboard />}
          {activeTab === "timeline" && <Timeline />}
          {activeTab === "activities" && <Activities />}
          {activeTab === "data" && <DataManagement />}
          {activeTab === "settings" && <Settings />}
        </div>
      </main>
    </div>
  );
}
