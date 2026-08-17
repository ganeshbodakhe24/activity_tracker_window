import React from "react";
import { TimelineEntry, TABLE_CATEGORIES } from "./types";

interface CategorizeRuleModalProps {
  visit: TimelineEntry;
  selectedTargetTable: string;
  targetValue: string;
  ruleCategory: string;
  onTableChange: (table: string) => void;
  onTargetValueChange: (value: string) => void;
  onSave: () => void;
  onClose: () => void;
}

export const CategorizeRuleModal: React.FC<CategorizeRuleModalProps> = ({
  visit,
  selectedTargetTable,
  targetValue,
  ruleCategory,
  onTableChange,
  onTargetValueChange,
  onSave,
  onClose,
}) => {
  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: "450px" }}>
        <h4 style={{ fontWeight: "700", marginBottom: "1rem", color: "var(--accent-color)" }}>
          Categorize Activity Rule
        </h4>

        {/* Selected Visit Details Preview */}
        <div
          style={{
            padding: "0.75rem",
            backgroundColor: "var(--bg-tertiary)",
            borderRadius: "4px",
            marginBottom: "1rem",
            fontSize: "0.85rem",
          }}
        >
          <div style={{ marginBottom: "0.25rem" }}>
            <strong>App:</strong> {visit.application}
          </div>
          {visit.website && (
            <div style={{ marginBottom: "0.25rem" }}>
              <strong>Website:</strong> {visit.website}
            </div>
          )}
          <div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            <strong>Title:</strong> {visit.title}
          </div>
        </div>

        {/* Form Controls */}
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginBottom: "1.5rem" }}>
          <div>
            <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.25rem" }}>
              Rule Table Target
            </label>
            <select
              value={selectedTargetTable}
              onChange={(e) => onTableChange(e.target.value)}
              className="input-field"
              style={{ width: "100%" }}
            >
              <option value="coding_apps">Coding Applications</option>
              <option value="study_apps">Study Applications</option>
              <option value="entertainment_apps">Entertainment Applications</option>
              <option value="study_websites">Study Websites</option>
              <option value="social_websites">Social Websites</option>
              <option value="entertainment_websites">Entertainment Websites</option>
              <option value="youtube_study_keywords">YouTube Study Keywords</option>
              <option value="youtube_entertainment_keywords">YouTube Entertainment Keywords</option>
              <option value="terminal_keywords">Terminal Keywords</option>
            </select>
          </div>

          <div>
            <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.25rem" }}>
              Keyword/Value Match Rule
            </label>
            <input
              type="text"
              value={targetValue}
              onChange={(e) => onTargetValueChange(e.target.value)}
              className="input-field"
              style={{ width: "100%" }}
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.25rem" }}>
              Category assigned
            </label>
            <input
              type="text"
              value={ruleCategory}
              disabled
              className="input-field"
              style={{ width: "100%", opacity: 0.7, cursor: "not-allowed" }}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem" }}>
          <button onClick={onClose} className="btn btn-secondary">
            Cancel
          </button>
          <button onClick={onSave} className="btn btn-primary">
            Add Rule & Recategorize Week
          </button>
        </div>
      </div>
    </div>
  );
};

export default CategorizeRuleModal;
