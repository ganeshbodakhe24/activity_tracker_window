export interface Activity {
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

export interface VisitDetail {
  id: number;
  start_time: string;
  end_time: string;
  duration: number;
}

export const formatHours = (seconds: number): string => {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  if (hrs === 0 && mins === 0) return `${seconds}s`;
  return hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m`;
};

export const formatTime = (isoString: string): string => {
  try {
    const d = new Date(isoString);
    return d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
  } catch (e) {
    return isoString;
  }
};
