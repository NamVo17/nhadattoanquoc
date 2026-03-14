export interface Collaboration {
  id: string;
  property_id: string;
  agent_id: string;
  status: 'active' | 'inactive' | 'completed' | 'pending-confirmation' | 'sold';
  started_at: string;
  ended_at?: string | null;
  commission_rate: number;
  created_at: string;
  updated_at: string;
  property?: Property;
  agent?: Agent;
}

export interface Property {
  id: string;
  title: string;
  slug: string;
  price: number;
  area: number;
  address: string;
  district: string;
  city: string;
  type: string;
  images?: string[];
  isapproved?: boolean;
}

export interface Agent {
  id: string;
  full_name: string;
  email: string;
  phone: string;
}
