const { supabaseAdmin } = require('../config/db.config');

const Payment = {
  // Create a new payment record
  create: async function (paymentData) {
    const { data, error } = await supabaseAdmin
      .from('payments')
      .insert([{ ...paymentData, created_at: new Date() }])
      .select()
      .single();

    if (error) throw new Error(`Failed to create payment: ${error.message}`);
    return data;
  },

  // Find payment by ID
  getById: async function (id) {
    const { data, error } = await supabaseAdmin
      .from('payments')
      .select('id, property_id, user_id, package, amount, payment_method, transaction_ref, proof_image_url, status, created_at, confirmed_at, confirmed_by, notes, property:properties(id, title, slug, package, agentid), user:users!user_id(id, full_name, email)')
      .eq('id', id)
      .single();

    if (error) return null;
    return data;
  },

  // Get all payments (admin), with optional filters
  getAll: async function (filters = {}, limit = 50, offset = 0) {
    let query = supabaseAdmin
      .from('payments')
      .select(
        'id, property_id, user_id, package, amount, payment_method, transaction_ref, proof_image_url, status, created_at, confirmed_at, confirmed_by, notes, property:properties(id, title, slug, package, type, city, district), user:users!user_id(id, full_name, email, phone)',
        { count: 'exact' }
      )
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (filters.status) query = query.eq('status', filters.status);
    if (filters.package) query = query.eq('package', filters.package);

    const { data, error, count } = await query;
    if (error) throw new Error(`Failed to fetch payments: ${error.message}`);
    return { data: data || [], total: count ?? 0 };
  },

  // Get payments for a specific user
  getByUser: async function (userId) {
    const { data, error } = await supabaseAdmin
      .from('payments')
      .select('id, property_id, user_id, package, amount, payment_method, transaction_ref, proof_image_url, status, created_at, property:properties(id, title, slug, package)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw new Error(`Failed to fetch user payments: ${error.message}`);
    return data || [];
  },

  // Update payment (used for confirm/reject)
  update: async function (id, updateData) {
    const { data, error } = await supabaseAdmin
      .from('payments')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(`Failed to update payment: ${error.message}`);
    return data;
  },
};

module.exports = Payment;
