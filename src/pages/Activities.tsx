import { useState, useEffect } from "react";
import { Search, Filter, Calendar, ChevronLeft, ChevronRight, X } from "lucide-react";

const invoke = (window as any).__TAURI__?.core?.invoke || (() => Promise.resolve());

interface Activity {
  id: number;
  day_key: string;
  activity_key: string;
  title: string;
  application: string;
  website: string;
  category: string;
  total_duration: number;
  visit_count: number;
}

interface VisitDetail {
  id: number;
  start_time: string;
  end_time: string;
  duration: number;
}

export default function Activities() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [date, setDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(false);

  // Selected activity drawer details
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [visits, setVisits] = useState<VisitDetail[]>([]);

  useEffect(() => {
    loadActivities(false);

    const interval = setInterval(() => {
      if (document.visibilityState === "visible") {
        loadActivities(true);
      }
    }, 5000);

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        loadActivities(true);
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [date, search, categoryFilter, page]);

  const loadActivities = async (silent = false) => {
    if (!silent) {
      setLoading(true);
    }
    try {
      const res = await invoke("get_activities", {
        date,
        search,
        category: categoryFilter,
        page,
        limit: 15
      });
      if (res) {
        setActivities(res.activities || []);
        setHasMore(res.has_more || false);
      }
    } catch (e) {
      console.error(e);
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  };

  const handleRowClick = async (activity: Activity) => {
    setSelectedActivity(activity);
    try {
      const res = await invoke("get_activity_visits", { activityId: activity.id });
      setVisits(res || []);
    } catch (e) {
      console.error(e);
    }
  };

  const formatHours = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    if (hrs === 0 && mins === 0) return `${seconds}s`;
    return hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m`;
  };

  const formatTime = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
    } catch (e) {
      return isoString;
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", position: "relative" }}>
      {/* Filter Toolbar */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr auto auto auto", gap: "1rem", marginBottom: "1.5rem" }}>
        {/* Search */}
        <div style={{ position: "relative" }}>
          <Search size={16} style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
          <input
            type="text"
            placeholder="Search activity, website, application..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="input-field"
            style={{ paddingLeft: "2.25rem" }}
          />
        </div>

        {/* Category Filter */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <Filter size={16} className="text-slate-400" />
          <select
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              setPage(1);
            }}
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

        {/* Date Filter */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <Calendar size={16} className="text-slate-400" />
          <input
            type="date"
            value={date}
            onChange={(e) => {
              setDate(e.target.value);
              setPage(1);
            }}
            className="input-field"
            style={{ width: "auto" }}
          />
        </div>

        {/* Pagination buttons */}
        <div style={{ display: "flex", gap: "0.25rem" }}>
          <button
            onClick={() => setPage((p) => Math.max(p - 1, 1))}
            className="btn btn-secondary"
            disabled={page === 1}
            style={{ padding: "0.4rem 0.6rem" }}
          >
            <ChevronLeft size={14} />
          </button>
          <span style={{ display: "flex", alignItems: "center", fontSize: "0.8rem", color: "var(--text-secondary)", minWidth: "50px", justifyContent: "center" }}>
            Page {page}
          </span>
          <button
            onClick={() => setPage((p) => p + 1)}
            className="btn btn-secondary"
            disabled={!hasMore}
            style={{ padding: "0.4rem 0.6rem" }}
          >
            <ChevronRight size={14} />
          </button>
        </div>
      </div>

      {/* Grid List */}
      <div style={{ flexGrow: 1, overflowY: "auto" }}>
        {loading ? (
          <div style={{ textAlign: "center", padding: "3rem", color: "var(--text-secondary)" }}>
            Loading activities data...
          </div>
        ) : activities.length === 0 ? (
          <div style={{ textAlign: "center", padding: "3rem", color: "var(--text-secondary)" }}>
            No activity recorded.
          </div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.9rem" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border-color)", color: "var(--text-secondary)" }}>
                <th style={{ padding: "0.75rem 1rem", fontWeight: "600" }}>Application</th>
                <th style={{ padding: "0.75rem 1rem", fontWeight: "600" }}>Website</th>
                <th style={{ padding: "0.75rem 1rem", fontWeight: "600" }}>Window/Page Title</th>
                <th style={{ padding: "0.75rem 1rem", fontWeight: "600" }}>Category</th>
                <th style={{ padding: "0.75rem 1rem", fontWeight: "600" }}>Total Duration</th>
                <th style={{ padding: "0.75rem 1rem", fontWeight: "600" }}>Visits</th>
              </tr>
            </thead>
            <tbody>
              {activities.map((act) => (
                <tr
                  key={act.id}
                  onClick={() => handleRowClick(act)}
                  style={{
                    borderBottom: "1px solid var(--border-color)",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                  }}
                  className="list-item-row"
                >
                  <td style={{ padding: "0.85rem 1rem", fontWeight: "500" }}>{act.application}</td>
                  <td style={{ padding: "0.85rem 1rem", color: "var(--accent-color)" }}>{act.website || "—"}</td>
                  <td style={{ padding: "0.85rem 1rem", maxWidth: "250px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {act.title}
                  </td>
                  <td style={{ padding: "0.85rem 1rem" }}>
                    <span className={`badge badge-${act.category.toLowerCase()}`}>{act.category}</span>
                  </td>
                  <td style={{ padding: "0.85rem 1rem", fontWeight: "600" }}>{formatHours(act.total_duration)}</td>
                  <td style={{ padding: "0.85rem 1rem", color: "var(--text-secondary)" }}>{act.visit_count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Detail Drawer Sidebar */}
      {selectedActivity && (
        <div
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            bottom: 0,
            width: "360px",
            backgroundColor: "var(--bg-secondary)",
            borderLeft: "1px solid var(--border-color)",
            boxShadow: "-10px 0 30px rgba(0, 0, 0, 0.4)",
            display: "flex",
            flexDirection: "column",
            zIndex: 10,
            padding: "1.5rem",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
            <h4 style={{ fontWeight: "700", fontSize: "1.1rem" }}>Detailed Visits</h4>
            <button
              onClick={() => setSelectedActivity(null)}
              className="btn btn-secondary"
              style={{ padding: "0.3rem" }}
            >
              <X size={16} />
            </button>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem", marginBottom: "1.5rem" }}>
            <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: "600" }}>APPLICATION</span>
            <span style={{ fontSize: "0.95rem", fontWeight: "600" }}>{selectedActivity.application}</span>
            {selectedActivity.website && (
              <>
                <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: "600", marginTop: "0.5rem" }}>WEBSITE</span>
                <span style={{ fontSize: "0.9rem", color: "var(--accent-color)", fontWeight: "500" }}>{selectedActivity.website}</span>
              </>
            )}
            <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: "600", marginTop: "0.5rem" }}>TITLE</span>
            <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)", lineHeight: "1.2" }}>{selectedActivity.title}</span>
          </div>

          <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: "600", marginBottom: "0.75rem", display: "block" }}>
            SESSION RECORDINGS
          </span>

          <div style={{ flexGrow: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {visits.length === 0 ? (
              <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>No visit recordings found.</p>
            ) : (
              visits.map((v) => (
                <div
                  key={v.id}
                  style={{
                    backgroundColor: "var(--bg-tertiary)",
                    border: "1px solid var(--border-color)",
                    borderRadius: "0.375rem",
                    padding: "0.75rem",
                    fontSize: "0.85rem",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.25rem" }}>
                    <span style={{ fontWeight: "600" }}>{formatTime(v.start_time)} → {formatTime(v.end_time)}</span>
                    <span style={{ color: "var(--text-secondary)", fontWeight: "500" }}>{formatHours(v.duration)}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
