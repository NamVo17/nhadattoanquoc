const crypto = require('crypto');

/**
 * VNPay Payment Service
 * Handles VNPay payment gateway integration
 */

const CONFIG = {
  SANDBOX_URL: 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html',
  PRODUCTION_URL: 'https://pay.vnpay.vn/vpcpay.html',
};

class VNPayService {
  constructor(config = {}) {
    this.tmnCode = config.tmnCode || process.env.VNPAY_TMN_CODE;
    this.hashSecret = config.hashSecret || process.env.VNPAY_HASH_SECRET;
    this.returnUrl = config.returnUrl || process.env.VNPAY_RETURN_URL;
    this.isSandbox = config.isSandbox !== false; // Default true for sandbox
    this.baseUrl = this.isSandbox ? CONFIG.SANDBOX_URL : CONFIG.PRODUCTION_URL;
  }

  /**
   * Sanitize IP address to ensure it's valid IPv4
   */
  sanitizeIpAddress(ipAddress) {
    if (!ipAddress) return '127.0.0.1';

    // Remove port if present
    let ip = ipAddress.split(':')[0];

    // Handle IPv6 loopback (::1) or IPv6-mapped IPv4 (::ffff:127.0.0.1)
    if (
      ip === '::1' ||
      ip === '::ffff:127.0.0.1' ||
      ip === '::ffff:localhost'
    ) {
      return '127.0.0.1';
    }

    // Validate IPv4 format (basic check)
    const ipv4Pattern = /^(\d{1,3}\.){3}\d{1,3}$/;
    if (ipv4Pattern.test(ip)) {
      return ip;
    }

    // If invalid format, return default loopback
    return '127.0.0.1';
  }

  /**
   * Build query string theo chuẩn VNPAY
   * - Sort keys theo alphabet
   * - Encode giá trị (space → +)
   * - Bỏ qua các giá trị rỗng / null / undefined
   */
  buildQueryString(params) {
    return Object.keys(params)
      .sort()
      .filter(
        (key) =>
          params[key] !== '' &&
          params[key] !== null &&
          params[key] !== undefined
      )
      .map(
        (key) =>
          `${key}=${encodeURIComponent(params[key]).replace(/%20/g, '+')}`
      )
      .join('&');
  }

  /**
   * Generate VNPay signature using HMAC SHA512
   */
  generateSignature(paymentData) {
    const signData = this.buildQueryString(paymentData);
    return crypto
      .createHmac('sha512', this.hashSecret)
      .update(Buffer.from(signData, 'utf-8'))
      .digest('hex');
  }

  /**
   * Create VNPay payment request URL
   */
  createPaymentUrl(orderId, amount, orderInfo, requestId, ipAddress) {
    if (!this.tmnCode || !this.hashSecret) {
      throw new Error('VNPay configuration is incomplete');
    }

    if (!this.returnUrl) {
      throw new Error('VNPay return URL is not configured');
    }

    if (!amount || amount <= 0) {
      throw new Error('Amount must be greater than 0');
    }

    if (!orderId) {
      throw new Error('Order ID is required');
    }

    const sanitizedIp = this.sanitizeIpAddress(ipAddress);

    const paymentData = {
      vnp_Version: '2.1.0',
      vnp_Command: 'pay',
      vnp_TmnCode: this.tmnCode,
      vnp_Amount: Math.round(amount * 100), // VNPay requires amount * 100 (integer)
      vnp_CurrCode: 'VND',
      vnp_TxnRef: orderId,
      vnp_OrderInfo: orderInfo || 'Payment',
      vnp_OrderType: 'other',
      vnp_Locale: 'vn',
      vnp_ReturnUrl: this.returnUrl,
      vnp_IpAddr: sanitizedIp,
      vnp_CreateDate: this.formatDate(new Date()),
    };

    // Generate signature (không bao gồm vnp_SecureHash)
    const signature = this.generateSignature(paymentData);

    // Thêm signature vào params SAU khi đã hash
    paymentData.vnp_SecureHash = signature;

    // Build URL với cùng encoding
    const queryString = this.buildQueryString(paymentData);
    return `${this.baseUrl}?${queryString}`;
  }

  /**
   * Verify VNPay IPN / Return URL signature
   */
  verifyIPNSignature(vnpParams) {
    try {
      const secureHash = vnpParams.vnp_SecureHash;

      // Loại bỏ các trường chữ ký trước khi tính lại
      const paymentData = { ...vnpParams };
      delete paymentData.vnp_SecureHash;
      delete paymentData.vnp_SecureHashType;

      const computedSignature = this.generateSignature(paymentData);

      return computedSignature === secureHash;
    } catch (error) {
      console.error('Signature verification failed:', error);
      return false;
    }
  }

  /**
   * Format date for VNPay: YYYYMMDDHHmmss
   */
  formatDate(date) {
    const year = date.getFullYear().toString();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    return year + month + day + hours + minutes + seconds;
  }

  /**
   * Parse return / IPN query params thành object
   */
  parseReturnData(query) {
    const paymentData = {};
    for (const [key, value] of Object.entries(query)) {
      paymentData[key] = value;
    }
    return paymentData;
  }
}

module.exports = VNPayService;