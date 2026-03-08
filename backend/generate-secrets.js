#!/usr/bin/env node

/**
 * JWT Secret Generator for NhaDatToanQuoc Backend
 * Use this to generate secure JWT secrets
 * 
 * Usage:
 *   node generate-secrets.js
 * 
 * Then copy the output to your .env file
 */

const crypto = require('crypto');

// Generate 64-character hex secret
function generateSecret(length = 64) {
  return crypto.randomBytes(length).toString('hex');
}

console.log('\n🔒 JWT Secret Generator\n');
console.log('Copy these values to your .env file:\n');
console.log('━'.repeat(80));

const accessSecret = generateSecret(64);
const refreshSecret = generateSecret(64);

console.log(`\nJWT_ACCESS_SECRET=${accessSecret}`);
console.log(`JWT_REFRESH_SECRET=${refreshSecret}\n`);

console.log('━'.repeat(80));
console.log('\n✓ Secrets generated successfully!');
console.log('\nUpdate your backend/.env with these values.\n');
