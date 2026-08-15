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

  const [selectedVisitForModal, setSelectedVisitForModal] = useState<TimelineEntry | null>(null);
  const [selectedTargetTable, setSelectedTargetTable] = useState("coding_apps");
  const [targetValue, setTargetValue] = useState("");
  const [ruleCategory, setRuleCategory] = useState("Coding");

  const tableCategories: Record<string, string> = {
    coding_apps: "Coding",
    study_apps: "Study",
    entertainment_apps: "Entertainment",
    study_websites: "Study",
    social_websites: "Social",
    entertainment_websites: "Entertainment",
    youtube_study_keywords: "Study",
    youtube_entertainment_keywords: "Entertainment",
    terminal_keywords: "Study",
  };

  const handleTableChange = (table: string) => {
    setSelectedTargetTable(table);
    setRuleCategory(tableCategories[table] || "Study");
  };

  const handleAddCategoryClick = (visit: TimelineEntry) => {
    setSelectedVisitForModal(visit);
    
    let defaultTable = "coding_apps";
    let defaultValue = visit.application;

    if (visit.website) {
      defaultTable = "study_websites";
      defaultValue = visit.website;
    } else if (visit.title.toLowerCase().includes("cmd") || visit.title.toLowerCase().includes("terminal") || visit.title.toLowerCase().includes("powershell")) {
      defaultTable = "terminal_keywords";
      defaultValue = visit.application;
    }

    setSelectedTargetTable(defaultTable);
    setTargetValue(defaultValue);
    setRuleCategory(tableCategories[defaultTable] || "Study");
  };

  const handleSaveRule = async () => {
    if (!selectedVisitForModal || !targetValue.trim()) return;

    try {
      await invoke("add_classification_rule_and_update_week", {
        tableName: selectedTargetTable,
        value: targetValue.trim(),
        category: ruleCategory,
        dateStr: selectedVisitForModal.start_time.split("T")[0]
      });
      
      setSelectedVisitForModal(null);
      loadTimeline();
    } catch (e) {
      alert("Failed to save categorization rule: " + e);
    }
  };

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
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <span className={`badge badge-${visit.category.toLowerCase()}`} style={{ height: "fit-content" }}>
                      {visit.category}
                    </span>
                    {visit.category.toLowerCase() === "other" && (
                      <button
                        onClick={() => handleAddCategoryClick(visit)}
                        title="Add Custom Category Rule"
                        style={{
                          width: "20px",
                          height: "20px",
                          borderRadius: "50%",
                          background: "var(--accent-color)",
                          color: "white",
                          border: "none",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          cursor: "pointer",
                          fontWeight: "bold",
                          fontSize: "0.9rem",
                        }}
                      >
                        +
                      </button>
                    )}
                  </div>
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

      {/* Custom Categorization Rules Popup Modal */}
      {selectedVisitForModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: "450px" }}>
            <h4 style={{ fontWeight: "700", marginBottom: "1rem", color: "var(--accent-color)" }}>
              Categorize Activity Rule
            </h4>
            
            <div style={{ padding: "0.75rem", backgroundColor: "var(--bg-tertiary)", borderRadius: "4px", marginBottom: "1rem", fontSize: "0.85rem" }}>
              <div style={{ marginBottom: "0.25rem" }}><strong>App:</strong> {selectedVisitForModal.application}</div>
              {selectedVisitForModal.website && <div style={{ marginBottom: "0.25rem" }}><strong>Website:</strong> {selectedVisitForModal.website}</div>}
              <div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                <strong>Title:</strong> {selectedVisitForModal.title}
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginBottom: "1.5rem" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.25rem" }}>
                  Rule Table Target
                </label>
                <select
                  value={selectedTargetTable}
                  onChange={(e) => handleTableChange(e.target.value)}
                  className="input-field"
                  style={{ width: "100%" }}
                >
                  <option value="coding_apps">Coding Applications</option>
                  <option value="study_apps">Study Applications</option>
                  <option value="entertainment_apps">Entertainment Applications</option>
                  <option value="study_websites">Study Websites</option>
                  <option value="social_websites">Social Websites</option>
                  <option value="entertainment_websites">Entertainment Websites</option>
                  <option value="youtube_study_keywords">YouTube Study Keywords</option>
                  <option value="youtube_entertainment_keywords">YouTube Entertainment Keywords</option>
                  <option value="terminal_keywords">Terminal Keywords</option>
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.25rem" }}>
                  Keyword/Value Match Rule
                </label>
                <input
                  type="text"
                  value={targetValue}
                  onChange={(e) => setTargetValue(e.target.value)}
                  className="input-field"
                  style={{ width: "100%" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.25rem" }}>
                  Category assigned
                </label>
                <input
                  type="text"
                  value={ruleCategory}
                  disabled
                  className="input-field"
                  style={{ width: "100%", opacity: 0.7, cursor: "not-allowed" }}
                />
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem" }}>
              <button onClick={() => setSelectedVisitForModal(null)} className="btn btn-secondary">
                Cancel
              </button>
              <button onClick={handleSaveRule} className="btn btn-primary">
                Add Rule & Recategorize Week
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
