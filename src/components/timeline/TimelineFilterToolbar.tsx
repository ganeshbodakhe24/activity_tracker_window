import React from "react";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";

interface TimelineFilterToolbarProps {
  date: string;
  onDateChange: (date: string) => void;
  page: number;
  hasMore: boolean;
  onPageChange: (updater: (prev: number) => number) => void;
}

export const TimelineFilterToolbar: React.FC<TimelineFilterToolbarProps> = ({
  date,
  onDateChange,
  page,
  hasMore,
  onPageChange,
}) => {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
      {/* Date Navigation */}
      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
        <Calendar size={18} className="text-indigo-400" />
        <input
          type="date"
          value={date}
          onChange={(e) => onDateChange(e.target.value)}
          className="input-field"
          style={{ width: "auto" }}
        />
      </div>

      {/* Pagination buttons */}
      <div style={{ display: "flex", gap: "0.5rem" }}>
        <button
          onClick={() => onPageChange((p) => Math.max(p - 1, 1))}
          className="btn btn-secondary"
          disabled={page === 1}
          style={{ padding: "0.4rem 0.8rem" }}
          title="Previous page"
        >
          <ChevronLeft size={16} />
          Prev
        </button>
        <span style={{ display: "flex", alignItems: "center", fontSize: "0.85rem", color: "var(--text-secondary)" }}>
          Page {page}
        </span>
        <button
          onClick={() => onPageChange((p) => p + 1)}
          className="btn btn-secondary"
          disabled={!hasMore}
          style={{ padding: "0.4rem 0.8rem" }}
          title="Next page"
        >
          Next
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};

export default TimelineFilterToolbar;
