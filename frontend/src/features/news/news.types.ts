export type NewsStatus = "draft" | "published";

export interface NewsItem {
  id: string;
  slug: string;
  title: string;
  category?: string;
  summary: string;
  content: string;
  image_url?: string;
  status: NewsStatus;
  published_at?: string | null;
  createdat?: string;
  updatedat?: string;
}

export interface NewsFilter {
  page?: number;
  limit?: number;
  status?: NewsStatus;
  search?: string;
}

