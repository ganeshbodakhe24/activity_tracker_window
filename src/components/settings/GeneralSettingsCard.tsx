import React from "react";
import { Settings as SettingsIcon } from "lucide-react";

interface GeneralSettingsCardProps {
  autostart: boolean;
  onAutostartToggle: () => void;
  filterActive: boolean;
  onFilterToggle: () => void;
}

export const GeneralSettingsCard: React.FC<GeneralSettingsCardProps> = ({
  autostart,
  onAutostartToggle,
  filterActive,
  onFilterToggle,
}) => {
  return (
    <div className="dashboard-card" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      <h3 className="card-title">
        <span style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <SettingsIcon size={18} />
          General Tracker Configuration
        </span>
      </h3>

      <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginTop: "0.5rem" }}>
        {/* Autostart Toggle */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <span style={{ fontWeight: "600", fontSize: "0.95rem", display: "block" }}>
              Launch on system startup
            </span>
            <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>
              Start tracking automatically when Windows starts up.
            </span>
          </div>
          <input
            type="checkbox"
            checked={autostart}
            onChange={onAutostartToggle}
            style={{ width: "20px", height: "20px", cursor: "pointer", accentColor: "var(--accent-color)" }}
          />
        </div>

        {/* Filter Enable Toggle */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderTop: "1px solid var(--border-color)",
            paddingTop: "1rem",
          }}
        >
          <div>
            <span style={{ fontWeight: "600", fontSize: "0.95rem", display: "block" }}>
              Use Dynamic Classifier Rules
            </span>
            <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>
              Enable automatic category classification using sqlite keywords list.
            </span>
          </div>
          <input
            type="checkbox"
            checked={filterActive}
            onChange={onFilterToggle}
            style={{ width: "20px", height: "20px", cursor: "pointer", accentColor: "var(--accent-color)" }}
          />
        </div>
      </div>
    </div>
  );
};

export default GeneralSettingsCard;
