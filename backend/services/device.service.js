'use strict';

const crypto = require('crypto');
const { supabaseAdmin } = require('../config/db.config');

/**
 * Generate a device fingerprint from User-Agent and IP
 */
const generateDeviceFingerprint = (userAgent, ipAddress) => {
    const combinedString = `${userAgent}|${ipAddress}`;
    return crypto
        .createHash('sha256')
        .update(combinedString)
        .digest('hex');
};

/**
 * Extract browser/OS info from User-Agent for display
 */
const extractDeviceName = (userAgent) => {
    if (!userAgent) return 'Unknown Device';

    // Simple regex patterns for common browsers/OS
    const patterns = {
        'Chrome': /Chrome\/(\d+)/,
        'Firefox': /Firefox\/(\d+)/,
        'Safari': /Safari\/(\d+)/,
        'Edge': /Edg\/(\d+)/,
        'Opera': /Opera\/(\d+)/,
    };

    const osPatterns = {
        'Windows': /Windows NT/,
        'Mac': /Macintosh/,
        'Linux': /Linux/,
        'iOS': /iPhone|iPad/,
        'Android': /Android/,
    };

    let browser = 'Unknown';
    let os = 'Unknown';

    for (const [name, regex] of Object.entries(patterns)) {
        if (regex.test(userAgent)) {
            browser = name;
            break;
        }
    }

    for (const [name, regex] of Object.entries(osPatterns)) {
        if (regex.test(userAgent)) {
            os = name;
            break;
        }
    }

    return `${browser} on ${os}`;
};

/**
 * Track or update device on login
 * Note: Fails silently if user_devices table doesn't exist (before migration)
 */
const trackDeviceLogin = async (userId, userAgent, ipAddress) => {
    try {
        const deviceFingerprint = generateDeviceFingerprint(userAgent, ipAddress);
        const deviceName = extractDeviceName(userAgent);

        // Upsert device - update if exists, create if not
        const { data: device, error } = await supabaseAdmin
            .from('user_devices')
            .upsert(
                {
                    user_id: userId,
                    device_fingerprint: deviceFingerprint,
                    device_name: deviceName,
                    ip_address: ipAddress,
                    user_agent: userAgent,
                    last_login_at: new Date().toISOString(),
                },
                { onConflict: ['user_id', 'device_fingerprint'] }
            )
            .select()
            .single();

        if (error) {
            // Table doesn't exist or other error - log but don't throw
            console.warn('Device tracking unavailable (migration may not be run):', error.code);
            return { success: false, device: null };
        }

        return {
            success: true,
            device: {
                id: device.id,
                fingerprint: device.device_fingerprint,
                name: device.device_name,
                isTrusted: device.is_trusted,
                lastLoginAt: device.last_login_at,
                createdAt: device.created_at,
            },
        };
    } catch (err) {
        // Network error or other issue - log but don't throw (don't break login)
        console.warn('Device tracking failed, continuing with login:', err.message);
        return { success: false, device: null };
    }
};

/**
 * Check if device is trusted (and not expired)
 */
const isDeviceTrusted = async (userId, deviceFingerprint) => {
    try {
        const { data: device, error } = await supabaseAdmin
            .from('user_devices')
            .select('is_trusted, trust_expires_at')
            .eq('user_id', userId)
            .eq('device_fingerprint', deviceFingerprint)
            .single();

        if (error || !device) {
            return false;
        }

        // Check if trusted and not expired
        if (device.is_trusted) {
            if (device.trust_expires_at && new Date(device.trust_expires_at) < new Date()) {
                // Trust expired, auto-revoke
                await supabaseAdmin
                    .from('user_devices')
                    .update({ is_trusted: false })
                    .eq('user_id', userId)
                    .eq('device_fingerprint', deviceFingerprint);
                return false;
            }
            return true;
        }

        return false;
    } catch (err) {
        console.error('Check device trust error:', err);
        return false;
    }
};

/**
 * Mark device as trusted for 30 days
 */
const trustDevice = async (userId, deviceFingerprint) => {
    try {
        const trustExpiresAt = new Date();
        trustExpiresAt.setDate(trustExpiresAt.getDate() + 30); // 30 days

        const { error } = await supabaseAdmin
            .from('user_devices')
            .update({
                is_trusted: true,
                trusted_at: new Date().toISOString(),
                trust_expires_at: trustExpiresAt.toISOString(),
            })
            .eq('user_id', userId)
            .eq('device_fingerprint', deviceFingerprint);

        if (error) {
            console.error('Trust device error:', error);
            return false;
        }

        return true;
    } catch (err) {
        console.error('Trust device error:', err);
        return false;
    }
};

/**
 * Get all trusted devices for a user
 */
const getTrustedDevices = async (userId) => {
    try {
        const { data: devices, error } = await supabaseAdmin
            .from('user_devices')
            .select('*')
            .eq('user_id', userId)
            .eq('is_trusted', true)
            .gte('trust_expires_at', new Date().toISOString())
            .order('last_login_at', { ascending: false });

        if (error) {
            console.error('Get trusted devices error:', error);
            return [];
        }

        return devices.map((d) => ({
            id: d.id,
            name: d.device_name,
            ipAddress: d.ip_address,
            lastLoginAt: d.last_login_at,
            trustedAt: d.trusted_at,
            expiresAt: d.trust_expires_at,
        }));
    } catch (err) {
        console.error('Get trusted devices error:', err);
        return [];
    }
};

/**
 * Revoke device trust
 */
const revokeDeviceTrust = async (userId, deviceId) => {
    try {
        const { error } = await supabaseAdmin
            .from('user_devices')
            .update({
                is_trusted: false,
                trust_expires_at: null,
            })
            .eq('id', deviceId)
            .eq('user_id', userId);

        if (error) {
            console.error('Revoke device error:', error);
            return false;
        }

        return true;
    } catch (err) {
        console.error('Revoke device error:', err);
        return false;
    }
};

module.exports = {
    generateDeviceFingerprint,
    extractDeviceName,
    trackDeviceLogin,
    isDeviceTrusted,
    trustDevice,
    getTrustedDevices,
    revokeDeviceTrust,
};
