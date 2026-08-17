import React from "react";
import { Sparkles } from "lucide-react";

export const AboutAppCard: React.FC = () => {
  return (
    <div
      className="dashboard-card"
      style={{ gridColumn: "span 2", display: "flex", gap: "1.5rem", alignItems: "center" }}
    >
      <Sparkles size={40} className="text-indigo-400" style={{ flexShrink: 0 }} />
      <div>
        <h4 style={{ fontWeight: "700", fontSize: "1rem", marginBottom: "0.25rem" }}>Activity Tracker v0.1.0</h4>
        <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", lineHeight: "1.4" }}>
          A lightweight, resource-efficient background task tracking engine built in Rust with Tauri GUI for Windows
          systems. It operates safely locally, ensuring all your data remains on your machine in the SQLite backend.
        </p>
      </div>
    </div>
  );
};

export default AboutAppCard;
