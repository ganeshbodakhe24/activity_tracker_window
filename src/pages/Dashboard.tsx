import { useState, useEffect } from "react";
import { AlertTriangle } from "lucide-react";
import {
  DailySummary,
  AppUsage,
  CategoryUsage,
  WebsiteUsage,
  WeeklyStat,
  TodayVisit,
  DashboardHeader,
  SummaryCards,
  TodayTimelineStrip,
  WeeklyBarChart,
  DayDetails,
} from "../components/dashboard";

const invoke = (window as any).__TAURI__?.core?.invoke || (() => Promise.resolve());

export default function Dashboard() {
  const [selectedRange, setSelectedRange] = useState<string>("This Week");
  const [selectedDayOffset, setSelectedDayOffset] = useState<number>(0); // weeks offset
  const [, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Statistics
  const [stats, setStats] = useState<DailySummary>({
    total_duration: 0,
    visit_count: 0,
    top_app: "—",
    top_category: "—",
  });

  // Graph data (days of the week)
  const [weeklyData, setWeeklyData] = useState<WeeklyStat[]>([]);

  // Selected day breakdown details
  const [selectedDayIndex, setSelectedDayIndex] = useState<number>(
    new Date().getDay() === 0 ? 6 : new Date().getDay() - 1
  );
  const [appUsage, setAppUsage] = useState<AppUsage[]>([]);
  const [categoryUsage, setCategoryUsage] = useState<CategoryUsage[]>([]);
  const [websiteUsage, setWebsiteUsage] = useState<WebsiteUsage[]>([]);
  const [todayVisits, setTodayVisits] = useState<TodayVisit[]>([]);

  // Load weekly data on mount and range/offset change with live polling when visible
  useEffect(() => {
    loadData(false);

    const interval = setInterval(() => {
      if (document.visibilityState === "visible") {
        loadData(true);
      }
    }, 5000);

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        loadData(true);
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [selectedRange, selectedDayOffset]);

  const loadData = async (silent = false) => {
    if (!silent) {
      setLoading(true);
    }
    setError(null);
    try {
      // Call Rust commands to get weekly statistics
      const res = await invoke("get_weekly_summary", {
        rangeType: selectedRange,
        offset: selectedDayOffset,
      });

      if (res && Array.isArray(res)) {
        setWeeklyData(res);

        // Sum total metrics for the displayed range
        const totalDuration = res.reduce((acc, curr) => acc + curr.duration, 0);

        // Query Rust to get overall aggregate stats for top app/category
        const summary = await invoke("get_range_aggregates", {
          rangeType: selectedRange,
          offset: selectedDayOffset,
        });

        setStats({
          total_duration: totalDuration,
          visit_count: summary.visit_count || 0,
          top_app: summary.top_app || "—",
          top_category: summary.top_category || "—",
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
      if (!silent) {
        setLoading(false);
      }
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

  const activeDay = weeklyData[selectedDayIndex] || weeklyData[weeklyData.length - 1];

  return (
    <div>
      {/* Date Navigation Header */}
      <DashboardHeader
        selectedRange={selectedRange}
        onSelectRange={(range) => {
          setSelectedRange(range);
          setSelectedDayOffset(0);
        }}
        selectedDayOffset={selectedDayOffset}
        onOffsetChange={setSelectedDayOffset}
      />

      {/* Error Banner */}
      {error && (
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
          <button onClick={() => loadData()} className="btn btn-primary" style={{ marginLeft: "auto", padding: "0.25rem 0.75rem" }}>
            Retry
          </button>
        </div>
      )}

      {/* Summary Stat Cards */}
      <SummaryCards stats={stats} />

      {/* 24-Hour Timeline Bar or Weekly Activity Graph */}
      {selectedRange === "Today" ? (
        <TodayTimelineStrip todayVisits={todayVisits} />
      ) : (
        <WeeklyBarChart
          weeklyData={weeklyData}
          selectedDayIndex={selectedDayIndex}
          onSelectDay={handleDayClick}
        />
      )}

      {/* Selected Day Breakdown Details */}
      {activeDay && (
        <DayDetails
          activeDay={activeDay}
          appUsage={appUsage}
          categoryUsage={categoryUsage}
          websiteUsage={websiteUsage}
        />
      )}
    </div>
  );
}
