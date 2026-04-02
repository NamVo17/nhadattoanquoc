#!/usr/bin/env node
/**
 * VNPAY Signature Debug Tool
 * Run this to verify VNPAY signature generation
 */

require('dotenv').config();
const crypto = require('crypto');

const TMN_CODE = process.env.VNPAY_TMN_CODE;
const HASH_SECRET = process.env.VNPAY_HASH_SECRET;

console.log('═══════════════════════════════════════════════════════════');
console.log('VNPAY SIGNATURE DEBUG TOOL');
console.log('═══════════════════════════════════════════════════════════');
console.log('');

// Check credentials
if (!TMN_CODE) {
  console.error('❌ ERROR: VNPAY_TMN_CODE not found in .env');
  process.exit(1);
}
if (!HASH_SECRET) {
  console.error('❌ ERROR: VNPAY_HASH_SECRET not found in .env');
  process.exit(1);
}

console.log('✓ TMN_CODE:', TMN_CODE);
console.log('✓ HASH_SECRET:', HASH_SECRET);
console.log('');

// Test data
const testOrderId = `ORD${Date.now()}ABC123`;
const testAmount = 50000; // 50,000 VND
const testOrderInfo = 'Test payment';
const testReturnUrl = 'http://localhost:5000/api/payments/vnpay/return';

console.log('TEST PAYMENT DATA:');
console.log('─────────────────────────────────────────────────────────');
console.log('Order ID:', testOrderId);
console.log('Amount:', testAmount, 'VND (x100 = ' + (testAmount * 100) + ')');
console.log('Order Info:', testOrderInfo);
console.log('Return URL:', testReturnUrl);
console.log('');

// Build payment data (matching the service)
const paymentData = {
  vnp_Version: '2.1.0',
  vnp_Command: 'pay',
  vnp_TmnCode: TMN_CODE,
  vnp_Amount: Math.round(testAmount * 100),
  vnp_CurrCode: 'VND',
  vnp_TxnRef: testOrderId,
  vnp_OrderInfo: testOrderInfo,
  vnp_OrderType: 'other',
  vnp_Locale: 'vn',
  vnp_ReturnUrl: testReturnUrl,
  vnp_IpAddr: '127.0.0.1',
  vnp_CreateDate: formatDate(new Date()),
};

console.log('PAYMENT DATA (before signature):');
console.log('─────────────────────────────────────────────────────────');
Object.entries(paymentData).forEach(([key, value]) => {
  console.log(`  ${key}: ${value}`);
});
console.log('');

// Generate signature
const signature = generateSignature(paymentData);

console.log('SIGNATURE GENERATION:');
console.log('─────────────────────────────────────────────────────────');
console.log('Signature:', signature);
console.log('');

// Build full URL
const qs = require('qs');
paymentData.vnp_SecureHash = signature;
const params = qs.stringify(paymentData, { encode: false });
const paymentUrl = `https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?${params}`;

console.log('PAYMENT URL:');
console.log('─────────────────────────────────────────────────────────');
console.log(paymentUrl);
console.log('');

// Additional verification
console.log('VERIFICATION DETAILS:');
console.log('─────────────────────────────────────────────────────────');
const signStr = buildSignatureString(paymentData);
console.log('Signature String:', signStr);
console.log('');

// Verify the signature (rebuild without signature this time)
const dataForVerification = { ...paymentData };
delete dataForVerification.vnp_SecureHash;
const recomputed = generateSignature(dataForVerification);
console.log('Original Signature:   ', signature);
console.log('Recomputed Signature: ', recomputed);
console.log('Signatures Match:', signature === recomputed);
console.log('');

console.log('───────────────────────────────────────────────────────────');
console.log('If signature doesn\'t work:');
console.log('1. Verify VNPAY_TMN_CODE and VNPAY_HASH_SECRET in .env');
console.log('2. Check VNPAY merchant dashboard for test credentials');
console.log('3. Ensure credentials are activated in sandbox');
console.log('4. Try accessing: https://sandbox.vnpayment.vn/');
console.log('───────────────────────────────────────────────────────────');

// Helper functions
function formatDate(date) {
  const year = date.getFullYear().toString();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return year + month + day + hours + minutes + seconds;
}

function buildSignatureString(data) {
  const keys = Object.keys(data).sort();
  let signData = '';
  keys.forEach((key) => {
    const value = data[key];
    if (value) {
      signData += `&${key}=${value}`;
    }
  });
  return signData.slice(1);
}

function generateSignature(data) {
  const signStr = buildSignatureString(data);
  return crypto.createHmac('sha512', HASH_SECRET).update(signStr).digest('hex');
}
