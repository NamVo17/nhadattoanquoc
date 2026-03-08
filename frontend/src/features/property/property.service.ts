import { Property, PropertyFilter } from './property.types';
import { authorizedFetch } from "@/lib/authorizedFetch";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

export const propertyService = {
  getAll: async (filters?: PropertyFilter): Promise<{ data: Property[]; pagination: { page: number; limit: number; total: number; pages: number } }> => {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([k, v]) => {
        if (v !== undefined && v !== '' && v !== null) params.set(k, String(v));
      });
    }
    const res = await fetch(`${BASE_URL}/properties/approved?${params}`);
    if (!res.ok) throw new Error('Failed to fetch properties');
    const json = await res.json();
    return {
      data: json.data || [],
      pagination: json.pagination || { page: 1, limit: 20, total: 0, pages: 1 },
    };
  },

  getBySlug: async (slug: string): Promise<Property> => {
    const res = await fetch(`${BASE_URL}/properties/${slug}`);
    if (!res.ok) throw new Error('Property not found');
    const data = await res.json();
    return data.data;
  },

  create: async (data: Partial<Property>): Promise<Property> => {
    const res = await authorizedFetch(`${BASE_URL}/properties`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const error = await res.json().catch(() => ({} as any));
      const details =
        (error?.errors && Array.isArray(error.errors) && error.errors.length
          ? error.errors.map((e: any) => e?.msg).filter(Boolean).join("; ")
          : null) ||
        error?.error ||
        error?.message;
      throw new Error(details || 'Failed to create property');
    }
    const result = await res.json();
    return result.data;
  },

  update: async (id: string, data: Partial<Property>): Promise<Property> => {
    const res = await authorizedFetch(`${BASE_URL}/properties/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update property');
    const result = await res.json();
    return result.data;
  },

  delete: async (id: string): Promise<void> => {
    const res = await authorizedFetch(`${BASE_URL}/properties/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to delete property');
  },

  getByAgent: async (agentid?: string): Promise<Property[]> => {
    const url = agentid ? `${BASE_URL}/properties/agent/${agentid}` : `${BASE_URL}/properties/agent`;
    const res = await authorizedFetch(url);
    if (!res.ok) throw new Error('Failed to fetch agent properties');
    const data = await res.json();
    return data.data || [];
  },
};
