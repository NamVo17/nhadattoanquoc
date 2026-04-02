'use strict';

const { supabaseAdmin } = require('../config/db.config');

/**
 * SQL to run in Supabase SQL Editor (run once):
 *
 * CREATE TABLE IF NOT EXISTS public.notifications (
 *   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 *   user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
 *   type TEXT NOT NULL,
 *   title TEXT NOT NULL,
 *   body TEXT NOT NULL,
 *   is_read BOOLEAN DEFAULT false,
 *   metadata JSONB,
 *   created_at TIMESTAMPTZ DEFAULT now()
 * );
 * CREATE INDEX IF NOT EXISTS notifications_user_id_idx ON notifications(user_id);
 * CREATE INDEX IF NOT EXISTS notifications_created_at_idx ON notifications(created_at DESC);
 */

const NotificationModel = {
    /**
     * Create a notification for a user
     */
    create: async (userId, type, title, body, metadata = null) => {
        const { data, error } = await supabaseAdmin
            .from('notifications')
            .insert({ user_id: userId, type, title, body, metadata })
            .select()
            .single();
        if (error) {
            console.error('Error creating notification:', error.message);
            return null; // Non-fatal — notifications shouldn't block primary actions
        }
        return data;
    },

    /**
     * Get notifications for a user (paginated)
     */
    findByUser: async (userId, limit = 20, offset = 0) => {
        const { data, error, count } = await supabaseAdmin
            .from('notifications')
            .select('*', { count: 'exact' })
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1);

        if (error) {
            console.error('Error fetching notifications:', error.message);
            return { data: [], total: 0 };
        }
        return { data: data || [], total: count ?? 0 };
    },

    /**
     * Count unread notifications for a user
     */
    getUnreadCount: async (userId) => {
        const { count, error } = await supabaseAdmin
            .from('notifications')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId)
            .eq('is_read', false);

        if (error) return 0;
        return count ?? 0;
    },

    /**
     * Mark a single notification as read
     */
    markRead: async (id, userId) => {
        const { error } = await supabaseAdmin
            .from('notifications')
            .update({ is_read: true })
            .eq('id', id)
            .eq('user_id', userId);
        return !error;
    },

    /**
     * Mark all notifications as read for a user
     */
    markAllRead: async (userId) => {
        const { error } = await supabaseAdmin
            .from('notifications')
            .update({ is_read: true })
            .eq('user_id', userId)
            .eq('is_read', false);
        return !error;
    },

    /**
     * Delete old notifications (keep last 100 per user)
     */
    cleanup: async (userId) => {
        const { data: old } = await supabaseAdmin
            .from('notifications')
            .select('id')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .range(100, 9999);

        if (old && old.length > 0) {
            const ids = old.map(n => n.id);
            await supabaseAdmin.from('notifications').delete().in('id', ids);
        }
    },
};

module.exports = NotificationModel;
