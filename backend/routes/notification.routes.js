'use strict';

const express = require('express');
const { authenticate } = require('../middleware/auth.middleware');
const { getNotifications, getUnreadCount, markRead, markAllRead } = require('../controllers/notification.controller');

const router = express.Router();

// All notification routes require authentication
router.use(authenticate);

router.get('/', getNotifications);
router.get('/unread-count', getUnreadCount);
router.patch('/:id/read', markRead);
router.patch('/read-all', markAllRead);

module.exports = router;
