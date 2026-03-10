const { supabaseAdmin } = require('../config/db.config');

const News = {
  // Create news
  create: async function (data) {
    const slug =
      data.slug ||
      `${data.title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim()}-${Date.now()}`;

    const insertData = {
      ...data,
      slug,
      createdat: new Date(),
      updatedat: new Date(),
    };

    const { data: row, error } = await supabaseAdmin
      .from('news')
      .insert([insertData])
      .select()
      .single();

    if (error) {
      console.error('Error creating news:', error);
      throw new Error(`Failed to create news: ${error.message}`);
    }
    return row;
  },

  // Update news
  update: async function (id, updates) {
    const { data, error } = await supabaseAdmin
      .from('news')
      .update({ ...updates, updatedat: new Date() })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating news:', error);
      throw new Error(`Failed to update news: ${error.message}`);
    }
    return data;
  },

  delete: async function (id) {
    const { error } = await supabaseAdmin.from('news').delete().eq('id', id);
    if (error) {
      console.error('Error deleting news:', error);
      throw new Error(`Failed to delete news: ${error.message}`);
    }
    return true;
  },

  findById: async function (id) {
    const { data, error } = await supabaseAdmin.from('news').select('*').eq('id', id).single();
    if (error) {
      console.error('Error finding news by id:', error);
      return null;
    }
    return data;
  },

  findBySlug: async function (slug) {
    const { data, error } = await supabaseAdmin
      .from('news')
      .select('*')
      .eq('slug', slug)
      .single();
    if (error) {
      console.error('Error finding news by slug:', error);
      return null;
    }
    return data;
  },

  // Public list
  findPublished: async function ({ limit = 10, offset = 0 } = {}) {
    const { data, error } = await supabaseAdmin
      .from('news')
      .select('*')
      .eq('status', 'published')
      .order('published_at', { ascending: false, nullsFirst: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Error listing published news:', error);
      return [];
    }
    return data || [];
  },

  // Admin list with filters & pagination
  findAll: async function ({ status, search, limit = 20, offset = 0 } = {}) {
    let query = supabaseAdmin.from('news').select('*', { count: 'exact' }).order('createdat', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    if (search) {
      query = query.ilike('title', `%${search}%`);
    }

    const { data, error, count } = await query.range(offset, offset + limit - 1);

    if (error) {
      console.error('Error listing news:', error);
      return { data: [], total: 0 };
    }
    return { data: data || [], total: count ?? 0 };
  },
};

module.exports = News;

