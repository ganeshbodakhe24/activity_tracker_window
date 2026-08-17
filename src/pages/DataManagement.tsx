import { useState, useEffect } from "react";
import {
  Record,
  ReferenceTableManager,
  DataExportCard,
  DataPruningCard,
  RecordModal,
  DeleteRecordModal,
  DeleteHistoryModal,
} from "../components/data-management";
import { getLocalDateString, shiftDateString } from "../utils/dateUtils";

const invoke = (window as any).__TAURI__?.core?.invoke || (() => Promise.resolve());

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
  const [exportFrom, setExportFrom] = useState(() => shiftDateString(getLocalDateString(), -30));
  const [exportTo, setExportTo] = useState(() => getLocalDateString());

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
      await invoke("update_table_record", {
        table: selectedTable,
        id: showEditModal.id,
        value: inputValue.trim(),
      });
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
      const path = await invoke("export_data", {
        format: exportFormat,
        from: exportFrom,
        to: exportTo,
      });
      alert(`Data exported successfully to: ${path}`);
    } catch (e) {
      alert("Export failed.");
    }
  };

  const handleDeleteHistory = async () => {
    try {
      await invoke("delete_activity_data", {
        mode: deleteMode,
        from: deleteFrom,
        to: deleteTo,
      });
      setShowConfirmDeleteHistory(false);
      alert("Activity logs deleted successfully.");
    } catch (e) {
      alert("Deletion failed.");
    }
  };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem" }}>
      {/* Left side: Configuration Tables Editor */}
      <ReferenceTableManager
        selectedTable={selectedTable}
        onTableChange={(table) => {
          setSelectedTable(table);
          setSearch("");
        }}
        records={records}
        search={search}
        onSearchChange={setSearch}
        loading={loading}
        onOpenAddModal={() => {
          setInputValue("");
          setShowAddModal(true);
        }}
        onOpenEditModal={(r) => {
          setInputValue(r.value);
          setShowEditModal(r);
        }}
        onOpenDeleteModal={(r) => setShowDeleteModal(r)}
      />

      {/* Right side: Exports & Data Pruning */}
      <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
        {/* Export Card */}
        <DataExportCard
          exportFormat={exportFormat}
          onExportFormatChange={setExportFormat}
          exportFrom={exportFrom}
          onExportFromChange={setExportFrom}
          exportTo={exportTo}
          onExportToChange={setExportTo}
          onExport={handleExport}
        />

        {/* Pruning/Delete History Card */}
        <DataPruningCard
          deleteMode={deleteMode}
          onDeleteModeChange={setDeleteMode}
          deleteFrom={deleteFrom}
          onDeleteFromChange={setDeleteFrom}
          deleteTo={deleteTo}
          onDeleteToChange={setDeleteTo}
          onOpenDeleteHistoryModal={() => setShowConfirmDeleteHistory(true)}
        />
      </div>

      {/* Add Keyword Modal */}
      <RecordModal
        isOpen={showAddModal}
        isEdit={false}
        selectedTable={selectedTable}
        editRecord={null}
        inputValue={inputValue}
        onInputChange={setInputValue}
        onSubmit={handleAddRecord}
        onClose={() => setShowAddModal(false)}
      />

      {/* Edit Keyword Modal */}
      <RecordModal
        isOpen={!!showEditModal}
        isEdit={true}
        selectedTable={selectedTable}
        editRecord={showEditModal}
        inputValue={inputValue}
        onInputChange={setInputValue}
        onSubmit={handleEditRecord}
        onClose={() => setShowEditModal(null)}
      />

      {/* Delete Keyword Modal */}
      <DeleteRecordModal
        record={showDeleteModal}
        onConfirm={handleDeleteRecord}
        onClose={() => setShowDeleteModal(null)}
      />

      {/* Confirm Delete Activity logs Modal */}
      <DeleteHistoryModal
        isOpen={showConfirmDeleteHistory}
        deleteMode={deleteMode}
        deleteFrom={deleteFrom}
        deleteTo={deleteTo}
        onConfirm={handleDeleteHistory}
        onClose={() => setShowConfirmDeleteHistory(false)}
      />
    </div>
  );
}
