'use strict';

const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');
const { env } = require('../config/env.config');
const logger = require('./logger');

const transporter = nodemailer.createTransport({
    host: env.email.host,
    port: env.email.port,
    secure: env.email.secure,
    auth: { user: env.email.user, pass: env.email.pass },
    tls: { rejectUnauthorized: env.IS_PRODUCTION },
});

/**
 * Load an HTML email template and replace {{placeholders}}
 * @param {string} templateName - file name without extension
 * @param {Record<string, string>} variables
 * @returns {string}
 */
const loadTemplate = (templateName, variables = {}) => {
    const templatePath = path.join(__dirname, '..', 'views', 'emails', `${templateName}.html`);
    let html = fs.readFileSync(templatePath, 'utf-8');
    Object.entries(variables).forEach(([key, value]) => {
        html = html.replaceAll(`{{${key}}}`, value);
    });
    return html;
};

/**
 * Send an email
 * @param {{ to: string, subject: string, html: string }} options
 */
const sendEmail = async ({ to, subject, html }) => {
    try {
        const info = await transporter.sendMail({
            from: env.email.from,
            to,
            subject,
            html,
        });
        logger.info(`Email sent to ${to} | MessageId: ${info.messageId}`);
        return info;
    } catch (err) {
        logger.error(`Failed to send email to ${to}: ${err.message}`);
        throw err;
    }
};

const sendVerificationEmail = (to, name, token) =>
    sendEmail({
        to,
        subject: 'Xác thực tài khoản của bạn – NhaDatToanQuoc',
        html: loadTemplate('verifyEmail', {
            name,
            verifyUrl: `${env.client.url}/verify-email?token=${token}`,
            year: new Date().getFullYear().toString(),
        }),
    });

const sendPasswordResetEmail = (to, name, token) =>
    sendEmail({
        to,
        subject: 'Đặt lại mật khẩu – NhaDatToanQuoc',
        html: loadTemplate('resetPassword', {
            name,
            resetUrl: `${env.client.url}/reset-password?token=${token}`,
            year: new Date().getFullYear().toString(),
        }),
    });

module.exports = { sendEmail, sendVerificationEmail, sendPasswordResetEmail };
