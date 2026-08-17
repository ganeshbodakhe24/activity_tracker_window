import React from "react";
import { Record } from "./types";

interface RecordModalProps {
  isOpen: boolean;
  isEdit: boolean;
  selectedTable: string;
  editRecord: Record | null;
  inputValue: string;
  onInputChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
}

export const RecordModal: React.FC<RecordModalProps> = ({
  isOpen,
  isEdit,
  selectedTable,
  inputValue,
  onInputChange,
  onSubmit,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h4 style={{ fontWeight: "700", marginBottom: "1rem" }}>
          {isEdit ? "Edit record" : `Add record in ${selectedTable}`}
        </h4>
        <form onSubmit={onSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <input
            type="text"
            placeholder="Enter value..."
            value={inputValue}
            onChange={(e) => onInputChange(e.target.value)}
            className="input-field"
            autoFocus
          />
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem" }}>
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {isEdit ? "Save Changes" : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RecordModal;
