#!/usr/bin/env node

/**
 * Maintenance Script: Update Expired Package Status
 * 
 * This script checks for properties with expired packages and updates their
 * payment_status to null (indicating the package has expired).
 * 
 * Can be run manually or scheduled with a cron job
 * Usage: node backend/scripts/update-expired-packages.js
 */

const { supabaseAdmin } = require('../config/db.config');
const { env } = require('../config/env.config');

async function updateExpiredPackages() {
  try {
    console.log('🔄 Starting expired package status update...');

    if (!env.supabase.url || !env.supabase.serviceRoleKey) {
      throw new Error('Missing Supabase credentials');
    }

    // Find all properties with payment_status set and package_expires_at in the past
    const { data: expiredProperties, errorSelect } = await supabaseAdmin
      .from('properties')
      .select('id, title, package, package_expires_at, payment_status')
      .not('payment_status', 'is', null)
      .not('package_expires_at', 'is', null)
      .lt('package_expires_at', new Date().toISOString());

    if (errorSelect) {
      throw new Error(`Failed to fetch expired properties: ${errorSelect.message}`);
    }

    if (!expiredProperties || expiredProperties.length === 0) {
      console.log('✅ No expired packages found');
      return {
        success: true,
        updated: 0,
        message: 'No expired packages found',
      };
    }

    console.log(`Found ${expiredProperties.length} expired packages`);

    // Update each expired property
    const updatePromises = expiredProperties.map((prop) =>
      supabaseAdmin
        .from('properties')
        .update({
          payment_status: null,
          package: 'free',
          updated_at: new Date().toISOString(),
        })
        .eq('id', prop.id)
    );

    const results = await Promise.all(updatePromises);

    const failedCount = results.filter((r) => r.error).length;
    const successCount = results.filter((r) => !r.error).length;

    if (failedCount > 0) {
      console.warn(`⚠️ Updated ${successCount} properties, ${failedCount} failed`);
    } else {
      console.log(`✅ Successfully updated ${successCount} expired properties`);
    }

    // Log details
    expiredProperties.forEach((prop) => {
      const expiryDate = new Date(prop.package_expires_at);
      const daysAgo = Math.floor(
        (new Date().getTime() - expiryDate.getTime()) / (1000 * 60 * 60 * 24)
      );
      console.log(
        `  - [${prop.id}] "${prop.title}" expired ${daysAgo} days ago`
      );
    });

    return {
      success: true,
      updated: successCount,
      failed: failedCount,
      message: `Updated ${successCount} expired properties`,
    };
  } catch (error) {
    console.error('❌ Error updating expired packages:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}

// Run if executed directly
if (require.main === module) {
  env.validate?.();

  updateExpiredPackages()
    .then((result) => {
      console.log('\n📊 Result:', result);
      process.exit(result.success ? 0 : 1);
    })
    .catch((error) => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}

module.exports = { updateExpiredPackages };
