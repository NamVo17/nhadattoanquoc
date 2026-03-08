'use strict';

const { sendEmail } = require('../utils/email.utils');
const logger = require('../utils/logger');

/**
 * High-level email service wrapping email utils with business logic
 */
const EmailService = {
    /**
     * Notify admin on new user registration
     */
    notifyAdminNewUser: async (user) => {
        try {
            await sendEmail({
                to: process.env.ADMIN_EMAIL || 'admin@nhadattoanquoc.vn',
                subject: `Tài khoản mới: ${user.full_name}`,
                html: `<p>Người dùng mới đăng ký: <strong>${user.email}</strong> (vai trò: ${user.role})</p>`,
            });
        } catch (err) {
            logger.warn(`notifyAdminNewUser failed: ${err.message}`);
        }
    },

    /**
     * Send account suspension notice
     */
    sendAccountSuspended: async (email, name) => {
        await sendEmail({
            to: email,
            subject: 'Tài khoản của bạn đã bị khóa',
            html: `<p>Xin chào ${name},<br/>Tài khoản của bạn đã tạm bị khóa. Vui lòng liên hệ support@nhadattoanquoc.vn để biết thêm chi tiết.</p>`,
        });
    },
};

module.exports = EmailService;
