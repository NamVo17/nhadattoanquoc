const Payment = require('../models/payment.model');
const Property = require('../models/property.model');
const { supabaseAdmin } = require('../config/db.config');

// Package durations in days
const PACKAGE_DURATION = {
  free: 3,
  vip: 7,
  diamond: 30,
};

// Package prices in VND
const PACKAGE_PRICE = {
  vip: 50000,
  diamond: 150000,
};

// Helper to compute expiry date
function getExpiresAt(packageType) {
  const days = PACKAGE_DURATION[packageType] || 3;
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString();
}

// ── Create Payment record for an already-created property ──
// Property is created first in post/page.tsx, then this is called from payment/page.tsx
exports.createPayment = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      propertyId,     // ID of the already-created property
      paymentMethod,  // 'bank' | 'momo' | 'zalopay'
      transactionRef,
      proofImageUrl,
    } = req.body;

    if (!propertyId) {
      return res.status(400).json({ success: false, message: 'Thiếu thông tin tin đăng.' });
    }

    // Verify property belongs to this user
    const property = await Property.getById(propertyId);
    if (!property) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy tin đăng.' });
    }
    if (property.agentid !== userId) {
      return res.status(403).json({ success: false, message: 'Không có quyền truy cập.' });
    }
    if (!['vip', 'diamond'].includes(property.package)) {
      return res.status(400).json({ success: false, message: 'Gói tin không yêu cầu thanh toán.' });
    }

    // Create payment record
    const paymentData = {
      property_id: propertyId,
      user_id: userId,
      package: property.package,
      amount: PACKAGE_PRICE[property.package],
      payment_method: paymentMethod || 'bank',
      transaction_ref: transactionRef || null,
      proof_image_url: proofImageUrl || null,
      status: 'pending',
    };

    const payment = await Payment.create(paymentData);

    res.status(201).json({
      success: true,
      message: 'Đã gửi xác nhận thanh toán. Vui lòng chờ admin xác nhận.',
      data: { payment },
    });
  } catch (error) {
    console.error('Error in createPayment:', error);
    res.status(500).json({ success: false, message: error.message || 'Lỗi hệ thống.' });
  }
};


// ── Confirm Payment (Admin) ──────────────────────────────
exports.confirmPayment = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Không có quyền truy cập.' });
    }

    const { id } = req.params;
    const { notes } = req.body;

    const payment = await Payment.getById(id);
    if (!payment) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy giao dịch.' });
    }
    if (payment.status === 'confirmed') {
      return res.status(400).json({ success: false, message: 'Giao dịch đã được xác nhận trước đó.' });
    }

    const expiresAt = getExpiresAt(payment.package);

    // Confirm payment record
    await Payment.update(id, {
      status: 'confirmed',
      confirmed_at: new Date().toISOString(),
      confirmed_by: req.user.id,
      notes: notes || null,
    });

    // Approve the property
    const { error: updateError } = await supabaseAdmin
      .from('properties')
      .update({
        isapproved: true,
        payment_status: 'paid',
        package_expires_at: expiresAt,
        updated_at: new Date().toISOString(),
      })
      .eq('id', payment.property_id);

    if (updateError) {
      console.error('Error updating property:', updateError);
      throw new Error(`Failed to update property: ${updateError.message}`);
    }

    console.log(`Property ${payment.property_id} approved successfully`);

    res.json({
      success: true,
      message: `Đã xác nhận thanh toán. Tin đăng sẽ hiển thị trong ${PACKAGE_DURATION[payment.package]} ngày.`,
      data: { expiresAt },
    });
  } catch (error) {
    console.error('Error in confirmPayment:', error);
    res.status(500).json({ success: false, message: error.message || 'Lỗi hệ thống.' });
  }
};

// ── Reject Payment (Admin) ───────────────────────────────
exports.rejectPayment = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Không có quyền truy cập.' });
    }

    const { id } = req.params;
    const { notes } = req.body;

    const payment = await Payment.getById(id);
    if (!payment) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy giao dịch.' });
    }

    await Payment.update(id, {
      status: 'rejected',
      confirmed_by: req.user.id,
      notes: notes || null,
    });

    // Deactivate the property
    await supabaseAdmin
      .from('properties')
      .update({
        isactive: false,
        payment_status: 'rejected',
        updated_at: new Date().toISOString(),
      })
      .eq('id', payment.property_id);

    res.json({ success: true, message: 'Đã từ chối giao dịch và ẩn tin đăng.' });
  } catch (error) {
    console.error('Error in rejectPayment:', error);
    res.status(500).json({ success: false, message: error.message || 'Lỗi hệ thống.' });
  }
};

// ── Get All Payments (Admin) ─────────────────────────────
exports.getPayments = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Không có quyền truy cập.' });
    }

    const { status, package: pkg, page = 1, limit = 50 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const { data, total } = await Payment.getAll(
      { status: status || undefined, package: pkg || undefined },
      parseInt(limit),
      offset
    );

    res.json({
      success: true,
      data,
      pagination: { page: parseInt(page), limit: parseInt(limit), total },
    });
  } catch (error) {
    console.error('Error in getPayments:', error);
    res.status(500).json({ success: false, message: error.message || 'Lỗi hệ thống.' });
  }
};

// ── Get My Payments (Agent) ──────────────────────────────
exports.getMyPayments = async (req, res) => {
  try {
    const data = await Payment.getByUser(req.user.id);
    res.json({ success: true, data });
  } catch (error) {
    console.error('Error in getMyPayments:', error);
    res.status(500).json({ success: false, message: error.message || 'Lỗi hệ thống.' });
  }
};

// ── Upload Payment Proof Image ───────────────────────────
exports.uploadProof = async (req, res) => {
  try {
    const { id } = req.params;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ success: false, message: 'Không có file được tải lên.' });
    }

    const filePath = `payment-proofs/${id}-${Date.now()}.${(file.mimetype && file.mimetype.split('/')[1]) || 'jpg'}`;

    const { error: uploadError } = await supabaseAdmin.storage
      .from('property-images')
      .upload(filePath, file.buffer, { contentType: file.mimetype, upsert: true });

    if (uploadError) {
      return res.status(500).json({ success: false, message: 'Lỗi tải ảnh lên.' });
    }

    const { data: urlData } = supabaseAdmin.storage.from('property-images').getPublicUrl(filePath);
    const proofImageUrl = urlData.publicUrl;

    await Payment.update(id, { proof_image_url: proofImageUrl });

    res.json({ success: true, data: { proofImageUrl } });
  } catch (error) {
    console.error('Error in uploadProof:', error);
    res.status(500).json({ success: false, message: error.message || 'Lỗi hệ thống.' });
  }
};
