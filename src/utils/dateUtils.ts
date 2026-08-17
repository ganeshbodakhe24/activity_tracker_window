import { useState, useEffect } from "react";

/**
 * Returns the local date formatted as YYYY-MM-DD (avoiding UTC offset bugs from toISOString).
 */
export function getLocalDateString(d: Date = new Date()): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Checks if a given YYYY-MM-DD string is today's local date.
 */
export function isToday(dateStr: string): boolean {
  return dateStr === getLocalDateString();
}

/**
 * Shifts a YYYY-MM-DD date string by a given number of days.
 */
export function shiftDateString(dateStr: string, days: number): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  date.setDate(date.getDate() + days);
  return getLocalDateString(date);
}

/**
 * Formats a YYYY-MM-DD date string for friendly display.
 */
export function formatFriendlyDate(dateStr: string): string {
  if (isToday(dateStr)) {
    return "Today";
  }
  const yesterday = shiftDateString(getLocalDateString(), -1);
  if (dateStr === yesterday) {
    return "Yesterday";
  }
  const [y, m, d] = dateStr.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

/**
 * Custom React hook that tracks the current local date (YYYY-MM-DD)
 * and triggers re-renders whenever the local day rolls over at midnight or system time changes.
 */
export function useCurrentDate(): string {
  const [currentDate, setCurrentDate] = useState<string>(getLocalDateString());

  useEffect(() => {
    const checkDate = () => {
      const nowStr = getLocalDateString();
      setCurrentDate((prev) => (prev !== nowStr ? nowStr : prev));
    };

    // Check periodically every 5 seconds and when window gains focus/visibility
    const timer = setInterval(checkDate, 5000);
    window.addEventListener("focus", checkDate);
    document.addEventListener("visibilitychange", checkDate);

    return () => {
      clearInterval(timer);
      window.removeEventListener("focus", checkDate);
      document.removeEventListener("visibilitychange", checkDate);
    };
  }, []);

  return currentDate;
}
