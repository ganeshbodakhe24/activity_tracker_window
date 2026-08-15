import { useState, useEffect } from "react";
import { Search, Plus, Edit2, Trash2, Download, Trash, AlertTriangle } from "lucide-react";

const invoke = (window as any).__TAURI__?.core?.invoke || (() => Promise.resolve());

const REFERENCE_TABLES = [
  { value: "browsers", label: "Browsers List" },
  { value: "coding_apps", label: "Coding Applications" },
  { value: "study_apps", label: "Study Applications" },
  { value: "entertainment_apps", label: "Entertainment Applications" },
  { value: "ignored_apps", label: "Ignored Applications" },
  { value: "study_websites", label: "Study Websites" },
  { value: "social_websites", label: "Social Websites" },
  { value: "entertainment_websites", label: "Entertainment Websites" },
  { value: "youtube_study_keywords", label: "YouTube Study Keywords" },
  { value: "youtube_entertainment_keywords", label: "YouTube Entertainment Keywords" },
  { value: "terminal_keywords", label: "Terminal Keywords" }
];

interface Record {
  id: number;
  value: string;
}

export default function DataManagement() {
  const [selectedTable, setSelectedTable] = useState("browsers");
  const [records, setRecords] = useState<Record[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  // CRUD Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState<Record | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState<Record | null>(null);
  const [inputValue, setInputValue] = useState("");

  // Data Export & Deletion
  const [exportFormat, setExportFormat] = useState("CSV");
  const [exportFrom, setExportFrom] = useState(new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString().split("T")[0]);
  const [exportTo, setExportTo] = useState(new Date().toISOString().split("T")[0]);

  const [deleteMode, setDeleteMode] = useState("range");
  const [deleteFrom, setDeleteFrom] = useState("");
  const [deleteTo, setDeleteTo] = useState("");
  const [showConfirmDeleteHistory, setShowConfirmDeleteHistory] = useState(false);

  useEffect(() => {
    loadTableData();
  }, [selectedTable, search]);

  const loadTableData = async () => {
    setLoading(true);
    try {
      const res = await invoke("get_table_data", { table: selectedTable, search });
      setRecords(res || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleAddRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    try {
      await invoke("insert_table_record", { table: selectedTable, value: inputValue.trim() });
      setInputValue("");
      setShowAddModal(false);
      loadTableData();
    } catch (e) {
      alert("Failed to insert record. Ensure the value is unique.");
    }
  };

  const handleEditRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showEditModal || !inputValue.trim()) return;
    try {
      await invoke("update_table_record", { table: selectedTable, id: showEditModal.id, value: inputValue.trim() });
      setInputValue("");
      setShowEditModal(null);
      loadTableData();
    } catch (e) {
      alert("Failed to update record.");
    }
  };

  const handleDeleteRecord = async () => {
    if (!showDeleteModal) return;
    try {
      await invoke("delete_table_record", { table: selectedTable, id: showDeleteModal.id });
      setShowDeleteModal(null);
      loadTableData();
    } catch (e) {
      alert("Failed to delete record.");
    }
  };

  const handleExport = async () => {
    try {
      const path = await invoke("export_data", { format: exportFormat, from: exportFrom, to: exportTo });
      alert(`Data exported successfully to: ${path}`);
    } catch (e) {
      alert("Export failed.");
    }
  };

  const handleDeleteHistory = async () => {
    try {
      await invoke("delete_activity_data", { mode: deleteMode, from: deleteFrom, to: deleteTo });
      setShowConfirmDeleteHistory(false);
      alert("Activity logs deleted successfully.");
    } catch (e) {
      alert("Deletion failed.");
    }
  };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem" }}>
      {/* Left side: Configuration Tables Editor */}
      <div className="dashboard-card" style={{ display: "flex", flexDirection: "column", height: "fit-content", gap: "1rem" }}>
        <h3 className="card-title">Reference / Classification Lists</h3>

        {/* Table Selector Dropdown */}
        <select
          value={selectedTable}
          onChange={(e) => {
            setSelectedTable(e.target.value);
            setSearch("");
          }}
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
            <Search size={14} style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
            <input
              type="text"
              placeholder="Search keyword..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field"
              style={{ paddingLeft: "2rem" }}
            />
          </div>
          <button
            onClick={() => {
              setInputValue("");
              setShowAddModal(true);
            }}
            className="btn btn-primary"
          >
            <Plus size={16} />
            Add
          </button>
        </div>

        {/* Records List Table */}
        <div style={{ maxHeight: "300px", overflowY: "auto", border: "1px solid var(--border-color)", borderRadius: "0.375rem" }}>
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
                        onClick={() => {
                          setInputValue(r.value);
                          setShowEditModal(r);
                        }}
                        className="btn btn-secondary"
                        style={{ padding: "0.25rem 0.4rem", marginRight: "0.25rem" }}
                      >
                        <Edit2 size={12} />
                      </button>
                      <button
                        onClick={() => setShowDeleteModal(r)}
                        className="btn btn-danger"
                        style={{ padding: "0.25rem 0.4rem" }}
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

      {/* Right side: Exports & Data Pruning */}
      <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
        {/* Export Card */}
        <div className="dashboard-card" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <h3 className="card-title">
            <span style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <Download size={18} />
              Export Activity Data
            </span>
          </h3>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div>
              <label style={{ fontSize: "0.8rem", color: "var(--text-secondary)", display: "block", marginBottom: "0.25rem" }}>Format</label>
              <select
                value={exportFormat}
                onChange={(e) => setExportFormat(e.target.value)}
                className="input-field"
              >
                <option value="CSV">CSV Spreadsheet</option>
                <option value="JSON">JSON Data</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: "0.8rem", color: "var(--text-secondary)", display: "block", marginBottom: "0.25rem" }}>Date Range</label>
              <div style={{ display: "flex", gap: "0.25rem" }}>
                <input type="date" value={exportFrom} onChange={(e) => setExportFrom(e.target.value)} className="input-field" style={{ padding: "0.35rem" }} />
                <input type="date" value={exportTo} onChange={(e) => setExportTo(e.target.value)} className="input-field" style={{ padding: "0.35rem" }} />
              </div>
            </div>
          </div>

          <button onClick={handleExport} className="btn btn-primary" style={{ alignSelf: "flex-end" }}>
            Export Files
          </button>
        </div>

        {/* Pruning/Delete History Card */}
        <div className="dashboard-card" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <h3 className="card-title" style={{ color: "var(--danger-color)" }}>
            <span style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <Trash size={18} />
              Prune Activity Logs
            </span>
          </h3>

          <div>
            <label style={{ fontSize: "0.8rem", color: "var(--text-secondary)", display: "block", marginBottom: "0.25rem" }}>Deletion Target</label>
            <select
              value={deleteMode}
              onChange={(e) => setDeleteMode(e.target.value)}
              className="input-field"
              style={{ marginBottom: "0.75rem" }}
            >
              <option value="range">Specific Date Range</option>
              <option value="all">Delete All Activity Logs</option>
            </select>

            {deleteMode === "range" && (
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <input type="date" value={deleteFrom} onChange={(e) => setDeleteFrom(e.target.value)} className="input-field" />
                <input type="date" value={deleteTo} onChange={(e) => setDeleteTo(e.target.value)} className="input-field" />
              </div>
            )}
          </div>

          <button onClick={() => setShowConfirmDeleteHistory(true)} className="btn btn-danger" style={{ alignSelf: "flex-end" }}>
            Delete Selected logs
          </button>
        </div>
      </div>

      {/* CRUD MODALS */}
      {/* Add Modal */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h4 style={{ fontWeight: "700", marginBottom: "1rem" }}>Add record in {selectedTable}</h4>
            <form onSubmit={handleAddRecord} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <input
                type="text"
                placeholder="Enter value..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="input-field"
                autoFocus
              />
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem" }}>
                <button type="button" onClick={() => setShowAddModal(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h4 style={{ fontWeight: "700", marginBottom: "1rem" }}>Edit record</h4>
            <form onSubmit={handleEditRecord} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="input-field"
                autoFocus
              />
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem" }}>
                <button type="button" onClick={() => setShowEditModal(null)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h4 style={{ fontWeight: "700", marginBottom: "1rem" }}>Delete keyword?</h4>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", marginBottom: "1.5rem" }}>
              Are you sure you want to delete "{showDeleteModal.value}"? This may affect future classification of your activities.
            </p>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem" }}>
              <button onClick={() => setShowDeleteModal(null)} className="btn btn-secondary">
                Cancel
              </button>
              <button onClick={handleDeleteRecord} className="btn btn-danger">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Delete Activity logs Modal */}
      {showConfirmDeleteHistory && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ borderColor: "var(--danger-color)" }}>
            <h4 style={{ fontWeight: "700", marginBottom: "1.5rem", color: "var(--danger-color)", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <AlertTriangle size={24} />
              Confirm Log Destruction
            </h4>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", marginBottom: "1.5rem", lineHeight: "1.4" }}>
              {deleteMode === "all"
                ? "WARNING: You are about to delete ALL recorded activities and sessions from the SQLite database. This action is permanent and cannot be undone."
                : `Are you sure you want to delete all activity data recorded between ${deleteFrom} and ${deleteTo}?`}
            </p>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem" }}>
              <button onClick={() => setShowConfirmDeleteHistory(false)} className="btn btn-secondary">
                Cancel
              </button>
              <button onClick={handleDeleteHistory} className="btn btn-danger">
                Destroy Data Permanently
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
