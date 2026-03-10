#!/usr/bin/env node
'use strict';

const { supabaseAdmin } = require('../config/db.config');

/**
 * List all users with their IDs and roles
 * Usage: node scripts/list-users.js
 */

(async () => {
    try {
        const { data: users, error } = await supabaseAdmin
            .from('users')
            .select('id, full_name, email, role, is_email_verified, is_active, created_at')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('❌ Error fetching users:', error);
            process.exit(1);
        }

        if (!users || users.length === 0) {
            console.log('📋 No users found in the database');
            process.exit(0);
        }

        console.log('\n📋 All Users:');
        console.log('─'.repeat(120));
        console.log('ID                                   | Name                  | Email                          | Role      | Verified | Active');
        console.log('─'.repeat(120));
        
        users.forEach(user => {
            const id = user.id.substring(0, 8) + '...';
            const name = user.full_name.padEnd(20).substring(0, 20);
            const email = user.email.padEnd(28).substring(0, 28);
            const role = user.role.padEnd(8);
            const verified = user.is_email_verified ? '✅' : '❌';
            const active = user.is_active ? '✅' : '❌';
            console.log(`${(user.id.substring(0, 8) + '...').padEnd(36)} | ${name} | ${email} | ${role} | ${verified}      | ${active}`);
        });
        
        console.log('─'.repeat(120));
        console.log(`\n✅ Total: ${users.length} user(s)\n`);
        console.log('💡 To promote a user to admin, run:');
        console.log('   node scripts/promote-admin.js <user_id>\n');

        process.exit(0);
    } catch (error) {
        console.error('❌ Fatal error:', error.message);
        process.exit(1);
    }
})();
