import { useState, useEffect, useRef } from "react";
import {
  TimelineEntry,
  TABLE_CATEGORIES,
  TimelineFilterToolbar,
  TimelineList,
  CategorizeRuleModal,
} from "../components/timeline";
import { getLocalDateString, useCurrentDate } from "../utils/dateUtils";

const invoke = (window as any).__TAURI__?.core?.invoke || (() => Promise.resolve());

export default function Timeline() {
  const currentToday = useCurrentDate();
  const [date, setDate] = useState<string>(() => getLocalDateString());
  const prevTodayRef = useRef<string>(currentToday);
  const [visits, setVisits] = useState<TimelineEntry[]>([]);
  const [page, setPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(false);
  const [loading, setLoading] = useState(false);

  // When day rolls over at midnight, automatically advance date if user was looking at today
  useEffect(() => {
    if (prevTodayRef.current !== currentToday) {
      if (date === prevTodayRef.current) {
        setDate(currentToday);
        setPage(1);
      }
      prevTodayRef.current = currentToday;
    }
  }, [currentToday, date]);

  const [selectedVisitForModal, setSelectedVisitForModal] = useState<TimelineEntry | null>(null);
  const [selectedTargetTable, setSelectedTargetTable] = useState("coding_apps");
  const [targetValue, setTargetValue] = useState("");
  const [ruleCategory, setRuleCategory] = useState("Coding");

  const handleTableChange = (table: string) => {
    setSelectedTargetTable(table);
    setRuleCategory(TABLE_CATEGORIES[table] || "Study");
  };

  const handleAddCategoryClick = (visit: TimelineEntry) => {
    setSelectedVisitForModal(visit);

    let defaultTable = "coding_apps";
    let defaultValue = visit.application;

    if (visit.website) {
      defaultTable = "study_websites";
      defaultValue = visit.website;
    } else if (
      visit.title.toLowerCase().includes("cmd") ||
      visit.title.toLowerCase().includes("terminal") ||
      visit.title.toLowerCase().includes("powershell")
    ) {
      defaultTable = "terminal_keywords";
      defaultValue = visit.application;
    }

    setSelectedTargetTable(defaultTable);
    setTargetValue(defaultValue);
    setRuleCategory(TABLE_CATEGORIES[defaultTable] || "Study");
  };

  const handleSaveRule = async () => {
    if (!selectedVisitForModal || !targetValue.trim()) return;

    try {
      await invoke("add_classification_rule_and_update_week", {
        tableName: selectedTargetTable,
        value: targetValue.trim(),
        category: ruleCategory,
        dateStr: selectedVisitForModal.start_time.split("T")[0],
      });

      setSelectedVisitForModal(null);
      loadTimeline();
    } catch (e) {
      alert("Failed to save categorization rule: " + e);
    }
  };

  useEffect(() => {
    loadTimeline(false);

    const interval = setInterval(() => {
      if (document.visibilityState === "visible") {
        loadTimeline(true);
      }
    }, 5000);

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        loadTimeline(true);
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [date, page]);

  const loadTimeline = async (silent = false) => {
    if (!silent) {
      setLoading(true);
    }
    try {
      const res = await invoke("get_timeline", { date, page, limit: 30 });
      if (res) {
        setVisits(res.visits || []);
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

  return (
    <div>
      {/* Date Navigation & Pagination */}
      <TimelineFilterToolbar
        date={date}
        onDateChange={(d) => {
          setDate(d);
          setPage(1);
        }}
        page={page}
        hasMore={hasMore}
        onPageChange={setPage}
      />

      {/* Timeline Entries List */}
      <TimelineList
        visits={visits}
        loading={loading}
        onAddCategoryClick={handleAddCategoryClick}
      />

      {/* Custom Categorization Rule Modal */}
      {selectedVisitForModal && (
        <CategorizeRuleModal
          visit={selectedVisitForModal}
          selectedTargetTable={selectedTargetTable}
          targetValue={targetValue}
          ruleCategory={ruleCategory}
          onTableChange={handleTableChange}
          onTargetValueChange={setTargetValue}
          onSave={handleSaveRule}
          onClose={() => setSelectedVisitForModal(null)}
        />
      )}
    </div>
  );
}
