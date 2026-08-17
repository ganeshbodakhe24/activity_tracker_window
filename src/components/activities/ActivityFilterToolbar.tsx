import React from "react";
import { Search, Filter, Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { isToday, shiftDateString, getLocalDateString } from "../../utils/dateUtils";

interface ActivityFilterToolbarProps {
  search: string;
  onSearchChange: (value: string) => void;
  categoryFilter: string;
  onCategoryChange: (category: string) => void;
  date: string;
  onDateChange: (date: string) => void;
  page: number;
  hasMore: boolean;
  onPageChange: (updater: (prev: number) => number) => void;
}

export const ActivityFilterToolbar: React.FC<ActivityFilterToolbarProps> = ({
  search,
  onSearchChange,
  categoryFilter,
  onCategoryChange,
  date,
  onDateChange,
  page,
  hasMore,
  onPageChange,
}) => {
  const isCurrentDay = isToday(date);
  const todayStr = getLocalDateString();

  return (
    <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "0.75rem", marginBottom: "1.5rem" }}>
      {/* Search Field */}
      <div style={{ position: "relative", flex: "1 1 200px", minWidth: "180px" }}>
        <Search
          size={16}
          style={{
            position: "absolute",
            left: "10px",
            top: "50%",
            transform: "translateY(-50%)",
            color: "var(--text-muted)",
          }}
        />
        <input
          type="text"
          placeholder="Search activity, website, app..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="input-field"
          style={{ paddingLeft: "2.25rem", width: "100%" }}
        />
      </div>

      {/* Category Dropdown */}
      <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
        <Filter size={16} className="text-slate-400" />
        <select
          value={categoryFilter}
          onChange={(e) => onCategoryChange(e.target.value)}
          className="input-field"
          style={{ width: "auto" }}
        >
          <option value="All">All Categories</option>
          <option value="Coding">Coding</option>
          <option value="Study">Study</option>
          <option value="Social">Social</option>
          <option value="Entertainment">Entertainment</option>
          <option value="Other">Other</option>
        </select>
      </div>

      {/* Date Navigation */}
      <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
        <button
          onClick={() => onDateChange(shiftDateString(date, -1))}
          className="btn btn-secondary"
          style={{ padding: "0.4rem 0.5rem" }}
          title="Previous day"
        >
          <ChevronLeft size={16} />
        </button>

        <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
          <Calendar size={16} className="text-slate-400" />
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

      {/* Pagination Controls */}
      <div style={{ display: "flex", gap: "0.25rem", marginLeft: "auto" }}>
        <button
          onClick={() => onPageChange((p) => Math.max(p - 1, 1))}
          className="btn btn-secondary"
          disabled={page === 1}
          style={{ padding: "0.4rem 0.6rem" }}
          title="Previous Page"
        >
          <ChevronLeft size={14} />
        </button>
        <span
          style={{
            display: "flex",
            alignItems: "center",
            fontSize: "0.8rem",
            color: "var(--text-secondary)",
            minWidth: "50px",
            justifyContent: "center",
          }}
        >
          Page {page}
        </span>
        <button
          onClick={() => onPageChange((p) => p + 1)}
          className="btn btn-secondary"
          disabled={!hasMore}
          style={{ padding: "0.4rem 0.6rem" }}
          title="Next Page"
        >
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
};

export default ActivityFilterToolbar;
