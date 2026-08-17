import React from "react";
import { CategoryUsage, CATEGORY_COLORS, formatHours } from "./types";

interface CategoryDonutChartProps {
  categoryUsage: CategoryUsage[];
}

export const CategoryDonutChart: React.FC<CategoryDonutChartProps> = ({ categoryUsage }) => {
  if (categoryUsage.length === 0) {
    return <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>No category activity recorded.</p>;
  }

  const total = categoryUsage.reduce((acc, curr) => acc + curr.duration, 0);
  let currentOffset = 0;
  const radius = 15.915; // 2 * PI * r ~= 100

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "1rem", justifyContent: "space-around" }}>
      {/* Circular Donut Graph */}
      <div style={{ position: "relative", width: "130px", height: "130px", flexShrink: 0 }}>
        <svg width="100%" height="100%" viewBox="0 0 42 42" style={{ transform: "rotate(-90deg)" }}>
          {categoryUsage.map((cat) => {
            const percentage = (cat.duration / total) * 100;
            const strokeDasharray = `${percentage} ${100 - percentage}`;
            const strokeDashoffset = 100 - currentOffset;
            currentOffset += percentage;

            const catKey = cat.category.toLowerCase();
            const color = CATEGORY_COLORS[catKey] || CATEGORY_COLORS["other"];

            return (
              <circle
                key={cat.category}
                cx="21"
                cy="21"
                r={radius}
                fill="transparent"
                stroke={color}
                strokeWidth="5"
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                style={{ transition: "stroke-dashoffset 0.3s ease" }}
              />
            );
          })}
        </svg>

        {/* Centered Stats Info */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
          }}
        >
          <span style={{ fontSize: "0.65rem", color: "var(--text-muted)", fontWeight: "500", textTransform: "uppercase" }}>
            TOTAL
          </span>
          <span style={{ fontSize: "0.85rem", fontWeight: "700", whiteSpace: "nowrap" }}>
            {formatHours(total)}
          </span>
        </div>
      </div>

      {/* Legend list */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "0.4rem",
          flexGrow: 1,
          maxHeight: "150px",
          overflowY: "auto",
          paddingRight: "5px",
        }}
      >
        {categoryUsage.map((cat) => {
          const percentage = (cat.duration / total) * 100;
          const catKey = cat.category.toLowerCase();
          const color = CATEGORY_COLORS[catKey] || CATEGORY_COLORS["other"];

          return (
            <div
              key={cat.category}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                fontSize: "0.8rem",
                gap: "0.5rem",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", overflow: "hidden" }}>
                <span style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: color, flexShrink: 0 }} />
                <span style={{ fontWeight: "500", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>
                  {cat.category}
                </span>
              </div>
              <span style={{ color: "var(--text-secondary)", fontWeight: "600", whiteSpace: "nowrap", fontSize: "0.75rem" }}>
                {formatHours(cat.duration)} ({percentage.toFixed(0)}%)
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CategoryDonutChart;
