export interface Record {
  id: number;
  value: string;
}

export interface ReferenceTableOption {
  value: string;
  label: string;
}

export const REFERENCE_TABLES: ReferenceTableOption[] = [
  { value: "browsers", label: "Browsers List" },
  { value: "coding_apps", label: "Coding Applications" },
  { value: "study_apps", label: "Study Applications" },
  { value: "entertainment_apps", label: "Entertainment Applications" },
  { value: "ignored_apps", label: "Ignored Applications" },
  { value: "study_websites", label: "Study Websites" },
  { value: "social_websites", label: "Social Websites" },
  { value: "entertainment_websites", label: "Entertainment Websites" },
  { value: "youtube_study_keywords", label: "YouTube Study Keywords" },
  { value: "youtube_entertainment_keywords", label: "YouTube Entertainment Keywords" },
  { value: "terminal_keywords", label: "Terminal Keywords" },
];
