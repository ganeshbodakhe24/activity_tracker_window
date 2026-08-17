import React from "react";
import { DailySummary, formatHours } from "./types";

interface SummaryCardsProps {
  stats: DailySummary;
}

export const SummaryCards: React.FC<SummaryCardsProps> = ({ stats }) => {
  return (
    <div className="stats-grid">
      <div className="stat-card">
        <span className="stat-label">Active Time</span>
        <span className="stat-value">{formatHours(stats.total_duration)}</span>
      </div>
      <div className="stat-card">
        <span className="stat-label">Visits Count</span>
        <span className="stat-value">{stats.visit_count}</span>
      </div>
      <div className="stat-card">
        <span className="stat-label">Top Application</span>
        <span
          className="stat-value"
          style={{ textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}
          title={stats.top_app}
        >
          {stats.top_app}
        </span>
      </div>
      <div className="stat-card">
        <span className="stat-label">Top Category</span>
        <span className="stat-value" title={stats.top_category}>
          {stats.top_category}
        </span>
      </div>
    </div>
  );
};

export default SummaryCards;
