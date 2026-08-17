export interface TimelineEntry {
  id: number;
  application: string;
  website: string;
  title: string;
  category: string;
  start_time: string;
  end_time: string;
  duration: number;
}

export const TABLE_CATEGORIES: Record<string, string> = {
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

export const formatTime = (isoString: string): string => {
  try {
    const d = new Date(isoString);
    return d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
  } catch (e) {
    return isoString;
  }
};

export const formatDuration = (seconds: number): string => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  if (m === 0) return `${s}s`;
  return `${m}m ${s}s`;
};
