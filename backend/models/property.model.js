const { supabaseAdmin } = require('../config/db.config');

// Property model using Supabase client directly
const Property = {
  // Create property
  create: async function(propertyData) {
    try {
      const slug = propertyData.slug || this.generateSlug.call({ title: propertyData.title });

      const { data, error } = await supabaseAdmin
        .from('properties')
        .insert([{
          ...propertyData,
          slug,
          createdat: new Date(),
          updated_at: new Date(),
        }])
        .select()
        .single();

      if (error) {
        console.error('Error creating property:', error);
        throw new Error(`Failed to create property: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Error in Property.create:', error);
      throw error;
    }
  },

  // Update property
  update: async function(id, updateData) {
    try {
      const { data, error } = await supabaseAdmin
        .from('properties')
        .update({
          ...updateData,
          updated_at: new Date(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating property:', error);
        throw new Error(`Failed to update property: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Error in Property.update:', error);
      throw error;
    }
  },

  // Delete property (soft delete)
  delete: async function(id) {
    try {
      const { error } = await supabaseAdmin
        .from('properties')
        .update({
          isactive: false,
          updated_at: new Date(),
        })
        .eq('id', id);

      if (error) {
        console.error('Error deleting property:', error);
        throw new Error(`Failed to delete property: ${error.message}`);
      }

      return true;
    } catch (error) {
      console.error('Error in Property.delete:', error);
      throw error;
    }
  },

  // Find property by slug
  findBySlug: async function(slug) {
    try {
      const { data, error } = await supabaseAdmin
        .from('properties')
        .select('*')
        .eq('slug', slug)
        .eq('isactive', true)
        .single();

      if (error) {
        console.error('Error finding property by slug:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in findBySlug:', error);
      return null;
    }
  },

  // Find properties by agent
  findByAgent: async function(agentId, filters = {}) {
    try {
      let query = supabaseAdmin
        .from('properties')
        .select('*')
        .eq('agentid', agentId)
        .eq('isactive', true)
        .order('createdat', { ascending: false });

      if (filters.status) {
        query = query.eq('status', filters.status);
      }

      if (filters.type) {
        query = query.eq('type', filters.type);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error finding properties by agent:', error);
        return [];
      }

      return data;
    } catch (error) {
      console.error('Error in findByAgent:', error);
      return [];
    }
  },

  // Find available properties for agent to accept (NOT owned by agent and NOT already collaborated)
  findAvailable: async function(agentId, filters = {}) {
    try {
      // First, get all active collaborations for this agent
      const { data: collaborations, error: collabError } = await supabaseAdmin
        .from('collaborations')
        .select('property_id')
        .eq('agent_id', agentId)
        .eq('status', 'active');

      if (collabError) {
        console.error('Error fetching agent collaborations:', collabError);
        throw collabError;
      }

      const collaboratedPropertyIds = collaborations?.map(c => c.property_id) || [];

      // Get properties not owned by this agent and not already collaborated
      let query = supabaseAdmin
        .from('properties')
        .select('*')
        .neq('agentid', agentId) // NOT owned by current agent
        .eq('isactive', true)
        .eq('status', 'for-sale')
        .order('createdat', { ascending: false });

      // Exclude properties the agent is already collaborating on
      if (collaboratedPropertyIds.length > 0) {
        query = query.not('id', 'in', `(${collaboratedPropertyIds.join(',')})`);
      }

      if (filters.type) {
        query = query.eq('type', filters.type);
      }

      if (filters.city) {
        query = query.ilike('city', `%${filters.city}%`);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error finding available properties:', error);
        return [];
      }

      return data;
    } catch (error) {
      console.error('Error in findAvailable:', error);
      return [];
    }
  },

  // Find approved properties (public). Returns { data, total }.
  // Excludes properties with active collaborations (status='for-sale' only shows available properties)
  findApproved: async function(filters = {}, limit = 20, offset = 0) {
    try {
      let query = supabaseAdmin
        .from('properties')
        .select('*', { count: 'exact' })
        .eq('isactive', true)
        .eq('isapproved', true)
        .order('createdat', { ascending: false });

      if (filters.search) {
        query = query.ilike('title', `%${filters.search}%`);
      }

      if (filters.city) {
        query = query.ilike('city', `%${filters.city}%`);
      }

      if (filters.district) {
        query = query.ilike('district', `%${filters.district}%`);
      }

      if (filters.type) {
        query = query.eq('type', filters.type);
      }

      if (filters.status) {
        query = query.eq('status', filters.status);
      }

      if (filters.minPrice != null) {
        query = query.gte('price', filters.minPrice);
      }

      if (filters.maxPrice != null) {
        query = query.lte('price', filters.maxPrice);
      }

      if (filters.minArea != null) {
        query = query.gte('area', filters.minArea);
      }

      if (filters.maxArea != null) {
        query = query.lte('area', filters.maxArea);
      }

      if (filters.bedrooms != null && filters.bedrooms !== '') {
        const num = typeof filters.bedrooms === 'number' ? filters.bedrooms : parseInt(filters.bedrooms, 10);
        if (!Number.isNaN(num)) query = query.eq('bedrooms', num);
      }

      if (filters.direction) {
        query = query.ilike('direction', `%${filters.direction}%`);
      }

      const { data, error, count } = await query.range(offset, offset + limit - 1);

      if (error) {
        console.error('Error finding approved properties:', error);
        return { data: [], total: 0 };
      }

      // Get all active collaborations to exclude properties being sold
      if (data && data.length > 0) {
        const propertyIds = data.map(p => p.id);
        const { data: activeCollaborations, error: collabError } = await supabaseAdmin
          .from('collaborations')
          .select('property_id')
          .in('property_id', propertyIds)
          .eq('status', 'active');

        if (!collabError && activeCollaborations && activeCollaborations.length > 0) {
          const activePropertyIds = new Set(activeCollaborations.map(c => c.property_id));
          const filteredData = data.filter(p => !activePropertyIds.has(p.id));
          
          // Note: count from query includes active collaborations, we're filtering them out
          // So actual total is less than count
          return { 
            data: filteredData, 
            total: Math.max(0, (count ?? 0) - activeCollaborations.length) 
          };
        }
      }

      return { data: data || [], total: count ?? 0 };
    } catch (error) {
      console.error('Error in findApproved:', error);
      return { data: [], total: 0 };
    }
  },

  // Get property by ID
  getById: async function(id) {
    try {
      const { data, error } = await supabaseAdmin
        .from('properties')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // Not found
        }
        console.error('Error getting property by ID:', error);
        throw new Error(`Failed to get property: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Error in Property.getById:', error);
      throw error;
    }
  },

  // Increment view count
  incrementViewCount: async function(id) {
    try {
      const { error } = await supabaseAdmin.rpc('increment_view_count', { property_id: id });

      if (error) {
        console.error('Error incrementing view count:', error);
      }
    } catch (error) {
      console.error('Error in incrementViewCount:', error);
    }
  },

  // Generate slug helper
  generateSlug: function() {
    const baseSlug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();

    return `${baseSlug}-${Date.now()}`;
  },
};

module.exports = Property;