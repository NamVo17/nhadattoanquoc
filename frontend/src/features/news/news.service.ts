import { authorizedFetch } from "@/lib/authorizedFetch";
import type { NewsItem, NewsFilter } from "./news.types";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

export const newsService = {
  uploadImage: async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);

    const res = await authorizedFetch(`${BASE_URL}/news/upload/image`, {
      method: "POST",
      body: formData,
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || "Failed to upload image");
    return json.url as string;
  },

  getAdminList: async (filters?: NewsFilter): Promise<{ data: NewsItem[]; total: number; page: number; pages: number }> => {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== "") params.set(k, String(v));
      });
    }
    const res = await authorizedFetch(`${BASE_URL}/news/admin/list?${params.toString()}`);
    if (!res.ok) throw new Error("Failed to fetch news list");
    const json = await res.json();
    return {
      data: json.data || [],
      total: json.pagination?.total ?? 0,
      page: json.pagination?.page ?? 1,
      pages: json.pagination?.pages ?? 1,
    };
  },

  create: async (payload: Partial<NewsItem>): Promise<NewsItem> => {
    const res = await authorizedFetch(`${BASE_URL}/news/admin`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || "Failed to create news");
    return json.data as NewsItem;
  },

  update: async (id: string, payload: Partial<NewsItem>): Promise<NewsItem> => {
    const res = await authorizedFetch(`${BASE_URL}/news/admin/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || "Failed to update news");
    return json.data as NewsItem;
  },

  remove: async (id: string): Promise<void> => {
    const res = await authorizedFetch(`${BASE_URL}/news/admin/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const json = await res.json().catch(() => ({}));
      throw new Error(json.message || "Failed to delete news");
    }
  },

  getPublished: async (filters?: NewsFilter): Promise<{ data: NewsItem[]; total: number; page: number; pages: number }> => {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== "") params.set(k, String(v));
      });
    }
    const res = await fetch(`${BASE_URL}/news?${params.toString()}`);
    if (!res.ok) throw new Error("Failed to fetch news");
    const json = await res.json();
    return {
      data: json.data || [],
      total: json.pagination?.total ?? 0,
      page: json.pagination?.page ?? 1,
      pages: json.pagination?.pages ?? 1,
    };
  },
};

