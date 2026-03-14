export interface Property {
  id: string;
  slug: string;
  title: string;
  description: string;
  price: number;
  area: number;
  address: string;
  district: string;
  city: string;
  type: 'apartment' | 'house' | 'villa' | 'land' | 'commercial';
  status: 'for-sale' | 'for-rent' | 'sold';
  images: string[];
  bedrooms?: number;
  direction?: string;
  bathrooms?: number;
  floors?: number;
  mapurl?: string;
  agentid: string;
  createdAt?: string;
  updatedAt?: string;
  createdat?: string;
  updatedat?: string;
  projectname?: string;
  videourl?: string;
  commission?: number;
  package?: string;
  isapproved?: boolean;
  payment_status?: string;
}

export interface PropertyFilter {
  search?: string;
  page?: number;
  limit?: number;
  city?: string;
  district?: string;
  type?: Property['type'];
  minPrice?: number;
  maxPrice?: number;
  minArea?: number;
  maxArea?: number;
  bedrooms?: number;
  direction?: string;
  status?: Property['status'];
}
