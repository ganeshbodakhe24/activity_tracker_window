import React from "react";
import { AlertTriangle } from "lucide-react";

interface DeleteHistoryModalProps {
  isOpen: boolean;
  deleteMode: string;
  deleteFrom: string;
  deleteTo: string;
  onConfirm: () => void;
  onClose: () => void;
}

export const DeleteHistoryModal: React.FC<DeleteHistoryModalProps> = ({
  isOpen,
  deleteMode,
  deleteFrom,
  deleteTo,
  onConfirm,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ borderColor: "var(--danger-color)" }}>
        <h4
          style={{
            fontWeight: "700",
            marginBottom: "1.5rem",
            color: "var(--danger-color)",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
          }}
        >
          <AlertTriangle size={24} />
          Confirm Log Destruction
        </h4>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", marginBottom: "1.5rem", lineHeight: "1.4" }}>
          {deleteMode === "all"
            ? "WARNING: You are about to delete ALL recorded activities and sessions from the SQLite database. This action is permanent and cannot be undone."
            : `Are you sure you want to delete all activity data recorded between ${deleteFrom} and ${deleteTo}?`}
        </p>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem" }}>
          <button onClick={onClose} className="btn btn-secondary">
            Cancel
          </button>
          <button onClick={onConfirm} className="btn btn-danger">
            Destroy Data Permanently
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteHistoryModal;
