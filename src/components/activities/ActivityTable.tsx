import React from "react";
import { Activity, formatHours } from "./types";

interface ActivityTableProps {
  activities: Activity[];
  loading: boolean;
  onRowClick: (activity: Activity) => void;
}

export const ActivityTable: React.FC<ActivityTableProps> = ({
  activities,
  loading,
  onRowClick,
}) => {
  return (
    <div style={{ flexGrow: 1, overflowY: "auto" }}>
      {loading ? (
        <div style={{ textAlign: "center", padding: "3rem", color: "var(--text-secondary)" }}>
          Loading activities data...
        </div>
      ) : activities.length === 0 ? (
        <div style={{ textAlign: "center", padding: "3rem", color: "var(--text-secondary)" }}>
          No activity recorded.
        </div>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.9rem" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid var(--border-color)", color: "var(--text-secondary)" }}>
              <th style={{ padding: "0.75rem 1rem", fontWeight: "600" }}>Application</th>
              <th style={{ padding: "0.75rem 1rem", fontWeight: "600" }}>Website</th>
              <th style={{ padding: "0.75rem 1rem", fontWeight: "600" }}>Window/Page Title</th>
              <th style={{ padding: "0.75rem 1rem", fontWeight: "600" }}>Category</th>
              <th style={{ padding: "0.75rem 1rem", fontWeight: "600" }}>Total Duration</th>
              <th style={{ padding: "0.75rem 1rem", fontWeight: "600" }}>Visits</th>
            </tr>
          </thead>
          <tbody>
            {activities.map((act) => (
              <tr
                key={act.id}
                onClick={() => onRowClick(act)}
                style={{
                  borderBottom: "1px solid var(--border-color)",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
                className="list-item-row"
              >
                <td style={{ padding: "0.85rem 1rem", fontWeight: "500" }}>{act.application}</td>
                <td style={{ padding: "0.85rem 1rem", color: "var(--accent-color)" }}>{act.website || "—"}</td>
                <td
                  style={{
                    padding: "0.85rem 1rem",
                    maxWidth: "250px",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                  title={act.title}
                >
                  {act.title}
                </td>
                <td style={{ padding: "0.85rem 1rem" }}>
                  <span className={`badge badge-${act.category.toLowerCase()}`}>{act.category}</span>
                </td>
                <td style={{ padding: "0.85rem 1rem", fontWeight: "600" }}>{formatHours(act.total_duration)}</td>
                <td style={{ padding: "0.85rem 1rem", color: "var(--text-secondary)" }}>{act.visit_count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default ActivityTable;
