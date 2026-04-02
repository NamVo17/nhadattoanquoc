const { supabaseAdmin } = require('../config/db.config');

const Payment = {
  // Create a new payment record
  create: async function (paymentData) {
    const { data, error } = await supabaseAdmin
      .from('payments')
      .insert([
        {
          ...paymentData,
          created_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (error) throw new Error(`Failed to create payment: ${error.message}`);
    return data;
  },

  // Find payment by ID
  getById: async function (id) {
    const { data, error } = await supabaseAdmin
      .from('payments')
      .select(
        'id, user_id, property_id, amount, method, status, order_id, transaction_id, request_id, package_type, signature, package_expires_at, created_at, updated_at, completed_at, property:properties(id, title, slug, price, agentid), user:users!user_id(id, full_name, email)'
      )
      .eq('id', id)
      .single();

    if (error) return null;
    return data;
  },

  // Find payment by order ID
  getByOrderId: async function (orderId) {
    const { data, error } = await supabaseAdmin
      .from('payments')
      .select(
        'id, user_id, property_id, amount, method, status, order_id, transaction_id, request_id, package_type, signature, package_expires_at, created_at, updated_at, completed_at'
      )
      .eq('order_id', orderId)
      .single();

    if (error) return null;
    return data;
  },

  // Find payment by transaction ID
  getByTransactionId: async function (transactionId) {
    const { data, error } = await supabaseAdmin
      .from('payments')
      .select(
        'id, user_id, property_id, amount, method, status, order_id, transaction_id, request_id, package_type, signature, package_expires_at, created_at, updated_at, completed_at'
      )
      .eq('transaction_id', transactionId)
      .single();

    if (error) return null;
    return data;
  },

  // Get all payments (admin), with optional filters
  getAll: async function (filters = {}, limit = 50, offset = 0) {
    let query = supabaseAdmin
      .from('payments')
      .select(
        'id, user_id, property_id, amount, method, status, order_id, transaction_id, request_id, package_type, created_at, updated_at, completed_at, property:properties(id, title, slug, price, city, district), user:users!user_id(id, full_name, email, phone)',
        { count: 'exact' }
      )
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (filters.status) query = query.eq('status', filters.status);
    if (filters.method) query = query.eq('method', filters.method);
    if (filters.package_type) query = query.eq('package_type', filters.package_type);

    const { data, error, count } = await query;
    if (error) throw new Error(`Failed to fetch payments: ${error.message}`);
    return { data: data || [], total: count ?? 0 };
  },

  // Get payments for a specific user
  getByUser: async function (userId) {
    const { data, error } = await supabaseAdmin
      .from('payments')
      .select(
        'id, user_id, property_id, amount, method, status, order_id, transaction_id, package_type, created_at, updated_at, completed_at, property:properties(id, title, slug, price)'
      )
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw new Error(`Failed to fetch user payments: ${error.message}`);
    return data || [];
  },

  // Update payment
  update: async function (id, updateData) {
    const { data, error } = await supabaseAdmin
      .from('payments')
      .update({
        ...updateData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(`Failed to update payment: ${error.message}`);
    return data;
  },

  // Update payment status
  updateStatus: async function (id, status, additionalData = {}) {
    const updateData = {
      status,
      ...additionalData,
      updated_at: new Date().toISOString(),
    };

    if (status === 'success') {
      updateData.completed_at = new Date().toISOString();
    }

    const { data, error } = await supabaseAdmin
      .from('payments')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(`Failed to update payment status: ${error.message}`);
    return data;
  },
};

module.exports = Payment;
