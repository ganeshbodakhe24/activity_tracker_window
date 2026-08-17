import React from "react";
import { Search, Plus, Edit2, Trash2 } from "lucide-react";
import { Record, REFERENCE_TABLES } from "./types";

interface ReferenceTableManagerProps {
  selectedTable: string;
  onTableChange: (table: string) => void;
  records: Record[];
  search: string;
  onSearchChange: (search: string) => void;
  loading: boolean;
  onOpenAddModal: () => void;
  onOpenEditModal: (record: Record) => void;
  onOpenDeleteModal: (record: Record) => void;
}

export const ReferenceTableManager: React.FC<ReferenceTableManagerProps> = ({
  selectedTable,
  onTableChange,
  records,
  search,
  onSearchChange,
  loading,
  onOpenAddModal,
  onOpenEditModal,
  onOpenDeleteModal,
}) => {
  return (
    <div className="dashboard-card" style={{ display: "flex", flexDirection: "column", height: "fit-content", gap: "1rem" }}>
      <h3 className="card-title">Reference / Classification Lists</h3>

      {/* Table Selector Dropdown */}
      <select
        value={selectedTable}
        onChange={(e) => onTableChange(e.target.value)}
        className="input-field"
      >
        {REFERENCE_TABLES.map((t) => (
          <option key={t.value} value={t.value}>
            {t.label}
          </option>
        ))}
      </select>

      {/* Toolbar: Search & Add */}
      <div style={{ display: "flex", gap: "0.5rem" }}>
        <div style={{ position: "relative", flexGrow: 1 }}>
          <Search
            size={14}
            style={{
              position: "absolute",
              left: "10px",
              top: "50%",
              transform: "translateY(-50%)",
              color: "var(--text-muted)",
            }}
          />
          <input
            type="text"
            placeholder="Search keyword..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="input-field"
            style={{ paddingLeft: "2rem" }}
          />
        </div>
        <button onClick={onOpenAddModal} className="btn btn-primary">
          <Plus size={16} />
          Add
        </button>
      </div>

      {/* Records List Table */}
      <div
        style={{
          maxHeight: "300px",
          overflowY: "auto",
          border: "1px solid var(--border-color)",
          borderRadius: "0.375rem",
        }}
      >
        {loading ? (
          <p style={{ textAlign: "center", padding: "1.5rem", color: "var(--text-secondary)" }}>Loading records...</p>
        ) : records.length === 0 ? (
          <p style={{ textAlign: "center", padding: "1.5rem", color: "var(--text-secondary)" }}>No keywords found.</p>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.85rem" }}>
            <tbody>
              {records.map((r) => (
                <tr key={r.id} style={{ borderBottom: "1px solid var(--border-color)" }}>
                  <td style={{ padding: "0.6rem 1rem", fontWeight: "500" }}>{r.value}</td>
                  <td style={{ padding: "0.6rem 1rem", textAlign: "right" }}>
                    <button
                      onClick={() => onOpenEditModal(r)}
                      className="btn btn-secondary"
                      style={{ padding: "0.25rem 0.4rem", marginRight: "0.25rem" }}
                      title="Edit keyword"
                    >
                      <Edit2 size={12} />
                    </button>
                    <button
                      onClick={() => onOpenDeleteModal(r)}
                      className="btn btn-danger"
                      style={{ padding: "0.25rem 0.4rem" }}
                      title="Delete keyword"
                    >
                      <Trash2 size={12} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default ReferenceTableManager;
