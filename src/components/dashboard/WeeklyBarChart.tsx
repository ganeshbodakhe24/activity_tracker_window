import React from "react";
import { WeeklyStat, CATEGORY_COLORS, formatHours } from "./types";

interface WeeklyBarChartProps {
  weeklyData: WeeklyStat[];
  selectedDayIndex: number;
  onSelectDay: (index: number) => void;
}

export const WeeklyBarChart: React.FC<WeeklyBarChartProps> = ({
  weeklyData,
  selectedDayIndex,
  onSelectDay,
}) => {
  const maxVal = Math.max(...weeklyData.map((d) => d.duration), 1);

  return (
    <div className="graph-container">
      <div className="graph-header">
        <h3 className="graph-title">Weekly Activity History</h3>
        <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
          Click on a day bar to view detailed logs below
        </span>
      </div>

      {/* Custom Bar Graph */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          height: "180px",
          paddingTop: "20px",
          borderBottom: "1px solid var(--border-color)",
          gap: "1rem",
        }}
      >
        {weeklyData.map((day, idx) => {
          const heightPct = (day.duration / maxVal) * 100;
          const isSelected = idx === selectedDayIndex;

          return (
            <div
              key={day.date_str}
              onClick={() => onSelectDay(idx)}
              style={{
                flexGrow: 1,
                height: "100%",
                display: "flex",
                flexDirection: "column",
                justifyContent: "flex-end",
                alignItems: "center",
                cursor: "pointer",
                position: "relative",
              }}
            >
              {/* Bar */}
              <div
                style={{
                  width: "100%",
                  maxWidth: "50px",
                  height: `${Math.max(heightPct, 3)}%`,
                  borderRadius: "4px 4px 0 0",
                  transition: "all 0.3s ease",
                  boxShadow: isSelected ? "0 0 12px rgba(99, 102, 241, 0.4)" : "none",
                  position: "relative",
                  border: isSelected ? "2px solid var(--accent-color)" : "1px solid var(--border-color)",
                  backgroundColor: "var(--bg-tertiary)",
                  marginBottom: "0.25rem",
                }}
                title={`${day.day_name}: ${formatHours(day.duration)} total`}
              >
                {/* Tooltip value (moves dynamically with the top of the bar) */}
                <span
                  style={{
                    position: "absolute",
                    top: "-22px",
                    left: "50%",
                    transform: "translateX(-50%)",
                    fontSize: "0.75rem",
                    fontWeight: "600",
                    color: isSelected ? "var(--text-primary)" : "var(--text-muted)",
                    whiteSpace: "nowrap",
                    pointerEvents: "none",
                  }}
                >
                  {formatHours(day.duration)}
                </span>

                {/* Stacked Categories Container */}
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    overflow: "hidden",
                    borderRadius: "3px 3px 0 0",
                    display: "flex",
                    flexDirection: "column-reverse",
                  }}
                >
                  {day.duration > 0 && day.categories && day.categories.length > 0 ? (
                    day.categories.map((cat, cIdx) => {
                      const catPct = (cat.duration / day.duration) * 100;
                      const catKey = cat.category.toLowerCase();
                      const color = CATEGORY_COLORS[catKey] || CATEGORY_COLORS["other"];
                      return (
                        <div
                          key={cIdx}
                          style={{
                            width: "100%",
                            height: `${catPct}%`,
                            backgroundColor: color,
                          }}
                          title={`${cat.category}: ${formatHours(cat.duration)}`}
                        />
                      );
                    })
                  ) : (
                    <div style={{ width: "100%", height: "100%", backgroundColor: "var(--bg-tertiary)" }} />
                  )}
                </div>
              </div>

              {/* Day Label */}
              <span
                style={{
                  marginTop: "0.25rem",
                  fontSize: "0.8rem",
                  fontWeight: isSelected ? "600" : "500",
                  color: isSelected ? "var(--text-primary)" : "var(--text-secondary)",
                }}
              >
                {day.day_name}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default WeeklyBarChart;
