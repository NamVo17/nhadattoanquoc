const Payment = require('../models/payment.model');
const Property = require('../models/property.model');
const MoMoService = require('../services/momo.service');
const VNPayService = require('../services/vnpay.service');
const { supabaseAdmin } = require('../config/db.config');
const { env } = require('../config/env.config');
const crypto = require('crypto');
const NotificationModel = require('../models/notification.model');

// Package prices in VND
const PACKAGE_PRICE = {
  vip: 50000,
  diamond: 150000,
};

// Package durations in days
const PACKAGE_DURATION = {
  vip: 7,
  diamond: 30,
};

// Helper: Generate unique order ID
function generateOrderId() {
  return `ORD${Date.now()}${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
}

// Helper: Calculate package expiry date
function getPackageExpiresAt(packageType) {
  const days = PACKAGE_DURATION[packageType] || 7;
  const expiryDate = new Date();
  expiryDate.setDate(expiryDate.getDate() + days);
  return expiryDate.toISOString();
}

// ══════════════════════════════════════════════════════════════════════════════
// ── MOMO PAYMENT ENDPOINTS ─────────────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════════

/**
 * POST /api/payments/momo/create
 * Create MoMo payment request
 */
exports.createMoMoPayment = async (req, res) => {
  try {
    const { propertyId, packageType } = req.body;
    const userId = req.user.id;

    // Validate input
    if (!propertyId || !packageType) {
      return res.status(400).json({
        success: false,
        message: 'Thiếu thông tin bao gồm propertyId và packageType',
      });
    }

    if (!['vip', 'diamond'].includes(packageType)) {
      return res.status(400).json({
        success: false,
        message: 'Gói tin không hợp lệ',
      });
    }

    // Verify property exists and belongs to user
    const property = await Property.getById(propertyId);
    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy tin đăng',
      });
    }

    if (property.agentid !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền truy cập tin đăng này',
      });
    }

    // Check if property already has active VIP/Diamond package
    if (property.package === packageType && property.package_expires_at) {
      const expiryDate = new Date(property.package_expires_at);
      if (expiryDate > new Date()) {
        return res.status(400).json({
          success: false,
          message: 'Tin đăng này đã có gói VIP/Diamond đang hoạt động',
        });
      }
    }

    // Generate order ID
    const orderId = generateOrderId();
    const amount = PACKAGE_PRICE[packageType];
    const packageExpiresAt = getPackageExpiresAt(packageType);

    // Create payment record
    const paymentData = {
      user_id: userId,
      property_id: propertyId,
      amount,
      method: 'momo',
      status: 'pending',
      order_id: orderId,
      package_type: packageType,
      package_expires_at: packageExpiresAt,
    };

    const payment = await Payment.create(paymentData);

    // Initialize MoMo service
    const momoService = new MoMoService();
    const requestId = momoService.generateRequestId();
    const orderInfo = `Thanh toán gói ${packageType === 'vip' ? 'VIP' : 'Diamond'} - ${property.title}`;

    // Create payment request
    const momoPaymentData = await momoService.createPaymentRequest(
      orderId,
      amount,
      orderInfo,
      requestId
    );

    // Get payment URL
    const paymentUrl = momoService.getPaymentUrl(momoPaymentData);

    // Update payment with request ID
    await Payment.update(payment.id, {
      request_id: requestId,
      payment_data: momoPaymentData,
    });

    res.json({
      success: true,
      message: 'Đã tạo yêu cầu thanh toán MoMo',
      data: {
        paymentId: payment.id,
        orderId,
        amount,
        paymentUrl,
        redirectUrl: paymentUrl,
      },
    });
  } catch (error) {
    console.error('Error creating MoMo payment:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Lỗi khi tạo yêu cầu thanh toán MoMo',
    });
  }
};

/**
 * GET /api/payments/momo/return
 * MoMo payment return callback
 */
exports.moMoReturn = async (req, res) => {
  try {
    const { orderId, resultCode, transId, message } = req.query;

    // Find payment by order ID
    const payment = await Payment.getByOrderId(orderId);
    if (!payment) {
      console.error('[MoMo] Payment not found for orderId:', orderId);
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy thông tin giao dịch',
      });
    }

    // Log payment data for debugging
    console.log('[MoMo] Payment retrieved:', {
      id: payment.id,
      property_id: payment.property_id,
      package_type: payment.package_type,
      package_expires_at: payment.package_expires_at,
      status: payment.status,
      method: payment.method,
    });

    // Update payment status based on result code
    if (resultCode === '0') {
      // Payment successful
      await Payment.updateStatus(payment.id, 'success', {
        transaction_id: transId,
      });

      // Update property package with comprehensive error handling and verification
      try {
        console.log(`[MoMo] Starting property update:`, {
          propertyId: payment.property_id,
          packageType: payment.package_type,
          packageExpiresAt: payment.package_expires_at,
          paymentId: payment.id,
        });

        // Update property and get the result
        const { data: updateResult, error: updateError, count } = await supabaseAdmin
          .from('properties')
          .update({
            package: payment.package_type,
            package_expires_at: payment.package_expires_at,
            payment_status: 'đang hiển thị',
            updated_at: new Date().toISOString(),
          })
          .eq('id', payment.property_id)
          .select('id, package, package_expires_at, payment_status');

        if (updateError) {
          console.error('[MoMo] ❌ Error updating property:', updateError);
          throw new Error(`Failed to update property: ${updateError.message}`);
        }

        if (updateResult && updateResult.length > 0) {
          const updated = updateResult[0];
          console.log(`[MoMo] ✅ Property ${payment.property_id} successfully updated:`, {
            package: updated.package,
            package_expires_at: updated.package_expires_at,
            payment_status: updated.payment_status,
            updatedAt: updated.updated_at,
          });
        } else {
          console.warn(`[MoMo] ⚠️ Update returned no results for property ${payment.property_id}`);
        }
      } catch (updateErr) {
        console.error('[MoMo] ❌ Error in property update:', updateErr.message);
        // Continue with redirect even if property update fails
      }

      // Notify user about successful MoMo payment (fire before redirect)
      try {
        const { data: propData } = await supabaseAdmin
          .from('properties').select('title').eq('id', payment.property_id).single();
        const pkgLabel = payment.package_type === 'vip' ? 'VIP' : 'Kim cương';
        const days = payment.package_type === 'vip' ? 7 : 30;
        await NotificationModel.create(
          payment.user_id, 'payment_success',
          `Thanh toán gói ${pkgLabel} thành công`,
          `Tin "${propData?.title || 'Bất động sản'}" đã được kích hoạt gói ${pkgLabel} trong ${days} ngày.`,
          { propertyId: payment.property_id, orderId, amount: payment.amount }
        );
      } catch (_) {}

      // Redirect to success page with message
      const successUrl = new URL('/payment/success', env.client.url);
      successUrl.searchParams.append('orderId', orderId);
      successUrl.searchParams.append('transId', transId);
      successUrl.searchParams.append('message', 'Thanh toán thành công');
      return res.redirect(successUrl.toString());
    } else {
      // Payment failed
      await Payment.updateStatus(payment.id, 'failed', {
        transaction_id: transId,
      });

      const failedUrl = new URL('/payment/failed', env.client.url);
      failedUrl.searchParams.append('orderId', orderId);
      failedUrl.searchParams.append('message', message || 'Thanh toán thất bại');
      return res.redirect(failedUrl.toString());
    }
  } catch (error) {
    console.error('Error in MoMo return:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Lỗi xử lý kết quả thanh toán MoMo',
    });
  }
};

/**
 * POST /api/payments/momo/ipn
 * MoMo webhook for payment confirmation
 */
exports.moMoIPN = async (req, res) => {
  try {
    const { orderId, transId, resultCode, message, signature } = req.body;

    // Find payment
    const payment = await Payment.getByOrderId(orderId);
    if (!payment) {
      console.error('[MoMo IPN] Payment not found for orderId:', orderId);
      return res.json({
        resultCode: 1,
        message: 'Invalid order',
      });
    }

    // Log payment data for debugging
    console.log('[MoMo IPN] Payment retrieved:', {
      id: payment.id,
      property_id: payment.property_id,
      package_type: payment.package_type,
      package_expires_at: payment.package_expires_at,
      status: payment.status,
      method: payment.method,
    });

    // Verify signature
    const momoService = new MoMoService();
    const ipnData = req.body;

    if (!momoService.verifyIPNSignature(ipnData, signature)) {
      console.warn('Invalid MoMo IPN signature');
      return res.json({
        resultCode: 1,
        message: 'Invalid signature',
      });
    }

    // Process payment based on result code
    if (resultCode === '0') {
      // Payment successful
      if (payment.status !== 'success') {
        await Payment.updateStatus(payment.id, 'success', {
          transaction_id: transId,
        });

        // Update property with comprehensive error handling and verification
        try {
          console.log(`[MoMo IPN] Starting property update:`, {
            propertyId: payment.property_id,
            packageType: payment.package_type,
            packageExpiresAt: payment.package_expires_at,
            paymentId: payment.id,
          });

          // Update property and get the result
          const { data: updateResult, error: updateError } = await supabaseAdmin
            .from('properties')
            .update({
              package: payment.package_type,
              package_expires_at: payment.package_expires_at,
              payment_status: 'đang hiển thị',
              updated_at: new Date().toISOString(),
            })
            .eq('id', payment.property_id)
            .select('id, package, package_expires_at, payment_status');

          if (updateError) {
            console.error('[MoMo IPN] ❌ Error updating property:', updateError);
            throw new Error(`Failed to update property: ${updateError.message}`);
          }

          if (updateResult && updateResult.length > 0) {
            const updated = updateResult[0];
            console.log(`[MoMo IPN] ✅ Property ${payment.property_id} successfully updated:`, {
              package: updated.package,
              package_expires_at: updated.package_expires_at,
              payment_status: updated.payment_status,
            });
          } else {
            console.warn(`[MoMo IPN] ⚠️ Update returned no results for property ${payment.property_id}`);
          }

          console.log(`[MoMo IPN] Payment ${orderId} confirmed and property updated`);
        } catch (updateErr) {
          console.error('[MoMo IPN] ❌ Error in property update:', updateErr.message);
          // Continue - IPN will be retried by MoMo
        }
      }
    } else {
      // Payment failed
      await Payment.updateStatus(payment.id, 'failed');
    }

    res.json({
      resultCode: 0,
      message: 'Success',
    });
  } catch (error) {
    console.error('Error processing MoMo IPN:', error);
    res.json({
      resultCode: 99,
      message: 'Server error',
    });
  }
};

// ══════════════════════════════════════════════════════════════════════════════
// ── VNPAY PAYMENT ENDPOINTS ────────────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════════

/**
 * POST /api/payments/vnpay/create
 * Create VNPay payment request
 */
exports.createVNPayPayment = async (req, res) => {
  try {
    const { propertyId, packageType } = req.body;
    const userId = req.user.id;

    // Validate input
    if (!propertyId || !packageType) {
      return res.status(400).json({
        success: false,
        message: 'Thiếu thông tin bao gồm propertyId và packageType',
      });
    }

    if (!['vip', 'diamond'].includes(packageType)) {
      return res.status(400).json({
        success: false,
        message: 'Gói tin không hợp lệ',
      });
    }

    // Verify property
    const property = await Property.getById(propertyId);
    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy tin đăng',
      });
    }

    if (property.agentid !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền truy cập tin đăng này',
      });
    }

    // Check existing package
    if (property.package === packageType && property.package_expires_at) {
      const expiryDate = new Date(property.package_expires_at);
      if (expiryDate > new Date()) {
        return res.status(400).json({
          success: false,
          message: 'Tin đăng này đã có gói VIP/Diamond đang hoạt động',
        });
      }
    }

    // Generate order ID and prepare data
    const orderId = generateOrderId();
    const amount = PACKAGE_PRICE[packageType];
    const packageExpiresAt = getPackageExpiresAt(packageType);

    // Create payment record
    const paymentData = {
      user_id: userId,
      property_id: propertyId,
      amount,
      method: 'vnpay',
      status: 'pending',
      order_id: orderId,
      package_type: packageType,
      package_expires_at: packageExpiresAt,
    };

    const payment = await Payment.create(paymentData);

    // Initialize VNPay service with environment config
    const vnpayService = new VNPayService(env.payment.vnpay);
    const orderInfo = `Thanh toán gói ${packageType === 'vip' ? 'VIP' : 'Diamond'} - ${property.title}`;
    const clientIp = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.ip;

    // Create payment URL
    const paymentUrl = vnpayService.createPaymentUrl(
      orderId,
      amount,
      orderInfo,
      Date.now().toString(),
      clientIp
    );

    // Update payment with signature
    await Payment.update(payment.id, {
      payment_data: { orderId, amount },
    });

    res.json({
      success: true,
      message: 'Đã tạo yêu cầu thanh toán VNPay',
      data: {
        paymentId: payment.id,
        orderId,
        amount,
        paymentUrl,
        redirectUrl: paymentUrl,
      },
    });
  } catch (error) {
    console.error('Error creating VNPay payment:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Lỗi khi tạo yêu cầu thanh toán VNPay',
    });
  }
};

/**
 * GET /api/payments/vnpay/return
 * VNPay payment return callback
 */
exports.vnpayReturn = async (req, res) => {
  try {
    const vnpParams = req.query;
    const transactionId = vnpParams.vnp_TransactionNo;
    const orderId = vnpParams.vnp_TxnRef;
    const resultCode = vnpParams.vnp_ResponseCode;

    // Find payment
    const payment = await Payment.getByOrderId(orderId);
    if (!payment) {
      console.error('[VNPay] Payment not found for orderId:', orderId);
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy thông tin giao dịch',
      });
    }

    // Log payment data for debugging
    console.log('[VNPay] Payment retrieved:', {
      id: payment.id,
      property_id: payment.property_id,
      package_type: payment.package_type,
      package_expires_at: payment.package_expires_at,
      status: payment.status,
      method: payment.method,
    });

    // Verify signature
    const vnpayService = new VNPayService(env.payment.vnpay);
    if (!vnpayService.verifyIPNSignature(vnpParams)) {
      console.warn('Invalid VNPay signature');
      const failedUrl = new URL('/payment/failed', env.client.url);
      failedUrl.searchParams.append('orderId', orderId);
      failedUrl.searchParams.append('message', 'Xác minh chữ ký thất bại');
      return res.redirect(failedUrl.toString());
    }

    // Process payment
    if (resultCode === '00') {
      // Payment successful
      await Payment.updateStatus(payment.id, 'success', {
        transaction_id: transactionId,
      });

      // Update property with comprehensive error handling and verification
      try {
        console.log(`[VNPay] Starting property update:`, {
          propertyId: payment.property_id,
          packageType: payment.package_type,
          packageExpiresAt: payment.package_expires_at,
          paymentId: payment.id,
        });

        // Update property and get the result
        const { data: updateResult, error: updateError } = await supabaseAdmin
          .from('properties')
          .update({
            package: payment.package_type,
            package_expires_at: payment.package_expires_at,
            payment_status: 'đang hiển thị',
            updated_at: new Date().toISOString(),
          })
          .eq('id', payment.property_id)
          .select('id, package, package_expires_at, payment_status');

        if (updateError) {
          console.error('[VNPay] ❌ Error updating property:', updateError);
          throw new Error(`Failed to update property: ${updateError.message}`);
        }

        if (updateResult && updateResult.length > 0) {
          const updated = updateResult[0];
          console.log(`[VNPay] ✅ Property ${payment.property_id} successfully updated:`, {
            package: updated.package,
            package_expires_at: updated.package_expires_at,
            payment_status: updated.payment_status,
          });
        } else {
          console.warn(`[VNPay] ⚠️ Update returned no results for property ${payment.property_id}`);
        }
      } catch (updateErr) {
        console.error('[VNPay] ❌ Error in property update:', updateErr.message);
        // Continue with redirect even if property update fails
      }

      // Notify user about successful VNPay payment (fire before redirect)
      try {
        const { data: propData } = await supabaseAdmin
          .from('properties').select('title').eq('id', payment.property_id).single();
        const pkgLabel = payment.package_type === 'vip' ? 'VIP' : 'Kim cương';
        const days = payment.package_type === 'vip' ? 7 : 30;
        await NotificationModel.create(
          payment.user_id, 'payment_success',
          `Thanh toán gói ${pkgLabel} thành công`,
          `Tin "${propData?.title || 'Bất động sản'}" đã được kích hoạt gói ${pkgLabel} trong ${days} ngày.`,
          { propertyId: payment.property_id, orderId, amount: payment.amount }
        );
      } catch (_) {}

      const successUrl = new URL('/payment/success', env.client.url);
      successUrl.searchParams.append('orderId', orderId);
      successUrl.searchParams.append('transId', transactionId);
      successUrl.searchParams.append('message', 'Thanh toán thành công');
      return res.redirect(successUrl.toString());
    } else {
      // Payment failed
      await Payment.updateStatus(payment.id, 'failed', {
        transaction_id: transactionId,
      });

      const failedUrl = new URL('/payment/failed', env.client.url);
      failedUrl.searchParams.append('orderId', orderId);
      failedUrl.searchParams.append('message', 'Thanh toán thất bại');
      return res.redirect(failedUrl.toString());
    }
  } catch (error) {
    console.error('Error in VNPay return:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Lỗi xử lý kết quả thanh toán VNPay',
    });
  }
};

/**
 * GET /api/payments/vnpay/ipn
 * VNPay webhook for payment confirmation
 */
exports.vnpayIPN = async (req, res) => {
  try {
    const vnpParams = req.query;
    const orderId = vnpParams.vnp_TxnRef;
    const transactionId = vnpParams.vnp_TransactionNo;
    const resultCode = vnpParams.vnp_ResponseCode;

    // Find payment
    const payment = await Payment.getByOrderId(orderId);
    if (!payment) {
      console.error('[VNPay IPN] Payment not found for orderId:', orderId);
      return res.json({
        RspCode: '01',
        Message: 'Invalid order',
      });
    }

    // Log payment data for debugging
    console.log('[VNPay IPN] Payment retrieved:', {
      id: payment.id,
      property_id: payment.property_id,
      package_type: payment.package_type,
      package_expires_at: payment.package_expires_at,
      status: payment.status,
      method: payment.method,
    });

    // Verify signature
    const vnpayService = new VNPayService(env.payment.vnpay);
    if (!vnpayService.verifyIPNSignature(vnpParams)) {
      console.warn('Invalid VNPay IPN signature');
      return res.json({
        RspCode: '01',
        Message: 'Invalid signature',
      });
    }

    // Process payment
    if (resultCode === '00') {
      if (payment.status !== 'success') {
        await Payment.updateStatus(payment.id, 'success', {
          transaction_id: transactionId,
        });

        // Update property with comprehensive error handling and verification
        try {
          console.log(`[VNPay IPN] Starting property update:`, {
            propertyId: payment.property_id,
            packageType: payment.package_type,
            packageExpiresAt: payment.package_expires_at,
            paymentId: payment.id,
          });

          // Update property and get the result
          const { data: updateResult, error: updateError } = await supabaseAdmin
            .from('properties')
            .update({
              package: payment.package_type,
              package_expires_at: payment.package_expires_at,
              payment_status: 'đang hiển thị',
              updated_at: new Date().toISOString(),
            })
            .eq('id', payment.property_id)
            .select('id, package, package_expires_at, payment_status');

          if (updateError) {
            console.error('[VNPay IPN] ❌ Error updating property:', updateError);
            throw new Error(`Failed to update property: ${updateError.message}`);
          }

          if (updateResult && updateResult.length > 0) {
            const updated = updateResult[0];
            console.log(`[VNPay IPN] ✅ Property ${payment.property_id} successfully updated:`, {
              package: updated.package,
              package_expires_at: updated.package_expires_at,
              payment_status: updated.payment_status,
            });
          } else {
            console.warn(`[VNPay IPN] ⚠️ Update returned no results for property ${payment.property_id}`);
          }

          console.log(`[VNPay IPN] Payment ${orderId} confirmed and property updated`);
        } catch (updateErr) {
          console.error('[VNPay IPN] ❌ Error in property update:', updateErr.message);
          // Continue - IPN will be retried by VNPay
        }
      }
    } else {
      await Payment.updateStatus(payment.id, 'failed');
    }

    res.json({
      RspCode: '00',
      Message: 'Success',
    });
  } catch (error) {
    console.error('Error processing VNPay IPN:', error);
    res.json({
      RspCode: '99',
      Message: 'Server error',
    });
  }
};

// ══════════════════════════════════════════════════════════════════════════════
// ── GENERAL PAYMENT ENDPOINTS ──────────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════════

/**
 * GET /api/payments/my
 * Get current user's payments
 */
exports.getMyPayments = async (req, res) => {
  try {
    const payments = await Payment.getByUser(req.user.id);
    res.json({
      success: true,
      data: payments,
    });
  } catch (error) {
    console.error('Error fetching user payments:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Lỗi khi lấy thông tin thanh toán',
    });
  }
};

/**
 * GET /api/payments/:id
 * Get payment details
 */
exports.getPayment = async (req, res) => {
  try {
    const { id } = req.params;
    const payment = await Payment.getById(id);

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy thông tin giao dịch',
      });
    }

    // Check access permission
    if (payment.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền xem thông tin giao dịch này',
      });
    }

    res.json({
      success: true,
      data: payment,
    });
  } catch (error) {
    console.error('Error fetching payment:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Lỗi khi lấy thông tin giao dịch',
    });
  }
};

/**
 * GET /api/payments (Admin)
 * Get all payments with filters
 */
exports.getPayments = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền truy cập',
      });
    }

    const { status, method, package_type, page = 1, limit = 50 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const { data, total } = await Payment.getAll(
      {
        status: status || undefined,
        method: method || undefined,
        package_type: package_type || undefined,
      },
      parseInt(limit),
      offset
    );

    res.json({
      success: true,
      data,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error('Error fetching payments:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Lỗi khi lấy danh sách giao dịch',
    });
  }
};

module.exports = exports;
