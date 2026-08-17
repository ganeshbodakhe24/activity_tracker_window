import React from "react";
import { Download } from "lucide-react";

interface DataExportCardProps {
  exportFormat: string;
  onExportFormatChange: (format: string) => void;
  exportFrom: string;
  onExportFromChange: (from: string) => void;
  exportTo: string;
  onExportToChange: (to: string) => void;
  onExport: () => void;
}

export const DataExportCard: React.FC<DataExportCardProps> = ({
  exportFormat,
  onExportFormatChange,
  exportFrom,
  onExportFromChange,
  exportTo,
  onExportToChange,
  onExport,
}) => {
  return (
    <div className="dashboard-card" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      <h3 className="card-title">
        <span style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <Download size={18} />
          Export Activity Data
        </span>
      </h3>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
        <div>
          <label style={{ fontSize: "0.8rem", color: "var(--text-secondary)", display: "block", marginBottom: "0.25rem" }}>
            Format
          </label>
          <select
            value={exportFormat}
            onChange={(e) => onExportFormatChange(e.target.value)}
            className="input-field"
          >
            <option value="CSV">CSV Spreadsheet</option>
            <option value="JSON">JSON Data</option>
          </select>
        </div>
        <div>
          <label style={{ fontSize: "0.8rem", color: "var(--text-secondary)", display: "block", marginBottom: "0.25rem" }}>
            Date Range
          </label>
          <div style={{ display: "flex", gap: "0.25rem" }}>
            <input
              type="date"
              value={exportFrom}
              onChange={(e) => onExportFromChange(e.target.value)}
              className="input-field"
              style={{ padding: "0.35rem" }}
            />
            <input
              type="date"
              value={exportTo}
              onChange={(e) => onExportToChange(e.target.value)}
              className="input-field"
              style={{ padding: "0.35rem" }}
            />
          </div>
        </div>
      </div>

      <button onClick={onExport} className="btn btn-primary" style={{ alignSelf: "flex-end" }}>
        Export Files
      </button>
    </div>
  );
};

export default DataExportCard;
