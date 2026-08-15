import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, AlertTriangle } from "lucide-react";

const invoke = (window as any).__TAURI__?.core?.invoke || (() => Promise.resolve());

interface DailySummary {
  total_duration: number;
  visit_count: number;
  top_app: string;
  top_category: string;
}

interface AppUsage {
  application: string;
  duration: number;
}

interface CategoryUsage {
  category: string;
  duration: number;
}

interface WebsiteUsage {
  website: string;
  duration: number;
}

interface WeeklyStat {
  day_name: string;
  date_str: string;
  duration: number;
}

export default function Dashboard() {
  const [selectedRange, setSelectedRange] = useState<string>("This Week");
  const [selectedDayOffset, setSelectedDayOffset] = useState<number>(0); // weeks offset
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Statistics
  const [stats, setStats] = useState<DailySummary>({
    total_duration: 0,
    visit_count: 0,
    top_app: "—",
    top_category: "—"
  });

  // Graph data (days of the week)
  const [weeklyData, setWeeklyData] = useState<WeeklyStat[]>([]);

  // Selected day breakdown details
  const [selectedDayIndex, setSelectedDayIndex] = useState<number>(new Date().getDay() === 0 ? 6 : new Date().getDay() - 1);
  const [appUsage, setAppUsage] = useState<AppUsage[]>([]);
  const [categoryUsage, setCategoryUsage] = useState<CategoryUsage[]>([]);
  const [websiteUsage, setWebsiteUsage] = useState<WebsiteUsage[]>([]);
  const [todayVisits, setTodayVisits] = useState<any[]>([]);

  const formatHours = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    if (hrs === 0 && mins === 0) return "0m";
    return hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m`;
  };

  // Load weekly data on mount and range/offset change
  useEffect(() => {
    loadData();
  }, [selectedRange, selectedDayOffset]);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Call Rust commands to get weekly statistics
      const res = await invoke("get_weekly_summary", {
        rangeType: selectedRange,
        offset: selectedDayOffset
      });

      if (res && Array.isArray(res)) {
        setWeeklyData(res);
        
        // Sum total metrics for the displayed range
        const totalDuration = res.reduce((acc, curr) => acc + curr.duration, 0);
        
        // We will query Rust to get overall aggregate stats for top app/category
        const summary = await invoke("get_range_aggregates", {
          rangeType: selectedRange,
          offset: selectedDayOffset
        });

        setStats({
          total_duration: totalDuration,
          visit_count: summary.visit_count || 0,
          top_app: summary.top_app || "—",
          top_category: summary.top_category || "—"
        });

        // Reset selectedDayIndex if it falls out of range of the new data
        let newIndex = selectedDayIndex;
        if (selectedDayIndex >= res.length) {
          newIndex = res.length - 1;
          setSelectedDayIndex(newIndex);
        } else if (selectedRange === "Today") {
          newIndex = 0;
          setSelectedDayIndex(0);
        }

        // Trigger loading day details for the currently highlighted index
        const selectedDay = res[newIndex] || res[res.length - 1];
        if (selectedDay) {
          loadDayBreakdown(selectedDay.date_str);
          
          if (selectedRange === "Today") {
            const visitsData = await invoke("get_today_timeline_strip", { date: selectedDay.date_str });
            setTodayVisits(visitsData || []);
          }
        }
      }
    } catch (e) {
      setError("Unable to load activity data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const loadDayBreakdown = async (dateStr: string) => {
    try {
      const apps = await invoke("get_app_usage", { date: dateStr });
      const cats = await invoke("get_category_usage", { date: dateStr });
      const sites = await invoke("get_website_usage", { date: dateStr });

      setAppUsage(apps || []);
      setCategoryUsage(cats || []);
      setWebsiteUsage(sites || []);
    } catch (e) {}
  };

  const handleDayClick = (index: number) => {
    setSelectedDayIndex(index);
    const day = weeklyData[index];
    if (day) {
      loadDayBreakdown(day.date_str);
    }
  };

  const maxVal = Math.max(...weeklyData.map((d) => d.duration), 1);

  return (
    <div>
      {/* Date Navigation Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          {["Today", "This Week", "Last 7 Days", "This Month"].map((range) => (
            <button
              key={range}
              onClick={() => {
                setSelectedRange(range);
                setSelectedDayOffset(0);
              }}
              className={`btn ${selectedRange === range ? "btn-primary" : "btn-secondary"}`}
              style={{ fontSize: "0.85rem", padding: "0.4rem 0.8rem" }}
            >
              {range}
            </button>
          ))}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <button
            onClick={() => setSelectedDayOffset((prev) => prev - 1)}
            className="btn btn-secondary"
            style={{ padding: "0.4rem" }}
          >
            <ChevronLeft size={16} />
          </button>
          <span style={{ fontSize: "0.9rem", fontWeight: "600", minWidth: "80px", textAlign: "center" }}>
            {selectedDayOffset === 0 ? "Current" : `${Math.abs(selectedDayOffset)} ${selectedDayOffset < 0 ? "prev" : "next"}`}
          </span>
          <button
            onClick={() => setSelectedDayOffset((prev) => prev + 1)}
            className="btn btn-secondary"
            style={{ padding: "0.4rem" }}
            disabled={selectedDayOffset >= 0}
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {error ? (
        <div
          style={{
            backgroundColor: "rgba(239, 68, 68, 0.15)",
            border: "1px solid var(--danger-color)",
            borderRadius: "0.5rem",
            padding: "1rem",
            color: "#f87171",
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            marginBottom: "1.5rem",
          }}
        >
          <AlertTriangle size={20} />
          <span>{error}</span>
          <button onClick={loadData} className="btn btn-primary" style={{ marginLeft: "auto", padding: "0.25rem 0.75rem" }}>
            Retry
          </button>
        </div>
      ) : null}

      {/* Summary Cards */}
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
          <span className="stat-value" style={{ textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>
            {stats.top_app}
          </span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Top Category</span>
          <span className="stat-value">{stats.top_category}</span>
        </div>
      </div>

      {/* Weekly Activity Graph / 24-Hour Timeline Bar */}
      {selectedRange === "Today" ? (
        <div className="graph-container">
          <div className="graph-header">
            <h3 className="graph-title">Today's 24-Hour Activity Timeline</h3>
            <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
              Hover over colored segments to see specific visits and category tags
            </span>
          </div>

          {/* The horizontal bar */}
          <div
            style={{
              position: "relative",
              height: "36px",
              backgroundColor: "var(--bg-tertiary)",
              borderRadius: "6px",
              border: "1px solid var(--border-color)",
              overflow: "hidden",
              marginBottom: "0.75rem",
            }}
          >
            {todayVisits.map((v, i) => {
              try {
                const startD = new Date(v.start_time);
                const endD = new Date(v.end_time);
                
                const startSecs = startD.getHours() * 3600 + startD.getMinutes() * 60 + startD.getSeconds();
                const durSecs = v.duration;

                const leftPct = (startSecs / 86400) * 100;
                const widthPct = (durSecs / 86400) * 100;

                const categoryColors: Record<string, string> = {
                  coding: "#6366f1",
                  study: "#10b981",
                  entertainment: "#f59e0b",
                  social: "#ef4444",
                  other: "#64748b",
                };

                const catKey = v.category.toLowerCase();
                const color = categoryColors[catKey] || categoryColors["other"];
                
                const formatClock = (d: Date) => {
                  return d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
                };

                return (
                  <div
                    key={i}
                    style={{
                      position: "absolute",
                      left: `${leftPct}%`,
                      width: `${Math.max(widthPct, 0.15)}%`,
                      height: "100%",
                      backgroundColor: color,
                      cursor: "help",
                    }}
                    title={`${v.category}: ${formatClock(startD)} - ${formatClock(endD)} (${Math.ceil(durSecs / 60)}m)`}
                  />
                );
              } catch (e) {
                return null;
              }
            })}
          </div>

          {/* Labels under the bar */}
          <div style={{ display: "flex", justifyContent: "space-between", padding: "0 5px" }}>
            {["12 AM", "3 AM", "6 AM", "9 AM", "12 PM", "3 PM", "6 PM", "9 PM", "12 AM"].map((lbl, idx) => (
              <span key={idx} style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: "600" }}>
                {lbl}
              </span>
            ))}
          </div>
        </div>
      ) : (
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
              return (
                <div
                  key={day.date_str}
                  onClick={() => handleDayClick(idx)}
                  style={{
                    flexGrow: 1,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    cursor: "pointer",
                  }}
                >
                  {/* Bar */}
                  <div
                    style={{
                      width: "100%",
                      maxWidth: "50px",
                      height: `${Math.max(heightPct, 3)}%`,
                      backgroundColor: idx === selectedDayIndex ? "var(--accent-color)" : "var(--bg-tertiary)",
                      borderRadius: "4px 4px 0 0",
                      transition: "all 0.3s ease",
                      boxShadow: idx === selectedDayIndex ? "0 0 12px rgba(99, 102, 241, 0.4)" : "none",
                      position: "relative",
                    }}
                    title={formatHours(day.duration)}
                  >
                    {/* Tooltip value */}
                    <span
                      style={{
                        position: "absolute",
                        top: "-25px",
                        left: "50%",
                        transform: "translateX(-50%)",
                        fontSize: "0.75rem",
                        fontWeight: "600",
                        color: idx === selectedDayIndex ? "var(--text-primary)" : "var(--text-muted)",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {formatHours(day.duration)}
                    </span>
                  </div>
                  {/* Label */}
                  <span
                    style={{
                      marginTop: "0.5rem",
                      fontSize: "0.8rem",
                      fontWeight: idx === selectedDayIndex ? "600" : "500",
                      color: idx === selectedDayIndex ? "var(--text-primary)" : "var(--text-secondary)",
                    }}
                  >
                    {day.day_name}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Selected Day breakdown details */}
      {(() => {
        const activeDay = weeklyData[selectedDayIndex] || weeklyData[weeklyData.length - 1];
        if (!activeDay) return null;
        return (
          <div style={{ marginBottom: "2rem" }}>
            <h3 style={{ fontSize: "1.2rem", fontWeight: "700", marginBottom: "1rem", color: "var(--accent-color)" }}>
              Details for {activeDay.day_name} ({activeDay.date_str})
            </h3>

          <div className="dashboard-grid">
            {/* Applications */}
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

            {/* Categories */}
            <div className="dashboard-card" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
              <h4 className="card-title">Category Breakdown</h4>
              <div style={{ padding: "0.5rem 0" }}>
                {categoryUsage.length === 0 ? (
                  <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>No category activity recorded.</p>
                ) : (
                  (() => {
                    const total = categoryUsage.reduce((acc, curr) => acc + curr.duration, 0);
                    let currentOffset = 0;
                    const categoryColors: Record<string, string> = {
                      coding: "#6366f1",
                      study: "#10b981",
                      entertainment: "#f59e0b",
                      social: "#ef4444",
                      other: "#64748b",
                    };
                    const r = 15.915;

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
                              const color = categoryColors[catKey] || categoryColors["other"];

                              return (
                                <circle
                                  key={cat.category}
                                  cx="21"
                                  cy="21"
                                  r={r}
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
                            <span style={{ fontSize: "0.65rem", color: "var(--text-muted)", fontWeight: "500", textTransform: "uppercase" }}>TOTAL</span>
                            <span style={{ fontSize: "0.85rem", fontWeight: "700", whiteSpace: "nowrap" }}>{formatHours(total)}</span>
                          </div>
                        </div>

                        {/* Legend list */}
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem", flexGrow: 1, maxHeight: "150px", overflowY: "auto", paddingRight: "5px" }}>
                          {categoryUsage.map((cat) => {
                            const percentage = (cat.duration / total) * 100;
                            const catKey = cat.category.toLowerCase();
                            const color = categoryColors[catKey] || categoryColors["other"];
                            return (
                              <div key={cat.category} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "0.8rem", gap: "0.5rem" }}>
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
                  })()
                )}
              </div>
            </div>

            {/* Websites */}
            <div className="dashboard-card" style={{ gridColumn: "span 2" }}>
              <h4 className="card-title">Top Visited Websites</h4>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                {websiteUsage.length === 0 ? (
                  <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", gridColumn: "span 2" }}>No website activity recorded.</p>
                ) : (
                  websiteUsage.map((web) => (
                    <div key={web.website} className="list-item" style={{ marginBottom: 0 }}>
                      <span className="list-item-title" style={{ textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>
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
      })()}
    </div>
  );
}
