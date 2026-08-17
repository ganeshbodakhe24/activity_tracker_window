export interface DailySummary {
  total_duration: number;
  visit_count: number;
  top_app: string;
  top_category: string;
}

export interface AppUsage {
  application: string;
  duration: number;
}

export interface CategoryUsage {
  category: string;
  duration: number;
}

export interface WebsiteUsage {
  website: string;
  duration: number;
}

export interface WeeklyStat {
  day_name: string;
  date_str: string;
  duration: number;
  categories?: Array<{
    category: string;
    duration: number;
  }>;
}

export interface TodayVisit {
  start_time: string;
  end_time: string;
  duration: number;
  category: string;
}

export const CATEGORY_COLORS: Record<string, string> = {
  coding: "#6366f1",
  study: "#10b981",
  entertainment: "#f59e0b",
  social: "#ef4444",
  other: "#64748b",
};

export const formatHours = (seconds: number): string => {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  if (hrs === 0 && mins === 0) return "0m";
  return hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m`;
};
