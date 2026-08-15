import { useState, useEffect } from "react";
import { Clock, Calendar, ChevronLeft, ChevronRight } from "lucide-react";

const invoke = (window as any).__TAURI__?.core?.invoke || (() => Promise.resolve());

interface TimelineEntry {
  id: number;
  application: string;
  website: string;
  title: string;
  category: string;
  start_time: string;
  end_time: string;
  duration: number;
}

export default function Timeline() {
  const [date, setDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [visits, setVisits] = useState<TimelineEntry[]>([]);
  const [page, setPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadTimeline();
  }, [date, page]);

  const loadTimeline = async () => {
    setLoading(true);
    try {
      const res = await invoke("get_timeline", { date, page, limit: 30 });
      if (res) {
        setVisits(res.visits || []);
        setHasMore(res.has_more || false);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
    } catch (e) {
      return isoString;
    }
  };

  const formatDuration = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    if (m === 0) return `${s}s`;
    return `${m}m ${s}s`;
  };

  return (
    <div>
      {/* Date Navigation */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <Calendar size={18} className="text-indigo-400" />
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
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <button
            onClick={() => setPage((p) => Math.max(p - 1, 1))}
            className="btn btn-secondary"
            disabled={page === 1}
            style={{ padding: "0.4rem 0.8rem" }}
          >
            <ChevronLeft size={16} />
            Prev
          </button>
          <span style={{ display: "flex", alignItems: "center", fontSize: "0.85rem", color: "var(--text-secondary)" }}>
            Page {page}
          </span>
          <button
            onClick={() => setPage((p) => p + 1)}
            className="btn btn-secondary"
            disabled={!hasMore}
            style={{ padding: "0.4rem 0.8rem" }}
          >
            Next
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "3rem", color: "var(--text-secondary)" }}>
          Loading activity timeline...
        </div>
      ) : visits.length === 0 ? (
        <div style={{ textAlign: "center", padding: "3rem", color: "var(--text-secondary)" }}>
          No activity recorded for this day.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem", paddingLeft: "10px" }}>
          {visits.map((visit) => (
            <div key={visit.id} className="timeline-item">
              <div className="timeline-time">{formatTime(visit.start_time)}</div>
              <div className="timeline-dot"></div>
              <div className="timeline-content">
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.25rem" }}>
                  <span style={{ fontWeight: "600", fontSize: "0.95rem" }}>{visit.application}</span>
                  <span className={`badge badge-${visit.category.toLowerCase()}`} style={{ height: "fit-content" }}>
                    {visit.category}
                  </span>
                </div>
                {visit.website && (
                  <div style={{ fontSize: "0.85rem", color: "var(--accent-color)", fontWeight: "500", marginBottom: "0.25rem" }}>
                    {visit.website}
                  </div>
                )}
                <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "0.5rem" }}>
                  {visit.title}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.25rem", fontSize: "0.75rem", color: "var(--text-muted)" }}>
                  <Clock size={12} />
                  <span>Duration: {formatDuration(visit.duration)}</span>
                  <span>•</span>
                  <span>
                    {formatTime(visit.start_time)} → {formatTime(visit.end_time)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
