#!/usr/bin/env node
'use strict';

const { supabaseAdmin } = require('../config/db.config');

/**
 * Promote a user to admin role
 * Usage: node scripts/promote-admin.js <user_id>
 */

const userId = process.argv[2];

if (!userId) {
    console.error('❌ Error: Missing user ID');
    console.log('Usage: node scripts/promote-admin.js <user_id>');
    process.exit(1);
}

(async () => {
    try {
        // Get user
        const { data: user, error: getError } = await supabaseAdmin
            .from('users')
            .select('id, full_name, email, role')
            .eq('id', userId)
            .single();

        if (getError || !user) {
            console.error('❌ User not found:', userId);
            process.exit(1);
        }

        console.log(`📝 Current user: ${user.full_name} (${user.email})`);
        console.log(`📝 Current role: ${user.role}`);

        // Promote to admin
        const { data: updated, error: updateError } = await supabaseAdmin
            .from('users')
            .update({ role: 'admin', updated_at: new Date().toISOString() })
            .eq('id', userId)
            .select()
            .single();

        if (updateError) {
            console.error('❌ Error updating role:', updateError);
            process.exit(1);
        }

        console.log(`✅ Successfully promoted to admin!`);
        console.log(`📝 New role: ${updated.role}`);
        process.exit(0);
    } catch (error) {
        console.error('❌ Fatal error:', error.message);
        process.exit(1);
    }
})();
