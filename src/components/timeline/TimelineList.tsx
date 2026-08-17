import React from "react";
import { Clock } from "lucide-react";
import { TimelineEntry, formatTime, formatDuration } from "./types";

interface TimelineListProps {
  visits: TimelineEntry[];
  loading: boolean;
  onAddCategoryClick: (visit: TimelineEntry) => void;
}

export const TimelineList: React.FC<TimelineListProps> = ({
  visits,
  loading,
  onAddCategoryClick,
}) => {
  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "3rem", color: "var(--text-secondary)" }}>
        Loading activity timeline...
      </div>
    );
  }

  if (visits.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "3rem", color: "var(--text-secondary)" }}>
        No activity recorded for this day.
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem", paddingLeft: "10px" }}>
      {visits.map((visit) => (
        <div key={visit.id} className="timeline-item">
          <div className="timeline-time">{formatTime(visit.start_time)}</div>
          <div className="timeline-dot"></div>
          <div className="timeline-content">
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.25rem" }}>
              <span style={{ fontWeight: "600", fontSize: "0.95rem" }}>{visit.application}</span>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <span className={`badge badge-${visit.category.toLowerCase()}`} style={{ height: "fit-content" }}>
                  {visit.category}
                </span>
                {visit.category.toLowerCase() === "other" && (
                  <button
                    onClick={() => onAddCategoryClick(visit)}
                    title="Add Custom Category Rule"
                    style={{
                      width: "20px",
                      height: "20px",
                      borderRadius: "50%",
                      background: "var(--accent-color)",
                      color: "white",
                      border: "none",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                      fontWeight: "bold",
                      fontSize: "0.9rem",
                    }}
                  >
                    +
                  </button>
                )}
              </div>
            </div>

            {visit.website && (
              <div style={{ fontSize: "0.85rem", color: "var(--accent-color)", fontWeight: "500", marginBottom: "0.25rem" }}>
                {visit.website}
              </div>
            )}

            <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "0.5rem" }}>
              {visit.title}
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "0.25rem", fontSize: "0.75rem", color: "var(--text-muted)" }}>
              <Clock size={12} />
              <span>Duration: {formatDuration(visit.duration)}</span>
              <span>•</span>
              <span>
                {formatTime(visit.start_time)} → {formatTime(visit.end_time)}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default TimelineList;
