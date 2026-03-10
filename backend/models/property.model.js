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
          updatedat: new Date(),
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
          updatedat: new Date(),
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
          updatedat: new Date(),
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

  // Find approved properties (public). Returns { data, total }.
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

      return { data: data || [], total: count ?? 0 };
    } catch (error) {
      console.error('Error in findApproved:', error);
      return { data: [], total: 0 };
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