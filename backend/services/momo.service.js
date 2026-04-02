const crypto = require('crypto');

/**
 * MoMo Payment Service
 * Handles MoMo payment gateway integration
 */

const CONFIG = {
  SANDBOX_URL: 'https://test-payment.momo.vn/v2/gateway/api/create',
  PRODUCTION_URL: 'https://payment.momo.vn/v2/gateway/api/create',
};

class MoMoService {
  constructor(config = {}) {
    this.partnerCode = config.partnerCode || process.env.MOMO_PARTNER_CODE;
    this.accessKey = config.accessKey || process.env.MOMO_ACCESS_KEY;
    this.secretKey = config.secretKey || process.env.MOMO_SECRET_KEY;
    this.redirectUrl = config.redirectUrl || process.env.MOMO_REDIRECT_URL;
    this.ipnUrl = config.ipnUrl || process.env.MOMO_IPN_URL;
    this.isSandbox = config.isSandbox !== false; // Default true for sandbox
    this.baseUrl = this.isSandbox ? CONFIG.SANDBOX_URL : CONFIG.PRODUCTION_URL;
  }

  /**
   * Create MoMo payment request
   */
  async createPaymentRequest(orderId, amount, orderInfo, requestId) {
    try {
      if (!this.partnerCode || !this.accessKey || !this.secretKey) {
        throw new Error('MoMo configuration is incomplete');
      }

      const paymentData = {
        partnerCode: this.partnerCode,
        partnerName: 'BatDongSan',
        storeId: 'MoMoStore',
        requestId: requestId,
        orderId: orderId,
        orderGroupId: '',
        amount: amount,
        orderExpiry: 15, // 15 minutes
        orderInfo: orderInfo,
        returnUrl: this.redirectUrl,
        notifyUrl: this.ipnUrl,
        extraData: '',
        requestType: 'captureWallet',
        autoCapture: true,
        lang: 'vi',
      };

      // Generate signature
      const signature = this.generateSignature(paymentData);
      paymentData.signature = signature;

      return paymentData;
    } catch (error) {
      throw new Error(`Failed to create MoMo payment request: ${error.message}`);
    }
  }

  /**
   * Generate MoMo signature using HMAC SHA256
   */
  generateSignature(paymentData) {
    const rawSignature = `accessKey=${this.accessKey}&amount=${paymentData.amount}&extraData=${paymentData.extraData}&ipnUrl=${this.ipnUrl}&orderId=${paymentData.orderId}&orderInfo=${paymentData.orderInfo}&partnerCode=${paymentData.partnerCode}&redirectUrl=${this.redirectUrl}&requestId=${paymentData.requestId}&requestType=${paymentData.requestType}`;

    return crypto
      .createHmac('sha256', this.secretKey)
      .update(rawSignature)
      .digest('hex');
  }

  /**
   * Verify MoMo IPN signature
   */
  verifyIPNSignature(ipnData, signature) {
    const rawSignature = `accessKey=${this.accessKey}&amount=${ipnData.amount}&extraData=${ipnData.extraData}&message=${ipnData.message}&orderId=${ipnData.orderId}&orderInfo=${ipnData.orderInfo}&orderType=${ipnData.orderType}&partnerCode=${ipnData.partnerCode}&payType=${ipnData.payType}&requestId=${ipnData.requestId}&responseTime=${ipnData.responseTime}&resultCode=${ipnData.resultCode}&transId=${ipnData.transId}`;

    const computedSignature = crypto
      .createHmac('sha256', this.secretKey)
      .update(rawSignature)
      .digest('hex');

    return computedSignature === signature;
  }

  /**
   * Generate unique request ID (timestamp + random)
   */
  generateRequestId() {
    return `${Date.now()}${crypto.randomBytes(4).toString('hex')}`;
  }

  /**
   * Get payment URL for redirect
   */
  getPaymentUrl(paymentData) {
    const params = new URLSearchParams(paymentData);
    return `${this.baseUrl}?${params.toString()}`;
  }
}

module.exports = MoMoService;
