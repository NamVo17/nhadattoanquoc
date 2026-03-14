const { supabaseAdmin } = require('../config/db.config');

// Collaboration model for handling property sales representations
const Collaboration = {
  // Create a new collaboration (agent accepts property)
  create: async function(collaborationData) {
    try {
      const { data, error } = await supabaseAdmin
        .from('collaborations')
        .insert([{
          property_id: collaborationData.property_id,
          agent_id: collaborationData.agent_id,
          status: 'active',
          started_at: new Date(),
          commission_rate: collaborationData.commission_rate || 1.0,
          created_at: new Date(),
          updated_at: new Date(),
        }])
        .select()
        .single();

      if (error) {
        console.error('Error creating collaboration:', error);
        throw new Error(`Failed to create collaboration: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Error in Collaboration.create:', error);
      throw error;
    }
  },

  // Get all collaborations for an agent
  getByAgentId: async function(agentId, status = null) {
    try {
      let query = supabaseAdmin
        .from('collaborations')
        .select('*')
        .eq('agent_id', agentId);

      if (status) {
        query = query.eq('status', status);
      }

      const { data, error } = await query.order('started_at', { ascending: false });

      if (error) {
        console.error('Error fetching collaborations:', error);
        throw new Error(`Failed to fetch collaborations: ${error.message}`);
      }

      // Fetch related property and agent data separately
      if (data && data.length > 0) {
        const propertyIds = [...new Set(data.map(c => c.property_id))];
        const agentIds = [...new Set(data.map(c => c.agent_id))];

        // Get properties
        const { data: properties, error: propError } = await supabaseAdmin
          .from('properties')
          .select('id, title, slug, price, area, address, district, city, type, images, isapproved')
          .in('id', propertyIds);

        // Get agents
        const { data: agents, error: agentError } = await supabaseAdmin
          .from('users')
          .select('id, full_name, email, phone')
          .in('id', agentIds);

        if (!propError && !agentError && properties && agents) {
          // Build lookup maps
          const propMap = {};
          const agentMap = {};
          
          properties.forEach(p => propMap[p.id] = p);
          agents.forEach(a => agentMap[a.id] = a);

          // Enrich collaboration data
          return data.map(c => ({
            ...c,
            property: propMap[c.property_id] || null,
            agent: agentMap[c.agent_id] || null,
          }));
        }
      }

      return data;
    } catch (error) {
      console.error('Error in Collaboration.getByAgentId:', error);
      throw error;
    }
  },

  // Get all collaborations for a property
  getByPropertyId: async function(propertyId) {
    try {
      const { data, error } = await supabaseAdmin
        .from('collaborations')
        .select('*')
        .eq('property_id', propertyId)
        .eq('status', 'active');

      if (error) {
        console.error('Error fetching property collaborations:', error);
        throw new Error(`Failed to fetch collaborations for property: ${error.message}`);
      }

      // Fetch agent data separately
      if (data && data.length > 0) {
        const agentIds = [...new Set(data.map(c => c.agent_id))];
        const { data: agents, error: agentError } = await supabaseAdmin
          .from('users')
          .select('id, full_name, email, phone')
          .in('id', agentIds);

        if (!agentError && agents) {
          const agentMap = {};
          agents.forEach(a => agentMap[a.id] = a);
          return data.map(c => ({
            ...c,
            agent: agentMap[c.agent_id] || null,
          }));
        }
      }

      return data;
    } catch (error) {
      console.error('Error in Collaboration.getByPropertyId:', error);
      throw error;
    }
  },

  // Get a specific collaboration
  getById: async function(collaborationId) {
    try {
      const { data, error } = await supabaseAdmin
        .from('collaborations')
        .select('*')
        .eq('id', collaborationId)
        .single();

      if (error) {
        console.error('Error fetching collaboration:', error);
        throw new Error(`Failed to fetch collaboration: ${error.message}`);
      }

      // Fetch related property and agent data separately
      if (data) {
        const { data: property, error: propError } = await supabaseAdmin
          .from('properties')
          .select('*')
          .eq('id', data.property_id)
          .single();

        const { data: agent, error: agentError } = await supabaseAdmin
          .from('users')
          .select('id, full_name, email, phone')
          .eq('id', data.agent_id)
          .single();

        if (!propError && !agentError) {
          return {
            ...data,
            property: property || null,
            agent: agent || null,
          };
        }
      }

      return data;
    } catch (error) {
      console.error('Error in Collaboration.getById:', error);
      throw error;
    }
  },

  // Update collaboration status
  updateStatus: async function(collaborationId, status, endedAt = null) {
    try {
      const updateData = {
        status,
        updated_at: new Date(),
      };

      if (endedAt) {
        updateData.ended_at = endedAt;
      }

      const { data, error } = await supabaseAdmin
        .from('collaborations')
        .update(updateData)
        .eq('id', collaborationId)
        .select()
        .single();

      if (error) {
        console.error('Error updating collaboration status:', error);
        throw new Error(`Failed to update collaboration: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Error in Collaboration.updateStatus:', error);
      throw error;
    }
  },

  // Delete (end) a collaboration
  delete: async function(collaborationId) {
    try {
      const { data, error } = await supabaseAdmin
        .from('collaborations')
        .update({
          status: 'inactive',
          ended_at: new Date(),
          updated_at: new Date(),
        })
        .eq('id', collaborationId)
        .select()
        .single();

      if (error) {
        console.error('Error deleting collaboration:', error);
        throw new Error(`Failed to delete collaboration: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Error in Collaboration.delete:', error);
      throw error;
    }
  },

  // Get all properties owned by current user with their collaborations
  getPropertiesByOwnerId: async function(ownerId, status = null) {
    try {
      // First get all properties owned by the user
      let propertyQuery = supabaseAdmin
        .from('properties')
        .select('id')
        .eq('agentid', ownerId);

      const { data: properties, error: propError } = await propertyQuery;

      if (propError) {
        throw new Error(`Failed to fetch properties: ${propError.message}`);
      }

      if (!properties || properties.length === 0) {
        return [];
      }

      const propertyIds = properties.map(p => p.id);

      // Now get collaborations for these properties
      let collabQuery = supabaseAdmin
        .from('collaborations')
        .select('*')
        .in('property_id', propertyIds);

      if (status) {
        collabQuery = collabQuery.eq('status', status);
      }

      const { data, error } = await collabQuery.order('started_at', { ascending: false });

      if (error) {
        console.error('Error fetching collaborations for owned properties:', error);
        throw new Error(`Failed to fetch collaborations: ${error.message}`);
      }

      // Fetch related data separately
      if (data && data.length > 0) {
        const agentIds = [...new Set(data.map(c => c.agent_id))];
        const propIdSet = [...new Set(data.map(c => c.property_id))];

        // Get all property data
        const { data: propData, error: propDataError } = await supabaseAdmin
          .from('properties')
          .select('id, title, slug, price, area, address, district, city, type, images, isapproved')
          .in('id', propIdSet);

        // Get agent data
        const { data: agents, error: agentError } = await supabaseAdmin
          .from('users')
          .select('id, full_name, email, phone')
          .in('id', agentIds);

        if (!propDataError && !agentError && propData && agents) {
          const propMap = {};
          const agentMap = {};
          
          propData.forEach(p => propMap[p.id] = p);
          agents.forEach(a => agentMap[a.id] = a);

          return data.map(c => ({
            ...c,
            property: propMap[c.property_id] || null,
            agent: agentMap[c.agent_id] || null,
          }));
        }
      }

      return data;
    } catch (error) {
      console.error('Error in Collaboration.getPropertiesByOwnerId:', error);
      throw error;
    }
  },

  // Check if agent already accepted this property
  exists: async function(propertyId, agentId) {
    try {
      const { data, error } = await supabaseAdmin
        .from('collaborations')
        .select('id')
        .eq('property_id', propertyId)
        .eq('agent_id', agentId)
        .eq('status', 'active')
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      return !!data;
    } catch (error) {
      console.error('Error in Collaboration.exists:', error);
      return false;
    }
  },

  // Mark collaboration as sold (selling agent marks as đã bán)
  markAsSold: async function(collaborationId, agentId) {
    try {
      const { data, error } = await supabaseAdmin
        .from('collaborations')
        .update({
          status: 'pending-confirmation',
          marked_as_sold_at: new Date(),
          marked_as_sold_by: agentId,
          updated_at: new Date(),
        })
        .eq('id', collaborationId)
        .select()
        .single();

      if (error) {
        console.error('Error marking as sold:', error);
        throw new Error(`Failed to mark as sold: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Error in Collaboration.markAsSold:', error);
      throw error;
    }
  },

  // Confirm sold (property owner confirms the sale)
  confirmSold: async function(collaborationId, agentId) {
    try {
      const { data, error } = await supabaseAdmin
        .from('collaborations')
        .update({
          status: 'sold',
          confirmed_as_sold_at: new Date(),
          confirmed_as_sold_by: agentId,
          updated_at: new Date(),
        })
        .eq('id', collaborationId)
        .select()
        .single();

      if (error) {
        console.error('Error confirming sold:', error);
        throw new Error(`Failed to confirm as sold: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Error in Collaboration.confirmSold:', error);
      throw error;
    }
  },

  // Cancel collaboration (either party cancels)
  cancel: async function(collaborationId) {
    try {
      const { data, error } = await supabaseAdmin
        .from('collaborations')
        .update({
          status: 'inactive',
          ended_at: new Date(),
          updated_at: new Date(),
        })
        .eq('id', collaborationId)
        .select()
        .single();

      if (error) {
        console.error('Error canceling collaboration:', error);
        throw new Error(`Failed to cancel collaboration: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Error in Collaboration.cancel:', error);
      throw error;
    }
  },
};

module.exports = Collaboration;
