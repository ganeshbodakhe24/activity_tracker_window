import React from "react";
import { Trash } from "lucide-react";

interface DataPruningCardProps {
  deleteMode: string;
  onDeleteModeChange: (mode: string) => void;
  deleteFrom: string;
  onDeleteFromChange: (from: string) => void;
  deleteTo: string;
  onDeleteToChange: (to: string) => void;
  onOpenDeleteHistoryModal: () => void;
}

export const DataPruningCard: React.FC<DataPruningCardProps> = ({
  deleteMode,
  onDeleteModeChange,
  deleteFrom,
  onDeleteFromChange,
  deleteTo,
  onDeleteToChange,
  onOpenDeleteHistoryModal,
}) => {
  return (
    <div className="dashboard-card" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      <h3 className="card-title" style={{ color: "var(--danger-color)" }}>
        <span style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <Trash size={18} />
          Prune Activity Logs
        </span>
      </h3>

      <div>
        <label style={{ fontSize: "0.8rem", color: "var(--text-secondary)", display: "block", marginBottom: "0.25rem" }}>
          Deletion Target
        </label>
        <select
          value={deleteMode}
          onChange={(e) => onDeleteModeChange(e.target.value)}
          className="input-field"
          style={{ marginBottom: "0.75rem" }}
        >
          <option value="range">Specific Date Range</option>
          <option value="all">Delete All Activity Logs</option>
        </select>

        {deleteMode === "range" && (
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <input
              type="date"
              value={deleteFrom}
              onChange={(e) => onDeleteFromChange(e.target.value)}
              className="input-field"
            />
            <input
              type="date"
              value={deleteTo}
              onChange={(e) => onDeleteToChange(e.target.value)}
              className="input-field"
            />
          </div>
        )}
      </div>

      <button onClick={onOpenDeleteHistoryModal} className="btn btn-danger" style={{ alignSelf: "flex-end" }}>
        Delete Selected logs
      </button>
    </div>
  );
};

export default DataPruningCard;
