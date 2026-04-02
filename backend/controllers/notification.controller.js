'use strict';

const NotificationModel = require('../models/notification.model');
const logger = require('../utils/logger');

// ─── Get notifications for current user ───────────────────────────────────────
const getNotifications = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const limit = Math.min(parseInt(req.query.limit) || 20, 50);
        const offset = parseInt(req.query.offset) || 0;

        const { data, total } = await NotificationModel.findByUser(userId, limit, offset);

        res.json({ success: true, data: { notifications: data, total } });
    } catch (err) { next(err); }
};

// ─── Get unread count ──────────────────────────────────────────────────────────
const getUnreadCount = async (req, res, next) => {
    try {
        const count = await NotificationModel.getUnreadCount(req.user.id);
        res.json({ success: true, data: { count } });
    } catch (err) { next(err); }
};

// ─── Mark one notification as read ────────────────────────────────────────────
const markRead = async (req, res, next) => {
    try {
        const { id } = req.params;
        await NotificationModel.markRead(id, req.user.id);
        res.json({ success: true, message: 'Đã đánh dấu đã đọc.' });
    } catch (err) { next(err); }
};

// ─── Mark all notifications as read ───────────────────────────────────────────
const markAllRead = async (req, res, next) => {
    try {
        await NotificationModel.markAllRead(req.user.id);
        res.json({ success: true, message: 'Đã đánh dấu tất cả là đã đọc.' });
    } catch (err) { next(err); }
};

module.exports = { getNotifications, getUnreadCount, markRead, markAllRead };
