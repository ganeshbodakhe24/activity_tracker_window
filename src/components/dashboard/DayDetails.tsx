import React from "react";
import { AppUsage, CategoryUsage, WebsiteUsage, WeeklyStat, formatHours } from "./types";
import CategoryDonutChart from "./CategoryDonutChart";

interface DayDetailsProps {
  activeDay: WeeklyStat;
  appUsage: AppUsage[];
  categoryUsage: CategoryUsage[];
  websiteUsage: WebsiteUsage[];
}

export const DayDetails: React.FC<DayDetailsProps> = ({
  activeDay,
  appUsage,
  categoryUsage,
  websiteUsage,
}) => {
  return (
    <div style={{ marginBottom: "2rem" }}>
      <h3 style={{ fontSize: "1.2rem", fontWeight: "700", marginBottom: "1rem", color: "var(--accent-color)" }}>
        Details for {activeDay.day_name} ({activeDay.date_str})
      </h3>

      <div className="dashboard-grid">
        {/* Top Applications */}
        <div className="dashboard-card">
          <h4 className="card-title">Top Applications</h4>
          <div style={{ maxHeight: "250px", overflowY: "auto" }}>
            {appUsage.length === 0 ? (
              <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>No application activity recorded.</p>
            ) : (
              appUsage.map((app) => (
                <div key={app.application} className="list-item">
                  <span className="list-item-title">{app.application}</span>
                  <span className="list-item-value">{formatHours(app.duration)}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="dashboard-card" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <h4 className="card-title">Category Breakdown</h4>
          <div style={{ padding: "0.5rem 0" }}>
            <CategoryDonutChart categoryUsage={categoryUsage} />
          </div>
        </div>

        {/* Top Visited Websites */}
        <div className="dashboard-card" style={{ gridColumn: "span 2" }}>
          <h4 className="card-title">Top Visited Websites</h4>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            {websiteUsage.length === 0 ? (
              <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", gridColumn: "span 2" }}>
                No website activity recorded.
              </p>
            ) : (
              websiteUsage.map((web) => (
                <div key={web.website} className="list-item" style={{ marginBottom: 0 }}>
                  <span
                    className="list-item-title"
                    style={{ textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}
                  >
                    {web.website}
                  </span>
                  <span className="list-item-value">{formatHours(web.duration)}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DayDetails;
