import React from "react";
import { TodayVisit, CATEGORY_COLORS } from "./types";

interface TodayTimelineStripProps {
  todayVisits: TodayVisit[];
}

export const TodayTimelineStrip: React.FC<TodayTimelineStripProps> = ({ todayVisits }) => {
  const timeLabels = ["12 AM", "3 AM", "6 AM", "9 AM", "12 PM", "3 PM", "6 PM", "9 PM", "12 AM"];

  const formatClock = (d: Date) => {
    return d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="graph-container">
      <div className="graph-header">
        <h3 className="graph-title">Today's 24-Hour Activity Timeline</h3>
        <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
          Hover over colored segments to see specific visits and category tags
        </span>
      </div>

      {/* The continuous horizontal bar */}
      <div
        style={{
          position: "relative",
          height: "36px",
          backgroundColor: "var(--bg-tertiary)",
          borderRadius: "6px",
          border: "1px solid var(--border-color)",
          overflow: "hidden",
          marginBottom: "0.75rem",
        }}
      >
        {todayVisits.map((v, i) => {
          try {
            const startD = new Date(v.start_time);
            const endD = new Date(v.end_time);

            const startSecs = startD.getHours() * 3600 + startD.getMinutes() * 60 + startD.getSeconds();
            const durSecs = v.duration;

            const leftPct = (startSecs / 86400) * 100;
            const widthPct = (durSecs / 86400) * 100;

            const catKey = v.category.toLowerCase();
            const color = CATEGORY_COLORS[catKey] || CATEGORY_COLORS["other"];

            return (
              <div
                key={i}
                style={{
                  position: "absolute",
                  left: `${leftPct}%`,
                  width: `${Math.max(widthPct, 0.15)}%`,
                  height: "100%",
                  backgroundColor: color,
                  cursor: "help",
                }}
                title={`${v.category}: ${formatClock(startD)} - ${formatClock(endD)} (${Math.ceil(durSecs / 60)}m)`}
              />
            );
          } catch (e) {
            return null;
          }
        })}
      </div>

      {/* Labels under the bar */}
      <div style={{ display: "flex", justifyContent: "space-between", padding: "0 5px" }}>
        {timeLabels.map((lbl, idx) => (
          <span key={idx} style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: "600" }}>
            {lbl}
          </span>
        ))}
      </div>
    </div>
  );
};

export default TodayTimelineStrip;
