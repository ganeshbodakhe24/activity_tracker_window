import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface DashboardHeaderProps {
  selectedRange: string;
  onSelectRange: (range: string) => void;
  selectedDayOffset: number;
  onOffsetChange: (updater: (prev: number) => number) => void;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  selectedRange,
  onSelectRange,
  selectedDayOffset,
  onOffsetChange,
}) => {
  const ranges = ["Today", "This Week", "Last 7 Days", "This Month"];

  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
      {/* Range Selection Buttons */}
      <div style={{ display: "flex", gap: "0.5rem" }}>
        {ranges.map((range) => (
          <button
            key={range}
            onClick={() => onSelectRange(range)}
            className={`btn ${selectedRange === range ? "btn-primary" : "btn-secondary"}`}
            style={{ fontSize: "0.85rem", padding: "0.4rem 0.8rem" }}
          >
            {range}
          </button>
        ))}
      </div>

      {/* Offset Navigation Buttons */}
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
        <button
          onClick={() => onOffsetChange((prev) => prev - 1)}
          className="btn btn-secondary"
          style={{ padding: "0.4rem" }}
          title="Previous period"
        >
          <ChevronLeft size={16} />
        </button>
        <span style={{ fontSize: "0.9rem", fontWeight: "600", minWidth: "90px", textAlign: "center" }}>
          {selectedRange === "Today"
            ? selectedDayOffset === 0
              ? "Today"
              : selectedDayOffset === -1
              ? "Yesterday"
              : `${Math.abs(selectedDayOffset)}d ago`
            : selectedDayOffset === 0
            ? "Current"
            : `${Math.abs(selectedDayOffset)} ${selectedDayOffset < 0 ? "prev" : "next"}`}
        </span>
        <button
          onClick={() => onOffsetChange((prev) => prev + 1)}
          className="btn btn-secondary"
          style={{ padding: "0.4rem" }}
          disabled={selectedDayOffset >= 0}
          title="Next period"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};

export default DashboardHeader;
