import { TOTPSetupData, TwoFAStatus, VerifyTOTPPayload } from './twofa.types';
import { authorizedFetch } from '@/lib/authorizedFetch';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

export const twoFAService = {
  /**
   * Setup TOTP 2FA - Get QR code and backup codes
   */
  setupTOTP: async (): Promise<TOTPSetupData> => {
    const res = await authorizedFetch(`/auth/2fa/setup`, {
      method: 'POST',
    });
    
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || 'Failed to setup 2FA');
    }
    
    const data = await res.json();
    return data.data;
  },

  /**
   * Confirm TOTP setup with verification code
   */
  confirmTOTP: async (totpCode: string): Promise<void> => {
    const res = await authorizedFetch(`/auth/2fa/confirm`, {
      method: 'POST',
      body: JSON.stringify({ totpCode }),
    });
    
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || 'Failed to confirm 2FA');
    }
  },

  /**
   * Get current 2FA status
   */
  get2FAStatus: async (): Promise<TwoFAStatus> => {
    const res = await authorizedFetch(`/auth/2fa/status`, {
      method: 'GET',
    });
    
    if (!res.ok) {
      throw new Error('Failed to get 2FA status');
    }
    
    const data = await res.json();
    return data.data;
  },

  /**
   * Disable 2FA
   */
  disable2FA: async (password: string): Promise<void> => {
    const res = await authorizedFetch(`/auth/2fa/disable`, {
      method: 'POST',
      body: JSON.stringify({ password }),
    });
    
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || 'Failed to disable 2FA');
    }
  },

  /**
   * Regenerate backup codes
   */
  regenerateBackupCodes: async (password: string): Promise<string[]> => {
    const res = await authorizedFetch(`/auth/2fa/backup-codes/regenerate`, {
      method: 'POST',
      body: JSON.stringify({ password }),
    });
    
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || 'Failed to regenerate backup codes');
    }
    
    const data = await res.json();
    return data.data.backupCodes;
  },

  /**
   * Login with 2FA code or backup code
   * Now supports trustDevice option to remember device
   */
  loginWith2FA: async (
    email: string,
    password: string,
    totpCodeOrOptions?: string | { totpCode?: string; backupCode?: string; trustDevice?: boolean },
    backupCode?: string,
    trustDeviceFlag?: boolean
  ) => {
    // Handle both old and new calling conventions
    let totpCode: string | undefined;
    let trustDevice: boolean | undefined;
    
    // If 3rd param is a string, treat as old-style positional args
    if (typeof totpCodeOrOptions === 'string') {
      totpCode = totpCodeOrOptions;
      // backupCode is 4th param (already extracted)
      // trustDevice is 5th param
      trustDevice = trustDeviceFlag;
    } else if (typeof totpCodeOrOptions === 'object') {
      // New-style object options
      totpCode = totpCodeOrOptions.totpCode;
      backupCode = totpCodeOrOptions.backupCode;
      trustDevice = totpCodeOrOptions.trustDevice;
    }

    const res = await fetch(`${BASE_URL}/auth/login-2fa`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password,
        ...(totpCode && { totpCode }),
        ...(backupCode && { backupCode }),
        ...(trustDevice !== undefined && { trustDevice }),
      }),
      credentials: 'include',
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || 'Login failed');
    }

    return res.json();
  },

  /**
   * Get all trusted devices
   */
  getTrustedDevices: async () => {
    const res = await authorizedFetch(`/auth/devices/trusted`, {
      method: 'GET',
    });
    
    if (!res.ok) {
      throw new Error('Failed to fetch trusted devices');
    }
    
    const data = await res.json();
    return data.data.devices;
  },

  /**
   * Revoke trust for specific device
   */
  revokeDeviceTrust: async (deviceId: number): Promise<void> => {
    const res = await authorizedFetch(`/auth/devices/${deviceId}/revoke`, {
      method: 'POST',
      body: JSON.stringify({ deviceId }),
    });
    
    if (!res.ok) {
      throw new Error('Failed to revoke device trust');
    }
  },

  /**
   * Revoke all device trusts except current
   */
  revokeAllDevices: async (): Promise<void> => {
    const res = await authorizedFetch(`/auth/devices/revoke-all`, {
      method: 'POST',
    });
    
    if (!res.ok) {
      throw new Error('Failed to revoke all devices');
    }
  },
};
