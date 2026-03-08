'use strict';

const { createClient } = require('@supabase/supabase-js');
const { env } = require('./env.config');

// Public client – uses anon key, respects Row Level Security (RLS)
const supabase = createClient(env.supabase.url, env.supabase.anonKey, {
    auth: { persistSession: false },
});

// Admin client – uses service role key, BYPASSES RLS
// Use ONLY for server-side privileged operations (e.g. creating users)
const supabaseAdmin = createClient(env.supabase.url, env.supabase.serviceRoleKey, {
    auth: {
        persistSession: false,
        autoRefreshToken: false,
    },
});

module.exports = { supabase, supabaseAdmin };
