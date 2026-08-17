import React from "react";
import { AlertTriangle } from "lucide-react";

interface PruneConfirmModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export const PruneConfirmModal: React.FC<PruneConfirmModalProps> = ({
  isOpen,
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
          Confirm Database Cleanup
        </h4>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", marginBottom: "1.5rem", lineHeight: "1.4" }}>
          WARNING: This will permanently delete ALL detailed activity session logs (activity_visits) from your SQLite
          database. Your aggregated dashboard metrics will not be affected.
        </p>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem" }}>
          <button onClick={onClose} className="btn btn-secondary">
            Cancel
          </button>
          <button onClick={onConfirm} className="btn btn-danger">
            Proceed Wiping Data
          </button>
        </div>
      </div>
    </div>
  );
};

export default PruneConfirmModal;
