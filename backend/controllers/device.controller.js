'use strict';

const { ApiError } = require('../middleware/error.middleware');
const deviceService = require('../services/device.service');
const logger = require('../utils/logger');

/**
 * Get all trusted devices for current user
 */
const getTrustedDevices = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const devices = await deviceService.getTrustedDevices(userId);
        
        res.json({
            success: true,
            message: 'Danh sách thiết bị tin cậy.',
            data: { devices },
        });
    } catch (err) {
        next(err);
    }
};

/**
 * Revoke trust for a specific device
 */
const revokeDeviceTrust = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { deviceId } = req.body;

        if (!deviceId) {
            throw new ApiError('Vui lòng cung cấp ID thiết bị.', 400);
        }

        const success = await deviceService.revokeDeviceTrust(userId, deviceId);
        if (!success) {
            throw new ApiError('Không thể thu hồi quyền tin cậy của thiết bị này.', 400);
        }

        logger.info(`Device trust revoked for user: ${userId}, device: ${deviceId}`);

        res.json({
            success: true,
            message: 'Thiết bị đã được gỡ khỏi danh sách tin cậy.',
        });
    } catch (err) {
        next(err);
    }
};

/**
 * Revoke trust for all devices except current
 */
const revokeAllDevices = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const userAgent = req.headers['user-agent'] || '';
        const ipAddress = req.ip || req.connection.remoteAddress || '';
        const currentDeviceFingerprint = deviceService.generateDeviceFingerprint(userAgent, ipAddress);

        // Get all trusted devices
        const devices = await deviceService.getTrustedDevices(userId);

        // Revoke all except current
        let revokedCount = 0;
        for (const device of devices) {
            if (device.id) {
                const success = await deviceService.revokeDeviceTrust(userId, device.id);
                if (success) revokedCount++;
            }
        }

        logger.info(`All devices revoked for user: ${userId}, except current device`);

        res.json({
            success: true,
            message: `${revokedCount} thiết bị đã được gỡ khỏi danh sách tin cậy.`,
        });
    } catch (err) {
        next(err);
    }
};

module.exports = {
    getTrustedDevices,
    revokeDeviceTrust,
    revokeAllDevices,
};
