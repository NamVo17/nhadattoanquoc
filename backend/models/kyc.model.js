'use strict';

const { supabaseAdmin } = require('../config/db.config');
const { ApiError } = require('../middleware/error.middleware');

const KYCModel = {
  /**
   * Create or update KYC verification
   */
  upsert: async (userId, kycData) => {
    const {
      idType,
      idNumber,
      idImageFront,
      idImageBack,
      fullName,
      dateOfBirth,
      gender,
      address,
      city,
      district,
      ward,
    } = kycData;

    const { data, error } = await supabaseAdmin
      .from('kyc_verifications')
      .upsert(
        {
          user_id: userId,
          id_type: idType,
          id_number: idNumber,
          id_image_front: idImageFront,
          id_image_back: idImageBack,
          full_name: fullName,
          date_of_birth: dateOfBirth,
          gender,
          address,
          city,
          district,
          ward,
          status: 'pending',
          submitted_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id' }
      )
      .select()
      .single();

    if (error) throw new ApiError('Không thể lưu thông tin KYC.', 400);
    return data;
  },

  /**
   * Get KYC verification for a user
   */
  getByUserId: async (userId) => {
    const { data, error } = await supabaseAdmin
      .from('kyc_verifications')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new ApiError('Không tìm thấy thông tin KYC.', 404);
    }
    return data || null;
  },

  /**
   * Get all pending KYC verifications (for admin)
   */
  getPendingVerifications: async (limit = 50, offset = 0) => {
    const { data, error, count } = await supabaseAdmin
      .from('kyc_verifications')
      .select('*', { count: 'exact' })
      .eq('status', 'pending')
      .order('submitted_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw new ApiError('Không thể lấy danh sách KYC.', 400);
    
    // Fetch user details for each KYC record
    if (data && data.length > 0) {
      const userIds = data.map(kyc => kyc.user_id);
      const { data: users } = await supabaseAdmin
        .from('users')
        .select('id, full_name, email, phone, avatar_url')
        .in('id', userIds);
      
      // Map users to KYC records
      const userMap = {};
      if (users) {
        users.forEach(user => {
          userMap[user.id] = user;
        });
      }
      
      const enrichedData = data.map(kyc => ({
        ...kyc,
        user: userMap[kyc.user_id] || null,
      }));
      
      return { data: enrichedData, count };
    }
    
    return { data, count };
  },

  /**
   * Get KYC verification by ID (for admin review)
   */
  getById: async (kycId) => {
    const { data, error } = await supabaseAdmin
      .from('kyc_verifications')
      .select(
        `
        id,
        user_id,
        id_type,
        id_number,
        id_image_front,
        id_image_back,
        full_name,
        date_of_birth,
        gender,
        address,
        city,
        district,
        ward,
        status,
        verification_score,
        rejection_reason,
        submitted_at,
        verified_at,
        reviewed_by,
        users(id, full_name, email, phone, avatar_url, role)
        `
      )
      .eq('id', kycId)
      .single();

    if (error) throw new ApiError('Không tìm thấy yêu cầu KYC.', 404);
    return data;
  },

  /**
   * Approve KYC verification
   */
  approve: async (kycId, adminId, verificationScore = 100) => {
    const { data, error } = await supabaseAdmin
      .from('kyc_verifications')
      .update({
        status: 'verified',
        verification_score: verificationScore,
        verified_at: new Date().toISOString(),
        reviewed_by: adminId,
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', kycId)
      .select()
      .single();

    if (error) throw new ApiError('Không thể phê duyệt KYC.', 400);

    // Update user's KYC status
    await supabaseAdmin
      .from('users')
      .update({ kyc_status: 'verified' })
      .eq('id', data.user_id);

    return data;
  },

  /**
   * Reject KYC verification
   */
  reject: async (kycId, adminId, reason) => {
    const { data, error } = await supabaseAdmin
      .from('kyc_verifications')
      .update({
        status: 'rejected',
        rejection_reason: reason,
        reviewed_by: adminId,
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', kycId)
      .select()
      .single();

    if (error) throw new ApiError('Không thể từ chối KYC.', 400);

    // Update user's KYC status
    await supabaseAdmin
      .from('users')
      .update({ kyc_status: 'rejected' })
      .eq('id', data.user_id);

    return data;
  },

  /**
   * Get KYC statistics (for admin dashboard)
   */
  getStatistics: async () => {
    const { data, error } = await supabaseAdmin
      .from('kyc_verifications')
      .select('status');

    if (error) throw new ApiError('Không thể lấy thống kê KYC.', 400);

    const stats = {
      total: data.length,
      verified: data.filter((r) => r.status === 'verified').length,
      pending: data.filter((r) => r.status === 'pending').length,
      rejected: data.filter((r) => r.status === 'rejected').length,
      unverified: data.filter((r) => r.status === 'unverified').length,
    };

    return stats;
  },
};

module.exports = KYCModel;
