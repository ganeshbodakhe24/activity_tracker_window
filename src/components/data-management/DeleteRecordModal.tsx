import React from "react";
import { Record } from "./types";

interface DeleteRecordModalProps {
  record: Record | null;
  onConfirm: () => void;
  onClose: () => void;
}

export const DeleteRecordModal: React.FC<DeleteRecordModalProps> = ({
  record,
  onConfirm,
  onClose,
}) => {
  if (!record) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h4 style={{ fontWeight: "700", marginBottom: "1rem" }}>Delete keyword?</h4>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", marginBottom: "1.5rem" }}>
          Are you sure you want to delete "{record.value}"? This may affect future classification of your activities.
        </p>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem" }}>
          <button onClick={onClose} className="btn btn-secondary">
            Cancel
          </button>
          <button onClick={onConfirm} className="btn btn-danger">
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteRecordModal;
