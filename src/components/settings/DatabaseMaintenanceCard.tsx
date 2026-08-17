import React from "react";
import { Database } from "lucide-react";

interface DatabaseMaintenanceCardProps {
  cleaning: boolean;
  prunedCount: number | null;
  onTriggerPruning: () => void;
}

export const DatabaseMaintenanceCard: React.FC<DatabaseMaintenanceCardProps> = ({
  cleaning,
  prunedCount,
  onTriggerPruning,
}) => {
  return (
    <div className="dashboard-card" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      <h3 className="card-title">
        <span style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <Database size={18} />
          Database Maintenance
        </span>
      </h3>

      <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", lineHeight: "1.4" }}>
        To keep the tracker running efficiently on normal laptops, detailed raw log history (
        <code style={{ fontSize: "0.8rem", color: "var(--accent-color)" }}>activity_visits</code>) is automatically
        purged every Sunday morning, keeping only aggregate calculations inside the{" "}
        <code style={{ fontSize: "0.8rem", color: "var(--accent-color)" }}>activities</code> table.
      </p>

      <div style={{ marginTop: "0.5rem" }}>
        <button
          onClick={onTriggerPruning}
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
  );
};

export default DatabaseMaintenanceCard;
