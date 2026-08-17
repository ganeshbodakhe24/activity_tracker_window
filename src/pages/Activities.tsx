import { useState, useEffect } from "react";
import {
  Activity,
  VisitDetail,
  ActivityFilterToolbar,
  ActivityTable,
  ActivityVisitsDrawer,
} from "../components/activities";

const invoke = (window as any).__TAURI__?.core?.invoke || (() => Promise.resolve());

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
        limit: 15,
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

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", position: "relative" }}>
      {/* Filter and Pagination Toolbar */}
      <ActivityFilterToolbar
        search={search}
        onSearchChange={(val) => {
          setSearch(val);
          setPage(1);
        }}
        categoryFilter={categoryFilter}
        onCategoryChange={(cat) => {
          setCategoryFilter(cat);
          setPage(1);
        }}
        date={date}
        onDateChange={(d) => {
          setDate(d);
          setPage(1);
        }}
        page={page}
        hasMore={hasMore}
        onPageChange={setPage}
      />

      {/* Activities Table List */}
      <ActivityTable
        activities={activities}
        loading={loading}
        onRowClick={handleRowClick}
      />

      {/* Selected Activity Visits Drawer */}
      {selectedActivity && (
        <ActivityVisitsDrawer
          selectedActivity={selectedActivity}
          visits={visits}
          onClose={() => setSelectedActivity(null)}
        />
      )}
    </div>
  );
}
