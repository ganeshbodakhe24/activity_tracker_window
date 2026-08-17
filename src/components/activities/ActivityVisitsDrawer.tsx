import React from "react";
import { X } from "lucide-react";
import { Activity, VisitDetail, formatHours, formatTime } from "./types";

interface ActivityVisitsDrawerProps {
  selectedActivity: Activity;
  visits: VisitDetail[];
  onClose: () => void;
}

export const ActivityVisitsDrawer: React.FC<ActivityVisitsDrawerProps> = ({
  selectedActivity,
  visits,
  onClose,
}) => {
  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        right: 0,
        bottom: 0,
        width: "360px",
        backgroundColor: "var(--bg-secondary)",
        borderLeft: "1px solid var(--border-color)",
        boxShadow: "-10px 0 30px rgba(0, 0, 0, 0.4)",
        display: "flex",
        flexDirection: "column",
        zIndex: 10,
        padding: "1.5rem",
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <h4 style={{ fontWeight: "700", fontSize: "1.1rem" }}>Detailed Visits</h4>
        <button
          onClick={onClose}
          className="btn btn-secondary"
          style={{ padding: "0.3rem" }}
          title="Close details"
        >
          <X size={16} />
        </button>
      </div>

      {/* Activity Summary Info */}
      <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem", marginBottom: "1.5rem" }}>
        <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: "600" }}>APPLICATION</span>
        <span style={{ fontSize: "0.95rem", fontWeight: "600" }}>{selectedActivity.application}</span>

        {selectedActivity.website && (
          <>
            <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: "600", marginTop: "0.5rem" }}>
              WEBSITE
            </span>
            <span style={{ fontSize: "0.9rem", color: "var(--accent-color)", fontWeight: "500" }}>
              {selectedActivity.website}
            </span>
          </>
        )}

        <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: "600", marginTop: "0.5rem" }}>
          TITLE
        </span>
        <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)", lineHeight: "1.2" }}>
          {selectedActivity.title}
        </span>
      </div>

      {/* Visits List */}
      <span
        style={{
          fontSize: "0.75rem",
          color: "var(--text-muted)",
          fontWeight: "600",
          marginBottom: "0.75rem",
          display: "block",
        }}
      >
        SESSION RECORDINGS
      </span>

      <div style={{ flexGrow: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        {visits.length === 0 ? (
          <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>No visit recordings found.</p>
        ) : (
          visits.map((v) => (
            <div
              key={v.id}
              style={{
                backgroundColor: "var(--bg-tertiary)",
                border: "1px solid var(--border-color)",
                borderRadius: "0.375rem",
                padding: "0.75rem",
                fontSize: "0.85rem",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.25rem" }}>
                <span style={{ fontWeight: "600" }}>
                  {formatTime(v.start_time)} → {formatTime(v.end_time)}
                </span>
                <span style={{ color: "var(--text-secondary)", fontWeight: "500" }}>{formatHours(v.duration)}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ActivityVisitsDrawer;
