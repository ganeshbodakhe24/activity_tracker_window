import React from "react";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { isToday, shiftDateString, getLocalDateString } from "../../utils/dateUtils";

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
  const isCurrentDay = isToday(date);
  const todayStr = getLocalDateString();

  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", flexWrap: "wrap", gap: "0.75rem" }}>
      {/* Date Navigation */}
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
        <button
          onClick={() => onDateChange(shiftDateString(date, -1))}
          className="btn btn-secondary"
          style={{ padding: "0.4rem 0.5rem" }}
          title="Previous day"
        >
          <ChevronLeft size={16} />
        </button>

        <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", position: "relative" }}>
          <Calendar size={18} className="text-indigo-400" />
          <input
            type="date"
            max={todayStr}
            value={date}
            onChange={(e) => onDateChange(e.target.value)}
            className="input-field"
            style={{ width: "auto", padding: "0.4rem 0.6rem" }}
          />
        </div>

        <button
          onClick={() => onDateChange(shiftDateString(date, 1))}
          className="btn btn-secondary"
          style={{ padding: "0.4rem 0.5rem" }}
          disabled={date >= todayStr}
          title="Next day"
        >
          <ChevronRight size={16} />
        </button>

        <button
          onClick={() => onDateChange(todayStr)}
          className={`btn ${isCurrentDay ? "btn-primary" : "btn-secondary"}`}
          style={{ padding: "0.4rem 0.75rem", fontSize: "0.85rem", fontWeight: isCurrentDay ? "600" : "400" }}
          title="Focus Today"
        >
          Today
        </button>
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
