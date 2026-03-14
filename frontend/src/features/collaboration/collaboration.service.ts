import { authorizedFetch } from '@/lib/authorizedFetch';

export const collaborationService = {
  // Get all collaborations for current agent (agent POV: properties I'm selling for others)
  getMyCollaborations: async (status?: 'active' | 'inactive' | 'completed') => {
    const params = new URLSearchParams();
    if (status) {
      params.append('status', status);
    }
    
    const endpoint = status 
      ? `/collaborations/my?${params.toString()}`
      : '/collaborations/my';
    
    const response = await authorizedFetch(endpoint, {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch collaborations: ${response.statusText}`);
    }

    const data = await response.json();
    return data.data || [];
  },

  // Get properties owned by current user with collaborations (property owner POV: my properties being sold)
  getMyPropertiesWithCollaborations: async (status?: 'active' | 'inactive' | 'completed') => {
    const params = new URLSearchParams();
    if (status) {
      params.append('status', status);
    }
    
    const endpoint = status 
      ? `/collaborations/my-properties?${params.toString()}`
      : '/collaborations/my-properties';
    
    const response = await authorizedFetch(endpoint, {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch properties with collaborations: ${response.statusText}`);
    }

    const data = await response.json();
    return data.data || [];
  },

  // Get collaboration details
  getCollaborationDetails: async (collaborationId: string) => {
    const response = await authorizedFetch(`/collaborations/${collaborationId}`, {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch collaboration: ${response.statusText}`);
    }

    const data = await response.json();
    return data.data;
  },

  // Update collaboration status
  updateStatus: async (collaborationId: string, status: 'active' | 'inactive' | 'completed') => {
    const response = await authorizedFetch(`/collaborations/${collaborationId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });

    if (!response.ok) {
      throw new Error(`Failed to update collaboration: ${response.statusText}`);
    }

    const data = await response.json();
    return data.data;
  },

  // End (delete) a collaboration
  endCollaboration: async (collaborationId: string) => {
    const response = await authorizedFetch(`/collaborations/${collaborationId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error(`Failed to end collaboration: ${response.statusText}`);
    }

    const data = await response.json();
    return data.data;
  },

  // Accept property for collaboration (nhận bán)
  acceptProperty: async (propertyId: string) => {
    const response = await authorizedFetch('/collaborations/accept', {
      method: 'POST',
      body: JSON.stringify({ propertyId }),
    });

    if (!response.ok) {
      throw new Error(`Failed to accept property: ${response.statusText}`);
    }

    const data = await response.json();
    return data.data;
  },

  // Mark collaboration as sold (đã bán)
  markAsSold: async (collaborationId: string) => {
    const response = await authorizedFetch(`/collaborations/${collaborationId}/mark-as-sold`, {
      method: 'POST',
    });

    if (!response.ok) {
      throw new Error(`Failed to mark as sold: ${response.statusText}`);
    }

    const data = await response.json();
    return data.data;
  },

  // Confirm sold (property owner confirms)
  confirmSold: async (collaborationId: string) => {
    const response = await authorizedFetch(`/collaborations/${collaborationId}/confirm-sold`, {
      method: 'POST',
    });

    if (!response.ok) {
      throw new Error(`Failed to confirm sold: ${response.statusText}`);
    }

    const data = await response.json();
    return data.data;
  },

  // Cancel collaboration (bỏ nhận bán)
  cancelCollaboration: async (collaborationId: string) => {
    const response = await authorizedFetch(`/collaborations/${collaborationId}/cancel`, {
      method: 'POST',
    });

    if (!response.ok) {
      throw new Error(`Failed to cancel collaboration: ${response.statusText}`);
    }

    const data = await response.json();
    return data.data;
  },

  // Get collaborators for a property (admin only)
  getPropertyCollaborators: async (propertyId: string) => {
    const response = await authorizedFetch(`/collaborations/property/${propertyId}`, {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch property collaborators: ${response.statusText}`);
    }

    const data = await response.json();
    return data.data || [];
  },
};
